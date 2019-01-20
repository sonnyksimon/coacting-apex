/*!
 Popup - a jQuery UI based widget based on dialog
 Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*global apex*/
(function ( $ ) {
    "use strict";

    /*
     * A popup is a modal dialog without a title bar that closes when click/touch outside of it. It is also not
     * resizable or draggable
     */

    $.widget( "apex.popup", $.ui.dialog, {
        version: "18.1",
        widgetEventPrefix: "popup",
        options: {
            parentElement: null
        },

        _create: function() {
            var o = this.options,
                dialog$ = this.element;

            // force some options
            o.resizable = false;
            o.draggable = false;
            o.modal = true;

            if ( o.parentElement ) {
                o.position = {
                    my: "left top",
                    at: "left bottom",
                    of: o.parentElement,
                    collision: "fit flip"
                };
            }

            this._super();

            // let the popup fit the content
            if ( o.width === "auto" ) {
                this.uiDialog.css( "display", "inline-block" ).hide();
            }

            this.uiDialog.addClass( "ui-dialog--popup" );
            this.uiDialog.children(".ui-dialog-titlebar" ).hide();
            dialog$.on( "popupopen", function() {
                // click outside dialog to close it
                $( ".ui-widget-overlay" ).click( function() {
                    dialog$.popup( "close" );
                } );
            });
        },

        _setOption: function( key, value ) {
            var o = this.options;
            if ( key === "draggable" || key === "resizable" || key === "modal" ) {
                throw new Error( "Popup " + key + " cannot be set." );
            }
            this._super( key, value );
            if ( key === "parentElement" && value !== null && o.position ) {
                o.position.of = value;
            }
        }
    } );

})( apex.jQuery );
