/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * The {@link apex.widget}.apexTabs is used for tab or tab-like widgets in Oracle Application Express.
 *
 **/
/*global apex*/
(function( $, lang ) {
    "use strict";
    // Remember these constants.
    var SHOW_ALL = "#SHOW_ALL",
        C_TABS = "a-Tabs",
        C_TAB_PANEL = C_TABS + "-panel",
        A_SELECTED = "aria-selected",
        A_CONTROLS = "aria-controls",
        A_HIDDEN = "aria-hidden",
        HINT_CLASS = "item--hint",
        AFTER_CLASS = "after",
        BEFORE_CLASS = "before",
        DEFAULT_SELECTED_CLASS = "selected",
        ELEMENT_SELECTED_CLASS = "element-selected",
        MIN_TAB_WIDTH = 100,
        FILL_CLASS = "-fill",
        RTL_CLASS = "u-RTL",
        MSG_PREV = lang.getMessage( "APEX.TABS.PREVIOUS" ),
        MSG_NEXT = lang.getMessage( "APEX.TABS.NEXT" );

    var keys = $.ui.keyCode;

    $.widget("apex.aTabs", {
        options: {
            mode: "standard", //standard or jump.
            classPrefix: "a-Tabs", // todo this should just be an extra class.
            showHints: false,
            useSlider: true,
            useLocationHash: false,
            useSessionStorage: true,
            addMoveNextPrevious: false,
            hidePreviousTab: true,
            onRegionChange: function (mode, activeTab) { // deprecated todo switch to use activate event
                var regionChangeListener = this.tabs$.data( "onRegionChange" );
                if (regionChangeListener) {
                    regionChangeListener(mode, activeTab);
                }
            },
            showAllScrollOffset: function () {
                return 0;
            },
            tabsContainer$: false,
            optionalSelectedClass: "",
            allowSwipe: false
        },
        activeTab: null, // NOT GUARANTEED TO BE NOT NULL-- if an RDS has two tabs or less it will not activate and will just hide the header bar!
        firstVisibleTab: null,
        lastVisibleTab: null,

        /**
         * Returns a map of all the tabs in the tab set.
         * todo details
         * @return {object}
         */
        getTabs: function() {
            return this.tabs;
        },

        /**
         * Returns a tab interface for the given tab href.
         *
         * @param {string} pTabId the href identifier of the tab panel.
         * @return {object} tab interface or null if there is no tab with the given tabId
         */
        getTab: function( pTabId ) {
            return this.tabs[pTabId] || null;
        },

        /**
         * Return the active tab interface
         *
         * @return {object} tab interface of the current tab
         */
        getActive: function () {
            return this.activeTab;
        },

        movePrevious: function (tab, options) {
            this._moveToRegion(tab, "getPreviousVisible", "getNextVisible", options);
        },

        moveNext: function (tab, options) {
            this._moveToRegion(tab, "getNextVisible", "getPreviousVisible", options);
        },

        moveNextActive: function( options ) {
            this.moveNext ( this.activeTab, options );
        },

        movePreviousActive: function( options ) {
            this.movePrevious( this.activeTab, options );
        },

        tabShouldBeHidden: function () {
            return this.options.mode !== "jump" && this.options.hidePreviousTab;
        },

        getNextActiveTabFromSiblings: function ( tab ) {
            var currentScrollPosition = this._getScrollOffset();
            // Using the doubly linked list, check if the active tab's siblings are within the page's scrollTop
            // and the defined offset.
            var next = tab.getNextVisible( this.rtlMode );
            if (next !== null) {
                if (next.getTop() < currentScrollPosition) {
                    return next;
                }
            }
            var previous = tab.getPreviousVisible( this.rtlMode );
            if (previous !== null) {
                if (currentScrollPosition < tab.getTop()) {
                    return previous;
                }
            }
            return null;
        },

        getFirstVisibleTab: function (tab, direction) {
            if (!tab) {
                return null;
            }
            if (!tab.hidden) {
                return tab;
            }
            while (tab[direction]) {
                tab = tab[direction];
                if (!tab.hidden) {
                    return tab;
                }
            }
            return null;
        },

        /*
         * Private methods
         */

        _onClick: function ( tab, e ) {
            tab.makeActive(true);
            if (e === undefined || !e.doNotFocus ) {
                tab.link$.focus();
            }
        },

        _moveToRegion: function (tab, key, backwardKey, event) {
            var forward = tab[key]();
            if (forward !== null) {
                this._onClick(forward, event);
            } else {
                var tab1 = tab;
                var backward = tab1[backwardKey]();
                while (backward !== null) {
                    tab1 = backward;
                    backward = backward[backwardKey]();
                }
                this._onClick(tab1, event);
                this.firstVisibleTab.panel$.addClass( "apex-rds-swap" ); // todo this looks like it is not using the class prefix correctly better to switch to a-Tabs-swap
                this.lastVisibleTab.panel$.addClass( "apex-rds-swap" );
            }
        },

        /*
         * For future reference, never alter the relations between objects in a data structure if you intend
         * on referencing those very same relations in the future.
         */
        _showTabInList: function ( tab ) {
            tab.hidden = false;
            var nextVisible = tab.getNextVisible();
            if ( nextVisible === null ) {
                this.lastVisibleTab = tab;
            }
            var previousVisible = tab.getPreviousVisible();
            if ( previousVisible === null ) {
                this.lastVisibleTab = tab;
            }

            tab.tab$.show();
            if (this.activeTab.href !== SHOW_ALL && this.tabShouldBeHidden() && tab !== this.activeTab) {
                tab.panel$.hide();
            } else if ( !this.options.hidePreviousTab ) {
                tab.panel$.css("display", ""); // The tab should not be made visible because it's not meant to have the css class "display: block"
            }
        },
        _hideTabInList: function ( tab ) {
            if (this.activeTab === tab) {
                if (tab.previous) {
                    tab.previous.makeActive(true);
                } else if (tab.next) {
                    tab.next.makeActive(true);
                }
            }
            tab.hidden = true;
            if (tab === this.firstVisibleTab) {
                this.firstVisibleTab = tab.getNextVisible();
            }
            if (tab === this.lastVisibleTab) {
                this.lastVisibleTab = tab.getPreviousVisible();
            }
            tab.tab$.hide();
        },

        _getScrollOffset: function() {
            var lookMargin = 60;
            return this.tabs$.offset().top + this.tabs$.outerHeight() + lookMargin;
        },

        /**
         * Go through the linked list of tabs in one direction, indicating whether or not the tab and its linked tab element
         * come before or after the existing node. This is especially useful for doing animations that require
         * the animation to know explicity, which elements come before and after the current page.
         * @param tab             the "tab" object literal as constructed in buildTabs().
         * @param pMoveToPrevious   true if moving to the previous node, false if moving forward.
         * @param pShowAll          true if the active
         * tab is "SHOW ALL", false if not.
         */
        _iterateThroughAndClear: function (tab, pMoveToPrevious, pShowAll) {

            while (tab !== null) {
                tab.link$.parent().removeClass( this.selectedClass );
                tab.panel$.removeClass( this.ELEMENT_SELECTED_CLASS );
                if (this.jumpMode) {
                    tab.panel$.attr(A_HIDDEN, 'false');
                } else {
                    // Hide all other page elements if the active tab is SHOW_ALL, show if otherwise.
                    if (!pShowAll) {
                        if (this.options.hidePreviousTab) {
                            tab.panel$.hide();
                        }
                        tab.panel$.attr(A_HIDDEN, 'true');
                    } else if (!tab.hidden) {
                        tab.panel$.attr(A_HIDDEN, 'false');
                        tab.panel$.show();
                    }
                }
                tab.tab$.removeClass( this.HINT_CLASS );
                tab.link$.attr( A_SELECTED, false ).attr( "tabIndex", "-1" );
                if (pMoveToPrevious) {
                    tab.panel$.removeClass( this.AFTER_CLASS ).addClass( this.BEFORE_CLASS );
                    tab.link$.parent().removeClass( this.AFTER_CLASS ).addClass( this.BEFORE_CLASS );
                    tab = tab.previous;
                } else {
                    tab.panel$.addClass( this.AFTER_CLASS ).removeClass( this.BEFORE_CLASS );
                    tab.link$.parent().addClass( this.AFTER_CLASS ).removeClass( this.BEFORE_CLASS );
                    tab = tab.next;
                }
            }
        },
        _create: function () {
            var tabs = this.tabs = {},
                tabs$ = this.tabs$ = this.element,
                me = this,
                fillMode = null,
                slider$ = null,
                isAnimating = false,
                rtlMode = false,
                regionId = tabs$.closest('.apex-tabs-region').attr('id'),
                prefix = this.options.classPrefix,
                sessionStorage = apex.storage.getScopedSessionStorage(
                    {
                        usePageId: true,
                        useAppId: true,
                        regionId: this.tabs$.id
                    }
                );

            // implement apex.region for aTabs region
            if ( regionId ) {
                apex.region.create(regionId, {
                    focus: function () {
                        var activeTab = me.activeTab.link$;
                        activeTab.focus();
                        return activeTab;
                    },
                    widget: function () {
                        return me.tabs$;
                    }
                });
            }

            // todo this variable class stuff is probably a bad idea
            this.HINT_CLASS = prefix + "-" + HINT_CLASS;
            this.BEFORE_CLASS = prefix + "-" + BEFORE_CLASS;
            this.AFTER_CLASS = prefix + "-" + AFTER_CLASS;
            this.DEFAULT_SELECTED_CLASS =  prefix + "-" + DEFAULT_SELECTED_CLASS;
            this.ELEMENT_SELECTED_CLASS =  prefix + "-" + ELEMENT_SELECTED_CLASS;
            this.FILL_CLASS = prefix + "-" + FILL_CLASS;

            /**
             * @param pJumpMode                      Flag to indicate you wish to use the new JumpNav behavior. NOT recommended
             *                                       for IE 8 and below.
             *                                       obscuring the rest of the content. If undefined, this function will be set
             *                                       to return 0.
             *                                       Called only if pJumpNode is true.
             * @param pShowHints
             */
            var options = this.options,
                jumpMode = this.jumpMode = options.mode === "jump",
                pUseSlider = options.useSlider,
                pUseLocationHash = options.useLocationHash,
                pUseSessionStorage = options.useSessionStorage,
                onRegionChange = options.onRegionChange;

            this.selectedClass = this.DEFAULT_SELECTED_CLASS + " " + options.optionalSelectedClass;
            /**
             * Does tabs container currently have the this.FILL_CLASS?
             * Unlike UserWantsFillMode, this checks to see what class is on the body.
             * @returns {*}
             */
            var inFillMode = function () {
                return tabs$.hasClass( me.FILL_CLASS );
            };

            var userWantsFillMode = function () {
                // If the tab container ever had the this.FILL_CLASS on it, that means the user desires a dynamic fill mode.
                if (fillMode === null) {
                    fillMode = inFillMode();
                }
                return fillMode;
            };

            var displayIsTable = function () {
                return tabs$.css("display") === "table";
            };

            var initializeSlider = function () {
                // Never use the slider if the this.FILL_CLASS is on tabsContainer or if the user has not explicitly indicated they want it!
                if (inFillMode() || displayIsTable() || !pUseSlider || slider$ !== null) {
                    return;
                }
                var leftHoverNode$ = $('<div class="apex-rds-hover left"><a> <span class="a-Icon icon-left-chevron"></span> </a></div>');
                var rightHoverNode$ = $('<div class="apex-rds-hover right" ><a> <span class="a-Icon icon-right-chevron"></span> </a></div>');
                slider$ = $("<div class='apex-rds-slider'>");
                slider$.append(leftHoverNode$).append(rightHoverNode$);
                tabs$.parent().prepend(slider$);
                var hoverNode = function (hover$, right) {
                    // Code borrowed and modified from http://stackoverflow.com/questions/10219649/continuous-scroll-on-hover-performance
                    // Loop continuously on hover until the user mouses away!
                    var loop = function () {
                        var offset = right ? "+=20px" : "-=20px";
                        tabs$.stop().animate({scrollLeft: offset}, 100, 'linear', loop);
                        checkState();
                    };

                    // called when the user mouses away from the hover object
                    var stop = function () {
                        tabs$.stop();
                    };

                    hover$.click(function () {
                        var offset = right ? "+=200px" : "-=200px";
                        tabs$.stop(false, false).animate({scrollLeft: offset}, 100);
                    });

                    // Public function used to assess whether or not the current node needs to be hidden or displayed.
                    var checkState = function () {
                        var padding = parseInt(tabs$.css('paddingRight'), 10) + parseInt(tabs$.css('paddingLeft'), 10),
                            scrollWidth = tabs$[0].scrollWidth - padding,
                            width = tabs$.width(),
                        //We know that the scrollWidth minus the viewable width of the container is equal to the max
                        // scroll left of the container.
                            maxScrollLeft = scrollWidth - width,
                            minScrollLeft = 0,
                            scrollLeft = tabs$.scrollLeft(),
                            hasHitBounds;
                        //If right, its bound is the maxScrollLeft. If left, the bound is the minScrollLeft
                        if (right) {
                            hasHitBounds = scrollLeft >= maxScrollLeft;
                        } else {
                            hasHitBounds = scrollLeft === minScrollLeft;
                        }
                        // If it showing and its bound has been hit, hide!
                        if (hasHitBounds) {
                            hover$.hide();
//                        hover$.css( "paddingRight" , 0 ).css( "paddingLeft" , 0 );
                            return false;
                        } else if (!hasHitBounds) {  // Otherwise, if it is not showing and no longer touching the bounds, show it.
                            hover$.show();
//                        tabsContainer$.css( "paddingRight" , 45 ).css( "paddingLeft" , 45 );
                        }
                        return true;
                    };
                    hover$.hover(loop, stop);
                    return {
                        "checkState": checkState
                    };
                };

                var hoverRight = hoverNode(rightHoverNode$, true);
                var hoverLeft = hoverNode(leftHoverNode$, false);
                var checkState = function () {
                    hoverLeft.checkState();
                    hoverRight.checkState();
                };
                var scrollDebouncer;
                tabs$.scroll(function () {
                    clearTimeout(scrollDebouncer);
                    scrollDebouncer = setTimeout(checkState, 200);
                });
                $(window).on("apexwindowresized", checkState);
                //Check the state of the hover nodes on hover, scroll, and resize and change their display if necessary.
//            tabsContainer$.scroll(checkState);
                checkState();

            };

            /**
             * Constructor for regionDisplaySelector.
             * TODO: should return true if the tabs were successfully constructed
             * or false if the tabs could not be constructed (and the RDS was therefore hidden)
             */
            var buildTabs = function () {
                var realNumberOfTabs = 0,
                    containerMinHeight = 0;
                tabs$.attr( "role", "tablist" ).addClass( C_TABS );
                if (tabs$.css("direction") === "rtl") {
                    tabs$.addClass( RTL_CLASS );
                    rtlMode = me.rtlMode = true;
                }
                // When the link is clicked, first make the tab active, then focus the link so that keyboard controls
                // can kick in!

                if (options.addMoveNextPrevious) {
                    var movePrevious$ =
                        $('<button type="button" class="' + me.options.classPrefix + '-previous-region ' + me.options.classPrefix + '-button" title="' + MSG_PREV + '" aria-label="' + MSG_PREV + '">' +
                            '<span class="a-Icon icon-left-chevron" aria-hidden="true"></span>' +
                            '</button>');
                    var moveNext$ =
                        $('<button type="button" class="' + me.options.classPrefix + '-next-region ' + me.options.classPrefix + '-button" title="' + MSG_NEXT + '" aria-label="' + MSG_NEXT + '">' +
                            '<span class="a-Icon icon-right-chevron" aria-hidden="true"></span>' +
                            '</button>');
                    tabs$.parent()
                        .prepend(movePrevious$)
                        .append(moveNext$);
                    movePrevious$.click(function () {
                        me.movePreviousActive();
                    });
                    moveNext$.click(function () {
                        me.moveNextActive();
                    });
                }
                if ( jumpMode ) {
                    tabs$.addClass( "apex-rds-container--jumpNav" );
                }
                tabs$.css({ // Make sure that the tab container does not wrap elements around.
                    "white-space": "nowrap",
                    "overflow-x": "hidden"
                });
                //Get the links inside the tabsContainer.
                var links$ = $( "a", tabs$ );
                var previousTab = null;
                var timeoutLocationHash;
                if (links$.length <= 2 && links$.eq(0).attr("href") === SHOW_ALL) { // Don't initialize the RDS if this is a legacy RDS with only two tabs!
                    tabs$.remove();
                    return;
                }
                // If the tabs container is in Right-to-left mode, the links order must be reversed to ensure the resulting linked list
                // (next, previous) are in the appropriate order.
                if (rtlMode) {
                    links$ = $( links$.get().reverse() );
                }
                // Construct a hashed doubly linked list in order to minimize the amount of other elements we need to check.
                // when the user scrolls.
                links$.each(function () {
                    var link$ = $(this);
                    var href = link$.attr( "href" );
                    // As stated previously, the href supplied MUST link to tab element on the page.
                    var tabEl$ = $( href );
                    tabEl$.attr("role", "tabpanel" ).addClass( C_TAB_PANEL );

                    if (options.tabsContainer$) {
                        var regionheight =tabEl$.outerHeight();
                        if (regionheight > containerMinHeight) {
                            containerMinHeight = regionheight;
                        }
                    }

                    if (href === SHOW_ALL && jumpMode) {
                        // DO NOT show the "show_all" tab
                        link$.parent().css("display", "none");
                        return;
                    }
                    link$.attr( "role", "tab" );
                    var scrollToTab = function (pTab) {
                        if (inFillMode() || !pUseSlider || displayIsTable()) {
                            return;
                        }
                        var leftAdjust = -tabs$.width() / 2;
                        var left = pTab.getLeft() / 2;
                        var previous = pTab;
                        while (previous.previous !== null) {
                            previous = previous.previous;
                            left += previous.tab$.outerWidth();
                        }
                        // Make sure that the activeTab is visible on the user's screen.
                        tabs$.stop(true, true).animate({
                            scrollLeft: left + leftAdjust
                        }, function () {

                        });
                    };

                    // Don't check if the current tab is active, just make it active.
                    var forceActive = function ( scrollToActive ) {
                        var ui, prevActive, selActive;

                        if (this.hidden) {
                            return;
                        }
                        selActive = "." + me.selectedClass.trim().split(/\s+/).join("."); // because selectedClass can be multiple classes
                        prevActive = tabs[tabs$.find( selActive ).find( "a" ).attr( "href" )];
                        me._iterateThroughAndClear.call(me, this.previous, true, href === SHOW_ALL);
                        me._iterateThroughAndClear.call(me, this.next, false, href === SHOW_ALL);
                        me.firstVisibleTab.panel$.removeClass("apex-rds-swap");
                        me.lastVisibleTab.panel$.removeClass("apex-rds-swap");
                        if (timeoutLocationHash !== undefined) {
                            clearTimeout(timeoutLocationHash);
                        }
                        // We need to "debounce" changing the location hash, since changing the location hash
                        // hijacks the page's scrolling.
                        if (pUseLocationHash) {
                            timeoutLocationHash = setTimeout(function () {
                                if ("history" in window && window.history && window.history.pushState) {
                                    history.pushState(null, null, href);
                                } else {
                                    var noJumpScroll = $(window).scrollTop();
                                    location.hash = href;
                                    $(window).scrollTop(noJumpScroll);
                                }
                            }, 10);
                        }
                        if (me.tabShouldBeHidden()) {
                            tabEl$.show();
                        }
                        me.activeTab = this;
                        
                        this.panel$
                            .attr( A_HIDDEN, false )
                            .addClass( me.ELEMENT_SELECTED_CLASS );

                        this.link$
                            .attr( A_SELECTED, true )
                            .removeAttr("tabindex");

                        scrollToTab( this );
                        link$.parent().removeClass( me.HINT_CLASS ).addClass( me.selectedClass ) ;
                        // Store the user's page preference here.
                        // Use regionId, making multiple tabs memorization possible.
                        if (pUseSessionStorage) {
                            sessionStorage.setItem( regionId + ".activeTab", href);
                        }
                        // todo this widget MUST NOT have knowledge of other widgets. In each widget should use widget.util.onVisibilityChange
                        // Specific elements that need to be refreshed once shown/unshown using jquery show/hide.
                        if (options.mode === "standard") {
                            if ($.apex.stickyWidget) {
                                me.activeTab.panel$
                                    .find(".js-stickyWidget-toggle")// only sticky widget instances have this class.
                                    .stickyWidget("refresh");
                            }
                        }
                        ui = {
                            mode: options.mode,
                            active: me.activeTab,
                            previous: prevActive,
                            showing: options.mode === "standard" && prevActive && me.activeTab !== prevActive && prevActive.href !== SHOW_ALL
                        };
                        me._trigger("activate", {}, ui);
                        // todo this is not the normal widget way. Consider _trigger which makes it both an event and callback. is there still a need for onRegionChange?
                        // todo remove tabsregionchange event and onRegionChange callback in favor of activate event/callback
                        tabs$.trigger( "tabsregionchange", [me.activeTab, options.mode] );
                        onRegionChange.call(me, options.mode, me.activeTab);
                        if ( scrollToActive ) {
                            var offset = 0;
                            // If in JumpMode, the body needs to scroll into position.
                            if (jumpMode) {
                                var top = currentTab.getTop();
                                offset = apex.theme.defaultStickyTop();
                                isAnimating = true;
                                $('html,body').stop(true, true).animate({scrollTop: top - offset}, {
                                    duration: 'slow',
                                    step: function (position, tween) {
                                        var end = currentTab.getTop() - offset;
                                        if (end !== tween.end) {
                                            tween.end = end;
                                        }
                                    },
                                    complete: function () {
                                        isAnimating = false;
                                        if (pUseLocationHash) {
                                            location.hash = href;
                                        }
                                    }
                                });
                            } else {
                                (function() {
                                    var offset = null;
                                    // get the value from the showallscrolloffset in options
                                    if ( options.showAllScrollOffset ) {
                                        offset = options.showAllScrollOffset();
                                    }
                                    // for legacy API Calls: if a showallscrolloffset is stored in the data,
                                    // use that instead of the option
                                    // previous RDS would always set the data
                                    // but this version does not, which means that the data
                                    // will only be used IF and only IF an outside API used it before to set it.
                                    if ( tabs$.data("showAllScrollOffset") ) {
                                        offset = tabs$.data("showAllScrollOffset")();
                                    }
                                    if ( offset ) {
                                        window.scrollTo(0, offset);
                                    }
                                }());
                            }
                        }
                    };
                    // Each tab object literal is composed of its element, its link (which should have a button as its parent)
                    var currentTab = tabs[href] = {
                        href: href, // this is the identifier of the tab
                        tabSet$: tabs$, // this is the tab set; the aTabs tab widget.
                        panel$: tabEl$,
                        el$: tabEl$, // todo remove this old name once no longer used by theme code
                        link$: link$,
                        tab$: link$.parent(),
                        forceActive: forceActive,
                        makeActive: function ( userWantsScroll ) {
                            //Anything that could prevent a tab from becoming active should be written here (guards, if you
                            // will) should be written here.
                            if (me.activeTab === this) {
                                return;
                            }
                            forceActive.call(this, userWantsScroll);
                        },
                        show: function() {
                            me._showTabInList( currentTab );
                        },
                        hide: function() {
                            me._hideTabInList( currentTab );
                        },
                        moveNext: function( options ) {
                            me.moveNext ( currentTab, options );
                        },
                        movePrevious: function( options ) {
                            me.movePrevious ( currentTab, options );
                        },
                        getNextVisible: function ( reverse ) {
                            if ( reverse ) {
                                return currentTab.getPreviousVisible();
                            }
                            return me.getFirstVisibleTab(currentTab.next, "next");
                        },
                        getPreviousVisible: function ( reverse ) {
                            if ( reverse ) {
                                return currentTab.getNextVisible();
                            }
                            return me.getFirstVisibleTab(currentTab.previous, "previous");
                        },
                        getTop: function () {
                            return tabEl$.offset().top;
                        },
                        getLeft: function () {
                            return this.tab$.offset().left;
                        },
                        showHint: function () {
                            var previous = this.previous, next = this.next;
                            while (previous !== null) {
                                previous.tab$.removeClass( me.HINT_CLASS );
                                previous = previous.previous;
                            }
                            while (next !== null) {
                                next.tab$.removeClass( me.HINT_CLASS );
                                next = next.next;
                            }
                            this.tab$.addClass( me.HINT_CLASS );
                        },
                        previous: previousTab,
                        next: null
                    };
                    currentTab.tab$.attr("role", "presentation");

                    // We don't set aria-controls for the SHOW_ALL link, as this doesn't explicitly control a single tab panel
                    if ( href !== SHOW_ALL ) {
                        currentTab.link$.attr( A_CONTROLS, href.substring(1) );
                    }
                    var tabId = currentTab.tab$.attr("id");
                    if ( !tabId ) {
                        tabId = currentTab.href.substring(1) + "_tab";
                        currentTab.tab$.attr( "id", tabId );
                    }
                    tabEl$.attr( "aria-labelledby", tabId );


                    // Does the current tab link href match the user's location hash?
                    // If yes, we know that this must be the page the user wants to navigate to.
                    if (location.hash === href && pUseLocationHash) {
                        me.activeTab = currentTab;
                    }
                    // Keep track of the head of the list; it will be needed in case an activeTab could not be found.
                    if (me.firstVisibleTab === null) {
                        me.firstVisibleTab = currentTab;
                    }
                    // We know implicitly that the "next" tab of the "previous" tab is the current tab.
                    if (previousTab !== null) {
                        previousTab.next = currentTab;
                    }
                    previousTab = currentTab;
                    link$.click(function (e) {
                        me._onClick( currentTab, e );
                        return false;
                    });
                    // When the link has focus, process these following key down events according to APEX's master key list.
                    link$.on( "keydown" , function (event) {
                        var kc = event.which;
                        //Moving next for down and up is useful when jumpNav is active.
                        if (kc === keys.UP) {
                            me.movePrevious(currentTab);
                        } else if (kc === keys.DOWN) {
                            me.moveNext(currentTab);
                        } else if (kc === keys.RIGHT) {
                            me.moveNext(currentTab);
                        } else if (kc === keys.LEFT) {
                            me.movePrevious(currentTab);
                        } else if (kc === keys.HOME) {
                            me.firstVisibleTab.link$.click();
                        } else if (kc === keys.END) {
                            me.lastVisibleTab.link$.click();
                        } else if (kc === keys.SPACE) {
                            currentTab.link$.click();
                        } else {
                            return;
                        }
                        event.preventDefault();
                    });
                    // todo rethink the apexaftershow/hide events. adding show/hide to apex.region interface may be better
                    currentTab.panel$
                        .on("apexaftershow", function (e) {
                            if ( e.target === currentTab.panel$[0] ) {
                                currentTab.show();
                            }
                        }
                        ).on("apexafterhide", function (e) {
                            if ( e.target === currentTab.panel$[0] ) {
                                currentTab.hide();
                            }
                        });
                    realNumberOfTabs++;
                });

                if (options.tabsContainer$) {
                    var altHeight = parseInt(options.tabsContainer$.css("min-height").replace(/[^-\d\.]/g, ''), 10);
                    if (containerMinHeight <= 0) {
                        containerMinHeight = altHeight;
                    }
                    options.tabsContainer$.css("min-height", containerMinHeight);
                }
                // If the user has ever indicated a desire for a "fill" style tabs,
                // then we must dynamically add and remove it to the page.
                var handleFillModeResize = function () {
                    if (userWantsFillMode() && pUseSlider) {
                        var fixedTabWidth = tabs$.width() / realNumberOfTabs;
                        // If the page is too small, switch to the normal mode.
                        if (fixedTabWidth < MIN_TAB_WIDTH) {
                            if (slider$ === null) {
                                tabs$.removeClass( me.FILL_CLASS );
                                initializeSlider();
                            }
                        } else {
                            // If the page is normal size, and if the slider is active, switch it off and resume fill mode.
                            if (slider$ !== null) {
                                tabs$.addClass( me.FILL_CLASS );
                                slider$.hide();
                            }
                        }
                    }
                };
                initializeSlider();
                handleFillModeResize();
                me.lastVisibleTab = previousTab;
                if (rtlMode) {
                    var tempTab = me.lastVisibleTab;
                    me.lastVisibleTab = me.firstVisibleTab;
                    me.firstVisibleTab = tempTab;
                }
                if (me.activeTab === null) {
                    // The user cannot override a hash with their preference if the link they supplied already set the active Tab.
                    if (pUseSessionStorage) {
                        var href = sessionStorage.getItem( regionId + ".activeTab" );
                        for (var key in tabs) {
                            if ( tabs.hasOwnProperty(key) ) {
                                if (tabs[key].href === href) {
                                    me.activeTab = tabs[key];
                                    if (pUseLocationHash) {
                                        location.hash = href;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (me.activeTab === null) {
                        me.activeTab = me.firstVisibleTab;
                    }
                }
                tabs$.click(function () {
                    me.firstVisibleTab.link$.focus();
                });
                $( window ).on("apexwindowresized", handleFillModeResize);
                if (jumpMode) {
                    // To ensure that the jumpnav can jump fully to the last tab content, that tab content
                    // must have a height of at least 70vh. Note that we use a class here as opposed to just 70vh
                    // in order to inform future developers who come across this wrapped div, about its purpose.
                    me.lastVisibleTab.panel$.wrap("<div class='apex-rds-last-item-spacer'></div>");
                }

            };

            var initializeStandardTabs = function () {
                buildTabs();
                /**
                 * This is to ensure that previous assumptions premised on RDS do not break as a result of changes made here.
                 */
                if (me.activeTab && me.activeTab.href !== SHOW_ALL) {
                    var deferredTab = me.activeTab;
                    //me.firstVisibleTab.forceActive();
                    setTimeout(function () {
                        deferredTab.forceActive(true);
                    }, 250);
                }
                var hintedTab = null;
                // Always show the hints when in standard mode and when the active tab is "SHOW ALL"
                $( window ).on("scroll", function () {
                    if (!me.activeTab || me.activeTab.href !== SHOW_ALL) {
                        return;
                    }
                    var offset = me._getScrollOffset();
                    if (hintedTab === null) {
                        //Manually get the hinted tab from traversing the entire list.
                        var tab = me.firstVisibleTab;
                        while (tab) {
                            if (!tab.hidden && tab.href !== SHOW_ALL && tab.getTop() < offset) {
                                hintedTab = tab;
                                hintedTab.showHint();
                            }
                            tab = tab.next;
                        }
                    } else {
                        var nextHintedTab = me.getNextActiveTabFromSiblings(hintedTab);
                        if (nextHintedTab !== null) {
                            hintedTab = nextHintedTab;
                            nextHintedTab.showHint();
                        }
                    }
                });
            };

            // JumpNav requires a scroll listener and a resizeEnd listener.
            var initializeJumpNav = function () {
                buildTabs();
                if ( !me.activeTab ) {
                    return;
                }
                me.activeTab.forceActive(true);
                // Attach the scrol listeners here;
                var resizeHeight = $(window).height() / 3; // PROTIP:
                // Hoisting places all these var statements at the beginning of the  defined scope!
                //  In other words, declaring it here is only important in deciding which var statement to
                // execute/resolve first.
                var checkTabs = function () {
                // Do not execute the main scroll listener block while the user is getting scrolled to his or her content
                // i.e. isAnimating.
                    if (!isAnimating) {
                        var tabToMakeActive = me.getNextActiveTabFromSiblings(me.activeTab);
                        if (tabToMakeActive !== null) {
                            tabToMakeActive.makeActive();
                        }
                    }
                };

                $(window)
                    .on("scroll", checkTabs)
                    .on("apexwindowresized", function () {
                        resizeHeight = $(window).height() / 3;
                        checkTabs();
                    });
            };

            if (jumpMode) {
                initializeJumpNav();
            } else {
                initializeStandardTabs();
            }

            // swipe gesture support
            if ( options.allowSwipe && ( options.tabsContainer$ instanceof $ ) ) {
                options.tabsContainer$.on('apexswipe', function ( event, hammerExtras ) {
                    var direction = hammerExtras.direction;
                    switch ( direction ) {
                        case 2:  // left
                            me.movePreviousActive();
                            break;

                        case 4:  // right
                            me.moveNextActive();
                            break;
                    }
                });
            }
        }
    });

    /**
     * Given an element return the tab interface for the tab panel that it is in.
     *
     * @param pElement a DOM element or jQuery object for an element
     * @return {object} tab interface or null if pElement is not in a tab panel
     */
    $.apex.aTabs.findClosestTab = function( pElement ) {
        var panel$, aTabs$, tabId,
            tab = null;

        panel$ = $( pElement ).closest( "." + C_TAB_PANEL );
        if ( panel$.length ) {
            tabId = "#" + panel$[0].id;
            aTabs$ = $( "#" + panel$.attr( "aria-labelledby" ) ).closest( "." + C_TABS );
            tab = aTabs$.aTabs( "getTab", tabId );
        }
        return tab;
    };

    // when an item in a tab managed by any aTabs widget has an error allow the message module to make the item visible
    function activateTab( id ) {
        var tab, activeTab,
            el$ = $( "#" + id );

        if ( $.apex.aTabs ) {
            tab = $.apex.aTabs.findClosestTab( el$ );
            if ( tab ) {
                activeTab = tab.tabSet$.aTabs("getActive");
                if ( ( activeTab !== tab && activeTab.href !== SHOW_ALL ) || !el$.is( ":visible" ) ) {
                    tab.makeActive();
                }
                activateTab( tab.tabSet$[0].id ); // check for nested tab sets
            }
        }
    }

    if ( apex.message ) {
        apex.message.addVisibilityCheck( activateTab );
    }

    // setup handler for visibility check
    if ( apex.widget.util.visibilityChange ) {
        $( document.body ).on( "atabsactivate", function ( e, ui ) {
            var oldTab, newTab, allTabs, t;

            if ( ui.previous ) {
                oldTab = ui.previous.panel$[0];
            }
            newTab = ui.active.panel$[0];
            if ( ui.active.href === SHOW_ALL ) {
                // all tabs are being shown this is a change for all but previous tab
                allTabs = $(e.target ).aTabs( "getTabs" );
                for ( t in allTabs ) {
                    if ( allTabs.hasOwnProperty( t ) ) {
                        if ( ui.previous && t !== ui.previous.href && t !== SHOW_ALL ) {
                            apex.widget.util.visibilityChange( allTabs[t].panel$[0], true );
                        }
                    }
                }
            } else if ( ui.previous && ui.previous.href === SHOW_ALL ) {
                // all but one tabs are being hidden this is a change for all but active tab
                allTabs = $(e.target ).aTabs( "getTabs" );
                for ( t in allTabs ) {
                    if ( allTabs.hasOwnProperty( t ) ) {
                        if ( t !== ui.active.href && t !== SHOW_ALL ) {
                            apex.widget.util.visibilityChange( allTabs[t].panel$[0], false );
                        }
                    }
                }
            } else {
                if ( oldTab ) {
                    apex.widget.util.visibilityChange( oldTab, false );
                }
                apex.widget.util.visibilityChange( newTab, true );
            }
        });
    }

    apex.widget.regionDisplaySelector = function (pRegionDisplaySelectorRegion, pOptions) {
        var rds$ = $("#" +  pRegionDisplaySelectorRegion + "_RDS");
        rds$.aTabs($.extend({}, { classPrefix: "apex-rds"  }, pOptions));

        // For legacy code which used some internal functions of RDS.
        return {
            "tabs": rds$.aTabs("getTabs"),
            "moveNext": function( tab, options ) {
                rds$.aTabs("moveNext", tab, options);
            },
            "movePrevious": function( tab, options ) {
                rds$.aTabs("movePrevious", tab, options);
            },
            "getActiveTab": function() {
                return rds$.aTabs("getActive");
            }
        };
    };

})( apex.jQuery, apex.lang );
