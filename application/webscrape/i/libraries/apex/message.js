/*
 message.js
 Copyright (c) 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*global apex,alert,confirm*/
/**
 * Requirements from server for this API to work:
 * - Server replaces the Page Template substitution "#SUCCESS_MESSAGE#" with: <span id="APEX_SUCCESS_MESSAGE" data-template-id="[template ID]"></span>
 * - Server replaces the Page Template substitution "#NOTIFICATION_MESSAGE#" with: <span id="APEX_ERROR_MESSAGE" data-template-id="[template ID]"></span>
 * - Server replaces label template substitution "#ERROR_TEMPLATE#" for each page item with: <span id="[item name]_error_placeholder" class="a-Form-error" data-template-id="[template id]"></span>
 * - Server calls apex.message.registerTemplates() for any templates required by the API (eg page success sub-template, page error sub-template, distinct label templates used on the page).
 *
 * To Do
 * - Allow messages to be stackable, and individually dismissable
 * - Handle when template ID may have a null sub-template, with some default?
 * - Optimise by caching success / error placeholder jQuery reference (there were issues with lost references when I tried this)
 * - Global storage for both success and errors, type="success", array gMessages, in the future have 'warnings', 'info'
 * - close handler for messages driven by data attribute, need to avoid having to go into old themes.
 * - ability to have custom class inline, defineable in the label template
 * - Handling of additional and technical info for any message, perhaps tooltip for additional, and dialog for technical
 *
 * Open Questions:
 * - Message 'location' structure, seems to allow for some odd combinations
 *
 * Dependencies:
 *  util.js
 *  lang.js
 *  jquery.ui.dialog.js - optional
 *  navigation.js - for dialogs
 *
 **/

/**
 * The apex.message namespace is used to handle client-side display and management of messages in Oracle Application Express.
 * @namespace
 **/
apex.message = {};

