/*!
 region.js
 Copyright (c) 2016, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @namespace apex.region
 * @since 5.1
 * @desc
 * <p>The apex.region namespace contains global functions related to Oracle Application Express regions.
 * The {@link apex.fn:region|apex.region} function provides access to a {@link region} interface for a specific region.</p>
 */
/*global apex*/

(function( debug, $ ) {
    "use strict";

    var REGION_KEY = "apexregion",
        C_REGION = "js-apex-region";

    /**
     * @interface region
     * @since 5.1
     * @classdesc
     * <p>The region interface is used to access region related methods and properties. You get access
     * to the region interface for a region with the {@link apex.fn:region|apex.region} function.</p>
     *
     * <p>Plug-in developers can define the behavior of their region by calling {@link apex.region.create}.</p>
     */

    /**
     * @lends region.prototype
     */
    var regionPrototype = {
        /**
         * <p>The jQuery object for the region element.</p>
         *
         * @type {jQuery}
         */
        element: null,

        /**
         * <p>Identifies the parent (master) region ID, if the region is the detail region of a master detail relationship.
         *
         * @type string
         */
        parentRegionId: null,
        /**
         * <p>Identifies the type of the region. Regions that don't implement a custom region interface have type "generic".</p>
         *
         * @type string
         */
        type: "generic",

        /**
         * <p>For regions that are implemented with a jQuery UI style widget, this is the name of the widget. For other
         * widget implementations it is null. It is used internally by the {@link region#call} method.</p>
         *
         * @type string
         */
        widgetName: null,

        /**
         * <p>Cause the region to get new data from the server or otherwise refresh itself. Not all regions support refresh.
         * Exactly what happens depends on the type of region.</p>
         *
         * <p>This function should be used in place of the legacy way of refreshing a region, which was to trigger the
         * apexrefresh event on the region element.</p>
         *
         * <p>The default implementation triggers the legacy apexrefresh event on the region element for backward compatibility
         * with old regions that don't implement this interface.</p>
         *
         * @example <caption>The following will refresh the region with Static ID "myRegion":</caption>
         * var region = apex.region( "myRegion" );
         * region.refresh();
         */
        refresh: function() {
            this.element.trigger( "apexrefresh" );
        },

        /**
         * <p>Cause the region to take focus. Not all native or plug-in regions support taking focus. It is up to the
         * specific region to determine where focus will go. Some regions manage focus such that there is a single
         * tab stop (or limited number of tab stops) and they may put focus to where the user last had focus within
         * the region.</p>
         *
         * <p>The default implementation sets focus to the first element in the region that is capable of being tabbed
         * to.</p>
         *
         * @example <caption>The following example will focus the region with Static ID "myRegion".</caption>
         * var region = apex.region( "myRegion" );
         * region.focus();
         */
        focus: function() {
            this.element.find( ":tabbable" ).first().focus();
        },

        /**
         * <p>Returns the widget associated with the region or null if the region isn't implemented with a widget.
         * Some advanced region types such as Calendar, Interactive Grid, or Tree are implemented using a widget.
         * This function provides access to the widget typically by returning a jQuery object for the widget element.
         * You can then call widget methods on the jQuery object. See also the {@link region#call} method.</p>
         *
         * @return {jQuery|null} jQuery object or null if there is no widget associated with the region.
         * @example <caption>The following adds a row to an Interactive Grid by using the region widget method to
         * access the interactiveGrid widget {@link interactiveGrid#getActions} method and then invoking the
         * <code class="prettyprint">selection-add-row</code> action.</caption>
         * apex.region( "myGridRegion" ).widget().interactiveGrid( "getActions" ).invoke( "selection-add-row" );
         */
        widget: function() {
            return null;
        },

        /**
         * <p>Calls a method on the widget associated with the region. This method only applies to
         * regions that are implemented with a jQuery UI style widget.</p>
         *
         * @param {string} pMethod The string name of the widget method.
         * @param {...*} arguments Any number of arguments to be passed to the widget method.
         * @return {*} The return value depends on the method called.
         *
         * @example <caption>The call method is a shorthand for calling methods on a widget. The following example
         * shows an Interactive Grid region with Static ID <code class="prettyprint">emp</code> and two equivalent ways of invoking the
         * <code>getSelectedRecords</code> method.</caption>
         * var records1 = apex.region( "emp" ).call( "getSelectedRecords" );
         * // same result as above but this is more verbose
         * var records2 = apex.region( "emp" ).widget().interactiveGrid( "getSelectedRecords" );
         */
        call: function() {
            var w = this.widget();
            if ( this.widgetName && w ) {
                return $.fn[this.widgetName].apply(w, arguments);
            }
            throw new Error("Call not supported.");
        },

        /**
         * <p>For regions that use an APEX {@link model} or column items this provides a way for the
         * {@link apex.message} facility to link error messages to the source of the data entry error.</p>
         *
         * <p>The default implementation does nothing</p>
         *
         * todo doc this once error context is stable and able to create plug-ins with model/columns
         * @ignore
         * @param {Object} pErrorContext an object with properties that identify the source of the error.
         * TODO details on pErrorContext
         */
        gotoError: function( pErrorContext ) {
        },

        /**
         * <p>Return an alternative loading indicator for the given element. Not all regions have this method so
         * check if it exists before calling. For regions that support column items and when the column items may
         * not be visible on the screen at all times this allows the region to
         * place the loading indicator in an appropriate location. This can return the loading indicator passed in
         * or return a completely new loading indicator.</p>
         *
         * @method alternateLoadingIndicator
         * @instance
         * @memberof region
         * @param {Element} pElement DOM element that may represent a column item.
         * @param {jQuery} pLoadingIndicator$ A loading indicator that can be inserted in to the DOM where desired and returned or ignored.
         * @return {jQuery} loadingIndicator jQuery object or null if the region has no alternative for given element.
         */
        /* there is no default implementation
         alternateLoadingIndicator: function( pElement, pLoadingIndicator$ ) {
         return {};
         }
         */

        /**
         * <p>Regions such as Interactive Grid that support column items must implement this method so that the
         * necessary session state can be sent to the server for processing ajax requests.</p>
         *
         * <p>Returns an object containing these properties:</p>
         * <ul>
         * <li>region: The region property contains any region specific data that needs to be sent to the server.
         * The region object must include these properties:
         *  <ul>
         *  <li>id: this is the region id (not the region Static ID)</li>
         *  <li>ajaxColumns: TODO think will all regions have this?</li>
         *  <li>ajaxIdentifier: ajax identifier for the region plugin as returned by PL/SQL API apex_plugin.get_ajax_identifier</li>
         *  <li>setSessionState: an object containing properties
         *      <ul>
         *      <li>values: this is an array of {n: NAME, v: VALUE, ck: CHECKSUM} objects for each column item in pItemsToSubmit</li>
         *      <li>protected: this is the protected property of the model record metadata for the active record</li>
         *      <li>salt: this is the salt property of the model record metadata for the active record</li>
         *      </ul>
         *  TODO think what about master data model parentItems?</li>
         *  </ul></li>
         * <li>pageItems: The pageItems property is an array of page items. It contains all the items from pItemsToSubmit except
         * column items that belong to this region are removed.</li>
         *
         * <li>beforeAsync: Optional no argument function that must be called before any async operation begins
         * that could update the value of any column items related to this region.</li>
         *
         * <li>afterAsync: Optional no argument function that must be called after any async operation ends
         * that could update the value of any column items related to this region. There can be multiple calls to
         * beforeAsync and for each one afterAsync must be called.</li>
         * </ul>
         *
         * todo doc once stable
         * @ignore
         * @param {string[]} pItemsToSubmit An array of item names. It includes both page items and column items.
         * @return {Object} region context object or null if the region doesn't support getting session state
         */
        getSessionState: function( pItemsToSubmit ) {
            return null;
        },
        /**
         * <p>Returns the parent region column values for the child region of a master-detail relationship. 
         * When the detail region does AJAX requests, parent item values (e.g. foreign key columns) must be
         * added to every request. 
         * Only interactive grid regions are supported.
         *
         * <p>Returns an object containing these properties:</p>
         * <ul>
         * <li>values: Array of name-value pairs for the parent item values
         *  <ul>
         *  <li>n: name of the parent item</li>
         *  <li>v: value of the parent item</li>
         *  </ul></li>
         * </ul>
         *
         * todo doc once stable
         * @ignore
         * @return {Object} Array of name-value pairs for the parent item values
         */
        getParentItems: function () {
            var lParentRegion, lParentModel, lParentRecord, lRegionModelColumns, lRegionModelInstanceId,
                lParentItemValues,
                i;

            if ( this.parentRegionId ) {
                lParentRegion = apex.region( this.parentRegionId );

                if ( lParentRegion ) {
                    // get region model information 
                    switch ( this.type ) {

                        case "InteractiveGrid": 
                            lRegionModelColumns    = this.widget().interactiveGrid( "getCurrentView" ).modelColumns;
                            lRegionModelInstanceId = this.widget().interactiveGrid( "option" ).config.modelInstanceId;
                            break;
                    }

                    // get parent region model information
                    switch ( lParentRegion.type ) {

                        case "InteractiveGrid": 
                            lParentModel = lParentRegion.widget().interactiveGrid("getCurrentView").model;
                            break;
                    }

                    if ( lParentModel ) {
                        lParentItemValues = { values: [] };
                        lParentRecord = lParentModel.getRecord( lRegionModelInstanceId );

                        if ( lParentRecord ) {
                            for ( i in lRegionModelColumns ) {
                                if ( lRegionModelColumns[ i ].parentField ) {
                                    lParentItemValues.values.push({
                                        n: lRegionModelColumns[ i ].parentField,
                                        v: lParentModel.getValue( lParentRecord, lRegionModelColumns[ i ].parentField )
                                    });
                                }
                            }
                        }
                    } // if lParentModel
                } // if lParentRegion
            } // if lParentRegionId

            return lParentItemValues;
        }
        // TODO future consider hide, show methods
    };

    function getElement( pRegionId ) {
        return $( "#" + apex.util.escapeCSS( pRegionId ), apex.gPageContext$ );
    }

    /**
     * <p>Return a {@link region} interface for the given region id. The returned region interface object can then be
     * used to access region related functions and properties.</p>
     *
     * <p>Region plug-in developers can define the behavior of their region by calling {@link apex.region.create}.</p>
     *
     * @function fn:region
     * @memberof apex
     * @param {string} pRegionId Region id or region static id. It is a best practice to give a region a Static ID
     *   if it is going to be used from JavaScript otherwise an internally generated id is used. The region id is
     *   substituted in the region template using the #REGION_STATIC_ID# string.
     *   The region id can be found by viewing the page source in the browser.
     * @return {region | null} The region interface or null if there is no element with the given
     * <code class="prettyprint">pRegionId</code>.
     * @example <caption>This function is not used by itself. See the examples for methods of the {@link region}
     *   interface.</caption>
     */
    apex.region = function( pRegionId ) {
        var region  = null,
            element$ = getElement( pRegionId );

        if ( element$.length ) {
            region = getElement( pRegionId ).data( REGION_KEY );
            // it is expected (and more efficient) that the region has been initialized but if not return a generic region type
            if ( !region ) {
                region = $.extend( {}, regionPrototype );
                region.element = element$;
            }
        }
        return region;
    };

    /**
     * <p>This function is only used by region plug-in developers. It provides a plug-in specific implementation for the region.</p>
     *
     * <p>Use this function to give a region plug-in a set of behaviors defined by <code class="prettyprint">pRegionImpl</code>.
     * The <code class="prettyprint">pRegionImpl</code> parameter can provide its own implementation for standard
     * methods (such as refresh, focus, widget) or omit them to get the default implementation. It can add its own methods as well.
     * It should include a <code class="prettyprint">type</code> string property that specifies the type of region. If the region is implemented
     * with a jQuery UI style widget (using widget factory) then it should provide an implementation for the
     * {@link region#widget} method and define the {@link region#widgetName} property so that the
     * {@link region#call} method works.</p>
     *
     * @function create
     * @memberof apex.region
     * @static
     * @param {string} pRegionId Region id or region static id. It is a best practice to give a region a Static ID
     *   if it is going to be used from JavaScript otherwise an internally generated id is used. The region id is
     *   substituted in the region template using the #REGION_STATIC_ID# string.
     *   The region id can be found by viewing the page source in the browser.
     * @param {Object} pRegionImpl An object that provides the methods and properties for the region interface. It should provide
     *   a string type property. It can provide any additional methods that would be useful to developers.
     *   A default implementation is provided for any standard methods or properties omitted. See {@link region} for
     *   the properties and methods supported by the interface.
     * @example <caption>The following is region initialization code for a hypothetical region plug-in:</caption>
     * function initFancyList( pRegionId, ... ) {
     *     ...
     *     apex.region.create( pRegionId, {
     *         type: "FancyList",
     *         focus: function() {
     *             // code to focus region
     *         },
     *         refresh: function() {
     *             // code to refresh region
     *         }
     *     });
     * }
     */
    apex.region.create = function ( pRegionId, pRegionImpl ) {
        var region,
            element$ = getElement( pRegionId );

        if ( element$.length ) {
            region = $.extend( {}, regionPrototype, pRegionImpl );
            region.element = element$;
            element$.addClass( C_REGION );
            element$.data( REGION_KEY, region );
        } else {
            throw new Error( "Region element not found " + pRegionId );
        }
    };

    /**
     * <p>This function is only for region plug-in developers. It will destroy and remove the behaviors associated with a
     * region element. It does not remove the region element from the DOM. It is not necessary to call this function
     * if the region will exist for the lifetime of the page. If the region is implemented by a widget that has a
     * destroy method then this function can be called when the widget is destroyed.</p>
     *
     * @function destroy
     * @memberof apex.region
     * @static
     * @param {string} pRegionId Region id or region static id. It is a best practice to give a region a Static ID
     *   if it is going to be used from JavaScript otherwise an internally generated id is used. The region id is
     *   substituted in the region template using the #REGION_STATIC_ID# string.
     *   The region id can be found by viewing the page source in the browser.
     *
     * @example <caption>The following destroys the region interface but the region element remains on the page.</caption>
     * apex.region.destroy( someRegionId );
     */
    apex.region.destroy = function ( pRegionId ) {
        var element$ = getElement( pRegionId );

        if ( element$.length ) {
            element$.removeData( REGION_KEY );
        } else {
            throw new Error( "Region element not found " + pRegionId );
        }
    };

    /**
     * <p>This function returns true if and only if there is a DOM element with id equal to pRegionId that has had
     * a {@link region} interface created for it with {@link apex.region.create}.</p>
     *
     * <p>To support older regions that
     * don't implement a region interface (by calling apex.region.create) the default implementation of
     * apex.region will attempt to treat any DOM element with an id as if it were an Application Express region.
     * This function allows you to distinguish true Application Express regions from arbitrary DOM elements.</p>
     *
     * @function isRegion
     * @memberof apex.region
     * @param {string} pRegionId Region id or region static id. It is a best practice to give a region a Static ID
     *   if it is going to be used from JavaScript otherwise an internally generated id is used. The region id is
     *   substituted in the region template using the #REGION_STATIC_ID# string.
     *   The region id can be found by viewing the page source in the browser.
     * @return {boolean} true if there is an element with the given id that supports the region interface.
     * @example <caption>The following will only focus the region if it is an Application Express region.</caption>
     * if ( apex.region.isRegion( someId ) ) {
     *     apex.region( someId ).focus();
     * }
     */
    apex.region.isRegion = function( pRegionId ) {
        var element$ = getElement( pRegionId );

        if ( element$.length ) {
            return !!element$.data( REGION_KEY );
        }
        return false;
    };

    /**
     * <p>Returns the region that contains the <code class="prettyprint">pTarget</code> element.
     * Returns null if there is no <code class="prettyprint">pTarget</code> element or if it is
     * not in a region that has been initialized with a call to {@link apex.region.create}.</p>
     *
     * @function findClosest
     * @memberof apex.region
     * @param { Element | string } pTarget A DOM element or CSS selector suitable as the first argument to the jQuery function.
     * @return { region | null } A region interface or null if the element corresponding to
     *     <code class="prettyprint">pTarget</code> is not inside a region.
     * @example <caption>The following will refresh the region that contains a button with class <code class="prettyprint">refresh-button</code>
     *     when it is clicked.</caption>
     * apex.jQuery( ".refresh-button" ).click( function( event ) {
     *     var region = apex.region.findClosest( event.target );
     *     if ( region ) {
     *         region.refresh();
     *     }
     * });
     */
    apex.region.findClosest = function( pTarget ) {
        var id = $( pTarget ).parent().closest( "." + C_REGION ).prop( "id" );

        if ( id ) {
            return apex.region( id );
        }
        return null;
    };


})( apex.debug, apex.jQuery );
