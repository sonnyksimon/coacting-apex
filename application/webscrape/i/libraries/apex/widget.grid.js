/*!
 Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*global apex,$v,Hammer*/
/**
 * @uiwidget grid
 * @since 5.1
 * @extends {tableModelViewBase}
 *
 * @borrows contextMenuMixin#contextMenuAction as grid#contextMenuAction
 * @borrows contextMenuMixin#contextMenu as grid#contextMenu
 * @borrows contextMenuMixin#contextMenuId as grid#contextMenuId
 *
 * @classdesc
 * <p>A jQuery UI widget that implements a navigable data grid that supports selection and editing.
 * It follows the DHTML Style Guide and WAI-ARIA design pattern for a grid box with these differences:<p>
 * <ul>
 * <li>In row selection mode the Shift and Ctrl modifiers work like a list control. In cell selection mode
 * discontinuous ranges are not supported so Shift-F8 is not supported.</li>
 * <li>Ctrl+Home/End is not supported.</li>
 * <li>In edit/actionable mode you can tab out of the grid at the beginning or end.</li>
 * </ul>
 *
 * <p>The markup expected by this widget is simply an empty <code class="prettyprint">&lt;div></code>.
 * The grid displays and optionally edits data stored in an APEX data {@link model}.
 * If the grid is editable then the grid <code class="prettyprint">&lt;div></code> must be
 * proceeded or followed by a <code class="prettyprint">&lt;div></code> with class <code class="prettyprint">u-vh</code>
 * (to visually hide the contents) that contains each of the rendered column items.
 * Each column item needs to be wrapped in a <code class="prettyprint">&lt;div></code>
 * with class <code class="prettyprint">a-GV-columnItem</code>. The markup looks like this:</p>
 * <pre class="prettyprint"></code>    &lt;div class="u-vh" aria-hidden="true">
 *        &lt;div class="a-GV-columnItem">column item markup goes here&lt;/div>
 *        ...
 *    &lt;/div>
 * </code></pre>
 * <p>Only a single cell at a time is edited. The grid moves the column item in and out of the cells as needed.
 * Grid widget functional CSS takes care of hiding the column items off screen.</p>
 *
 * <h3 id="selection-section">Editing
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#editing-section"></a>
 * </h3>
 * <p>The grid can be editable or not editable. This is controlled by the {@link grid#editable}
 * option. If not editable then no UI is provided to do any editing, however it
 * will still respond to any changes to the model data. When the grid
 * is editable it has two modes; navigation mode and editing mode. The distinction is mainly for the purpose of keyboard
 * behavior. In navigation mode keyboard keys move among the grid cells. In editing mode most keys are passed through
 * to the edit controls. Edit mode pertains to cell editing only. Other kinds of edits such as deleting rows is
 * possible as long as the grid is editable. The {@link grid#editable} option can be
 * changed after the grid is created provided
 * the necessary column items are available on the page. See the {@link model} documentation for how it can be used to
 * provide fine grained control over what kinds of edits are allowed. The column definition can specify columns that
 * are read-only. For a cell to be editable the grid must be editable, the row must be editable (as determined by the
 * model), the column configuration must include property <code class="prettyprint">elementId</code>
 * and property <code class="prettyprint">readonly</code> must not be true and the cell field metadata
 * must not have a checksum (<code class="prettyprint">ck</code>) property.</p>
 *
 * <p>Column Edit Items:<br>
 * When the grid is editable and a column can be edited, it is a column item that does the editing. Column items are
 * essentially the same as page items except they edit a column value rather than a page item.
 * See {@link grid#columns} option property <code class="prettyprint">elementId</code>.</p>
 *
 * <h3 id="selection-section">Selection
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#selection-section"></a>
 * </h3>
 * <p>The grid supports both row and cell range selection.
 * For row selection the grid supports either single or multiple selection.
 * Rows can be selected even for grids that are not editable.
 * For multiple selection standard keyboard modifiers Shift and Ctrl are always supported.
 * In addition the {@link grid#rowHeaderCheckbox} option allows for checkbox style selection behavior.
 * If the user is interacting with touch the row header checkbox will be enabled automatically.
 * Column heading, column group heading, aggregate, and control break rows are never included in the selection.
 * </p>
 *
 * <h3 id="context-menus-section">Context Menus
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#context-menus-section"></a>
 * </h3>
 * <p>The grid has easy integration with the {@link menu} widget to provide context menu support.
 * The {@link grid#contextMenu} option is used to provide a {@link menu} widget options object.
 * When the <code class="prettyprint">contextMenu</code> option is used the {@link menu#event:beforeOpen}
 * event/callback ui argument has these additional properties:</p>
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>grid: This grid jQuery object.</li>
 * <li>selection: A jQuery object with the selected rows at the time the menu was opened.</li>
 * <li>selectedRecords: An array of the selected model records at the time the menu was opened. Only if {@link grid#selectCells} is false.</li>
 * <li>selectedRange: The range information returned by {@link grid#getSelectedRange}. Only if {@link grid#selectCells} is true.</li>
 * </ul>
 * <p>Also the {@link menu#event:afterClose} event/callback will automatically focus the grid if the menu action
 * didn't take the focus and the ui argument has these additional properties:
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>grid: This grid jQuery object.</li>
 * </ul>
 *
 * <p>If using the <code class="prettyprint">contextMenu</code> option the {@link grid#contextMenuId}
 * option can be used to give the menu element an ID.
 * This is useful if other code must refer to the menu element or widget.</p>
 *
 * <p>You can reference an already existing {@link menu} widget by specifying the {@link grid#contextMenuId}
 * in place of the {@link grid#contextMenu} option.</p>
 *
 * <p>If for any reason you don't want to use the {@link menu} widget, the {@link grid#contextMenuAction} option
 * allows you to respond to mouse or keyboard interactions that typically result in a context menu.
 * Specifically Right Mouse click (via <code class="prettyprint">contextmenu</code> event),
 * Shift-F10 key (via <code class="prettyprint">keydown</code> event) and the Windows context menu key
 * (via <code class="prettyprint">contextmenu</code> event). The original event is passed to the
 * {@link grid#contextMenuAction} function.
 * The event object can be used to position the menu. If you implement your own menu it is best if you put focus
 * back on the grid using the {@link grid#focus} method when the menu closes (unless the menu action directs focus
 * elsewhere).</p>
 *
 * <p>Only one of {@link grid#contextMenuAction} and {@link grid#contextMenu} or {@link grid#contextMenuId}
 * can be specified.
 * The {@link grid#contextMenu} and {@link grid#contextMenuId} options can only be set when the grid is initialized
 * and it can't be changed. The {@link grid#contextMenuAction} cannot be set if the {@link grid#contextMenu}
 * or {@link grid#contextMenuId} options were given when the grid was created.</p>
 *
 * <h3 id="keyboard-section">
 *   Keyboard End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#keyboard-section"></a>
 * </h3>
 * <table>
 * <thead>
 * <tr><td>Key</td><td>Action</td></tr>
 * </thead>
 * <tbody>
 * <tr><td>F2, Enter</td>            <td>In navigation mode and focus is on a cell, enters edit mode.</td></tr>
 * <tr><td>Escape</td>               <td>In edit mode, exits edit mode and returns to navigation mode.</td></tr>
 * <tr><td>Up Arrow</td>             <td>In navigation mode moves to the cell in the same column of the previous row.</td></tr>
 * <tr><td>Down Arrow</td>           <td>In navigation mode moves to the cell in the same column of the next row.</td></tr>
 * <tr><td>Left Arrow</td>           <td>In navigation mode or when focus is on a column header, moves to the previous cell in the row.</td></tr>
 * <tr><td>Right Arrow</td>          <td>In navigation mode or when focus is on a column header, moves to the next cell in the row.</td></tr>
 * <tr><td>Home</td>                 <td>In navigation mode or when focus is on a column header, moves to the first cell in the row.</td></tr>
 * <tr><td>End</td>                  <td>In navigation mode or when focus is on a column header, moves to the last cell in the row.</td></tr>
 * <tr><td>Page Up</td>              <td>In navigation mode moves focus up one visible page of rows staying in the same column.</td></tr>
 * <tr><td>Page Down</td>            <td>In navigation mode moves focus down one visible page of rows staying in the same column.</td></tr>
 * <tr><td>Enter, Space</td>         <td>When focus is in a column header cell, activates the column header.</td></tr>
 * <tr><td>Shift+Enter</td>          <td>In edit mode moves to the cell in the same column of the previous row.</td></tr>
 * <tr><td>Enter</td>                <td>In edit mode moves to the cell in the same column of the next row.</td></tr>
 * <tr><td>Shift+Tab</td>            <td>In edit mode moves to the previous cell. If foucs is in the first cell of the first row
 *                                   it will go to the previous tab stop before the grid. In navigation mode moves focus
 *                                   out of the grid to the previous tab stop before the grid.</td></tr>
 * <tr><td>Tab</td>                  <td>In edit mode moves to the next cell. If focus is in the last cell of the last row
 *                                   it will go to the next tab stop after the grid or if option {@link grid#autoAddRecord} is
 *                                   true it will insert a new row. In navigation mode moves focus out of the grid
 *                                   to the next tab stop after the grid. The next tab stop may be in the grid footer.</td></tr>
 * <tr><td>Insert</td>               <td>In navigation mode inserts a new record after the current focused row.</td></tr>
 * <tr><td>Delete</td>               <td>In navigation mode deletes the currently selected rows.</td></tr>
 * <tr><td>Alt+F1</td>               <td>In navigation mode display help on the current column if there is any.</td></tr>
 * <tr><td>Ctrl+A</td>               <td>In navigation mode selects all rows if allowed.</td></tr>
 * <tr><td>Alt+Up Arrow</td>         <td>With focus in column header cell will sort ascending by that column. Adding
 *                                   the Shift key modifier will add the column to the existing sorted columns.</td></tr>
 * <tr><td>Alt+Down Arrow</td>       <td>With focus in column header cell will sort descending by that column. Adding
 *                                   the Shift key modifier will add the column to the existing sorted columns.</td></tr>
 * <tr><td>Ctrl+Left Arrow</td>      <td>With focus in column header cell will decrease the width of the column.</td></tr>
 * <tr><td>Ctrl+Right Arrow</td>     <td>With focus in column header cell will increase the width of the column.</td></tr>
 * <tr><td>Shift+Left Arrow</td>     <td>With focus in column header or group header cell will move the column or group to the left.</td></tr>
 * <tr><td>Shift+Right Arrow</td>    <td>With focus in column header or group header cell will move the column or group to the right.</td></tr>
 * <tbody>
 * <table>
 * <p>In navigation mode the Ctrl and Shift keys modify how the arrow keys and Space key affect the selection. In row
 * selection mode with multiple selection the Shift key extends the selection to include the new row. The Ctrl key
 * moves focus without changing the selection. The Space key add the currently focused row to the selection.
 * Ctrl+Space will toggle selection for the current row. In cell range selection mode the Shift key extends the
 * selection to include the new cell.</p>
 *
 * @desc Creates a grid widget.
 *
 * @param {Object} options A map of option-value pairs to set on the widget.
 * @example <caption>This example creates a very simple non-editable grid with just two columns; Id and Name.
 * Only the required options are given; all others will have their default value.
 * The element with id myGrid is an empty div.</caption>
 * var fieldDefinitions = {
 *     id: {
 *         index: 0,
 *         heading: "Id",
 *         seq: "1"
 *     },
 *     name: {
 *         index: 1,
 *         heading: "Name",
 *         seq: "2"
 *     }
 * };
 * var data = [
 *     ["1022", "Betty"],
 *     ["1023", "James"],
 *     ...
 * ];
 * apex.model.create( "myModel", {
 *     recordIsArray: true,
 *     fields: fieldDefinitions
 * }, data );
 * $( "#myGrid" ).grid( {
 *     modelName: "myModel",
 *     columns: [  fieldDefinitions ]
 * } );
 */
 /*
 * todo
 * - improve and document the keyboard behavior for expand/collapse the control break rows.
 * - Currently not visible Required columns or columns which are needed as parent for Cascading LOVs and which don't have
 *   a default value specified will automatically be displayed when switching into Edit Mode.
 * - "If a row is a parent row in a parent – child relationship, all child rows will automatically be marked for deletion too.
 *    Reverting the delete will also automatically revert the deletion of the child rows. In the child Interactive Grid, it's
 *    not possible to revert single deleted rows if the parent row is marked for deletion." Multiple models and grids are involved how is this coordinated?
 * - for inline edit items how to for example check the checkbox on click, drop down the select list on click, open the
 *   date picker/color picker on click.
 * - what if total width of all frozen columns [nearly] exceeds the client area width? This can happen because of
 *    browser window or container resize. Should columns automatically be unfrozen until there is enough room to scroll?
 * - scroll pagination; with no total, interaction with control breaks
 *
 * This widget requires some functional CSS.
 */

