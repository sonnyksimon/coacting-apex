/*!
 Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*
 * This plugin enhances the [JQM] responsiveTable widget with Oracle Application Express features.
 */
(function( $, widget ) {
"use strict";

var isJQM = !!$.mobile,
    ns = isJQM ? "mobile" : "apex",
    dataMethod = isJQM ? "jqmData" : "data",
    clickEvent = isJQM ? "vclick" : "click",
    protoOptions = $[ns].table.prototype.options;

if ( isJQM ) {
    // Check if the script has already been loaded, because we want to avoid
    // that an AJAX based page transition loads and binds the tablecreate event
    // a second time, which would cause that the enhancement is done twice!
    if ( widget.jqmTable ) {
        return;
    } else {
        widget.jqmTable = true;
    }
}

/**
 * APEX specific options which are supported for the table widget.
 *
 * @param {String}  apexRegionId         Static Region Id or Region Id which identifies the Reflow or Column Toggle region.
 * @param {String}  apexAjaxIdentifier   AJAX identifier used to call the server part of the component.
 * @param {String}  [apexPageItems]      jQuery selector which contains the page items to be submitted with the AJAX call.
 **/
protoOptions.apexRegionId = "";
protoOptions.apexAjaxIdentifier = "";
protoOptions.apexPageItems = "";

$( document ).on( "tablecreate", "table", function() {
    var lRegion$,
        lTable$ = $( this ),
        lOptions = lTable$.data( ns + "-table" ).options;

    // Don't continue if the required attributes region id and ajax identifier are not set. It's very likely that it's
    // not an AJAX enhanced table.
    if ( !lOptions.apexRegionId || !lOptions.apexAjaxIdentifier ) {
        return;
    }

    // Get the containing APEX region
    lRegion$ = lTable$.parents( "#" + lOptions.apexRegionId );

    // create a region interface to handle refresh etc.
    apex.region.create( lOptions.apexRegionId, {
        type: "ResponsiveTable",
        widgetName: "table",
        refresh: function () {
            _refresh();
        },
        widget: function () {
            return lTable$;
        }
    } );

    // register the "Load more" handling for the table
    // todo lTable$.on( clickEvent, "li.apex-load-more", _loadMore );

    // todo filtering server/client

    // AJAX callback to get more data for the table
    function _ajax( pFirstRow ) {

        apex.server.plugin( lOptions.apexAjaxIdentifier,
            {
                pageItems: lOptions.apexPageItems,
                x01:       "FETCH",
// todo                x04:       lTable$[dataMethod]( "apex-last-search" ),
                x05:       pFirstRow
            }, {
                dataType:         "html",
                loadingIndicator:  isJQM ? function() {
                                      $.mobile.loading( "show" );
                                      return function() { $.mobile.loading( "hide" ); };
                                  } : lTable$,
                loadingIndicatorPosition:   "centered",
                refreshObject:    lTable$,
                clear:            ( pFirstRow === 1 ? _clear : undefined ),
                success:          _addResult
            });

    } // _call

    // todo Load additional rows
    /*
    function _loadMore( event ) {

        // Get the next list entries, count number of existing LI's which are not dividers
        _ajax( $( "li[data-role!='list-divider']", lTable$ ).length );
        event.preventDefault();

    } // _loadMore
    */

    // Clears the table contents and is called before the AJAX call
    function _clear() {
        lTable$.find("tbody").empty(); // don't refresh at this point because don't want to see the no data found message
    } // _clear

    // This function adds the result of the AJAX call to the table and is called by the AJAX success callback
    function _addResult( pData ) {
        var lData$ = $( pData );

        // remove the "Load more" entry first
        // todo $( "li.apex-load-more", lTable$ ).remove();

        // add the new result to the existing table body
        lTable$.find("tbody").append( lData$ );
        // refresh after DOM is updated
        lTable$.table( "refresh" );
    } // _addResult

    // Executes an AJAX call to get new entries starting with the first record
    function _refresh() {
        _ajax( 1 ); // Get the first record
    } // _refresh

    // Initializes the server based search field with all it's callbacks
    /* todo
    function _initSearch() {

        function doSearch() {
            var lSearch = lSearch$.val();

            lTable$[dataMethod]( "apex-last-search", lSearch );
            _ajax( 1 );
        }

        // Add a search field which calls our AJAX function when the user leaves the field or clicks "Search/Submit".
        // Use a similar code as in jquery.mobile.listview.filter.js
        var lOrigDefaultFilterCallback = $[ns].filterable.prototype.options.filterCallback,
            lSearchInputId = isJQM ? lOptions.apexRegionId + "_filter_input" : lTable$.attr( "data-input" ).substr(1),
            lWrapper$ = $( "<div>", {
                            "class": "ui-filterable ui-bar-" + lTable$.attr("data-filter-theme"),
                            "role": "search"
                        }),
            lSearch$  = $( "<input>", {
                id: lSearchInputId,
                placeholder: lTable$.attr("data-filter-placeholder"),
                "data-type": "search"
            });

        lSearch$.appendTo( lWrapper$ );
        lWrapper$.insertBefore( lTable$ );
        if ( isJQM ) {
            lSearch$.textinput();
        }
        // todo else consider what needs to be done to provide similar functionality for the input when not using jqm

        if ( lOptions.inset ) {
            lWrapper$.addClass( "ui-listview-filter-inset" );
        }

        if ( lOptions.apexFilter ) {
            // We only search if the user leaves the field or presses enter in a mobile environment,
            // that's much better for the bandwidth!
            lSearch$.on( "change", doSearch )
                .on( "keydown", function(event) {
                    if ( event.which === 13 ) {// enter key
                        event.preventDefault();
                        doSearch();
                    }
                } );
        } else {
            // hook up the client filterable
            lTable$.filterable( {
                // Override the default filter callback with one that does not hide list dividers
                filterCallback: function( index, searchValue ) {
                    return !this.className.match( /(^|\s)ui-li-divider(\s|$)/ ) &&
                        lOrigDefaultFilterCallback.call( this, index, searchValue );
                }
            } );
        }

    } // _initSearch
    */

});

})( apex.jQuery, apex.widget );