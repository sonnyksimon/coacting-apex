/*global apex,$x,$v,$s*/
/*!
 widget.listManager.js
 Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget}.listManager is used for the List Manager widget of Oracle Application Express.
 */
(function( widget, $, undefined ) {
"use strict";
/**
 * @param {String} pSelector jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function listManager
 * @memberOf apex.widget
 */
widget.listManager = function(pSelector, pOptions) {

  // Default our options and store them with the "global" prefix, because it's
  // used by the different functions as closure
  var lInitialValue,
      lOptions = $.extend({
                   dependingOnSelector:null,
                   optimizeRefresh:true,
                   pageItemsToSubmit:null,
                   filterWithValue:false,
                   windowParameters:null
                 }, pOptions),
      lListManager$ = $(pSelector, apex.gPageContext$),
      lListManagerAdd$ = $(pSelector + "_ADD", apex.gPageContext$);

  $(pSelector, apex.gPageContext$).each(function(){
      var self = this;
      // register callbacks
      widget.initPageItem(this.id, {
        enable      : function() {
            // store fieldset dom element that contains all the list manager's elements
            var lFieldset = $x(self.id + '_fieldset');

            // enable all the input elements
            $(':input', lFieldset)
              .prop('disabled', false)          // enable all input elements in the fieldset
              .filter('[type!=button]')         // filter out buttons
              .removeClass('apex_disabled');    // and remove class from non buttons

            // register the click event for the icon anchor to call the popup lov dialog
            registerIconEvent();

            // enable the icon, don't pass a value for pClickHandler as this has been
            // rebound via registerIconEvent
            widget.util.enableIcon($(lFieldset), '#');

        },
        disable     : function() {
            // store fieldset dom element that contains all the list manager's elements
            var lFieldset = $x(self.id + '_fieldset');

            // deselect all options first
            $('option:selected', $x(self.id)).attr('selected', false);

            // disable all the input elements
            $(':input', lFieldset)
              .prop('disabled', true)           // disable all input elements in the fieldset
              .filter('[type!=button]')         // filter out buttons
              .addClass('apex_disabled');       // and add class to non buttons

            // disable the icon
            widget.util.disableIcon($(lFieldset));

        },
        isDisabled  : function() {
            return !!$( "#" + self.id ).prop( 'disabled' );
        },
        hide        : function() {
            $('#' + self.id + '_fieldset', apex.gPageContext$).hide();
        },
        show        : function() {
            $('#' + self.id + '_fieldset', apex.gPageContext$).show();
        },
        setValue    : function(pValue) {
            var lValueArray,
                lHtml = "";
            // only proceed with set if pValue is not undefined
            if (typeof(pValue) !== 'undefined'){
                // set new value, we don't check if value exists here as the existing list manager
                // allows any value to be added to the list
                // create array from pValue
                lValueArray = apex.util.toArray(pValue);
                // loop through lValue array and build new options html string
                $.each(lValueArray, function(key, value) {
                    value = apex.util.escapeHTML( value );
                    lHtml += '<option value="' + value + '">' + value + '</option>';
                });
                lListManager$                // select list manager
                    .find('option')             // find options
                        .remove()                   // remove them
                        .end()                      // end option find
                    .append(lHtml);             // append new options
            }
        },
        getValue    : function() {
            var lReturn = [];
            // iterate over list manager options and populate array with values
            $('option', lListManager$[0]).each(function(){
                lReturn.push( this.value );
            });
            return lReturn;
        },
        isChanged   : function() {
            return $v( lListManager$[0] ) !== lInitialValue;
        },
        addValue    : function( pValue ) {
            var lItems = pValue.split(","), // List manage supports adding multiple, comma separated values
                lItem, i,
                lChanged = false,
                lHtml = "";

            for ( i = 0; i < lItems.length; i++ ) {
                lItem = $.trim( lItems[i] );
                if ( lItem !== "" ) {
                    // If the value to be added doesn't already exist in the list manager, add it
                    // only double quotes need to be CSS escaped in the selector
                    if ( lListManager$.find( 'option[value="' + lItem.replace(/"/g, "\\\"") + '"]' ).length === 0 ) {
                        lItem = apex.util.escapeHTML( lItem );
                        lHtml = '<option value="' + lItem + '">' + lItem + '</option>';
                        lListManager$.append( lHtml );
                        lChanged = true;
                    }
                }
            }

            // If a value has been added, trigger the change event
            if ( lChanged ) {
                lListManager$.change();
            }
        },
        removeValue : function() {
            var lSelectedOptions$ = lListManager$.find( ":selected" );
            
            // Only remove and trigger change event, if there is something selected
            if ( lSelectedOptions$.length > 0 ) {
                lSelectedOptions$.remove();
                lListManager$.change();
            }
        },
        getPopupSelector: function() {
            return ".ui-dialog";
        }
      });
  });

  lInitialValue = $v( lListManager$[0] );

  function _setPopupLovReturnValue( pEvent, pValue ) {

    var lItem = apex.item( lListManagerAdd$.attr("id") );

    lItem.setValue( pValue.r );
    lItem.setFocus();

  } // _setPopupLovReturnValue

    // Triggers the "refresh" event of the list manager which actually does the AJAX call
  function _triggerRefresh() {
    lListManager$.trigger('apexrefresh');
  } // triggerRefresh

  // Clears the existing values from the list manager fields and fires the before
  // and after refresh events
  function refresh() {
    // trigger the before refresh event
    lListManager$.trigger('apexbeforerefresh');

    // remove everything
    lListManagerAdd$.val("");
    $('option', lListManager$).remove();
    lListManager$.change();

    // trigger the after refresh event
    lListManager$.trigger('apexafterrefresh');
  } // refresh

  function _callPopup() {

    widget.util.callPopupLov(
        lOptions.ajaxIdentifier,
        {
            pageItems: $( lOptions.pageItemsToSubmit, apex.gPageContext$ ).add( lOptions.dependingOnSelector )
        }, {
            filterOutput:     lOptions.filterWithValue,
            filterValue:      lListManagerAdd$.val(),
            windowParameters: lOptions.windowParameters,
            target:           lListManagerAdd$[0]
        } );

    return false;
  } // _callPopup

  function registerIconEvent() {
    // register the click event for the icon anchor to call the popup lov dialog
    $(pSelector+"_ADD_lov_btn", apex.gPageContext$).click(_callPopup);
  } //registerIconEvent

  lListManagerAdd$.on("_setpopuplovreturnvalue", _setPopupLovReturnValue );

  // register the click event for the icon anchor to call the popup lov dialog
  registerIconEvent();

  // if it's a cascading list manager we have to register change events for our masters
  if (lOptions.dependingOnSelector) {
    $(lOptions.dependingOnSelector, apex.gPageContext$).change(_triggerRefresh);
  }
  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  lListManager$.on("apexrefresh", refresh);

  // Need to identify when a change event has been triggered from adding or removing
  // a list item, and when the change event has been triggered from selecting or deselecting
  // an item that's already been added (default HTML behaviour for multi-selects).
  // Because, in the case where the change event has come from selecting / deselecting we don't
  // want the change event to propagate, because nothing has really changed in this case.
  //
  // Use the originalEvent property of the jQuery event object, as this is undefined when
  // the change event has been triggered by adding or removing a list item. So therefore
  // we stop the event when this is not equal to undefined.
  lListManager$.change(function(e) {
    if (e.originalEvent !== undefined) {
      e.stopImmediatePropagation();
    }
  });

}; // listManager

})( apex.widget, apex.jQuery );
