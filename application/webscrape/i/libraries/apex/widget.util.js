/*global apex,$v,ResizeSensor,self */
/**
 @license
 Oracle Database Application Express
 Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget.util} namespace is used to store all widget utility functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.widget.util = {};

(function( util, lang, navigation, $ ) {
    "use strict";

    /**
     * Function that implements cascading LOV functionality for an item type plug-in. This function is a wrapper of the
     * apex.server.plugin function but provides additional features.
     *
     * @param {jQuerySelector | jQuery | DOM} Identifies the page item of the item type plug-in.
     * @param {String} pAjaxIdentifier        Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your item type plug-in.
     * @param {Object} [pData]                Object which can optionally be used to set additional values which are send with the
     *                                        AJAX request. For example pData can be used to set the scalar parameters x01 - x10 and the
     *                                        arrays f01 - f20
     * @param {Object} [pOptions]             Object which can optionally be used to set additional options for the AJAX call. See apex.server.plugin
     *                                        for standard attributes. In addition pOptions supports the attributes:
     *                                          - "optimizeRefresh" Boolean to specify if the AJAX call should not be performed if one off the page items
     *                                                              specified in dependingOn is empty.
     *                                          - "dependingOn"     jQuery selector, jQuery- or DOM object which identifies the DOM element
     *                                                              of which the current page item is depending on.
     * @return {jqXHR}
     *
     * @example
     *
     * apex.widget.util.cascadingLov ( pItem, pAjaxIdentifier, {
     *     x01: "test"
     *     }, {
     *     optimizeRefresh:   true,
     *     dependingOn:       "#P1_DEPTNO",
     *     pageItemsToSubmit: "#P1_LOCATION",
     *     clear:   function() { ... do something here ... },
     *     success: function( pData ) { ... do something here ... }
     *     } );
     *
     * @memberOf apex.widget.util
     **/
    util.cascadingLov = function( pList, pAjaxIdentifier, pData, pOptions ) {
        var lList$     = $( pList, apex.gPageContext$ ),
            lQueueName = lList$[0] ? lList$[0].id : "lov",
            lOptions   = $.extend( {
                optimizeRefresh: true,
                queue: { name: lQueueName, action: "replace" }
            }, pOptions ),
            lNullFound = false;

        // Always fire the before and after refresh event and show a load indicator next to the list
        if ( !lOptions.refreshObject ) {
            lOptions.refreshObject    = lList$;
        }
        if ( !lOptions.loadingIndicator ) {
            lOptions.loadingIndicator = lList$;
        }

        // We only have to refresh if all our depending values are not null
        if ( lOptions.optimizeRefresh ) {
            $( lOptions.dependingOn, apex.gPageContext$ ).each( function() {
                if ( apex.item( this ).isEmpty() ) {
                    lNullFound = true;
                    return false; // stop execution of the loop
                }
            });

            // All depending values are NULL, let's take a shortcut and not perform the AJAX call
            // because the result will always be an empty list
            if ( lNullFound ) {
                // trigger the before refresh event if defined
                lOptions.refreshObject.trigger( 'apexbeforerefresh' );

                // Call clear callback if the attribute has been specified and if it's a function
                if ( $.isFunction( lOptions.clear ) ) {
                    lOptions.clear();
                }

                // Trigger the change event for the list because the current value might have changed.
                // The change event is also needed by cascading LOVs so that they are refreshed with the
                // current selected value as well (bug# 9907473)
                // If the select list actually reads data, the change event is fired in the _addResult as soon as
                // a new value has been set (in case the LOV doesn't contain a null display entry)
                lList$.change();

                // trigger the after refresh event if defined
                lOptions.refreshObject.trigger( 'apexafterrefresh' );
                return; // we are done, exit cascadingLov
            }
        }

        // Include dependingOn page items into the pageItems list
        pData.pageItems = $( pData.pageItems, apex.gPageContext$ ).add( lOptions.dependingOn );
        return apex.server.plugin( pAjaxIdentifier, pData, lOptions );
    }; // cascadingLov

    /**
     * Function that implements cascading LOV functionality for an item type plug-in. This function is a wrapper of the
     * apex.server.plugin function but provides additional features.
     *
     * @param {String} pAjaxIdentifier        Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your item type plug-in.
     * @param {Object} [pData]                Object which can optionally be used to set additional values which are send with the
     *                                        AJAX request. For example pData can be used to set the scalar parameters x01 - x10 and the
     *                                        arrays f01 - f20.
     *                                        NOTE: x02 is already in use by this function!
     * @param {Object} [pOptions]             Object which can optionally be used to set additional options for the popup call.
     *                                          - "filterOutput"     Boolean to specify if parameter "filterObject" should be used.
     *                                          - "filterValue"      String which is used to restrict the popup LOV output.
     *                                          - "windowParameters" xxx
     *
     * @example
     *
     * apex.widget.util.cascadingLov ( pItem, pAjaxIdentifier, {
     *     x01: "test"
     *     }, {
     *     optimizeRefresh:   true,
     *     dependingOn:       "#P1_DEPTNO",
     *     pageItemsToSubmit: "#P1_LOCATION",
     *     clear:   function() { ... do something here ... },
     *     success: function( pData ) { ... do something here ... }
     *     } );
     *
     * @memberOf apex.widget.util
     **/
    util.callPopupLov = function( pAjaxIdentifier, pData, pOptions ) {
        var lData = pData || {},
            lOptions = pOptions || {},
            lUrl;

        // add filter with the current value if popup lov is configured for that
        if ( lOptions.filterOutput ) {
            lData.x02 = lOptions.filterValue;
        }

        // get the URL to call the popup
        // lUrl = apex.server.pluginUrl( pAjaxIdentifier, lData ); todo in 5.2 return to using pluginUrl if url and ajaxUrl are merged
        lUrl = apex.server.ajaxUrl( $.extend({}, pData, { p_request: "PLUGIN=" + pAjaxIdentifier }), {target: pOptions.target} );

        navigation.dialog(
            lUrl, {
                modal: true,
                title: lang.getMessage( "APEX.POPUP_LOV.TITLE" ) },
            "ui-dialog—popuplov",
            pOptions.target );
        return false;
    }; // callPopupLov

    /**
     * helper function: Sort the chart data, to ensure the order of the series items matches the groups array
     * @param {Object} elem
     * @ignore
     */
    var chartSortArray = function ( pItems, pOrder ) {
        pItems.sort( function( a, b ) {
            if ( a.name < b.name ) {
                return -1;
            } else if ( a.name > b.name ) {
                return 1;
            }
            return 0;
        });

        if ( pOrder === 'label-desc' ) {
            pItems.reverse();
        }
    }; // chartSortArray

    util.chartSortArray = chartSortArray;

    /**
     * helper function: Fill gaps for missing data points, to ensure each group has an associated data point in each series
     * @param {Object} elem
     * @ignore
     */
    util.chartFillGaps = function ( pGroups, pItems, pOrder, pConnect ) {
        chartSortArray( pItems, pOrder );

        for ( var groupIdx = 0; groupIdx < pGroups.length; groupIdx++ ) {
            // Each group entry must have a corresponding entry in the items array, required by JET
            if ( !pItems[ groupIdx ] || pItems[ groupIdx ].name !== pGroups[ groupIdx ].name ) {
                // Add a new entry for a missing data point
                // The setting of value depends on user's 'Connect Null Data Points' setting.
                // A value of 0 will result in a continuous line; a value of null will result in a broken line
                //items.splice( groupIdx, 0, pConnect ? { name: groups[ groupIdx ].name, value: 0 } : { name: groups[ groupIdx ].name, value: null } );
                pItems.splice( groupIdx, 0, { name: pGroups[ groupIdx ].name, value:  pConnect ? 0 : null } );
            } else if ( pItems[ groupIdx ].id !== groupIdx ) {
                // Correct the id if we have added new data points
                pItems[ groupIdx ].id = groupIdx;
            }
        }
    };  // chartFillGaps

    /**
     * Utility function to enable any icons descendant of $pContainer
     * If passing pClickHandler to rebind the icon's click handler, the
     * $pContainer must be the same as the element you wish to bind the
     * handler to (eg the icon's wrapping anchor).
     *
     * @param {jQuery}   $pContainer
     * @param {String}   pHref
     * @param {Function} [pClickHandler]
     *
     * @todo add example
     *
     * @memberOf apex.widget.util
     **/
    util.enableIcon = function( $pContainer, pHref, pClickHandler ) {
        $pContainer
            .find( "img" )           // locate any images descendant of $pContainer
            .css({ "opacity" : 1,
                "cursor"  : "" }) // set their opacity and remove cursor
            .parent( "a" )           // go to parent, which should be an anchor
            .attr( "href", pHref );  // add the href
        // check if pClickHandler is passed, if so, bind it
        if ( pClickHandler ) {
            $pContainer.click( pClickHandler ); // rebind the click handler
        }
    }; // enableIcon

    /**
     * Utility function to disable any icons descendant of $pContainer
     *
     * @param {jQuery} $pContainer
     *
     * @todo add example
     *
     * @memberOf apex.widget.util
     **/
    util.disableIcon = function( $pContainer ) {
        $pContainer
            .find( "img" )
            .css({ "opacity" : 0.5,
                "cursor"  : "default" })
            .parent( "a" )
            .removeAttr( "href" )
            .unbind( "click" );
    }; // disableIcon

    /*
     * Common functionality for widgets to check if the become visible or hidden
     */
    var visibleCheckList = [];

    function findInVisibleCheckList(element) {
        var i;
        for ( i = 0; i < visibleCheckList.length; i++ ) {
            if ( visibleCheckList[i].el === element ) {
                return i;
            }
        }
        return null;
    }

    /**
     * todo
     * @param pElement
     * @param pCallback
     */
    util.onVisibilityChange = function( pElement, pCallback ) {
        var index = findInVisibleCheckList( pElement ),
            c = {
            el: pElement,
                cb: pCallback
        };
        if ( index !== null ) {
            visibleCheckList[index] = c;
        } else {
            visibleCheckList.push(c);
        }
    };

    /**
     * todo
     * @param pElement
     */
    util.offVisibilityChange = function( pElement ) {
        var index = findInVisibleCheckList( pElement );
        if ( index !== null ) {
            visibleCheckList.splice( index, 1 );
        }
    };

    /**
     * todo
     * @param pElement
     * @param pShow
     * @memberOf apex.widget.util
     */
    var visibilityChange = util.visibilityChange = function( pElement, pShow ) {
        var i, check$, c,
            parent$ = $( pElement );
        pShow = !!pShow; // force true/false
        for ( i = 0; i < visibleCheckList.length; i++ ) {
            c = visibleCheckList[i];
            check$ = $( c.el );
            // todo can get false results because :visible may be true even if not visible because of a hidden ancestor.
            if ( pShow === check$.is( ":visible" ) && check$.closest(parent$ ).length ) {
                c.cb( pShow );
            }
        }
    };

    // setup handler for DA Show/Hide
    $( document.body ).on( "apexaftershow", function ( e ) {
        visibilityChange( e.target, true );
    }).on( "apexafterhide", function ( e ) {
        visibilityChange( e.target, false );
    } );

    var DATA_RESIZE_SENSOR = "apex-resize-sensor";

    /**
     * Register a callback for when a DOM element's dimensions change. The element must allow element content.
     *
     * @param {DOM Element|String} pElement DOM element or string ID of a DOM element to detect size changes on.
     * @param {Function} pResizeCallback no argument function to call when the size of the element changes
     */
    util.onElementResize = function( pElement, pResizeCallback ) {
        var el$, tracker;
        if ( typeof pElement === "string" ) {
            pElement = "#" + pElement;
        }
        el$ = $( pElement ).first();
        tracker = el$.data( DATA_RESIZE_SENSOR );
        if ( !tracker ) {
            tracker = new ResizeTracker( el$[0] );
            el$.data( DATA_RESIZE_SENSOR, tracker );
            tracker.start();
        }
        tracker.addListener( pResizeCallback );

    /*
         DON'T use ResizeSensor for now
            var rs, el$;

            if ( typeof pElement === "string" ) {
                pElement = "#" + pElement;
            }
            el$ = $( pElement ).first();
            if ( el$.length ) {
                rs = new ResizeSensor( el$[0], pResizeCallback );
                el$.data( DATA_RESIZE_SENSOR, rs);
            }
     */
    };

    /**
     * Remove the callback registered with onElementResize for the given element.
     *
     * @param {DOM Element|String} pElement DOM element or string ID of a DOM element to detect size changes on.
     * @param {Function} pResizeCallback no argument function to call when the size of the element changes
     */
    util.offElementResize = function( pElement, pResizeCallback ) {
        var el$, tracker;
        if ( typeof pElement === "string" ) {
            pElement = "#" + pElement;
        }
        el$ = $( pElement ).first();
        tracker = el$.data( DATA_RESIZE_SENSOR );
        if ( tracker ) {
            if ( pResizeCallback ) {
                tracker.removeListener( pResizeCallback );
                if ( tracker.isEmpty() ) {
                    tracker.stop();
                    el$.removeData( DATA_RESIZE_SENSOR );
                }
            } else {
                tracker.destroy();
                el$.removeData( DATA_RESIZE_SENSOR );
            }
        }
    /*
     DON'T use ResizeSensor for now
        var rs, el$;

        if ( typeof pElement === "string" ) {
            pElement = "#" + pElement;
        }
        el$ = $( pElement ).first();
        rs = el$.data( DATA_RESIZE_SENSOR );
        rs.detach();
        el$.removeData( DATA_RESIZE_SENSOR );
    */
    };

    /**
     * Updates any resize sensors added when onElementResize is used. Call this function
     * when an element containing a resize sensor has been made visible or is connected to the DOM.
     *
     * @param {!Element} pElement DOM element or string ID of a DOM element that has become visible and may contain
     *                            resize sensors.
     */
    util.updateResizeSensors = function( pElement ) {
        if ( typeof pElement === "string" ) {
            pElement = "#" + pElement;
        }
        $( pElement ).find( ".js-resize-sensor" ).parent().each( function( i, el ) {
            var tracker = $( el ).data( DATA_RESIZE_SENSOR );
            if ( tracker != null ) {
                tracker.init( true );
            }
        }
        );
    };

    /**
     * @preserve Oracle JET TouchProxy, ResizeTracker
     * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
     * The Universal Permissive License (UPL), Version 1.0
     */
    // TODO would like to use these things directly from JET library but the global symbols are compiled away
    /*
     * Temp? replacement for ResizeSensor library
     * extracted from JET
     * Utility class for tracking resize events for a given element and dispatching them to listeners
     * Updated with changes from JET 4.2.0 but not including code for _collapsingManagers, _collapsingListeners.
     */
    var ResizeTracker = function(div) {
        var _listeners = $.Callbacks(),
            _RETRY_MAX_COUNT = 2,
            _retrySetScroll = 0,
            _invokeId = null,
            _oldWidth  = null,
            _oldHeight = null,
            _detectExpansion = null,
            _detectContraction = null,
            _resizeListener = null,
            _scrollListener = null;

        this.addListener = function(listener) {
            _listeners.add(listener);
        };

        this.removeListener = function(listener) {
            _listeners.remove(listener);
        };

        this.isEmpty = function() {
            return !_listeners.has();
        };

        this.destroy = function() {
            _listeners.empty();
            this.stop();
        };

        this.start = function() {

            function setStyles( s1, s2 ) {
                s1.direction = "ltr";
                s1.position = s2.position = "absolute";
                s1.left = s1.top = s1.right = s1.bottom = "0";
                s1.overflow = "hidden";
                s1.zIndex = "-1";
                s1.visibility = "hidden";
                s2.left = s2.top = "0";
                s2.transition = "0s";
            }

            _scrollListener = _handleScroll.bind(this);

            // : Use native onresize support on teh DIV in IE9/10 and  since no scroll events are fired on the
            // contraction/expansion DIVs in IE9
            if (div.attachEvent) {
                _resizeListener = _handleResize.bind(this);
                div.attachEvent('onresize', _resizeListener);
            } else {
                var firstChild = div.childNodes[0];

                // This child DIV will track expansion events. It is meant to be 1px taller and wider than the DIV
                // whose resize events we are tracking. After we set its scrollTop and scrollLeft to 1, any increate in size
                // will fire a scroll event
                _detectExpansion = document.createElement("div");
                // don't want css dependencies but need to find later
                _detectExpansion.className = "js-resize-sensor";

                var expansionChild = document.createElement("div");
                setStyles( _detectExpansion.style, expansionChild.style );
                _detectExpansion.appendChild(expansionChild);
                if ( firstChild ) {
                    div.insertBefore(_detectExpansion, firstChild);
                } else {
                    div.appendChild(_detectExpansion);
                }

                _detectExpansion.addEventListener("scroll", _scrollListener, false);

                // This child DIV will track contraction events. Its height and width are set to 200%. After we set its scrollTop and
                // scrollLeft to the current height and width of its parent, any decrease in size will fire a scroll event
                _detectContraction = document.createElement("div");
                // don't want css dependencies: _detectContraction.className = "oj-helper-detect-contraction";

                var contractionChild = document.createElement("div");
                setStyles( _detectContraction.style, contractionChild.style );
                contractionChild.style.width = "200%";
                contractionChild.style.height = "200%";
                _detectContraction.appendChild(contractionChild);
                div.insertBefore(_detectContraction, _detectExpansion);

                _detectContraction.addEventListener("scroll", _scrollListener, false);

                this.init(false);
            }
        };

        this.stop = function() {
            if (_invokeId !== null) {
                apex.util.cancelInvokeAfterPaint(_invokeId);
                _invokeId = null;
            }
            if (_detectExpansion !== null) {
                _detectExpansion.removeEventListener("scroll", _scrollListener);
                _detectContraction.removeEventListener("scroll", _scrollListener);
                // Check before removing to prevent CustomElement polyfill from throwing
                // a NotFoundError when removeChild is called with an element not in the DOM
                if (_detectExpansion.parentNode) {
                    div.removeChild( _detectExpansion );
                }
                if (_detectContraction.parentNode) {
                    div.removeChild( _detectContraction );
                }
            } else {
                // assume IE9/10
                div.detachEvent('onresize', _resizeListener);
            }
        };

        this.init = function(isFixup) {
            var adjusted = _checkSize(isFixup);
            if (isFixup && !adjusted && _detectExpansion.offsetParent != null) {
                _adjust(_oldWidth, _oldHeight);
            }
        };

        function _checkSize(fireEvent) {
            var adjusted = false;
            if (_detectExpansion.offsetParent != null) {
                var newWidth = _detectExpansion.offsetWidth;
                var newHeight = _detectExpansion.offsetHeight;

                if (_oldWidth !== newWidth || _oldHeight !== newHeight) {
                    _retrySetScroll = _RETRY_MAX_COUNT;
                    _adjust(newWidth, newHeight);
                    adjusted = true;

                    if (fireEvent) {
                        _notifyListeners(true);
                    }
                }
            }

            return adjusted;
        }

        function _notifyListeners(useAfterPaint) {
            var newWidth = div.offsetWidth;
            var newHeight = div.offsetHeight;
            if (_listeners.has()) {
                if (!useAfterPaint) {
                    _listeners.fire(newWidth, newHeight);
                } else {
                    if (_invokeId !== null) {
                        apex.util.cancelInvokeAfterPaint(_invokeId);
                    }

                    _invokeId = apex.util.invokeAfterPaint(
                        function() {
                            _invokeId = null;
                            _listeners.fire(newWidth, newHeight);
                        }
                    );
                }
            }
        }

        function _handleScroll(evt) {
            evt.stopPropagation();
            if (!_checkSize(true)) {
                // Workaround for the WebKit issue where scrollLeft gets reset to 0 without the DIV being expanded
                // We will retry to the set the scrollTop only twice to avoid infinite loops
                if (_retrySetScroll > 0 && _detectExpansion.offsetParent != null &&
                    (_detectExpansion.scrollLeft == 0 || _detectExpansion.scrollTop == 0)) {
                    _retrySetScroll--;
                    _adjust(_oldWidth, _oldHeight);
                }
            }
        }

        function _handleResize() {
            _notifyListeners(false);
        }

        function _adjust(width, height) {
            _oldWidth = width;
            _oldHeight = height;

            var expansionChildStyle = _detectExpansion.firstChild.style;

            var delta = 1;

            // The following loop is a workaround for the WebKit issue with zoom < 100% -
            // the scrollTop/Left gets reset to 0 because it gets computed to a value less than 1px.
            // We will try up to the delta of 5 to support scaling down to 20% of the original size
            do {
                expansionChildStyle.width = width + delta + 'px';
                expansionChildStyle.height = height + delta + 'px';
                _detectExpansion.scrollLeft = _detectExpansion.scrollTop = delta;
                delta++;
            } while ((_detectExpansion.scrollTop == 0 || _detectExpansion.scrollLeft == 0) && delta <= 5);


            _detectContraction.scrollLeft = width;
            _detectContraction.scrollTop = height;
        }
    };

    /**
     * @preserve jQuery UI Touch Punch 0.2.3
     *
     * Copyright 2011-2014, Dave Furfero
     * Dual licensed under the MIT or GPL Version 2 licenses.
     */

    /**
     * Utility class for proxying touch events for a given element and mapping them to mouse events
     * @constructor
     * @ignore
     * @private
     */
    util.TouchProxy = function(elem) {
        this._init(elem);
    };

    /**
     * Initializes the TouchProxy instance
     *
     * @param {Object} elem
     * @private
     */
    util.TouchProxy.prototype._init = function (elem) {
        this._elem = elem;

        this._touchHandled = false;
        this._touchMoved = false;

        //add touchListeners
        this._touchStartHandler = $.proxy(this._touchStart, this);
        this._touchEndHandler = $.proxy(this._touchEnd, this);
        this._touchMoveHandler = $.proxy(this._touchMove, this);

        this._elem.on({
            "touchstart": this._touchStartHandler,
            "touchend": this._touchEndHandler,
            "touchmove": this._touchMoveHandler,
            "touchcancel": this._touchEndHandler
        });
    };

    util.TouchProxy.prototype._destroy = function () {
        if (this._elem && this._touchStartHandler) {
            this._elem.off({
                "touchstart": this._touchStartHandler,
                "touchmove": this._touchMoveHandler,
                "touchend": this._touchEndHandler,
                "touchcancel": this._touchEndHandler
            });

            this._touchStartHandler = undefined;
            this._touchEndHandler = undefined;
            this._touchMoveHandler = undefined;
        }
    };

    /**
     * Simulate a mouse event based on a corresponding touch event
     * @param {Object} event A touch event
     * @param {string} simulatedType The corresponding mouse event
     *
     * @private
     */
    util.TouchProxy.prototype._touchHandler = function (event, simulatedType) {
        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }

        // - contextmenu issues: presshold should launch the contextmenu on touch devices
        if (event.type != "touchstart" && event.type != "touchend") {
            event.preventDefault();
        }

        var touch = event.originalEvent.changedTouches[0],
            simulatedEvent = document.createEvent("MouseEvent");

        // Initialize the simulated mouse event using the touch event's coordinates
        // initMouseEvent(type, canBubble, cancelable, view, clickCount,
        //                screenX, screenY, clientX, clientY, ctrlKey,
        //                altKey, shiftKey, metaKey, button, relatedTarget);
        simulatedEvent.initMouseEvent(simulatedType, true, true, window, 1,
            touch.screenX, touch.screenY,
            touch.clientX, touch.clientY, false,
            false, false, false, 0/*left*/, null);

        touch.target.dispatchEvent(simulatedEvent);
    };

    /**
     * Handle touchstart events
     * @param {Object} event The element's touchstart event
     *
     * @private
     */
    util.TouchProxy.prototype._touchStart = function (event) {
        // Ignore the event if already being handled
        if (this._touchHandled) {
            return;
        }

        // set the touchHandled flag
        this._touchHandled = true;

        // Track movement to determine if interaction was a click
        this._touchMoved = false;

        // Simulate the mouseover, mousemove and mousedown events
        this._touchHandler(event, "mouseover");
        this._touchHandler(event, "mousemove");
        this._touchHandler(event, "mousedown");
    };

    /**
     * Handle the touchmove events
     * @param {Object} event The element's touchmove event
     *
     * @private
     */
    util.TouchProxy.prototype._touchMove = function (event) {
        // Ignore event if not handled
        if (! this._touchHandled) {
            return;
        }

        // Interaction was not a click
        this._touchMoved = true;

        // Simulate the mousemove event
        this._touchHandler(event, "mousemove");
    };

    /**
     * Handle the touchend events
     * @param {Object} event The element's touchend event
     *
     * @private
     */
    util.TouchProxy.prototype._touchEnd = function (event) {
        // Ignore event if not handled
        if (!this._touchHandled) {
            return;
        }

        // Simulate the mouseup and mouseout events
        this._touchHandler(event, "mouseup");
        this._touchHandler(event, "mouseout");

        // If the touch interaction did not move, it should trigger a click
        // except that the browser already creates a click and we don't want two of them
        /*
        if (!this._touchMoved && event.type == "touchend") {
            // Simulate the click event
            this._touchHandler(event, "click");
        } */

        // Unset the flag
        this._touchHandled = false;
    };

    util.TouchProxy._TOUCH_PROXY_KEY = "apexTouchProxy";

    util.TouchProxy.prototype.touchMoved = function() {
        return this._touchMoved;
    };

    /**
     * Adds touch event listeners
     * @param {Object} elem
     * @ignore
     */
    util.TouchProxy.addTouchListeners = function(elem) {
        var jelem = $(elem),
            proxy = jelem.data(util.TouchProxy._TOUCH_PROXY_KEY);

        if (!proxy) {
            proxy = new util.TouchProxy(jelem);
            jelem.data(util.TouchProxy._TOUCH_PROXY_KEY, proxy);
        }

        return proxy;
    };

    /**
     * Removes touch event listeners
     * @param {Object} elem
     * @ignore
     */
    util.TouchProxy.removeTouchListeners = function(elem) {
        var jelem = $(elem),
            proxy = jelem.data(util.TouchProxy._TOUCH_PROXY_KEY);

        if (proxy) {
            proxy._destroy();
            jelem.removeData(util.TouchProxy._TOUCH_PROXY_KEY);
        }
    };

})( apex.widget.util, apex.lang, apex.navigation, apex.jQuery );
