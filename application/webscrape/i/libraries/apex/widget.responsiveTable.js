/*!
 Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
*/
/* Forked from jQuery Mobile version 1.4.5 table.js, table.reflow.js, table.columntoggle.js */
 /*!
 * jQuery Mobile
 * Copyright 2010, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
/*global apex*/
/*
JQM compatibility changes
- theme options removed
- some markup and class changes. Classes option removed

Mappings from old to new classes
Don't change these
 ui-responsive
 table-stripe
 table-stroke
 ui-table-priority-*
 ui-table-cell-hidden
 ui-table-cell-visible

 ui-table                     a-Table
 ui-table-reflow              a-Table--reflow
 ui-table-cell-label          a-Table-cellLabel
 ui-table-columntoggle-popup  a-Table-columntogglePopup
 ui-table-columntoggle-btn    a-Table-columntoggleBtn
 ui-table-columntoggle        a-Table--columntoggle
 ui-table-cell-label-top      tbd
 */
(function ( apexWidget, $ ) {

var POPUP_DIALOG_ID_SUFFIX = "_popup",
    POPUP_BUTTON_ID_SUFFIX = "_popup_btn",
    MODE_COLUMN_TOGGLE = "columntoggle",
    MODE_REFLOW = "reflow";

var C_TABLE = "u-Report a-Table",
    C_REFLOW = "a-Table--reflow",
    C_CELL_LABEL = "a-Table-cellLabel",
    C_TOGGLE = "a-Table--columntoggle",
    C_POPUP = "a-Table-columntogglePopup",
    C_COLUMN_BTN = "a-Table-columntoggleBtn",
    C_CHECKBOX_GROUP = "checkbox_group apex-item-group apex-item-group--rc apex-item-checkbox",
    C_PRIOIRTY_PREFIX = "ui-table-priority-";

var getAttr = apexWidget.getAttribute;

$.widget( "apex.table", {
    version: "18.1",
    widgetEventPrefix: "table",
    options: {
        mode: "plain", // one of plain, reflow, or columntoggle
        noDataFoundText: null,
        // button options used by column toggle
        columnBtnText: "Columns...", // should be set with a localized label
        // todo there should be a way to use an externally created columns button without having to set enhanced
        enhanced: false
    },

    _create: function () {
        var table$ = this.element,
            o = this.options;

        if ( !o.enhanced ) {
            table$.addClass( C_TABLE );
        }

        // Expose headers and allHeaders properties on the widget
        // headers references the THs within the first TR in the table
        this.headers = null;
        // allHeaders references headers, plus all THs in the thead, which may
        // include several rows, or not
        this.allHeaders = null;

        // for column toggle choices
        this._menu = $();
        this._columnsButton = $();

        this._refresh( true );

        // todo consider allow change mode after create

        // If it's not reflow mode, return here.
        if ( o.mode === MODE_REFLOW ) {
            if ( !o.enhanced ) {
                table$.addClass( C_REFLOW );
                this._updateReflow();
            }
        } else if ( o.mode === MODE_COLUMN_TOGGLE ) {
            if ( o.enhanced ) {
                this._menu = $( "#" + this._id() + POPUP_DIALOG_ID_SUFFIX ).children().first();
                this._columnsButton = $( "#" + this._id() + POPUP_BUTTON_ID_SUFFIX );
                this._addToggles( this._menu, true );
            } else {
                this._enhanceColToggle();
                table$.addClass( C_TOGGLE );
            }
            this._setupEvents();
            this._setToggleState();
        }
    },

    _getCreateOptions: apexWidget._getCreateOptions,

    _id: function() {
        return ( this.element.attr( "id" ) || ( this.widgetName + this.uuid ) );
    },

    _destroy: function() {
        var table$ = this.element,
            o = this.options;

        if ( !o.enhanced ) {
            table$.removeClass( C_TABLE + " " + C_REFLOW + " " + C_TOGGLE );
            this._menu.remove();
            this._columnsButton.remove();
            table$.find( "." + C_CELL_LABEL ).remove();
            // todo should cleanup the table priority classes
        }
        if ( this.noData ) {
            this.noData.remove();
        }
    },

    _setHeaders: function () {
        var table$ = this.element,
            trs = table$.find( "thead tr" );

        this.headers = table$.find( "tr:eq(0)" ).children();
        this.allHeaders = this.headers.add( trs.children() );
    },

    refresh: function () {
        this._refresh();
    },

    rebuild: function() {
        if ( this.options.mode !== "plain" ) {
            // NOTE: rebuild passes "false", while refresh passes "undefined"
            // both refresh the table, but inside addToggles, !false will be true,
            // so a rebuild call can be indentified
            this._refresh( false );
        }
    },

    _refresh: function ( create ) {
        var headers$, hiddenColumns, index,
            table$ = this.element,
            o = this.options,
            trs$ = table$.find( "thead tr" );

        if ( table$.find( "tbody tr" ).length === 0 && o.noDataFoundText ) {
            if ( !this.noData ) {
                this.noData = $( "<div class='nodatafound'></div>" );
                table$.after( this.noData );
            }
            this.noData.text( o.noDataFoundText );
            table$.hide();
        } else {
            if ( this.noData ) {
                this.noData.remove();
                this.noData = null;
                table$.show();
                this._columnsButton.show();
            }
        }

        // updating headers on refresh (fixes #5880)
        this._setHeaders();

        // Iterate over the trs
        trs$.each( function () {
            var columnCount = 0;

            // Iterate over the children of the tr
            $( this ).children().each( function () {
                var j,
                    span = parseInt( this.getAttribute( "colspan" ), 10 ),
                    selector = ":nth-child(" + ( columnCount + 1 ) + ")";

                this.setAttribute( "data-colstart", columnCount + 1 );

                if ( span ) {
                    for ( j = 0; j < span - 1; j++ ) {
                        columnCount++;
                        selector += ", :nth-child(" + ( columnCount + 1 ) + ")";
                    }
                }

                // Store "cells" data on header as a reference to all cells in the
                // same column as this TH
                $( this ).data( "cells", table$.find( "tr" ).not( trs$.eq( 0 ) ).not( this ).children( selector ) );

                columnCount++;
            } );
        } );

        if ( !create ) {
            if ( o.mode === MODE_REFLOW ) {
                this._updateReflow();
            } else if ( o.mode === MODE_COLUMN_TOGGLE ) {
                headers$ = this.headers;
                hiddenColumns = [];

                // Find the index of the column header associated with each old checkbox among the
                // post-refresh headers and, if the header is still there, make sure the corresponding
                // column will be hidden if the pre-refresh checkbox indicates that the column is
                // hidden by recording its index in the array of hidden columns.
                this._menu.find( "input" ).each( function () {
                    var input = $( this ),
                        header = input.data( "header" ),
                        index = headers$.index( header[0] );

                    if ( index > -1 && !input.prop( "checked" ) ) {

                        // The column header associated with /this/ checkbox is still present in the
                        // post-refresh table and the checkbox is not checked, so the column associated
                        // with this column header is currently hidden. Let's record that.
                        hiddenColumns.push( index );
                    }
                } );

                // columns not being replaced must be cleared from input toggle-locks
                this._unlockCells( this.element.find( ".ui-table-cell-hidden, " +
                    ".ui-table-cell-visible" ) );

                // update columntoggles and cells
                this._addToggles( this._menu, create );

                // At this point all columns are visible, so uncheck the checkboxes that correspond to
                // those columns we've found to be hidden
                for ( index = hiddenColumns.length - 1; index > -1; index-- ) {
                    headers$.eq( hiddenColumns[index] ).data( "input" )
                        .prop( "checked", false )
                        .trigger( "change" );
                }
            }
        }
    },

    //
    // reflow
    //

    _updateReflow: function() {
        var self = this,
            o = this.options;

        // get headers in reverse order so that top-level headers are appended last
        $( this.allHeaders.get().reverse() ).each( function() {
            var cells$ = $( this ).data( "cells" ),
                colstart = getAttr( this, "colstart" ),
                hierarchyClass = cells$.not( this ).filter( "thead th" ).length && " ui-table-cell-label-top",
                contents$ = $( this ).clone().contents(),
                iteration, filter;

            if ( contents$.length > 0  ) {

                if ( hierarchyClass ) {
                    iteration = parseInt( this.getAttribute( "colspan" ), 10 );
                    filter = "";

                    if ( iteration ) {
                        filter = "td:nth-child("+ iteration +"n + " + ( colstart ) +")";
                    }

                    self._addLabels( cells$.filter( filter ),
                        C_CELL_LABEL + hierarchyClass, contents$ ); // todo consider styles for this composite class
                } else {
                    self._addLabels( cells$, C_CELL_LABEL, contents$ );
                }
            }
        });
    },

    _addLabels: function( cells$, label, contents$ ) {
        if ( contents$.length === 1 && contents$[ 0 ].nodeName.toLowerCase() === "abbr" ) {
            contents$ = contents$.eq( 0 ).attr( "title" );
        }
        cells$
            .not( ":has(b." + label + ")" )
            .prepend( $( "<b class='" + label + "'></b>" ).append( contents$ ) );
    },

    //
    // column toggle
    //
    _setupEvents: function() {
        var self = this;

        //NOTE: inputs are bound in bindToggles,
        // so it can be called on refresh, too

        // update column toggles on resize
        this._on( window, {
            apexwindowresized: "_setToggleState"
        });
        this._on( this._menu, {
            "change input": "_menuInputChange"
        });
        if ( this.options.mode === MODE_COLUMN_TOGGLE ) {
            this._on( this._columnsButton, {
                click: function() {
                    this._menu.parent().popup( "open" );
                }
            } );
        }
    },

    _addToggles: function( menu$, keep ) {
        var inputs, id,
            baseId = this._id() + "CB",
            checkboxIndex = 0,
            o = this.options,
            container$ = menu$; // the menu is the container

        // allow update of menu on refresh (fixes #5880)
        if ( keep ) {
            inputs = menu$.find( "input" );
        } else {
            container$.empty();
        }

        // create the hide/show toggles
        this.headers.not( "td" ).each( function() {
            var input, cells,
                header = $( this ),
                priority = getAttr( this, "priority" );

            if ( priority ) {
                cells = header.add( header.data( "cells" ) );
                cells.addClass( C_PRIOIRTY_PREFIX + priority );

                // Make sure the (new?) checkbox is associated with its header via .data() and
                // that, vice versa, the header is also associated with the checkbox
                id = baseId + checkboxIndex;
                input = ( keep ? inputs.eq( checkboxIndex ) :
                    $("<div class='apex-item-option'><input id='"+ id + "' type='checkbox' checked />" +
                        "<label for='" + id + "'>" +
                        ( header.children( "abbr" ).first().attr( "title" ) ||
                        header.text() ) +
                        "</label></div>" )
                        .appendTo( container$ )
                        .children().eq( 0 ) )

                // Associate the header with the checkbox
                    .data( "header", header )
                    .data( "cells", cells );

                // Associate the checkbox with the header
                header.data( "input", input );
                checkboxIndex += 1;
            }
        });
    },

    _menuInputChange: function( evt ) {
        var input = $( evt.target ),
            checked = input[0].checked;

        input.data( "cells" )
            .toggleClass( "ui-table-cell-hidden", !checked )
            .toggleClass( "ui-table-cell-visible", checked );
    },

    _unlockCells: function( cells ) {
        // allow hide/show via CSS only = remove all toggle-locks
        cells.removeClass( "ui-table-cell-hidden ui-table-cell-visible");
    },

    _enhanceColToggle: function() {
        var id, btnId, colPopupButton$, popup$, menu$,
            table$ = this.element,
            o = this.options;

        id = this._id() + POPUP_DIALOG_ID_SUFFIX;
        btnId = this._id() + POPUP_BUTTON_ID_SUFFIX;
        colPopupButton$ = $( "<button type='button' id='" + btnId + "' class='a-Button " + C_COLUMN_BTN +
            "'><span class='a-Button-label'>" + o.columnBtnText + "</span></button>" );
        popup$ = $( "<div class='" + C_POPUP + "' id='" + id + "' style='display:none;'></div>" );
        menu$ = $( "<fieldset class='" + C_CHECKBOX_GROUP + "' aria-labelledby='" + btnId + "'></fieldset>" );

        // set extension here, send "false" to trigger build/rebuild
        this._addToggles( menu$, false );
        menu$.appendTo( popup$ );
        table$.before( popup$ ).before( colPopupButton$ );

        popup$.popup( {
            autoOpen: false,
            title: o.columnBtnText,
            parentElement: colPopupButton$,
            width: "auto",
            minHeight: "0"
        } );

        this._menu = menu$;
        this._columnsButton = colPopupButton$;
        if ( this.noData ) {
            colPopupButton$.hide();
        }
    },

    _setToggleState: function() {
        this._menu.find( "input" ).each( function() {
            var checkbox = $( this );

            this.checked = checkbox.data( "cells" ).eq( 0 ).css( "display" ) === "table-cell";
        });
    }

} );

$( function() {
    $( "[data-role='table']" ).table();
} );

})( apex.widget, apex.jQuery );
