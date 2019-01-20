/*!
 Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
*/
/*global apex*/
/*
 * This file holds namespaced objects and functions that deal with the Dynamic Action implementation logic, in Oracle Application Express
 */
/**
 * @namespace apex.da
 */
apex.da = {};

( function ( da, $, event, util, message, undefined ) {
    "use strict";

    /*  Stores meta data about all defined dynamic actions of the current page.
        Format: see database package wwv_flow_dynamic_action  */
    da.gEventList = [];

    /* Global flag to track if execution of dynamic actions should be stopped. For example
       if a PL/SQL error has occurred from an Ajax based action and the action is defined to
       "Stop Execution on Error", or if the "Cancel Event" action has fired. */
    da.gCancelActions = false;

    /**
     * init Function
     * Binds the dynamic actions and fires the initial action for page initialization
     * */
    da.init = function() {

        // Loop over all dynamic actions
        $( da.gEventList ).each( function() {

            var lEvent, lSelector, lLiveSelector$,

                /* Make sure that all the required attributes are there, because we don't
                   set them on the database side if they are null */
                lDefaults = {
                    name            : null,
                    bindDelegateTo  : null,
                    isIGRegion      : false
                };

            lEvent = $.extend( lDefaults, this );

            // Construct jQuery selector
            lSelector = da.constructSelector( {
                elementType : lEvent.triggeringElementType,
                element     : lEvent.triggeringElement,
                regionId    : lEvent.triggeringRegionId,
                buttonId    : lEvent.triggeringButtonId
            });

            /*
             * First let's setup handlers for non-page load / initialisation events. We separate DAs that do fire on init
             * because they do not need any handlers, they can just be executed straight away as part of the page's 'ready'
             * handling.
             */
            if ( $.inArray( lEvent.bindEventType, [ "ready", "pageinit" ] ) === -1 ) {

                // Event handling registration is handled differently, depending on 'Event Scope'
                switch ( lEvent.bindType ) {
                    case "bind":

                        /* The most common 'Static' event scope, where we just register handler straight to the
                         triggering element. */
                        $( lSelector, apex.gPageContext$ ).on( lEvent.bindEventType, function( pBrowserEvent, pData ) {
                            da.actions( this, lEvent, pBrowserEvent, pData );
                        });
                        break;
                    case "live":

                        /* For 'Dynamic' event scope, if a 'Static Container' has been defined, this is used as
                         the first selector, in the context of the current page. If no 'Static Container' is
                         defined, just the current page context is used as the first selector. Then, the
                         triggering element is used as the secondary filter (so only those triggering elements
                         will handle the event). */
                        if ( lEvent.bindDelegateTo ) {
                            lLiveSelector$ = $( lEvent.bindDelegateTo, apex.gPageContext$ );
                        } else {
                            lLiveSelector$ = apex.gPageContext$;
                        }
                        lLiveSelector$.on( lEvent.bindEventType, lSelector, function( pBrowserEvent, pData ) {
                            da.actions( this, lEvent, pBrowserEvent, pData );
                        });
                        break;
                    case "one":

                        /* For 'once' event scope, just register event handler straight to the triggering
                         element, using the 'one' method. */
                        $( lSelector, apex.gPageContext$ ).one( lEvent.bindEventType, function( pBrowserEvent, pData ) {
                            da.actions( this, lEvent, pBrowserEvent, pData );
                        });
                        break;
                }


                // If any actions have their 'fire on init' flag set to yes, then we need to handle those accordingly.
                // Note: We are doing this in the block that ignores page load events, to avoid the situation where if
                // someone has defined a DA to fire on 'Page Load', with actions that also 'fire on init', this will
                // only fire once.
                if ( lEvent.anyActionsFireOnInit ) {
                    if ( lEvent.isIGRegion ) {

                        // For IG regions, instead of firing the actions straight away, we must register an event handler
                        // on the 'apexbeginrecordedit' event, so the DA fires when the row is activated for editing.
                        //
                        // Note: Use of the triggeringRegionId for the selector, as we need to register the event on the
                        // region. We can't use lSelector as this may not be the region (for example for a column-based DA)
                        $( "#" + util.escapeCSS( lEvent.triggeringRegionId ), apex.gPageContext$ ).on( "apexbeginrecordedit", function( pBrowserEvent, pData ) {
                            da.actions( lSelector, lEvent, pBrowserEvent, pData );
                        });

                    } else {

                        // If not an IG region, then execute immediately
                        da.actions( lSelector, lEvent, "load" );
                    }
                }
            } else {

                // If this is either "ready" or "pageinit", execute immediately
                da.actions( lSelector, lEvent, "load" );
            }
        }); // end loop to register event handlers
    }; // init

    /**
     * constructSelector function
     * Construct jQuery selector for elements, by type
     * */
    da.constructSelector = function ( pOptions ) {

        function escapeSelector( pItems ) {
            var lItems,
                lItemsEscaped;
            lItems = pItems.split( "," );
            lItemsEscaped = $.map( lItems, function( n ) {
                return util.escapeCSS( n );
            });
            return "#" + lItemsEscaped.join( ",#" );
        }

        var lLen, lDefaults, lOptions,
            lSelector = "";

        // Define default option values
        lDefaults = {
            elementType         : null,
            element             : null,
            regionId            : null,
            buttonId            : null,
            triggeringElement   : null,
            eventTarget         : null
        };

        // Extend default option values with anything passed via pOptions
        lOptions = $.extend( lDefaults, pOptions );

        // Construct selector based on element type ('ITEM', 'REGION', etc)
        switch ( lOptions.elementType ) {
            case "ITEM":            // item and column handling is the same
            case "COLUMN":
                lSelector = escapeSelector( lOptions.element );
                break;
            case "REGION":
                lSelector = "#" + util.escapeCSS( lOptions.regionId );
                break;
            case "BUTTON":
                lSelector = "#" + util.escapeCSS( lOptions.buttonId );
                break;
            case "JAVASCRIPT_EXPRESSION":
                lSelector = lOptions.element();
                break;
            case "DOM_OBJECT":
                // this selector type is deprecated because it uses eval and is overloaded with too many use cases
                apex.debug.deprecated( "DOM Object selector" );

                // first try as a list of ids
                lSelector = "#" + lOptions.element.replace(/,/g,",#");
                try {
                    lLen = $( lSelector, apex.gPageContext$ ).length;
                } catch (ex) {
                    lLen = 0;
                }
                if ( lLen === 0 ) {
                    // if the list of ids selector doesn't find anything or throws an exception assume it is not a list of ids
                    // next try as a JavaScript expression
                    try {
                        lSelector = eval( lOptions.element );
                    } catch ( err ) {
                        // if it is not a valid JavaScript expression assume it is a jQuery Selector
                        lSelector = lOptions.element;
                    }
                }
                break;
            case "JQUERY_SELECTOR":
                lSelector = lOptions.element;
                break;
            case "TRIGGERING_ELEMENT":
                lSelector = lOptions.triggeringElement;
                break;
            case "EVENT_SOURCE":
                lSelector = lOptions.eventTarget;
                break;
            default:

                // Default to the page context. This is used when no 'Selection Type' has been specified for certain events.
                lSelector = apex.gPageContext$;
        }

        // For backward compatibility, return an undefined selector if no selector has actually been provided. # will raise
        // a jQuery syntax error
        if ( lSelector === "#" ) {
            lSelector = undefined;
        }
        return lSelector;
    }; // constructSelector

    /**
     * actions function
     * Fires the stored actions based on the triggering expression result
     * */
    da.actions = function( pSelector, pEvent, pBrowserEvent, pData ) {

        // reset both cancel flags to false
        event.gCancelFlag = false;
        da.gCancelActions = false;

        // Loop over the dynamic action's when elements. When this is called on page load, pSelector will be a jQuery selector,
        // hence why this is using 'each' to iterate. When this is called after an event handler is called, pSelector will
        // actually be a DOM element (which is also fine with 'each' although this will only iterate once).
        $( pSelector, apex.gPageContext$ ).each( function() {
            var lContext, lConditionResult;

            if ( !pEvent.triggeringConditionType ) {

                // The case where no condition is defined
                lConditionResult = true;
            } else {

                // JS Expression handled here, as this isn't a condition type that checks a specific item or column
                if ( pEvent.triggeringConditionType === "JAVASCRIPT_EXPRESSION" ) {

                    // Set context to be used by "JavaScript Expression" condition type
                    lContext = {
                        triggeringElement   : this,
                        browserEvent        : pBrowserEvent,
                        data                : pData
                    };

                    // in this case triggeringExpression is a function that should return true or false
                    lConditionResult = pEvent.triggeringExpression.call( lContext );

                } else {

                    lConditionResult = da.testCondition( pEvent.conditionElement, pEvent.triggeringConditionType, pEvent.triggeringExpression );

                }
            }

            da.doActions(pEvent, 0, pBrowserEvent, pData, lConditionResult, this);

            // Reset cancelActions flag to false, ready for next dynamic action
            da.gCancelActions = false;

        }); // end loop over dynamic action's when elements
    }; // actions

    /**
     * doActions function
     * Iterates over the actions and determines if the action should be executed.
     * */
    da.doActions = function( pEvent, pStartWithAction, pBrowserEvent, pData, pConditionResult, pTriggeringElement ) {
        var lActionCount = pEvent.actionList.length;

        // Loop over actions, lActionIterator initially set by pStartWithAction. This will be either 0 ( when doActions
        // is called initially in iterating over the triggering elements), or will be set to the action resume point (when
        // action execution has waited for the result of an action that issued an Ajax call).
        for (var lActionIterator = pStartWithAction; lActionIterator < lActionCount; lActionIterator++ ) {

            /* Make sure that all the required attributes are there, because we don't
               set them on the database side if they are null. */
            var lDefaults, lAction, lSelector, lWaitCallback;

            /* Check if no further actions should be executed, in the case where the event has been suppressed
               if the event cancelActions flag is true, return out of this each iterator. */
            if ( da.gCancelActions ) {
                return false;
            }
            lDefaults = {
                eventResult             : null,
                executeOnPageInit       : false,
                stopExecutionOnError    : true,
                action                  : null,
                affectedElementsType    : null,
                affectedRegionId        : null,
                affectedElements        : null,
                javascriptFunction      : null,
                ajaxIdentifier          : null,
                attribute01             : null,
                attribute02             : null,
                attribute03             : null,
                attribute04             : null,
                attribute05             : null,
                attribute06             : null,
                attribute07             : null,
                attribute08             : null,
                attribute09             : null,
                attribute10             : null,
                attribute11             : null,
                attribute12             : null,
                attribute13             : null,
                attribute14             : null,
                attribute15             : null
            };

            // Use jQuery extend, properties present in object passed as 2nd parameter will override properties of 1st
            lAction = $.extend( lDefaults, pEvent.actionList[ lActionIterator ] );

            /* Check if action should be processed, process when either:
             - pBrowserEvent is not 'load' (for actions firing from bound event handlers (including IG begin row edit), not on page load).
             - pBrowserEvent is 'load' and either 'Fire on Page Load' is checked, or binding event is either 'ready' or 'pageinit'
             */
            if ( pBrowserEvent !== "load" ||
                ( pBrowserEvent === "load" && ( lAction.executeOnPageInit || $.inArray( pEvent.bindEventType, [ "ready", "pageinit" ] ) !== -1 ) ) ) {

                // Only proceed if the result of the triggering condition is equal to the eventResult property of the action
                if ( lAction.eventResult === pConditionResult ) {

                    // Construct jQuery selector for the affected elements, to be used in call to doAction
                    lSelector = da.constructSelector({
                        elementType: lAction.affectedElementsType,
                        element: lAction.affectedElements,
                        regionId: lAction.affectedRegionId,
                        buttonId: lAction.affectedButtonId,
                        triggeringElement: pTriggeringElement,
                        eventTarget: pBrowserEvent.target
                    });

                    // lAction.waitForResult will only be emitted for actions that expose the 'Wait for Result' attribute.
                    if ( lAction.waitForResult ) {

                        /* This callback will be fired by an action's post-response handling (_success, _error),
                         which restarts the action processing. */
                        lWaitCallback = function ( pErrorOccurred ) {

                            da.gCancelActions = ( lAction.stopExecutionOnError && pErrorOccurred );

                            // -> da.doActions will stop execution if an gCancelActions is true
                            da.doActions( pEvent, lActionIterator + 1, pBrowserEvent, pData, pConditionResult, pTriggeringElement );
                        };
                    }

                    // Do the action. If it returns false (= error), stop executing other actions if the user has defined that
                    if ( da.doAction( pTriggeringElement, lSelector, lAction, pBrowserEvent, pData, pEvent.name, lWaitCallback ) === false && lAction.stopExecutionOnError ) {
                        da.gCancelActions = true;
                    }

                    if ( lAction.waitForResult ) {
                        return false;
                    }
                }

            }

        } // end loop over actions
    }; // doActions

    /*
     * Function that gets the result of the dynamic action's When Condition, which is then used to determine which actions fire, based on their 'Event Result'
     */
    da.testCondition = function( pItemId, pOperator, pTestValue ) {
        var lConditionResult, lExpressionArray,
            lApexItem = apex.item( pItemId ),
            lValue = lApexItem.getValue();

        switch ( pOperator ) {
            case "EQUALS":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is equal to the value
                    lConditionResult = ( lValue === pTestValue );
                } else {
                    lConditionResult = false;

                    /* If the item's value is an array, need to loop over it and check if any of the values in the
                       value array are equal to the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( value === pTestValue );

                        // If event result is true, then exit iterator.
                        if ( lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "NOT_EQUALS":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is not equal to the value
                    lConditionResult = ( lValue !== pTestValue );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     not equal to the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( value !== pTestValue );
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "IN_LIST":
                lExpressionArray = pTestValue.split( "," );
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if it's in the expression array
                    lConditionResult = $.inArray( lValue, lExpressionArray ) !== -1;
                } else {
                    lConditionResult = false;

                    /* If the item's value is an array, need to check if any of the values in the value array equals any of
                     the values in the expression array. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( $.inArray( value, lExpressionArray ) !== -1 );

                        // If event result is true, then exit iterator.
                        if ( lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "NOT_IN_LIST":
                lExpressionArray = pTestValue.split( "," );
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if it's not in the expression array
                    lConditionResult = ( $.inArray( lValue, lExpressionArray ) === -1 );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if any of the values in the value array do not
                     equal any the values in the expression array. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = ( $.inArray( value, lExpressionArray ) === -1 );
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "GREATER_THAN":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is greater than the triggering expression.
                    lConditionResult = lValue > parseFloat( pTestValue );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     greater than the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value > parseFloat( pTestValue );

                        // If iterated value is not greater than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "GREATER_THAN_OR_EQUAL":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is greater than or equal the triggering expression.
                    lConditionResult = lValue >= parseFloat( pTestValue );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     greater than or equal the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value >= parseFloat( pTestValue );

                        // If iterated value is not greater than or equal triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "LESS_THAN":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is less than the triggering expression.
                    lConditionResult = lValue < parseFloat( pTestValue );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     less than the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value < parseFloat( pTestValue );

                        // If iterated value is not less than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "LESS_THAN_OR_EQUAL":
                if ( !$.isArray( lValue ) ) {

                    // If the item's value is not an array, just check if the value is less than or equal the triggering expression.
                    lConditionResult = lValue <= parseFloat( pTestValue );
                } else {
                    lConditionResult = true;

                    /* If the item's value is an array, need to check if ALL of the values in the value array are
                     less than or equal the triggering expression. */
                    $.each( lValue, function( index, value ) {
                        lConditionResult = value <= parseFloat( pTestValue );

                        // If iterated value is not less than triggering expression, then exit iterator
                        if ( !lConditionResult ) {
                            return false;
                        }
                    });
                }
                break;
            case "NULL":
                lConditionResult = lApexItem.isEmpty();
                break;
            case "NOT_NULL":
                lConditionResult = !lApexItem.isEmpty();
                break;
            default:
                lConditionResult = true;
        }

        // return the condition result
        return lConditionResult;
    };

    /**
     * doAction function
     * Executes the action (pAction) on certain elements (pSelector)
     * */
    da.doAction = function( pTriggeringElement, pSelector, pAction, pBrowserEvent, pData, pDynamicActionName, pResumeCallback ) {
        var lContext = {
            triggeringElement : pTriggeringElement,
            affectedElements  : $( pSelector, apex.gPageContext$ ),
            action            : pAction,
            browserEvent      : pBrowserEvent,
            data              : pData,
            resumeCallback    : pResumeCallback
        };

        // Call the javascript function if one is defined and pass the lContext object as this
        if ( pAction.javascriptFunction ) {

            // Log details of dynamic action fired out to the console (only outputs when running in debug mode)
            apex.debug.log( "Dynamic Action Fired: " + pDynamicActionName + " (" + pAction.action + ")", lContext );
            return pAction.javascriptFunction.call( lContext );
        }
    }; // doAction

    /**
     * Function that resumes execution of dynamic actions. Execution of a dynamic action can be paused,
     * if the action's 'Wait for Result' attribute is checked. 'Wait for Result' is a dynamic action
     * plug-in standard attribute designed for use with Ajax based dynamic actions. If a plug-in
     * exposes this attribute, it will also need to resume execution by calling this function in the
     * relevant place in the plug-in JavaScript code (otherwise your action will break execution of
     * dynamic actions).
     *
     * @param {function} pCallback          Reference to callback function available from the this.resumeCallback
     *                                      property.
     * @param {boolean}  pErrorOccurred     Indicate to the framework whether an error has occurred. If an error
     *                                      has occurred and the action's 'Stop Execution on Error' attribute
     *                                      is checked, execution of the dynamic action will be stopped.
     *
     * @example
     * // Resume execution of the actions, indicating that no error has occurred (for example from a "success"
     * // callback of an Ajax based action).
     * apex.da.resume( lResumeCallback, false );
     * @example
     * // Resume execution of the actions, indicating that an error has occurred (for example from an "error"
     * // callback of an Ajax based action). If the action's 'Stop Execution on Error' attribute is checked,
     * // execution of the dynamic action will be stopped.
     * apex.da.resume( lResumeCallback, true );
     *
     * @memberOf apex.da
     **/
    da.resume = function( pCallback, pErrorOccurred ) {
        if ( $.isFunction( pCallback ) ) {
            pCallback( pErrorOccurred );
        }
    }; // resume


    /**
     * @TODO Complete doc
     *
     * Error callback called when the Ajax call fails
     *
     * @param {} pjqXHR             ...
     * @param {} pTextStatus        ...
     * @param {} pErrorThrown       ...
     * @param {} pResumeCallback    ...
     *
     * @TODO add example
     *
     * @memberOf apex.da
     **/
    da.handleAjaxErrors = function ( pjqXHR, pTextStatus, pErrorThrown, pResumeCallback ) {
        var lMsg;

        if ( pjqXHR.status !== 0 ) {
            // When pjqXHR.status is zero it indicates that the page is unloading
            // (or a few other cases that can't be distinguished such as server not responding)
            // and it is very important to not call alert (or any other action that could
            // potentially block on user input or distract the user) when the page is unloading.
            if ( pTextStatus === "APEX" ) {

                // If this is an APEX error, then just show the error thrown
                lMsg = pErrorThrown;
            } else {

                // Otherwise, also show more information about the status
                lMsg = "Error: " + pTextStatus + " - " + pErrorThrown;
            }
            // Emit the error.
            message.alert( lMsg, function() {

                // message.alert is non-blocking, so we need to do the resume in the callback
                da.resume( pResumeCallback, true );
            });

            // return to avoid resuming immediately
            return;
        }

        /* Resume execution of actions here, but pass true to the callback, to indicate an error
         error has occurred with the Ajax call */
        da.resume( pResumeCallback, true );
    }; // handleAjaxErrors


})( apex.da, apex.jQuery, apex.event, apex.util, apex.message );
