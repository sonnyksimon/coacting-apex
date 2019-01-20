/*
 * page.js
 * Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
 **/
/*global apex, $s, $v*/
/*
 * depends on:
 *   server.js
 *   model.js (optional)
 *   navigation.js
 *   widget.js
 *   lang.js
 *   util.js
 *   message.js
 **/

/**
 * <p>This namespace is used for all client-side page related functions of Oracle Application Express.</p>
 *
 * @namespace
 */
apex.page = {};

/**
 * <p>This event is triggered when the page is submitted with {@link apex.page.submit} or {@link apex.page.confirm}.
 * This includes buttons with action Submit Page and Dynamic Action Submit Page action.
 * It is equivalent to the Dynamic Action event Before Page Submit.
 * It is triggered before the page is validated. It is triggered on {@link apex.gPageContext$},
 * which is the document for Desktop UI pages and the page div for jQuery Mobile UI pages. This event can be canceled
 * by a Dynamic Action Confirm or Cancel Event action so you cannot rely on the page actually being submitted.
 * If you need code to run just before the page is actually submitted see the {@link apex.event:apexpagesubmit} event.</p>
 *
 * <p>The event handler should not do any long running or asynchronous processing. Specifically it should not make a
 * synchronous or asynchronous Ajax request. The event handler receives a string argument that is the request value.</p>
 *
 * @event apexbeforepagesubmit
 * @memberof apex
 * @property {Event} event <code class="prettyprint">jQuery</code> event object.
 * @property {string} request The request string.
 *
 * @example <caption>This example performs an extra validation on page item P1_CHECK_ME. For this to work the Submit
 * button Execute Validations attribute must be Yes and the application compatibility mode must be greater than or
 * equal to 5.1 or the validate option to apex.submit or apex.confirm must be true.</caption>
 * apex.jQuery( apex.gPageContext$ ).on( "apexbeforepagesubmit", function() {
 *     var item = apex.item("P1_CHECK_ME" ),
 *     value = item.getValue();
 *     if ( value !== "valid" ) { // replace with desired constraint check
 *         item.node.setCustomValidity( "Text field needs to be valid" );
 *     } else {
 *         item.node.setCustomValidity( "" );
 *     }
 * } );
 */

/**
 * <p>This event is triggered when the page is submitted with {@link apex.page.submit} or {@link apex.page.confirm}.
 * This includes buttons with action Submit Page and Dynamic Action Submit Page action.
 * It is triggered after the page is validated. It is triggered on {@link apex.gPageContext$}, which is the document for
 * Desktop UI pages and the page div for jQuery Mobile UI pages. This event is the last chance to set or
 * modify page items before the page is submitted.</p>
 *
 * <p>The event handler should not do any long running or asynchronous processing.
 * Specifically it should not make a synchronous or asynchronous Ajax request.
 * The event handler receives a string argument that is the request value.</p>
 *
 * @event apexpagesubmit
 * @memberof apex
 * @property {Event} event <code class="prettyprint">jQuery</code> event object.
 * @property {string} request The request string.
 *
 * @example <caption>This example makes the page item P1_VALUE upper case before the page is submitted.</caption>
 * apex.jQuery( apex.gPageContext$ ).on( "apexpagesubmit", function() {
 *     var item = apex.item("P1_VALUE");
 *     item.setValue( item.getValue().toUpperCase());
 * } );
 */

/**
 * <p>This event is triggered at the end of all APEX page load functionality. This events differs from the standard
 * page load event in that it will not only wait for the DOM to be ready, but also for any <em>delayLoading</em>
 * components to be ready.</p>
 * <p>Please see the <em>delayLoading</em> property of the {@link apex.item.create} API for further information
 * about items that can delay loading.</p>
 *
 * @event apexreadyend
 * @memberof apex
 * @property {Event} event <code class="prettyprint">jQuery</code> event object.
 *
 * @example <caption>This example shows how to define an event handler for this event.</caption>
 * apex.jQuery( apex.gPageContext$ ).on( "apexreadyend", function( e ) {
 *     // code here
 * } );
 */

