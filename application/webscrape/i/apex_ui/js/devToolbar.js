/*global apex,alert,window,$v,apex_img_dir*/
/**
 @license
 Oracle Database Application Express, Release 5.0
 Copyright (c) 2013, 2018, Oracle. All rights reserved.
 */
/**
 * @fileOverview
 * Developer Toolbar controller
 *
 * depends on:
 *   util
 *   navigation
 *   storage
 *   widget.menu
 * Optional integration with ui.dialog
 **/
(function( apex, $, util, nav, storage, lang, message, debug ) {
    "use strict";

    var BUILDER_WINDOW_NAME = "APEX_BUILDER", // keep in sync with builder.js
        DEV_TOOLBAR_KEY = "ORA_WWV_apex.builder.devToolbar",
        THEMEROLLER_KEY = "ORA_WWV_apex.builder.themeRoller", // keep in sync with utr.js
        QUICK_EDIT_CURSOR = "crosshair",
        IMAGES_DIRECTORY = window.apex_img_dir,
        THEMEROLLER_BASE = IMAGES_DIRECTORY + "apex_ui/theme_roller/",
        CODEMIRROR_BASE = IMAGES_DIRECTORY + "libraries/codemirror/5.16/",
        COLORPICKER_BASE = IMAGES_DIRECTORY + "libraries/d3.oracle.colorpicker/0.1/",
        PALETTE_BASE = IMAGES_DIRECTORY + "libraries/d3.oracle.palette/0.1/",
        D3_BASE = IMAGES_DIRECTORY + "libraries/d3/3.3.11/",
        KEY_ERRORS_MSG = "DEVELOPER_TOOLBAR_ERRORS",
        KEY_ERRORS_BTN_TITLE = "DEVELOPER_TOOLBAR_ERRORS_BTN",
        C_BUTTON_LABEL = ".a-DevToolbar-buttonLabel",
        C_ALL_POSITIONS = "a-DevToolbar--top a-DevToolbar--left a-DevToolbar--bottom a-DevToolbar--right",
        C_ACTIVE = "is-active",
        ID_ERRORS_BTN = "apexDevToolbarErrors",
        SEL_DEV_TOOLBAR = "#apexDevToolbar",
        SEL_DT_QUICKEDIT = "#apexDevToolbarQuickEdit",
        SEL_DT_APP = "#apexDevToolbarApp",
        SEL_DT_PAGE = "#apexDevToolbarPage",
        SEL_DT_DEBUG = "#apexDevToolbarDebug",
        A_TITLE = "title";

    var gDevToolbarSessionStore = storage.getScopedSessionStorage( { prefix: DEV_TOOLBAR_KEY, useAppId: false } ),
        gDevToolbarLocalStore =  storage.getScopedLocalStorage( { prefix: DEV_TOOLBAR_KEY, useAppId: false } ),
        gThemeRollerSessionStore =  storage.getScopedSessionStorage( { prefix: THEMEROLLER_KEY, useAppId: true } ),
        gErrorNotificationAdded = false,
        gHasPerfAPI = window.performance && window.performance.timing && window.performance.navigation,
        gDialogOpen = false;

    /*
     * If jQuery dialog is available make it dev toolbar aware
     * This allows the dev toolbar to be used while a dialog is open
     */
    if ( $.ui.dialog ) {
        $.widget( "ui.dialog", $.ui.dialog, {
            _allowInteraction: function(event) {
                // todo is overlay class needed?
                return $( event.target ).closest(".a-DevToolbar, #apexDevToolbarMenu, .u-Overlay--quickEdit").length > 0 || this._super(event);
            }
        });
    }

    function getWindowWidth() {
        return document.documentElement.clientWidth;
    }
    function getWindowHeight() {
        return document.documentElement.clientHeight;
    }

    // This is called when it is detected that there have been JavaScript errors on the page.
    // See core.js and debug.js
    // The purpose is to let the developer toolbar indicate to the developer that there are errors
    // so they can investigate by opening the browser JavaScript console (developer tools).
    // this is to help APEX developers that don't normally run with browser developer tools open.
    // It Adds a button to the toolbar. It only has an effect the first time it is called.
    apex._dtNotifyErrors = function() {
        if ( gErrorNotificationAdded ) {
            return;
        }
        gErrorNotificationAdded = true;
        lang.loadMessagesIfNeeded( [KEY_ERRORS_MSG, KEY_ERRORS_BTN_TITLE], function() {
            var $ = util.getTopApex().jQuery,
                msg = lang.getMessage( KEY_ERRORS_MSG ),
                title = lang.getMessage( KEY_ERRORS_BTN_TITLE );

            $( SEL_DEV_TOOLBAR + " .a-DevToolbar-list" ).prepend(
                '<li role="alert"><button id="' + ID_ERRORS_BTN + '" type="button" class="a-Button a-Button--devToolbar " title="' +
                    title + '" aria-label="' + msg +
                    '"><span class="a-Icon icon-warning" aria-hidden="true"></span></button></li>');
            $( SEL_DEV_TOOLBAR ).addClass( C_ACTIVE ); // let the toolbar be seen if it is auto-hide
            fixToolbarWidth();
            $( "#" + ID_ERRORS_BTN ).click( function() {
                message.alert( msg );
            } );
        } );
    };

    //
    // Begin private dev toolbar code
    //
    var keys = $.ui.keyCode;
    var gContextStack = [],
        // For quick edit component locator
        boxes = null,
        overlay = null,
        outline = null,
        liveTemplateOptionsButton$ = null,
        started = false,
        storedStylesheet = null,
        storedCursor = null,
        scrollDelta = 40; // when something is scrolled into view this is the extra amount to scroll it

    function getThemeRollerInit(themeId, builderSessionId, callback) {
        var maxc = 5;
        var c = 0;
        var f = (function() {
            if ($.universalThemeRoller) {
                $.universalThemeRoller({
                    filePaths : {
                        utrScript: THEMEROLLER_BASE + "utr.js",
                        utrStylesheet: THEMEROLLER_BASE + "utr.css",
                        lessCompilerScript: THEMEROLLER_BASE + "less.js",
                        jQueryUiComponentsScript: THEMEROLLER_BASE + "jquery-ui.utr.js",
                        //colorPickerStylesheet: COLORPICKER_BASE + "css/colorpicker.css",
                        //colorPickerScript: COLORPICKER_BASE + "js/colorpicker.js",
                        codeMirrorScript: CODEMIRROR_BASE + "lib/codemirror.js",
                        codeMirrorCSSModeScript: CODEMIRROR_BASE + "mode/css/css.js",
                        codeMirrorStylesheet: CODEMIRROR_BASE + "lib/codemirror.css",
                        codeMirrorThemeStylesheet: CODEMIRROR_BASE + "theme/mbo.css",
                        d3Script: D3_BASE + "d3.min.js",
                        d3ColorPickerScript: COLORPICKER_BASE + "d3.oracle.colorpicker.js",
                        d3ColorPickerStylesheet: COLORPICKER_BASE + "d3.oracle.colorpicker.css",
                        d3PaletteScript: PALETTE_BASE + "d3.oracle.palette.js",
                        d3PaletteStylesheet: PALETTE_BASE + "d3.oracle.palette.css"
                    },
                    config : {
                        themeId: themeId,
                        builderSessionId: builderSessionId
                    }
                });
                if (callback && (typeof callback === 'function') ) {
                    callback();
                }
            } else if (c < maxc) {
                setTimeout( f, 100 );
                c++;
            }
        });
        return f;
    }

    function getUrl( button$ ) {
        return button$.attr("data-link");
    }

    // Return the opener window that is the apex builder window.
    function getApexBuilderFromOpenerChain( wnd ) {
        // if *this* is the builder window then don't care what the opener is
        // a builder opening the builder can result in a stale instance without this check
        if ( isBuilderWindow( wnd ) ) {
            return null;
        }
        try {
            if ( wnd.opener && !wnd.opener.closed && wnd.opener.apex && wnd.opener.apex.jQuery ) {
                // builder urls are in the 4000s
                if ( wnd.opener.location.href.match(/f?p=4\d\d\d:/) ||
                        wnd.opener.document.getElementById( "pFlowId" ).value.match(/^4\d\d\d$/) ) {
                    return wnd.opener;
                } else {
                    // Follow the opener chain to support non-modal (popup window) apex pages
                    return getApexBuilderFromOpenerChain( wnd.opener );
                }
            }
        } catch ( ex ) {
            return null; // window must contain a page from another domain
        }
        return null;
    }

    function isBuilderWindow(wnd) {
        return wnd.name && wnd.name.match( "^" + BUILDER_WINDOW_NAME );
    }

    function getBuilderInstance() {
        var builderWindow = getApexBuilderFromOpenerChain( window );
        if ( builderWindow ) {
            return builderWindow.document.getElementById( "pInstance" ).value;
        }
        return null;
    }

    function getBuilderUrl( url ) {
        var instance, parts;

        instance = getBuilderInstance();
        if ( instance ) {
            parts = url.split(":");
            parts[2] = instance;
            url = parts.join(":");
        }
        return url;
    }

    var contextPrototype = {
        navigateInPageDesigner: function( appId, pageId, typeId, componentId, errorFn ) {
            var builderWindow = getApexBuilderFromOpenerChain( window );

            if ( builderWindow && builderWindow.pageDesigner ) {
                builderWindow.pageDesigner.setPageSelection( appId, pageId, typeId, componentId, function( result ) {
                    if ( result !== "OK" && result !== "PAGE_CHANGE_ABORTED" ) {
                        errorFn();
                    }
                });
                // Focus the builder window now while still handling the click event even though controlling the page designer may still fail
                nav.openInNewWindow( "", BUILDER_WINDOW_NAME, { altSuffix: getBuilderInstance() } );
            } else {
                errorFn();
            }
        },
        builderWindow: function( action ) {
            this.builderWindowUrl( getBuilderUrl( this.actions[action] ) );
        },

        builderWindowUrl: function( url ) {
            var instance = getBuilderInstance();

            // if this is the builder window then don't try to manage another window just navigate
            if ( isBuilderWindow( window ) || this.windowMgmtMode === "NONE" ) {
                nav.redirect( url );
            } else {
                if ( !instance ) {
                    message.confirm( this.text.noBuilderMessage, function(ok) {
                        if ( ok ) {
                            // just open the builder url in this window; turning this widow into a/the builder window
                            window.name = ""; // let the builder take over this window
                            nav.redirect( url );
                        }
                    } );
                } else {
                    nav.openInNewWindow( url, BUILDER_WINDOW_NAME, { altSuffix: instance } );
                }
            }
        },

        popup: function( action ) {
            nav.popup( {
                url:    getBuilderUrl( this.actions[action] ),
                name:   "view_debug",
                width:  1024,
                height: 768
            });
        },

        sameWindow: function( action ) {
            var match,
                url = this.actions[action];

            if (this.window === window) {
                nav.redirect( url );
            } else {
                // navigate in the nested iframe
                // we don't want to open or close and open the dialog again we just want to refresh the page
                match = /apex.navigation.dialog\(['"]([^'"]*)['"]/.exec(url);
                if ( match ) {
                    url = match[1];
                    // decode escaped characters
                    url = url.replace(/\\u(\d\d\d\d)/g, function(val, ch) {
                        return String.fromCharCode(parseInt(ch, 16));
                    });
                }
                this.window.location.href = url;
            }
        },

        // DOM locate code
        initLocateBoxes: function() {
            var i, comp$, pos, comp, fixed, op$, opPos,
                fixedBoxes = [];

            boxes = [];
            // go in reverse order so inner boxes are tested first
            for ( i = this.components.length - 1; i >= 0; i-- ) {
                comp = this.components[i];
                comp$ = $( "#" + util.escapeCSS( comp.domId ), this.document );

                if (comp.typeId === "5120") {
                    // for items it could be that the component DOM element is hidden; for example a hidden input
                    // so grab the closest visible element
                    comp$ = comp$.closest( ":visible" );
                } else {
                    // for all other component types exclude what is not visible
                    comp$ = comp$.filter( ":visible" );
                }
                // the check for body covers the case where items are in inline dialogs
                if ( !comp$.length || comp$[0] === document.body ) {
                    continue;
                }
                op$ = comp$.offsetParent();
                if ( op$.css("position") === "fixed" ) {
                    opPos = op$.position();
                    pos = comp$.position();
                    pos.top += opPos.top;
                    pos.left += opPos.left;
                    fixed = true;
                } else {
                    pos = comp$.offset();
                    fixed = false;
                }

                (fixed ? fixedBoxes : boxes).push({
                    node: comp$[0],
                    pageId: comp.pageId,
                    typeId: comp.typeId,
                    componentId: comp.id,
                    fixed: fixed,
                    top: pos.top,
                    bottom: pos.top + comp$.outerHeight(),
                    left: pos.left,
                    right: pos.left + comp$.outerWidth()
                });
            }
            // assume fixed things are on top so put at the start
            if ( fixedBoxes.length ) {
                boxes = fixedBoxes.concat( boxes );
            }
        },

        endDomLocate: function() {
            $( this.document ).off( ".locate" );
            $( document ).off( ".locate" );
            $( window ).off( ".locate" );
            $( this.document.body ).css( "cursor", storedCursor );
            storedStylesheet.remove();
            overlay.remove();
            outline.remove();
            liveTemplateOptionsButton$.remove();
            started = false;
            $( SEL_DT_QUICKEDIT ).focus();
        },

        beginDomLocate: function( action ) {
            var self = this,
                lastBox = null,
                lastBoxIndex = -1,
                body$ = $( this.document.body );

            var inBox = function( x, y, cx, cy, box ) {
                if ( box.fixed ) {
                    x = cx;
                    y = cy;
                }
                return ( y > box.top && y < box.bottom && x > box.left && x < box.right );
            };

            // Checks if a component supports Live Template Options by its typeID.
            var hasLiveTempOpt = function ( id ) {
                var NO_SUPPORT = {
                        "7040": true,   // IR column header
                        "7320": true,   // Classic report column
                        "7420": true,   // Tabular form column
                        "7940": true    // IG column
                };
                return !NO_SUPPORT[id];
            };

            var selectBox = function( scrollIfNeeded ) {
                var pos, h, w, node$, sp$, vpTop, vpBottom;

                if ( lastBox === null ) {
                    outline.hide();
                    liveTemplateOptionsButton$.hide();
                } else {
                    outline.show();
                    node$ = $( lastBox.node );
                    pos = node$.offset();
                    h = node$.outerHeight();
                    w = node$.outerWidth();

                    outline.css({top: pos.top + "px", left: pos.left + "px"});
                    // LiveTemplateOptionsButton is in an anonymous function primarily just to indicate that
                    // it depends on the variables outside of this closure but doesn't affect anything
                    // outside of the block.
                    if ( hasLiveTempOpt(lastBox.typeId) ) {
                        (function() {
                            liveTemplateOptionsButton$.show();
                            var left = pos.left + node$.outerWidth() - liveTemplateOptionsButton$.outerWidth() + 2;
                            var windowWidth = getWindowWidth();
                            var buttonWidth = liveTemplateOptionsButton$.outerWidth();
                            // Put it in the upper right corner of the outline box, but if it's too close to the  edge
                            // pad it to the left TODO: Consider just using jQuery UI's position lib?
                            if (left + buttonWidth > windowWidth) {
                                left = windowWidth - buttonWidth - 10;
                            }
                            liveTemplateOptionsButton$.css(
                                {
                                    top: pos.top + "px",
                                    left: left + "px"
                                }
                            );
                        })();
                    } else {
                        liveTemplateOptionsButton$.hide();
                    }
                    outline.height(h)
                        .width(w)
                        .focus();
                    if ( scrollIfNeeded ) {
                        sp$ = node$.scrollParent();
                        vpTop = apex.theme.defaultStickyTop();
                        vpBottom = ( sp$[0] === document ) ? $( window ).height() : sp$.height();
                        if ( pos.top < sp$.scrollTop() + vpTop ) {
                            sp$.scrollTop( pos.top - vpTop - scrollDelta );
                        } else if ( pos.top > sp$.scrollTop() + vpBottom ) {
                            sp$.scrollTop( pos.top + vpBottom + scrollDelta );
                        }
                    }
                }
            };

            this.initLocateBoxes();
            lastBox = null;
            // if locating in the top level document (the same one the toolbar is in) then the delegated click handler
            // added to the document will be hit ending the locating before we even begin so in that case delay start until after the click
            started = this.document !== document;
            overlay = $( "<div class='u-Overlay u-Overlay--quickEdit'></div>" ).appendTo( body$ );
            outline = $( "<div class='a-DevToolbar-uiSelector'  tabindex='-1'></div>" ).appendTo( body$ );
            liveTemplateOptionsButton$ = $(
                "<button class='a-DevToolbar-liveTemplateOptions'> " +
                    "<span class='a-Icon icon-util'></span>" +
                "</button>"
            ).appendTo( body$ );
            storedCursor = body$.css( "cursor" );
            storedStylesheet = $( "<style> *{ cursor: " + QUICK_EDIT_CURSOR + " !important; }</style>" ).appendTo( body$ );
            body$.css( "cursor", QUICK_EDIT_CURSOR );
            liveTemplateOptionsButton$.on("click", function() {
                if ( openBuilderIfNeeded() ) {
                    self.endDomLocate();
                    return false;
                }
                self.getTemplateOptions( lastBox );
                self.endDomLocate();
                return false;
            });

            $( this.document ).on( "mousemove.locate", function( event ) {
                var i, box, foundBox,
                    cx = event.clientX,
                    cy = event.clientY,
                    x = event.pageX,
                    y = event.pageY;

                if ( !started ) {
                    started = true;
                }
                foundBox = null;
                for ( i = 0; i < boxes.length; i++ ) {
                    box = boxes[i];
                    if ( inBox( x, y, cx, cy, box ) ) {
                        foundBox = box;
                        lastBoxIndex = i;
                        break;
                    }
                }
                if ( lastBox !== foundBox ) {
                    lastBox = foundBox;
                    selectBox();
                }
            } ).on("click.locate", function() {
                if ( started ) {
                    self.endDomLocate();
                    if ( lastBox ) {
                        action( lastBox );
                    }
                    return false;
                } else {
                    started = true;
                }
            } );
            $( document ).on("keydown.locate", function( event ) {
                var kc = event.which;
                if ( kc === keys.ESCAPE ) {
                    self.endDomLocate();
                } else if ( kc === keys.DOWN ) {
                    if ( lastBoxIndex <= 0 ) {
                        lastBoxIndex = boxes.length - 1;
                    } else {
                        lastBoxIndex -= 1;
                    }
                    lastBox = boxes[lastBoxIndex];
                    selectBox( true );
                    event.preventDefault();
                } else if ( kc === keys.UP ) {
                    if ( lastBoxIndex < 0 || lastBoxIndex >= boxes.length - 1 ) {
                        lastBoxIndex = 0;
                    } else {
                        lastBoxIndex += 1;
                    }
                    lastBox = boxes[lastBoxIndex];
                    selectBox( true );
                    event.preventDefault();
                } else if ( kc === keys.TAB ) {
                    if ( lastBoxIndex > 0 ) {
                        if ( document.activeElement === outline[0] && liveTemplateOptionsButton$.is( ":visible" ))  {
                            liveTemplateOptionsButton$.focus();
                        } else {
                            outline.focus();
                        }
                        event.preventDefault();
                    }
                } else if ( ( kc === keys.SPACE || kc === keys.ENTER ) && document.activeElement === outline[0] ) {
                    self.endDomLocate();
                    if ( lastBox ) {
                        action( lastBox );
                    }
                    event.preventDefault();
                }
            } );
        },
        getTemplateOptions: function( el ) {
            var typeId = el.typeId;
            var componentId = el.componentId;
            var lSpinner$;
            if (!this.deferredTemplateOptionsInit) {
                this.deferredTemplateOptionsInit = [];
            }
            var deferred = this.deferredTemplateOptionsInit;
            // This will take a while. First, we need to check and then get, if needed, liveTemplateOptions widget
            // while concurrently fetching the template Data (two async operations running concurrently)
            // If and once liveTemplateOptions is loaded, then it itself needs to fetch its dependencies
            // Fortunately liveTemplateOptions takes care of its own dependencies without needi
            util.delayLinger.start( "templateOptions", function() {
                lSpinner$ = util.showSpinner( $( el.node ) );
            });
            var initLiveTemplateOptions = function ( pData ) {
                if (!jQuery().liveTemplateOptions) {
                    // Live template options not loaded yet? no problem!
                    // we know that before this operation started we did a fetch for the livetemplateoptions
                    // so we'll just push this pData onto the deferred stack. once that fetch is done
                    // it will look at what's on this stack and then initialize the liveTemplateOptions
                    // that were waiting!
                    deferred.push(pData);
                    return;
                }
                util.delayLinger.finish( "templateOptions", function() {
                    lSpinner$.remove();
                });
                $(el.node).liveTemplateOptions(
                    {
                        data: JSON.parse(JSON.stringify(pData)),
                        componentId: componentId,
                        onSave: function( submittedTemplateOptions, onSuccess, onFailure ) {
                            if ( openBuilderIfNeeded() ) {
                                return false;
                            }
                            util.delayLinger.start( "templateOptions", function() {
                                lSpinner$ = util.showSpinner( $( el.node ) );
                            });
                            apex.server.process( "developerToolbar", {
                                p_flow_id:      4000,
                                p_flow_step_id: 0,
                                p_instance:     getBuilderInstance(),
                                x01:            "setTemplateOptions",
                                x02:            $v( "pFlowId" ),
                                x03:            $v( "pFlowStepId" ),
                                x04:            typeId,
                                x05:            componentId,
                                f01:            submittedTemplateOptions
                            }, {
                                success: function() {
                                    util.delayLinger.finish( "templateOptions", function() {
                                        lSpinner$.remove();
                                    });
                                    onSuccess();
                                },
                                error: function( pData, err) {
                                    util.delayLinger.finish("templateOptions", function () {
                                        lSpinner$.remove();
                                    });
                                    onFailure(pData, err);
                                }
                            });
                        }
                    }
                );
            };
            //Is live template options present?
            if (!jQuery().liveTemplateOptions) {
                // No? then we better get it.
                $.getScript( IMAGES_DIRECTORY + "apex_ui/js/" +
                    ( debug.getLevel() === 0 ? "minified/widget.liveTemplateOptions.min.js" : "widget.liveTemplateOptions.js" ),
                    function( data, textStatus, jqxhr ) {
                        //Once we get it, then we need to preload its dependencies on the page.
                        $.apex.liveTemplateOptions.preload();
                        // Be sure to check if there were any templates that were waiting
                        // to be initialized with liveTemplateOptions
                        while (deferred.length > 0) {
                            initLiveTemplateOptions(deferred.pop());
                        }
                    });
            } else {
                // If it is present, then liveTemplateOptions can just go ahead with the preload
                // Note that this operation is idempotent after the first time, so we can call it as much as we want
                // with no reprecussions.
                $.apex.liveTemplateOptions.preload();
            }
            //TODO: cache the pData so the server doesn't get hit all the time?
            apex.server.process( "developerToolbar", {
                p_flow_id:      4000,
                p_flow_step_id: 0,
                p_instance:     this.builderSessionId,
                x01:            "getTemplateOptions",
                x02:            $v( "pFlowId" ),
                x03:            $v( "pFlowStepId" ),
                x04:            typeId,
                x05:            componentId
            }, {
                success: initLiveTemplateOptions,
                error: function( pData, err, message ) {
                    debug(pData);
                    util.delayLinger.finish( "templateOptions", function() {
                        lSpinner$.remove();
                    });
                    alert( lang.getMessage("APEX.LTO.NO_OPTIONS_FOUND") );
                }
            });
        },
        quickEdit: function() {
            var self = this;

            if ( started ) {
                this.endDomLocate();
            } else {
                this.beginDomLocate( function( el ) {
                    var parts, urlParts,
                        url = getBuilderUrl( self.actions.quickEdit );
                    self.navigateInPageDesigner( self.currentApp, el.pageId, el.typeId, el.componentId, function() {
                        // if that fails navigate to correct place
                        if ( el.pageId !== self.currentPage ) {
                            urlParts = url.split( ":" );
                            parts = urlParts[ urlParts.length - 1 ].split( "," );
                            parts[1] = parts[3] = parts[4] = el.pageId;
                            urlParts[ urlParts.length - 1 ] = parts.join( "," );
                            url = urlParts.join(":");
                        }
                        url += "#" + el.typeId + ":" + el.componentId;
                        self.builderWindowUrl( url );
                    } );
                });
            }
        },

        themeRoller: function() {
            var self = this;
            debug.info( "ThemeId: %s, BuilderSessionId: %s", self.themeId, self.builderSessionId );

            var toggle = function() {
                if ( apex.utr && apex.utr.opened ) {
                    $.universalThemeRoller("close");
                } else {
                    $.universalThemeRoller("open");
                }
            };

            if ( $.universalThemeRoller ) {
                toggle();
            } else {
                var onThemeRollerLoad = getThemeRollerInit( self.themeId, self.builderSessionId, toggle );
                // No need to load utr-base.js, it should have already been loaded by now.
                $.getScript( THEMEROLLER_BASE + 'jquery.universalThemeRoller.js', onThemeRollerLoad );
            }
        }
    };

    function fixToolbarWidth() {
        var o, tbWidth, windowWidth,
            dtb$ = $( SEL_DEV_TOOLBAR ),
            direction = dtb$.css("direction") === "rtl" ? "right" : "left"; // when in RTL mode, the left CSS property

        o = {
            width: ""
        };
        if ( dtb$.hasClass("a-DevToolbar--top") || dtb$.hasClass("a-DevToolbar--bottom") ) {
            windowWidth = getWindowWidth();
            o.whiteSpace = "nowrap";  // clear element width to get desired width of ul content
            dtb$.css( o );
            // using width assuming no margin etc.
            tbWidth = dtb$.children( "ul" )[0].clientWidth + 4; // IE wants just a little extra to keep the buttons from wrapping
            if ( tbWidth > windowWidth ) {
                tbWidth = windowWidth;
            }
            o.whiteSpace = "wrap";
            o.width = tbWidth;
            o[direction] = (windowWidth - tbWidth) / 2; // position the offset in the center.
        } else {
            o[direction] = ""; // clear the offset and width
        }
        dtb$.css( o );
    }

    function updateButtons( ctx ) {
        $( SEL_DT_APP ).attr( A_TITLE, ctx.appTitle ).find( C_BUTTON_LABEL ).text( ctx.appTitle );
        $( SEL_DT_PAGE ).attr( A_TITLE, ctx.pageTitle ).find( C_BUTTON_LABEL ).text( ctx.pageTitle );
        $( SEL_DT_DEBUG ).attr( A_TITLE, ctx.debugTitle ).find( C_BUTTON_LABEL ).text( ctx.debugTitle );
        fixToolbarWidth();
    }

    function pushContext() {
        gContextStack.push( {} );
    }

    function setContext( toolbar$, wnd, components, windowMgmtMode, text, themeId ) {
        var that = Object.create( contextPrototype ),
            url = getBuilderUrl( getUrl( toolbar$.find( SEL_DT_PAGE ) ) ),
            parts = url.split( ":" )[7].split( "," );

        that.currentApp = parts[0];
        that.currentPage = parts[1];
        that.builderSessionId = url.split( ":" )[2];
        that.document = toolbar$[0].ownerDocument;
        that.window = wnd;
        that.actions = {
            home: getUrl( toolbar$.find( "#apexDevToolbarHome" ) ),
            app: getUrl( toolbar$.find( SEL_DT_APP ) ),
            page: getUrl( toolbar$.find( SEL_DT_PAGE ) ),
            session: getUrl( toolbar$.find( "#apexDevToolbarSession" ) ),
            viewDebug: getUrl( toolbar$.find( "#apexDevToolbarViewDebug" ) ),
            debug: getUrl( toolbar$.find( SEL_DT_DEBUG ) ),
            quickEdit: getUrl( toolbar$.find( SEL_DT_QUICKEDIT ) )
        };
        that.components = components;
        that.windowMgmtMode = windowMgmtMode;
        that.themeId = themeId;
        that.text = text;
        that.appTitle = toolbar$.find( SEL_DT_APP ).attr( A_TITLE );
        that.pageTitle = toolbar$.find( SEL_DT_PAGE ).attr( A_TITLE );
        that.debugTitle = toolbar$.find( SEL_DT_DEBUG ).attr( A_TITLE );

        gContextStack[gContextStack.length - 1] = that;
        updateButtons( getContext() );
    }

    function popContext() {
        gContextStack.pop();
        updateButtons( getContext() );
    }

    function getContext() {
        var i;
        for ( i = gContextStack.length - 1; i >= 0; i-- ) {
            if ( gContextStack[i].currentApp !== undefined ) {
                return gContextStack[i];
            }
        }
        return null; // don't expect to get here
    }

    function openBuilderIfNeeded() {
        if ( !getBuilderInstance() ) {
            getContext().builderWindow("page");
            return true;
        } else {
            return false;
        }
    }

    apex.initNestedDevToolbar = function( toolbar$, wnd, components, windowMgmtMode, text, themeId ) {
        setContext( toolbar$, wnd, components, windowMgmtMode, text, themeId );
    };

    /*
     * Must be called from document ready handler
     */
    apex.initDevToolbar = function( components, windowMgmtMode, text, themeId ) {
        var focused = false,
            menuOpen = false,
            // this menu is hooked up to the Options menu button by id
            optionsMenu$ = $( "#apexDevToolbarOptionsMenu" ),
            infoMenu$ = $( "#apexDevToolbarInfoMenu" ),
            hideTimer = null,
            // These options are persisted in local storage
            debugGrid = false,
            autoHide = false,
            iconsOnly = false,
            displayPosition = "bottom";

        function saveOptions() {
            if ( storage.hasLocalStorageSupport() ) {
                // Would love to use JSON.stringify but need to support IE7 (sure there are libraries
                // that provide a back-fill for JSON but we have no other need)
                gDevToolbarLocalStore.setItem( "options", '{"autoHide":' + autoHide + ',"iconsOnly":' + iconsOnly + ',"displayPosition":"' + displayPosition + '"}' );
            }
        }

        function loadOptions() {
            var options;

            options = gDevToolbarLocalStore.getItem( "options" );
            if ( options ) {
                try {
                    options = JSON.parse( options );
                    autoHide = options.autoHide ? options.autoHide : autoHide;
                    iconsOnly = options.iconsOnly ? options.iconsOnly : iconsOnly;
                    displayPosition = /^(top|left|right|bottom)$/.test(options.displayPosition) ? options.displayPosition : displayPosition;
                } catch ( ex ) {
                    // Ignore any exception. If someone has messed with the options no worries the next saveOptions will set things right
                }
            }
        }

        /*
         * Since the time line measure labels displayed can include developer defined instrumentation marks and measures
         * the current thinking is that time line labels don't need to be localized.
         */
        var perfMap = [
            // label, start, end, color class
            ["Redirect", "redirectStart", "redirectEnd", "c-tl-redir"],
            ["Unload", "unloadEventStart", "unloadEventEnd", "c-tl-unload"],
            ["Cache", "fetchStart", "domainLookupStart", "c-tl-cache"],
            ["DNS", "domainLookupStart", "domainLookupEnd", "c-tl-dns"],
            ["Connect", "connectStart", "connectEnd", "c-tl-conn"],
            ["Request", "requestStart", "responseStart", "c-tl-req"],
            ["Response", "responseStart", "responseEnd", "c-tl-resp"],
            ["Processing", "responseEnd", "loadEventStart", "c-tl-proc"],
            ["DOM Loading", "domLoading", "domInteractive", "c-tl-d1"],
            ["DOM Interactive", "domInteractive", "domComplete", "c-tl-d2"],
            ["DOM Content Loaded", "domContentLoadedEventStart", "c-tl-d3"],
            ["On Load", "loadEventStart", "loadEventEnd", "c-tl-load"]
        ];
        var navType = {
            "0": "Page Navigate",
            "1": "Page Reload",
            "2": "Page Forward or Back"
        };

        // todo consider moving to a dynamically loaded separate file.
        // todo consider capturing page submit
        function displayPageTiming( theWindow ) {
            var timing, rule$, time$, scaleFactor,
                cbText = "",
                cbHtml = "",
                perfDlg$ =$( "<div id='apex-timeline'><ul class='apex-timeline' tabindex='-1'></ul><div class='apex-timeline-rule'></div>" +
                    "<div class='apex-timeline-time'></div></div>" ),
                width = getWindowWidth() - 40,
                heigth = Math.min( 480, getWindowHeight() - 40 );

            // todo make general and move to apex.locale. requires recent browser
            function format(n) {
                return n.toLocaleString(apex.locale.getLanguage(), {useGrouping: true, maximumFractionDigits:2}) + "ms";
            }

            theWindow = theWindow || window;
            timing = theWindow.performance.timing;

            $("body").append(perfDlg$);
            rule$ = perfDlg$.find(".apex-timeline-rule");
            time$ = perfDlg$.find(".apex-timeline-time");
            perfDlg$.dialog({
                title: text.perfTitle + ": " + theWindow.document.title,
                dialogClass: "apex-timeline-dlg ui-dialog--hud",
                modal: true,
                height: heigth,
                width: width,
                resizable: false,
                create: function() {
                    jQuery( this ).closest( ".ui-dialog" )
                        .css( "position", "fixed" );         // don't scroll the dialog with the page
                },
                open: function() {
                    var i, el$, startPos, begin, end, duration, box, p, event, label, desc, e, entries, extent, res,
                        events = [],
                        rangeBegin = timing.navigationStart,
                        rangeEnd = rangeBegin + 1000, // need some non-zero range just in case no events at all
                        w = perfDlg$.innerWidth() - 200, // leave room for labels
                        c$ = perfDlg$.children().eq(0);

                    gDialogOpen = true;
                    apex.navigation.beginFreezeScroll();

                    if ( !theWindow.apex._dtPerfSkipNavigation ) {
                        rangeEnd = Math.max( timing.loadEventEnd, timing.domContentLoadedEventEnd, timing.loadEventEnd, timing.responseEnd );
                        events.push({ begin: rangeBegin, end: rangeEnd,
                            duration: rangeEnd - rangeBegin, name: navType[theWindow.performance.navigation.type], color: "c-tl-page" } );
                        for ( i = 0; i < perfMap.length; i++ ) {
                            p = perfMap[i];
                            event = {
                                name: p[0],
                                begin: timing[p[1]]
                            };
                            if ( p[2] ) {
                                event.end = timing[p[2]];
                                event.duration = event.end - event.begin;
                            }
                            if ( event.end === 0 || event.begin === 0 || event.duration === 0 ) {
                                continue;
                            }
                            if ( p[3] ) {
                                event.color = p[3];
                            }
                            events.push( event );
                        }
                    }
                    if ( theWindow.performance.getEntries ) {
                        entries = theWindow.performance.getEntries();
                        for ( i = 0; i < entries.length; i++ ) {
                            e = entries[i];
                            if ( e.entryType === "resource" ) {
                                event = {
                                    name: e.name.replace( /\?.*$/, "" ).match( /[^\/]+$/ )[0],
                                    begin: timing.navigationStart + e.startTime,
                                    duration: e.duration,
                                    color: "c-tl-res"
                                    // todo consider size, request/response time
                                };
                            } else if ( e.entryType === "measure" ) {
                                event = {
                                    name: e.name,
                                    begin: timing.navigationStart + e.startTime,
                                    duration: e.duration,
                                    color: "c-tl-measure"
                                };
                            } else if ( e.entryType === "mark" && !/_end$|_begin$/.test( e.name ) ) {
                                event = {
                                    name: e.name,
                                    begin: timing.navigationStart + e.startTime,
                                    color: "c-tl-mark"
                                };
                            } else {
                                continue;
                            }
                            if ( e.duration ) {
                                extent = event.end = event.begin + e.duration;
                            } else {
                                extent = event.begin;
                            }
                            if ( extent > rangeEnd ) {
                                rangeEnd = extent;
                            }
                            events.push( event );
                        }
                    }
                    events.sort(function(a,b) {
                        return a.begin - b.begin;
                    });
                    if ( theWindow.apex._dtPerfSkipNavigation && events.length ) {
                        rangeBegin = events[0].begin;
                        c$.append( "<li>Time base: " + format( rangeBegin - timing.navigationStart ) + "</li>" ); // todo i18n? acc
                    }
                    scaleFactor = w / ( Math.min( (rangeEnd - rangeBegin), 10000 ) ); // cap the time window to 10sec

                    // todo consider include type of time event: page, mark, measure, resource
                    cbText += "Measure\tBegin\tEnd\tDuration\r\n"; // todo i18n?
                    cbHtml += "<table><thead><tr><th>Measure</th><th>Begin</th><th>End</th><th>Duration</th></tr></thead><tbody>";

                    for ( i = 0; i < events.length; i++ ) {
                        box = events[i];
                        label = box.name;
                        duration = box.duration || 0;
                        if ( duration ) {
                            label += " " + format( duration );
                        }
                        begin = box.begin - rangeBegin;
                        end = box.end ? box.end - rangeBegin : 0;
                        desc = box.name;
                        if ( duration ) {
                            desc += ",\r\nBegin " + format( begin ) + ",\r\nEnd " + format( end ) + ",\r\nDuration " + format( duration ) + "";
                        } else {
                            desc += ",\r\nAt " + format( begin ) + "";
                        }
                        res = box.color === "c-tl-res" ? " tl-resource" : "";
                        el$ = $("<li class='apex-timeline-entry" +
                            res + "'><span class='apex-timeline-box " + box.color + "' title='" +
                            desc + "'></span><span class='apex-timeline-label' title='" +
                            desc + "' tabindex='0'>" + label + "</span></li>");
                        startPos = scaleFactor * ( box.begin - rangeBegin );
                        el$.children().eq(0).css( {
                            marginLeft: startPos,
                            width: box.duration ? Math.max( 2, scaleFactor * box.duration ) : 2
                        } );
                        c$.append(el$);
                        cbText += box.name + "\t" + begin + "\t" + end + "\t" + duration + "\r\n";
                        cbHtml += "<tr><td>" + util.escapeHTML( box.name ) + "</td><td>" + begin + "</td><td>" + end + "</td><td>" + duration + "</td></tr>";
                    }
                    cbHtml += "</tbody></table>";
                    rule$.height( Math.max( c$.height(), perfDlg$.height()) ); // set rule height
                    apex.clipboard.addHandler( perfDlg$[0], function( dataTransfer ) {
                        dataTransfer.setData( "text/plain", cbText );
                        dataTransfer.setData( "text/html", cbHtml );
                        return true;
                    });
                },
                close: function() {
                    gDialogOpen = false;
                    apex.navigation.endFreezeScroll();
                    apex.clipboard.removeHandler( perfDlg$[0] );
                    perfDlg$.remove();
                },
                buttons: [
                    // todo consider toggle button to show/hide resource timings
                    {
                        text: text.clear,
                        click: function() {
                            var performance = theWindow.performance;
                            perfDlg$.children().eq(0).empty();
                            theWindow.apex._dtPerfSkipNavigation = true;
                            if ( performance.getEntries ) {
                                performance.clearResourceTimings();
                                performance.clearMeasures();
                                performance.clearMarks();
                            }
                        }
                    },
                    {
                        id: "apex-timeline-btn-copy",
                        text: text.copy,
                        click: function() {
                            perfDlg$.children().eq(0).focus();
                            apex.clipboard.copy();
                        }
                    },
                    {
                        "class": "ui-button--hot",
                        text: lang.getMessage( "APEX.DIALOG.CLOSE" ),
                        click: function() {
                            jQuery( this ).dialog( "close" );
                        }
                    }
                ]
            })
            .on("mousemove", function(event) {
                var w, h,
                    dlgWidth = perfDlg$.width() - 4 - util.getScrollbarSize().width,
                    dlgHeight = perfDlg$.height() - util.getScrollbarSize().width,
                    offset = perfDlg$.offset(),
                    l = event.pageX - offset.left + perfDlg$[0].scrollLeft,
                    t = event.pageY - offset.top - 28 + perfDlg$[0].scrollTop;

                if ( t < 0 ) {
                    t = 0;
                }
                if ( l > dlgWidth + perfDlg$[0].scrollLeft ) {
                    l = dlgWidth + perfDlg$[0].scrollLeft;
                }
                rule$.css("left", l + 2 );
                time$.text( format( l / scaleFactor ) );
                h = time$.height();
                w = time$.width();
                if ( t + h > dlgHeight + perfDlg$[0].scrollTop ) {
                    t = dlgHeight + perfDlg$[0].scrollTop - h;
                }
                if ( l + w + 40 > dlgWidth ) {
                    l -= w + 10;
                } else {
                    l += 10;
                }
                time$.css( {
                    left: l,
                    top: t
                } );
            })
            .on("mouseenter", function() {
                rule$.show();
                time$.show();
            })
            .on("mouseleave", function() {
                rule$.hide();
                time$.hide();
            });
        }

        function updateGrid( show ) {
            var state = show ? "on" : "off";

            debugGrid = show;
            $( document ).trigger( "apex-devbar-grid-debug-" + state );
            gDevToolbarSessionStore.setItem( "grid", state );
        }

        updateGrid( gDevToolbarSessionStore.getItem( "grid" ) === "on" );

        // if a JavaScript error happend before this module loaded the core module should have set this flag.
        if ( apex._pageHasErrors ) {
            apex._dtNotifyErrors();
        }

        // if this page is in an iframe (or frame) don't show the toolbar but do let the toolbar on the top window handle this page
        if ( self.apex !== util.getTopApex() ) {
            if ( util.getTopApex().initNestedDevToolbar ) {
                util.getTopApex().initNestedDevToolbar( $( SEL_DEV_TOOLBAR ), window, components, windowMgmtMode, text, themeId );
            }
            // If TR exists on the parent window, register this TR instance as a child
            // This TR instance Will receive instructions to modify the style of the
            // document appropriately.
            if ( util.getTopApex().utr ) {
                window.apex.utr = {
                    nested: true
                };
                var onUTRLoad = function() {
                    if ( window.apex.utr.nest ) {
                        util.getTopApex().utr.nest && util.getTopApex().utr.nest( window.apex.utr );
                    } else {
                        setTimeout( onUTRLoad, 100 );
                    }
                };
                $.getScript( THEMEROLLER_BASE + "utr-base.js", onUTRLoad );
            }

            return;
        }

        var onThemeRollerLoad = getThemeRollerInit( themeId, getBuilderInstance(), function() { $.universalThemeRoller('open'); } );

        // utr-base must ALWAYS be loaded for proper iframe (read: modal) support.
        $.getScript( THEMEROLLER_BASE + 'utr-base.js', function(){
            // Load ThemeRoller scripts if it was already open.
            if ( gThemeRollerSessionStore.getItem( 'OPENED' ) === 'true' ) {
                $.getScript( THEMEROLLER_BASE + 'jquery.universalThemeRoller.js', onThemeRollerLoad );
            }
        });

        $( "#apexDevToolbarHome" ).click( function() {
            getContext().builderWindow( "home" );
        });

        $( SEL_DT_APP ).click( function() {
            getContext().builderWindow( "app" );
        });

        $( SEL_DT_PAGE ).click( function() {
            var ctx = getContext();

            // first try to tell the page designer what app and page
            ctx.navigateInPageDesigner( ctx.currentApp, ctx.currentPage, null, null, function() {
                // if that fails navigate to correct place
                ctx.builderWindow( "page" );
            } );
        });

        $( "#apexDevToolbarSession" ).click( function() {
            getContext().popup( "session" );
        });

        $( "#apexDevToolbarViewDebug" ).click( function() {
            getContext().popup( "viewDebug" );
        });

        $( SEL_DT_DEBUG ).click( function() {
            getContext().sameWindow( "debug" );
        });

        $( SEL_DT_QUICKEDIT ).off( "click" ).click( function() {
            getContext().quickEdit();
        });

        $( "#apexDevToolbarThemeRoller" ).off( "click" ).click( function() {
            getContext().themeRoller();
        });

        infoMenu$.menu( {
            items: [
                { type: "toggle", onLabel: text.gridDebugOff, offLabel: text.gridDebugOn, get: function() {
                    return debugGrid;
                }, set: function( v ) {
                    updateGrid( v );
                } },
                { type: "action", label: text.showPerf, hide: !gHasPerfAPI,
                    disabled: function() { return gDialogOpen; },
                    action: function() {
                        displayPageTiming( getContext().window );
                    }
                }
            ],
            beforeOpen: function() {
                menuOpen = true;
            }
        } );

        optionsMenu$.menu({
            items: [
                { type: "toggle", label: text.autoHide, get: function () {
                    return autoHide;
                }, set: function ( v ) {
                    autoHide = v;
                    saveOptions();
                    $( SEL_DEV_TOOLBAR ).toggleClass( "a-DevToolbar--autoHide", autoHide );
                } },
                { type: "toggle", label: text.iconsOnly, get: function () {
                    return iconsOnly;
                }, set: function ( v ) {
                    iconsOnly = v;
                    saveOptions();
                    $( SEL_DEV_TOOLBAR ).toggleClass( "a-DevToolbar--iconsOnly", iconsOnly );
                    fixToolbarWidth();
                } },
                { type: "subMenu", label: text.display, menu: { items: [
                    {
                        type: "radioGroup",
                        get: function () {
                            return displayPosition;
                        },
                        set: function ( pValue ) {
                            displayPosition = pValue;
                            saveOptions();
                            $( SEL_DEV_TOOLBAR ).removeClass( C_ALL_POSITIONS )
                                .addClass( "a-DevToolbar--" + displayPosition );
                            fixToolbarWidth();
                        },
                        choices: [
                            { label: text.displayTop, value: "top" },
                            { label: text.displayLeft, value: "left" },
                            { label: text.displayBottom,  value: "bottom" },
                            { label: text.displayRight,  value: "right" }
                        ]
                    }
                ]}
                }
            ],
            beforeOpen: function() {
                menuOpen = true;
            }
        });

        loadOptions();

        $( SEL_DEV_TOOLBAR )
            .toggleClass( "a-DevToolbar--iconsOnly", iconsOnly )
            .toggleClass( "a-DevToolbar--autoHide", autoHide )
            .removeClass( C_ALL_POSITIONS )
            .addClass( "a-DevToolbar--" + displayPosition )
            .on( "focusin", function() {
                focused = true;
                menuOpen = false;
                $( this ).addClass( C_ACTIVE );
            }).on( "focusout", function() {
                focused = false;
                if ( !menuOpen ) {
                    $( this ).removeClass( C_ACTIVE );
                }
            }).on( "mouseenter", function() {
                if ( hideTimer !== null ) {
                    clearTimeout( hideTimer );
                    hideTimer = null;
                }
                $( this ).addClass( C_ACTIVE );
            }).on( "mouseleave", function() {
                var self = this;
                hideTimer = setTimeout( function() {
                    hideTimer = null;
                    if ( !focused && !menuOpen ) {
                        $( self ).removeClass( C_ACTIVE );
                    }
                }, 1000 );
            }).show();

        pushContext();
        setContext( $( SEL_DEV_TOOLBAR ), window, components, windowMgmtMode, text, themeId );

        $( window ).on( "apexwindowresized", function() {
            fixToolbarWidth();
        });

        $( document.body ).on( "dialogopen", function() {
            pushContext(); // it may or may not be an APEX page, won't know till it loads but push a new context anyway
        } ).on( "dialogclose", function() {
            popContext();
        } );

    };

})( apex, apex.jQuery, apex.util, apex.navigation, apex.storage, apex.lang, apex.message, apex.debug );

