/*!
 Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/**
 * @uiwidget recordView
 * @since 5.1
 * @extends {tableModelViewBase}
 *
 * @classdesc
 * <p>RecordView is a dynamically generated form for displaying or editing a record from an APEX data {@link model}.
 * It uses standard APEX column items to display and edit record fields.</p>
 *
 * <p>The markup expected by this widget is simply an empty <code class="prettyprint">&lt;div></code>.
 * The record view displays and optionally edits data stored in an APEX data {@link model}. If the recordView is editable
 * then the <code class="prettyprint">&lt;div></code> must be proceeded by a <code class="prettyprint">&lt;div></code>
 * with class <code class="prettyprint">u-vh</code> (to visually hide the contents) that contains each of the rendered
 * column items. Each column item needs to be wrapped in a <code class="prettyprint">&lt;div></code> with class
 * <code class="prettyprint">a-GV-columnItem</code>. See {@link grid} for an example of the markup.</p>
 *
 * <p>RecordView is designed to share the same column/field configuration and column items with a {@link grid} widget but it can
 * also be used standalone. What the grid widget calls column configuration recordView calls field configuration.</p>
 *
 * <h3 id="selection-section">Editing
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#editing-section"></a>
 * </h3>
 * <p>The record view can be editable or not editable. This is controlled by the {@link recordView#editable} option.
 * If not editable then no UI is provided to do any editing, however it will still respond to any changes to the model data.
 * The editable property can be changed after the record view is created provided the necessary column items are
 * available on the page. See the {@link model} documentation for how it can be used to provide fine grained control over
 * what kinds of edits are allowed. The field definition can specify fields that are read-only.
 * For a field to be editable the recordView must be editable, the row must be editable (as determined by the model),
 * the field configuration must include property <code class="prettyprint">elementId</code> and property
 * <code class="prettyprint">readonly</code> must not be true and the model field metadata must not have a checksum
 * (<code class="prettyprint">ck</code>) property.</p>
 *
 * <p>Column Edit Items:<br>
 * When the record view is editable and a field can be edited, it is a column item that does the editing. Column items are
 * essentially the same as page items except they edit a column/field value rather than a page item. A grid and
 * recordView on the same page can share the same column items as long as the two widgets are not visible or actively
 * in edit mode at the same time.</p>
 *
 * <h3 id="actions-section">Actions
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#actions-section"></a>
 * </h3>
 * <p>The recordView uses {@link actions} to implement some functionality. This section lists each action along with a
 * brief description. The actions are exposed through toolbar controls and menus.</p>
 * <p>Use the {@link recordView#getActions} method to access the {@link actions} context for the recordView.</p>
 * <table>
 * <caption>Pre-defined actions used by the recordView widget</caption>
 * <thead>
 * <tr>
 * <th>Name</th>
 * <th>Type</th>
 * <th>Description</th>
 * </tr>
 * </thead>
 * </tbody>
 * <tr>
 * <td>delete-record</td>
 * <td>Action</td>
 * <td>Deletes the current record.</td>
 * </tr>
 * <tr>
 * <td>duplicate-record</td>
 * <td>Action</td>
 * <td>Duplicates the current record. The new duplicated record becomes current.</td>
 * </tr>
 * <tr>
 * <td>insert-record</td>
 * <td>Action</td>
 * <td>Inserts a new record after the current one. The new inserted record becomes current.</td>
 * </tr>
 * <tr>
 * <td>refresh-record</td>
 * <td>Action</td>
 * <td>Refreshes the current record with data from the server.</td>
 * </tr>
 * <tr>
 * <td>revert-record</td>
 * <td>Action</td>
 * <td>Reverts any changes made to the current record.</td>
 * </tr>
 * <tr>
 * <td>next-record</td>
 * <td>Action</td>
 * <td>Makes the next record the current record.</td>
 * </tr>
 * <tr>
 * <td>previous-record</td>
 * <td>Action</td>
 * <td>Makes the previous record the current record.</td>
 * </tr>
 * <tr>
 * <td>exclude-null-values</td>
 * <td>Toggle</td>
 * <td>Determines if the form shows fields with a null value.</td>
 * </tr>
 * <tr>
 * <td>exclude-hidden</td>
 * <td>Toggle</td>
 * <td>Determines if the form shows fields that have been hidden by some other view that shares the same field
 * definitions.</td>
 * </tr>
 * </tbody>
 * </table>
 *
 * @desc Creates a recordView widget.
 *
 * @param {Object} options A map of option-value pairs to set on the widget.
 *
 * @example <caption>This example creates a very simple non-editable recordView with just two fields; Id and Name.
 * Only the required options are given; all others will have their default value.
 * The element with id myRecordForm is an empty div.</caption>
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
 * $( "#myRecordForm" ).recordView( {
 *     modelName: "myModel",
 *     fields: [  fieldDefinitions ]
 * } );
 */
 /*
 * todo:
 * expand/collapse group/all
 * field alignment??? (IR single row view always left aligned)
 * focus issue going in/out of edit mode
 * when all fields in a group are hidden need to hide the group?
 * when menu has no unhidden items hide the menu button. Do this in toolbar widget?
 * RTL
 * this should have a stickyHeader for the toolbar
 *
 * This widget requires some functional CSS.
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/widget.tableModelViewBase.js
 *    apex/util.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/model.js
 *    apex/item.js
 *    apex/widget.collapsible.js
 *    apex/widget.toolbar.js
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 */
/*global apex,$v*/
(function ( util, model, debug, lang, item, actions, $ ) {
    "use strict";

    var C_RV = "a-RV",
        C_RV_TOOLBAR = "a-RV-toolbar",
        C_RV_WRAP_SCROLL = "a-RV-w-scroll",
        C_RV_BODY = "a-RV-body",
        C_RV_EXCLUDE_HIDDEN = "a-RV--excludeHidden",
        C_RV_EXCLUDE_NULL = "a-RV--excludeNull",
        C_FORM = "u-Form",
        C_FORM_GROUP = "u-Form-groupHeading",
        C_FORM_FIELD_W = "u-Form-fieldContainer",
        SEL_FORM_FIELD_W = "." + C_FORM_FIELD_W,
        SEL_FORM_FIELD_W_ACTIVE = SEL_FORM_FIELD_W + ".is-active",
        C_FORM_LABEL_W = "u-Form-labelContainer",
        C_FORM_LABEL = "u-Form-label",
        SEL_FORM_LABEL = "." + C_FORM_LABEL,
        C_FORM_CTRL_W = "u-Form-inputContainer",
        SEL_FORM_CTRL_W = "." + C_FORM_CTRL_W,
        C_FORM_ERROR = "t-Form-error",
        SEL_FORM_ERROR = "." + C_FORM_ERROR,
        SEL_ALERT = ".t-Alert",
        C_FIELD_HIDDEN = "a-RV-field--hidden",
        C_FIELD_NULL = "a-RV-field--null",
        C_FOCUSED = "is-focused",
        C_DISABLED = "is-disabled",
        C_ACTIVE = "is-active",
        SEL_ACTIVE = "." + C_ACTIVE,
        C_REQUIRED = "is-required",
        C_READONLY = "is-readonly",
        C_ERROR = "is-error",
        C_WARN = "is-warning",
        C_UI_STATES = "is-error is-warning is-readonly",
        C_RTL = "u-RTL",
        A_LBL_BY = "aria-labelledby",
        SEL_TABBABLE = ":tabbable",
        A_ITEM_HELP = "data-itemhelp",
        SEL_VISIBLE = ":visible";

    var ENABLE = "enable",
        DISABLE = "disable",
        OPTION = "option",
        SHOW = "show",
        HIDE = "hide",
        SHAPE_RECORD = "record",
        SHAPE_TABLE = "table",
        SHAPE_TREE = "tree",
        EVENT_MODE_CHANGE = "modeChange",
        EVENT_RECORD_CHANGE = "recordChange",
        // actions
        ACT_DELETE = "delete-record",
        ACT_DUPLICATE = "duplicate-record",
        ACT_NEXT = "next-record",
        ACT_PREV = "previous-record",
        ACT_EXCLUDE_NULL = "exclude-null-values",
        ACT_EXCLUDE_HIDDEN = "exclude-hidden",
        ACT_INSERT = "insert-record",
        ACT_REFRESH = "refresh-record",
        ACT_REVERT = "revert-record";

    var keys = $.ui.keyCode;

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

    var defaultToolbar = [
        {
            align: "start",
            controls: [
                {
                    type: "MENU",
                    labelKey: "APEX.RV.SETTINGS_MENU",
                    iconOnly: true,
                    icon: "icon-gear",
                    menu: {
                        items: [
                            {
                                type: "toggle",
                                action: ACT_EXCLUDE_NULL
                            },
                            {
                                type: "toggle",
                                action: ACT_EXCLUDE_HIDDEN
                            }
                        ]
                    }
                }
            ]
        },
        {
            align: "end",
            controls: [
                {
                    type: "STATIC",
                    id: "status",
                    label: ""
                },
                {
                    type: "BUTTON",
                    iconOnly: true,
                    action: ACT_PREV
                },
                {
                    type: "STATIC",
                    id: "recordNumber",
                    label: ""
                },
                {
                    type: "BUTTON",
                    iconOnly: true,
                    action: ACT_NEXT
                }
            ]
        }
    ];

    function effectiveGroupName( col ) {
        var group = col.groupName || null;
        if ( group && col.useGroupFor && col.useGroupFor.indexOf( "srv" ) < 0 ) {
            group = null;
        }
        return group;
    }

    $.widget( "apex.recordView", $.apex.tableModelViewBase,
        /**
         * @lends recordView.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "recordview",
        options: {
            /**
             * <p>The prefix to use when generating ids. To avoid duplicate element ids either
             * give the widget element an <code class="prettyprint">id</code> attribute or specify this property.</p>
             *
             * @memberof recordView
             * @instance
             * @type {string}
             * @default element id or "rv"
             * @example "r1"
             * @example "r1"
             */
            idPrefix: null,
            /**
             * <p>Actions context to use. If null or not provided a new context is created.
             * Specifying a context allows this widget to be contained within another one and share the same context.
             * See {@link actions} for information on what an actions context is and {@link apex.actions.createContext}
             * for how to create one.</p>
             *
             * @memberof recordView
             * @instance
             * @type {actions}
             * @default null
             * @example myContext
             * @example myContext
             */
            actionsContext: null,
            /**
             * <p>Zero based index of record in model to display/edit in this recordView.</p>
             *
             * @memberof recordView
             * @instance
             * @type {interger}
             * @default 0
             * @example 22
             * @example 22
             */
            recordOffset: 0,
            /**
             * <p>only for tree shape models. This is the parent of the record being edited and
             * recordOffset is the offset within the parents children or -1 for root</p>
             *
             * @ignore
             * @memberof recordView
             * @instance
             * @type {interger}
             */
            recordParent: null,
            /**
             * <p>Text to display when the value is null or empty string.</p>
             *
             * @memberof recordView
             * @instance
             * @type {string}
             * @default "-"
             * @example "- unknown -"
             * @example "- unknown -"
             */
            showNullAs: "-", // todo consider moving this to base class
            /**
             * <p>Defines the fields in the recordView form. These fields are also fields in the model.
             * The value is an array of exactly one object that maps the field name to a field definition object.
             * The properties are the field names. The property value is a field definition.
             * Wrapping the object in an array simply keeps the widget from making a copy of the fields so that
             * the same definition can be shared.</p>
             *
             * <p>The same structure can be shared with the view {@link model} and a {@link grid} widget. This
             * option is required.</p>
             *
             * @memberof recordView
             * @instance
             * @type {object[]}
             * @property {object} * The property is the field name. By convention
             *   it is the uppercase database column name. The value is an object that defines the field.
             *   All properties are optional unless specified otherwise.
             * @property {string} *.elementId Column item name (id of DOM element) used to edit this field or null if not editable.
             * @property {string} *.label The label text of the field. Does not allow markup. At least one of
             *   label or <code class="prettyprint">heading</code> should be specified.
             * @property {string} *.heading The text of the field header.
             *   This is used if the <code class="prettyprint">label</code> is not given but markup is escaped.
             * @property {string} *.fieldCssClasses Extra CSS classes to apply to the field
             * @property {integer} *.fieldColSpan Integer between 1 and 12 specifying how many layout grid columns the
             *   field will span. This can be used to put two (or more) fields side by side.
             * @property {string} *.cellTemplate An HTML template that defines the field content.
             *   See {@link apex.util.applyTemplate} for template syntax.
             *   The substitutions are field names from this field configuration or fields from any parent models and
             *   they are replaced with data values from the current record of the model.
             * @property {boolean} *.escape If false the column value may contain trusted markup otherwise the column
             *   value is escaped.
             * @property {number} *.seq Determines the order of the field among all the others. Lower numbers come first.
             * @property {string} *.groupName Name of field group. See {@link recordView#fieldGroups}
             *   and <code class="prettyprint">useGroupFor</code>.
             * @property {string} *.useGroupFor If not present or if the string contains "srv" then the group given
             *   in <code class="prettyprint">groupName</code> will be used. This allows the same field definition
             *   to be shared with multiple kinds of views so that the <code class="prettyprint">groupName</code>
             *   is used by other views but not this recordView.
             * @property {boolean} *.canHide Determines if the user is allowed to show or hide the field. If true
             *   the user can choose to hide or show the field. If false the user cannot change the hidden state.
             * @property {boolean} *.hidden If true the field is hidden otherwise it is shown.
             * @property {boolean} *.readonly If true the field cannot be edited.
             *   Note: The {@link model} has additional criteria for when a field value can be edited.
             * @property {string} *.linkText Only for fields that contain a link. This is the anchor content.
             *   Allows markup. Allows substitutions just like the <code class="prettyprint">cellTemplate</code>
             *   property. If not given the rendered display value of this field is used as the content.
             *   If the display value of the field is empty then the link URL is used.
             *   To display a link, at least one of <code class="prettyprint">linkTargetColumn</code> or the
             *   field metadata <code class="prettyprint">url</code> property must must be given.
             *   Note: if the field is editable it is always the data value of the field that is edited.
             *   So if you want to edit the link text it is best to omit linkText and use
             *   <code class="prettyprint">linkTargetColumn</code>.
             * @property {string} *.linkTargetColumn The name of the field that contains the anchor
             *   <code class="prettyprint">href</code>. If not given the <code class="prettyprint">href</code>
             *   comes from the field metadata <code class="prettyprint">url</code> property. If there is
             *   no <code class="prettyprint">url</code> property then this field is not a link.
             * @property {string} *.linkAttributes Only for fields that contain a link. Additional anchor attributes.
             *   Allows substitutions just like the <code class="prettyprint">cellTemplate</code> property.
             * @property {boolean} *.isRequired If true this field is required when editing.
             *   This should correspond with the required setting of the underlying editable column item.
             * @property {string} *.helpid Help id for the field.
             *   If present there will be a help icon button and keyboard shortcut (Alt+F1) to access help text for the field.
             * @property {boolean} *.virtual If true the field is completely ignored by the recordView widget.
             * @property {string} *.property Do not specify this property. It is added automatically and the value is
             *   the field name.
             * @example
             *  [ {
             *      NAME: {
             *          label: "Name",
             *          seq: 1,
             *          hidden: false,
             *          isRequired: true,
             *          escape: true
             *      },
             *      ....
             *  } ]
             */
            fields: null,
            /**
             * <p>Defines headings that fields are grouped together under. Fields specify which group they belong
             * under with the {@link recordView#fields} <code class="prettyprint">groupName</code> property.
             * A recordView can have one level of headings.</p>
             *
             * @memberof recordView
             * @instance
             * @type {Object}
             * @property {Object} * The property name is the field group name. This name is referenced from
             *     a {@link recordView#fields} <code class="prettyprint">groupName</code> property.
             *     The property values are field group definitions.
             * @property {string} *.heading The text of the field group header. The heading is only used
             *   if <code class="prettyprint">label</code> is not given. Markup is escaped.
             * @property {string} *.label Same as <code class="prettyprint">heading</code> but markup not allowed.
             *   The label is used in preference to the heading.
             * @example <caption>This example shows initializing the recordView with "First" name and "Last" name fields
             * that are grouped under heading "Name".</caption>
             * $( ".selector" ).recordView( {
             *     fields[{
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
             *     fieldGroups: {
             *         NAME: {
             *             label: "Name"
             *         },
             *         ...
             *     }
             * } );
             */
            fieldGroups: null,
            /**
             * <p>Only applies if {@link recordView#editable} is true. If true, the recordView will start out in
             * edit mode and double click, Enter, and Escape will not change the mode.
             * Calling method {@link recordView#setEditMode} can still change the edit mode.</p>
             *
             * @memberof recordView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            alwaysEdit: false,
            /**
             * <p>If true (and the recordView is editable) deleted records/rows will skipped over; the next
             * non-deleted record is shown. Otherwise they are visible but have a visual indication that they are deleted
             * this has no effect if the model deletes records right away.</p>
             *
             * @memberof recordView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            skipDeletedRecords: false, // todo should this be a end user option to show deleted records?
            /**
             * <p>Toolbar options. A default toolbar is provided. If null then there will be no toolbar.</p>
             *
             * @memberof recordView
             * @instance
             * @type {object}
             */
            // todo improve toolbar option doc once toolbar widget is documented
            toolbar: defaultToolbar, // toolbar options or null for no toolbar
            /**
             * <p>If true the user will have the option to exclude fields that have a null value.</p>
             *
             * @memberof recordView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            showExcludeNullValues: true,
            /**
             * <p>If true the user will have the option to exclude fields that are hidden.</p>
             *
             * @memberof recordView
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            showExcludeHiddenFields: true,
            /**
             * <p>CSS classes to add to the form wrapper divs.</p>
             *
             * @memberof recordView
             * @instance
             * @type {string}
             * @default true
             * @example "u-Form--labelsAbove u-Form--stretchInputs"
             * @example "u-Form--labelsAbove u-Form--stretchInputs"
             */
            formCssClasses: null,
            /**
             * <p>Controls how form field labels are aligned. One of "start", "end", "center", "left", "right".</p>
             *
             * @memberof recordView
             * @instance
             * @type {string}
             * @default "end"
             * @example "start"
             * @example "start"
             */
            labelAlignment: "end",

            /* some options from base class don't apply */
            /**
             * @member footer
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member hideDeletedRows
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member highlights
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member pagination
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member rowsPerPage
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member selectionStatusMessageKey
             * @memberOf recordView
             * @instance
             * @ignore
             */
            /**
             * @member stickyFooter
             * @memberOf recordView
             * @instance
             * @ignore
             */

            //
            // events:
            //
            /**
             * <p>Triggered when the edit mode changes.</p>
             *
             * @event modechange
             * @memberof recordView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {boolean} data.editMode The new edit mode.
             *
             * @example <caption>Initialize the recordView with the <code class="prettyprint">modeChange</code> callback specified:</caption>
             * $( ".selector" ).recordView({
             *     modeChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">recordviewmodechange</code> event:</caption>
             * $( ".selector" ).on( "recordviewmodechange", function( event, data ) {} );
             */
            modeChange: null,

            /**
             * Triggered when the current record changes.
             *
             * @event recordchange
             * @memberof recordView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {number} data.recordOffset The zero based model offset of the record.
             * @property {number} data.recordId The id of the record.
             *
             * @example <caption>Initialize the recordView with the <code class="prettyprint">recordChange</code> callback specified:</caption>
             * $( ".selector" ).recordView({
             *     recordChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">recordviewrecordchange</code> event:</caption>
             * $( ".selector" ).on( "recordviewrecordchange", function( event, data ) {} );
             */
            recordChange: null      // This event fires when the current record changes
                                    // function( event, { recordOffset: <n>, recordId: <id> }
        },

        /**
         * @method gotoPage
         * @memberOf recordView
         * @instance
         * @ignore
         */
        /**
         * @method firstPage
         * @memberOf recordView
         * @instance
         * @ignore
         */
        /**
         * @method previousPage
         * @memberOf recordView
         * @instance
         * @ignore
         */
        /**
         * @method nextPage
         * @memberOf recordView
         * @instance
         * @ignore
         */
        /**
         * @method lastPage
         * @memberOf recordView
         * @instance
         * @ignore
         */
        /**
         * @method loadMore
         * @memberOf recordView
         * @instance
         * @ignore
         */

        _create: function () {
            var self = this,
                o = this.options,
                ctrl$ = this.element;

            ctrl$.addClass( C_RV );

            // This widget inherits from tableModelViewBase but only uses a small part of the functionality
            // for example there is no pagination.
            this._super(); // init table model view base
            // so remove the public methods that don't apply
            delete this.firstPage;
            delete this.previousPage;
            delete this.nextPage;
            delete this.lastPage;
            delete this.loadMore;
            delete this.gotoPage;

            this.editMode = false;
            this.fields = null;             // sorted array of field metadata from options.fields
            this.excludeNullValues = false; // todo these should be options
            this.excludeHiddenFields = false; // todo " "
            this.lastFocused = null;        // last field that had focus
            this.lastField = null;          // lastField for purpose of editing
            this.toolbar$ = null;
            // these keep track of the current record being viewed/edited
            this.currentRecord = null;
            this.currentRecordId = null;

            // create actions
            if ( o.actionsContext ) {
                this.actions = o.actionsContext;
            } else {
                this.actions = actions.createContext( "recordView", ctrl$[0]);
            }
            // make sure these actions don't already exist
            this.actions.remove( [ACT_EXCLUDE_NULL, ACT_EXCLUDE_HIDDEN, ACT_NEXT, ACT_PREV, ACT_INSERT,
                ACT_REFRESH, ACT_REVERT, ACT_DELETE, ACT_DUPLICATE] );
            this.actions.add( [
                {
                    name: ACT_EXCLUDE_NULL,
                    labelKey: "APEX.RV.EXCLUDE_NULL",
                    get: function() {
                        return self.excludeNullValues;
                    },
                    set: function(v) {
                        if ( o.showExcludeNullValues ) {
                            self.excludeNullValues = v;
                            ctrl$.toggleClass( C_RV_EXCLUDE_NULL, v );
                        }
                    }
                },
                {
                    name: ACT_EXCLUDE_HIDDEN,
                    labelKey: "APEX.RV.EXCLUDE_HIDDEN",
                    get: function() {
                        return self.excludeHiddenFields;
                    },
                    set: function(v) {
                        if ( o.showExcludeHiddenFields ) {
                            self.excludeHiddenFields = v;
                            ctrl$.toggleClass( C_RV_EXCLUDE_HIDDEN, v );
                        }
                    }
                },
                {
                    name: ACT_NEXT,
                    labelKey: "APEX.RV.NEXT_RECORD",
                    shortcut: "Alt+Page Down",
                    icon: "icon-next",
                    action: function() {
                        var total, rec;

                        if ( self.modelShape === SHAPE_TREE ) {
                            rec = self._nextTreeRecord();
                            if ( !rec ) {
                                return;
                            }
                            o.recordParent = rec.parent;
                            o.recordOffset = rec.offset;
                        } else {
                            // xxx todo problem is that when deleted records are subtracted from total then can't get to last N records!!!
                            total = self.model.getTotalRecords();
                            if ( total < 0 || o.recordOffset + 1 < total ) {
                                o.recordOffset += 1;
                            } else {
                                return;
                            }
                        }
                        self.direction = 1;
                        self.refresh( false );
                    }
                },
                {
                    name: ACT_PREV,
                    labelKey: "APEX.RV.PREV_RECORD",
                    shortcut: "Alt+Page Up",
                    icon: "icon-prev",
                    action: function() {
                        var rec;

                        if ( self.modelShape === SHAPE_TREE ) {
                            rec = self._previousTreeRecord();
                            if ( !rec ) {
                                return;
                            }
                            o.recordParent = rec.parent;
                            o.recordOffset = rec.offset;
                        } else {
                            if ( o.recordOffset > 0 ) {
                                o.recordOffset -= 1;
                            } else {
                                return;
                            }
                        }
                        self.direction = -1;
                        self.refresh( false );
                    }
                },
                // todo expand/collapse all groups
                {
                    name: ACT_INSERT,
                    labelKey: "APEX.RV.INSERT",
                    action: function() {
                        if ( o.editable ) {
                            self.model.insertNewRecord( self.modelShape === SHAPE_TREE ? o.recordParent : null, self.getRecord() );
                            self.actions.invoke( ACT_NEXT );
                            if ( !self.editMode ) {
                                self.setEditMode( true );
                            }
                            self.focus();
                            return true; // focus should have been set to first field
                        }
                    }
                },
                {
                    name: ACT_REFRESH,
                    labelKey: "APEX.RV.REFRESH",
                    action: function() {
                        if ( o.editable ) {
                            self.model.fetchRecords( [self.getRecord()] );
                        }
                    }
                },
                {
                    name: ACT_REVERT,
                    labelKey: "APEX.RV.REVERT",
                    action: function() {
                        if ( o.editable ) {
                            self.model.revertRecords( [self.getRecord()] );
                        }
                    }
                },
                {
                    name: ACT_DELETE,
                    labelKey: "APEX.RV.DELETE",
                    action: function() {
                        if ( o.editable ) {
                            self.model.deleteRecords( [self.getRecord()] );
                        }
                    }
                },
                {
                    name: ACT_DUPLICATE,
                    labelKey: "APEX.RV.DUPLICATE",
                    action: function() {
                        if ( o.editable ) {
                            var record = self.getRecord();
                            self.model.copyRecords( [record], null, record );
                            self.actions.invoke( ACT_NEXT );
                            if ( !self.editMode ) {
                                self.setEditMode( true );
                            }
                            self.focus();
                            return true; // focus should be set to first field
                        }
                    }
                }
            ] );

            this._updateMenuActions();

            // get the model
            this._initModel( o.modelName );

            this._on( this._eventHandlers );

            this.direction = 1;
            this.refresh();

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
            dblclick: function( event ) {
                var o = this.options,
                    field$ = $( event.target ).closest( SEL_FORM_FIELD_W );
                if ( field$.length && !o.alwaysEdit && o.editable && !this.editMode ) {
                    event.preventDefault();
                    this.setEditMode( true );
                }
            },
            click: function( event ) {
                var field$,
                    label$ = $( event.target ).closest( SEL_FORM_LABEL );
                if ( label$.length ) {
                    field$ = label$.closest( SEL_FORM_FIELD_W );
                    field$.find( SEL_TABBABLE ).first().focus();
                }
            },
            keydown: function( event ) {
                var field$, helpElement$, itemId,
                    o = this.options,
                    kc = event.which;

                if ( kc === keys.ENTER ) {
                    // ignore when target is an anchor or button
                    if ( $( event.target ).closest( "a,button" ).length > 0 ) {
                        return;
                    }
                    field$ = $( event.target ).closest( SEL_FORM_FIELD_W );
                    if ( field$.length && !o.alwaysEdit && o.editable && !this.editMode ) {
                        event.preventDefault();
                        this.setEditMode( true );
                    }
                } else if ( kc === 113 ) { // F2
                    field$ = $( event.target ).closest( SEL_FORM_FIELD_W );
                    if ( field$.length && !o.alwaysEdit && o.editable && !this.editMode ) {
                        event.preventDefault();
                        this.setEditMode( true );
                    }
                } else if ( kc === keys.ESCAPE ) {
                    if ( !o.alwaysEdit && o.editable && this.editMode ) {
                        // move focus so that the change event happens
                        $( event.target ).closest( SEL_FORM_CTRL_W ).focus();
                        this.setEditMode( false );
                        // if we handle the escape key don't let anyone else. this for example keeps dialogs from closing
                        event.stopPropagation();
                    }
                } else if ( kc === 112  && event.altKey ) { // Alt+F1
                    // the keyboard support in apex.theme module isn't quite right.
                    // This widget knows best how to find the help id
                    field$ = $( event.target ).closest( SEL_FORM_FIELD_W );
                    helpElement$ = field$.find( ".js-itemHelp" );
                    if ( helpElement$.length ) {
                        itemId = helpElement$.attr( A_ITEM_HELP );
                        if ( itemId ) {
                            apex.theme.popupFieldHelp( itemId, $v( "pInstance" ) );
                            return false;
                        }
                    }
                }
            },
            focusin: function( event ) {
                var prevActive$, field$,
                    self = this,
                    target$ = $( event.target );

                function clearDeactivate() {
                    if ( self.deactivateDelayTimer ) {
                        clearTimeout( self.deactivateDelayTimer );
                        self.deactivateDelayTimer = null;
                    }
                }

                field$ = target$.closest( SEL_FORM_FIELD_W );
                if ( field$.length === 0 ) {
                    this.lastField = null;
                    return;
                }
                field$.addClass( C_FOCUSED );
                this.lastFocused = field$[0];
                if ( field$[0] === this.lastField ) {
                    clearDeactivate();
                    return;
                }
                this.lastField = field$[0];
                if ( this.editMode ) {
                    clearDeactivate();
                    prevActive$ = this.element.find( SEL_ACTIVE );
                    if ( prevActive$.length ) {
                        this._deactivateField( prevActive$ );
                    }
                    this._activateField( field$ );
                }
            },
            focusout: function( event ) {
                var self = this,
                    field$ = $( event.target ).closest( SEL_FORM_FIELD_W );

                if ( field$.length === 0 ) {
                    return;
                }
                field$.removeClass( C_FOCUSED );
                if ( this.editMode ) {
                    this.deactivateDelayTimer = setTimeout( function() {
                        self.lastField = null;
                        self._deactivateField( field$ );
                        self.deactivateDelayTimer = null;
                    }, 10);
                }
            }
        },

        _destroy: function() {
            this.element.removeClass( C_RV + " " + C_DISABLED + " " + C_RTL + " " + C_RV_EXCLUDE_HIDDEN + " " + C_RV_EXCLUDE_NULL )
                .empty();

            // disconnect from the model
            this._initModel( null ); // this will cleanup change listener
        },

        _setOption: function( key, value ) {
            if ( key === "editable" && !value && this.editMode ) {
                // if changing from editable to not editable make sure to leave edit mode
                this.setEditMode( false );
            }

            this._super( key, value );

            if ( key === "disabled" ) {
                this.element.toggleClass( C_DISABLED, value );
                // xxx more to do???
                if ( value ) {
                    // when enabling do this just in case it was resized while disabled
                    this.resize();
                }
            } else if ( key === "showExcludeNullValues" || key === "showExcludeHiddenFields" ) {
                this._updateMenuActions();
            } else if ( key === "recordOffset" || key === "recordParent" ) {
                this.refresh();
            } else if ( key === "modelName" ) {
                // leave edit mode if the model changes
                if ( this.editMode ) {
                    this.setEditMode( false );
                }
                this._initModel( value );
                this.refresh();
            } else if ( key === "editable" || key === "alwaysEdit" ||
                        key === "toolbar" || key === "formCssClasses" || key === "labelAlignment" ) {
                this._refreshView();
            }

        },

        /**
         * <p>Returns the actions context for this recordView instance.
         * See {@link actions} for details on how to use the actions context.</p>
         * @return {actions} The actions context for this instance.
         *
         * @example <caption>This example gets the action context and invokes the "next-record" action.</caption>
         * var actions = $( ".selector" ).recordView( "getActions" );
         * actions.invoke( "next-record" );
         * @example <caption>To get a list of all actions from the browser JavaScript console.</caption>
         * console.log( JSON.stringify( $( ".selector" ).recordView( "getActions" ).list(), null, 4 ) );
         */
        getActions: function() {
            return this.actions;
        },

        /**
         * Returns the toolbar widget element.
         *
         * @return {jQuery} jQuery object of the recordView toolbar or null if there is no toolbar.
         */
        // todo improve doc once toolbar widget is documented
        getToolbar: function() {
            return this.toolbar$;
        },

        /**
         * Refreshes the recordView with data from the model.
         * This method is rarely needed because it is called automatically when the model changes,
         * widget options change, or when the record changes.
         *
         * @param {boolean} [pFocus] If true put focus in the recordView.
         */
        refresh: function( pFocus ) {
            var field$,
                self = this,
                o = this.options,
                ctrl$ = this.element;

            // this offsetParent method of checking visibility is OK because recordView widget should never be position fixed
            if ( ctrl$[0].offsetParent === null ) {
                // RecordView is invisible so don't bother rendering anything expect a resize or refresh later
                this.pendingRefresh = true;
                return;
            }
            this.pendingRefresh = false;

            field$ = ctrl$.find( SEL_FORM_FIELD_W_ACTIVE );
            if ( field$.length ) {
                this._deactivateField( field$ );
            }
            if ( !this.fields ) {
                this._initView();
            }
            if ( !this.editMode && o.alwaysEdit ) {
                this.setEditMode( true );
            }

            this._updateRecord( null, null, function() {
                if ( pFocus ) {
                    // xxx should maintain the current focus if any
                    self.focus();
                }
            });
        },

        /**
         * <p>Give focus to the recordView. Focus is given to the first field.</p>
         * @example <caption>Focus the recordView.</caption>
         * $( ".selector" ).recordView( "focus" );
         */
        focus: function() {
            this.lastField = null; // so even if the first field already has focus it will be activated if needed
            this.body$.find( SEL_TABBABLE ).first().focus();
        },

        /**
         * <p>Put focus in the field given by <code class="prettyprint">pRecordId</code> and
         * <code class="prettyprint">pField</code>. This is used to focus records and fields that have
         * errors. This will change the current record as needed to focus the field. The record must be in the model.
         * If <code class="prettyprint">pField</code> is null then the first field is focused.</p>
         *
         * @param {String} pRecordId The record id of the record to go to.
         * @param {String} [pField] Name of the field to go to.
         * @example <caption>Focus the NAME field of the record with id "0100091".</caption>
         * $( ".selector" ).recordView( "gotoField", "0100091", "NAME" );
         */
        gotoField: function( pRecordId, pField ) {
            var i, record, field, column, value,
                o = this.options,
                field$ = null;

            record = this.model.getRecord( pRecordId );
            if ( !record ) {
                // if the record is not in the model then can' go to it
                debug.warn( "Warning record not found " + pRecordId );
                return;
            }
            if ( pRecordId !== this.currentRecordId ) {
                // todo handle tree shape
                o.recordOffset = this.model.indexOf( record );
                this.refresh();
            }

            if ( pField ) {
                column = o.fields[0][pField];
                if ( !column ) {
                    debug.warn( "Warning column not found " + pField );
                } else {
                    // make sure column is shown
                    if ( column.hidden && column.canHide && this.excludeHiddenFields ) {
                        this.actions.set( ACT_EXCLUDE_HIDDEN, false );
                    }
                    value = this.model.getValue( record, pField );
                    if ( ( value === null || value === "" ) && this.excludeNullValues ) {
                        this.actions.set( ACT_EXCLUDE_NULL, false );
                    }

                    for ( i = 0; i < this.fields.length; i++) {
                        field = this.fields[i];
                        // don't look for fields that are virtual or can never be shown
                        if ( field.virtual || (!field.canHide && field.hidden ) ) {
                            continue;
                        }
                        if ( field.property === pField ) {
                            field$ = this.element.find( "[data-idx='" + i + "']" );
                            break;
                        }
                    }
                    if ( i >= this.fields.length ) {
                        debug.warn( "Warning column is hidden " + pField );
                    }
                }
            }

            if ( !field$ ) {
                this.focus();
            } else {
                this.lastField = null; // so even if the field already has focus it will be activated if needed
                field$.find( SEL_TABBABLE ).first().focus();
            }
        },

        /**
         * Let the recordView know that field metadata has changed so that the next time it is refreshed all the fields
         * will be rendered. Call this method after any {@link recordView#fields} metadata has changed external to this widget.
         * Refresh must be called after this but typically this happens due to the {@link model#event:refresh}
         * notification.
         */
        refreshFields: function() {
            this.fields = null; // clear out existing field configuration so that refresh will re init the view
        },

        /**
         * Given a pFieldName (field/column name) return the jQuery object for the element that wraps the
         * label and the field.
         *
         * @param pFieldName field/column name
         * @return {*} jQuery object
         */
        fieldElement: function( pFieldName ) {
            if ( !this.mapFieldToLabelId || !this.mapFieldToLabelId[ pFieldName ] ) {
                return $();
            }
            return $( "#" + this.mapFieldToLabelId[ pFieldName ] ).closest( SEL_FORM_FIELD_W );
        },

        /**
         * Determine if recordView is in edit mode. See also {@link recordView#setEditMode}
         *
         * @return {boolean} true if in edit mode and false otherwise.
         * @example <caption>This example logs a message if the recordView is in edit mode.</caption>
         * if ( $( ".selector" ).recordView( "inEditMode" ) ) {
         *     console.log("In edit mode");
         * }
         */
        inEditMode: function() {
            return this.editMode;
        },

        /**
         * Set the current edit mode. Should only be used if the recordView model is editable.
         * Triggers {@link recordView#event:modechange} event.
         *
         * @param pEditMode {boolean} If true enter edit mode if false enter display-only mode.
         * @example <caption>This example enters edit mode.</caption>
         * $( ".selector" ).recordView( "setEditMode", true ) );
         */
        setEditMode: function( pEditMode ) {
            var changed, field$, prevEditMode,
                ctrl$ = this.element,
                self = this,
                CHANGE_EVENT = "change.rvedit";

            if ( !this.scrollWrap$ ) {
                return; // not yet initialized
            }
            if ( this.options.editable ) {
                pEditMode = !!pEditMode;
                prevEditMode = this.editMode;
                changed = pEditMode !== prevEditMode;

                if ( changed ) {
                    field$ = $( this.lastFocused );

                    // pass in what the edit mode will be
                    this._updateRecord( pEditMode, prevEditMode, function() {
                        self.editMode = pEditMode;
                        ctrl$.toggleClass( "a-RV--editMode", pEditMode );
                        // xxx if changed and now editing unhide required - just like grid should do

                        if ( field$.length ) {
                            field$.find( SEL_TABBABLE ).first().focus();
                            if ( self.deactivateDelayTimer ) {
                                clearTimeout( self.deactivateDelayTimer );
                                self.deactivateDelayTimer = null;
                            }
                            if ( pEditMode ) {
                                self._activateField( field$ );
                            } else {
                                self._deactivateField( field$ );
                            }
                        }

                        if ( pEditMode ) {
                            // handle item changes that may happen from code such as a DA.
                            self.body$.on( CHANGE_EVENT, function( event ) {
                                var i, field, prop;

                                // ignore if the change came from the active element; model update handled on lose focus
                                // or if there is no current record
                                if ( self.activeRecord && !$( event.target ).closest( SEL_FORM_FIELD_W_ACTIVE ).length ) {
                                    for ( i = 0; i < self.fields.length; i++ ) {
                                        field = self.fields[i];
                                        if ( field.elementId === event.target.id ) {
                                            prop = field.property;
                                            self.setActiveRecordValue( prop );
                                            break;
                                        }
                                    }
                                }
                            } );
                        } else {
                            self.body$.off( CHANGE_EVENT );
                            self.activeRecord = null;
                            self.activeRecordId = null;
                        }

                        self._trigger( EVENT_MODE_CHANGE, null, {
                            editMode: pEditMode
                        });
                    } );
                }
            } else if ( pEditMode ) {
                debug.warn( "View is not editable." );
            }
        },

        /**
         * Returns the current model record that this view is viewing/editing.
         *
         * @return {model.Record} The current record from the model that the recordView is viewing/editing
         */
        getRecord: function() {
            return this.currentRecord;
        },

        /**
         * Call this method anytime the container that the recordView is in changes its size.
         */
        resize: function() {
            var h,
                ctrl$ = this.element,
                ctrlH = ctrl$.height();

            if ( ctrl$[0].offsetParent === null ) {
                // RecordView is invisible so nothing to resize. Expect a resize or refresh later when made visible
                return;
            }
            if ( !this.scrollWrap$ || this.pendingRefresh ) {
                // recordView was never initialized probably because it was initially invisible
                // or was refreshed while invisible. So do that now
                this.refresh();
                if ( !this.fields ) {
                    return; // because when no fields refresh calls resize via _initView
                }
            }

            if ( this.options.hasSize ) {
                h = ctrlH - ( this.toolbar$ ? this.toolbar$.outerHeight() : 0 );
                this.scrollWrap$.height(h);
            }
        },

        // todo
        expandGroup: function( pRows ) {
            // todo
        },

        // todo
        collapseGroup: function( pRows ) {
            // todo
        },

        //
        // Internal methods
        //

        _initModel: function( modelName ) {
            var markDeletes,
                o = this.options,
                self = this;

            function modelChangeHandler( type, change ) {
                var columnItem, out, field, field$, meta, fieldMeta;

                function checkForChange( ids, del ) {
                    var i, id;

                    for ( i = 0; i < ids.length; i++ ) {
                        id = ids[i];
                        if ( id === self.currentRecordId ) {
                            if ( type === "delete" ) {
                                if ( !markDeletes || !o.skipDeletedRecords ) {
                                    self._updateRecord();
                                } else {
                                    self.currentRecord = null;
                                    self.currentRecordId = null;
                                    self.activeRecord = null;
                                    self.activeRecordId = null;
                                    self.actions.invoke( ACT_NEXT );
                                    // if there was no next record try for a previous one
                                    if ( self.currentRecord === null ) {
                                        self.actions.invoke( ACT_PREV );
                                    }
                                }
                            } else if ( type === "clearChanges" && del ) {
                                // must have been looking at a deleted record
                                self.actions.invoke( ACT_NEXT );
                            } else if ( type === "refreshRecords" ) {
                                // for update after insert id is the previous (temp) id
                                // xxx is this right?
                                id = change.newIds[id] || id; // now it is the new id
                                // xxx update current record/record id?
                                self._updateRecord();
                            } else if ( type === "revert" ) {
                                self._updateRecord();
                            } else {
                                self._updateRecordState( );
                            }
                        }
                    }
                }

                if ( type === "refresh" ) {
                    if ( self.modelShape === SHAPE_TREE ) {
                        self.recordOffset = -1;
                        self.recordParent = null;
                    } else {
                        self.recordOffset = 0;
                    }
                    self.refresh( true );
                } else if ( type === "insert" || type === "copy" ) {
                    // normally this affects the record after the currentRecord and the action that was responsible will
                    // use next to get to the new record but if there is currently no data must refresh
                    if ( self.noData ) {
                        self.refresh();
                    }
                } else if ( type === "refreshRecords" ) {
                    checkForChange( change.recordIds );
                } else if ( type === "clearChanges") {
                    checkForChange( change.deletedIds, true );
                    checkForChange( change.changedIds );
                } else if ( change.recordIds ) {
                    checkForChange( change.recordIds );
                } else if ( type === "set" ) {
                    // Ignore if change came from user editing field in this widget
                    if ( !self.ignoreFieldChange ) {
                        if ( change.oldIdentity ) {
                            self._identityChanged( change.oldIdentity, self.model.getRecordId( change.record ) );
                        }
                        if ( self.model.getRecordId( change.record ) === self.currentRecordId ) {
                            // update just the changed field
                            columnItem = self.columnItems[change.field];
                            if ( self.editMode && columnItem ) {
                                if ( !self.ignoreItemChange ) {
                                    self._setColumnItemValue( columnItem.item, change.record, change.field );
                                }
                            } else {
                                // update the readonly/display value
                                field$ = self.fieldElement( change.field );
                                if ( field$.length ) {
                                    field = self._getFieldMetadata( field$ );
                                    meta = self.model.getRecordMetadata( self.currentRecordId );
                                    fieldMeta = null;
                                    if ( meta.fields ) {
                                        fieldMeta = meta.fields[field.property];
                                    }

                                    out = util.htmlBuilder();
                                    self._renderFieldDataValue(out, field, change.record, meta, fieldMeta );
                                    field$.find( SEL_FORM_CTRL_W ).html( out.toString() );
                                }
                            }
                            self._updateRecordState( );
                        }
                    }
                } else if ( type === "metaChange" ) {
                    if ( !self.ignoreFieldChange && change.recordId === self.currentRecordId ) {
                        self._updateRecordState( );
                    }
                }
            }

            this._super( modelName, modelChangeHandler );
            if ( modelName ) {
                markDeletes = this.model.getOption( "onlyMarkForDelete" );
                this.modelShape = this.model.getOption("shape");
                if ( this.modelShape === SHAPE_RECORD ) {
                    this.actions.hide(ACT_NEXT);
                    this.actions.hide(ACT_PREV);
                    this.actions.hide(ACT_INSERT);
                    this.actions.hide(ACT_DUPLICATE);
                    this.actions.hide(ACT_DELETE);
                }
            }
        },

        _updateMenuActions: function() {
            var o = this.options;
            this.actions[ o.showExcludeNullValues ? SHOW : HIDE ]( ACT_EXCLUDE_NULL );
            this.actions[ o.showExcludeHiddenFields ? SHOW : HIDE ]( ACT_EXCLUDE_HIDDEN );
        },

        _updateFields: function() {
            var col, colName, g,
                o = this.options,
                groupSeq = {},
                optFields = o.fields[0];

            this.fields = [];
            // todo consider if the group name should include parent level groups or if multiple levels of groups should be supported

            // put the field definitions in an array
            for ( colName in optFields) {
                if ( optFields.hasOwnProperty( colName )) {
                    col = optFields[colName];
                    col.property = colName;
                    this.fields.push( col );
                    // assign a sequence to groups based on the first field in it
                    g = effectiveGroupName( col );
                    if ( g ) {
                        if ( !groupSeq[g] || col.seq < groupSeq[g] ) {
                            groupSeq[g] = col.seq;
                        }
                    }
                }
            }

            // and sort them by group sequence then seq[uence] property
            this.fields.sort(function(a, b) {
                var groupA, groupB;
                if ( effectiveGroupName( a ) === effectiveGroupName( b ) ) {
                    return a.seq - b.seq;
                } // else
                // groups come before non grouped
                if ( !effectiveGroupName( a ) ) {
                    return 1;
                } else if ( !effectiveGroupName( b ) ) {
                    return -1;
                } // else order by group sequence
                groupA = groupSeq[effectiveGroupName( a )] || 0;
                groupB = groupSeq[effectiveGroupName( b )] || 0;
                return groupA - groupB;
            });
        },

        _initView: function() {
            var o = this.options,
                curEditMode = this.editMode;

            this._updateFields();
            if ( !this.columnItems ) { // just do this once
                this._initColumnItems( this.fields );
            }
            this.toolbar$ = null;
            if ( curEditMode ) {
                this.setEditMode( false );
            }
            this._renderView();
            if ( curEditMode || o.alwaysEdit ) {
                this.setEditMode( true );
            }

            if ( o.toolbar ) {
                this.toolbar$ = this.element.children( "." + C_RV_TOOLBAR ).toolbar({
                    idPrefix: this._getIdPrefix() + "tb",
                    actionsContext: this.actions,
                    data: o.toolbar,
                    small: true // xxx make this an option? how about simple?
                });
                if ( this.modelShape === SHAPE_RECORD ) {
                    this.toolbar$.toolbar( "hideControl", "recordNumber" );
                }
            }

            this.resize();
        },

        _refreshView: function() {
            this.refreshFields();
            this.refresh();
        },

        _forEachField: function( includeFieldCtrl, f ) {
            var i, field, fieldIndex, formControls$, field$,
                fields = this.fields;

            if ( includeFieldCtrl ) {
                formControls$ = this.element.find( SEL_FORM_CTRL_W );
            }
            fieldIndex = 0;
            for ( i = 0; i < fields.length; i++) {
                field = fields[i];

                // don't render fields that are virtual or can never be shown
                if ( field.virtual || (!field.canHide && field.hidden ) ) {
                    continue;
                }

                field$ = null;
                if ( includeFieldCtrl ) {
                    field$ = formControls$.eq( fieldIndex );
                }
                f.call( this, i, field, field$ );
                fieldIndex += 1;
            }
        },

        _getIdPrefix: function() {
            return ( this.options.idPrefix || this.element[0].id || "rv" ) + "_" ;
        },

        _renderView: function() {
            var lastGroup, formOpen, g,
                o = this.options,
                ctrl$ = this.element,
                out = util.htmlBuilder();

            function beginForm() {
                out.markup( "<div" )
                    .attr( "class", C_FORM + ( o.formCssClasses ? " " + o.formCssClasses : "" ) )
                    .markup( ">" );
                formOpen = true;
            }

            if ( o.toolbar ) {
                out.markup( "<div class='" + C_RV_TOOLBAR + "'></div>" );
            }
            this._renderAltDataMessages( out );
            out.markup( "<div class='" + C_RV_WRAP_SCROLL + "'>" )
                .markup( "<div class='" + C_RV_BODY + "'>" );

            // render the form with all the fields but with no data from model for now
            this.mapFieldToLabelId = {};
            lastGroup = null;
            formOpen = false;
            this._forEachField( false, function( index, field ) {
                var cls, group, groupLabel, label, fieldId, span, helpLabel;

                fieldId = this._getIdPrefix() + index;
                this.mapFieldToLabelId[field.property] = fieldId;

                // render optional group heading
                g = effectiveGroupName( field );
                if ( lastGroup !== g ) {
                    if ( g ) {
                        group = o.fieldGroups[g];
                        if ( group ) {
                            groupLabel = group.label || group.heading;
                        } else {
                            throw new Error( "Unknown field group name: " + g );
                        }
                    } else {
                        groupLabel = lang.getMessage( "APEX.RV.NOT_GROUPED_LABEL" );
                    }
                    if ( formOpen ) {
                        out.markup( "</div>" );
                    }
                    out.markup( "<h3 class='" + C_FORM_GROUP + "'><button type='button'>")
                        .content( groupLabel )
                        .markup( "</button></h3>" );
                    beginForm();
                    lastGroup = g;
                }
                if ( !formOpen ) {
                    beginForm();
                }
                cls = C_FORM_FIELD_W;
                if ( field.hidden ) {
                    cls += " " + C_FIELD_HIDDEN;
                }
                if ( field.fieldCssClasses ) {
                    cls += " " + field.fieldCssClasses;
                }
                if ( field.isRequired ) {
                    cls += " " + C_REQUIRED;
                }
                // readonly class is handled as each record is updated

                label = field.label || field.heading;
                span = null;
                if ( field.fieldColSpan ) {
                    span = parseInt( field.fieldColSpan, 10 );
                    if ( span > 0 && span < 13 ) {
                        out.markup( "<div class='" + "apex-col apex-col-" + span + "'>" );
                    } else {
                        span = null;
                    }
                }
                out.markup( "<div" )
                    .optionalAttr( "id", field.elementId ? field.elementId + "_CONTAINER" : null )
                    .attr( "data-idx", index )
                    .attr( "class", cls )
                    .markup( "><div" )
                    .attr( "id", fieldId )
                    .attr( "class", C_FORM_LABEL_W + " " + alignmentClass( o.labelAlignment ) )
                    .markup( ">" );
                //xxx icon or other stuff needed for required
                out.markup( "<span" )
                    .optionalAttr( "id", field.elementId ? field.elementId + "_LABEL" : null )
                    .attr( "class", C_FORM_LABEL )
                    .markup( ">" )
                    .content( label )
                    .markup( "</span>");
                if ( field.helpid ) {
                    helpLabel = lang.formatMessage( "APEX.ITEM.HELP_TEXT", label );
                    out.markup( "<button class='t-Button t-Button--noUI t-Button--helpButton js-itemHelp' tabindex='-1' type='button'" )
                        .attr( A_ITEM_HELP, field.helpid )
                        .attr( "aria-label", helpLabel )
                        .attr( "title", helpLabel )
                        .markup( "><span class='a-Icon icon-help' aria-hidden='true'></span></button>" );
                }
                out.markup( "</div><div tabindex='0' class='" + C_FORM_CTRL_W + "'" )
                    .attr( A_LBL_BY, field.elementId + "_LABEL" ).markup( "></div></div>" );
                if ( span ) {
                    out.markup( "</div>" );
                }
            } );
            if ( formOpen ) {
                out.markup( "</div>" ); // close open
            }

            out.markup( "</div></div>" );

            // make groups collapsible
            ctrl$.html( out.toString() )
                .find( "." + C_FORM_GROUP ).each( function() {
                    var groupHeader$ = $( this );
                    groupHeader$.collapsible( {
                        heading: "." + C_FORM_GROUP,
                        controllingElement: "button",
                        universalTheme: true, // todo this is unfortunate!
                        collapsed: false,
                        content: groupHeader$.next()
                    } );
                } );

            this.scrollWrap$ = ctrl$.find( "." + C_RV_WRAP_SCROLL );
            this.body$ = ctrl$.find( "." + C_RV_BODY );
            this.noData$ = ctrl$.find( ".a-GV-noDataMsg" );
        },

        _updateRecord: function( editMode, prevEditMode, callback ) {
            var record,
                self = this,
                prevId = this.currentRecordId,
                o = this.options;

            function deactivateRecord() {
                var i, prop, columnItem, validity, meta, colMeta, isDisabled;

                meta = self.model.getRecordMetadata( ( self.currentRecordId ) );

                // do final validation mainly for the benefit of inserted rows
                for ( i = 0; i < self.fields.length; i++ ) {
                    prop = self.fields[i].property;
                    columnItem = self.columnItems[ prop ];

                    // Only check validity for enabled and visible items
                    if ( columnItem ) {
                        isDisabled = columnItem.item.isDisabled();
                        if ( columnItem.element$.is( SEL_VISIBLE ) && !isDisabled ) {
                            validity = columnItem.item.getValidity();
                            if ( !validity.valid ) {
                                self.model.setValidity( "error", self.currentRecordId, prop, columnItem.item.getValidationMessage() );
                            }
                        } else {
                            self.model.setValidity( "valid", self.currentRecordId, prop );
                        }
                        if ( meta )  {
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
                            }
                        }
                    }
                }
                self._triggerEndEditing( self.currentRecord, self.currentRecordId );
                self.activeRecord = null;
                self.activeRecordId = null;
            }

            function update( rowItem, index, id ) {
                var meta, rec, total,
                    form$ = self.body$;

                if ( rowItem ) {
                    meta = self.model.getRecordMetadata( id ) || {};

                    self.scrollWrap$.show();
                    self.noData$.hide();

                    if ( meta.agg || ( meta.deleted && o.skipDeletedRecords ) ) {
                        // need to skip this record because it is an aggregate or is deleted and we are skipping deleted records
                        if ( self.modelShape === SHAPE_TREE ) {
                            rec = self[ self.direction > 0 ? "_nextTreeRecord" : "_previousTreeRecord"]();
                            if ( rec ) {
                                o.recordParent = rec.parent;
                                o.recordOffset = rec.offset;
                            }
                        } else { // record shape should not be possible so this is table shape
                            o.recordOffset += self.direction; // go to next or previous record
                            total = self.model.getTotalRecords();
                            if ( o.recordOffset < 0 ) {
                                o.recordOffset = 0;
                                self.direction = -self.direction;
                            } else if ( total >= 0 && o.recordOffset >= total ) {
                                o.recordOffset = total - 1;
                                self.direction = -self.direction;
                            }
                        }
                        self._updateRecord( editMode, prevEditMode, callback );
                        self._updateRecord();
                        return;
                    }

                    // if in edit mode (or leaving edit mode) and about to leave a previous record then must deactivate the record
                    if ( o.editable && self.currentRecord && ( ( editMode && prevEditMode !== false ) || prevEditMode === true ) ) {
                        deactivateRecord();
                    }

                    o.recordOffset = index;
                    self.currentRecordId = id;
                    self.currentRecord = null; // clear this until after all the columnItems are set to avoid processing in change handler
                    self.activeRecord = null;
                    self._renderRecordFields( editMode, rowItem, index, id, meta );
                    self.currentRecord = rowItem;
                    if ( editMode ) {
                        // keep these in sync with currentRecord but only non-null when editing
                        self.activeRecord = rowItem;
                        self.activeRecordId = id;
                    }

                    // clear out any errors from previous record
                    form$.children( SEL_ALERT ).remove();
                    form$.find( SEL_FORM_ERROR ).remove();

                    self._updateRecordState();
                    self._updateRecordNumber();

                    if ( o.editable && editMode ) {
                        self._triggerBeginEditing( self.currentRecord, self.currentRecordId );
                    }

                    if ( prevId === null || prevId !== self.currentRecordId ) {
                        // need to delay this for consistency with selection change events
                        // todo think should this be debounced?
                        setTimeout( function() {
                            self._trigger( EVENT_RECORD_CHANGE, null, {
                                recordOffset: o.recordOffset,
                                recordId: self.currentRecordId
                            });
                        }, 1 );
                    }
                } else {
                    if ( o.editable && self.currentRecord && ( ( editMode && prevEditMode !== false ) || prevEditMode === true ) ) {
                        deactivateRecord();
                    }
                    // update/clear current record
                    self.currentRecordId = null;
                    self.currentRecord = null;

                    // clear out all fields
                    self._renderRecordFields( editMode, null, -1, null, {} );

                    self.scrollWrap$.hide();
                    self.noData$.show();
                    self._updateActions();
                    self._updateRecordNumber();
                }
            }

            if ( editMode === null || editMode === undefined ) {
                editMode = this.editMode;
            }

            if ( this.activeLockCount > 0 ) {
                this.activeUnlockCallback = function() {
                    self._updateRecord( editMode, prevEditMode, callback );
                };
                return;
            }

            switch ( this.modelShape ) {
                case SHAPE_RECORD:
                    record = this.model.getRecord();
                    update( record, 0, record ? this.model.getRecordId( record ) : null );
                    break;
                case SHAPE_TABLE:
                    this.model.forEachInPage( o.recordOffset, 1, function( rowItem, index, id ) {
                        update( rowItem, index, id );
                    }, this );
                    break;
                case SHAPE_TREE:
                    if ( o.recordParent === null ) {
                        record = this.model.root();
                        o.recordOffset = -1;
                        update( record, o.recordOffset, record ? this.model.getRecordId( record ) : null );
                    } else {
                        record = this.model.child( o.recordParent, o.recordOffset );
                        update( record, o.recordOffset, record ? this.model.getRecordId( record ) : null );
                    }
                    break;
            }
            if ( callback ) {
                callback();
            }
        },

        _renderRecordFields: function( editMode, rowItem, index, id, meta ) {
            var fieldMeta = null,
                editable = false,
                out = util.htmlBuilder(),
                itemsContainer = this.columnItemsContainer$ ? this.columnItemsContainer$[0] : null;

            if ( editMode && rowItem ) {
                editable = this.model.allowEdit( rowItem );
            }
            this._forEachField( true, function( index, field, field$ ) {
                var fieldClasses, value, columnItem,
                    readonly = false;

                fieldClasses = C_FORM_FIELD_W;
                if ( rowItem ) {
                    value = this.model.getValue( rowItem, field.property );
                    if ( value === null || value === "" ) {
                        fieldClasses += " " + C_FIELD_NULL;
                    }
                    if ( field.hidden ) {
                        fieldClasses += " " + C_FIELD_HIDDEN;
                    }
                    if ( field.fieldCssClasses ) {
                        fieldClasses += " " + field.fieldCssClasses;
                    }
                    if ( field.isRequired ) {
                        fieldClasses += " " + C_REQUIRED;
                    }

                    if ( meta.fields ) {
                        fieldMeta = meta.fields[field.property];
                    }

                    if ( fieldMeta ) {
                        if ( fieldMeta.disabled ) {
                            fieldClasses += " is-disabled";
                        }

                        // a checksum on the cell means that it is readonly
                        if ( fieldMeta.ck || field.readonly ) {
                            fieldClasses += " " + C_READONLY;
                            readonly = true;
                        }
                    }
                }

                columnItem = this.columnItems[ field.property ];
                if ( editable && columnItem && !readonly && !field.volatile ) {
                    if ( columnItem.element$.parent()[0] === itemsContainer ) {
                        // activate the field for editing
                        field$.empty().append( columnItem.element$ )
                            .attr( "tabindex", -1 )
                            .removeAttr( A_LBL_BY );
                        this._activateColumnItem( columnItem, field.elementId + "_LABEL" );
                    }
                    // delay setting the value so that any change events happen after all the fields have been moved into place
                } else {
                    if ( columnItem && columnItem.element$.parent()[0] !== itemsContainer ){
                        // deactivate the field for editing
                        this._deactivateColumnItem( columnItem );
                        field$.attr( "tabindex", 0 )
                            .attr( A_LBL_BY, field.elementId + "_LABEL" );
                    }
                    if ( rowItem ) {
                        out.clear();
                        this._renderFieldDataValue(out, field, rowItem, meta, fieldMeta );
                        field$.html( out.toString() );
                    } else {
                        field$.empty();
                    }
                }
                field$.parent().attr( "class", fieldClasses );
            } );
            if ( editable && rowItem ) {
                // now set column item values
                this._beginSetColumnItems();
                this._forEachField( true, function( index, field, field$ ) {
                    var columnItem = this.columnItems[ field.property ];

                    if ( columnItem && !field$.hasClass( C_READONLY ) && !field.volatile ) {
                        this._setColumnItemValue( columnItem.item, rowItem, field.property,
                            editable? meta : null );
                    }
                } );
                this._endSetColumnItems();
            }

        },

        _updateRecordState: function() {
            var f, meta, notificationArea$, fieldMeta, field$,
                status = "",
                form$ = this.body$;

            meta = this.model.getRecordMetadata( this.currentRecordId ) || {};
            form$.removeClass( "is-deleted is-inserted is-updated " + C_UI_STATES );
            if ( meta.deleted ) {
                form$.addClass( "is-deleted" );
                status = lang.getMessage( "APEX.GV.ROW_DELETED" ); // todo also these status text should be shared with grid view which currently has no accessible status text
            } else if ( meta.inserted ) {
                form$.addClass( "is-inserted" );
                status = lang.getMessage( "APEX.GV.ROW_ADDED" );
            } else if ( meta.updated ) {
                form$.addClass( "is-updated" );
                status = lang.getMessage( "APEX.GV.ROW_CHANGED" );
            }
            if ( !this.model.allowEdit( this.currentRecord ) ) {
                form$.addClass( C_READONLY );
            }
            if ( meta.error || meta.warning ) {
                notificationArea$ = form$.children( SEL_ALERT );
                if ( !notificationArea$.length ) {
                    notificationArea$ = $( "<div class='t-Alert'></div>" );
                    form$.prepend( notificationArea$ );
                }
                notificationArea$.text( meta.message );
                form$.addClass( meta.error ? C_ERROR : C_WARN ); // if not error must be warning
            } else {
                form$.children( SEL_ALERT ).remove();
            }
            if ( meta.fields ) {
                for ( f in meta.fields ) {
                    if ( meta.fields.hasOwnProperty( f ) ) {
                        fieldMeta = meta.fields[f];
                        field$ = this.fieldElement( f );
                        field$.removeClass( "is-changed " + C_UI_STATES );
                        if ( fieldMeta.error || fieldMeta.warning ) {
                            // todo the following should be common code somewhere else
                            notificationArea$ = field$.find( SEL_FORM_ERROR );
                            if ( !notificationArea$.length ) {
                                notificationArea$ = $( "<span class='" + C_FORM_ERROR + "'></span>" );
                                field$.find( SEL_FORM_CTRL_W ).append( notificationArea$ );
                            }
                            notificationArea$.text( fieldMeta.message );
                            field$.addClass( fieldMeta.error ? C_ERROR : C_WARN ); // if not error must be warning
                        } else {
                            field$.find( SEL_FORM_ERROR ).remove();
                            if ( fieldMeta.changed ) {
                                field$.addClass( "is-changed" );
                            }
                        }
                        if ( fieldMeta.ck ) {
                            field$.addClass( C_READONLY );
                        }
                    }
                }
            }
            // todo this may make volatile columns stale
            this._updateActions();

            if ( this.toolbar$ ) {
                this.toolbar$.toolbar( "findElement", "status" ).text( status );
            }

        },

        _hasPrevious: function() {
            var o = this.options;

            switch ( this.modelShape ) {
                case SHAPE_RECORD:
                    return false;
                case SHAPE_TABLE:
                    return o.recordOffset > 0;
                case SHAPE_TREE:
                    return this._previousTreeRecord() !== null;
            }
        },

        _hasNext: function() {
            var total,
                o = this.options;

            switch ( this.modelShape ) {
                case SHAPE_RECORD:
                    return false;
                case SHAPE_TABLE:
                    total = this.model.getTotalRecords();
                    return total < 0 || o.recordOffset + 1 < total;
                case SHAPE_TREE:
                    return this._nextTreeRecord() !== null;
            }
        },

        _nextTreeRecord: function() {
            var count, node,
                o = this.options,
                offset = o.recordOffset,
                parent = o.recordParent;

            if ( parent === null ) {
                node = this.model.root();
            } else {
                node = this.model.child( parent, offset );
            }

            if ( this.model.childCount( node ) > 0 ) {
                return { parent: node, offset: 0 };
            }
            while ( parent ) {
                count = this.model.childCount( parent );
                if ( count > 0 && offset + 1 < count ) {
                    return { parent: parent, offset: offset + 1 };
                } else {
                    offset = this.model.indexOf( parent );
                    parent = this.model.parent( parent );
                }
            }
            return null;
        },

        _previousTreeRecord: function() {
            var self = this,
                o = this.options,
                offset = o.recordOffset,
                parent = o.recordParent;

            function lastDescendant( n ) {
                var count = self.model.childCount( n );

                if ( count > 0 ) {
                    return lastDescendant( self.model.child( n, count - 1 ) );
                }
                return { parent: self.model.parent( n ), offset: self.model.indexOf( n ) };
            }

            if ( parent === null ) {
                return null;
            }

            if ( parent && offset > 0 ) {
                return lastDescendant( this.model.child( parent, offset - 1 ) );
            }
            return { parent: this.model.parent( parent ), offset: this.model.indexOf( parent ) };
        },

        _updateActions: function() {
            var o = this.options,
                actions = this.actions,
                curRec = this.currentRecord,
                editable = o.editable,
                theModel = this.model,
                parentRec = this.modelShape === SHAPE_TREE ? o.recordParent : null,
                addOk = editable && theModel.allowAdd( parentRec, "new" ),
                dupOk = editable && curRec && theModel.allowAdd( parentRec, "copy" ),
                editOk = editable && curRec;

            function toggle( predicate, action ) {
                actions[predicate ? ENABLE : DISABLE]( action );
            }
            toggle( editOk && theModel.canRevertRecord( curRec ), ACT_REVERT );
            toggle( editOk && theModel.allowDelete( curRec ), ACT_DELETE );
            toggle( addOk, ACT_INSERT );
            toggle( dupOk, ACT_DUPLICATE );
            toggle( curRec && this._hasNext(), ACT_NEXT );
            toggle( curRec && this._hasPrevious, ACT_PREV );
        },

        _getFieldMetadata: function( field$ ) {
            var index = parseInt( field$.attr( "data-idx" ), 10 );
            if ( !isNaN( index ) ) {
                return this.fields[index];
            } // else
            return null;
        },

        // must only be called while in edit mode
        _activateField: function( field$ ) {
            var field, columnItem;

            if ( field$.length <= 0 || this.currentRecord === null ) {
                return;
            }

            field = this._getFieldMetadata( field$ );
            if ( field ) {
                columnItem = this.columnItems[field.property];
            }
            if ( columnItem && this.model.allowEdit( this.currentRecord ) && !field$.hasClass( C_READONLY ) ) {
                field$.addClass( C_ACTIVE );
            }
        },

        // must only be called while in edit mode
        _deactivateField: function( field$ ) {
            var field,
                columnItem = null;

            if ( field$.length <= 0 || this.currentRecord === null ) {
                return;
            }

            field = this._getFieldMetadata( field$ );
            if ( field ) {
                columnItem = this.columnItems[field.property];
            }
            if ( columnItem && !field$.hasClass( C_READONLY ) && field$.hasClass( C_ACTIVE ) ) {
                this._setModelValue( field$, columnItem.item, this.currentRecord, field.property ); // also removes active class
                this._updateRecordState();
            }
        },

        _updateRecordNumber: function() {
            var total, parent,
                text = "",
                o = this.options;

            // format a message Row X or Row X of Y
            if ( this.toolbar$ ) {
                if ( this.currentRecord ) {
                    if ( this.modelShape === SHAPE_TREE ) {
                        // todo improve messaging for tree view consider include level
                        parent = this.model.parent( this.currentRecord );
                        if ( parent ) {
                            total = this.model.childCount( parent );
                        }
                    } else {
                        total = this.model.getTotalRecords();
                    }
                    if ( total > 0 ) {
                        text = lang.formatMessage( "APEX.RV.REC_XY", o.recordOffset + 1, total );
                    } else {
                        text = lang.formatMessage( "APEX.RV.REC_X", o.recordOffset + 1 );
                    }
                }
                this.toolbar$.toolbar( "findElement", "recordNumber" ).text( text );
            }
        },

        _identityChanged: function( prevId, id ) {
            if ( prevId === this.currentRecordId ) {
                this.currentRecordId = id;
                if ( this.activeRecordId ) {
                    this.activeRecordId = id; // activeRecord[Id] if present is always in sync with currentRecord[Id]
                }
            }
        }

    });

    $.apex.recordView.copyDefaultToolbar = function() {
        var i,
            copy = [];

        for (i = 0; i < defaultToolbar.length; i++ ) {
            copy.push( $.extend( true, {}, defaultToolbar[i]) );
        }
        return copy;
    };

    /**
     * Create a modal dialog that can edit a data model. The editing of each record is done with
     * a recordView widget inside the dialog. If the model is table shaped then the left/start side of the dialog
     * contains a grid view or icon list view for selecting the current record. If the model is tree shaped then
     * the left/start side contains a treeView for selecting the current record. The left/start side is just for
     * selection/navigation never editing. The navigation panel includes a toolbar.
     *
     * todo more details; column items
     *
     * @param {string} pDialogId the id of an element to turn in to a jQuery UI dialog. If an element with the
     *                  given id doesn't exist it is created and appended to the element given by the appendTo option
     *                  or if that option is not given the document body.
     * @param {object} pOptions object with properties to configure the dialog and its contents.
     * The options are the options supported by jQuery UI dialog with these additions:
     *      {function} init function(model, nav$, rv$, tb$) called with the model, navigation grid, list or treeView instance
     *                      or null if the model shape is record, the recordView instance, and the toolbar instance
     *                      This is called when the dialog is created. It allows configuring the contents of the
     *                      dialog as well as setting up event handlers for recordView form elements.
     *      {function} load function(model) called with the model. This is called each time the dialog is opened.
     *                      the responsibility of the load callback is to initialize the model with data. The
     *                      load function should return the id of the initial record to edit.
     *      {function} validate function(model) called with the model. This is called when the save button is
     *                      pressed. It should return true if there are no global errors. If it returns false
     *                      or if the model has errors the changes will not be stored and the dialog will not close.
     *      {function} store function(model) called with the model. This is called when the save button is pressed
     *                      as long as validate doesn't return false and the model has no errors. It is responsible
     *                      for saving any changes made.
     *      {string} modelName the name of the model used to hold the data that this dialog will edit. The model
     *                      will be created when the dialog is and therefore should not already exist. For a tree model
     *                      $.apex.treeView.makeModelNodeAdapter is used otherwise apex.model.create is used.
     *                      The model is destroyed when the dialog is.
     *      {object} modelOptions an options object suitable to pass to apex.model.create. The fields are also used
     *                      for the views such as recordView.
     *      {boolean} defaultButton if true pressing enter in any text field will activate the hot button (button with
     *                      class ui-button--hot).
     *      {string} titleKey set the dialog title using an APEX message key
     *      {string} idPrefix a prefix used to keep ids in the record view unique. If not given the model name is used
     *      {string} formCssClasses passed to record view
     *      {string} labelAlignment passed to record view
     *      {boolean} useList if true use an iconList TMV rather than a grid for navigation. Only applies for table models.
     *      {string} noDataMessage message to show when there is no data in the model
     *      // only used when useList is true
     *      labelColumn
     *      iconClassColumn
     *      recordTemplate
     *      enabledColumn
     *      enabledText
     *      disabledText
     *      {boolean} useSplitter if true a splitter widget is used to separate the nav area. Ignored if splitter widget not present.
     *      {integer} splitterPosition initial position of splitter. Only applies if useSplitter is true.
     *      {boolean} persistSplitter The name under which to persist the splitter state in session storage or false to not persist. Only applies if useSplitter is true.
     *      {boolean} includeCopy if true a copy button is added to the toolbar. Ignored for record shape models.
     *      {object} dialogHelp  if this is an object a Help button is added to the dialog. The dialog is displayed using
     *                      apex.theme.popupFieldHelp. The default is for no help button. This is a help info object with
     *                      properties title and helpText or titleKey and helpTextKey the later two are used to supply
     *                      help from apex.lang messages. These keys will be loaded first if needed.
     *      {boolean} appendToTop experimental todo
     *
     * The options must not contain these jQuery UI dialog options: modal, autoOpen, buttons, create, open, resize
     * The closeText defaults to the APEX message APEX.DIALOG.CLOSE
     *
     * todo even though grid is not editable would be nice if ins and del keys worked
     */
    $.apex.recordView.createModelEditDialog = function( pDialogId, pOptions ) {
        var dlgOptions, modelInstance, grid$, list$, rec$, tree$, toolbar$, splitter$, modelShape, modelFields, context,
            supportReorder, navInst, splitterPos, splitterStorage,
            jQuery = $,
            emptyData = [],
            dialog$ = jQuery( "#" + pDialogId ),
            out = util.htmlBuilder();

        function updateNavSelection( record ) {
            if ( navInst ) {
                if ( tree$ ) {
                    // make sure current node is expanded xxx but only want to do this when source is record view
                    navInst.expand( navInst.getSelection().first() );
                }
                // slight delay because record view likely initializes before the nav view and so its model listener runs first
                setTimeout( function() {
                    navInst[tree$ ? "setSelectedNodes" : "setSelectedRecords"]( [record] );
                }, 1 );
            }
        }

        if ( pOptions.appendToTop ) {
            jQuery = util.getTopApex().jQuery; // make sure dialog is opened in top level page
        }
        context = jQuery( "body" ).context;

        // add div for dialog if there isn't one already
        if ( !dialog$.length ) {
            dialog$ = jQuery( "<div id='" + pDialogId + "'></div>" );
            jQuery( pOptions.appendTo || "body" ).append( dialog$ );
        }

        // create a model
        if ( ( pOptions.modelOptions.shape || SHAPE_TABLE ) === SHAPE_TREE ) {
            modelInstance = $.apex.treeView.makeModelNodeAdapter( pOptions.modelName, pOptions.modelOptions, null );
        } else {
            if ( ( pOptions.modelOptions.shape || SHAPE_TABLE ) === SHAPE_RECORD ) {
                emptyData = null;
            }
            modelInstance = model.create( pOptions.modelName, pOptions.modelOptions, emptyData, 0, false );
        }
        modelShape = modelInstance.getOption( "shape" );
        modelFields = modelInstance.getOption( "fields" );
        supportReorder = !!modelInstance.getOption( "sequenceField" ); // todo perhaps support reorder without seq consider tree
        // this model gets destroyed when the dialog is destroyed

        // render dialog contents
        // todo rename nav, rv, tb
        out.markup("<form novalidate><section class='a-IGDialog-region a-IGDialog-body'>"); // todo revisit all class names

        if ( modelShape !== SHAPE_RECORD ) {
            out.markup("<aside class='a-IGDialog-side resize'><div class='nav resize'></div><div class='tb'></div></aside>");
        }
        out.markup("<main class='a-IGDialog-main resize'><div class='rv resize'></div></main></section></form>");

        dlgOptions = $.extend(
            // default these
            {
                closeText: lang.getMessage( "APEX.DIALOG.CLOSE" ),
                noDataMessage: null
            },
            pOptions,
            // force these
            {
                autoOpen: false,
                modal: true,
                buttons: [
                    {
                        text: lang.getMessage( "APEX.DIALOG.CANCEL" ),
                        click: function() {
                            rec$.recordView( "setEditMode", false ); // leave edit mode to make sure active field is deactivated
                            jQuery( this ).dialog( "close" );
                        }
                    },
                    {
                        text: lang.getMessage( "APEX.DIALOG.SAVE" ),
                        "class": "ui-button--hot",
                        click: function() {
                            var errorMessage = "",
                                ok = true;

                            rec$.recordView( "setEditMode", false ); // leave edit mode to make sure active field is deactivated
                            if ( pOptions.validate ) {
                                ok = pOptions.validate.call( this, modelInstance );
                                if ( typeof ok === "string" ) {
                                    errorMessage = ok + "\n\n";
                                    ok = false;
                                }
                            }
                            if ( ok && !modelInstance.hasErrors() ) {
                                if ( pOptions.store ) {
                                    pOptions.store.call( this, modelInstance );
                                }
                                jQuery( this ).dialog( "close" );
                            } else {
                                rec$.recordView( "refresh" ); // this will also go back into edit mode
                                errorMessage += apex.lang.getMessage( "APEX.CORRECT_ERRORS" );
                                apex.message.alert( errorMessage, function() {
                                    var field$ = rec$.find( "." + C_ERROR );

                                    // go to first error or first field if there is no error field
                                    if ( !field$.length ) {
                                        field$ = rec$.find( SEL_FORM_FIELD_W ).first();
                                    }
                                    // todo should this use gotoField or item().setFocus?
                                    field$.find( SEL_TABBABLE ).focus();
                                });
                            }
                        }
                    }
                ],
                create: function() {
                    var selectionSource, toolbarControls, treeOptions, recordTemplate,
                        actionsContext = actions.createContext( "ModelEditDialog", dialog$[0] );
                    // don't scroll the dialog with the page
                    jQuery( this ).closest( ".ui-dialog" ).css( "position", "fixed" );

                    rec$ = $( "#" + pDialogId, context ).find( ".rv" );
                    rec$.recordView( {
                        modelName: pOptions.modelName,
                        noDataMessage: pOptions.noDataMessage,
                        idPrefix:  pOptions.idPrefix || pOptions.modelName,
                        fields:  [modelFields],
                        actionsContext: actionsContext,
                        toolbar: null,
                        editable: true,
                        alwaysEdit: true,
                        hasSize: true,
                        skipDeletedRecords: true,
                        formCssClasses: pOptions.formCssClasses,
                        labelAlignment: pOptions.labelAlignment,
                        recordChange: function( event, ui ) {
                            var record;

                            if ( selectionSource !== "nav" ) {
                                record = rec$.recordView( "getRecord" );
                                if ( record ) {
                                    selectionSource = "rv";
                                    updateNavSelection( record );
                                    selectionSource = null;
                                }
                            }
                        }
                    } );

                    if ( modelShape !== SHAPE_RECORD ) {
                        toolbar$ = $( "#" + pDialogId, context ).find( ".tb" );
                        actionsContext.add( [
                            {
                                name: "move-up",
                                labelKey: "APEX.RV.MOVE_UP",
                                hide: true,
                                action: function() {
                                    var after$,
                                        after = null,
                                        rows = grid$.grid( "getSelection" ),
                                        items = grid$.grid( "getSelectedRecords" );
                                    // xxx what if tree or listView?

                                    if ( rows[0].prev().length ) {
                                        after$ = rows[0].prev().prev();
                                        if ( after$.length ) {
                                            after = grid$.grid( "getRecords", [after$] )[0];
                                        }
                                        modelInstance.moveRecords( items, null, after );
                                        grid$.grid( "setSelectedRecords", items );
                                    }
                                }
                            },
                            {
                                name: "move-down",
                                labelKey: "APEX.RV.MOVE_DOWN",
                                hide: true,
                                action: function() {
                                    var after$,
                                        after = null,
                                        rows = grid$.grid( "getSelection" ),
                                        items = grid$.grid( "getSelectedRecords" );
                                    // xxx what if tree or listView?

                                    after$ = rows[rows.length - 1].next();
                                    if ( after$.length ) {
                                        after = grid$.grid( "getRecords", [after$] )[0];
                                        modelInstance.moveRecords( items, null, after );
                                        grid$.grid( "setSelectedRecords", items );
                                    }
                                }
                            }
                        ] );
                        toolbarControls = [
                            {
                                type: "BUTTON",
                                iconOnly: true,
                                icon: "icon-plus",
                                action: ACT_INSERT
                            },
                            {
                                type: "BUTTON",
                                iconOnly: true,
                                icon: "icon-copy",
                                action: ACT_DUPLICATE
                            },
                            {
                                type: "BUTTON",
                                iconOnly: true,
                                icon: "icon-minus",
                                action: ACT_DELETE
                            },
                            {
                                type: "BUTTON",
                                iconOnly: true,
                                icon: "icon-up-chevron",
                                action: "move-up"
                            },
                            {
                                type: "BUTTON",
                                iconOnly: true,
                                icon: "icon-down-chevron",
                                action: "move-down"
                            }
                        ];
                        actionsContext[pOptions.includeCopy ? SHOW : HIDE]( ACT_DUPLICATE );
                        actionsContext[supportReorder ? SHOW : HIDE]( "move-up" );
                        actionsContext[supportReorder ? SHOW : HIDE]( "move-down" );
                        toolbar$.toolbar( {
                            actionsContext: actionsContext,
                            data: [
                                {
                                    align: "start",
                                    controls: toolbarControls
                                }
                            ]
                        } );
                        // todo need to update toolbar action states based on current selection
                    }

                    if ( modelShape === SHAPE_TABLE ) {
                        if ( pOptions.useList ) {
                            list$ = $( "#" + pDialogId, context ).find( ".nav" );
                            recordTemplate = pOptions.recordTemplate;
                            if ( !recordTemplate ) {
                                if ( !pOptions.labelColumn ) {
                                    throw new Error("Option recordTemplate or labelColumn is required");
                                }
                                recordTemplate = "<li data-id='&APEX$ROW_ID.' class='&APEX$ROW_STATE_CLASSES.'>";
                                if ( pOptions.iconClassColumn ) {
                                    recordTemplate += "<span class='a-IconList-icon'><span class='&" + pOptions.iconClassColumn + ".'></span></span>";
                                }
                                if ( pOptions.enabledCheckbox ) {
                                    recordTemplate += "<span class='ro-checkbox &\"enabledClass\".'></span><span class='u-vh'>&\"enabledText\".</span>";
                                }
                                recordTemplate += "<span class='a-IconList-label'>&" + pOptions.labelColumn + ".</span></li>";
                            }
                            list$.tableModelView( {
                                modelName: pOptions.modelName,
                                columns:  [modelFields],
                                hasSize: true,
                                footer: false,
                                pagination: {
                                    scroll: true
                                },
                                useIconList: true,
                                recordTemplate: recordTemplate,
                                collectionClasses: pOptions.collectionClasses || "a-RVDialog-list",
                                selectionChange: function() {
                                    var offset, record;

                                    if ( selectionSource !== "rv" ) {
                                        record = list$.tableModelView( "getSelectedRecords" )[0]; // todo consolidate? this is only diff between this and grid selection function
                                        if ( record ) {
                                            selectionSource = "nav";
                                            offset = modelInstance.indexOf( record );
                                            rec$.recordView( OPTION, "recordOffset", offset );
                                            selectionSource = null;
                                        }
                                    }
                                }
                            } );
                            navInst = list$.data( "apex-tableModelView" );
                        } else {
                            grid$ = $( "#" + pDialogId, context ).find( ".nav" );
                            grid$.grid( {
                                modelName: pOptions.modelName,
                                noDataMessage: pOptions.noDataMessage,
                                columns:  [modelFields],
                                editable: false,
                                hasSize: true,
                                footer: false,
                                pagination: {
                                    scroll: true
                                },
                                reorderColumns: false,
                                columnSort: false,
                                hideDeletedRows: true,
                                selectionChange: function() {
                                    var offset, record;

                                    if ( selectionSource !== "rv" ) {
                                        record = grid$.grid( "getSelectedRecords" )[0];
                                        if ( record ) {
                                            selectionSource = "nav";
                                            offset = modelInstance.indexOf( record );
                                            rec$.recordView( OPTION, "recordOffset", offset );
                                            selectionSource = null;
                                        }
                                    }
                                }
                            } );
                            navInst = grid$.data( "apex-grid" );
                        }
                    } else if ( modelShape === SHAPE_TREE ) {
                        $( "#" + pDialogId, context ).find( ".nav" ).addClass( "a-RVDialog-scroll" ).html( "<div class='a-RVDialog-tree'></div>" );
                        tree$ = $( "#" + pDialogId, context ).find( ".a-RVDialog-tree" );

                        treeOptions = {
                            showRoot: true,
                            collapsibleRoot: true,
                            expandRoot: true,
                            getNodeAdapter: function() { return modelInstance; },
// todo
//                            iconType: iconType,
//                            multiple: $( "#multipleCB" )[0].checked,
//                            doubleClick: $( "#doubleClickChoice" ).val(),
                            // drag and drop
//                            dragAndDrop: $( "#dndCB" )[0].checked,
//                            dragMultiple: $( "#dndMultiCB" )[0].checked,
//                            dragReorder: $( "#dndReorderCB" )[0].checked,
//                            dragHelper: $( "#dndHelperCB" )[0].checked ? dragAndDropHelper : null,
//                            dragAppendTo: document.body,
//                            dragCursor: "move",
//                            dragAnimate: $( "#dragAnimateCB" )[0].checked ? 300 : false,
//                            dragContainment: "document", //  $("#middle"),
                            // events
                            selectionChange: function() {
                                var offset, record, parent;

                                if ( selectionSource !== "rv" ) {
                                    record = tree$.treeView("getSelectedNodes" )[0];
                                    if ( record ) {
                                        parent = modelInstance.parent( record );
                                        selectionSource = "nav";
                                        // set new parent if it changed. The offset is relative to the parent node
                                        if ( parent !== rec$.recordView( OPTION, "recordParent" ) ) {
                                            rec$.recordView( OPTION, "recordParent", parent );
                                        }
                                        offset = modelInstance.indexOf( record );
                                        rec$.recordView( OPTION, "recordOffset", offset );
                                        selectionSource = null;
                                    }
                                }
                            }
                        };
                        tree$.treeView( treeOptions );
                        $.apex.treeView.treeModelListener( pOptions.modelName, tree$ );
                        navInst = tree$.data( "apex-treeView" );
                    }

                    // when first created the dialog is not visible and most of the widgets won't render so delay init
                    // until first open.
                    this.initDone = false;
                },
                open: function() {
                    var record,
                        initialRecordId = null;

                    if ( toolbar$ ) {
                        toolbar$.toolbar("refresh");
                    }
                    if ( grid$ ) {
                        grid$.grid( "refreshColumns" ); // force rerender whole view
                    }
                    dlgOptions.resize();

                    // now that dialog is visible and resized all the widgets should be rendered
                    if ( pOptions.init && !this.initDone ) {
                        pOptions.init.call( this, modelInstance, grid$ || list$ || tree$ || null, rec$, toolbar$ );
                    }
                    this.initDone = true;

                    if ( pOptions.load ) {
                        initialRecordId = pOptions.load.call( this, modelInstance );
                    }
                    if ( modelShape !== SHAPE_RECORD) {
                        if ( initialRecordId ) {
                            record = modelInstance.getRecord( initialRecordId );
                        } else {
                            record = rec$.recordView( "getRecord" );
                        }
                        if ( record ) {
                            updateNavSelection( record );
                        }
                    }
                    setTimeout(function() {
                        rec$.recordView( "focus" );
                    }, 100);
                },
                close: function() {
                    if ( modelShape === SHAPE_TABLE ) {
                        modelInstance.setData( [], 0 );
                    } else {
                        modelInstance.setData( null );
                    }
                },
                resize: function() {
                    var w = dialog$.width(),
                        h = dialog$.height();
                    if ( splitter$ ) {
                        dialog$.find( "section" ).height( h ).width( w ).resize();
                    } else {
                        dialog$.find( "section,main,aside" ).height( h );
                        w -= dialog$.find( "aside" ).outerWidth() || 0;
                        dialog$.find( "main" ).width( w );
                        rec$.width( w );
                        rec$.height( h ).recordView( "resize" );
                        w = dialog$.find( "aside" ).width();
                        h -= dialog$.find( ".tb" ).outerHeight();
                        if ( grid$ ) {
                            grid$.width( w ).height( h ).grid( "resize" );
                        } else if ( tree$ ) {
                            tree$.width( w ).height( h );
                        }
                        util.setOuterWidth( dialog$.find( ".tb" ), w );
                    }
                }
            }
        );

        if ( dlgOptions.dialogHelp ) {
            dlgOptions.buttons.unshift( {
                    text: lang.getMessage( "APEX.DIALOG.HELP" ),
                    "class": "ui-button-help",
                    click: function() {
                        var dialogHelp = dlgOptions.dialogHelp;

                        // todo consider if there is a need to get dynamic help text from a callback function

                        // its OK if either of the optional keys are missing in the array
                        lang.loadMessagesIfNeeded( [dialogHelp.titleKey, dialogHelp.helpTextKey], function() {
                            var helpInfo = {
                                title: dialogHelp.title,
                                helpText: dialogHelp.helpText
                            };
                            if ( dialogHelp.titleKey ) {
                                helpInfo.title = lang.getMessage( dialogHelp.titleKey );
                            }
                            if ( dialogHelp.helpTextKey ) {
                                helpInfo.helpText = lang.getMessage( dialogHelp.helpTextKey );
                            }
                            apex.theme.popupFieldHelp( helpInfo );
                        });
                    }
                }
            );
        }

        if ( dlgOptions.titleKey ) {
            dlgOptions.title = lang.getMessage( dlgOptions.titleKey );
            delete dlgOptions.titleKey;
        }

        dialog$.html( out.toString() ).dialog( dlgOptions )
            .on( "dialogopen", function( ) {
                apex.navigation.beginFreezeScroll();
            })
            .on( "dialogresize", function( ) {
                // resize sets position to absolute so fix what resizable broke
                jQuery( this ).closest( ".ui-dialog" ).css( "position", "fixed" );
            })
            .on( "dialogclose", function( ) {
                apex.navigation.endFreezeScroll();
            });

        // It is possible that the form in this dialog has only one input field so the default browser behavior
        // of submitting the page on enter could kick in but we never want one of these dialogs to submit the page.
        dialog$.on( "keydown", function( event ) {
            var btn$;
            if ( event.which === keys.ENTER && event.target.nodeName === "INPUT" ) {
                if ( pOptions.defaultButton ) {
                    // Pressing enter in any text field will activate the default (hot) button
                    btn$ = dialog$.parent().find(".ui-button--hot" ).eq(0).focus();
                    // give time for the deactivation to happen
                    setTimeout(function() {
                        btn$.click();
                    }, 50);
                }
                event.preventDefault(); // don't submit the page
            }
        } );

        if ( pOptions.useSplitter && modelShape !== SHAPE_RECORD && $.apex.splitter ) {
            splitterPos = pOptions.splitterPosition || 200; // default to 200
            if ( pOptions.persistSplitter ) {
                splitterStorage = apex.storage.getScopedSessionStorage( {
                    prefix: "ORA_WWV_apex.MED_" + pOptions.persistSplitter,
                    useAppId: true
                } );
                splitterPos = parseInt( splitterStorage.getItem( "splitterPosition" ) || splitterPos, 10 );
            }
            splitter$ = dialog$.find(".a-IGDialog-body" ).splitter( {
                position:  splitterPos,
                collapsed: false,
                minSize: 120,
                orientation: "horizontal",
                positionedFrom: "begin",
                noCollapse: true,
                change: function(e, ui) {
                    if ( splitterStorage ) {
                        splitterStorage.setItem( "splitterPosition", (ui.lastPosition - ui.lastPosition % 1) + "" );
                    }
                }
                // xxx labels
            } );
            dialog$.on("resize", function( event ) {
                var h, w, resize$, pos,
                    parent$ = $( event.target );

                h = parent$.height();
                w = parent$.width();
                resize$ = parent$.children( ".resize" ).filter( SEL_VISIBLE );
                if ( resize$.length > 0 ) {
                    parent$.children( ":not(.resize)" ).filter( SEL_VISIBLE ).each( function() {
                        pos = $( this ).css( "position" );
                        if ( pos !== "fixed" && pos !== "absolute" ) {
                            h -= $( this ).outerHeight( true );
                        }
                    });
                    h = Math.floor( h / resize$.length );
                    resize$.each( function() {
                        var el$ = $(this);
                        util.setOuterHeight( el$, h );
                        util.setOuterWidth( el$, w );
                        el$.filter( SEL_VISIBLE ).trigger( "resize" );
                    });
                }
                event.stopPropagation();
            } );
        }

        // replace dialog's destroy method so model can be cleaned up
        var dlgInst = dialog$.data( "ui-dialog" );
        var origDestroy = dlgInst._destroy;
        dlgInst._destroy = function() {
            origDestroy.call( dlgInst );
            model.destroy( pOptions.modelName );
        };

        return dialog$;
    };

})( apex.util, apex.model, apex.debug, apex.lang, apex.item, apex.actions, apex.jQuery );
