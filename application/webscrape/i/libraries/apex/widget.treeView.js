/*!
 UI tree view widget
 Copyright (c) 2010, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @uiwidget treeView
 * @since 5.0
 *
 * @borrows contextMenuMixin#contextMenuAction as treeView#contextMenuAction
 * @borrows contextMenuMixin#contextMenu as treeView#contextMenu
 * @borrows contextMenuMixin#contextMenuId as treeView#contextMenuId
 *
 * @classdesc
 * <p>A jQuery UI widget that implements a tree view used to display and interact with hierarchical data.
 * Implements tree view functionality according to WAI-ARIA authoring
 * practices design patterns and the DHTML Style Guide with minor differences in keyboard handling.
 *
 * <p>The treeView works with any data model via the {@link treeNodeAdapter} interface supplied when the treeView is created.
 * The tree data model must be singly rooted. If the data doesn't have a single root then the adapter must generate one
 * dynamically where the multiple roots are its children. The tree need not display the root. For a multi-rooted tree
 * set the {@link treeView#showRoot} option to false. With <code class="prettyprint">showRoot</code>
 * false the adapter will never be asked for the label or icon etc. of the root node.
 * The tree can also be created from <a href="#from-markup-section">markup</a></p>
 *
 * <h3 id="selection-section">Selection
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#selection-section"></a>
 * </h3>
 * <p>A treeView supports single or multiple selection. See option {@link treeView#multiple}. Tree nodes
 * that are disabled cannot be selected but can be focused. Selection is accomplished with mouse and/or keyboard.
 * Node selection is independent of hierarchy. In other words slecting a parent node does not select all of its
 * decendents.</p>
 *
 * <p>It is also possible to include as part of each tree node a checkbox for multiple selection or
 * radio button for single selection using the {@link treeView#nodeSelector} option.</p>
 *
 * <p>On a touch enabled device where the user has interacted with touch a multi select treeView will
 * automatically enable checkbox selection.</p>
 *
 * <h3 id="context-menus-section">Context Menus
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#context-menus-section"></a>
 * </h3>
 * <p>The treeView has easy integration with the {@link menu} widget to provide context menu support.
 * The {@link treeView#contextMenu} option is used to provide a {@link menu} widget options object.
 * When the <code class="prettyprint">contextMenu</code> option is used the {@link menu#event:beforeOpen}
 * event/callback ui argument has these additional properties:</p>
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>treeView: This tree jQuery object.</li>
 * <li>treeNodeAdapter: The {@link treeNodeAdapter} for this tree.</li>
 * <li>selection: A jQuery object with the selected tree nodes at the time the menu was opened.</li>
 * <li>selectedNodes: An array of the selected model nodes at the time the menu was opened.</li>
 * </ul>
 * <p>Also the {@link menu#event:afterClose} event/callback will automatically focus the tree if the menu action
 * didn't take the focus and the ui argument has these additional properties:
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>treeView: This tree jQuery object.</li>
 * </ul>
 *
 * <p>If using the <code class="prettyprint">contextMenu</code> option the {@link treeView#contextMenuId}
 * option can be used to give the menu element an ID.
 * This is useful if other code must refer to the menu element or widget.</p>
 *
 * <p>You can reference an already existing {@link menu} widget by specifying the {@link treeView#contextMenuId}
 * in place of the {@link treeView#contextMenu} option.</p>
 *
 * <p>If for any reason you don't want to use the {@link menu} widget, the {@link treeView#contextMenuAction} option
 * allows you to respond to mouse or keyboard interactions that typically result in a context menu.
 * Specifically Right Mouse click (via <code class="prettyprint">contextmenu</code> event),
 * Shift-F10 key (via <code class="prettyprint">keydown</code> event) and the
 * Windows context menu key (via <code class="prettyprint">contextmenu</code> event).
 * The original event is passed to the {@link treeView#contextMenuAction} function.
 * The event object can be used to position the menu. If you implement your own menu it is best if you put focus
 * back on the treeView using the {@link treeView#focus} method when the menu closes (unless the menu action directs focus
 * elsewhere).</p>
 *
 * <p>Only one of {@link treeView#contextMenuAction} and {@link treeView#contextMenu} or {@link treeView#contextMenuId}
 * can be specified.
 * The {@link treeView#contextMenu} and {@link treeView#contextMenuId} options can only be set when
 * the treeView is initialized and it can't be changed.
 * The {@link treeView#contextMenuAction} cannot be set if the {@link treeView#contextMenu} or
 * {@link treeView#contextMenuId} options were given when the tree was created.</p>
 *
 * <h3 id="drag-and-drop-section">Drag and Drop
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#drag-and-drop-section"></a>
 * </h3>
 * <p>To enable drag and drop set the {@link treeView#dragAndDrop} option to true. The treeView can be a
 * drag source for either a jQuery UI droppable or the same treeView instance and it can be a drop target for
 * either a jQuery UI draggable or the same treeView instance.</p>
 * <p>To work with a droppable make sure the scope options of the droppable and treeView match and that the droppable
 * accept option allows the treeView node (an element with class <code class="prettyprint">a-TreeView-content</code>).
 * On droppable drop you would typically call the {@link treeView#getSelection} or {@link treeView#getSelectedNodes}
 * of the treeView instance.</p>
 *
 * <p>To work with a draggable set the draggable <code class="prettyprint">connectToTreeView</code> option to a
 * selector for the treeView instance you want to be a drop target.
 * Note a treeView plugin extends the draggable to add the <code class="prettyprint">connectToTreeView</code> option.</p>
 *
 * <p>The treeView supports dragging single or multiple nodes. In order to drag multiple nodes both the
 * {@link treeView#multiple} and {@link treeView#dragMultiple} options must be true. Note it is possible for a treeView
 * instance to support multiple selection but single drag. The reverse (single selection and multiple drag) is not
 * possible.</p>
 *
 * <p>Regardless of the drag source there are two modes of behavior for identifying drop targets. The mode is determined
 * by the {@link treeView#dragReorder} option. If false (the default) nodes which can have children of the type(s)
 * being dragged are targets and dropping on the target node results in the dragged node(s) being added as children.
 * This mode is suitable when the children have an implicit order such as files in a file system folder.
 * If <code class="prettyprint">dragReorder</code> is true then a placeholder node,
 * which dynamically moves between nodes whose parent can have children
 * of the type(s) being dragged, is the target. Dropping on the placeholder target adds the nodes where the
 * placeholder is. This mode is suitable for when nodes can be explicitly ordered by the user such as with
 * sections in a document outline.</p>
 *
 * <p>A drag and drop can perform various operations. There is builtin support for move, copy and add operations. Add
 * only works when the drag is from a draggable, move and copy work when the tree is the drag source and target.
 * The nodeAdapter decides what operations are supported with the {@link treeView#dragOperations} method based on the
 * types of nodes being dragged, or any other context available to the adapter. Different operations are selected with
 * keyboard modifiers: Shift, Ctrl, Alt, and Meta (only one modifier is allowed). Operations besides move, copy, and
 * add are handled with custom logic in the beforeStop event handler.
 * See {@Link treeNodeAdapter#moveNodes}, and {@link treeNodeAdapter#copyNodes} for how
 * the <code class="prettyprint">treeNodeAdapter</code> is used for drag and drop move and copy operations.</p>
 *
 * <h3 id="from-markup-section">Tree From Markup
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#from-markup-section"></a>
 * </h3>
 * <p>A tree data model can be created from HTML markup inside the treeView element. A tree from markup has much less
 * functionality. The markup is nested lists using <code class="prettyprint">&lt;ul></code>,
 * <code class="prettyprint">&lt;li></code>, and <code class="prettyprint">&lt;a></code> or
 * <code class="prettyprint">&lt;span></code> for the node labels.
 * This is typically used for navigation such as with a site map. The markup is converted to data and a default adapter
 * with no editing capability is created to interface to it. The markup is removed as it is converted to data and is
 * not restored even if the treeView widget is destroyed. The <code class="prettyprint">&lt;li></code>
 * element can include these attributes:</p>
 * <ul>
 *     <li>class - Value returned by {@link treeNodeAdapter#getClasses}.</li>
 *     <li>data-id - Value used by {@link treeNodeAdapter#setViewId}.</li>
 *     <li>data-icon - Value returned by {@link treeNodeAdapter#getIcon}.</li>
 *     <li>data-type - Used by default adapter, only useful if supplying @{link treeNode#adapterTypesMap}.</li>
 *     <li>data-current - A true value will select that node.</li>
 *     <li>data-disabled - Value returned by {@link treeNodeAdapter#isDisabled}.</li>
 * </ul>
 * <p>The span or anchor content is the label. The anchor <code class="prettyprint">href</code> attribute is the link
 * (returned by {@link treeNodeAdapter#getLink}) used for navigation. Unless the top level list has a single
 * item {@link treeView#showRoot} should be false. Typically {@link treeView#multiple} is false and
 * {@link treeView#navigation} is true. An example below shows the basic expected markup.</p>
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
 * <tr><td>Up Arrow, Down Arrow</td> <td>Moves focus to the previous or next visible node and selects it.</td></tr>
 * <tr><td>Shift+Up Arrow,<br> Shift+Down Arrow</td> <td>Extends the selection to the previous or next visible node. Only if multiple selection is enabled.</td></tr>
 * <tr><td>Ctrl+Up Arrow,<br> Ctrl+Down Arrow</td> <td>Moves focus to the previous or next visible node without changing the selection. Only if multiple selection is enabled.</td></tr>
 * <tr><td>Ctrl+Up Arrow,<br> Ctrl+Down Arrow</td> <td>Moves focus to the previous or next visible node without changing the selection. Only if multiple selection is enabled.</td></tr>
 * <tr><td>Space</td>                <td>Selects the focused node. Only if multiple selection is enabled.</td></tr>
 * <tr><td>Ctrl+Space</td>           <td>Toggles selection of the focused node. Only if multiple selection is enabled.</td></tr>
 * <tr><td>Right Arrow</td>          <td>On a collapsed node, expands the node.<br>
 *                                   On an expanded node, moves to the first first child of the node.<br>
 *                                   On a leaf node, does nothing.</td></tr>
 * <tr><td>Left Arrow</td>           <td>On an expanded node, collapses the node.<br>
 *                                   On a collapsed or leaf node, moves focus to the node's parent.</td></tr>
 * <tr><td>Home</td>                 <td>Moves focus to the first visible node and selects it. Shift and Ctrl modifiers can be used if multiple selection is enabled.</td></tr>
 * <tr><td>End</td>                  <td>Moves focus to the last visible node and selects it. Shift and Ctrl modifiers can be used if multiple selection is enabled.</td></tr>
 * <tr><td>Page Up,<br> Page Down</td>  <td>Moves up or down a page of nodes. Shift modifier can be used if multiple selection is enabled.</td></tr>
 * <tr><td>printable character(s)</td>  <td>Sets focus to and selects the next node with a label that starts with the character(s).</td></tr>
 * <tr><td>Enter</td>                <td>Activates the focused node. The behavior of a node when it is activated is application defined.
 *                                   If the node has a link then navigate to that link.<br>
 *                                   During in-place editing completes the editing.</td></tr>
 * <tr><td>Context Menu,<br> Shift+F10</td>   <td>Invoke Context Menu if defined on current node.</td></tr>
 * <tr><td>F2</td>                   <td>Rename the node. Only if the tree and node allow renaming and keyboard rename is enabled.</td></tr>
 * <tr><td>Insert</td>               <td>Insert a new node. Only if the tree and node allow inserting and keyboard insert is enabled.</td></tr>
 * <tr><td>Delete</td>               <td>Delete the node. Only if the tree and node allow deleting and keyboard delete is enabled.</td></tr>
 * <tr><td>Escape</td>               <td>Cancels in-place node label editing.</td></tr>
 * <tbody>
 * <table>
 * <p>When the direction is right to left (RTL) the behavior of the left and right arrow keys is reversed.</p>
 *
 * @desc Creates a treeView widget.
 *
 * @param {Object} options A map of option-value pairs to set on the widget.
 *
 * @example <caption>Create a simple treeView with 4 nodes using the default node adapter. The page contains an
 * empty div element with id <code class="prettyprint">simpleTree</code>.</caption>
 * var treeData = {
 *     label: "Root",
 *     children: [
 *         {
 *             label: "Child 1",
 *             children: [
 *                 {
 *                     label: "Grandchild"
 *                 }
 *             ]
 *         },
 *         {
 *             label: "Child 2",
 *             children: []
 *         }
 *     ]
 * };
 * var myAdapter = $.apex.treeView.makeDefaultNodeAdapter( treeData );
 *
 * $( "#simpleTree" ).treeView( {
 *     getNodeAdapter: function() { return myAdapter; },
 *     expandRoot: false
 * } );
 *
 * @example <caption>Create a simple treeView from markup. The <code class="prettyprint">display:none</code>
 * style is used to keep the markup from being seen before it is turned into a treeView widget.</caption>
 * Markup:
 * <div id="markupTree">
 *   <ul style="display:none;">
 *     <li><a href="#toc">Table of Contents</a>
 *       <ul>
 *         <li><a href="#chapter1">Chapter 1</a>
 *         <li><a href="#chapter2">Chapter 2</a>
 *       </ul>
 *     </li>
 *   </ul>
 * </div>
 *
 * JavaScript:
 * $( "#markupTree" ).treeView( {
 *     navigation: true
 * } );
 */

/*
 * xxx Differences from RCUX Guidelines:
 * - Providing a tooltip for truncated tree label text is not automatic
 * - Disclose icon does not have a tooltip
 * - Icons don't have a tooltip
 * - Multiple icons (including status icons) only supported with custom rendering
 * - The "Show as Top and Hierarchical selector" features are not built in but could be supported with model and controller customizations
 * - Splitters, scrolling, toolbar, standard context menu actions and menu bar are external to the treeView widget but could be implemented according to BLAF guidelines
 * - Persisting expand/collapse state (Disclosure changes) is not automatic
 * - Ctrl+Alt+M is not a keyboard shortcut for context menu.
 *
 * xxx Differences from WAI-ARIA keyboard support:</p>
 * - * (Asterisk) on keypad does not expand all nodes
 * - Space will select the focused node (if not already selected)
 * - Type to select supports multiple letters
 * - If tree supports keyboard insert then Insert key will insert a node
 * - If tree supports keyboard rename then F2 will rename the focused/selected node in-place
 * - If tree supports keyboard delete then Delete key will delete the selected nodes
 * - If a context menu is supported then Shift+F10 and the Context Menu key will open the context menu
 * Some key combinations only apply if tree is in multiple selection mode.
 *
 * todo:
 * support dragging between two treeViews
 * D+D don't show the placeholder on start drag the draggables can't be dropped there
 * How to handle D+D modifiers in a way that works as expected for different platforms?
 *
 * todo ACC:
 * aria-haspopup when tree items have a context menu?
 * "aria-grabbed" for d&d?
 *
 * Accessibility Notes:
 * - It is a good idea to label the tree with a aria-labelledby or aria-label attribute on the treeView element.
 * - If the tree node icon or classes convey information consider using custom node rendering to include visually hidden text for that information
 * TODO there should be a way to convey information contained in the icon and custom classes
 *
 * Future possibilities
 * - Consider options for standard tree menu items such as Expand/Expand All Below/Collapse/Collapse All Below with standard rules
 * - Consider making drag and drop a separate "plugin"
 * - Consider support for dragging to/from sortable
 * - Consider support for dragging to/from gridlayout
 * - Consider support different cursors for different drag modifiers
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.mouse.js
 *    jquery.ui.widget.js
 *    apex/util.js
 *    apex/debug.js
 *    apex/navigation.js (for navigation support)
 *    apex/widget.js
 *    (the following are for context menu integration)
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 *    (optional drag and drop integration)
 *    jquery.ui.draggable.js
 *    jquery.ui.droppable.js
 *    (optional tooltip integration)
 *    jquery.ui.tooltip.js
 *    apex/tooltipManager.js
 */
/*global apex*/

