/*!
 Sticky Table Header - Plugin to allow any table of your choosing to have a fixed table header.
 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * Sticky Table Header - Plugin to allow any table of your choosing to have a fixed table header (which can then combined
 * with sticky widget).
 */
/*global apex, window, document */
(function( $, util ){
    "use strict";

    var NO_MAX = -1,
        ORIGINAL_MARKUP_POSTFIX = "_orig",
        appendedStylesToDocument = false;

    // Sets table scrolling if required, checks if scrolling is already setup and does nothing if so
    function setTableScrolling ( pWrapper$, pMaxHeight ) {
        var th, lScrollbarWidth,
            lFixedHeadersTableHead$ = pWrapper$.find( "div.t-fht-thead" ),
            lFixedHeadersTableBody$ = pWrapper$.find( "div.t-fht-tbody" ),
            lFixedHeadersTableHeadLastElement$ = lFixedHeadersTableHead$.find( "table th:last-child" ).first();

        // Only set table scrolling if it has not been done before
        if ( lFixedHeadersTableHead$.find( "th.t-fht-thead-scroll" ).length === 0 ) {

            th = $( document.createElement( "th" ) );

            th.addClass( "t-fht-thead-scroll" );

            lScrollbarWidth = util.getScrollbarSize().width;

            lFixedHeadersTableHeadLastElement$.after( th );

            th.css({
                "width":        lScrollbarWidth,
                "min-width":    lScrollbarWidth,
                "max-width":    lScrollbarWidth,
                "margin":       "0px",
                "padding":      "0px"
            });

            lFixedHeadersTableBody$.height( pMaxHeight );
        }
    }


    // Looks at various height measures and determines if scrolling is required
    function isScrollingRequired( pMaxHeight, pOriginalTable$, pOriginalTableHead$ ){
        var lBorder, lComputedOriginalTableHeadHeight, lOriginalTableHeadHeight;

        function getComputedStylePropertyValue( element, propertyName ) {
            var result;
            if( element.length >= 1 ) {
                result = window.getComputedStyle( element.get( 0 ) ).getPropertyValue( propertyName );
            }
            return result;
        }

        lComputedOriginalTableHeadHeight = parseInt( getComputedStylePropertyValue( pOriginalTableHead$, "height" ) );

        if ( !lComputedOriginalTableHeadHeight ) {

            // IE 7 and IE 8 will supply a non-integer when calling computedStylePropertyValue.
            // In this case, the jquery defined height will work just as well.
            lComputedOriginalTableHeadHeight = pOriginalTableHead$.height();
        }
        lBorder = getComputedStylePropertyValue( pOriginalTable$, "border-collapse" ) === "collapse" ? 1 : 0;

        lOriginalTableHeadHeight = lComputedOriginalTableHeadHeight + lBorder;

        return pMaxHeight !== NO_MAX && pOriginalTable$.height() - lOriginalTableHeadHeight > pMaxHeight;
    }


    $.fn.setTableHeadersAsFixed = function( options ){
        var tables$, fixedHeadersTableHeadId,
        // IE test borrowed from codemirror
            IE_UP_TO_10 = /MSIE \d/.test(navigator.userAgent),
            IE_11_AND_UP = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent),
            IS_IE = IE_UP_TO_10 || IE_11_AND_UP;

        if ( !appendedStylesToDocument ) { //TODO: Remove this and place it in APP_UI.
            $( "head" ).append( '<style type="text/css">' +
            '.t-fht-cell { height: 1px; overflow: hidden; } ' +
            '.t-fht-wrapper { width: 100%; overflow: hidden; position: relative; } ' +
            '.t-fht-thead { overflow: hidden; position: relative; } ' +
            '.t-fht-tbody { overflow: auto; } ' +
            '</style>' );
            appendedStylesToDocument = true;
        }

        //IE7 and IE8 does not have window.getComputedStyle so widget adds this function to the page as a workaround.
        if ( !window.getComputedStyle ) {
            window.getComputedStyle = function(el, pseudo) {
                this.el = el;
                this.getPropertyValue = function(prop) {
                    var re = /(\-([a-z]){1})/g;
                    if (prop == 'float') prop = 'styleFloat';
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return el.currentStyle[prop] ? el.currentStyle[prop] : null;
                };
                return this;
            };
        }

        tables$ = this;
        if  ( !tables$.is( "table" ) ) {
            tables$ = this.find( "table" );
        }
        if ( tables$.length > 0 ) {
            options = $.extend( {},
                {
                    maxHeight: NO_MAX   // The default option is no_max height;
                                        // i.e. just separate the headers from the table.
                },
                options
            );

            fixedHeadersTableHeadId = 0;

            tables$.each(function( index, Element ){

                // Each table needs to store these variables in their own closure.
                // They should not be brought outside this loop! Except the one above.
                var originalTableHead$, fixedHeadersTable$, fixedHeadersTableHead$, originalColumnsAll$,
                    fixedHeadersTableBody$, newTable$, fixedColumns$, firstRow$, originalColumns$,
                    maxHeight = options.maxHeight,
                    originalTable$ = $( Element );

                fixedHeadersTableHeadId += 1;

                if (maxHeight == NO_MAX) {
                    if ( originalTable$.hasClass( "mxh480" ) ) {
                        maxHeight = 480;
                    } else if ( originalTable$.hasClass( "mxh320" ) ) {
                        maxHeight = 320;
                    } else if ( originalTable$.hasClass( "mxh480" ) ) {
                        maxHeight = 640;
                    }
                }
                originalTableHead$ = originalTable$.find( "tr" ).first();
                originalTableHead$.find( "th" ).each(function(){
                    var jqueryElement$ = $(this);
                    jqueryElement$.append($(document.createElement( "div" )).addClass( "t-fht-cell" ));
                });

                fixedHeadersTable$ = $( document.createElement( "div" ) ).addClass( "t-fht-wrapper" );
                fixedHeadersTableHead$ = $( document.createElement("div") ).addClass( "t-fht-thead" );
                fixedHeadersTableHead$.attr( "id", "stickyTableHeader_" + fixedHeadersTableHeadId );
                fixedHeadersTableHead$.addClass( "js-stickyTableHeader" );
                fixedHeadersTableBody$ = originalTable$.wrap( $( document.createElement( "div" ) ).addClass( "t-fht-tbody" )).parent();
                newTable$ = originalTable$.clone().empty().append( originalTableHead$.clone( true ) ).attr( "role", "presentation" ).removeAttr( "summary" );
                fixedHeadersTableHead$.append( newTable$ );
                fixedHeadersTableBody$.before( fixedHeadersTableHead$ );
                fixedHeadersTable$ = fixedHeadersTableHead$.add( fixedHeadersTableBody$ ).wrapAll( fixedHeadersTable$ ).parent();

                if( isScrollingRequired( maxHeight, originalTable$, originalTableHead$ ) ){
                    setTableScrolling( fixedHeadersTable$, maxHeight );
                }
                fixedHeadersTableBody$.scroll( function() {
                    fixedHeadersTableHead$.scrollLeft( this.scrollLeft );
                });
                fixedHeadersTableHead$.scroll( function() {
                    fixedHeadersTableBody$.scrollLeft( this.scrollLeft );
                });

                fixedColumns$ = fixedHeadersTableHead$.find( "tr" ).first().find( "th" );
                firstRow$ = originalTable$.find( "tr" ).first();
                originalColumns$ = firstRow$.find( "td" );
                originalColumnsAll$ = originalTable$.find( "td" );
                originalTable$.attr( "id", originalTable$.attr( "id" ) + ORIGINAL_MARKUP_POSTFIX );     //avoids duplicate IDs

                if (originalColumns$.length < 1) {
                    originalColumns$ = firstRow$.find( "th" );
                }

                // Remove IDs from original TH cells, to avoid duplicate IDs (and because the new visible TH cells have
                // to keep the same IDs).
                // Also for the header links, we need to hide them from AT and keyboard, because the new visible
                // header links are already there (bug 26768471)
                originalColumns$.each( function() {
                    $( this )
                        .removeAttr( "id" )
                        .find( "a" )
                            .removeAttr( "href" )
                            .attr( "role", "presentation" );
                });

                // To help with accessibility, add ARIA based labelling which means screen readers can still pick up the
                // correct column heading (HEADERS alone no longer works, because of the new fixed TH table).
                // Note: Original table headers are effectively redundant, but left in place in case developers have
                // been reliant on them.
                originalColumnsAll$.each( function() {
                    $( this ).attr( "aria-labelledby", $( this ).attr( "headers" ) );
                });

                // Whenever there is a resize event such that the table dimensions change, the table headers
                // that were fixed, need to be synchronized with the table they originally belonged to.
                var resize = function () {
                    $( ".js-stickyTableHeader" ).next().width( "auto" );

                    // clears width of the "replacement (empty div)" element created by widget.stickyWidget.js
                    originalColumns$.each(function ( i ) {
                        var width = $( this ).width();
                        if ( IS_IE ) {
                            if ( (i + 1) % 6 === 0) { // This is a workaround for internet explorer's cryptic way of handling the width of tab elements.
                                // It's not strictly speaking "Aligned" but the difference is small enough to be considered negligible.
                                width -= 1;
                            }
                        }
                        var fixedColumn$ = fixedColumns$.eq( i );

                        // TH and TD elements don't respect the width property, so we must use the child div to "force" its parent (the TH or the TD) to be correct.
                        fixedColumn$.find( ".t-fht-cell" ).width( width );
                        i++;
                    });
                    originalTable$.css( "margin-top", -originalTable$.find( "tr" ).first().height() );

                    if ( isScrollingRequired( maxHeight, originalTable$, originalTableHead$ ) ) {
                        setTableScrolling( fixedHeadersTable$, maxHeight );
                    }

                };

                // Resize handlers
                $( window ).on( "apexwindowresized" , resize);
                fixedHeadersTableHead$.on( "forceresize" , resize);

                resize();

            });
            return this;
        }
    };
})( apex.jQuery, apex.util );