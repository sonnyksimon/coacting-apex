/*global window.PageDesigner, apex, $v, pe*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 *
 * This file creates a Spotlight search dialog in App Builder.
 * There are two ways to open it:
 *   1. click the search icon on the top right
 *   2. Shortcut: Ctrl + '
 *
 * It always searches a static JSON file for navigation and
 * a dynamic list of Apps / Pages depending on page.
 *
 * There is no namespace created.
 *
 * Examples of JSON index format:
 * [
    {
        "n": "Sample Database Application",
        "appId": "1000"
    },

    {
        "n": "Customer Order Page",
        "pageId": "200"
    },

    {
        "n": "Shared Components",
        "u": "4000:9",
        "icon": "icon-shared-components",
        "d": "description",
        "t": "reusable"
        // Token, a descriptive text for this entry to be searched, comes from builder lists
    },

    {
        "n": Search Team Development",
        "u": "f?p=4800:8000:..."
    }
  ]
 *
 **/

$( function () {
    "use strict";

    (function( $, util, nav, lang, actions ){
        var appId   = $v( 'pFlowId');

        // Disable Spotlight for:
        // 1. Modal Dialog
        // 2. "Instance Administration" app.
        if ( ( window.self !== window.top ) || ( appId === '4050' ) ) {
            return false;
        }
            // pe.model.js is loaded after this file in Page Designer 4000:4500
        if ( typeof pe !== 'undefined' ) {
            var model = pe;
        }

        var URL_TYPES = {
                redirect:           'redirect',
                searchPage:         'search-page',
                searchApp:          'search-app',
                searchAllApps:      'search-all-apps',
                go2Page:            'goto-page',
                go2App:             'goto-app',
                pe:                 'pe',
                shortcutAction:     'shortcutAction'
            },

            ICONS = {
                app:    'icon-edit-app',
                page:   'icon-page',
                search: 'icon-search',
                shared: 'icon-shared-components',
                nav:    'icon-goto-group',
                pe:     'icon-page-designer'
            },

            DOT = '.',
            SP_DIALOG           = 'a-Spotlight',
            SP_INPUT            = 'a-Spotlight-input',
            SP_RESULTS          = 'a-Spotlight-results',
            SP_ACTIVE           = 'is-active',
            SP_SHORTCUT         = 'a-Spotlight-shortcut',
            SP_ACTION_SHORTCUT  = 'spotlight-search',
            SP_RESULT_LABEL     = 'a-Spotlight-label',
            SP_LIVE_REGION      = 'sp-aria-match-found',
            SP_LIST             = 'sp-result-list',
            KEYS                = $.ui.keyCode;

        var MAX_NAV_RESULTS     = 50,
            MAX_PE_RESULTS      = 50;

        var session = $v( 'pInstance' ),
            // The app opened in Page Designer or in shared components / app utilities
            currentAppId = $v('F4000_P1_FLOW') || $v('P4500_CURRENT_APP') || apex.builder.gApplicationId,

            hasDialogCreated = $( DOT + SP_DIALOG ).length > 0,
            searchIndex = [],
            appIdNameMapping = {}, // stores appId and name mapping to support numeric search that displays app name in result
            keywords = '';

        var location = function() {
            // 8 Internal Apps that have Spotlight search with Page Process: spotlightIndex
            // 4000 App Builder
            // 4300 Data Workshop
            // 4350 APEX Workspace Administration
            // 4400 App Migrations
            // 4500 SQL Workshop
            // 4750 Packaged Applications
            // 4800 Team Development
            // 4850 RESTful Services

            var LOCATIONS = {
                4000: 'builder',
                4500: 'builder', // SQL Workshop
                4800: 'teamdev',
                4350: 'admin'
            };
            return LOCATIONS[ appId ];
        }();

        var msg = lang.formatMessage,
            staticMsg = {
                app: lang.getMessage( 'SL.APP' ),
                page: lang.getMessage( 'SL.PAGE' ),
                placeHolder: lang.getMessage( 'SL.PLACEHOLDER' ),
                oneMatchFound: lang.getMessage( 'SL.MATCH.FOUND' ),
                noMatchFound:  lang.getMessage( 'SL.NO.MATCH.FOUND' ),
                enterKeywords: 'Please enter at least two letters to search' // todo: add translation string
            };

        // returns APEX format URL
        var getUrl = function( url ){
            var u;

            if ( isNaN( url.split( ':' )[0] )  ) {
                u = url;
            } else {
                // e.g. url is 4000:1 format
                u = 'f?p=' + url + ':' + session;
            }
            return u;
        };

        // the focus before Spotlight dialog is opened
        var focusElement;

        var getMarkup = function ( data ) {
            var title = data.title,
                desc = data.desc || '',
                url = data.url,
                type = data.type,
                icon = data.icon,
                shortcut = data.shortcut,
                shortcutMarkup = shortcut ? '<span class="' + SP_SHORTCUT + '" >' + shortcut + '</span>' : '',
                dataAttr = '',
                peData = data.peData,
                peAttr,
                out;

            if ( url === 0 || url ) {
                dataAttr = 'data-url="' + url + '" ';
            }

            if ( type ) {
                dataAttr = dataAttr + ' data-type="' + type + '" ';
            }

            if ( peData ) {
                for ( peAttr in peData ) {
                    if ( peData.hasOwnProperty( peAttr ) ) {
                        dataAttr = dataAttr + ' data-' + peAttr + '="' + peData[ peAttr ] + '" ';
                    }
                }
            }

            out = '<li class="a-Spotlight-result a-Spotlight-result--page">' +
                '<span class="a-Spotlight-link" ' + dataAttr + '>' +
                    '<span class="a-Spotlight-icon" aria-hidden="true">' +
                        '<span class="a-Icon ' + icon + '"></span>' +
                    '</span>' +
                    '<span class="a-Spotlight-info">' +
                        '<span class="' + SP_RESULT_LABEL + '" role="option">' + title + '</span>' +
                        '<span class="a-Spotlight-desc">' + desc + '</span>' +
                    '</span>' +
                    shortcutMarkup +
                '</span>' +
                '</li>';

            return out;
        };

        // @param {obj} elem$ is <a> link
        var goTo = function( elem$, event ){

            var url = elem$.data( 'url' ),
                type = elem$.data( 'type' ),
                actionLookup;

            switch ( type ) {
                case URL_TYPES.pe:
                    window.pageDesigner.goToComponent( elem$.data( 'typeid' ), elem$.data( 'componentid' ), elem$.data( 'propertyid' ) );
                    break;

                case URL_TYPES.searchPage:
                    $( '#editor_tabs' ).tabs( 'option', 'active', 3 );
                    $( '#P4500_LOCAL_SEARCH' )
                        .val( keywords )
                        .trigger( 'change' )
                        .focus();
                    break;

                case URL_TYPES.searchApp:
                    nav.popup( {
                        url: 'f?p=4000~8000~' + session + '~~~~P8000_START_SEARCH,P8000_SEARCH~1,' + encodeURIComponent( keywords ) + '&p_sep=~',
                        name: 'SEARCH_RESULTS',
                        width: 1000,
                        height: 800
                    } );
                    break;

                case URL_TYPES.searchAllApps:
                    nav.popup( {
                        url: 'f?p=4000~8000~' + session + '~~~~FB_FLOW_ID,FB_FLOW_PAGE_ID,P8000_START_SEARCH,P8000_SEARCH~,,1,' + encodeURIComponent( keywords ) + '&p_sep=~',
                        name: 'SEARCH_RESULTS',
                        width: 1000,
                        height: 800
                    } );
                    break;

                case URL_TYPES.go2App:
                    nav.redirect( 'f?p=4000:1:' + session + '::NO::FB_FLOW_ID,F4000_P1_FLOW,P0_FLOWPAGE:' + url + ',' + url + ',' + url );
                    break;

                case URL_TYPES.go2Page:
                    if ( window.pageDesigner ) {
                        window.pageDesigner.goToPage( url );
                    } else {
                        nav.redirect( 'f?p=4000:4150:' + session + '::NO::FB_FLOW_PAGE_ID:' + url );
                    }
                    break;

                case URL_TYPES.redirect:
                    nav.redirect( getUrl( url ) );
                    break;

                case URL_TYPES.shortcutAction:
                    actionLookup = actions.lookup( url );
                    if ( actionLookup.action || actionLookup.href ) {
                        actions.invoke( url, event, focusElement );
                    } else {
                        actions.toggle( url );
                    }
                    break;
            }

            close();
        };

        // PE search
        var searchPe = function( pSearchExpr, pTypeId ) {

            var peResults,
                component,
                componentTypeId,
                lType,
                i, len, lHtml = '';

            var getType = function ( pTypeId ) {
                return model.getComponentType( pTypeId )
            };

            var getPeResults =  function ( pSearchExpr, pTypeId ) {
                var lComponents,
                    lType = getType( pTypeId ),
                    i, len;

                lComponents = model.displayTitleSearch( pSearchExpr, pTypeId );

                // Check all child component types
                if ( lType ) {
                    len = lType.childComponentTypes.length;
                    for ( i = 0; i < len; i++ ) {
                        lComponents = $.merge( getPeResults( pSearchExpr, lType.childComponentTypes[ i ] ), lComponents );
                    }
                }

                return lComponents;
            };

            peResults = getPeResults( pSearchExpr, pTypeId );

            if ( peResults.length > MAX_PE_RESULTS ) {
                peResults.length = MAX_PE_RESULTS;
            }

            for ( i = 0, len = peResults.length; i < len; i++ ) {
                component = peResults[ i ];
                componentTypeId = component.typeId;
                lType = getType( componentTypeId );
                lHtml += getMarkup( {
                    title: util.escapeHTML( lType.title.singular ) + ' &rarr; ' + util.escapeHTML( component.getDisplayTitle() ),
                    icon: ICONS.pe,
                    type: URL_TYPES.pe,
                    peData: {
                        typeid: componentTypeId,
                        componentid: component.id,
                        propertyid: lType.displayPropertyId
                    }
                });
            }

            return lHtml;

        };

        var reset = function() {
            $( '#' + SP_LIST ).empty();
            $( DOT + SP_INPUT ).val( '' ).focus();
            keywords = '';
            handleAriaAttr();
        };

        var handleAriaAttr = function () {

            var results$ = $( DOT + SP_RESULTS ),
                input$ = $( DOT + SP_INPUT ),
                activeId = results$.find( DOT + SP_ACTIVE ).find( DOT + SP_RESULT_LABEL ).attr( 'id' ),
                activeElem$ = $( '#' + activeId ),
                activeText = activeElem$.text(),
                lis$ = results$.find( 'li' ),
                isExpanded = lis$.length !== 0,
                liveText = '',
                resultsCount = lis$.filter(function () {
                    // Exclude the global inserted <li>, which has shortcuts Ctrl + 1, 2, 3
                    // such as "Search Workspace for x".
                    return $( this ).find( DOT + SP_SHORTCUT ).length === 0;
                }).length;

            $( DOT + SP_RESULT_LABEL )
                .attr( 'aria-selected', 'false' );

            activeElem$
                .attr( 'aria-selected', 'true' );

            if ( keywords === '' ) {
                liveText = staticMsg.enterKeywords;
            } else if ( resultsCount === 0 ) {
                liveText = staticMsg.noMatchFound;
            } else if ( resultsCount === 1 ) {
                liveText = staticMsg.oneMatchFound;
            } else if ( resultsCount > 1 ) {
                liveText = msg( 'SL.N.MATCHES.FOUND', resultsCount );
            }

            liveText = activeText + ', ' + liveText;

            $( '#' + SP_LIVE_REGION ).text( liveText );

            input$
                // .parent()  // aria 1.1 pattern
                .attr( 'aria-activedescendant', activeId )
                .attr( 'aria-expanded',         isExpanded );
        };

        var createDialog = function () {
            var viewHeight,
                lineHeight,
                viewTop,
                rowsPerView;

            var initHeights = function () {
                var viewTop$ = $( 'div.a-Spotlight-results' );

                viewHeight = viewTop$.outerHeight();
                lineHeight = $( 'li.a-Spotlight-result' ).outerHeight();
                viewTop = viewTop$.offset().top;
                rowsPerView = ( viewHeight / lineHeight );
            };

            var scrolledDownOutOfView = function ( elem$ ) {
                if ( elem$[0] ) {
                    var top = elem$.offset().top;
                    if ( top < 0 ) {
                        return true;  // scroll bar was used to get active item out of view
                    } else {
                        return top > viewHeight;
                    }
                }
            };

            var scrolledUpOutOfView = function ( elem$ ) {
                if ( elem$[0] ) {
                    var top = elem$.offset().top;
                    if (top > viewHeight) {
                        return true;  // scroll bar was used to get active item out of view
                    } else {
                        return top <= viewTop;
                    }
                }
            };

            // keyboard UP and DOWN support to go through results
            var getNext = function ( res$ ) {
                var current$ = res$.find( DOT + SP_ACTIVE),
                    sequence = current$.index(),
                    next$;
                if ( !rowsPerView ) {
                    initHeights();
                }

                if ( !current$.length || current$.is(':last-child') ) {
                    // Hit bottom, scroll to top
                    current$.removeClass( SP_ACTIVE );
                    res$.find( 'li' ).first().addClass( SP_ACTIVE );
                    res$.animate({
                        scrollTop:  0
                    });
                } else {
                    next$ = current$.removeClass( SP_ACTIVE).next().addClass( SP_ACTIVE );
                    if ( scrolledDownOutOfView( next$ ) ) {
                        res$.animate({
                            scrollTop: ( sequence - rowsPerView + 2 ) * lineHeight
                        }, 0);
                    }
                }
            };

            var getPrev = function ( res$ ) {
                var current$ = res$.find( DOT + SP_ACTIVE),
                    sequence = current$.index(),
                    prev$;

                if ( !rowsPerView ) {
                    initHeights();
                }

                if ( !res$.length || current$.is(':first-child') ) {
                    // Hit top, scroll to bottom
                    current$.removeClass( SP_ACTIVE );
                    res$.find( 'li' ).last().addClass( SP_ACTIVE );
                    res$.animate({
                        scrollTop:  res$.find( 'li' ).length * lineHeight
                    });
                } else {
                    prev$ = current$.removeClass( SP_ACTIVE).prev().addClass( SP_ACTIVE );
                    if ( scrolledUpOutOfView( prev$ ) ) {
                        res$.animate({
                            scrollTop: ( sequence - 1 ) * lineHeight
                        }, 0);
                    }
                }
            };

            $( window ).on( 'apexwindowresized', function () {
                initHeights();
            });

            $( 'body' )
                .append(
                    '<div class="' + SP_DIALOG + '">' +
                        '<div class="a-Spotlight-body">' +
                            '<div class="a-Spotlight-search">' +
                                '<div class="a-Spotlight-icon">' +
                                    '<span class="a-Icon icon-search" aria-hidden="true"></span>' +
                                '</div>' +
                                '<div class="a-Spotlight-field">' +
                                    '<input type="text" role="combobox" aria-expanded="false" aria-autocomplete="none" aria-haspopup="true" aria-label="Spotlight Search" aria-owns="' + SP_LIST + '" autocomplete="off" autocorrect="off" spellcheck="false" class="' + SP_INPUT + '" placeholder="' + staticMsg.placeHolder + '">' +
                                '</div>' +
                                '<div role="region" class="u-VisuallyHidden" aria-live="polite" id="' + SP_LIVE_REGION + '"></div>' +
                            '</div>' +
                            '<div class="' + SP_RESULTS + '">' +
                                '<ul class="a-Spotlight-resultsList" id="' + SP_LIST + '" tabindex="-1" role="listbox"></ul>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                )
                .on( 'input', DOT + SP_INPUT, function(){
                    var v = $( this ).val().trim(),
                        len = v.length;

                    if ( len === 0 ) {
                        reset();  // clears everything when keyword is removed.
                    } else if (len > 1 || !isNaN( v )) {
                        // search requires more than one character, or it is a number.
                        if (  v !== keywords ) {
                            search( v );
                        }
                    }
                })
                .on( 'keydown', DOT + SP_DIALOG, function( e ){
                    var results$ = $( DOT + SP_RESULTS ),
                        last4Results,
                        shortcutNumber;

                    // up/down arrows
                    switch ( e.which ) {
                        case KEYS.DOWN:
                            e.preventDefault();
                            getNext( results$ );
                            break;

                        case KEYS.UP:
                            e.preventDefault();
                            getPrev( results$ );
                            break;

                        case KEYS.ENTER:
                            e.preventDefault(); // don't submit on enter
                            goTo( results$.find( 'li.is-active span'), e );
                            break;
                        case KEYS.TAB:
                            close();
                            break;
                    }

                    if ( e.ctrlKey ) {
                        // supports Ctrl + 1, 2, 3, 4 shortcuts
                        last4Results = results$.find( DOT + SP_SHORTCUT ).parent().get().reverse();
                        switch ( e.which ) {
                            case 49: // Ctrl + 1
                                shortcutNumber = 1;
                                break;
                            case 50: // Ctrl + 2
                                shortcutNumber = 2;
                                break;

                            case 51: // Ctrl + 3
                                shortcutNumber = 3;
                                break;

                            case 52: // Ctrl + 4
                                shortcutNumber = 4;
                                break;
                        }

                        if ( shortcutNumber ) {
                            goTo( $( last4Results[ shortcutNumber - 1 ] ), e );
                        }
                    }

                    // Shift + Tab to close and focus goes back to where it was.
                    if ( e.shiftKey ) {
                        if ( e.which === KEYS.TAB ) {
                            close();
                        }
                    }

                    handleAriaAttr();

                })
                .on( 'click', 'span.a-Spotlight-link', function( e ){
                    goTo( $( this ), e );
                })
                .on( 'mousemove', 'li.a-Spotlight-result', function(){
                    var highlight$ = $( this );
                    highlight$
                        .parent()
                        .find( DOT + SP_ACTIVE )
                        .removeClass( SP_ACTIVE );

                    highlight$.addClass( SP_ACTIVE);
                    // handleAriaAttr();
                })
                .on( 'blur', DOT + SP_DIALOG, function(e) {
                    // don't do this if dialog is closed/closing
                    if ( $( DOT + SP_DIALOG ).dialog( "isOpen" ) ) {
                        // input takes focus dialog loses focus to scroll bar
                        $( DOT + SP_INPUT ).focus();
                    }
                });

            // Escape key pressed once, clear field, twice, close dialog.
            $( DOT + SP_DIALOG ).on( 'keydown', function ( e ) {
                var input$ = $( DOT + SP_INPUT );
                if ( e.which === KEYS.ESCAPE ){
                    if ( input$.val() ) {
                        reset();
                        e.stopPropagation();
                    } else {
                        close();
                    }
                }
            });

            hasDialogCreated = true;
        };

        var addIndex = function( obj ){
            var actionsList,
                shortcutDisplay = '',
                actionLookup,
                action,
                actionName,
                i;

            searchIndex = obj;

            // Add all actions on the page so they can be searched.
            actionsList   = actions.list();

            for ( i = 0; i < actionsList.length; i++  ) {
                action = actionsList[ i ];
                actionName = action.name;
                if ( actionName !== SP_ACTION_SHORTCUT ) {

                    actionLookup = actions.lookup( actionName );
                    if ( actionLookup ) {
                        shortcutDisplay = actions.shortcutDisplay( actionLookup.shortcut || '' );
                    }

                    searchIndex.push({
                        "n":                action.label,
                        "d":                shortcutDisplay,
                        "shortcutAction":   actionName,
                        "type":             URL_TYPES.shortcutAction
                    });
                }
            }
        };

        var open = function( pFocusElement ){
            var openDialog = function() {
                var dlg$ = $( DOT + SP_DIALOG ),
                    scrollY = window.scrollY || window.pageYOffset;
                if ( !dlg$.hasClass( 'ui-dialog-content' ) || !dlg$.dialog("isOpen") ) {
                    dlg$.dialog({
                        width: 650,
                        height: 'auto',
                        modal: true,
                        position: {my: "center top", at: "center top+" + ( scrollY + 64 ), of: $('body')},
                        dialogClass: 'ui-dialog--apexspotlight',
                        open: function () {
                            var dlg$ = $( this );

                            dlg$
                                .css( 'min-height', 'auto' )
                                .prev( '.ui-dialog-titlebar' )
                                .remove();

                            nav.beginFreezeScroll();

                            $( '.ui-widget-overlay' ).on('click', function () {
                                close();
                            });
                        },
                        close: function () {
                            reset();
                            nav.endFreezeScroll();
                        }
                    });
                }
            };

            if ( hasDialogCreated ) {
                openDialog();
            } else {
                createDialog();
                openDialog();
                apex.server.process('spotlightIndex', {
                    x01: currentAppId
                }, {
                    success: function( pData ) {
                        addIndex( pData );
                    },
                    error: function( pData ) {
                    }
                });
            }
            focusElement = pFocusElement;  // could be useful for shortcuts added by apex.action
        };

        var close = function(){
            $(DOT + SP_DIALOG).dialog( 'close' );
        };

        // Add menus to results set, based on page context
        var resultsAddOns = function( results ){
            var kw_url = encodeURIComponent( keywords ),
                kw_ui = keywords,
                searchItem,
                lArray,
                lAppPagePattern   = /^(\d+)(?::|-)(\d+)$/, // supports either colon or hyphen separated numeric values
                lAppSharedPattern = /^(\d+)(?::|-)[Ss]$/;  // 123:s  =>  go to shared components of app 123

            var getAppIdAndName = function( appId ){
                var name = appIdNameMapping[ appId ],
                    out = '';
                if ( name ) {
                    out = name + ' (' + appId + ')';
                } else {
                    out = appId;
                }
                return out;
            };

            // 1. Supports AppID:PageId or AppId:s
            if ( lAppPagePattern.test( keywords )) {
                lArray = keywords.match( lAppPagePattern );
                results.push( {
                    n: msg( 'SL.EDIT.PAGE.IN.APP', lArray[2], lArray[1] ),
                    u: 'f?p=4000:4500:' + session + '::NO::FB_FLOW_ID,FB_FLOW_PAGE_ID:' + lArray[ 1 ] + ',' + lArray[ 2 ],
                    icon: ICONS.page,
                    type: URL_TYPES.redirect
                });
            } else if ( lAppSharedPattern.test( keywords )) {
                lArray = keywords.match( lAppSharedPattern );
                results.push( {
                    n: msg( 'SL.SHARED.COMP.APP', lArray[1] ),
                    u: 'f?p=4000:9:' + session + '::NO::FB_FLOW_ID:' + lArray[1],
                    icon: ICONS.shared,
                    d: 'Go to Shared components',
                    type: URL_TYPES.redirect
                });
            }

            // keyword is number, go to Page id or App Id
            if ( !isNaN( kw_ui ) ) {

                // Page Id and App Id, if currentAppId is available
                if ( Object.keys( appIdNameMapping ).length === 0 ) {
                    for ( var i = 0; i < searchIndex.length; i++ ) {
                        searchItem = searchIndex[ i ];
                        if ( searchItem.appId ) {
                            appIdNameMapping[ searchItem.appId ] = searchItem.n;
                        }
                    }
                }

                if ( currentAppId ) {
                    results.push( {
                        n: msg( 'SL.EDIT.PAGE.IN.APP', kw_ui, getAppIdAndName( currentAppId ) ),
                        icon: 'icon-edit',
                        pageId: kw_ui
                    });
                }

                // Just app Id
                results.push( {
                    n: msg( 'SL.GO.TO.APP', getAppIdAndName( kw_ui ) ),
                    icon: ICONS.app,
                    appId: kw_ui
                });
            }

            // 2. nav menus based on page
            switch ( location  ) {
                case 'builder':
                    if ( currentAppId || model ) {

                        // in Page Designer
                        if ( model ) {
                            results.push( {
                                n: msg( 'SL.SEARCH.PAGE', kw_ui ),
                                type: URL_TYPES.searchPage,
                                icon:  ICONS.search,
                                shortcut: 'Ctrl + 4'
                            });
                        }
                        // app list
                        results.push( {
                            n: msg( 'SL.SEARCH.APP', kw_ui ),
                            type: URL_TYPES.searchApp,
                            icon:  ICONS.search,
                            shortcut: 'Ctrl + 3'
                        });

                    }
                    break;

                case 'teamdev':
                    results.push( {
                        n: msg( 'SL.SEARCH.TEAM.DEV', kw_ui ),
                        u: 'f?p=4800:8000:' + session + ':::RIR:IR_ROWFILTER:' + kw_url,
                        icon: ICONS.search,
                        type: URL_TYPES.redirect
                    });
                    break;

                case 'admin':
                    results.push( {
                        n: msg( 'SL.SEARCH.USER', kw_ui ),
                        u: 'f?p=4350:8000:' + session + ':::RIR:IR_ROWFILTER:' + kw_url,
                        icon: 'icon-user',
                        type: URL_TYPES.redirect
                    });
                    break;
            }

            // 3. Global menu
            results.push( {
                n: msg( 'SL.SEARCH.ALLAPPS', kw_ui ),
                type: URL_TYPES.searchAllApps,
                icon:  ICONS.search,
                shortcut: 'Ctrl + 2'
            });

            results.push( {
                n: msg( 'SL.SEARCH.WP', kw_ui ),
                u: 'f?p=4500:8000:' + session + ':::RIR:IR_ROWFILTER:' + kw_url,
                icon: ICONS.search,
                type: URL_TYPES.redirect,
                shortcut: 'Ctrl + 1'
            });

            return results;
        };

        var searchNav = function ( patterns ) {

            var navResults = [],
                hasResults = false,
                pattern,
                patternLength = patterns.length,
                i;

            var narrowedSet = function(){
                return hasResults ? navResults : searchIndex;
            };

            var getScore = function( pos, wordsCount, fullTxt ){
                var score = 100,
                    spaces = wordsCount - 1,
                    positionOfWholeKeywords;

                if ( pos === 0 && spaces === 0 ) {
                    // perfect match ( matched from the first letter with no space )
                    return score;
                } else {
                    // when search 'sql c', 'SQL Commands' should score higher than 'SQL Scripts'
                    // when search 'script', 'Script Planner' should score higher than 'SQL Scripts'
                    positionOfWholeKeywords = fullTxt.indexOf( keywords );
                    if ( positionOfWholeKeywords === -1 ) {
                        score = score - pos - spaces - wordsCount ;
                    } else {
                        score = score - positionOfWholeKeywords;
                    }
                }

                return score;
            };

            for ( i = 0; i < patterns.length; i++ ) {
                pattern = patterns[ i ];

                navResults = narrowedSet()
                    .filter(function( elem, index ){
                        var name = elem.n.toLowerCase(),
                            wordsCount = name.split( ' ' ).length,
                            position = name.search( pattern );

                        if ( patternLength > wordsCount ) {
                            // keywords contains more words than string to be searched
                            return false;
                        }

                        if ( position > -1 ) {
                            elem.score = getScore( position, wordsCount, name );
                            return true;
                        } else if ( elem.t ) { // tokens (short description for nav entries.)
                            if ( elem.t.search( pattern ) > -1 ) {
                                elem.score = 1;
                                return true;
                            }
                        }

                    })
                    .sort( function ( a, b ) {
                        return b.score - a.score;
                    });

                hasResults = true;
            }

            var formatNavResults = function( res ){
                var out = '',
                    i,
                    item,
                    desc,
                    url,
                    type,
                    icon,
                    shortcut,
                    entry = {};

                if ( res.length > MAX_NAV_RESULTS ) {
                    res.length = MAX_NAV_RESULTS;
                }

                for (i = 0; i < res.length; i++) {
                    item = res[ i ];

                    shortcut = item.shortcut;

                    if( item.appId ) {
                        type = URL_TYPES.go2App;
                        url  = item.appId;
                        desc = '';
                        icon = ICONS.app;
                    } else if ( item.pageId === 0 || item.pageId ) {
                        // pageId could be Page 0, which is treated as false in JS
                        type = URL_TYPES.go2Page;
                        url  = item.pageId;
                        desc = staticMsg.app + ' ' + currentAppId + ' &#92; ' + staticMsg.page + ' ' + url;
                        icon = ICONS.page;
                    } else {
                        type = item.type || URL_TYPES.redirect;
                        url  = item.u || item.shortcutAction;
                        desc = item.d;
                        icon = item.icon || ICONS.nav;
                    }

                    entry = {
                        title: item.n,
                        desc: desc,
                        url: url,
                        icon: icon,
                        type: type
                    };

                    if ( shortcut ) {
                        entry.shortcut = shortcut;
                    }

                    out = out + getMarkup( entry );
                }
                return out.replace( '{APP_ID}', currentAppId );
            };

            return formatNavResults( resultsAddOns( navResults ) );
        };

        var search = function( k ){
            var PREFIX_ENTRY = 'sp-result-';
            // store keywords
            keywords =  k.trim();

            var words = keywords.split( ' ' ),
                res$ = $( DOT + SP_RESULTS ),
                patterns = [],
                navOuput,
                peOutput = '',
                i;
            for ( i = 0; i< words.length; i++ ) {
                // store keys in array to support space in keywords for navigation entries,
                // e.g. 'sta f' finds 'Static Application Files'
                patterns.push( new RegExp( util.escapeRegExp( words[i] ), 'gi') );
            }

            navOuput = searchNav( patterns );

            if ( model && model.getCurrentPageId() ) {
                // getCurrentPageId check is needed to avoid JS error in console
                // when user uses search after opens up to a non-existent page in Page Designer.
                peOutput = searchPe( patterns[0], model.COMP_TYPE.PAGE );
            }

            $( '#' + SP_LIST )
                .html( peOutput + navOuput )
                .find( 'li' )
                .each(function ( i ) {
                    var that$ = $( this );
                    that$
                        .find( DOT + SP_RESULT_LABEL )
                        .attr( 'id', PREFIX_ENTRY + i );    // for accessibility
                })
                .first()
                .addClass( SP_ACTIVE );
        };

        // define an action for the spotlight button and a keyboard shortcut
        actions.add( {
            name: SP_ACTION_SHORTCUT,
            label: null, // take label and title from button
            title: null,
            shortcut: "Ctrl+Quote",
            action: function( event, focusElement ) {
                open( focusElement );
                return true;
            }
        } );

    })( apex.jQuery, apex.util, apex.navigation, apex.lang, apex.actions );
});