(function( page, $, event, message, server, undefined ) {
"use strict";

// This is an internal detail that should not be used or relied on
page.itemCallbacks = {};

// Stack of deferred objects, can be used by items to delay page loading
page.loadingDeferreds = [];

var SEL_IGNORE_CHANGE = ".js-ignoreChange";

var gSaving = false, // true when the page is going to be saved - the data is really going to be saved so don't warn about changes
    gIgnoreSubmitEvent = false, // true when the submit even is caused by APEX
    gExtraIsChanged = null, // an additional user provided function to call to check for page changes
    gUnsavedChangesMessage = null; // this is the message to use for unsaved changes. If null not checking for unsaved changes.

function _getSubmitOptions ( pOptions, pMode ) {
    var lRequestDefault, lDefaults,
        lOptions = {};

    // Default REQUEST value depends on whether this is a SUBMIT or CONFIRM
    if ( pMode === "SUBMIT" ) {
        lRequestDefault = null;
    } else if ( pMode === "CONFIRM" ) {
        lRequestDefault = "Delete";
    }
    lDefaults = {
        request     : lRequestDefault,
        set         : null,
        showWait    : false,
        waitMsg     : null,
        form        : "wwv_flow",
        reloadOnSubmit  : null,
        ignoreChange: true,
        validate    : false
    };

    /* Check whether pOptions is a string (where a simple REQUEST string has been passed), or
     * an object (where an option map has been passed) and extend the defaults accordingly,
     * setting the result to lOptions.
     */
    switch ( typeof( pOptions ) ) {
        case "string" :
            lOptions = $.extend( lDefaults, { request : pOptions } );
            break;
        case "object" :
            lOptions = $.extend( lDefaults, pOptions );
            break;
        default :
            lOptions = lDefaults;
            break;
    }
    return lOptions;
} // _getSubmitOptions

// on document ready
$(function() {
    // For a long time apex has relied on page submission going through apex.page.submit. However a normal
    // browser submit would mostly work OK. No one would think of coding a normal submit input button on a page
    // but the little known often forgotten browser behavior that submits the page when it contains a single
    // input and the user presses the enter key in that field would generally work. There would be no apex
    // events and shuttles and list manager wouldn't save correctly but other items and tabular forms would
    // save just fine.
    // We found in the wild that people were relying on this behavior so it would not be a good idea to
    // disable browser submit on enter. Just use the following to make sure it goes through our submit logic
    $( "#wwvFlowForm" ).on( "submit", function( event ) {
        if ( !gIgnoreSubmitEvent ) {
            page.submit();
            return false;
        }
    } );
});

// For the given form call callback once for each page item in that form. This includes disabled and unchecked items.
// Page item elements are identified by having a name attribute that is not one of the well known names
//   input type=image not supported
// See comments in ajaxSubmit as well
function forEachPageItem( form$, callback, allElements ) {
    var processed = {};

    $( form$[0].elements ).each( function() {
        var el = this,
            name = el.name,
            type = el.type;

        if ( el.nodeName === "BUTTON" || type === "button" || type === "submit" || type === "reset" || !name ) {
            return;
        }
        // for checkboxes and radio groups there can be more than one element with the same name. The name is treated
        // as the item name and we only want to process an item once.
        if ( !allElements && processed[name] ) {
            return;
        }
        if ( server.isValidPageItemName( name ) ) {
            // process page items including disabled or unchecked items
            processed[name] = 1;
            return callback( el, name, type );
        }
    } );
}

/**
 * @ignore
 */
function browserSubmit( form$, ignoreChange ) {
    var i, fileItemsAdded,
        pageItems = [],
        pageItemElements = [],
        pJson = {};

    // Gather all the page items that need to be included explicitly in the pageItems added to p_json
    forEachPageItem( form$, function( el, name ) {
        // add page items including disabled or unchecked items
        pageItems.push( name );
        pageItemElements.push( el );
    }, true );

    gIgnoreSubmitEvent = true;
    // this further refines the set of page items because the name and id of a page item must match; anything else is excluded
    fileItemsAdded = server.addPageItemsToRequest( pageItems, pJson, true );

    // Remove the name attribute from page items so they are not submitted as normal parameters
    for ( i = 0; i < pageItemElements.length; i++ ) {
        $( pageItemElements[i] ).removeAttr( "name" );
    }
    // except for file type elements which need to be mapped to the p_files array
    for ( i = 0; i < fileItemsAdded.length; i++ ) {
        $( fileItemsAdded[i] ).attr( "name", "p_files" );
    }

    pJson = server.chunk( JSON.stringify( pJson ) );
    if ( !$.isArray( pJson ) ) {
        pJson = [pJson];
    }
    // make sure that the p_json property is sent first (so it is before p_files)
    for ( i = pJson.length - 1; i >= 0; i-- ) {
        form$.prepend( "<input type='hidden' name='p_json' value='" + apex.util.escapeHTML( pJson[i] )  + "'>" );
    }

    gSaving = ignoreChange;
    // Submit the current form
    form$.trigger( "submit" );
    gIgnoreSubmitEvent = false;
    // if for any reason the post doesn't replace this page with a new one (such as the response being a downloaded file)
    // make sure the page can be submitted again
    for ( i = 0; i < pageItemElements.length; i++ ) {
        $( pageItemElements[i] ).attr( "name", pageItems[i] );
    }
    $("input[name='p_json']").remove();
}

/**
 * @ignore
 */
function ajaxSubmit( form$, waitPopup, ignoreChange ) {
    var p, updateModelsCallback,
        pageItems = [],
        requestData = {},
        requestOptions = {};

    // Gather all the page items and other form fields that need to be included explicitly in the requestData/pageItems
    // input type=image not supported
    // Page item elements are identified by having a name attribute that is not one of the well known names.
    // This loop enumerates page items by the form element name attribute. However the server and the client know the
    // page item based on its [page item] name which on the client side becomes an element id. This is what the
    // apex.item API uses to access a page item. In most cases a single element (for example input or select) has
    // the page item name for both the id and the name attribute. Example: <input id="P1_NAME" name="P1_NAME"...>.
    // However multi valued checkboxes and radio groups will have multiple elements with the same name because that
    // is how HTML forms work. There may also be some legacy page items that have the page item name on the id
    // attribute of one element and on the name attribute of a different element. If there is a name that can't be
    // found as an id then it is not a page item. These details are handled by the server module (server.accept,
    // server.addPageItemsToRequest).
    // can't use forEachPageItem because also handles xnn and fnn parameters.
    $( form$[0].elements ).each( function() {
        var el = this,
            name = el.name,
            nodeName = el.nodeName,
            type = el.type;

        /*
         * APEX form submission has traditionally been different from a normal browser submit.
         *
         * 1) Although the browser would never submit a disabled form element or a checkbox or radio input that is
         * not checked, because p_arg_names was submitted the server would still interpret the not submitted page
         * item as an empty string or null. So by disabling something you set it to null in session state.
         * This may or may not be desired but it is the way APEX pages have always worked and needs to be handled
         * the same way when submitting the page via ajax. Note this only applies to page items.
         *
         * 2) APEX never cares about buttons (normal browser submit includes submitter button) APEX uses p_request
         * hidden input for the similar purpose.
         */
        if ( nodeName === "BUTTON" || type === "button" || type === "submit" || type === "reset" || !name ) {
            return;
        }
        // for an ajax full page submit the x<nn> and f<nn> elements need to be includes as normal parameters
        // so add them to the requestData.
        if ( /x[0-2][0-9]/.exec( name ) ) {
            // ignore disabled or unchecked
            if ( el.disabled || ( nodeName === "INPUT" && ( type === "checkbox" || type === "radio" ) && !el.checked ) ) {
                return;
            }
            requestData[ name ] = $( el ).val();
        }
        if ( /f[0-5][0-9]|fcs|fmap|fhdr|fcud|frowid/.exec( name ) ) {
            // ignore disabled or unchecked
            if ( el.disabled || ( nodeName === "INPUT" && ( type === "checkbox" || type === "radio" ) && !el.checked ) ) {
                return;
            }
            if ( !requestData[ name ] ) {
                requestData[ name ] = [];
            }
            requestData[ name ].push( $( el ).val() );
        }
        // add page items including disabled or unchecked items
        if ( server.isValidPageItemName( name ) ) {
            pageItems.push( name );
        }
        // else it has no name so wouldn't be submitted or is some special parameter that is handled by the server module.
    } );

    if ( pageItems.length ) {
        requestData.pageItems = pageItems;
    }

    // Add any models that have changes to save
    if ( apex.model ) {
        updateModelsCallback = apex.model.addChangesToSaveRequest( requestData );
    }

    // When a page is submitted normally the browser gives feedback typically with a spinner icon in the window or tab title
    // When the page is submitted with ajax there is absolutely no indication that something is happening.
    // So if there is no waitPopup then add a spinner. Note there is a difference between a wait popup and a spinner
    // the former has a click barrier overlay.
    if ( !waitPopup ) {
        requestOptions.loadingIndicatorPosition = "page";
    }

    gSaving = ignoreChange;
    gIgnoreSubmitEvent = true;
    p = server.accept( requestData, requestOptions );
    gIgnoreSubmitEvent = false;
    if ( updateModelsCallback ) {
        updateModelsCallback( p );
    }
    p.done( function( responseData ) {
        if ( responseData.errors ) {
            if (waitPopup) {
                waitPopup.remove();
                waitPopup = null;
            }

            // pass errors through to message API for display
            message.clearErrors();
            message.showErrors( responseData.errors );
            gSaving = false;
        } else if ( responseData.redirectURL ) {
            apex.navigation.redirect( responseData.redirectURL );
            waitPopup = null; // let reloading the page get rid of wait popup
        } else {
            // todo is this even a possibility? Seems useful to stay on same page
            //    we would also need to mark all page items as not changed, perhaps server module is the place to do that but the impl must be in item module
            gSaving = false;
        }
    } ).fail( function( jqXHR, textStatus, errorThrown ) {
        gSaving = false;
        // server module should handle errors in a generic way nothing more to report here
    } ).always( function() {
        if ( waitPopup ) {
            waitPopup.remove();
        }
    });
}

/**
 * <p>This function submits the page. The shorter alias for this function {@link apex.submit} with the same parameters
 * can also be used. Depending on the value of the page's Reload on Submit attribute, the page is submitted using
 * Ajax or with a normal form submission post request.</p>
 *
 * <p>This function triggers a {@link apex.event:apexbeforepagesubmit} event on the {@link apex.gPageContext$} which can be canceled
 * by an event handler. If canceled, the page is not submitted. Just before the page is submitted, this function
 * triggers a {@link apex.event:apexpagesubmit} event on the {@link apex.gPageContext$}, which cannot be canceled.</p>
 *
 * @function submit
 * @memberOf apex.page
 * @param {?string|Object} [pOptions] If this is a string, it will be used to set the REQUEST value.
 *   If this is null, the page will be submitted with no REQUEST value.
 *   If this is an object, you can define the following properties:
 * @param {string} [pOptions.request] The REQUEST value. For a submit function the default is null.
 * @param {Object} [pOptions.set] An object containing name/value pairs of items to set on the page prior to submission.
 *   The object properties are page item names and the item value is set to the property value.
 *   The default is to not set any page items.
 * @param {boolean} [pOptions.showWait] If true, a 'Wait Indicator' spinner is displayed, which can be useful when
 *   running long page operations. The default is false.
 * @param {Event} [pOptions.submitIfEnter] If you only want to submit when the ENTER key has been pressed,
 *   call apex.page.submit in the keydown or keypress event handler and pass the event object in this parameter.
 * @param {string} [pOptions.reloadOnSubmit] Override the reload on submit setting of the page.
 *   Set to one of the following: "A" (always) or "S" (success)
 * @param {boolean} [pOptions.ignoreChange] If true (the default) and the warnOnUnsavedChanges feature is enabled, no
 *   warning will be given if there are changes. If false and the warnOnUnsavedChanges feature is enabled and there
 *   are changes there will be a warning. If warnOnUnsavedChanges feature is disabled there is never a warning.
 *   Set this to false if the submit will not actually save the data.
 * @param {boolean} [pOptions.validate] If true, check the validity of page items and models before submitting the page.
 *   If anything is not valid then show an alert dialog and don't submit the page. The default is false.
 * @returns {boolean|undefined} If the submitIfEnter option is specified, a Boolean value is returned.
 *   If the ENTER key is not pressed, true is returned and if the ENTER key is pressed, false is returned.
 *   If submitIfEnter is not specified, undefined is returned.
 *
 * @example <caption>Submits the current page with a REQUEST value of 'DELETE'.</caption>
 * apex.page.submit( "DELETE" );
 *
 * @example <caption>This example is the same as the previous one but uses the shorter alias.</caption>
 * apex.submit( "DELETE" );
 *
 * @example <caption>This example submits the page with a REQUEST value of 'DELETE' and two page item values are set,
 *   P1_DEPTNO to 10 and P1_EMPNO to 5433 . During submit, a wait icon is displayed as a visual indicator for the user.</caption>
 * apex.page.submit( {
 *     request: "DELETE",
 *     set: {
 *        "P1_DEPTNO": 10,
 *        "P1_EMPNO": 5433
 *     },
 *     showWait: true,
 * } );
 *
 * @example <caption>This example is the same as the previous one but uses the shorter alias.</caption>
 * apex.submit( {
 *     request: "DELETE",
 *     set: {
 *        "P1_DEPTNO": 10,
 *        "P1_EMPNO": 5433
 *     },
 *     showWait: true,
 * } );
 *
 * @example <caption>This example shows how to submit the page when the ENTER key is pressed on a text input.</caption>
 * apex.jQuery("#P1_TEXT").on( "keydown", function( event ) {
 *   apex.page.submit({
 *       submitIfEnter: event
 *   });
 * });
 */
page.submit = function( pOptions ) {
    var lKeyCode, lReloadOnSubmit,
        lPageValid = true,
        lOptions      = _getSubmitOptions( pOptions, "SUBMIT" ),
        lCancelSubmit,
        lWaitPopup,
        lNumTimeouts,         // for deferred submit, the number of times a submit was already tried
        lForm$,               // the form to submit
        lRunSubmitProcessing; // the callback function which implements deferred submit

    // If the lOptions.submitIfEnter option has been passed, use it to check if the ENTER key was pressed.
    if ( lOptions.submitIfEnter !== undefined ) {

        // Because this function may be used as an event callback, and the event handler may not have been
        // bound using jQuery, we can't rely on the normalised event "which" attribute to determine the keycode.
        if ( window.event ) {
            lKeyCode = window.event.keyCode;
        } else {
            lKeyCode = lOptions.submitIfEnter.which;
        }

        if ( lKeyCode !== 13 ) {

            /* If ENTER key was not pressed, exit the function by returning true
             * (to proceed with default event handling, eg allow other keystrokes through). */
            return true;
        }
    }

    // Trigger a 'Before Page Submit' event for the document, and pass the current request value for convenience.
    lCancelSubmit = event.trigger( apex.gPageContext$, "apexbeforepagesubmit", lOptions.request );

    // Cancel submission, if the apex.event.trigger function says so (with a true return value).
    if ( !lCancelSubmit ) {

        // Only show wait icon if lOptions.showWait is true
        if( lOptions.showWait ) {
            lWaitPopup = apex.widget.waitPopup();
        }

        // If a lOptions.set object has been passed, iterate over it and set the values
        if( lOptions.set ) {
            $.each( lOptions.set, function( pId, pValue ) {

                // Only set the values if ID is not null and Value is not undefined (but allow null or '')
                if( ( pId ) && ( pValue !== undefined ) ) {
                    $s( pId, pValue );
                }
            });
        }

        lForm$ = $( "form[name=" + lOptions.form + "]", apex.gPageContext$ );
        if ( lOptions.reloadOnSubmit ) {
            $s( "pReloadOnSubmit", lOptions.reloadOnSubmit );
        }
        lReloadOnSubmit = $v( "pReloadOnSubmit" );

        // Set pRequest, within the current context
        $( "#pRequest", apex.gPageContext$ ).val( lOptions.request );

        // try / catch block to safeguard against IE versions that raise an error when calling AutoCompleteSaveForm
        // (for example as happens on Windows Phone 7.5 / 8), so native autocomplete will not work here.
        try {
            // Internet Explorer form auto-complete feature doesn't work when the form is submitted
            // via JavaScript. The solution is to call this IE specific function.
            // see: support.microsoft.com/kb/329156
            // The typeof test is needed because for some reason it is not a normal function which would be truthy
            if ( window.external && typeof window.external.AutoCompleteSaveForm == "unknown" ) {
                    window.external.AutoCompleteSaveForm( $( "form[name=" + lOptions.form + "]", apex.gPageContext$ ).get( 0 ) );
            }
        } catch ( e ) {}

        // Perform page submit, but defer it if pPageItemsProtected is not yet in the DOM (bug #14287960).
        lNumTimeouts         = 0;
        lRunSubmitProcessing = function() {
            if ( lForm$.attr( "action" ) === "wwv_flow.accept" &&
                 $( "#pPageItemsProtected", apex.gPageContext$ ).length === 0 )
            {
                lNumTimeouts++;
                if ( lNumTimeouts > 5 ) {
                    if ( lWaitPopup ) {
                        lWaitPopup.remove();
                    }
                    apex.message.alert( apex.lang.getMessage( "APEX.WAIT_UNTIL_PAGE_LOADED" ) );
                } else {
                    if ( lWaitPopup === undefined && lNumTimeouts === 1 ) {
                        lWaitPopup = apex.widget.waitPopup();
                    }
                    setTimeout( lRunSubmitProcessing, 300 );
                }
            } else {
                if ( lOptions.validate ) {
                    if ( !page.validate( lForm$ ) ) {
                        lPageValid = false;
                        apex.message.alert( apex.lang.getMessage( "APEX.CORRECT_ERRORS" ), function() {
                            // todo focus first error
                        } );
                    }
                }
                if ( lPageValid ) {
                    event.trigger( apex.gPageContext$, "apexpagesubmit", lOptions.request );
                    if ( lReloadOnSubmit === "S" ) {
                        ajaxSubmit( lForm$, lWaitPopup, lOptions.ignoreChange );
                    } else if ( lReloadOnSubmit === "A" ) {
                        browserSubmit( lForm$, lOptions.ignoreChange );
                    } else {
                        // Fallback for pages which don't contain pReloadOnSubmit.
                        // Examples are Popup LOV and Date Picker Classic. They do submit to a different procedure which
                        // doesn't expect JSON.
                        gIgnoreSubmitEvent = true;
                        lForm$.trigger( "submit" );
                        gIgnoreSubmitEvent = false;
                    }
                }
            }
        };
        lRunSubmitProcessing();

    } else {

        // Reset cancel flag, ready for next page behaviour
        event.gCancelFlag = false;
    }

    if ( lOptions.submitIfEnter !== undefined ) {
        // Return false so that when this function is called as an event callback, we prevent the default event handling
        return false;
    }

}; // apex.page.submit

/**
 * <p>Displays a confirmation dialog showing a message, pMessage, and depending on the user's choice, submits the page or
 * cancels submitting. Depending on the value of the page's Reload on Submit attribute, the page is submitted using
 * Ajax or with a normal form submission post request.</p>
 *
 * <p>Once the user chooses to submit the page, the behavior is the same as for the {@link apex.page.submit} function.
 * The shorter alias for this function {@link apex.confirm} with the same parameters can also be used.</p>
 *
 * @function confirm
 * @memberOf apex.page
 * @param {string} [pMessage] The confirmation message to display. The default is
 *   "Would you like to perform this delete action?". It is best to supply your own message because the default
 *   message is not localized.
 * @param {?string|Object} [pOptions] If this is a string, it will be used to set the REQUEST value.
 *   If this is null or omitted, the page will be submitted with no REQUEST value.
 *   If this is an object, you can define the following properties:
 * @param {string} [pOptions.request] The REQUEST value. For the confirm function the default is “Delete”.
 * @param {Object} [pOptions.set] An object containing name/value pairs of items to set on the page prior to submission.
 *   The object properties are page item names and the item value is set to the property value.
 *   The default is to not set any page items.
 * @param {boolean} [pOptions.showWait] If true, a 'Wait Indicator' spinner is displayed, which can be useful when
 *   running long page operations. The default is false.
 * @param {Event} [pOptions.submitIfEnter] This option is not useful for the confirm function.
 * @param {string} [pOptions.reloadOnSubmit] Override the reload on submit setting of the page.
 *   Set to one of the following: "A" (always) or "S" (success)
 * @param {boolean} [pOptions.ignoreChange] If true (the default) and the warnOnUnsavedChanges feature is enabled, no
 *   warning will be given if there are changes. If false and the warnOnUnsavedChanges feature is enabled and there
 *   are changes, a warning will be given. If warnOnUnsavedChanges feature is disabled, there is never a warning.
 *   Set this to false if the submit will not actually save the data.
 * @param {boolean} [pOptions.validate] If true, check the validity of page items and models before submitting the page.
 *   If anything is not valid then show an alert dialog and don't submit the page. The default is false.
 *
 * @example <caption>Shows a confirmation dialog with the text 'Delete Department'.
 *   If the user chooses to proceed with the delete, the current page
 *   is submitted with a REQUEST value of 'DELETE'.</caption>
 * apex.page.confirm( "Delete Department", 'DELETE' );
 *
 * @example <caption>This example is the same as the previous one but uses the shorter alias.</caption>
 * apex.confirm( "Delete Department", 'DELETE' );
 *
 * @example <caption>This example shows a confirmation message with the 'Save Department?' text.
 *   If the user chooses to proceed with the save, the page is submitted with a REQUEST value of 'SAVE' and 2 page
 *   item values are set, P1_DEPTNO to 10 and P1_EMPNO to 5433.</caption>
 * apex.page.confirm( "Save Department?", {
 *     request: "SAVE",
 *     set: {
 *         "P1_DEPTNO": 10,
 *         "P1_EMPNO": 5433
 *     }
 * } );
 *
 * @example <caption>This example is the same as the previous one but uses the shorter alias.</caption>
 * apex.confirm( "Save Department?", {
 *     request: "SAVE",
 *     set: {
 *         "P1_DEPTNO": 10,
 *         "P1_EMPNO": 5433
 *     }
 * } );
 */
page.confirm = function( pMessage, pOptions ) {
    var lMessage,
        lOptions = _getSubmitOptions( pOptions, "CONFIRM" );

    // Default message to a default delete confirmation, if it's not passed
    if ( pMessage ) {
        lMessage = pMessage;
    } else {
        lMessage = "Would you like to perform this delete action?";
    }

    // todo consider if enter and validation should happen before confirmation

    // Fire the confirm and if OK is pressed, continue with the submit
    apex.message.confirm( lMessage, function( ok ) {
        if ( ok ) {
            page.submit( lOptions );
        }
    } );

}; // apex.page.confirm

/**
 * Experimental
 * todo doc once ready
 * @function validatePageItemsOnBlur
 * @memberOf apex.page
 * @ignore
 * @return {boolean}
 */
page.validatePageItemsOnBlur = function() {

    // todo use forEachPageItem
    // setup handler on each page item to validate on blur
    $( $( "#wwvFlowForm" )[0].elements ).each( function() {
        var el = this,
            name = el.name,
            type = el.type;

        if ( el.nodeName === "BUTTON" || type === "button" || type === "submit" || type === "reset" || !name ) {
            return;
        }

        if ( server.isValidPageItemName( name ) && $( el ).closest( SEL_IGNORE_CHANGE ).length === 0 ) {
            // todo may need to go up to container, may need to use focusout
            $( el ).on( "blur.apexValidate", function( event ) {
                var item, validity,
                    errors = [];

                if ( el.disabled ) {
                    return;
                }
                item = apex.item( el );
                validity = item.getValidity();
                if ( !validity.valid ) {
                    errors.push( {
                        message: item.getValidationMessage(),
                        location: "inline",
                        pageItem: item.id
                    } );
                    message.showErrors( errors );
                } else {
                    message.clearErrors( item.id );
                }
            } );
        }
    } );

}; // apex.page.validatePageItemsOnBlur


/**
 * <p>Check if any page items or submittable Application Express {@link models} on the page are invalid.
 * Any errors are shown inline using the {@link apex.message.showErrors} function.</p>
 *
 * <p class="important">Note: This function does not actually perform any validation. Use HTML 5 validation attributes
 * or API to validate items.</p>
 *
 * @function validate
 * @memberOf apex.page
 * @return {boolean} true if page is valid, otherwise false.
 * @example <caption>The following example checks if the page is valid when a button with id checkButton is pressed.</caption>
 * apex.jQuery( "#checkButton" ).click( function() {
 *     if ( !apex.page.validate() ) {
 *         alert("Please correct errors");
 *     }
 * } );
 */
// the parameter is not documented on purpose
page.validate = function( pForm$ ) {
    var valid = true,
        errors = [];

    if ( !pForm$ ) {
        pForm$ = $( "#wwvFlowForm" );
    }

    message.clearErrors(); // todo consider the effect on other sources of page errors other than page items

    // validate page items
    forEachPageItem( pForm$, function( el, name ) {
        var item, validity;

        item = apex.item( name );
        if ( !item.isDisabled() ) {
            validity = item.getValidity();
            if ( !validity.valid ) {
                valid = false;
                errors.push( {
                    message: item.getValidationMessage(),
                    location: "inline",
                    pageItem: item.id
                } );
            }
        }
    } );

    // models validate themselves as data is entered so just check if there are any errors in any models on the page
    if ( valid && apex.model ) {
        valid = !apex.model.anyErrors();
    }

    if ( !valid ) {
        message.showErrors( errors );
    }

    return valid;
}; // apex.page.validate

/**
 * <p>Return true if any page items or Application Express models on this page have changed since last being
 * sent to the server. Items that are disabled or are configured to ignore changes are not included in the check.
 * This will call the <code class="prettyprint">pExtraIsChanged</code> function set in
 * {@link apex.page.warnOnUnsavedChanges} if one was supplied and only if no other changes are found first.</p>
 *
 * @function isChanged
 * @memberOf apex.page
 * @return {boolean} true if there are any changes, otherwise false.
 * @example <caption>The following example checks if the page is changed before performing some action.</caption>
 * if ( apex.page.isChanged() ) {
 *     // do something when the page has changed
 * }
 */
page.isChanged = function() {
    var hasChanged = false;

    if ( apex.model ) {
        hasChanged = apex.model.anyChanges();
    }

    if ( !hasChanged ) {
        forEachPageItem( $( "#wwvFlowForm" ), function( el, name ) {
            // never check if disabled items have changed
            if ( el.disabled ) {
                return;
            }
            // if not flagged to ignore then check if it is changed
            if ( $( el ).closest( SEL_IGNORE_CHANGE ).length === 0 ) {
                if ( apex.item( name ).isChanged() ) {
                    hasChanged = true;
                    return false; // found one change no need to check any more
                }
            }
        } );
    }
    if ( !hasChanged && gExtraIsChanged ) {
        hasChanged = gExtraIsChanged();
    }

    return hasChanged;
}; // apex.page.isChanged

/**
 * <p>Initialize a handler that checks for unsaved changes anytime the page is about to unload.
 * This is safe to call multiple times. The pMessage and pExtraIsChanged parameters override any previous values.
 * This function is called automatically when the page attribute Warn on Unsaved Changes is set to yes.
 * The main reason to call this manually is to customize the parameters.</p>
 * <p>See also {@link item#isChanged}.</p>
 *
 * @function warnOnUnsavedChanges
 * @memberOf apex.page
 * @param {string} [pMessage] Message to display when there are unsaved changes. If the message is not given,
 *   a default message is used. <p class="important">Note: Most browsers do not show this message.</p>
 * @param {function} [pExtraIsChanged] Optional additional function to be called, checking if there are any unsaved changes.
 *   It should return true if there are unsaved changes, and false otherwise.
 *   It is only called if there are no changes to any models or page items.
 *   This is useful if there are non-standard state-full inputs on the page that are not Application Express items
 *   and do not keep their state in an Application Express model. It allows writing a custom function to detect
 *   if those non-standard inputs have changed.
 * @example <caption>The following example enables the 'Warn on unsaved changes' feature with a custom message.</caption>
 * apex.page.warnOnUnsavedChanges( "The employee record has been changed" );
 */
page.warnOnUnsavedChanges = function( pMessage, pExtraIsChanged ) {
    if ( pExtraIsChanged ) {
        gExtraIsChanged = pExtraIsChanged;
    }

    $( window ).off( ".apexpageunload" );

    if ( !pMessage ) {
        pMessage = apex.lang.getMessage( "APEX.WARN_ON_UNSAVED_CHANGES" );
    }
    gUnsavedChangesMessage = pMessage;

    // For buttons and links with the ignore change class the requirement is that clicking *will* cause the page
    // to reload because of navigation.
    $( "button" + SEL_IGNORE_CHANGE ).each( function() {
        var btn$ = $( this ),
            action = btn$.prop("onclick");

        if ( action ) {
            btn$.removeAttr("onclick")
                .on( "click", function() {
                    page.cancelWarnOnUnsavedChanges();
                    action();
                } );
        }
    } );
    $( "a" + SEL_IGNORE_CHANGE ).on( "click.apexpageunload", function() {
        page.cancelWarnOnUnsavedChanges();
    } );

    $( window ).on( "beforeunload.apexpageunload", function( event ) {
        if ( !gSaving && page.isChanged() ) {
            return gUnsavedChangesMessage;
        }
    } );
}; // apex.page.warnOnUnsavedChanges

/**
 * <p>Call to remove the handler that checks for unsaved changes. This is useful to do before any kind of cancel
 * operation where the user is intentionally choosing to lose the changes. It is not normally necessary to call
 * this function because the declarative attribute Warn on Unsaved Changes with value Do Not Check will do it
 * automatically. Adding the class <code class="prettyprint">js-ignoreChange</code> to a link (anchor element)
 * or button will cause this function to be called before the link or button action.</p>
 *
 * @function cancelWarnOnUnsavedChanges
 * @memberOf apex.page
 * @example <caption>The following sets up a handler on a custom cancel button, to leave the page without
 *   checking for changes.</caption>
 * apex.jQuery( "#custom-cancel-button" ).click( function() {
 *     apex.page.cancelWarnOnUnsavedChanges();
 *     apex.navigation.redirect( someUrl );
 * } );
 */
page.cancelWarnOnUnsavedChanges = function() {
    gUnsavedChangesMessage = null;
    $( window ).off( "beforeunload.apexpageunload" );
}; // apex.page.cancelWarnOnUnsavedChanges

/**
 * This function is an alias for {@link apex.page.submit}.
 *
 * @function
 * @memberOf apex
 */
apex.submit = page.submit;

/**
 * This function is an alias for {@link apex.page.confirm}.
 *
 * @function
 * @memberOf apex
 */
apex.confirm = page.confirm;

/**
 * Function for internal use only. Receives all APEX page init logic generated by server and executes it.
 * Also used for other generally useful page initialization logic (eg Hammer event mappings)
 *
 * @function init
 * @memberOf apex.page
 * @ignore
 */
page.init = function( pThis, pInitFunction ) {
    var lHammerTime;

    function _registerHammerHandler ( pHandlers ) {
        var lHandler;
        for ( lHandler in pHandlers ) {
            if ( pHandlers.hasOwnProperty( lHandler ) ) {
                lHammerTime.on( lHandler, pHandlers[ lHandler ] );
            }
        }
    }

    // First let's call the APEX init logic. Note: 'this' context is passed in from caller, in case this was relied on
    if ( $.isFunction( pInitFunction ) ) {
        pInitFunction.call( pThis );
    }

    // Map Hammer events to APEX ones, but only for desktop apps where Hammer is available
    if ( typeof Hammer !== "undefined" ) {

        // Prevent Hammer from disabling text selection on desktop pages
        delete Hammer.defaults.cssProps.userSelect;

        lHammerTime = new Hammer( document.body, {} );

        // Note: Set APEX event target as the triggering element, so that handlers can be tied to specific APEX elements.
        _registerHammerHandler ( {
            tap: function ( e ) {
                event.trigger ( e.target, "apextap", e );
            },
            doubletap: function ( e ) {
                event.trigger ( e.target, "apexdoubletap", e );
            },
            press: function ( e ) {
                event.trigger ( e.target, "apexpress", e );
            },
            pan: function ( e ) {
                event.trigger ( e.target, "apexpan", e );
            },
            swipe: function ( e ) {
                event.trigger ( e.target, "apexswipe", e );
            }
        } );
    }
};

})( apex.page, apex.jQuery, apex.event, apex.message, apex.server );
