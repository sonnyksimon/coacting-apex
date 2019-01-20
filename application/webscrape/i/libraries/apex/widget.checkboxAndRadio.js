/*!
 Copyright (c) 2012, 2016, Oracle and/or its affiliates. All rights reserved.
*/
/**
 * The {@link apex.widget}.checkboxAndRadio is used for the Checkboxes and Radio Group widgets of Oracle Application Express.
 **/
/*global apex, $v, $s*/
(function( widget, $, util ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {String} pType
 * @param {Object} [pOptions]
 *
 * @function checkboxAndRadio
 * @memberOf apex.widget
 * */
widget.checkboxAndRadio = function(pSelector, pType, pOptions) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions = $.extend({
                        action:    null,
                        nullValue: "",
                        inputName: null
                        }, pOptions),
        gFieldset$ = $( pSelector, apex.gPageContext$ );

    // Register apex.item callbacks
    $( pSelector, apex.gPageContext$ ).each(function(){
        var lFieldset = this,
            lItemImpl = {
                enable : function() {
                    $( ":" + pType, lFieldset )
                        .prop( "disabled", false )             // enable checkbox/radio
                        .removeClass( "apex_disabled_multi" ); // remove the relevant disabled class
                },
                disable : function() {
                    $( ":" + pType, lFieldset )
                        .prop( "disabled", true )
                        .addClass( "apex_disabled_multi" );
                },
                isDisabled : function() {
                    return $( ":" + pType, lFieldset ).first().prop( "disabled" ) === true;
                },
                setValue : function(pValue) {
                    var $lRadios    = $( ":" + pType, lFieldset ),
                        lValueArray = [];
                    // clear any checked values first
                    $lRadios.prop( "checked", false );
                    // if pType is 'checkbox', pValue could be multiple values
                    if ( pType === "checkbox" ) {
                        lValueArray = apex.util.toArray( pValue );
                    } else {
                        lValueArray[ 0 ] = pValue;
                    }
                    // loop through lValue array
                    for ( var i = 0; i < lValueArray.length; i++ ) {
                        // filter all radio inputs if value equals an array value,
                        // then add checked to filtered results
                        $lRadios.filter( "[value='" + util.escapeCSS( lValueArray[ i ] ) + "']" ).prop( "checked", true );
                    }
                },
                getValue : function() {
                    // get checked input value, in the context of the fieldset
                    // note: can't use $lRadios here because this is a reference
                    // to the initial state
                    var lReturn, $lRadio;
                    if ( pType === "checkbox" ) {
                        // checkbox will return an array
                        lReturn = [];
                        $( ":checked", lFieldset).each( function() {
                            lReturn[ lReturn.length ] = this.value;
                        });
                    } else {
                        // radio group should return a single value
                        $lRadio = $( pSelector + " :checked", apex.gPageContext$ );
                        if ($lRadio.length === 0) {
                        // check if the length of the jQuery object is zero (nothing checked)
                        // if so return an empty string.
                            lReturn = "";
                        } else {
                            // otherwise return the value
                            lReturn = $lRadio.val();
                        }
                    }
                    return lReturn;
                },
                afterModify: function() {
                    if ( $.mobile ) {
                        $( ":" + pType, lFieldset ).checkboxradio( "refresh" );
                    }
                },
                nullValue : gOptions.nullValue,
                // set focus to first input or radio in the fieldset
                setFocusTo: $( ":" + pType, lFieldset ).first(),
                loadingIndicator : function( pLoadingIndicator$ ) {
                    var lLoadingIndicator$;
                    if ( $.mobile ) {
                        lLoadingIndicator$ = pLoadingIndicator$.appendTo( $( "div.ui-controlgroup-controls", gFieldset$ ) );
                    } else {
                        lLoadingIndicator$ = pLoadingIndicator$.appendTo( gFieldset$ );
                    }
                    return lLoadingIndicator$;
                },
                displayValueFor: function( pValues ) {
                    var i, value, lblId, displayVal,
                        display = "",
                        fieldSet$ = $( lFieldset );

                    if ( pValues !== null && pValues !== undefined ) {
                        if ( !$.isArray( pValues ) ) {
                            pValues = [pValues];
                        }
                        for ( i = 0; i < pValues.length; i++ ) {
                            value = pValues[i];
                            if ( value !== undefined && value !== null ) {
                                lblId = fieldSet$.find( "[value='" + apex.util.escapeCSS( value + "" ) + "']" ).prop( "id" );
                                if ( lblId ) {
                                    displayVal = fieldSet$.find( "[for='" + apex.util.escapeCSS( lblId ) + "']" ).html();
                                    if ( displayVal !== undefined ) {
                                        if ( display.length > 0 ) {
                                            display += ", ";
                                        }
                                        display += displayVal;
                                    }
                                }
                            }
                        }
                    }
                    return display;
                }
            };

        // If this is a cascading LOV, we need to define a reinit callback...
        if ( gOptions.dependingOnSelector ) {

            lItemImpl.reinit = function( pValue ) {
                var i,
                    self = this,
                    lValueArray = ( $.isArray( pValue ) ? pValue : [ pValue ] );

                // clear all the values
                _clear();

                // loop through values and add an input for each value, this is used as intermittent storage until the
                // cascade call returns with the full set of values
                for ( i = 0; i < lValueArray.length; i++ ) {
                    gFieldset$.append( "<input type='" + pType + "' value='" + util.escapeHTML( lValueArray[ i ] ) + "'>" );
                }

                // set value and suppress change event
                this.setValue( pValue, null, true );

                // return function for cascade: don't clear value, get new values, and set
                return function() {

                    // get new values and set in the callback
                    widget.util.cascadingLov(
                        gFieldset$,
                        gOptions.ajaxIdentifier,
                        {
                            x01: gOptions.inputName,
                            pageItems: $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
                        },
                        {
                            optimizeRefresh: gOptions.optimizeRefresh,
                            dependingOn: $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                            success: function( pData ) {
                                _clear();
                                _addResult( pData );

                                // suppress change event because this is just reinstating the value that was already there
                                self.setValue( pValue, null, true );
                            },
                            target: self.node
                        }
                    );
                }
            }
        }

        apex.item.create( this.id, lItemImpl );

    });

    // if it's a cascading checkbox/radio we have to register change events for our masters
    if ( gOptions.dependingOnSelector ) {
        $( gOptions.dependingOnSelector, apex.gPageContext$ )
            .on( "change", _triggerRefresh );
    }
    // register the refresh event which is triggered by triggerRefresh or a manual refresh
    gFieldset$.on( "apexrefresh", refresh );

    // register click events on the single radio input elements if an action has been defined
    if ( gOptions.action === "REDIRECT_SET_VALUE" ) {
        gFieldset$.find( "input").click( function() {
            location.href = "f?p=" + $v( "pFlowId" ) + ":" + $v( "pFlowStepId" ) + ":" + $v( "pInstance" ) + "::" + $v( "pdebug" ) + "::" + gFieldset$.attr( "id" ) + ":" + $v( gFieldset$.attr( "id" ));
        });
    } else if ( gOptions.action === "SUBMIT" ) {
        gFieldset$.find( "input" ).click( function(){ apex.submit( gFieldset$.attr("id"));} );
    }

    // remove everything within the fieldset
    function _clear() {
        if ( $.mobile ) {
            gFieldset$.children( "div.ui-controlgroup-controls" ).empty();
        } else {
            gFieldset$.children( ":not(legend)" ).remove();
        }
    }

    // Triggers the "refresh" event of the checkbox/radiogroup fieldset which actually does the AJAX call
    function _triggerRefresh() {
        gFieldset$.trigger( "apexrefresh" );
    } // triggerRefresh

    // Called by the AJAX success callback and adds the html snippet
    function _addResult(pData) {
        if ( $.mobile ) {
            // 1.add the new checkboxes/radiogroup tags
            $( "div.ui-controlgroup-controls", gFieldset$ ).append( pData.html );
            // 2. tell jQM to initialize those widgets
            $( ":" + pType, gFieldset$ ).checkboxradio();
            // 3. jQM to set the correct rounding
            gFieldset$.controlgroup();
        } else {
            gFieldset$.append( pData.html );
        }

    } // addResult

    // Clears the existing checkboxes/radiogroups and executes an AJAX call to get new values based
    // on the depending on fields
    function refresh( pEvent ) {

        widget.util.cascadingLov(
            gFieldset$,
            gOptions.ajaxIdentifier,
            {
                x01:                gOptions.inputName,
                pageItems:          $( gOptions.pageItemsToSubmit, apex.gPageContext$ )
            },
            {
                optimizeRefresh:    gOptions.optimizeRefresh,
                dependingOn:        $( gOptions.dependingOnSelector, apex.gPageContext$ ),
                success:            function( pData ) {
                    _addResult( pData );

                    // Set item default values if they have been passed to the Ajax call
                    if ( pData.hasOwnProperty( "default" ) ) {
                        $s(gFieldset$[ 0 ], pData[ "default" ]);
                    }
                },
                clear:              _clear,
                target:             pEvent.target
            });

    } // refresh

}; // checkboxAndRadio

})( apex.widget, apex.jQuery, apex.util );
