/*
 navigation.js
 Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*global apex,$v,window*/
/**
 * @since 5.0
 * @desc
 * <p>The apex.navigation namespace is used to store popup and redirect related functions of Oracle Application Express.</p>
 */
/**
 * This namespace contains functions related to dialog, popup, and redirect functionality of Oracle Application Express.
 * @namespace
 */
apex.navigation = {};

(function( navigation, util, $, undefined ) {
    "use strict";

    var DIALOG_DIV_ID        = 'apex_dialog_',
        INTERNAL_CLOSE_EVENT = "apexclosedialoginternal";

    /**
     * <p>Opens the specified page (pWhere) in the current window.</p>
     * <p>For mobile UI, when the <code class="prettyprint">pWhere</code> URL specifies a page in the same application, the
     * page is loaded using Ajax by default.</p>
     *
     * @function redirect
     * @memberOf apex.navigation
     * @param {string} pWhere The URL of the page to open.
     *
     * @example <caption>This example demonstrates a call to redirect to page 3 within the current application,
     * in the current session, with debugging set to <code class="prettyprint">NO</code> and
     * setting <code class="prettyprint">RP</code> to reset pagination for an Interactive Report on page 3.
     * The substitution string, <code class="prettyprint">APP_SESSION</code> is substituted on the server with the current session ID.</caption>
     * apex.navigation.redirect ( "f?p=&APP_ID.:3:&APP_SESSION.::NO:RP::" );
     *
     * @example <caption>This example demonstrates a very simple call to redirect to page 1 in application ID 102, in the current session.
     * The substitution string, <code class="prettyprint">APP_SESSION</code> is substituted on the server with the current session ID.</caption>
     * apex.navigation.redirect ( "f?p=102:1:&APP_SESSION.:::::" );
     *
     * @example <caption>This example demonstrates a call to redirect to page 3 within the current application, <code class="prettyprint">$v( "pFlowId" )</code>
     * in the current session, <code class="prettyprint">$v("pInstance")</code>, which is processed on the client.
     * This example demonstrates calling this function from within a JavaScript file.</caption>
     * apex.navigation.redirect( "f?p=" + $v( "pFlowId" ) + ":3:" + $v( "pInstance" ) );
     *
     * @example <caption>This example demonstrates a call to redirect to a URL defined in a page item, <code class="prettyprint">P1_URL"</code>.</caption>
     * apex.navigation.redirect( apex.item("P1_URL").getValue() );
     */
    navigation.redirect = function ( pWhere ) {

        // if this is a mobile app and the URL is to a page in this application and ajax is not explicitly not to be used
        if ( $.mobile && pWhere.substring( 0, pWhere.indexOf( ":" )) === "f?p=" + $v( "pFlowId" ) && pWhere.indexOf( "," ) < 0 ) {
            $( ":mobile-pagecontainer" ).pagecontainer( "change", pWhere, { reload: true });
        } else {
            location.href = pWhere;
        }
    };  // navigation.redirect

    /**
     * <p>This namespace contains functions related to a popup window opened with {@link apex.navigation.fn:popup|apex.navigation.popup}.</p>
     *
     * @namespace apex.navigation.popup
     */

    /**
     * <p>Opens the given URL in a new typically named popup window. If a window with that name already exists, it is reused.
     * If no name is given or the name is "_blank" then a new unnamed popup window is opened. The names "_self", "_parent"
     * and "_top" should not be used. The window name is made unique so that it cannot be shared with other apps.</p>
     *
     * <p>Every effort is made to focus the window. The intention is that the window will be a popup window
     * and not a tab. The default window features are such that most browsers should open a new window.</p>
     *
     * <p class="important">Note: To avoid being suppressed by a popup blocker, call this from a click event handler on a link or a button.</p>
     *
     * @function fn:popup
     * @memberof apex.navigation
     * @param {Object} pOptions An object with the following optional properties:
     * @param {string} [pOptions.url] The page URL to open in the window. The default is "about:blank".
     * @param {string} [pOptions.name] The name of the window. The default is "_blank", which opens a new unnamed window.
     * @param {number} [pOptions.height] The height of window content area in pixels. The default is 600.
     * @param {number} [pOptions.width] The width of window content area in pixels. The default is 600.
     * @param {string} [pOptions.scroll] "yes" or "no". The default is "no".
     * @param {string} [pOptions.resizeable] "yes" or "no". The default is "yes".
     * @param {string} [pOptions.toolbar]  "yes" or "no". The default is "no".
     * @param {string} [pOptions.location] "yes" or "no". The default is "no".
     * @param {string} [pOptions.statusbar] "yes" or "no". The default is "no". This controls the status feature.
     * @param {string} [pOptions.menubar] "yes" or "no". The default is "no".
     *
     * @returns {Object|null} The window object of named window or null, if window was not opened.
     * @example <caption>This example demonstrates a very simple call to open an unnamed popup window.
     * The new window can be accessed from variable <code class="prettyprint">myPopupWindow</code>.
     * It is best to supply the url, name and possibly the height and width; all other parameters will have their default value.</caption>
     * var myPopupWindow = apex.navigation.popup (
     *     {
     *         url:    "about:blank",
     *         name:   "_blank",
     *         width:  400,
     *         height: 400
     *     }
     *     );
     *
     * @example <caption>This example demonstrates a call to open the url in a named popup window, "Information".
     * The new window can be accessed from variable <code class="prettyprint">myPopupWindow</code>.
     * Some additional parameters are also set in the call, to control scrolling, resizing and the visibility of a toolbar.
     * The variable <code class="prettyprint">myTriggeringElement</code> is used to define the triggering element of the popup,
     * a button named <code class="prettyprint">myButton</code>. Using a call to {@link apex.navigation.dialog.registerCloseHandler},
     * a new handler can be defined, to associate the close action of the dialog with the button.</caption>
     *
     * var myTriggeringElement,
     *     myPopupWindow;
     *
     * myTriggeringElement = apex.jQuery( '#myButton' );
     *
     * myPopupWindow = apex.navigation.popup ( {
     *     url:       "f?p=102:2:&APP_SESSION.:::2::",
     *     name:      "Information",
     *     scroll:    "no",
     *     resizable: "no",
     *     toolbar:   "yes"
     * } );
     *
     * navigation.dialog.registerCloseHandler( {
     *     handler$:           myTriggeringElement,
     *     dialog:             myPopupWindow,
     *     triggeringElement$: myTriggeringElement,
     *     closeFunction:      function() {
     *         myPopupWindow.close();
     *     }
     * });
     *
     */
    navigation.popup = function ( pOptions ) {
        var // Initialize default parameter values
            lOptions = $.extend({
                    url:       "about:blank",
                    name:      "_blank",
                    width:     600,        //min value 100
                    height:    600,        //min value 100
                    scroll:    "yes",
                    resizable: "yes",
                    toolbar:   "no",
                    location:  "no",
                    statusbar: "no",
                    menubar:   "no" },
                pOptions ),
            // Open the new window with those parameters
            lWindow = window.open(
                lOptions.url,
                // force name to be a string in case some misguided callers pass in a number
                ( lOptions.name + "" ).toLowerCase() === "_blank" ? lOptions.name : lOptions.name + "_" + $v( "pInstance" ),
                "toolbar="      + lOptions.toolbar      + "," +
                "scrollbars="   + lOptions.scroll       + "," +
                "location="     + lOptions.location     + "," +
                "status="       + lOptions.statusbar    + "," +
                "menubar="      + lOptions.menubar      + "," +
                "resizable="    + lOptions.resizable    + "," +
                "width="        + lOptions.width        + "," +
                "height="       + lOptions.height
            );

        if ( lWindow ) {
            if ( lWindow.opener === null ) {
                lWindow.opener = window.self;
            }
            lWindow.focus();
        }
        return lWindow;
    }; // navigation.popup

    /**
     * <p>Opens the given url in a popup window. This is a simplified version of apex.navigation.popup where all the options are fixed.
     * The window name is "winLov" and the height is 600 and width is 800. All other options are defaulted.
     * Due to hard-coded name property value, subsequent new popups launched with this API will replace
     * existing popups, not stack. Use this function when it is appropriate to share the same window
     * as other LOV popups.</p>
     *
     * @ignore
     */
    navigation.popup.url = function ( pURL ) {
        navigation.popup( {
            url:    pURL,
            name:   "winLov",
            width:  800,
            height: 600
        });
    }; // navigation.popup.url

    /**
     * <p>Opens the given URL in a new named window or tab (the browser / browser user preference settings may control
     * if a window or tab is used). If a window with that name already exists it is reused. The names "_self", "_parent"
     * and "_top" should not be used. The window name is made unique so that it cannot be shared with other apps.
     * Every effort is made to then focus the window.</p>
     *
     * <p>Unlike a popup, the new window is intended to be fully functional. This is intended to be as close
     * as you can get to a normal anchor with a target (<code class="prettyprint">&lt;a target="name" href="..."&gt;</code>)
     * behavior from JavaScript but with the feature of focusing the window in all browsers by default.</p>
     *
     * <p>If option <code class="prettyprint">favorTabbedBrowsing</code> is true:
     * For IE and Firefox, the user will need to manually focus the
     * tab (assuming the browser is configured to open pages in tabs).</p>
     *
     * <p>If option <code class="prettyprint">favorTabbedBrowsing</code> is not true (the default):
     * For IE and Firefox, the page will be opened in a new browser window
     * even if the browser preferences is to open new pages in tabs. But it will very likely be able to focus
     * the new page.</p>
     *
     * <p>Once the named window is open the <code class="prettyprint">favorTabbedBrowsing</code> setting doesn't apply to that window.</p>
     *
     * <p class="important">Note: Firefox and IE will not focus a tab if that tab isn't the currently active tab in its browser window.</p>
     *
     * <p class="important">Note: For Opera the Advanced/content > JavaScript  Options: “Allow raising of windows” must be checked in order for
     * focus to work.</p>
     *
     * <p class="important">Note: To avoid being suppressed by a popup blocker call this from a click event handler on a link or button.</p>
     *
     * @function openInNewWindow
     * @memberOf apex.navigation
     * @param {string} pURL The URL of the page to load.
     * @param {string} [pWindowName] The name of the window. The default is "_blank".
     * @param {Object} [pOptions] Options object with these properties:
     * @param {string} [pOptions.altSuffix] An Alternative suffix to append to <code class="prettyprint">pWindowName</code> to make it unique.
     * @param {boolean} [pOptions.favorTabbedBrowsing] If true, don't try to force a new window for the benefit of being able to focus it.
     *
     * @returns {Object|null} The window object of named window or null, if window was not opened.
     * @example <caption>This example opens the URL in variable <code class="prettyprint">url</code> in a new window.
     * The new window can be accessed from variable <code class="prettyprint">myWindow</code>.</caption>
     * var myWindow = apex.navigation.openInNewWindow( url, "MyWindow" );
     */
    navigation.openInNewWindow = function( pURL, pWindowName, pOptions ) {
        var other, features,
            altSuffix = pOptions ? pOptions.altSuffix || null : null;

        if ( pWindowName === undefined ) {
            pWindowName = "_blank";
        }
        if ( pWindowName.toLowerCase() !== "_blank" ) {
            if ( altSuffix === null ) {
                altSuffix = $v( "pInstance" );
            }
            if ( altSuffix ) {
                pWindowName += "_" + altSuffix;
            }
        }

        // For many browsers omitting the feature string results in the desired behavior (creation if needed, navigation, and focus).
        // This is because they allow a tab in the same window or a different window to receive focus.
        // Note for Opera the Advanced/content > JavaScript  Options: “Allow raising of windows” must be checked.
        // But for Firefox and IE the focusing only works when the named window is in a different browser window.
        // For Firefox if you give all the chrome features but without geometry you get a new normal window.
        // For IE if you take away any of the chrome features such as status you get a new normal window but without that feature.
        // But if you give all the chrome features then it follows the user preference and may create a tab in the same window.
        // So Firefox and IE are at odds. For Firefox we want to use all chrome features but this doesn't work for IE.
        // For IE we want to take away status (strictly speaking this then isn't a "normal" window but it is close enough)
        // but this causes Firefox to create a popup window (read-only URL).
        if ( !pOptions || pOptions.favorTabbedBrowsing !== true ) {
            if ( /(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase() ) ) {
                // if IE
                features = "personalbar,menubar,titlebar,toolbar,location,resizable,scrollbars";
            } else {
                features = "personalbar,menubar,titlebar,toolbar,location,status,resizable,scrollbars";
            }
        }
        // IE can tell the difference between passing undefined for features and not passing it at all so open must be called this way
        if ( features ) {
            other = window.open( pURL, pWindowName, features );
        } else {
            other = window.open( pURL, pWindowName );
        }
        if ( other ) {
            other.focus();
        }
        return other;
    }; // navigation.openInNewWindow

    /**
     * <p>Sets the value of the item in the parent window (pItem) with (pValue), and then closes the popup window.
     * This function should only be called from an Oracle Application Express page that has been opened as a popup window,
     * via a call to {@link apex.navigation.fn:popup|apex.navigation.popup}, where the call to {@link apex.navigation.fn:popup|apex.navigation.popup}
     * is originating from another Oracle Application Express page.</p>
     *
     * @function close
     * @memberOf apex.navigation.popup
     * @param {Element|string} pItem The DOM Element or string id (item name) of the page item to be set with the value of <code class="prettyprint">pValue</code>.
     * @param {string} pValue The value to be save to the page item referenced in <code class="prettyprint">pItem</code>.
     * @example <caption>This example demonstrates a call to close a popup window,
     * setting the page item P3_STATUS to the string "Action Processed".</caption>
     *
     * apex.navigation.popup.close ( "P3_STATUS", "Action Processed." );
     *
     */
    navigation.popup.close = function ( pItem, pValue ) {
        window.opener.$x_Value( pItem, pValue );
        window.close();
    }; // navigation.popup.close

    // the dialog id count needs to be kept in just the top window context
    if ( !util.getTopApex().navigation._gNextDialogId ) {
        util.getTopApex().navigation._gNextDialogId = 1;
    }

    /**
     * <p>This namespace contains functions related to a dialog opened with {@link apex.navigation.fn:dialog|apex.navigation.dialog}.
     * All of the functions in the {@link apex.navigation.fn:dialog|apex.navigation.dialog} namespace need to be run in the context of the specified dialog page.</p>
     *
     * @namespace apex.navigation.dialog
     */
    /**
     * <p>Opens the specified page ( pUrl ) in a dialog.  The <code class="prettyprint">modal</code> option determines if the page is
     * a modal page or a non-modal page.</p>
     *
     * <p>A modal page is loaded in an iframe using jQuery UI dialog widget.  It is an overlay window positioned within the same browser window.
     * When a modal dialog is active, the user is unable to interact with the rest of the page, until the dialog is closed.</p>
     *
     * <p>A non-modal page is loaded in a new window using the {@link apex.navigation.fn:popup|apex.navigation.popup} function.  A user can interact
     * with a non-modal dialog and content on the page.</p>
     *
     * <p class="important">Note: Typically this API call is generated by the server when the page target is a modal page or by using APEX_UTIL.PREPARE_URL.
     * At a minimum the url of the dialog page must be generated on the server so that the correct dialog checksum can be generated.</p>
     *
     * @function fn:dialog
     * @memberof apex.navigation
     * @param {string} pUrl The URL of the page to load as a dialog.
     * @param {Object} pOptions Identifies the attributes of the dialog, such as height, width, maxWidth, title, modal.
     * @param {string} [pOptions.title] The title of the dialog. The default is the name of the page. This option only applies to a modal dialog.
     * @param {number} [pOptions.height] The height of dialog content area, in pixels. The default is 500. This option only applies to a non-modal dialog.
     * @param {number} [pOptions.width] The width of window content area, in pixels. The default is 500. This option only applies to a non-modal dialog.
     * @param {number} [pOptions.maxWidth] The maximum width of window content area, in pixels. The default is 1500.
     * @param {boolean} [pOptions.modal] If true (the default), the url will be opened in a modal dialog.  If false, the url will be opened in a non-modal popup.
     * @param {*} [pOptions.*] Additional options supported by the underlying dialog implementation.
     * For example, to define jQuery UI Dialog attribute <code class="prettyprint">resizable</code>, set to<p>
     * <p> <code class="prettyprint">resizable:true</code></p>
     * See Also : See jQuery UI documentation of Dialog widget for all other available options for a modal dialog. {@link http://api.jqueryui.com/dialog/ }
     * @param {string} pCssClasses Identifies the CSS classes, if any, to be applied to the dialog, and appended on to the dialogClass attribute.
     * @param {string} pTriggeringElement jQuery selector to identify the APEX page element opening the dialog.
     * The code class="prettyprint">apexafterclosedialog</code> event is triggered on this page element.
     *
     * @example <caption>This example demonstrates a call to open a URL in a resizable modal dialog, with a defined height and width.
     * A button with static ID <code class="prettyprint">mybutton_static_id</code> is used to launch the modal dialog. Using an associated Dynamic Action,
     * the click of the button invokes the execution of the following JavaScript code:</caption>
     *
     *     apex.navigation.dialog(
     *         url,
     *         {
     *             title:'Orders',
     *             height:'480',
     *             width:'800',
     *             modal:true,
     *             resizable:true
     *         },
     *         'a-Dialog--uiDialog',
     *         $('#mybutton_static_id') );
     */
    navigation.dialog = function ( pUrl, pOptions, pCssClasses, pTriggeringElement ) {

        var lTriggeringElement$, lDialog$, lDialogId, lPopupWindow, lWindowName, lUserClose, lUserBeforeClose,
            // Initialize default parameter values
            lDefaults = { width:       500,
                maxWidth:    1500,
                height:      500,
                closeText:   apex.lang.getMessage( "APEX.DIALOG.CLOSE" ),
                modal:       true,
                resizable:   false,
                scroll:      "auto",
                closeOnEscape: true,
                dialog:      null, // for internal use
                dialogClass: 'ui-dialog--apex' },
            lOptions  = $.extend( lDefaults, pOptions );

        // Ensure default APEX CSS Class is always used
        if ( pOptions.dialogClass ) {
            lOptions.dialogClass = 'ui-dialog--apex ' + pOptions.dialogClass;
        }
        // Add our close handler after pOptions have been applied
        lUserClose = lOptions.close;
        lOptions.close = function( event, ui ) {
            if ( lUserClose ) {
                lUserClose( event, ui );
            }
            /*
             * Some versions of IE (including 11) do not properly clean up the JavaScript context in an iframe if it is
             * simply removed. This results in our JavaScript running but the standard objects such as Object,
             * Math, Array etc. are gone. The end result is various problems such as exceptions "Object expected"
             * and not being able to type into input elements. The solution is to first set the iframe src attribute
             * to empty string (about:blank) before removing the iframe.
             */
            lDialog$.children( "iframe" ).attr( "src", "" );
            util.getTopApex().jQuery( this ).dialog( "destroy" ).remove();
        };

        // this beforeClose handler is so that we don't get warn on unsaved changes dialogs AFTER the dialog has closed
        lUserBeforeClose = lOptions.beforeClose; // not likely but just in case
        lOptions.beforeClose = function( event, ui ) {
            var dialogApex = $( this ).children( "iframe" )[0].contentWindow.apex;

            if ( lUserBeforeClose ) {
                lUserBeforeClose( event, ui );
            }
            // the dialog content is most likely a normal APEX page but not necessarily, so check
            if ( dialogApex ) {
                // if the dialog is about to close then either the changes are saved/going to be saved or the user canceled
                // make sure no warnings are given
                dialogApex.page.cancelWarnOnUnsavedChanges();
            }
        };

        if ( pCssClasses ){
            lOptions.dialogClass += ' ' + pCssClasses;
        }

        if ( !$.mobile ) {
            //
            // Desktop Dialogs
            //
            lTriggeringElement$ = $( pTriggeringElement, apex.gPageContext$ );

            if ( lOptions.modal ) {
                // Modal Dialog

                // A new modal dialog launches a new jQuery UI Dialog.
                if ( lOptions.dialog === null ) {

                    // Always create dialogs in the context of the top level window. This is necessary because APEX
                    // modal pages use an iframe. If this was not done any nested dialog would be constrained to the iframe.
                    lDialogId = DIALOG_DIV_ID + util.getTopApex().navigation._gNextDialogId;
                    util.getTopApex().navigation._gNextDialogId += 1;
                    lDialog$ = util.getTopApex().jQuery(
                        '<div id="' + lDialogId + '">' +
                        '<iframe src="' + util.escapeHTMLAttr( pUrl ) + '"' +
                        'title="' + util.escapeHTMLAttr( lOptions.title ) + '" width="100%" height="100%" style="min-width: 95%;height:100%;" scrolling="'+ util.escapeHTMLAttr( lOptions.scroll)+'"></iframe></div>' );

                    lDialog$.on( "dialogcreate", function() {
                        // force position to fixed so that dialog doesn't jump when moved
                        $( this ).closest( ".ui-dialog" )
                            .css( "position", "fixed" );
                        //.attr( "aria-modal", true )   // ARIA 1.1 states use this, but currently provides no value

                    }).on( "dialogopen", function() {
                        if ( lOptions.modal ) {
                            // Stop parent page from scrolling while dialog is open
                            util.getTopApex().navigation.beginFreezeScroll();
                        }

                        lDialog$.children( "iframe" ).on("load", function() {
                            // let ESCAPE key typed in nested page close this dialog
                            // don't allow tabbing out of the dialog
                            $(this.contentDocument.body).on("keydown", function(event) {
                                if ( event.which === $.ui.keyCode.ESCAPE && lOptions.closeOnEscape ) {
                                    lDialog$.dialog("close");
                                } else if ( event.which === $.ui.keyCode.TAB ) {
                                    var pageLast = $( this ).find( ":tabbable" ).last(),
                                        first = lDialog$.closest( ".ui-dialog" ).find( ":tabbable" ).first();

                                    // only have to worry about tab forward on last page tab stop; reverse tab works automatically
                                    if ( ( event.target === pageLast[0] ) && !event.shiftKey ) {
                                        setTimeout( function() {
                                            first.focus();
                                        }, 1 );
                                        event.preventDefault();
                                    }
                                }
                            });
                        });
                    } ).on( "dialogclose", function( ) {
                        if ( lOptions.modal ) {
                            // restore normal page scroll behavior once dialog is gone
                            util.getTopApex().navigation.endFreezeScroll();
                        }
                    } ).on( "dialogresize", function( ) {
                        var h = lDialog$.height(),
                            w = lDialog$.width();
                        // we use css to position the dialog fixed but resize sets it to absolute
                        // so fix what resizable broke
                        lDialog$.closest( ".ui-dialog" ).css( "position", "fixed" );
                        // resize iframe so that apex dialog page gets window resize event
                        // use width and height of dialog content rather than ui.size so that dialog title is taken in to consideration
                        lDialog$.children( "iframe" ).width( w ).height( h );
                    } );

                    // Launch modal dialog
                    lDialog$.dialog( lOptions ); // it is destroyed and removed on close

                    // enhance normal dialog tab handling to make it iframe aware
                    lDialog$.closest( ".ui-dialog" ).on( "keydown", function( event ) {
                        if ( event.keyCode !== $.ui.keyCode.TAB ) {
                            return;
                        }
                        var pageTabbables = $( lDialog$.children( "iframe" )[0].contentDocument.body ).find( ":tabbable" ),
                            pageFirst = pageTabbables.filter( ":first" ),
                            pageLast  = pageTabbables.filter( ":last" ),
                            tabbables = $( this ).find( ":tabbable" ),
                            first = tabbables.filter( ":first" ),
                            last  = tabbables.filter( ":last" );

                        if ( ( event.target === last[0] || event.target === lDialog$[0] ) && !event.shiftKey ) {
                            setTimeout( function() {
                                pageFirst.focus();
                            }, 1 );
                            event.preventDefault();
                        } else if ( ( event.target === first[0] || event.target === lDialog$[0] ) && event.shiftKey ) {
                            setTimeout( function() {
                                pageLast.focus();
                            }, 1 );
                            event.preventDefault();
                        }
                    });

                    navigation.dialog.registerCloseHandler({
                        handler$:           lDialog$,
                        dialog:             lDialog$,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function() {
                            lDialog$.dialog("close");
                        }
                    });

                } else {

                    // A chained dialog will reuse the existing jQuery UI dialog with attributes of new dialog
                    // Note that this call will be made in the context of the iframe but the dialog widget is in the
                    // parent context. So don't use $ here, use the dialog itself.
                    lOptions.dialog.dialog( "option", "title", lOptions.title )
                        .children( "iframe" ).attr( "src", pUrl );
                }

            } else {

                // Non-Modal Dialog
                // A new non-modal dialog opens a new popup window using the url, width and height defined.
                if ( lOptions.dialog === null ) {

                    if ( lTriggeringElement$.id === undefined || lTriggeringElement$[ 0 ].id === undefined || lTriggeringElement$[ 0 ].id === "" || !lTriggeringElement$ ){
                        lWindowName = "winDialog";
                    } else {
                        lWindowName = lTriggeringElement$[ 0 ].id;
                    }

                    // Launch new non-modal dialog
                    lPopupWindow = navigation.popup({
                        url:    pUrl,
                        name:   lWindowName, // The window name is the only persistent attribute in the popup
                                             // during navigation. We use it to trigger the closeapexdialogpage event from the popup
                        width:  lOptions.width,
                        height: lOptions.height
                    });

                    navigation.dialog.registerCloseHandler({
                        handler$:           lTriggeringElement$,
                        dialog:             lPopupWindow,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function(){
                            lPopupWindow.close();
                        }
                    });

                } else {
                    // A chained non-modal dialog will reuse an existing popup window, and resize to width and height with new dialog attributes.
                    lOptions.dialog.location.href = pUrl;
                    lOptions.dialog.resizeTo( lOptions.width, lOptions.height );
                }
            }
        } else {

            if ( lOptions.dialog === null ) {

                lTriggeringElement$ = $( pTriggeringElement, apex.gPageContext$ );

                if ( $.mobile && pUrl.substring( 0, pUrl.indexOf( ":" )) === "f?p=" + $v("pFlowId")) {

                    // Open Mobile Dialog Page
                    navigation.redirect(pUrl);

                    navigation.dialog.registerCloseHandler({
                        handler$:           lTriggeringElement$,
                        dialog:             $('.ui-dialog')	,
                        triggeringElement$: lTriggeringElement$,
                        closeFunction:      function() { navigation.redirect(pTriggeringElement.context.URL);}
                    });

                }
            } else {

                // A chained non-modal dialog will reuse an existing popup window, and resize to width and height with new dialog attributes.
                $(window.parent.location).attr('href',pUrl);

            }
        }

    }; // navigation.dialog

    /**
     * <p>Executes an action and then closes the dialog window.</p>
     *
     * @function close
     * @memberOf apex.navigation.dialog
     * @param {boolean} pIsModal If true, then the dialog is identified as being modal. If false, then the dialog is identified as being non-modal.
     * @param {string|function | Object} [pAction] The action can be one of the following:
     *    <ul>
     *        <li>a URL which will trigger a redirect in the parent page</li>
     *        <li>a function to redirect to a different dialog page</li>
     *        <li>false to cancel the dialog</li>
     *        <li>an object of page items and values which will be exposed in the apexafterclosedialog event</li>
     *        <li>an array of page item names, the values will be gathered from the page items to create
     *         an object of page item values to be exposed in the apexafterclosedialog event</li>
     *    </ul>
     *
     * @example <caption>This example demonstrates chaining from one modal dialog page to another, where the <code class="prettyprint">pAction</code> parameter is
     * a function that redirects to a different modal dialog page, specified in the URL:</caption>
     * apex.navigation.dialog.close( true, function( pDialog ) {
     *     apex.navigation.dialog(
     *         url,
     *         {
     *             title: "About",
     *             height: "480",
     *             width: "800",
     *             maxWidth: "1200",
     *             modal: true,
     *             dialog: pDialog,
     *             resizable: false
     *         },
     *         "a-Dialog--uiDialog",
     *         $( "#mybutton_static_id" ) );
     * } );
     *
     * @example <caption>This example demonstrates closing a modal dialog page, and returning an array of page items,
     * <code class="prettyprint">P3_EMPNO</code> and <code class="prettyprint">P3_ENAME</code>.  The values from the page items can then be used by the
     * page that launched the modal dialog, via a <code class="prettyprint">Dialog Closed</code> Dynamic Action event.</caption>
     * apex.navigation.dialog.close( true, ["P3_EMPNO","P3_ENAME"] );
     *
     * @example <caption>This example demonstrates closing a modal dialog page, and returning an object of page item,
     * <code class="prettyprint">dialogPageId</code> and its value of <code class="prettyprint">3</code>.  The returned value can be used by the
     * page that launched the modal dialog, via a <code class="prettyprint">Dialog Closed</code> Dynamic Action event, to identify the
     * page ID of the modal dialog that triggered the event.</caption>
     * apex.navigation.dialog.close( true, { dialogPageId: 3 } );
     */
    navigation.dialog.close = function ( pIsModal, pAction ) {
        var lTriggeringId;

        function apexCheck() {
            try {
                if ( window.opener.apex && window.opener.apex.jQuery ) {
                    return true;
                }
            } catch ( ex ) {
                return false; // window must contain a page from another domain
            }
            return false;
        }

        function getValuesForItems( pItemNames ) {
            var i, val, name,
                lItems = {};

            for ( i = 0; i < pItemNames.length; i++ ) {
                name = pItemNames[i];
                val = $v( name );
                lItems[ name ] = val;
            }
            lItems.dialogPageId = $v('pFlowStepId');  // Set dialogPageId to current dialog page, for Close Dialog DA support
            return lItems;
        }

        if ( $.isArray( pAction ) ) {
            pAction = getValuesForItems( pAction );
        }

        if ( !$.mobile ) {

            if ( pIsModal )  {

                // We hand back the control of dialog so that the caller can fire the necessary events, go to a new page, ...
                // The dialog to close must be the last one in the DOM - its the one on top.
                navigation.dialog.fireCloseHandler( util.getTopApex().jQuery( ".ui-dialog--apex" ).last().children( ".ui-dialog-content" ), pAction );

            } else {

                if ( window.opener && !window.opener.closed && apexCheck() ) {

                    // As long as the parent window still exists, we hand back the control of dialog so that the parent
                    // can fire the necessary events, go to a new page, ...
                    lTriggeringId = window.name;

                    if ( lTriggeringId.lastIndexOf( "_" ) > 0 ) {
                        lTriggeringId = lTriggeringId.substring( 0, lTriggeringId.lastIndexOf( "_" ) );
                    }

                    if ( lTriggeringId === undefined ) {
                        // Close Dialog Page Launched Via Component with no designated ID e.g. navigation bar entry
                        window.close();
                    } else {

                        if (lTriggeringId === "winDialog") {
                            if ( $.isFunction( pAction )) {
                                pAction.call( this, window );
                            }  else {
                                window.close();
                            }
                        } else {
                            navigation.dialog.fireCloseHandler( window.opener.apex.jQuery( "#" + lTriggeringId ), pAction );
                        }
                    }

                } else {

                    // But if the parent doesn't exist anymore, the non-modal dialog has to take control and at least
                    // navigate to the new page or close the popup
                    if ( $.isFunction( pAction )) {
                        pAction.call( this, window );
                    } else {
                        window.close();
                    }
                }
            }

        } else {

            if ( $.isFunction( pAction )) {
                pAction.call( this, window );
            } else {
                navigation.redirect(apex.jQuery.ajaxSettings.url);
            }
        }

    }; // navigation.dialog.close

    /**
     * <p>Closes the dialog window.</p>
     *
     * @function cancel
     * @memberOf apex.navigation.dialog
     * @param {boolean} pIsModal If true, then the dialog is identified as being modal. If false, then the dialog is identified as being non-modal.
     *
     * @example <caption>This example demonstrates closing a modal dialog page</caption>
     * apex.navigation.dialog.cancel( true );
     */
    navigation.dialog.cancel = function ( pIsModal ) {

        navigation.dialog.close( pIsModal, false );

    }; // navigation.dialog.cancel

    /**
     * <p>Registers the internal "close" event of a dialog. The event will be triggered by fireCloseEvent and depending on
     * the passed in <code class="prettyprint">pAction</code> will:</p>
     *
     * <ul>
     *     <li>Re-use the existing dialog and navigate to a different dialog page</li>
     *     <li>Navigate to a different page in the caller</li>
     *     <li>Cancel the dialog</li>
     *     <li>Close the dialog and trigger the "apexafterclosedialog" event</li>
     * </ul>
     *
     * @function registerCloseHandler
     * @deprecated since version 18.2
     * @memberOf apex.navigation.dialog
     * @param {Object} pOptions Has to contain the following attributes:
     * @param {Object} [pOptions.handler$] jQuery object where the event will be registered for.
     * @param {Element|Object} [pOptions.dialog] DOM Element/jQuery/... object of the current dialog instance which will be passed into the open dialog call if the existing dialog should be re-used.
     * @param {function} [pOptions.closeFunction] Function which is used to close the dialog.
     *
     * @example <caption>This example demonstrates a call to open the url in a named popup window, "Information".
     * The new window can be accessed from variable <code class="prettyprint">myPopupWindow</code>.
     * Some additional parameters are also set in the call, to control scrolling, resizing and the visibility of a toolbar.
     * The variable <code class="prettyprint">myTriggeringElement</code> is used to define the triggering element of the popup,
     * a button named <code class="prettyprint">myButton</code>. Using a call to {@link apex.navigation.dialog.registerCloseHandler},
     * a new handler can be defined, to associate the close action of the dialog with the button.</caption>
     *
     * var myTriggeringElement,
     *     myPopupWindow;
     *
     * myTriggeringElement = apex.jQuery( '#myButton' );
     *
     * myPopupWindow = apex.navigation.popup ( {
     *     url:       "f?p=102:2:&APP_SESSION.:::2::",
     *     name:      "Information",
     *     scroll:    "no",
     *     resizable: "no",
     *     toolbar:   "yes"
     * } );
     *
     * navigation.dialog.registerCloseHandler( {
     *     handler$:           myTriggeringElement,
     *     dialog:             myPopupWindow,
     *     triggeringElement$: myTriggeringElement,
     *     closeFunction:      function() {
     *         myPopupWindow.close();
     *     }
     * });
     */
    navigation.dialog.registerCloseHandler = function( pOptions ) {

        pOptions.handler$
            .off( INTERNAL_CLOSE_EVENT )
            .on( INTERNAL_CLOSE_EVENT, function( pEvent, pAction ) {
                var temp;
                if ( $.isFunction( pAction )) {
                    // Navigate to new dialog page
                    pAction.call( this, pOptions.dialog, pOptions );
                } else if ( $.type( pAction ) === "string" ) {
                    // Close dialog and navigate to new page in the parent
                    // Because of warn on unsaved changes handling this redirect may not actually change the page
                    // only close the dialog if it does
                    temp = location.href;
                    navigation.redirect( pAction );
                    if ( location.href !== temp ) {
                        // todo think about if/why closing the dialog is even needed given that the parent page is changing
                        pOptions.closeFunction();
                    }
                } else if ( pAction === false ) {
                    // Cancel dialog
                    pOptions.closeFunction();
                } else {
                    // Close dialog
                    pOptions.closeFunction();
                    pOptions.triggeringElement$.trigger( "apexafterclosedialog", [ pAction ]);
                }
            });
    }; // registerCloseHandler

    /**
     * <p>Fires the internal "close" event of a dialog which was registered with the registerCloseHandler when the dialog
     * was opened.</p>
     *
     * @function fireCloseHandler
     * @deprecated since version 18.2
     * @memberOf apex.navigation.dialog
     * @param {jQuery} pHandler$ A jQuery object which has been used in the call to registerCloseHandler.
     * @param {Object} pAction The value which is passed into the navigation.dialog.close function.
     *
     * @example <caption>This example demonstrates a call to close a dialog page, returning an array of page items from the dialog page.
     * The variable <code class="prettyprint">myTriggeringElement</code> is used
     * to define the triggering element of the dialog, a button named <code class="prettyprint">myButton</code>.
     * The page items <code class="prettyprint">P3_EMPNO</code> and
     * <code class="prettyprint">P3_ENAME</code> are returned to the launching page. The values from the page items can then be used by the
     * page that launched the modal dialog, via a <code class="prettyprint">Dialog Closed</code> Dynamic Action event.</caption>
     *
     * var myTriggeringElement;
     * myTriggeringElement = apex.jQuery( '#myButton' );
     *
     * navigation.dialog.fureCloseHandler( myTriggeringElement, ["P3_EMPNO”,”P3_ENAME”] );
     */
    navigation.dialog.fireCloseHandler = function( pHandler$, pAction ) {

        pHandler$.trigger( INTERNAL_CLOSE_EVENT, pAction );

    }; // navigation.dialog.fireCloseHandler

    var gFreezeDepth = 0;
    var gDefaultBodyWidth;

    // When the window is resized during the scroll freeze, or if the scroll is unfrozen,
    // the body's width should be reset to its normal value.
    /**
     *@ignore
     */
    var allowNormalWidth = function() {
        $( document.body ).css( "width", gDefaultBodyWidth );
        $( window ).off( "apexwindowresized" , allowNormalWidth);
    };

    /**
     * Call when a modal dialog is opened
     *@ignore
     */
    navigation.beginFreezeScroll = function( ) {
        if ( gFreezeDepth === 0 ) {
            $( window ).on( "apexwindowresized" , allowNormalWidth);
            gDefaultBodyWidth = document.body.style.width;
            $( document.body ).width( $( document.body ).width() ).addClass( "apex-no-scroll" );

            // Informs assistive technologies that everything outside of the dialog is inert.
            // We do this by setting aria-hidden="true" on the main APEX form element, which works because all
            // standard APEX content is within this, and the dialogs are not.
            //
            // Note: When WAI-ARIA 1.1 attribute aria-modal="true" is accessibility supported by modern browsers / AT,
            // then the aria-hidden technique will not be required.
            $( "#wwvFlowForm" ).attr( "aria-hidden", true );
        }
        gFreezeDepth += 1;
    };

    /**
     * Call when a modal dialog is closed
     * for every call to beginFreezeScroll there must be a corresponding call to endFreezeScroll
     *@ignore
     */
    navigation.endFreezeScroll = function( ) {
        gFreezeDepth -= 1;
        if ( gFreezeDepth <= 0 ) {
            allowNormalWidth();
            $( document.body).removeClass( "apex-no-scroll" );
            gFreezeDepth = 0;

            // Resets this back to usual, so assistive technologies can perceive all content again
            $( "#wwvFlowForm" ).removeAttr( "aria-hidden" );
        }
    };

})( apex.navigation, apex.util, apex.jQuery );
