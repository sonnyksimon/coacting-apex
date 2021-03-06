(function( util, server, $, d3 ) {

com_oracle_apex_d3_sunburst_start = function(
  pRegionId, 
  pAjaxId,
  pNoDataFoundMsg,
  pColors, 
  pColorLegendMapping,
  pConfig,
  pAutoRefresh,
  pRefreshInterval,
  pEscapeHtml,
  pPageItemsSubmit,
  pMinHeight,
  pMaxHeight,
  pMinAR,
  pMaxAR,
  pShowLegend,
  pLegendPosition,
  pShowTooltip
) {

  var interval;
  var gClassScale = d3.scale.ordinal().range( d3.range( 1, 16 ) );
 
  var gPluginPrefix = "com_oracle_apex_d3_";
  var gLegend$;
  var gResizeHandlerBound = false;
  var gRegion$;
  var gChart$;
  var gTooltip$;
  var gAry; 

  var gFocusedDataNode = false;
  var gHasHookedEvents = false;
  var gHoveredNode = false;
  var gFocusedNode = false;
  var gFocusedChildIdx = 0;
  var isFocused = false;


  var config = {
    "trdur":                       0,
    "legend_column_width":         180,
    "css_class_node":              "com_oracle_apex_d3_sunburst_node",
    "css_class_highlight":         "com_oracle_apex_d3_sunburst_highlight",
    "root_label":                  "Tree root"
  }

  if ( pColors ) {
      var colorScale = d3.scale.ordinal()
          .range( pColors.split( ':' ) );
  }
  var colorAccessor = function(d) { 
    if (pColors == 'DEFAULT') {
      return null;
    } else if (pColors == 'COLUMN') {
      return (d?(d.children ? d : d.parent).COLORVALUE:null); 
    } else {
      return colorScale ? colorScale((d.children ? d : d.parent).COLORVALUE) : null; 
    }
  };

  // build Legend <-> Color mapping
  var gLegendMapping = false;
  if (pColors == 'COLUMN') {
    try {
      gLegendMapping = JSON.parse(pColorLegendMapping);
    } catch (e) {console.log(e)}
  }

  function getLegendForColor(c) {
    if (pColors == 'COLUMN' && gLegendMapping) {
      if (gLegendMapping[c.toLowerCase()]) {
        return gLegendMapping[c.toLowerCase()];
      } else {
        return c;
      }
    } else {
      return c;
    }
  }

  function getTooltipContent(d) {
    if (d.INFOSTRING) {
      if (pEscapeHtml == 'Y')  {
        return d3.select(document.createElement("div")).text(d.INFOSTRING).node();
      } else {
        return d3.select(document.createElement("div")).html(d.INFOSTRING).node();
      }
    } else {
      return "";
    }
  }

  function _recommendedHeight() {
    var minAR = pMinAR;
    var maxAR = pMaxAR;
    var w = gChart$.width();
    var h = (gChart$.height() === 0) ? (w/maxAR) : gChart$.height();
    var ar = w/h;
    if (ar < minAR) {
        h = w/maxAR + 1;
    } else if (ar > maxAR) {
        h = w/minAR - 1;
    }
    return Math.max(pMinHeight, Math.min(pMaxHeight, h));
  }

  function _resizeFunction() {
    width = parseInt(gChart$.width());
    height = _recommendedHeight();
    svg.attr("width", width - 20)
    svg.attr("height", height)

    radius = Math.min(width, height) / 2;
    partition.size([2 * Math.PI, 100]);

    svgg.attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");
    updateChart();
  }

  var classficationsAccessor = function(d) { return (d.children ? d : d.parent).COLORVALUE; };

  var dConfig = "";
  try {
    dConfig = JSON.parse(pConfig);
  } catch (e) {
    dConfig = {};
  }

  for (var attrname in dConfig) { config[attrname] = dConfig[attrname]; }

  var apex_data_json;
  var color;

  function fireApexEvent(e, d) {
    apex.event.trigger(
      $x(pRegionId),
      gPluginPrefix + e, 
      d
    );
  }

  function buildHierarchy(pData) {
    var lookup = [];
    var lookup2 = [];
    var rootnodes = [];

    for (var i=0;i<pData.row.length; i++) {
      lookup["LO"+pData.row[i].ID] = i;
    }
    for (var i=0;i<pData.row.length; i++) {
      if (!("LO"+pData.row[i].PARENT_ID in lookup) || (pData.row[i].PARENT_ID == pData.row[i].ID)) {
        rootnodes.push(pData.row[i]);
      }
    }

    var newRoot = {
      "PARENT_ID":  "parent_" + gPluginPrefix + "sunburst_node_id0123456789",
      "ID":         gPluginPrefix + "sunburst_node_id0123456789",
      "SIZEVALUE":  1,
      "COLORVALUE": (pColors=="COLUMN"?"black":config.root_label),
      "LABEL":      config.root_label
    };
    pData.row.push(newRoot);
    lookup["LO" + gPluginPrefix + "sunburst_node_id0123456789"] = pData.row.length - 1;

    for (var r=0;r<rootnodes.length;r++) {
      rootnodes[r].PARENT_ID =  gPluginPrefix + "sunburst_node_id0123456789";
    }

    for (var i=0;i<pData.row.length; i++) {
      if (!("LO"+pData.row[i].PARENT_ID in lookup2)) { 
        lookup2["LO"+pData.row[i].PARENT_ID] = [];
      }
      lookup2["LO"+pData.row[i].PARENT_ID].push(pData.row[i].ID); 
    }

    function buildHierarchy_core(pData, pRootParentId) {
      var target = [];
      var lrow, ix;
      if ("LO"+pRootParentId in lookup2) {
        for (var i=0;i<lookup2["LO"+pRootParentId].length; i++) {
          lrow = {};
          ix = lookup["LO"+lookup2["LO"+pRootParentId][i]];

          lrow.ID         = pData.row[ix].ID;
          lrow.SIZEVALUE  = pData.row[ix].SIZEVALUE;
          lrow.COLORVALUE = pData.row[ix].COLORVALUE;
          lrow.LABEL      = pData.row[ix].LABEL;
          lrow.INFOSTRING = pData.row[ix].INFOSTRING;
          lrow.LINK       = pData.row[ix].LINK;
          lrow.ROWNUM     = ix;
          lrow.children = buildHierarchy_core(pData, pData.row[ix].ID);     
          target.push(lrow);
        }
      }
      return target;
    }
    return buildHierarchy_core(pData, "parent_"+ gPluginPrefix + "sunburst_node_id0123456789");
  }


  gRegion$ = $("#" + pRegionId);
  gChart$  = $("#" + gPluginPrefix + pRegionId); 

  var width  = gChart$.width();
  var height = _recommendedHeight();
  var radius = Math.min(width, height) / 2;

  var partition = d3.layout.partition()
      .sort(function (a,b) {return a.ROWNUM - b.ROWNUM;})
      .size([2 * Math.PI, 100])
      .value(function(d) { return d.SIZEVALUE; });
  
  var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d)   { return d.x + d.dx; })
    .innerRadius(function(d) { return (radius / 100) * (d.y) ; })
    .outerRadius(function(d) { return (radius / 100) * (d.y + d.dy); });
    ;

  
  var arc0 = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d)   { return d.x + d.dx; })
    .innerRadius(function(d) { return radius * (d.y) / 100; })
    .outerRadius(function(d) { return radius * (d.y) / 100; });
  ;

  var svg = d3.selectAll(gChart$).append("svg")
    .attr("width",  width - 20)
    .attr("height", height)
  ;

  var svgg = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  ;

  getData(refreshData);

  apex.jQuery("#"+pRegionId).bind(
    "apexrefresh", 
    function() { getData(refreshData); }
  );


  function getData(f) {
    apex.server.plugin(
      pAjaxId,
      {
        p_debug: $v('pdebug'),
        pageItems: ( pPageItemsSubmit && pPageItemsSubmit !== "" ? pPageItemsSubmit.split(",") : false )
      },   
      {
        success: f,
        error: function (d) {console.log(d);console.log(d.responseText); },
        dataType: "json"
      }
    );
  }

  function refreshData(d3json) {
    if (d3json.row.length == 0) {
      apex_data_json = {};
      svg.append("g")
        .attr("id", gPluginPrefix + pRegionId + "_nodatafoundmsg")
        .attr("transform", "translate(10,20)")
        .append("text")
        .text(pNoDataFoundMsg);
      partition.nodes(apex_data_json); 
      svgg.selectAll("." + config.css_class_node).remove();
      gLegend$.remove();
      gLegend$ = false;
    } else {
      d3.selectAll("#" + gPluginPrefix + pRegionId + "_nodatafoundmsg").remove();
      apex_data_json = buildHierarchy(d3json)[0];
      apex_data_json.IS_ROOT = true;    
      updateChart();
    }

  }
  
  function updateChart() {
    var pnodes = partition.nodes(apex_data_json); 

    var node = svgg.selectAll("." + config.css_class_node)
      .data(
         pnodes,
         function(d) {return d.ID;}
      )
    ;


    var classifications = oracle.jql()
       .select( [function(rows){ return colorAccessor(rows[0]) }, 'color'] )
       .from( pnodes.filter(function(d) {return (!d.IS_ROOT); }) )
       .group_by( [function(row){ return (row.children ? row : row.parent).COLORVALUE; }, 'classifications'] )();
 

    var nodeEnter = node.enter()
      .append("g")
      .attr("id", function(d) {return gPluginPrefix + pRegionId + "_id_" + d.ID;})
      .attr("class",     config.css_class_node)
    ;

    // INSERT SECTION!

    nodeEnter.append("path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) 
      .attr("id", function(d) {return gPluginPrefix + pRegionId + "_pathid_" + d.ID;})
      .style("cursor", function(d) {return d.LINK?"pointer":"";})
      .attr("d", arc0)
      .style("fill", function(d) { return colorAccessor(d); })
      .style("fill-rule", "evenodd")
      .style("stroke", "#fff")
      .transition().duration(config.trdur)
      .attr("d", arc)
      .each(function (d) {
          d3.select( this )
            .classed( 'u-Color-' + gClassScale( classficationsAccessor.apply( this, arguments ) ) + '-BG--fill' + 
                    ' u-Color-' + gClassScale( classficationsAccessor.apply( this, arguments ) ) + '-BG--br', true )
         })
      .each(function (d) {
         if (pColors=="COLUMN") {
          d3.select( this ).style("stroke", "#ccc");
         }
        })
    ;

    nodeEnter.on("click", function(d) {
      if (d.LINK) {
        var win = apex.navigation.redirect(d.LINK);
        win.focus();
      }
      fireApexEvent("click", d);
    });

    nodeEnter.on("mouseover", function(d) {
      nodeEnter.filter(function(d1) {return d1.ID == d.ID;})
         .classed(config.css_class_highlight, true)
      ;
        
      if ( pShowTooltip ) {
        tooltipColor = window.getComputedStyle( this.getElementsByTagName('path')[0] ).getPropertyValue( 'fill' );

        d3.select( gTooltip$.get(0) )
            .datum( d )
            .call( tooltipGenerator );
        gTooltip$.stop().fadeIn( 100 );

        gTooltip$.position({
          my: 'left+20 center',
          of: d3.event,
          at: 'right center',
          within: gRegion$,
          collision: 'flip fit'
        });
      }
      fireApexEvent("mouseover", d);
    }); 


    nodeEnter.on("mousemove", function(d) {
      if ( pShowTooltip ) {
        tooltipColor = window.getComputedStyle( this.getElementsByTagName('path')[0] ).getPropertyValue( 'fill' );
        d3.select( gTooltip$.get(0) )
            .datum( d )
            .call( tooltipGenerator );
        
        if ( !gTooltip$.is(':visible') ) {
          gTooltip$.fadeIn();
        }

        gTooltip$.position({
          my: 'left+20 center',
          of: d3.event,
          at: 'right center',
          within: gRegion$,
          collision: 'flip fit'
        });
      }

      fireApexEvent("mousemove", d);
    }); 

    nodeEnter.on("focus", function(d) {
      var self = this;
      if ( this !== gHoveredNode || isKeydownTriggered ) {
        isKeydownTriggered = false;

        if ( pShowTooltip ) {
          tooltipColor = window.getComputedStyle( this.getElementsByTagName('path')[0] ).getPropertyValue( 'fill' );
          d3.select( gTooltip$.get(0) )
              .datum( d )
              .call( tooltipGenerator );
          gTooltip$.stop().fadeIn( 100 );

          var off = $( this ).offset();
          gTooltip$.position({
              my: 'center bottom-5',
              of: gChart$,
              at: 'left+' + 
                  Math.round( off.left - gChart$.offset().left + this.getBBox().width / 2 ) + 
                  ' top+' + 
                  ( off.top - gChart$.offset().top ),
              within: gRegion$,
              collision: 'fit fit'
          });
        }
      }
      nodeEnter
         .filter(function(d1) {return d1.ID == d.ID;})
         .classed(config.css_class_highlight, true)
      ;

    });

 
    nodeEnter.on( 'blur', function(d) {
      gFocusedNode = null;
      if ( !gHoveredNode ) {
          gTooltip$.stop().fadeOut( 100);
      }

      var self = this;
      d3.select( gChart$.get(0) )
          .selectAll( '.'+config.css_class_node)

      nodeEnter.filter(function(d1) {return d1.ID == d.ID;})
         .classed(config.css_class_highlight, false);
    });


    nodeEnter.on("mouseout", function(d) {
      nodeEnter.filter(function(d1) {return d1.ID == d.ID;})
         .classed(config.css_class_highlight, false)
      ;
      if ( pShowTooltip ) {
        gTooltip$.stop().fadeOut( 100 );
      }
      fireApexEvent("mouseout", d);
    }); 

    // UPDATE SECTION!

    node.select("path")
        .style("fill", function(d) { return colorAccessor(d); })
        .style("fill-rule", "evenodd")
        .style("stroke", "#fff")
        .transition()
        .duration(config.trdur)
        .attr("d", arc)
        .each(function (d) {
          d3.select( this )
            .classed( 'u-Color-' + gClassScale( classficationsAccessor.apply( this, arguments ) ) + '-BG--fill' + 
                    ' u-Color-' + gClassScale( classficationsAccessor.apply( this, arguments ) ) + '-BG--br', true )
         })
         .each(function (d) {
           if (pColors=="COLUMN") { d3.select( this ).style("stroke", "#ccc"); }
          })
    ;

    node.select("title")
        .text(function(d){return (d.INFOSTRING?"":d.LABEL);})
    ;

    node.on("click", function(d) {
      if (d.LINK) {
        var win = apex.navigation.redirect(d.LINK);
        win.focus();
      }
      fireApexEvent("click", d);
    });

    // DELETE SECTION

    node.exit()
      .transition().duration(config.trdur)
      .style("opacity", "0")
    ;
    node.exit()
      .remove();

    // SHOW TOOLTIP

     if (!gTooltip$) { 
          gTooltip$ = $( document.createElement( 'div' ) )
              .addClass( 'a-D3SunburstChart-tooltip a-D3Tooltip' )
              .appendTo( gChart$ )
              .hide();
    }


    if ( pShowTooltip ) {
          var tooltipColor;
          var tooltipGenerator = d3.oracle.tooltip()
              .accessors({
                  label : function (d) {return d.LABEL;},
                  value : function( d ) { return (d.SIZEVALUE?d.SIZEVALUE:null); },
                  color : function() { return tooltipColor },
                  content : function( d ) { return getTooltipContent(d);}
              })
              .symbol( 'circle' );
    }


    // SHOW LEGEND
 
    if (!gLegend$) { 
      gLegend$ = $( document.createElement( 'div' ) );
      gLegend$.attr("id", gPluginPrefix + pRegionId + "_legend");

      if ( pLegendPosition == 'TOP' ) {
          gChart$.before( gLegend$ );
          gLegend$.css("margin-bottom", "10px");
      } else {
          gChart$.after( gLegend$ );
          gLegend$.css("margin-top", "10px");
      }
    }

    if ( pShowLegend ) {
      gAry = d3.oracle.ary()
          .hideTitle( true )
          .showValue( false )
          .leftColor( true )
          .numberOfColumns( 3 )
          .accessors({
              color: function(d) { return d.color; },
              label: function(d) { return (pColors=="COLUMN")?getLegendForColor(d.color):d.classifications; }
          })
          .symbol('circle');

      gAry.numberOfColumns( Math.max( Math.floor( width / config.legend_column_width ), 1 ) );

      d3.select( gLegend$.get(0) )
        .datum(classifications)
        .call( gAry )
        .selectAll( '.a-D3ChartLegend-item' )
        .each(function (d, i) {
            d3.select( this )
                .selectAll( '.a-D3ChartLegend-item-color' )
                .each(function() {
                    var self = d3.select( this );
                    var colorClass = self.attr( 'class' ).match(/u-Color-\d+-BG--bg/g) || [];
                    for (var i = colorClass.length - 1; i >= 0; i--) {
                        self.classed( colorClass[i], false );
                    };
                    self.classed( 'u-Color-' + gClassScale( d.classifications ) + '-BG--bg', true );
                })
        });
    }

    if ( !gHasHookedEvents ) {
            isFocused = false;
            $("svg", gChart$).first().on( 'focus', function() {
                isFocused = true;
                if (gFocusedDataNode) {
                  gFocusedNode = $('#' + gPluginPrefix + pRegionId + '_id_' + gFocusedDataNode.ID ).first().focus();
                }
            })
            .on( 'keydown', function (e) {
                switch ( e.which ) {
                    case 13:
                        if ( gFocusedDataNode.LINK ) {
                          var win = apex.navigation.redirect(gFocusedDataNode.LINK);
                          win.focus();
                          e.preventDefault();
                        }
                        break;
                    case 38: // UP: Go to parent

                        isKeydownTriggered = true;
                        if ( !gFocusedDataNode ) {
                            gFocusedDataNode = apex_data_json.children[0];
                            gFocusedChildIdx = 0;
                        } else {
                          if (gFocusedDataNode.parent && !gFocusedDataNode.parent.IS_ROOT) {
                            gFocusedDataNode = gFocusedDataNode.parent;
                            if (gFocusedDataNode.parent) {
                              for (var pix=0;pix < gFocusedDataNode.parent.children.length; pix++) {
                                if (gFocusedDataNode.parent.children[pix].ID == gFocusedDataNode.ID) {
                                  gFocusedChildIdx = pix;
                                  break;
                                }
                              }
                            } else {
                              gFocusedChildIdx = 0;
                            }
                          }
                        }
                        e.preventDefault();
                        break;  
                    case 37: //LEFT: Go to prev sibling
                        // Focus previous rectangle
                        isKeydownTriggered = true;
                        if ( !gFocusedDataNode ) {
                            gFocusedDataNode = apex_data_json.children[0];
                            gFocusedChildIdx = 0;
                        } else {
                           if (!gFocusedDataNode.IS_ROOT) {
                             if (gFocusedChildIdx > 0) {
                               gFocusedChildIdx--;
                               gFocusedDataNode = gFocusedDataNode.parent.children[gFocusedChildIdx];
                             } else {
                               gFocusedChildIdx = gFocusedDataNode.parent.children.length - 1;
                               gFocusedDataNode = gFocusedDataNode.parent.children[gFocusedChildIdx];
                             }
                           }
                        }
                        e.preventDefault();
                        break;
                    case 40: // down: Go to first child
                        isKeydownTriggered = true;
                        if ( !gFocusedDataNode ) {
                            gFocusedDataNode = apex_data_json.children[0];
                            gFocusedChildIdx = 0;
                        } else {
                          if (gFocusedDataNode.children) {
                            gFocusedDataNode = gFocusedDataNode.children[0];  
                            gFocusedChildIdx = 0;
                          }
                        }
                        e.preventDefault();
                        break;  
                    case 39: // right: Go to next sibling
                        // Focus next rectangle
                        isKeydownTriggered = true;
                        if ( !gFocusedDataNode ) {
                            gFocusedDataNode = apex_data_json.children[0];
                            gFocusedChildIdx = 0;
                        } else {
                           if (!gFocusedDataNode.IS_ROOT) {
                             if (gFocusedChildIdx < (gFocusedDataNode.parent.children.length - 1)) {
                                gFocusedChildIdx++
                                gFocusedDataNode = gFocusedDataNode.parent.children[gFocusedChildIdx];
                             } else {
                               gFocusedChildIdx = 0;
                               gFocusedDataNode = gFocusedDataNode.parent.children[gFocusedChildIdx];
                             }
                           }
                        }
                        e.preventDefault();
                        break;
                }
                gFocusedNode = $('#' + gPluginPrefix + pRegionId + '_id_' + gFocusedDataNode.ID ).first().focus();
            })
            .on( 'blur', function (e) {
                if ( !$( document.activeElement ).is( '.' + config.css_class_node ) ) {
                    isFocused = false;
                    gFocusedNode = false;
                    var self = this;
                }
            });

        $( document ).on( 'keydown', function (e) {
            if ( isFocused && e.which >= 37 && e.which <= 40 ) {
                e.preventDefault();
            }
        })

        gHasHookedEvents = true;
    }


  }
   
  apex.event.trigger(
    $x(pRegionId),
    gPluginPrefix + "initialized"
  );

  var resizeTimeout;
  var resizeHandler = function() {
        clearTimeout( resizeTimeout );
        resizeTimeout = setTimeout( function() {
            _resizeFunction();
        }, 500);
      };

  if (!gResizeHandlerBound) {
    $(window).resize(resizeHandler );
    gResizeHandlerBound=true;
  }


  if (pAutoRefresh == 'Y') {
    interval = window.setInterval(  
      function() { getData(refreshData); },
      pRefreshInterval
    );
  }
}})( apex.util, apex.server, apex.jQuery, d3 );

