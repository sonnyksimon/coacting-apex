/*!
 Copyright (c) 2017, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*global apex*/
/*
 * Clipboard cross browser support for copy to clipboard
 *
 * Depends on these strings being defined in the apex.lang message facility
 *     APEX.CLIPBOARD.NOTSUP (lazy load)
 *     APEX.CLIPBOARD.COPIED
 *
 * Issues
 * - Chrome browser context menu does not show Copy.
 * - Seems no browser puts Cut on the context menu.
 * - Behavior of context menu Select All is not desirable.
 * - Ctrl+X cut in Edge or IE only works when focus in editable field.
 * - Ctrl+V paste only works when focus in editable field.
 *
 * Supporting cut would be tricky especially in IE/Edge
 * Supporting paste would be cumbersome. The best that could be done is Click a “Paste” button.
 * This opens a dialog with focus in a text area (may be possible to make this not visible).
 * The dialog includes instruction to press Ctrl+V. Then you do get access to clipboard data.
 */

/**
 * <p>The apex.clipboard namespace contains functions to help interact with the clipboard.
 * It handles cross browser differences and supports widgets that need to copy something other than the built-in
 * browser text selection.</p>
 *
 * @ignore
 * @namespace
 * @since 5.2
 */
apex.clipboard = (function ( debug, lang, $ ) {
    "use strict";

    var clipboardHandlers = [],
        CB_DUMMY_ELEMENT = "apexCBMDummySelection",
        hasQueryCommand = document.execCommand && document.queryCommandSupported;

    function copyHandler(event) {
        var i, ch, result, dataTransfer, dtWrapper,
            cbEvent = event.originalEvent,
            target$ = $( document.activeElement );

        dataTransfer = cbEvent.clipboardData || window.clipboardData; // window.clipboardData is for IE
        if ( !dataTransfer ) {
            return;
        }
        dtWrapper = {
            dt: dataTransfer,
            setData: function( format, data ) {
                if ( window.clipboardData || /Edge\/\d./i.test(navigator.userAgent) ) {
                    // This is for IE and Edge which only supports text and adding others breaks text.
                    if ( format === "text/plain" ) {
                        format = "text";
                    }
                    if ( format !== "text" ) {
                        return; // only text is supported
                    }
                }
                this.dt.setData( format, data );
            }
        };
        for ( i = 0; i < clipboardHandlers.length; i++ ) {
            ch = clipboardHandlers[i];
            if ( target$.closest(ch.element ).length > 0 ) {

                result = ch.handler( dtWrapper );
                if ( result ) {
                    event.preventDefault();
                }
                break;
            }
        }
    }

    function makeDummySelection() {
        var range,
            active = document.activeElement;
        // Browsers need a selection somewhere to enable the copy context menu.
        // Some browsers require the selection for even the copy event to work.
        if ( active.nodeName === "INPUT" || active.nodeName === "TEXTAREA" ) {
            return; // no need when focus on something that already supports selection
        }
        window.getSelection().removeAllRanges();
        range = document.createRange();
        range.selectNode( $( "#" + CB_DUMMY_ELEMENT )[0] );
        window.getSelection().addRange( range );
        $( active ).focus(); // IE/Edge needs the focus back in area to be copied
    }

    /**
     * @lends apex.clipboard
     */
    var clipboardManager = {
        /**
         * Return true if the browser supports using the copy command. Most modern browsers support
         * the document.queryCommandSupported API and the copy command. Use this to check that
         * copy is supported and if needed modify the UI if it isn't.
         *
         * @ignore
         * @return {boolean} true if the browser supports using the copy command and false otherwise.
         */
        isSupported: function() {
            return hasQueryCommand && document.queryCommandSupported( "copy" );
        },

        /**
         * <p>Execute the copy command in a way that will work cross browser and for widgets that don't have
         * a traditional browser text selection range. This only executes the copy command. Doing something
         * requires handling the copy event by for example calling {@Link apex.clipboard.addHandler}.
         * If the browser doesn't support copy or fails to do the copy an alert message is shown advising the
         * user that they can try Ctrl+C. Set pNoWarn to true to suppress this alert.</p>
         *
         * @ignore
         * @param {object} [pOptions] An options object.
         * @param {boolean} [pOptions.noWarn] If true don't show a warning dialog if the browser fails to do the copy.
         * @param {Element} [pOptions.tooltipElement] The element to show a copied to clipboard tooltip message on success.
         * @return {boolean} true if copy supported and document.execCommand("copy") returns true and false otherwise.
         */
        copy: function( pOptions ) {
            var status = false,
                key = "APEX.CLIPBOARD.NOTSUP";

            pOptions = pOptions || {};

            if ( this.isSupported() ) {
                makeDummySelection();
                status = document.execCommand( "copy" );
            }
            if ( !status ) {
                if ( !pOptions.noWarn ) {
                    lang.loadMessagesIfNeeded( [key], function() {
                        apex.message.alert( lang.getMessage( key ) );
                    } );
                }
                debug.warn("Browser does not support clipboard copy command.");
            }
            if ( status && pOptions.tooltipElement ) {
                $( pOptions.tooltipElement ).tooltip( {
                    content: lang.getMessage( "APEX.CLIPBOARD.COPIED" ),
                    close: function() {
                        $( this ).tooltip( "destroy" );
                    }
                } );
            }
            return status;
        },

        /**
         * todo
         * @ignore
         * @param pElement
         * @param pButton
         */
        addElement: function( pElement, pButton ) {
            var self = this,
                el$ = $( pElement );

            if ( el$.prop( "tabIndex" ) === -1 ) {
                el$.prop( "tabIndex", 0 );
            }
            apex.clipboard.addHandler( el$[0], function( dt ) {
                dt.setData( "text/plain", ( el$.text() || el$.val() ).replace( /\n/g, "\r\n" ) );
                return true;
            });
            if ( pButton ) {
                $( pButton ).click( function() {
                    el$.focus();
                    self.copy( {
                        tooltipElement: pButton
                    } );
                    $( this ).focus();
                } );
            }
        },

        /**
         * todo
         * @ignore
         * @param pText
         * @param pButton
         */
        addText: function( pText, pButton ) {
            var self = this,
                b$ = $( pButton );

            apex.clipboard.addHandler( b$[0], function( dt ) {
                dt.setData( "text/plain", pText );
                return true;
            });
            $( pButton ).click( function() {
                self.copy( {
                    tooltipElement: pButton
                } );
                $( this ).focus();
            } );
        },

        /**
         * <p>Add a handler function, pCallback, to be called when the copy event happens on pElement. There should
         * only be one handler function per element.
         * </p>
         *
         * @ignore
         * @param {Element} pElement The element to add copy to clipboard support to.
         * @param {function} pCallback A function that receives a wrapper around a DataTransfer object. Only the
         * setData method is supported. The function must return true if it calls setData.
         */
        addHandler: function( pElement, pCallback ) {
            if ( clipboardHandlers.length === 0 ) {
                $( document ).on( "copy.cbManager", copyHandler );
                $( document.body ).append( "<input id='" + CB_DUMMY_ELEMENT + "'style='display:none;' value='x'>" );
            }
            $( pElement ).on( "keydown.cbManager", function( event ) {
                // create a selection on Ctrl+C, Shift+F10
                if ( ( ( event.metaKey || event.ctrlKey ) && event.which === 67 ) || // 67=C (OSX uses meta Windows uses ctrl)
                    ( event.shiftKey && event.which === 121) ) { // 121=F10
                    makeDummySelection();
                }
            } ).on( "contextmenu.cbManager", function() {
                makeDummySelection();
            });
            clipboardHandlers.push({
                element: pElement,
                handler: pCallback
            });
        },

        /**
         * <p>Remove the handler added by {@link apex.clipboard.addHandler}.</p>
         *
         * @ignore
         * @param {Element} pElement The element to remove copy to clipboard support from.
         */
        removeHandler: function( pElement ) {
            var i, ch;
            for ( i = 0; i < clipboardHandlers.length; i++ ) {
                ch = clipboardHandlers[i];
                if ( ch.element === pElement ) {
                    clipboardHandlers.splice(i, 1);
                    break; // assumes there is only one
                }
            }
            $( pElement ).off( ".cbManager" );
            if ( clipboardHandlers.length === 0 ) {
                $( document ).off( ".cbManager" );
                $( "#" + CB_DUMMY_ELEMENT ).remove();
            }
        }
    };

    // process declarative attribute data-clipboard-source
    $( function() {
        $( "[data-clipboard-source]", apex.gPageContext$ ).each( function() {
            var trigger$ = $( this ),
                source = trigger$.attr( "data-clipboard-source" );
            if ( source.substr(0,1) === "#" ) {
                clipboardManager.addElement( $(source)[0], trigger$[0] );
            } else {
                clipboardManager.addText( source, trigger$[0] );
            }
        } );
    } );

    return clipboardManager;

})( apex.debug, apex.lang, apex.jQuery );