( function( message, $, util, lang ) {
    "use strict";

    // Constants
    var PAGE = "page",
        INLINE = "inline",
        TEMPLATE_ID = "template-id",
        FALLBACK_TEMPLATE = "FALLBACK_ET";

    var C_VISIBLE = "u-visible",
        C_HIDDEN = "u-hidden",
        C_ITEM_ERROR = "apex-page-item-error",
        C_FORM_ERROR = "a-Form-error";

    var A_DESCRIBEDBY = "aria-describedby",
        A_INVALID = "aria-invalid";

    var D_OLD_A_DESCRIBEDBY = "data-old-aria-describedby";

    // Globals
    var gTemplates = {},
        gErrors = [],
        gCheckVisibilityFunctions = [],
        gThemeHooks = {
            beforeShow: null,
            beforeHide: null,
            closeNotificationSelector: "button.t-Button--closeAlert"
        };

    /**
     * Message type constants
     * @member {object} TYPE
     * @memberof apex.message
     * @property {string} TYPE.SUCCESS Success message Value "success".
     * @property {string} TYPE.ERROR Error message Value "error".
     */
    message.TYPE = {
        SUCCESS: "success",
        ERROR: "error"
    };

    /**
     * *** FOR INTERNAL USE ONLY ***
     *
     * Register templates with the page, that will be used by the APIs to display errors. Adds to existing templates
     * registered, if you want to clear the templates, first call clearTemplates().
     *
     * @ignore
     * @function registerTemplates
     * @memberof apex.message
     * @param {Array | Object} pTemplates Can be either an array or object, in the following formats:
     *   - Array of objects, where the object contains a 'markup' property with the template markup, and an 'ids'
     *     property with a comma separated list of all the template, or sub-template IDs that use this markup. This is
     *     the format used by our engine to emit the template information.
     *     [
     *         {
     *             "markup":"<span>...</span>",
     *             "ids":"480863097675702239_S,480863952955702254_S"
     *         },...
     *     ]
     *  - A plain object where the property is the template Identifier and the value is the markup:
     *  {
     *     "480866225768702257_E": "<span>...</span>",
     *     "480863097675702239_S": "<span>...</span>"
     *  }
     */
    message.registerTemplates = function( pTemplates ) {
        var i, j, lIDArray, lTemplate;

        if ( $.isPlainObject( pTemplates ) ) {
            gTemplates = $.extend( gTemplates, pTemplates );
        } else {
            for ( i = 0; i < pTemplates.length; i++ ) {
                lIDArray = pTemplates[ i ].ids.split( "," );

                // Loop through ID array and register each template reference by calling this API
                for ( j = 0; j < lIDArray.length; j++ ) {
                    lTemplate = {};
                    lTemplate[ lIDArray[ j ] ] = pTemplates[ i ].markup;
                    message.registerTemplates( lTemplate );
                }

            }
        }

    };


    /**
     * *** FOR INTERNAL USE ONLY ***
     *
     * Clears the current templates registered with the page.
     *
     * @ignore
     * @function clearTemplates
     * @memberof apex.message
     */
    message.clearTemplates = function() {
        gTemplates = {};
    };

    /**
     * *** FOR INTERNAL USE ONLY ***
     *
     * Returns all the templates registered
     *
     * @ignore
     * @function getTemplates
     * @memberof apex.message
     */
    message.getTemplates = function() {
        return gTemplates;
    };


    /**
     * Allows a theme to influence some behavior offered by the apex.message API. Call this function from theme page
     * initialization code.
     *
     * @function setThemeHooks
     * @memberOf apex.message
     * @param {Object} pOptions An object that contains the following properties:
     * @param {function} pOptions.beforeShow Callback function that will be called prior to the default show
     *     page notification functionality. Optionally return false from the callback to completely override default
     *     show functionality.  Callback passes the following parameters:
     *     <ul>
     *         <li>pMsgType: Identifies the message type. Use {@link apex.message.TYPE} to identify whether showing an error or success message.</li>
     *         <li>pElement$: jQuery object containing the element being shown.</li>
     *     </ul>
     * @param {function} pOptions.beforeHide Callback function that will be called prior to the default hide
     *     page notification functionality. Optionally return false from the callback to completely override default
     *     hide functionality.  Callback passes the following parameters:
     *     <ul>
     *         <li>pMsgType: Identifies the message type. Use {@link apex.message.TYPE} to identify whether showing an error or success message.</li>
     *         <li>pElement$: jQuery object containing the element being hidden.</li>
     *     </ul>
     * @param {string} pOptions.closeNotificationSelector jQuery selector to identify the close buttons in notifications,
     *     defaults to that used by Universal Theme (“button.t-Button—closeAlert”). May be required by custom themes if
     *     you still want to have APEX handle the hide logic, and where messaging contains a close notification button
     *     with a different class.
     *
     * @example <caption>The following example shows beforeShow and beforeHide callbacks defined, that add and remove an
     * additional class ‘animate-msg’ on the notification element, before the default show and hide logic. This will only
     * happen for success messages because of the check on pMsgType.<br/>
     * Note: The callbacks do not return anything, therefore the default show / hide behavior will happen after the
     * callback.</caption>
     * apex.message.setThemeHooks({
     *     beforeShow: function( pMsgType, pElement$ ){
     *         if ( pMsgType === apex.message.TYPE.SUCCESS ) {
     *             pElement$.addClass( "animate-msg" );
     *         }
     *     },
     *     beforeHide: function( pMsgType, pElement$ ){
     *         if ( pMsgType === apex.message.TYPE.SUCCESS ) {
     *             pElement$.removeClass( "animate-msg" );
     *         }
     *     }
     * });
     */
    message.setThemeHooks = function( pOptions ) {
        gThemeHooks = $.extend( gThemeHooks, pOptions );
    };


    /**
     * <p>This function displays all errors on the apex.message error stack. If you do not want to add to the stack,
     * you must first call clearErrors(). Errors will display using the current app’s theme’s templates. For page level
     * messages (where location = “page”), error messages use markup from the page template’s ‘Subtemplate > Notification’
     * attribute. For item level messages (where location = “inline”), error messages use markup from the item’s
     * label template’s ‘Error Display > Error Template’ attribute.</p>
     * <p>Note Theme Developers should bear in mind the following:
     * <ul>
     *     <li>To display errors for a theme correctly, it must define both of the template attributes described above.
     *     In addition, for inline errors the label template must reference the #ERROR_TEMPLATE# substitution string in
     *     either the ‘Before Item’ or ‘After Item’ attributes of your label templates.</li>
     *     <li>As a theme developer, you can influence or override what happens when showing page level errors. For more
     *     information, please refer to {@link apex.message.setThemeHooks}, (specifically the beforeShow
     *     callback function, where you would need to check for ‘pMsgType === apex.message.TYPE.ERROR’ to isolate when
     *     showing page level errors).</li>
     * </ul>
     *
     * @function showErrors
     * @memberOf apex.message
     * @param {Object|Object[]} pErrors An object, or array of objects with the following properties:
     * @param {string} pErrors.type Must pass “error”, although may support different notification types in the future.
     * @param {string|string[]} pErrors.location Possible values are: “inline”, “page” or [ “inline”, “page” ].
     * @param {string} pErrors.pageItem Item reference where an ‘inline’ error should display.
     *     Required when location = “inline”.
     * @param {string} pErrors.message The error message.
     * @param {boolean} [pErrors.unsafe=true] Pass true so that the message will be escaped by showErrors. Pass false if the
     *     message is already escaped and does not need to be escaped by showErrors.
     *
     * @example <caption>In this example, we have 2 new errors to display. We do not want to add to any existing errors
     * that may be displayed, so we first clear any errors. Because we are displaying 2 errors, we pass an array containing
     * 2 error objects. The first error states ‘Name is required!’, and will display at both ‘page’ level, and ‘inline’
     * with the item ‘P1_ENAME’. The message text is considered safe and therefore will not be escaped. The second error
     * states ‘Page error has occurred!’, and will just display at page level, and the message text is considered safe
     * and therefore will not be escaped.</caption>
     * // First clear the errors
     * apex.message.clearErrors();
     *
     * // Now show new errors
     * apex.message.showErrors([
     *     {
     *         type:       "error",
     *         location:   [ "page", "inline" ],
     *         pageItem:   "P1_ENAME",
     *         message:    "Name is required!",
     *         unsafe:     false
     *     },
     *     {
     *         type:       "error",
     *         location:   "page",
     *         message:    "Page error has occurred!",
     *         unsafe:     false
     *     }
     * ]);
     */
    message.showErrors = function( pErrors ) {
        var i, j, lError, lLocation,
            lErrors = ( $.isPlainObject( pErrors ) ? [ pErrors ] : pErrors ),
            lPageErrors = [],
            lSuccessMessagePlaceholder$ = $( "#APEX_SUCCESS_MESSAGE" );

        // Add to existing stack
        for ( i = 0; i < lErrors.length; i++ ) {
            gErrors.push( lErrors[ i ] );
        }

        for ( j = 0; j < gErrors.length; j++ ) {
            lError = gErrors[ j ];
            lLocation = ( typeof lError.location === "string" ? [ lError.location ] : lError.location );

            if ( $.inArray( INLINE, lLocation ) > -1 && lError.pageItem ) {
                _showPageItemError( lError );
            }
            if ( $.inArray( PAGE, lLocation ) > -1 ) {
                lPageErrors.push( lError );
            }
        }

        if ( lPageErrors.length > 0 ) {
            _showPageErrors( lPageErrors );
            // todo for accessibility I think we need to focus either the notification area or the first error message in the notification area
        }

        // Hide success
        lSuccessMessagePlaceholder$
            .removeClass( C_VISIBLE )
            .addClass( C_HIDDEN );

    };


    /* todo For clearErrors, pItemId is intentionally omitted from JSDoc as it doesn't yet work. Add this when it does:
     *     @param {string} pItemId Item identifier which if passed clears a specific item error
     */

    /**
     * This function clears all the errors currently displayed on the page.
     *
     * @function clearErrors
     * @memberOf apex.message
     * @example <caption>The following example demonstrates clearing all the errors currently displayed on the page.</caption>
     * apex.message.clearErrors();
     */
    message.clearErrors = function( pItemId ) {
        var i, lError, lItemErrors$, lLocation,
            lDoDefaultHide = true,
            lErrorMessagePlaceholder$ = $( "#APEX_ERROR_MESSAGE" );

        // Resets an items's focusable element to it's original state (this is modified in _showPageItemError)
        function resetItem( pItemId ) {
            var lItem$ = _getItemsFocusableElement( pItemId ),
                lOldAriaDescribedBy = lItem$.attr( D_OLD_A_DESCRIBEDBY );

            // If the item previously had aria-describedby, then we handle the clear slightly differently
            if ( lOldAriaDescribedBy ) {
                lItem$
                    .attr( A_DESCRIBEDBY, lOldAriaDescribedBy )
                    .removeAttr( A_INVALID + " " + D_OLD_A_DESCRIBEDBY )
                    .removeClass( C_ITEM_ERROR );
            } else {
                lItem$
                    .removeAttr( A_INVALID + " " + A_DESCRIBEDBY )
                    .removeClass( C_ITEM_ERROR );
            }
        }

        if ( pItemId ) {

            resetItem( pItemId );

            lItemErrors$ = $( "#" + pItemId + "_error_placeholder." + C_FORM_ERROR );

            // todo remove the specific error from page errors, if last error remove entire notification, decrement 'x' errors have occurred

        } else {

            // Loop through errors and find inline item errors...
            for ( i = 0; i < gErrors.length; i++ ) {
                lError = gErrors[ i ];
                lLocation = ( typeof lError.location === "string" ? [ lError.location ] : lError.location );

                if ( $.inArray( INLINE, lLocation ) > -1 && lError.pageItem ) {
                    resetItem( lError.pageItem );
                }
            }

            lItemErrors$ = $( "span." + C_FORM_ERROR );

            // If a theme has registered a beforeHide callback, then call it here
            if ( gThemeHooks.beforeHide ) {
                lDoDefaultHide = gThemeHooks.beforeHide( message.TYPE.ERROR, lErrorMessagePlaceholder$ );
            }

            // Theme's beforeHide has the ability to do it's own hiding, in which case it will return false and we know not to.
            // If beforeHide either returns true, or nothing (undefined), then we continue with our hiding
            if ( lDoDefaultHide === undefined || lDoDefaultHide ) {

                // Hide page error placeholder and reset back to sub-template default
                lErrorMessagePlaceholder$
                    .removeClass( C_VISIBLE )
                    .addClass( C_HIDDEN )
                    .html( "" );
            }

        }

        // Clear all form error span's and hide them
        lItemErrors$
            .html( "" )
            .removeClass( C_VISIBLE )
            .addClass( C_HIDDEN );

        // Clear the stack
        gErrors = [];

    };


    /**
     * Displays a page-level success message. This will clear any previous success messages displayed, and also assumes
     * there are no errors, so will clear any errors previously displayed. Success messages will display using the
     * current app’s theme’s template. Specifically for page success messages, the markup from the page template’s
     * ‘Subtemplate > Success Message’ attribute will be used.
     *
     * Tip: As a theme developer, you can influence or override what happens when showing a page-level success message.
     * For more information, please refer to the apex.message.setThemeHooks function (specifically the beforeShow
     * callback function, where you would need to check for ‘pMsgType === apex.message.TYPE.SUCCESS’ to isolate when
     * showing a page-level success message).
     *
     * Tip: As a theme developer, you can influence or override what happens when showing a page-level success message.
     * For more information, please refer to the apex.message.setThemeHooks function (specifically the beforeShow
     * callback function, where you would need to check for ‘pMsgType === apex.message.TYPE.SUCCESS’ to isolate when
     * showing a page-level success message).
     *
     * @param {String} pMessage The success message to display.
     *
     * @example
     * // Displays a page-level success message ‘Changes saved!’.
     * apex.message.showPageSuccess( "Changes saved!" );
     *
     * @function showPageSuccess
     * @memberOf apex.message
     */
    message.showPageSuccess = function( pMessage ) {
        var lDoDefaultShow = true,
            lSuccessMessagePlaceholder$ = $( "#APEX_SUCCESS_MESSAGE" ),
            lTemplateData = {
                placeholders: {
                    SUCCESS_MESSAGE:            pMessage,
                    CLOSE_NOTIFICATION:         lang.getMessage( "APEX.CLOSE_NOTIFICATION" ),
                    SUCCESS_MESSAGE_HEADING:    lang.getMessage( "APEX.SUCCESS_MESSAGE_HEADING" ),
                    IMAGE_PREFIX:               window.apex_img_dir || ""
                }
            };

        // Clear the errors
        message.clearErrors();

        // Substitute template strings and copy that to the success placeholder tag, then show it
        lSuccessMessagePlaceholder$.html( util.applyTemplate( gTemplates[ lSuccessMessagePlaceholder$.data( TEMPLATE_ID ) ], lTemplateData ) );

        // If a theme has registered a beforeShow callback, then call it here
        if ( gThemeHooks.beforeShow ) {
            lDoDefaultShow = gThemeHooks.beforeShow( message.TYPE.SUCCESS, lSuccessMessagePlaceholder$ );
        }

        // Theme's beforeShow has the ability to do it's own showing, in which case it will return false and we know not to.
        // If beforeShow either returns true, or nothing (undefined), then we continue with our showing
        if ( lDoDefaultShow === undefined || lDoDefaultShow ) {
            lSuccessMessagePlaceholder$
                .removeClass( C_HIDDEN )
                .addClass( C_VISIBLE );
        }

    };

    /**
     * Hides the page-level success message.
     *
     * Tip: As a theme developer, you can influence or override what happens when hiding a page-level success message.
     * For more information, please refer to the apex.message.setThemeHooks function (specifically the beforeHide
     * callback function, where you would need to check for ‘pMsgType === apex.message.TYPE.SUCCESS’ to isolate when
     * hiding a page-level success message).
     *
     * @example
     * // Hides the page-level success message.
     * apex.message.hidePageSuccess();
     *
     * @function hidePageSuccess
     * @memberOf apex.message
     */
    message.hidePageSuccess = function() {
        var lDoDefaultHide = true,
            lSuccessMessagePlaceholder$ = $( "#APEX_SUCCESS_MESSAGE" );

        // If a theme has registered a beforeHide callback, then call it here
        if ( gThemeHooks.beforeHide ) {
            lDoDefaultHide = gThemeHooks.beforeHide( message.TYPE.SUCCESS, lSuccessMessagePlaceholder$ );
        }

        // Theme's beforeHide has the ability to do it's own hiding, in which case it will return false and we know not to.
        // If beforeHide either returns true, or nothing (undefined), then we continue with our hiding
        if ( lDoDefaultHide === undefined || lDoDefaultHide ) {
            lSuccessMessagePlaceholder$
                .removeClass( C_VISIBLE )
                .addClass( C_HIDDEN );
        }

    };


    /**
     * Displays a confirmation dialog with the given message and OK and Cancel buttons. The callback function passed as
     * the pCallback parameter is called when the dialog is closed, and passes true if OK was pressed and false
     * otherwise. The dialog displays using the jQuery UI ‘Dialog’ widget.
     *
     * There are some differences between this function and a browser’s built-in confirm function:
     * - The dialog style will be consistent with the rest of the app.
     * - The dialog can be moved.
     * - The call to apex.message.confirm does not block, and does not return true or false. Any code defined following
     *   the call to apex.message.confirm will run before the user presses OK or Cancel. Therefore acting on the user’s
     *   choice must be done from within the callback, as shown in the example.
     *
     * Note: If either of the following 2 pre-requisites are not met, the function falls back to using the browser’s
     * built-in confirm: 
     * - jQuery UI dialog widget code must be loaded on the page.
     * - The browser must be running in ‘Standards’ mode. This is because if it is running in ‘Quirks’ mode (as is the
     *   case with some older themes), this can cause issues with display position, where the dialog positions itself in
     *   the vertical center of the page, rather than the center of the visible viewport.
     *
     * @param {string} pMessage     The message to display in the confirmation dialog
     * @param {function} pCallback  Callback function called when dialog is closed. Function passes the following
     *                              parameter:
     *                              - okPressed: True if OK was pressed, False otherwise (if Cancel pressed, or the
     *                                           dialog was closed by some other means).
     *
     * @example
     * // Displays a confirmation message ‘Are you sure?’, and if OK is pressed executes the ‘deleteIt()’ function.
     * apex.message.confirm( "Are you sure?", function( okPressed ) {
     *     if( okPressed ) {
     *         deleteIt();
     *     }
     * });
     *
     * @function confirm
     * @memberOf apex.message
     */
    message.confirm = function( pMessage, pCallback ) {
        var result;

        if ( $.ui.dialog && document.compatMode === "CSS1Compat" ) {        // check for standards mode
            showDialog( pMessage, true, {
                callback: pCallback
            } );
        } else {
            result = confirm( pMessage );
            pCallback( result );
        }
    };


    /**
     * Displays an alert dialog with the given message and OK button. The callback function passed as the pCallback
     * parameter is called when the dialog is closed. The dialog displays using the jQuery UI ‘Dialog’ widget.
     *
     * There are some differences between this function and a browser’s built-in alert function:
     * - The dialog style will be consistent with the rest of the app.
     * - The dialog can be moved.
     * - The call to apex.message.alert does not block. Any code defined following the call to apex.message.alert will
     *   run before the user presses OK. Therefore code to run after the user closes the dialog must be done from within
     *   the callback, as shown in the example.
     *
     * Note: If either of the following 2 pre-requisites are not met, the function falls back to using the browser’s
     * built-in confirm: 
     * - jQuery UI dialog widget code must be loaded on the page.
     * - The browser must be running in ‘Standards’ mode. This is because if it is running in ‘Quirks’ mode (as is the
     *   case with some older themes), this can cause issues with display position, where the dialog positions itself in
     *   the vertical center of the page, rather than the center of the visible viewport.
     *
     * @param {String} pMessage     The message to display in the alert dialog
     * @param {Function} pCallback  Callback function called when dialog is closed.
     *
     * @example
     * // Displays an alert ‘Load complete.’, then after the dialog closes executes the ‘afterLoad()’ function.
     * apex.message.alert( "Load complete.", function(){
     *     afterLoad();
     * });
     *
     * @function alert
     * @memberOf apex.message
     */
    message.alert = function( pMessage, pCallback ) {
        if ( $.ui.dialog && document.compatMode === "CSS1Compat" ) {        // check for standards mode
            showDialog( pMessage, false, {
                callback: pCallback
            } );
        } else {
            alert( pMessage );
            if ( pCallback ) {
                pCallback();
            }
        }
    };

    /**
     * In order to navigate to items (page items or column items) that have an error (or anything else that can be in an
     * error state), the error item must be visible before it is focused. Any region type that can possibly hide its
     * contents should add a visibility check function using this method. Each function added is called for any region
     * or item that needs to be made visible. This function is for APEX region plug-in developers.
     *
     * @param (Function) pFunction  A function that is called with an element ID. The function should ensure that the
     *                              element is visible if the element is managed or controlled by the region type that
     *                              added the function.
     *
     * @example
     * // For example let’s assume we have a Region plug-in type called ‘Expander’, that can show or hide its contents
     * // and can contain page items. For purposes of example, this plug-in adds an ’t-Expander’ class to its region
     * // element and also has an ‘expand’ method available, to expand its contents. This region should register a
     * // visibility check function as follows:
     * apex.message.addVisibilityCheck( function( id ) {
     *     var lExpander$ = $( "#" + id ).closest( "t-Expander" );
     *
     *     // Check if parent element of the element passed is an 'expander' region
     *     if ( lExpander$.hasClass( "t-Expander" ) ) {
     *
     *         // If so, expander region must show its contents
     *         lExpander$.expander( "expand" );
     *     }
     * });
     *
     * @function addVisibilityCheck
     * @memberOf apex.message
     */
    message.addVisibilityCheck = function( pFunction ) {
        gCheckVisibilityFunctions.push( pFunction );
    };

    /*
     * Private methods
     */
    function showDialog( message, confirm, options ) {
        var dialog$,
            jQuery = util.getTopApex().jQuery, // make sure dialog is opened in top level page
            result = null,
            buttons = [
                {
                    id: "apexConfirmBtn",
                    text: lang.getMessage( options.okLabelKey || "APEX.DIALOG.OK" ),
                    click: function() {
                        result = true;
                        jQuery( this ).dialog( "close" );
                    }
                }
            ];

        if ( options.dialogClass === undefined ) {
            options.dialogClass = "ui-dialog--notification";
        }
        if ( typeof message === "string" ) {
            dialog$ = jQuery( "<div><p>" + util.escapeHTML( message ).replace(/\r\n|\n/g,"<br>") + "</p></div>" );
        } else {
            dialog$ = message;
        }

        if ( confirm ) {
            buttons.unshift( {
                text: lang.getMessage( "APEX.DIALOG.CANCEL" ),
                click: function() {
                    result = false;
                    jQuery( this ).dialog( "close" );
                }
            } );
        }

        if ( options.extraButtons ) {
            options.extraButtons.forEach( function( b ) {
                buttons.unshift( b );
            } );
        }

        jQuery( "body" ).append( dialog$ );
        dialog$.dialog( {
            closeText: lang.getMessage( "APEX.DIALOG.CLOSE" ),
            autoOpen: true,
            modal: true,
            dialogClass: options.dialogClass,
            draggable: true,
            resizable: false,
            title: options.title || "",                // dialog mirrors browser-based alerts / confirms, where there is no title
            closeOnEscape: true,
            create: function() {
                jQuery( this ).closest( ".ui-dialog" )
                    .css( "position", "fixed" )         // don't scroll the dialog with the page
                    .attr( "role", "alertdialog" );     /* make an alert dialog, which is what we want for this type of alert,
                                                           such that the user is interrupted and alerted to the message. This
                                                           overwrites default role of 'dialog' */

                // make OK button hot
                jQuery( "#apexConfirmBtn" ).addClass( "ui-button--hot" );
            },
            open: function() {
                apex.navigation.beginFreezeScroll();

                if ( options.focus ) {
                    options.focus();
                } else {
                    /* Set focus to confirm button, which mirrors browser-based alerts. The dialog is automatically read by
                       screen readers by virtue of the aria-describedby pointing to the dialog contents. */
                    jQuery( "#apexConfirmBtn" ).focus();
                }
            },
            beforeClose: options.beforeClose,
            close: function() {
                apex.navigation.endFreezeScroll();
                dialog$.remove();
                if ( result === null ) {
                    result = false;
                }
                if ( options.callback ) {
                    if ( confirm ) {
                        options.callback( result );
                    } else {
                        options.callback();
                    }
                }
            },
            buttons: buttons
        } );
        if ( options.defaultButton ) {
            // Pressing enter in any text field will activate the default (hot) button
            dialog$.on( "keydown", function( event ) {
                if ( event.which === 13 && event.target.nodeName === "INPUT" ) {
                    jQuery( "#apexConfirmBtn" ).click();
                    event.preventDefault();
                }
            })
        }
    }

    /**
     * Internal use only
     * @ignore
     */
    message.showDialog = showDialog;

    function insertPlaceholder( pageItemId, itemElement$ ) {
        var parent$ = itemElement$.closest( "fieldset" ).parent();

        if ( !parent$.length ) {
            parent$ = itemElement$.parent();
        }
        return $( "<div id='" + pageItemId +"_error_placeholder' data-template-id='FALLBACK_ET' class='u-hidden'></div>" ).appendTo( parent$ );
    }

    // Gets an items focusable element by using the setFocusTo callback value if defined, if not just uses the element
    // with an ID set to the item name.
    // todo consider extending item API to return this element, as currently this code is duplicated with that performed
    // in item.js setFocus handling.
    function _getItemsFocusableElement( pItem ) {
        var lItemsFocusableElement$,
            lApexItem = apex.item( pItem );

        if ( lApexItem.callbacks && lApexItem.callbacks.setFocusTo ) {
            if ( $.isFunction( lApexItem.callbacks.setFocusTo ) ) {
                lItemsFocusableElement$ = lApexItem.callbacks.setFocusTo.call ( lApexItem );
            } else {

                lItemsFocusableElement$ = $( lApexItem.callbacks.setFocusTo );
            }
        } else {
            lItemsFocusableElement$ = $( "#" + util.escapeCSS( pItem ) );
        }

        return lItemsFocusableElement$;
    }

    // Function to show inline page item errors
    function _showPageItemError( pError ) {
        var lAttributes = {}, lTemplateData = {},
            lErrorElementId = util.escapeCSS( pError.pageItem ) + "_error",
            lFocusableElement$ = _getItemsFocusableElement( pError.pageItem ),
            lErrorPlaceholder$ = $( "#" + util.escapeCSS( pError.pageItem ) + "_error_placeholder" ),
            lCurrentAriaDescribedBy = lFocusableElement$.attr( A_DESCRIBEDBY ),
            lErrorMsg = util.htmlBuilder();

        if ( !lErrorPlaceholder$.length ) {

            // any new theme should have an error placeholder. If we don't find one then it may be a legacy theme
            // or 3rd party or custom theme not yet updated to this new way so insert a placeholder.
            // The better solution is to update the theme template to include the new
            // error placeholder markup. The fallback logic cannot know exactly where it is best to include the
            // inline message. Better to show something in the wrong place than to show nothing at all.
            lErrorPlaceholder$ = insertPlaceholder( pError.pageItem, lFocusableElement$ );

            // Make sure there is a fallback template to use.
            if ( !gTemplates[FALLBACK_TEMPLATE] ) {
                gTemplates[FALLBACK_TEMPLATE] = "<div class='t-Form-error'>#ERROR_MESSAGE#</div>";
            }
        }

        // Wrap message with DIV with known ID (mirroring wwv_flow_error.prepare_inline_error_output), which is used by
        // the item to provide an accessible error message
        lErrorMsg.markup( "<div" )
            .attr( "id", lErrorElementId )
            .markup( ">" )
            .content( pError.message )
            .markup( "</div>" );

        lTemplateData.placeholders = {
            ERROR_MESSAGE: lErrorMsg.toString()
        };

        // Copy sub-template to placeholder
        lErrorPlaceholder$.html( gTemplates[ lErrorPlaceholder$.data( TEMPLATE_ID ) ] );

        lErrorPlaceholder$
            .html( util.applyTemplate( lErrorPlaceholder$.html(), lTemplateData ) )
            .removeClass( C_HIDDEN )
            .addClass( C_VISIBLE );

        // Item's focusable element needs some modification
        if ( lCurrentAriaDescribedBy ) {

            // Retain whatever may be defined in the item's aria-describedby (for example inline help)
            lAttributes[ D_OLD_A_DESCRIBEDBY ] = lCurrentAriaDescribedBy;

            // Add error ID before described by, as the error should be reported first
            lAttributes[ A_DESCRIBEDBY ] = lErrorElementId + " " + lCurrentAriaDescribedBy;
        } else {

            // If there was no current describedby, just set the error ID
            lAttributes[ A_DESCRIBEDBY ] = lErrorElementId;
        }
        lAttributes[ A_INVALID ] = true;

        // Update item
        lFocusableElement$
            .addClass( C_ITEM_ERROR )
            .attr( lAttributes );

    }

    function _showPageErrors( pErrors ) {
        var i, j, lErrorSummary, lError, lDetail, lTitle, lHasLink,
            out = util.htmlBuilder(),
            lTemplateData = {},
            lDoDefaultShow = true,
            lErrorMessagePlaceholder$ = $( "#APEX_ERROR_MESSAGE" );

        lErrorMessagePlaceholder$.html( gTemplates[ lErrorMessagePlaceholder$.data( TEMPLATE_ID ) ] );

        // Following markup needs to be kept in sync with what is emitted by the server for full page error display (wwv_flow_page.plb)
        out.markup( "<div" )
            .attr( "class", "a-Notification a-Notification--error" )
            .markup( ">" );

        out.markup( "<h2" )
            .attr( "class", "a-Notification-title aErrMsgTitle" )
            .markup( ">" );

        if( pErrors.length === 1 ) {
            lErrorSummary = lang.getMessage( "FLOW.SINGLE_VALIDATION_ERROR" );
        } else {
            lErrorSummary = lang.formatMessage( "FLOW.VALIDATION_ERROR", pErrors.length );
        }

        out.content( lErrorSummary )
            .markup( "</h2>" );

        out.markup( "<ul" )
            .attr( "class", "a-Notification-list htmldbUlErr" )
            .markup( ">" );

        for( i = 0; i < pErrors.length; i++ ) {
            lError = pErrors[i];

            out.markup( "<li" )
                .attr( "class", "a-Notification-item htmldbStdErr" )
                .markup( ">" );

            // Check if this error supports navigation to a component, currently we support going to items or regions
            lHasLink = ( lError.pageItem || lError.regionStaticId );

            if ( lHasLink ) {
                // Keep list of attribute in sync with click handler code that uses them below
                out.markup( "<a")
                    .attr( "href", "#" )
                    .optionalAttr( "data-region", lError.regionStaticId )
                    .optionalAttr( "data-instance", lError.instance )
                    .optionalAttr( "data-record", lError.recordId )
                    .optionalAttr( "data-column", lError.columnName )
                    .optionalAttr( "data-for", lError.pageItem )
                    .attr( "class", "a-Notification-link" )
                    .markup( ">") ;
            }

            if ( lError.unsafe ) {
                out.content( lError.message );
            } else {
                out.markup( lError.message );
            }

            if ( lHasLink ) {
                out.markup( "</a>" );
            }


            if ( lError.techInfo ) {
                lTitle = lang.getMessage( "APEX.ERROR.TECHNICAL_INFO" );
                out.markup( "<button class='a-Button a-Button--notification js-showDetails' tabindex='-1' type='button'" )
                    .attr( "aria-label", lTitle )
                    .attr( "title", lTitle )
                    .markup( "><span class='a-Icon icon-info' aria-hidden='true'></span></button>" );
                out.markup( "<div class='a-Notification-details' style='display:none'><h2>" )
                    .content( lTitle )
                    .markup( "</h2><ul class='error_technical_info'>" );
                for ( j = 0; j < lError.techInfo.length; j++ ) {
                    lDetail = lError.techInfo[j];
                    out.markup( "<li><span class='a-Notification-detailName'>" )
                        .content( lDetail.name + ": " )
                        .markup( "</span>" );
                    if ( lDetail.usePre ) {
                        out.markup( "<br>" );
                    }
                    out.markup( "<span")
                        .attr( "class", "a-Notification-detailValue" + ( lDetail.usePre ? " a-Notification--pre" : "" ) )
                        .markup( ">" )
                        .content( lDetail.value )
                        .markup( "</span></li>");
                }
                out.markup( "</ul></div>");
            }

            out.markup( "</li>" );
        }

        out.markup( "</ul>" );
        out.markup( "</div>" );

        lTemplateData.placeholders = {
            MESSAGE:                out.toString(),
            CLOSE_NOTIFICATION:     lang.getMessage( "APEX.CLOSE_NOTIFICATION" ),
            ERROR_MESSAGE_HEADING:  lang.getMessage( "APEX.ERROR_MESSAGE_HEADING" ),
            IMAGE_PREFIX:           window.apex_img_dir || ""
        };

        // Substitute template strings
        lErrorMessagePlaceholder$.html( util.applyTemplate( lErrorMessagePlaceholder$.html(), lTemplateData ) );

        // If a theme has registered a beforeShow callback, then call it here
        if ( gThemeHooks.beforeShow ) {
            lDoDefaultShow = gThemeHooks.beforeShow( message.TYPE.ERROR, lErrorMessagePlaceholder$ );
        }

        // Theme's beforeShow has the ability to do it's own showing, in which case it will return false and we know not to.
        // If beforeShow either returns true, or nothing (undefined), then we continue with our showing
        if ( lDoDefaultShow === undefined || lDoDefaultShow ) {
            lErrorMessagePlaceholder$
                .removeClass( C_HIDDEN )
                .addClass( C_VISIBLE );
        }

    }

    function _hidePageErrors() {
        $( "#APEX_ERROR_MESSAGE" )
            .removeClass( C_VISIBLE )
            .addClass( C_HIDDEN );
    }

    /*
     * Document ready logic
     */
    $( function() {
        $( "#APEX_SUCCESS_MESSAGE" ).on( "click", gThemeHooks.closeNotificationSelector, function ( pEvent ) {
            message.hidePageSuccess();
            pEvent.preventDefault();
        });

        $( "#APEX_ERROR_MESSAGE" )
            .on( "click", gThemeHooks.closeNotificationSelector, function( pEvent ) {
                _hidePageErrors();
                pEvent.preventDefault();
            })
            .on( "click", "a.a-Notification-link", function( pEvent ) {
                var lRegion, lRegionId, lItem,
                    lLink$ = $( this ),
                    lErrorContext = {};

                function makeVisible( id ) {
                    var i;

                    for ( i = 0; i < gCheckVisibilityFunctions.length; i++ ) {
                        gCheckVisibilityFunctions[ i ]( id );
                    }
                }

                // don't use lLink$.data() to populate lErrorContext because it turns strings into arrays
                // Keep list of attribute in sync with code that adds them above
                $.each( ["data-region", "data-instance", "data-record", "data-column", "data-for"], function( i, attr ) {
                    var prop = attr.substr( 5 ),
                        value = lLink$.attr( attr );
                    if ( value !== undefined ) {
                        lErrorContext[prop] = value;
                    }
                });
                lItem = lErrorContext[ "for" ];

                if ( lItem ) {
                    // make sure item can be seen if it is collapsed or on a non-active tab
                    makeVisible( lItem );

                    if ( $( '#' + lItem + '_CONTAINER,#' + lItem + '_DISPLAY,#' + lItem, apex.gPageContext$ ).filter( ":visible" ).length === 0 ) {
                        apex.item( lItem ).show();
                    }
                    apex.item( lItem ).setFocus();
                } else if ( lErrorContext.region ) {
                    lRegionId = lErrorContext.region;

                    // make sure region can be seen if it is collapsed or on a non-active tab
                    makeVisible( lRegionId );

                    lRegion = apex.region( lRegionId );
                    if ( lRegion ) {
                        lRegion.gotoError( lErrorContext );
                    }
                }
                pEvent.preventDefault();
            })
            .on( "click", ".js-showDetails", function( pEvent ) {
                var btn$ = $( this ),
                    details$ = btn$.next();

                showDialog( details$, false, {
                    callback: function() {
                        btn$.after( details$ );
                    },
                    dialogClass: "ui-dialog--notificationLarge"
                } );
            })
            .on( "keydown", ".a-Notification-link", function( pEvent ) {
                if ( pEvent.which === 112 && pEvent.altKey ) {
                    $(this ).parent().find( ".js-showDetails" ).click();
                }
            });

    });

})( apex.message, apex.jQuery, apex.util, apex.lang );
