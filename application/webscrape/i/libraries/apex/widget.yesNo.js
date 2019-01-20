/*!
 Copyright (c) 2012, 2016, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * The {@link apex.widget}.yesNo is used for the Yes/No widget of Oracle Application Express.
 */
/*global apex,$x_FormItems*/
(function( item, $, util ) {
    "use strict";
/**
 * @param {DOM node | String} pPageItemId APEX page item identified by its name/DOM ID or the entire DOM node.
 *
 * @function yesNo
 * @memberOf apex.widget
 * */
apex.widget.yesNo = function( pPageItemId ) {

    var fieldset$;

    if ( $.mobile ) {
        item.create( pPageItemId, {
            enable:      function() {
                             $( this.node ).slider( "enable" );
                         },
            disable:     function() {
                             $( this.node ).slider( "disable" );
                         },
            afterModify: function() {
                             $( this.node ).slider( "refresh" );
                         }
            });
    } else {
        fieldset$ = $( "#" + util.escapeCSS( pPageItemId ), apex.gPageContext$ );

        item.create( pPageItemId, {
            enable : function() {
                $( ":radio", fieldset$ ).prop( "disabled", false );
            },
            disable : function() {
                $( ":radio", fieldset$ ).prop( "disabled", true );
            },
            isDisabled : function() {
                return $( ":radio", fieldset$ ).first().prop( "disabled" ) === true;
            },
            setValue : function( pValue ) {
                // clear any checked values first and then set the new one
                $( ":radio", fieldset$ )
                    .prop( "checked", false )
                    .filter( "[value='" + util.escapeCSS( pValue ) + "']" ).prop( "checked", true );
            },
            getValue : function() {
                // get checked input value, in the context of the fieldset, return an empty string if nothing has been checked
                // Note: we are using attr to get the value, because .val() returns a wrong value if the radio doesn't have
                //       a value attribute
                return $( ":checked", fieldset$ ).attr( "value" ) || "";
            },
            isChanged : function() {
                var i,
                    curValue = this.getValue(),
                    origValue = "",
                    elements = $x_FormItems( this.node, 'RADIO' );

                for ( i = 0; i < elements.length; i++ ) {
                    if ( elements[i].defaultChecked ) {
                        origValue = elements[i].value;
                        break;
                    }
                }
                return curValue !== origValue;
            },
            // set focus to first radio in the fieldset
            setFocusTo: $( ":radio", fieldset$ ).first(),
            displayValueFor: function( pValues ) {
                var lblId,
                    display = "";

                if ( pValues !== null && pValues !== undefined ) {
                    // there should be just one value and it must be a string
                    lblId = fieldset$.find( "[value='" + apex.util.escapeCSS( pValues + "" ) + "']" ).prop( "id" );
                    if ( lblId ) {
                        display = fieldset$.find( "[for='" + apex.util.escapeCSS( lblId ) + "']" ).html() || "";
                    }
                }
                return display;
            }
        });
    }

}; // yesNo

})( apex.item, apex.jQuery, apex.util );
