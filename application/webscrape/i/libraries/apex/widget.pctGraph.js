/*!
 Copyright (c) 2016, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * The {@link apex.widget}.pctGraph is used for the percent graph widget of Oracle Application Express.
 */
( function( widget, util, locale, item, $ ) {
    "use strict";

    var defaultOptions = {
        showValue: true
    };

    /**
     * @param {String} DOM id to identify APEX item for this widget.
     * @param {Object} [pOptions]
     *
     * @function pctGraph
     * @memberOf apex.widget
     * */
    widget.pctGraph = function( itemId, options ) {
        var item$ = $( "#" + itemId );

        function normalize( value ) {
            // value is a string which is formated with the NLS decimal separator of the database session.
            // parseFloat always expects a dot, that's why we have to replace it
            value = Math.round( parseFloat( value.replace( locale.getDecimalSeparator(), "." )));

            if ( isNaN( value ) ) {
                value = null;
            } else if ( value < 0 ) {
                value = 0;
            } else if ( value > 100 ) {
                value = 100;
            }
            return value;
        }

        function render( value ) {
            var out = util.htmlBuilder();

            value = normalize( value );
            
            if ( value !== null ) {
                out.markup( "<div class='a-Report-percentChart'" );
                if ( options.backgroundColor || options.width ) {
                    out.optionalAttr(
                        "style",
                        ( options.backgroundColor ? "background-color:" + options.backgroundColor + ";" : "" ) +
                        ( options.width ? "width:" + options.width + "px" : "" )
                    );
                }
                out.markup( "><div class='a-Report-percentChart-fill'" )
                    .optionalAttr(
                        "style",
                        "width:" + value + "%;" +
                        ( options.foregroundColor ? "background-color:" + options.foregroundColor : "" )
                    )
                    .markup( "></div>" )
                    .markup( "<span class='u-VisuallyHidden'>" )
                    .content( value + "%" )
                    .markup( "</span></div>" );
            }
            return out.toString();
        }

        options = $.extend( true, {}, defaultOptions, options );
        
        item$.html( render( item$.html() ));
        
        item.create( itemId, {
            displayValueFor: render
        });
    };

})( apex.widget, apex.util, apex.locale, apex.item, apex.jQuery );