/*
 * Future possibilities:
 * - support type to go into edit mode
 * - support double click on the resize border to adjust the width to accommodate the widest value (perhaps with limits)
 * - use a class rather than show hide for buttons, drag thumb
 * - for popup edit columns consider if the resize and move should be keyboard accessible i.e. use Shift+arrow to move and Ctrl+arrow to resize
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.draggable.js
 *    jquery.ui.tooltip.js (for showing error messages)
 *    apex/tooltipManager.js (for tooltips)
 *    apex/widget.tableModelViewBase.js
 *    apex/util.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/model.js
 *    apex/item.js
 *    apex/widget.js
 *    apex/widget.stickyWidget.js (only if stickyTop is not false)
 *    (the following are for context menu integration)
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 */
(function ( util, model, debug, lang, item, clipboard, widgetUtil, $ ) {
    "use strict";

    var C_GRID = "a-GV",
        C_GRID_HEADER = "a-GV-hdr",
        SEL_GRID_HEADER = "." + C_GRID_HEADER,
        C_GRID_BODY = "a-GV-bdy",
        SEL_GRID_BODY = "." + C_GRID_BODY,
        C_GRID_WRAP_FROZEN = "a-GV-w-frozen",
        SEL_GRID_WRAP_FROZEN = "." + C_GRID_WRAP_FROZEN,
        C_GRID_WRAP_HEADER = "a-GV-w-hdr",
        SEL_GRID_WRAP_HEADER = "." + C_GRID_WRAP_HEADER,
        C_GRID_WRAP_SCROLL = "a-GV-w-scroll",
        SEL_GRID_WRAP_SCROLL = "." + C_GRID_WRAP_SCROLL,
        C_GRID_TABLE = "a-GV-table",
        C_GRID_ROW = "a-GV-row",
        SEL_TABLE = "table",
        SEL_ROW = "tr",
        SEL_CELL = "td,th",
        C_GRID_CELL = "a-GV-cell",
        SEL_GRID_CELL = "." + C_GRID_CELL,
        C_GRID_SCROLL_FILLER = "a-GV-scrollFiller",
        C_GRID_COL_HEADER = "a-GV-header",
        SEL_GRID_COL_HEADER = "." + C_GRID_COL_HEADER,
        C_GRID_COL_GROUP = "a-GV-headerGroup",
        SEL_GRID_COL_GROUP = "." + C_GRID_COL_GROUP,
        C_GRID_HEADER_LABEL = "a-GV-headerLabel",
        C_GRID_COL_CONTROLS = "a-GV-columnControls",
        SEL_GRID_COL_CONTROLS = "." + C_GRID_COL_CONTROLS,
        C_GRID_COL_HANDLE = "a-GV-columnHandle",
        C_ROW_HEADER = "a-GV-rowHeader", // an accessible row header cell
        C_SELECTOR = "u-selector",
        C_SELECTOR_SINGLE = C_SELECTOR + " " + C_SELECTOR + "--single",
        SEL_SELECTOR = "." + C_SELECTOR,
        C_GRID_SEL_HEADER = "a-GV-selHeader", // the fixed row header used for selection state etc.
        SEL_GRID_SEL_HEADER = "." + C_GRID_SEL_HEADER,
        SEL_GRID_SELECT_ALL = SEL_GRID_SEL_HEADER + SEL_GRID_COL_HEADER,
        SEL_GRID_CELL_OR_HEADER = ".a-GV-header,.a-GV-headerGroup,.a-GV-cell,.a-GV-controlBreakHeader",
        C_CONTROL_BREAK = "a-GV-controlBreak",
        C_GRID_BREAK_HEADER = "a-GV-controlBreakHeader",
        SEL_GRID_BREAK_HEADER = "." + C_GRID_BREAK_HEADER,
        SEL_GRID_CELL_OR_BREAK = "." + C_GRID_CELL + ",." + C_GRID_BREAK_HEADER,
        C_TAB_TRAP = "js-tabTrap",
        SEL_TAB_TRAP = "." + C_TAB_TRAP,
        C_AUTO_ADD = "js-autoAdd",
        C_FLOATING_ITEM_CONT = "a-GV-floatingItemContent",
        SEL_FLOATING_ITEM_CONT = "." + C_FLOATING_ITEM_CONT,
        SEL_LOAD_MORE = ".a-GV-loadMoreButton",
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        C_FOCUSED = "is-focused",
        C_HOVER = "is-hover",
        SEL_HOVER = "." + C_HOVER,
        C_DISABLED = "is-disabled",
        C_EXPANDED = "is-expanded",
        C_ACTIVE = "is-active",
        SEL_ACTIVE = "." + C_ACTIVE,
        SEL_ACTIVE_CELL = SEL_ACTIVE + SEL_GRID_CELL,
        C_DELETED = "is-deleted",
        SEL_DELETED = "tr." + C_DELETED,
        C_AGGREGATE = "is-aggregate",
        ARIA_SELECTED = "aria-selected",
        ARIA_MULTI = "aria-multiselectable",
        ARIA_RO = "aria-readonly",
        ARIA_LABEL = "aria-label",
        ARIA_EXPANDED = "aria-expanded",
        ARIA_LBL_BY = "aria-labelledby",
        ARIA_CHECKED = "aria-checked",
        C_RTL = "u-RTL",
        SEL_VISIBLE = ":visible",
        SEL_TABBABLE = ":tabbable";

    var NONE = "none",
        SEQUENCE = "sequence",
        LABEL = "label",
        TRUE = "true",
        FALSE = "false";

    var EVENT_SELECTION_CHANGE = "selectionChange",
        EVENT_MODE_CHANGE = "modeChange",
        EVENT_SORT_CHANGE = "sortChange",
        EVENT_COLUMN_REORDER = "columnReorder",
        EVENT_COLUMN_RESIZE = "columnResize",
        EVENT_ACTIVATE_COLUMN_HEADER = "activateColumnHeader",
        EVENT_CANCEL_COLUMN_HEADER = "cancelColumnHeader",
        EVENT_PAGE_CHANGE = "pageChange",
        EVENT_ACTIVATE_CELL = "activateCell";

    var COL_WIDTH_INC = 10,
        MIN_COL_WIDTH = 40, // THINK consider putting this back to 34 once there is a better way to set width of actions column
        FROZEN_LABEL_WIDTH = 200, // if frozen area is wider than this then it will show labels such as load more button and column breaks
        HEADER_SCROLL_SENSITIVITY = 10,
        HEADER_SCROLL_SPEED = 10,
        ATTR_TITLE = "title",
        ATTR_COLSPAN = "colspan",
        ATTR_DATA_IDX = "data-idx",
        ATTR_DATA_ID = "data-id",
        ATTR_DATA_ROWNUM = "data-rownum";

    var keys = $.ui.keyCode,
        gridCount = 0;

    var invokeAfterPaint = util.invokeAfterPaint;

    // Modern browsers support "wheel", only need to do this once for all instances
    var gWheelEvent = "wheel";
    if ( !( "onwheel" in document.body ) ) {
        if ( document.onmousewheel !== undefined ) {
            gWheelEvent = "mousewheel"; // Webkit and IE support at least "mousewheel"
        } else {
            gWheelEvent = "DOMMouseScroll"; // otherwise assume that remaining browsers are older Firefox
        }
    }

    /*
     * todo doc this grid data transfer format writer interface when option dataTransferFormats is documented
     */
    var textFormatWriterPrototype = {
        begin: function( model, selection, columns ) {
            // don't care about model or columns
            this.text = "";
        },
        beginRow: function( index, record, recordId ) {
            if ( index > 0 ) {
                this.text += "\r\n";
            }
        },
        cell: function( index, column, value, text ) {
            if ( index > 0 ) {
                this.text += "\t";
            }
            this.text += text;
        },
        endRow: function() {
        },
        end: function() {
        },
        toString: function() {
            return this.text;
        }
    };
    var htmlFormatWriterPrototype = {
        begin: function( model, selection, columns ) {
            // if user copies a single cell they probably want just the text not a 1x1 table
            if ( columns.length === 1 && selection.records && selection.records.length === 1 ) {
                this.text = "";
                return;
            }
            this.table = true;
            // don't care about model or columns
            this.text = "<table><tbody>";
        },
        beginRow: function( index, record, recordId ) {
            if ( this.table ) {
                this.text += "<tr>";
            }
        },
        cell: function( index, column, value, text ) {
            if ( this.table ) {
                this.text += "<td>" + util.escapeHTML( text ) + "</td>";
            } else {
                this.text += util.escapeHTML( text );
            }
        },
        endRow: function() {
            if ( this.table ) {
                this.text += "</tr>";
            }
        },
        end: function() {
            if ( this.table ) {
                this.text += "</tbody></table>";
            }
        },
        toString: function() {
            return this.text;
        }
    };
    // One might think that a text/csv format writer would be useful but it seems Firefox ignores it and
    // other applications don't seem to use it anyway.

    function alignmentClass( alignment, centerIsDefault ) {
        var cls = "";
        if ( alignment === "start" ) {
            cls = " u-tS";
        } else if ( alignment === "end" ) {
            cls = " u-tE";
        } else if ( alignment === "left" ) {
            cls = " u-tL";
        } else if ( alignment === "right" ) {
            cls = " u-tR";
        } else if ( alignment === "center" && !centerIsDefault ) {
            cls = " u-tC";
        }
        return cls;
    }

    function addHighlightClassIfNeeded( meta, options, cls ) {
        var highlight;
        if ( meta.highlight ) {
            highlight = options.highlights[meta.highlight];
            if ( highlight && highlight.cssClass ) {
                cls += " " + highlight.cssClass;
            } else {
                cls += " " + meta.highlight;
            }
        }
        return cls;
    }

    function getRowClass( meta, options, sel, model, rowItem ) {
        var cls = C_GRID_ROW;
        if ( meta.agg ) {
            cls += " is-aggregate";
            cls += " a-GV-aggregate--" + meta.agg;
            if ( meta.grandTotal ) {
                cls += " is-grandTotal";
            }
        } else {
            if ( meta.sel || sel ) {
                cls += " " + C_SELECTED;
            }
            if ( meta.deleted ) {
                cls += " " + C_DELETED;
            } else {
                if ( meta.inserted ) {
                    cls += " is-inserted";
                } else if ( meta.updated ) {
                    cls += " is-updated";
                }
                if ( meta.error ) {
                    cls += " is-error";
                } else if ( meta.warning ) {
                    cls += " is-warning";
                }
                cls = addHighlightClassIfNeeded( meta, options, cls );
                if ( !model.allowEdit( rowItem ) ) {
                    cls += " is-readonly";
                }
            }
        }
        return cls;
    }

    function getCellClass( col, meta, cellMeta, options, cell$ ) {
        var cls = C_GRID_CELL;
        cls += alignmentClass( col.alignment );
        if ( col.columnCssClasses ) {
            cls += " " + col.columnCssClasses;
        }
        if ( cell$ ) {
            // make sure specific existing view state classes on the cell are not lost
            if ( cell$.hasClass( C_SELECTED ) ) {
                cls += " " + C_SELECTED;
            }
            if ( cell$.hasClass( C_FOCUSED ) ) {
                cls += " " + C_FOCUSED;
            }
            if ( cell$.hasClass( C_ACTIVE ) ) {
                cls += " " + C_ACTIVE;
            }
        }
        if ( cellMeta ) {
            if ( !meta.deleted ) {
                if ( cellMeta.error ) {
                    cls += " is-error";
                } else if ( cellMeta.warning ) {
                    cls += " is-warning";
                } else if ( cellMeta.changed ) {
                    cls += " is-changed";
                }
            }
            cls = addHighlightClassIfNeeded( cellMeta, options, cls );
            if ( cellMeta.disabled ) {
                cls += " is-disabled";
            }
            // a checksum on the cell means that it is readonly
            if ( cellMeta.ck ) {
                cls += " is-readonly";
            }
        }
        if ( col.usedAsRowHeader && !meta.agg ) { // cells in aggregate rows are never row headers
            cls += " " + C_ROW_HEADER;
        }
        return cls;
    }

    function getMessage( key ) {
        return lang.getMessage( "APEX.GV." + key );
    }

    function formatMessage( key ) {
        var args = Array.prototype.slice.call( arguments );
        args[0] = "APEX.GV." + key;
        return lang.formatMessage.apply( lang, args );
    }

    function binarySearch( array, el, compareFn ) {
        var k, cmp,
            s = 0,
            e = array.length - 1;
        while ( s <= e ) {
            k = (e + s) >> 1; // half way between
            cmp = compareFn( el, array[k] );
            if ( cmp > 0 ) {
                s = k + 1;
            } else if( cmp < 0 ) {
                e = k - 1;
            } else {
                return k;
            }
        }
        return s;
    }

    function controlBreakCompare( a, b ) {
        return a.offset - b.offset;
    }

    function domIndex( el$ ) {
        return el$.parent().children().index( el$ );
    }

    function getRows$( out ) {
        var rows$ = $( out.toString() );
        rows$.find( "a,button,input,select,textarea" ).prop( "tabIndex", -1 );
        return rows$;
    }

    function getContainingTableCell$( el ) {
        return $( el ).closest( SEL_GRID_CELL_OR_HEADER );
    }

    function getContainingGridCell$( el ) {
        return $( el ).closest( SEL_GRID_CELL_OR_BREAK );
    }

    function getContainingDataCell$( el ) {
        return $( el ).closest( SEL_GRID_CELL );
    }

    function cellFromColumnIndex( row$, column ) {
        var cell$, index,
            cells$ = row$.children();

        if ( cells$.last().hasClass( C_GRID_COL_GROUP ) ) {
            index = 0;
            cells$.each(function() {
                index += parseInt( $(this).attr(ATTR_COLSPAN), 10 ) || 1;
                if ( index > column ) {
                    cell$ = $( this );
                    return false;
                }
            });
        } else {
            cell$ = cells$.eq( column );
        }
        return cell$;
    }

    function columnIndexFromCell( cell$ ) {
        var index;
        if ( cell$.hasClass( C_GRID_COL_GROUP ) ) {
            index = 0;
            cell$.parent().children().each(function() {
                if ( this === cell$[0] ) {
                    return false;
                }
                index += parseInt( $(this).attr(ATTR_COLSPAN), 10 ) || 1;
            });
        } else {
            index = domIndex( cell$ );
        }
        return index;
    }

    var E_KEYDOWN_ESCAPE = "keydown.gridGlobalEscape";
    function escapeOn( f ) {
        $( "body" ).on( E_KEYDOWN_ESCAPE, function( event ) {
            if ( event.which === keys.ESCAPE ) {
                $( "body" ).off( E_KEYDOWN_ESCAPE );
                f();
            }
        });
    }

    function escapeOff() {
        $( "body" ).off( E_KEYDOWN_ESCAPE );
    }

    function effectiveGroupName( col ) {
        var group = col.groupName || null;
        if ( group && col.useGroupFor && col.useGroupFor.indexOf( "heading" ) < 0 ) {
            group = null;
        }
        return group;
    }

    // simple case where scroll container has no padding, margins, or border and just one child element
    // the child may have borders and a negative top margin
    // headerHeight is optional
    function hasScrollbar(el$, headerHeight) {
        var parent = el$.parent()[0],
            result = {h: false, v: false};

        //  Note this gets confused if overflow is scroll rather than auto
        if ( el$.outerHeight() + ( headerHeight || parseInt( el$.css( "margin-top" ), 10 ) ) > parent.clientHeight ) {
            result.v = true;
        }
        if ( el$.outerWidth() > parent.clientWidth ) {
            result.h = true;
        }
        return result;
    }

    // use debounce (timer) to make sure the focus happens first and also throttle rapid changes from keyboard navigation.
    var notify = function( grid, notify, event ) {
            if ( grid.element.hasClass( C_GRID ) ) { // make sure the grid widget has not been destroyed
                grid._updateStatus();
                if ( notify ) {
                    grid._trigger( EVENT_SELECTION_CHANGE, event );
                }
            }
        },
        notifyDelay = util.debounce( notify, 1 ),
        notifyLongDelay = util.debounce( notify, 350 );

    $.widget( "apex.grid", $.apex.tableModelViewBase, $.extend( true,
        /**
         * @lends grid.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "grid",
        options: {
            /**
             * <p>Text to display when the value is null or empty string.</p>
             *
             * @memberof grid
             * @instance
             * @type {string}
             * @default "-"
             * @example "- null -"
             * @example "- null -"
             */
            showNullAs: "-", // todo consider moving this to base class
            /**
             * <p>Determine if the column header will stick to the top of the page as it scrolls.</p>
             * <p>Only applies if {@link grid#hasSize} is false. If false the column header will not stick to the page.
             * If true or a function the column header will stick to the top of the page using the
             * undocumented <code class="prettyprint">stickyWidget</code> widget.
             * If the value is a function then it is passed to the
             * <code class="prettyprint">stickyWidget</code> as the top option.</p>
             *
             * @memberof grid
             * @instance
             * @type {(boolean|function)}
             * @default false
             * @example true
             * @example true
             */
            stickyTop: false,
            /**
             * <p>Defines the columns in the grid. These columns are also fields in the model.
             * The value is an array of exactly one object that maps the column name to a column definition object.
             * The properties are the column names. The property value is a column definition.
             * Wrapping the object in an array simply keeps the widget from making a copy of the columns so that
             * the same definition can be shared.</p>
             *
             * <p>The same structure can be shared with the data {@link model} and a {@link recordView} widget.
             * This option is required.</p>
             *
             * @memberof grid
             * @instance
             * @type {object[]}
             * @property {object} * The property is the column name. By convention
             *   it is the uppercase database column name. The value is an object that defines the column.
             *   All properties are optional unless specified otherwise.
             * @property {string} *.elementId Column item name (id of DOM element) used to edit this column.
             *   Can omit if column or grid is not editable.
             * @property {string} *.heading The text of the column header. Allows markup.
             * @property {string} *.label The label text of the column. Does not allow markup.
             *   Used by control break headers if given otherwise <code class="prettyprint">heading</code> is used.
             *   When the <code class="prettyprint">heading</code> option includes markup the label option should be specified.
             * @property {string} *.headingAlignment Determines how the heading text is aligned.
             *   One of "start", "end", "center", "left", "right". Default is "center".
             * @property {string} *.alignment Determines how the cell content is aligned.
             *   One of "start", "end", "center", "left", "right". Optional with no default.
             * @property {string} *.headingCssClasses CSS classes applied to the column heading cell.
             * @property {string} *.columnCssClasses CSS classes applied to each cell in this column.
             * @property {string} *.cellTemplate An HTML template that defines the cell content.
             *   See {@link apex.util.applyTemplate} for template syntax.
             *   The substitutions are column names from this column configuration or columns from any parent models
             *   and they are replaced with data values from the current record of the model.
             * @property {boolean} *.escape If false the column value may contain trusted markup otherwise the column
             *   value is escaped.
             * @property {number} *.seq Determines the order of the column among all the others. Lower numbers come first.
             * @property {number} *.width The minimum width of the column. By default the grid may stretch column widths
             *   to make use of available space. See <code class="prettyprint">noStretch</code> property.
             * @property {boolean} *.noStretch If false, the default, columns will stretch to fill available width.
             *   If true the column width will not stretch to fill available space as the grid resizes.
             *   In either case the user can still adjust the width. This stretching only applies if the total
             *   <code class="prettyprint">width</code> of all columns is less than the width of the grid.
             * @property {string} *.groupName Name of column group. See {@link grid#columnGroups} and
             *   <code class="prettyprint">useGroupFor</code>.
             * @property {string} *.useGroupFor If not present or if the string contains "heading" then the group given
             *   in <code class="prettyprint">groupName</code> will be used. This allows the same column definition
             *   to be shared with multiple kinds of views so that the <code class="prettyprint">groupName</code> is
             *   used by other views but not the grid.
             * @property {boolean} *.canHide Determines if the user is allowed to show or hide the column. If true
             *   the user can choose to hide or show the column. If false the user cannot change the hidden state.
             *   The grid only uses this property to determine if it should show a hidden column when needed such
             *   as in {@link grid#gotoError}.
             * @property {boolean} *.hidden If true the column is hidden otherwise it is shown.
             * @property {boolean} *.readonly If true the column cannot be edited. This is also used to give a visual
             *   representation for non-editable cells.
             *   Note: The {@link model} has additional criteria for when a column cell can be edited.
             * @property {string} *.linkTargetColumn The name of the column that contains the anchor
             *   <code class="prettyprint">href</code>. If not given the <code class="prettyprint">href</code>
             *   comes from the model field metadata <code class="prettyprint">url</code> property. If there is
             *   no <code class="prettyprint">url</code> property then this column cell is not a link.
             * @property {string} *.linkText Only for columns that contain a link.
             *   This is the anchor content. Allows markup. Allows substitutions just like the
             *   <code class="prettyprint">cellTemplate</code> property.
             *   If not given the rendered display value of this column is used as the link content.
             *   If the display value of the cell is empty then the link URL is used.
             *   To display a link, at least one of <code class="prettyprint">linkTargetColumn</code>
             *   or the model field metadata <code class="prettyprint">url</code> property must must be given.
             *   Note: If the cell is editable it is always the data value of the field that is edited.
             *   So if you want to edit the link text it is best to omit linkText and use
             *   <code class="prettyprint">linkTargetColumn</code>.
             * @property {string} *.linkAttributes Only for columns that contain a link.
             *   This provides additional anchor attributes. Allows substitutions just like
             *   the <code class="prettyprint">cellTemplate</code> property.
             * @property {boolean} *.isRequired If true the column is indicated as required by adding
             *   <code class="prettyprint">is-required</code> class to the column header.
             *   This should correspond with the required setting of the underlying editable column item.
             * @property {string} *.helpid Help id for the column.
             *   If present pressing the help key Alt+F1 will display the help text for the field.
             * @property {boolean} *.virtual If true the column is not included in copy down and fill operations.
             * @property {boolean} *.noCopy If true the column is not included in copy down and fill operations.
             * @property {boolean} *.usedAsRowHeader If true the column is an accessible row header. The value of the
             *   column is included in the description of the row for assistive technologies. Default is false.
             * @property {boolean} *.noHeaderActivate If true the column header does not support activation. Default is false.
             * @property {string} *.sortDirection: One of "asc" or "desc".
             *   Use "asc" if the data is sorted by this column ascending.
             *   Use "desc" if the data is sorted by this column descending.
             *   The value should be null, not present or undefined if the data is not sorted by this column.
             * @property {number} *.sortIndex Only applies if <code class="prettyprint">sortDirection</code> is given.
             *   The order in which this column is sorted 1 = first, 2 = second, and so on.
             * @property {boolean} *.canSort If true the column can be sorted by the user.
             *   This controls if the header sort buttons are shown or if the keyboard sort keys work.
             *   The grid does not actually do the sorting.
             *   The {@link grid#event:sortchange} event/callback is fired/called to let the controller or parent
             *   widget know to do sorting by refreshing the {@link model} data.
             * @property {string} *.controlBreakDirection One of "asc" or "desc".
             *   Use "asc" if the control break data is sorted by this column ascending.
             *   Use "desc" if the control break data is sorted by this column descending.
             *   The value should be null, not present or undefined if the column is not a control break.
             * @property {number} *.controlBreakIndex The order in which this column is sorted for the purpose of
             *   control breaks. Starting at 1. Only applies if <code class="prettyprint">controlBreakDirection</code> is given.
             * @property {boolean} *.frozen If true the column is frozen (does not horizontal scroll).
             *   Only the start most columns can be frozen. The last column cannot be frozen.
             * @property {string} *.property Do not specify this property. It is added automatically and the value is
             *   the column/field name.
             * @example
             *  [ {
             *      NAME: {
             *          heading: "<em>Name</em>",
             *          label: "Name",
             *          alignment: "start",
             *          headingAlignment: "center",
             *          seq: 1,
             *          canHide: true,
             *          canSort: true,
             *          hidden: false,
             *          isRequired: true,
             *          escape: true,
             *          frozen: false,
             *          noStretch: false,
             *          noCopy: false,
             *          readonly: false,
             *          sortDirection: "asc",
             *          sortIndex: 1,
             *          width: 98
             *      },
             *      ....
             *  } ]
             */
            /*
             * TODO provide details for helpid once apex.theme.popupFieldHelp is documented.
             */
            columns: null,
            /**
             * <p>Defines the grid column heading groups if any. A grid can have multiple levels of column heading groups.
             * Group heading cells display above and span the contiguous columns or column groups that belong to the
             * same group. The columns or column groups in a group need not be adjacent although they often are.</p>
             *
             * @memberof grid
             * @instance
             * @type {object}
             * @property {object} * The property name is the column group name. This name is referenced from
             *     a {@link grid#columns} <code class="prettyprint">groupName</code> property or
             *     a column group definition <code class="prettyprint">parentGroupName</code> property.
             *     The property values are column group definitions.
             * @property {string} *.heading The text of the column header. Allows markup.
             * @property {string} *.label Same as heading but markup not allowed. Not currently used by grid.
             * @property {string} *.headingAlignment One of "start", "end", "center", "left", "right".
             *     Determines how the heading text is aligned. The default is "center".
             * @property {string} *.parentGroupName Optional name of the parent column group. This allows
             *     multiple levels of column groups.
             * @example <caption>This example shows initializing the grid with "First" name and "Last" name columns
             * that are grouped under a column heading group "Name".</caption>
             * $( ".selector" ).grid( {
             *     columns[{
             *         FIRST_NAME: {
             *             heading: "First",
             *             groupName: "NAME",
             *             ...
             *         },
             *         LAST_NAME: {
             *             heading: "Last",
             *             groupName: "NAME",
             *             ....
             *         },
             *         ...
             *     ],
             *     columnGroups: {
             *         NAME: {
             *             heading: "Name",
             *             headingAlignment: "start"
             *         },
             *         ...
             *     }
             * } );
             */
            columnGroups: null,
            /**
             * <p>If true the mouse and keyboard can be used in column headings to adjust the sort order.
             * The grid doesn't actually do any sorting. Something external to the grid must do the actual
             * sorting by handling the {@link grid#event:sortchange} event and updating the model.</p>
             * <p>Note the sort order can still be adjusted external to the grid even if this is false.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            columnSort: true,
            /**
             * <p>If true multiple columns can be sorted using Shift key modifier.
             * This only applies if {@link grid#columnSort} is true.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example jsinit(Interactive Grid [defaultGridViewOptions])
             *     {
             *         columnSortMultiple: false
             *     }
             * @example false
             */
            columnSortMultiple: true,
            /**
             * <p>If true the mouse and keyboard can be used in column headings to adjust the width of columns.</p>
             * <p>Note the column widths can still be changed external to the grid.</p>
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example jsinit(Interactive Grid [defaultGridViewOptions])
             *     {
             *         resizeColumns: false
             *     }
             * @example false
             */
            resizeColumns: true,
            /**
             * <p>If true the mouse and keyboard can be used in column headings to reorder the columns or column groups.</p>
             * <p>Note the column order can still be changed external to the grid.</p>
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example jsinit(Interactive Grid [defaultGridViewOptions])
             *     {
             *         reorderColumns: false
             *     }
             * @example false
             */
            reorderColumns: true,
            /**
             * Map of aggregate name to object with aggregate label and overallLabel.
             *
             * @memberof grid
             * @instance
             * @type {Object}
             * @property {Object} * The aggregate name. The model metadata {@link model.RecordMetadata}
             *     <code class="prettyprint">agg</code> property is the key to this aggregate map.
             * @property {string} *.label The aggregate label.
             * @property {string} *.overallLabel The aggregate overall label.
             * @default {}
             * @example
             *     {
             *         SUM: {
             *             label: "Sum",
             *             overallLabel: "Overall Sum" },
             *         ...
             *     }
             * @example {...}
             */
            aggregateLabels: {},
            /**
             * Map of &lt;aggregate name> + "|" + &lt;aggregate column> to tooltip text.
             *
             * @memberof grid
             * @instance
             * @type {Object}
             * @property {string} * The property name is an aggregate name and column name separated with
             *     a "|" character. The value is the tooltip text.
             * @example
             *     {
             *         "AVG|SALARY": "Average Salary",
             *         ....
             *     }
             * @example {...}
             */
            aggregateTooltips: {},
            /**
             * <p>A jQuery selector that identifies cell content that can be a tab stop in navigation mode.</p>
             *
             * @memberof grid
             * @instance
             * @type {string}
             * @default a,button
             */
            tabbableCellContent: "a,button",
            /**
             * <p>Only applies if {@link grid#editable} is true. If false then can't go in or out of edit mode using mouse or keyboard.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            allowEditMode: true,
            /**
             * <p>Only applies if {@link grid#editable} is true. If false then can't use Delete key to delete a row.
             * This only affects the keyboard behavior. The model determines if rows can be deleted or not.</p>
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            allowDelete: true,
            /**
             * <p>Only applies if {@link grid#editable} is true. If false then can't use Insert key to add a row.
             * This only affects the keyboard behavior. The model determines if rows can be added or not.</p>
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            allowInsert: true,
            /**
             * <p>If true the selection can be copied to the clipboard using the browsers copy event.
             * This can only be set at initialization time.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             */
            allowCopy: true,
            /**
             * <p>Determines the type of row selection header. One of: "none", "plain", "sequence", or "label".
             * The row selection header is not a real column and is always frozen.</p>
             * <ul>
             *     <li>none: There is no selection row header.</li>
             *     <li>plain: There is a selection row header that may contain a checkbox and state classes
             *     but nothing more.</li>
             *     <li>sequence: The selection row header contains a row sequence number. The width can be adjusted.</li>
             *     <li>label: The selection row header contains a label with content given by rowHeaderLabelColumn.
             *     The width can be adjusted.</li>
             * </ul>
             *
             * <p>When the grid is editable or when multiple selection is allowed it is a good idea to have a
             * rowHeader but it is not enforced. A value other than "none" is required for editable grids in order to
             * see visual indicators such as row level errors.</p>
             *
             * @memberof grid
             * @instance
             * @type {string}
             * @default "none"
             * @example "plain"
             * @example "plain"
             */
            rowHeader: NONE,
            /**
             * <p>If true the row selection header will contain a selection control. A checkbox if multiple selection
             * is enabled or a radio button otherwise. If false no selection control is shown.
             * This option is ignored if <code class="prettyprint">rowHeader</code> is "none"</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            rowHeaderCheckbox: false,
            /**
             * <p>This is the name of a model column to take the row header label value from.
             * The column value can include markup. This option only applies
             * if <code class="prettyprint">rowHeader</code> is "label".</p>
             *
             * @memberof grid
             * @instance
             * @type {string}
             * @default null
             * @example "PART_NAME"
             * @example "PART_NAME"
             */
            rowHeaderLabelColumn: null,
            /**
             * <p>Width of row selection header in pixels. Only applies if <code class="prettyprint">rowHeader</code> is not "none".
             * If null a default width is chosen based on the kind of <code class="prettyprint">rowHeader</code>.</p>
             *
             * @memberof grid
             * @instance
             * @type {number|null}
             * @default depends on rowHeader value
             * @example 58
             * @example 58
             */
            rowHeaderWidth: null,
            /**
             * <p>When true select cells otherwise select rows. The default is to select rows.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            selectCells: false,
            /**
             * <p>If true multiple rows can be selected otherwise only a single row can be selected.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            multiple: false,
            /**
             * <p>Only applies while {@link grid#selectCells} is true. If true then a range of cells can be selected
             * otherwise only a single cell is selected. The default is to allow a range of cells to be selected.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            multipleCells: true,
            /**
             * <p>Only applies when {@link grid#multiple} is true. If true then the current page/all visible rows can
             * be selected with Ctrl+A and/or a select all checkbox
             * if {@link grid#rowHeaderCheckbox} is true.</p>
             * <p>Note the definition of "all rows" is not currently well defined and may change in the future.</p>
             *
             * @memberof grid
             * @instance
             * @variation 1
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            selectAll: true,
            /**
             * <p>If true the selection state for each row will be saved as record metadata in the model.</p>
             *
             * @memberof grid
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example jsinit(Interactive Grid [defaultGridViewOptions])
             *     {
             *         persistSelection: true
             *     }
             * @example true
             */
            persistSelection: false,
            /**
             * <p>A tooltip object suitable for jQuery UI tooltip widget except that
             * the <code class="prettyprint">items</code> property is not needed.
             * It is supplied by the grid and cannot be overridden. It matches
             * <code class="prettyprint">td,th</code>. Also the <code class="prettyprint">open</code> event is not available
             * as a property.
             * Default values are provided for <code class="prettyprint">tooltipClass</code>,
             * and <code class="prettyprint">show</code> but can be overridden.
             * The <code class="prettyprint">content</code> callback function receives extra arguments: model, recordMeta, colMeta, columnDef.
             * Tooltips are used to show errors and warnings at the row and cell level. The content function is not
             * called if there is an error or warning message to display. If tooltip is null the
             * error or warning message is added as a title attribute.</p>
             *
             * @memberof grid
             * @instance
             * @type {object}
             * @example
             * {
             *     content: function( callback, model, recordMeta, colMeta, columnDef ) {
             *         var text;
             *         // calculate the tooltip text
             *         return text;
             *     }
             * }
             * @example jsinit(Interactive Grid [defaultGridViewOptions])
             *     {
             *         tooltip: {
             *             content: function( callback, model, recordMeta, colMeta, columnDef ) {
             *                 var text;
             *                 // calculate the tooltip text
             *                 return text;
             *             }
             *         }
             *     }
             * @example
             * {
             *     content: function( callback, model, recordMeta, colMeta, columnDef ) {
             *         var text;
             *         // calculate the tooltip text
             *         return text;
             *     }
             * }
             */
            // todo allow position to be specified?
            tooltip: {
                tooltipClass: "a-GV-tooltip"
            },
            /**
             * todo consider doc in future
             * @ignore
             */
            dataTransferFormats: [
                {
                    format: "text/plain",
                    writer: Object.create( textFormatWriterPrototype )
                },
                // Excel and Calc seem to prefer this format over text/plain
                {
                    format: "text/html",
                    writer: Object.create( htmlFormatWriterPrototype )
                }
            ],

            //
            // events:
            //

            /**
             * <p>Triggered when the selection state changes. It has no additional data.</p>
             *
             * @event selectionchange
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">selectionChange</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     selectionChange: function( event ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridselectionchange</code> event:</caption>
             * $( ".selector" ).on( "gridselectionchange", function( event ) {} );
             */
            selectionChange: null,

            /**
             * <p>Triggered when a column header is activated (Enter/Space key or click).</p>
             *
             * @event activatecolumnheader
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {jQuery} data.header$ The column element jQuery object.
             * @property {object} data.column The column definition object.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">activateColumnHeader</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     activateColumnHeader: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridactivatecolumnheader</code> event:</caption>
             * $( ".selector" ).on( "gridactivatecolumnheader", function( event, data ) {} );
             */
            activateColumnHeader: null,

            /**
             * <p>Triggered when a grid cell is activated (Enter key or double click).
             * This event only applies to non-editable grids.</p>
             *
             * @event activatecell
             * @memberof grid
             * @since 18.2
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {jQuery} data.cell$ The grid cell element jQuery object.
             * @property {jQuery} data.row$ The grid row jQuery object. When there are frozen columns this will contain two row elements.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">activateCell</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     activateCell: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridactivatecell</code> event:</caption>
             * $( ".selector" ).on( "gridactivatecell", function( event, data ) {} );
             */
            activateCell: null,

            /**
             * <p>Triggered when whatever popup is opened in response to activateColumnHeader event
             * should be closed/canceled. This happens because of another operation on the column such as dragging.</p>
             *
             * @event activatecolumnheader
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">cancelColumnHeader</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     cancelColumnHeader: function( event ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridcancelcolumnheader</code> event:</caption>
             * $( ".selector" ).on( "gridcancelcolumnheader", function( event ) {} );
             */
            cancelColumnHeader: null,

            /**
             * <p>Triggered when the sort direction changes. This does not actually
             * sort the data or ask the model to sort or fetch new data. It is expected that
             * a handler will call {@link grid#refreshColumns} and then take action that causes the data to be sorted.</p>
             *
             * @event sortchange
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {jQuery} data.header$ The column element jQuery object.
             * @property {object} data.column The column definition object.
             * @property {string} data.direction One of "asc" or "desc"
             * @property {string} data.action One of "add", "remove", or "change".
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">sortChange</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     sortChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridsortchange</code> event:</caption>
             * $( ".selector" ).on( "gridsortchange", function( event, data ) {} );
             */
            sortChange: null,

            /**
             * <p>Triggered when the columns have been reordered.</p>
             *
             * @event columnreorder
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {jQuery} data.header$ The column element jQuery object.
             * @property {object} data.column The column definition object.
             * @property {string} data.newPosition The index of the new position of the column.
             * @property {string} data.oldPosition The index of the old position of the column.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">columnReorder</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     columnReorder: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridcolumnreorder</code> event:</caption>
             * $( ".selector" ).on( "gridcolumnreorder", function( event, data ) {} );
             */
            columnReorder: null,

            /**
             * <p>Triggered when a column width has been changed.</p>
             *
             * @event columnresize
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {jQuery} data.header$ The column element jQuery object.
             * @property {object} data.column The column definition object.
             * @property {string} data.width The new width in pixels.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">columnResize</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     columnResize: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridcolumnresize</code> event:</caption>
             * $( ".selector" ).on( "gridcolumnresize", function( event, data ) {} );
             */
            columnResize: null,

            /**
             * <p>Triggered when the edit mode changes.</p>
             *
             * @event modechange
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {boolean} data.editMode The new edit mode.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">modeChange</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     modeChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridmodechange</code> event:</caption>
             * $( ".selector" ).on( "gridmodechange", function( event, data ) {} );
             */
            modeChange: null,

            /**
             * Triggered when there is a pagination event that results in new records being displayed.
             *
             * @event pagechange
             * @memberof grid
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {number} data.offset the offset of the first record in the page.
             * @property {number} data.count the number of records in the page that were added to the view.
             *
             * @example <caption>Initialize the grid with the <code class="prettyprint">pageChange</code> callback specified:</caption>
             * $( ".selector" ).grid({
             *     pageChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">gridpagechange</code> event:</caption>
             * $( ".selector" ).on( "gridpagechange", function( event, data ) {} );
             */
            pageChange: null
        },

        _create: function () {
            var self = this,
                o = this.options,
                ctrl$ = this.element;

            debug.info("Grid '" + ctrl$[0].id + "' created. Model: " + o.modelName );

            ctrl$.addClass( C_GRID )
                .attr( "role", "grid" );

            if ( o.multiple ) {
                ctrl$.attr( ARIA_MULTI, TRUE );
            }
            if ( !o.editable ) {
                ctrl$.attr( ARIA_RO, TRUE );
            }

            this.forwardKey = keys.RIGHT;
            this.backwardKey = keys.LEFT;
            if ( ctrl$.css("direction") === "rtl" ) {
                ctrl$.addClass( C_RTL );
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
            }

            this._enforceOptionConstraints();

            this._super(); // init table model view base

            this.origLabelBy = ctrl$.attr( ARIA_LBL_BY );
            this.idPrefix = ctrl$[0].id || "agv_" + ( gridCount++ );
            this.accContextId = this.idPrefix + "_ctx";
            this.curRowHeaders = "";        // ids selector of header cells in current row

            this.tableFrozenHeader$ = null;  // table > tbody element of the frozen header table if present
            this.tableHeader$ = null;        // table > tbody element of the header table
            this.tableFrozenData$ = null;    // table > tbody element of the frozen data column table if present
            this.tableData$ = null;          // table > tbody element of the data table
            this.lastEditModeCell = null;
            this.frozenColumnCount = 0;      // number of actual columns shown in frozen area, 0 if no frozen area
            this.controlBreaks = [];         // control breaks sorted by serverOffset

            this.editMode = false;
            this.columns = null;              // sorted array of column metadata from options.columns
            this.columnsStale = true;
            this.columnGroups = null;         // array of sorted arrays of column groups
            this.lastFrozenColIndex = -1;     // index of last frozen column or -1 if no frozen columns
            this.lastFocused = null;          // last cell that had focus or has focus could be button/link inside a cell
            this.lastRow$ = null;             // All the columns (td) in the row that contains lastFocused. This will be all
            // the columns from one or two tr elements depending on if there are frozen columns
            this.focusInHeader = false;       // if true the lastFocused cell is in the table header
            this.lastHoverCell = null;        // used to track mouse hover
            this.lastHoverRow = null;         // used to track mouse hover
            this.columnControls$ = null;
            this.scrollTimerId = null;
            this.deactivateDelayTimer = null;

            this.gotoCellPending = null;

            this._initContextMenu( SEL_ROW, function( event ) {
                // don't open context menu when target is an anchor or in edit mode
                return $( event.target ).closest( "a" ).length > 0 || self.editMode;
            }, function( event ) {
                var cell$;

                // context menu only applies to grid cells and when not in edit mode
                cell$ = getContainingDataCell$( event.type === "keydown" ? this.lastFocused : event.target );
                if ( cell$.length ) {
                    if ( self.options.selectCells ) {
                        if ( !cell$.hasClass( C_SELECTED ) ) {
                            return cell$;
                        }
                    } else {
                        // if target row not selected then select it
                        if ( !cell$.parent().hasClass( C_SELECTED ) ) {
                            return cell$;
                        }
                    }
                    return true;
                }
                return false;
            }, function( ui ) {
                if ( self.options.selectCells ) {
                    ui.selectedRange = self.getSelectedRange();
                } else {
                    ui.selectedRecords = self.getRecords(ui.selection);
                }
            } );

            // get the model
            this._initModel( o.modelName );

            this._on( this._eventHandlers );

            if ( o.allowCopy ) {
                clipboard.addHandler( ctrl$[0], function( dataTransfer ) {
                    if ( self.editMode ) {
                        return false;
                    } // else
                    self._copy( dataTransfer );
                    return true;
                });
            }

            this._updateHighlights();
            this.refresh();
            this._setSelectionMode();

            if ( o.disabled ) {
                this._setOption( "disabled", o.disabled );
            }
        },

        _eventHandlers: {
            resize: function( event ) {
                if (event.target !== this.element[0]) {
                    return;
                }
                this.resize();
                event.stopPropagation();
            },
            click: function ( event ) {
                var cell$, allChecked,
                    self = this,
                    o = this.options,
                    target$ = $( event.target );

                // ignore click, shift and ctrl click on anchors and buttons and anything in the footer to let the browser do its thing
                if ( target$.closest( "a,button,.a-GV-footer" ).length > 0 ) {
                    return;
                }

                // ignore clicks in the the floating (popup) edit column item
                if ( target$.closest( ".a-GV-floatingItem" ).length > 0 ) {
                    return;
                }

                // Check if click on the select all header
                cell$ = target$.closest( SEL_GRID_SELECT_ALL );
                if ( cell$.length ) {
                    this.focusInHeader = true;
                    self.lastColIndex = null;
                    if ( o.rowHeaderCheckbox && o.multiple && o.selectAll && !o.selectCells ) {
                        allChecked = cell$.find( SEL_SELECTOR ).attr( ARIA_CHECKED ) === TRUE;
                        // if currently all selected then select none otherwise select all.
                        if ( allChecked ) {
                            self.setSelection( $() );
                        } else {
                            self.selectAll();
                        }
                        self._select( cell$, event, true, false );
                        self._setFocusable( cell$[0] ); // need to force this because of setting selection twice
                    } else {
                        self._select( cell$, event, true, false );
                    }
                    return;
                }

                // Check if click on a column group header. They don't do much but need to take focus
                cell$ = target$.closest( SEL_GRID_COL_GROUP );
                if ( cell$.length ) {
                    this.focusInHeader = true;
                    self.lastColIndex = null;
                    self._select( cell$, event, true, false );
                    event.preventDefault();
                    return;
                }

                // Check if click on any other header cell and not on a button
                cell$ = target$.closest( SEL_GRID_COL_HEADER );
                if ( cell$.length && target$.closest( "button" ).length === 0 ) {
                    this.focusInHeader = true;
                    self.lastColIndex = null;
                    self._select( cell$, event, true, false );
                    this._activateColumnHeader( event, cell$ );
                    event.preventDefault();
                    return;
                }

                // Check if click on a row header
                cell$ = target$.closest( SEL_GRID_SEL_HEADER );
                if ( cell$.length ) {
                    if ( o.rowHeaderCheckbox && !o.selectCells ) {
                        // always behave like toggle
                        event.ctrlKey = true;
                        event.shiftKey = false;
                    }
                    this.focusInHeader = false;
                    self.lastColIndex = null;
                    this._select( cell$, event, true, false );
                    event.preventDefault();
                    return;
                }

                // Check if click on any data cell
                cell$ = target$.closest( SEL_GRID_CELL );
                if ( cell$.length ) {
                    this.focusInHeader = false;
                    self.lastColIndex = null;
                    if ( !cell$.hasClass( C_ACTIVE ) ) {
                        this._select( cell$, event, true, false );
                        event.preventDefault();
                    }
                }
                cell$ = target$.closest( SEL_GRID_BREAK_HEADER );
                if ( cell$.length ) {
                    this.focusInHeader = false;
                    self.lastColIndex = null;
                    this._select( cell$, event, true, false );
                    event.preventDefault();
                }
            },
            dblclick: function ( event ) {
                var o = this.options,
                    cell$ = $( event.target ).closest( SEL_GRID_CELL ).not( SEL_GRID_SEL_HEADER );

                if ( cell$.length ) {
                    if ( o.editable && o.allowEditMode ) {
                        if ( !this.editMode ) {
                            this.setEditMode( true );
                        }
                    } else {
                        this._fireActivate( event, cell$ );
                    }
                }
            },
            mousedown: function ( event ) {
                var target$ = $( event.target );

                // ignore this event for anything in the footer
                if ( event.originalEvent.button !== 0 || target$.closest( ".a-GV-footer" ).length > 0 ) {
                    return;
                }

                // preventing default for mouse down prevents some cases of text selection and also
                // makes it so that the focus happens after the click. This includes preventing mouse down on the
                // expand/collapse button so it can be clicked without deactivating the cell.
                // But if the click is on the active editing cell don't prevent it so the click gets through to the editing controls
                if ( target$.closest( ".a-GV-expandCollapse" ).length > 0 ||
                        !( this.editMode && (
                            target$.closest( SEL_GRID_CELL ).hasClass( C_ACTIVE ) ||
                            target$.closest( ".a-GV-floatingItem" ) ) )) {
                    event.preventDefault();
                }
            },
            keydown: function ( event ) {
                var i, colIndex, cur$, column, pos, page, groupLevel, sel, w,
                    self = this,
                    o = this.options,
                    next$ = null,
                    kc = event.which,
                    target$ = $( event.target );

                function activateHeader() {
                    if ( cur$.hasClass( C_GRID_SEL_HEADER ) ) {
                        // simulate a click on select all checkbox if there is one
                        cur$.find( SEL_SELECTOR ).click();
                    } else {
                        self._activateColumnHeader( event, cur$ );
                        event.preventDefault();
                    }
                }

                function findNextColumnPosition( pos, inc ) {
                    var i,
                        nextPos = null;

                    pos += inc;
                    for ( i = pos; i >= 0 && i < self.columns.length; i += inc ) {
                        if ( !self.columns[i].hidden ) {
                            nextPos = i;
                            break;
                        }
                    }
                    return nextPos;
                }

                // ignore key events for anything in the footer
                if ( target$.closest( ".a-GV-footer" ).length > 0 ) {
                    return;
                }

                if ( kc === keys.PAGE_UP || kc === keys.PAGE_DOWN ) {
                    page = this.displayPageSize;
                }

                if ( kc === keys.HOME ) {
                    if ( !this.editMode && this.lastFocused ) {
                        this.lastColIndex = null;
                        next$ = this.lastRow$.first();
                        event.preventDefault();
                    }
                } else if ( kc === keys.END ) {
                    if ( !this.editMode && this.lastFocused ) {
                        this.lastColIndex = null;
                        next$ = this.lastRow$.last();
                        event.preventDefault();
                    }
                } else if ( kc === keys.PAGE_DOWN ) {
                    if ( !this.focusInHeader && !this.editMode && !event.altKey ) {
                        next$ = this._getNextCellDown( getContainingGridCell$( this.lastFocused ), page );
                        event.preventDefault();
                    }
                } else if ( kc === keys.PAGE_UP ) {
                    if ( !this.focusInHeader && !this.editMode && !event.altKey ) {
                        next$ = this._getPrevCellUp( getContainingGridCell$( this.lastFocused ), page, true );
                        event.preventDefault();
                    }
                } else if ( kc === keys.DOWN ) {
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( o.columnSort && event.altKey && cur$.hasClass( C_GRID_COL_HEADER )) {
                        self._sortChange( event, cur$, "desc" );
                        return;
                    }
                    if ( (!this.editMode || this.focusInHeader) && this.lastFocused && !event.altKey ) {
                        next$ = this._getNextCellDown( cur$, 1 );
                        // don't let selection happen or scrolling
                        event.preventDefault();
                    }
                    // don't let a menu button do it's down arrow thing
                    if ( target$.closest( ".js-menuButton" ).length ) {
                        event.stopPropagation();
                    }
                } else if ( kc === keys.UP ) {
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( o.columnSort && event.altKey && cur$.hasClass( C_GRID_COL_HEADER )) {
                        self._sortChange( event, cur$, "asc" );
                        return;
                    }
                    if ( (!this.editMode || this.focusInHeader) && this.lastFocused && !event.altKey ) {
                        next$ = this._getPrevCellUp( cur$, 1 );
                        // don't let selection happen or scrolling
                        event.preventDefault();
                        event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                    }
                } else if ( kc === this.backwardKey ) {
                    if ( event.altKey ) {
                        return; // let the browser have this key
                    }
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( ( event.ctrlKey || event.shiftKey ) && (
                                    cur$.hasClass( C_GRID_COL_HEADER ) || cur$.hasClass( C_GRID_COL_GROUP )
                                    ) && ( !cur$.hasClass ( C_GRID_SEL_HEADER ) || o.rowHeader === SEQUENCE || o.rowHeader === LABEL ) ) {
                        pos = parseInt( cur$.attr( ATTR_DATA_IDX ), 10 );
                        if ( !( isNaN( pos ) && !event.ctrlKey && o.rowHeader !== SEQUENCE && o.rowHeader !== LABEL ) ) {
                            // must not be a row header, which can't be reordered and only resized when rowHeader is sequence or text
                            if ( pos >= 0 ) {
                                column = this.columns[pos];
                            }
                            if ( event.shiftKey && o.reorderColumns ) {
                                event.preventDefault(); // do this before moveColumn redraws the grid
                                // reorder column
                                if ( cur$.hasClass( C_GRID_COL_GROUP ) ) {
                                    groupLevel = domIndex( cur$.parent() );
                                    if ( pos > 0 ) {
                                        this.moveColumnGroup( groupLevel, pos, pos - 1 );
                                        cur$ = $( this.lastFocused ).closest( SEL_GRID_COL_GROUP );
                                    }
                                } else {
                                    pos = findNextColumnPosition( pos, -1 );
                                    if ( pos ) {
                                        this.moveColumn( column, pos );
                                        // after re-rendering the focus should stay with the column
                                        return;
                                    }
                                }
                            } else if ( event.ctrlKey && o.resizeColumns && !cur$.hasClass( C_GRID_COL_GROUP ) ) { // else must be resize but that doesn't apply to group headers
                                // make column narrower
                                if ( column ) {
                                    if ( cur$.outerWidth() > MIN_COL_WIDTH ) {
                                        w = cur$.outerWidth() - COL_WIDTH_INC;
                                        if ( w < MIN_COL_WIDTH ) {
                                            w = MIN_COL_WIDTH;
                                        }
                                        this.setColumnWidth( column, w );
                                    }
                                } else {
                                    if ( self.rowHeaderWidth > MIN_COL_WIDTH ) {
                                        w = self.rowHeaderWidth - COL_WIDTH_INC;
                                        if ( w < MIN_COL_WIDTH ) {
                                            w = MIN_COL_WIDTH;
                                        }
                                        self.rowHeaderWidth = w;
                                        this._calculateColumnWidths( cur$, true );
                                    }
                                }
                                return;
                            }
                        }
                    }
                    if ( ( !this.editMode || this.focusInHeader ) && this.lastFocused ) {
                        this.lastColIndex = null;
                        colIndex = this.lastRow$.index( cur$ );
                        if ( colIndex > 0) {
                            colIndex -= 1;
                            next$ = this.lastRow$.eq( colIndex );
                        }
                        event.preventDefault();
                    }
                } else if ( kc === this.forwardKey ) {
                    if ( event.altKey ) {
                        return; // let the browser have this key
                    }
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( ( event.ctrlKey || event.shiftKey ) && (
                                    cur$.hasClass( C_GRID_COL_HEADER ) || cur$.hasClass( C_GRID_COL_GROUP )
                                    ) && ( !cur$.hasClass ( C_GRID_SEL_HEADER ) || o.rowHeader === SEQUENCE || o.rowHeader === LABEL ) ) {
                        pos = parseInt( cur$.attr( ATTR_DATA_IDX ), 10 );
                        if ( !( isNaN( pos ) && !event.ctrlKey && o.rowHeader !== SEQUENCE && o.rowHeader !== LABEL ) ) {
                            // must not be a row header, which can't be reordered and only resized when rowHeader is sequence or text
                            if ( pos >= 0 ) {
                                column = this.columns[pos];
                            }
                            if ( event.shiftKey && o.reorderColumns ) {
                                event.preventDefault(); // do this before moveColumn redraws the grid
                                // reorder column
                                if ( cur$.hasClass( C_GRID_COL_GROUP ) ) {
                                    groupLevel = domIndex( cur$.parent() );
                                    if ( pos < this.columnGroups[groupLevel].length - 1 ) {
                                        this.moveColumnGroup( groupLevel, pos, pos + 1 );
                                        cur$ = $( this.lastFocused ).closest( SEL_GRID_COL_GROUP );
                                    }
                                } else {
                                    pos = findNextColumnPosition( pos, 1 );
                                    if ( pos ) {
                                        this.moveColumn( column, pos );
                                        // after re-rendering the focus should stay with the column
                                        return;
                                    }
                                }
                            } else if ( event.ctrlKey && o.resizeColumns && !cur$.hasClass( C_GRID_COL_GROUP ) ) { // else must be resize but that doesn't apply to group headers
                                // make column wider
                                if ( column ) {
                                    this.setColumnWidth( column, cur$.outerWidth() + COL_WIDTH_INC );
                                } else {
                                    self.rowHeaderWidth += COL_WIDTH_INC;
                                    this._calculateColumnWidths( cur$, true );
                                }
                                return;
                            }
                        }
                    }
                    if ( ( !this.editMode || this.focusInHeader ) && this.lastFocused ) {
                        this.lastColIndex = null;
                        colIndex = this.lastRow$.index( cur$ );
                        if ( colIndex < this.lastRow$.length - 1 ) {
                            colIndex += 1;
                            next$ = this.lastRow$.eq( colIndex );
                        }
                        event.preventDefault();
                    }
                } else if ( kc === 65 && event.ctrlKey && !this.editMode ) { // Ctrl+A
                    this.selectAll();
                    event.preventDefault();
                } else if ( kc === keys.SPACE ) {
                    // ignore if on a button
                    if ( event.target.nodeName === "BUTTON" ) {
                        return;
                    }
                    cur$ = target$.filter( SEL_GRID_SEL_HEADER ).find( SEL_SELECTOR );
                    if ( cur$.length ) {
                        cur$.click();
                        event.preventDefault(); // don't scroll the page
                        return;
                    }
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( cur$.hasClass( C_GRID_COL_HEADER ) ) {
                        activateHeader();
                    } else if ( cur$.hasClass( C_GRID_CELL ) && !this.editMode ) {
                        // a grid cell not in edit mode and not on the row header checkbox
                        this._select( cur$, event, true, true );
                        event.preventDefault();
                    }
                } else if ( kc === keys.ENTER ) {
                    // ignore when target is an anchor or button (or other thing that uses enter) or in a popup edit field unless it is on the expand/collapse button
                    if ( !target$.hasClass( "a-GV-expandCollapse" ) && target$.closest( "a,button,.js-uses-enter," + SEL_FLOATING_ITEM_CONT ).length > 0 ) {
                        return;
                    }
                    cur$ = target$.filter( SEL_GRID_SEL_HEADER ).find( SEL_SELECTOR );
                    if ( cur$.length ) {
                        cur$.click();
                        return;
                    }
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( this.editMode && ( cur$.hasClass( C_GRID_CELL ) || cur$.hasClass( C_GRID_BREAK_HEADER ) ) ) {
                        // if in edit mode go to next cell in column
                        if ( event.shiftKey ) {
                            next$ = this._getPrevCellUp( cur$, 1 );
                            // don't move up to header
                            if ( next$ && next$.hasClass( C_GRID_COL_HEADER ) ) {
                                next$ = null;
                            }
                            // don't let the selection code act on the shift modifier
                            event.shiftKey = false;
                        } else {
                            next$ = this._getNextCellDown( cur$, 1 );
                        }
                    } else {
                        event.preventDefault();
                        if ( o.editable && o.allowEditMode && cur$.hasClass( C_GRID_CELL ) && !cur$.hasClass( C_GRID_SEL_HEADER ) ) {
                            this.setEditMode( true );
                        } else if ( cur$.hasClass( C_GRID_COL_HEADER ) ) {
                            activateHeader();
                        } else if ( !(o.editable && o.allowEditMode) && cur$.hasClass( C_GRID_CELL ) ) {
                            this._fireActivate( event, cur$ );
                        }
                    }
                } else if ( kc === 113 ) { // F2
                    cur$ = getContainingDataCell$( this.lastFocused );
                    if ( cur$.length && o.editable && o.allowEditMode && !this.editMode ) {
                        this.setEditMode( true );
                    }
                } else if ( kc === keys.ESCAPE ) {
                    if ( o.editable && o.allowEditMode && this.editMode ) {
                        cur$ = getContainingDataCell$( this.lastFocused );
                        if ( cur$.length ) {
                            this._setFocusable( cur$[0] );
                        }
                        // move focus so that the change event happens
                        cur$.focus();
                        this.setEditMode( false );
                        if ( cur$.length ) {
                            this._setFocus( this._getCellFocusable( cur$ ) );
                        }
                        // if we handle the escape key don't let anyone else. this for example keeps dialogs from closing
                        event.stopPropagation();
                    }
                } else if ( kc === keys.DELETE ) {
                    if ( o.editable && o.allowDelete && !this.editMode && !this.focusInHeader ) {
                        sel = this.getSelectedRecords();

                        for ( i = 0; i < sel.length; i++ ) {
                            if ( !this.model.allowDelete( sel[i] ) ) {
                                sel.splice( i, 1 );
                                i -= 1;  // i stays the same for next iteration
                            }
                        }
                        if ( sel.length > 0 ) {
                            this.model.deleteRecords( sel );
                        }
                    }
                } else if ( kc === 45 ) { // INSERT
                    if ( o.editable && o.allowInsert && !this.editMode && !o.selectCells ) {
                        if ( this.model.allowAdd() ) {
                            sel = this.getSelectedRecords();
                            if ( sel.length > 0 ) {
                                this.model.insertNewRecord( null, sel[sel.length - 1] );
                            } else {
                                this.model.insertNewRecord( );
                            }
                        }
                    }
                } else if ( kc === 112  && event.altKey ) { // Alt+F1 get column help
                    cur$ = getContainingTableCell$( this.lastFocused );
                    if ( !cur$.hasClass( C_GRID_SEL_HEADER ) && !cur$.hasClass( C_GRID_COL_GROUP ) && !cur$.hasClass( C_GRID_BREAK_HEADER ) ) {
                        column = this._getColumnMetadata( cur$ );
                        if ( column && column.helpid ) {
                            // todo if in edit mode Alt+F6 or close dialog doesn't refocus the active cell.
                            apex.theme.popupFieldHelp( column.helpid, $v( "pInstance" ) );
                        }
                    }
                }
                if ( next$ ) {
                    this._select( next$, event, true, true );
                    event.preventDefault();
                }
            },
            focusin: function ( event ) {
                var cell$, prevActive$,
                    target$ = $( event.target );

                // ignore focus changes within a floating edit popup
                if ( target$.closest( ".a-GV-floatingItem" ).length ) {
                    this._clearDeactivate();
                    return;
                }

                cell$ = target$.closest( SEL_GRID_CELL_OR_HEADER );
                if ( cell$.length === 0 ) {
                    // focus not in a cell could be in a tab trap which will soon put focus in a cell
                    // remember the last edit cell across the tab trap bump
                    if ( !target$.hasClass( C_TAB_TRAP ) ) {
                        this.lastEditModeCell = null;
                    }
                    return;
                }
                cell$.addClass( C_FOCUSED );
                if ( this.lastEditModeCell === cell$[0] ) {
                    // ignore focus changes within an editing cell
                    this._clearDeactivate();
                    return;
                }
                if ( this.editMode && ( cell$.hasClass( C_GRID_CELL ) || cell$.hasClass( C_GRID_BREAK_HEADER ) ) ) {
                    // the change in focus that will happen due to activate keeps the click event from happening
                    // that is why focusInHeader set to false here
                    this.focusInHeader = false;
                    prevActive$ = $( this.lastEditModeCell );
                    this._clearDeactivate();
                    if ( prevActive$.length ) {
                        this._deactivateCell( prevActive$ );
                    }
                    this._activateCell( cell$ );
                } else {
                    this._setFocusable( event.target );
                }
            },
            focusout: function ( event ) {
                var target$ = $( event.target ),
                    cell$ = target$.closest( SEL_GRID_CELL_OR_HEADER );

                // if target is in a floating edit we want the underlying table cell
                if ( !cell$.length && this.lastEditModeCell && target$.closest( ".a-GV-floatingItem" ).length ) {
                    cell$ = $( this.lastEditModeCell );
                }
                cell$.removeClass( C_FOCUSED );
                if ( this.editMode && cell$.hasClass( C_GRID_CELL ) ) {
                    this._beginDeactivate( cell$ );
                }
            },
            mousemove: function( event ) {
                var row$, container, x, column, colIndex,
                    target$ = $(event.target ),
                    o = this.options,
                    cell$ = target$.closest( SEL_GRID_CELL_OR_HEADER );

                if ( cell$.length ) {
                    if ( cell$[0] !== this.lastHoverCell ) {
                        row$ = cell$.parent();
                        if ( row$[0] !== this.lastHoverRow ) {
                            this._clearHoverStates();
                            this.lastHoverRow = row$[0];
                            if ( ( row$.hasClass( C_GRID_ROW ) || row$.hasClass( C_CONTROL_BREAK ) ) &&
                                    !this.columnReordering && !this.columnWidthDragging ) {
                                this._setRowHoverState( row$ );
                            }
                        }
                        this.lastHoverCell = cell$[0];
                        // start by assuming these are hidden because each is conditionally shown
                        this.columnControls$.hide();
                        this.columnHandle$.hide();
                        if ( cell$[0].nodeName === "TH" && !cell$.hasClass( C_GRID_CELL ) && !row$.hasClass( C_CONTROL_BREAK ) ) {
                            column = this.columns[cell$.attr( ATTR_DATA_IDX )];
                            // if column sorting is enabled and over a column header and the column can be sorted
                            if ( o.columnSort && !this.columnReordering && !this.columnWidthDragging &&
                                    !cell$.hasClass( C_GRID_SEL_HEADER ) && !cell$.hasClass( C_GRID_COL_GROUP ) &&
                                    column.canSort ) {
                                cell$.append( this.columnControls$.show() );
                                this._updateColumnControls( column );
                            }
                            // if column ordering is enabled and over a column header
                            if ( o.reorderColumns && !this.columnReordering && !this.columnWidthDragging &&
                                !cell$.hasClass( C_GRID_SEL_HEADER ) ) {
                                this.columnReorderCell$ = cell$;
                                cell$.append( this.columnHandle$.show().css( "left", "" ) );
                            }
                            if ( o.resizeColumns && !this.columnReordering && !this.columnWidthDragging &&
                                    ( !cell$.hasClass( C_GRID_SEL_HEADER ) || o.rowHeader === SEQUENCE || o.rowHeader === LABEL ) ) {
                                // position the column width drag handle and associate it with its column
                                container = cell$.closest( "div" )[0];
                                x = cell$[0].offsetLeft + container.offsetLeft - container.scrollLeft;
                                if ( !this.element.hasClass( C_RTL ) ) {
                                    x += cell$.outerWidth();
                                }
                                this.columnWidthHandle$.show().css( "left", x - ( this.columnWidthHandle$.width() / 2 ) );
                                colIndex = cell$.attr( ATTR_DATA_IDX );
                                if ( colIndex ) {
                                    this.columnWidthCell$ = this._columnFromIndex( colIndex ); // do this to get both header cells - don't use cell$
                                } else {
                                    this.columnWidthCell$ = this.element.find( SEL_GRID_COL_HEADER + SEL_GRID_SEL_HEADER );
                                }
                            }
                        }
                    }
                } else {
                    if ( this.lastHoverCell !== null ) {
                        this.lastHoverCell = null;
                        this.lastHoverRow = null;
                        this._clearHoverStates();
                    }
                }
            },
            mouseleave: function() {
                if ( this.lastHoverCell !== null ) {
                    this.lastHoverCell = null;
                    this.lastHoverRow = null;
                    this._clearHoverStates();
                }
            }
        },

        _initTooltips: function( options ) {
            var ttOptions,
                self = this;

            if ( !$.ui.tooltip ) {
                debug.warn( "tooltip option ignored because missing tooltip widget dependency" );
                return;
            }
            if ( this.tooltipOptions ) {
                // tooltip widget already initialized so destroy it
                this.element.find( SEL_GRID_BODY ).filter( ":data('ui-tooltip')" ).tooltip( "destroy" );
                this.tooltipOptions = null;
            }
            if ( options ) {
                ttOptions = this.tooltipOptions = $.extend( true, {
                                show: apex.tooltipManager.defaultShowOption(),
                                tooltipClass: "a-GV-tooltip"
                                // todo position
                            }, options ); // deep copy
                ttOptions.items = SEL_CELL; // force this
                ttOptions._originalContent = ttOptions.content;
                ttOptions.content = function( callback ) {
                    var recId, cls, text,
                        cell$ = $( this ),
                        row$ = cell$.parent(),
                        recordMeta = null,
                        colMeta = null,
                        column = self._getColumnMetadata( cell$ );

                    recId = row$.attr( ATTR_DATA_ID );
                    if ( recId ) {
                        recordMeta = self.model.getRecordMetadata( recId );
                    }
                    if ( column && recordMeta && recordMeta.fields ) {
                        colMeta = recordMeta.fields[ column.property ];
                    }
                    if ( recordMeta && !recordMeta.deleted ) {
                        if ( colMeta && ( colMeta.error || colMeta.warning ) ) {
                            cls = colMeta.error ? "is-error" : "is-warning";
                            return "<span class='" + cls + "'>" + util.escapeHTML( colMeta.message ) + "</span>";
                        }
                        // TODO think where to show the message if there is no row header
                        if ( ( recordMeta.error || recordMeta.warning ) && cell$.hasClass( C_GRID_SEL_HEADER ) ) {
                            cls = recordMeta.error ? "is-error" : "is-warning";
                            return "<span class='" + cls + "'>" + util.escapeHTML( recordMeta.message ) + "</span>";
                        }
                        if ( recordMeta.agg && column ) {
                            text = self.options.aggregateTooltips[ recordMeta.agg + "|" + column.property ];
                            if ( text ) {
                                return "<span class='" + cls + "'>" + util.escapeHTML( text ) + "</span>";
                            }
                        }
                    }
                    if ( ttOptions._originalContent ) {
                        return ttOptions._originalContent.call( this, callback, self.model, recordMeta, colMeta, column );
                    }
                    return null;
                };
                ttOptions.open = function( event, ui ) {
                    // hoist up the error indicator class
                    if ( ui.tooltip.find( ".is-error" ).length ) {
                        ui.tooltip.addClass( "is-error" );
                    }
                    if ( ui.tooltip.find( ".is-warning" ).length ) {
                        ui.tooltip.addClass( "is-warning" );
                    }
                };
                this.element.find( SEL_GRID_BODY + "," + SEL_GRID_HEADER ).tooltip( ttOptions );
            }
        },

        _destroy: function() {
            var ctrl$ = this.element;

            this._tableModelViewDestroy();
            ctrl$.removeClass( C_GRID + " " + C_DISABLED + " " + C_RTL )
                .removeAttr( "role" )
                .removeAttr( ARIA_MULTI )
                .removeAttr( ARIA_RO )
                .attr( ARIA_LBL_BY, this.origLabelBy )
                .empty();

            clipboard.removeHandler( ctrl$[0] ); // no problem if had not been added

            debug.info("Grid '" + ctrl$[0].id + "' destroyed. Model: " + this.options.modelName );

            this.tableData$ = null;
            this.tableFrozenData$ = null;

            // disconnect from the model
            this._initModel( null ); // this will cleanup change listener

            if ( this.gridStyles$ ) {
                this.gridStyles$.remove();
            }

            this._destroyContextMenu();
        },

        _setOption: function ( key, value ) {
            var ctrl$ = this.element,
                o = this.options;

            debug.info("Grid '" + ctrl$[0].id + "' set option '" + key + "' to: ", value );

            this._checkContextMenuOptions( key, value );
            if ( key === "allowCopy" ) {
                throw new Error( "Grid " + key + " cannot be set" );
            } else if ( key === "editable" && !value && this.editMode ) {
                // if changing from editable to not editable make sure to leave edit mode
                this.setEditMode( false );
            } else if ( key === "multiple" ) {
                this.setSelection( $() ); // clear the selection mainly for going from multiple to single
            }

            this._super( key, value );

            this._enforceOptionConstraints();

            if ( key === "disabled" ) {
                ctrl$.toggleClass( C_DISABLED, value );
                if ( this.lastFocused ) {
                    if ( value ) {
                        this.lastFocused.tabIndex = -1;
                    } else {
                        this._setFocusable( this.lastFocused );
                    }
                }
                if ( value ) {
                    // when enabling do this just in case it was resized while disabled
                    this.resize();
                }
            } else if ( key === "selectCells" ) {
                this._setSelectionMode();
            } else if ( key === "multiple" ) {
                if ( value ) {
                    ctrl$.attr( ARIA_MULTI, TRUE );
                } else {
                    ctrl$.removeAttr( ARIA_MULTI );
                }
                if ( o.rowHeader !== NONE && o.rowHeaderCheckbox ) {
                    this.refreshColumns(); // need to have the input change to checkbox or radio
                }
                this.refresh();
            } else if ( key === "modelName" ) {
                // leave edit mode if the model changes
                if ( this.editMode ) {
                    this.setEditMode( false );
                }
                this._initModel( value );
                this.refresh( false, true );
            } else if ( key === "highlights" ) {
                this._updateHighlights();
            } else if ( key === "tooltip" ) {
                this._initTooltips( value );
            } else if ( key === "rowHeader" || key === "rowHeaderCheckbox" || key === "rowHeaderLabelColumn" || key === "columnSort" ||
                        key === "resizeColumns" || key === "reorderColumns" || key === "editable" ||
                        key === "pagination" || key === "selectAll" || key === "footer" || key === "autoAddRecord") {

                if ( key === "editable" ) {
                    if ( !value ) {
                        ctrl$.attr( ARIA_RO, TRUE );
                    } else {
                        ctrl$.removeAttr( ARIA_RO );
                    }
                }
                this._refreshGrid();
            }

        },

        _enforceOptionConstraints: function() {
            var o = this.options;

            if ( o.rowHeaderCheckbox && o.rowHeader === NONE ) {
                debug.warn("Option rowHeaderCheckbox cannot be true when rowHeader is 'none'.");
                o.rowHeaderCheckbox = false;
            }

            if ( o.multiple && ( o.rowHeader === NONE || !o.rowHeaderCheckbox ) && apex.userHasTouched() ) {
                // make multiple selection easier/possible on touch devices
                if ( o.rowHeader === NONE ) {
                    o.rowHeader = "plain";
                }
                o.rowHeaderCheckbox = true;
            }

            if ( !o.editable || !o.allowEditMode ) {
                o.autoAddRecord = false;
            }

            if ( o.rowHeader !== NONE ) {
                if ( o.rowHeaderWidth ) {
                    this.rowHeaderWidth = o.rowHeaderWidth;
                } else {
                    if ( o.rowHeaderCheckbox ) {
                        this.rowHeaderWidth = 34;
                    } else {
                        this.rowHeaderWidth = 16;
                    }
                    if ( o.rowHeader === SEQUENCE || o.rowHeader === LABEL ) {
                        this.rowHeaderWidth += 38;
                    }
                }
            }
        },

        /**
         * <p>Refreshes the grid with data from the model.
         * This method is rarely needed because it is called automatically when the model changes,
         * widget options change, or when pagination or column related methods are called.</p>
         * @param {boolean} [pFocus] if true put focus in the grid, if false don't. If undefined/omitted maintain
         * focus if the grid already has focus.
         */
        /*
         * TODO improve doc with info about selection
         * Try to persist the selection. xxx What was selected may not exist in the grid after refresh.
         * First try to select the same records.
         */
        refresh: function( pFocus ) {
            var i, headerColumn, sel, colIndex, table$, id, header$, col,
                cell$ = null,
                selection = null,
                headerRow = null,
                self = this,
                o = this.options,
                ctrl$ = this.element;

            debug.info("Grid '" + ctrl$[0].id + "' refreshed. Model: " + o.modelName );

            if ( pFocus === undefined ) {
                pFocus = $( document.activeElement ).closest( ctrl$[0] ).length > 0;
            }

            // this offsetParent method of checking visibility is OK because grid widget should never be position fixed
            if ( ctrl$[0].offsetParent === null ) {
                // Grid is invisible so don't bother rendering anything expect a resize or refresh later
                this.pendingRefresh = true;
                return;
            }
            this.pendingRefresh = false;

            // if there is an active cell make sure it is deactivated before re-rendering
            cell$ = ctrl$.find( SEL_ACTIVE_CELL );
            if ( cell$.length ) {
                this._deactivateCell( cell$ );
            }

            // if the last focused was in the header try to restore it after refresh
            if ( this.focusInHeader ) {
                // if the grid and columns are not being rendered the focus will not be lost
                if ( this.columnsStale && this.columns ) {
                    // otherwise the last focused is lost but keep the focus in the header and
                    // try to stay in the same cell
                    headerRow = domIndex( $( this.lastFocused ).closest( SEL_ROW ) );
                    headerColumn = $( this.lastFocused ).closest( "th" ).attr( ATTR_DATA_IDX );
                    // the index could change so remember the column by property name
                    if ( headerColumn ) {
                        headerColumn = this.columns[headerColumn].property;
                    }
                    this.lastFocused = null;
                }
            } else {
                this.lastFocused = null;
            }

            // preserve current selection if possible and if not kept in model (when selecting cells there is no selection in model)
            if ( this.tableData$ && ( !o.persistSelection || o.selectCells ) ) {
                if ( o.selectCells ) {
                    // preserve the first cell of the selection by index
                    sel = this.getSelection();
                    if ( sel.length > 0 ) {
                        cell$ = sel[0].first();
                        // calculate colIndex including frozen table
                        colIndex = domIndex( cell$ );
                        if ( this.tableFrozenData$ && cell$.closest( this.tableFrozenData$ ).length === 0 ) {
                            colIndex += this.tableFrozenData$.find( SEL_ROW ).first().children().length;
                        }
                        selection = {
                            rowIndex: domIndex( cell$.parent() ),
                            colIndex: colIndex
                        };
                    }
                } else {
                    // preserve selection by records can't use getSelectedRecords because in some cases the model has
                    // already been cleared by the time refresh is called. So need an array of recordIds
                    sel = this.getSelection();
                    selection = [];
                    for ( i = 0; i < sel.length; i++ ) {
                        id = sel[i].first().attr( ATTR_DATA_ID );
                        if ( id !== undefined ) {
                            selection.push( id );
                        }
                    }
                    if ( selection.length === 0 ) {
                        selection = null;
                    }
                }
            }

            this._refreshPagination( ctrl$.find( SEL_GRID_WRAP_SCROLL ) );

            if ( this.columnsStale || !this.columns ) {
                this._initGrid();
            } else {
                if ( this.tableFrozenData$ ) {
                    this.tableFrozenData$.empty();
                }
                this.tableData$.empty();
                this._clearChildrenRowCache();
            }
            this.controlBreaks = [];

            this._updateStatus();
            // if there is no data then the add page of records call will do a resize so don't do it here also
            if ( !this.noData ) {
                this.resize();
            }

            header$ = ctrl$.find( SEL_GRID_HEADER );
            if ( headerRow !== null && headerColumn ) {
                // turn the header column name back into an index
                col = o.columns[0][headerColumn];
                if ( col ) {
                    headerColumn = col.seq - 1; // assume data-idx is seq - 1
                    header$.find( "thead" ).each(function() {
                        cell$ = $( this ).children().eq( headerRow ).find( "th[data-idx='" + headerColumn + "']" );
                        if ( cell$.length ) {
                            return false;
                        }
                    });
                }
                if ( !cell$ || !cell$.length ) {
                    // the previous header column couldn't be found so pick first column
                    cell$ = header$.find( "thead" ).first()
                        .find( SEL_ROW ).eq( headerRow ).children().first();
                }
                if ( cell$ && cell$.length ) {
                    self._select( cell$, null, pFocus, false, true );
                    // now that focus is set don't set it again while restoring the selection
                    pFocus = false;
                }
            }

            this._addPageOfRecords( function() {
                var i, cells$, frozenColCount, record,
                    selectionMade = false;

                ctrl$.find( SEL_GRID_COL_HEADER + " " + SEL_SELECTOR )
                    .attr( "aria-disabled", self.noData ? TRUE : FALSE )
                    .toggleClass( C_DISABLED, self.noData );

                self._updateAccLabel();
                // on refresh the amount of data can change and this can affect vertical scrollbar if heading fixed to region (hasSize)
                // so update column widths in that case
                if ( o.hasSize ) {
                    self._calculateColumnWidths( null, true, true );
                }

                self.lastHoverCell = null;
                self.lastHoverRow = null;

                // if the last focused element was lost (or never established)
                if ( !self.lastFocused || !$( self.lastFocused ).is( SEL_VISIBLE ) ) {
                    // try to focus the first data cell
                    self.lastRow$ = null;
                    self.lastFocused = self._getCellFocusable( ctrl$.children( SEL_GRID_BODY )
                        .find( "tbody tr" ).first().children().first() );
                    if ( self.lastFocused ) {
                        self.selectAnchor = self.lastFocused;
                        self.focusInHeader = false;
                    } else {
                        // if there is no data then focus a header
                        self.lastFocused = self._getCellFocusable( header$.find( "thead" ).first().find( SEL_ROW ).last().children().first() );
                        self.focusInHeader = true;
                    }
                    if ( self.lastFocused && !o.disabled ) {
                        self._setFocusable( self.lastFocused );
                        self._setCurrentRow( self.lastFocused );
                    }
                }
                // restore selection if any
                if ( selection ) {
                    if ( o.selectCells ) {
                        if ( self.tableData$.find(".a-GV-row").length > selection.rowIndex ) {
                            colIndex = selection.colIndex;
                            table$ = self.tableData$;
                            if (  self.tableFrozenData$ ) {
                                frozenColCount = self.tableFrozenData$.find( SEL_ROW ).first().children().length;
                                if ( colIndex > frozenColCount ) {
                                    colIndex -= frozenColCount;
                                } else {
                                    table$ = self.tableFrozenData$;
                                }
                            }
                            cells$ = table$.find( ".a-GV-row" ).eq( selection.rowIndex ).children();
                            if ( colIndex >= cells$.length ) {
                                colIndex = cells$.length - 1;
                            }
                            self.setSelection( [cells$.eq( colIndex )], pFocus );
                            selectionMade = true;
                        }
                    } else {
                        sel = [];
                        for ( i = 0; i < selection.length; i++ ) {
                            record = self.model.getRecord( selection[i] );
                            if ( record ) {
                                sel.push( record );
                            }
                        }
                        if ( sel.length > 0 ) {
                            // intended to select something but check and if it didn't the selection has changed
                            selectionMade = self.setSelectedRecords( sel, pFocus ) !== 0;
                        }
                    }
                    // there was a selection but not able to make a selection after refresh so the selection has changed
                    if ( !selectionMade ) {
                        self._trigger( EVENT_SELECTION_CHANGE, {} );
                        if ( pFocus ) {
                            self.focus();
                        }
                    }
                } else {
                    if ( pFocus ) {
                        self.focus();
                    }
                }
            } );
        },

        /**
         * <p>Give focus to the grid. Focus is given to the last element that had focus.</p>
         * @example <caption>This example focuses the grid.</caption>
         * $( ".selector" ).grid( "focus" );
         */
        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        /**
         * <p>Put focus in the cell given by <code class="prettyprint">pRecordId</code>
         * and <code class="prettyprint">pColumn</code>. This is used to focus rows or cells that have
         * errors. This will scroll or change pages as needed to focus the cell. The record must be in the model.
         * The row containing the cell is selected. If <code class="prettyprint">pColumn</code> is null then the
         * first column is focused which may be the row selection header.</p>
         *
         * @param {string} pRecordId The record id of the row to go to.
         * @param {string} [pColumn] The Column name in the record row to go to.
         */
        gotoCell: function( pRecordId, pColumn ) {
            var record, index, sp$, st,
                o = this.options,
                needRefresh = false,
                column = null,
                cell$ = null,
                row$ = this.element.find( "[data-id='" + pRecordId + "']" );

            this.gotoCellPending = null;

            if ( !this.tableData$ ) {
                return; // grid is not yet initialized
            }
            if ( pColumn ) {
                column = o.columns[0][pColumn];
                if ( !column ) {
                    debug.warn( "Warning column not found " + pColumn );
                } else {
                    // make sure column is visible
                    if ( column.hidden && column.canHide ) {
                        // show it and setup for a callback
                        column.hidden = false;
                        needRefresh = true;
                        this.refreshColumns();
                        this.gotoCellPending = { record: pRecordId, column: pColumn };
                    }
                }
            }

            if ( !row$.length ) {
                record = this.model.getRecord( pRecordId );
                if ( !record ) {
                    // if the record is not in the model then can' go to it
                    debug.warn( "Warning record not found " + pRecordId );
                    return;
                }
                index = this.model.indexOf( record );
                // todo this scrolling/pageging may not be accurate if the model has aggregate records and/or the view has control breaks
                // may need to hunt for the record but make sure no infinite loop
                this.gotoCellPending = { record: pRecordId, column: pColumn };
                if ( o.pagination.scroll ) {
                    sp$ = this.scrollParent$;
                    st = Math.floor( index / this.displayPageSize ) * this.displayPageHeight;
                    sp$.scrollTop( st ); // this will trigger a refresh as needed
                } else {
                    this.pageOffset = Math.floor( index / this.pageSize ) * this.pageSize;
                    needRefresh = true;
                }
            }

            if ( needRefresh ) {
                this.refresh( false );
            }
            if ( this.gotoCellPending ) {
                // we will be called back after the view has been refreshed
                return;
            }

            if ( pColumn && column ) {
                cell$ = this._cellFromColumn( row$, pColumn );
            }
            if ( !cell$ ) {
                cell$ = row$.children().first();
            }
            this._select( cell$, null, true, false );
        },

        /**
         * Given a column item return the grid cell for that column item in the current active row.
         * If <code class="prettyprint">pItem</code> is not a column item or if there is no active row return null.
         * @param {Element} pItem The column item.
         * @return {jQuery|null} Cell corresponding to <code class="prettyprint">pItem</code> or null
         * if there is no active row cell for <code class="prettyprint">pItem</code>.
         */
        getActiveCellFromColumnItem: function( pItem ) {
            var row$,
                self = this,
                cell$ = null;

            if ( this.activeRecordId ) {
                row$ = this.element.find( "[data-id='" + this.activeRecordId + "']" );

                $.each( this.columnItems, function( name, value ) {
                    if ( pItem === value.item.node ) {
                        cell$ = self._cellFromColumn( row$, name );
                    }
                } );
            }
            return cell$;
        },

        /**
         * Determine if grid is in edit mode rather than navigation mode. See also {@link grid#setEditMode}.
         *
         * @return {boolean} true if in edit mode and false otherwise.
         * @example <caption>This example logs a message if the grid is in edit mode.</caption>
         * if ( $( ".selector" ).grid( "inEditMode" ) ) {
         *     console.log("In edit mode");
         * }
         */
        inEditMode: function() {
            return this.editMode;
        },

        /**
         * Set the current edit mode. Should only be used if the grid is editable.
         * Triggers {@link grid#event:modechange} event.
         *
         * @param {boolean} pEditMode If true enter edit mode. If false enter navigation mode.
         * @example <caption>This example enters edit mode.</caption>
         * $( ".selector" ).grid( "setEditMode", true ) );
         */
        setEditMode: function( pEditMode ) {
            var changed, cell$,
                delayDeactivate = false,
                self = this;

            function completeDeactivate() {
                self.columnItemsContainer$.off( "change.gridedit" );
                self.activeRecord = null;
                self.activeRecordId = null;
            }

            if ( !this.tableData$ ) {
                return; // not yet initialized
            }
            if ( this.options.editable ) {
                pEditMode = !!pEditMode;
                changed = pEditMode !== this.editMode;
                this.editMode = pEditMode;  // todo consider if this and the event should be delayed if deactivate delayed due to lock
                this.element.toggleClass( "a-GV--editMode", pEditMode );
                cell$ = $( this.lastFocused ).closest( SEL_GRID_CELL );
                if ( cell$.length ) {
                    if ( pEditMode ) {
                        this._activateCell( cell$ );
                    } else {
                        this.lastEditModeCell = null;
                        if ( this.deactivateDelayTimer ) {
                            clearTimeout( this.deactivateDelayTimer );
                            this.deactivateDelayTimer = null;
                        }
                        this._deactivateCell( cell$ );
                        if ( this.activeRecord ) {
                            this._deactivateRow( completeDeactivate );
                            delayDeactivate = true;
                        }
                    }
                }

                if ( changed ) {
                    // todo if changed and now editing may need to force some columns to be visible and this will cause a refresh of the grid

                    if ( pEditMode ) {
                        // handle item changes that may happen from code such as a DA.
                        this.columnItemsContainer$.on( "change.gridedit", function( event ) {
                            var i, column, prop;

                            if ( self.activeRecord ) {
                                for ( i = 0; i < self.columns.length; i++ ) {
                                    column = self.columns[i];
                                    if ( column.elementId === event.target.id ) {
                                        prop = column.property;
                                        self.setActiveRecordValue( prop );
                                        break;
                                    }
                                }
                            }

                        } );
                    } else if ( !delayDeactivate ) {
                        completeDeactivate();
                    }

                    this._trigger( EVENT_MODE_CHANGE, null, {
                        editMode: pEditMode
                    });
                }
            } else if ( pEditMode ) {
                debug.warn( "Grid is not editable." );
            }
        },

        /**
         * <p>Return the current selection. The return value depends on the {@link grid#selectCells} option.</p>
         * <p>If <code class="prettyprint">selectCells</code> is true, return the current selected range as an
         * array of rows. Each row is a jQuery object containing the selected column cells.</p>
         * <p>If <code class="prettyprint">selectCells</code> is false, return the currently selected rows as an
         * array of jQuery objects each item in the array is a row.
         * When there are frozen columns (or even just a frozen row header) each jQuery item in the array
         * contains two <code class="prettyprint">tr</code> elements. One for the frozen columns and one for the
         * non-frozen columns.</p>
         *
         * @return {Array} Array of jQuery row objects.
         * @example <caption>The following example processes a row selection (<code class="prettyprint">selectCells</code> is false).</caption>
         * var i, rows = $( "#mygrid" ).grid( "getSelection" );
         * for ( i = 0; i < rows.length; i++ ) {
         *     // note rows[i].length === 2 if there are frozen columns and 1 otherwise
         *     rows[i].addClass("foo"); // this adds a class to both tr elements in the case where there are frozen columns
         *     rows[i].children().each(function() {
         *         // do something with each column
         *     }
         * }
         * @example <caption>The following example processes a cell range selection (<code class="prettyprint">selectCells</code> is true).</caption>
         * var i, rows = $( "#mygrid" ).grid( "getSelection" );
         * for ( i = 0; i < rows.length; i++ ) {
         *     // note rows[i].length is the number of columns in the range selection.
         *     rows[i].addClass("foo"); // this adds a class to all cells in the selected columns of this row
         *     rows[i].each(function() {
         *         // do something with each column cell
         *     }
         * }
         */
        getSelection: function() {
            var sel1$, sel2$,
                result = [];

            if ( this.tableData$ ) {
                if ( this.options.selectCells ) {
                    // This only works because there is one rectangular range so the rows in sel1 and 2 are in sync
                    sel2$ = this.tableData$.find( SEL_SELECTED ).parent( SEL_ROW );
                    if ( this.tableFrozenData$ ) {
                        sel1$ = this.tableFrozenData$.find( SEL_SELECTED ).parent( SEL_ROW );
                    }
                    if ( sel1$ && sel1$.length ) {
                        sel1$.each( function( i ) {
                            result.push( $( this ).find( SEL_SELECTED ).filter( SEL_CELL )
                                .add( sel2$.eq( i ).find( SEL_SELECTED ).filter( SEL_CELL ) ) );
                        } );
                    } else {
                        sel2$.each(function() {
                            result.push( $( this ).find( SEL_SELECTED ).filter( SEL_CELL ) );
                        } );
                    }
                } else {
                    sel2$ = this.tableData$.find( SEL_SELECTED ).filter( SEL_ROW );
                    if ( this.tableFrozenData$ ) {
                        sel1$ = this.tableFrozenData$.find( SEL_SELECTED ).filter( SEL_ROW );
                        sel1$.each( function( i ) {
                            result.push( $( [ this, sel2$[i] ] ) );
                        } );
                    } else {
                        sel2$.each(function() {
                            result.push( $( this ) );
                        } );
                    }
                }
            }
            return result;
        },

        /**
         * Set the selected rows of the grid. Triggers the {@link grid#event:selectionchange} event
         * unless <code class="prettyprint">pNoNotify</code> is true.
         *
         * @param {Array} pRows An array of jQuery row objects such as the return value of {@link grid#getSelection}
         *     or a jQuery object containing one or more rows (<code class="prettyprint">tr</code> elements)
         *     or columns (<code class="prettyprint">td</code> elements) from this grid.
         * @param {boolean} [pFocus] If true the first cell (in pRows) of the selection is given focus.
         * @param {boolean} [pNoNotify] if true the selection change event will be suppressed.
         * @example <caption>This example selects the third row of the first grid widget on the page.</caption>
         * $(".a-GV").first().grid( "setSelection", [$(".a-GV").first().find( ".a-GV-w-scroll .a-GV-row" ).eq(3)] );
         */
        setSelection: function( pRows, pFocus, pNoNotify ) {
            var i, cell,
                event = null,
                saveLastFocused = this.lastFocused,
                save = this.focusInHeader,
                cells = [];

            if ( !this.tableData$ ) {
                return; // grid is not yet rendered
            }

            if ( this.options.selectCells ) {
                // expect tds not trs
                if ( !$.isArray( pRows ) ) {
                    pRows = [pRows];
                }
                cell = pRows[0].first()[0]; // upper left
                cells.push( pRows[pRows.length - 1].last()[0] ); // lower right
                if ( cell !== cells[0] ) {
                    this._select( $( cell ), null, false, false, false );
                    event = { type: "click", shiftKey: true };
                }
            } else {
                if ( $.isArray( pRows ) ) {
                    for ( i = 0; i < pRows.length; i++ ) {
                        cell = pRows[i].children( SEL_CELL )[0];
                        if ( cell ) {
                            cells.push( cell );
                        }
                    }
                } else {
                    pRows.each(function() {
                        if ( this.nodeName === "TR" ) {
                            cell = $( this ).children( SEL_CELL )[0];
                        } else {
                            cell = $( this ).closest( SEL_CELL )[0];
                        }
                        if ( cell ) {
                            cells.push( cell );
                        }
                    });
                }
            }

            pFocus = !!pFocus;
            this.focusInHeader = false;
            this._select( $( cells ), event, pFocus, false, pNoNotify );
            if ( !pFocus ) {
                this.focusInHeader = save;
                // if not setting focus and focus was in the header put it back where it was
                if ( save ) {
                    this._setFocusable( saveLastFocused );
                    this._setCurrentRow( saveLastFocused );
                }
            }
        },

        /**
         * Select all rows. This has no effect if the {@link grid#multiple} or {@link grid#selectAll(1)} options are not true.
         * This only applies to the current page or what has been rendered so far.
         *
         * @variation 2
         * @param {boolean} [pFocus] If true the first cell of the selection is given focus.
         * @param {boolean} [pNoNotify] If true the selection change event will be suppressed.
         */
        // TODO more details needed on the definition of "all"
        // if pagination is not scroll then it applies to the whole page otherwise it applies to what is in the scroll viewport
        selectAll: function( pFocus, pNoNotify ) {
            var cells = [],
                o = this.options,
                table$ = this.tableFrozenData$ || this.tableData$;

            if ( table$ && o.multiple && o.selectAll && !o.selectCells ) {
                table$.children().each(function() {
                    cells.push($( this ).children()[0] );
                });
                this.setSelection( $( cells ), pFocus, pNoNotify );
            }
        },

        /**
         * <p>Given an array of jQuery row objects return the underlying data model records.
         * The return value from {@link grid#getSelection} is an appropriate value for <code class="prettyprint">pRows</code>.
         * However it need not contain <code class="prettyprint">tr</code> elements from both the frozen and un-frozen areas.
         *
         * @param {jQuery[]} pRows Array of jQuery objects representing grid rows.
         * @return {Array} array of records from the model corresponding to the grid rows
         */
        getRecords: function( pRows ) {
            var i, id, value,
                values = [];

            for ( i = 0; i < pRows.length; i++ ) {
                id = pRows[i].first().attr( ATTR_DATA_ID );
                if ( id !== undefined ) {
                    value = this.model.getRecord( id );
                    if ( value ) {
                        values.push( value );
                    }
                }
            }

            return values;
        },

        /**
         * <p>Returns the selected cell range or null if there are no cells selected. For this method to work
         * the option {@link grid#selectCells} must be true. The object returned has these properties:</p>
         *
         * @return {Object} Information about the range of selected cells or null if no cells selected.
         * @property {Array} columns An array of column names one for each selected column.
         *     The column name is null for the row header pseudo column.
         * @property {Array} recordIds An array of record ids one for each selected row.
         * @property {Array[]} values An array of rows. Each row is an array of column values.
         * @example <caption>This example logs the selected range to the console.</caption>
         * var i, j, text,
         *     range = $( ".selector" ).grid( "getSelectedRange" );
         * text = "id"
         * for ( j = 0; j < range.columns.length; j++ ) {
         *         text += ", " + range.columns[j];
         * }
         * console.log( text );
         * for ( i = 0; i < range.values.length; i++ ) {
         *     text = range.recordIds[i];
         *     for ( j = 0; j < range.values[i].length; j++ ) {
         *         text += ", " + range.values[i][j];
         *     }
         *     console.log( text );
         * }
         */
        getSelectedRange: function() {
            var sel, r, c, values, cols$, id, meta,
                o = this.options,
                result = null;

            if ( o.selectCells ) {
                result = {
                    columns: [],
                    recordIds: [],
                    values: []
                };
                sel = this.getSelection();
                for ( r = 0; r < sel.length; r++ ) {
                    cols$ = sel[r];

                    if ( r === 0 ) {
                        for ( c = 0; c < cols$.length; c++ ) {
                            meta = this._getColumnMetadata( cols$.eq( c ) );
                            result.columns.push( meta ? meta.property : null );
                        }
                    }

                    id = cols$.first().parent().attr( ATTR_DATA_ID );
                    result.recordIds.push( id !== undefined ? id : null );

                    values = [];
                    for ( c = 0; c < cols$.length; c++ ) {
                        values.push( cols$.eq( c ).text() );
                    }
                    result.values.push( values );
                }
            }
            return result;
        },

        /**
         * <p>Return the underlying data model records corresponding to the current selection.
         * If option {@link grid#selectCells} is true this returns an empty array.</p>
         *
         * <p>Note: If option {@link grid#persistSelection} is true then the selected records could span multiple pages
         * and getSelectedRecords returns a different selection from {@link grid#getSelection} which can only return
         * elements from the current page. To get just the records that correspond to
         * <code class="prettyprint">getSelection</code> when this option is true use:<br>
         * <code class="prettyprint">$( ".selector" ).grid( "getRecords", $( ".selector" ).grid("getSelection") );</code></p>
         *
         * @return {Array} Array of records from the model corresponding to the selected grid rows.
         * @example <caption>This example gets the selected records.</caption>
         * var records = $( ".selector" ).grid( "getSelectedRecords" );
         */
        getSelectedRecords: function() {
            var o = this.options;

            if ( o.selectCells ) {
                return [];
            } // else
            if ( o.persistSelection ) {
                // if selection is persisted in the model the ask the model for the count
                // in this case the selection could span multiple pages
                return this.model.getSelectedRecords();
            } // else
            return this.getRecords( this.getSelection() );
        },

        /**
         * Select the grid rows that correspond to the given data model records. Depending on pagination the records
         * may not actually be in view or rendered at this time even if they exist in the underlying data model or on
         * the server. Triggers the {@link grid#event:selectionchange} event unless <code class="prettyprint">pNoNotify</code>
         * is true.
         *
         * @param {model.Record[]} pRecords An array of data model records to select.
         * @param {boolean} [pFocus] If true the first cell of the selection is given focus.
         * @param {boolean} [pNoNotify] If true the selection change event will be suppressed.
         * @return {integer} Count of the rows actually selected or -1 if called before the grid data is initialized or
         * if {@link grid#selectCells} option is true.
         */
        setSelectedRecords: function( pRecords, pFocus, pNoNotify ) {
            var i,
                count = 0,
                rows = [],
                keys = {},
                table$ = this.tableFrozenData$ || this.tableData$;

            // can't set selected records before initialized or if selecting cells rather than rows
            if ( !table$ ) {
                return -1;
            }
            if ( this.options.selectCells ) {
                return -1;
            }
            for ( i = 0; i < pRecords.length; i++ ) {
                keys[this.model.getRecordId( pRecords[i] )] = true;
            }
            table$.children().each(function() {
                var row$ = $( this ),
                    id = row$.attr( ATTR_DATA_ID );

                if ( keys[id] ) {
                    rows.push( row$ );
                    count += 1;
                }
            });
            this.setSelection( rows, pFocus, pNoNotify );
            return count;
        },

        /**
         * todo document this
         * @ignore
         * @param pCell
         * @param pCallback
         */
        activateRow: function( pCell, pCallback) {
            var delay = false,
                row$ = pCell.parent(),
                id = row$.attr( ATTR_DATA_ID );

            function callback() {
                setTimeout( function() {
                    pCallback();
                }, 1 );
            }

            if ( !this.editMode || id !== this.activeRecordId) {
                this.element.one( "apexbeginrecordedit", function() {
                    callback();
                });
                delay = true;
            }
            pCell.focus();
            if ( !this.editMode ) {
                this.setEditMode( true );
            }
            if ( !delay ) {
                callback();
            }
        },

        /**
         * <p>Copies cell values from columns in the first selected row to all the other selected rows within the same
         * columns. If <code class="prettyprint">pColumns</code> is given only cells in the specified columns are copied down.
         * Only cells that can be written will be copied to. If the selection mode is row selection,
         * only visible columns that don't have <code class="prettyprint">noCopy</code> column property equal true are copied.</p>
         *
         * @param {array} [pColumns] An optional array of column names to copy down. The columns must be in the selection,
         *     visible, and writable.
         * @param {function} [pCallback] A no argument function that is called when the copy down operation is complete.
         */
        copyDownSelection: function( pColumns, pCallback ) {
            return this._setSelectionValues( 1, pColumns, pCallback );
        },

        /**
         * <p>Fills all cells in the current selection with the value <code class="prettyprint">pFillValue</code>.
         * If <code class="prettyprint">pColumns</code> is given only cells in the specified columns are filled.
         * Only cells that can be written will be filled. If the selection mode is row selection,
         * only visible columns that don't have <code class="prettyprint">noCopy</code> column property equal true are filled.</p>
         *
         * @param {string} pFillValue The value to fill cells with.
         * @param {array} [pColumns] An optional array of column names to fill. The columns must be in the selection,
         *     visible, and writable.
         * @param {function} [pCallback] A no argument function that is called when the fill operation is complete.
         */
        fillSelection: function( pFillValue, pColumns, pCallback ) {
            return this._setSelectionValues( 0, pColumns, pCallback, pFillValue );
        },

        /*
         * Common code for copyDownSelection and fillSelection
         * startRow is 0 or 1
         */
        _setSelectionValues: function( startRow, columns, callback, value ) {
            var selection, colInfo, cells$,
                self = this,
                wasInEditMode = this.editMode,
                lastFocused = this.lastFocused,
                curRow = 0,
                o = this.options;

            // uses cells$ creates colInfo
            function initColInfo() {
                // get values from fist row if startRow is 1, check columns are writable and get index into row cells
                colInfo = [];
                cells$.each( function( i ) {
                    var item,
                        cell$ = $( this ),
                        col = self._getColumnMetadata( cell$ );

                    if ( col && columns.indexOf( col.property ) >= 0 && col.elementId && !col.readonly ) {
                        item = self.columnItems[col.property].item;
                        colInfo.push( {
                            index: i,
                            item: item,
                            value: startRow === 1 ? item.getValue() : value
                        } );
                    }
                } );
                curRow = startRow;
                nextRow();
            }

            function nextRow() {
                var recordId, cell$;

                for(;;) {
                    if ( curRow >= selection.length || !colInfo.length ) {
                        if ( !wasInEditMode ) {
                            self.setEditMode( false ); // xxx might this be async?
                        }
                        // restore selection focus and callback
                        self.setSelection( selection );
                        $( lastFocused ).focus();
                        if ( callback ) {
                            callback();
                        }
                        break;
                    } else {
                        if ( curRow > 0 ) {
                            cells$ = o.selectCells ? selection[curRow] : selection[curRow].children();
                        }
                        curRow += 1;
                        // make sure row is editable
                        recordId = cells$.first().parent().attr( ATTR_DATA_ID );
                        if ( self.model.allowEdit( self.model.getRecord( recordId ) ) ) {
                            cell$ = cells$.first();
                            if ( o.rowHeader !== NONE && cells$.length >= 2 ) {
                                // don't focus the row header
                                cell$ = cells$.eq(1);
                            }
                            self.activateRow( cell$, processRow );
                            break;
                        } // else try next record
                    }
                }
            }

            function processRow() {
                var c, ci;

                for ( c = 0; c < colInfo.length; c++ ) {
                    ci = colInfo[c];
                    cells$.eq( ci.index ).focus();
                    ci.item.setValue( ci.value );
                }
                nextRow();
            }

            selection = this.getSelection();
            // fill requires at least 1 row, copyDown requires at least 2 rows
            if ( selection.length <= startRow ) {
                return false; // there is nothing to fill/copy down to
            }

            // if columns not given default them based on the type of selection or column configuration
            if ( !columns ) {
                columns = [];
                if ( o.selectCells ) {
                    // cell range selection
                    this.getSelectedRange().columns.forEach( function( c ) {
                        if ( c ) {
                            columns.push( c );
                        }
                    } );
                } else {
                    // row selection
                    this.columns.forEach( function( c ) {
                        var colName = c.property;
                        // default to all visible columns that are writable and copyable on duplicate
                        if ( colName && !c.hidden && !c.virtual && !c.noCopy && !self.model.isIdentityField( colName ) && c.elementId && !c.readonly ) {
                            columns.push( colName );
                        }
                    } );
                }
            }
            cells$ = o.selectCells ? selection[curRow] : selection[curRow].children();
            this.activateRow( cells$.first(), initColInfo );
            return true;
        },

        /**
         * Call this method anytime the container that the grid is in changes its size.
         * For better performance it is best to call this after the size has changed not continuously while it is changing.
         */
        resize: function() {
            var i, w, h, fw, headerHeight, col,
                ctrl$ = this.element,
                o = this.options,
                ctrlH = ctrl$.height(),
                ctrlW = ctrl$.width(),
                header$ = ctrl$.children( SEL_GRID_HEADER ),
                body$ = ctrl$.children( SEL_GRID_BODY );

            if ( ctrl$[0].offsetParent === null ) {
                // Grid is invisible so nothing to resize. Expect a resize or refresh later when made visible
                return;
            }
            if ( !body$.length || this.pendingRefresh ) {
                // grid was never initialized probably because it was initially invisible
                // or was refreshed while invisible. So do that now
                this.refresh();
                return; // because refresh calls resize
            }

            headerHeight = this.tableData$.prev().height();
            ctrl$.find( SEL_GRID_BODY + " .a-GV-table" ).css( "margin-top",
                -( headerHeight + parseInt( this.tableHeader$.find( "th" ).first().css( "border-bottom-width" ), 10) )  );

            w = ctrlW;
            if ( this.tableFrozenData$ ) {
                // need to set widths so the frozen and normal tables are side by side
                fw = this.tableFrozenData$.closest( SEL_GRID_WRAP_FROZEN ).width();
                ctrl$.find( SEL_GRID_WRAP_FROZEN ).width( fw ).toggleClass( "a-GV-w-frozen--showLabels", fw > FROZEN_LABEL_WIDTH );
                // when showing load more button in the frozen area don't show it in scrolling area
                this.tableData$.parent().parent().find( SEL_LOAD_MORE ).css( "visibility", fw > FROZEN_LABEL_WIDTH ? "hidden" : "visible" );
                w = w - fw;
            }
            ctrl$.find( SEL_GRID_WRAP_SCROLL + "," + SEL_GRID_WRAP_HEADER ).width( w );

            // refresh any sticky widgets that may be confused by the resize
            if ( $.apex.stickyWidget ) {
                ctrl$.find(".js-stickyWidget-toggle").stickyWidget("refresh");
            }

            if ( o.hasSize ) {
                h = ctrlH - header$.height() - this._footerHeight();
                body$.children( SEL_GRID_WRAP_SCROLL ).addBack().height( h );
                // _adjustSizeForScrollBars is done in _calculateColumnWidths
            }
            // if size shrinks reset widths or if hasSize because change in height could add scrollbar which affects width calculation
            // do this after the height is adjusted so scrollbars are known
            this._calculateColumnWidths( null, true, o.hasSize || this.tableData$.parent().width() > w );

            this._initPageSize();
            // todo if pagination is page and rowsPerPage is null (auto) consider refreshing so view reflects the correct number of rows. Beware infinite recursion
        },

        //
        // Control break methods
        //


        expandControlBreak: function( pRows ) {
            this._expandCollapseControlBreak( pRows, true );
        },

        collapseControlBreak: function( pRows ) {
            this._expandCollapseControlBreak( pRows, false );
        },

        //
        // Column methods
        //

        /**
         * <p>Get the column definitions in order.</p>
         * @return {Array} Array of column definition objects.
         * @example <caption>See {@link grid#unfreezeColumn} and @link grid#refreshColumns} for examples.</caption>
         */
        getColumns: function() {
            return this.columns;
        },

        /**
         * Let the grid know that column metadata has changed so that the next time it is refreshed columns will
         * be rendered. Call this method after any column metadata has changed external to this widget.
         * Refresh must be called after this but typically this happens due to the model refresh notification.
         * @example <caption>This example sets the minimum width of all columns to 100 and then refreshes the
         * columns and refresh the grid.</caption>
         * $( ".selector" ).grid( "getColumns" ).forEach( function( c ) { c.width = 100; } );
         * $( ".selector" ).grid( "refreshColumns" )
         *     .grid( "refresh" );
         */
        refreshColumns: function() {
            this.columnsStale = true; // mark columns stale so that refresh will recreate
        },

        /**
         * Sets the width of the given column.
         * Triggers {@link grid#event:columnresize} event.
         *
         * @param {string|Object} pColumn The column name or column definition object to set the width on.
         * @param {number} pWidth The width in pixels to set the column too.
         */
        setColumnWidth: function( pColumn, pWidth ) {
            var colInfo = this._updateColumnWidth( pColumn, pWidth, true );

            this._trigger( EVENT_COLUMN_RESIZE, null, {
                header$: colInfo[1], // col$
                column: colInfo[0], // col
                width: pWidth
            });
        },

        /**
         * Hide the given column. Also calls {@link grid#refreshColumns} and will render the whole grid.
         * See also {@link grid#showColumn}.
         * @param {string|Object} pColumn Column name or column definition object to hide.
         * @example <caption>This example hides column "NAME".</caption>
         * $( ".selector" ).grid( "hideColumn", "NAME" );
         */
        hideColumn: function( pColumn ) {
            var columnName = this._columnName( pColumn );
            this.options.columns[0][columnName].hidden = true;
            this._refreshGrid();
        },

        /**
         * Show the given column. Also calls {@link grid#refreshColumns} and will render the whole grid.
         * See also {@link grid#hideColumn}.
         * @param {string|Object} pColumn Column name or column definition object to show.
         * @example <caption>This example shows column "NAME".</caption>
         * $( ".selector" ).grid( "showColumn", "NAME" );
         */
        showColumn: function( pColumn ) {
            var columnName = this._columnName( pColumn );
            this.options.columns[0][columnName].hidden = false;
            this._refreshGrid();
        },

        /**
         * Freeze the given column. Also calls {@link grid#refreshColumns} and will render the whole grid.
         * See also {@link grid#unfreezeColumn}.
         * @param {string|Object} pColumn Column name or column definition object of the column to freeze.
         * @example <caption>This example freezes column "NAME".</caption>
         * $( ".selector" ).grid( "freezeColumn", "NAME" );
         * @example <caption>This example freezes the third column. It passes in a column definition object.</caption>
         * var columns = $( ".selector" ).grid( "getColumns" );
         * $( ".selector" ).grid( "freezeColumn", columns[3] );
         */
        freezeColumn: function( pColumn ) {
            var i, col,
                cols = this.columns,
                columnName = this._columnName( pColumn );

            for ( i = 0; i < cols.length; i++ ) {
                col = cols[i];
                // can never hide last column
                if ( i < cols.length - 1 ) {
                    col.frozen = true;
                }
                if ( col.property === columnName ) {
                    break;
                }
            }
            this._refreshGrid();
        },

        /**
         * Unfreeze the given column. Also calls {@link grid#refreshColumns} and will render the whole grid.
         * See also {@link grid#freezeColumn}.
         * @param {string|Object} pColumn column name or column definition object of the column to unfreeze.
         * @example <caption>This example unfreezes column "NAME".</caption>
         * $( ".selector" ).grid( "unfreezeColumn", "NAME" );
         */
        unfreezeColumn: function( pColumn ) {
            var i, col,
                columnName = this._columnName( pColumn );

            for ( i = this.columns.length - 1; i >= 0; i-- ) {
                col = this.columns[i];

                col.frozen = false;
                if ( col.property === columnName ) {
                    break;
                }
            }
            this._refreshGrid();
        },

        /**
         * Move the given column to the new position. Column positions are zero based.
         * Also calls {@link grid#refreshColumns} and will render the whole grid.
         * Triggers {@link grid#event:columnreorder} event.
         *
         * @param {string|Object} pColumn The column name or column definition object to move.
         * @param pNewPosition {number} index into the array returned by {@link grid#getColumns} where the column will be moved to.
         * @example <caption>This example moves the "NAME" column to be the third column.</caption>
         * $( ".selector" ).grid( "moveColumn", "NAME", 2 );
         */
        moveColumn: function( pColumn, pNewPosition ) {
            var ui = this._moveColumn( pColumn, pNewPosition );

            this._refreshGrid();
            ui.header$ = this._columnFromIndex( pNewPosition );
            this._trigger( EVENT_COLUMN_REORDER, null, ui );
        },

        /**
         * Move a column group from one position to another. This moves all the columns associated with
         * the group to the new position.
         * Triggers {@link grid#event:columnreorder} event for each column moved.
         *
         * @param pLevel {number} The level (starting with zero as the top most level) of the group.
         * @param pOriginalPosition {number} Original position of the column group
         * @param pNewPosition {number} New position of the column group
         */
        moveColumnGroup: function( pLevel, pOriginalPosition, pNewPosition ) {
            var i, colGroup, groups, start, end, dest, ui,
                uis = [];

            groups = this.columnGroups[pLevel];
            if ( !groups ) {
                throw new Error( "Invalid column group level: " + pLevel );
            }
            start = -1;
            for ( i = 0; i < groups.length; i++ ) {
                colGroup = groups[i];
                if ( i === pOriginalPosition ) {
                    start = colGroup.start;
                    end = colGroup.end;
                }
                if ( i === pNewPosition ) {
                    if ( start === -1 ) {
                        // the new position is before the original position
                        dest = colGroup.start;
                    } else {
                        // the new position is after the original position
                        dest = colGroup.end;
                    }
                }
            }
            // move each column
            if ( pNewPosition > pOriginalPosition ) {
                for ( i = start; i <= end; i++ ) {
                    ui = this._moveColumn( this.columns[start], dest );
                    ui.newPosition = dest - ( end - i );
                    ui.oldPosition = i;
                    uis.push( ui );
                    this._updateColumns();
                }
            } else {
                for ( i = end; i >= start; i-- ) {
                    ui = this._moveColumn( this.columns[end], dest );
                    ui.newPosition = dest + ( i - start );
                    ui.oldPosition = i;
                    uis.push( ui );
                    this._updateColumns();
                }
            }

            this._refreshGrid();
            for ( i = 0; i < uis.length; i++ ) {
                ui = uis[i];
                ui.header$ = this._columnFromIndex( ui.newPosition );
                this._trigger( EVENT_COLUMN_REORDER, null, ui );
            }
        },

        //
        // Internal methods
        //

        _refreshGrid: function() {
            var cell$;

            // if there is an active cell make sure it is deactivated before re-rendering
            // must do this before the column info is destroyed
            cell$ = this.element.find( SEL_ACTIVE_CELL );
            if ( cell$.length ) {
                this._deactivateCell( cell$ );
            }

            this.refreshColumns();
            this.refresh();
        },

        _cellFromColumn: function( row$, columnName ) {
            var i, column, col,
                cols = this.columns,
                o = this.options,
                cell$ = null,
                colIndex = 0;

            column = o.columns[0][columnName];
            if ( !column ) {
                debug.warn( "Warning column not found " + columnName );
                return null;
            } // else find the cell$

            if ( o.rowHeader !== NONE ) {
                colIndex = 1;
            }
            for ( i = 0; i < cols.length; i++ ) {
                col = cols[i];
                if ( col.hidden ) {
                    continue;
                }
                if ( col.property === columnName ) {
                    cell$ = row$.children().eq( colIndex );
                    break;
                }
                colIndex += 1;
            }
            if ( i >= cols.length ) {
                debug.warn( "Warning column is hidden " + columnName );
            }
            return cell$;
        },

        _columnFromIndex: function( columnIndex ) {
            // Note that because of the hidden but accessible column header on the main data table this returns
            // two elements!
            return this.element.find( ".a-GV-header[data-idx='" + columnIndex + "']" );
        },

        _columnName: function( column ) {
            var columnName;

            if ( typeof column === "object" ) {
                columnName = column.property;
            } else {
                columnName = column;
            }
            if ( !this.options.columns[0].hasOwnProperty( columnName ) ) {
                throw new Error( "Unknown column: " + columnName );
            }
            return columnName;
        },

        // returns notification data except for header$ which can't be known until after the grid is refreshed
        _moveColumn: function( pColumn, pNewPosition ) {
            var i, col, originalPos, seq,
                cols = this.columns,
                columnName = this._columnName( pColumn );

            originalPos = -1;
            for ( i = 0; i < cols.length; i++ ) {
                col = cols[i];
                if ( col.property === columnName ) {
                    originalPos = i;
                    break;
                }
            }

            seq = cols[pNewPosition].seq;
            if ( originalPos === pNewPosition ) {
                return; // nothing to do
            } else if ( originalPos < pNewPosition ) {
                // moving up - adjust column sequences
                for ( i = pNewPosition; i > originalPos; i-- ) {
                    cols[i].seq = cols[i - 1].seq;
                }
            } else {
                // moving down - adjust column sequences
                for ( i = pNewPosition; i < originalPos; i++ ) {
                    cols[i].seq = cols[i + 1].seq;
                }
            }
            cols[originalPos].frozen = ( pNewPosition <= this.lastFrozenColIndex );
            cols[originalPos].seq = seq;
            return {
                column: col,
                newPosition: pNewPosition,
                oldPosition: originalPos
            };
        },

        _updateColumns: function() {
            var i, lastIndex, col, colName, lastGroupRow, curGroupRow, curGroupIndex, curGroupName, curGroup, group,
                colIndex, noHeading, children,
                frozenGroups = {},
                o = this.options,
                optColumns = o.columns[0];

            this.columns = [];
            this.columnsStale = false;
            this.columnGroups = [];
            this.breakColumns = [];
            this.fieldToColumnIndex = {};

            // put the column definitions in an array
            for ( colName in optColumns) {
                if ( optColumns.hasOwnProperty( colName )) {
                    col = optColumns[colName];
                    col.property = colName;
                    col.domId = col.elementId ? col.elementId + "_HDR" : this.idPrefix + "_h_" + col.property;
                    // make sure there is a sequence value to sort by
                    col.seq = col.seq || "0";
                    this.columns.push( col );
                }
            }
            // and sort them by the seq[uence] property
            this.columns.sort(function(a, b) {
                return a.seq - b.seq;
            });

            // now count the frozen ones
            this.lastFrozenColIndex = -1;
            for ( i = 0; i < this.columns.length; i++ ) {
                col = this.columns[i];
                if ( col.hidden ) {
                    continue;
                }
                if ( col.frozen ) {
                    this.lastFrozenColIndex = i;
                } else {
                    break;
                }
            }

            // gather any control break columns and index by field/property name
            colIndex = o.rowHeader !== NONE ? 1 : 0; // account for row header which is a column in the DOM but not a column in the model
            for ( i = 0; i < this.columns.length; i++ ) {
                col = this.columns[i];
                if ( col.controlBreakIndex > 0 ) {
                    this.breakColumns.push( col );
                }
                if ( !col.hidden ) {
                    // to be very clear this is the index into the DOM cell in a DOM row (that includes both TRs) not this.columns
                    this.fieldToColumnIndex[col.property] = colIndex;
                    colIndex += 1;
                }
            }
            this.breakColumns.sort(function(a, b) {
                return a.controlBreakIndex - b.controlBreakIndex;
            });

            // add column groups if there are any
            curGroupRow = null;
            curGroupName = null;
            curGroup = null;
            noHeading = true;
            colIndex = 0;
            curGroupIndex = 0;
            lastIndex = 0;
            children = [];
            for ( i = 0; i < this.columns.length; i++ ) {
                col = this.columns[i];
                if ( col.hidden ) {
                    continue;
                }
                if ( curGroupRow === null ) {
                    curGroupRow = [];
                    this.columnGroups.push( curGroupRow );
                }
                group = effectiveGroupName( col );
                if ( group !== curGroupName || i === this.lastFrozenColIndex + 1 ) {
                    curGroupName = group;
                    if ( curGroup ) {
                        curGroup.span = colIndex - curGroupIndex;
                        curGroup.end = lastIndex;
                        curGroup.children = children;
                        children = [];
                    }
                    curGroupIndex = colIndex;
                    if ( group ) {
                        curGroup = $.extend({}, o.columnGroups[ group ]);
                        if ( curGroup ) {
                            if ( curGroup.heading ) {
                                noHeading = false;
                                if ( !frozenGroups[group] ) {
                                    curGroup.domId = this.idPrefix + "_g_" + group;
                                }
                            }
                            curGroup.property = group;
                            curGroupRow.push( curGroup );
                        } else {
                            throw new Error( "Unknown column group name: " + group );
                        }
                    } else {
                        curGroup = {};
                        curGroupRow.push( curGroup );
                    }
                    curGroup.start = i;
                    if ( i <= this.lastFrozenColIndex ) {
                        curGroup.frozen = true;
                        frozenGroups[group] = 1;
                    }
                }
                children.push(col);
                colIndex += 1;
                lastIndex = i;
                if ( curGroup === null ) {
                    curGroup = {
                        start: i
                    };
                    if ( this.lastFrozenColIndex >= 0 ) {
                        curGroup.frozen = true;
                    }
                    curGroupRow.push( curGroup );
                }
            }
            if ( curGroup ) {
                curGroup.span = colIndex - curGroupIndex;
                curGroup.end = lastIndex;
                curGroup.children = children;
            }
            if ( noHeading ) {
                this.columnGroups = [];
                curGroupRow = null;
            }

            // column groups can have parent groups so add those
            while ( curGroupRow ) {
                lastGroupRow = curGroupRow;
                curGroupRow = null;
                curGroupName = null;
                curGroup = null;
                noHeading = true;
                colIndex = 0;
                children = [];
                for ( i = 0; i < lastGroupRow.length; i++ ) {
                    col = lastGroupRow[i];
                    group = col.parentGroupName || null;
                    if ( group !== curGroupName || col.frozen !== ( curGroup ? curGroup.frozen: false ) ) {
                        curGroupName = group;
                        if ( curGroupRow === null ) {
                            curGroupRow = [];
                            this.columnGroups.unshift( curGroupRow );
                            if ( colIndex > 0 ) {
                                curGroup = {};
                                if ( col.frozen ) {
                                    curGroup.frozen = true;
                                }
                                curGroupRow.push( curGroup );
                            }
                        }
                        if ( curGroup ) {
                            curGroup.span = colIndex - curGroupIndex;
                            curGroup.children = children;
                            children = [];
                        }

                        curGroupIndex = colIndex;
                        if ( group ) {
                            curGroup = $.extend({}, o.columnGroups[group]);
                            if ( curGroup ) {
                                if ( curGroup.heading ) {
                                    noHeading = false;
                                    if ( !frozenGroups[group] ) {
                                        curGroup.domId = this.idPrefix + "_g_" + group;
                                    }
                                }
                                curGroup.property = group;
                                curGroupRow.push( curGroup );
                            } else {
                                throw new Error( "Unknown column group name: " + group );
                            }
                        } else {
                            curGroup = {};
                            curGroupRow.push( curGroup );
                        }
                        curGroup.start = col.start;
                        if ( col.frozen ) {
                            curGroup.frozen = true;
                            frozenGroups[group] = 1;
                        }
                    }
                    children.push(col);
                    curGroup.end = col.end;
                    colIndex += col.span;
                }
                if ( curGroup ) {
                    curGroup.span = colIndex - curGroupIndex;
                    curGroup.end = col.end;
                    curGroup.children = children;
                }
                if ( noHeading ) {
                    this.columnGroups.shift();
                    curGroupRow = null;
                }
            }
        },

        _initGrid: function() {
            var hdr$, main$, frzn$, body$, row$, traps$, floatingTrap, endTrap, dataCols$, dataCellCols$, swOpt, loadMore$,
                hammer, panStart, lastTime, momentumVelocity, w,
                curScrollLeft = 0, curScrollTop = 0, lastScrollLeft = 0, lastScrollTop = 0,
                timerID = null,
                self = this,
                scrollEvent = "scroll.gvss",
                o = this.options,
                ctrl$ = this.element,
                checkboxClass = "a-GV-table--checkbox";

            function syncScroll() {
                if ( curScrollLeft !== lastScrollLeft ) {
                    hdr$[0].scrollLeft = curScrollLeft = lastScrollLeft;
                    main$[0].scrollLeft = curScrollLeft;
                    loadMore$.css( "left", curScrollLeft );
                }
                if ( curScrollTop !== lastScrollTop ) {
                    curScrollTop = lastScrollTop;
                    frzn$.prop("scrollTop", curScrollTop); // use prop because frzn$ may not exist
                    main$[0].scrollTop = curScrollTop;
                }
                timerID = null;
            }

            function vScrollMomentum( t ) {
                var d, dt;

                if ( lastTime ) {
                    dt = t - lastTime;
                    d = momentumVelocity * dt;
                    momentumVelocity = momentumVelocity / 1.6; // apply drag
                    if ( d > -2 && d < 2 ) {
                        momentumVelocity = 0;
                        return; // no more scrolling
                    }
                    frzn$[0].scrollTop = main$[0].scrollTop = curScrollTop = lastScrollTop = frzn$[0].scrollTop - d;
                }
                lastTime = t;
                invokeAfterPaint( vScrollMomentum );
            }

            debug.info("Grid render and initialize.");

            this._updateColumns();
            if ( !this.columnItems ) {
                this._initColumnItems( this.columns ); // just do this once
            }
            this._renderGrid();
            // after the rendering any anchors or buttons (any tab stop) in column headings need to have the tabstop disabled
            ctrl$.find( SEL_GRID_HEADER + " " + SEL_TABBABLE ).prop( "tabIndex", -1 );

            if ( o.tooltip ) {
                this._initTooltips( o.tooltip );
            }

            if ( o.rowHeader !== NONE && o.rowHeaderCheckbox ) {
                this.tableFrozenHeader$.parent().addClass( checkboxClass );
                this.tableFrozenData$.parent().addClass( checkboxClass );
            }

            hdr$ = ctrl$.find( SEL_GRID_WRAP_HEADER );
            main$ = ctrl$.find( SEL_GRID_WRAP_SCROLL );
            frzn$ = ctrl$.find( SEL_GRID_WRAP_FROZEN ).last();

            // Some columns have an explicit width and other do not. For columns without a width use what the initial
            // auto width table assigns and apply that to the column
            body$ = ctrl$.children( SEL_GRID_BODY );
            dataCols$ = body$.find( "col" );
            dataCellCols$ = body$.find( "thead" ).find( ".a-GV-header" );

            // take frozen area and scroll bar into account so the initial auto column width is accurate (bug 26171679)
            w = this.tableData$.width() - util.getScrollbarSize().width;
            if ( this.tableFrozenData$ ) {
                w -= this.tableFrozenData$.width();
            }
            hdr$.add( main$ ).width( w );

            dataCols$.each(function( i ) {
                var col$ = $( this ),
                    col = self.columns[ col$.attr(ATTR_DATA_IDX) ];

                if ( col ) {
                    if ( col.width ) {
                        col.curWidth = col.width;
                    } else {
                        col.curWidth = col.defWidth = dataCellCols$.eq( i ).width();
                    }
                    if ( col.curWidth < MIN_COL_WIDTH ) {
                        col.curWidth = MIN_COL_WIDTH;
                    }
                }
            });
            // The column widths will be calculated and set when the widget is resized which happens soon

            // coordinate the scrolling of the various areas
            loadMore$ = this.tableData$.parent().parent().find( SEL_LOAD_MORE );
            main$.on( scrollEvent, function() {
                lastScrollLeft = this.scrollLeft;
                lastScrollTop = this.scrollTop;
                if ( !timerID ) {
                    timerID = invokeAfterPaint( syncScroll );
                }
            });
            hdr$.on( scrollEvent, function() {
                lastScrollLeft = this.scrollLeft;
                if ( !timerID ) {
                    timerID = invokeAfterPaint( syncScroll );
                }
            });
            frzn$.on( scrollEvent, function() {
                lastScrollTop = this.scrollTop;
                if ( !timerID ) {
                    timerID = invokeAfterPaint( syncScroll );
                }
            });

            if ( o.hasSize && frzn$.length ) {

                frzn$.on( gWheelEvent, function( event ) {
                    var deltaY = event.originalEvent.deltaY || event.originalEvent.detail || ( - 1/40 * event.originalEvent.wheelDelta );

                    if ( event.originalEvent.deltaMode === undefined || event.originalEvent.deltaMode === 1 ) {
                        deltaY = deltaY * 30;
                    }
                    lastScrollTop = this.scrollTop + deltaY;
                    if ( !timerID ) {
                        timerID = invokeAfterPaint( syncScroll );
                    }
                    event.preventDefault();
                } );

                // Allow touch to scroll (pan) in the frozen area only if user is using touch device
                // because it includes mouse support and that seems odd that the mouse (click drag) can be used to pan
                if ( apex.userHasTouched() ) {
                    hammer = new Hammer( frzn$[0] );

                    hammer.get( 'pan' ).set( {direction: Hammer.DIRECTION_VERTICAL} );

                    hammer.on( "panup pandown", function ( ev ) {
                        lastScrollTop = panStart - ev.deltaY;
                        if ( !timerID ) {
                            timerID = invokeAfterPaint( syncScroll );
                        }
                        // cancel any previous momentum
                        momentumVelocity = 0;
                        // handle inertia/momentum
                        if ( ev.isFinal && ( ev.velocityY >= 0.1 || ev.velocityY <= -0.1 ) ) {
                            lastTime = 0;
                            momentumVelocity = ev.velocityY;
                            invokeAfterPaint( vScrollMomentum );
                        }
                    } );
                    hammer.on( "panstart", function ( ev ) {
                        panStart = frzn$[0].scrollTop;
                    } );
                }
            }

            traps$ = this.element.find( SEL_TAB_TRAP );
            this.tabTraps$ = traps$;
            // The expected visual tabbing order between the frozen and non frozen cells does not match the DOM tabbing
            // order so these invisible tab traps capture the focus and redirect focus to the correct place.
            // There are either 2 or 6 traps. If there are frozen columns then 6 else 2. The floating edit traps are
            // always last.
            if ( traps$.length === 2 ) {
                floatingTrap = 0; // this is the case where autoAddRecord is false and there are no frozen columns
            } else {
                if ( traps$.length === 3 ) {
                    floatingTrap = 1; // this is the case where autoAddRecord is true and there are no frozen columns
                    endTrap = 0;
                } else {
                    // else there are frozen columns so 6 traps
                    floatingTrap = 4;
                    endTrap = 3;
                    traps$.eq( 0 ).on( "focus", function() {
                        self.tableData$.find( SEL_TABBABLE ).first().focus();
                    });
                    traps$.eq( 1 ).on( "focus", function() {
                        self.tableData$.find( SEL_TABBABLE ).last().focus();
                    });
                    traps$.eq( 2 ).on( "focus", function() {
                        self.tableFrozenData$.find( SEL_TABBABLE ).first().focus();
                    });
                }
                traps$.eq( endTrap ).on( "focus", function() {
                    if ( $( this ).hasClass( C_AUTO_ADD ) ) {
                        self._autoAddRecord( self.activeRecord );
                    } else {
                        self.tableFrozenData$.find( SEL_TABBABLE ).last().focus();
                    }
                });
            }
            traps$.eq( floatingTrap ).on( "focus", function() {
                var allTabs$, gridTab$,
                    tableData$ = $( self.lastEditModeCell ).closest( "tbody" ),
                    ts$ = tableData$.find( SEL_TABBABLE ).add( self.lastEditModeCell ),
                    index = ts$.index( self.lastEditModeCell );

                if ( index > 0 ) {
                    ts$.first().focus();
                } else if ( self.tableFrozenData$ && traps$.eq( 0 ).prop( "tabIndex" ) === 0 ) {
                    // need to focus in the other table
                    tableData$ = tableData$[0] === self.tableFrozenData$[0] ? self.tableData$ : self.tableFrozenData$;
                    tableData$.find( SEL_TABBABLE ).first().focus();
                } else {
                    // in this case need to focus the tabbable element just before the grid
                    allTabs$ = $( SEL_TABBABLE );
                    gridTab$ = self.element.find( SEL_TABBABLE ).first();
                    index = allTabs$.index( gridTab$ );
                    allTabs$.eq( index - 1 ).focus();
                }
            });
            traps$.eq( floatingTrap + 1 ).on( "focus", function() {
                var tableData$ = $( self.lastEditModeCell ).closest( "tbody" ),
                    ts$ = tableData$.find( SEL_TABBABLE ).add( self.lastEditModeCell ),
                    index = ts$.index( self.lastEditModeCell );

                if ( $( this ).hasClass( C_AUTO_ADD ) ) {
                    self._autoAddRecord( self.activeRecord );
                } else if ( index < ts$.length - 1 ) {
                    ts$.last().focus();
                } else if ( self.tableFrozenData$ ) {
                    // need to focus in the other table
                    tableData$ = tableData$[0] === self.tableFrozenData$[0] ? self.tableData$ : self.tableFrozenData$;
                    tableData$.find( SEL_TABBABLE ).last().focus();
                }
            });
            // traps are not used until a cell is activated
            traps$.prop( "tabIndex", -1 );

            if ( o.reorderColumns ) {
                this._initColumnReorder();
            }

            this.columnWidthHandle$ = $(); // default to no column width handle
            if ( o.resizeColumns ) {
                this._initColumnResize();
            }

            this.columnControls$.on( "click", "button", function( event ) {
                var target$ = $( event.target );

                self._sortChange( event, target$.closest( SEL_GRID_COL_HEADER ),
                    target$.closest( "button" ).hasClass("js-asc") ? "asc" : "desc");
            } );

            function expandCollapse() {
                var cell$ = self.element.find( SEL_ACTIVE_CELL );

                if ( self.floatingItem$.hasClass( C_EXPANDED )) {
                    self._collapseFloatingItem( cell$ );
                } else {
                    self._expandFloatingItem( cell$ );
                }
            }

            this.floatingItem$.draggable( {
                handle: ".a-GV-cellMoveHandle",
                containment: "document"
            } ).on( "keydown", function( event ) {
                if ( event.ctrlKey && event.which === 117 ) {// Ctrl+F6
                    expandCollapse();
                    return false;
                }
            }).children( ".a-GV-expandCollapse" ).click( expandCollapse );
            widgetUtil.TouchProxy.addTouchListeners( this.floatingItem$[0] );

            this._initPaginationFooter( main$ );

            // if the region has no defined height and the stickyWidget is available then stick the
            // column headers to the top of the page and/or the footer to the bottom of the page
            if ( !o.hasSize && o.stickyTop && $.apex.stickyWidget ) {
                swOpt = {
                    stickToEnd: true,
                    toggleWidth: true, // xxx needed?
                    bottom: function() {
                        return ctrl$.offset().top + ctrl$.outerHeight() - self._footerHeight();
                    }
                };
                if ( $.isFunction( o.stickyTop ) ) {
                    swOpt.top = o.stickyTop;
                }
                // overflow hidden so that header controls don't cause horizontal scrollbar. (case 2 of bug 26171679)
                ctrl$.find( SEL_GRID_HEADER ).css( "overflow", "hidden" ).stickyWidget( swOpt );
            }

            if ( this.breakColumns.length > 0 ) {
                ctrl$.find( SEL_GRID_BODY ).on( "click", ".js-toggleBreak", function() {
                    row$ = $( this ).closest( "." + C_CONTROL_BREAK );
                    self._expandCollapseControlBreak( [row$], !row$.hasClass( C_EXPANDED ) );
                });
            }
        },

        _initColumnReorder: function() {
            var mTop, hTop, columnOffsets, row$, lastColumnIndex, headerPos, zIndex, position, offsetAdjust, markerAdjust,
                oldPos, helperWidth, scrollOffset, handleMargin,
                rtl = this.element.hasClass( C_RTL ),
                header$ = this.element.find( SEL_GRID_HEADER ),
                self = this;

            header$.append( this.columnMoveMarker$ );
            handleMargin = parseInt( self.columnHandle$.css( "margin-left" ), 10 );
            if ( rtl ) {
                handleMargin = -handleMargin;
            }

            // enable the column and column group headings to be draggable
            self.columnHandle$.draggable({
                appendTo: this.element,
                containment: header$,
                cursor: "move",
                cursorAt: rtl ? { right: -2 * handleMargin } : { left: 0 },
                axis: "x",
                delay: 100,
                distance: 4,
                helper: function() {
                    var helper$ = $( "<div class='a-GV-header-dragHelper'></div>" ),
                        cell$ = self.columnReorderCell$;
                    // add copy of handel and label to drag helper
                    helper$.append( cell$.find( ".a-GV-headerLabel,." + C_GRID_COL_HANDLE ).clone() );
                    helper$.width( cell$.outerWidth() ); // height is set with css
                    return helper$;
                },
                start: function( event, ui ) {
                    self.columnControls$.hide();
                    // send this event in the hopes that any popup related to the column header will be closed
                    self._trigger( EVENT_CANCEL_COLUMN_HEADER, event, {});
                    // figuring out how to position the helper and new column marker is tricky because of
                    // the different ways the header is positioned
                    mTop = self.columnReorderCell$.parent().offset().top - self.element.offset().top;
                    hTop = mTop + self.element[0].offsetTop;
                    headerPos = header$.css( "position" );
                    position = "absolute";
                    zIndex = 2;
                    offsetAdjust = -header$.offset().left;
                    if ( headerPos !== "relative" ) {
                        if ( headerPos === "fixed" ) {
                            offsetAdjust = 0;
                            mTop = hTop = self.columnReorderCell$.parent()[0].offsetTop + header$[0].offsetTop;
                            position = "fixed";
                            ui.helper.css( "margin-left", self.element.offset().left + "px" );
                        }
                        zIndex = parseInt( header$.css("z-index"), 10 ) + 1;
                    }
                    markerAdjust = -self.columnMoveMarker$.width() / 2;
                    ui.helper.css( {
                        "top": hTop + "px",
                        "position": position,
                        "z-index": zIndex
                    } );
                    helperWidth = ui.helper.outerWidth();
                    self.columnMoveMarker$.show().css( {
                        "top": mTop + "px",
                        "left": ( self.columnReorderCell$.offset().left + offsetAdjust + ( rtl ? self.columnReorderCell$.width() : 0 ) ) + "px",
                        "position": position,
                        "z-index": zIndex
                    } );
                    // hide the cell content
                    self.columnReorderCell$.find( ".a-GV-headerLabel,.a-GV-header-sort" ).hide();
                    self.columnHandle$.hide();
                    self.columnWidthHandle$.hide();
                    escapeOn(function() {
                        self.columnReorderCancel = true;
                    });

                    // remember which column is moving
                    oldPos = parseInt( self.columnReorderCell$.attr( ATTR_DATA_IDX ), 10 );

                    // setup to scroll as needed when drag near boundaries
                    self.hdrScrollParent = self.element.find( SEL_GRID_WRAP_HEADER )[0];
                    scrollOffset = self.hdrScrollParent.scrollLeft;

                    // gather column offsets
                    columnOffsets = [];
                    lastColumnIndex = null;
                    row$ = self._getRowForCell( self.columnReorderCell$ );
                    row$.children().each( function() {
                        var col$ = $( this ),
                            frozen = true,
                            offset = col$.offset().left + offsetAdjust;

                        if ( col$.parent().parent().parent().parent()[0] === self.hdrScrollParent ) {
                            offset += scrollOffset;
                            frozen = false;
                        }
                        columnOffsets.push( {
                            colIdx: parseInt( col$.attr( ATTR_DATA_IDX ), 10),
                            start:  offset,
                            end: offset + col$.outerWidth(),
                            frozen: frozen
                        } );
                    } );

                    self.columnReordering = true;
                    self.columnReorderCancel = false;
                },
                drag: function( event, ui ) {
                    var sl = self.hdrScrollParent.scrollLeft,
                        origLeft = parseInt( self.columnMoveMarker$.css( "left" ), 10);

                    function updateMarker() {
                        var i, col, newOffset,
                            moved = false,
                            // during drag we use event.pageX - handleMargin rather than ui.offset.left so that when the
                            // helper bumps up against the container the point to check against the columns changes
                            // this allows for example a wide column to be moved to the very end.
                            cur = ( event.pageX - handleMargin ) + offsetAdjust + self.hdrScrollParent.scrollLeft;

                        // check the positions and move the insertion marker
                        for ( i = 0; i < columnOffsets.length; i++ ) {
                            col = columnOffsets[i];
                            if ( cur >= col.start && cur < col.end ) {
                                if ( i !== lastColumnIndex ) {
                                    lastColumnIndex = i;
                                    if ( rtl ) {
                                        newOffset = ( col.colIdx < oldPos ? col.end : col.start ) + markerAdjust;
                                    } else {
                                        newOffset = ( col.colIdx < oldPos ? col.start : col.end ) + markerAdjust;
                                    }
                                    if ( !col.frozen ) {
                                        newOffset -= self.hdrScrollParent.scrollLeft;
                                    }
                                    origLeft = newOffset;
                                    sl = self.hdrScrollParent.scrollLeft;
                                    self.columnMoveMarker$.css( "left", newOffset + "px" );
                                    moved = true;
                                }
                                break;
                            }
                        }
                        // if the header has scrolled need to move the marker to match
                        if ( !moved && sl !== self.hdrScrollParent.scrollLeft ) {
                            newOffset = origLeft - ( self.hdrScrollParent.scrollLeft - sl );
                            self.columnMoveMarker$.css( "left", newOffset + "px" );
                        }
                    }

                    if ( self.columnReorderCancel ) {
                        event.preventDefault();
                        return;
                    }

                    updateMarker();
                    // Need to manually scroll. Draggable scrolling doesn't work because the header
                    // is overflow hidden and scrolls because of the table body scroll bar
                    // start or stop scrolling as needed. The actual scrolling happens from a timer
                    if ( self._headerScrollCheck( event.pageX - handleMargin, helperWidth ) ) {
                        if ( !self.scrollTimerId ) {
                            self._headerScrollStart( event.pageX - handleMargin, helperWidth, updateMarker );
                        }
                    } else {
                        if ( self.scrollTimerId ) {
                            self._headerScrollStop();
                        }
                    }
                },
                stop: function( event, ui ) {
                    var newPos = null;

                    // check the positions and move the insertion marker and do the move
                    if ( lastColumnIndex !== null ) {
                        newPos = columnOffsets[lastColumnIndex].colIdx;
                    }
                    if ( isNaN( newPos ) && lastColumnIndex + 1 < columnOffsets.length ) {
                        // must be over the row selector header skip to the next column
                        newPos = columnOffsets[lastColumnIndex + 1].colIdx;
                    }
                    if ( isNaN( newPos ) ) {
                        return;
                    }
                    self.columnReordering = false;
                    self.columnReorderCell$.find( ".a-GV-headerLabel,.a-GV-header-sort" ).show();
                    if ( newPos === oldPos ) {
                        self.columnHandle$.show();
                        self.columnWidthHandle$.show();
                        self.columnControls$.show();
                    }
                    self.columnMoveMarker$.hide();
                    self.lastHoverCell = null; // force recalculating what to show on next mouse move
                    escapeOff();
                    if ( self.scrollTimerId ) {
                        self._headerScrollStop();
                    }
                    if ( self.columnReorderCancel || newPos === null || newPos === oldPos ) {
                        return;
                    }

                    if ( self.columnReorderCell$.hasClass( C_GRID_COL_GROUP ) ) {
                        self.moveColumnGroup( domIndex( row$ ), oldPos, newPos );
                    } else {
                        self.moveColumn( self.columns[oldPos], newPos );
                    }
                    self.focus();
                }
            });
            widgetUtil.TouchProxy.addTouchListeners( self.columnHandle$[0] );
        },

        _initColumnResize: function() {
            var helperWidth, startScrollOffset, isFrozen,
                self = this,
                dir = this.element.hasClass( C_RTL ) ? -1 : 1,
                header$ = this.element.find( SEL_GRID_HEADER ),
                row$ = header$.find( SEL_ROW ).last();

            this.columnWidthHandle$ = $( "<div class='a-GV-columnWidthHandle'></div>" )
                .appendTo( header$ )
                .css( "top", row$[0].offsetTop )
                .height( row$.height() );
            this.columnWidthHandle$.draggable({
                axis: "x",
                containment: header$,
                start: function( event, ui ) {
                    self.columnWidthDragging = true;
                    self.columnWidthCancel = false;
                    self.columnWidthStartPos = ui.position.left;
                    self.columnWidthStartWidth = self.columnWidthCell$.first().outerWidth();
                    helperWidth = ui.helper.outerWidth();
                    // setup to scroll as needed when drag near boundaries
                    self.hdrScrollParent = self.element.find( SEL_GRID_WRAP_HEADER )[0];
                    isFrozen = self.columnWidthCell$.parent().parent().parent().parent()[0] !== self.hdrScrollParent;
                    startScrollOffset = self.hdrScrollParent.scrollLeft;
                    escapeOn(function() {
                        self.columnWidthCancel = true;
                    });
                },
                drag: function( event, ui ) {

                    function updateWidth( scroll ) {
                        var spWidth, deltaW,
                            width = self.columnWidthStartWidth +
                                dir * ( ui.position.left - self.columnWidthStartPos );

                        spWidth = self.hdrScrollParent.scrollWidth;
                        if ( !isFrozen ) {
                            width += ( self.hdrScrollParent.scrollLeft - startScrollOffset );
                        }

                        if ( width > MIN_COL_WIDTH ) {
                            if ( self.columnWidthCell$.hasClass( C_GRID_SEL_HEADER ) ) {
                                self.rowHeaderWidth = width;
                                self._calculateColumnWidths();
                            } else {
                                // update the width but without notification
                                self._updateColumnWidth( self._getColumnMetadata( self.columnWidthCell$.first() ), width );
                            }
                        }
                        // this is an attempt to make shrinking the width of a column that is at the right edge of the
                        // view port resize better
                        deltaW = self.hdrScrollParent.scrollWidth - spWidth;
                        if ( deltaW < 0 && !scroll && self.hdrScrollParent.scrollLeft !== startScrollOffset) {
                            self.hdrScrollParent.scrollLeft += deltaW;
                            startScrollOffset += deltaW;
                        }
                    }

                    if ( self.columnWidthCancel ) {
                        event.preventDefault();
                        return;
                    }

                    // Need to manually scroll. Draggable scrolling doesn't work because the header
                    // is overflow hidden and scrolls because of the table body scroll bar
                    // start or stop scrolling as needed. The actual scrolling happens from a timer
                    updateWidth();
                    if ( self._headerScrollCheck( ui.offset.left, helperWidth )) {
                        if ( !self.scrollTimerId ) {
                            self._headerScrollStart( ui.offset.left, helperWidth, function() { updateWidth( true ); } );
                        }
                    } else {
                        if ( self.scrollTimerId ) {
                            self._headerScrollStop();
                        }
                    }
                },
                stop: function( event, ui ) {
                    var width = self.columnWidthStartWidth +
                            dir * ( ui.position.left - self.columnWidthStartPos );

                    if ( !isFrozen ) {
                        width += ( self.hdrScrollParent.scrollLeft - startScrollOffset );
                    }

                    self.columnWidthDragging = false;
                    escapeOff();
                    if ( self.scrollTimerId ) {
                        self._headerScrollStop();
                    }
                    if ( self.columnWidthCancel ) {
                        width = self.columnWidthStartWidth;
                    }
                    if ( width < MIN_COL_WIDTH ) {
                        width = MIN_COL_WIDTH;
                    }

                    if ( self.columnWidthCell$.hasClass( C_GRID_SEL_HEADER ) ) {
                        self.rowHeaderWidth = width;
                        self._calculateColumnWidths( null, true );
                    } else {
                        // set width one more time with notification
                        self.setColumnWidth( self._getColumnMetadata( self.columnWidthCell$.first() ), width );
                    }
                }
            });
            widgetUtil.TouchProxy.addTouchListeners( this.columnWidthHandle$[0] );
        },

        _updateColumnWidth: function( pColumn, pWidth, finalSet ) {
            var col, col$, index,
                columnName = this._columnName( pColumn );

            col = this.options.columns[0][columnName];
            col.width = pWidth;
            col.curWidth = pWidth;
            index = this.columns.indexOf( col );
            col$ = this._columnFromIndex( index );
            this._calculateColumnWidths( col$, finalSet );

            return [col, col$];
        },

        // all args are optional
        _calculateColumnWidths: function( col$, finalSet, resetWidths ) {
            var i, col, w, fw, availWidth, affectedTable, body$, extra, remainingWidth, setColumn,
                headerHeight, frozenHeaderHeight,
                hasSize = this.options.hasSize,
                ctrl$ = this.element,
                self = this;

            function lastVisibleColumn( start ) {
                var i, col;

                for ( i = start + 1; i < self.columns.length; i++ ) {
                    col = self.columns[i];
                    if ( !col.hidden && !col.noStretch && i !== setColumn ) {
                        return false;
                    }
                }
                return true;
            }

            function adjustTableColumnWidths( data$, header$ ) {
                var tableWidth,
                    headerCols$ = header$.parent().find( "col" ),
                    dataCols$ = data$.parent().find( "col" );

                tableWidth = 0;
                dataCols$.each(function( i ) {
                    var w, col, col$ = $( this ),
                        colIndex = col$.attr( ATTR_DATA_IDX );

                    if ( colIndex ) {
                        col = self.columns[ colIndex ];
                        w = col.curWidth;
                    } else {
                        w = self.rowHeaderWidth;
                    }
                    col$[0].width = w;
                    headerCols$[i].width = w;
                    tableWidth += w;
                });
                header$.parent().width( tableWidth );
                data$.parent().width( tableWidth );
                return tableWidth;
            }

            if ( resetWidths ) {
                for ( i = 0; i < this.columns.length; i++ ) {
                    col = this.columns[i];
                    col.curWidth = col.width || col.defWidth;
                    if ( col.curWidth < MIN_COL_WIDTH ) {
                        col.curWidth = MIN_COL_WIDTH;
                    }
                }
            }

            // clear any previous set header height
            if ( finalSet && this.tableFrozenHeader$ ) {
                this.tableData$.prev()
                    .add( this.tableFrozenData$.prev() )
                    .add( this.tableHeader$ )
                    .add( this.tableFrozenHeader$ ).each( function() {
                    $(this).find( SEL_GRID_COL_HEADER ).first().css( "height", "" );
                } );
            }

            if ( col$ ) {
                affectedTable = col$.parent().parent()[0];
                setColumn = parseInt( col$.attr( ATTR_DATA_IDX ), 10 );
            }

            // if there are frozen columns and no specific column or if calculation is due to a particular column and that column is frozen
            if ( this.tableFrozenData$ && ( !affectedTable || affectedTable === this.tableFrozenHeader$[0] ) ) {
                adjustTableColumnWidths( this.tableFrozenData$, this.tableFrozenHeader$ );
                // need to set widths so the frozen and normal tables are side by side
                // this is also done in resize
                fw = this.tableFrozenData$.parent().outerWidth();
                ctrl$.find( SEL_GRID_WRAP_FROZEN ).width( fw );
                w = ctrl$.width() - fw;
                ctrl$.find( SEL_GRID_WRAP_SCROLL + "," + SEL_GRID_WRAP_HEADER ).width( w );
            }

            // if no specific column or calculation is due to a particular column and that column is not frozen
            if ( !affectedTable || affectedTable === this.tableHeader$[0] ) {
                w = adjustTableColumnWidths( this.tableData$, this.tableHeader$ );
            } else {
                w = this.tableData$.parent().width();
            }

            if ( finalSet ) {
                availWidth = ctrl$.find( SEL_GRID_WRAP_SCROLL )[0].clientWidth;
                // Want to know if there *will* be a scrollbar once rows are rendered. This is called first before
                // rows are rendered (when there is no scrollbar) and after (when there may or may not be).
                // Easier to expand the widths than to contract so assume there will be a scrollbar when there is
                // no data if heading fixed to region. When headers stick to the page there should never be a
                // vertical scrollbar - the region should never be given a height.
                if ( hasSize && this.tableData$.children().length === 0 ) {
                    // assume there will be a vertical scrollbar so subtract it from available width
                    availWidth -= util.getScrollbarSize().width;
                }
                if ( w < availWidth ) {
                    availWidth = availWidth - w - 1;
                    if ( availWidth > 10 ) {
                        // there is enough available width to distribute it among all the columns
                        remainingWidth = availWidth;
                        for ( i = 0; i < this.columns.length; i++ ) {
                            col = this.columns[i];
                            if ( col.hidden || col.frozen || col.noStretch || i === setColumn ) {
                                continue;
                            }
                            if ( lastVisibleColumn( i ) ) {
                                // use remainingWidth so there are no rounding errors to cause a gap
                                col.curWidth += remainingWidth;
                            } else {
                                extra = Math.floor( availWidth * ( col.curWidth / w ) );
                                col.curWidth += extra;
                                remainingWidth -= extra;
                            }
                        }
                    } else {
                        // just give it to the last visible column that can be stretched
                        for ( i = this.columns.length - 1; i > 0; i-- ) {
                            col = this.columns[i];
                            if ( col.hidden || col.frozen || col.noStretch || i === setColumn ) {
                                continue;
                            }
                            col.curWidth = col.curWidth + availWidth;
                            break;
                        }
                    }
                    adjustTableColumnWidths( this.tableData$, this.tableHeader$ );
                }

                // adjust height of header if needed
                if ( this.tableFrozenHeader$ ) {
                    frozenHeaderHeight = this.tableFrozenHeader$.find( SEL_GRID_COL_HEADER ).outerHeight();
                    headerHeight = this.tableHeader$.find( SEL_GRID_COL_HEADER ).outerHeight();
                    if ( frozenHeaderHeight !== headerHeight ) {
                        headerHeight = Math.max( frozenHeaderHeight, headerHeight );
                        this.tableData$.prev()
                            .add( this.tableFrozenData$.prev() )
                            .add( this.tableHeader$ )
                            .add( this.tableFrozenHeader$ ).each( function() {
                                $(this).find( SEL_GRID_COL_HEADER ).first().css( "height", headerHeight + "px" );
                            } );
                    }
                }
            }

            if ( hasSize ) {
                body$ = ctrl$.children( SEL_GRID_BODY );
                this._adjustSizeForScrollBars( body$.height(),
                    body$.find( SEL_GRID_WRAP_SCROLL ).width() );
            }
        },

        _renderGrid: function() {
            var i, tb$, hasFrozenColumns, numSortColumns,
                self = this,
                ctrl$ = this.element,
                o = this.options,
                out = util.htmlBuilder(),
                BEGIN_TABLE = "<table role='presentation' class='" + C_GRID_TABLE + "'>",
                BEGIN_THEAD = "<thead role='rowgroup'>",
                // the tab traps help implement tabbing between rows when there is frozen columns
                // use a span rather than an input to avoid confusion by assistive technology
                TAB_TRAP = "<span class='" + C_TAB_TRAP + " u-vh is-focusable' aria-hidden='true' tabindex='-1'></span>";

            function renderColumns( out, frozen ) {
                var i, col;

                if ( frozen && o.rowHeader !== NONE ) {
                    out.markup( "<col" )
                        .optionalAttr( "width", self.rowHeaderWidth )
                        .markup( "/>" );
                }
                for ( i = 0; i < self.columns.length; i++) {
                    col = self.columns[i];

                    if ( ( col.frozen || false ) !== frozen || col.hidden ) {
                        continue;
                    }
                    out.markup( "<col" )
                        .optionalAttr( "width", col.width )
                        .attr( ATTR_DATA_IDX, i )
                        .markup( "/>" );
                }
            }

            function renderColumnHeaders( out, frozen, hidden ) {
                var i, g, col, cls, sortTitle, group, ariaSort, style, colId,
                    columns = self.columns,
                    start = self.lastFrozenColIndex + 1,
                    end = columns.length;

                // first do the column groups if any
                for ( g = 0; g < self.columnGroups.length; g++) {
                    group = self.columnGroups[g];
                    out.markup( "<tr class='" + C_GRID_ROW + "' role='row'>" );
                    for ( i = 0; i < group.length; i++ ) {
                        if ( frozen && o.rowHeader !== NONE ) {
                            out.markup( "<th role='columnheader' class='" + C_GRID_COL_GROUP + " " + C_GRID_SEL_HEADER + "'" );
                            if ( hidden ) {
                                out.markup( " style='visibility: hidden;'" );
                            }
                            out.markup( ">" );
                        }
                        for ( i = 0; i < group.length; i++) {
                            col = group[i];
                            if ( ( col.frozen || false ) !== frozen ) {
                                continue;
                            }
                            cls = C_GRID_COL_GROUP;
                            cls += alignmentClass( col.headingAlignment || "center", true );

                            colId = hidden ? null : col.domId;
                            out.markup( "<th role='columnheader' " )
                                .attr( "class", cls )
                                .attr( ATTR_COLSPAN, col.span )
                                .attr( ATTR_DATA_IDX, i );
                            if ( hidden ) {
                                out.markup( " style='visibility: hidden;'" );
                            }
                            out.markup( " tabindex='-1'><span class='" + C_GRID_HEADER_LABEL + "'" )
                                .optionalAttr( "id", colId )
                                .markup( ">" + ( col.heading || "" ) )
                                .markup( "</span></th>");
                        }
                    }
                    out.markup( "</tr>" );
                }

                // next do the column headings
                out.markup( "<tr class='" + C_GRID_ROW + "' role='row'>" );

                if ( frozen ) {
                    if ( o.rowHeader !== NONE ) {
                        style = null;
                        if ( hidden ) {
                            style += "visibility: hidden;";
                        }

                        out.markup( "<th role='columnheader' class='" + C_GRID_COL_HEADER + " " + C_GRID_SEL_HEADER + "'" )
                            .optionalAttr( "style", style )
                            .markup( "><span class='u-vh " + C_GRID_HEADER_LABEL + "'" )
                            .attr( "id", self.idPrefix + "_shh" )
                            .markup( ">" )
                            .markup( getMessage( "ROW_HEADER" ) )
                            .markup( "</span>");

                        if ( o.rowHeaderCheckbox && o.multiple && o.selectAll ) {
                            out.markup( "<span class='" + C_SELECTOR + "' role='checkbox' aria-checked='false'" )
                                .attr( "title", getMessage( "SELECT_ALL" ) )
                                .markup("></span>" );
                        }
                        if ( o.rowHeader === SEQUENCE ) {
                            out.markup( "<span class='a-GV-rownum' aria-hidden='true'></span>" );
                        } else if ( o.rowHeader === LABEL ) {
                            out.markup( "<span class='a-GV-rowLabel'></span>" );
                        }
                        out.markup( "</th>" );
                    }

                    start = 0;
                    end = self.lastFrozenColIndex + 1;
                }
                for ( i = start; i < end; i++) {
                    col = columns[i];
                    if ( !col.hidden ) {
                        cls = C_GRID_COL_HEADER;
                        cls += alignmentClass( col.headingAlignment || "center", true );

                        if ( col.isRequired ) {
                            cls += " is-required";
                        }
                        if ( !col.elementId || col.readonly ) {
                            cls += " is-readonly";
                        }
                        if ( col.headingCssClasses ) {
                            cls += " " + col.headingCssClasses;
                        }

                        // wai-aria spec says aria-sort should only apply to one header at a time so pick the primary sort column
                        ariaSort = null;
                        if ( col.sortIndex === 1 ) {
                            if ( col.sortDirection === "asc" ) {
                                ariaSort = "ascending";
                            } else if ( col.sortDirection === "desc" ) {
                                ariaSort = "descending";
                            }
                        }

                        style = null;
                        if ( hidden ) {
                            style = "visibility: hidden;";
                            colId = null;
                        } else {
                            colId = col.domId;
                        }
                        // todo could the column metadata include a class?
                        out.markup( "<th role='columnheader' " )
                            .attr( "class", cls )
                            .attr( ATTR_DATA_IDX, i )
                            .optionalAttr( "style", style )
                            .optionalAttr( "aria-sort", ariaSort )
                            .optionalAttr( "aria-haspopup", o.activateColumnHeader ? TRUE : null ) // if there is a handler on activate then assume there is a popup
                            .markup( " tabindex='-1'><span class='" + C_GRID_HEADER_LABEL + "'" )
                            .optionalAttr( "id", colId )
                            .markup( ">" )
                            .markup( col.heading )
                            .markup( "</span>");
                        if ( col.sortDirection ) {
                            sortTitle = formatMessage( col.sortDirection === "asc" ? "SORTED_ASCENDING" : "SORTED_DESCENDING",
                                numSortColumns > 1 ? col.sortIndex : "" );
                            out.markup( "<span class='a-GV-header-sort'><span aria-hidden='true'" )
                                .attr( "class", "a-Icon " +
                                        ( col.sortDirection === "asc" ? "icon-irr-sort-asc" : "icon-irr-sort-desc" ) )
                                .attr( ATTR_TITLE, sortTitle )
                                .markup( "></span><span class='u-vh'>" )
                                .content( " " + sortTitle )
                                .markup( "</span>" );
                            if ( numSortColumns > 1 ) {
                                out.markup( "<span aria-hidden='true'>")
                                    .content( col.sortIndex )
                                    .markup( "</span>" );
                            }
                            out.markup( "</span>" );
                        }
                        out.markup( "</th>" );
                    }
                }

                out.markup( "</tr>" );
            }

            hasFrozenColumns = this.lastFrozenColIndex >= 0 || o.rowHeader !== NONE;

            numSortColumns = 0;
            for ( i = 0; i < this.columns.length; i++ ) {
                if ( this.columns[i].sortDirection ) {
                    numSortColumns += 1;
                }
            }

            out.markup( "<div class='" + C_GRID_HEADER + "'>" );
            if ( hasFrozenColumns ) {
                out.markup( "<div class='" + C_GRID_WRAP_FROZEN + "'>" + BEGIN_TABLE );
                renderColumns( out, true );
                out.markup( BEGIN_THEAD );
                renderColumnHeaders( out, true, false );
                out.markup( "</thead></table></div>" );
            }
            out.markup( "<div class='" + C_GRID_WRAP_HEADER + "'>" + BEGIN_TABLE );
            renderColumns( out, false );
            out.markup( BEGIN_THEAD );
            renderColumnHeaders( out, false, false );
            out.markup( "</thead></table></div></div><div class='" + C_GRID_BODY + "'>" );
            this._renderAltDataMessages( out, this.idPrefix );
            out.markup( "<div class='u-vh'")
                .attr( "id", this.accContextId )
                .markup( "></div>" );
            if ( hasFrozenColumns ) {
                out.markup( TAB_TRAP + "<div class='" + C_GRID_WRAP_FROZEN + "'>" + BEGIN_TABLE );
                renderColumns( out, true );
                out.markup( BEGIN_THEAD );
                renderColumnHeaders( out, true, true );
                out.markup( "</thead><tbody></tbody></table>" );
                this._renderLoadMore( out );
                out.markup( "</div>" + TAB_TRAP + TAB_TRAP );
            }

            // use tabindex=-1 because Firefox lets scrollable things take focus and that messes up navigation especially during editing
            out.markup( "<div class='" + C_GRID_WRAP_SCROLL + "' tabindex='-1'>" + BEGIN_TABLE );
            renderColumns( out, false );
            out.markup( BEGIN_THEAD );
            renderColumnHeaders( out, false, true );
            out.markup( "</thead><tbody></tbody></table>" );
            this._renderLoadMore( out );
            out.markup( "</div>" );

            if ( hasFrozenColumns || ( o.autoAddRecord && this.model.allowAdd() ) ) {
                out.markup( TAB_TRAP );
            }

            out.markup( "</div>" );
            if ( o.editable ) {
                out.markup( "<div class='a-GV-floatingItem' tabindex='-1' style='display: none;'>" )
                    .markup( "<div class='a-GV-cellMoveHandle'></div>" )
                    .markup( "<button type='button' class='a-GV-expandCollapse' tabindex='-1'><span aria-hidden='true' class='a-Icon'></span></button>" +
                             TAB_TRAP + "<div class='" + C_FLOATING_ITEM_CONT + "'></div>" + TAB_TRAP + "</div>" );
            }
            this._renderFooter( out, this.idPrefix );

            if ( o.columnSort ) {
                out.markup( "<div class='" + C_GRID_COL_CONTROLS + "' style='display:none'>" );
                this._renderButton( out, "a-Button js-asc", "icon-up-chevron", getMessage( "SORT_ASCENDING" ) );
                this._renderButton( out, "a-Button js-desc", "icon-down-chevron", getMessage( "SORT_DESCENDING" ) );
                out.markup( "</div>" );
            }

            if ( o.reorderColumns ) {
                out.markup( "<div class='" + C_GRID_COL_HANDLE + "' style='display:none'></div>" )
                    .markup( "<div class='a-GV-colMoveMarker' style='display:none'>" )
                    .markup( "<span class='a-GV-colMoveMarker-x'></span></div>" );
            }

            ctrl$.html(out.toString());

            this._updateAccLabel();

            this.pageKey = null; // cause the pagination if any to get updated
            tb$ = ctrl$.find( "tbody,thead" );
            if ( hasFrozenColumns ) {
                this.tableFrozenHeader$ = tb$.eq(0);
                this.frozenColumnCount = this.tableFrozenHeader$.children().last().children().length;
                this.tableHeader$ = tb$.eq(1);
                this.tableFrozenData$ = tb$.eq(3);
                this.tableData$ = tb$.eq(5);
            } else {
                this.tableFrozenHeader$ = null;
                this.frozenColumnCount = 0;
                this.tableFrozenData$ = null;
                this.tableHeader$ = tb$.eq(0);
                this.tableData$ = tb$.eq(2);
            }
            this._clearChildrenRowCache();
            this.accContext$ = $( "#" + this.accContextId );
            this.columnControls$ = ctrl$.find( SEL_GRID_COL_CONTROLS );
            this.columnControls$.find( "button" ).attr( "tabindex", -1 );
            this.columnHandle$ = ctrl$.find( "." + C_GRID_COL_HANDLE );
            this.columnMoveMarker$ = ctrl$.find( ".a-GV-colMoveMarker" );
            this.floatingItem$ = ctrl$.find( ".a-GV-floatingItem" );
        },

        _updateAccLabel: function() {
            var labelBy = this.origLabelBy;

            if ( this.noData ) {
                labelBy += " " + this.idPrefix + "_msg";
            } else {
                // add footer info to accessible label
                if ( this.options.footer ) {
                    labelBy += " " + this.idPrefix + "_pageRange " + this.idPrefix + "_status";
                }
            }
            this.element.attr( ARIA_LBL_BY, labelBy );
        },

        _calcSpanAllColumns: function( frozen ) {
            var i, span, start, end;

            span = 0;
            if ( frozen ) {
                start = 0;
                end = this.lastFrozenColIndex + 1;
                if ( this.options.rowHeader !== NONE ) {
                    span += 1;
                }
            } else {
                start = this.lastFrozenColIndex + 1;
                end = this.columns.length;
            }
            for ( i = start; i < end; i++ ) {
                if ( !this.columns[i].hidden ) {
                    span += 1;
                }
            }
            return span;
        },

        //
        // Begin tableModelViewBase overrides
        //

        _getHeaderHeight: function() {
            return this.element.find( SEL_GRID_HEADER ).outerHeight();
        },

        _getStickyTop: function() {
            if ( $.isFunction( this.options.stickyTop ) ) {
                return this.options.stickyTop();
            }
            return 0;
        },

        _selectedCount: function() {
            var count = 0;

            if ( !this.tableData$ ) {
                // ignore if not yet initialized or perhaps destroyed (can happen because selection debounce
                // if selection changes and destoryed right away)
                return;
            }
            if ( this.options.selectCells ) {
                count = this.tableData$.find( SEL_SELECTED ).filter( SEL_CELL ).length;
                if ( this.tableFrozenData$ ) {
                    count += this.tableFrozenData$.find( SEL_SELECTED ).filter( SEL_CELL ).length;
                }
            } else {
                if ( this.options.persistSelection ) {
                    // if selection is persisted in the model the ask the model for the count
                    // in this case the selection could span multiple pages
                    count = this.model.getSelectedCount();
                } else {
                    count = this.tableData$.find( SEL_SELECTED ).filter( SEL_ROW ).length;
                }
            }
            return count;
        },

        _selectedStatusMessage: function() {
            var o = this.options;
            return lang.getMessage( o.selectCells ? "APEX.GV.SELECTION_CELL_COUNT" : o.selectionStatusMessageKey );
        },

        _deletedCount: function() {
            return this.tableData$.find( SEL_DELETED ).length;
        },

        _hasControlBreaks: function() {
            return this.breakColumns.length > 0;
        },

        _getRecordHeight: function() {
            var r$, rowHeight;

            // This only works well for fixed height rows
            // This can be called when the table is empty so add an empty row just to measure then clean it up.
            r$ = this.tableData$.find( SEL_ROW ).filter( SEL_VISIBLE ).first();
            if ( !r$.length ) {
                r$ = $("<tr class='" + C_GRID_ROW + "'><td class='" + C_GRID_CELL + "'></td></tr>");
                r$ = this.tableData$.append(r$);
                rowHeight = r$.outerHeight();
                this.tableData$.empty(); // todo r$ got rid of tbody, but what if it wasn't empty?
            } else {
                rowHeight = r$.outerHeight();
            }
            return rowHeight;
        },

        _getDataRenderContext: function () {
            return {
                hasFrozenColumns: this.lastFrozenColIndex >= 0 || this.options.rowHeader !== NONE,
                dataOut: util.htmlBuilder(),
                frozenOut:  util.htmlBuilder()
            };
        },

        _getDataContainer: function() {
            if ( this.tableFrozenData$ ) {
                return $( [this.tableFrozenData$[0], this.tableData$[0]] );
            } // else
            return this.tableData$;
        },

        _insertFiller: function( out, curFiller$ ) {
            var filler$, frozenFiller$;

            if ( out.hasFrozenColumns ) {
                frozenFiller$ = $( out.frozenOut.toString() );
                if ( curFiller$ ) {
                    curFiller$.first().before( frozenFiller$ );
                } else {
                    this.tableFrozenData$.html( frozenFiller$ );
                }
            }
            filler$ = $( out.dataOut.toString() );
            if ( curFiller$ ) {
                curFiller$.last().before( filler$ );
            } else {
                this.tableData$.html( filler$ );
            }
            if ( out.hasFrozenColumns ) {
                filler$ = $( [frozenFiller$[0], filler$[0]] );
            }
            this._clearChildrenRowCache();
            return filler$;
        },

        _insertData: function( out, offset, count, filler$, how ) {
            var body$, dataRows$, frozenRows$,
                self = this;

            // after the rendering any anchors or buttons (any tab stop) in cells need to have the tab stops disabled this happens in getRows$
            if ( out.hasFrozenColumns ) {
                frozenRows$ = getRows$( out.frozenOut );
            }
            dataRows$ = getRows$( out.dataOut );
            if ( !filler$ ) {
                if ( out.hasFrozenColumns ) {
                    this.tableFrozenData$.append( frozenRows$ );
                }
                this.tableData$.append( dataRows$ );
            } else {
                // else must have filler$ and how must be before or after
                if ( out.hasFrozenColumns ) {
                    filler$.first()[how]( frozenRows$ );
                }
                filler$.last()[how]( dataRows$ );
            }
            this._clearChildrenRowCache();

            if ( this.options.hasSize ) {
                body$ = this.element.children( SEL_GRID_BODY );
                this._adjustSizeForScrollBars( body$.height(),
                    body$.find( SEL_GRID_WRAP_SCROLL ).width() );
            }

            if ( this.gotoCellPending ) {
                setTimeout( function() {
                    self.gotoCell( self.gotoCellPending.record, self.gotoCellPending.column );
                }, 1);
            }

            this._trigger( EVENT_PAGE_CHANGE, null, {
                offset: offset,
                count: count
            });
        },

        _controlBreakLabel: function( rowItem ) {
            var i, col, value, columnItem,
                o = this.options,
                label = "";

            for ( i = 0; i < this.breakColumns.length; i++ ) {
                col = this.breakColumns[i];
                if ( i > 0 ) {
                    label += ", ";
                }
                value = this.model.getValue( rowItem, col.property );
                // this is a subset of what _renderFieldDataValue does, for example links and cell templates are not supported
                if ( value === null ) {
                    value = "";
                }
                // check to see if the model has a display value
                if ( typeof value === "object" && value.hasOwnProperty( "d" ) ) {
                    value = value.d;
                } else {
                    // otherwise if there is a column item it may have a display value
                    columnItem = this.columnItems[ col.property ];
                    if ( columnItem ) {
                        value = columnItem.item.displayValueFor( value );
                    }
                }
                if ( value === "" && o.showNullAs ) {
                    value = o.showNullAs;
                }
                // if escape is false then value can contain markup otherwise it is escaped as element content
                // note that the === false test is so that anything else defaults to true.
                if ( col.escape === false ) {
                    value = util.escapeHTML( value );
                }
                label += "<span class='a-GV-breakLabel'>" + ( col.label ? util.escapeHTML( col.label ) : col.heading ) + ":</span> <span class='a-GV-breakValue'> " + value + "</span>";
            }
            return label;
        },

        _renderBreakRecord: function ( out, expandControl, breakLabel, serverOffset ) {
            if ( out.hasFrozenColumns ) {
                this._renderBreakRow( out.frozenOut, true, expandControl, breakLabel, serverOffset );
                expandControl = false;
            }
            this._renderBreakRow( out.dataOut, false, expandControl, breakLabel, serverOffset );
        },

        _renderFillerRecord: function ( out, cssClass ) {
            if ( out.hasFrozenColumns ) {
                out.frozenOut.markup( "<tr class='" + cssClass + "'><td " )
                    .attr( ATTR_COLSPAN, this._calcSpanAllColumns( true ) )
                    .markup( "></td></tr>" );
            }
            out.dataOut.markup( "<tr class='" + cssClass + "'><td " )
                .attr( ATTR_COLSPAN, this._calcSpanAllColumns( false ) )
                .markup( "></td></tr>" );
        },

        _renderRecord: function( out, rowItem, index, id, meta ) {
            if ( out.hasFrozenColumns ) {
                this._renderRow( out.frozenOut, rowItem, index, id, meta, true );
            }
            this._renderRow( out.dataOut, rowItem, index, id, meta, false );
        },

        _insertRecord: function( row, record, id, meta, where ) {
            var newRow$, after$,
                hasFrozenColumns = this.lastFrozenColIndex >= 0 || this.options.rowHeader !== NONE,
                out = util.htmlBuilder(),
                inserted = [];

            if ( hasFrozenColumns ) {
                // An inserted row doesn't have an index because it would cause all the other indexes to shift down!
                this._renderRow( out, record, null, id, meta, true );
                newRow$ = getRows$( out );
                inserted.push( newRow$[0] );
                if ( where === "after" && row ) {
                    after$ = row.first();
                    after$.after( newRow$ );
                } else {
                    this.tableFrozenData$.prepend( newRow$ );
                }
                out.clear();
            }
            // An inserted row doesn't have an index because it would cause all the other indexes to shift down!
            this._renderRow( out, record, null, id, meta, false );
            newRow$ = getRows$( out );
            inserted.push( newRow$[0] );
            if ( where === "after" && row ) {
                after$ = row.last();
                after$.after( newRow$ );
            } else {
                this.tableData$.prepend( newRow$ );
            }
            this._clearChildrenRowCache();
            return $(inserted);
        },

        _afterInsert: function( insertedElements ) {
            var i, col,
                focus = !!this.element.find( "." + C_FOCUSED ).length || $( document.activeElement ).hasClass( C_AUTO_ADD ),
                cell$ = insertedElements[0].find(".a-GV-cell" ).first();

            // find the first editable cell
            for ( i = 0; i < this.columns.length; i++ ) {
                col = this.columns[i];
                if ( !col.hidden && !col.readonly && this.columnItems[col.property] ) {
                    cell$ = cellFromColumnIndex( insertedElements[0], this.fieldToColumnIndex[col.property] );
                    break;
                }
            }
            // select and edit
            this._select( cell$,  null, focus, false, false );
            if ( focus && this.options.editable && !this.editMode ) {
                this.setEditMode( true );
            }
        },

        _updateRecordField: function( row, record, field, meta ) {
            var cell$, columnItem, col, cellMeta,
                index = this.fieldToColumnIndex[field],
                out = util.htmlBuilder();

            if ( index === undefined ) {
                return; // there is no cell to update
            }
            cell$ = cellFromColumnIndex( row, index );
            // update just the changed cell
            if ( this.editMode && record === this.activeRecord && !this.ignoreItemChange ) {
                columnItem = this.columnItems[field];
                if ( columnItem ) {
                    this._setColumnItemValue( columnItem.item, record, field );
                }
            }
            if ( !cell$.hasClass( C_ACTIVE ) ) {
                // update the readonly/display value
                col = this.options.columns[0][field];
                cellMeta = null;
                if ( meta.fields ) {
                    cellMeta = meta.fields[col.property];
                }
                out = util.htmlBuilder();
                this._renderFieldDataValue( out, col, record, meta, cellMeta );
                cell$.html( out.toString() );
            }
        },

        _updateRecordState: function( row$, itemId, item, meta ) {
            var f, cellMeta, cell$, cls, index,
                o = this.options,
                noTooltip = !this.tooltipOptions;

            cls = getRowClass( meta, o, row$.hasClass( C_SELECTED ), this.model, item );
            row$.attr( "class", cls );
            if ( noTooltip ) {
                // NOTE this assumes/requires that there be a row header in order to see these record level error messages
                if ( meta.message ) {
                    row$.first().find( SEL_GRID_SEL_HEADER ).attr( ATTR_TITLE, meta.message );
                } else {
                    row$.first().find( SEL_GRID_SEL_HEADER ).removeAttr( ATTR_TITLE );
                }
            }
            // todo this may make volatile columns stale

            // handle field level metadata but don't care if the record is deleted
            if ( meta.fields ) {
                for ( f in meta.fields ) {
                    if ( meta.fields.hasOwnProperty( f ) ) {
                        cellMeta = meta.fields[f];
                        index = this.fieldToColumnIndex[f];
                        if ( index === undefined ) {
                            continue; // there is no cell for this field, move on
                        }
                        cell$ = cellFromColumnIndex( row$, index );

                        cls = getCellClass( o.columns[0][f], meta, cellMeta, o, cell$ );
                        cell$.attr( "class", cls );
                        if ( noTooltip ) {
                            if ( cellMeta.message && !meta.deleted ) {
                                cell$.attr( ATTR_TITLE, cellMeta.message );
                            } else {
                                cell$.removeAttr( ATTR_TITLE );
                            }
                        }
                    }
                }
            }
        },

        _removeRecord: function( row ) {
            row.remove();
        },

        _identityChanged: function( prevId, id ) {
            // need to update the dom and the activeRecordId if it applies
            var row$ = this._elementsFromRecordIds( [prevId] )[0];
            row$.attr( ATTR_DATA_ID, id );
            if ( this.activeRecordId === prevId ) {
                this.activeRecordId = id;
            }
        },

        _replaceRecord: function( row, rec, oldId, id, meta ) {
            var newRow$, wasSelected, wasFocused, rowIndex = null, colIndex = null,
                newRow = [],
                index = row.first().children().first().find( ".a-GV-rownum" ).text() || null,
                hasFrozenColumns = this.lastFrozenColIndex >= 0 || this.options.rowHeader !== NONE,
                out = util.htmlBuilder();

            this.activeRecord = null; // if any records are replaced don't take any chances of holding on to stale record
            if ( index ) {
                index = parseInt( index, 10 ) - 1;
            }

            wasSelected = row.hasClass( C_SELECTED );
            wasFocused = row.find( this.lastFocused ).length;
            if ( wasFocused ) {
                rowIndex = 0;
                colIndex = domIndex( getContainingGridCell$( this.lastFocused ) );
            }

            if ( hasFrozenColumns ) {
                if ( wasFocused && row.last().find( this.lastFocused ).length ) {
                    rowIndex = 1;
                }
                this._renderRow( out, rec, index, id, meta, true );
                newRow$ = getRows$( out );
                newRow.push( newRow$[0] );
                row.first().replaceWith( newRow$ );
                out.clear();
            }
            this._renderRow( out, rec, index, id, meta, false );
            newRow$ = getRows$( out );
            newRow.push( newRow$[0] );
            row.last().replaceWith( newRow$ );
            this._clearChildrenRowCache();

            newRow$ = $( newRow );
            if ( wasFocused ) {
                this._select( cellFromColumnIndex( newRow$.eq( rowIndex ), colIndex ), null, false, false );
            } else if ( wasSelected ) {
                newRow$.addClass( C_SELECTED );
            }
        },

        _removeFocus: function( row ) {
            var curRow$, cell$, next$;

            // If the row has focus then move it to the next row (or prev row if at end) keeping in the same column
            curRow$ = $( this.lastFocused ).closest( SEL_ROW );
            if ( curRow$[0] === row[0] || ( row.length > 1 && curRow$[0] === row[1] ) ) {
                cell$ = getContainingDataCell$( this.lastFocused );
                next$ = this._getNextCellDown( cell$, 1 );
                if ( !next$ ) {
                    next$ = this._getPrevCellUp( cell$, 1 );
                }
                if ( next$ ) {
                    this._select( next$, null, true, false );
                }
            }
        },

        _elementsFromRecordIds: function( ids ) {
            var i, frozenRows$,
                includeFrozen = true,
                rows = [],
                keys = {};

            for ( i = 0; i < ids.length; i++ ) {
                keys[ids[i]] = i;
                rows[i] = null;
            }
            if ( !this.tableFrozenData$ ) {
                includeFrozen = false;
            }
            if ( includeFrozen ) {
                frozenRows$ = this.tableFrozenData$.children();
            }
            this.tableData$.children().each(function( index ) {
                var row$ = $( this ),
                    id = row$.attr( ATTR_DATA_ID );

                if ( keys[id] !== undefined ) {
                    if ( includeFrozen ) {
                        rows[keys[id]] = $( [ frozenRows$[index], this ] );
                    } else {
                        rows[keys[id]] = row$;
                    }
                }
            });
            return rows;
        },

        //
        // End tableModelViewBase overrides
        //

        _renderBreakRow: function ( out, frozen, expandControl, breakLabel, serverOffset ) {
            var span;

            span = this._calcSpanAllColumns( frozen );

            out.markup( "<tr role='row' class='" + C_CONTROL_BREAK + " is-expanded'><th role='rowheader' class='a-GV-controlBreakHeader'" )
                .attr( ATTR_COLSPAN, span )
                .markup( ">" );
            if ( expandControl ) {
                // todo consider if model supports initial collapsed state. then adjust button icon, aria state: a-Icon icon-right-arrow, aria-expanded
                this._renderButton( out, "a-Button js-toggleBreak", "icon-down-arrow", getMessage( "BREAK_COLLAPSE" ) );
            }
            out.markup( "<span class='a-GV-controlBreakLabel'>")
                .markup( breakLabel )
                .markup( "</span></th></tr>" );

            if ( !frozen ) {
                // do this once per row
                this.controlBreaks.push( {
                    offset: serverOffset + 1,
                    label: breakLabel
                } );
                // todo this sorting gets done a little too frequently
                this.controlBreaks.sort( controlBreakCompare );
            }
        },

        _getControlBreak: function( serverOffset ) {
            var i,
                colBreak = null;

            if ( this.breakColumns.length > 0 ) {
                i = binarySearch( this.controlBreaks, { offset: serverOffset }, controlBreakCompare );
                colBreak = this.controlBreaks[i];
                if ( !colBreak || colBreak.offset !== serverOffset ) {
                    colBreak = this.controlBreaks[i - 1];
                }
            }
            return colBreak;
        },

        _renderRow: function( out, rowItem, index, id, meta, frozen ) {
            var i, col, cls, selectorCls, cellMeta, rownum, hasLabel,
                title = null,
                rowHeaderTitle = null,
                cellTitle = null,
                o = this.options,
                columns = this.columns,
                start = this.lastFrozenColIndex + 1,
                end = columns.length,
                noTooltip = !this.tooltipOptions;

            cls = getRowClass( meta, o, null, this.model, rowItem );
            if ( meta.agg ) {
                if ( meta.grandTotal ) {
                    title = o.aggregateLabels[meta.agg].overallLabel;
                } else {
                    title = o.aggregateLabels[meta.agg].label;
                }
                // todo mark as potentially stale if the model has changes
            } else {
                if ( ! meta.deleted &&  meta.message && noTooltip ) {
                    rowHeaderTitle = meta.message;
                }
            }
            rownum = meta.serverOffset !== undefined ? meta.serverOffset + 1 : "";
            out.markup( "<tr role='row'" )
                .attr( ATTR_DATA_ID, id )
                .optionalAttr( ATTR_DATA_ROWNUM, rownum )
                .attr( "class", cls )
                .optionalAttr( ATTR_TITLE, title )
                .optionalAttr( ARIA_SELECTED, meta.sel ? TRUE : null )
                .optionalAttr( "style", this.controlBreakCollapsed ? "display:none;": null )
                .markup( ">" );

            if ( frozen && o.rowHeader !== NONE ) {
                hasLabel = meta.agg || o.rowHeader === LABEL;
                out.markup( "<th role='rowheader'" )
                    // only add the accessible row header class if this has a label worth reading
                    .attr( "class",  C_GRID_CELL + " " + C_GRID_SEL_HEADER + ( hasLabel ? " " + C_ROW_HEADER : "" ) )
                    .optionalAttr( ATTR_TITLE, rowHeaderTitle )
                    .markup( ">");
                if ( !meta.agg ) {
                    if ( o.rowHeaderCheckbox ) {
                        selectorCls = o.multiple ? C_SELECTOR : C_SELECTOR_SINGLE;
                        if ( meta.sel ) {
                            selectorCls += " " + C_SELECTED;
                        }
                        out.markup( "<span class='" + selectorCls + "'" ) // xxx role, aria-selected?
                            .attr( "title", getMessage( "SELECT_ROW" ) )
                            .markup( "></span>" );
                    }
                    if ( o.rowHeader === SEQUENCE ) {
                        // aria-hidden because a screen reader user has the context row read to them so they don't need to hear the sequence repeated
                        out.markup( "<span class='a-GV-rownum' aria-hidden='true'>" )
                            .content( rownum )
                            .markup( "</span>" );
                    }
                }
                if ( hasLabel ) {
                    out.markup( "<span class='a-GV-rowLabel'>" );
                    if ( meta.agg ) {
                        out.content( o.aggregateLabels[meta.agg][ meta.grandTotal ? "overallLabel" : "label" ] );
                    } else if ( o.rowHeaderLabelColumn ) {
                        out.markup( this.model.getValue( rowItem, o.rowHeaderLabelColumn ) );
                    }
                    out.markup( "</span>" );
                }
                out.markup("</th>" );
            }
            if ( frozen ) {
                start = 0;
                end = this.lastFrozenColIndex + 1;
            }
            for ( i = start; i < end; i++) {
                col = columns[i];
                cellMeta = null;
                if ( meta.fields ) {
                    cellMeta = meta.fields[col.property];
                }
                if ( !col.hidden ) {
                    cls = getCellClass( col, meta, cellMeta, o );
                    cellTitle = null;
                    // todo mark volatile columns as stale if the item is edited if cellMeta
                    if ( noTooltip ) {
                        if ( cellMeta && cellMeta.message ) {
                            cellTitle = cellMeta.message;
                        } else if ( meta.agg ) {
                            cellTitle = o.aggregateTooltips[ meta.agg + "|" + col.property ];
                        }
                    }

                    out.markup( "<td role='gridcell' tabindex='-1'" )
                        .attr( "class", cls )
                        .optionalAttr( ATTR_TITLE, cellTitle )
                        .markup( ">" );
                    this._renderFieldDataValue( out, col, rowItem, meta, cellMeta );
                    out.markup("</td>" );
                }
            }
            out.markup( "</tr>" );
        },

        _getColumnMetadata: function( cell$ ) {
            var index, headerTable$, hdr$;

            if ( cell$.hasClass( C_GRID_CELL ) ) {
                index = domIndex( cell$ );
                if ( cell$.closest( SEL_GRID_WRAP_FROZEN ).length ) {
                    headerTable$ = this.tableFrozenHeader$;
                } else {
                    headerTable$ = this.tableHeader$;
                }
                hdr$ = headerTable$.children().last().children().eq( index );
            } else if ( cell$.hasClass( C_GRID_COL_HEADER ) ) {
                hdr$ = cell$;
            } else {
                return null;
            }
            index = parseInt( hdr$.attr( ATTR_DATA_IDX ), 10 );
            if ( !isNaN( index ) ) {
                return this.columns[index];
            } // else
            return null;
        },

        _activateColumnHeader: function( event, cell$ ) {
            var col = this._getColumnMetadata( cell$ );

            if ( !col.noHeaderActivate ) {
                this._trigger( EVENT_ACTIVATE_COLUMN_HEADER, event, {
                    header$: cell$,
                    column: col
                });
            }
        },

        _activateRow: function( cell$ ) {
            var i, columnItem, prop, activeRecord, activeRecordId, meta, editable,
                row$ = cell$.parent(),
                id = row$.attr( ATTR_DATA_ID );

            activeRecord = this.model.getRecord( id );
            activeRecordId = this.model.getRecordId( activeRecord );
            editable = this.model.allowEdit( activeRecord );
            meta = this.model.getRecordMetadata( activeRecordId );
            row$.addClass( C_ACTIVE ); // xxx shouldn't this add active class to both rows?
            // load all values
            this._beginSetColumnItems();
            for ( i = 0; i < this.columns.length; i++ ) {
                prop = this.columns[i].property;
                columnItem = this.columnItems[ prop ];
                if ( columnItem ) {
                    this._setColumnItemValue( columnItem.item, activeRecord, prop,
                        editable ? meta : null );
                }
            }

            // change detection for non-active columns is gated by activeRecord, which is cleared in _deactivateRow, so don't set until after values are set
            // do set before calling reinit incase there is a callback into this for getActiveRecordId
            this.activeRecord = activeRecord;
            this.activeRecordId = activeRecordId;
            this._endSetColumnItems();

            this._triggerBeginEditing( this.activeRecord, this.activeRecordId );
        },

        _deactivateRow: function( callback ) {
            var i, columnItem, prop, validity, meta, colMeta, isDisabled,
                row$ = this.element.find( ".a-GV-row.is-active" );

            if ( this.activeLockCount > 0 ) {
                this.activeUnlockCallback = callback;
                return;
            }
            row$.removeClass( C_ACTIVE );
            meta = this.model.getRecordMetadata(( this.activeRecordId ) );
            // do final validation mainly for the benefit of inserted rows
            // don't validate rows that are deleted or can't be edited
            if ( meta && !meta.deleted && this.model.allowEdit( this.activeRecord ) ) {
                for ( i = 0; i < this.columns.length; i++ ) {
                    prop = this.columns[i].property;
                    columnItem = this.columnItems[ prop ];

                    // TODO Only check validity for enabled and visible items
                    if ( columnItem ) {
                        isDisabled = columnItem.item.isDisabled();
                        if ( !isDisabled ) {
                            validity = columnItem.item.getValidity();
                            if ( !validity.valid ) {
                                this.model.setValidity( "error", this.activeRecordId, prop, columnItem.item.getValidationMessage() );
                            }
                        } else {
                            this.model.setValidity( "valid", this.activeRecordId, prop );
                        }
                        // update disabled metadata
                        colMeta = meta.fields ? meta.fields[prop] : null;
                        if ( ( colMeta && colMeta.hasOwnProperty( "disabled" ) ) || isDisabled ) {
                            if ( !colMeta ) {
                                if ( !meta.fields ) {
                                    meta.fields = {};
                                }
                                colMeta = {};
                                meta.fields[prop] = colMeta;
                            }
                            colMeta.disabled = isDisabled;
                            // todo think is a call to metadataChanged needed?
                        }
                    }
                }
            }
            this._triggerEndEditing( this.activeRecord, this.activeRecordId );
            this.activeRecord = null;
            this.activeRecordId = null;
            callback();
        },

        _beginDeactivate: function( cell$, focus ) {
            var self = this;

            this.deactivateDelayTimer = setTimeout(function() {
                self.lastEditModeCell = null;
                self._deactivateCell( cell$ );
                if ( focus ) {
                    // put focus back in cell without focusing the editable field.
                    self.dontFocusEditableItem = true;
                    cell$.focus();
                }
                self.deactivateDelayTimer = null;
            }, 10);
        },

        _clearDeactivate: function() {
            if ( this.deactivateDelayTimer ) {
                clearTimeout( this.deactivateDelayTimer );
                this.deactivateDelayTimer = null;
            }
        },

        // must only be called while in edit mode
        _activateCell: function( cell$ ) {
            var column, next$, prev$, popupSelector, floatingTrap, endTrap, oneCellInRow,
                o = this.options,
                autoAdd = o.autoAddRecord && this.model.allowAdd(),
                self = this,
                columnItem = null,
                isBreak =  cell$.hasClass( C_GRID_BREAK_HEADER ),
                traps$ = this.tabTraps$;

            function activate() {
                column = self._getColumnMetadata( cell$ );
                if ( column ) {
                    columnItem = self.columnItems[column.property];
                }
                // Check if editing is allowed for this cell. Trust the cell class added during rendering because don't have access to the model cell metadata
                if ( columnItem && self.model.allowEdit( self.activeRecord ) && !column.readonly && !cell$.hasClass( "is-readonly" ) ) {
                    cell$.addClass( C_ACTIVE );
                    // If an item has a popup that is attached at the end of the body (anywhere outside this widget) then
                    // we need to know about the popup so that we can manage focus and know that the cell is still active.
                    // see also the focusin, focusout handlers
                    popupSelector = columnItem.item.getPopupSelector();
                    if ( popupSelector ) {
                        $( document.body ).on( "focusin.gridpopup", function( event ) {
                            // ignore focus changes within a popup
                            if ( $( event.target ).closest( popupSelector ).length ) {
                                self._clearDeactivate();
                            }
                        } ).on( "focusout.gridpopup", function( event ) {
                            var cell$;
                            if ( $( event.target ).closest( popupSelector ).length ) {
                                cell$ = $( self.lastEditModeCell );
                                self._beginDeactivate( cell$, true );
                            }
                        } );
                    }
                    if ( columnItem.element$.height() > cell$.height() ) {
                        cell$.empty();
                        self.floatingItem$.children( SEL_FLOATING_ITEM_CONT ).append( columnItem.element$ );
                        self._expandFloatingItem( cell$, true );
                    } else {
                        cell$.empty().append( columnItem.element$ );
                    }

                    // xxx acc perhaps label ids should come from the cells labelledby attr?
                    self._activateColumnItem( columnItem, column.domId ); // xxx acc how to include column group and possibly control break and row header what if heading contains markup?

                    if ( !self.dontFocusEditableItem ) {
                        // item value has already been set when row was activated
                        columnItem.item.setFocus();
                    }
                    self.dontFocusEditableItem = false;
                }
            }

            this.lastEditModeCell = cell$[0];

            // if the current row is not selected (can happen because of tab into new row) then select it but don't focus.
            if ( !cell$.parent().hasClass( C_SELECTED ) ) {
                this._select( cell$, null, false, false );
            }

            // make next and previous cells tab stops
            this._setFocusable( cell$[0] ); // this cell has to have been focusable
            cell$.attr( "tabindex", -1 ); // but can't be a tabstop
            next$ = this._nextCellWithWrap( cell$ ).attr( "tabindex", 0 );
            prev$ = this._prevCellWithWrap( cell$ ).attr( "tabindex", 0 );
            endTrap = null;
            if ( this.tableFrozenData$ ) {
                endTrap = 3;
                floatingTrap = 5;
                traps$.eq( 0 ).prop( "tabIndex", prev$.length ? 0 : -1 );
                // when there is exactly one cell in a row of either the frozen or non-frozen table then the
                // next and prev tab stops will both be in the other table and the normal tab order breaks
                // that is what the 1 and 2 tabtraps are for.
                oneCellInRow = cell$.parent().children().length === 1;
                traps$.eq( 1 ).prop( "tabIndex", oneCellInRow ? 0 : -1 );
                traps$.eq( 2 ).prop( "tabIndex", oneCellInRow ? 0 : -1 );
            } else {
                if ( autoAdd ) {
                    endTrap = 0;
                    floatingTrap = 2;
                } else {
                    floatingTrap = 1;
                }
            }
            if ( endTrap !== null ) {
                if ( autoAdd && this.onLastPage && next$.length === 0) {
                    traps$.eq( endTrap ).prop( "tabIndex", 0 ).addClass( C_AUTO_ADD );
                } else {
                    traps$.eq( endTrap ).prop( "tabIndex", next$.length ? 0 : -1 ).removeClass( C_AUTO_ADD );
                }
            }
            if ( autoAdd && this.onLastPage && next$.length === 0) {
                traps$.eq( floatingTrap ).prop( "tabIndex", 0 )
                    .toggleClass( "js-last", !next$.length )
                    .addClass( C_AUTO_ADD );
            } else {
                traps$.eq( floatingTrap ).prop( "tabIndex", next$.length ? 0 : -1 )
                    .toggleClass( "js-last", !next$.length )
                    .removeClass( C_AUTO_ADD );
            }
            // the floating prev tab trap is still needed

            // if this cell is in a new row need to deactivate this row and activate the new one, or if no active row then need to activate the new row
            // but deactivate row is a possibly async operation (if the active row is locked).
            if ( !this.activeRecord || this.activeRecordId !== cell$.parent().attr( ATTR_DATA_ID ) ) {
                if ( this.activeRecord ) {
                    this._deactivateRow( function() {
                        if ( !isBreak ) {
                            self._activateRow( cell$ );
                            activate();
                        }
                    });
                    return;
                }
                if ( !isBreak ) {
                    this._activateRow( cell$ );
                }
            }
            if ( !isBreak ) {
                activate();
            }
        },

        _expandFloatingItem: function( cell$, initial ) {
            var column, columnItem,
                cellWidth = cell$.outerWidth();

            this.floatingItem$
                .css( "position", "" )
                .css( "min-width", cellWidth + "px" )
                .insertAfter( this.element.find( SEL_GRID_BODY ) ).show()
                .addClass( C_EXPANDED )
                .draggable( "enable" )
                .find( ".a-GV-expandCollapse span" ).removeClass( "icon-ig-expand" ).addClass( "icon-ig-restore" );
            this.floatingItem$.children( SEL_FLOATING_ITEM_CONT ).show()
                .css( {width: "", height: ""} );

            if ( initial ) {
                this.floatingItem$.position( {
                    my: "left top",
                    at: "left top",
                    of: cell$,
                    collision: "fit fit"
                } );
            } else {
                this.floatingItem$.css( { left: this.lastFloatingPos.left, top: this.lastFloatingPos.top } );
            }
            this.floatingItem$.find( SEL_TAB_TRAP ).not( ".js-last" ).attr( "tabindex", 0 );
            // focus the item
            column = this._getColumnMetadata( cell$ );
            if ( column ) {
                columnItem = this.columnItems[column.property];
            }
            columnItem.item.setFocus();
        },

        _collapseFloatingItem: function( cell$ ) {
            var w = cell$.innerWidth(),
                h = cell$.innerHeight();

            this.lastFloatingPos = { left: this.floatingItem$.css("left"), top: this.floatingItem$.css("top") };
            this.floatingItem$
                .css( {"position": "relative", "left": "", "top": ""} )
                .appendTo( cell$ )
                .draggable( "disable" )
                .removeClass( C_EXPANDED + " ui-state-disabled" ) // want it disabled for dragging but don't want the content to look disabled
                .find( ".a-GV-expandCollapse span" ).removeClass( "icon-ig-restore" ).addClass( "icon-ig-expand" );
            this.floatingItem$.children( SEL_FLOATING_ITEM_CONT ).hide()
                .width( w )
                .height( h );
            this.floatingItem$.find( ".a-GV-expandCollapse" ).focus();
            this.floatingItem$.find( SEL_TAB_TRAP ).not( ".js-last" ).attr( "tabindex", -1 );
        },

        // must only be called while in edit mode
        _deactivateCell: function( cell$ ) {
            var column, out, meta, cellMeta,
                columnItem = null;

            if ( cell$.length <= 0 ) {
                return;
            }

            // remove tab stops
            this._setFocusable( cell$[0] );
            this._nextCellWithWrap( cell$ ).attr( "tabindex", -1 );
            this._prevCellWithWrap( cell$ ).attr( "tabindex", -1 );
            this.tabTraps$.prop( "tabIndex", -1 );

            column = this._getColumnMetadata( cell$ );
            if ( column ) {
                columnItem = this.columnItems[column.property];
            }
            if ( columnItem && cell$.hasClass( C_ACTIVE ) ) {
                $( document.body ).off( ".gridpopup" );

                this._setModelValue( cell$, columnItem.item, this.activeRecord, column.property );

                meta = this.model.getRecordMetadata( this.activeRecordId );
                cellMeta = null;
                if ( meta.fields ) {
                    cellMeta = meta.fields[column.property];
                }

                if ( !this.debugDontDeactivateCell ) { // see debugCellEdit
                    this.floatingItem$.insertAfter( this.element.find( SEL_GRID_BODY ) );
                    this.floatingItem$.hide();

                    this._deactivateColumnItem( columnItem );

                    out = util.htmlBuilder();
                    this._renderFieldDataValue( out, column, this.activeRecord, meta, cellMeta );
                    cell$.html( out.toString() );
                } else {
                    cell$.addClass( C_FOCUSED + " " + C_ACTIVE ); // put this back to make it look like it can be edited
                }

                // Also need to update the cell and row state
                // we know that itemId is not used also cell$ must be in the lastRow$ and using parent() will
                // include the row from both tables.
                this._updateRecordState(  this.lastRow$.parent(), this.activeRecordId, this.activeRecord, meta );
            }
        },

        /*
         * Focus a cell or some content of a cell.
         * el is usually a grid table cell including headers, group headers etc. but it could also be an element
         * such as a button or link inside a cell. _setFocusable will soon be called because of focusin handler.
         */
        _setFocus: function( el ) {
            el.tabIndex = 0;
            el.focus();
        },

        /*
         * Make a cell or contents of a cell focusable.
         * el is usually a grid table cell including headers, group headers etc. but it could also be an element
         * such as a button or link inside a cell. When a cell is made focusable all actionable content (e.g. buttons) in the
         * cell is made a tab stop. Any previous cell tab stops are removed.
         */
        _setFocusable: function ( el ) {
            var column, cell$, focusableContentLen, labelBy, colLabelBy, groupName, group, rownum, colnum, ctxMsg,
                curId, row$, controlBreak,
                self = this,
                tabContent = this.options.tabbableCellContent,
                newCell$ = getContainingTableCell$( el );

            function findGroup( name ) {
                var i,j,row, group;

                for ( i = 0; i < self.columnGroups.length; i++ ) {
                    row = self.columnGroups[i];
                    for ( j = 0; j < row.length; j++ ) {
                        group = row[j];
                        if ( group.property === name ) {
                            return group;
                        }
                    }
                }
                return null;
            }

            if ( this.lastFocused ) {
                $( this.lastFocused ).removeAttr( ARIA_LBL_BY ).closest( SEL_CELL ).removeAttr( "id" );
                cell$ = getContainingTableCell$( this.lastFocused );
                // if the cell has changed remove the previous tab stops
                if ( newCell$[0] !== cell$[0] ) {
                    cell$.add( cell$.find( tabContent ).not( ":disabled,.js-asc,.js-desc" ) ).prop( "tabIndex", -1 );
                }
            }
            row$ = newCell$.closest( SEL_ROW );
            rownum = row$.attr( ATTR_DATA_ROWNUM );
            colnum = null;
            if ( newCell$.hasClass( C_GRID_BREAK_HEADER ) || newCell$.hasClass( C_GRID_COL_GROUP )) {
                colnum = this.lastColIndex;
            }
            if ( colnum === null ) {
                colnum = columnIndexFromCell( newCell$ );
            }
            if ( this.tableFrozenHeader$ && !newCell$.closest( SEL_ROW ).closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN ) ) {
                colnum += this.frozenColumnCount;
            }
            colnum += 1;

            if ( row$.hasClass( C_CONTROL_BREAK ) ) {
                ctxMsg = getMessage( "BREAK_CONTEXT" ); // xxx acc todo expand/collapse description when in first col??
            } else if ( row$.hasClass( C_AGGREGATE ) ) {
                ctxMsg = getMessage( "AGG_CONTEXT" );
            } else if ( newCell$.hasClass( C_GRID_COL_HEADER ) ) {
                ctxMsg = getMessage( "HEADER_CONTEXT" );
            } else if ( newCell$.hasClass( C_GRID_COL_GROUP ) ) {
                ctxMsg = getMessage( "GROUP_CONTEXT" );
            } else {
                if ( rownum !== this.curRowNum && colnum !== this.curColNum ) {
                    ctxMsg = formatMessage( "ROW_COLUMN_CONTEXT", rownum, colnum );
                } else if ( rownum !== this.curRowNum ) {
                    ctxMsg = formatMessage( "ROW_CONTEXT", rownum );
                } else if ( colnum !== this.curColNum ) {
                    ctxMsg = formatMessage( "COLUMN_CONTEXT", colnum );
                }
                // include control break label in the context if change from one break section to another
                controlBreak = this._getControlBreak( parseInt( rownum, 10 ) );
                if ( controlBreak && controlBreak.offset !== this.curControlBreak ) {
                    ctxMsg += " " + getMessage( "BREAK_CONTEXT" ) + " " + controlBreak.label + ".";
                }
            }
            if ( ctxMsg ) {
                this.accContext$.text( ctxMsg );
            }

            // if the cell contains any buttons focus them
            focusableContentLen = newCell$.find( tabContent ).not( ":disabled,.js-asc,.js-desc" ).prop( "tabIndex", 0 ).length;
            if ( !focusableContentLen ) {
                // otherwise focus the cell
                newCell$.prop( "tabIndex", 0 );
            }

            // it is expected that el is either the cell or a link or button in the cell
            this.lastFocused = el;
            labelBy = "";

            if ( rownum !== this.curRowNum ) {
                // remove old row header ids
                if ( this.curRowHeaders ) {
                    $( this.curRowHeaders ).removeAttr( "id" );
                }
                this.curRowHeaders = "";
                row$ = this._getRowForCell( newCell$ );
                row$.find( "." + C_ROW_HEADER ).not( newCell$ ).each(function( i ) {
                    var id = self.idPrefix + "_rh_" + i;
                    $(this).attr( "id", id );
                    labelBy += id + " ";
                    if ( self.curRowHeaders ) {
                        self.curRowHeaders += ",";
                    }
                    self.curRowHeaders += "#" + id;
                } );
            }
            if ( colnum !== this.curColNum && !this.focusInHeader ) {
                column = this._getColumnMetadata( newCell$ );
                if ( column && column.domId ) {
                    colLabelBy = "";
                    groupName = effectiveGroupName( column );
                    while ( groupName ) {
                        group = findGroup( groupName );
                        if ( group && group.domId ) {
                            colLabelBy = group.domId + " " + colLabelBy;
                        }
                        groupName = group.parentGroupName;
                    }
                    colLabelBy += column.domId;
                    labelBy += colLabelBy + " ";
                } else if ( newCell$.hasClass( C_GRID_SEL_HEADER ) ) {
                    labelBy += this.idPrefix + "_shh ";
                }
            }
            curId = this.idPrefix + "_cur";
            labelBy += curId; // TODO by including the current cell in labeled by some AT read the value twice but if omitted then some AT read nothing at all
            labelBy = this.accContextId + " " + labelBy;
            $( el ).attr( ARIA_LBL_BY, labelBy ).closest( SEL_CELL ).attr( "id", curId );
            this.curRowNum = rownum;
            this.curColNum = colnum;
            this.curControlBreak = controlBreak ? controlBreak.offset : null;
        },

        _getCellFocusable: function( cell$ ) {
            var a$ = cell$.find( this.options.tabbableCellContent ).not( ":disabled,.js-asc,.js-desc" );
            if ( a$.length ) {
                return a$[0];
            }
            return cell$[0];
        },

        _getPrevCellUp: function( cur$, n, noHeader ) {
            var row$,
                next$ = null,
                colIndex = null;

            if ( cur$.hasClass( C_GRID_BREAK_HEADER ) || cur$.hasClass( C_GRID_COL_GROUP )) {
                colIndex = this.lastColIndex;
            }
            if ( colIndex === null ) {
                colIndex = columnIndexFromCell( cur$ );
                this.lastColIndex = colIndex;
            }

            // find the nth previous row
            cur$.closest( SEL_ROW ).prevAll( SEL_VISIBLE ).each( function( i ) {
                var tr$ = $( this );
                // don't go past a filler row
                if ( tr$.hasClass( C_GRID_SCROLL_FILLER ) ) {
                    return false;
                }
                row$ = tr$;
                return i < n - 1;
            } );

            if ( !this.focusInHeader && !noHeader && !row$ ) {
                this.focusInHeader = true;
                if ( cur$.closest( SEL_ROW ).closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN ) ) {
                    row$ = this.tableFrozenHeader$.children().last();
                } else {
                    row$ = this.tableHeader$.children().last();
                }
            }
            if ( row$ ) {
                if ( row$.hasClass( C_CONTROL_BREAK )) {
                    next$ = row$.children().first();
                } else {
                    next$ = cellFromColumnIndex( row$, colIndex );
                }
            }
            return next$;
        },

        _getNextCellDown: function( cur$, n ) {
            var row$,
                next$ = null,
                colIndex = null;

            if ( cur$.hasClass( C_GRID_BREAK_HEADER ) || cur$.hasClass( C_GRID_COL_GROUP )) {
                colIndex = this.lastColIndex;
            }
            if ( colIndex === null ) {
                colIndex = columnIndexFromCell( cur$ );
                this.lastColIndex = colIndex;
            }

            // find the nth next row
            cur$.closest( SEL_ROW ).nextAll( SEL_VISIBLE ).each( function( i ) {
                var tr$ = $( this );
                // don't go past a filler row
                if ( tr$.hasClass( C_GRID_SCROLL_FILLER ) ) {
                    return false;
                }
                row$ = tr$;
                return i < n - 1;
            } );

            if ( this.focusInHeader && !row$ ) {
                this.focusInHeader = false;
                if ( cur$.closest( SEL_ROW ).closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN ) ) {
                    row$ = this.tableFrozenData$.children().first();
                } else {
                    row$ = this.tableData$.children().first();
                }
            }
            if ( row$ ) {
                if ( row$.hasClass( C_CONTROL_BREAK )) {
                    next$ = row$.children().first();
                } else {
                    next$ = cellFromColumnIndex( row$, colIndex );
                }
            }
            return next$;
        },

        _copy: function( pDataTransfer ) {
            var r, c, selection, row$, cells$, row, record, columns, id, value,
                m = this.model,
                o = this.options,
                fmts = o.dataTransferFormats;

            if ( o.selectCells ) {
                columns = [];
                selection = this.getSelectedRange();

                if ( selection && selection.values.length ) {
                    columns = selection.columns.map(function(x) { return x ? o.columns[0][x] : null; } );
                    // begin
                    fmts.forEach(function( x ) {
                        x.writer.begin( m, selection, columns );
                    } );
                    for ( r = 0; r < selection.values.length; r++ ) {
                        id = selection.recordIds[r];
                        record = ( id !== null ) ? m.getRecord(id) : null;
                        // beginRow
                        fmts.forEach( function( x ) {
                            x.writer.beginRow( r, record, id );
                        } );

                        row = selection.values[r];
                        for ( c = 0; c < row.length; c++ ) {
                            value = ( record && columns[c] ) ? m.getValue(record, columns[c].property ) : "";
                            // cell
                            fmts.forEach( function( x ) {
                                x.writer.cell( c, columns[c], value, row[c] );
                            } );
                        }
                        // endRecord
                        fmts.forEach(function( x ) {
                            x.writer.endRow();
                        } );
                    }
                } else {
                    return;
                }
            } else {
                selection = this.getSelection();

                if ( selection.length ) {
                    columns = [];
                    if ( o.rowHeader !== "NONE" ) {
                        // if there is a column header the row selection will include it. do this so columns line up
                        columns.push( null );
                    }
                    this.getColumns().forEach(function( col ) {
                        if ( !col.hidden ) {
                            columns.push( col );
                        }
                    } );
                    // begin
                    fmts.forEach(function( x ) {
                        x.writer.begin( m, selection, columns );
                    } );
                    for ( r = 0; r < selection.length; r++ ) {
                        row$ = selection[r];
                        id = row$.first().attr( ATTR_DATA_ID );
                        record = ( id !== null ) ? m.getRecord(id) : null;
                        // beginRow
                        fmts.forEach( function( x ) {
                            x.writer.beginRow( r, record, id );
                        } );

                        cells$ = row$.children();
                        for ( c = 0; c < cells$.length; c++ ) {
                            value = ( record && columns[c] ) ? m.getValue(record, columns[c].property ) : "";
                            // cell
                            fmts.forEach( function( x ) {
                                x.writer.cell( c, columns[c], value, cells$.eq( c ).text() );
                            } );
                        }
                        // endRecord
                        fmts.forEach(function( x ) {
                            x.writer.endRow();
                        } );
                    }
                    // end
                    fmts.forEach(function( x ) {
                        x.writer.end();
                    } );
                } else {
                    return;
                }
            }

            // end
            fmts.forEach(function( x ) {
                x.writer.end();
                pDataTransfer.setData( x.format, x.writer.toString() );
            } );
        },

        _setSelectionMode: function() {
            var o = this.options,
                prevSel$ = this.element.children( SEL_GRID_BODY ).find( SEL_SELECTED ); // ok to include u-selector here

            this.element.toggleClass("a-GV--selectCells", o.selectCells);

            // do this so selection is cleared even if focus is in header
            prevSel$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
            if ( o.persistSelection ) {
                this.model.clearSelection();
            }
            // only select something if there was a previous selection
            if ( this.lastFocused && prevSel$[0] ) {
                this._select( $(this.lastFocused), null );
            }
        },

        _select: function ( cells$, event, focus, delayTrigger, noNotify ) {
            var prevSelected, start, end, startCol, endCol, temp, toFocus, rows$, selectableRows$, allRows$, checked,
                otherTableChildren$, selectable, id, modelIds, inSameRow, anchor$, startFrozen, endFrozen, a, b, doNotify,
                selectionMade = false,
                o = this.options,
                action = "set",
                self = this,
                prevSel$ = this.element.children( SEL_GRID_BODY ).find( o.selectCells ? "td.is-selected,th.is-selected" : "tr.is-selected" );

            // this just tracks the selection state in modelIds the model is updated later
            function updateModelSelectionState( rows$, selectState ) {
                var last;

                if ( o.persistSelection ) {
                    last = rows$.length;
                    if ( self.tableFrozenHeader$ ) {
                        last = last / 2;
                    }
                    rows$.each( function( i ) {
                        var id;

                        if ( i >= last ) {
                            return false; // break
                        }
                        id = $( this ).attr( ATTR_DATA_ID );
                        if ( selectState && modelIds[id] === false ) {
                            delete modelIds[id]; // unselect then select = do nothing
                        } else {
                            modelIds[id] = selectState;
                        }
                    } );
                }
            }

            if ( o.persistSelection ) {
                modelIds = {}; // stores model selection state true = select, false = unselect
            }

            // can't select something that isn't visible
            cells$ = cells$.filter( SEL_VISIBLE );
            rows$ = cells$.parent( SEL_ROW );
            inSameRow = this.lastRow$ && ( this.lastRow$.index( cells$.first() ) >= 0 );

            // if there are frozen columns
            if ( this.tableFrozenHeader$ ) {
                // todo this could be expensive especially if there are cells from multiple rows and/or cells from each table.
                // need to add corresponding rows from the other table
                selectable = [];
                rows$.each(function() {
                    otherTableChildren$ = self._getOtherTable( $( this ) );
                    selectable.push( otherTableChildren$[self._rowIndex( $( this ) )] );
                });
                rows$ = rows$.add( $( selectable ) );
            }

            if ( event && ( o.selectCells && o.multipleCells || !o.selectCells && o.multiple ) ) {
                if ( event.type === "click" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === keys.SPACE ) {
                        if ( event.ctrlKey ) {
                            action = "toggle";
                        } else if ( event.shiftKey ) {
                            action = "range";
                        } else {
                            action = "add";
                        }
                    } else if ( event.ctrlKey ) {
                        action = "none";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                }
                if ( o.selectCells ) {
                    // in cell selection mode range and set are the only options
                    if ( action !== "range" ) {
                        action = "set";
                    }
                }
                // if there is no target it is a fake event so get rid of it so not used in notification
                if ( !event.target ) {
                    event = null;
                }
            }

            if ( action === "range" && ( !this.selectAnchor || this.focusInHeader ) ) {
                action = "set"; // when there is no anchor (or in header) turn range selection into set
            }

            // if the cell is in the header don't change the selection
            if ( !this.focusInHeader ) {
                // clear out previous selection if needed
                if ( action === "set" || action === "range" ) {
                    if ( o.rowHeaderCheckbox ) {
                        prevSel$.find( SEL_SELECTOR ).removeClass( C_SELECTED );
                    }
                    prevSel$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
                    if ( o.persistSelection ) {
                        this.model.clearSelection();
                    }
                }

                // perform selection action
                if ( o.selectCells ) {
                    if ( action === "range" ) {
                        anchor$ = $( this.selectAnchor );
                        start = domIndex( anchor$.parent() ); // todo perf?
                        end = domIndex( cells$.last().parent() );
                        if ( start > end ) {
                            temp = end;
                            end = start;
                            start = temp;
                        }
                        startCol = domIndex( anchor$ );
                        startFrozen = this.tableFrozenData$ && anchor$.closest( this.tableFrozenData$ ).length > 0;
                        endCol = domIndex( cells$.last() );
                        endFrozen = this.tableFrozenData$ && cells$.last().closest( this.tableFrozenData$ ).length > 0;
                        if ( ( startFrozen === endFrozen  && startCol > endCol ) || ( startFrozen !== endFrozen  && !startFrozen ) ) {
                            temp = endCol;
                            endCol = startCol;
                            startCol = temp;
                            temp = endFrozen;
                            endFrozen = startFrozen;
                            startFrozen = temp;
                        }
                        // todo perf?
                        if ( this.tableData$ && !endFrozen ) {
                            this.tableData$.children().each( function( index ) {
                                a = startCol;
                                b = endCol + 1;
                                if ( startFrozen !== endFrozen ) {
                                    a = 0;
                                }
                                if ( index >= start && index <= end && $( this ).hasClass( "a-GV-row" ) && !$( this ).hasClass( C_AGGREGATE ) ) {
                                    $( this ).children().slice( a, b).addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                                }
                            } );
                        }
                        if ( startFrozen && this.tableFrozenData$ ) {
                            a = startCol;
                            b = endCol + 1;
                            if ( startFrozen !== endFrozen ) {
                                b = undefined;
                            }
                            this.tableFrozenData$.children().each( function( index ) {
                                if ( index >= start && index <= end && $( this ).hasClass( "a-GV-row" ) && !$( this ).hasClass( C_AGGREGATE ) ) {
                                    $( this ).children().slice( a, b ).addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                                }
                            } );
                        }
                    } else { // must be set
                        cells$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                        this.selectAnchor = cells$[0];
                    }
                } else {
                    prevSelected = rows$.hasClass( C_SELECTED );
                    selectableRows$ = rows$.filter( ".a-GV-row" ).not( ".is-aggregate" );
                    if ( action === "set" ||  action === "add" || (action === "toggle" && !prevSelected) ) {
                        selectableRows$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                        this.selectAnchor = selectableRows$[0];
                        selectionMade = true;
                    } else if ( action === "range" ) {
                        start = this._rowIndex( $( this.selectAnchor ) );
                        end = this._rowIndex( rows$.last() );
                        if ( start > end ) {
                            temp = end;
                            end = start;
                            start = temp;
                        }
                        selectable = [];
                        // because _rowIndex called can be sure table{Frozen}DataChildren$ exist
                        this.tableDataChildren$.each( function( index ) {
                            if ( index >= start && index <= end && $( this ).hasClass( "a-GV-row" ) && !$( this ).hasClass( C_AGGREGATE ) ) {
                                selectable.push( this );
                            }
                        } );
                        if ( this.tableFrozenData$ ) {
                            this.tableFrozenDataChildren$.each( function( index ) {
                                if ( index >= start && index <= end && $( this ).hasClass( "a-GV-row" ) && !$( this ).hasClass( C_AGGREGATE ) ) {
                                    selectable.push( this );
                                }
                            } );
                        }
                        selectableRows$ = $( selectable );
                        selectableRows$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true );
                        selectionMade = true;
                    } else if ( action === "toggle" && prevSelected ) {
                        selectableRows$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED );
                        this.selectAnchor = selectableRows$[0];
                        if ( o.rowHeaderCheckbox ) {
                            selectableRows$.find( SEL_SELECTOR ).removeClass( C_SELECTED );
                        }
                        updateModelSelectionState( selectableRows$, false );
                    }

                    if ( selectionMade ) {
                        if ( o.rowHeaderCheckbox ) {
                            selectableRows$.find( SEL_SELECTOR ).addClass( C_SELECTED );
                        }
                        updateModelSelectionState( selectableRows$, true );
                    }

                    if ( o.rowHeaderCheckbox && o.multiple ) {
                        // set all checked
                        // xxx for now assume select all applies to all rows currently rendered
                        allRows$ = this.tableFrozenData$.children( ".a-GV-row" );
                        checked = (allRows$.length === allRows$.filter( SEL_SELECTED ).length);
                        this.tableFrozenHeader$.find( SEL_SELECTOR ).first()
                            .toggleClass( C_SELECTED, checked )
                            .attr( ARIA_CHECKED, checked ? TRUE : FALSE )
                            .closest( SEL_GRID_SEL_HEADER ).toggleClass( C_SELECTED, checked );
                    }

                    if ( o.persistSelection ) {
                        // Update selection state in the model
                        for ( id in modelIds ) {
                            if ( modelIds.hasOwnProperty( id ) ) {
                                this.model.setSelectionState( id, modelIds[id] );
                            }
                        }
                    }
                }
            }

            // focus if needed
            if ( cells$.length > 0 ) {
                // xxx when Ctrl+A this moves the last focused cell
                toFocus = this._getCellFocusable( cells$.first() );
                if ( focus ) {
                    this._setFocus( toFocus );
                } else {
                    this._setFocusable( toFocus );
                }
                // set the current row after focus has been set so that lastRow$ is correct during any cell or row deactivation
                if ( !inSameRow ) {
                    this._setCurrentRow( cells$[0] );
                }
                /*xxx this is not correct and doesn't seem to be needed
                // scroll into view if needed xxx
                sp = cells$.first().closest( ".a-GV-w-hdr,.a-GV-w-scroll" )[0];
                if ( sp ) {
                    spOffset = $(sp).offset();
                    glOffset = this.element.offset();
                    offset = cells$.first().offset();
                    console.log("xxx spOffset ", glOffset, spOffset, offset, sp.scrollLeft);
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp.offsetHeight ) ) {
                        sp.scrollTop = offset.top - glOffset.top;
                    }
                    if ( ( offset.left + cells$[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp.offsetWidth ) )  {
                        sp.scrollLeft = offset.left - glOffset.left;
                        console.log("xxx set scroll left to " + sp.scrollLeft);
                    }
                }
                */
            }

            // notify if needed
            if ( !this.focusInHeader && ( action === "toggle" ||
                (action === "range" && !prevSelected) ||
                (action === "add" && !prevSelected) ||
                (action === "set" && !util.arrayEqual( prevSel$, rows$ ) ) ) ) {

                // don't fire selection change for click events when in navigation mode xxx does this apply when clicking on links in cells?
                doNotify = !(noNotify || ( o.navigation && event && event.type === "click" ));
                if ( delayTrigger ) {
                    notifyLongDelay( this, doNotify, event );
                } else {
                    notifyDelay( this, doNotify, event );
                }
            }
        },

        _clearChildrenRowCache: function() {
            // clear the cache of children rows
            this.tableFrozenDataChildren$ = this.tableDataChildren$ = null;
        },

        // returns the children of the other table
        _getOtherTable: function( row$ ) {
            var otherTableChildren$,
                isFrozen = row$.closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN );

            if ( !row$.parents( SEL_GRID_BODY ).length ) {
                otherTableChildren$ = (isFrozen ? this.tableHeader$ : this.tableFrozenHeader$).children();
            } else {
                // cache the children collection because it is used often
                if ( isFrozen ) {
                    if ( !this.tableDataChildren$ ) {
                        this.tableDataChildren$ = this.tableData$.children();
                    }
                    otherTableChildren$ = this.tableDataChildren$;
                } else {
                    if ( !this.tableFrozenDataChildren$ ) {
                        this.tableFrozenDataChildren$ = this.tableFrozenData$.children();
                    }
                    otherTableChildren$ = this.tableFrozenDataChildren$;
                }
            }
            return otherTableChildren$;
        },

        _rowIndex: function( row$ ) {
            var tableChildren$,
                isFrozen = row$.closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN );

            if ( !row$.parents( SEL_GRID_BODY ).length ) {
                return domIndex( row$ );
            } else {
                // cache the children collection because it is used often
                // do both so the cache is available as a side effect
                if ( this.tableFrozenData$ && !this.tableFrozenDataChildren$ ) {
                    this.tableFrozenDataChildren$ = this.tableFrozenData$.children();
                }
                if ( !this.tableDataChildren$ ) {
                    this.tableDataChildren$ = this.tableData$.children();
                }
                if ( isFrozen ) {
                    tableChildren$ = this.tableFrozenDataChildren$;
                } else {
                    tableChildren$ = this.tableDataChildren$;
                }
            }
            return tableChildren$.index( row$ );
        },

        _getRowForCell: function( cell$ ) {
            var row$ = cell$.closest( SEL_ROW );

            if ( this.tableFrozenHeader$ ) {
                row$ = row$.add( this._getOtherTable( row$ ).eq( this._rowIndex( row$ ) ) );
            }
            return row$;
        },

        _setCurrentRow: function( cell ) {
            this.lastRow$ = this._getRowForCell( $( cell ) ).children();
        },

        _fireActivate: function( event, cell$ ) {
            var row$ = this._getRowForCell( cell$ );
            this._trigger( EVENT_ACTIVATE_CELL, event, {
                cell$: cell$,
                row$: row$
            });
        },

        _nextCellWithWrap: function( cell$ ) {
            var row$, otherTableChildren$, index,
                nextCell$ = cell$.next();

            if ( !nextCell$.length ) {
                row$ = cell$.closest( SEL_ROW );
                // if there are frozen columns
                if ( this.tableFrozenHeader$ ) {
                    otherTableChildren$ = this._getOtherTable( row$ );
                    index = this._rowIndex( row$ );
                    // if currently in last frozen column
                    if ( row$.closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN ) ) {
                        // go to first non-frozen cell in same row of other table
                        nextCell$ = otherTableChildren$.eq( index ).children().first();
                    } else {
                        // go to first cell in next row of other table
                        nextCell$ = otherTableChildren$.eq( index + 1 ).children().first();
                    }
                } else {
                    // go to first cell in next row
                    nextCell$ = row$.next().children().first();
                }
            }
            return nextCell$;
        },

        _prevCellWithWrap: function( cell$ ) {
            var row$, otherTableChildren$, index,
               prevCell$ = cell$.prev();

            if ( !prevCell$.length ) {
                row$ = cell$.closest( SEL_ROW );
                // if there are frozen columns
                if ( this.tableFrozenHeader$ ) {
                    otherTableChildren$ = this._getOtherTable( row$ );
                    index = this._rowIndex( row$ );
                    // if currently in first non-frozen column
                    if ( !row$.closest( SEL_TABLE ).parent().hasClass( C_GRID_WRAP_FROZEN ) ) {
                        // go to last non-frozen cell in same row of other table
                        prevCell$ = otherTableChildren$.eq( index ).children().last();
                    } else {
                        // go to last cell in prev row of other table
                        index -= 1;
                        if ( index >= 0 ) {
                            prevCell$ = otherTableChildren$.eq( index ).children().last();
                        }
                    }
                } else {
                    // go to last cell in prev row
                    prevCell$ = row$.prev().children().last();
                }
            }
            return prevCell$;
        },

        _clearHoverStates: function() {
            this.element.find( SEL_HOVER ).removeClass( C_HOVER );
            this.columnControls$.hide();
            this.columnHandle$.hide();
        },

        _setRowHoverState: function( row$ ) {
            this.element.find( SEL_HOVER ).removeClass( C_HOVER ); // remove previous hover state
            row$ = this._getRowForCell( row$.children().eq(0) ); // get both rows if any frozen
            row$.addClass( C_HOVER );
        },

        /*
         * The possible directions are "asc" and "desc"
         * The possible actions are:
         * - set: set this column to given direction clearing all others
         * - clear: don't sort any columns
         * - remove: don't sort this column leave other columns alone
         * - add: sort this column in given direction leave other columns alone (column wasn't sorted)
         * - change: sort this column in given direction leave other columns alone (column was sorted)
         * How the action is determined:
         *  Column       | User action             | columnSortMultiple setting
         *  current sort | direction   | Shift Key | false     | true
         *  -----------------------------------------------------------------
         *  asc/desc     | asc/desc    | true      | clear     | remove
         *  asc/desc     | asc/desc    | false     | clear     | clear
         *  asc/desc     | desc/asc    | true      | set       | change
         *  asc/desc     | desc/asc    | false     | set       | set
         *  none         | desc/asc    | true      | set       | add
         *  none         | desc/asc    | false     | set       | set
         */
        _sortChange: function( event, cell$, dir ) {
            var same,
                action = "set",
                column = this._getColumnMetadata( cell$ );

            if ( column.canSort ) {
                same = dir === column.sortDirection;
                if ( this.options.columnSortMultiple ) {
                    if ( event.shiftKey ) {
                        action = "add";
                        if ( same ) {
                            action = "remove";
                        } else if ( !column.sortDirection ) {
                            action = "add";
                        } else {
                            action = "change";
                        }
                    } else {
                        if ( same ) {
                            action = "clear";
                        }
                    }
                } else {
                    if ( same ) {
                        action = "clear";
                    }
                }
                this._trigger( EVENT_SORT_CHANGE, event, {
                    header$: cell$,
                    column: column,
                    direction: dir,
                    action: action
                });
            }
        },

        // todo think it might be nice to include based on shift key if the sort will be additive and what number
        // the problem is that this widget has no idea what the caller will do with the sort event and also the
        // next sort number is not readily known
        // also think about if the action should show up on the status bar
        _updateColumnControls: function( column ) {
            var titleAsc, titleDesc,
                ascActive = false,
                descActive = false;

            if ( column.sortDirection === "asc" ) {
                titleAsc = getMessage( "SORT_OFF" );
                titleDesc = getMessage( "SORT_DESCENDING" );
                ascActive = true;
            } else if ( column.sortDirection === "desc" ) {
                titleAsc = getMessage( "SORT_ASCENDING" );
                titleDesc = getMessage( "SORT_OFF" );
                descActive = true;
            } else {
                titleAsc = getMessage( "SORT_ASCENDING" );
                titleDesc = getMessage( "SORT_DESCENDING" );
            }
            this.columnControls$.find( ".js-asc" )
                .attr( ATTR_TITLE, titleAsc ).attr( ARIA_LABEL, titleAsc ).toggleClass( C_ACTIVE, ascActive );
            this.columnControls$.find( ".js-desc" )
                .attr( ATTR_TITLE, titleDesc ).attr( ARIA_LABEL, titleDesc ).toggleClass( C_ACTIVE, descActive );
        },

        // headerHeight is optional
        _adjustSizeForScrollBars: function( h, w, headerHeight ) {
            var c$ = this.element.children(),
                bodyFrozen$ = c$.filter( SEL_GRID_BODY ).children( SEL_GRID_WRAP_FROZEN ),
                headerScroll$ = c$.filter( SEL_GRID_HEADER ).children( SEL_GRID_WRAP_HEADER ),
                bars = hasScrollbar( this.tableData$.parent(), headerHeight );

            // if content has a horizontal scrollbar
            if ( bars.h ) {
                h -= util.getScrollbarSize().height;
            }
            bodyFrozen$.height( h );
            // if content has a vertical scrollbar
            if ( bars.v ) {
                w -= util.getScrollbarSize().width;
            }
            headerScroll$.width( w );
        },

        //
        // Column Header scroll support
        //

        _headerScrollCheck: function( pos, width, update ) {
            var sLeft, scrolled, offsetLeft,
                deltaX = 0,
                sp = this.hdrScrollParent;

            if ( sp ) {
                offsetLeft = $( this.hdrScrollParent ).offset().left;

                if ( this.element.hasClass( C_RTL ) ) {
                    if ( pos - width - offsetLeft < HEADER_SCROLL_SENSITIVITY ) {
                        deltaX = -HEADER_SCROLL_SPEED;
                    } else if ( ( offsetLeft + sp.offsetWidth ) - pos < HEADER_SCROLL_SENSITIVITY && ( offsetLeft + sp.offsetWidth ) - pos > 0 ) {
                        deltaX = HEADER_SCROLL_SPEED;
                    }
                    if ( update && deltaX ) {
                        sLeft = sp.scrollLeft + deltaX;
                        if ( sLeft > 0 ) {
                            sp.scrollLeft = 0;
                            deltaX = 0;
                        } else if ( sLeft > sp.scrollWidth - sp.clientWidth ) {
                            sp.scrollLeft = sp.scrollWidth - sp.clientWidth;
                            deltaX = 0;
                        } else {
                            sp.scrollLeft = sLeft;
                        }
                    }
                } else {
                    if ( ( offsetLeft + sp.offsetWidth ) - ( pos + width ) < HEADER_SCROLL_SENSITIVITY ) {
                        deltaX = HEADER_SCROLL_SPEED;
                    } else if ( pos - offsetLeft < HEADER_SCROLL_SENSITIVITY && pos - offsetLeft > 0 ) {
                        deltaX = -HEADER_SCROLL_SPEED;
                    }
                    if ( update && deltaX ) {
                        sLeft = sp.scrollLeft + deltaX;
                        if ( sLeft < 0 ) {
                            sp.scrollLeft = 0;
                            deltaX = 0;
                        } else if ( sLeft > sp.scrollWidth - sp.clientWidth ) {
                            sp.scrollLeft = sp.scrollWidth - sp.clientWidth;
                            deltaX = 0;
                        } else {
                            sp.scrollLeft = sLeft;
                        }
                    }
                }
                scrolled = !!deltaX;
            }
            return scrolled;
        },

        _headerScrollStart: function( pos, width, callback ) {
            var self = this,
                timeIndex = 0,
                times = [ 151, 134, 119, 106, 95, 86, 79, 74, 71]; // 70 + (9 - i)^2

            function scroll() {
                self.scrollTimerId = setTimeout( function() {
                    if ( self._headerScrollCheck( pos, width, true ) ) {
                        callback();
                        scroll();
                    } else {
                        self._headerScrollStop();
                    }
                }, times[timeIndex] );
                if ( timeIndex < times.length - 1 ) {
                    timeIndex += 1;
                }
            }

            if ( this.scrollTimerId ) {
                this._headerScrollStop();
            }
            scroll();
        },

        _headerScrollStop: function() {
            clearTimeout( this.scrollTimerId );
            this.scrollTimerId = null;
        },

        _expandCollapseControlBreak: function( pRows, expand ) {
            var i, row$, otherTableChildren$, title;

            function doRow( _, tr ) {
                var tr$ = $(tr);
                if ( tr$.hasClass( "a-GV-row" ) && !tr$.hasClass( C_AGGREGATE ) ) {
                    tr$[ expand ? "show" : "hide" ]();
                } else {
                    return false;
                }
            }

            if ( !$.isArray( pRows ) ) {
                pRows = [ pRows ];
            }

            for ( i = 0; i < pRows.length; i++ ) {
                row$ = pRows[i];
                if ( row$.hasClass( C_CONTROL_BREAK ) ) {
                    if ( row$.length !== 2 && this.tableFrozenHeader$ ) {
                        otherTableChildren$ = this._getOtherTable( row$ );
                        row$ = $([ row$[0], otherTableChildren$[this._rowIndex( row$ )] ]);
                    }
                    row$.first().nextAll().each( doRow );
                    if ( row$.length === 2 ) {
                        row$.last().nextAll().each( doRow );
                    }
                    if ( expand ) {
                        title = getMessage( "BREAK_COLLAPSE" );
                        row$.addClass( C_EXPANDED )
                            .find( ".js-toggleBreak" ).attr( ARIA_EXPANDED, TRUE )
                            .attr( ATTR_TITLE, title ).attr( ARIA_LABEL, title )
                            .children( ".a-Icon" ).removeClass( "icon-right-arrow" ).addClass("icon-down-arrow");
                    } else {
                        title = getMessage( "BREAK_EXPAND" );
                        row$.removeClass( C_EXPANDED )
                            .find( ".js-toggleBreak" ).attr( ARIA_EXPANDED, FALSE )
                            .attr( ATTR_TITLE, title ).attr( ARIA_LABEL, title )
                            .children( ".a-Icon" ).removeClass( "icon-down-arrow" ).addClass("icon-right-arrow");
                    }
                }
            }
        },

        /**
         * <p>This method is for <strong>developer debugging only</strong>.
         * When developing an item plug-in that is to be used in a grid cell it can be difficult to debug CSS styling
         * because as soon as the cell looses focus the item is moved in the DOM to a hidden area. Calling this with
         * a true argument to turn on cell edit debugging leaves the item in the cell after it looses focus so that
         * the DOM and styles can be inspected with browser developer tools. This is not effective for end user use.
         * Because the cell is not fully deactivated it can affect editing in general. Call it again with false to
         * turn off cell edit debugging or refresh the page.</p>
         * @param {boolean} pValue Set to true to debug. Keeps cells from fully deactivating when they loose focus. Set to false when done.
         * @example <caption>This example shows how to debug a column item plug-in. From the browser JavaScript console:</caption>
         * var view$ = ... // this is the grid widget jQuery object.
         * view$.grid("debugCellEdit", true)
         * // do your debugging
         * view$.grid("debugCellEdit", false)
         */
        debugCellEdit: function( pValue ) {
            this.debugDontDeactivateCell = !!pValue;
        }

        /* todo remove when no longer needed
        //
        // For debugging
        //
        dumpColumnWidths: function() {
            var self = this,
                ctrl$ = this.element,
                dataWidths  = "  data width: ",
                hdrWidths   = "header width: ",
                colWidths   = "   col width: ",
                dataCols$ = ctrl$.children( SEL_GRID_BODY ).find( "thead" ).find( ".a-GV-header" ),
                headerCols$ = ctrl$.children( SEL_GRID_HEADER ).find( "thead" ).find( ".a-GV-header" );

            dataCols$.each(function( i ) {
                var col$ = $( this ),
                    col = self.columns[ col$.attr(ATTR_DATA_IDX) ];

                if (i > 0) {
                    hdrWidths += ", ";
                    dataWidths += ", ";
                    colWidths += ", ";
                }
                hdrWidths += headerCols$.eq(i).width() + "/" + headerCols$.eq(i).outerWidth();
                dataWidths += col$.width() + "/" + col$.outerWidth();
                if ( col ) {
                    colWidths += (col.width || "-") + "/" + (col.curWidth || "-");
                } else {
                    colWidths += "- / -";
                }
            });
            console.log("Dump column widths:");
            console.log(colWidths);
            console.log(hdrWidths);
            console.log(dataWidths);
            ctrl$.find( SEL_TABLE ).each(function() {
                console.log("table widths: " + $(this ).width());
            });
        }
        */
    }, apex.widget.contextMenuMixin ) );

})( apex.util, apex.model, apex.debug, apex.lang, apex.item, apex.clipboard, apex.widget.util, apex.jQuery );
