/*!
 Simple Heat Map Plug-In
 Copyright (c) 2017 Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * This file is used for the Simple Heat Map Plugin of Oracle Application Express.
 **/

(function( util, server, $ ) {

com_oracle_apex_simpleheatmap_start = function( 
    pRegionId, 
    pAjaxId, 
    pEscapeHtml, 
    pPageItemsSubmit, 
    pCssPrefixUpDown 
) {
    // constants
    var PLUGIN_PREFIX            = "simpleheatmap_",
        CL_HEATMAP               = "p-HeatMap",
        CL_HEATMAP_ITEM          = CL_HEATMAP + "-item",
        CL_HEATMAP_LINK          = CL_HEATMAP + "-link",
        CL_HEATMAP_BODY          = CL_HEATMAP + "-body",
        CL_HEATMAP_LABEL         = CL_HEATMAP + "-label",
        CL_HEATMAP_VALUE         = CL_HEATMAP + "-value",
        CL_HEATMAP_PCT           = "pct-",
        CL_HEATMAP_UPDOWN_PREFIX = "is-";
        CL_HEATMAP_CSS_UP        = "up";
        CL_HEATMAP_CSS_DOWN      = "down";
        CL_HEATMAP_CSS_NEUTRAL   = "neutral";

    // "global" variables
    var gCssPrefixUpdown = ( pCssPrefixUpDown ? pCssPrefixUpDown : CL_HEATMAP_UPDOWN_PREFIX );

    var gRegion$ = apex.jQuery( "#" + pRegionId ),
        gChart$  = apex.jQuery( "#" + PLUGIN_PREFIX + pRegionId ), 
        gList$   = apex.jQuery( "<ul class=\"" + CL_HEATMAP + "\"></ul>" );

    gChart$.append( gList$ );

    function displayHeatMapTiles( pList, pData ) {
        var lHtml = new apex.util.htmlBuilder(),
            lPercent10, lUpDown, i;

        pList.empty();

        for ( i = 0; i < pData.row.length; i++ ) {
            lPercent10 = ( pData.row[ i ].percent === "" || isNaN( pData.row[ i ].percent ) ? 0 : ( Math.round( pData.row[ i ].percent ) / 10 ) * 10 );
            lPercent10 = ( lPercent10 >  100 ?  100 : lPercent10 );
            lPercent10 = ( lPercent10 < -100 ? -100 : lPercent10 );

            if      ( lPercent10 > 0 ) { lUpDown = gCssPrefixUpdown + CL_HEATMAP_CSS_UP;      }
            else if ( lPercent10 < 0 ) { lUpDown = gCssPrefixUpdown + CL_HEATMAP_CSS_DOWN;    }
            else                       { lUpDown = gCssPrefixUpdown + CL_HEATMAP_CSS_NEUTRAL; }

            lHtml.clear();
            lHtml.markup( "<li " )
                 .attr(   "class", CL_HEATMAP_ITEM + " " + apex.util.escapeHTMLAttr( pData.row[ i ].class ) )
                 .attr(   "data-id", apex.util.escapeHTMLAttr( pData.row[ i ].id ) )
                 .markup( ">" )
                 .markup( "<a " )
                 .attr(   "href", ( pData.row[ i ].link ? pData.row[ i ].link : "#" ) )
                 .attr(   "class", CL_HEATMAP_LINK + " " + CL_HEATMAP_PCT + Math.abs( lPercent10 ) + " " + lUpDown )
                 .markup( ">" )
                 .markup( "<span " )
                 .attr(   "class", CL_HEATMAP_BODY )
                 .markup( ">" )
                 .markup( "<span " )
                 .attr(   "class", CL_HEATMAP_LABEL )
                 .markup( ">" )
                 .markup( pEscapeHtml === "Y" ? apex.util.escapeHTML( pData.row[ i ].label ) : pData.row[ i ].label )
                 .markup( "</span>" )
                 .markup( "<span " )
                 .attr(   "class", CL_HEATMAP_VALUE )
                 .markup( ">" )
                 .markup( pEscapeHtml === "Y" ? apex.util.escapeHTML( pData.row[ i ].value ) : pData.row[ i ].value )
                 .markup( "</span>" )
                 .markup( "</span>" )
                 .markup( "</a>" )
                 .markup( "</li>" );

            pList.append( apex.jQuery( lHtml.toString() ) );
        }

        gRegion$.trigger( "apexafterrefresh" );

    }

    function getDataAndRefresh() {
        gRegion$.trigger( "apexbeforerefresh" );

        apex.server.plugin(
            pAjaxId,
            {
                p_debug:   apex.item( "pdebug" ).getValue(),
                pageItems: ( pPageItemsSubmit === "" ? null : pPageItemsSubmit.split( "," ) )
            },   
            {
                success:   function( pData )  { displayHeatMapTiles( gList$, pData ); },
                error:     function( pError ) { console.log( pError );                },
                dataType:  "json"
            }
        );
    }

    apex.jQuery( "#" + pRegionId ).bind( "apexrefresh", function() { getDataAndRefresh(); } );
    getDataAndRefresh();

}})( apex.util, apex.server, apex.jQuery );

