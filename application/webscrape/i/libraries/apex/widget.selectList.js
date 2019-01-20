/*!
 Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * The {@link apex.widget}.selectList is used for the select list widget of Oracle Application Express.
 */
(function( widget, util, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function selectList
 * @memberOf apex.widget
 * */
widget.selectList = function( pSelector, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions     = $.extend({
                           optionAttributes: null,
                           nullValue:        ""
                           }, pOptions ),
        gSelectList$ = $( pSelector, apex.gPageContext$ );

    // Register apex.item callbacks
    gSelectList$.each( function() {

        var lItemImpl = {
                setValue: _setValue,
                nullValue: gOptions.nullValue
            };

        // If this is a cascading LOV, we need to define a reinit callback...
        if ( gOptions.dependingOnSelector ) {

            lItemImpl.reinit = function( pValue, pDisplayValue ) {
                var self = this,
                    lValue = pValue,
                    lDisplayValue = pDisplayValue || lValue;

                // Clear current options
                if ( "nullValue" in pOptions ) {

                    // Except null value option if there is one
                    $( 'option[value!="' + util.escapeCSS( lItemImpl.nullValue ) + '"]', gSelectList$ ).remove();
                } else {
                    $( 'option', gSelectList$ ).remove();
                }

                // If the value is not the null value (or there is no null value), add a new option for the value
                // (used as intermittent storage until cascade call returns).
                if ( pOptions.nullValue !== lValue ) {
                    gSelectList$.append( "<option value='" + util.escapeHTML( lValue ) + "'>" + util.escapeHTML( lDisplayValue ) + "</option>" );
                }

                // set value and suppress change event
                this.setValue( lValue, null, true );

                // return function for cascade: don't clear value, get new values, and set
                return function() {

                    // get new values and set in the callback
                    widget.util.cascadingLov(
                        gSelectList$,
                        gOptions.ajaxIdentifier,
                        {
                            pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
                        },
                        {
                            optimizeRefresh: gOptions.optimizeRefresh,
                            dependingOn: $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                            success: function( pData ) {
                                _clearList();
                                _addResult( pData );

                                // suppress change event because this is just reinstating the value that was already there
                                self.setValue( lValue, null, true );

                            },
                            target: self.node
                        }
                    );
                }
            }
        }

        if ( $.mobile ) {
            lItemImpl = $.extend( lItemImpl, {
                enable:      function() {
                    gSelectList$.selectmenu( "enable" );
                },
                disable:     function() {
                    gSelectList$.selectmenu( "disable" );
                },
                afterModify: function() {
                    gSelectList$.selectmenu( "refresh" );
                }
            });
        }

        apex.item.create( this.id, lItemImpl );
    });

    // Sets an existing option
    function _setValue( pValue ) {
        gSelectList$.val( pValue );
        // If we haven't selected any entry then we will pick the first list entry as most browsers
        // will automatically do for drop down select lists - except of IE9 (bug# 14837012)
        // Note: We don't do this if it's a select list where the entries are always visible
        // Note: version 1.8.3 of jQuery let the browser handle default behavior, version 1.10.2 of jQuery
        // "normalizes" behavior so all browsers select nothing! Either way we want the first option selected
        if ( gSelectList$[0].selectedIndex === -1 && parseInt( $nvl( gSelectList$.attr( "size" ), "1" ), 10 ) === 1 ) {
            gSelectList$.children( "option" ).first().prop( "selected", true );
        }
    } // _setValue

    // Clears the existing options
    function _clearList() {
        // remove everything except of the null value. If no null value is defined,
        // all options will be removed (bug #14738837)
        if ( "nullValue" in pOptions ) {
            $( 'option[value!="' + apex.util.escapeCSS( gOptions.nullValue ) + '"]', gSelectList$ ).remove();
        } else {
            $( 'option', gSelectList$ ).remove();
        }

        if( $.mobile ) {
            gSelectList$.selectmenu('refresh', true);
        }
    } // _clearList

    // Called by the AJAX success callback and adds the entries stored in the
    // JSON structure: {"values":[{"r":"10","d":"SALES"},...], "default":"xxx"}
    function _addResult( pData ) {
        var lHtml = "";
        // create an HTML string first and append it, that's faster.
        // this.r and this.d are HTML escaped on the server
        $.each( pData.values, function() {
            lHtml = lHtml + '<option value="' + this.r + '" ' + gOptions.optionAttributes + '>' + this.d + '</option>';
        });
        gSelectList$.append( lHtml );

        if( $.mobile ) {
            gSelectList$.selectmenu('refresh', true);
        }

    } // _addResult

    // Clears the existing options and executes an AJAX call to get new values based
    // on the depending on fields
    function refresh( pEvent ) {

        widget.util.cascadingLov(
            gSelectList$,
            gOptions.ajaxIdentifier,
            {
                pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
            },
            {
                optimizeRefresh: gOptions.optimizeRefresh,
                dependingOn:     $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                success:         function( pData ) {

                    _addResult( pData );

                    // Set the default value of the page item.
                    // The change event is also needed by cascading LOVs so that they are refreshed with the
                    // current selected value as well (bug# 9907473)
                    $s( gSelectList$[0], pData[ "default" ] );

                },
                clear:           _clearList,
                target:          pEvent.target
            });

    } // refresh

    // if it's a cascading select list we have to register apexbeforerefresh and change events for our masters
    if ( gOptions.dependingOnSelector ) {

        $( gOptions.dependingOnSelector, apex.gPageContext$ )
            .on( "apexbeforerefresh", _clearList )
            .on( "change", refresh );

    }

    // register the refresh event which is triggered by a manual refresh
    gSelectList$.on( "apexrefresh", refresh );

}; // selectList

})( apex.widget, apex.util, apex.jQuery );
