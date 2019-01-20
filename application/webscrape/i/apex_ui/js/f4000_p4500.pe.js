/*global apex,pe,gPreferences*/

/**
 @license

 Oracle Database Application Express, Release 5.1

 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * This module is part of the page designer and contains the controller logic for the Property Editor.
 **/

(function( model, $, debug, lang, util, pd, nav, server, templateOptionsHelper ) {
    "use strict";

    // General globals
    var pe$, gIconFont$,
        gLastComponents = null;

    // General constants
    var PE_WIDGET_NAME = "property_editor";

    // CSS class constants
    var PROPERTY =                              "a-Property",
        PROPERTY_FIELD =                        PROPERTY + "-field",
        PROPERTY_FIELD_TEXT =                   PROPERTY_FIELD + "--text",
        PROPERTY_FIELD_CONTAINER =              PROPERTY + "-fieldContainer",
        PROPERTY_SET_ITEMS_HEADER_HEADER =      PROPERTY + "-setItemsHeader-header",
        PROPERTY_SET_ITEMS_TABLE =              PROPERTY + "-setItemsTable",
        PROPERTY_SET_ITEMS_TABLE_REMOVE_COL =   PROPERTY_SET_ITEMS_TABLE + "-removeCol",
        PROPERTY_STATIC_LOV_VALUES_HEADER_HEADER =    PROPERTY + "-setItemsHeader-header",
        PROPERTY_STATIC_LOV_VALUES_TABLE =            PROPERTY + "-setItemsTable",
        PROPERTY_STATIC_LOV_VALUES_TABLE_REMOVE_COL = PROPERTY_STATIC_LOV_VALUES_TABLE + "-removeCol",
        IS_ACTIVE =                             "is-active",
        BUTTON =                                "a-Button",
        BUTTON_PROPERTY =                       "a-Property-button",
        BUTTON_HOT =                            BUTTON + "--hot",
        BUTTON_FORCE_WRAP =                     BUTTON + "--forceWrap",
        LINK_DIALOG_ITEM_NAME =                 "linkDlgItemName",
        LINK_DIALOG_ITEM_VALUE =                "linkDlgItemValue",
        LINK_DIALOG_SET_ITEMS_ROW_DATA =        "linkDlgSetItemsRowData",
        STATIC_LOV_VALUE_DISPLAY =              "linkDlgItemName",
        STATIC_LOV_VALUE_RETURN =               "linkDlgItemValue",
        STATIC_LOV_VALUES_ROW_DATA =            "linkDlgSetItemsRowData",
        // icons
        ICON =                                  "a-Icon",
        ICON_REMOVE =                           ICON + " icon-remove",
        ICON_MOVE_UP =                          ICON + " icon-shuttle-up",
        ICON_MOVE_DOWN =                        ICON + " icon-shuttle-down",
        ICON_LOV =                              ICON + " icon-popup-lov",
        ICON_GO_TO_COMPONENT =                  ICON + " icon-go-to-component",
        // utility classes
        VISUALLY_HIDDEN =                       "u-VisuallyHidden",
        DIALOG_FLUSH_BODY =                     "ui-dialog-flushBody",
        IS_CHANGED =                            "is-changed";

    // Property type constants
    var PROP_TYPE = {
        // xxx APEX specific many are based on the above basic ones with perhaps some extra validation
        // consider separating validation from rendering
        CSS: "CSS",
        JAVASCRIPT: "JAVASCRIPT",
        HTML: "HTML",
        COMPONENT: "COMPONENT",
        LINK: "LINK",
        ITEM: "ITEM",
        PAGE: "PAGE",
        PLSQL: "PLSQL",
        PLSQL_EXPR_VARCHAR: "PLSQL EXPRESSION VARCHAR2",
        PLSQL_EXPR_BOOLEAN: "PLSQL EXPRESSION BOOLEAN",
        PLSQL_FUNC_VARCHAR: "PLSQL FUNCTION BODY VARCHAR2",
        PLSQL_FUNC_BOOLEAN: "PLSQL FUNCTION BODY BOOLEAN",
        PLSQL_FUNC_SQL:     "PLSQL FUNCTION BODY SQL",
        SQL: "SQL",
        SQL_EXPR:         "SQL EXPRESSION",
        SQL_EXPR_BOOLEAN: "SQL EXPRESSION BOOLEAN",
        SUBSCRIPTION: "SUBSCRIPTION",
        SUPPORTED_UI:             "SUPPORTED UI",
        OWNER:                    "OWNER",
        TABLE:                    "TABLE",
        COLUMN:                   "COLUMN",
        REGION_COLUMN:            "REGION COLUMN",
        WHERE_CLAUSE:             "WHERE CLAUSE",
        ORDER_BY_CLAUSE:          "ORDER BY CLAUSE",
        ICON:                     "ICON",
        LINK_SET_ITEMS:           "LINK SET ITEMS",
        TEXT_EDITOR:              "TEXT EDITOR",
        HIDDEN:                   "HIDDEN",
        XML:                      "XML",
        TEMPLATE_OPTIONS:         "TEMPLATE OPTIONS",
        TEMPLATE_OPTIONS_GENERAL: "TEMPLATE OPTIONS GENERAL",
        STATIC_LOV:               "STATIC LOV",
        STATIC_LOV_VALUES:        "STATIC LOV VALUES",
        // also need constants for base widget property types where they are excluded from multi-edit
        CHECKBOXES:               "CHECKBOXES",
        POPUP_LOV:                "POPUP LOV",
        RADIOS:                   "RADIOS",
        // and constants for base widget property types that need to be checked for possible different lov values in multi-edit
        SELECT_LIST:              "SELECT LIST"
    };
    var TYPES_EXCLUDED_FROM_MULTI_EDIT = [
        PROP_TYPE.CHECKBOXES,
        PROP_TYPE.COLUMN,
        PROP_TYPE.CSS,
        PROP_TYPE.JAVASCRIPT,
        PROP_TYPE.HIDDEN,
        PROP_TYPE.HTML,
        PROP_TYPE.LINK,
        PROP_TYPE.STATIC_LOV,
        PROP_TYPE.OWNER,
        PROP_TYPE.PLSQL,
        PROP_TYPE.PLSQL_EXPR_VARCHAR,
        PROP_TYPE.PLSQL_EXPR_BOOLEAN,
        PROP_TYPE.PLSQL_FUNC_VARCHAR,
        PROP_TYPE.PLSQL_FUNC_BOOLEAN,
        PROP_TYPE.PLSQL_FUNC_SQL,
        PROP_TYPE.REGION_COLUMN,
        PROP_TYPE.POPUP_LOV,
        PROP_TYPE.RADIOS,
        PROP_TYPE.SQL,
        PROP_TYPE.SQL_EXPR,
        PROP_TYPE.SQL_EXPR_BOOLEAN,
        PROP_TYPE.TABLE,
        PROP_TYPE.TEMPLATE_OPTIONS,
        PROP_TYPE.TEMPLATE_OPTIONS_GENERAL,
        PROP_TYPE.TEXT_EDITOR,
        PROP_TYPE.WHERE_CLAUSE,
        PROP_TYPE.XML,
        PROP_TYPE.HTML
    ];

    var DATA_PROPERTY_ID = "data-property-id";

    // Specific constants used by property types
    var LINK = {
            PROP:  {
                TYPE:               "linkType",
                APPLICATION:        "linkApp",
                PAGE:               "linkPage",
                URL:                "linkUrl",
                SET_ITEMS:          "linkSetItems",
                CLEAR_CACHE:        "linkClearCache",
                RESET_PAGINATION:   "linkResetPagination",
                REQUEST:            "linkRequest",
                ANCHOR:             "linkAnchor",
                SUCCESS_MESSAGE:    "linkSuccessMessage"
            },
        DISPLAY_GROUP: {
                TARGET:             "TARGET",
                SET_ITEMS:          "SET_ITEMS",
                CLEAR_SESSION:      "CLEAR_SESSION_STATE",
                ADVANCED:           "ADVANCED"
            },
            TYPES: {
                PAGE_IN_THIS_APP:   "PAGE_IN_THIS_APP",
                PAGE_IN_DIFF_APP:   "PAGE_IN_DIFF_APP",
                URL:                "URL"
            }
        },
        STATIC_LOV = {
            PROP:  {
                VALUES: "staticLovValues",
                SORT:   "staticLovSort"
            },
            GROUP: {
                VALUES: "VALUES"
            }
        };

    var PREF_CODE_EDITOR_DLG_W  = "PE_CODE_EDITOR_DLG_W",
        PREF_CODE_EDITOR_DLG_H  = "PE_CODE_EDITOR_DLG_H";

    var gCurrentCollapsedGroups = {}; //todo do we still need this with removal of expand / collapse buttons

    function msg( pKey ) {
        return lang.getMessage( "PD.PE." + pKey );
    }

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    }

    function formatNoEscape( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    }

    /*
     * Controller specific APEX property types
     */
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SUPPORTED_UI, {
        init: function( pElement$, prop ) {

            var NOT_CURRENT_VALUE = ":not([value='" + util.escapeCSS( pElement$.val()) + "'])"; // xxx try to avoid escapeCSS

            var lSavedOptions;

            // call base select init
            this[ "super" ]( "init", pElement$, prop );

            lSavedOptions = pElement$.html();

            // Hide all unsupported and legacy components, but not if it's the current selection
            pElement$.find( "[data-is-supported=false],[data-is-legacy=true]").filter( NOT_CURRENT_VALUE ).remove();

            // Append the "Show Legacy/Unsupported" option
            pElement$.append(
                $( "<option>" )
                    .attr( "value", "$LEGACY_UNSUPPORTED$" )
                    .text( msg( "SHOW_LEGACY_UNSUPPORTED" ) )
            );

            // Register a change event to show legacy and "unsupported" components if the user wants to see them
            pElement$.change( function() {
                if ( pElement$.val() === "$LEGACY_UNSUPPORTED$" ) {
                    // Restore the original options and show legacy/unsupported components
                    pElement$
                        .empty()
                        .append( lSavedOptions );
                }
            });
            
        }
    }, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );

    /*
     * Controller specific APEX property types
     */
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.COMPONENT, {

        render: function( out, id, prop ) {

            // Shared Components which are displayed in the "Page Shared Components" tree
            var SHARED_COMPONENT_TYPES = [
                    model.COMP_TYPE.STATIC_LOV,
                    model.COMP_TYPE.LIST,
                    model.COMP_TYPE.BREADCRUMB,
                    model.COMP_TYPE.PAGE_TEMPLATE,
                    model.COMP_TYPE.FIELD_TEMPLATE,
                    model.COMP_TYPE.BUTTON_TEMPLATE,
                    model.COMP_TYPE.REGION_TEMPLATE,
                    model.COMP_TYPE.LIST_TEMPLATE,
                    model.COMP_TYPE.BREADCRUMB_TEMPLATE,
                    model.COMP_TYPE.CALENDAR_TEMPLATE,
                    model.COMP_TYPE.REPORT_TEMPLATE,
                    model.COMP_TYPE.AUTHORIZATION,
                    model.COMP_TYPE.BUILD_OPTION,
                    model.COMP_TYPE.DATA_LOAD_TABLE,
                    model.COMP_TYPE.WS_REF ];

            var lComponentType = model.getComponentType( prop.metaData.lovComponentTypeId ),
                lButton;

            // If the component is visible in Page Designer then add the "Go to xxx" button
            if ( lComponentType.isPageComponent || $.inArray( prop.metaData.lovComponentTypeId, SHARED_COMPONENT_TYPES ) !== -1 ) {
                lButton = {
                    icon: ICON_GO_TO_COMPONENT,
                    text: formatNoEscape( "GO_TO_COMPONENT", lComponentType.title.singular )
                };
            }

            this[ "super" ]( "render", out, id, prop, lButton );
        },

        init: function( pElement$, prop ) {

            var lButton$ = $( "#" + pElement$.attr( "id" ) + "_btn" );

            function _setButtonState() {

                // Disable the button if we don't have a value or it's not a numeric component id
                // For example some authorization schemes are hardcoded and no real components
                if ( pElement$.val() !== "" && /^[-!]?[0-9]*$/.test( pElement$.val() )) {
                    lButton$.attr( "disabled", false );
                } else {
                    lButton$.attr( "disabled", true );
                }

            } // _setButtonState


            this[ "super" ]( "init", pElement$, prop );

            if ( lButton$.length > 0 ) {

                // Register a change event to enable/disable the button
                pElement$.change( _setButtonState );
                _setButtonState();

                lButton$.on( "click", function() {

                    var lComponentId = prop.value,
                        lComponent;

                    if ( lComponentId !== "" ) {

                        // Build Options and Authorization use ! or - to negate it, we have to remove that prefix
                        if (  ( prop.metaData.lovComponentTypeId === model.COMP_TYPE.BUILD_OPTION || prop.metaData.lovComponentTypeId === model.COMP_TYPE.AUTHORIZATION )
                           && /^[-!]/.test( lComponentId ))
                        {
                            lComponentId = lComponentId.substr( 1 );
                        }

                        lComponent = model.getComponents( prop.metaData.lovComponentTypeId, { id: lComponentId })[ 0 ];
                        pd.goToComponent( lComponent.typeId, lComponent.id );
                    }

                });

            }

        }

    }, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.LINK, {

        /* Internal helper functions */
        _getButtonText: function( pUrl ) {

            function shortUrl( pUrl ) {
                var lTruncatedUrl = pUrl;

                // remove "http://"
                if ( lTruncatedUrl.indexOf( "http://" ) === 0 ) {
                    lTruncatedUrl = lTruncatedUrl.substr( 7 );
                }
                // remove "www."
                if ( lTruncatedUrl.indexOf( "www." ) === 0 ) {
                    lTruncatedUrl = lTruncatedUrl.substr( 4 );
                }
                return lTruncatedUrl;
            }

            var lLinkObject,
                lButtonText = msg( "LINK.NO_LINK_DEFINED" );
            if ( pUrl ) {
                // if multi-edit, check if values vary, if so, return empty string
                if ( pUrl !== pe$.propertyEditor( "getValueVariesConstant" ) ) {
                    lLinkObject = pd.splitApexUrl( pUrl );
                    lButtonText = lLinkObject.display;
                } else {
                    lButtonText = "";
                }

            }
            return lButtonText;
        },

        /* Internal functions, storing the widget's metadata */
        _getDisplayGroupTarget: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.TARGET,
                displayGroupTitle:  msg( "LINK.DG.TARGET" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupSetItems: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.SET_ITEMS,
                displayGroupTitle:  msg( "LINK.DG.SET_ITEMS" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupClearSessionState: function ( pProperties ) {
            return {
                displayGroupId:     LINK.DISPLAY_GROUP.CLEAR_SESSION,
                displayGroupTitle:  msg( "LINK.DG.CLEAR_SESSION" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupAdvanced: function ( pProperties ) {
            var i, lCollapsed = true;

            if ( pProperties ) {

                // Expand display group if any of the properties have a value
                for ( i = 0; i < pProperties.length; i++ ) {
                    if ( pProperties[ i ].value ) {
                        lCollapsed = false;
                        break;
                    }
                }
            }

            return {
                displayGroupId:     LINK.DISPLAY_GROUP.ADVANCED,
                displayGroupTitle:  msg( "LINK.DG.ADVANCED" ),
                collapsed:          lCollapsed,
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getPropertyLinkType: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.TYPE,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.SELECT_LIST,
                    prompt:         msg( "TYPE" ),
                    isRequired:     true,
                    lovValues: [
                        { d: msg( "LINK.TYPE.PAGE_IN_THIS_APP" ),   r: LINK.TYPES.PAGE_IN_THIS_APP },
                        { d: msg( "LINK.TYPE.PAGE_IN_DIFF_APP" ),   r: LINK.TYPES.PAGE_IN_DIFF_APP },
                        { d: msg( "LINK.URL" ),                     r: LINK.TYPES.URL     }
                    ],
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [], // array of strings xxx so far we only care about the count > 0
                warnings:           []  // array of strings xxx so far we only care about the count > 0
            }, pProperty );

        },
        _getPropertyLinkApp: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.APPLICATION,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "APPLICATION" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkPage: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.PAGE,
                value:              "",
                metaData: {
                    type:           PROP_TYPE.PAGE,
                    prompt:         msg( "LINK.PAGE" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkUrl: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.URL,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "LINK.URL" ),
                    isRequired:     true,
                    displayGroupId: LINK.DISPLAY_GROUP.TARGET
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkSetItems: function ( pProperty, pOriginalProperty ) {
            return $.extend( true, {
                propertyName:           LINK.PROP.SET_ITEMS,
                value:                  { names: [], values: [] },
                metaData: {
                    type:               PROP_TYPE.LINK_SET_ITEMS,
                    prompt:             msg( "LINK.DG.SET_ITEMS" ),
                    displayGroupId:     LINK.DISPLAY_GROUP.SET_ITEMS,
                    originalProperty:   pOriginalProperty
                },
                errors:                 [],
                warnings:               []
            }, pProperty );
        },
        _getPropertyLinkClearCache: function ( pProperty ) {
            return $.extend( true, {
                propertyName:               LINK.PROP.CLEAR_CACHE,
                value:                      "",
                metaData: {
                    prompt:                 msg( "LINK.CLEAR_CACHE" ),
                    type:                   PROP_TYPE.PAGE,
                    multiValueDelimiter:    ",",
                    displayGroupId:         LINK.DISPLAY_GROUP.CLEAR_SESSION
                },
                errors:                     [],
                warnings:                   []
            }, pProperty );
        },
        _getPropertyLinkResetPagination: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.RESET_PAGINATION,
                value:              "Y",
                metaData: {
                    prompt:         msg( "LINK.RESET_PAGINATION" ),
                    type:           $.apex.propertyEditor.PROP_TYPE.YES_NO,
                    noValue:        "N",
                    yesValue:       "Y",
                    displayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION,
                    isRequired:     true
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkRequest: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.REQUEST,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "LINK.REQUEST" ),
                    displayGroupId: LINK.DISPLAY_GROUP.ADVANCED
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkAnchor: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.ANCHOR,
                value:              "",
                metaData: {
                    type:           $.apex.propertyEditor.PROP_TYPE.TEXT,
                    prompt:         msg( "LINK.ANCHOR" ),
                    displayGroupId: LINK.DISPLAY_GROUP.ADVANCED
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },
        _getPropertyLinkSuccessMessage: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       LINK.PROP.SUCCESS_MESSAGE,
                value:              "Y",
                metaData: {
                    prompt:         msg( "LINK.SUCCESS_MESSAGE" ),
                    type:           $.apex.propertyEditor.PROP_TYPE.YES_NO,
                    noValue:        "N",
                    yesValue:       "Y",
                    displayGroupId: LINK.DISPLAY_GROUP.ADVANCED,
                    isRequired:     true
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },

        /* Property type properties and callbacks */
        noLabel: true,
        render: function( out, id, prop ) {
            var lLabelId = id + "_label";

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            out.markup( "<button" )
                .attr( "type", "button" )
                .attr( "id", id )
                .attr( "aria-describedby", lLabelId )
                .attr( "class", BUTTON + " " + BUTTON_PROPERTY + " " + BUTTON_FORCE_WRAP )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .attr( "value", prop.value )
                .markup( ">" )
                .content( this._getButtonText( prop.value ) )
                .markup( "</button>" );
            this.renderDivClose( out );
        },
        setValue: function( pElement$, prop, pValue ) {
            var lDisplayValue;

            this[ "super" ]( "setValue", pElement$, prop, pValue );

            // update the button text accordingly
            lDisplayValue = this._getButtonText( pValue );
            pElement$
                .html( lDisplayValue )
                .attr( "title", lDisplayValue );

        },
        init: function( pElement$, prop ) {
            var i,
                LAST_COMPONENT_COLUMNS,
                LAST_COMPONENT_COLUMN_NAMES = [],
                that = this,
                LAST_COMPONENT_TYPE_ID = model.getComponentType( gLastComponents[ 0 ].typeId ).id,
                HASH_SYNTAX_COMP_TYPES = [
                    model.COMP_TYPE.IR_ATTRIBUTES,
                    model.COMP_TYPE.IR_COLUMN,
                    model.COMP_TYPE.CLASSIC_RPT_COLUMN,
                    model.COMP_TYPE.TAB_FORM_COLUMN,
                    model.COMP_TYPE.CHART_SERIES,
                    model.COMP_TYPE.MAP_CHART_SERIES ];

            this.addLabelClickHandler( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );

            // For component types that use # substitution syntax, we need to get the column list to pass to
            // the URL splitting logic, such that it can determine what are valid substitutions
            if ( $.inArray( LAST_COMPONENT_TYPE_ID, HASH_SYNTAX_COMP_TYPES ) > -1 ) {

                // Get column definitions
                LAST_COMPONENT_COLUMNS = model.getItemsLov( {
                    type:       "columns",
                    component:  gLastComponents[ 0 ]
                });

                for ( i = 0; i < LAST_COMPONENT_COLUMNS.length; i++ ) {
                    LAST_COMPONENT_COLUMN_NAMES.push( LAST_COMPONENT_COLUMNS[ i ].name );
                }
            }

            // the main click handler that launches the link dialog
            pElement$.closest( "div." + PROPERTY ).on( "click", "#" + pElement$.attr( "id" ), function() {
                var lLinkDlg$,
                    lTypeValue,
                    out = util.htmlBuilder(),
                    lLinkObject = pd.splitApexUrl( pElement$.val(), null, LAST_COMPONENT_COLUMN_NAMES ),
                    lPropertySet = [],
                    lBranchMode = false,
                    lButtonMode = false,
                    lLinkRequired = prop.metaData.isRequired,
                    lLinkReadOnly = prop.metaData.isReadOnly;

                // Link property types do not support multi-edit, so we can just look at the first selected to determine
                // the current component type.
                switch ( model.getComponentType( gLastComponents[ 0 ].typeId ).id ) {
                    case model.COMP_TYPE.BRANCH:
                        lBranchMode = true;
                        break;
                    case model.COMP_TYPE.BUTTON:
                        lButtonMode = true;
                        break;
                }

                if ( lButtonMode ) {
                    switch ( pe$.propertyEditor( "getPropertyValue", model.PROP.BUTTON_ACTION ) ) {
                        case "REDIRECT_URL":
                            lTypeValue = pd.LINK_TYPE.URL;
                            break;
                        case "REDIRECT_PAGE":
                            lTypeValue = pd.LINK_TYPE.PAGE_IN_THIS_APP;
                            break;
                        case "REDIRECT_APP":
                            lTypeValue = pd.LINK_TYPE.PAGE_IN_DIFF_APP;
                            break;
                    }
                } else {
                    lTypeValue = lLinkObject.type;
                }

                function _getProperty ( pPropertyName ) {
                    var i, j, lProperty;
                    for ( i = 0; i < lPropertySet.length; i++ ) {
                        for ( j = 0; j < lPropertySet[ i ].properties.length; j++ ) {
                            if ( lPropertySet[ i ].properties[ j ].propertyName === pPropertyName ) {
                                lProperty = lPropertySet[ i ].properties[ j ];
                                break;
                            }
                        }
                    }
                    return lProperty;
                }

                lPropertySet.push (
                    that._getDisplayGroupTarget( [
                        that._getPropertyLinkType({
                            value:          lTypeValue,
                            metaData: {
                                isReadOnly: lLinkReadOnly || lButtonMode,
                                isRequired: lLinkRequired
                            }
                        }),
                        that._getPropertyLinkApp({
                            value:          ( lTypeValue === pd.LINK_TYPE.PAGE_IN_DIFF_APP ) ?  lLinkObject.appId : "",
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkPage({
                            value:          lLinkObject.pageId,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkUrl({
                            value:          lLinkObject.url,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        })
                    ])
                );
                lPropertySet.push (
                    that._getDisplayGroupSetItems( [
                        that._getPropertyLinkSetItems({
                            value: {
                                names:  lLinkObject.itemNames,
                                values: lLinkObject.itemValues
                            },
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        },
                        prop )
                    ])
                );
                lPropertySet.push (
                    that._getDisplayGroupClearSessionState( [
                        that._getPropertyLinkClearCache({
                            value:          lLinkObject.clearCache,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        }),
                        that._getPropertyLinkResetPagination({
                            value:          lLinkObject.resetPagination,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        })
                    ])
                );
                var lDisplayGroupAdvancedProps = [];
                lDisplayGroupAdvancedProps.push( that._getPropertyLinkRequest({
                    value:          lLinkObject.request,
                    metaData: {
                        isReadOnly: prop.metaData.isReadOnly
                    }
                }) );
                lDisplayGroupAdvancedProps.push( that._getPropertyLinkAnchor({
                    value:          lLinkObject.anchor,
                    metaData: {
                        isReadOnly: prop.metaData.isReadOnly
                    }
                }) );
                if ( lBranchMode ) {
                    lDisplayGroupAdvancedProps.push( that._getPropertyLinkSuccessMessage({
                        value:          lLinkObject.successMessage,
                        metaData: {
                            isReadOnly: prop.metaData.isReadOnly
                        }
                    }) );
                }
                lPropertySet.push ( that._getDisplayGroupAdvanced( lDisplayGroupAdvancedProps ) );

                // create dialog div
                out.markup( "<div" )
                    .attr( "id", "linkDlg" )
                    .attr( "title", formatNoEscape( "LINK.TITLE", prop.metaData.prompt ) ) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "linkDlgPE" )
                    .markup( ">" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                lLinkDlg$ = $( out.toString() ).dialog( {
                    modal:          true,
                    closeText:      lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    minWidth:       400,
                    width:          520,
                    dialogClass:    DIALOG_FLUSH_BODY,
                    close: function() {
                        $( "#linkDlgPE" ).propertyEditor( "destroy" );
                        lLinkDlg$.dialog( "destroy" );
                    },
                    open: function() {
                        function _showProperties( pLinkType ) {
                            var lProperty = {
                                metaData: {
                                    isReadOnly: prop.metaData.isReadOnly
                                }
                            };

                            switch ( pLinkType ) {
                                case LINK.TYPES.PAGE_IN_THIS_APP:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkPage( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkSetItems( lProperty, prop ),
                                        displayGroup:       that._getDisplayGroupSetItems(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.TARGET
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkClearCache( lProperty ),
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkResetPagination( lProperty ),
                                        prevPropertyName:   LINK.PROP.CLEAR_CACHE,
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkRequest( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });

                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkAnchor( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });

                                    if ( lBranchMode ) {
                                        lLinkDlgPE$.propertyEditor( "addProperty", {
                                            property:           that._getPropertyLinkSuccessMessage( lProperty ),
                                            prevPropertyName:   LINK.PROP.RESET_PAGINATION,
                                            displayGroup:       that._getDisplayGroupAdvanced(),
                                            prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                        });
                                    }
                                    break;
                                case LINK.TYPES.PAGE_IN_DIFF_APP:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkApp( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkPage( lProperty ),
                                        prevPropertyName:   LINK.PROP.APPLICATION,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkSetItems( lProperty, prop ),
                                        displayGroup:       that._getDisplayGroupSetItems(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.TARGET
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkClearCache( lProperty ),
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkResetPagination( lProperty ),
                                        prevPropertyName:   LINK.PROP.CLEAR_CACHE,
                                        displayGroup:       that._getDisplayGroupClearSessionState(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.SET_ITEMS
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkRequest( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkAnchor( lProperty ),
                                        displayGroup:       that._getDisplayGroupAdvanced(),
                                        prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                    });
                                    if ( lBranchMode ) {
                                        lLinkDlgPE$.propertyEditor( "addProperty", {
                                            property:           that._getPropertyLinkSuccessMessage( lProperty ),
                                            prevPropertyName:   LINK.PROP.RESET_PAGINATION,
                                            displayGroup:       that._getDisplayGroupAdvanced(),
                                            prevDisplayGroupId: LINK.DISPLAY_GROUP.CLEAR_SESSION
                                        });
                                    }
                                    break;
                                case LINK.TYPES.URL:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.PAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SET_ITEMS );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.REQUEST );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.ANCHOR );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.CLEAR_CACHE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.RESET_PAGINATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SUCCESS_MESSAGE );
                                    lLinkDlgPE$.propertyEditor( "addProperty", {
                                        property:           that._getPropertyLinkUrl( lProperty ),
                                        prevPropertyName:   LINK.PROP.TYPE,
                                        displayGroup:       that._getDisplayGroupTarget()
                                    });
                                    break;
                                default:
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.APPLICATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.PAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SET_ITEMS );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.REQUEST );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.ANCHOR );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.CLEAR_CACHE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.RESET_PAGINATION );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.SUCCESS_MESSAGE );
                                    lLinkDlgPE$.propertyEditor( "removeProperty", LINK.PROP.URL );
                                    break;
                            }
                        }
                        var lLinkDlgPE$ = $( "#linkDlgPE" );
                        lLinkDlgPE$.propertyEditor( {
                            focusPropertyName: LINK.PROP.TYPE,
                            data: {
                                propertySet:    lPropertySet,
                                multiEdit:      false
                            },
                            change: function( pEvent, pData ) {
                                if ( pData.propertyName === LINK.PROP.TYPE ) {
                                    _showProperties( _getProperty( LINK.PROP.TYPE ).value );
                                }

                                // fixes issue where new properties added have stale values in lPropertySet
                                _getProperty( pData.propertyName ).value = pData.property.value;
                            }
                        });
                        _showProperties( _getProperty( LINK.PROP.TYPE ).value );

                        $( "#linkDlg" ).dialog({
                            position: { 'my': 'center', 'at': 'center', of: window  }
                        });
                    },
                    buttons: [
                        {
                            text:       msg( "CANCEL" ),
                            click:      function() {
                                lLinkDlg$.dialog( "close" );
                            }
                        },
                        {
                            text:       msg( "CLEAR" ),
                            disabled:   lLinkRequired || lLinkReadOnly,
                            click:      function() {
                                $( "#linkDlgPE" ).propertyEditor( "updatePropertyValue", LINK.PROP.TYPE, "" );
                                that.setValue( pElement$, prop, "" );
                                pElement$.trigger( "change" );
                                that.setFocus( pElement$ );
                                lLinkDlg$.dialog( "close" );
                            }
                        },
                        {
                            text:       msg( "OK" ),
                            "class":      BUTTON_HOT,
                            disabled:   lLinkReadOnly,
                            click:      function() {
                                var lType, lReturnLink,
                                    lErrorProps = [];

                                // Compute clear cache value, reset pagination is stored as "RP" in clear cache
                                function _getClearCache( pResetPagination, pClearCache ) {
                                    var lClearCache = "";
                                    if ( pResetPagination === "Y" ) {
                                        if ( pClearCache === "" ) {
                                            lClearCache = "RP";
                                        } else {
                                            lClearCache = "RP," + pClearCache;
                                        }
                                    } else {
                                        lClearCache = pClearCache;
                                    }
                                    return lClearCache;
                                }
                                function _addError( pPropertyName, pErrorMsg ) {
                                    var lErrorProp = _getProperty( pPropertyName );
                                    lErrorProp.errors.push( pErrorMsg );
                                    return lErrorProp;
                                }

                                lType = _getProperty( LINK.PROP.TYPE ).value;
                                if ( lType === LINK.TYPES.PAGE_IN_THIS_APP || lType === LINK.TYPES.PAGE_IN_DIFF_APP ) {

                                    if ( lType === LINK.TYPES.PAGE_IN_DIFF_APP && _getProperty( LINK.PROP.APPLICATION ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.APPLICATION, msg( "IS_REQUIRED" ) ) );
                                    }
                                    // todo look at using validate callback for property type instead
                                    if ( _getProperty( LINK.PROP.PAGE ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.PAGE, msg( "IS_REQUIRED" ) ) );
                                    }
                                    if ( lErrorProps.length === 0 ) {

                                        lReturnLink =
                                            "f?p=" +
                                            (( lType === LINK.TYPES.PAGE_IN_THIS_APP ) ? "&APP_ID." : _getProperty( LINK.PROP.APPLICATION ).value ) +
                                            ":" + _getProperty( LINK.PROP.PAGE ).value +
                                            ":" + "&SESSION." +
                                            ":" + _getProperty( LINK.PROP.REQUEST ).value +
                                            ":" + "&DEBUG." +
                                            ":" + _getClearCache(
                                                      _getProperty( LINK.PROP.RESET_PAGINATION ).value,
                                                      _getProperty( LINK.PROP.CLEAR_CACHE ).value ) +
                                            ":" + ( _getProperty( LINK.PROP.SET_ITEMS ).value.names  || [] ).join( "," ) +
                                            ":" + ( _getProperty( LINK.PROP.SET_ITEMS ).value.values || [] ).join( "," );

                                        if ( _getProperty( LINK.PROP.ANCHOR ).value ) {
                                            lReturnLink += "#" + _getProperty( LINK.PROP.ANCHOR ).value;
                                        }
                                        if ( lBranchMode && _getProperty( LINK.PROP.SUCCESS_MESSAGE ).value === "Y" ) {
                                            lReturnLink += "&success_msg=#SUCCESS_MSG#";
                                        }

                                    }
                                } else if ( lType === LINK.TYPES.URL ) {

                                    if ( _getProperty( LINK.PROP.URL ).value === "" ) {
                                        lErrorProps.push( _addError( LINK.PROP.URL, msg( "IS_REQUIRED" ) ) );
                                    }
                                    if ( lErrorProps.length === 0 ) {
                                        lReturnLink = _getProperty( LINK.PROP.URL ).value;
                                    }
                                }

                                if ( lErrorProps.length === 0 ) {
                                    that.setValue( pElement$, prop, lReturnLink );
                                    pElement$.trigger( "change" );
                                    that.setFocus( pElement$ );
                                    lLinkDlg$.dialog( "close" );
                                } else {
                                    for ( var i = 0; i < lErrorProps.length; i++ ) {
                                        $( "#linkDlgPE" ).propertyEditor( "updateProperty", lErrorProps[ i ] );
                                    }
                                    // set focus to first
                                    // error tooltip sufficient?
                                }
                            }
                        }
                    ]
                });
            });
        }
    } );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.LINK_SET_ITEMS, {
        stacked:        true,
        noLabel:        true,
        labelVisible:   false,
        minHeight:      85,
        maxHeight:      122,
        render: function( out, id, prop ) {
            var lLabelId    = id + "_label";
            out.markup( "<div" )
                .attr( "id", id )
                .attr( "class", PROPERTY_FIELD_CONTAINER )
                .attr( "aria-labelledby", lLabelId )
                .attr( "role", "group" )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .markup( ">" );

            out.markup( "<table" )
                .attr( "class", PROPERTY_SET_ITEMS_TABLE )
                .markup( ">" )
                .markup( "<caption" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.DG.SET_ITEMS" ) )
                .markup( "</caption>" )
                .markup( "<tr>" )
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_SET_ITEMS_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "NAME" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.NAME_LIST_OF_VALUES" ) )
                .markup( ">" )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_SET_ITEMS_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "LINK.VALUE" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.VALUE_LIST_OF_VALUES" ) )
                .markup( ">" )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "LINK.REMOVE" ) )
                .markup( "</th>" )
                .markup( "</tr>" );

            for ( var i = 0; i < prop.value.names.length; i++ ) {
                this._renderLinkItemsRow( out, {
                    rowId:      i + 1,
                    idPrefix:   id,
                    name:       prop.value.names[ i ],
                    value:      prop.value.values[ i ],
                    readOnly:   prop.metaData.isReadOnly
                });
            }

            // If the property is currently editable, render an additional row for new items
            if ( !prop.metaData.isReadOnly ) {
                this._renderLinkItemsRow( out, {
                    rowId:      prop.value.names.length + 1,
                    idPrefix:   id
                });
            }
            out.markup( "</table>" );

            this.renderDivClose( out );
        },
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:      "name",
                        title:     msg( "NAME" ),
                        alignment: "left"
                    },
                    {
                        name:      "label",
                        title:     msg( "LABEL" ),
                        alignment: "left"
                    }
                ],
                filterLov: function ( pFilters, pRenderLovEntries ) {
                    var lType = "page",
                        lPageId;

                    switch ( pFilters.scope ) {
                        case "application":
                            lType   = "application";
                            lPageId = "";
                            break;
                        case "current_page":
                            lPageId = model.getCurrentPageId();
                            break;
                        case "global_page":
                            lPageId = model.getGlobalPageId();
                            break;
                        case "target_page":
                            lPageId = $( "#linkDlg" ).find( "[data-property-id=" + LINK.PROP.PAGE + "]" ).val();
                            break;
                        case "custom_page":
                            lPageId = pFilters.customPageNumber;
                            break;
                        case "columns":
                            lType   = "columns";
                            break;

                    }

                    // Link property types do not support multi-edit, so we can just look at the first selected to determine
                    // the current component type.
                    model.getItemsLov( {
                        type:       lType,
                        component:  gLastComponents[ 0 ],
                        pageId:     lPageId
                    },
                    function( pLovEntries ){
                        pRenderLovEntries( pLovEntries, pFilters.search );
                    });
                },
                multiValue: false,
                dialogTitle: formatNoEscape( "PICK", prop.metaData.prompt ) // escaping done by jQueryUI dialog
            };


            function openLovDialog( pReturnElement ) {
                var lLovDialog$,
                    out = util.htmlBuilder(),
                    lFilters = lOptions.filters;

                out.markup( "<div" )
                    .attr( "id", "lovDlg" )
                    .attr( "title", lOptions.dialogTitle )
                    .markup( ">" )
                    .markup( "</div>" );

                lLovDialog$ = $( out.toString() ).lovDialog({
                    modal:             true,
                    minWidth:          520,
                    height:            500,
                    filters:           lFilters,
                    columnDefinitions: lOptions.columnDefinitions,
                    filterLov:         lOptions.filterLov,
                    dialogClass:       DIALOG_FLUSH_BODY,
                    resizable:         false,
                    multiValue:        lOptions.multiValue,
                    valueSelected: function( pEvent, pData ) {

                        var lValue = pData[ lOptions.columnDefinitions[ 0 ].name ],
                            lReturnElement$ = $( "#" + pReturnElement );

                        if ( pData.valueFormatting && $.isFunction( pData.valueFormatting ) ) {
                            lValue = pData.valueFormatting( lValue );
                        }

                        lReturnElement$
                            .val( lValue )
                            .trigger( "change" );
                    }
                });
            }


            var that = this,
                lProperty$ = pElement$.closest( "div." + PROPERTY ),
                lId = pElement$.attr( "id" );

            // Only add interactivity if property is editable
            if ( !prop.metaData.isReadOnly ) {
                lProperty$
                    .on( "change", "input." + LINK_DIALOG_ITEM_NAME + ":last", function() {
                        var lNewRow = util.htmlBuilder(),
                            lDeleteButton = util.htmlBuilder(),
                            lLastNameInput$ = $( this );

                        if ( lLastNameInput$.val() ) {
                            var lCurrentRow = $( "input." + LINK_DIALOG_ITEM_NAME ).length;
                            that._renderLinkItemsRow( lNewRow, {
                                rowId:      lCurrentRow + 1,
                                idPrefix:   lId
                            });
                            that.renderIconButton( lDeleteButton, {
                                id:     lId + "_rowRemove_" + lCurrentRow,
                                icon:   ICON_REMOVE,
                                text:   format( "LINK.REMOVE_ITEM_N", lCurrentRow )
                            });
                            lLastNameInput$
                                .closest( "tr" )
                                .find( "td:last" )
                                .html( lDeleteButton.toString())
                                .end()
                                .after( lNewRow.toString());
                        }
                    })
                    .on( "click", "button[id^=" + lId + "_rowRemove_]", function() {
                        var lNewInput$ = $( this )
                            .closest( "tr" )
                            .next( "tr" )
                            .find( ":input:first" );

                        $( this )
                            .closest( "tr" )
                            .remove();
                        lNewInput$
                            .trigger( "change" )
                            .focus();
                    })
                    .on( "click", "button[id^=" + lId + "_nameLovBtn_]", function() {

                        lOptions.filters = [
                            {
                                name:         "scope",
                                title:        msg( "ITEM_SCOPE" ),
                                type:         "buttonset",
                                defaultValue: "target_page",
                                lov: [
                                    {
                                        display: msg( "TARGET_PAGE" ),
                                        value:   "target_page"
                                    },
                                    {
                                        display: msg( "CURRENT_PAGE" ),
                                        value:   "current_page"
                                    },
                                    {
                                        display: msg( "CUSTOM_PAGE" ),
                                        value:   "custom_page",
                                        filters: [
                                            {
                                                name:       "customPageNumber",
                                                title:      msg( "PAGE_NUMBER" ),
                                                type:       "text",
                                                isRequired: true
                                            }
                                        ]
                                    },
                                    {
                                        display: msg( "GLOBAL_PAGE" ),
                                        value:   "global_page"
                                    },
                                    {
                                        display: msg( "APPLICATION" ),
                                        value:   "application"
                                    }
                                ]
                            },
                            {
                                name:  "search",
                                title: msg( "SEARCH" ),
                                type:  "search"
                            }
                        ];

                        openLovDialog( $( this ).data( "for" ) );
                    })
                    .on( "click", "button[id^=" + lId + "_valueLovBtn_]", function() {

                        var i, j, lFilter,
                            lOriginalProperty = prop.metaData.originalProperty;

                        function ampersandPeriodEnquote( pValue ) {
                            return "&" + model.enquoteIdentifier( pValue ) + ".";
                            //return "&" + pValue + ".";
                        }

                        lOptions.filters = [
                            {
                                name:           "scope",
                                title:          msg( "ITEM_SCOPE" ),
                                type:           "buttonset",
                                defaultValue:   "current_page",
                                lov: [
                                    {
                                        display: msg( "TARGET_PAGE" ),
                                        value:   "target_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "CURRENT_PAGE" ),
                                        value:   "current_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "CUSTOM_PAGE" ),
                                        value:   "custom_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        },
                                        filters: [
                                            {
                                                name:       "customPageNumber",
                                                title:      msg( "PAGE_NUMBER" ),
                                                type:       "text",
                                                isRequired: true
                                            }
                                        ]
                                    },
                                    {
                                        display: msg( "GLOBAL_PAGE" ),
                                        value:   "global_page",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    },
                                    {
                                        display: msg( "APPLICATION" ),
                                        value:   "application",
                                        valueFormatting: function( pValue ){
                                            return ampersandPeriodEnquote( pValue );
                                        }
                                    }
                                ]
                            },
                            {
                                name:  "search",
                                title: msg( "SEARCH" ),
                                type:  "search"
                            }
                        ];

                        for ( i = 0; i < lOptions.filters.length; i++ ) {

                            lFilter = lOptions.filters[ i ];

                            if ( lFilter.name === "scope" ) {

                                // If property being edited has reference scope of 'row', replace 'target_page' filter with 'columns' filter
                                if ( lOriginalProperty.metaData.referenceScope === "ROW" ) {

                                    lFilter.defaultValue = "columns";

                                    for ( j = 0; j < lFilter.lov.length; j++ ) {

                                        if ( lFilter.lov[ j ].value === "target_page" ) {
                                            lFilter.lov[ j ] = {
                                                display:            msg( "COLUMNS" ),
                                                value:              "columns",
                                                valueFormatting:    function( pValue ){
                                                    var lFormat, lComponentTypeId,
                                                        HASH_SYNTAX_COMP_TYPES = [  model.COMP_TYPE.IR_ATTRIBUTES,
                                                                                    model.COMP_TYPE.IR_COLUMN,
                                                                                    model.COMP_TYPE.CLASSIC_RPT_COLUMN,
                                                                                    model.COMP_TYPE.TAB_FORM_COLUMN,
                                                                                    model.COMP_TYPE.CHART_SERIES,
                                                                                    model.COMP_TYPE.MAP_CHART_SERIES ];

                                                    // Note: Link doesn't support multi-edit currently, so we can just get the first gLastComponents
                                                    lComponentTypeId = model.getComponentType( gLastComponents[ 0 ].typeId ).id;

                                                    if ( $.inArray( lComponentTypeId, HASH_SYNTAX_COMP_TYPES ) !== -1 ) {
                                                        lFormat = "#" + pValue + "#";
                                                    } else {
                                                        lFormat = ampersandPeriodEnquote( pValue );
                                                    }
                                                    return lFormat;
                                                }
                                            };

                                            break;

                                        }

                                    }
                                }
                            }
                        }

                        openLovDialog( $( this ).data( "for" ) );

                    });
            }

            this.addLabelClickHandler( pElement$, prop );
        },
        setFocus: function( pElement$ ) {
            pElement$.find( ":input:first" ).focus();
        },
        getValue: function ( pProperty$ ) {
            var lName$, lValue$,
                lNames = [],
                lValues = [];
            pProperty$.find( "tr." + LINK_DIALOG_SET_ITEMS_ROW_DATA ).each( function() {
                lName$ = $( this ).find( ":input." + LINK_DIALOG_ITEM_NAME );
                lValue$ = $( this ).find( ":input." + LINK_DIALOG_ITEM_VALUE );
                if ( lName$.val() !== "" ) {
                    lNames.push( lName$.val());
                    lValues.push( lValue$.val());
                }
            });
            return {
                names: lNames,
                values: lValues
            };
        },
        _renderLinkItemsRow: function ( out, pOptions ) {
            var lItemNameId, lItemValueId,
                lOptions = $.extend( {
                    rowId:      "",
                    idPrefix:   "",
                    name:       "",
                    value:      "",
                    readOnly:   false
                }, pOptions );

            lItemNameId = lOptions.idPrefix + "_name_" + lOptions.rowId;
            lItemValueId = lOptions.idPrefix + "_value_" + lOptions.rowId;

            out.markup( "<tr" )
                .attr( "class", LINK_DIALOG_SET_ITEMS_ROW_DATA )
                .markup( ">" );
            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lItemNameId,
                value:      lOptions.name,
                inputClass: [ LINK_DIALOG_ITEM_NAME, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "LINK.ITEM_N_NAME", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td>" );
            this.renderIconButton( out, {
                id:         lOptions.idPrefix + "_nameLovBtn_" + lOptions.rowId,
                icon:       ICON_LOV,
                text:       format( "LINK.ITEM_N_NAME_LOV", lOptions.rowId ),
                dataFor:    lItemNameId,
                disabled:   lOptions.readOnly
            });
            out.markup( "</td>" );

            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lItemValueId,
                value:      lOptions.value,
                inputClass: [ LINK_DIALOG_ITEM_VALUE, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "LINK.ITEM_N_VALUE", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td>" );
            this.renderIconButton( out, {
                id:         lOptions.idPrefix + "_valueLovBtn_" + lOptions.rowId,
                icon:       ICON_LOV,
                text:       format( "LINK.ITEM_N_VALUE_LOV", lOptions.rowId ),
                dataFor:    lItemValueId,
                disabled:   lOptions.readOnly
            });
            out.markup( "</td>" );
            out.markup( "<td" )
                .attr( "class", PROPERTY_SET_ITEMS_TABLE_REMOVE_COL )
                .markup( ">" );

            // If we have an item name, then we also want to render the remove icon for that row
            if ( lOptions.name ) {
                this.renderIconButton( out, {
                    id:         lOptions.idPrefix + "_rowRemove_" + lOptions.rowId,
                    icon:       ICON_REMOVE,
                    text:       format( "LINK.REMOVE_ITEM_N", lOptions.rowId ),
                    disabled:   lOptions.readOnly
                });
            }
            out.markup( "</td>" );
            out.markup( "</tr>" );
        }
    });

    /*
     * Enhanced text area adds external editing of text in a a code mirror based editor
     */
    var DLG_MARGIN = 40,
        CODE_EDITOR_PREF_NAME = "CODE_EDITOR_SETTINGS";

    var gChangeGeneration = -1;

    var gEditorDlgWidth, gEditorDlgHeight, gEditorSettings;

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEXT_EDITOR, {

        render: function( out, id, prop ) {
            this[ "super" ]( "render", out, id, prop, true );
        },

        init: function( pElement$, prop ) {
            var lProperty$,
                that = this,
                lModalButton$ = $( "#" + pElement$.attr( "id" ) + "_modalBtn" );

            // xxx todo I think opening in text editor should only be allowed when editing a single component
            // (gLastComponents.length === 1 perhaps the same is true for editing in a dialog. The text editor
            // does NOT support multi edit!
            // for now just edit the first component

            // call base textarea init
            this[ "super" ]( "init", pElement$, prop );

            lModalButton$.on( "click", function openDialog() {
                var lEditorDlg$, lEditor$, lDlgHeight, lDlgWidth,
                    lValidateFunction, lQueryBuilderFunction, // must be undefined
                    lMode = "text",
                    lSettingsChanged = false,
                    lButtons = [],
                    lProperty = gLastComponents[ 0 ].getProperty( prop.propertyName ), // todo If multiple components are selected should we show errors at all?
                    out = util.htmlBuilder();

                function updateChangeGeneration() {
                    gChangeGeneration = lEditor$.codeEditor( "changeGeneration" );
                    debug.trace( "Editor: update change generation: " + gChangeGeneration );
                }

                function hasChanged() {
                    return !lEditor$.codeEditor( "isClean", gChangeGeneration );
                }

                switch ( prop.metaData.type ) {
                    case model.PROP_TYPE.CSS:
                        lMode = "css";
                        break;
                    case model.PROP_TYPE.HTML:
                        lMode = "html";
                        break;
                    case model.PROP_TYPE.JAVASCRIPT:
                        lMode = "javascript";
                        break;
                    case model.PROP_TYPE.XML:
                        lMode = "xml";
                        break;
                    case model.PROP_TYPE.SQL:
                    case model.PROP_TYPE.SQL_EXPR:
                    case model.PROP_TYPE.SQL_EXPR_BOOLEAN:
                    case model.PROP_TYPE.WHERE_CLAUSE:
                    case model.PROP_TYPE.PLSQL:
                    case model.PROP_TYPE.PLSQL_EXPR_VARCHAR:
                    case model.PROP_TYPE.PLSQL_EXPR_BOOLEAN:
                    case model.PROP_TYPE.PLSQL_FUNC_VARCHAR:
                    case model.PROP_TYPE.PLSQL_FUNC_SQL:
                    case model.PROP_TYPE.PLSQL_FUNC_BOOLEAN:
                        lMode = "x-plsql";
                        break;

                }

                // Add buttons depending on the property type
                lButtons.push({
                    text:  msg( "CANCEL" ),
                    click: function() {
                        lEditorDlg$.dialog( "close" );
                    }
                });

                if ( prop.metaData.type === model.PROP_TYPE.SQL ) {
                    lQueryBuilderFunction = function( editor, code ) {
                        nav.popup({
                            url: util.makeApplicationUrl({
                                    appId:      4500,
                                    pageId:     1002,
                                    clearCache: 1002,
                                    itemNames:  [ "P1002_RETURN_INTO", "P1002_POPUP", "P1002_SCHEMA" ],
                                    itemValues: [ editor.baseId, "1", model.getParsingSchema() ]
                                 }),
                            width:  950,
                            height: 720
                        });
                    };
                }

                if ( lMode === "x-plsql" && !prop.metaData.isReadOnly ) {
                    lValidateFunction = function( code, callback ) {
                        var lResult = lProperty.validate( code ); // xxx todo this should be async
                        callback( lResult );
                    };
                }
                lButtons.push({
                    text:  msg( "OK" ),
                    "class": BUTTON_HOT,
                    click: function() {
                        that[ "super" ]( "setValue", pElement$, prop, lEditor$.codeEditor( "getValue" ));
                        pElement$.trigger( "change" );
                        updateChangeGeneration();
                        // Set focus after change, so that we don't incorrectly trigger the error tooltip display
                        // in the case where an error has been resolved as a result of this change
                        that[ "super" ]( "setFocus", pElement$ );
                        lEditorDlg$.dialog( "close" );
                    }
                });

                // open and setup a simple wrapper dialog
                out.markup( "<div" )
                    .attr( "id", "editorDlg" )
                    .attr( "title", formatNoEscape( "CODE_EDITOR.TITLE", prop.metaData.prompt )) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "editorDlg-codeEditor" )
                    .markup( "class='resize'>" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                // xxx maximize option?
                // xxx sometimes the property tooltip shows up on top of the dialog
                lDlgWidth = gEditorDlgWidth;
                lDlgHeight = gEditorDlgHeight;
                if ( lDlgWidth > $(window ).width() - DLG_MARGIN ) {
                    lDlgWidth = $(window ).width() - DLG_MARGIN;
                }
                if ( lDlgHeight > $(window ).height() - DLG_MARGIN ) {
                    lDlgHeight = $(window ).height() - DLG_MARGIN;
                }
                lEditorDlg$ = $( out.toString()).dialog({
                    modal:      true,
                    closeText:  lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    width:      lDlgWidth,
                    height:     lDlgHeight,
                    minWidth:   680,
                    minHeight:  400,
                    beforeClose: function( pEvent ) {
                        var ok = true;
                        if ( hasChanged() ) {
                            ok = confirm( msg( "EDITOR.UNSAVED_CHANGES" ) );
                        }
                        if ( !ok ) {
                            pEvent.preventDefault();
                        }
                    },
                    close: function() {
                        var dlg$ = lEditorDlg$.closest( ".ui-dialog" );
                        if ( lSettingsChanged ) {
                            gEditorSettings = lEditor$.codeEditor( "getSettingsString" );
                            // persist settings
                            // Can't use savePreference because code editor doesn't use the same prefix as the rest of PE/PD
                            window.gPreferences[ CODE_EDITOR_PREF_NAME ] = gEditorSettings;

                            server.process (
                                "setPreference", {
                                    x01: CODE_EDITOR_PREF_NAME,
                                    x02: gEditorSettings
                                }, {
                                    dataType: "" // don't expect any data back
                                }
                            );
                        }
                        // remember last dialog size for next time
                        if ( gEditorDlgWidth !== dlg$.outerWidth() ) {
                            gEditorDlgWidth = dlg$.outerWidth();
                            pd.savePreference( PREF_CODE_EDITOR_DLG_W, gEditorDlgWidth );
                        }
                        if ( gEditorDlgHeight !== dlg$.outerHeight() ) {
                            gEditorDlgHeight = dlg$.outerHeight();
                            pd.savePreference( PREF_CODE_EDITOR_DLG_H, gEditorDlgHeight );
                        }
                        lEditorDlg$.dialog( "destroy" ).remove(); // remove causes code editor go get destroyed as well
                    },
                    open: function() {

                        lEditor$ = $( "#editorDlg-codeEditor" ).codeEditor( $.extend( {
                            mode: "text/" + lMode,
                            autofocus: true,
                            readOnly: prop.metaData.isReadOnly,
                            errors:   lProperty.errors,
                            warnings: lProperty.warnings,
                            value:    that[ "super" ]( "getValue", lProperty$ ), // todo Why do we have to pass in lProperty$ and not pElement$ ?
                            // callbacks
                            codeComplete: function( pOptions, pCallback ) {

                                // todo improve this to cache result and use model.getComponents to read local page items
                                server.process ( "getCodeCompleteList", {
                                    p_widget_name: pOptions.type,
                                    x01: pOptions.search,
                                    x02: pOptions.parent,
                                    x03: pOptions.grantParent
                                }, {
                                    success: pCallback
                                });

                            },
                            validateCode: lValidateFunction,
                            queryBuilder: lQueryBuilderFunction,
                            settingsChanged: function() {
                                lSettingsChanged = true;
                            }
                        }, $.apex.codeEditor.optionsFromSettingsString( gEditorSettings ) ) );
                        // set initial size to match dialog
                        lEditor$.height( $( this ).height() )
                            .width( $( this ).closest( ".ui-dialog" ).width() - 2 )
                            .trigger( "resize" );
                        updateChangeGeneration();
                    },
                    resizeStop: function( event, ui ) {
                        // when dialog resizes so must the editor widget
                        lEditor$.height( lEditorDlg$.height() )
                            .width( ui.size.width - 2 )
                            .trigger( "resize" );
                    },
                    buttons: lButtons
                });
            }); // openDialog

            lProperty$ = pElement$.closest( "div." + PROPERTY );

        }
    }, $.apex.propertyEditor.PROP_TYPE.TEXTAREA );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.ITEM, {
        init: function( pElement$, prop ) {
            var i, j, lOptionsFilters, lOptionsFiltersLov,
                lOptions = {
                    columnDefinitions: [
                        {
                            name:      "name",
                            title:     msg( "NAME" ),
                            alignment: "left"
                        },
                        {
                            name:      "label",
                            title:     msg( "LABEL" ),
                            alignment: "left"
                        }
                    ],
                    filters: [
                        {
                            name:         "scope",
                            title:        msg( "ITEM_SCOPE" ),
                            type:         "buttonset",
                            defaultValue: "current_page",
                            lov: [
                                {
                                    display: msg( "COLUMNS" ),
                                    value:   "column"
                                },
                                {
                                    display: msg( "CURRENT_PAGE" ),
                                    value:   "current_page"
                                },
                                {
                                    display: msg( "CUSTOM_PAGE" ),
                                    value:   "custom_page",
                                    filters: [
                                        {
                                            name:       "customPageNumber",
                                            title:      msg( "PAGE_NUMBER" ),
                                            type:       "text",
                                            isRequired: true
                                        }
                                    ]
                                },
                                {
                                    display: msg( "GLOBAL_PAGE" ),
                                    value:   "global_page"
                                },
                                {
                                    display: msg( "APPLICATION" ),
                                    value:   "application"
                                }
                            ]
                        },
                        {
                            name:  "search",
                            title: msg( "SEARCH" ),
                            type:  "search"
                        }
                    ],
                    filterLov: function ( pFilters, pRenderLovEntries ) {
                        var lType = "page",
                            lPageId;

                        switch ( pFilters.scope ) {
                            case "application":
                                lType   = "application";
                                lPageId = "";
                                break;
                            case "current_page":
                                lPageId = model.getCurrentPageId();
                                break;
                            case "global_page":
                                lPageId = model.getGlobalPageId();
                                break;
                            case "custom_page":
                                lPageId = pFilters.customPageNumber;
                                break;
                        }

                        if ( pFilters.scope === undefined || pFilters.scope === "column" ) {
                            pRenderLovEntries( prop.metaData.lovValues(), pFilters.search );
                        } else {
                            model.getItemsLov( {
                                type:   lType,
                                pageId: lPageId
                            }, function( pLovEntries ){
                                pRenderLovEntries( pLovEntries, pFilters.search );
                            });
                        }
                    }
                };

            // For lov component scope PAGE and GLOBAL, remove 'application' and 'custom_page' filters
            if ( prop.metaData.lovComponentScope === "PAGE_AND_GLOBAL" ) {
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFiltersLov = lOptionsFilters[ i ].lov;
                        for ( j = 0; j < lOptionsFiltersLov.length; j++ ) {
                            if ( $.inArray( lOptionsFiltersLov[ j ].value, [ "application", "custom_page" ] ) > -1 ) {
                                lOptionsFiltersLov.splice( j, 1 );
                                j -= 1;
                            }
                        }
                    }
                }
            }

            // For lov component scope PAGE, remove 'application', 'custom_page' and 'global' filters
            if ( prop.metaData.lovComponentScope === "PAGE" ) {
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFiltersLov = lOptionsFilters[ i ].lov;
                        for ( j = 0; j < lOptionsFiltersLov.length; j++ ) {
                            if ( $.inArray( lOptionsFiltersLov[ j ].value, [ "application", "custom_page", "global_page" ] ) > -1 ) {
                                lOptionsFiltersLov.splice( j, 1 );
                                j -= 1;
                            }
                        }
                    }
                }
            }

            // For lov component scope COLUMN, remove everything
            if ( prop.metaData.lovComponentScope === "COLUMN" ) {
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFilters.splice( i, 1 );
                        break;
                    }
                }
            } else if ( prop.metaData.referenceScope === "ROW" ) {
                // If 'column' filter is available, set it as default filter
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFilters[ i ].defaultValue = "column";
                        break;
                    }
                }
            } else {
                // Remove 'column' filter if not available
                lOptionsFilters = lOptions.filters;
                for ( i = 0; i < lOptionsFilters.length; i++ ) {
                    if ( lOptionsFilters[ i ].name === "scope" ) {
                        lOptionsFiltersLov = lOptionsFilters[ i ].lov;
                        for ( j = 0; j < lOptionsFiltersLov.length; j++ ) {
                            if ( lOptionsFiltersLov[ j ].value === "column" ) {
                                lOptionsFiltersLov.splice( j, 1 );
                                break;
                            }
                        }
                    }
                }
            }

            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PAGE, {
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:       "id",
                        title:      msg( "PAGE_NUMBER" ),
                        alignment:  "left"
                    },
                    {
                        name:       "name",
                        title:      msg( "PAGE_NAME" ),
                        alignment:  "left"
                    },
                    {
                        name:       "userInterface",
                        title:      msg( "USER_INTERFACE" ),
                        alignment:  "left"
                    }
                ],
                filters: [
                    {
                        name:         "userInterfaceId",
                        title:        msg( "USER_INTERFACE" ),
                        type:         "buttonset",
                        defaultValue: "current_ui",
                        lov: [
                            {
                                display: msg( "CURRENT_UI" ),
                                value:   "current_ui"
                            },
                            {
                                display: msg( "ALL_PAGES" ),
                                value:   "all"
                            }
                        ]
                    },
                    {
                        name:   "search",
                        title:  msg( "SEARCH" ),
                        type:   "search"
                    }
                ],
                filterLov: function( pFilters, pRenderLovEntries ) {
                    model.getPagesLov( pFilters, function( pLovValues ) {
                        var j, lUserInterfaceId,
                            lLovEntriesByUserInterface = [];

                        // Now deal with the exposed filter for User Interface
                        if ( pFilters.userInterfaceId === "all" ) {
                            pRenderLovEntries( pLovValues, pFilters.search );
                        } else {
                            lUserInterfaceId = model.getComponents( model.COMP_TYPE.PAGE, { id: model.getCurrentPageId() })[ 0 ].getProperty( model.PROP.USER_INTERFACE ).getValue();
                            for ( j = 0; j < pLovValues.length; j++ ) {
                                if ( pLovValues[ j ].userInterfaceId === lUserInterfaceId ) {
                                    lLovEntriesByUserInterface.push( pLovValues[ j ] );
                                }
                            }
                            pRenderLovEntries( lLovEntriesByUserInterface, pFilters.search );
                        }
                    });
                }
            };
            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TABLE, {
        init: function( pElement$, prop ) {
            var lOptions = {
                columnDefinitions: [
                    {
                        name:       "name",
                        title:      msg( "NAME" ),
                        alignment:  "left"
                    },
                    {
                        name:       "comment",
                        title:      msg( "COMMENT" ),
                        alignment:  "left"
                    }
                ],
                filters: [
                    {
                        name:         "type",
                        title:        msg( "TYPE" ),
                        type:         "buttonset",
                        defaultValue: "TABLE",
                        lov: [
                            {
                                display: msg( "TABLES" ),
                                value:   "TABLE"
                            },
                            {
                                display: msg( "VIEWS" ),
                                value:   "VIEW"
                            }
                        ]
                    },
                    {
                        name:  "search",
                        title: msg( "SEARCH" ),
                        type:  "search"
                    }
                ],
                filterLov: function( pFilters, pRenderLovEntries ) {
                    prop.metaData.lovValues( function( pLovEntries ){
                        pRenderLovEntries( pLovEntries, pFilters.search );
                    }, pFilters );
                }
            };
            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.ICON, {
        init: function( pElement$, prop ) {

/*
 Use the following statement to get the icons:
 set termout off
 set verify off
 set trimspool on
 set linesize 10000
 set longchunksize 200000 long 2000000 pages 0
 spool fa.txt
 select category || ': "' || icons || '".split( "," ),' as js
   from (
       select trim( column_value ) as category, rtrim( xmlagg( xmlelement( e, icon_name, ',' ).extract( '//text()' ) order by icon_name ).getclobval(), ',' ) as icons
         from wwv_flow_standard_icons, xmltable(( '"' || replace( icon_category, ':', '","' ) || '"' ))
        where icon_library = 'FONTAPEX'
        group by trim( column_value )
        order by 1 )
 /
 spool off
*/
            var FONTAPEX_SHIPPING_VERSION = '2.1';

            var isFontAPEX = function( pType ){
                return pType === 'FONTAPEX' || pType === 'FONTAPEX_LATEST';
            };

            var isFontAwesome = function( pType ){
                return pType === 'FONTAWESOME';
            };

            var THEME_ICONS = model.getThemeIcons(),
                APEX_ICONS = {
                    ACCESSIBILITY: "fa-american-sign-language-interpreting,fa-asl-interpreting,fa-assistive-listening-systems,fa-audio-description,fa-blind,fa-braille,fa-deaf,fa-deafness,fa-hard-of-hearing,fa-low-vision,fa-sign-language,fa-signing,fa-universal-access,fa-volume-control-phone,fa-wheelchair-alt".split(","),
                    CALENDAR: "fa-calendar-alarm,fa-calendar-arrow-down,fa-calendar-arrow-up,fa-calendar-ban,fa-calendar-chart,fa-calendar-clock,fa-calendar-edit,fa-calendar-heart,fa-calendar-lock,fa-calendar-pointer,fa-calendar-search,fa-calendar-user,fa-calendar-wrench".split(","),
                    CHART: "fa-area-chart,fa-bar-chart,fa-bar-chart-horizontal,fa-box-plot-chart,fa-bubble-chart,fa-combo-chart,fa-dial-gauge-chart,fa-donut-chart,fa-funnel-chart,fa-gantt-chart,fa-line-area-chart,fa-line-chart,fa-pie-chart,fa-pie-chart-0,fa-pie-chart-10,fa-pie-chart-100,fa-pie-chart-15,fa-pie-chart-20,fa-pie-chart-25,fa-pie-chart-30,fa-pie-chart-35,fa-pie-chart-40,fa-pie-chart-45,fa-pie-chart-5,fa-pie-chart-50,fa-pie-chart-55,fa-pie-chart-60,fa-pie-chart-65,fa-pie-chart-70,fa-pie-chart-75,fa-pie-chart-80,fa-pie-chart-85,fa-pie-chart-90,fa-pie-chart-95,fa-polar-chart,fa-pyramid-chart,fa-radar-chart,fa-range-chart-area,fa-range-chart-bar,fa-scatter-chart,fa-stock-chart,fa-x-axis,fa-y-axis,fa-y1-axis,fa-y2-axis".split(","),
                    CURRENCY: "fa-bitcoin,fa-btc,fa-cny,fa-dollar,fa-eur,fa-euro,fa-gbp,fa-ils,fa-inr,fa-jpy,fa-krw,fa-money,fa-rmb,fa-rub,fa-try,fa-usd,fa-yen".split(","),
                    DIRECTIONAL: "fa-angle-double-down,fa-angle-double-left,fa-angle-double-right,fa-angle-double-up,fa-angle-down,fa-angle-left,fa-angle-right,fa-angle-up,fa-arrow-circle-down,fa-arrow-circle-left,fa-arrow-circle-o-down,fa-arrow-circle-o-left,fa-arrow-circle-o-right,fa-arrow-circle-o-up,fa-arrow-circle-right,fa-arrow-circle-up,fa-arrow-down,fa-arrow-down-alt,fa-arrow-down-left-alt,fa-arrow-down-right-alt,fa-arrow-left,fa-arrow-left-alt,fa-arrow-right,fa-arrow-right-alt,fa-arrow-up,fa-arrow-up-alt,fa-arrow-up-left-alt,fa-arrow-up-right-alt,fa-arrows,fa-arrows-alt,fa-arrows-h,fa-arrows-v,fa-box-arrow-in-east,fa-box-arrow-in-ne,fa-box-arrow-in-north,fa-box-arrow-in-nw,fa-box-arrow-in-se,fa-box-arrow-in-south,fa-box-arrow-in-sw,fa-box-arrow-in-west,fa-box-arrow-out-east,fa-box-arrow-out-ne,fa-box-arrow-out-north,fa-box-arrow-out-nw,fa-box-arrow-out-se,fa-box-arrow-out-south,fa-box-arrow-out-sw,fa-box-arrow-out-west,fa-caret-down,fa-caret-left,fa-caret-right,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-caret-up,fa-chevron-circle-down,fa-chevron-circle-left,fa-chevron-circle-right,fa-chevron-circle-up,fa-chevron-down,fa-chevron-left,fa-chevron-right,fa-chevron-up,fa-circle-arrow-in-east,fa-circle-arrow-in-ne,fa-circle-arrow-in-north,fa-circle-arrow-in-nw,fa-circle-arrow-in-se,fa-circle-arrow-in-south,fa-circle-arrow-in-sw,fa-circle-arrow-in-west,fa-circle-arrow-out-east,fa-circle-arrow-out-ne,fa-circle-arrow-out-north,fa-circle-arrow-out-nw,fa-circle-arrow-out-se,fa-circle-arrow-out-south,fa-circle-arrow-out-sw,fa-circle-arrow-out-west,fa-exchange,fa-hand-o-down,fa-hand-o-left,fa-hand-o-right,fa-hand-o-up,fa-long-arrow-down,fa-long-arrow-left,fa-long-arrow-right,fa-long-arrow-up,fa-page-bottom,fa-page-first,fa-page-last,fa-page-top".split(","),
                    EMOJI: "fa-awesome-face,fa-emoji-angry,fa-emoji-astonished,fa-emoji-big-eyes-smile,fa-emoji-big-frown,fa-emoji-cold-sweat,fa-emoji-confounded,fa-emoji-confused,fa-emoji-cool,fa-emoji-cringe,fa-emoji-cry,fa-emoji-delicious,fa-emoji-disappointed,fa-emoji-disappointed-relieved,fa-emoji-expressionless,fa-emoji-fearful,fa-emoji-frown,fa-emoji-grimace,fa-emoji-grin-sweat,fa-emoji-happy-smile,fa-emoji-hushed,fa-emoji-laughing,fa-emoji-lol,fa-emoji-love,fa-emoji-mean,fa-emoji-nerd,fa-emoji-neutral,fa-emoji-no-mouth,fa-emoji-open-mouth,fa-emoji-pensive,fa-emoji-persevere,fa-emoji-pleased,fa-emoji-relieved,fa-emoji-rotfl,fa-emoji-scream,fa-emoji-sleeping,fa-emoji-sleepy,fa-emoji-slight-frown,fa-emoji-slight-smile,fa-emoji-smile,fa-emoji-smirk,fa-emoji-stuck-out-tounge,fa-emoji-stuck-out-tounge-closed-eyes,fa-emoji-stuck-out-tounge-wink,fa-emoji-sweet-smile,fa-emoji-tired,fa-emoji-unamused,fa-emoji-upside-down,fa-emoji-weary,fa-emoji-wink,fa-emoji-worry,fa-emoji-zipper-mouth,fa-hipster".split(","),
                    FILE_TYPE: "fa-file,fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-o,fa-file-pdf-o,fa-file-powerpoint-o,fa-file-sql,fa-file-text,fa-file-text-o,fa-file-video-o,fa-file-word-o".split(","),
                    FORM_CONTROL: "fa-check-square,fa-check-square-o,fa-circle,fa-circle-o,fa-dot-circle-o,fa-minus-square,fa-minus-square-o,fa-plus-square,fa-plus-square-o,fa-square,fa-square-o,fa-square-selected-o,fa-times-square,fa-times-square-o".split(","),
                    GENDER: "fa-genderless,fa-mars,fa-mars-double,fa-mars-stroke,fa-mars-stroke-h,fa-mars-stroke-v,fa-mercury,fa-neuter,fa-transgender,fa-transgender-alt,fa-venus,fa-venus-double,fa-venus-mars".split(","),
                    HAND: "fa-hand-grab-o,fa-hand-lizard-o,fa-hand-o-down,fa-hand-o-left,fa-hand-o-right,fa-hand-o-up,fa-hand-peace-o,fa-hand-pointer-o,fa-hand-scissors-o,fa-hand-spock-o,fa-hand-stop-o,fa-thumbs-down,fa-thumbs-o-down,fa-thumbs-o-up,fa-thumbs-up".split(","),
                    MEDICAL: "fa-ambulance,fa-h-square,fa-heart,fa-heart-o,fa-heartbeat,fa-hospital-o,fa-medkit,fa-plus-square,fa-stethoscope,fa-user-md,fa-wheelchair".split(","),
                    NUMBERS: "fa-number-0,fa-number-0-o,fa-number-1,fa-number-1-o,fa-number-2,fa-number-2-o,fa-number-3,fa-number-3-o,fa-number-4,fa-number-4-o,fa-number-5,fa-number-5-o,fa-number-6,fa-number-6-o,fa-number-7,fa-number-7-o,fa-number-8,fa-number-8-o,fa-number-9,fa-number-9-o".split(","),
                    PAYMENT: "fa-credit-card,fa-credit-card-alt,fa-credit-card-terminal".split(","),
                    SPINNER: "fa-circle-o-notch,fa-gear,fa-refresh,fa-spinner".split(","),
                    TEXT_EDITOR: "fa-align-center,fa-align-justify,fa-align-left,fa-align-right,fa-bold,fa-clipboard,fa-clipboard-arrow-down,fa-clipboard-arrow-up,fa-clipboard-ban,fa-clipboard-bookmark,fa-clipboard-chart ,fa-clipboard-check,fa-clipboard-check-alt,fa-clipboard-clock,fa-clipboard-edit,fa-clipboard-heart,fa-clipboard-list,fa-clipboard-lock,fa-clipboard-new,fa-clipboard-plus,fa-clipboard-pointer,fa-clipboard-search,fa-clipboard-user,fa-clipboard-wrench,fa-clipboard-x,fa-columns,fa-copy,fa-cut,fa-eraser,fa-file,fa-file-o,fa-file-text,fa-file-text-o,fa-files-o,fa-font,fa-header,fa-indent,fa-italic,fa-link,fa-list,fa-list-alt,fa-list-ol,fa-list-ul,fa-outdent,fa-paperclip,fa-paragraph,fa-paste,fa-repeat,fa-rotate-left,fa-rotate-right,fa-save,fa-scissors,fa-strikethrough,fa-subscript,fa-superscript,fa-table,fa-text-height,fa-text-width,fa-th,fa-th-large,fa-th-list,fa-underline,fa-undo,fa-unlink".split(","),
                    TRANSPORTATION: "fa-ambulance,fa-bicycle,fa-bus,fa-car,fa-fighter-jet,fa-motorcycle,fa-plane,fa-rocket,fa-ship,fa-space-shuttle,fa-subway,fa-taxi,fa-train,fa-truck,fa-wheelchair".split(","),
                    VIDEO_PLAYER: "fa-arrows-alt,fa-backward,fa-compress,fa-eject,fa-expand,fa-fast-backward,fa-fast-forward,fa-forward,fa-pause,fa-pause-circle,fa-pause-circle-o,fa-play,fa-play-circle,fa-play-circle-o,fa-random,fa-step-backward,fa-step-forward,fa-stop,fa-stop-circle,fa-stop-circle-o".split(","),
                    WEB_APPLICATION: "fa-address-book,fa-address-book-o,fa-address-card,fa-address-card-o,fa-adjust,fa-alert,fa-american-sign-language-interpreting,fa-anchor,fa-apex,fa-apex-square,fa-archive,fa-area-chart,fa-arrows,fa-arrows-h,fa-arrows-v,fa-asl-interpreting,fa-assistive-listening-systems,fa-asterisk,fa-at,fa-audio-description,fa-badge-list,fa-badges,fa-balance-scale,fa-ban,fa-bar-chart,fa-barcode,fa-bars,fa-bath,fa-battery-0,fa-battery-1,fa-battery-2,fa-battery-3,fa-battery-4,fa-battleship,fa-bed,fa-beer,fa-bell,fa-bell-o,fa-bell-slash,fa-bell-slash-o,fa-bicycle,fa-binoculars,fa-birthday-cake,fa-blind,fa-bolt,fa-bomb,fa-book,fa-bookmark,fa-bookmark-o,fa-braille,fa-breadcrumb,fa-briefcase,fa-bug,fa-building,fa-building-o,fa-bullhorn,fa-bullseye,fa-bus,fa-button,fa-button-container,fa-button-group,fa-calculator,fa-calendar,fa-calendar-check-o,fa-calendar-minus-o,fa-calendar-o,fa-calendar-plus-o,fa-calendar-times-o,fa-camera,fa-camera-retro,fa-car,fa-cards,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-carousel,fa-cart-arrow-down,fa-cart-arrow-up,fa-cart-check,fa-cart-edit,fa-cart-empty,fa-cart-full,fa-cart-heart,fa-cart-lock,fa-cart-magnifying-glass,fa-cart-plus,fa-cart-times,fa-cc,fa-certificate,fa-change-case,fa-check,fa-check-circle,fa-check-circle-o,fa-check-square,fa-check-square-o,fa-child,fa-circle,fa-circle-0-8,fa-circle-1-8,fa-circle-2-8,fa-circle-3-8,fa-circle-4-8,fa-circle-5-8,fa-circle-6-8,fa-circle-7-8,fa-circle-8-8,fa-circle-o,fa-circle-o-notch,fa-circle-thin,fa-clock-o,fa-clone,fa-cloud,fa-cloud-arrow-down,fa-cloud-arrow-up,fa-cloud-ban,fa-cloud-bookmark,fa-cloud-chart,fa-cloud-check,fa-cloud-clock,fa-cloud-cursor,fa-cloud-download,fa-cloud-edit,fa-cloud-file,fa-cloud-heart,fa-cloud-lock,fa-cloud-new,fa-cloud-play,fa-cloud-plus,fa-cloud-pointer,fa-cloud-search,fa-cloud-upload,fa-cloud-user,fa-cloud-wrench,fa-cloud-x,fa-code,fa-code-fork,fa-code-group,fa-coffee,fa-collapsible,fa-comment,fa-comment-o,fa-commenting,fa-commenting-o,fa-comments,fa-comments-o,fa-compass,fa-contacts,fa-copyright,fa-creative-commons,fa-credit-card,fa-credit-card-alt,fa-credit-card-terminal,fa-crop,fa-crosshairs,fa-cube,fa-cubes,fa-cutlery,fa-dashboard,fa-database,fa-database-arrow-down,fa-database-arrow-up,fa-database-ban,fa-database-bookmark,fa-database-chart,fa-database-check,fa-database-clock,fa-database-cursor,fa-database-edit,fa-database-file,fa-database-heart,fa-database-lock,fa-database-new,fa-database-play,fa-database-plus,fa-database-pointer,fa-database-search,fa-database-user,fa-database-wrench,fa-database-x,fa-deaf,fa-deafness,fa-design,fa-desktop,fa-diamond,fa-dot-circle-o,fa-download,fa-download-alt,fa-dynamic-content,fa-edit,fa-ellipsis-h,fa-ellipsis-h-o,fa-ellipsis-v,fa-ellipsis-v-o,fa-envelope,fa-envelope-arrow-down,fa-envelope-arrow-up,fa-envelope-ban,fa-envelope-bookmark,fa-envelope-chart,fa-envelope-check,fa-envelope-clock,fa-envelope-cursor,fa-envelope-edit,fa-envelope-heart,fa-envelope-lock,fa-envelope-o,fa-envelope-open,fa-envelope-open-o,fa-envelope-play,fa-envelope-plus,fa-envelope-pointer,fa-envelope-search,fa-envelope-square,fa-envelope-user,fa-envelope-wrench,fa-envelope-x,fa-eraser,fa-exception,fa-exchange,fa-exclamation,fa-exclamation-circle,fa-exclamation-circle-o,fa-exclamation-diamond,fa-exclamation-diamond-o,fa-exclamation-square,fa-exclamation-square-o,fa-exclamation-triangle,fa-exclamation-triangle-o,fa-expand-collapse,fa-external-link,fa-external-link-square,fa-eye,fa-eye-slash,fa-eyedropper,fa-fax,fa-feed,fa-female,fa-fighter-jet,fa-fighter-jet-alt,fa-file-archive-o,fa-file-arrow-down,fa-file-arrow-up,fa-file-audio-o,fa-file-ban,fa-file-bookmark,fa-file-chart,fa-file-check,fa-file-clock,fa-file-code-o,fa-file-cursor,fa-file-edit,fa-file-excel-o,fa-file-heart,fa-file-image-o,fa-file-lock,fa-file-new,fa-file-pdf-o,fa-file-play,fa-file-plus,fa-file-pointer,fa-file-powerpoint-o,fa-file-search,fa-file-sql,fa-file-user,fa-file-video-o,fa-file-word-o,fa-file-wrench,fa-file-x,fa-film,fa-filter,fa-fire,fa-fire-extinguisher,fa-fit-to-height,fa-fit-to-size,fa-fit-to-width,fa-flag,fa-flag-checkered,fa-flag-o,fa-flashlight,fa-flask,fa-folder,fa-folder-arrow-down,fa-folder-arrow-up,fa-folder-ban,fa-folder-bookmark,fa-folder-chart,fa-folder-check,fa-folder-clock,fa-folder-cloud,fa-folder-cursor,fa-folder-edit,fa-folder-file,fa-folder-heart,fa-folder-lock,fa-folder-network,fa-folder-new,fa-folder-o,fa-folder-open,fa-folder-open-o,fa-folder-play,fa-folder-plus,fa-folder-pointer,fa-folder-search,fa-folder-user,fa-folder-wrench,fa-folder-x,fa-folders,fa-font-size,fa-font-size-decrease,fa-font-size-increase,fa-format,fa-forms,fa-frown-o,fa-function,fa-futbol-o,fa-gamepad,fa-gavel,fa-gear,fa-gears,fa-gift,fa-glass,fa-glasses,fa-globe,fa-graduation-cap,fa-hand-grab-o,fa-hand-lizard-o,fa-hand-peace-o,fa-hand-pointer-o,fa-hand-scissors-o,fa-hand-spock-o,fa-hand-stop-o,fa-handshake-o,fa-hard-of-hearing,fa-hardware,fa-hashtag,fa-hdd-o,fa-headphones,fa-headset,fa-heart,fa-heart-o,fa-heartbeat,fa-helicopter,fa-hero,fa-history,fa-home,fa-hourglass,fa-hourglass-1,fa-hourglass-2,fa-hourglass-3,fa-hourglass-o,fa-i-cursor,fa-id-badge,fa-id-card,fa-id-card-o,fa-image,fa-inbox,fa-index,fa-industry,fa-info,fa-info-circle,fa-info-circle-o,fa-info-square,fa-info-square-o,fa-key,fa-key-alt,fa-keyboard-o,fa-language,fa-laptop,fa-layers,fa-layout-1col-2col,fa-layout-1col-3col,fa-layout-1row-2row,fa-layout-2col,fa-layout-2col-1col,fa-layout-2row,fa-layout-2row-1row,fa-layout-3col,fa-layout-3col-1col,fa-layout-3row,fa-layout-blank,fa-layout-footer,fa-layout-grid-3x,fa-layout-header,fa-layout-header-1col-3col,fa-layout-header-2row,fa-layout-header-footer,fa-layout-header-nav-left-cards,fa-layout-header-nav-left-right-footer,fa-layout-header-nav-right-cards,fa-layout-header-sidebar-left,fa-layout-header-sidebar-right,fa-layout-list-left,fa-layout-list-right,fa-layout-modal-blank,fa-layout-modal-columns,fa-layout-modal-grid-2x,fa-layout-modal-header,fa-layout-modal-nav-left,fa-layout-modal-nav-right,fa-layout-modal-rows,fa-layout-nav-left,fa-layout-nav-left-cards,fa-layout-nav-left-hamburger,fa-layout-nav-left-hamburger-header,fa-layout-nav-left-header-cards,fa-layout-nav-left-header-header,fa-layout-nav-left-right,fa-layout-nav-left-right-header-footer,fa-layout-nav-right,fa-layout-nav-right-cards,fa-layout-nav-right-hamburger,fa-layout-nav-right-hamburger-header,fa-layout-nav-right-header,fa-layout-nav-right-header-cards,fa-layout-sidebar-left,fa-layout-sidebar-right,fa-layouts-grid-2x,fa-leaf,fa-lemon-o,fa-level-down,fa-level-up,fa-life-ring,fa-lightbulb-o,fa-line-chart,fa-location-arrow,fa-lock,fa-lock-check,fa-lock-file,fa-lock-new,fa-lock-password,fa-lock-plus,fa-lock-user,fa-lock-x,fa-low-vision,fa-magic,fa-magnet,fa-mail-forward,fa-male,fa-map,fa-map-marker,fa-map-o,fa-map-pin,fa-map-signs,fa-materialized-view,fa-media-list,fa-meh-o,fa-microchip,fa-microphone,fa-microphone-slash,fa-military-vehicle,fa-minus,fa-minus-circle,fa-minus-circle-o,fa-minus-square,fa-minus-square-o,fa-missile,fa-mobile,fa-money,fa-moon-o,fa-motorcycle,fa-mouse-pointer,fa-music,fa-navicon,fa-network-hub,fa-network-triangle,fa-newspaper-o,fa-notebook,fa-object-group,fa-object-ungroup,fa-office-phone,fa-package,fa-padlock,fa-padlock-unlock,fa-paint-brush,fa-paper-plane,fa-paper-plane-o,fa-paw,fa-pencil,fa-pencil-square,fa-pencil-square-o,fa-percent,fa-phone,fa-phone-square,fa-photo,fa-pie-chart,fa-plane,fa-plug,fa-plus,fa-plus-circle,fa-plus-circle-o,fa-plus-square,fa-plus-square-o,fa-podcast,fa-power-off,fa-pragma,fa-print,fa-procedure,fa-puzzle-piece,fa-qrcode,fa-question,fa-question-circle,fa-question-circle-o,fa-question-square,fa-question-square-o,fa-quote-left,fa-quote-right,fa-random,fa-recycle,fa-redo-alt,fa-redo-arrow,fa-refresh,fa-registered,fa-remove,fa-reply,fa-reply-all,fa-retweet,fa-road,fa-rocket,fa-rss,fa-rss-square,fa-save-as,fa-search,fa-search-minus,fa-search-plus,fa-send,fa-send-o,fa-sequence,fa-server,fa-server-arrow-down,fa-server-arrow-up,fa-server-ban,fa-server-bookmark,fa-server-chart,fa-server-check,fa-server-clock,fa-server-edit,fa-server-file,fa-server-heart,fa-server-lock,fa-server-new,fa-server-play,fa-server-plus,fa-server-pointer,fa-server-search,fa-server-user,fa-server-wrench,fa-server-x,fa-shapes,fa-share,fa-share-alt,fa-share-alt-square,fa-share-square,fa-share-square-o,fa-share2,fa-shield,fa-ship,fa-shopping-bag,fa-shopping-basket,fa-shopping-cart,fa-shower,fa-sign-in,fa-sign-language,fa-sign-out,fa-signal,fa-signing,fa-sitemap,fa-sitemap-horizontal,fa-sitemap-vertical,fa-sliders,fa-smile-o,fa-snowflake,fa-soccer-ball-o,fa-sort,fa-sort-alpha-asc,fa-sort-alpha-desc,fa-sort-amount-asc,fa-sort-amount-desc,fa-sort-asc,fa-sort-desc,fa-sort-numeric-asc,fa-sort-numeric-desc,fa-space-shuttle,fa-spinner,fa-spoon,fa-square,fa-square-o,fa-square-selected-o,fa-star,fa-star-half,fa-star-half-o,fa-star-o,fa-sticky-note,fa-sticky-note-o,fa-street-view,fa-suitcase,fa-sun-o,fa-support,fa-synonym,fa-table-arrow-down,fa-table-arrow-up,fa-table-ban,fa-table-bookmark,fa-table-chart,fa-table-check,fa-table-clock,fa-table-cursor,fa-table-edit,fa-table-file,fa-table-heart,fa-table-lock,fa-table-new,fa-table-play,fa-table-plus,fa-table-pointer,fa-table-search,fa-table-user,fa-table-wrench,fa-table-x,fa-tablet,fa-tabs,fa-tachometer,fa-tag,fa-tags,fa-tank,fa-tasks,fa-taxi,fa-television,fa-terminal,fa-thermometer-0,fa-thermometer-1,fa-thermometer-2,fa-thermometer-3,fa-thermometer-4,fa-thumb-tack,fa-thumbs-down,fa-thumbs-o-down,fa-thumbs-o-up,fa-thumbs-up,fa-ticket,fa-tiles-2x2,fa-tiles-3x3,fa-tiles-8,fa-tiles-9,fa-times,fa-times-circle,fa-times-circle-o,fa-times-rectangle,fa-times-rectangle-o,fa-tint,fa-toggle-off,fa-toggle-on,fa-tools,fa-trademark,fa-trash,fa-trash-o,fa-tree,fa-tree-org,fa-trigger,fa-trophy,fa-truck,fa-tty,fa-umbrella,fa-undo-alt,fa-undo-arrow,fa-universal-access,fa-university,fa-unlock,fa-unlock-alt,fa-upload,fa-upload-alt,fa-user,fa-user-arrow-down,fa-user-arrow-up,fa-user-ban,fa-user-chart,fa-user-check,fa-user-circle,fa-user-circle-o,fa-user-clock,fa-user-cursor,fa-user-edit,fa-user-graduate,fa-user-headset,fa-user-heart,fa-user-lock,fa-user-magnifying-glass,fa-user-man,fa-user-play,fa-user-plus,fa-user-pointer,fa-user-secret,fa-user-woman,fa-user-wrench,fa-user-x,fa-users,fa-users-chat,fa-variable,fa-video-camera,fa-volume-control-phone,fa-volume-down,fa-volume-off,fa-volume-up,fa-warning,fa-wheelchair,fa-wheelchair-alt,fa-wifi,fa-window,fa-window-alt,fa-window-alt-2,fa-window-arrow-down,fa-window-arrow-up,fa-window-ban,fa-window-bookmark,fa-window-chart,fa-window-check,fa-window-clock,fa-window-close,fa-window-close-o,fa-window-cursor,fa-window-edit,fa-window-file,fa-window-heart,fa-window-lock,fa-window-maximize,fa-window-minimize,fa-window-new,fa-window-play,fa-window-plus,fa-window-pointer,fa-window-restore,fa-window-search,fa-window-terminal,fa-window-user,fa-window-wrench,fa-window-x,fa-wizard,fa-wrench".split(",")
                },
                AWESOME_ICONS = { /* Note: Fontawesome 4.5.0 icon css classes */
                    BRAND: "fa-500px,fa-adn,fa-amazon,fa-android,fa-angellist,fa-apple,fa-behance,fa-behance-square,fa-bitbucket,fa-bitbucket-square,fa-black-tie,fa-bluetooth,fa-bluetooth-b,fa-btc,fa-buysellads,fa-cc-amex,fa-cc-diners-club,fa-cc-discover,fa-cc-jcb,fa-cc-mastercard,fa-cc-paypal,fa-cc-stripe,fa-cc-visa,fa-chrome,fa-codepen,fa-codiepie,fa-connectdevelop,fa-contao,fa-credit-card-alt,fa-css3,fa-dashcube,fa-delicious,fa-deviantart,fa-digg,fa-dribbble,fa-dropbox,fa-drupal,fa-edge,fa-empire,fa-expeditedssl,fa-facebook,fa-facebook-official,fa-facebook-square,fa-firefox,fa-flickr,fa-fonticons,fa-fort-awesome,fa-forumbee,fa-foursquare,fa-get-pocket,fa-gg,fa-gg-circle,fa-git,fa-git-square,fa-github,fa-github-alt,fa-github-square,fa-google,fa-google-plus,fa-google-plus-square,fa-google-wallet,fa-gratipay,fa-hacker-news,fa-houzz,fa-html5,fa-instagram,fa-internet-explorer,fa-ioxhost,fa-joomla,fa-jsfiddle,fa-lastfm,fa-lastfm-square,fa-leanpub,fa-linkedin,fa-linkedin-square,fa-linux,fa-maxcdn,fa-meanpath,fa-medium,fa-mixcloud,fa-modx,fa-odnoklassniki,fa-odnoklassniki-square,fa-opencart,fa-openid,fa-opera,fa-optin-monster,fa-pagelines,fa-paypal,fa-pied-piper,fa-pied-piper-alt,fa-pinterest,fa-pinterest-p,fa-pinterest-square,fa-product-hunt,fa-qq,fa-rebel,fa-reddit,fa-reddit-alien,fa-reddit-square,fa-renren,fa-safari,fa-scribd,fa-sellsy,fa-share-alt,fa-share-alt-square,fa-shirtsinbulk,fa-simplybuilt,fa-skyatlas,fa-skype,fa-slack,fa-slideshare,fa-soundcloud,fa-spotify,fa-stack-exchange,fa-stack-overflow,fa-steam,fa-steam-square,fa-stumbleupon,fa-stumbleupon-circle,fa-tencent-weibo,fa-trello,fa-tripadvisor,fa-tumblr,fa-tumblr-square,fa-twitch,fa-twitter,fa-twitter-square,fa-usb,fa-viacoin,fa-vimeo,fa-vimeo-square,fa-vine,fa-vk,fa-weibo,fa-weixin,fa-whatsapp,fa-wikipedia-w,fa-windows,fa-wordpress,fa-xing,fa-xing-square,fa-y-combinator,fa-yahoo,fa-yelp,fa-youtube,fa-youtube-play,fa-youtube-square".split( "," ),
                    CHART: "fa-area-chart,fa-bar-chart,fa-line-chart,fa-pie-chart".split( "," ),
                    CURRENCY: "fa-btc,fa-eur,fa-gbp,fa-gg,fa-gg-circle,fa-ils,fa-inr,fa-jpy,fa-krw,fa-money,fa-rub,fa-try,fa-usd".split( "," ),
                    DIRECTIONAL: "fa-angle-double-down,fa-angle-double-left,fa-angle-double-right,fa-angle-double-up,fa-angle-down,fa-angle-left,fa-angle-right,fa-angle-up,fa-arrow-circle-down,fa-arrow-circle-left,fa-arrow-circle-o-down,fa-arrow-circle-o-left,fa-arrow-circle-o-right,fa-arrow-circle-o-up,fa-arrow-circle-right,fa-arrow-circle-up,fa-arrow-down,fa-arrow-left,fa-arrow-right,fa-arrow-up,fa-arrows,fa-arrows-alt,fa-arrows-h,fa-arrows-v,fa-caret-down,fa-caret-left,fa-caret-right,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-caret-up,fa-chevron-circle-down,fa-chevron-circle-left,fa-chevron-circle-right,fa-chevron-circle-up,fa-chevron-down,fa-chevron-left,fa-chevron-right,fa-chevron-up,fa-exchange,fa-hand-o-down,fa-hand-o-left,fa-hand-o-right,fa-hand-o-up,fa-long-arrow-down,fa-long-arrow-left,fa-long-arrow-right,fa-long-arrow-up".split( "," ),
                    FILE_TYPE: "fa-file,fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-o,fa-file-pdf-o,fa-file-powerpoint-o,fa-file-text,fa-file-text-o,fa-file-video-o,fa-file-word-o".split( "," ),
                    FORM_CONTROL: "fa-check-square,fa-check-square-o,fa-circle,fa-circle-o,fa-dot-circle-o,fa-minus-square,fa-minus-square-o,fa-plus-square,fa-plus-square-o,fa-square,fa-square-o".split( "," ),
                    GENDER: "fa-genderless,fa-mars,fa-mars-double,fa-mars-stroke,fa-mars-stroke-h,fa-mars-stroke-v,fa-mercury,fa-neuter,fa-transgender,fa-transgender-alt,fa-venus,fa-venus-double,fa-venus-mars".split( "," ),
                    HAND: "fa-hand-lizard-o,fa-hand-o-down,fa-hand-o-left,fa-hand-o-right,fa-hand-o-up,fa-hand-paper-o,fa-hand-peace-o,fa-hand-pointer-o,fa-hand-rock-o,fa-hand-scissors-o,fa-hand-spock-o,fa-thumbs-down,fa-thumbs-o-down,fa-thumbs-o-up,fa-thumbs-up".split( "," ),
                    MEDICAL: "fa-ambulance,fa-h-square,fa-heart,fa-heart-o,fa-heartbeat,fa-hospital-o,fa-medkit,fa-plus-square,fa-stethoscope,fa-user-md,fa-wheelchair".split( "," ),
                    PAYMENT: "fa-cc-amex,fa-cc-diners-club,fa-cc-discover,fa-cc-jcb,fa-cc-mastercard,fa-cc-paypal,fa-cc-stripe,fa-cc-visa,fa-credit-card,fa-credit-card-alt,fa-google-wallet,fa-paypal".split( "," ),
                    SPINNER: "fa-circle-o-notch,fa-cog,fa-refresh,fa-spinner".split( "," ),
                    TEXT_EDITOR: "fa-align-center,fa-align-justify,fa-align-left,fa-align-right,fa-bold,fa-chain-broken,fa-clipboard,fa-columns,fa-eraser,fa-file,fa-file-o,fa-file-text,fa-file-text-o,fa-files-o,fa-floppy-o,fa-font,fa-header,fa-indent,fa-italic,fa-link,fa-list,fa-list-alt,fa-list-ol,fa-list-ul,fa-outdent,fa-paperclip,fa-paragraph,fa-repeat,fa-scissors,fa-strikethrough,fa-subscript,fa-superscript,fa-table,fa-text-height,fa-text-width,fa-th,fa-th-large,fa-th-list,fa-underline,fa-undo".split( "," ),
                    TRANSPORTATION: "fa-ambulance,fa-bicycle,fa-bus,fa-car,fa-fighter-jet,fa-motorcycle,fa-plane,fa-rocket,fa-ship,fa-space-shuttle,fa-subway,fa-taxi,fa-train,fa-truck,fa-wheelchair".split( "," ),
                    VIDEO_PLAYER: "fa-arrows-alt,fa-backward,fa-compress,fa-eject,fa-expand,fa-fast-backward,fa-fast-forward,fa-forward,fa-pause,fa-pause-circle,fa-pause-circle-o,fa-play,fa-play-circle,fa-play-circle-o,fa-random,fa-step-backward,fa-step-forward,fa-stop,fa-stop-circle,fa-stop-circle-o,fa-youtube-play".split( "," ),
                    WEB_APPLICATION: "fa-adjust,fa-anchor,fa-archive,fa-area-chart,fa-arrows,fa-arrows-h,fa-arrows-v,fa-asterisk,fa-at,fa-balance-scale,fa-ban,fa-bar-chart,fa-barcode,fa-bars,fa-battery-empty,fa-battery-full,fa-battery-half,fa-battery-quarter,fa-battery-three-quarters,fa-bed,fa-beer,fa-bell,fa-bell-o,fa-bell-slash,fa-bell-slash-o,fa-bicycle,fa-binoculars,fa-birthday-cake,fa-bluetooth,fa-bluetooth-b,fa-bolt,fa-bomb,fa-book,fa-bookmark,fa-bookmark-o,fa-briefcase,fa-bug,fa-building,fa-building-o,fa-bullhorn,fa-bullseye,fa-bus,fa-calculator,fa-calendar,fa-calendar-check-o,fa-calendar-minus-o,fa-calendar-o,fa-calendar-plus-o,fa-calendar-times-o,fa-camera,fa-camera-retro,fa-car,fa-caret-square-o-down,fa-caret-square-o-left,fa-caret-square-o-right,fa-caret-square-o-up,fa-cart-arrow-down,fa-cart-plus,fa-cc,fa-certificate,fa-check,fa-check-circle,fa-check-circle-o,fa-check-square,fa-check-square-o,fa-child,fa-circle,fa-circle-o,fa-circle-o-notch,fa-circle-thin,fa-clock-o,fa-clone,fa-cloud,fa-cloud-download,fa-cloud-upload,fa-code,fa-code-fork,fa-coffee,fa-cog,fa-cogs,fa-comment,fa-comment-o,fa-commenting,fa-commenting-o,fa-comments,fa-comments-o,fa-compass,fa-copyright,fa-creative-commons,fa-credit-card,fa-crop,fa-crosshairs,fa-cube,fa-cubes,fa-cutlery,fa-database,fa-desktop,fa-diamond,fa-dot-circle-o,fa-download,fa-ellipsis-h,fa-ellipsis-v,fa-envelope,fa-envelope-o,fa-envelope-square,fa-eraser,fa-exchange,fa-exclamation,fa-exclamation-circle,fa-exclamation-triangle,fa-external-link,fa-external-link-square,fa-eye,fa-eye-slash,fa-eyedropper,fa-fax,fa-female,fa-fighter-jet,fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-pdf-o,fa-file-powerpoint-o,fa-file-video-o,fa-file-word-o,fa-film,fa-filter,fa-fire,fa-fire-extinguisher,fa-flag,fa-flag-checkered,fa-flag-o,fa-flask,fa-folder,fa-folder-o,fa-folder-open,fa-folder-open-o,fa-frown-o,fa-futbol-o,fa-gamepad,fa-gavel,fa-gift,fa-glass,fa-globe,fa-graduation-cap,fa-hand-lizard-o,fa-hand-paper-o,fa-hand-peace-o,fa-hand-pointer-o,fa-hand-rock-o,fa-hand-scissors-o,fa-hand-spock-o,fa-hashtag,fa-hdd-o,fa-headphones,fa-heart,fa-heart-o,fa-heartbeat,fa-history,fa-home,fa-hourglass,fa-hourglass-end,fa-hourglass-half,fa-hourglass-o,fa-hourglass-start,fa-i-cursor,fa-inbox,fa-industry,fa-info,fa-info-circle,fa-key,fa-keyboard-o,fa-language,fa-laptop,fa-leaf,fa-lemon-o,fa-level-down,fa-level-up,fa-life-ring,fa-lightbulb-o,fa-line-chart,fa-location-arrow,fa-lock,fa-magic,fa-magnet,fa-male,fa-map,fa-map-marker,fa-map-o,fa-map-pin,fa-map-signs,fa-meh-o,fa-microphone,fa-microphone-slash,fa-minus,fa-minus-circle,fa-minus-square,fa-minus-square-o,fa-mobile,fa-money,fa-moon-o,fa-motorcycle,fa-mouse-pointer,fa-music,fa-newspaper-o,fa-object-group,fa-object-ungroup,fa-paint-brush,fa-paper-plane,fa-paper-plane-o,fa-paw,fa-pencil,fa-pencil-square,fa-pencil-square-o,fa-percent,fa-phone,fa-phone-square,fa-picture-o,fa-pie-chart,fa-plane,fa-plug,fa-plus,fa-plus-circle,fa-plus-square,fa-plus-square-o,fa-power-off,fa-print,fa-puzzle-piece,fa-qrcode,fa-question,fa-question-circle,fa-quote-left,fa-quote-right,fa-random,fa-recycle,fa-refresh,fa-registered,fa-reply,fa-reply-all,fa-retweet,fa-road,fa-rocket,fa-rss,fa-rss-square,fa-search,fa-search-minus,fa-search-plus,fa-server,fa-share,fa-share-alt,fa-share-alt-square,fa-share-square,fa-share-square-o,fa-shield,fa-ship,fa-shopping-bag,fa-shopping-basket,fa-shopping-cart,fa-sign-in,fa-sign-out,fa-signal,fa-sitemap,fa-sliders,fa-smile-o,fa-sort,fa-sort-alpha-asc,fa-sort-alpha-desc,fa-sort-amount-asc,fa-sort-amount-desc,fa-sort-asc,fa-sort-desc,fa-sort-numeric-asc,fa-sort-numeric-desc,fa-space-shuttle,fa-spinner,fa-spoon,fa-square,fa-square-o,fa-star,fa-star-half,fa-star-half-o,fa-star-o,fa-sticky-note,fa-sticky-note-o,fa-street-view,fa-suitcase,fa-sun-o,fa-tablet,fa-tachometer,fa-tag,fa-tags,fa-tasks,fa-taxi,fa-television,fa-terminal,fa-thumb-tack,fa-thumbs-down,fa-thumbs-o-down,fa-thumbs-o-up,fa-thumbs-up,fa-ticket,fa-times,fa-times-circle,fa-times-circle-o,fa-tint,fa-toggle-off,fa-toggle-on,fa-trademark,fa-trash,fa-trash-o,fa-tree,fa-trophy,fa-truck,fa-tty,fa-umbrella,fa-university,fa-unlock,fa-unlock-alt,fa-upload,fa-user,fa-user-plus,fa-user-secret,fa-user-times,fa-users,fa-video-camera,fa-volume-down,fa-volume-off,fa-volume-up,fa-wheelchair,fa-wifi,fa-wrench".split( "," )
                },
                CUSTOM_ICONS = ( THEME_ICONS.custom ? THEME_ICONS.custom.split( "," ) : [] );

            var lOptions = {
                    columnDefinitions: [
                        {
                            name:      "d",
                            title:     msg( "NAME" ),
                            alignment: "left"
                        }
                    ],
                    filters: [
                        {
                            name:  "search",
                            title: msg( "SEARCH" ),
                            type:  "search"
                        }
                    ],
                    filterLov: function( pFilters, pRenderLovEntries ) {

                        var lLovEntries  = [],
                            filtersType  = pFilters.type,
                            lCategory;

                        function addLovEntry( pClasses, pDisplayClass ) {
                            lLovEntries.push({
                                r:            pClasses,
                                d:            pDisplayClass || pClasses,
                                preview:      '<span class="fa ' + util.escapeHTMLAttr( pClasses ) + '"></span>'
                            });
                        }

                        function addIcons( pIcons, pIsSpinner, pIconStyle ) {
                            for ( var i = 0; i < pIcons.length; i++ ) {
                                if ( !pIconStyle || pIconStyle === "default" ) {
                                    addLovEntry( pIcons[ i ] );
                                } else {
                                    if ( pIconStyle === "small" ) {
                                        addLovEntry( "fa-sm " + pIcons[ i ], pIcons[ i ] );
                                    } else if ( pIconStyle === "large" ) {
                                        addLovEntry( "fa-lg " + pIcons[ i ], pIcons[ i ] );
                                    }
                                }
                            }
                        }

                        if ( isFontAPEX( filtersType ) ) {

                            if ( pFilters.category === "" ) {
                                for ( lCategory in APEX_ICONS ) {
                                    if ( APEX_ICONS.hasOwnProperty( lCategory )) {
                                        addIcons( APEX_ICONS[ lCategory ], ( lCategory === "SPINNER" ), pFilters.style );
                                    }
                                }
                            } else {
                                addIcons( APEX_ICONS[ pFilters.category ], ( pFilters.category === "SPINNER" ), pFilters.style);
                            }

                            pRenderLovEntries( lLovEntries, pFilters.search );

                        } else if ( isFontAwesome( filtersType ) ) {

                            if ( pFilters.category === "" ) {
                                for ( lCategory in AWESOME_ICONS ) {
                                    if ( AWESOME_ICONS.hasOwnProperty( lCategory )) {
                                        addIcons( AWESOME_ICONS[ lCategory ], ( lCategory === "SPINNER" ));
                                    }
                                }
                            } else {
                                addIcons( AWESOME_ICONS[ pFilters.category ], ( pFilters.category === "SPINNER" ));
                            }

                            pRenderLovEntries( lLovEntries, pFilters.search );

                        } else if ( filtersType === "CUSTOM" ) {

                            addIcons( CUSTOM_ICONS, false );

                            pRenderLovEntries( lLovEntries, pFilters.search );

                        } else if ( !filtersType || filtersType === "UTILIZED" ) {

                            prop.metaData.lovValues( function( pLovEntries ){

                                for ( var i = 0; i < pLovEntries.length; i++ ) {
                                    addLovEntry( pLovEntries[ i ].r );
                                }

                                pRenderLovEntries( lLovEntries, pFilters.search );
                            }, pFilters );

                        }
                    },
                    resultsDisplay: isFontAPEX( THEME_ICONS.library ) ? "grid" : "table"
                },
                lTypeFilter = {
                    name:         "type",
                    title:        msg( "TYPE" ),
                    type:         "buttonset",
                    defaultValue: "",
                    lov:          []
                },
                lStyleFilter,
                lCategoryFilter,
                lIcons,
                lIconsName,
                lIconsUrl,
                themeIconLib = THEME_ICONS.library;


            //
            // Initialize the available icon selection based on the theme icon configuration
            //

            // The theme does have a custom list of icon css classes
            if ( CUSTOM_ICONS.length > 0 ) {

                // Add "Custom" as new selection of the "type" buttonset
                lTypeFilter.lov.push({
                    display: msg( "CUSTOM" ),
                    value:   "CUSTOM"
                });
                lTypeFilter.defaultValue = "CUSTOM";
            }

            // The theme uses the fontawesome icon library
            if ( $.inArray( themeIconLib, [ "FONTAPEX", "FONTAPEX_LATEST", "FONTAWESOME" ]) !== -1 ) {

                if ( isFontAwesome( themeIconLib ) ) {
                    // FontAwesome icons are safe, we can preview them in the dialog
                    lOptions.columnDefinitions.push({
                        name:      "preview",
                        title:     msg( "PREVIEW" ),
                        alignment: "center",
                        width:     "20%",
                        escape:    false
                    });
                }

                // add Font APEX style
                if ( isFontAPEX( themeIconLib ) ) {

                    // add a new column that passes the display value only
                    lStyleFilter = {
                        name:         "style",
                        title:        msg( "ICON.STYLE" ),
                        type:         "select",
                        defaultValue: "default",
                        isRequired:   true,
                        lov:          [{
                                        display: msg( "ICON.DEFAULT" ),
                                        value:   "default"
                                       },
                                       {
                                        display: msg( "ICON.SMALL" ),
                                        value:   "small"
                                       },
                                       {
                                        display: msg( "ICON.LARGE" ),
                                        value:   "large"
                                       }]
                    };
                }

                // Add all FA categories to the category select list
                lCategoryFilter = {
                    name:         "category",
                    title:        msg( "CATEGORY" ),
                    type:         "select",
                    defaultValue: "",
                    lov:          []
                };

                if ( isFontAPEX( themeIconLib ) ) {
                    var version = themeIconLib.toUpperCase().indexOf( 'LATEST' ) > -1 ? 'latest' : FONTAPEX_SHIPPING_VERSION;
                    lIcons     = APEX_ICONS;
                    lIconsName = "Font APEX";
                    lIconsUrl  = apex_img_dir + "libraries/font-apex/" + version + "/css/font-apex.min.css";

                } else if ( isFontAwesome( themeIconLib ) ) {
                    lIcons     = AWESOME_ICONS;
                    lIconsName = "Font Awesome";
                    lIconsUrl  = apex_img_dir + "libraries/font-awesome/4.5.0/css/font-awesome.min.css";
                }

                for ( var lCategory in lIcons ) {
                    if ( lIcons.hasOwnProperty( lCategory )) {
                        lCategoryFilter.lov.push({
                            display: msg( "FA." + lCategory ),
                            value:   lCategory
                        });
                    }
                }

                // Add "Font xxx" as new selection of the "type" buttonset
                lTypeFilter.lov.unshift({
                    display: lIconsName,
                    value:   themeIconLib,
                    filters: [ lStyleFilter, lCategoryFilter ]
                });
                lTypeFilter.defaultValue = themeIconLib;

                // Dynamically load icon library CSS file if it hasn't been loaded yet so that we are able to preview the icons
                if ( !gIconFont$ ) {
                    gIconFont$ = $( '<link rel="stylesheet" type="text/css" href="' + lIconsUrl + '" />' ).appendTo( "head" );
                }

            }

            // If we have at least one type entry, we add a "Utilized" selection and add the "type" buttonset
            // to the search filters. We want to avoid that we only have the "Utilized" selection if fontawesome
            // and custom icons are not used.
            if ( lTypeFilter.lov.length > 0 ) {
                lTypeFilter.lov.push({
                    display: msg( "UTILIZED" ),
                    value:   "UTILIZED"
                });
                lOptions.filters.unshift( lTypeFilter );
            }


            this[ "super" ]( "init", pElement$, prop, lOptions );
        }
    }, $.apex.propertyEditor.PROP_TYPE.COMBOBOX );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.CSS,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.JAVASCRIPT,            null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.HTML,                  null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL,                 null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_EXPR_VARCHAR,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_EXPR_BOOLEAN,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_FUNC_VARCHAR,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_FUNC_BOOLEAN,    null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.PLSQL_FUNC_SQL,        null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SQL,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SQL_EXPR,              null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SQL_EXPR_BOOLEAN,      null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.WHERE_CLAUSE,          null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.ORDER_BY_CLAUSE,       null, $.apex.propertyEditor.PROP_TYPE.TEXT );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.XML,                   null, PROP_TYPE.TEXT_EDITOR );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEMPLATE_OPTIONS_GENERAL, {

        init: function( pElement$, prop ) {

            var lDefaultCheckboxes$ = $();

            function _setDefaultOptions( ) {

                var lChecked = $( this ).prop( "checked" );

                if ( lChecked ) {
                    lDefaultCheckboxes$.prop( "checked", true );
                }

                lDefaultCheckboxes$.prop( "disabled", lChecked );

            } // _setDefaultOptions


            // call base checkboxes
            this[ "super" ]( "init", pElement$, prop );

            this.checkboxes$      = pElement$.find( "input[type=checkbox]" );
            this.defaultCheckbox$ = this.checkboxes$.filter( "[value='#DEFAULT#']" );

            // Get all default template options checkboxes
            for ( var i = 0; i < prop.metaData.defaultTemplateOptions.length; i++ ) {
                lDefaultCheckboxes$ =
                    lDefaultCheckboxes$.add( this.checkboxes$.filter( "[value='" + util.escapeCSS( prop.metaData.defaultTemplateOptions[ i ]) + "']" ));
            }

            this.defaultCheckbox$
                .on( "click setdefaultcheckboxes", _setDefaultOptions )
                .trigger( "setdefaultcheckboxes" );
        },
        getValue: function( pProperty$ ) {
            var lValues = [];

            // ignore default options
            this.checkboxes$.filter( ":checked:not(:disabled)" ).each( function() {
                lValues.push( this.value );
            });
            return lValues.join( ":" );
        },
        setValue: function( pElement$, prop, value ) {
            this[ "super" ]( "setValue", pElement$, prop, value );
            this.defaultCheckbox$.trigger( "setdefaultcheckboxes" );
        }

    }, $.apex.propertyEditor.PROP_TYPE.CHECKBOXES );
    templateOptionsHelper.addGeneralPropertyType();
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.TEMPLATE_OPTIONS, {

        _getProperties: function( pProperty$, prop ) {
            return templateOptionsHelper.getProperties(this.templateOptions, this.getValue( pProperty$ ).split( ":" ), prop.metaData.isReadOnly);
        }, // _getProperties

        _getDisplayValue: function( prop ) {
            var lValuesMap,
                lDisplayValues = [],
                lValue = prop.value,
                lValues = lValue.split( ":" );

            this.templateOptions = model.getTemplateOptions( gLastComponents[ 0 ].getProperty( prop.propertyName ) );   // todo If multiple components are selected

            if ( lValue === "" ) {

                return msg( "TEMPLATE_OPTIONS.NONE_SELECTED" );

            } else {

                lValuesMap = this.templateOptions.valuesMap;

                for ( var i = 0; i < lValues.length; i++ ) {
                    if ( lValuesMap.hasOwnProperty( lValues[ i ] )) {
                        lDisplayValues.push( lValuesMap[ lValues[ i ] ].d );
                    } else {
                        lDisplayValues.push( formatNoEscape( "LOV.UNKNOWN_LOOKUP", lValues[ i ] ));
                    }
                }

                return lDisplayValues.join( ", " );
            }

        }, // _getDisplayValue

        /* Property type properties and callbacks */
        noLabel: true,
        render: function( out, id, prop ) {
            var lLabelId = id + "_label",
                lIsDisabled,
                lDisplayValue = this._getDisplayValue( prop );

            // If the template options just contain the #DEFAULT# entry then there is no need to open the dialog. This will
            // give developers a immediate feedback if options are available
            lIsDisabled = ( this.templateOptions.values.length < 2 );

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            out.markup( "<button" )
                .attr( "type", "button" )
                .attr( "id", id )
                .attr( "aria-describedby", lLabelId )
                .attr( "class", BUTTON + " " + BUTTON_PROPERTY )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .attr( "value", prop.value )
                .optionalAttr( "disabled", lIsDisabled )
                .markup( ">" )
                .content( lDisplayValue )
                .markup( "</button>" );
            this.renderDivClose( out );
        },
        init: function( pElement$, prop ) {
            var that = this;

            that.addLabelClickHandler( pElement$, prop );
            that.addTooltipsForErrors( pElement$, prop );

            // the main click handler that launches the link dialog
            pElement$.closest( "div." + PROPERTY ).on( "click", "#" + pElement$.attr( "id" ), function() {

                var lDialog$,
                    lProperties = that._getProperties( pElement$.closest( "div." + PROPERTY ), prop ), //todo change to use lElement$
                    out         = util.htmlBuilder();

                // create dialog div
                out.markup( "<div" )
                    .attr( "id", "templateOptionsDlg" )
                    .attr( "title", prop.metaData.prompt ) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "templateOptionsDlgPE" )
                    .markup( ">" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                lDialog$ = $( out.toString() ).dialog({
                    modal:       true,
                    closeText:   lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    minWidth:    400,
                    width:       520,
                    dialogClass: DIALOG_FLUSH_BODY,
                    close: function() {
                        $( "#templateOptionsDlgPE" ).propertyEditor( "destroy" );
                        lDialog$.dialog( "destroy" );
                    },
                    open: function() {
                        var lDialogPE$ = $( "#templateOptionsDlgPE" );
                        lDialogPE$.propertyEditor( {
                            focusPropertyName: "general",
                            hideDisplayGroups: ( lProperties.advanced.length === 0 ),
                            data: {
                                propertySet: [{
                                    displayGroupId:    "common",
                                    displayGroupTitle: msg( "TEMPLATE_OPTIONS.COMMON" ),
                                    properties:        lProperties.common
                                },
                                {
                                    displayGroupId:    "advanced",
                                    displayGroupTitle: msg( "TEMPLATE_OPTIONS.ADVANCED" ),
                                    properties:        lProperties.advanced
                                }]
                            },
                            change: function( pEvent, pData ) {
                            }
                        });

                        $( "#templateOptionsDlg" ).dialog({
                            position: { 'my': 'center', 'at': 'center', of: window }
                        });
                    },
                    buttons: [
                        {
                            text:  msg( "CANCEL" ),
                            click: function() {
                                lDialog$.dialog( "close" );
                            }
                        },
                        {
                            text:     msg( "OK" ),
                            "class":    BUTTON_HOT,
                            disabled: prop.metaData.isReadOnly,
                            click:    function() {
                                var lDialogPE$ = $( "#templateOptionsDlgPE" ),
                                    lValues = templateOptionsHelper.getValuesFromDialog( lProperties, lDialogPE$);
                                // and store the concatenated result in our "Template Options" property
                                that.setValue( pElement$, prop, lValues.join( ":" ));
                                pElement$.trigger( "change" );
                                that.setFocus( pElement$ );
                                lDialog$.dialog( "close" );
                            }
                        }
                    ]
                });
            });
        },
        setValue: function( pElement$, prop, pValue ) {

            var lDisplayValue;

            this[ "super" ]( "setValue", pElement$, prop, pValue );

            // update the button text accordingly
            lDisplayValue = this._getDisplayValue( prop );
            pElement$
                .html( lDisplayValue )
                .attr( "title", lDisplayValue );
        }
    });


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.STATIC_LOV, {

        _getLov: function( pLovValues ) {

            var SEP_REGEXP = /^STATIC([2])?(\(([^,]+),([^,]+)\))?:/,
                STATIC_REGEXP = /^STATIC[2]?(\([^,]+,[^,]+\))?:/,
                SORT = "2",
                ROW_SEP = ",",
                DISP_RETURN_SEP = ";";

            var match      = SEP_REGEXP.exec( pLovValues ),
                isSorted   = ( match[ 2 ] === SORT ? "N" : "Y" ),
                rowSep     = match[ 3 ] || ROW_SEP,
                dispRetSep = match[ 4 ] || DISP_RETURN_SEP,
                lovValues  = pLovValues.replace( STATIC_REGEXP, "" ).split( rowSep ),
                lovValue,
                lov = {
                    sort:   isSorted,
                    values: []
                };

            for ( var i = 0; i < lovValues.length; i++ ) {
                lovValue = lovValues[ i ].split( dispRetSep );
                lov.values.push({
                    displayValue: lovValue[ 0 ],
                    returnValue:  ( lovValue[ 1 ] ? lovValue[ 1 ] : "" ),
                });
            }

            return lov;
        },

        /* Internal helper functions */
        _getButtonText: function( pLovValues ) {

            var lButtonText = msg( "LINK.NO_LINK_DEFINED" ),
                lov = this._getLov( pLovValues );

            if ( lov.values.length > 0 ) {
                for ( var i = 0; i < lov.values.length; i++ ) {
                    if ( i === 0 ) {
                        lButtonText = "";
                    } else {
                        lButtonText += ", ";
                    }
                    lButtonText += lov.values[ i ].displayValue;
                }
            }
            return lButtonText;
        },

        /* Internal functions, storing the widget's metadata */
        _getDisplayGroupValues: function ( pProperties ) {
            return {
                displayGroupId:     STATIC_LOV.GROUP.VALUES,
                displayGroupTitle:  msg( "STATIC_LOV.GROUP.VALUES" ),
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getDisplayGroupSort: function ( pProperties ) {
            return {
                displayGroupId:     STATIC_LOV.GROUP.SORT,
                displayGroupTitle:  msg( "STATIC_LOV.GROUP.SORT" ),
                collapsed:          true,
                properties:         ( pProperties ) ? pProperties : []
            };
        },
        _getPropertyValues: function ( pProperty, pOriginalProperty ) {
            return $.extend( true, {
                propertyName:           STATIC_LOV.PROP.VALUES,
                value:                  [],
                metaData: {
                    type:               PROP_TYPE.STATIC_LOV_VALUES,
                    prompt:             msg( "STATIC_LOV.PROP.VALUES" ),
                    displayGroupId:     STATIC_LOV.GROUP.VALUES,
                    originalProperty:   pOriginalProperty
                },
                errors:                 [],
                warnings:               []
            }, pProperty );
        },
        _getPropertySort: function ( pProperty ) {
            return $.extend( true, {
                propertyName:       STATIC_LOV.PROP.SORT,
                value:              "Y",
                metaData: {
                    prompt:         msg( "STATIC_LOV.PROP.SORT" ),
                    type:           $.apex.propertyEditor.PROP_TYPE.YES_NO,
                    noValue:        "N",
                    yesValue:       "Y",
                    displayGroupId: STATIC_LOV.GROUP.SORT,
                    isRequired:     true
                },
                errors:             [],
                warnings:           []
            }, pProperty );
        },

        /* Property type properties and callbacks */
        noLabel: true,
        render: function( out, id, prop ) {
            var lLabelId = id + "_label";

            this.renderDivOpen( out, { "class": PROPERTY_FIELD_CONTAINER } );
            out.markup( "<button" )
                .attr( "type", "button" )
                .attr( "id", id )
                .attr( "aria-describedby", lLabelId )
                .attr( "class", BUTTON + " " + BUTTON_PROPERTY + " " + BUTTON_FORCE_WRAP )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .attr( "value", prop.value )
                .markup( ">" )
                .content( this._getButtonText( prop.value ) )
                .markup( "</button>" );
            this.renderDivClose( out );
        },
        setValue: function( pElement$, prop, pValue ) {
            var lDisplayValue;

            this[ "super" ]( "setValue", pElement$, prop, pValue );

            // update the button text accordingly
            lDisplayValue = this._getButtonText( pValue );
            pElement$
                .html( lDisplayValue )
                .attr( "title", lDisplayValue );

        },
        init: function( pElement$, prop ) {
            var that = this;

            this.addLabelClickHandler( pElement$, prop );
            this.addTooltipsForErrors( pElement$, prop );

            // the main click handler that launches the lov dialog
            pElement$.closest( "div." + PROPERTY ).on( "click", "#" + pElement$.attr( "id" ), function() {
                var lStaticLovDlg$,
                    out = util.htmlBuilder(),
                    lValue = pElement$.val(),
                    lStaticLovObject = that._getLov( lValue ),
                    lPropertySet = [],
                    lIsRequired = prop.metaData.isRequired,
                    lIsReadOnly = prop.metaData.isReadOnly;

                function _getProperty ( pPropertyName ) {
                    var i, j, lProperty;
                    for ( i = 0; i < lPropertySet.length; i++ ) {
                        for ( j = 0; j < lPropertySet[ i ].properties.length; j++ ) {
                            if ( lPropertySet[ i ].properties[ j ].propertyName === pPropertyName ) {
                                lProperty = lPropertySet[ i ].properties[ j ];
                                break;
                            }
                        }
                    }
                    return lProperty;
                }

                lPropertySet.push (
                    that._getDisplayGroupValues( [
                        that._getPropertyValues({
                                value: lStaticLovObject.values,
                                metaData: {
                                    isReadOnly: prop.metaData.isReadOnly
                                }
                            },
                            prop )
                    ])
                );

                lPropertySet.push (
                    that._getDisplayGroupSort( [
                        that._getPropertySort({
                            value: lStaticLovObject.sort,
                            metaData: {
                                isReadOnly: prop.metaData.isReadOnly
                            }
                        })
                    ])
                );

                // create dialog div
                out.markup( "<div" )
                    .attr( "id", "staticLovDlg" )
                    .attr( "title", prop.metaData.prompt ) // escaping done by jQueryUI dialog
                    .markup( ">" )
                    .markup( "<div" )
                    .attr( "id", "staticLovDlgPE" )
                    .markup( ">" )
                    .markup( "</div>" )
                    .markup( "</div>" );

                lStaticLovDlg$ = $( out.toString() ).dialog( {
                    modal:          true,
                    closeText:      lang.getMessage( "APEX.DIALOG.CLOSE" ),
                    minWidth:       400,
                    width:          520,
                    dialogClass:    DIALOG_FLUSH_BODY,
                    close: function() {
                        $( "#staticLovDlgPE" ).propertyEditor( "destroy" );
                        lStaticLovDlg$.dialog( "destroy" );
                    },
                    open: function() {
                        var lStaticLovDlgPE$ = $( "#staticLovDlgPE" ),
                            lProperty = {
                                metaData: {
                                    isReadOnly: prop.metaData.isReadOnly
                                }
                            };

                        lStaticLovDlgPE$.propertyEditor( {
                            focusPropertyName: STATIC_LOV.PROP.VALUES,
                            data: {
                                propertySet:    lPropertySet,
                                multiEdit:      false
                            }
                        });
                        /*

                        // why do we need this?
                        lStaticLovDlgPE$.propertyEditor( "addProperty", {
                            property:           that._getPropertyValues( lProperty, prop ),
                            displayGroup:       that._getDisplayGroupValues()
                        });

                        lStaticLovDlgPE$.propertyEditor( "addProperty", {
                            property:           that._getPropertySort( lProperty ),
                            displayGroup:       that._getDisplayGroupSort(),
                            prevDisplayGroupId: STATIC_LOV.GROUP.VALUES
                        });
 */

                        $( "#staticLovDlg" ).dialog({
                            position: { 'my': 'center', 'at': 'center', of: window  }
                        });
                    },
                    buttons: [
                        {
                            text:       msg( "CANCEL" ),
                            click:      function() {
                                lStaticLovDlg$.dialog( "close" );
                            }
                        },
                        {
                            text:       msg( "OK" ),
                            "class":    BUTTON_HOT,
                            disabled:   lIsReadOnly,
                            click:      function() {
                                var lValue,
                                    lLovValues,
                                    lErrorProp,
                                    lRowSep = ",",
                                    lDispRetSep = ";";

                                lValue = "STATIC";
                                if ( _getProperty( STATIC_LOV.PROP.SORT ).value === "N" ) {
                                    lValue += "2";
                                }
                                lLovValues = _getProperty( STATIC_LOV.PROP.VALUES ).value;

                                if ( lLovValues.length > 0 ) {
                                    // scan values if they contain our delimiters
                                    for ( var i = 0; i < lLovValues.length; i++ ) {
                                        if ( ( lLovValues[ i ].displayValue || lLovValues[ i ].returnValue ).search( /(,|;)/ ) !== -1 ) {
                                            lRowSep = "\u0001";
                                            lDispRetSep = "\u0002";
                                            lValue += "(" + lRowSep + "," + lDispRetSep + ")";
                                            break;
                                        }
                                    }
                                    lValue += ":";

                                    for ( var i = 0; i < lLovValues.length; i++ ) {
                                        lValue += ( i > 0 ? lRowSep : "" );
                                        if ( lLovValues[ i ].displayValue !== "" && lLovValues[ i ].returnValue !== "" ) {
                                            lValue += lLovValues[ i ].displayValue + lDispRetSep + lLovValues[ i ].returnValue;
                                        } else {
                                            lValue += lLovValues[ i ].displayValue || lLovValues[ i ].returnValue;
                                        }
                                    }
                                    that.setValue( pElement$, prop, lValue );
                                    pElement$.trigger( "change" );
                                    that.setFocus( pElement$ );
                                    lStaticLovDlg$.dialog( "close" );
                                } else {
                                    lErrorProp = _getProperty( STATIC_LOV.PROP.VALUES, msg( "IS_REQUIRED" ) )
                                    lErrorProp.errors.push( msg( "IS_REQUIRED" ) );
                                    $( "#staticLovDlgPE" ).propertyEditor( "updateProperty", lErrorProp );
                                }
                            }
                        }
                    ]
                });
            });
        }
    } );


    $.apex.propertyEditor.addPropertyType( PROP_TYPE.STATIC_LOV_VALUES, {
        stacked:        true,
        noLabel:        true,
        labelVisible:   false,
        minHeight:      122,
        maxHeight:      200,
        render:     function( out, id, prop ) {
            var lLabelId    = id + "_label";
            out.markup( "<div" )
                .attr( "id", id )
                .attr( "class", PROPERTY_FIELD_CONTAINER )
                .attr( "aria-labelledby", lLabelId )
                .attr( "role", "group" )
                .attr( DATA_PROPERTY_ID, prop.propertyName )
                .markup( ">" );

            out.markup( "<table" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_TABLE )
                .markup( ">" )
                .markup( "<caption" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "STATIC_LOV.VALUES" ) )
                .markup( "</caption>" )
                .markup( "<tr>" )
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "STATIC_LOV.VALUE.DISPLAY" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "scope", "col" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_HEADER_HEADER )
                .markup( ">" )
                .content( msg( "STATIC_LOV.VALUE.RETURN" ) )
                .markup( "</th>")
                .markup( "<th" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "STATIC_LOV.REMOVE" ) )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "STATIC_LOV.MOVE_UP" ) )
                .markup( "</th>" )
                .markup( "<th" )
                .attr( "class", VISUALLY_HIDDEN )
                .markup( ">" )
                .content( msg( "STATIC_LOV.MOVE_DOWN" ) )
                .markup( "</th>" )
                .markup( "</tr>" );

            for ( var i = 0; i < prop.value.length; i++ ) {
                this._renderRow( out, {
                    rowId:        i + 1,
                    idPrefix:     id,
                    returnValue:  prop.value[ i ].returnValue,
                    displayValue: prop.value[ i ].displayValue,
                    readOnly:     prop.metaData.isReadOnly,
                    lastRow:      false
                });
            }

            // If the property is currently editable, render an additional row for new STATIC_LOV entries
            if ( !prop.metaData.isReadOnly ) {
                this._renderRow( out, {
                    rowId:      prop.value.length + 1,
                    idPrefix:   id,
                    lastRow:    true
                });
            }
            out.markup( "</table>" );

            this.renderDivClose( out );
        },
        init:       function( pElement$, prop ) {

            var that = this,
                lProperty$ = pElement$.closest( "div." + PROPERTY ),
                lId = pElement$.attr( "id" );

            function swapValue( pInputs1$, pInputs2$, pClass ) {
                var lInput1$ = pInputs1$.filter( "input." + pClass ),
                    lInput2$ = pInputs2$.filter( "input." + pClass ),
                    lInput1Value = lInput1$.val(),
                    lInput2Value = lInput2$.val();

                lInput1$.val( lInput2Value );
                lInput2$.val( lInput1Value );
            }

            // Only add interactivity if property is editable
            if ( !prop.metaData.isReadOnly ) {
                lProperty$
                    .on( "change", "input", function() {
                        var lNext$ = $( this ).closest( "tr" ).next( "tr" ),
                            lNewRow = util.htmlBuilder(),
                            lMoveDown = util.htmlBuilder(),
                            lInput$ = $( this );

                        if ( lInput$.val() && lNext$.length === 0 ) {
                            var lMaxRow = $( "input." + STATIC_LOV_VALUE_DISPLAY ).length;
                            that._renderRow( lNewRow, {
                                rowId:      lMaxRow + 1,
                                idPrefix:   lId,
                                lastRow:    true
                            });
                            that.renderIconButton( lMoveDown, {
                                id:         lId + "_rowMoveDown_" + lMaxRow,
                                icon:       ICON_MOVE_DOWN,
                                text:       format( "STATIC_LOV.MOVE_DOWN_VALUE_N", lMaxRow ),
                            });
                            lInput$
                                .closest( "tr" )
                                .find( "td:last" )
                                .html( lMoveDown.toString())
                                .end()
                                .after( lNewRow.toString());
                        }
                    })
                    .on( "click", "button[id^=" + lId + "_rowRemove_]", function() {
                        var lNext$ = $( this ).closest( "tr" ).next( "tr" );

                        if ( lNext$.length > 0 ) {
                            $( this )
                                .closest( "tr" )
                                .remove();

                            lNext$.find( ":input:first" ).change().focus();
                        } else {
                            // If it's the last row, just clear the values
                            $( this )
                                .closest( "tr" )
                                .find( "input" )
                                .val( "" )
                                .filter( "input." + STATIC_LOV_VALUE_DISPLAY )
                                .change()
                                .focus();
                        }
                    })
                    .on( "click", "button[id^=" + lId + "_rowMoveUp_]", function() {
                        var lCurrent$ = $( this ).closest( "tr" ).find( ":input" ),
                            lPrevious$ = $( this ).closest( "tr" ).prev( "tr." + STATIC_LOV_VALUES_ROW_DATA ).find( ":input");

                        if ( lPrevious$.length > 0 ) {
                            swapValue( lCurrent$, lPrevious$, STATIC_LOV_VALUE_DISPLAY );
                            swapValue( lCurrent$, lPrevious$, STATIC_LOV_VALUE_RETURN );
                            lPrevious$.filter( "button[id^=" + lId + "_rowMove]:first" ).focus();
                            lCurrent$.trigger( "change" );
                        }
                    })
                    .on( "click", "button[id^=" + lId + "_rowMoveDown_]", function() {
                        var lCurrent$ = $( this ).closest( "tr" ).find( ":input" ),
                            lNext$ = $( this ).closest( "tr" ).next( "tr." + STATIC_LOV_VALUES_ROW_DATA ).find( ":input");

                        if ( lNext$.length > 0 ) {
                            swapValue( lCurrent$, lNext$, STATIC_LOV_VALUE_DISPLAY );
                            swapValue( lCurrent$, lNext$, STATIC_LOV_VALUE_RETURN );
                            lNext$.trigger( "change" );
                            $( this ).closest( "tr" ).next( "tr." + STATIC_LOV_VALUES_ROW_DATA ).find( "button[id^=" + lId + "_rowMoveDown_]" ).focus();
                        }
                    });
            }

            this.addLabelClickHandler( pElement$, prop );
        },
        setFocus: function( pElement$ ) {
            pElement$.find( ":input:first" ).focus();
        },
        getValue:   function ( pProperty$ ) {
            var lReturnValue$, lDisplayValue$,
                lValues = [];
            pProperty$.find( "tr." + STATIC_LOV_VALUES_ROW_DATA ).each( function() {
                lDisplayValue$ = $( this ).find( ":input." + STATIC_LOV_VALUE_DISPLAY );
                lReturnValue$ = $( this ).find( ":input." + STATIC_LOV_VALUE_RETURN );
                if ( lDisplayValue$.val() !== "" || lReturnValue$.val() !== "" ) {
                    lValues.push({
                        displayValue: lDisplayValue$.val(),
                        returnValue:  lReturnValue$.val()
                    });
                }
            });
            return lValues;
        },
        _renderRow: function ( out, pOptions ) {
            var lValueDisplayId, lValueReturnId,
                lOptions = $.extend( {
                    rowId:        "",
                    idPrefix:     "",
                    returnValue:  "",
                    displayValue: "",
                    readOnly:     false,
                    lastRow:      false
                }, pOptions );

            lValueReturnId  = lOptions.idPrefix + "_return_" + lOptions.rowId;
            lValueDisplayId = lOptions.idPrefix + "_display_" + lOptions.rowId;

            out.markup( "<tr" )
                .attr( "class", STATIC_LOV_VALUES_ROW_DATA )
                .markup( ">" );
            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lValueDisplayId,
                value:      lOptions.displayValue,
                inputClass: [ STATIC_LOV_VALUE_DISPLAY, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "STATIC_LOV.VALUE_N_DISPLAY", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td>" );
            this.renderBaseInput( out, {
                id:         lValueReturnId,
                value:      lOptions.returnValue,
                inputClass: [ STATIC_LOV_VALUE_RETURN, PROPERTY_FIELD, PROPERTY_FIELD_TEXT ],
                readonly:   lOptions.readOnly,
                attributes: {
                    "aria-label": format( "STATIC_LOV.VALUE_N_RETURN", lOptions.rowId )
                }
            });
            out.markup( "</td>" );
            out.markup( "<td" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_TABLE_REMOVE_COL )
                .markup( ">" );

            this.renderIconButton( out, {
                id:         lOptions.idPrefix + "_rowRemove_" + lOptions.rowId,
                icon:       ICON_REMOVE,
                text:       format( "STATIC_LOV.REMOVE_VALUE_N", lOptions.rowId ),
                disabled:   lOptions.readOnly
            });
            out.markup( "</td>" );
            out.markup( "<td" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_TABLE_REMOVE_COL )
                .markup( ">" );

            // Move Up
            if ( lOptions.rowId > 1 ) {
                this.renderIconButton( out, {
                    id:         lOptions.idPrefix + "_rowMoveUp_" + lOptions.rowId,
                    icon:       ICON_MOVE_UP,
                    text:       format( "STATIC_LOV.MOVE_UP_VALUE_N", lOptions.rowId ),
                    disabled:   lOptions.readOnly
                });
            }
            out.markup( "</td>" );
            out.markup( "<td" )
                .attr( "class", PROPERTY_STATIC_LOV_VALUES_TABLE_REMOVE_COL )
                .markup( ">" );

            // Move Down
            if ( !lOptions.lastRow ) {
                this.renderIconButton( out, {
                    id:         lOptions.idPrefix + "_rowMoveDown_" + lOptions.rowId,
                    icon:       ICON_MOVE_DOWN,
                    text:       format( "STATIC_LOV.MOVE_DOWN_VALUE_N", lOptions.rowId ),
                    disabled:   lOptions.readOnly
                });
            }
            out.markup( "</td>" );
            out.markup( "</tr>" );
        }
    });

    $.apex.propertyEditor.addPropertyType( PROP_TYPE.SUBSCRIPTION,    null, $.apex.propertyEditor.PROP_TYPE.TEXT );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.OWNER,           null, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.COLUMN,          null, $.apex.propertyEditor.PROP_TYPE.SELECT_LIST );
    $.apex.propertyEditor.addPropertyType( PROP_TYPE.REGION_COLUMN,   null, PROP_TYPE.COLUMN );


    /*
     * Returns the value for a property
     * If multiple components and the values vary, then return the PE widget constant VALUE_VARIES.
     */
    function _getPropertyValue( pComponents, pPropertyId ) {
        var i, lPropertyValue;
        for ( i = 0; i < pComponents.length; i++ ) {
            if ( i === 0 ) {
                lPropertyValue = pComponents[ i ].getProperty( pPropertyId ).getValue();
            } else {
                if ( lPropertyValue !== pComponents[ i ].getProperty( pPropertyId ).getValue() ) {
                    lPropertyValue = pe$.propertyEditor( "getValueVariesConstant" );

                    // As soon as we have a value that varies, stop checking further components
                    break;
                }
            }
        }
        return lPropertyValue;
    }

    // Look through notification properties, and return an array of properties that are relevant based on
    // events passed in pEvents
    function _getEventSpecificProperties ( pProperties, pEvents ) {
        var lKey, i,
            lEvents = [],
            lReturnProperties = [];
        for ( lKey in pProperties ) {
            if ( pProperties.hasOwnProperty( lKey ) ) {
                lEvents = pProperties[ lKey ];
                for ( i = 0; i < lEvents.length; i++ ) {

                    // Store property if it's event matches, and if it hasn't already been added
                    if ( ( $.inArray( lEvents[ i ], pEvents ) > -1 ) && $.inArray( lKey, lReturnProperties ) === -1 ) {
                        lReturnProperties.push( lKey );
                    }
                }
            }
        }
        return lReturnProperties;
    }

    // transforms a property from the client data model into a Property Editor format property
    function _toPEProperty ( pProperty, pComponents ) {

        var i, j, k, lLovValues,
            lMasterLovValues = [],
            lAllLovValues = [],
            lPropertyMetaData = pProperty.getMetaData(),
            TYPES_TO_CHECK_LOV_VALUES = [ PROP_TYPE.SELECT_LIST, PROP_TYPE.COMPONENT, PROP_TYPE.SUPPORTED_UI ];

        if ( pComponents.length > 1 ) {

            if ( $.inArray( lPropertyMetaData.type, TYPES_TO_CHECK_LOV_VALUES ) !== -1 ) {

                // loop through all components selected, and build array of all lov value arrays
                for ( i = 0; i < pComponents.length; i++ ) {
                    lLovValues = {
                        values: pComponents[ i ].getProperty( pProperty.id ).getMetaData().lovValues(),
                        map:    {}
                    };
                    // build a lookup map for a quicker check if a lov value exists
                    for ( j = 0; j < lLovValues.values.length; j++ ) {
                        lLovValues.map[ lLovValues.values[ j ].r ] = true;
                    }
                    lAllLovValues.push( lLovValues );
                }

                // Sort arrays to get the shortest array at the beginning. The first array is used as the master, so
                // by sorting we reduce the number of comparisons we have to make.
                lAllLovValues.sort(function(a, b) {
                    return a.values.length - b.values.length;
                });

                // Store first array (which is also now the shortest), which will be used as the master list
                lMasterLovValues = lAllLovValues[ 0 ].values;

                // Now let's go through each subsequent array, and remove items from the master array if they are not found
                for ( j = 1; j < lAllLovValues.length; j++ ) {

                    for ( k = 0; k < lMasterLovValues.length; k++ ) {

                        // If we don't find a match, remove from the master array
                        if ( !lAllLovValues[ j ].map.hasOwnProperty( lMasterLovValues[ k ].r )) {
                            lMasterLovValues.splice(k, 1);
                            k -= 1; // k stays the same for next iteration
                        }

                    }
                }

                // Update the metadata with the new master lov values array
                lPropertyMetaData.lovValues = lMasterLovValues;

            }
        }

        return {
            metaData:     lPropertyMetaData,
            propertyName: pProperty.id,
            errors:       pProperty.errors,
            warnings:     pProperty.warnings,
            value:        _getPropertyValue( pComponents, pProperty.id ),
            oldValue:     _getPropertyValue( pComponents, pProperty.id ),
            hasChanged:   pProperty.hasChanged
        };
    }

    function _setPropertyEditorTitle( pComponentTypeTitle, pComponentTypeId ) {
        var lTab$,
            lPETitle = "";

        // Tab layout in PE
        if ( pComponentTypeTitle ) {
            lPETitle = pComponentTypeTitle;
        } else {
            lPETitle = formatNoEscape( "TITLE" );
        }
        lTab$ = pd.getTab( "peComponentProperties" );
        lTab$.find( ".ui-tabs-anchor" ).text( lPETitle );
    }

    function _clearPropertyEditor() {

        gLastComponents = null;

        pe$.propertyEditor("option", {
            data: {
                propertySet: [],
                propertyValues: []
            }
        });

        pd.clearHelpText();

        _setPropertyEditorTitle();

        // disable all PE toolbar buttons
        $( "#peToolbar" ).find( "button" ).each(function() {
            $( this ).prop( "disabled", true );
        });

        model.unobserver( PE_WIDGET_NAME, {} );
    }

    // Render property editor for selected component(s)
    function _selectionChanged( pComponents, pPropertyId ) {
        var i, lComponentTypeId,
            lComponentTypeTitle = "";

        if ( pComponents.length > 0 ) {

            for ( i = 0; i < pComponents.length; i++ ) {
                if ( i === 0 ) {
                    lComponentTypeTitle = model.getComponentType( pComponents[ i ].typeId ).title.singular;
                    lComponentTypeId = pComponents[ i ].typeId;
                } else {
                    if ( pComponents[ i ].typeId === pComponents[ i - 1 ].typeId ) {
                        lComponentTypeTitle = model.getComponentType( pComponents[ i ].typeId ).title.plural;
                        lComponentTypeId = pComponents[ i ].typeId;
                    } else {
                        lComponentTypeTitle = msg( "MULTIPLE_TYPES" );

                        // as soon as we know we have different component types, exit out
                        break;
                    }
                }
            }

            gLastComponents = pComponents;
            selectComponents( pComponents, pPropertyId );
            _setPropertyEditorTitle( lComponentTypeTitle, lComponentTypeId );


            // enable all PE toolbar buttons
            $( "#peToolbar" ).find( "button" ).each(function() {
                $( this ).prop( "disabled", false );
            });

        } else {
            _clearPropertyEditor();
        }

    }


    function selectComponents( pComponents, pPropertyId ) {

        var i, j, k,
            lPropertyId,
            lPropertyValue,
            lProperty,
            lGroupId,
            lComponent,
            lExclude,
            lProperties,
            lComponentType,
            lComponentTypeEditFunction,
            lPropertyMetaData  = {},
            lGroups    = [],
            lGroupsMap = {},
            peGoToGroupMenu,
            peGoToGroup$,
            peGoToGroupMenuItems = [];

        lComponentType = model.getComponentType( pComponents[ 0 ].typeId );

        // For Shared Components we only want to show the "Name" property
        if ( lComponentType.isSharedComponent ) {
            lProperties = [ pComponents[ 0 ].getProperty( lComponentType.displayPropertyId ) ];
        } else {
            lProperties = pComponents[ 0 ].getProperties();
        }

        // create array of property metadata, indexed by property ID
        for ( i = 0; i < lProperties.length; i++ ) {
            lPropertyMetaData[ lProperties[ i ].id ] = lProperties[ i ].getMetaData();
        }

        // then sorting our properties, by referencing the meta data display sequence, using the property ID as the index
        lProperties.sort( function( a, b ) {
            return ( lPropertyMetaData[ a.id ].displaySeq - lPropertyMetaData[ b.id ].displaySeq );
        });

        // Multi-edit specifics; only keep common properties
        if ( pComponents.length > 1 ) {

            for ( i = 0; i < lProperties.length; i++ ) {
                lProperty = lProperties[ i ];
                lExclude = false;

                // first if this property is unique, or its type is not eligible for multi-edit, set the exclude flag
                if ( lPropertyMetaData[ lProperty.id ].isUnique || $.inArray( lPropertyMetaData[ lProperty.id ].type, TYPES_EXCLUDED_FROM_MULTI_EDIT ) > -1 ) {
                    lExclude = true;
                }

                // if the exclude flag is not yet set, check if any of the current components do not have this property
                if ( !lExclude ) {
                    for ( j = 1; j < pComponents.length; j++ ) {
                        lComponent = pComponents[ j ];
                        // if component doesn't have property then exclude this property and no need to look at any other components
                        if ( !lComponent.getProperty( lProperty.id )) {
                            lExclude = true;
                            break;
                        }
                    }
                }

                if ( lExclude ) {
                    // remove property and the metadata
                    delete lPropertyMetaData[ lProperty.id ];
                    lProperties.splice(i, 1);
                    i -= 1; // i stays the same for next iteration
                }
            }

        }

        // Build a list of display groups and properties in the order of the property sequence.
        // The first reference of a display group by a property defines it's overall display order.
        for ( i = 0; i < lProperties.length; i++ ) {
            lProperty   = lProperties[ i ];
            lPropertyId = lProperty.id;
            lPropertyValue = _getPropertyValue( pComponents, lPropertyId );
            lGroupId    = lPropertyMetaData[ lPropertyId ].displayGroupId;

            // Exclude HIDDEN property types, these should not be passed to the property editor
            if ( lPropertyMetaData[ lPropertyId ].type !== PROP_TYPE.HIDDEN ) {

                // If it's a new group which we haven't stored yet, add it in sequence to our group array
                if ( !lGroupsMap.hasOwnProperty( lGroupId )) {

                    lGroups.push({
                        displayGroupId:    lGroupId,
                        displayGroupTitle: model.getDisplayGroup( lGroupId ).title,
                        collapsed:         !!gCurrentCollapsedGroups[lGroupId],
                        properties:        []
                    });
                    lGroupsMap[ lGroupId ] = lGroups.length - 1;
                }

                // Add the property as next displayed property to it's group
                lGroups[ lGroupsMap[ lGroupId ]].properties.push( _toPEProperty ( lProperty, pComponents ));
            }
        }

        // go to group
        peGoToGroupMenuItems.push({
            type: "action",
            labelKey: "PD.PE.EXPAND_ALL",
            action: function () {
                pe$.propertyEditor( "expandAll" );
            }
        },
            { type: "separator" }
        );
        for ( k = 0; k < lGroups.length; k++ ) {
            peGoToGroupMenuItems.push({
                type: "action",
                label: lGroups[ k ].displayGroupTitle,
                value: lGroups[ k ].displayGroupId,
                action: function () {
                    pe$.propertyEditor( "goToGroup", this.value );

                    // return true so the menu doesn't handle focus
                    return true;
                }
            });
        }
        peGoToGroupMenu = { items: peGoToGroupMenuItems };
        peGoToGroup$ = $( "#pe_goto_group_menu" );
        peGoToGroup$.menu( peGoToGroupMenu );

        // Edit Component logic, for component edits external to the PE (components from global page, shared components)
        if ( pComponents.length === 1 ) {
            lComponent = pComponents[ 0 ];
            if ( lComponentType.isSharedComponent ) {
                lComponentTypeEditFunction = function() {
                    nav.redirect( lComponentType.editUrl
                        .replace( /%session%/g, $v( "pInstance" ) )
                        .replace( /%pk_value%/g, lComponent.id )
                        .replace( /%application_id%/g, model.getCurrentAppId() )
                        .replace( /%page_id%/g, model.getCurrentPageId() ) );
                };
            }
            if ( lComponent.isOnGlobalPage() ) {
                lComponentTypeEditFunction = function() {
                    pd.setPageSelection( model.getCurrentAppId(), lComponent.pageId, lComponent.typeId, lComponent.id, function() {} );
                };
            }
        }

        // Set widget options for newly selected component
        pe$.propertyEditor( "option", {
            focusPropertyName:  pPropertyId,
            externalEdit:       lComponentTypeEditFunction,
            // set general options prior to setting the data (because that does the refresh)
            data: {
                propertySet:    lGroups,
                componentCount: pComponents.length
            }
        });

        // Add observers for all the displayed components
        model.unobserver( PE_WIDGET_NAME, {});
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.CHANGE ]
            },
            function( pNotifications ) {

                var i, lPropertyId,
                    len = pNotifications.length,
                    notif,
                    lProperties = {},
                    lComponents = [];

                debug.trace( "%s: CHANGE component notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < len; i++ ) {
                    notif = pNotifications[ i ];
                    lComponents.push( notif.component );

                    for ( lPropertyId in notif.properties ) {
                        if ( notif.properties.hasOwnProperty( lPropertyId ) && $.inArray( model.EVENT.CHANGE, notif.properties[ lPropertyId ]) !== -1 ) {
                            lProperties[ lPropertyId ] = true;
                        }

                        // 1) Add is-changed flag on redo.
                        // 2) Remove this flag on undo, if the hasChanged is false.
                        if ( notif.action === 'redo' ) {
                            pe$.find("[data-property-id=" + lPropertyId + "]").first().parent().parent().addClass(IS_CHANGED);
                        } else if ( notif.action === 'undo' ) {
                            if ( notif.component.getProperty(lPropertyId) !== undefined ) {
                                // need to check undefined because radio YES/NO attribute somehow returns two components obj,
                                // and the second one is undefined, causing error when call getProperty() on it.
                                if ( !notif.component.getProperty(lPropertyId).hasChanged ) {
                                    pe$.find("[data-property-id=" + lPropertyId + "]").first().parent().parent().removeClass(IS_CHANGED);
                                }
                            }
                        }

                    }
                }
                for ( lPropertyId in lProperties ) {
                    if ( lProperties.hasOwnProperty( lPropertyId ) ) {
                        pe$.propertyEditor( "updatePropertyValue", lPropertyId, _getPropertyValue( lComponents, lPropertyId ), true );
                    }
                }
            },
            true
        );
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.ADD_PROP,
                    model.EVENT.REMOVE_PROP ]
            },
            function( pNotifications ) {

                var lComponentType, lProperties, lProperty, lExclude, lComponent, i, j, k, m, n, lPropertyToAdd,
                    lPropertiesToAdd, lPropertiesToRemove, lDisplayGroupId, lPropertyId,
                    lPropertyMetaData = {},
                    lComponents = [],
                    lDisplayGroupArray = [];

                debug.trace( "%s: ADD_PROP/REMOVE_PROP notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < pNotifications.length; i++ ) {
                    lComponents.push( pNotifications[ i ].component );
                }

                lPropertiesToAdd = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.ADD_PROP ] );

                lComponentType = model.getComponentType( pComponents[ 0 ].typeId );

                // For Shared Components we only want to show the "Name" property
                if ( lComponentType.isSharedComponent ) {
                    lProperties = [ pComponents[ 0 ].getProperty( lComponentType.displayPropertyId ) ];
                } else {
                    lProperties = pComponents[ 0 ].getProperties();
                }
                // create array of property metadata, indexed by property ID
                for ( j = 0; j < lProperties.length; j++ ) {
                    lPropertyMetaData[ lProperties[ j ].id ] = lProperties[ j ].getMetaData();
                }

                // then sorting our properties, by referencing the meta data display sequence, using the property ID as the index
                lProperties.sort( function( a, b ) {
                    return ( lPropertyMetaData[ a.id ].displaySeq - lPropertyMetaData[ b.id ].displaySeq );
                });

                if ( pComponents.length > 1 ) {
                    // go through all components and only keep the properties in common
                    for ( k = 0; k < lProperties.length; k++ ) {
                        lProperty = lProperties[ k ];

                        lExclude = false;

                        // first if this property is unique, or its type is not eligible for multi-edit, set the exclude flag
                        if ( lPropertyMetaData[ lProperty.id ].isUnique || $.inArray( lPropertyMetaData[ lProperty.id ].type, TYPES_EXCLUDED_FROM_MULTI_EDIT ) > -1 ) {
                            lExclude = true;
                        }

                        // if the exclude flag is not yet set, check if any of the current components do not have this property
                        if ( !lExclude ) {
                            for ( m = 1; m < pComponents.length; m++ ) {
                                lComponent = pComponents[ m ];
                                // if component doesn't have property then exclude this property and no need to look at any other components
                                if ( !lComponent.getProperty( lProperty.id )) {
                                    lExclude = true;
                                    break;
                                }
                            }
                        }

                        if ( lExclude ) {
                            // remove property and the metadata
                            delete lPropertyMetaData[ lProperty.id ];
                            lProperties.splice(k, 1);
                            k -= 1; // k stays the same for next iteration
                        }
                    }
                }

                // now that we know all the properties that should be displayed from the model, look for our
                // new property in the lProperties array, then use that
                // to get the previous property, display group and previous display group
                for ( n = 0; n < lProperties.length; n++ ) {
                    lPropertyId = lProperties[ n ].id;

                    // exclude HIDDEN properties
                    if ( lPropertyMetaData[ lPropertyId ].type !== PROP_TYPE.HIDDEN ) {

                        lDisplayGroupId = lPropertyMetaData[ lPropertyId ].displayGroupId;

                        // build array of unique display groups to get easy access to previous display group
                        if ( n === 0 ) {
                            lDisplayGroupArray.push( lDisplayGroupId );
                        } else {
                            // if this isn't the first iteration, check the previous group, if it's different, add to array
                            if ( lDisplayGroupId !== lPropertyMetaData[ lProperties[ n - 1 ].id ].displayGroupId ) {
                                lDisplayGroupArray.push( lDisplayGroupId );
                            }
                        }

                        // loop over properties to add and check if this property is to be added
                        for ( i = 0; i < lPropertiesToAdd.length; i++ ) {
                            if ( lPropertyId === lPropertiesToAdd[ i ] ) {

                                // store property to add
                                lPropertyToAdd = pNotifications[ 0 ].component.getProperty( lPropertiesToAdd[ i ] );

                                pe$.propertyEditor( "addProperty", {
                                    property:           _toPEProperty( lPropertyToAdd, lComponents ),
                                    prevPropertyName:   lProperties[ n - 1 ].id,
                                    displayGroup:       {
                                        displayGroupId:     lPropertyMetaData[ lProperties[ n ].id ].displayGroupId,
                                        displayGroupTitle:  model.getDisplayGroup( lDisplayGroupId ).title,
                                        properties:         []
                                    },
                                    prevDisplayGroupId: lDisplayGroupArray[ lDisplayGroupArray.length - 2 ]
                                });

                                // exit loop, we have found our new property
                                break;
                            }
                        }
                    }
                }


                // properties to remove
                lPropertiesToRemove = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.REMOVE_PROP ] );
                for ( i = 0; i < lPropertiesToRemove.length; i++ ) {
                    pe$.propertyEditor( "removeProperty", lPropertiesToRemove[ i ] );
                }

            },
            true
        );
        model.observer(
            PE_WIDGET_NAME, {
                components: pComponents,
                events: [
                    model.EVENT.ERRORS,
                    model.EVENT.NO_ERRORS,
                    model.EVENT.WARNINGS,
                    model.EVENT.NO_WARNINGS,
                    model.EVENT.META_DATA ]
            },
            function( pNotifications ) {

                var i, j, lAffectedProperties, lProperty, lPEProperty,
                    lComponents = [];

                debug.trace( "%s: ERRORS/NO_ERRORS/WARNINGS/NO_WARNINGS/META_DATA notification received", PE_WIDGET_NAME, pNotifications );

                // first we have to loop through the notifications, to build up a complete list of components changed.
                for ( i = 0; i < pNotifications.length; i++ ) {
                    lComponents.push( pNotifications[ i ].component );
                }

                lAffectedProperties = _getEventSpecificProperties( pNotifications[ 0 ].properties, [ model.EVENT.ERRORS, model.EVENT.NO_ERRORS, model.EVENT.WARNINGS, model.EVENT.NO_WARNINGS, model.EVENT.META_DATA ] );
                for ( j = 0; j < lAffectedProperties.length; j++ ) {
                    lProperty = pNotifications[ 0 ].component.getProperty( lAffectedProperties[ j ] );

                    lPEProperty = _toPEProperty( lProperty, lComponents );

                    pe$.propertyEditor( "updateProperty", lPEProperty );
                }

            },
            true
        );

        model.observer(
            PE_WIDGET_NAME,
            {
                components: pComponents,
                events:     [ model.EVENT.DELETE ]
            },
            function( pNotifications ) {

                var i, j;

                debug.trace( "%s: DELETE component notification received", PE_WIDGET_NAME, pNotifications );

                // loop through current selected components
                for ( j = 0; j < gLastComponents.length; j++ ) {

                    // check if it has been deleted by looping through deleted components
                    for ( i = 0; i < pNotifications.length; i++ ) {
                        if ( pNotifications[ i ].component.typeId === gLastComponents[ j ].typeId ) {
                            gLastComponents.splice( j, 1 );
                            j -= 1;
                            break;
                        }
                    }
                }

                _selectionChanged( gLastComponents );

            },
            true
        );
    }

    $( function() {
        gEditorDlgWidth = parseInt( pd.getPreference( PREF_CODE_EDITOR_DLG_W ), 10 );
        if ( isNaN( gEditorDlgWidth ) ) {
            gEditorDlgWidth = 900;
        }
        gEditorDlgHeight = parseInt( pd.getPreference( PREF_CODE_EDITOR_DLG_H ), 10 );
        if ( isNaN( gEditorDlgHeight ) ) {
            gEditorDlgHeight = 600;
        }

        // Note: gPreference is a global emitted directly from page 4500 during rendering
        // Can't use getPreference because code editor doesn't use the same prefix as the rest of PE/PD
        gEditorSettings = window.gPreferences[CODE_EDITOR_PREF_NAME] || "";  // empty string will use code editor widget defaults

        pe$ = $( "#pe" );
        pe$.propertyEditor({
            showAll: true,
            expand: function( pEvent, pData ) {
                delete gCurrentCollapsedGroups[ pData.displayGroupId ];
            },
            collapse: function( pEvent, pData ) {
                gCurrentCollapsedGroups[ pData.displayGroupId ] = true;
            },
            searchable: true,
            change: function( pEvent, pData ) {
                var i,
                    lMessage = model.transaction.message( {
                        action:     model.MESSAGE_ACTION.CHANGE,
                        component:  gLastComponents[ 0 ],
                        property:   gLastComponents[ 0 ].getProperty( pData.propertyName ),
                        count:      gLastComponents.length
                    }),
                    lTransaction = model.transaction.start( PE_WIDGET_NAME, lMessage );

                for ( i = 0; i < gLastComponents.length; i++ ) {
                    gLastComponents[ i ].getProperty( pData.propertyName ).setValue( pData.property.value );
                }

                apex.commandHistory.execute( lTransaction );

            }
        });

        // Property help
        pe$.on( "propertyeditoractivate", function( pEvent, pProperty ) {
            var out = apex.util.htmlBuilder(),
                helpText = pProperty.metaData.helpText;

            if ( $.isFunction( helpText )) {
                helpText = helpText();
            }

            out.markup( "<h3>" ).content( pProperty.metaData.prompt ).markup( "</h3>" );
            if ( helpText.charAt(0) !== "<" ) {
                helpText = "<p>" + helpText + "</p>";
            }
            out.markup( helpText );
            if ( !pProperty.metaData.isCustomPluginAttribute ) {
                pd.setHelpText( out.toString(), "P1_COMPONENT_TYPE_ID,P1_PROPERTY_ID,P1_APEX_VERSION:" + gLastComponents[ 0 ].typeId + "," + pProperty.propertyName + "," + gApexVersion );
            } else {
                pd.setHelpText( out.toString() );
            }
        }).on( "propertyeditordeactivate", function() {
                pd.clearHelpText();
        });


        $( document ).on( "selectionChanged", function( pEvent, pWidget, pComponents, pPropertyId ) {
            _selectionChanged( pComponents, pPropertyId );
        });

        $( document ).on( "modelCleared", function() {
            _clearPropertyEditor();
        });
    });


})( pe, apex.jQuery, apex.debug, apex.lang, apex.util, window.pageDesigner, apex.navigation, apex.server, apex.templateOptionsHelper );