(function ( util, debug, $ ) {
    "use strict";

    var C_TREEVIEW = "a-TreeView",
        C_NODE = "a-TreeView-node",
        C_NO_COLLAPSE = "a-TreeView--noCollapse",
        SEL_NODE = "." + C_NODE,
        C_TOP_NODE = "a-TreeView-node--topLevel",
        C_ROW = "a-TreeView-row",
        SEL_ROW = "." + C_ROW,
        C_CONTENT = "a-TreeView-content",
        SEL_CONTENT = "." + C_CONTENT,
        SEL_ROW_CONTENT = SEL_CONTENT + ", " + SEL_ROW,
        C_LABEL = "a-TreeView-label",
        C_TOGGLE = "a-TreeView-toggle",
        SEL_TOGGLE = "." + C_TOGGLE,
        C_HELPER = "a-TreeView-dragHelper",
        C_PLACEHOLDER = "a-TreeView-placeholder",
        C_SELECTOR = "u-selector",
        SEL_SELECTOR = "." + C_SELECTOR,
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        C_MIXED = "is-mixed", // tristate checkbox todo
        C_DISABLED = "is-disabled",
        SEL_DISABLED = "." + C_DISABLED,
        C_FOCUSED = "is-focused",
        C_HOVER = "is-hover",
        C_EXPANDABLE = "is-expandable",
        C_COLLAPSIBLE = "is-collapsible",
        C_PROCESSING = "is-processing",
        C_LEAF = "a-TreeView-node--leaf",
        C_DEFAULT_ICON_TYPE= "a-Icon",
        C_RTL = "u-RTL",
        C_INPLACE_EDIT = "a-TreeView-input",
        SEL_INPLACE_EDIT = "." + C_INPLACE_EDIT,
        A_EXPANDED = "aria-expanded",
        A_SELECTED = "aria-selected",
        C_ACTIVE = "is-active", // when dragging
        A_DISABLED = "aria-disabled",
        A_LEVEL = "aria-level",
        M_BEGIN_CHILDREN = "<ul role='group'>",
        M_END_CHILDREN = "</ul>",
        TRUE = "true",
        FALSE = "false";

    var EVENT_SELECTION_CHANGE = "selectionChange",
        EVENT_EXPANSION_STATE_CHANGE = "expansionStateChange";

    var keys = $.ui.keyCode;

    function unsupportedError() {
        return new Error( "Unsupported by model" );
    }

    function parentRequiredError() {
        return new Error( "Parent node required" );
    }

    function removeClassesExcept( el, keep ) {
        var i, c,
            newClasses = "",
            classList = el.className.split(" ");

        for ( i = 0; i < classList.length; i++ ) {
            c = classList[i];
            if ( $.inArray( c, keep ) >= 0 ) {
                newClasses += " " + c;
            }
        }
        el.className = newClasses.substr(1);
    }

    function domIndex( el$ ) {
        return el$.parent().children( ":visible" ).index( el$ );
    }

    function getIdFromNode( node$ ) {
        var id = node$.get( 0 ).id;
        return id.substring( id.lastIndexOf( "_" ) + 1 );
    }

    function getLevelFromNode( node$, labelSel ) {
        return parseInt( node$.children( SEL_CONTENT ).find( labelSel ).attr( A_LEVEL ), 10);
    }

    function getLevel( nodeContent$, labelSel ) {
        return parseInt( nodeContent$.find( labelSel ).attr( A_LEVEL ), 10);
    }

    // use debounce (timer) to make sure the focus happens first and also throttle rapid changes from keyboard navigation.
    var notify = function( treeView, event ) {
            treeView._trigger( EVENT_SELECTION_CHANGE, event );
        },
        notifyDelay = util.debounce( notify, 1 ),
        notifyLongDelay = util.debounce( notify, 350 );

    /*
     * options
     *   iconType:
     *   labelClass:
     *   useLinks:
     *   nodeSelector: 0 = none, 1 = single selection, 2 = multiple selection
     * state
     *   selected:
     *   level:
     *   disabled:
     *   hasChildren:
     *   expanded:
     */
    function renderTreeNodeContent( out, node, nodeAdapter, options, state ) {
        var icon, link, elementName, cls;

        if ( nodeAdapter.renderNodeContent ) {
            nodeAdapter.renderNodeContent( node, out, options, state );
        } else {
            if ( options.nodeSelector > 0 ) {
                // simulate a checkbox or radio button depending on single/multiple selection
                cls = C_SELECTOR;
                if ( options.nodeSelector === 1 ) {
                    cls += " u-selector--single";
                }
                out.markup('<span class="' + cls + '"></span>');
            }
            if ( nodeAdapter.getIcon ) {
                icon = nodeAdapter.getIcon( node );
                if ( icon !== null ) {
                    out.markup( "<span" ).attr( "class", options.iconType + " " + icon ).markup( "></span>" );
                }
            }
            link = options.useLinks && nodeAdapter.getLink && nodeAdapter.getLink( node );
            if ( link ) {
                elementName = "a";
            } else {
                elementName = "span";
            }
            out.markup( "<" + elementName + " tabIndex='-1' role='treeitem'" ).attr( "class", options.labelClass )
                .optionalAttr( "href", link )
                .attr( A_LEVEL, state.level )
                .attr( A_SELECTED, state.selected ? TRUE : FALSE )
                .optionalAttr( A_DISABLED, state.disabled ? TRUE : null )
                .optionalAttr( A_EXPANDED, state.hasChildren === false ? null : state.expanded ? TRUE : FALSE )
                .markup( ">" )
                .content( nodeAdapter.getLabel( node ) )
                .markup( "</" + elementName + ">" );
        }
    }

    function setFocus( elem ) {
        elem.tabIndex = 0;
        elem.focus();
    }

    function nextNode( node$ ) {
        var next$;

        // First try the child li, then sibling li, finally parent's sibling if any.
        if ( node$.hasClass( C_COLLAPSIBLE ) ) {
            next$ = node$.children( "ul" ).children( "li" ).first();
        } else {
            // Look for next sibling, if not found, move up and find next sibling.
            next$ = node$.next();
            if ( next$.length === 0 ) {
                next$ = node$.parent().parents( "li" ).next( "li" ).first();
            }
        }
        return next$;
    }

    function prevNode( node$ ) {
        var prev$;

        // First try previous last child, then previous, finally parent if any
        prev$ = node$.prev();
        if ( prev$.length > 0 ) {
            if ( prev$.hasClass( C_COLLAPSIBLE ) ) {
                prev$ = prev$.find( "li" ).filter( ":visible" ).last();
            }
        } else {
            prev$ = node$.parent().parent( "li" );
        }
        return prev$;
    }

    function clearSelection() {
        var sel = {};
        if (window.getSelection) {
            sel = window.getSelection(); // Mozilla
        } else if (document.selection) {
            sel = document.selection.createRange(); // IE
        }
        if (sel.rangeCount) {
            sel.removeAllRanges(); // Mozilla
        } else if (sel.text > '') {
            document.selection.empty(); // IE
        }
    }

    function preventNextScroll( scrollParent$ ) {
        var top = scrollParent$.scrollTop(),
            el$ = scrollParent$,
            timer = null;

        if ( scrollParent$[0] === document ) {
            el$ = $(window);
        }
        el$.on("scroll.treeTemp", function() {
            scrollParent$.scrollTop( top );
            el$.off(".treeTemp");
            clearTimeout( timer );
        } );
        // for cases when the scroll doesn't happen
        timer = setTimeout(function() {
            el$.off(".treeTemp");
        }, 20);
    }

    function initNodeLabelInput(input$, label, width, complete, cancel) {
        var input = input$.val( label ).width( width )
            .keydown(function ( event ) {
                var kc = event.which;

                if ( event.shiftKey || event.ctrlKey || event.altKey ) {
                    return;
                }
                if ( kc === keys.ENTER ) {
                    complete( $( this ).val(), true );
                    event.preventDefault();
                } else if ( kc === keys.ESCAPE ) {
                    setTimeout( function () {
                        cancel( true );
                    }, 10 );
                    event.preventDefault();
                }
            } )
            .blur(function ( event ) {
                complete( $( this ).val(), false );
            } )[0];
        setFocus( input );
        input.select();
        return input;
    }

    /*
     * todo doc this grid data transfer format writer interface when option dataTransferFormats is documented
     */
    var textFormatWriterPrototype = {
        begin: function( nodeAdapter, selection ) {
            this.text = "";
        },
        node: function( node, index, text ) {
            if ( index > 0 ) {
                this.text += "\r\n";
            }
            this.text += text;
        },
        end: function() {
        },
        toString: function() {
            return this.text;
        }
    };
    var htmlFormatWriterPrototype = {
        begin: function( nodeAdapter, selection ) {
            this.text = "<ul>\r\n";
        },
        node: function( node, index, text ) {
            this.text += "<li>" + util.escapeHTML( text ) + "</li>\r\n";
        },
        end: function() {
            this.text += "</ul>\r\n"
        },
        toString: function() {
            return this.text;
        }
    };

    $.widget( "apex.treeView",  $.ui.mouse, $.extend( true,
        /**
         * @lends treeView.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "treeview",
        options: {
            /**
             * <p>A no argument function returning an object that implements the {@link treeNodeAdapter} interface.
             * The node adapter provides access to the data behind the treeView. This option is required unless
             * the tree data is supplied by markup.</p>
             *
             * @variation 1
             * @memberof treeView
             * @instance
             * @type {function}
             * @default null
             * @example function() { return myAdapter; }
             */
            getNodeAdapter: null,

            /**
             * <p>Only used when {@link treeView#getNodeAdapter} is null (when initializing the treeView from markup)
             * The value is passed to {@link treeView.makeDefaultNodeAdapter} as
             * <code class="prettyprint">pTypes</code> parameter.</p>
             *
             * @memberof treeView
             * @instance
             * @type {Object}
             */
            adapterTypesMap: null,

            /**
             * <p>Determines if the tree is shown with a single root or with multiple "roots" which are really the
             * first level nodes in the data model.
             * If false the tree appears like a forest (multi-rooted). If true there is a single root node.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            showRoot: true,

            /**
             * <p>If true the root node is initially expanded otherwise it is collapsed.
             * Option expandRoot cannot be false when {@link treeView#collapsibleRoot} is false</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            expandRoot: true,

            /**
             * <p>If false the root node cannot be collapsed (has no toggle area) otherwise the root can be collapsed.
             * Can only be set at initialization time.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             */
            collapsibleRoot: true,

            /**
             * <p>If true only one sibling node can be expanded at a time.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            autoCollapse: false,

            /**
             * <p>If true nodes with links are rendered as anchor elements. Nodes that have a link
             * can be navigated to on activation regardless of this option value. By using an
             * anchor element the built in browser behavior for opening links in new windows or tabs
             * is available. Beware if combined with context menu options. </p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            useLinks: true,

            /**
             * <p>If true multiple nodes can be selected otherwise only single selection is supported.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            multiple: false,

            /**
             * <p>If true a selector control is added before the node icon and label. The selector is a checkbox
             * if multiple is true and a radio button if multiple is false.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            nodeSelector: false,

            /**
             * <p>If true the selection can be copied to the clipboard using the browsers copy event.
             * Can only be set at initialization time.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             */
            allowCopy: true,

            /**
             * todo consider doc in future
             * @ignore
             */
            dataTransferFormats: [
                {
                    format: "text/plain",
                    writer: Object.create( textFormatWriterPrototype )
                },
                {
                    format: "text/html",
                    writer: Object.create( htmlFormatWriterPrototype )
                }
            ],

            /**
             * <p>Optional id prefix used to generate unique DOM ids. If not given the prefix is based on
             * the <code class="prettyprint">id</code> attribute of the treeView widget root element or if there
             * is no id the prefix is "tree".</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default treeView element id or "tree" if id is null
             * @example "tree7"
             */
            idPrefix: null,

            /**
             * <p>Icon type CSS class name. The iconType along with the value returned by
             * {@link treeNodeAdapter#getIcon} make up the classes used for the tree node icon.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default "a-Icon"
             * @example "fa"
             * @example "fa"
             */
            iconType: C_DEFAULT_ICON_TYPE,

            /**
             * <p>The CSS class name to use on the focusable node content element.
             * This should only be changed if the node adapter implements {@link treeNodeAdapter#renderNodeContent}.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default "a-TreeView-label"
             */
            labelClass: C_LABEL,

            /**
             * <p>Determines the behavior of double clicking on a node. One of:</p>
             * <ul>
             * <li>false: does nothing.</li>
             * <li>"activate": the node is activated.</li>
             * <li>"toggle": the node is collapsed if expanded and expanded if collapsed.</li>
             * </ul>
             *
             * @memberof treeView
             * @instance
             * @type {false|string}
             * @default false
             * @example "toggle"
             * @example "toggle"
             */
            doubleClick: false,

            /**
             * <p>If true allow nodes to be renamed in-place by clicking on a selected node subject to data model
             * approval via {@link treeNodeAdapter#allowRename}.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            clickToRename: false,

            /**
             * <p>If true allow nodes to be renamed in-place by pressing the F2 key subject to data model
             * approval via {@link treeNodeAdapter#allowRename}.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            keyboardRename: false,

            /**
             * <p>If true allow a new child node to be added in-place with Insert key subject to model approval via
             * {@link treeNodeAdapter#allowAdd}.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            keyboardAdd: false,

            /**
             * <p>If true allow nodes to be deleted with the Delete key subject to model approval via
             * {@link treeNodeAdapter#allowDelete}.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            keyboardDelete: false,

            // todo keyboardReorder: false

            /**
             * <p>A tooltip options object suitable for the jQuery UI tooltip widget except that the items property
             * is not needed (it is supplied by the treeView) and the content callback function receives a
             * second argument that is the {@link treeNodeAdapter.node} the tooltip applies to. If not given there
             * is no tooltip.</p>
             * <p>See the jQuery UI documentation for details on the tooltip widget.</p>
             *
             * @memberof treeView
             * @instance
             * @type {Object}
             * @default null
             * @example {
             *         show: { delay: 1000, effect: "show", duration: 500 },
             *         content: function ( callback, node ) {
             *             if ( !node ) {
             *                 return null;
             *             }
             *             return node.tooltip;
             *         }
             *     }
             */
            tooltip: null,

            /**
             * <p>If true then single click causes activation (unless {@link treeView#doubleClick} value is "activate")
             * and if the node adapter supports {@link treeNodeAdapter#getLink} and
             * <code class="prettyprint">getLink</code> returns a value the default behavior is to navigate to that link.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            navigation: false,

            // drag and drop options

            /**
             * <p>If true drag and drop is supported. The {@link treeNodeAdapter} must also support drag and drop.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            dragAndDrop: false,

            /**
             * <p>This only applies if {@link treeView#multiple} and {@link treeView#dragAndDrop} options are true.
             * <p>If this option is true then multiple nodes can be dragged.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            dragMultiple: false,

            /**
             * <p>If true the nodes can be reordered using drag and drop. If false drag and drop just moves (or
             * copies) nodes from one parent node to another.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            dragReorder: false,

            /**
             * <p>Which element the draggable helper should be appended to while dragging.
             * See jQuery UI draggable <code class="prettyprint">appendTo</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default "parent"
             */
            dragAppendTo: "parent",

            /**
             * <p>Constrains dragging to within the bounds of the specified element or region.
             * See jQuery UI draggable <code class="prettyprint">containment</code> option for details.</p>
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            dragContainment: false,

            /**
             * <p>The CSS cursor during the drag operation.
             * See jQuery UI draggable <code class="prettyprint">cursor</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default "auto"
             */
            dragCursor: "auto",

            /**
             * <p>Sets the offset of the dragging helper relative to the mouse cursor.
             * See jQuery UI draggable <code class="prettyprint">cursorAt</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {false|Object}
             * @default false
             */
            dragCursorAt: false,

            /**
             * <p>Allows for a helper element to be used for dragging display.
             * See jQuery UI draggable <code class="prettyprint">helper</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string|function}
             * @default true
             */
            dragHelper: null, // function to return the helper otherwise the node(s) are cloned

            /**
             * <p>Opacity for the helper while being dragged.
             * See jQuery UI draggable <code class="prettyprint">opacity</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {false|number}
             * @default false
             * @example 0.4
             * @example 0.4
             */
            dragOpacity: false,

            /**
             * @ignore
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             */
            dragAnimate: false, // if true use animation effect when dropping

            /**
             * <p>When dragging and hover over a collapsed node how long (in milliseconds) to wait until it
             * expands -1 means don't expand.</p>
             *
             * @memberof treeView
             * @instance
             * @type {number}
             * @default 1200
             * @example 1000
             * @example 1000
             */
            dragExpandDelay: 1200,

            /**
             * <p>If set to true, container auto-scrolls while dragging.
             * See jQuery UI draggable <code class="prettyprint">scroll</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            dragScroll: true,

            /**
             * <p>Distance in pixels from the edge of the viewport after which the viewport should scroll.
             * Distance is relative to pointer, not the draggable.
             * See jQuery UI draggable <code class="prettyprint">scrollSensitivity</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {number}
             * @default 20
             * @example 30
             * @example 30
             */
            dragScrollSensitivity: 20,

            /**
             * <p>The speed at which the viewport should scroll.
             * See jQuery UI draggable <code class="prettyprint">scrollSpeed</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {number}
             * @default 10
             * @example 8
             * @example 8
             */
            dragScrollSpeed: 10,

            /**
             * <p>Z-index for the helper while being dragged.
             * See jQuery UI draggable <code class="prettyprint">zIndex</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {number}
             * @default 1000
             * @example 1001
             * @example 1001
             */
            dragZIndex: 1000,

            /**
             * <p>Only used with jQuery UI droppable for drag and drop.
             * Used to group sets of draggable and droppable items.
             * See jQuery UI droppable <code class="prettyprint">scope</code> option for details.</p>
             *
             * @memberof treeView
             * @instance
             * @type {string}
             * @default "default"
             * @example "parts"
             * @example "parts"
             */
            scope: "default",

            // distance, delay, and cancel inherited from mouse

            /**
             * <p>Triggered when an accepted draggable starts dragging. Only applies when a connected
             * draggable is being dragged. See jQuery UI droppable and sortable for details.</p>
             *
             * @event
             * @name activate
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.item
             * @property {object} ui.offset
             * @property {object} ui.originalPosition
             * @property {object} ui.position
             */
            activate: null,

            /**
             * <p>Triggered when an accepted draggable stops dragging. Only applies when a connected
             * draggable is being dragged. See jQuery UI droppable and sortable for details.</p>
             *
             * @event
             * @name deactivate
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            deactivate: null,

            /**
             * <p>Triggered when an accepted draggable is dragged out of the droppable. Only applies when a connected
             * draggable is being dragged. See jQuery UI droppable and sortable for details.</p>
             *
             * @event
             * @name out
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            out: null,

            /**
             * <p>Triggered when an accepted draggable is dragged over the droppable. Only applies when a connected
             * draggable is being dragged. See jQuery UI droppable and sortable for details.</p>
             *
             * @event
             * @name over
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            over: null,

            /**
             * <p>Triggered when dragging a node starts. See jQuery UI draggable and sortable for details.</p>
             *
             * @event
             * @name start
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            start: null,

            /**
             * <p>Triggered while the mouse is moved during the dragging, immediately before the current move happens.
             * See jQuery UI draggable for details.</p>
             *
             * @event
             * @name drag
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            drag: null, // similar to sortable sort

            /**
             * <p>Triggered when dragging stops, but when the placeholder/helper is still available.
             * See jQuery UI sortable for details.</p>
             *
             * @event
             * @name beforeStop
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            beforeStop: null,

            /**
             * <p>Triggered when dragging a node stops. See jQuery UI draggable and sortable for details.</p>
             *
             * @event
             * @name stop
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {jQuery} ui.helper
             * @property {jQuery} ui.items
             * @property {object} ui.offset
             * @property {object} ui.operation
             * @property {object} ui.originalPosition
             * @property {jQuery} ui.placeholder
             * @property {object} ui.position
             * @property {jQuery} ui.sender
             */
            stop: null,

            /**
             * <p>Triggered when the selection state changes. It has no additional data. When the selection changes
             * the handler will generally want to get the current selection using the {@link treeView#getSelection}
             * or {@link treeView#getSelectedNodes} methods.</p>
             *
             * @event
             * @name selectionChange
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             *
             * @example <caption>Initialize the treeView with the <code class="prettyprint">selectionChange</code> callback specified:</caption>
             * $( ".selector" ).treeView({
             *     selectionChange: function( event ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">treeviewselectionchange</code> event:</caption>
             * $( ".selector" ).on( "treeviewselectionchange", function( event ) {} );
             */
            selectionChange: null,

            /**
             * <p>Triggered when nodes are expanded or collapsed.</p>
             *
             * @event
             * @name expansionStateChange
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {treeNodeAdapter.node} ui.node The node that is expanded or collapsed.
             * @property {jQuery} ui.nodeContent$ The node content jQuery object.
             * @property {boolean} ui.expanded true if the node is now expanded and false otherwise.
             *
             * @example <caption>Initialize the treeView with the <code class="prettyprint">expansionStateChange</code> callback specified:</caption>
             * $( ".selector" ).treeView({
             *     expansionStateChange: function( event, ui ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">treeviewexpansionstatechange</code> event:</caption>
             * $( ".selector" ).on( "treeviewexpansionstatechange", function( event, ui ) {} );
             */
            expansionStateChange: null, // expansionStateChange(event, { node: <node>, nodeContent$: <node-element>, expanded: <bool> } )

            /**
             * <p>Triggered when when nodes are activated with the Enter key or double click if
             * {@link treeView#doubleClick} option set to "activate"
             * or single click if {@link treeView#navigation} option is true and {@link treeView#doubleClick}
             * is not "activate". Handler can call the event's preventDefault method to stop navigation.</p>
             *
             * @event
             * @name activateNode
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {treeNodeAdapter.node[]} ui.nodes The currently selected nodes.
             *
             * @example <caption>Initialize the treeView with the <code class="prettyprint">activateNode</code> callback specified:</caption>
             * $( ".selector" ).treeView({
             *     activateNode: function( event, ui ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">treeviewactivatenode</code> event:</caption>
             * $( ".selector" ).on( "treeviewactivatenode", function( event, ui ) {} );
             */
            activateNode: null, // function( event, { nodes: [] } )

            /**
             * <p>Triggered when when in-place add or rename begins.</p>
             *
             * @event
             * @name beginEdit
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {string} ui.action One of "add" or "rename".
             * @property {treeNodeAdapter.node} ui.node The node being renamed or added.
             * @property {Element} ui.input The input element to enter the new or renamed node label.
             *
             * @example <caption>Initialize the treeView with the <code class="prettyprint">beginEdit</code> callback specified:</caption>
             * $( ".selector" ).treeView({
             *     beginEdit: function( event, ui ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">treeviewbeginedit</code> event:</caption>
             * $( ".selector" ).on( "treeviewbeginedit", function( event, ui ) {} );
             */
            beginEdit: null,

            /**
             * <p>Triggered when when in-place add or rename ends.</p>
             *
             * @event
             * @name endEdit
             * @memberof treeView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} ui
             * @property {string} ui.action One of "add" or "rename".
             * @property {string} ui.status One of "cancel" or "complete".
             *
             * @example <caption>Initialize the treeView with the <code class="prettyprint">endEdit</code> callback specified:</caption>
             * $( ".selector" ).treeView({
             *     endEdit: function( event, ui ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">treeviewendedit</code> event:</caption>
             * $( ".selector" ).on( "treeviewendedit", function( event, ui ) {} );
             */
            endEdit: null,

            /* todo doc these? or consider they may be better as model layer notifications
             * These notification events receive a change object in addition to the event: function(event, change)
             *
             * For added, and renamed events the change object contains these properties as appropriate:
             *   node:
             *   node$:
             *   index:
             *   prevLabel:  - rename only
             *   parentNode: - add only
             *   parent$:    - add only
             *
             * For deleted events the change object contains these properties:
             *   items: array of objects one for each node deleted containing:
             *       parent$
             *       index
             *       node
             *
             * For moved and copied events the change object contains these properties as appropriate:
             *   parentNode:
             *   parent$:
             *   items: array of objects one for each node moved or copied containing:
             *       toNode
             *       toNode$
             *       toIndex
             *       fromParent$   - move only
             *       fromIndex     - move only
             *       fromNode$
             */
            added: null,
            renamed: null,
            deleted: null,
            moved: null,
            copied: null
        },
        scrollTimerId: null, // timer used for scrolling
        delayExpandTimer: null, // timer used to expand nodes
        hasCurrent: false, // only used when tree data comes from markup. Used to select current node
        tooltipOptions: null,
        triggerTimerId: null,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,
        scrollParent: null, // set to the tree widget scroll parent if there is one
        // baseId: "", //used in generating ids for elements along with nextNodeId
        // treeMap = {}, // mapping of li node id to node
        // nextNodeId = 0, // used to generate unique node ids
        // labelSelector, // selector based on option.labelClass
        // lastFocused, // the element that last had focus (tabIndex is 0)
        // selectAnchor, // anchor element in range selection,
        // searchString, // used by type to select feature
        // searchTimerId, // used by type to select feature
        // used during dragging
        animating: false, // true during animation after drop
        dragging: false,
        dragItems: null, // jQuery element(s) being dragged
        currentItem: null, // the first item being dragged used for integration with jQuery UI droppable
        // helper
        // margins
        // offset
        // originalPosition
        // overflowOffset
        // placeholder
        // dropTargetNode
        // dragOperation, // what will happen on drop "move", "copy", or "add"
        // position: helper position during drag, value of event UI arg position property
        // positionAbs: helper absolute position during drag, value of event UI arg offset property
        // lastPositionAbs: (previous positionAbs) used to determine drag direction
        // lastLocation: used to determine changes in placeholder placement during drag

        _create: function () {
            var self = this,
                ctrl$ = this.element,
                o = this.options;

            if ( !o.getNodeAdapter ) {
                o.getNodeAdapter = this._parseTreeMarkup( ctrl$, o.adapterTypesMap || null );
            }
            if ( !o.getNodeAdapter ) {
                throw new Error( "Missing required option getNodeAdapter" );
            }

            this.nodeAdapter = o.getNodeAdapter();

            this.containerCache = {};

            if ( o.collapsibleRoot === false ) {
                o.expandRoot = true;
            }

            ctrl$.addClass( C_TREEVIEW )
                .attr( "role", "tree" );
            this.baseId = ( o.idPrefix || ctrl$[0].id || "tree" ) + "_";
            this.labelSelector = "." + o.labelClass;

            this.editMode = false;

            if ( o.multiple ) {
                ctrl$.attr( "aria-multiselectable", TRUE );
            }

            this.rtlFactor = 1;
            if ( ctrl$.css("direction") === "rtl" ) {
                ctrl$.addClass( C_RTL );
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
                this.rtlFactor = -1;
            }

            if ( o.disabled ) {
                ctrl$.attr( A_DISABLED , TRUE );
            }

            if ( o.tooltip ) {
                this._initTooltips( o.tooltip );
            }

            // xxx more is needed to set ui properties in the menu event
            this._initContextMenu( SEL_CONTENT, function( event ) {
                // don't open context menu when target is an anchor or in edit mode xxx verify this
                return $( event.target ).closest( "a" ).length > 0 || self.editMode;
            }, function( event ) {
                var el = ( event.type === "keydown" && self.lastFocused ) ? self.lastFocused : event.target,
                    nodeContent$ = $( el ).closest( SEL_CONTENT );

                if ( nodeContent$.length ) {
                    // if target not selected then select it
                    if ( !nodeContent$.hasClass( C_SELECTED ) ) {
                        return nodeContent$;
                    }
                    return true;
                }
                return false;
            }, function( ui ) {
                ui.selectedNodes = self.getNodes( ui.selection );
                ui.treeNodeAdapter = self.nodeAdapter;
            } );

            // keep track of the tree scroll parent
            this.scrollParent = ctrl$.scrollParent();

            // determine the parent's offset
            this.offset = this.element.offset();

            this._mouseInit();

            this._on( this._eventHandlers );

            if ( o.allowCopy ) {
                apex.clipboard.addHandler( ctrl$[0], function( dataTransfer ) {
                    if ( self.editMode ) {
                        return false;
                    } // else
                    self._copy( dataTransfer );
                    return true;
                });
            }

            // process disabled option and other common option setting behavior
            this._setOption( "disabled", o.disabled );

            this.refresh();
        },

        _eventHandlers: {
            click: function( event ) {
                var node$, content$,
                    self = this,
                    o = this.options,
                    target$ = $( event.target );

                // ignore shift and ctrl click on anchors to let the browser do its thing
                if ( !o.multiple && event.target.nodeName === "A" && (event.shiftKey || event.ctrlKey) ) {
                    this.keyboardActivate = false;
                    return;
                }

                if ( target$.hasClass( C_SELECTOR ) ) {
                    node$ = target$.closest( SEL_NODE );
                    event.ctrlKey = true;
                    event.shiftKey = false;
                    self._select( node$.children( SEL_CONTENT ), event, true );
                    event.preventDefault();
                } else if ( target$.hasClass( C_TOGGLE ) ) {
                    this._toggleNode( target$.parent() );
                    // restore focus but don't want to scroll at this point
                    if ( this.scrollParent ) {
                        // This is needed when focus is outside the widget. Without this
                        // giving focus to the last focused node may cause the tree to scroll
                        // does not work in IE except when scroll parent is the document
                        preventNextScroll(this.scrollParent);
                    }
                    this.lastFocused.focus();
                    event.preventDefault();
                } else {
                    node$ = target$.closest( SEL_NODE );
                    if ( node$.length > 0 ) {
                        content$ = node$.children( SEL_CONTENT );

                        // when in edit mode ignore clicks on the node/label being edited
                        if ( this.editMode && content$.hasClass( C_SELECTED ) ) {
                            return;
                        }
                        // if already selected and click to rename
                        if ( o.clickToRename &&
                                content$.find( this.labelSelector ).attr( A_SELECTED ) === TRUE &&
                                !event.ctrlKey && !event.altKey &&
                                this.getSelection().length === 1 && target$.closest( this.labelSelector ).length ) {
                            this.renameNodeInPlace( content$ );
                        } else {
                            this._select( content$, event, true );
                            if ( o.navigation && (this.keyboardActivate || o.doubleClick !== "activate") ) {
                                this._activate( event );
                            }
                        }
                        event.preventDefault();
                    }
                }
                this.keyboardActivate = false;
                clearSelection();
            },

            dblclick: function( event ) {
                var node$,
                    doubleClick = this.options.doubleClick;

                if ( doubleClick && !this.editMode ) {
                    node$ = $( event.target ).closest( SEL_NODE );
                    if ( node$.length > 0 ) {
                        if ( doubleClick === "toggle" ) {
                            this._toggleNode( node$ );
                            event.preventDefault();
                        } else if ( doubleClick === "activate" ) {
                            this._activate( event );
                        }
                    }
                }
            },

            keydown: function( event ) {
                var node$, nodeContent$, nh, scrollHeight, page,
                    self = this,
                    o = this.options,
                    ctrl$ = this.element,
                    kc = event.which;

                // ignore if target is the input for add/rename also ignore during drag
                if ( event.altKey || event.target.nodeName === "INPUT" || this.dragging ) {
                    return;
                }
                if ( kc === keys.PAGE_UP || kc === keys.PAGE_DOWN ) {
                    if ( this.scrollParent ) {
                        nh = ctrl$.find( SEL_ROW ).filter( ":visible" ).first().outerHeight() || 24;
                        node$ = ctrl$.find( "li" ).filter( ":visible" ).first();
                        nh += parseInt( node$.css( "margin-top" ), 10 ) + parseInt( node$.css( "margin-bottom" ), 10 );
                        if ( this.scrollParent[0] === document ) {
                            scrollHeight = $( window ).height();
                        } else {
                            scrollHeight = this.scrollParent[0].clientHeight;
                        }
                        page = Math.floor( scrollHeight / nh ) - 1;
                    } else {
                        page = 10;
                    }
                }
                if ( kc === keys.HOME ) {
                    ctrl$.find( SEL_CONTENT ).filter( ":visible" ).first().each( function () { // at most once
                        self._select( $( this ), event, true, true );
                    } );
                    event.preventDefault();
                } else if ( kc === keys.END ) {
                    ctrl$.find( SEL_CONTENT ).filter( ":visible" ).last().each( function () { // at most once
                        self._select( $( this ), event, true, true );
                    } );
                    event.preventDefault();
                } else if ( kc === keys.SPACE ) {
                    if ( this.lastFocused ) {
                        this._select( $( self.lastFocused ).closest( SEL_CONTENT ), event, true, true );
                    }
                    event.preventDefault();
                } else if ( kc === keys.DOWN ) {
                    this._traverseDown( event, 1 );
                    event.preventDefault();
                } else if ( kc === keys.UP ) {
                    this._traverseUp( event, 1 );
                    event.preventDefault();
                    event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                } else if ( kc === keys.PAGE_DOWN ) {
                    this._traverseDown( event, page );
                    event.preventDefault();
                } else if ( kc === keys.PAGE_UP ) {
                    this._traverseUp( event, page );
                    event.preventDefault();
                } else if ( kc === this.backwardKey ) {
                    // If the focused node is collapsible, collapse it.
                    if ( this.lastFocused ) {
                        node$ = $( this.lastFocused ).closest( SEL_NODE );
                        if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                            this._collapseNode( node$ );
                        } else {
                            // If it is not collapsible, focus parent.
                            node$.parent().prevAll( SEL_CONTENT ).each( function () { // at most once
                                self._select( $( this ), event, true, true );
                            } );
                        }
                    }
                    event.preventDefault();
                } else if ( kc === this.forwardKey ) {
                    // If the focused node is not a leaf, expand or move to descendant
                    if ( this.lastFocused ) {
                        node$ = $( this.lastFocused ).closest( SEL_NODE );
                        if ( node$.hasClass( C_EXPANDABLE ) ) {
                            this._expandNode( node$ );
                        } else if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                            node$.children( "ul" ).children( "li" ).first().children( SEL_CONTENT ).each( function () { // at most once
                                self._select( $( this ), event, true, true );
                            } );
                        }
                    }
                    event.preventDefault();
                } else if ( kc === keys.ENTER ) {
                    if (  event.target.nodeName !== "A" && !event.shiftKey && !event.ctrlKey ) {
                        this._activate( event );
                        event.preventDefault();
                    } else {
                        this.keyboardActivate = true;
                    }
                } else if ( kc === 113 && o.keyboardRename ) { // F2
                    if ( this.lastFocused && $( this.lastFocused ).closest( SEL_CONTENT + SEL_SELECTED ).length > 0 ) {
                        nodeContent$ = $( this.lastFocused ).closest( SEL_CONTENT );
                    } else {
                        nodeContent$ = this.getSelection().first();
                    }
                    if ( nodeContent$.length > 0 ) {
                        this.renameNodeInPlace( nodeContent$ );
                    }
                } else if ( kc === 45 && o.keyboardAdd ) { // INS
                    if ( this.lastFocused && $( this.lastFocused ).closest( SEL_CONTENT + SEL_SELECTED ).length > 0 ) {
                        nodeContent$ = $( this.lastFocused ).closest( SEL_CONTENT );
                    } else {
                        nodeContent$ = this.getSelection().first();
                    }
                    if ( nodeContent$.length > 0 ) {
                        this.addNodeInPlace( nodeContent$ );
                    }
                } else if ( kc === keys.DELETE && o.keyboardDelete ) {
                    this.deleteNodes( this.getSelection() );
                }
            },

            keypress: function( event ) {
                var ch, next$,
                    self = this;

                function findNode( search ) {
                    var startNode$, nextNode$, label$,
                        slen = search.length;

                    function next() {
                        nextNode$ = nextNode( nextNode$ );
                        if ( nextNode$.length === 0 ) {
                            nextNode$ = self.element.find( SEL_NODE ).filter( ":visible" ).first();
                        }
                    }

                    nextNode$ = startNode$ = $( self.lastFocused ).closest( SEL_NODE );
                    if ( slen === 1 ) {
                        next();
                    }

                    while ( true ) {
                        label$ = nextNode$.children( SEL_CONTENT ).find( self.labelSelector ).first();
                        if ( label$.text().substring(0, slen).toLowerCase() === search ) {
                            return label$.closest( SEL_CONTENT );
                        }
                        next();
                        if ( nextNode$[0] === startNode$[0] ) {
                            break;
                        }
                    }
                    return null;
                }

                if ( event.which === 0 || event.ctrlKey || event.altKey || event.target.nodeName === "INPUT" || this.dragging ) {
                    return;
                }

                ch = String.fromCharCode( event.which ).toLowerCase();
                if ( this.searchTimerId ) {
                    // a character was typed recently
                    // if it is the same character just look for the next item that starts with the letter
                    if ( ch !== this.searchString ) {
                        // otherwise add to the search string
                        this.searchString += ch;
                    }
                    clearTimeout( this.searchTimerId );
                    this.searchTimerId = null;
                } else {
                    // a character hasn't been typed in a while so search from the beginning
                    if ( ch === " " ) {
                        return;
                    }
                    this.searchString = ch;
                }
                this.searchTimerId = setTimeout( function () {
                    self.searchTimerId = null;
                }, 500 );

                next$ = findNode( this.searchString );
                if ( next$ ) {
                    this._select( next$, event, true, true );
                }

            },

            focusin: function( event ) {
                var label$ = $( event.target ).closest( this.labelSelector );
                if ( label$.length ) {
                    label$.addClass( C_FOCUSED ).closest( SEL_NODE ).children( SEL_ROW ).addClass( C_FOCUSED );
                    this._setFocusable( label$ );
                }
            },

            focusout: function( event ) {
                var label$ = $( event.target ).closest( this.labelSelector );
                label$.removeClass( C_FOCUSED ).closest( SEL_NODE ).children( SEL_ROW ).removeClass( C_FOCUSED );
            },

            mousemove: function( event ) {
                var node$;
                if ( this.dragging ) {
                    return;
                }
                node$= $(event.target ).closest( SEL_NODE );
                if ( node$.length && this.lastHover !== node$[0] ) {
                    $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                    node$.children( SEL_ROW_CONTENT  ).addClass( C_HOVER );
                    this.lastHover = node$[0];
                }
            },

            mouseleave: function( event ) {
                if ( this.dragging ) {
                    return;
                }
                if ( this.lastHover ) {
                    $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                    this.lastHover = null;
                }
            }
        },

        _setOption: function( key, value ) {
            var startLabel,
                o = this.options;

            this._checkContextMenuOptions( key, value );

            if ( key === "disabled" ) {
                // Don't call widget base _setOption for disable as it adds ui-state-disabled class
                o[ key ] = value;

                this.widget().toggleClass( C_DISABLED, !!value );
                if ( value ) {
                    this.element.attr( A_DISABLED , TRUE );
                    if ( this.lastFocused ) {
                        this.lastFocused.tabIndex = -1;
                    }
                    this.lastFocused = null;
                } else {
                    this.element.removeAttr( A_DISABLED );
                    startLabel = this.getSelection().first().find( this.labelSelector );
                    if ( !startLabel.length ) {
                        startLabel = this.element.find( this.labelSelector ).first();
                    }
                    this._setFocusable( startLabel );
                }
            } else if ( key === "allowCopy" ) {
                throw new Error( "TreeView " + key + " cannot be set" );
            } else if ( key === "dragMultiple" && value && !o.multiple ) {
                throw new Error( "TreeView dragMultiple cannot be true when the multiple option is false" );
            } else if ( key === "multiple" && !value && o.dragMultiple ) {
                throw new Error( "TreeView multiple cannot be false when the dragMultiple option is true" );
            } else if ( key === "collapsibleRoot" ) {
                throw new Error( "TreeView collapsibleRoot option cannot be set" );
            } else {
                this._super( key, value );
            }

            o = this.options;

            if ( o.multiple && !o.nodeSelector && apex.userHasTouched() ) {
                // make multiple selection easier/possible on touch devices
                o.nodeSelector = true;
            }

            this.renderNodeOptions = {
                iconType: o.iconType,
                labelClass: o.labelClass,
                useLinks: o.useLinks,
                nodeSelector: o.nodeSelector ? ( o.multiple ? 2 : 1 ) : 0
            };

            if ( key === "showRoot" || key === "useLinks" ) {
                this.refresh();
            } else if ( key === "getNodeAdapter" ) {
                this.nodeAdapter = o.getNodeAdapter();
                this.refresh();
            } else if ( key === "multiple" ) {
                this.element.attr( "aria-multiselectable", value ? TRUE : FALSE );
                // if multiple is false make sure only one thing selected
                if ( value === false && this.getSelection().length > 0 ) {
                    this._select( $( this.lastFocused ).closest( SEL_CONTENT ), null, false, false );
                }
            } else if ( key === "expandRoot" && value === false ) {
                if ( o.collapsibleRoot === false ) {
                    o.expandRoot = true;
                    debug.warn("ExpandRoot option cannot be false when collapsibleRoot is false");
                }
            } else if ( key === "tooltip" ) {
                this._initTooltips( value );
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
                this.element.tooltip( "destroy" );
                this.tooltipOptions = null;
            }
            if ( options ) {
                ttOptions = this.tooltipOptions = $.extend( true, {}, options ); // deep copy
                ttOptions.items = this.labelSelector;
                if ( ttOptions.content && $.isFunction( ttOptions.content ) ) {
                    ttOptions._originalContent = ttOptions.content;
                    ttOptions.content = function( callback ) {
                        var node = self.getNodes( $(this ).closest( SEL_CONTENT ) )[0];
                        return ttOptions._originalContent.call( this, callback, node );
                    };
                }
                this.element.tooltip( ttOptions );
            }
        },

        _destroy: function() {
            var ctrl$ = this.element;

            ctrl$.empty()
                .removeClass( C_TREEVIEW + " " + C_RTL )
                .removeAttr( "role" )
                .removeAttr( "aria-multiselectable" );

            apex.clipboard.removeHandler( ctrl$[0] ); // no problem if had not been added

            this._destroyContextMenu();

            if ( this.options.tooltip && $.ui.tooltip ) {
                ctrl$.tooltip( "destroy" );
            }
            this._mouseDestroy();
        },

        //
        // Public methods
        //

        /**
         * <p>Call to render the whole tree or sub trees whenever the adapter's data model changes.</p>
         *
         * @param {jQuery} pNodeContent$ The treeView node(s) to refresh from. If not given or null start from
         * the root of the tree.
         * @example <caption>This example refreshes (renders) the whole tree.</caption>
         * $( ".selector" ).treeView( "refresh" );
         */
        refresh: function( pNodeContent$ ) {
            var rootNode, root$, sel$,
                self = this,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                selectedNodes = null,
                ctrl$ = this.element,
                out = util.htmlBuilder();

            // Try to preserve selection. The DOM elements will be different after refresh so can't use
            // getSelection. Have to rely on the model having the same nodes. If the model hasn't changed (much)
            // and the adapter supports getViewId then the selection can be preserved. Any nodes that are
            // gone from the model after refresh will be ignored in setSelectedNodes.
            if ( nodeAdapter.getViewId ) {
                selectedNodes = this.getSelectedNodes();
            }
            if ( pNodeContent$ ) {
                pNodeContent$.each( function() {
                    var node$ = $( this ).parent(),
                        node = self.treeMap[getIdFromNode( node$ )];

                    // clean out old mappings todo what about adapter view id???
                    node$.find( SEL_NODE ).addBack().each( function() {
                        delete self.treeMap[getIdFromNode( $( this ) )];
                    } );
                    // render and insert new tree nodes
                    out.clear();
                    self._renderNode( node, getLevelFromNode( node$, self.labelSelector ), out );
                    node$.replaceWith( out.toString() );
                } );
            } else {
                this.treeMap = {};
                this.nextNodeId = 0;
                if ( nodeAdapter.clearViewId ) {
                    nodeAdapter.clearViewId( this.baseId );
                }

                rootNode = nodeAdapter.root(); //get the single root node
                if ( rootNode ) {
                    out.markup( M_BEGIN_CHILDREN );
                    if ( o.showRoot ) {
                        this._renderNode( rootNode, 1, out ); // level 1
                    } else {
                        if ( nodeAdapter.hasChildren( rootNode ) ) {
                            // Note: doesn't work if top level lazy loaded, causes problems when showRoot false
                            this._renderChildren( rootNode, 1, out ); // level 1
                        }
                    }
                    out.markup( M_END_CHILDREN );
                    ctrl$.html( out.toString() );
                } else {
                    // There really should be a root node
                    // The cases where the tree root doesn't exist should be very rare.
                    // If the tree data model doesn't have a root the treeView should not be created and a message shown in its place,
                    // but that is something external to this widget.
                    // Just in case add an empty group where the root would go
                    // TODO drop target is broken when there is no root
                    out.markup( M_BEGIN_CHILDREN );
                    out.markup( M_END_CHILDREN );
                    ctrl$.html( out.toString() );
                }

                if ( o.expandRoot && o.showRoot ) {
                    root$ = this._getRoots();
                    if ( root$.length > 0 ) {
                        this._expandNode( root$ );
                    }
                }
            }
            if ( this.hasCurrent ) {
                sel$ = this.find( {
                    depth: -1,
                    match: function( n ) {
                        return n.current === true;
                    }
                } );
                this.hasCurrent = false;
                this.setSelection( sel$ );
            } else if ( selectedNodes && selectedNodes.length > 0 ) {
                this.setSelectedNodes( selectedNodes, false, true ); // don't notify because the selection should be the same
            } else {
                // Set initial focus to first node
                this.selectAnchor = this.lastFocused;
                this._setFocusable( ctrl$.find( this.labelSelector ).first() );
            }
        },

        /**
         * <p>Returns the {@link treeNodeAdapter} that the treeView is using.</p>
         * @variation 2
         * @return {treeNodeAdapter}
         * @example <caption>This example logs to the console the node label of each child of the first
         *   selected node.</caption>
         * var i, count,
         *     selectedNode = $( ".selector" ).treeView( "getSelectedNodes" )[0],
         *     adapter = $( ".selector" ).treeView( "getNodeAdapter" );
         * if ( selectedNode ) {
         *     count = adapter.childCount( selectedNode );
         *     for ( i = 0; i < count; i++ ) {
         *         console.log( "Label: " + adapter.child( selectedNode, i ).label );
         *     }
         * }
         */
        getNodeAdapter: function() {
            return this.nodeAdapter;
        },

        /**
         * <p>Set focus to the tree node that last had focus.</p>
         * @example <caption>Focus the treeView.</caption>
         * $( ".selector" ).treeView( "focus" );
         */
        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        /**
         * <p>Given a {@Link treeNodeAdapter} node return a jQuery object with the treeView element corresponding
         * to that node. The element returned has the class <code class="prettyprint">a-TreeView-content</code>.
         * The {@link treeNodeAdapter} must implement view state methods.</p>
         *
         * <p>This is for mapping from a data model node object to a DOM element.</p>
         *
         * @param {treeNodeAdapter.node} pNode The model node to get the corresponding treeView node DOM element for.
         * @return {jQuery} jQuery object with the treeView nodes for the given data model node.
         * @throws An exception if the node adapter doesn't implement {@link treeNodeAdapter#getViewId}.
         */
        getTreeNode: function( pNode ) {
            var id,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getViewId ) {
                throw unsupportedError();
            }
            id = nodeAdapter.getViewId( this.baseId, pNode );
            return $( "#" + this.baseId + id ).children( SEL_CONTENT );
        },

        /**
         * <p>Returns the set of treeView nodes currently selected. If there is no selection the empty set is returned.
         * The elements returned have the class <code class="prettyprint">a-TreeView-content</code>.</p>
         *
         * @return {jQuery} jQuery object with the set of selected tree nodes.
         * @example <caption>This example gets current selected treeView node elements as a jQuery set.</caption>
         * var selection$ = $( ".selector" ).treeView( "getSelection" );
         */
        getSelection: function() {
            return this.element.find( SEL_CONTENT + SEL_SELECTED );
        },

        /**
         * <p>Given a jQuery object with a set of treeView nodes return an array of adapter data model nodes that
         * corresponds to each treeView node in the set.
         * The tree nodes passed in must be the ones this treeView instance rendered
         * with class <code class="prettyprint">a-TreeView-content</code>.</p>
         *
         * <p>This is for mapping from DOM elements to model node objects.</p>
         *
         * @param {jQuery} pNodeContent$ jQuery Object holding a set of tree nodes.
         * @return {treeNodeAdapter.node[]} array of data model nodes.
         * @example <caption>This example replaces the labels of all the selected nodes with a lowercase label.</caption>
         * var tree$ = $( ".selector" ),
         *     selection$ = tree$.treeView( "getSelection" ),
         *     nodes = tree$.treeView( "getNodes", selection$ );
         * nodes.forEach( function( n, i ) {
         *     n.label = n.label.toLowerCase();
         *     tree$.treeView( "update", selection$.eq(i) )
         * } );
         */
        getNodes: function( pNodeContent$ ) {
            var self = this,
                nodes = [];

            pNodeContent$.each( function () {
                var id = getIdFromNode( $( this ).closest( "li" ) );
                // never include the fake node for adding a new node
                if ( id !== "new" ) {
                    nodes.push( self.treeMap[id] );
                }
            } );
            return nodes;
        },

        /**
         * <p>Returns the adapter's data model nodes corresponding to the currently selected treeView nodes.
         * See also {@link treeView#getSelection} and {@link treeView#getNodes}.</p>
         *
         * @return {treeNodeAdapter.node[]} Array of data model nodes selected.
         * @example <caption>This example gets the nodes for the current selection.</caption>
         * var selectedNodes = $( ".selector" ).treeView( "getSelectedNodes" );
         */
        getSelectedNodes: function() {
            return this.getNodes( this.getSelection() );
        },

        /**
         * <p>Sets the current tree selection. The treeView nodes passed in must be the ones this treeView instance rendered
         * with class <code class="prettyprint">a-TreeView-content</code>.</p>
         *
         * @param {jQuery} pNodeContent$ A jQuery object with the treeView nodes to select.
         *   An empty jQuery set will clear the selection.
         * @param {boolean} [pFocus] If true the first tree node in <code class="prettyprint">pNodeContent$</code> will be focused.
         * @param {boolean} [pNoNotify] If true the {@link treeView#event:selectionChange} event will be suppressed.
         * @example <caption>This example selects all the nodes 3 levels deep in the treeView. It uses knowledge
         *   of how the treeView renders node content by default, which could change in future release. Specifically
         *   it looks for the <code class="prettyprint">aria-level</code> attribute. Note the
         *   <code class="prettyprint">"[aria-level='3']"</code> selector will only find nodes that have been rendered,
         *   so will not find descendant nodes under nodes that have never been expanded.</caption>
         * $( ".selector" ).treeView( "setSelection", $( "[aria-level='3']" ).parent() );
         * @example <caption>This example selects all the nodes under the currently selected nodes. It expands
         *  the selected nodes first to make sure all descendant nodes are rendered. It suppresses the
         *  {@link treeView#event:selectionChange} event.</caption>
         * var tree$ = $( ".selector" ),
         *     selection$ = tree$.treeView( "getSelection" );
         * tree$.treeView( "expandAll", selection$ )
         *     .treeView( "setSelection", selection$.parent().find( ".a-TreeView-content" ), false, true );
         * @example <caption>This example clears the selection.</caption>
         * $( ".selector" ).treeView( "setSelection", $() );
         */
        setSelection: function( pNodeContent$, pFocus, pNoNotify ) {
            pFocus = !!pFocus;
            if ( !this.options.multiple ) {
                pNodeContent$ = pNodeContent$.first();
            }
            this._select( pNodeContent$, null, pFocus, false, pNoNotify );
        },

        /**
         * <p>Sets the current tree selection. Given an array of nodes from the {@link treeNodeAdapter} data model,
         * find the corresponding treeView node elements and set the selection to those nodes.
         * The {@link treeNodeAdapter} must implement view state methods. Depending on the {@link treeNodeAdapter}
         * implementation it may be possible to supply an array of objects with just the node's identity property
         * filled in. See also {@link treeView#getSelectedNodes}.</p>
         *
         * @param {treeNodeAdapter.node[]} pNodes An array of model nodes.
         * @param {boolean} [pFocus] If true the tree node corresponding to the first node in
         *   <code class="prettyprint">pNodes</code> will be focused.
         * @param {boolean} [pNoNotify] If true the {@link treeView#event:selectionChange} event will be suppressed.
         * @throws An exception if the node adapter doesn't implement {@link treeNodeAdapter#getViewId}.
         * @example <caption>This example sets the section to the node in variable
         *   <code class="prettyprint">theNode</code> and focuses that node. Data model nodes can
         *   be found directly from the {@link treeNodeAdapter} or from {@link treeView#getNodes} or
         *   {@link treeView#getSelectedNodes}.</caption>
         * $( ".selector" ).treeView( "setSelectedNodes", [theNode], true);
         */
        setSelectedNodes: function( pNodes, pFocus, pNoNotify ) {
            var i, id, el,
                elements = [],
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getViewId ) {
                throw unsupportedError();
            }

            pFocus = !!pFocus;
            if ( !this.options.multiple ) {
                pNodes = [ pNodes[0] ];
            }

            for ( i = 0; i < pNodes.length; i++ ) {
                id = nodeAdapter.getViewId( this.baseId, pNodes[i] );
                el = $( "#" + this.baseId + id ).children( SEL_CONTENT )[0];
                if ( el ) {
                    elements.push( el );
                } else {
                    debug.warn( "TreeView: Ignoring bad node in setSelectedNodes" );
                }
            }
            this._select( $( elements ), null, pFocus, false, pNoNotify );
        },

        /**
         * <p>Get the ids of expanded nodes. The {@link treeNodeAdapter} must implement view state methods.</p>
         *
         * @return [*] Array of data model node ids one for each expanded node
         * @throws An exception if the {@link treeNodeAdapter} doesn't implement {@link treeNodeAdapter#getExpandedNodeIds}.
         * @example <caption>This example gets the expanded node ids for an APEX Tree region with static id "myTree"
         * and saves them in a page item. This could be done when the page is submitted
         * (See event {@link apex.event:apexpagesubmit}) or every time the
         * expansion state changes (see event {@link treeView#event:expansionStateChange}).</caption>
         * var expandedIds = apex.region( "myTree" ).call( "getExpandedNodeIds" );
         * $s( "P1_EXPANDED_IDS", expandedIds.join( ":" ) );
         * @example <caption>This example builds on the previous one to restore the node expansion state
         * when the page loads; when the tree node adapter is created. This code goes in the Tree region JavaScript Initialization
         * Code attribute for region with static id "myTree". Note the <code class="prettyprint">makeNodeAdapter</code>
         * option is specific to the APEX Tree region not the treeView widget.</caption>
         * function( options ) {
         *     options.makeNodeAdapter = function( data, types, hasIdentity ) {
         *         var adapter;
         *         adapter = $.apex.treeView.makeDefaultNodeAdapter( data, types, hasIdentity, $v("P1_EXPANDED_IDS").split(":") );
         *         return adapter;
         *     }
         *     return options;
         * }
         */
        getExpandedNodeIds: function() {
            var nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getExpandedNodeIds ) {
                throw unsupportedError();
            }
            return nodeAdapter.getExpandedNodeIds( this.baseId );
        },

        /**
         * <p>Get a map from node id to Boolean where true = expanded and false = collapsed</p>
         * <p>Note It is not guaranteed that the map contain all nodes! It may only contain nodes that have been
         * explicitly expanded or collapsed by the user. This is up to the tree node adapter.
         * The {@link treeNodeAdapter} must implement view state methods.</p>
         *
         * @return {Object} An object where the properties are node ids and the values are true if expanded and false otherwise.
         * @throws An exception if the {@link treeNodeAdapter} doesn't implement {@link treeNodeAdapter#getExpandedState}.
         */
        getExpandedState: function() {
            var nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.getExpandedState ) {
                throw unsupportedError();
            }
            return nodeAdapter.getExpandedState( this.baseId );
        },

        /**
         * <p>Search through the tree starting at the root or the given parent tree node for one or more matching nodes
         * (the parent tree node is not included in the search). The set of matched tree nodes is returned as a
         * <code class="prettyprint">jQuery</code> object.
         * The match criteria is determined by the <code class="prettyprint">match</code> function that is called
         * for each node. The search can be limited
         * to a specified depth (from the starting node). Find can return either all the nodes matched or just the first
         * one.</p>
         *
         * <p>This is a synchronous API so it can only search tree nodes that have been loaded. If the data model is
         * loaded asynchronously only those tree nodes that have already been loaded into the model can be searched.
         * The tree nodes don't need to be expanded to be searched, but searching will cause them to be rendered
         * to the DOM if they aren't already.</p>
         *
         * @param {Object} pOptions The properties control how the search is done.
         * @param {function} pOptions.match A function that takes a node as its only argument and returns true
         *   if the node is to be included in the find results.
         * @param {jQuery} [pOptions.parentNodeContent$] The parent of the nodes to start search from. The default is to start at the root(s).
         * @param {integer} [pOptions.depth] How deep to search from the starting tree node. A value of -1 means no depth limit. The default is 1.
         * @param {boolean} [pOptions.findAll] If true find all matches up to the given depth. If false return the first found. Default false.
         * @return {jQuery} A jQuery object with the set of tree nodes found. It may be empty if no nodes were found.
         * @example <caption>This example searches the whole tree for any nodes that contains the string "ton"
         *   in the <code class="prettyprint">label</code> property. It then adds the class "findMatch" to each
         *   node's label.
         *   The default tree node adapter uses the <code class="prettyprint">label</code> property as the
         *   node label to display. </caption>
         * $( ".selector" ).treeView( "find", {
         *     depth: -1,
         *     findAll: true,
         *     match: function(n) {
         *         return n.label.indexOf( "ton" ) >= 0;
         *     }
         * } ).find( ".a-TreeView-label" ).addClass( "findMatch" );
         */
        find: function( pOptions ) {
            return $(this._find( pOptions.parentNodeContent$ || null, pOptions.match, pOptions.depth || 1, pOptions.findAll || false ));
        },

        /**
         * <p>Expand the given tree node(s) or if no node is given expand the root node(s). Expanding a node makes all
         * of its children visible. See also {@link treeView#expandAll} and {@link treeView#collapse}.</p>
         *
         * @param {jQuery} [pNodeContent$] One or more tree nodes to expand or null or omit to expand the root(s).
         * @example <caption>This example will expand the currently selected node(s) if collapsed and has children.</caption>
         * var tree$ = $( ".selector" );
         * tree$.treeView( "expand", tree$.treeView( "getSelection" ) );
         */
        expand: function( pNodeContent$ ) {
            var self = this;

            if ( !pNodeContent$ ) {
                pNodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            pNodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_EXPANDABLE ) ) {
                    self._expandNode( node$ );
                }
            } );
        },

        /**
         * <p>Expand the given tree node(s) or if no node is given the root node(s) and recursively
         * expand all its children. See also {@link treeView#collapseAll}.</p>
         *
         * @param {jQuery} [pNodeContent$] One or more tree nodes to expand all from or null or omit to expand all from the root(s).
         * @example <caption>This example will expand all tree nodes.</caption>
         * $( ".selector" ).treeView( "expandAll" );
         */
        expandAll: function( pNodeContent$ ) {
            var self = this;

            if ( !pNodeContent$ ) {
                pNodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            pNodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_EXPANDABLE ) ) {
                    self._expandNode( node$, function() {
                        self.expandAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                    });
                } else {
                    self.expandAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                }
            } );
        },

        /**
         * <p>Collapse the given tree node(s) or if no node is given collapse the root node(s). Collapsing a node makes all
         * of its children hidden. See also {@link treeView#collapseAll} and {@link treeView#expand}.</p>
         *
         * @param {jQuery} [pNodeContent$] One or more tree nodes to collapse or null or omit to collapse the root(s).
         * @example <caption>This example will collapse the currently selected node(s) if expanded.</caption>
         * var tree$ = $( ".selector" );
         * tree$.treeView( "collapse", tree$.treeView( "getSelection" ) );
         */
        collapse: function( pNodeContent$ ) {
            var self = this;

            if ( !pNodeContent$ ) {
                pNodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            pNodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                    self._collapseNode( node$ );
                }
            } );
        },

        /**
         * <p>Collapse the given tree node(s) or if no node is given the root node(s) and recursively
         * collapse all its children. See also {@link treeView#expandAll}.</p>
         *
         * @param {jQuery} [pNodeContent$] One or more tree nodes to collapseALl from or null or omit to collapseAll from the root(s).
         * @example <caption>This example will collapse all tree nodes.</caption>
         * $( ".selector" ).treeView( "collapseAll" );
         */
        collapseAll: function( pNodeContent$ ) {
            var self = this;

            if ( !pNodeContent$ ) {
                pNodeContent$ = this._getRoots().children( SEL_CONTENT );
            }
            pNodeContent$.each( function() {
                var node$ = $( this ).closest( SEL_NODE );
                self.collapseAll( node$.children( "ul" ).children( "li" ).children( SEL_CONTENT ) );
                if ( node$.hasClass( C_COLLAPSIBLE ) ) {
                    self._collapseNode( node$ );
                }
            } );
        },

        /**
         * <p>Adds a new tree node in the treeView and also adds it to the adapter's data model via the
         * {@link treeNodeAdapter#addNode} method.
         * First checks if the model allows add for the parent node by calling {@link treeNodeAdapter#allowAdd}.
         * The label of the new node is entered by the user in-place.
         * The tree node label is replaced by a text input field. Pressing the Escape key will cancel the add,
         * blur or Enter key will complete the add.
         * The order of the new node among its siblings is determined by the adapter after the node is added.</p>
         *
         * @param {jQuery} pParentNodeContent$ The parent tree node to add the new node under.
         *   Must be a jQuery object representing exactly one tree node element.
         * @param {string} pInitialLabel The initial label for the new node which is then edited.
         * @param {Object} [pContext] Optional arbitrary object to pass into the adapter allowAdd and addNode methods.
         * This is an object containing information needed by the {@link treeNodeAdapter#addNode} method to create the new node.
         * In the typical simple case it is exactly the model node.
         * @throws An exception if the nodeAdapter doesn't implement {@link treeNodeAdapter#addNode} or {@link treeNodeAdapter#allowAdd}.
         */
        addNodeInPlace: function( pParentNodeContent$, pInitialLabel, pContext ) {
            var ul$, newNode$, parent, level,
                self = this,
                ctrl$ = this.element,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                completed = false;

            function cancel( focus ) {
                newNode$.remove();
                self._makeLeafIfNeeded( pParentNodeContent$ );
                self._select( pParentNodeContent$, null, focus );
                self._endEdit( {
                    action: "add",
                    status: "cancel"
                } );
            }

            function complete( newName, focus ) {
                var input;

                if ( completed ) {
                    return;
                }

                // must have entered a name
                if ( newName.length === 0 ) {
                    cancel( focus );
                    return;
                }

                completed = true;
                nodeAdapter.addNode( parent, ul$.children().length - 1, newName, pContext, function ( child, index ) {
                    var node$, out;

                    if ( child === false ) {
                        // try again
                        completed = false;
                        input = newNode$.find( SEL_INPLACE_EDIT ).val( pInitialLabel ).get( 0 );
                        setFocus( input );
                        input.select();
                        return;
                    }
                    if ( child ) {
                        newNode$.remove();
                        out = util.htmlBuilder();
                        self._renderNode( child, level, out );
                        if ( index >= ul$.children( "li" ).length ) {
                            ul$.append( out.toString() );
                        } else {
                            ul$.children( "li" ).eq( index ).before( out.toString() );
                        }
                        node$ = ul$.children( "li" ).eq( index );
                        if ( self.getSelection().length === 0 ) {
                            // select the new node if nothing else selected
                            self._select( node$.children( SEL_CONTENT ), null, focus );
                        }
                        self._endEdit( {
                            action: "add",
                            status: "complete"
                        } );

                        self._trigger( "added", {}, {
                            parentNode: parent,
                            parent$: pParentNodeContent$,
                            index: index,
                            node: child,
                            node$: node$.children( SEL_CONTENT )
                        } );

                    } else {
                        cancel( focus );
                    }
                } );
            }

            function addInput() {
                var inputWidth, nodeContent$, input$,
                    out = util.htmlBuilder(),
                    addId = self.baseId + "new";

                // keep in sync with a normal rendered node _renderNode, renderTreeNodeContent
                out.markup( "<li" )
                    .attr( "id", addId )
                    .attr( "class", C_NODE + " " + C_LEAF )
                    .markup( "><div" )
                    .attr( "class", C_ROW + " " + C_SELECTED )
                    .markup( "></div><div" )
                    .attr( "class", C_CONTENT + " " + C_SELECTED )
                    .markup( ">" );
                if ( nodeAdapter.getIcon ) {
                    // no specific icon but leave room for it
                    out.markup( "<span" ).attr( "class", o.iconType ).markup( "></span>" );
                }

                out.markup( "<span role='treeitem'" ).attr( "class", o.labelClass )
                    .attr( A_LEVEL, level )
                    .attr( A_SELECTED, TRUE)
                    .markup( "><input class='" + C_INPLACE_EDIT + "' type='text'></span></div></li>" );

                // unselect any other nodes
                self._select( $(), null, false );

                ul$.append( out.toString() );
                newNode$ = ul$.find( "#" + addId );
                nodeContent$ = newNode$.children( SEL_CONTENT );
                if ( self.rtlFactor === 1 ) {
                    inputWidth = nodeContent$.width() - nodeContent$.find( self.labelSelector )[0].offsetLeft - 16;
                } else {
                    inputWidth = nodeContent$.find( self.labelSelector )[0].offsetLeft + nodeContent$.find( self.labelSelector ).width()  - 16;
                }
                input$ = nodeContent$.find( SEL_INPLACE_EDIT );
                initNodeLabelInput( input$, pInitialLabel, inputWidth, complete, cancel );
                self._beginEdit( {
                    action: "add",
                    context: pContext,
                    input: input$[0]
                } );
            }

            if ( !nodeAdapter.addNode || !nodeAdapter.allowAdd ) {
                throw unsupportedError();
            }

            if ( pParentNodeContent$ === null ) {
                parent = nodeAdapter.root();
                if ( o.showRoot ) {
                    pParentNodeContent$ = ctrl$.find( "ul:first > li" );
                } else {
                    // This is the case where a new top level (multi-root) node is added.
                    if ( !nodeAdapter.allowAdd( parent, "add", pContext ?  [pContext] : undefined ) ) {
                        return;
                    }
                    level = 1;
                    ul$ = ctrl$.find( "ul:first" );
                    addInput();
                    return;
                }
            } else {
                parent = this.treeMap[getIdFromNode( pParentNodeContent$.parent() )];
            }

            if ( !nodeAdapter.allowAdd( parent, "add", pContext ?  [pContext] : undefined ) ) {
                return;
            }
            level = getLevel( pParentNodeContent$, self.labelSelector ) + 1;
            self._makeParentIfNeeded( pParentNodeContent$ );
            this._expandNode( pParentNodeContent$.parent(), function () {
                ul$ = pParentNodeContent$.next( "ul" );
                addInput();
            } );
        },

        /**
         * <p>Renames a tree node in the treeView and updates the model via the node adapter {@link treeNodeAdapter#renameNode} method.
         * First checks it the model allows the node to be renamed. The rename is done by the user in-place.
         * The tree node label is replaced by a text input field. Escape will cancel,
         * Enter key or loosing focus will complete the rename.
         * The order of the renamed node among its siblings is determined by the model after the node is renamed.</p>
         *
         * @param nodeContent$ the tree node to rename. Must be a jQuery object representing exactly one tree node element.
         * @throws An exception if the nodeAdapter doesn't implement {@link treeNodeAdapter#renameNode} or {@link treeNodeAdapter#allowRename}.
         */
        renameNodeInPlace: function( nodeContent$ ) {
            var node, input$, oldLabel, inputWidth, label$, renderState,
                self = this,
                nodeAdapter = this.nodeAdapter,
                node$ = nodeContent$.parent(),
                nodeId = getIdFromNode( node$ ),
                completed = false,
                out = util.htmlBuilder();

            function cancel( focus ) {
                renderState.selected = nodeContent$.hasClass( C_SELECTED );
                out.clear();
                renderTreeNodeContent( out, node, nodeAdapter, self.renderNodeOptions, renderState );
                nodeContent$.html( out.toString() );
                if ( renderState.selected ) {
                    self._select( nodeContent$, null, focus );
                }
                self._endEdit( {
                    action: "rename",
                    status: "cancel"
                } );
            }

            function complete( newLabel, focus ) {
                var input;

                if ( completed ) {
                    return;
                }
                completed = true;
                if ( newLabel === oldLabel || newLabel.length === 0 ) {
                    cancel( focus );
                    return;
                }
                nodeAdapter.renameNode( node, newLabel, function ( renamedNode, index ) {
                    var oldIndex, ul$, children$;

                    if ( renamedNode === false ) {
                        // try again
                        completed = false;
                        input = nodeContent$.find( SEL_INPLACE_EDIT ).val( oldLabel )[0];
                        setFocus( input );
                        input.select();
                        return;
                    }
                    if ( renamedNode ) {
                        out.clear();
                        renderState.selected = nodeContent$.hasClass( C_SELECTED );
                        renderTreeNodeContent( out, renamedNode, nodeAdapter, self.renderNodeOptions, renderState );
                        nodeContent$.html( out.toString() );
                        self.treeMap[nodeId] = renamedNode; // update map in case node changed
                        ul$ = node$.parent();
                        children$ = ul$.children( "li" );
                        oldIndex = children$.index( node$ );
                        if ( oldIndex !== index ) {
                            if ( index > oldIndex ) {
                                index += 1;
                            }
                            if ( index >= children$.length ) {
                                ul$.append( node$ );
                            } else {
                                children$.eq( index ).before( node$ );
                            }
                        }
                        if ( renderState.selected ) {
                            self._select( nodeContent$, null, focus );
                        }
                        self._endEdit( {
                            action: "rename",
                            status: "complete"
                        } );

                        self._trigger( "renamed", {}, {
                            prevLabel: oldLabel,
                            index: index,
                            node: renamedNode,
                            node$: nodeContent$
                        } );

                        // the DOM node didn't change so _select won't fire the change event - force it
                        self._trigger( EVENT_SELECTION_CHANGE, 0 );

                    } else {
                        cancel( focus );
                    }
                } );
            }

            if ( !nodeAdapter.renameNode || !nodeAdapter.allowRename ) {
                throw unsupportedError();
            }

            node = this.treeMap[nodeId];
            if ( !nodeAdapter.allowRename( node ) ) {
                return;
            }

            label$ = nodeContent$.find( this.labelSelector );
            renderState = {
                level: parseInt( label$.attr( A_LEVEL ), 10 ),
                selected: label$.attr( A_SELECTED ) === TRUE,
                disabled: label$.attr( A_DISABLED ) === TRUE,
                hasChildren: label$.attr( A_EXPANDED ) !== undefined,
                expanded: label$.attr( A_EXPANDED ) === TRUE
            };
            oldLabel = nodeAdapter.getLabel( node );
            if ( self.rtlFactor === 1 ) {
                inputWidth = nodeContent$.width() - label$[0].offsetLeft - 16;
            } else {
                inputWidth = label$[0].offsetLeft + label$.width()  - 16;
            }
            input$ = $( "<input class='" + C_INPLACE_EDIT + "' type='text'>" );
            label$.empty().append( input$ );
            initNodeLabelInput( input$, oldLabel, inputWidth, complete, cancel );
            self._beginEdit( {
                action: "rename",
                node: node,
                input: input$[0]
            } );
        },

        /**
         * <p>Deletes nodes from the adapter's data model and treeView. First checks that the model allows delete
         * with {@link treeNodeAdapter#allowDelete} then deletes
         * the node using {@link treeNodeAdapter#deleteNode} (a potentially async operation).
         * If the deletes are allowed and successful then the tree nodes are removed from the treeView DOM.<p>
         *
         * @param {jQuery} pNodeContent$ One or more tree nodes to delete.
         * @throws An exception if the node adapter doesn't implement {@link treeNodeAdapter#deleteNode}
         *   or {@link treeNodeAdapter#allowDelete}.
         */
        deleteNodes: function( pNodeContent$ ) {
            var i, total, count,
                self = this,
                toDelete = [],
                deletedEl = [],
                deleted = [],
                nodeAdapter = this.nodeAdapter;

            function doDelete( index ) {
                var info = toDelete[index];

                function callback( success ) {
                    count += 1;
                    if ( success ) {
                        deletedEl.push( info.element );
                        deleted.push( {
                            node: info.node,
                            parent$: info.parent$,
                            index: info.index
                        } );
                        // need to delete mapping from adapter view state
                        if ( nodeAdapter.clearViewId ) {
                            nodeAdapter.clearViewId( self.baseId, info.node );
                        }
                    }

                    if ( count >= total ) {
                        // have received all callbacks
                        self.deleteTreeNodes( $( deletedEl ) );

                        self._trigger( "deleted", {}, {
                            items: deleted
                        } );
                    }
                }

                nodeAdapter.deleteNode( info.node, callback, index < total - 1 );
            }

            if ( !nodeAdapter.deleteNode || !nodeAdapter.allowDelete ) {
                throw unsupportedError();
            }

            pNodeContent$.each( function() {
                var nc$ = $( this ),
                    node = self.treeMap[getIdFromNode( nc$.parent() )];

                if ( nodeAdapter.allowDelete( node ) ) {
                    toDelete.push({
                        node: node,
                        element: nc$[0],
                        parent$: nc$.parent().parent().parent().children( SEL_CONTENT ),
                        index: domIndex( nc$.parent() )
                    });
                }
            } );
            total = toDelete.length;
            count = 0;
            for ( i = 0; i < total; i++ ) {
                doDelete(i);
            }
        },

        /**
         * <p>Deletes tree nodes that have already been deleted from the adapter's data model.</p>
         *
         * @param {jQuery} pNodeContent$ One or more tree nodes to delete.
         */
        deleteTreeNodes: function( pNodeContent$ ) {
            var prevNode$,
                self = this,
                parentNodeContent$ = pNodeContent$.closest( "ul" ).prev(),
                node$ = pNodeContent$.parent(),
                thisLastFocused = pNodeContent$.children( this.labelSelector ).filter( this.lastFocused ).length > 0,
                thisSelected = pNodeContent$.hasClass( C_SELECTED );

            if ( thisSelected || thisLastFocused ) {
                // select previous closest node
                prevNode$ = prevNode( node$.eq(0) );
                if ( prevNode$.length === 0 ) {
                    prevNode$ = this._getRoots().first();
                }
                if ( prevNode$.length > 0 ) {
                    if ( thisSelected ) {
                        this._select( prevNode$.children( SEL_CONTENT ), null, thisLastFocused );
                    } else {
                        // must have been focused
                        this._setFocusable( prevNode$.children( SEL_CONTENT ).find( this.labelSelector ) );
                    }
                } else if ( thisLastFocused ) {
                    this.lastFocused = null;
                }
            }

            node$.remove().each( function() {
                delete self.treeMap[getIdFromNode( node$ )];
            } );
            this._makeLeafIfNeeded( parentNodeContent$ );
        },

        /**
         * <p>Adds the given node to the adapter's data model and the treeView under the given parent tree node
         * and at the given index.
         * If <code class="prettyprint">pNode</code> is null or omitted then the adapter should create
         * and add a new default node.
         * The treeNodeAdapter must implement the <code class="prettyprint">addNode</code>
         * and <code class="prettyprint">allowAdd</code> methods and {@link treeNodeAdapter#allowAdd} must return
         * true for the given node and parent.</p>
         *
         * @param {jQuery|null} pToParentNodeContent$ The parent tree node to add a child to. If null or an empty
         * jQuery object then the node is added to the root (this can only happen when the root node is not shown
         * in the treeView).
         * @param {integer} pIndex The index in the array of children to add the new node.
         * @param {treeNodeAdapter.node} [pNode] (optional) New node to add.
         * @throws An exception if the node adapter doesn't implement {@link treeNodeAdapter#addNode},
         *   or {@link treeNodeAdapter#allowAdd} or if no parent node is given and option
         *   {@link treeView#showRoot} is true.
         */
        addNode: function( pToParentNodeContent$, pIndex, pNode ) {
            var focus, parentNode,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.addNode || !nodeAdapter.allowAdd ) {
                throw unsupportedError();
            }

            if ( pToParentNodeContent$ && pToParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( pToParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw parentRequiredError();
                }
                parentNode = nodeAdapter.root();
            }

            if ( nodeAdapter.allowAdd( parentNode, "add", pNode ? [ pNode ] : undefined ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after add
                this._add( {}, pToParentNodeContent$, pIndex, pNode, focus );
            }
        },

        /**
         * <p>Moves the given tree nodes to be children of the given parent tree node starting at the given index.
         * The adapter must allow each of the nodes to be added to the new parent and must allow
         * all the nodes to be deleted.</p>
         *
         * @param {jQuery} pToParentNodeContent$ The parent tree node to move node to.
         * If null or an empty jQuery object then
         * the node is moved to the root (this can only happen when the root node is not shown in the treeView)
         * @param {integer} pIndex The index in the array of children to move the nodes to.
         * @param {jQuery} pNodeContent$ The tree nodes to be moved.
         * @throws An exception if the {@link treeNodeAdapter} doesn't implement {@link treeNodeAdapter#moveNodes}, or
         * {@link treeNodeAdapter#allowDelete} or {@link treeNodeAdapter#allowAdd}.
         */
        moveNodes: function( pToParentNodeContent$, pIndex, pNodeContent$ ) {
            var i, focus, parentNode,
                nodes = this.getNodes( pNodeContent$ ),
                allAllowDelete = true,
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.moveNodes || !nodeAdapter.allowDelete || !nodeAdapter.allowAdd ) {
                throw unsupportedError();
            }

            if ( pToParentNodeContent$ && pToParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( pToParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw parentRequiredError();
                }
                parentNode = nodeAdapter.root();
            }

            for ( i = 0; i < nodes.length; i++ ) {
                if ( !nodeAdapter.allowDelete( nodes[i] ) ) {
                    allAllowDelete = false;
                    break;
                }
            }

            if ( allAllowDelete && nodeAdapter.allowAdd( parentNode, "move", nodes ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after move
                this._moveOrCopy( {}, pToParentNodeContent$, pIndex, pNodeContent$, false, focus );
            }
        },

        /**
         * <p>Copies the given tree nodes to be children of the given parent tree node starting at the given index.
         * The adapter must allow each of the nodes to be added to the new parent.</p>
         *
         * @param {jQuery} pToParentNodeContent$ parent tree node to copy nodes to. If null or an empty jQuery object then
         * the node is copied to the root (this can only happen when the root node is not shown in the treeView).
         * @param {integer} pIndex The index in the array of children to copy the nodes to.
         * @param {jQuery} pNodeContent$ The tree nodes to be copied.
         * @throws An exception if the {@link treeNodeAdapter} doesn't implement {@link treeNodeAdapter#copyNodes}, or
         *   {@link treeNodeAdapter#allowAdd}.
         */
        copyNodes: function( pToParentNodeContent$, pIndex, pNodeContent$ ) {
            var focus, parentNode,
                nodes = this.getNodes( pNodeContent$ ),
                nodeAdapter = this.nodeAdapter;

            if ( !nodeAdapter.copyNodes || !nodeAdapter.allowAdd ) {
                throw unsupportedError();
            }

            if ( pToParentNodeContent$ && pToParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( pToParentNodeContent$.parent() )];
            } else {
                if ( this.options.showRoot ) {
                    throw parentRequiredError();
                }
                parentNode = nodeAdapter.root();
            }

            if ( nodeAdapter.allowAdd( parentNode, "copy", nodes ) ) {
                focus = this.element.find( "." + C_FOCUSED ).length > 0; // if have focus then focus selection after copy
                this._moveOrCopy( {}, pToParentNodeContent$, pIndex, pNodeContent$, true, focus );
            }
        },

        /**
         * <p>Call this method if the model node changes in a way that would affect its display in the tree.
         * For example if the label or icon changes. If a node's children have changed then call
         * {@link treeView#refresh} instead.
         * If a nodes position has changed then call refresh on the nodes parent node.</p>
         *
         * @param {jQuery} pNodeContent$ The treeView node for which the underlying data model node has changed.
         * @example <caption>See {@link treeView#getNodes} for an example.</caption>
         */
        update: function( pNodeContent$ ) {
            var wasFocused, nc, row$, label$, renderState, disabled,
                node = this.treeMap[getIdFromNode( pNodeContent$.parent() )],
                nodeAdapter = this.nodeAdapter,
                out = util.htmlBuilder();

            label$ = pNodeContent$.find( this.labelSelector );
            wasFocused = label$[0] === this.lastFocused;
            // update node classes
            if ( nodeAdapter.getClasses || nodeAdapter.isDisabled ) {
                row$ = pNodeContent$.prevAll( SEL_ROW );
                removeClassesExcept( pNodeContent$[0], [C_CONTENT, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER ]);
                removeClassesExcept( row$[0], [C_ROW, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER ]);
                if ( nodeAdapter.getClasses ) {
                    nc = nodeAdapter.getClasses( node );
                    if ( nc ) {
                        pNodeContent$.addClass( nc );
                        row$.addClass( nc );
                    }
                }
                if ( nodeAdapter.isDisabled && nodeAdapter.isDisabled( node ) ) {
                    pNodeContent$.addClass( C_DISABLED );
                    row$.addClass( C_DISABLED );
                    disabled = true;
                }
            }

            renderState = {
                level: parseInt( label$.attr( A_LEVEL ), 10 ),
                selected: label$.attr( A_SELECTED ) === TRUE,
                disabled: disabled,
                hasChildren: label$.attr( A_EXPANDED ) !== undefined,
                expanded: label$.attr( A_EXPANDED ) === TRUE
            };

            renderTreeNodeContent( out, node, nodeAdapter, this.renderNodeOptions, renderState );
            pNodeContent$.html( out.toString() );
            if ( wasFocused ) {
                this._setFocusable( pNodeContent$.find( this.labelSelector ) ); // need to find again - don't use label$
            }
        },

        //
        // Internal methods
        //

        _copy: function( pDataTransfer ) {
            var i, n,
                nodeAdapter = this.nodeAdapter,
                selection = this.getSelectedNodes(),
                fmts = this.options.dataTransferFormats;

            if ( !selection.length ) {
                return;
            }
            fmts.forEach(function( x ) {
                x.writer.begin( nodeAdapter, selection );
            } );
            for ( i = 0; i < selection.length; i++ ) {
                n = selection[i];
                fmts.forEach(function( x ) {
                    x.writer.node( n, i, nodeAdapter.getLabel( n ) );
                } );
            }
            fmts.forEach(function( x ) {
                x.writer.end();
                pDataTransfer.setData( x.format, x.writer.toString() );
            } );
        },

        /*
         * Turns simple nested lists into tree object structure used by treeView widget.
         */
        _parseTreeMarkup: function ( $el, types ) {
            var a, c, treeData,
                allHaveId = true, // assume true
                self = this;

            function parseNodeChildrenMarkup( el$ ) {
                var children = [];

                el$.children( "ul" ).children( "li" ).each(function() {
                    var node, icon, id, classes, type,
                        node$ = $( this ),
                        a$ = node$.children( "a" ).first(),
                        span$ = node$.children( "span" ).first();

                    node = { };
                    if ( a$.length > 0 ) {
                        node.label = a$.text();
                        node.link = a$.attr("href");
                    } else if ( span$.length > 0 ) {
                        node.label = span$.text();
                    }
                    id = node$.attr( "data-id" );
                    if ( id ) {
                        node.id = id;
                    } else {
                        allHaveId = false;
                    }
                    if ( node$.attr("data-current") === TRUE ) {
                        node.current = true; // only used to find this node for selection after rendering
                        self.hasCurrent = true;
                    }
                    classes = node$.attr( "class" );
                    if ( classes ) {
                        node.classes = classes;
                    }
                    if ( node$.attr( "data-disabled" ) === TRUE ) {
                        node.isDisabled = true;
                    }
                    icon = node$.attr( "data-icon" );
                    if ( icon ) {
                        node.icon = icon;
                    }
                    type = node$.attr( "data-type" );
                    if ( type ) {
                        node.type = type;
                    }
                    if ( node$.children( "ul" ).length > 0 ) {
                        node.children = parseNodeChildrenMarkup( node$ );
                    }
                    children.push( node );
                });
                return children;
            }

            c = parseNodeChildrenMarkup( $el );
            if ( c.length >= 1 ) {
                if ( c.length === 1 && this.options.showRoot ) {
                    treeData = c[0];
                } else {
                    treeData = { children: c };
                }
            } else {
                treeData = null;
            }
            if (!types) {
                types = {
                    "default": {
                        operations: {
                            canAdd: false,
                            canDelete: false,
                            canRename: false,
                            canDrag: false
                        }
                    }
                };
            }
            a = $.apex.treeView.makeDefaultNodeAdapter( treeData, types, allHaveId );
            return function() {
                return a;
            };
        },

        _renderNode: function( node, level, out ) {
            var hasChildren, nextId, nodeClass, contentClass, noCollapse, expanded, rowClass, nc,
                disabled = false,
                o = this.options,
                nodeAdapter = this.nodeAdapter;

            nextId = this.nextNodeId;
            this.treeMap[nextId] = node;
            if ( nodeAdapter.setViewId ) {
                nodeAdapter.setViewId( this.baseId, node, nextId);
            }
            this.nextNodeId += 1;

            nodeClass = C_NODE + " ";
            hasChildren = nodeAdapter.hasChildren( node );
            if ( hasChildren === null ) {
                hasChildren = true; // null means not sure but we have to assume there could be children
            }
            if ( hasChildren ) {
                expanded = false;
                if ( nodeAdapter.isExpanded ) {
                    expanded = nodeAdapter.isExpanded( this.baseId, node );
                }
                nodeClass += expanded ? C_COLLAPSIBLE : C_EXPANDABLE;

            } else {
                nodeClass += C_LEAF;
            }
            noCollapse = nextId === 0 && o.showRoot && !o.collapsibleRoot;
            if ( noCollapse ) {
                nodeClass += " " + C_NO_COLLAPSE;
            }
            if ( level === 1 ) {
                nodeClass += " " + C_TOP_NODE;
            }

            contentClass = C_CONTENT;
            if ( nodeAdapter.isDisabled && nodeAdapter.isDisabled( node ) ) {
                contentClass += " " + C_DISABLED;
                disabled = true;
            }

            rowClass = C_ROW;

            out.markup( "<li" ).attr( "id", this.baseId + nextId )
                .attr( "class", nodeClass )
                .markup( ">" );

            if ( nodeAdapter.getClasses ) {
                nc = nodeAdapter.getClasses( node );
                if ( nc ) {
                    contentClass += " " + nc;
                    rowClass += " " + nc;
                }
            }

            out.markup( "<div" ).attr( "class", rowClass ).markup( "></div>" );

            // for nodes with children show the disclose (expand/collapse) control
            if ( hasChildren &&
                !noCollapse ) { // suppress the toggle on the root if it is not collapsible
                out.markup( "<span class='" + C_TOGGLE + "'></span>" );
            }

            out.markup( "<div" ).attr( "class", contentClass ).markup( ">" );
            renderTreeNodeContent( out, node, nodeAdapter, this.renderNodeOptions, {
                level: level,
                selected: false,
                disabled: disabled,
                hasChildren: hasChildren,
                expanded: expanded
            } );
            out.markup( "</div>" );

            // do lazy rendering - don't add children until expanded
            if ( expanded ) {
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, level + 1, out );
                out.markup( M_END_CHILDREN );
            }
            out.markup( "</li>" );
        },

        /*
         * callback function fn and node$ are only used when expanding a node with async loaded children
         */
        _renderChildren: function( node, level, out, fn, node$ ) {
            var len,
                self = this,
                nodeAdapter = this.nodeAdapter;

            function doit() {
                var i;
                for ( i = 0; i < len; i++ ) {
                    self._renderNode( nodeAdapter.child( node, i ), level, out );
                }
                if ( fn ) {
                    fn( true );
                }
            }

            len = nodeAdapter.childCount( node );
            if ( len === null ) {
                if ( fn ) {
                    //give feedback
                    util.delayLinger.start( node$[0].id, function() {
                        node$.addClass( C_PROCESSING );
                    } );
                    nodeAdapter.fetchChildNodes( node, function ( status ) {
                        // remove feedback
                        util.delayLinger.finish( node$[0].id, function() {
                            node$.removeClass( C_PROCESSING );
                            if ( status === 0 ) {
                                fn( status );
                            }
                        } );
                        if ( status ) {
                            len = nodeAdapter.childCount( node );
                            // double check that there really are children
                            if ( len > 0 ) {
                                doit();
                                return;
                            } // else
                            status = 0;
                        }
                        // else status is false or 0
                        // if status is 0 it will be a leaf, if false it will be expandable so user can try again
                        // if 0 wait until after processing is done being shown because the toggle is removed
                        if ( status === false ) {
                            fn( status );
                        }
                    } );
                }
            } else if ( len > 0 ) {
                doit();
            } else {
                if ( fn ) {
                    fn(0); // no children were rendered
                }
            }
        },

        _getRoots: function() {
            return this.element.children( "ul" ).children( "li" );
        },

        _find: function( parentNodeContent$, match, depth, findAll ) {
            var node, childrenNodes$, node$,
                self = this,
                result = [];

            if ( !parentNodeContent$ ) {
                childrenNodes$ = this._getRoots();
            } else {
                node$ = parentNodeContent$.parent();
                this._addChildrenIfNeeded( node$ );
                childrenNodes$ = node$.children( "ul" ).children( "li" );
            }
            childrenNodes$.each( function() {
                node = self.treeMap[getIdFromNode( $( this ) )];
                if ( match( node ) ) {
                    result.push( $( this ).children( SEL_CONTENT )[0] );
                    if ( !findAll ) {
                        return false;
                    }
                }
            } );
            if ( (findAll || result.length === 0) && ( depth > 1 || depth === -1 ) ) {
                childrenNodes$.each( function() {
                    result = result.concat( self._find( $( this ).children( SEL_CONTENT ), match, depth === -1 ? depth : depth - 1, findAll ) ) ;
                    if ( result.length > 0 && !findAll ) {
                        return false;
                    }
                } );
            }
            return result;
        },

        _makeParentIfNeeded: function ( nodeContent$ ) {
            if ( nodeContent$ && nodeContent$.prev( SEL_TOGGLE ).length === 0 ) {
                nodeContent$.parent().removeClass( C_LEAF ).addClass( C_EXPANDABLE );
                nodeContent$.before( "<span class='" + C_TOGGLE + "'></span>" );
                nodeContent$.after( M_BEGIN_CHILDREN + M_END_CHILDREN );
                nodeContent$.parent().children( "ul" ).hide();
            }
        },

        _makeLeafIfNeeded: function ( nodeContent$ ) {
            var self = this,
                nodeAdapter = this.nodeAdapter;

            nodeContent$.each( function() {
                var node, node$,
                    nc$ = $( this );

                if ( nc$.next( "ul" ).find( "li" ).length === 0 ) {
                    node$ = nc$.parent();
                    // if was expanded let view state know that it isn't any more
                    if ( node$.hasClass( C_COLLAPSIBLE ) && nodeAdapter.setExpanded ) {
                        node = self.treeMap[getIdFromNode( node$ )];
                        nodeAdapter.setExpanded( self.baseId, node, false );
                    }
                    nc$.parent().removeClass( C_EXPANDABLE + " " + C_COLLAPSIBLE ).addClass( C_LEAF );
                    nc$.find( self.labelSelector ).removeAttr( A_EXPANDED );
                    nc$.prev( SEL_TOGGLE ).remove();
                    nc$.next( "ul" ).remove();
                }
            } );
        },

        // Add children nodes to the tree without expanding
        // Will not work with async loaded nodes
        _addChildrenIfNeeded: function( node$ ) {
            var ul$, out,
                node = this.treeMap[getIdFromNode( node$ )];

            ul$ = node$.children( "ul" );
            if ( !( ul$.length > 0 || node$.hasClass( C_LEAF ) ) ) {
                out = util.htmlBuilder();
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, getLevelFromNode( node$, this.labelSelector ) + 1, out );
                out.markup( M_END_CHILDREN );
                node$.append( out.toString() ).children( "ul" ).hide();
            }
            // otherwise it is a leaf or already added so nothing to do
        },

        _toggleNode: function( node$ ) {
            if ( node$.hasClass( C_EXPANDABLE ) ) {
                this._expandNode( node$ );
            } else {
                this._collapseNode( node$ );
            }
        },

        _persistExpansionState: function( node, node$, state ) {
            var nodeAdapter = this.nodeAdapter;

            if ( nodeAdapter.setExpanded ) {
                nodeAdapter.setExpanded( this.baseId, node, state );
            }
            this._trigger( EVENT_EXPANSION_STATE_CHANGE, {}, {
                node: node,
                nodeContent$: node$.children( SEL_CONTENT ),
                expanded: state
            } );
        },

        _expandNode: function( node$, fn ) {
            var ul$, out,
                self = this,
                nodeAdapter = this.nodeAdapter,
                node = this.treeMap[getIdFromNode( node$ )];

            if ( this.options.autoCollapse ) {
                node$.parent().children( "." + C_COLLAPSIBLE ).each( function() {
                    self._collapseNode( $(this) );
                } );
            }
            node$.removeClass( C_EXPANDABLE );
            ul$ = node$.children( "ul" );
            if ( ul$.length > 0 && nodeAdapter.childCount( node ) !== null ) {
                ul$.show(); // already rendered so show it
                node$.addClass( C_COLLAPSIBLE ).children( SEL_CONTENT ).find( this.labelSelector ).attr( A_EXPANDED, TRUE );
                this._persistExpansionState( node, node$, true );
                if ( fn ) {
                    fn();
                }
            } else {
                ul$.remove(); // remove if any
                out = util.htmlBuilder();
                out.markup( M_BEGIN_CHILDREN );
                this._renderChildren( node, getLevelFromNode( node$, this.labelSelector ) + 1, out, function ( status ) {
                    if ( status ) {
                        node$.addClass( C_COLLAPSIBLE ).children( SEL_CONTENT ).find( self.labelSelector ).attr( A_EXPANDED, TRUE );
                        out.markup( M_END_CHILDREN );
                        node$.append( out.toString() );
                        self._persistExpansionState( node, node$, true );
                    } else if ( status === 0 ) {
                        node$.children( SEL_TOGGLE ).remove();
                        node$.addClass( C_LEAF ).children( SEL_CONTENT ).find( self.labelSelector ).removeAttr( A_EXPANDED );
                    } else {
                        // lazy/async request failed but allow to try again
                        node$.addClass( C_EXPANDABLE ).children( SEL_CONTENT ).find( self.labelSelector ).attr( A_EXPANDED, FALSE );
                        self._persistExpansionState( node, node$, false );
                    }
                    if ( fn ) {
                        fn();
                    }
                }, node$ );
            }
        },

        _collapseNode: function( node$ ) {
            var o = this.options;

            if ( o.showRoot && !o.collapsibleRoot && node$.parent().parent().hasClass( C_TREEVIEW ) ) {
                return; // can't collapse root
            }
            node$.removeClass( C_COLLAPSIBLE ).addClass( C_EXPANDABLE ).children( SEL_CONTENT ).find( this.labelSelector ).attr( A_EXPANDED, FALSE );
            if ( node$.find( SEL_SELECTED ).length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), null, true );
            }
            node$.children( "ul" ).hide();
            this._persistExpansionState( this.treeMap[getIdFromNode( node$ )], node$, false );
        },

        _traverseDown: function( event, count ) {
            var node$, next$, i;

            if ( !this.lastFocused ) {
                return;
            }
            node$ = $( this.lastFocused ).closest( SEL_NODE );
            for ( i = 0; i < count; i++ ) {
                next$ = nextNode( node$ );
                if ( next$.length === 0 ) {
                    break;
                }
                node$ = next$;
            }
            if ( node$.length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), event, true, true );
            }
        },

        _traverseUp: function( event, count ) {
            var node$, prev$, i;

            if ( !this.lastFocused ) {
                return;
            }
            node$ = $( this.lastFocused ).closest( SEL_NODE );
            for ( i = 0; i < count; i++ ) {
                prev$ = prevNode( node$ );
                if ( prev$.length === 0 ) {
                    break;
                }
                node$ = prev$;
            }
            if ( node$.length > 0 ) {
                this._select( node$.children( SEL_CONTENT ), event, true, true );
            }
        },

        _activate: function ( event ) {
            var href,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                nodes = this.getSelectedNodes();

            // todo consider if need access to the focused node as well use it rather than nodes[0]
            if ( nodes.length === 0 ) {
                return; // nothing to activate (for example node is disabled)
            }
            this._trigger( "activateNode", event, { nodes: nodes } );

            if ( o.navigation && nodeAdapter.getLink && !event.isDefaultPrevented() ) {
                href = nodeAdapter.getLink( nodes[0] );
                if ( href ) {
                    apex.navigation.redirect( href );
                }
            }
        },

        _select: function( nodeContent$, event, focus, delayTrigger, noNotify ) {
            var node$, focusLabel$, range$, prevSelected, sp, spOffset, treeOffset, offset,
                originalNodeContent$ = nodeContent$,
                action = "set",
                self = this,
                ctrl$ = this.element,
                prevSel$ = ctrl$.find( SEL_CONTENT + SEL_SELECTED );

            // determine type of selection
            if ( event && this.options.multiple ) {
                if ( event.type === "click" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === $.ui.keyCode.SPACE ) {
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
            }

            if ( action === "range" && !this.selectAnchor ) {
                action = "set"; // when there is no anchor turn range selection into set
            }

            // clear out previous selection if needed
            if ( action === "set" || action === "range" ) {
                prevSel$.prevAll( SEL_ROW ).addBack()
                    .find( SEL_SELECTOR ).addBack().removeClass( C_SELECTED );
                prevSel$.find( this.labelSelector ).attr( A_SELECTED, FALSE );
            }

            // disabled nodes can't be selected but they can be focused
            focusLabel$ = nodeContent$.eq(0).find( this.labelSelector );
            nodeContent$ = nodeContent$.not( SEL_DISABLED );

            // perform selection action
            prevSelected = nodeContent$.hasClass( C_SELECTED );
            if ( action === "set" || action === "add" || (action === "toggle" && !prevSelected) ) {
                nodeContent$.prevAll( SEL_ROW ).addBack()
                    .find( SEL_SELECTOR ).addBack().addClass( C_SELECTED );
                nodeContent$.find( this.labelSelector ).attr( A_SELECTED, TRUE );
                // make sure parents expanded - This assumes that a treeView cannot be nested inside another treeView
                nodeContent$.parent().parents( SEL_NODE ).each( function() {
                    node$ = $(this);
                    if ( node$.hasClass( C_EXPANDABLE ) ) {
                        self._expandNode( node$ );
                    }
                } );
                this.selectAnchor = nodeContent$[0];
            } else if ( action === "range" ) {
                range$ = $( "#" + this.selectAnchor.parentNode.id + ", #" + originalNodeContent$[0].parentNode.id ); // range will be in DOM order
                node$ = range$.first();
                while ( true ) {
                    if ( !node$.children( SEL_CONTENT ).hasClass( C_DISABLED ) ) {
                        node$.children( SEL_CONTENT ).prevAll( SEL_ROW ).addBack()
                            .find( SEL_SELECTOR ).addBack().addClass( C_SELECTED );
                        node$.children( SEL_CONTENT ).find( this.labelSelector ).attr( A_SELECTED, TRUE );
                    }
                    node$ = nextNode( node$ );
                    if ( node$.length === 0 || range$.length === 1 || node$[0] === range$[1] ) {
                        break;
                    }
                }
                if ( node$.length > 0 && range$.length === 2 && !node$.children( SEL_CONTENT ).hasClass( C_DISABLED ) ) {
                    node$.children( SEL_CONTENT).prevAll( SEL_ROW ).addBack()
                        .find( SEL_SELECTOR ).addBack().addClass( C_SELECTED );
                    node$.children( SEL_CONTENT ).find( this.labelSelector ).attr( A_SELECTED, TRUE );
                }
            } else if ( action === "toggle" && prevSelected ) {
                nodeContent$.prevAll( SEL_ROW ).addBack()
                    .find( SEL_SELECTOR ).addBack().removeClass( C_SELECTED );
                nodeContent$.find( this.labelSelector ).attr( A_SELECTED, FALSE );
                this.selectAnchor = nodeContent$[0];
            }

            // focus if needed
            if ( focusLabel$.length ) {
                if ( focus ) {
                    setFocus( focusLabel$[0] );
                } else {
                    this._setFocusable( focusLabel$ );
                }
                if ( this.scrollParent ) {
                    sp = this.scrollParent[0];
                    // scroll into view if needed
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    offset = focusLabel$.parent().offset();
                    // in some cases while editing the node label the offset can be undefined
                    if ( offset ) {
                        treeOffset = ctrl$.offset();
                        if ( sp === document ) {
                            spOffset = { top: $( document ).scrollTop(), left: $( document ).scrollLeft() };
                            if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + $( window ).height() ) ) {
                                $( document ).scrollTop( offset.top - treeOffset.top );
                            }
                            if ( ( offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + $( window ).width() ) )  {
                                $( document ).scrollLeft( offset.left - treeOffset.left );
                            }
                        } else {
                            spOffset = this.scrollParent.offset();
                            treeOffset = ctrl$.offset(); // xxx needed?
                            if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp.offsetHeight ) ) {
                                sp.scrollTop = offset.top - treeOffset.top;
                            }
                            if ( ( offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp.offsetWidth ) )  {
                                sp.scrollLeft = offset.left - treeOffset.left;
                            }
                        }
                    }
                }
            }

            if ( noNotify ) {
                return;
            }
            // notify if needed
            if ( action === "toggle" ||
                (action === "range" && !prevSelected) ||
                (action === "add" && !prevSelected) ||
                (action === "set" && !util.arrayEqual( prevSel$, nodeContent$ ) ) ) {

                delayTrigger ? notifyLongDelay( self, event ) : notifyDelay( self, event );
            }
        },

        _setFocusable: function( label$ ) {
            var label = label$[0];

            if ( label ) {
                if ( this.lastFocused && this.lastFocused !== label ) {
                    this.lastFocused.tabIndex = -1;
                }
                label.tabIndex = 0;
                this.lastFocused = label;
            }
        },

        _beginEdit: function( eventArg ) {
            this.editMode = true;
            if ( apex.tooltipManager ) {
                apex.tooltipManager.disableTooltips();
            }
            this._trigger( "beginEdit", {}, eventArg );
        },

        _endEdit: function( eventArg ) {
            this.editMode = false;
            if ( apex.tooltipManager ) {
                apex.tooltipManager.enableTooltips();
            }
            this._trigger( "endEdit", {}, eventArg );
        },

        //
        // Drag and Drop methods
        //

        _mouseCapture: function ( event, fromOutside ) { // fromOutside is true when called from draggable plugin
            var i, items$, nodes,
                allDraggable = true,
                o = this.options;

            event.preventDefault(); // do this even if not dragging to prevent the focus being set on mouse down

            if ( this.animating || o.disabled || !o.dragAndDrop || $( event.target ).hasClass( C_TOGGLE ) ) {
                return false;
            }

            items$ = $( event.target ).closest( SEL_NODE ).children( SEL_CONTENT );
            if ( items$.length === 0 ) {
                return false;
            }

            // todo check if drag starts on a valid handle - this is only useful if there is custom rendering

            if ( o.dragMultiple ) {
                if ( items$.hasClass( C_SELECTED ) ) {
                    items$ = this.getSelection();
                } else {
                    // items$ is good as is unless the ctrl key is pressed
                    if ( event.ctrlKey ) {
                        items$ = items$.add( this.getSelection() );
                    }
                }
            }

            if ( fromOutside !== true ) {
                // all the nodes must be draggable
                nodes = this.getNodes( items$ );
                for ( i = 0; i < nodes.length; i++ ) {
                    if ( !( this.nodeAdapter.allowDrag && this.nodeAdapter.allowDrag( nodes[i] )) ) {
                        allDraggable = false;
                        break;
                    }
                }
                if ( !allDraggable ) {
                    return false;
                } // else
            }

            this.dragItems = items$;
            return true;
        },

        _mouseStart: function ( downEvent, event, noActivation ) { // noActivation given from draggable
            var body, itemHeight,
                dragNodes = null,
                o = this.options,
                self = this;

            if ( !noActivation ) {
                // install handler for ESCAPE key to cancel drag
                $( "body" ).on( "keydown.treeview", function ( event ) {
                    if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                        self._cancel( event );
                        return;
                    }
                    self._dragCopyOrMove( event, true );
                } );
                $( "body" ).on( "keyup.treeview", function ( event ) {
                    self._dragCopyOrMove( event, true );
                } );

                // select exactly what is being dragged
                // use empty event to force set so that only the dragged item(s) will be selected
                this._select( this.dragItems, null, true, false );
            }

            // Create and append the visible helper
            // if a draggable is connected to this control then it will create the helper
            if ( !this.helper ) {
                this.helper = this._createHelper( event );
            }

            // Cache the margins of the original element
            this.margins = {
                left: (parseInt( this.dragItems.css( "marginLeft" ), 10 ) || 0),
                top: (parseInt( this.dragItems.css( "marginTop" ), 10 ) || 0)
            };

            // The element's absolute position on the page minus margins
            this.offset = this.dragItems.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend( this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset()
            } );

            // Only after we got the offset, we can change the helper's position to absolute
            this.helper.css( "position", "absolute" );

            // Cache the helper size
            this._cacheHelperProportions();

            // If ddmanager is used for droppables, set the global draggable
            if ( $.ui.ddmanager && !noActivation ) {
                this.currentItem = this.dragItems.first();
                $.ui.ddmanager.current = this;
                $.ui.ddmanager.prepareOffsets( this, downEvent );
            }

            // Keep the original position for events
            this.originalPosition = this._generatePosition( event );

            // Adjust the mouse offset relative to the helper if "dragCursorAt" is supplied
            if ( o.dragCursorAt ) {
                this._adjustOffsetFromHelper( o.dragCursorAt );
            }

            // what is being dragged could affect what operations are allowed
            if ( this.dragItems && this.dragItems.length > 0 && !this.isOver ) {
                dragNodes = this.getNodes( this.dragItems );
                if ( !dragNodes[0] ) {
                    dragNodes = null;
                }
            }

            if ( this.nodeAdapter.dragOperations ) {
                this.dragOperations = this.nodeAdapter.dragOperations( dragNodes );
            } else {
                this.dragOperations = dragNodes ? { normal: "move", ctrl: "copy" } : { normal: "add" };
            }
            this.dragOperation = this.dragOperations.normal; // start off with normal drag operation

            this.dragging = true;
            // remove hover effect
            if ( this.lastHover ) {
                $( this.lastHover ).children( SEL_ROW_CONTENT  ).removeClass( C_HOVER );
                this.lastHover = null;
            }

            if ( o.dragReorder ) {
                itemHeight = this.dragItems.first().outerHeight();
                if ( this.dragOperation === "move" ) {
                    this.dragItems.parent().hide();
                    // todo if any of the drag items are only children then need to make leaf of the parent except that the UL can't actually go away
                }
                this._createPlaceholder( itemHeight );
                this.initialPlaceholderPos = null;
            }

            this._initPositions(); // figure out all the places the drag items could be dropped
            this._refreshPositions();

            // Set a containment if given in the options
            if ( o.dragContainment ) {
                this._setContainment();
            }

            // if draggable it is responsible for the cursor
            if ( !noActivation ) {
                if ( o.dragCursor && o.dragCursor !== "auto" ) { // cursor option
                    body = this.document.find( "body" );

                    // support: IE
                    this.storedCursor = body.css( "cursor" );
                    body.css( "cursor", o.dragCursor );

                    this.storedStylesheet = $( "<style>*{ cursor: " + o.dragCursor + " !important; }</style>" ).appendTo( body );
                }
            }

            if ( o.dragOpacity ) { // dragOpacity option
                this.helper.css( "opacity", o.dragOpacity );
            }

            if ( o.dragZIndex ) { // dragZIndex option
                this.helper.css( "zIndex", o.dragZIndex );
            }
            this.helper.addClass( C_HELPER );

            // Prepare scrolling
            if ( this.scrollParent && this.scrollParent[0] !== document && this.scrollParent[0].tagName !== "HTML" ) {
                this.overflowOffset = this.scrollParent.offset();
                this.originalScroll = { top: this.scrollParent[0].scrollTop, left: this.scrollParent[0].scrollLeft };
            }

            // Call callbacks
            if ( apex.tooltipManager ) {
                apex.tooltipManager.disableTooltips();
            }
            this._trigger( "start", event, this._uiHashDnD() );

            this._mouseDrag( event ); // Execute the drag once - this causes the helper not to be visible before getting its correct position

            // If the ddmanager is used for droppables, inform the manager that dragging has started
            if ( $.ui.ddmanager && !noActivation ) {
                $.ui.ddmanager.dragStart( this, event );
            }

            return true;
        },

        _mouseDrag: function ( event ) {
            var mousePos = { pageX: event.pageX, pageY: event.pageY };

            this.position = this._generatePosition( event );
            this.positionAbs = this._adjustPositionForScroll();

            if ( !this.lastPositionAbs ) {
                this.lastPositionAbs = this.positionAbs;
            }
            this.dragEventTarget = event.target; // for dragHitCheck

            if ( this.options.dragScroll ) {
                // start or stop scrolling as needed. The actual scrolling happens from a timer
                if ( this._scrollCheck( mousePos )) {
                    if ( !this.scrollTimerId ) {
                        this._scrollStart( mousePos );
                    }
                } else {
                    if ( this.scrollTimerId ) {
                        this._scrollStop();
                    }
                }
            }

            // move the helper
            this.helper[0].style.left = this.position.left + "px";
            this.helper[0].style.top = this.position.top + "px";
            this._dragCopyOrMove( event );

            // check if over any targets
            this._dragHitCheck();

            if ( $.ui.ddmanager && !this.isOver ) {
                $.ui.ddmanager.drag( this, event );
            }

            this._trigger( "drag", event, this._uiHashDnD() );

            this.lastPositionAbs = this.positionAbs;
            return false;
        },

        _dragHitCheck: function() {
            var i, item, x, y, targetNode$, location, dir, deltaX,
                self = this,
                deltaY = 0,
                newDropTargetId = null,
                prevDropTargetId = this.dropTargetNode ? this.dropTargetNode[0].id : null,
                o = this.options;

            function getDragVerticalDirection() {
                var delta = self.positionAbs.top - self.lastPositionAbs.top;
                return delta !== 0 && (delta > 0 ? "down" : "up");
            }

            function clearExpandTimer() {
                if ( self.delayExpandTimer ) {
                    clearTimeout( self.delayExpandTimer );
                    self.delayExpandTimer = null;
                }
            }

            if ( this.scrollParent[0] !== document ) {
                deltaY = this.scrollParent[0].scrollTop - this.dropPositionsOrigin;
            }

            x = this.positionAbs.left + this.offset.click.left;
            if (  x > this.containerCache.left && x < this.containerCache.left + this.containerCache.width ) {
                if ( this.placeholder && $( this.dragEventTarget ).closest( "." + C_PLACEHOLDER ).length ) {
                    // when there is a placeholder and the mouse is over it
                    if ( this.initialPlaceholderPos === null ) {
                        this.initialPlaceholderPos = x;
                    }
                    deltaX = ( x - this.initialPlaceholderPos ) * this.rtlFactor;
                    if ( deltaX > ( this.options.dragScrollSensitivity || 10 ) ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "below" );
                    } else if ( deltaX < ( -this.options.dragScrollSensitivity || -10 ) ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "above" );
                    }
                } else {
                    this.initialPlaceholderPos = null;
                    y = this.positionAbs.top + this.offset.click.top + deltaY;
                    for ( i = 0; i < this.dropPositions.length; i++ ) {
                        item = this.dropPositions[i];
                        if ( y >= item.top && y <= item.bottom ) {
                            newDropTargetId = item.nodeId;
                            if ( y > item.top + (item.bottom - item.top) / 2 ) {
                                location = "bottom";
                            } else {
                                location = "top";
                            }
                            break;
                        }
                    }
                }
            }

            if ( prevDropTargetId !== newDropTargetId || location !== this.lastLocation ) {
                clearExpandTimer();
                this.element.find( "." + C_ACTIVE).removeClass( C_ACTIVE );
                if ( newDropTargetId ) {
                    targetNode$ = $( "#" + newDropTargetId );
                    if ( o.dragExpandDelay >= 0 && targetNode$.hasClass( C_EXPANDABLE ) ) {
                        this.delayExpandTimer = setTimeout(function() {
                            self.delayExpandTimer = null;
                            self._expandNode( targetNode$, function() {
                                self._initPositions( targetNode$ );
                                self._refreshPositions(); // todo should only do the new ones
                            } );
                        }, o.dragExpandDelay );
                    }
                    if ( item.canAdd ) {
                        this.dropTargetNode = targetNode$;
                        if ( this.placeholder ) {
                            dir = getDragVerticalDirection();
                            if ( location === "top" && dir === "up" ) {
                                this._movePlaceholder( item, "before" );
                            } else if ( location === "bottom" && dir === "down" ) {
                                this._movePlaceholder( item, "after" );
                            }
                        } else  {
                            this.dropTargetNode.children( SEL_CONTENT + "," + SEL_ROW ).addClass( C_ACTIVE );
                        }
                    } else if ( item.canAddChild && this.placeholder ) {
                        this.initialPlaceholderPos = x;
                        this._movePlaceholder( item, "after" );
                        this._movePlaceholder( { element: this.placeholder.children( SEL_CONTENT ) }, "below" );
                    }
                } else {
                    this.dropTargetNode = null;
                }
            }

            this.lastLocation = location;
        },

        _mouseStop: function ( event, fromOutside ) { // fromOutside true when called from draggable plugin
            var dropped, animation,
                self = this;

            if ( this.delayExpandTimer ) {
                clearTimeout( this.delayExpandTimer );
                this.delayExpandTimer = null;
            }
            this._scrollStop();

            //If the ddmanager is used for droppables, inform the manager that dragging has stopped
            if ( $.ui.ddmanager && !fromOutside ) {
                $.ui.ddmanager.dragStop( this, event );
            }

            // remove handler for ESCAPE key to cancel drag
            if ( !fromOutside ) {
                $( "body" ).off( ".treeview" );
            }
            this._deactivate();

            if ( this.storedCursor ) {
                this.document.find( "body" ).css( "cursor", this.storedCursor );
                this.storedStylesheet.remove();
            }

            if ( $.ui.ddmanager && !fromOutside ) {
                dropped = $.ui.ddmanager.drop( this, event );
                if ( dropped ) {
                    if ( this.placeholder ) {
                        this.dragItems.parent().show();
                        this._removePlaceholder();
                    }
                    this.dragging = false;
                    this.dragItems = null;
                    this.currentItem = null;
                    this.helper.remove();
                    this.helper = null;

                    this._stop( event );
                    return;
                }
            }

            if ( !event.target ) {
                this.fromOutside = false;
                this.dragging = false;
                return; // the drag was canceled
            }

            if ( this.options.dragAnimate ) {
                animation = this._getAnimation();
                this.animating = true;
                this.helper.animate( animation, parseInt( this.options.dragAnimate, 10 ) || 500, function () {
                    self._finishDrag( event );
                } );
            } else {
                this._finishDrag( event );
            }
        },

        // todo there is an issue with scrolling where if the mouse moves outside the tree div scrolling keeps going
        _scrollCheck: function( mousePos, update ) {
            var sTop, sLeft, scrolled,
                deltaY = 0,
                deltaX = 0,
                o = this.options,
                sp = this.scrollParent[0];

            if ( sp && sp !== document && sp.tagName !== "HTML" ) {

                if ( (this.overflowOffset.top + sp.offsetHeight) - mousePos.pageY < o.dragScrollSensitivity ) {
                    deltaY = o.dragScrollSpeed;
                } else if ( mousePos.pageY - this.overflowOffset.top < o.dragScrollSensitivity ) {
                    deltaY = -o.dragScrollSpeed;
                }
                if ( update && deltaY ) {
                    sTop = sp.scrollTop + deltaY;
                    if ( sTop < 0 ) {
                        sp.scrollTop = 0;
                        deltaY = 0;
                    } else if ( sTop > sp.scrollHeight - sp.clientHeight ) {
                        sp.scrollTop = sp.scrollHeight - sp.clientHeight;
                        deltaY = 0;
                    } else {
                        sp.scrollTop = sTop;
                    }
                }

                if ( (this.overflowOffset.left + sp.offsetWidth) - mousePos.pageX < o.dragScrollSensitivity ) {
                    deltaX = o.dragScrollSpeed;
                } else if ( mousePos.pageX - this.overflowOffset.left < o.dragScrollSensitivity ) {
                    deltaX = -o.dragScrollSpeed;
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
                scrolled = !!(deltaX || deltaY);
            } else {
                sTop = $( document ).scrollTop();
                sLeft = $( document ).scrollLeft();
                if ( mousePos.pageY - sTop < o.dragScrollSensitivity ) {
                    deltaY = -o.dragScrollSpeed;
                } else if ( $( window ).height() - (mousePos.pageY - sTop) < o.dragScrollSensitivity ) {
                    deltaY = o.dragScrollSpeed;
                }
                if ( update && deltaY ) {
                    sTop += deltaY;
                    if ( sTop < 0 ) {
                        $( document ).scrollTop( 0 );
                        deltaY = 0;
                    } else if ( sTop > $( document ).height() - $( window ).height() ) {
                        $( document ).scrollTop( $( document ).height() - $( window ).height() );
                        deltaY = 0;
                    } else {
                        mousePos.pageY += deltaY;
                        $( document ).scrollTop( sTop );
                    }
                }

                if ( mousePos.pageX - sLeft < o.dragScrollSensitivity ) {
                    deltaX = -o.dragScrollSpeed;
                } else if ( $( window ).width() - (mousePos.pageX - sLeft) < o.dragScrollSensitivity ) {
                    deltaX = o.dragScrollSpeed;
                }
                if ( update && deltaX ) {
                    sLeft += deltaX;
                    if ( sLeft < 0 ) {
                        $( document ).scrollLeft( 0 );
                        deltaX = 0;
                    } else if ( sLeft + this.helper.width() > $( document ).width() - $( window ).width() ) {
                        $( document ).scrollLeft( $( document ).width() - $( window ).width() - this.helper.width() );
                        deltaX = 0;
                    } else {
                        mousePos.pageX += deltaX;
                        $( document ).scrollLeft( sLeft );
                    }
                }

                scrolled = !!(deltaX || deltaY);
                if ( scrolled && update ) {
                    // because the whole document scrolled, need to move the helper
                    this.position = this._generatePosition( mousePos );
                    this.helper[0].style.left = this.position.left + "px";
                    this.helper[0].style.top = this.position.top + "px";

                    if ( $.ui.ddmanager ) {
                        $.ui.ddmanager.prepareOffsets( this, mousePos );
                    }
                }

            }
            return scrolled;
        },

        _scrollStart: function( mousePos ) {
            var self = this,
                timeIndex = 0,
                times = [ 150, 125, 100, 99, 96, 91, 84, 75, 64, 51, 36 ];

            function scroll() {
                self.scrollTimerId = setTimeout( function() {
                    if ( self._scrollCheck( mousePos, true ) ) {
                        self._dragHitCheck();
                        scroll();
                    } else {
                        self._scrollStop();
                    }
                }, times[timeIndex] );
                if ( timeIndex < times.length - 1 ) {
                    timeIndex += 1;
                }
            }

            if ( this.scrollTimerId ) {
                this._scrollStop();
            }
            scroll();
        },

        _scrollStop: function() {
            clearTimeout( this.scrollTimerId );
            this.scrollTimerId = null;
        },

        _getAnimation: function() {
            var cur, el$,
                animation = {};

            if ( this.placeholder || this.dropTargetNode) {
                if ( this.placeholder ) {
                    el$ = this.placeholder;
                    cur = el$.offset();
                } else {
                    el$ = this.dropTargetNode;
                    cur = el$.offset();
                }
                animation.left = cur.left - this.offset.parent.left - this.margins.left;
                animation.top = cur.top - this.offset.parent.top - this.margins.top;
            } else {
                el$ = this.dragItems.eq(0);
                cur = this.originalPosition;
                animation.left = cur.left - this.margins.left;
                animation.top = cur.top - this.margins.top;
                if ( this.scrollParent[0] !== document ) {
                    animation.left += this.originalScroll.left - this.scrollParent[0].scrollLeft;
                    animation.top += this.originalScroll.top - this.scrollParent[0].scrollTop;
                }
            }
            if ( this.rtlFactor === -1 ) {
                animation.left += el$.width() - this.helper.width();
            }
            return animation;
        },

        _initPositions: function ( startNode$ ) {
            var i, dropPositions, index, id, dragNodes,
                self = this,
                excludedNodes = [],
                reorder = this.options.dragReorder,
                nodeAdapter = this.nodeAdapter;

            if ( this.dragItems && this.dragItems.length > 0 ) {
                dragNodes = this.getNodes( this.dragItems );
                if ( !dragNodes[0] ) {
                    dragNodes = [ ];
                }
            } else {
                dragNodes = [ ];
            }
            if (!startNode$ || !this.dropPositions) {
                dropPositions = this.dropPositions = [];
                startNode$ = this.element;
            } else {
                dropPositions = [];
                id = startNode$[0].id;
                for ( index = 0; index < this.dropPositions.length; index ++) {
                    if ( id === this.dropPositions[index].nodeId ) {
                        break;
                    }
                }
            }
            startNode$.find( SEL_NODE ).each( function() {
                var node, parent$, canAdd,
                    canAddChild = false,
                    node$ = $( this );

                if ( !node$.is( ":visible" ) || node$.is( "." + C_PLACEHOLDER )) {
                    return;
                }
                if ( reorder ) {
                    // when reordering it is the parent that we need to check to see if it allows adding
                    parent$ = node$.parent().closest( SEL_NODE );
                    if ( parent$.length ) {
                        node = self.treeMap[getIdFromNode( parent$ )];
                    } else if ( !self.options.showRoot ) {
                        node = nodeAdapter.root();
                    } else {
                        node = null;
                    }
                } else {
                    node = self.treeMap[getIdFromNode( node$ )];
                }

                // if this is a move operation don't include any of the nodes being dragged or their descendents
                if ( !reorder && self.dragOperation === "move" &&
                    ( dragNodes.indexOf(node) >= 0 || excludedNodes.indexOf( node$.parent().closest( SEL_NODE )[0] ) >= 0 )) {
                    excludedNodes.push(this);
                    return;
                }

                // include nodes that can be added or are expandable
                canAdd = node && nodeAdapter.allowAdd( node, self.dragOperation, dragNodes);
                if ( reorder ) {
                    canAddChild = nodeAdapter.allowAdd( self.treeMap[getIdFromNode( node$ )], self.dragOperation, dragNodes);
                }
                if ( canAdd || canAddChild || node$.hasClass( C_EXPANDABLE ) ) {
                    dropPositions.push( {
                        canAdd: canAdd,
                        canAddChild: canAddChild,
                        element: $( this ).children( SEL_ROW ),
                        nodeId: this.id,
                        top: 0,
                        bottom: 0
                    } );
                }
            } );
            if ( index !== undefined && dropPositions.length ) {
                for ( i = 0; i < dropPositions.length; i++ ) {
                    this.dropPositions.splice(index + i, 0, dropPositions[i]);
                }
            }
        },

        _refreshPositions: function () {
            var i, item, p, h, vp$;

            for ( i = 0; i < this.dropPositions.length; i++ ) {
                item = this.dropPositions[i];

                h = item.element.outerHeight();
                p = item.element.offset();
                item.top = p.top;
                item.bottom = p.top + h;
            }
            this.dropPositionsOrigin = 0;
            // store the position and dimensions of this widget for integration with draggables
            vp$ = this.scrollParent;
            if ( !vp$ || vp$[0] === document ) {
                vp$ = this.element;
            } else {
                this.dropPositionsOrigin = vp$[0].scrollTop;
            }
            p = vp$.offset();
            this.containerCache.left = p.left;
            this.containerCache.top = p.top;
            this.containerCache.width = vp$.outerWidth();
            this.containerCache.height = vp$.outerHeight();
        },

        _makeTempDragItem: function () {
            var i, item$, parent$,
                out = util.htmlBuilder();

            out.markup( "<li" )
                .attr( "class", C_NODE )
                .markup( "><div" )
                .attr( "class", C_ROW )
                .markup( "></div><div" )
                .attr( "class", C_CONTENT )
                .markup(">unseen content</div></li>" );
            item$ = $( out.toString() );
            // add it to the first possible drop position
            for ( i = 0; i < this.dropPositions.length; i++ ) {
                if ( this.dropPositions[i].canAdd ) {
                    parent$ = $( this.dropPositions[i].nodeId ).parent();
                    break;
                }
            }
            if ( !parent$ ) {
                parent$ = this.element.children( "ul" );
            }

            parent$.append( item$ );
            this.dragItems = item$.children( SEL_CONTENT );
        },

        _createPlaceholder: function ( height ) {
            this.placeholder = $( "<li class='" + C_NODE + " " + C_PLACEHOLDER + "'><div class='" + C_ROW +"'></div><div class='" + C_CONTENT + "'>&nbsp;</div></li>" );
            this.dragItems.first().parent().before( this.placeholder );
            if ( height ) {
                this.placeholder.height( height );
            }
        },

        _movePlaceholder: function ( item, place ) {
            var prev$, parent$, canAdd, extraLevelDown, node,
                self = this,
                prevParentUl$ = this.placeholder.parent(),
                nodeAdapter = this.nodeAdapter,
                node$ = item.element.parent(),
                el = node$[0];

            if ( place === "after" && node$.hasClass( C_COLLAPSIBLE ) && nodeAdapter.allowAdd( self.treeMap[getIdFromNode( node$ )], self.dragOperation ) ) {
                el = node$.children( "ul" ).children()[0];
                place = "before";
            }
            if ( place === "above" ) {
                if ( node$.next( ":visible" ).length ) {
                    return; // don't go up any further
                }
                el = node$.parent().parent()[0];
                node$ = $( el );
                parent$ = node$.parent().closest( SEL_NODE );
                if ( parent$.length ) {
                    node = self.treeMap[getIdFromNode( parent$ )];
                } else if ( !self.options.showRoot ) {
                    node = nodeAdapter.root();
                } else {
                    node = null;
                }
                if ( node$.hasClass( C_TREEVIEW ) || node === null ) {
                    return; // don't go past root
                }

                canAdd = nodeAdapter.allowAdd( node, self.dragOperation );
                if ( !canAdd ) {
                    return; // don't go above to node that doesn't allow add
                }
                place = "after";
            }
            if ( place === "below" ) {
                prev$ = node$.prevAll( ":visible" ).first();
                extraLevelDown = false;
                // if expanded prev is last child todo test more
                if ( prev$.hasClass( C_COLLAPSIBLE ) ) {
                    prev$ = prev$.children( "ul" ).children().last();
                    extraLevelDown = true;
                }
                if ( prev$.length === 0 ) {
                    return; // can't go any deeper
                }
                canAdd = nodeAdapter.allowAdd( self.treeMap[getIdFromNode( prev$ )], self.dragOperation );
                if ( !extraLevelDown && prev$.hasClass( C_LEAF ) && canAdd ) {
                    this._makeParentIfNeeded( prev$.children( SEL_CONTENT ) );
                }
                if ( prev$.hasClass( C_EXPANDABLE ) ) {
                    this._expandNode( prev$, function() {
                        self._initPositions( prev$ );
                        self._refreshPositions(); // todo should only do the new ones
                        if ( canAdd ) {
                            prev$.children( "ul" )[0].appendChild( self.placeholder[0] );
                        }
                    });
                    return; // the expand callback will finish up
                }
                if ( canAdd ) {
                    prev$[0].parentNode.appendChild( this.placeholder[0] );
                }
            } else if ( place === "after" && !el.nextSibling ) {
                el.parentNode.appendChild( this.placeholder[0] );
            } else { // before or after (with next sibling)
                el.parentNode.insertBefore( this.placeholder[0], place === "before" ? el : el.nextSibling );
            }
            if ( prevParentUl$.children().length === 0 ) {
                this._makeLeafIfNeeded( prevParentUl$.parent().find( SEL_CONTENT ) );
            }
            this._refreshPositions();
        },

        _removePlaceholder: function() {
            var prevParentUl$ = this.placeholder.parent();

            this.placeholder.remove();
            this.placeholder = null;
            if ( prevParentUl$.children().length === 0 ) {
                this._makeLeafIfNeeded( prevParentUl$.parent().find( SEL_CONTENT ) );
            }
        },

        _createHelper: function( event ) {
            var helper$,
                o = this.options;

            if ( $.isFunction( o.dragHelper ) ) {
                helper$ =  $( o.dragHelper.apply( this.element[0], [event, this.dragItems] ) );
            } else {
                if ( this.dragItems.length === 1 ) {
                    helper$ = this.dragItems.clone().removeAttr( "id" ).removeClass( C_SELECTED );
                } else {
                    helper$ = $("<div></div>");
                    helper$.html(this.dragItems.clone().removeClass( C_SELECTED ));
                }
            }

            if ( !helper$.parents("body").length ) {
                helper$.appendTo( (o.dragAppendTo === "parent" ? this.element[0].parentNode : o.dragAppendTo) );
            }

            if ( !(/(fixed|absolute)/).test(helper$.css("position"))) {
                helper$.css("position", "absolute");
            }

            return helper$;
        },

        _adjustOffsetFromHelper: function( obj ) {
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _getParentOffset: function () {
            var po;

            // get the offsetParent and cache its position
            this.offsetParent = this.helper.offsetParent();
            if ( this.offsetParent[0] === document || this.offsetParent[0] === document.firstElementChild ) {
                po = {left:0, top:0};
            } else {
                po = this.offsetParent.offset();
            }
            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if ( this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] ) ) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            // This needs to be actually done for all browsers, since pageX/pageY includes this information
            // with an ugly IE fix
            if ( this.offsetParent[0] === document.body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie) ) {
                po = { top: 0, left: 0 };
            }

            return {
                top: po.top + (parseInt( this.offsetParent.css( "borderTopWidth" ), 10 ) || 0),
                left: po.left + (parseInt( this.offsetParent.css( "borderLeftWidth" ), 10 ) || 0)
            };
        },

        _generatePosition: function ( event ) {
            var pageX = event.pageX,
                pageY = event.pageY,
                scroll = !(this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ?
                    this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            /*
             * Constrain the position to containment.
             */
            if ( !this.dragging ) { //If we are not dragging yet, we won't check for options
                if ( this.containment ) {
                    if ( event.pageX - this.offset.click.left < this.containment[0] ) {
                        pageX = this.containment[0] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top < this.containment[1] ) {
                        pageY = this.containment[1] + this.offset.click.top;
                    }
                    if ( event.pageX - this.offset.click.left > this.containment[2] ) {
                        pageX = this.containment[2] + this.offset.click.left;
                    }
                    if ( event.pageY - this.offset.click.top > this.containment[3] ) {
                        pageY = this.containment[3] + this.offset.click.top;
                    }
                }
            }

            return {
                top: (
                    pageY - // The absolute mouse position
                        this.offset.click.top - // Click offset (relative to the element)
                        this.offset.parent.top + // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pageX - // The absolute mouse position
                        this.offset.click.left - // Click offset (relative to the element)
                        this.offset.parent.left + // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _adjustPositionForScroll: function () {
            var pos = this.position,
                scroll = !(this.scrollParent && this.scrollParent[0] !== document && $.contains( this.scrollParent[0], this.offsetParent[0] )) ?
                    this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test( scroll[0].tagName );

            return {
                top: (
                    pos.top + // The absolute mouse position
                        this.offset.parent.top - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollTop() )
                    ),
                left: (
                    pos.left + // The absolute mouse position
                        this.offset.parent.left - // The offsetParent's offset without borders (offset + border)
                        ( scrollIsRootNode ? 0 : scroll.scrollLeft() )
                    )
            };

        },

        _cacheHelperProportions: function () {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment: function () {
            var ce, co, over,
                o = this.options;
            if ( o.dragContainment === "parent" ) {
                o.dragContainment = this.helper[0].parentNode;
            }
            if ( o.dragContainment === "document" || o.dragContainment === "window" ) {
                this.containment = [
                    0 - this.offset.parent.left,
                    0 - this.offset.parent.top,
                    $( o.dragContainment === "document" ? document : window ).width() - this.helperProportions.width - this.margins.left,
                    ($( o.dragContainment === "document" ? document : window ).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                ];
            }

            if ( !(/^(document|window|parent)$/).test( o.dragContainment ) ) {
                ce = $( o.dragContainment )[0];
                co = $( o.dragContainment ).offset();
                over = ($( ce ).css( "overflow" ) !== "hidden");

                this.containment = [
                    co.left + (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingLeft" ), 10 ) || 0) - this.margins.left,
                    co.top + (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) + (parseInt( $( ce ).css( "paddingTop" ), 10 ) || 0) - this.margins.top,
                    co.left + (over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth) - (parseInt( $( ce ).css( "borderLeftWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingRight" ), 10 ) || 0) - this.helperProportions.width - this.margins.left,
                    co.top + (over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight) - (parseInt( $( ce ).css( "borderTopWidth" ), 10 ) || 0) - (parseInt( $( ce ).css( "paddingBottom" ), 10 ) || 0) - this.helperProportions.height - this.margins.top
                ];
            }
        },

        _intersectsWith: function ( item ) {
            var x1 = this.positionAbs.left,
                y1 = this.positionAbs.top,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = ( ( y1 + dyClick ) > t && ( y1 + dyClick ) < b ),
                isOverElementWidth = ( ( x1 + dxClick ) > l && ( x1 + dxClick ) < r );

            return isOverElementHeight && isOverElementWidth;
        },

        _dragCopyOrMove: function ( event, notify ) {
            var key, op;

            if ( event.ctrlKey ) {
                key = "ctrl";
            } else if ( event.altKey ) {
                key = "alt";
            } else if ( event.shiftKey ) {
                key = "shift";
            } else if ( event.metaKey ) {
                key = "meta";
            }
            op = this.dragOperations[key] || this.dragOperations.normal;
            if ( this.dragOperation !== op ) {
                // the drag operation has changed
                this.dragOperation = op;
                if ( this.placeholder ) {
                    // show or hide the items being dragged
                    this.dragItems.parent().toggle( op !== "move" );
                    // todo if any of the drag items are the only children of their parent then need to make leaf or parent
                }
                this._initPositions();
                this._refreshPositions();
                if ( notify ) {
                    this._trigger( "drag", event, this._uiHashDnD());
                }
            }
        },

        _cancel: function ( event, fromOutside ) {
            var animation,
                self = this;

            function cleanup() {
                self.animating = false;

                if ( self.helper && self.helper[0].parentNode ) {
                    self.helper.remove();
                }
                self.helper = null;
                self.dragging = false;
                self.dragItems = null;
                self.currentItem = null;
                self._stop( event );
            }

            // when cancel from draggable plugin dragging should be false by now
            if ( this.dragging ) {
                // When cancel over a droppable lie about the draggable position so that the drop fails but the
                // deactivate still happens
                this.positionAbs.top = -99999;
                this._mouseUp( $.Event( "mouseup", { target: null } ) );
                if ( this.placeholder ) {
                    this.dragItems.parent().show();
                }
            }

            this.dropTargetNode = null;
            if ( this.placeholder ) {
                this._removePlaceholder();
            }

            if ( this.options.dragAnimate && !fromOutside ) {
                animation = this._getAnimation();

                this.animating = true;
                this.helper.animate( animation, parseInt( this.options.dragAnimate, 10 ) || 500, function () {
                    cleanup();
                } );
            } else {
                cleanup();
            }

        },

        _deactivate: function () {
            // remove active drop target indication
            this.element.find( "." + C_ACTIVE).removeClass( C_ACTIVE );
        },

        _finishDrag: function ( event ) {
            var i, dropParentNode$, dropIndex, parentNode, nodes,
                validOperation = true,
                nodeAdapter = this.nodeAdapter;

            this.animating = false;

            if ( this.placeholder ) {
                dropParentNode$ = this.placeholder.parent().closest( SEL_NODE );
                this.dragItems.parent().show(); // show so that on move get proper index if any moved nodes have same parent as placeholder
                dropIndex = domIndex( this.placeholder );
                if ( this.dragOperation === "move" ) {
                    this.dragItems.parent().hide(); // hide for move so they don't mess up the indexes when reorder in same parent node
                }
            } else {
                dropParentNode$ = this.dropTargetNode;
                dropIndex = 0; // todo think is this best???
            }

            if ( this.fromOutside ) {
                this.dragItems.parent().remove(); // get rid of the temporary drag item
                if ( this.dragOperation === "add" && nodeAdapter.addNode ) {
                    try {
                        if ( this.placeholder ) {
                            this._removePlaceholder();
                        }
                        this._add( event, dropParentNode$.children( SEL_CONTENT ), dropIndex, null, true );
                    } catch ( ex ) {
                        debug.error("Error in drop add action.", ex );
                    }
                }
            } else {
                // if this is a move or copy and model allows move or copy then do it otherwise take no action and
                // leave it up to the beforeStop event to make some sense of the drop
                if ( ( this.dragOperation === "copy" || this.dragOperation === "move" ) && nodeAdapter.allowAdd &&
                    nodeAdapter[ this.dragOperation === "copy" ? "copyNodes" : "moveNodes" ] &&
                    ( this.dragOperation === "copy" || nodeAdapter.allowDelete ) ) {

                    try {
                        if ( !dropParentNode$.length && !this.options.showRoot ) {
                            parentNode = nodeAdapter.root();
                        } else {
                            parentNode = this.treeMap[getIdFromNode( dropParentNode$ )];
                        }
                        // allowAdd probably already checked but do it again just in case.
                        if ( nodeAdapter.allowAdd( parentNode, this.dragOperation, this.dragItems ) ) {
                            if ( this.dragOperation === "move" ) {
                                // for move all drag item nodes must allow delete
                                nodes = this.getNodes( this.dragItems );
                                for ( i = 0; i < nodes.length; i++ ) {
                                    if ( !nodeAdapter.allowDelete( nodes[i] ) ) {
                                        validOperation = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if ( validOperation && this.dragOperation === "move" ) {
                            // don't allow unnecessary moves such as moving to where it already is
                            if ( this.placeholder ) {
                                // if the group of items is adjacent to the placeholder then no point in moving
                                if ( this.dragItems.last().closest( SEL_NODE ).next()[0] === this.placeholder[0] ) {
                                    validOperation = false; // assume not valid but check that all the other dragItems are immediately before the placeholder
                                    for ( i = 0; i < this.dragItems.length - 1; i++ ) {
                                        if ( this.dragItems.eq( i ).closest( SEL_NODE ).next()[0] !== this.dragItems.eq( i + 1 ).closest( SEL_NODE )[0] ) {
                                            validOperation = true;
                                            break;
                                        }
                                    }
                                } else if ( this.dragItems.first().closest( SEL_NODE ).prev()[0] === this.placeholder[0] ) {
                                    validOperation = false; // assume not valid but check that all the other dragItems are immediately after the placeholder
                                    for ( i = 1; i < this.dragItems.length; i++ ) {
                                        if ( this.dragItems.eq( i ).closest( SEL_NODE ).prev()[0] !== this.dragItems.eq( i - 1 ).closest( SEL_NODE )[0] ) {
                                            validOperation = true;
                                            break;
                                        }
                                    }
                                }
                            } else {
                                // if all of the items have the target node as their parent then no point in moving
                                validOperation = false;
                                for ( i = 0; i < this.dragItems.length; i++ ) {
                                    if ( this.dragItems.eq( i ).closest( SEL_NODE ).parent().closest( SEL_NODE )[0] !== dropParentNode$[0] ) {
                                        validOperation = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if ( validOperation ) {
                            if ( this.placeholder ) {
                                this._removePlaceholder();
                            }
                            this._moveOrCopy( event, dropParentNode$.children( SEL_CONTENT ), dropIndex, this.dragItems, this.dragOperation === "copy", true );
                        } else {
                            this.dragItems.parent().show(); // make sure the drag items are shown
                        }
                    } catch ( ex ) {
                        this.dragItems.parent().show(); // make sure the drag items are shown
                        debug.error("Error in drop " + this.dragOperation + " action.", ex );
                    }
                }
            }

            this.dragging = false;

            this._trigger( "beforeStop", event, this._uiHashDnD() );

            this.dragItems = null;
            this.currentItem = null;
            if ( this.placeholder ) {
                this._removePlaceholder();
            }
            this.helper.remove();
            this.helper = null;

            if ( this.fromOutside ) {
                this._trigger( "deactivate", event, this._uiHashDnD( this ) );
            }
            this._stop( event );
            this.fromOutside = false;
        },

        _stop: function( event ) {
            if ( apex.tooltipManager ) {
                apex.tooltipManager.enableTooltips();
            }
            this._trigger( "stop", event, this._uiHashDnD() );
        },

        _add: function( event, toParentNodeContent$, index, node, focus ) {
            var parentNode, level,
                self = this,
                nodeAdapter = this.nodeAdapter;

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
                level = getLevel( toParentNodeContent$, this.labelSelector ) + 1;
            } else {
                toParentNodeContent$ = null; // to simplify checks below
                parentNode = nodeAdapter.root();
                level = 1;
            }

            nodeAdapter.addNode( parentNode, index, null, node, function( newNode, newIndex ) {
                var node$, ul$, childNodes$,
                    out = util.htmlBuilder(),
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        node: newNode,
                        index: newIndex
                    };

                function finishAdd() {
                    self._select( change.node$, event, focus );
                    self._trigger( "added", event, change );
                }

                if ( newNode === false || newNode === null || newIndex < 0 ) {
                    return; // add failed
                }

                if ( toParentNodeContent$ ) {
                    self._makeParentIfNeeded( toParentNodeContent$ );
                    ul$ = toParentNodeContent$.parent().children( "ul" );
                    if ( ul$.length === 0 ) {
                        // in this case the node was already a parent but had never been expanded
                        // expand it now and all the children including the newly added one are rendered.
                        self._expandNode( toParentNodeContent$.parent() , function() {
                            ul$ = toParentNodeContent$.parent().children( "ul" );
                            change.node$ = ul$.children().eq( index ).children( SEL_CONTENT );
                            finishAdd();
                        });
                        return;
                    }
                } else {
                    ul$ = self.element.children( "ul" );
                }
                self._renderNode( newNode, level, out );
                node$ = $( out.toString() );
                change.node$ = node$.children( SEL_CONTENT );

                childNodes$ = ul$.children();
                if ( newIndex >= childNodes$.length ) {
                    ul$.append( node$ );
                } else {
                    childNodes$.eq( newIndex ).before( node$ );
                }
                finishAdd();
            } );
        },

        // move or copy nodes in model and tree. Assumes already checked to make sure move or copy is possible
        _moveOrCopy: function( event, toParentNodeContent$, index, nodeContent$, copy, focus ) {
            var parentNode, level,
                self = this,
                nodes = this.getNodes( nodeContent$ ),
                op = copy ? "copyNodes" : "moveNodes",
                nodeAdapter = this.nodeAdapter;

            if ( toParentNodeContent$ && toParentNodeContent$.length ) {
                parentNode = this.treeMap[getIdFromNode( toParentNodeContent$.parent() )];
                level = getLevel( toParentNodeContent$, this.labelSelector ) + 1;
            } else {
                toParentNodeContent$ = null; // to simplify checks below
                parentNode = nodeAdapter.root();
                level = 1;
            }

            nodeAdapter[op]( parentNode, index, nodes, function( places ) {
                var i, place, node, node$, prevParentNode$, resultItem, ul$, childNodes$,
                    out = util.htmlBuilder(),
                    resultItems = [],
                    selection = [],
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        items: resultItems
                    };

                function finish() {
                    for ( i = 0; i < resultItems.length; i++ ) {
                        resultItem = resultItems[i];
                        node = nodeAdapter.child( parentNode, resultItem.toIndex );
                        resultItem.toNode = node;
                        out.clear();
                        self._renderNode( node, level, out );
                        node$ = $( out.toString() );
                        resultItem.toNode$ = node$.children( SEL_CONTENT );
                        childNodes$ = ul$.children( ":visible" );

                        if ( resultItem.toIndex >= childNodes$.length ) {
                            ul$.append( node$ );
                        } else {
                            childNodes$.eq( resultItem.toIndex ).before( node$ );
                        }
                        selection.push( resultItem.toNode$[0] );

                        // if move then remove from old location
                        if ( !copy ) {
                            prevParentNode$ = resultItem.fromNode$.parent().parent().closest( SEL_NODE ).children( SEL_CONTENT );
                            resultItem.fromParent$ = prevParentNode$;
                            resultItem.fromIndex = resultItem.fromNode$.parent().parent().children().index( resultItem.fromNode$.parent() );
                            resultItem.fromNode$.parent().remove(); // todo consider treeMap
                            self._makeLeafIfNeeded( prevParentNode$ );
                        }
                    }
                    self._select( $( selection ), event, focus );
                    self._trigger( copy ? "copied" : "moved", event, change );
                }

                if ( !places ) {
                    return; // copy failed
                }

                // the inserting of new nodes must be done in order from lowest to highest
                for ( i = 0; i < places.length; i++ ) {
                    place = places[i];
                    if ( place >= 0 ) {
                        resultItems.push({
                            fromNode$: nodeContent$.eq( i ),
                            toIndex: place
                        });
                    }
                }

                resultItems.sort( function( a, b ) {
                    return a.toIndex - b.toIndex;
                } );

                if ( toParentNodeContent$ ) {
                    self._makeParentIfNeeded( toParentNodeContent$ );
                    ul$ = toParentNodeContent$.parent().children( "ul" );
                    self._expandNode( toParentNodeContent$.parent(), function() {
                        finish();
                    });
                    return;
                } else {
                    ul$ = self.element.children( "ul" );
                }
                finish();
            } );
        },

        _uiHashDnD: function ( _inst ) {
            var inst = _inst || this;

            return {
                helper: inst.helper,
                placeholder: inst.dropTargetNode || inst.placeholder || $( [] ),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                items: inst.dragItems,
                operation: inst.dragOperation,
                sender: _inst ? _inst.element : null
            };
        }

    }, apex.widget.contextMenuMixin ) );

    /**
     * <p>An object that represents a node in a tree data structure. There are no requirements for and no assumptions
     * are made about the specific properties of the object as all access to the node is through the
     * {@link treeNodeAdapter} interface.</p>
     *
     * @typedef treeNodeAdapter.node
     * @type {Object}
     */

    /**
     * <p>This is the specific object structure for nodes used by the default {@link treeNodeAdapter} returned by
     * {@link treeView.makeDefaultNodeAdapter}. It is possible for nodes to have additional properties. For example
     * the APEX Tree region adds a <code class="prettyprint">tooltip</code> property</p>
     *
     * @typedef treeNodeAdapter.defaultNode
     * @type {treeNodeAdapter.node}
     *
     * @property {string} label The node label returned by {@link treeNodeAdpater#getLabel}.
     * @property {string} [id] The unique node identity. This property is required if the
     *   <code class="prettyprint">hasIdentity</code> argument to {@link treeView.makeDefaultNodeAdapter} is true.
     * @property {string} [type] The type name of the node. The node type can determine some default aspects of the
     *   node such as CSS classes or icon. For editable treeViews it can determine what edit operations are allowed.
     *   See {@link treeView.typeInfo} for details.
     * @property {string} [link] The URL returned by {@link treeNodeAdpater#getLink}.
     * @property {treeNodeAdapter.defaultNode[]} [children] The nodes children. Empty array means that
     *   it could have children but doesn't. Omit for leaf nodes. The {@link treeNodeAdpater#child} method is used to
     *   access the node's children.
     * @property {string} [icon] The icon CSS class returned by {@link treeNodeAdpater#getIcon}.
     *   This overrides any icon based on the node type.
     * @property {string} [classes] The classes returned by {@link treeNodeAdpater#getClasses}.
     *   These are added to any classes based on node type.
     * @property {boolean} [isDisabled] The disabled state returned by {@link treeNodeAdpater#isDisabled}.
     *   This overrides any disabled state based on node type.
     * @property {object} [operations] Overrides any operations defined for the node type.
     *   See {@link treeView.typeInfo} for details.
     * @property {treeNodeAdapter.defaultNode} _parent This is a reference to the parent node.
     *   This is added automatically when the default adapter is created and should not be present in the
     *   initial data.
     */

    /**
     * <p>The default {@link treeNodeAdapter} returned by {@link treeView.makeDefaultNodeAdapter} uses this type
     * information to provide default settings and control over allowed edit operations for nodes based on their
     * type.</p>
     *
     * @typedef treeNodeAdapter.typeInfo
     * @type {Object}
     * @property {Object} * The property names are the type names and the value is information about the type.
     *   There is one reserved type name call "default" that provides default settings for any nodes that
     *   don't have a type or if there is specific information for that type.
     * @property {string} [*.icon] The icon to use for nodes of this type.
     * @property {string} [*.classes] Classes to add for nodes of this type.
     * @property {boolean|function} [*.isDisabled] If true nodes of this type are disabled by default.
     * @property {string} [*.defaultLabel] The default label for new nodes.
     * @property {true|string[]} [*.validChildren] An array of valid children types for this type. If true
     *   then children of any type can be added to nodes of this type.
     * @property {Object} [*.operations] Specifies what edit operations can be done on nodes of this type.
     * @property {boolean|function} [*.operations.canAdd] If true nodes of this type allow adding.
     * @property {boolean|function} [*.operations.canDelete] If true nodes of this type allow being deleted.
     * @property {boolean|function} [*.operations.canRename] If true nodes of this type allow being renamed.
     * @property {boolean|function} [*.operations.canDrag] If true nodes of this type allow being dragged.
     * @property {Object} [*.operations.drag] An object that defines the operation to perform during a drop
     *   based on the modifier key pressed. The properties are the modifier keys and can containe any one
     *   of: "normal", "ctrl", "alt", "shift" and the values are the the operation to perform and can be
     *   anyone of "move", "copy", or "add". The value can also be a custom operation that is handled
     *   in the beforeStop event.
     * @property {Object} [*.operations.externalDrag] An object that defines the operation to perform during a drop
     *   from an external draggable based on the modifier key pressed. The properties and values are the same as
     *   for the operations drag property. This property can only be used on the "default" type.
     */
    //
    // xxx this is specific to the default adapter
    // Types
    // {
    //     "<type name or 'default'>": {
    //         icon:        <icon name or null>,
    //         classes:     <class name(s)>,
    //         isDisabled:  <true/false/function>,
    //         defaultLabel: <text>,
    //         validChildren: [ "type", ... ] | true, // true allows any children, or an array of valid type names
    //         operations: {
    //             canAdd:    <true/false/function>, // Note: node must also have a children array to be able to add
    //             canDelete: <true/false/function>, // Note: can't delete root node
    //             canRename: <true/false/function>,
    //             canDrag:   <true/false/function>
    //                                               // The above functions are called in the context of the adapter with arguments:
    //                                               //   node, operation, children. The last two only apply for canAdd. The function
    //                                               // must return true or false.
    //             drag: {
    //                 normal: <op>,
    //                 ctrl: <op>,
    //                 alt: <op>,
    //                 shift: <op>
    //            }, // <op> is a built in action "move", "copy", or "add" or a custom operation that can be handled in the beforeStop event
    //            externalDrag: <same object as drag> // only applies to the default type
    //         }
    //     },
    //     ...
    // }
    //

    /**
     * @interface treeNodeAdapter
     * @classdesc
     * <p>A treeNodeAdapter is an interface used by the {@link treeView} widget for all access to the underlying tree
     * data structure. The <code class="prettyprint">treeView</code> has no direct access to the nodes of the tree or any
     * properties of nodes such as label or icon. It is possible to create a
     * <code class="prettyprint">treeNodeAdapter</code> interface for any hierarchical data structure.
     * The tree data structure must be singly rooted. If the data doesn't have a single
     * root then the adapter must generate a virtual one where the multiple roots are its children.</p>
     * <p>The adapter provides the following areas of functionality:</p>
     * <ul>
     *     <li>Access to the hierarchical structure through methods such as {@link treeNodeAdapter#root}
     *       and {@link treeNodeAdapter#child}. The adapter supports lazy loading with the
     *       {@link treeNodeAdapter#fetchChildNodes} method.</li>
     *     <li>Access to node properties such as label, link, and icon that the {@link treeView} uses for
     *       display purposes. For example {@link treeNodeAdapter#getLabel}. This includes an optional advanced
     *       presentation layer function {@link treeNodeAdapter#renderNodeContent} that gives full control
     *       over how the node content is rendered.
     *       </li>
     *     <li>Tree modification methods such as {@link treeNodeAdapter#deleteNode} and {@link treeNodeAdapter#addNode}.
     *       These methods are only required when the tree is editable.</li>
     *     <li>Modification access control methods to determine what modifications are allowed. For example
     *       {@link treeNodeAdapter#allowDelete}. These methods are only required when the tree is editable.</li>
     *     <li>Optional methods to persist, in the adapter's data model, view state such as which nodes are expanded.
     *       For example {@link treeNodeAdapter#setExpanded}</li>
     * </ul>
     * <p>A default treeNodeAdapter implementation is provided by calling {@link treeView.makeDefaultNodeAdapter}.
     * <p>The adapter interface is provided to the treeView with the {@link treeView#getNodeAdapter(1)} option.</p>
     * <p>This interface is used by the {@link treeView}. Rarely does a developer need to call these methods. This
     * interface is documented to allow developers to create a custom <code class="prettyprint">treeNodeAdapter</code>
     * implementation for their own data.</p>
     */

    // use the default node adapter to document the general treeNodeAdapter interface
    // todo consider that the default tree node adapter should have its own documentation to describe
    // its additional methods and how it handles standard methods.
    /**
     * @lends treeNodeAdapter.prototype
     */
    var defaultNodeAdapter = {
        // data: {},
        // types: {},

        /**
         * <p>Returns the root node of the tree. All trees must have a single root node even if it is not
         * shown/used.</p>
         * @return {treeNodeAdapter.node} The root node.
         */
        root: function() {
            return this.data;
        },

        /**
         * <p>Returns the label of the given node. The label is used for node content rendering (if
         * {@link treeNodeAdapter#renderNodeContent} not implemented) and for editing during rename.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the label.
         * @return {string} The node's label.
         */
        getLabel: function( pNode ) {
            return pNode.label;
        },

        /**
         * <p>Returns the icon of the node or null if none. The icon is a CSS class name.
         * The icon is used by node content rendering. This is an optional method.
         * If the method doesn't exist then no nodes will have icons.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the icon.
         * @return {string} The node's icon.
         */
        getIcon: function( pNode ) {
            var t = this.getType( pNode ),
                icon = null;

            if ( pNode.icon || pNode.icon === null ) {
                icon = pNode.icon;
            } else if ( t.icon || t.icon === null ) {
                icon = t.icon;
            } else if ( this.types["default"].icon !== undefined ) {
                icon = this.types["default"].icon;
            }
            return icon;
        },

        /**
         * <p>Returns one or more CSS classes to add to the node content container or null if none. Multiple
         * classes are separated by a space. This is an optional method.
         * If the method doesn't exist then no nodes will have classes added to the node content container.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the CSS classes.
         * @return {string} The node's CSS Classes.
         */
        getClasses: function( pNode ) {
            var t = this.getType( pNode ),
                classes = null;

            if ( t.classes ) {
                classes = t.classes;
            } else if ( this.types["default"].classes ) {
                classes = this.types["default"].classes;
            }
            if ( pNode.classes ) {
                if ( classes ) {
                    classes += " " + pNode.classes;
                } else {
                    classes = pNode.classes;
                }
            }
            return classes;
        },

        /**
         * <p>Returns the URL to navigate to when the node is activated.
         * This is an optional method. It is only needed for navigation trees.
         * If defined it is called during activation if {@link treeView#navigation} option is true.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the link URL.
         * @return {string} The node's link URL.
         */
        getLink: function( pNode ) {
            return pNode.link;
        },

        /**
         * <p>Returns the disabled state of a node.
         * A disabled node cannot be selected or activated but it can be focused.
         * This is an optional method. If not defined no nodes are ever disabled.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the disabled state.
         * @return {boolean} true if the node is disabled and false otherwise.
         */
        isDisabled: function( pNode ) {
            var t = this.getType( pNode ),
                disabled = false;

            if ( pNode.isDisabled !== undefined ) {
                disabled = pNode.isDisabled;
            } else if ( t.isDisabled !== undefined ) {
                disabled = t.isDisabled;
            } else if ( this.types["default"].isDisabled !== undefined ) {
                disabled = this.types["default"].isDisabled;
            }
            return disabled;
        },

        /**
         * <p>Return the i<sup>th</sup> child of the given node.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the child node.
         * @param {integer} pIndex The index of the child to return.
         * @return {treeNodeAdapter.node} The child node. If the node has no children or no child at index i then
         *   undefined is returned.
         */
        child: function( pNode, pIndex ) {
            if ( pNode.children ) {
                return pNode.children[pIndex];
            }
            // undefined
        },

        /**
         * <p>Returns the number of children that the given node has or null if the answer is not yet known, which
         * can happen for lazy loaded nodes.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node from which to get the number of children.
         * @return {?number} The number of children or null if unknown.
         */
        childCount: function( pNode ) {
            return pNode.children ? pNode.children.length : 0;
        },

        /**
         * <p>Returns true if the node has children, false if it does not and null if not yet known, which
         * can happen for lazy loaded nodes.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node for which to determine if it has children.
         * @return {?boolean} true if the node has children, false if it does not and null if not yet known.
         */
        hasChildren: function( pNode ) {
            return pNode.children ? pNode.children.length > 0 : false;
        },

        /**
         * <p>Check if the node allows adding children to it.
         * Returns true if the node allows children to be added to it.
         * If the children parameter is passed in return true if each of those children
         * (or ones just like them) can be added. Children is an array of nodes.
         * Operation is "add" when adding a new node ({@link treeNodeAdapter#addNode} will be called),
         * "move" when the node comes from elsewhere in the tree and is being moved ({@link treeNodeAdapter#moveNodes} will be called),
         * and "copy" when the node is a copy of a node from elsewhere in the tree ({@link treeNodeAdapter#copyNodes} will be called).
         * Additional operation values are possible if the adapter supports custom drag operations.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node to check if adding children is allowed.
         * @param {string} pOperation Specifies how the node would be added. One of "add", "move", "copy" or a custom value.
         * @param {treeNodeAdapter.node[]} [pChildren] The children to be added.
         * @return {boolean} true if children can be added and false otherwise.
         */
        allowAdd: function( pNode, pOperation, pChildren ) {
            var i, validChildren,
                t = this.getType( pNode ),
                addOK = !!pNode.children && this.check( "canAdd", pNode, pOperation, pChildren );

            if ( addOK && pChildren ) {
                if ( t.validChildren !== undefined) {
                    validChildren = t.validChildren;
                } else if ( this.types["default"].validChildren !== undefined ) {
                    validChildren = this.types["default"].validChildren;
                }
                // addOK is already true look for a reason to not allow add
                if ( validChildren !== true ) {
                    for ( i = 0; i < pChildren.length; i++ ) {
                        if ( validChildren.indexOf( pChildren[i].type ) < 0 ) {
                            addOK = false;
                            break;
                        }
                    }
                }
            }
            return addOK;
        },

        /**
         * <p>Return true if the given node can be renamed.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node to check if renaming is allowed.
         * @return {boolean} true if the node can be renamed and false otherwise.
         */
        allowRename: function( pNode ) {
            return this.check( "canRename", pNode );
        },

        /**
         * <p>Return true if the given node can be deleted.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node to check if deleting is allowed.
         * @return {boolean} true if the node can be deleted and false otherwise.
         */
        allowDelete: function( pNode ) {
            if ( pNode === this.data ) {
                return false; // can't delete the root
            }
            return this.check( "canDelete", pNode );
        },

        /**
         * <p>Return true if the given node can be dragged.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node to check if dragging is allowed.
         * @return {boolean} true if the node can be dragged and false otherwise.
         */
        allowDrag: function( pNode ) {
            return this.check( "canDrag", pNode );
        },

        /**
         * <p>Determine which operations are allowed while dragging the given array of nodes.
         * Return an object with allowed drag operations.
         * The properties are: "normal", "ctrl", "alt", "shift", "meta".
         * The standard values are "move", "copy" or "add". Other values are allowed.
         * The normal property is required.
         * The default should be:<br><code class="prettyprint">{ normal: "move", ctrl: "copy" }</code><br>
         * or if nodes is null:<br>
         * <code class="prettyprint">{ normal: "add" }</code></p>
         *
         * @param {treeNodeAdapter.node[]} pNodes An array of nodes being dragged or null when dragging from an external source.
         * @return {Object} Allowed drag operations as described above.
         */
        dragOperations: function( pNodes ) {
            var i, ops, type;

            if ( pNodes ) {
                if ( pNodes.length > 0 ) {
                    // if all the nodes being dragged are of the same type use that type
                    type = pNodes[0].type || "default";
                    for ( i = 1; i < pNodes.length; i++ ) {
                        if ( pNodes[i].type !== type ) {
                            type = "default"; // else use default type
                            break;
                        }
                    }
                } else {
                    type = "default";
                }
                if ( this.types[type].operations && this.types[type].operations.drag !== undefined ) {
                    ops = this.types[type].operations.drag;
                } else {
                    ops = this.types["default"].operations.drag;
                }
            } else {
                ops = this.types["default"].operations.externalDrag;
            }
            return ops;
        },

        /**
         * <p>Adds a new node as a child of the given parent node with the given label (optional)
         * and at the given index.</p>
         *
         * @param {treeNodeAdapter.node} pParent The parent node to add the new node to.
         * @param {integer} pIndex The index among the existing children at which to add the new node.
         * @param {string} [pLabel] The label for the new node. If not given the label may have been given a
         *   default by the adapter.
         * @param {Object} [pContext] Arbitrary additional information that can be used in creating the new node.
         *   It is up to the adapter how to use this parameter. It could be the new node itself.
         * @param {function} pCallback A function to call when the new node has been added. The function takes
         *   two parameters. The first is the new child node that was added. If the child node is false the treeView
         *   may try again to add a node. If the child node is null then the add failed and the treeView will remove
         *   the node. The second parameter is the index the node was actually inserted at which could differ from
         *   <code class="prettyprint">pIndex</code>.
         */
        addNode: function( pParent, pIndex, pLabel, pContext, pCallback ) {
            var newIndex,
                newNode = $.extend( true, { }, pContext || this.newNode( pParent ) );

            if ( pLabel ) {
                newNode.label = pLabel;
            }
            if ( this.sortCompare ) {
                // ignore index and put at end because it will get sorted
                pParent.children.push( newNode );
            } else {
                pParent.children.splice( pIndex, 0, newNode );
            }
            newNode._parent = pParent;
            // make sure node gets an id if needed
            if ( this._nextId !== undefined ) {
                if ( newNode.id === undefined ) {
                    newNode.id = this.nextId();
                } else {
                    this._nextId += 1;
                }
            }

            if ( this.sortCompare ) {
                pParent.children.sort( this.sortCompare );
            }
            newIndex = pParent.children.indexOf( newNode );
            this.validateAdd( newNode, newIndex, function( status ) {
                if ( typeof status === "string" || status === false ) {
                    // undo the add
                    pParent.children.splice( newIndex, 1 );
                    pCallback( status === false ? null : false );
                } else if ( status ) {
                    pCallback( newNode, newIndex );
                }
            } );
        },

        /**
         * Rename the given node.
         *
         * @param {treeNodeAdapter.node} pNode The node to rename.
         * @param {string} pNewLabel The new label to rename the node to.
         * @param {function} pCallback This function must be called once the node is renamed. It takes two
         *   parameters. The first is node which is likely the same as <code class="prettyprint">pNode</code>
         *   or false if the rename can be tried again or null if the rename failed.
         *   The second parameter is the index of the node after the rename. If the nodes are sorted
         *   then renaming the node can change its position.
         */
        renameNode: function( pNode, pNewLabel, pCallback ) {
            var newIndex,
                oldLabel = pNode.label;

            pNode.label = pNewLabel;
            if ( pNode._parent ) {
                if ( this.sortCompare ) {
                    pNode._parent.children.sort( this.sortCompare );
                }
                newIndex = pNode._parent.children.indexOf( pNode );
            } else {
                newIndex = 0; // can't sort the root because it has no parent or siblings
            }
            this.validateRename( pNode, newIndex, function( status ) {
                if ( typeof status === "string" || status === false ) {
                    // undo the rename
                    pNode.label = oldLabel;
                    pCallback( status === false ? null : false );
                } else if ( status ) {
                    pCallback( pNode, newIndex );
                }
            } );
        },

        /**
         * <p>Deletes the given node. When the node has been deleted the callback is called.</p>
         *
         * @param {treeNodeAdapter.node} pNode The node to delete.
         * @param {function} pCallback The callback function must be called when the node is deleted. It takes one
         *   parameter, status, that is true if the delete was successful and false otherwise.
         * @param {boolean} pMore If this is true another <code class="prettyprint">deleteNode</code> call will be
         *   made right away. This parameter can be ignored or can be used to batch up deletes.
         *   In either case each call to <code class="prettyprint">pCallback</code> must be made.
         */
        deleteNode: function( pNode, pCallback , pMore ) {
            var oldParent = pNode._parent,
                oldIndex = pNode._parent.children.indexOf( pNode );

            oldParent.children.splice( oldIndex, 1 );
            delete pNode._parent;
            this.validateDelete( pNode, pMore, function( status ) {
                if ( !status ) {
                    // undo delete
                    pNode._parent = oldParent;
                    oldParent.children.splice( oldIndex, 0, pNode );
                }
                pCallback( status );
            });
        },

        /**
         * <p>Moves one or more nodes from elsewhere in the tree to be children of the given parent starting at
         * the given index among the existing children of parent.
         * The move includes all the descendants of the moved nodes.
         * Only the parents and/or positions of the moved nodes should change.
         * When the nodes have been moved the callback function is called.</p>
         *
         * @param {treeNodeAdapter.node} pParent The parent node to move nodes to. The moved nodes
         *   (<code class="prettyprint">pNodes</code>) become children of this node.
         * @param {integer} pIndex The index at which to insert the moved nodes.
         * @param {treeNodeAdapter.node[]} pNodes An array of nodes from this tree to move.
         * @param {function} pCallback  This function must be called when the nodes have been moved. The function
         *   takes one parameter which is a places array of indexes where the children nodes ended up.
         *   If the tree nodes are sorted then even though they were moved starting at the
         *   given index they could end up at any position. If the tree nodes are not sorted then places will consist
         *   of integers index ... index + n - 1 where n is the number of nodes moved. If the move fails
         *   call with the places parameter equal to false.
         *   If some of the nodes can't be moved return -1 for its index in the places array.
         */
        moveNodes: function( pParent, pIndex, pNodes, pCallback ) {
            var i, node, prevParent, prevIndex,
                places = [];

            for ( i = 0; i < pNodes.length; i++ ) {
                node = pNodes[i];
                prevParent = node._parent;
                prevIndex = prevParent.children.indexOf(node);
                prevParent.children.splice( prevIndex, 1); // delete from previous parent node
                if ( pParent === prevParent && prevIndex < pIndex ) {
                    // when reordering in the same node take into consideration the node just deleted
                    pIndex -= 1;
                }
                if ( this.sortCompare ) {
                    pParent.children.push( node ); // add to new parent node
                } else {
                    pParent.children.splice( pIndex, 0, node ); // add to new parent node
                    pIndex += 1;
                }
                node._parent = pParent;
            }
            if ( this.sortCompare ) {
                pParent.children.sort( this.sortCompare );
            }
            // the place a node ends up depends on sorting and also on when reordering in the same parent
            for ( i = 0; i < pNodes.length; i++ ) {
                places[i] = pParent.children.indexOf(pNodes[i]);
            }
            this.validateMove( pParent, pNodes, places, function( status ) {
                // todo undo nodes not moved
                pCallback( status ? places : false );
            } );
        },

        /**
         * <p>Copies one or more nodes from elsewhere in the tree to be children of the given parent starting at
         * the given index among the existing children of the parent.
         * A copy of each node and all its descendants is made.
         * The copies are the same except for identity and parentage.
         * When the nodes have been copied the callback function is called.</p>
         *
         * @param {treeNodeAdapter.node} pParent The parent node to copy nodes to. The copied nodes
         *   (<code class="prettyprint">pNodes</code>) become children of this node.
         * @param {integer} pIndex The index at which to insert the copied nodes.
         * @param {treeNodeAdapter.node[]} pNodes An array of nodes from this tree to copy.
         * @param {function} pCallback  This function must be called when the nodes have been copied. The function
         *   takes one parameter which is a places array of indexes where the children nodes ended up.
         *   If the tree nodes are sorted then even though they were copied starting at the
         *   given index they could end up at any position. If the tree nodes are not sorted then places will consist
         *   of integers index ... index + n - 1 where n is the number of nodes copied. If the copy fails
         *   call with the places parameter equal to false.
         *   If some of the nodes can't be copied return -1 for its index in the places array.
         */
        copyNodes: function( pParent, pIndex, pNodes, pCallback ) {
            var i, node, newNode,
                self = this,
                newNodes = [],
                places = [];

            function cloneNode( node, parent ) {
                var i, newNode = $.extend({}, node);
                newNode._parent = parent;
                if ( self._nextId !== undefined ) {
                    newNode.id = self.nextId();
                }
                if ( node.children ) {
                    newNode.children = [];
                    for ( i = 0; i < node.children.length; i++ ) {
                        newNode.children.push( cloneNode( node.children[i], newNode ) );
                    }
                }
                return newNode;
            }

            for ( i = 0; i < pNodes.length; i++ ) {
                node = pNodes[i];
                newNode = cloneNode( node, pParent );
                newNodes[i] = newNode;
                if ( this.sortCompare ) {
                    pParent.children.push( newNode ); // add to new parent node
                } else {
                    pParent.children.splice( pIndex, 0, newNode ); // add to new parent node
                    places[i] = pIndex;
                    pIndex += 1;
                }
            }
            if ( this.sortCompare ) {
                pParent.children.sort( this.sortCompare );
                for ( i = 0; i < newNodes.length; i++ ) {
                    places[i] = pParent.children.indexOf( newNodes[i] );
                }
            }
            this.validateCopy( pParent, newNodes, places, function( status ) {
                // todo undo nodes not copied
                pCallback( status ? places : false );
            } );
        },

        //
        // Additional methods not part of the adapter interface
        // You can use or replace these methods
        //

        // delete this function for unsorted nodes or replace to provide a different ordering
        sortCompare: function( a, b ) {
            if ( a.label > b.label ) {
                return 1;
            } else if ( a.label < b.label ) {
                return -1;
            }
            return 0;
        },

        nextId: function() {
            var nextId = this._nextId;
            this._nextId += 1;
            return "tn" + nextId;
        },

        // this is used to create a new node when addNode receives no context object
        newNode: function( parent ) {
            var ct,
                newNode = { },
                childrenAllowed = true,
                t = this.getType( parent );

            if ( this._nextId !== undefined ) {
                newNode.id = this.nextId();
            }
            if ( $.isArray( t.validChildren ) ) {
                newNode.type = t.validChildren[0]; // default to first valid type for parent
                ct = this.types[newNode.type];
                if ( ct && ct.operations && ct.operations.canAdd !== undefined ) {
                    childrenAllowed = t.operations.canAdd;
                } else if ( this.types["default"].operations.canAdd !== undefined ) {
                    childrenAllowed = this.types["default"].operations.canAdd;
                }
                if ( ct && ct.defaultLabel !== undefined ) {
                    newNode.label = ct.defaultLabel;
                } else if ( this.types["default"].defaultLabel !== undefined ) {
                    newNode.label = this.types["default"].defaultLabel;
                }
            } else {
                if ( this.types["default"].defaultLabel !== undefined ) {
                    newNode.label = this.types["default"].defaultLabel;
                }
            }
            if ( childrenAllowed ) {
                newNode.children = [];
            }
            return newNode;
        },

        extraCheck: function( result, rule, n, operation, children ) {
            return result;
        },

        // called after the given node is added at given index
        // call callback with true for success, false for failure, and "again" if giving the node a different name
        // could succeed (only works when adding a node in-place)
        validateAdd: function( node, index, callback ) {
            callback( true );
        },

        // called after the given node is renamed and at given index
        // call callback with true for success, false for failure, and "again" if giving the node a different name
        // could succeed (only works when adding a node in-place)
        validateRename: function( node, index, callback ) {
            callback( true );
        },

        // called after the given node is deleted
        // call callback with true for success and false for failure.
        validateDelete: function( node, more, callback ) {
            callback( true );
        },

        // todo not sure about this
        validateMove: function( parent, nodes, places, callback ) {
            callback( true );
        },

        // todo not sure about this
        validateCopy: function( parent, nodes, places, callback ) {
            callback( true );
        },

        // todo method to sort or to call after sort

        getType: function( n ) {
            var t = "default";

            if ( n.type ) {
                t = n.type;
            }
            return this.types[t] || this.types["default"];
        },

        check: function( rule, n, operation, children ) {
            var result = false,
                t = this.getType( n );

            if ( n.operations && n.operations[rule] !== undefined ) {
                result = n.operations[rule];
            } else if ( t.operations && t.operations[rule] !== undefined ) {
                result = t.operations[rule];
            } else if ( this.types["default"].operations[rule] !== undefined ) {
                result = this.types["default"].operations[rule];
            }
            if ( $.isFunction( result ) ) {
                result = result.call( this, n, operation, children );
            }
            return this.extraCheck( result, rule, n, operation, children );
        }
    };

    /**
     * <p>This is an optional function used to render the node content.
     * It is used for advanced cases where more control over the node markup is needed.</p>
     *
     * <p>The content must include an element with <code class="prettyprint">tabindex='-1'</code> and that
     * element must have a class that matches the {@link treeView#labelClass} option.
     * The custom rendering is responsible for setting the <code class="prettyprint">aria-level</code>,
     * <code class="prettyprint">aria-disabled</code>, <code class="prettyprint">aria-selected</code>, and
     * <code class="prettyprint">aria-expanded</code> attributes for proper accessibility.</p>
     *
     * <p>The options and state arguments provide additional information to determine how to render the node.</p>
     *
     * @method renderNodeContent
     * @instance
     * @memberof treeNodeAdapter
     * @param {treeNodeAdapter.node} pNode The node from which to get the disabled state.
     * @param {apex.util.htmlBuilder} pOut Call methods on this interface to render the node content.
     * @param {Object} pOptions View options.
     * @param {string} pOptions.iconType CSS class used in creating an icon. The {@link treeView#iconType} option value.
     * @param {string} pOptions.labelClass CSS classes to use for the content label. The {@link treeView#labelClass} option.
     * @param {boolean} pOptions.useLinks Used to determine how to render nodes that have a link. The {@link treeView#useLinks} option value.
     * @param {Object} pState Node state information.
     * @param {boolean} pState.selected If true the node is selected.
     * @param {integer} pState.level This is the level of the node. Used for the <code class="prettyprint">aria-level</code> attribute.
     * @param {boolean} pState.disabled This is true if the node is disabled.
     * @param {boolean} pState.hasChildren This is true if the node has children.
     * @param {boolean} pState.expanded This is true if the node is expanded.
     * @example <caption>See {@link treeView#makeDefaultNodeAdapter} for an example.</caption>
     */

    /**
     * <p>Fetch child nodes for the given node from a server (or by any other asynchronous means).
     * This method is optional. This is used for asynchronous/lazy tree construction. The root and first level of nodes
     * should not be lazy loaded. May be called after {@link treeNodeAdapter#childCount} returns null.<p>
     *
     * @method fetchChildNodes
     * @instance
     * @memberof treeNodeAdapter
     * @param {treeNodeAdapter.node} pNode The node for which to fetch children.
     * @param {function} pCallback <em>function(status)</em> This function must be called when the
     *   asynchronous operation has completed and nodes have been added to <code class="prettyprint">pNode</code>.
     *   The status value is:
     *   <ul>
     *   <li>&gt; 0 (or true) if 1 or more children were fetched.</li>
     *   <li>0 if the node has 0 children.</li>
     *   <li>false if there was an error fetching the children.</li>
     *   </ul>
     */

    /**
     * <p>Returns a default node adapter. See {@link treeNodeAdapter} for details.</p>
     * <p>This returns an adapter for the default data model. See {treeNodeAdapter.defaultNode} for details on the
     * node object properties. Use it if you don't already have a prescribed data model.
     * This supports all the treeView features except for asynchronous (lazy) loading of child nodes and
     * custom node rendering.
     * Although it supports editing there is no built-in support for persisting the edits.
     * Editing through the default tree node adapter should be considered an experimental feature subject to change.</p>
     *
     * <p>You can augment the adapter returned from this funciton to change its behavior. For example by
     *
     * @method makeDefaultNodeAdapter
     * @memberof treeView
     * @param {treeNodeAdapter.defaultNode} pData This object is the root node of the tree.
     * @param {treeNodeTypes} [pTypes] A {@link treeNodeAdapter.typeInfo} structure with metadata about the node types.
     * @param {boolean} [pHasIdentity] Set to true if the tree model nodes have identity
     *   (<code class="prettyprint">id</code> property). Set to false if nodes do not have identity.
     *   The default is true. This argument can be omitted if the <code class="prettyprint">pInitialExpandedNodeIds</code>
     *   argument is given.
     * @param {Array} [pInitialExpandedNodeIds] An array of node ids for all the nodes that should be initially expanded.
     * @return {treeNodeAdapter} The default node adapter for the given data.
     * @example <caption>This example creates an adapter for nodes that don't have any identity
     *   (they have no <code class="prettyprint">id</code> property). Also there is no type information.</caption>
     * var treeData = {
     *     label: "Root",
     *     children: [
     *         {
     *             label: "Child 1",
     *             children: [
     *                 {
     *                     label: "Grandchild"
     *                 }
     *             ]
     *         },
     *         {
     *             label: "Child 2",
     *             children: []
     *         }
     *     ]
     * };
     * var adapter = $.apex.treeView.makeDefaultNodeAdapter( treeData, null, false );
     * @example <caption>This example creates an adapter for nodes that do have identity. See also the
     * example for {@link treeView#getExpandedNodeIds}.</caption>
     * var treeData = {
     *     id: "0001",
     *     label: "Root",
     *     children: [
     *         {
     *             id: "0009",
     *             label: "Child 1",
     *             children: [
     *                 ...
     *             ]
     *         },
     *         ...
     *     ]
     * };
     * var adatper = $.apex.treeView.makeDefaultNodeAdapter( treeData );
     * // the following has the same effect
     * // var adapter = $.apex.treeView.makeDefaultNodeAdapter( treeData, null, true );
     * @example <caption>This example augments the returned adapter to support lazy loading node children.</caption>
     * var treeData = {
     *     id: "0001",
     *     label: "Root",
     *     children: [
     *         {
     *             id: "0009",
     *             label: "Child 1",
     *             children: null // this means lazy load the children
     *         },
     *         ...
     *     ]
     * };
     * var adapter = $.apex.treeView.makeDefaultNodeAdapter( treeData );
     * // Replace these functions to be aware of nodes that need lazy loading
     * //   no children property or children = [] means there are no children
     * //   children = null means the server has or may have more children
     * adapter.childCount = function( n ) {
     *     if ( n.children === null ) {
     *         return null;
     *     } // else
     *     return n.children ? n.children.length : 0;
     * };
     * adapter.hasChildren = function( n ) {
     *     if ( n.children === null ) {
     *         return null;
     *     } // else
     *     return n.children ? n.children.length > 0 : false;
     * };
     * // add this method to fetch children when node is first expanded
     * adapter.fetchChildNodes = function( n, callback ) {
     *     // Simulate adding lazy loaded nodes
     *     // This would normally be an ajax call such as apex.server.process
     *     // Typically send something like n.id to the server so it knows which children to return
     *     setTimeout(function() {
     *         // when the ajax call returns add the children to the parent (n).
     *         var c = n.children = [];
     *         // this example just adds dummy data
     *         c.push( {
     *             id: n.id + "_l1",
     *             label: "Lazy Child 1",
     *             children: [] // no children we're sure
     *         });
     *         c.push( {
     *             id: n.id + "_l2",
     *             label: "Lazy Child 2",
     *             children: null // there could be more lazy loaded children
     *         });
     *         // when the model data is updated let the treeView know
     *         callback( true );
     *     }, 800 );
     * };
     * @example <caption>This example adds a custom node rendering function to the adapter that puts the first
     * letter of the label in bold tag.</caption>
     * ...
     * var adapter = $.apex.treeView.makeDefaultNodeAdapter( treeData );
     * adapter.renderNodeContent = function( node, out, options, state ) {
     *     var label;
     *     if ( options.nodeSelector > 0 ) {
     *         // simulate a checkbox or radio button depending on single/multiple selection
     *         cls = "u-selector";
     *         if ( options.nodeSelector === 1 ) {
     *             cls += " u-selector--single";
     *         }
     *         out.markup('<span class="' + cls + '"></span>');
     *     }
     *     if ( adapter.getIcon ) {
     *         icon = adapter.getIcon( node );
     *         if ( icon !== null ) {
     *             out.markup( "<span" ).attr( "class", options.iconType + " " + icon ).markup( "></span>" );
     *         }
     *     }
     *     // format label
     *     label = apex.util.escapeHTML( adapter.getLabel( node ) );
     *     label = "<b>" + label.substring(0,1) + "</b>" + label.substring(1);
     *     // assume the node is not a link
     *     out.markup( "<span tabIndex='-1' role='treeitem'" )
     *         .attr( "class", options.labelClass )
     *         .attr( "aria-level", state.level )
     *         .attr( "aria-selected", state.selected ? "true" : "false" )
     *         .optionalAttr( "area-disabled", state.disabled ? "true" : null )
     *         .optionalAttr( "aria-expanded", state.hasChildren === false ? null : state.expanded ? "true" : "false" )
     *         .markup( ">" )
     *         .markup( label )
     *         .markup( "</span>" );
     * }
     */
    $.apex.treeView.makeDefaultNodeAdapter = function( pData, pTypes, pHasIdentity, pInitialExpandedNodeIds ) {
        var that = Object.create( defaultNodeAdapter );

        if ( $.isArray(pHasIdentity) ) {
            pInitialExpandedNodeIds = pHasIdentity;
            pHasIdentity = true;
        }
        if ( pHasIdentity === null || pHasIdentity === undefined ) {
            pHasIdentity = true;
        }
        if ( pHasIdentity ) {
            $.apex.treeView.addViewStateMixin( that, "id", pInitialExpandedNodeIds );
            that._nextId = 1;
        }
        that.data = pData;
        that.types = $.extend( true, {}, {
            "default" : {
                isDisabled: false,
                validChildren: true, // any children are allowed
                operations: {
                    canAdd: true,
                    canRename: true,
                    canDelete: true,
                    canDrag: true,
                    drag: { normal: "move", ctrl: "copy" },
                    externalDrag: { normal: "add" }
                }
            }
        }, pTypes );

        function traverse( n, p ) {
            var i;
            n._parent = p;
            if ( pHasIdentity ) {
                that._nextId += 1;
            }
            if ( n.children ) {
                for ( i = 0; i < n.children.length; i++ ) {
                    traverse( n.children[i], n );
                }
            }
        }
        if ( that.data ) {
            // add parent references to tree nodes to support modification
            traverse( that.data, null );
        }

        return that;
    };

    /**
     * Call as
     * $.apex.treeView.makeModelNodeAdapter( options, data );
     *
     * Types operations should use canEdit rather than canRename.
     * todo document this when ready
     * @ignore
     * @method makeModelNodeAdapter
     * @memberof treeView
     * @param modelId modelId used to create apex model
     * @param options options to create an apex model with these additional options
     *              hasIdentity
     *              initialExpandedNodeIds
     *              labelField - default label
     *              iconField - default icon
     *              classesField - default classes
     *              linkField - default link,
     *              disabledField - default isDisabled
     * @param data initial tree data
     * @return {treeNodeAdapter} adapter
     */
    $.apex.treeView.makeModelNodeAdapter = function( modelId, options, data ) {
        var that, labelField;

        if ( !apex.model ) {
            throw new Error( "Missing module apex.model" );
        }

        options.shape = "tree"; // force shape to be tree

        // an apex model provides some of the methods of the adapter interface directly
        that = apex.model.create( modelId, options, data );

        labelField = options.labelField || "label";
        that._labelKey = that.getFieldKey( labelField );
        that._iconKey = that.getFieldKey( options.iconField || "icon" );
        that._classesKey = that.getFieldKey( options.classesField || "classes" );
        that._linkKey = that.getFieldKey( options.linkField || "link" );
        that._disabledKey = that.getFieldKey( options.disabledField || "isDisabled" );

        // now add additional adapter methods

        if ( options.hasIdentity ) {
            $.apex.treeView.addViewStateMixin( that, function( node ) {
                return that.getRecordId( node );
            }, options.initialExpandedNodeIds );
        }

        that.getType = that._getType;

        that.getLabel = function( n ) {
            // xxx check for display value object
            return n[this._labelKey];
        };

        that.getIcon = function( n ) {
            var t = this.getType( n ),
                o = this._options,
                icon = null;

            if ( this._iconKey && ( n[this._iconKey] || n[this._iconKey] === null ) )  {
                icon = n[this._iconKey];
            } else if ( t.icon || t.icon === null ) {
                icon = t.icon;
            } else if ( o.types["default"].icon !== undefined ) {
                icon = o.types["default"].icon;
            }
            return icon;
        };

        that.getClasses = function( n ) {
            var t = this.getType( n ),
                o = this._options,
                classes = null;

            if ( t.classes ) {
                classes = t.classes;
            } else if ( o.types["default"].classes ) {
                classes = o.types["default"].classes;
            }
            if ( this._classesKey && n[this._classesKey] ) {
                if ( classes ) {
                    classes += " " + n[this._classesKey];
                } else {
                    classes = n[this._classesKey];
                }
            }
            return classes;
        };

        that.getLink = function( n ) {
            return this._linkKey ? n[this._linkKey] : null;
        };

        that.isDisabled = function( n ) {
            var t = this.getType( n ),
                o = this._options,
                disabled = false;

            if ( this._disabledKey && n[this._disabledKey] !== undefined ) {
                disabled = n[this._disabledKey];
            } else if ( t.isDisabled !== undefined ) {
                disabled = t.isDisabled;
            } else if ( o.types["default"].isDisabled !== undefined ) {
                disabled = o.types["default"].isDisabled;
            }
            return disabled;
        };

        // operation rename is really edit
        that.allowRename = that.allowEdit;

        that.addNode = function( parent, index, label, context, callback ) {
            var newIndex, children, newKey,
                afterRecord = null,
                newNode = this._initRecord( context, null, parent );

            children = parent[this._childrenKey];
            if ( index >= 0 && index < children.length ) {
                afterRecord = children[ index ];
            }

            if ( label ) {
                newNode[this._labelKey] = label;
            }
            newKey = this.insertNewRecord( parent, afterRecord, newNode );
            newNode = this.getRecord( newKey );

            newIndex = children.indexOf( newNode );
            callback( newNode, newIndex );
        };

        that.renameNode = function( n, newLabel, callback ) {
            var newIndex, parent;

            this.setValue( n, labelField, newLabel );
            parent = this.parent( n );
            if ( parent ) {
//xxx                if ( this.sortCompare ) {
//                    n._parent.children.sort( this.sortCompare );
//                }
                newIndex = parent[this._childrenKey].indexOf( n );
            } else {
                newIndex = 0; // can't sort the root because it has no parent or siblings
            }
            callback( n, newIndex );
        };

        that.deleteNode = function( n, callback , more ) {
            var count = this.deleteRecords( [n] );
            callback( count === 1 );
        };

        that.moveNodes = function( parent, index, nodes, callback ) {
            var i, node, children, nodeIds, places,
                afterRecord = null;

            children = parent[this._childrenKey];
            index -= 1;
            if ( index >= 0 && index < children.length ) {
                afterRecord = children[ index ];
            }

            nodeIds = this.moveRecords( nodes, parent, afterRecord );
            for ( i = 0; i < nodeIds.length; i++ ) {
                node = this.getRecord( nodeIds[i] );
                places[i] = children.indexOf( node );
            }
            callback( places );
        };

        that.copyNodes = function( parent, index, nodes, callback ) {
            var i, node, children, nodeIds, places,
                afterRecord = null;

            children = parent[this._childrenKey];
            index -= 1;
            if ( index >= 0 && index < children.length ) {
                afterRecord = children[ index ];
            }

            nodeIds = this.copyRecords( nodes, parent, afterRecord );
            for ( i = 0; i < nodeIds.length; i++ ) {
                node = this.getRecord( nodeIds[i] );
                places[i] = children.indexOf( node );
            }
            callback( places );
        };

        return that;
    };

    /**
     * Given a model and a treeView widget create an listener/observer to the model that will update the treeView
     *
     * todo document this when ready
     * @ignore
     * @method treeModelListener
     * @memberof treeView
     * @param modelName
     * @param tree$
     */
    $.apex.treeView.treeModelListener = function( modelName, tree$ ) {
        var markDeletes, treeModel,
            inst = tree$.data( "apex-treeView" ),
            adapter = inst.getNodeAdapter();

        function modelChangeHandler(type, change) {
            var i, nodes$;

            function elementsFromRecords( records ) {
                var i, id,
                    elements = [];

                for ( i = 0; i < records.length; i++ ) {
                    id = adapter.getViewId( inst.baseId, records[i] );
                    elements.push( $( "#" + inst.baseId + id ).children( SEL_CONTENT )[0] );
                }
                return $( elements );
            }

            if ( type === "refresh" ) {
                inst.refresh();
            } else if ( type === "refreshRecords" || type === "revert" ) {
                //xxx
            } else if ( type === "move" ) {
                //xxx
            } else if ( type === "copy" ) {
                //xxx
            } else if ( type === "insert" ) {
                // tree doesn't have a public method update the tree when the model has already had the node inserted
                // so refresh the parent record
                nodes$ = elementsFromRecords( [adapter.parent( change.record )] );
                inst.refresh( nodes$ );
            } else if ( type === "clearChanges") {
                //xxx
            } else if ( type === "delete" ) {
                // todo consider if/how the treeView could support mark for delete
                nodes$ = elementsFromRecords( change.records );
                // clean view state
                for ( i = 0; i < change.records.length; i++ ) {
                    adapter.clearViewId( inst.baseId, change.records[i] );
                }
                inst.deleteTreeNodes( nodes$ );
            } else if ( type === "set" || type === "metaChange" ) {
                nodes$ = elementsFromRecords( [change.record] );
                inst.update( nodes$ );
            }
        }

        treeModel = inst.option( "treeModel" );
        if ( treeModel ) {
            // if there was a model unbind our listener
            treeModel.unSubscribe( inst.option( "modelViewId" ) );
            if ( inst.option( "modelName" ) !== modelName ) {
                // and release the model
                apex.model.release( this.modelName );
            }
            inst.option( "treeModel", null );
            inst.option( "modelName", null );
            inst.option( "modelViewId", null );
        }
        if ( modelName ) {
            inst.option( "treeModel", modelName );
            treeModel =  apex.model.get( modelName );
            inst.option( "modelName", treeModel );
            if ( !treeModel ) {
                throw new Error( "TreeView model not found: " + modelName );
            }
            inst.option( "modelViewId", treeModel.subscribe( {
                onChange: modelChangeHandler,
                progressView: this.element
            } ) );
            markDeletes = treeModel.getOption( "onlyMarkForDelete" );
        }

    };

    /**
     * todo consider if this is worth documenting for people that create their own adapter
     * @ignore
     * @param adapter
     * @param nodeIdentity
     * @param initialExpandedNodeIds
     */
    $.apex.treeView.addViewStateMixin = function( adapter, nodeIdentity, initialExpandedNodeIds ) {
        $.extend( adapter,
            /**
             * @lends treeNodeAdapter.prototype
             */
            {
            _state: {},
            /**
             * <p>Return true if the given node is or should be expanded and false otherwise.</p>
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @param {treeNodeAdapter.node} pNode The node to check if it is expanded.
             * @returns {boolean}
             */
            isExpanded: function( pTreeId, pNode ) {
                var expandedNodes = this._getExpandedNodes( pTreeId );
                return ( expandedNodes[this._getIdentity( pNode )] ) || false;
            },

            /**
             * <p>Called when the expansion state of the tree node changes.</p>
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @param {treeNodeAdapter.node} pNode The node that has been expanded or collapsed.
             * @param {boolean} pExpanded true if the node is expanded and false if it is collapsed.
             */
            setExpanded: function( pTreeId, pNode, pExpanded ) {
                var expandedNodes = this._getExpandedNodes( pTreeId );
                expandedNodes[this._getIdentity( pNode )] = pExpanded;
            },

            /**
             * Returns an array of each of the expanded node's id. Can be used to persist the expansion state.
             * See {@link treeView#getExpandedNodeIds}.
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @returns {Array}
             */
            getExpandedNodeIds: function( pTreeId ) {
                var n,
                    nodes = [],
                    expandedNodes = this._getExpandedNodes( pTreeId );

                for ( n in expandedNodes ) {
                    if ( expandedNodes.hasOwnProperty(n) && expandedNodes[n] === true ) {
                        nodes.push(n);
                    }
                }
                return nodes;
            },

            /**
             * Returns map of node id to expansion state. See {@link treeView#getExpandedState}.
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             */
            getExpandedState: function( pTreeId ) {
                var expandedNodes = this._getExpandedNodes( pTreeId );

                // return a copy
                return $.extend({}, expandedNodes );
            },

            /**
             * Return the view id for the given <code class="prettyprint">pTreeId</code>
             * and <code class="prettyprint">pNode</code>.
             * This is used by the treeView to map from nodes to DOM elements.
             * See also {@link treeNodeAdapter#setViewId}.
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @param {treeNodeAdapter.node} pNode The node to get the view id for.
             * @returns {string} The view id for this node that was assigned with {@link treeNodeAdapter#setViewId}.
             */
            getViewId: function( pTreeId, pNode ) {
                var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap;
                return nodeMap && nodeMap[this._getIdentity( pNode )];
            },

            /**
             * Set the view id for the given <code class="prettyprint">pTreeId</code>
             * and <code class="prettyprint">pNode</code>.
             * This is used by the treeView to map from nodes to DOM elements.
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @param {treeNodeAdapter.node} pNode The node to set the view id for.
             * @param {string} pViewId The view id to associate with the given node.
             */
            setViewId: function( pTreeId, pNode, pViewId ) {
                var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap;
                if ( !nodeMap ) {
                    nodeMap = {};
                    if ( ! this._state[pTreeId] ) {
                        this._state[pTreeId] = {};
                    }
                    this._state[pTreeId].nodeMap = nodeMap;
                }
                nodeMap[this._getIdentity( pNode )] = pViewId;
            },

            /**
             * Remove the view id mapping for node <code class="prettyprint">pNode</code>.
             * If the node is null then all previous view id mappings should be removed.
             * See also {@link treeNodeAdapter#setViewId}.
             *
             * @param {string} pTreeId This is a unique opaque identifier supplied by the treeView.
             * @param {treeNodeAdapter.node} [pNode] The node to clear the view id for.
             */
            clearViewId: function( pTreeId, pNode ) {
                var nodeMap = this._state[pTreeId] && this._state[pTreeId].nodeMap,
                    expandedNodes = this._state[pTreeId] && this._state[pTreeId].expandedNodes;

                if ( nodeMap ) {
                    if ( pNode ) {
                        delete nodeMap[this._getIdentity( pNode )];
                        if ( expandedNodes ) {
                            delete expandedNodes[this._getIdentity( pNode )];
                        }
                    } else {
                        this._state[pTreeId].nodeMap = {};
                        delete this._state[pTreeId].expandedNodes;
                    }
                }
            },

            _getExpandedNodes: function( treeId ) {
                var i,
                    expandedNodes = this._state[treeId] && this._state[treeId].expandedNodes;

                if ( !expandedNodes ) {
                    if ( ! this._state[treeId] ) {
                        this._state[treeId] = {};
                    }
                    expandedNodes = {};
                    this._state[treeId].expandedNodes = expandedNodes;
                    if ( initialExpandedNodeIds ) {
                        for ( i = 0; i < initialExpandedNodeIds.length; i++ ) {
                            expandedNodes[initialExpandedNodeIds[i]] = true;
                        }
                    }
                }
                return expandedNodes;
            }
        });
        if ( !adapter._getIdentity ) {
            adapter._getIdentity = $.isFunction( nodeIdentity ) ? nodeIdentity : function(node) { return node[nodeIdentity]; };
        }
    };

    /*
     * Draggable plugin so draggable can work with treeView
     */
if ( $.ui.draggable ) {
    $.ui.plugin.add( "draggable", "connectToTreeView", {
        start: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" ),
                o = inst.options,
                uiObj = $.extend( {}, ui, { item: inst.element } );

            // todo will this conflict with gridlyout???
            // install handler for ESCAPE key to cancel drag
            $( "body" ).on( "keydown.treeviewplug", function ( event ) {
                if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
                    inst.dropped = false; // allow revert to happen
                    inst.cancel();
                }
            } );

            inst.trees = [];
            $( o.connectToTreeView ).each( function () {
                var treeView = $.data( this, "apex-treeView" );
                if ( treeView && !treeView.options.disabled && treeView.options.dragAndDrop ) {
                    inst.trees.push( {
                        instance: treeView
                    } );
                    treeView._initPositions();
                    treeView._refreshPositions(); // make sure treeView drop information is up to date
                    treeView._trigger( "activate", event, uiObj );
                } else {
                    debug.warn( "Draggable connectToTreeView matches an element that is not a treeView, is disabled, or doesn't support drag and drop.");
                }

            } );

        },
        // If we are still over the treeView, we fake the stop event of the treeView
        // also responsible for deactivate if cancel or not over treeView
        stop: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" );

            // remove handler for ESCAPE key to cancel drag
            $( "body" ).off( ".treeviewplug" );

            $.each( inst.trees, function () {
                if ( this.instance.isOver && !this.invalid ) {

                    this.instance.isOver = false;

                    inst.cancelHelperRemoval = true; // Don't remove the helper in the draggable instance

                    // Trigger stop on the treeView
                    this.instance._mouseStop( event, true );
                    if ( !event.target ) {
                        // The drag has been canceled
                        this.instance._trigger( "deactivate", event, this.instance._uiHashDnD( this.instance ) );
                        // remove the temp drag component before cancel
                        this.instance.dragItems.parent().remove();
                        this.instance._cancel( event, true );
                    }
                } else {
                    this.instance._deactivate();
                    this.instance._trigger( "deactivate", event, this.instance._uiHashDnD( this.instance ) );
                    // if was was once over this treeView then must treat it as a cancel for proper cleanup and sending stop event
                    if ( this.instance.dragItems ) {
                        // remove the temp drag component before cancel
                        this.instance.dragItems.parent().remove();
                        this.instance._cancel( event, true );
                    }
                }

            } );

        },
        drag: function ( event, ui ) {
            var inst = $( this ).data( "ui-draggable" );

            $.each( inst.trees, function () {
                var intersecting = false;

                if ( this.invalid ) {
                    return;
                }

                // Copy over some variables to allow calling the treeView's native _intersectsWith
                this.instance.positionAbs = inst.positionAbs;
                this.instance.helperProportions = inst.helperProportions;
                this.instance.offset.click = inst.offset.click;

                if ( this.instance._intersectsWith( this.instance.containerCache ) ) {
                    intersecting = true;
                }

                if ( intersecting ) {
                    // If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
                    if ( !this.instance.isOver ) {

                        this.instance.isOver = true;
                        // Now we fake the start of dragging for the treeView instance, by making a temporary drag component
                        // Also set the helper so it doesn't create a new one
                        this.instance._makeTempDragItem();
                        this.instance.helper = ui.helper;
                        this.instance.helper.css( "position", "relative" ); // for proper scrollParent detection, it will get put back to absolute by _mouseStart

                        event.target = this.instance.dragItems.parent().children( SEL_ROW )[0];
                        if ( !this.instance._mouseCapture( event, true ) ) {
                            this.instance.isOver = false;
                            this.invalid = true;
                            return;
                        }

                        this.instance._trigger( "over", event, this.instance._uiHashDnD( this.instance ) );
                        this.instance._mouseStart( event, event, true );

                        // Because the browser event is way off the temp drag component, we modify a couple of variables to reflect the changes
                        this.instance.offset.click.top = inst.offset.click.top;
                        this.instance.offset.click.left = inst.offset.click.left;
                        this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                        this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

                        inst.dropped = this.instance.element; //draggable revert needs that
                        //hack so receive/update callbacks work (mostly)
                        inst.currentItem = inst.element;
                        this.instance.fromOutside = inst;

                    }

                    // Provided we did all the previous steps, we can fire the drag event of the treeView on every draggable drag
                    if ( this.instance.dragItems ) {
                        this.instance._mouseDrag( event );
                    }

                } else {
                    // If it doesn't intersect with the treeView, and it intersected before,
                    // we fake the drag stop of the treeView, but make sure it doesn't remove the helper by making it look like a canceled drag
                    if ( this.instance.isOver ) {

                        this.instance.isOver = false;

                        // The out event needs to be triggered independently
                        this.instance._trigger( "out", event, this.instance._uiHashDnD( this.instance ) );

                        event.target = null; // from the perspective of the treeView the drag was canceled
                        this.instance._mouseStop( event, true );

                        // cleanup the temp drag component that was created when first dragged over the treeView
                        // and any placeholder that may have been created
                        this.instance.dragItems.parent().remove();
                        if ( this.instance.placeholder ) {
                            this.instance._removePlaceholder();
                        }

                        inst.dropped = false; // draggable revert needs that
                    }

                }

            } );

        }
    } );

    /*
     * Draggable plugin that is a better cursor plugin
     * Use cursor2 in place of cursor because it makes sure the cursor is what it is set to
     * regardless of other css rules or what the mouse is over.
     * todo: this should stand on its own in a separate module currently here because treeView is used every where we need this
     */
    $.ui.plugin.add("draggable", "cursor2", {
        start: function() {
            var b$ = $("body"),
                inst = $( this ).data( "ui-draggable" ),
                o = inst.options;

            if ( o.cursor2 && o.cursor2 !== "auto" ) {
                inst.storedCursor = b$.css( "cursor" );
                b$.css("cursor", o.cursor2);
                inst.storedStylesheet = $( "<style>*{ cursor: " + o.cursor2 + " !important; }</style>" ).appendTo( b$ );
            }
        },
        stop: function() {
            var inst = $( this ).data( "ui-draggable" );

            if ( inst.storedCursor ) {
                $( "body" ).css( "cursor", inst.storedCursor );
                inst.storedStylesheet.remove();
            }
        }
    });
}

if ( apex.widget ) {

    /*
     * APEX native tree region integration
     * TODO consider moving this to its own file which would then be aggregated with this one again for use by tree region
     */
    var defaultTypeData = {
        "default": {
            operations: {
                canAdd: false,
                canDelete: false,
                canRename: false,
                canDrag: false
            }
        }
    };

    apex.widget.tree = {
        init: function( pTreeId, pStaticData, pHasIdentity, pOptions ) {
            var sel$,
                types = $.extend( true, {}, defaultTypeData ),
                tree$ = $("#" + util.escapeCSS( pTreeId ), apex.gPageContext$ ),
                selId = pOptions.initialSelectedNodeId,
                hasTooltip = pOptions.nodeHasTooltip;

            if ( pOptions.defaultIcon ) {
                types.default.icon = pOptions.defaultIcon;
            }
            pOptions = $.extend( {
                getNodeAdapter: function() {
                    return ( pOptions.makeNodeAdapter || $.apex.treeView.makeDefaultNodeAdapter )( pStaticData, types, pHasIdentity );
                },
                tooltip: hasTooltip ? {
                    show: apex.tooltipManager.defaultShowOption(),
                    content: function ( callback, node ) {
                        if (!node) {
                            return null;
                        }
                        return node.tooltip;
                    }
                } : null,
                navigation: true
            }, pOptions );

            tree$.treeView( pOptions );

            // for normal regions there should be a region static id but this is also used from websheets where a region doesn't apply
            if ( pOptions.regionStaticId ) {
                apex.region.create( pOptions.regionStaticId, {
                    type: "Tree",
                    widgetName: "treeView",
                    refresh: function() {
                        debug.warn("Refresh not supported.");
                    },
                    focus: function() {
                        tree$.treeView( "focus" );
                    },
                    widget: function() {
                        return tree$;
                    }
                } );
            }

            if ( selId ) {
                sel$ = tree$.treeView( "find", { depth:-1, findAll: false, match: function( node ) {
                    return node.id === selId;
                } });
                if ( sel$.length ) {
                    tree$.treeView( "setSelection", sel$ );
                }
            }
        },
        expand_all: function( pTreeId ) {
            $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ ).treeView( "expandAll" );
        },
        collapse_all: function( pTreeId ) {
            $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ ).treeView( "collapseAll" );
        },
        reset: function( pTreeId ) {
            var tree$ = $( "#"+util.escapeCSS( pTreeId ), apex.gPageContext$ );
            tree$.treeView( "collapseAll" ).treeView("expand", tree$.children().children("li").first() );
        }
    };
}

})( apex.util, apex.debug, apex.jQuery );
