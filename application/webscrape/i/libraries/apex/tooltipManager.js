/*
 Tooltip Manager
 Copyright (c) 2014, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*
 * A utility for managing multiple jQuery UI tooltip widgets.
 * One issue with the jQuery UI tooltip widget is that it is possible for more than one tooltip to be open at once.
 * This is undesirable because they compete for the users attention. It happens when one tooltip is shown because
 * the element has focus and another tooltip is show because of mouse hover.
 * Simply including this module will solve the multiple tooltip open issue.
 * The apex.tooltipManager has a few utility functions for working with tooltips as well.
 */

/*global apex*/

(function ( apex, $ ) {
   "use strict";

    var lastToolTipEvent = null,
        disableCount = 0, // > 0 means disabled
        SEL_TOOLTIP = ":data(ui-tooltip)";

    function closeLastTooltip() {
        var prevTipWidget, fakeEvent;
        if ( lastToolTipEvent ) {
            prevTipWidget = lastToolTipEvent.target;
            fakeEvent = $.Event( lastToolTipEvent );
            fakeEvent.target = fakeEvent.currentTarget = lastToolTipEvent.originalEvent.target;
            // check whether the tooltip is really initialized to prevent error messages on close
            if ( $( prevTipWidget ).data( "ui-tooltip" ) ) {
                $( prevTipWidget ).tooltip( "close", fakeEvent );
            }
        }
    }

    apex.tooltipManager = {
        /**
         * Close the currently open tooltip if any.
         */
        closeTooltip: closeLastTooltip,

        /**
         * Return true if tooltips are disabled.
         * @returns {boolean} true if tooltips are currently disabled and false otherwise.
         */
        tooltipsDisabled: function() {
            return disableCount > 0;
        },

        /**
         * Disable all tooltips on the page
         */
        disableTooltips: function() {
            if ( disableCount === 0 ) {
                this.closeTooltip();
                $( document ).find( SEL_TOOLTIP ).tooltip( "disable" );
            }
            disableCount += 1;
        },

        /**
         * Enable all tooltips on the page
         */
        enableTooltips: function() {
            disableCount -= 1;
            if ( disableCount <= 0 ) {
                $( document ).find( SEL_TOOLTIP ).tooltip( "enable" );
                disableCount = 0;
            }
        },

        /**
         * Return the default show option object with preferred delay and duration to show the tooltip.
         * Pass the return from this method as the value of the show option in a call to create a tooltip.
         * @return {Object}
         */
        defaultShowOption: function() {
            return {
                delay: 1000,
                effect: "show",
                duration: 500
            };
        }
    };

    $( function() {

        $( document.body ).on( "tooltipopen", function( event, ui ) {
            closeLastTooltip();
            lastToolTipEvent = event;

            // sometimes we get the event without an "originalEvent" property; 
            // since we depend on the "originalEvent" property of "lastToolTipEvent", add it for these cases.
            if ( !event.originalEvent ) { 
                lastToolTipEvent.originalEvent = { target: event.target }; 
            }
        } ).on( "tooltipclose", function( event, ui ) {
            if ( lastToolTipEvent && event.originalEvent && lastToolTipEvent.originalEvent.target === event.originalEvent.target ) {
                lastToolTipEvent = null;
            }
        } ).on( "tooltipcreate", function( event, ui ) {
            // make sure any new tooltips follow the current disabled state
            $( event.target ).tooltip( "option", "disabled", disableCount > 0 );
        } );

    });

})( apex, apex.jQuery );
