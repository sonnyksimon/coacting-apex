/*
 * Star Rating APEX Item plugin
 */

/*global window,apex*/
( function( util, item, $ ) {
    "use strict";

    var keys = $.ui.keyCode;

    var defaultOptions = {
        numStars:      5,
        iconClass:     "fa-star",
        increment:     1, 
        activeColor:   "red",
        inactiveColor: "#e0e0e0",
        clearTooltip:  "Clear Rating",
        labelText:     "#VALUE#",
        isRequired:    false
    };

    var starWidth  = 16,
        starHeight = 16;

    /**
     * @param itemId
     * @param options
     */
    window.starRatingItemInit = function( itemId, options ) {
        var sr$, dummyStar$,
            forwardKey  = keys.RIGHT,
            backwardKey = keys.LEFT,
            item$       = $( "#" + itemId );


        function starsWidth(value) {
            return Math.round( ( 100 / options.numStars ) * value );
        }

        function normalize(value) {
            if ( value === "" || value === false || value === null ) {
                if ( options.isRequired ) {
                    value = 0;
                } else {
                    value = "";
                }
            } else {
                value = parseFloat( value );
    
                if ( isNaN( value ) ) {
                    value = 0;
                }
                if ( value < 0 ) {
                    value = 0;
                } else if ( value > options.numStars ) {
                    value = options.numStars;
                }
            }
            return value;
        }

        function getClearButton() {
            var bt$,
                out = util.htmlBuilder();
                 
            out.markup( "<div " )
               .attr( "class", "star-rating-clear" )
               .attr( "title", options.clearTooltip )
               .attr( "aria-hidden", "true" )
               .attr( "style", "height: " + ( starHeight + 4 ) + "px;" )
               .markup( ">" )
               .markup( "<span " )
               .attr( "class", "fa fa-times-circle-o" )
               .markup( ">" )
               .markup( "</span>" )
               .markup( "</div>" );

            bt$ = $( out.toString() );
            bt$.on( "click", function( e ) { 
                if ( item$.val() === "0" ) {
                    item$.val( "" ).change();
                } else {
                    item$.val( 0 ).change(); 
                }
                updateDisplay();
            } );

            return bt$;
        }

        function render( full, value ) {
            var i, star$, starwidth, starheight,
                out = util.htmlBuilder();


            if ( full === true ) {
                out.markup(" <div " )
                   .attr( "class", "star-rating star-rating-grid" ) 
                   .attr( "aria-label", options.labelText.replace( /#VALUE#/, "" + value ) )
                   .markup( "><div " )
                   .attr( "class", "star-rating-inner" )
                   .attr( "aria-hidden", "true" )
                   .attr( "style", "width: " + ( starWidth * options.numStars + 2 ) +  "px; height: " + starHeight + "px" )
                   .optionalAttr( "title", full ? options.labelText.replace( /#VALUE#/, "" + value ) : null )
                   .markup(">");
            }
            out.markup( "<span " )
               .attr( "class", "star-rating-bg" )
               .attr( "aria-hidden", "true" )
               .markup( ">" );

            for ( i = 0; i < options.numStars; i++ ) {
                out.markup( "<span " )
                   .attr( "class", "star-rating-star fa " + options.iconClass )
                   .optionalAttr("style", "color: " + options.inactiveColor + ";" )
                   .markup( "></span>");
            }
            out.markup( "</span>" )
               .markup( "<span " )
               .attr( "class", "star-rating-stars" )
               .attr( "aria-hidden", "true" )
               .optionalAttr("style", ( full ? "width:" + starsWidth(value) + "%;" : null) + "color: " + options.activeColor + ";" )
               .markup( ">" );

            for ( i = 0; i < options.numStars; i++ ) {
                out.markup( "<span " )
                   .attr( "class", "star-rating-star fa " + options.iconClass ) 
                   .optionalAttr("style", "color: " + options.activeColor + ";" )
                   .markup( "></span>");
            }
            out.markup( "</span>" );

            if ( full ) {
                out.markup( "</div></div>" );
            }

            return out.toString();
        }

        function updateDisplay() {
            var value = normalize( item$.val(), true );

            sr$.attr("title", options.labelText.replace( /#VALUE#/, value ) )
               .children( ".star-rating-stars" ).css( "width", starsWidth( value ) + "%" );


            item$.attr( "aria-valuenow", "" + value );
            item$.attr( "aria-valuetext", options.labelText.replace( /#VALUE#/, "" + value ) );

            if ( value === "" ) {
                item$.closest( ".star-rating" ).addClass( "star-rating-is-null" );
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).removeClass( "fa-times-circle-o" );
                if ( options.isRequired ) {
                    item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).css( "visibility", "visible" );
                }
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).addClass( "fa-dot-circle-o" );
            } else if ( value === 0 ) {
                item$.closest( ".star-rating" ).removeClass( "star-rating-is-null" );
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).removeClass( "fa-dot-circle-o" );
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).addClass( "fa-times-circle-o" );
                if ( options.isRequired ) {
                    item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).css( "visibility", "hidden" );
                }
            } else {
                item$.closest( ".star-rating" ).removeClass( "star-rating-is-null" );
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).removeClass( "fa-dot-circle-o" );
                item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).addClass( "fa-times-circle-o" );
                if ( options.isRequired ) {
                    item$.closest( ".star-rating" ).find( ".star-rating-clear span.fa" ).css( "visibility", "visible" );
                }
            }

            item$.parent().tooltip( {
                               show: apex.tooltipManager.defaultShowOption(),
                               position    : { my: "left top+15", at: "left center", collision: "flipfit" },
                               content     : options.labelText.replace( /#VALUE#/, item$.val() ), 
                               tooltipClass: "ui-widget-content ui-corner-all ui-widget ui-tooltip"
                           } );
        }

        // copy options and apply defaults
        options = $.extend( true, {}, defaultOptions, options );

        // detect real width and height of the used icon
        dummyStar$ = $( "<span style='display: none' class='star-rating-star fa " + util.escapeHTML( options.iconClass ) + "'></span>");
        $( "#" + itemId ).parent().append( dummyStar$ );
        starWidth = dummyStar$.width(); 
        starHeight = dummyStar$.height();
        dummyStar$.remove();

        starWidth = (starWidth === 0 ? 16 : starWidth );
        starHeight = (starHeight === 0 ? 16 : starHeight );

        // add Star Rating HTML element
        sr$ = item$.addClass( "u-vh is-focusable" )
                   .wrap( "<div class='star-rating star-rating-item star-rating-enabled'> " +
                          "<div class='star-rating-inner' " + 
                               "style='width: " + ( starWidth * options.numStars + 2 ) + "px; height: " + ( starHeight + 4 ) +"px'>" +
                          "</div>" +
                          "</div>" )
                  .parent();

        sr$.append( render() );
        sr$.parent().prepend( getClearButton() );

        item$.attr( "role", "spinbutton" )
             .attr( "aria-valuenow", "0" )
             .attr( "aria-valuemax", "" + options.numStars );

        if ( sr$.css( "direction" ) === "rtl" ) {
            forwardKey  = keys.LEFT;
            backwardKey = keys.RIGHT;
        }

        sr$.on( "focusin", function( e ) {
            $( this ).addClass( "is-focused" );
            if ( !item$.prop( "disabled" )  && !options.readOnly ) {
                item$.closest( ".star-rating" ).find( ".star-rating-bg .star-rating-star"    ).css( "color", options.inactiveColor );
                item$.closest( ".star-rating" ).find( ".star-rating-stars .star-rating-star" ).css( "color", options.activeColor   ); }
        } ).on( "focusout", function( e ) {
            $( this ).removeClass( "is-focused" );
        } ).on( "keydown", function( e ) {
            var value = null,
                kc    = e.which;
            
            if ( !item$.prop( "disabled" ) && !options.readOnly ) {

                if ( kc === keys.HOME ) {
                    value = 0;
                } else if ( kc === keys.END ) {
                    value = options.numStars;
                } else if ( kc === keys.DOWN || kc === backwardKey ) {
                    value = Math.round( normalize( item$.val() ) ) - options.increment;
                    value = normalize( value );
                } else if ( kc === keys.UP || kc === forwardKey ) {
                    value = Math.round( normalize( item$.val() ) ) + options.increment;
                    value = normalize( value );
                } else if ( kc === keys.DELETE ) {
                    value = "";
                }
                if ( value !== null ) {
                    item$.val( value ).change();
                }
            }
        }).on( "keyup", function( e ) {
            if ( !item$.prop( "disabled" ) && !options.readOnly ) {
                item$.val( normalize( item$.val() ) );
                updateDisplay();
            }
        } ).on( "click", function( e ) {
            var val,
                star$ = $( e.target ).closest( ".star-rating-star" );

            if ( !item$.prop( "disabled" ) && !options.readOnly ) {
                val = star$.parent().children().index( star$ ) + 1;
                item$.val( val ).change();
                updateDisplay();
                item$.focus();
            }
        });
        updateDisplay();

        if ( options.readOnly ) {
            item$.closest( ".star-rating" ).removeClass( "star-rating-disabled" );
            item$.closest( ".star-rating" ).addClass( "star-rating-enabled" );
        }

        item.create(itemId, {
            setValue: function(value) {
                item$.val(normalize(value));
                updateDisplay();
            },
            disable: function ( e ) {
                item$.closest( ".star-rating" ).addClass( "star-rating-disabled" );
                item$.closest( ".star-rating" ).removeClass( "star-rating-enabled" );
                item$.closest( ".star-rating" ).find( ".star-rating-bg .star-rating-star"    ).css( "color", "" );
                item$.closest( ".star-rating" ).find( ".star-rating-stars .star-rating-star" ).css( "color", "" );
                item$.prop( "disabled", true );
            },
            enable: function ( e ) {
                if ( !options.readOnly ) {
                    item$.closest( ".star-rating" ).removeClass( "star-rating-disabled" );
                    item$.closest( ".star-rating" ).addClass( "star-rating-enabled" );
                    item$.closest( ".star-rating" ).find( ".star-rating-bg .star-rating-star"    ).css( "color", options.inactiveColor );
                    item$.closest( ".star-rating" ).find( ".star-rating-stars .star-rating-star" ).css( "color", options.activeColor );
                    item$.prop( "disabled", false );
                }
            },
            displayValueFor: function( value ) {
                return render( true, normalize( value ) );
            }
        });

        if ( options.readOnly ) {
            item$.closest( ".star-rating" ).addClass( "star-rating-disabled" );
            item$.closest( ".star-rating" ).removeClass( "star-rating-enabled" );
            item$.closest( ".star-rating" ).find( ".star-rating-bg .star-rating-star"    ).css( "color", "" );
            item$.closest( ".star-rating" ).find( ".star-rating-stars .star-rating-star" ).css( "color", "" );
        }
    };
} )( apex.util, apex.item, apex.jQuery );
