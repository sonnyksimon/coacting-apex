/*global apex,$x,$v,$s*/
/*!
 widget.shuttle.js
 Copyright (c) 2012, 2016, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex.widget}.shuttle is used for the Shuttle widget of Oracle Application Express.
 **/

(function( widget, $ ) {
"use strict";
/**
 *
 * @param {String} pSelector jQuery selector to identify APEX page item for this widget.
 * @param {Object} [pOptions]
 *
 * @function shuttle
 * @memberOf apex.widget
 * */
widget.shuttle = function( pSelector, pOptions ) {

  // Default our options
  var lOptions = $.extend({
                   optionAttributes: null
                 }, pOptions);

  // TODO consider enable and disable buttons so that they are only enabled when they will actually do something - reduces tab stops
  // TODO consider shortcut to move between the left and right lists for better keyboard accessibility

  var lInitialValue,
      lShuttle           = $(pSelector, apex.gPageContext$),
      lShuttleListLeft   = $(pSelector+'_LEFT', apex.gPageContext$),
      lShuttleListRight  = $(pSelector+'_RIGHT', apex.gPageContext$),
      lSavedOptionsLeft  = $('option', lShuttleListLeft),
      lSavedOptionsRight = $('option', lShuttleListRight );

  // Register apex.item callbacks
  $(pSelector, apex.gPageContext$).each(function(){
      var self = this;
      widget.initPageItem(this.id, {
        enable: function() {
            var lFieldset;
            lFieldset = $x(self.id);
            // enable all the buttons
            $( 'button', lFieldset ).prop( 'disabled', false ).removeClass('is-disabled');
            // enable selects
            $('select', lFieldset)
              .prop('disabled', false)
              .removeClass('apex_disabled');
        },
        disable: function() {
            var lFieldset;
            lFieldset = $x(self.id);
            // deselect all options first
            $('option:selected', lFieldset).prop('selected', false);
            // disable all the buttons
            $( 'button', lFieldset ).prop( 'disabled', true ).addClass( 'is-disabled' );
            // disable selects
            $('select', lFieldset)
              .prop('disabled', true)
              .addClass('apex_disabled');
        },
        isDisabled: function() {
            return !!lShuttleListRight.prop( "disabled" );
        },
        setValue: function(pValue) {
            var lValueArray;

            // remove all values from right
            _removeAll(null, true); // don't fire change event
            // create array from pValue
            lValueArray = apex.util.toArray(pValue);
            // iterate over values to set, compare with left hand values, and if matched
            // move to right, if no match don't add to right
            for (var i=0; i < lValueArray.length; i++) {
                $('option', lShuttleListLeft[0]).each(function(){
                    if (this.value === lValueArray[i]) {
                      // move the found options from the left list into the right list
                      $(this)
                        .appendTo(lShuttleListRight).prop('selected', true);
                      // stop execution of 'each', to get to next i iterator faster
                      return false;
                    }
                });
            }
        },
        getValue: function() {
            var lReturn = [];
            $('option', lShuttleListRight[0]).each(function(){
                lReturn.push( this.value );
            });
            return lReturn;
        },
        isChanged: function() {
            return $v( lShuttle[0] ) !== lInitialValue;
        },
        setFocusTo: lShuttleListLeft,
        // Add a loading indicator to the shuttle.
        // Note: the load indicator will not show up if the move controls are not there. Putting them
        //       somewhere else would result in a jumping layout
        loadingIndicator : function( pLoadingIndicator$ ) {
            return pLoadingIndicator$.prependTo( $( "td.shuttleControl", lShuttle ) );
        }
      });
  });

  lInitialValue = $v( lShuttle[0] );

  // Triggers the "refresh" event of the select list which actually does the AJAX call
  function _triggerRefresh() {
    lShuttle.trigger('apexrefresh');
  } // _triggerRefresh

  // Remove everything from both lists and store the empty options for reset
  function _clear() {
    lSavedOptionsLeft  = lShuttleListLeft.empty().children();
    lSavedOptionsRight = lShuttleListRight.empty().children();
  }

  // Called by the AJAX success callback and adds the entries stored in the
  // JSON structure: {"values":[{"r":"10","d":"SALES"},...], "default":"10"}
  function _addResult( pData ) {
    var lHtml = "";

      // create an HTML string first and append it to the left select list, that's faster.
    $.each( pData.values, function() {
      // the server HTML escapes the data so no need to do it here.
      lHtml = lHtml + '<option value="' + this.r + '" ' + lOptions.optionAttributes + '>' + this.d + '</option>';
    });
    // add the options and store them for reset
    lShuttleListLeft.html( lHtml );

    // It is possible that the new value is the same as the previous value.
    // However a change event is still needed just in case it is the same value but for different reasons
    // that another item that depends on this item would notice. This all stems from the fact that an APEX
    // list based item can depend on any number of items to generate the list but can only specify a single
    // cascading LOV parent and there can be multiple levels of cascade.
    // $s will always fire a change event.
    $s( lShuttle[0], pData["default"] );

    // save new saved options based on the default value
    lSavedOptionsLeft  = $('option', lShuttleListLeft);
    lSavedOptionsRight = $('option', lShuttleListRight);

  } // _addResult

  // Clears the existing options and executes an AJAX call to get new values based
  // on the depending on fields
  function refresh( pEvent ) {

    widget.util.cascadingLov(
        lShuttle,
        lOptions.ajaxIdentifier,
        {
            pageItems: $( lOptions.pageItemsToSubmit, apex.gPageContext$ )
        },
        {
            optimizeRefresh:          lOptions.optimizeRefresh,
            dependingOn:              $( lOptions.dependingOnSelector, apex.gPageContext$ ),
            loadingIndicator:         lShuttle,
            success:                  _addResult,
            clear:                    _clear,
            target:                   pEvent.target
        });

  } // refresh

  function _reset( pEvent ) {
    var prevValue = $v(lShuttle[0]);
    // restore the original left and right list
    lShuttleListLeft
      .empty()
      .append(lSavedOptionsLeft)
      .children() // options
      .prop('selected', false);
    lShuttleListRight
      .empty()
      .append(lSavedOptionsRight)
      .children() // options
      .prop('selected', false);
    if ( $v( lShuttle[0] ) !== prevValue ) {
      // trigger the change event for the shuttle
      lShuttle.change();
    }
    pEvent.preventDefault();
  } // _reset

  function _move( pEvent, pAll ) {
    var $OptionsToMove = $('option'+(pAll?'':':selected'), lShuttleListLeft);
    // deselect everything on the right side first
    $('option:selected', lShuttleListRight).prop('selected', false);
    // if there are options to move, move them and trigger change event
    if ($OptionsToMove.length) {
      // move the selected options from the left list into the right list
      $OptionsToMove
        .appendTo(lShuttleListRight).prop('selected', true);
      // trigger the change event for the shuttle
      lShuttle.change();
    }
    pEvent.preventDefault();
  } // _move

  function _moveAll( pEvent ) {
    _move(pEvent, true);
  } // _moveAll

  function _remove( pEvent, pAll, noNotify ) {
    var $OptionsToRemove = $('option'+(pAll?'':':selected'), lShuttleListRight);
    // deselect everything on the left side first
    $('option:selected', lShuttleListLeft).prop('selected', false);
    // if there are options to remove, remove them and trigger change event
    if ($OptionsToRemove.length) {
      // move the selected options from the right list into the left list
      $OptionsToRemove.appendTo(lShuttleListLeft).prop('selected', true); // TODO this should preserve the original order

      if ( !noNotify ) {
          // trigger the change event for the shuttle
          lShuttle.change();
      }
    }
    if ( pEvent ) {
        pEvent.preventDefault();
    }
  } // _remove

  function _removeAll( pEvent, noNotify ) {
    _remove(pEvent, true, noNotify);
  } // _removeAll

  function _moveTop( pEvent ) {
    var prevValue = $v(lShuttle[0]);

    // move the selected options in the right list to the top and select them
    $('option:selected', lShuttleListRight)
      .prependTo(lShuttleListRight).prop('selected', true);

    if ( $v( lShuttle[0] ) !== prevValue ) {
      // trigger our change order event for the shuttle
      lShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveTop

  function _moveUp( pEvent ) {
    var moved = false;
    $('option:selected', lShuttleListRight).each(function(){
      var lPrevOption = $(this).prev();
      // don't do anything if the selected is already at the top or selected
      if (lPrevOption.length===0 || lPrevOption.prop('selected')) {
        return;
      }
      // move the option before the previous one and select it again
      $(this).insertBefore(lPrevOption).prop('selected', true);
      moved = true;
     });

    if ( moved ) {
      // trigger our change order event for the shuttle
      lShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveUp

  function _moveDown( pEvent ) {
    var i, lNextOption$,
        moved = false,
        selectedOptions$ = $('option:selected', lShuttleListRight);

    // Because of the check for next being selected need to go in reverse direction
    for ( i = selectedOptions$.length - 1; i >= 0; i-- ) {
      lNextOption$ = selectedOptions$.eq(i).next();
      // don't do anything if the selected is already at the bottom or selected
      if ( lNextOption$.length === 0 || lNextOption$.prop('selected') ) {
        continue;
      }
      // move the option before the previous one and select it again
      selectedOptions$.eq(i).insertAfter(lNextOption$).prop('selected', true);
      moved = true;
     }

    if ( moved ) {
      // trigger our change order event for the shuttle
      lShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveDown

  function _moveBottom( pEvent ) {
    var prevValue = $v(lShuttle[0]);

    // move the selected options in the right list to the bottom and select them
    $('option:selected', lShuttleListRight)
      .appendTo(lShuttleListRight).prop('selected', true);

    if ( $v( lShuttle[0] ) !== prevValue ) {
      // trigger our change order event for the shuttle
      lShuttle.trigger('shuttlechangeorder');
    }
    pEvent.preventDefault();
  } // _moveBottom

  function _stopEvent(pEvent) {
    pEvent.stopImmediatePropagation();
  } // _stopEvent

  function _bindIconClickHandlers() {
    // register control events
    $(pSelector+"_RESET", apex.gPageContext$).click(_reset);
    $(pSelector+"_MOVE", apex.gPageContext$).click(_move);
    $(pSelector+"_MOVE_ALL", apex.gPageContext$).click(_moveAll);
    $(pSelector+"_REMOVE", apex.gPageContext$).click(_remove);
    $(pSelector+"_REMOVE_ALL", apex.gPageContext$).click(_removeAll);

    $(pSelector+"_TOP", apex.gPageContext$).click(_moveTop);
    $(pSelector+"_UP", apex.gPageContext$).click(_moveUp);
    $(pSelector+"_DOWN", apex.gPageContext$).click(_moveDown);
    $(pSelector+"_BOTTOM", apex.gPageContext$).click(_moveBottom);
  }

  // if it's a cascading select list we have to register change events for our masters
  if (lOptions.dependingOnSelector) {
    $(lOptions.dependingOnSelector, apex.gPageContext$)
        .on( "change", _triggerRefresh );
  }

  // register the refresh event which is triggered by triggerRefresh or a manual refresh
  lShuttle.on( "apexrefresh", refresh);

  // don't fire change events for the left side and right side, otherwise the change event would fire
  // as soon as an entry is selected in the list, but that's not what we want. The change event should
  // only fire if something is moved or reordered
  lShuttleListLeft.change(_stopEvent);
  lShuttleListRight.change(_stopEvent);

  // register the double click and ENTER key event handlers to move options back and forth
  $( lShuttleListLeft )
    .dblclick( _move )
    .keydown( function ( e ) {
      if( e.which === 13 ) {
        _move( e, false );
        e.preventDefault();
      }
  });
  $( lShuttleListRight )
    .dblclick( _remove )
    .keydown( function ( e ) {
      if( e.which === 13 ) {
        _remove( e );
        e.preventDefault();
      }
  });

  _bindIconClickHandlers();

}; // shuttle

})( apex.widget, apex.jQuery );
