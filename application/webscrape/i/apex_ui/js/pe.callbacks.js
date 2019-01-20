/*global apex*/

/**
 @license

 Oracle Database Application Express, Release 5.2

 Copyright © 2017, Oracle. All rights reserved.
 */

/**
 * @fileOverview
 * todo documentation
 **/

/**
 * @namespace
 **/
( function( model, $, debug, util, locale, lang, server, undefined ) {
    "use strict";

    var ITEM_TYPE = {
            SELECT_LIST:      "NATIVE_SELECT_LIST",
            RICH_TEXT_EDITOR: "NATIVE_RICH_TEXT_EDITOR",
            TEXTAREA:         "NATIVE_TEXTAREA",
            SHUTTLE:          "NATIVE_SHUTTLE",
            FILE:             "NATIVE_FILE",
            HIDDEN:           "NATIVE_HIDDEN",
            TEXT_FIELD:       "NATIVE_TEXT_FIELD",
            NUMBER_FIELD:     "NATIVE_NUMBER_FIELD",
            DATE_PICKER:      "NATIVE_DATE_PICKER",
            ROW_ACTION:       "NATIVE_ROW_ACTION",
            ROW_SELECTOR:     "NATIVE_ROW_SELECTOR"
        },
        gSavedSourceSqlQuery = "";


    function msg( pKey ) {
        return lang.getMessage( "MODEL.CALLBACKS." + pKey );
    };

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    };

    function _hasChanged( pProperty, pAction, pChangedProperty ) {

        return (  pProperty
               && (  pAction === model.CALLBACK_ACTION.CREATED
                  || ( pAction === model.CALLBACK_ACTION.CHANGED && pChangedProperty.id === pProperty.id )
                  )
               );
    } // _hasChanged


    function _hasChangedEqualsTo( pProperty, pAction, pChangedProperty, pValue ) {

        return (  _hasChanged( pProperty, pAction, pChangedProperty )
               && pProperty.getValue() === pValue
               );
    } // _hasChangedEqualsTo


    function _hasChangedEqualsNotTo( pProperty, pAction, pChangedProperty, pValue ) {

        return (  _hasChanged( pProperty, pAction, pChangedProperty )
               && pProperty.getValue() !== pValue
               );
    } // _hasChangedEqualsNotTo


    function _removeComponents( pComponents ) {

        for ( var i = 0; i < pComponents.length; i++ ) {
            pComponents[ i ].remove();
        }
    }

    function _removeChildren( pComponent, pTypeId ) {

        _removeComponents( pComponent.getChilds( pTypeId ));

    } // _removeChildren

    function _setPropertyValue( pComponent, pPropertyId, pValue ) {

        var lProperty = pComponent.getProperty( pPropertyId );

        // only set the property if it really exists and it has changed
        if ( lProperty ) {
            lProperty.setValue( pValue );
        }
    } // _setProperty

    function initCapColumnName( pColumnName ) {

        // initcap column name and replace underscores with spaces
        // Escape column name to avoid issues if the column name contains html meta characters, because the column heading is normally not escaped
        return util.escapeHTML( 
            pColumnName
                .replace(/_+/g, "_").replace(/^_+/, "").replace(/_+$/, "").replace(/_/g, " ")
                .toLowerCase()
                .split(" ")
                .map( function( word ) {return word.replace( word[0], word[0].toUpperCase() )} ).join(" ")
        );
    } // initCapColumnName


    function getDmlProcesses() {

        return model.getComponents( model.COMP_TYPE.PAGE_PROCESS, {
            properties: [{
                id:    model.PROP.PAGE_PROCESS_TYPE,
                value: new RegExp( "^(NATIVE_FORM_FETCH|NATIVE_FORM_PROCESS)$" )
            }]
        });

    } // getDmlProcesses


    function manageColumns( pRegion, pColumnsParent, pColumnComponentTypeId, pColumnNamePropertyId, pOptions ) {

        function getSqlColumns( pSqlColumns, pSetSqlColumn ) {

            var i,
                lColumns = [];

            for ( i = 0; i < pSqlColumns.length; i++ ) {
                lColumns.push({
                    name:         pSqlColumns[ i ].name,
                    type:         pSqlColumns[ i ].type,
                    maxLen:       pSqlColumns[ i ].maxLen,
                    isRequired:   pSqlColumns[ i ].isRequired,
                    no:           i + 1,
                    regionColumn: null
                });

                if ( pSetSqlColumn ) {
                    pSetSqlColumn( lColumns[ i ]);
                }
            }
            return lColumns;
        } // getSqlColumns

        function removeUnusedColumns( pSqlColumns, pParent, pComponentTypeId, pOptions ) {

            var lRegionColumns = pParent.getChilds( pComponentTypeId ),
                i, j,
                lFound,
                lColumnNameProperty,
                lColumnName;

            // Remove all columns which don't exist anymore or where the type has changed
            for ( i = 0; i < lRegionColumns.length; i++ ) {
                lFound = false;
                lColumnNameProperty = lRegionColumns[ i ].getProperty( pColumnNamePropertyId );
                if ( lColumnNameProperty ) {
                    lColumnName = lColumnNameProperty.getValue();
                } else {
                    // not a database column, we can ignore it
                    lFound = true;
                }
                for ( j = 0; j < pSqlColumns.length && !lFound; j++ ) {
                    if ( pSqlColumns[ j ].name === lColumnName && ( !pOptions.compareCheck || pOptions.compareCheck( pSqlColumns[ j ], lRegionColumns[ i ] ))) {
                        pSqlColumns[ j ].regionColumn = lRegionColumns[ i ];
                        lFound = true;
                        break;
                    }
                }

                if ( !lFound && ( !pOptions.removeCheck || pOptions.removeCheck( lRegionColumns[ i ]))) {
                    lRegionColumns[ i ].remove();
                }
            }
        } // removeUnusedColumns


        function addUpdateColumns( pSqlColumns, pParent, pComponentTypeId, pOptions ) {

            var lRegionColumns = pParent.getChilds( pComponentTypeId ),
                i,
                lPreviousComponent,
                lValues;

            // New columns should be added after the existing columns
            if ( lRegionColumns.length > 0 ) {
                lPreviousComponent = lRegionColumns[ lRegionColumns.length - 1 ];
            }

            // Add all columns where we don't have a region/report column yet or update where something has changed
            for ( i = 0; i < pSqlColumns.length; i++ ) {

                // If the SQL statement contains a new column, add it.
                if ( !pSqlColumns[ i ].regionColumn ) {

                    lValues = [];
                    lValues.push({ id: model.PROP.COLUMN_NAME, value: pSqlColumns[ i ].name });
                    pOptions.add( lValues, pSqlColumns[ i ]);

                    lPreviousComponent = new model.Component({
                        previousComponent: lPreviousComponent,
                        typeId:            pComponentTypeId,
                        parentId:          pParent.id,
                        values:            lValues
                    });

                } else {
                    pOptions.update( pSqlColumns[ i ].regionColumn, pSqlColumns[ i ]);
                }
            }
        }


        var lSqlColumns;

        // If we don't want that the ROWID column gets removed, we have read it as valid column but later remove it
        // before we are actually adding new columns. This is needed for IG which adds the ROWID column in case the IG
        // is editable and it shouldn't be removed as soon as the query is modified.

        lSqlColumns = model.getSourceLocationProperty( pRegion ).getColumns( true );

        // Only if we have a valid SQL which has returned columns, we try to add/modify the report columns
        if ( lSqlColumns.length > 0 ) {

            lSqlColumns = getSqlColumns( lSqlColumns, pOptions.setSqlColumn );

            // Remove all columns which don't exist anymore
            removeUnusedColumns( lSqlColumns, pColumnsParent, pColumnComponentTypeId, {
                compareCheck: pOptions.compareCheck,
                removeCheck:  pOptions.removeCheck
            });

            // Remove ROWID column, don't add it as a column if it hasn't been selected by the developer
            if ( pOptions.ignoreRowid ) {
                for ( var i = 0; i < lSqlColumns.length; i++ ) {
                    if ( lSqlColumns[ i ].name === "ROWID" && lSqlColumns[ i ].type === "ROWID" && i === 0 ) {
                        lSqlColumns.splice( i, 1 );
                        break;
                    }
                }
            }

            // Add or Update columns
            addUpdateColumns( lSqlColumns, pColumnsParent, pColumnComponentTypeId, {
                add:    pOptions.add,
                update: pOptions.update
            });
        }
    }


    function reSequenceColumns( pRegion, pTypeId ) {

        var lColumns;

        function updateColumns( pPropertyId ) {
            var i,
                lProperty;

            // Re-sequence the property without any gaps
            for ( i = 0; i < lColumns.length; i++ ) {
                lProperty = lColumns[ i ].getProperty( pPropertyId );
                if ( parseInt( lProperty.getValue(), 10 ) !== i + 1 ) {
                    lProperty.setValue( i + 1 );
                }
            }
        }

        // Get all the columns of the region and sort it by display sequence
        lColumns = pRegion.getChilds( pTypeId );
        updateColumns( model.PROP.DISPLAY_SEQUENCE );

        // Sort the columns by query column id
        lColumns = lColumns.sort( function( a, b ) {

            var aIsVirtual = ( a.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "Y" ),
                bIsVirtual = ( b.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "Y" );

            // Virtual columns should always be ordered last, and within them based on query column id
            if ( aIsVirtual && !bIsVirtual ) {
                return 1;
            } else if ( !aIsVirtual && bIsVirtual ) {
                return -1;
            } else {
                return parseInt( a.getProperty( model.PROP.QUERY_COLUMN_ID ).getValue(), 10 ) - parseInt( b.getProperty( model.PROP.QUERY_COLUMN_ID ).getValue(), 10 );
            }
        });
        updateColumns( model.PROP.QUERY_COLUMN_ID );

    } // reSequenceColumns


    function setChartXML( pChartAttr, pProperty ) {
        if ( pProperty.getValue() === "Y" ) {
            server.process( "getChartXML", {
                x01: pChartAttr.parentId
            },{
                dataType: "text",
                async: false, // Has to be sync because the setValue has to be executed as part of the current transaction
                success: function( pData ) {
                    var lCustomXML = pChartAttr.getProperty( model.PROP.CUSTOM_XML );
                    lCustomXML.setValue( pData );
                }
            });
        }
    }


    function hasOrderBy( pRegion ) {

        var lOrderByProperty = pRegion.getProperty( model.PROP.SOURCE_QUERY_ORDER_BY );

        // Check region SQL statement or Order By attribute if it contains an ORDER BY clause
        return ( model.getSourceLocationProperty( pRegion ).hasOrderBy() || ( lOrderByProperty && lOrderByProperty.getValue() !== "" ));

    };


    function classicRptTabularFormPlugin( pAction, pProperty, pRegion, pComponentTypeId, pColumnComponentTypeId ) {

        function removeAll( pRegion ) {

            // Remove the report attributes and columns if that hasn't already been done (i.e if the region is removed)
            _removeChildren( pRegion, pComponentTypeId );
            _removeChildren( pRegion, pColumnComponentTypeId );

        } // removeAll

        var lColumns,
            lSourceProperty;


        if (  pAction === model.CALLBACK_ACTION.CREATED
            || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, model.SOURCE_LOCATION_PROPS ) !== -1 ))
        {
            if ( pAction === model.CALLBACK_ACTION.CREATED ) {

                new model.Component({
                    typeId:   pComponentTypeId,
                    parentId: pRegion.id
                });
            }

            manageColumns( pRegion, pRegion, pColumnComponentTypeId, model.PROP.COLUMN_NAME, {
                removeCheck: function( pReportColumn ) {
                    // Remove the existing report column if it isn't contained in the SQL anymore,
                    // but don't remove it if it's one of our "virtual" columns
                    return ( pReportColumn.getProperty( model.PROP.DERIVED_COLUMN ).getValue() === "N" );
                },
                add: function( pValues, pSqlColumn ) {

                    pValues.push({ id: model.PROP.QUERY_COLUMN_ID, value: pSqlColumn.no });
                    if ( pSqlColumn.type === "BLOB" ) {
                        pValues.push({ id: model.PROP.CLASSIC_REPORT_COLUMN_TYPE, value: "IMAGE" });
                    }
                    pValues.push({ id: model.PROP.COLUMN_HEADING, value: initCapColumnName( pSqlColumn.name )});

                },
                update: function( pReportColumn, pSqlColumn ) {

                    // Check if the query column id has changed
                    var lProperty = pReportColumn.getProperty( model.PROP.QUERY_COLUMN_ID );
                    if ( parseInt( lProperty.getValue(), 10 ) !== pSqlColumn.no ) {
                        lProperty.setValue( pSqlColumn.no );
                    }
                },
                ignoreRowid: false
            });
            reSequenceColumns( pRegion, pColumnComponentTypeId );

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.HAS_GENERIC_COLUMNS, model.PROP.GENERIC_COLUMN_COUNT ]) !== -1 ) {

            lSourceProperty = model.getSourceLocationProperty( pProperty.component );

            // Trigger a re-validation of the source property which will also set the _columns attribute.
            lSourceProperty.setValue( lSourceProperty.getValue(), true );

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            removeAll( pRegion );

        }

        if ( pAction === model.CALLBACK_ACTION.CREATED || ( pAction === model.CALLBACK_ACTION.CHANGED && ( $.inArray( pProperty.id, model.SOURCE_LOCATION_PROPS ) !== -1 || pProperty.id === model.PROP.SOURCE_QUERY_ORDER_BY ))
           && hasOrderBy( pRegion ))
        {
            // No column heading sorting is allowed if the report query contains an order by.
            // Reset all existing sort properties
            if ( hasOrderBy( pRegion ) ) {
                lColumns = pRegion.getChilds( pColumnComponentTypeId, {
                    filterFunction: function() {
                        var lColumnSortSequence = this.getProperty( model.PROP.COLUMN_SORT_SEQUENCE ),
                            lDisableSortColumn  = this.getProperty( model.PROP.DISABLE_SORT_COLUMN );

                        return (  ( lColumnSortSequence && lColumnSortSequence.getValue() !== "" )
                            || ( lDisableSortColumn  && lDisableSortColumn.getValue() === "N" )
                        );
                    }
                } );
                for ( var i = 0; i < lColumns.length; i++ ) {
                    _setPropertyValue( lColumns[ i ], model.PROP.COLUMN_SORT_SEQUENCE, "" );
                    _setPropertyValue( lColumns[ i ], model.PROP.DISABLE_SORT_COLUMN,  "Y" );
                }
            }
        }


    } // classicRptTabularFormPlugin


    function classicRptTabularFormAttr( pAction, pProperty, pOldValue ) {

        var lPrintComponentTypeId;

        if ( this.typeId === model.COMP_TYPE.CLASSIC_REPORT ) {
            lPrintComponentTypeId = model.COMP_TYPE.CLASSIC_RPT_PRINT;
        } else {
            lPrintComponentTypeId = model.COMP_TYPE.TAB_FORM_PRINT;
        }

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( this.getProperty( model.PROP.ENABLE_PRINTING ).getValue() === "Y" ) {
                new model.Component({
                    typeId:   lPrintComponentTypeId,
                    parentId: this.id
                });
            }
        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
            && pProperty.id === model.PROP.ENABLE_PRINTING
            && pProperty.getValue() !== pOldValue )
        {
            if ( pProperty.getValue() === "Y" ) {
                new model.Component({
                    typeId:   lPrintComponentTypeId,
                    parentId: this.id
                });
            } else {
                _removeChildren( this, lPrintComponentTypeId );
            }
        }
    } // classicRptTabularFormAttr


    function interactiveReportPlugin( pAction, pProperty ) {

        var lIrAttributes,
            lDefaultIrTemplate;

        if (  pAction === model.CALLBACK_ACTION.CREATED
            || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, model.SOURCE_LOCATION_PROPS ) !== -1 ))
        {
            if ( pAction === model.CALLBACK_ACTION.CREATED ) {

                lIrAttributes = new model.Component({
                    typeId:   model.COMP_TYPE.IR_ATTRIBUTES,
                    parentId: this.id
                });

                lDefaultIrTemplate = model.getTheme().defaultTemplates.ir;

                if ( lDefaultIrTemplate ) {
                    _setPropertyValue( this, model.PROP.REGION_TEMPLATE, lDefaultIrTemplate );
                }

            } else {
                lIrAttributes = this.getChilds( model.COMP_TYPE.IR_ATTRIBUTES )[ 0 ];
            }

            manageColumns( this, lIrAttributes, model.COMP_TYPE.IR_COLUMN, model.PROP.COLUMN_NAME, {
                setSqlColumn: function( pSqlColumn ) {

                    // Normalize data types to just a few
                    pSqlColumn.isTzDependent = "N";
                    if ( pSqlColumn.type === "VARCHAR2" ) {
                        pSqlColumn.type = "STRING";
                    } else if ( pSqlColumn.type === "TIMESTAMP" || pSqlColumn.type === "TIMESTAMP_TZ" ) { // todo is TIMESTAMP_TZ really not TZ dependent?
                        pSqlColumn.type = "DATE";
                    } else if ( pSqlColumn.type === "TIMESTAMP_LTZ" ) {
                        pSqlColumn.type          = "DATE";
                        pSqlColumn.isTzDependent = "Y";
                    } else if ( pSqlColumn.type !== "NUMBER" && pSqlColumn.type !== "DATE" && pSqlColumn.type !== "CLOB" ) {
                        pSqlColumn.type = "OTHER";
                    }

                },
                compareCheck: function( pSqlColumn, pReportColumn ) {

                    return ( pSqlColumn.type === pReportColumn.getProperty( model.PROP.COLUMN_TYPE ).getValue());

                },
                add: function( pValues, pSqlColumn ) {

                    var lColumnFilterType = "D";

                    pValues.push({ id: model.PROP.COLUMN_TYPE, value: pSqlColumn.type });

                    if ( pSqlColumn.type === "DATE" ) {
                        pValues.push({ id: model.PROP.TZ_DEPENDENT, value: pSqlColumn.isTzDependent });
                        pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "CENTER" });

                    } else if ( pSqlColumn.type === "NUMBER" ) {
                        pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "RIGHT" });

                    } else if ( pSqlColumn.type === "CLOB" || pSqlColumn.type === "OTHER" ) {
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_SORT,          value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_CONTROL_BREAK, value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_AGGREGATE,     value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_COMPUTE,       value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_CHART,         value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_GROUP_BY,      value: "N" });
                        pValues.push({ id: model.PROP.ALLOW_USERS_TO_PIVOT,         value: "N" });
                        lColumnFilterType = "N";

                        if ( pSqlColumn.type === "OTHER" ) {
                            pValues.push({ id: model.PROP.ALLOW_USERS_TO_FILTER,    value: "N" });
                            pValues.push({ id: model.PROP.ALLOW_USERS_TO_HIGHLIGHT, value: "N" });
                        }
                    }

                    pValues.push({ id: model.PROP.IR_COLUMN_FILTER_TYPE, value: lColumnFilterType });
                    pValues.push({ id: model.PROP.COLUMN_HEADING, value: initCapColumnName( pSqlColumn.name )});

                },
                update: function( pReportColumn, pSqlColumn ) {

                    var lProperty;

                    // Check if the TZ has changed, in that case we just update that flag
                    if ( pSqlColumn.type === "DATE" ) {
                        lProperty = pReportColumn.getProperty( model.PROP.TZ_DEPENDENT );
                        if ( pSqlColumn.isTzDependent !== lProperty.getValue()) {
                            lProperty.setValue( pSqlColumn.isTzDependent );
                        }
                    }
                },
                ignoreRowid: false
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the IR attributes if that hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.IR_ATTRIBUTES );

        }
    } // interactiveReportPlugin


    function interactiveReportAttr( pAction, pProperty, pOldValue ) {

        function hasPrintAttributes( pShowDownloadProperty, pDownloadFormatsProperty ) {
            var lIsShowDownload = pShowDownloadProperty.getValue() === "Y",
                lDownloadFormats = ( lIsShowDownload ) ? pDownloadFormatsProperty.getValue().split( ":" ) : [];

            return ( lIsShowDownload &&
            (  $.inArray( "XLS", lDownloadFormats ) !== -1
            || $.inArray( "PDF", lDownloadFormats ) !== -1
            || $.inArray( "RTF", lDownloadFormats ) !== -1 ) );
        }


        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( hasPrintAttributes( this.getProperty( model.PROP.SHOW_DOWNLOAD ),
                    this.getProperty( model.PROP.DOWNLOAD_FORMATS ) ) ) {
                new model.Component({
                    typeId:   model.COMP_TYPE.IR_PRINT_ATTR,
                    parentId: this.id
                });
            }

        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
            && ( pProperty.id === model.PROP.DOWNLOAD_FORMATS ||
            pProperty.id === model.PROP.SHOW_DOWNLOAD )
            && pProperty.getValue() !== pOldValue )
        {
            if ( hasPrintAttributes( this.getProperty( model.PROP.SHOW_DOWNLOAD ),
                    this.getProperty( model.PROP.DOWNLOAD_FORMATS ) ) ) {

                // Only create the print component if it doesn't exist yet
                if ( model.getComponents( model.COMP_TYPE.IR_PRINT_ATTR, { parentId: this.id }).length === 0 ) {
                    new model.Component({
                        typeId:   model.COMP_TYPE.IR_PRINT_ATTR,
                        parentId: this.id
                    });
                }
            } else {
                _removeChildren( this, model.COMP_TYPE.IR_PRINT_ATTR );
            }
        }
    } // interactiveReportAttr


    function interactiveGridPlugin( pAction, pProperty, pValue, pSql ) {

        var lIgAttributes,
            lDefaultIgTemplate;

        if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.REGION_SQL ) {

            // Don't allow ORDER BY because that can cause ORA-01733 during update and an ORDER BY would
            // not have an effect if users specify a column order.
            if ( pSql.hasOrderBy ) {
                return { error: format( "IG.HAS_ORDER_BY" ) };
            }

        } else if (  pAction === model.CALLBACK_ACTION.CREATED
            || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.REGION_SQL ))
        {
            if ( pAction === model.CALLBACK_ACTION.CREATED ) {

                lIgAttributes = new model.Component({
                    typeId:   model.COMP_TYPE.IG_ATTRIBUTES,
                    parentId: this.id
                });

                lDefaultIgTemplate = model.getTheme().defaultTemplates.ir;

                if ( lDefaultIgTemplate ) {
                    _setPropertyValue( this, model.PROP.REGION_TEMPLATE, lDefaultIgTemplate );
                }

            } else {
                lIgAttributes = this.getChilds( model.COMP_TYPE.IG_ATTRIBUTES )[ 0 ];
            }

            manageColumns( this, this, model.COMP_TYPE.IG_COLUMN, model.PROP.SOURCE_DB_COLUMN, {
                add: function( pValues, pSqlColumn ) {

                    var lColumnFilterType = "DISTINCT",
                        lIsVisible        = true;

                    // *************************************************************************************************
                    // KEEP IN SYNC with wizapi.plb / create_ig_region
                    // *************************************************************************************************

                    pValues.push({ id: model.PROP.IG_COLUMN_SOURCE_TYPE, value: "DB_COLUMN" });
                    pValues.push({ id: model.PROP.SOURCE_DB_COLUMN,      value: pSqlColumn.name });
                    pValues.push({ id: model.PROP.DATA_TYPE,             value: pSqlColumn.type });


                    if ( pSqlColumn.type === "VARCHAR2" || pSqlColumn.type === "CLOB" ) {

                        if ( pSqlColumn.type === "VARCHAR2" && pSqlColumn.maxLen < 100 ) {
                            pValues.push({ id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.TEXT_FIELD });
                        } else {
                            pValues.push({ id: model.PROP.ITEM_TYPE,         value: ITEM_TYPE.TEXTAREA });
                            pValues.push({ id: model.PROP.ENABLE_SORT_GROUP, value: "N" });
                            // $$$ pValues.push({ id: model.PROP.ALLOW_USERS_TO_PIVOT, value: "N" });
                            lColumnFilterType = "NONE";
                        }
                        if ( pSqlColumn.maxLen ) {
                            pValues.push({ id: model.PROP.ELEMENT_MAX_CHARACTERS, value: pSqlColumn.maxLen + "" });
                        }

                    } else if ( pSqlColumn.type === "NUMBER" ) {

                        pValues.push({ id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.NUMBER_FIELD });

                    } else if ( $.inArray( pSqlColumn.type, [ "TIMESTAMP_TZ" ]) !== -1 ) {

                        pValues.push({ id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.TEXT_FIELD });
                        // $$$ date picker does not support time zones, so default TIMESTAMP_TZ data type to Text Field

                    } else if ( $.inArray( pSqlColumn.type, [ "DATE", "TIMESTAMP", "TIMESTAMP_LTZ" ]) !== -1 ) {

                        pValues.push({ id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.DATE_PICKER });

                    } else if ( pSqlColumn.type === "ROWID" ) {
                        lIsVisible = false;
                        pValues.push({ id: model.PROP.ITEM_TYPE,            value: ITEM_TYPE.HIDDEN });
                        pValues.push({ id: model.PROP.IS_PRIMARY_KEY,       value: "Y" });
                        pValues.push({ id: model.PROP.ENABLE_SORT_GROUP,    value: "N" });
                        // $$$ pValues.push({ id: model.PROP.ALLOW_USERS_TO_PIVOT, value: "N" });
                    }


                    if ( lIsVisible ) {
                        pValues.push({ id: model.PROP.FILTER_DATA_TYPE, value: pSqlColumn.type });
                        pValues.push({ id: model.PROP.FILTER_LOV_TYPE,  value: lColumnFilterType });
                        pValues.push({ id: model.PROP.COLUMN_HEADING,   value: initCapColumnName( pSqlColumn.name )});
                        pValues.push({ id: model.PROP.VALUE_REQUIRED,   value: pSqlColumn.isRequired ? "Y" : "N" });
                    }
                },
                update: function( pRegionColumn, pSqlColumn ) {

                    var lDataTypeProperty       = pRegionColumn.getProperty( model.PROP.DATA_TYPE ),
                        lMaxCharProperty        = pRegionColumn.getProperty( model.PROP.ELEMENT_MAX_CHARACTERS ),
                        lMaxLength              = pSqlColumn.maxLen + "",
                        lValueRequiredProperty  = pRegionColumn.getProperty( model.PROP.VALUE_REQUIRED ),
                        lValueRequired          = ( pSqlColumn.isRequired ? "Y" : "N" );

                    // Update the column type property if it has changed
                    // We intentionally don't set IS_VISIBLE or COLUMN_ALIGNMENT, because that might have already
                    // been changed by the developer
                    if ( lDataTypeProperty.getValue() !== pSqlColumn.type ) {
                        lDataTypeProperty.setValue( pSqlColumn.type );
                    }
                    if ( lMaxCharProperty && pSqlColumn.type === "VARCHAR2" && lMaxCharProperty.getValue() !== lMaxLength ) {
                        lMaxCharProperty.setValue( lMaxLength );
                    }
                    if ( lValueRequiredProperty && lValueRequiredProperty.getValue() !== lValueRequired ) {
                        lValueRequiredProperty.setValue( lValueRequired );
                    }
                },
                ignoreRowid: true
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the IR attributes if that hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.IG_ATTRIBUTES );
            _removeChildren( this, model.COMP_TYPE.IG_COLUMN );

        }
    } // interactiveGridPlugin


    function interactiveGridAttr( pAction, pProperty, pOldValue ) {

        var lSqlColumns,
            lRegionId = this.parentId;

        function hasPrintAttributes( pEnableDownloadProperty, pDownloadFormatsProperty ) {
            var lEnableDownload  = pEnableDownloadProperty.getValue() === "Y",
                lDownloadFormats = ( lEnableDownload ) ? pDownloadFormatsProperty.getValue().split( ":" ) : [];

            return ( lEnableDownload &&
                (  $.inArray( "XLS", lDownloadFormats ) !== -1
                    || $.inArray( "PDF", lDownloadFormats ) !== -1
                    || $.inArray( "RTF", lDownloadFormats ) !== -1
                    )
                );
        }

        function addColumnIfNotExists( pParentId, pColumnName, pValues ) {
            var lValues = [{
                id: model.PROP.COLUMN_NAME,
                value: pColumnName
            }].concat( ( pValues ? pValues : [] ) );

            if ( model.getComponents( model.COMP_TYPE.IG_COLUMN, {
                parentId: pParentId,
                properties: [{ id: model.PROP.COLUMN_NAME, value: pColumnName }]
            }).length === 0 )
            {
                new model.Component({
                    typeId:   model.COMP_TYPE.IG_COLUMN,
                    parentId: pParentId,
                    values:   lValues
                });
            }
        }

        function removeColumn( pParentId, pColumnName ) {
            _removeComponents (
                model.getComponents( model.COMP_TYPE.IG_COLUMN, {
                    parentId: pParentId,
                    properties: [{ id: model.PROP.COLUMN_NAME, value: pColumnName }]
                })
            );
        }


        if ( pAction === model.CALLBACK_ACTION.CREATED ) {
            if ( hasPrintAttributes( this.getProperty( model.PROP.ENABLE_DOWNLOAD ), this.getProperty( model.PROP.IG_DOWNLOAD_FORMATS ) ) ) {
                new model.Component({
                    typeId:   model.COMP_TYPE.IG_PRINT,
                    parentId: lRegionId
                });
            }
        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
            && ( pProperty.id === model.PROP.IG_DOWNLOAD_FORMATS || pProperty.id === model.PROP.ENABLE_DOWNLOAD )
            && pProperty.getValue() !== pOldValue )
        {
            if ( hasPrintAttributes( this.getProperty( model.PROP.ENABLE_DOWNLOAD ), this.getProperty( model.PROP.IG_DOWNLOAD_FORMATS ) ) ) {

                // Only create the print component if it doesn't exist yet
                if ( model.getComponents( model.COMP_TYPE.IG_PRINT, { parentId: lRegionId }).length === 0 ) {
                    new model.Component({
                        typeId:   model.COMP_TYPE.IG_PRINT,
                        parentId: lRegionId
                    });
                }
            } else {
                _removeChildren( this, model.COMP_TYPE.IG_PRINT );
            }
        }

        // Check if the component is getting created or if the editable flag has been changed
        if (  pAction === model.CALLBACK_ACTION.CREATED
            || (  pAction === model.CALLBACK_ACTION.CHANGED
            && pProperty.id === model.PROP.IS_EDITABLE
            && pProperty.getValue() !== pOldValue
            )
            )
        {
            if ( this.getProperty( model.PROP.IS_EDITABLE ).getValue() === "Y" ) {

                // If the grid is editable and no primary key hasn't been defined yet, we try to add a column of
                // type ROWID if available and make it the primary key
                if ( model.getComponents( model.COMP_TYPE.IG_COLUMN, {
                    parentId:   lRegionId,
                    properties: [{ id: model.PROP.IS_PRIMARY_KEY, value: "Y" }]
                }).length === 0 )
                {
                    lSqlColumns = this.getParent().getProperty( model.PROP.REGION_SQL ).getColumns( true );
                    for ( var i = 0; i < lSqlColumns.length; i++ ) {
                        if ( lSqlColumns[ i ].type === "ROWID" ) {
                            addColumnIfNotExists( lRegionId, lSqlColumns[ i ].name, [
                                { id: model.PROP.ITEM_TYPE,             value: ITEM_TYPE.HIDDEN },
                                { id: model.PROP.IG_COLUMN_SOURCE_TYPE, value: "DB_COLUMN" },
                                { id: model.PROP.SOURCE_DB_COLUMN,      value: lSqlColumns[ i ].name },
                                { id: model.PROP.DATA_TYPE,             value: "ROWID" },
                                { id: model.PROP.IS_PRIMARY_KEY,        value: "Y" },
                                { id: model.PROP.ENABLE_SORT_GROUP,     value: "N" } /* $$$,
                                 { id: model.PROP.ALLOW_USERS_TO_PIVOT,  value: "N" } */
                            ]);
                            break;
                        }
                    }
                }

                addColumnIfNotExists( lRegionId, "APEX$ROW_ACTION", [
                    { id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.ROW_ACTION }
                ]);

                addColumnIfNotExists( lRegionId, "APEX$ROW_SELECTOR", [
                    { id: model.PROP.ITEM_TYPE, value: ITEM_TYPE.ROW_SELECTOR }
                ]);

                // Create the DML process if it doesn't exists
                if ( model.getComponents( model.COMP_TYPE.PAGE_PROCESS, {
                    properties: [
                        { id: model.PROP.PAGE_PROCESS_TYPE, value: "NATIVE_IG_DML" },
                        { id: model.PROP.PROCESS_REGION,    value: lRegionId }
                    ]
                }).length === 0 )
                {
                    // Always add the new DML process after any existing process. In most cases, especially if it's
                    // a master detail this will guarantee the correct order if the IGs are enabled in the correct order.
                    new model.Component({
                        previousComponent: "last",
                        typeId: model.COMP_TYPE.PAGE_PROCESS,
                        values: [
                            { id: model.PROP.NAME,              value: lang.formatMessageNoEscape( "WIZARD.IG.DML_PROCESS_NAME", this.getParent().getDisplayTitle() )},
                            { id: model.PROP.PAGE_PROCESS_TYPE, value: "NATIVE_IG_DML" },
                            { id: model.PROP.PROCESS_REGION,    value: lRegionId }
                        ]
                    });
                }


            } else {


                // Remove added columns and any region depending validation or process if we don't allow editing anymore,
                // but don't remove ROWID which might be used by the developer
                removeColumn( lRegionId, "APEX$ROW_SELECTOR" );
                removeColumn( lRegionId, "APEX$ROW_ACTION" );
                _removeComponents (
                    model.getComponents( model.COMP_TYPE.VALIDATION, {
                        properties: [{ id: model.PROP.VALIDATION_REGION, value: lRegionId }]
                    })
                );
                _removeComponents (
                    model.getComponents( model.COMP_TYPE.PAGE_PROCESS, {
                        properties: [{ id: model.PROP.PROCESS_REGION, value: lRegionId }]
                    })
                );

            }
        }


    } // interactiveGridAttr


    function interactiveGridColumn( pAction, pProperty, pOldValue ) {

        var PLUGIN   = model.getComponentType( model.COMP_TYPE.IG_COLUMN ).pluginType.plugins [ this.getProperty( model.PROP.ITEM_TYPE ).getValue() ],
            JOIN_LOV = ( $.inArray( "JOIN_LOV", PLUGIN.features ) !== -1 );

        var lDataTypeProperty       = this.getProperty( model.PROP.DATA_TYPE ),
            lFilterDataTypeProperty = this.getProperty( model.PROP.FILTER_DATA_TYPE ),
            lLovTypeProperty        = this.getProperty( model.PROP.LOV_TYPE ),
            lFilterDataType;

        // Automatically set columns which point to a "Parent Column" to hidden
        if ( _hasChangedEqualsNotTo( this.getProperty( model.PROP.MASTER_COLUMN ), pAction, pProperty, "" )) {
            _setPropertyValue( this, model.PROP.ITEM_TYPE, ITEM_TYPE.HIDDEN );
        }

        // Don't export hidden items
        if ( _hasChangedEqualsTo( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty, ITEM_TYPE.HIDDEN )) {
            _setPropertyValue( this, model.PROP.INCLUDE_IN_EXPORT_PRINT, "N" );
        }

        // LOV based and text item types should always be start (left) aligned
        if (  _hasChangedEqualsTo( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty, ITEM_TYPE.TEXT_FIELD )
           || _hasChangedEqualsTo( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty, ITEM_TYPE.TEXTAREA )
           || ( _hasChanged( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty ) && lLovTypeProperty )
           )
        {
            _setPropertyValue( this, model.PROP.COLUMN_ALIGNMENT, "LEFT" );
            _setPropertyValue( this, model.PROP.HEADING_ALIGNMENT, "LEFT" );

        } else if ( _hasChangedEqualsTo( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty, ITEM_TYPE.NUMBER_FIELD )) {
            _setPropertyValue( this, model.PROP.COLUMN_ALIGNMENT, "RIGHT" );
            _setPropertyValue( this, model.PROP.HEADING_ALIGNMENT, "RIGHT" );
            _setPropertyValue( this, model.PROP.FILTER_LOV_TYPE, "NONE" );

        } else if ( _hasChangedEqualsTo( this.getProperty( model.PROP.ITEM_TYPE ), pAction, pProperty, ITEM_TYPE.DATE_PICKER )) {
            _setPropertyValue( this, model.PROP.COLUMN_ALIGNMENT, "CENTER" );
            _setPropertyValue( this, model.PROP.HEADING_ALIGNMENT, "CENTER" );
        }

        // Set Filter Data Type to VARCHAR2 if the item type does support LOV joining and an LOV has been defined
        if (( pAction === model.CALLBACK_ACTION.CREATED || pAction === model.CALLBACK_ACTION.CHANGED ) && lFilterDataTypeProperty ) {
            if ( JOIN_LOV && lLovTypeProperty && lLovTypeProperty.getValue() !== "" ) {
                lFilterDataType = "VARCHAR2";
            } else if ( lDataTypeProperty ) {
                lFilterDataType = lDataTypeProperty.getValue();
                // Use the default VARCHAR2 filter data type as long as no column data type has been provided
                if ( lFilterDataType === "" ) {
                    lFilterDataType = "VARCHAR2";
                }
            }
            if ( lFilterDataTypeProperty.getValue() !== lFilterDataType ) {
                lFilterDataTypeProperty.setValue( lFilterDataType );
            }
        }

        // If an LOV has been specified, use it for the filter as well
        if ( _hasChangedEqualsNotTo( this.getProperty( model.PROP.LOV_TYPE ), pAction, pProperty, "" )) {
            _setPropertyValue( this, model.PROP.FILTER_LOV_TYPE, "LOV" );
        }

    } // interactiveGridColumn


    function classicReportPlugin( pAction, pProperty ) {

        classicRptTabularFormPlugin( pAction, pProperty, this, model.COMP_TYPE.CLASSIC_REPORT, model.COMP_TYPE.CLASSIC_RPT_COLUMN );

    } // classicReportPlugin


    function tabularFormPlugin( pAction, pProperty ) {

        var lSelf = this,
            lTabForms;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            alert( format( "TABFORM.WARNING" ));

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.REGION_TYPE ) {

            // Raise an error if there is already a tabular form on the page
            lTabForms = model.getComponents( model.COMP_TYPE.REGION, {
                properties: [{
                    id: model.PROP.REGION_TYPE,
                    value: "NATIVE_TABFORM" }
                ],
                filterFunction: function() {
                    return ( this.id !== lSelf.id );
                }
            });

            if ( lTabForms.length > 0 ) {
                return { error: format( "TABFORM.ONLY_ONE_PER_PAGE" ) };
            }
        }
        classicRptTabularFormPlugin( pAction, pProperty, this, model.COMP_TYPE.TABULAR_FORM, model.COMP_TYPE.TAB_FORM_COLUMN );

    } // tabularFormPlugin


    function classicRptTabularFormColumn( pColumn, pComponentTypeId, pAction, pProperty, pValue ) {

        var lRegion = pColumn.getParent();

        // No sorting is allowed if the report query contains an order by
        if (  pAction === model.CALLBACK_ACTION.VALIDATE
            && (  ( pProperty.id === model.PROP.DISABLE_SORT_COLUMN  && pValue === "N" )
            || ( pProperty.id === model.PROP.COLUMN_SORT_SEQUENCE && pValue !== "" )
            )
            && hasOrderBy( lRegion )
        )
        {
            return { error: format( "CLASSIC_RPT_TABFORM_COLUMN.NO_SORTING" ) };

        } else if (  pAction === model.CALLBACK_ACTION.CHANGED
            && pProperty.id === model.PROP.COLUMN_SORT_SEQUENCE
            && pProperty.getValue() === ""
            && hasOrderBy( lRegion )
            && pColumn.getProperty( model.PROP.DISABLE_SORT_COLUMN ).getValue() === "N"
        )
        {
            _setPropertyValue( pColumn, model.PROP.DISABLE_SORT_COLUMN, "Y" );
        } else if ( lRegion && pAction === model.CALLBACK_ACTION.REMOVED ) {
            reSequenceColumns( lRegion, pComponentTypeId );
        }

    } // classicRptTabularFormColumn


    function classicReportColumn( pAction, pProperty, pValue ) {

        return classicRptTabularFormColumn( this, model.COMP_TYPE.CLASSIC_RPT_COLUMN, pAction, pProperty, pValue );

    } // classicReportColumn


    function tabularFormColumn( pAction, pProperty, pValue ) {

        return classicRptTabularFormColumn( this, model.COMP_TYPE.TAB_FORM_COLUMN, pAction, pProperty, pValue );

    } // tabularFormColumn


    function regionPluginWithColumns( pAction, pProperty ) {

        var PLUGIN               = model.getComponentType( model.COMP_TYPE.REGION ).pluginType.plugins [ this.getProperty( model.PROP.REGION_TYPE ).getValue() ],
            HAS_COLUMN_ALIGNMENT = ( $.inArray( "VALUE_ALIGNMENT", PLUGIN.features ) !== -1 );

        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, model.SOURCE_LOCATION_PROPS ) !== -1 ))
        {
            //
            // Note: Keep this code in sync with wwv_flow_wizard_api.create_region_columns!
            //
            manageColumns( this, this, model.COMP_TYPE.REGION_COLUMN, model.PROP.COLUMN_NAME, {
                add: function( pValues, pSqlColumn ) {

                    pValues.push({ id: model.PROP.HIDDEN_REGION_TYPE, value: PLUGIN.name });
                    pValues.push({ id: model.PROP.COLUMN_TYPE,        value: pSqlColumn.type });

                    if ( pSqlColumn.type === "ROWID" ) {
                        pValues.push({ id: model.PROP.IS_VISIBLE, value: "N" });
                    } else {
                        if ( $.inArray( "COLUMN_HEADING", PLUGIN.features ) !== -1 ) {
                            pValues.push( {
                                id:    model.PROP.COLUMN_HEADING,
                                value: initCapColumnName( pSqlColumn.name )
                            } );
                        }
                        if ( HAS_COLUMN_ALIGNMENT ) {

                            if ( $.inArray( pSqlColumn.type, [ "DATE", "TIMESTAMP", "TIMESTAMP_TZ", "TIMESTAMP_LTZ" ]) !== -1 ) {
                                pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "CENTER" });
                                pValues.push({ id: model.PROP.HEADING_ALIGNMENT, value: "CENTER" });

                            } else if ( pSqlColumn.type === "NUMBER" ) {
                                pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "RIGHT" });
                                pValues.push({ id: model.PROP.HEADING_ALIGNMENT, value: "RIGHT" });

                            } else {
                                pValues.push({ id: model.PROP.COLUMN_ALIGNMENT, value: "LEFT" });
                                pValues.push({ id: model.PROP.HEADING_ALIGNMENT, value: "LEFT" });

                            }
                        }
                    }

                },
                update: function( pRegionColumn, pSqlColumn ) {

                    var lProperty = pRegionColumn.getProperty( model.PROP.COLUMN_TYPE );

                    // Update the column type property if it has changed
                    // We intentionally don't set IS_VISIBLE or COLUMN_ALIGNMENT, because that might have already
                    // been changed by the developer
                    if ( lProperty.getValue() !== pSqlColumn.type ) {
                        lProperty.setValue( pSqlColumn.type );
                    }
                },
                ignoreRowid: false
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove all region columns if that hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.REGION_COLUMN );

        }
    } // regionPluginWithColumns


    function mapChartPlugin( pAction, pProperty ) {

        var lMapChart;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the map chartPlugin and the first series
            lMapChart = new model.Component({
                typeId:   model.COMP_TYPE.MAP_CHART,
                parentId: this.id,
                values:   [{
                    id:    model.PROP.CHART_TITLE,
                    value: this.getDisplayTitle()
                }]
            });
            new model.Component({
                typeId:   model.COMP_TYPE.MAP_CHART_SERIES,
                parentId: lMapChart.id
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the map chartPlugin if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.MAP_CHART );

        }
    } // mapChartPlugin


    function chartPlugin( pAction, pProperty ) {

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the chartPlugin attributes
            new model.Component({
                typeId:   model.COMP_TYPE.CHART,
                parentId: this.id,
                values:   [{
                    id:    model.PROP.CHART_TITLE,
                    value: this.getDisplayTitle()
                }]
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the chartPlugin attributes if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.CHART );

        }
    } // chartPlugin

    function chartAttributes( pAction, pProperty ) {

        var SOURCE_TYPES = [
                model.PROP.PROJECT_GANTT_SERIES_SOURCE_TYPE,
                model.PROP.RESOURCE_GANTT_SERIES_SOURCE_TYPE,
                model.PROP.PIE_DOUGHNUT_SERIES_SOURCE_TYPE,
                model.PROP.DIAL_SERIES_SOURCE_TYPE,
                model.PROP.SCATTER_SERIES_SOURCE_TYPE,
                model.PROP.RANGE_SERIES_SOURCE_TYPE,
                model.PROP.CANDLESTICK_SERIES_SOURCE_TYPE,
                model.PROP.LINE_COL_BAR_STK_SERIES_SOURCE_TYPE ],
            SOURCE_QUERIES = [
                model.PROP.PROJECT_GANTT_SOURCE_QUERY,
                model.PROP.RESOURCE_GANTT_SOURCE_QUERY,
                model.PROP.PIE_DOUGHNUT_SOURCE_QUERY,
                model.PROP.DIAL_SOURCE_QUERY,
                model.PROP.SCATTER_SOURCE_QUERY,
                model.PROP.RANGE_SOURCE_QUERY,
                model.PROP.CANDLESTICK_SOURCE_QUERY,
                model.PROP.LINE_COL_BAR_STK_SOURCE_QUERY ],
            SOURCE_FUNCTIONS = [
                model.PROP.PROJECT_GANTT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.RESOURCE_GANTT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.PIE_DOUGHNUT_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.DIAL_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.SCATTER_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.RANGE_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.CANDLESTICK_SOURCE_FUNC_RETURNING_SQL,
                model.PROP.LINE_COL_BAR_STK_SOURCE_FUNC_RETURNING_SQL ];

        var lChartType = this.getProperty( model.PROP.CHART_TYPE ).getValue(),
            lSeries,
            lSourceType,
            lSourceQuery,
            lSourceFunction;

        function getValue( pComponent, pProperties ) {
            var lProperty;
            for ( var i = 0; i < pProperties.length; i++ ) {
                lProperty = pComponent.getProperty( pProperties[ i ]);
                if ( lProperty !== undefined ) {
                    return lProperty.getValue();
                }
            }
        }

        function setValue( pComponent, pProperties, pValue ) {
            var lProperty;
            for ( var i = 0; i < pProperties.length; i++ ) {
                lProperty = pComponent.getProperty( pProperties[ i ]);
                if ( lProperty !== undefined ) {
                    lProperty.setValue( pValue );
                    return;
                }
            }
        }

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the first series
            new model.Component({
                typeId:   model.COMP_TYPE.CHART_SERIES,
                parentId: this.id,
                values: [{
                    id:    model.PROP.SERIES_CHART_TYPE,
                    value: lChartType
                }]
            });

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.CHART_TYPE ) {
                lSeries = this.getChilds( model.COMP_TYPE.CHART_SERIES );

                // synchronize the current chartPlugin type to all series
                for ( var i = 0; i < lSeries.length; i++ ) {
                    // The Source Type property is depending on the SERIES_CHART_TYPE property,
                    // because of the different requirements for the SQL statement (number of columns, ...)
                    // If the chartPlugin type gets changed, the developer would loose it's existing SQL statement.
                    // That's why we preserve it and restore it, knowing that it will syntactically be invalid,
                    // but it will be a lot easier for a developer to change it than typing it in again.
                    lSourceType     = getValue( lSeries[ i ], SOURCE_TYPES );
                    lSourceQuery    = getValue( lSeries[ i ], SOURCE_QUERIES );
                    lSourceFunction = getValue( lSeries[ i ], SOURCE_FUNCTIONS );

                    _setPropertyValue( lSeries[ i ], model.PROP.SERIES_CHART_TYPE, lChartType );

                    setValue( lSeries[ i ], SOURCE_TYPES,     lSourceType );
                    setValue( lSeries[ i ], SOURCE_QUERIES,   lSourceQuery );
                    setValue( lSeries[ i ], SOURCE_FUNCTIONS, lSourceFunction );
                }

                // Some chartPlugin types only support one series, remove all the others
                if ( $.inArray( lChartType, [ "COLUMN", "STACKED_COLUMN", "STACKED_COLUMN_PCT", "BAR", "STACKED_BAR", "STACKED_BAR_PCT", "LINE" ]) === -1 ) {
                    for ( var i = 1; i < lSeries.length; i++ ) {
                        lSeries [ i ].remove();
                    }
                }

                // For line charts we want to default the series type to Line.
                if ( lChartType === "LINE" && lSeries.length === 1 ) {
                    _setPropertyValue( lSeries[ 0 ], model.PROP.SERIES_TYPE, "Line" );
                }

            } else if ( pProperty.id === model.PROP.USE_CUSTOM_XML ) {

                setChartXML( this, pProperty );

            }
        }
    } // chartAttributes

    function jetChartPlugin( pAction, pProperty ) {

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the chartPlugin attributes
            new model.Component({
                typeId:   model.COMP_TYPE.JET_CHART,
                parentId: this.id
            });

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the chartPlugin attributes if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.JET_CHART );

        }
    } // jetChartPlugin

    function jetChartAttributes( pAction, pProperty ) {

        var C_AXES_SUPPORT = [ "area", "bar", "boxPlot", "bubble", "combo", "line", "lineWithArea", "range", "polar", "radar", "stock", "scatter", "gantt" ];

        var lSelf = this,
            lChartType = lSelf.getProperty( model.PROP.JET_CHART_TYPE ).getValue(),
            lSeries,
            lAxes;

        function addAxes () {
            var axis_one, axis_two;

            if ( lSelf.getChilds( model.COMP_TYPE.JET_CHART_AXES ).length === 0 ) {

                if ( lChartType === "gantt" ) {
                    axis_one = "major";
                    axis_two = "minor";
                } else {
                    axis_one = "x";
                    axis_two = "y";
                }

                new model.Component({
                    typeId:   model.COMP_TYPE.JET_CHART_AXES,
                    parentId: lSelf.id,
                    values: [{
                        id:    model.PROP.NAME, // $$$ todo: we shouldn't use NAME!
                        value: axis_one
                    }]
                });
                new model.Component({
                    typeId:   model.COMP_TYPE.JET_CHART_AXES,
                    parentId: lSelf.id,
                    values: [{
                        id:    model.PROP.NAME, // $$$ todo: we shouldn't use NAME!
                        value: axis_two
                    }]
                });

            }
        }

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // Create the first series
            new model.Component({
                typeId:   model.COMP_TYPE.JET_CHART_SERIES,
                parentId: lSelf.id,
                values: [{
                    id:    model.PROP.SERIES_CHART_TYPE,
                    value: lChartType
                }]
            });

            // Create X and Y axis
            if ( $.inArray( lChartType, C_AXES_SUPPORT ) !== -1 ) {
                addAxes();
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            lSeries = lSelf.getChilds( model.COMP_TYPE.JET_CHART_SERIES );

            if ( pProperty.id === model.PROP.JET_CHART_TYPE ) {

                // synchronize the current chartPlugin type to all series
                for ( var i = 0; i < lSeries.length; i++ ) {
                    _setPropertyValue( lSeries[ i ], model.PROP.SERIES_CHART_TYPE, lChartType );
                }

                // Some chart types only support one series, remove all the others
                if ( $.inArray( lChartType, [ "dial", "stock", "gantt" ]) !== -1 ) {
                    for ( var i = 1; i < lSeries.length; i++ ) {
                        lSeries [ i ].remove();
                    }
                }

                // Some chart types don't support series
                if ( $.inArray( lChartType, C_AXES_SUPPORT ) !== -1 ) {

                    lAxes = lSelf.getChilds ( model.COMP_TYPE.JET_CHART_AXES );
                    if ( lAxes.length !== 0 ) {
                        // Gantt Chart only supports major/minor axes - clear existing x/y/y2
                        if ( lAxes [0].getProperty( model.PROP.NAME ).getValue() === "x" && lChartType === "gantt" ) {
                            _removeChildren( lSelf, model.COMP_TYPE.JET_CHART_AXES );
                        }
                        // All Other Chart Types support x/y/y2 axes - clear existing major/minor
                        if ( lAxes [0].getProperty( model.PROP.NAME ).getValue() === "major" && lChartType !== "gantt" ) {
                            _removeChildren( lSelf, model.COMP_TYPE.JET_CHART_AXES );
                        }
                    }

                    addAxes();
                } else {
                    _removeChildren( lSelf, model.COMP_TYPE.JET_CHART_AXES );
                }

            }
        }
    } // jetChartAttributes

    function jetChartSeries( pAction, pProperty, pOldValue ) {

        var PROP_SERIES_TYPES = [
            model.PROP.JET_SERIES_TYPE_COMBO,
            model.PROP.JET_SERIES_TYPE_RANGE,
            model.PROP.JET_SERIES_TYPE_POLAR,
            model.PROP.JET_SERIES_TYPE_RADAR,
            model.PROP.JET_SERIES_TYPE_BOX_PLOT,
            model.PROP.SERIES_CHART_TYPE /* used for single chart types */
        ];

        var lSelf = this,
            lRegionSourceLocationProperty;

        function getSeriesType() {

            var i, lProperty;

            // Find the series type property which exists depending on the chart type
            for ( i = 0; i < PROP_SERIES_TYPES.length; i++ ) {
                lProperty = lSelf.getProperty( PROP_SERIES_TYPES[ i ] );
                if ( lProperty ) {
                    break;
                }
            }

            return lProperty.getValue();
        }

        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, PROP_SERIES_TYPES ) !== -1 )
           )
        {
            // Replicate the value of our conditional series type properties into our
            // series type column mapping property. This property always exists and is used by the different column
            // properties as a dependency column
            _setPropertyValue( lSelf, model.PROP.JET_SERIES_TYPE_COLUMN_MAPPING, getSeriesType() );
        }

        // We only check CHANGED, because during create we can't access the parents yet
        if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.CHART_SOURCE_LOCATION ) {
            lRegionSourceLocationProperty = lSelf.getParent().getParent().getProperty( model.PROP.SOURCE_LOCATION );
            if ( lSelf.getProperty( model.PROP.CHART_SOURCE_LOCATION ).getValue() === "REGION_SOURCE" ) {
                lRegionSourceLocationProperty._isRequired = true;

                // Force a re-validation of the region source property if it's needed for the chart series and if it's currently empty
                if ( lRegionSourceLocationProperty.getValue() === "" ) {
                    lRegionSourceLocationProperty.setValue( "", true );
                }
            }  else {
                lRegionSourceLocationProperty._isRequired = false;
            }
        }

        sourceLocationHandling( pAction, this, pProperty, pOldValue, model.COMP_TYPE.JET_CHART_WS_PARAM );

        // Create Y2 axis when Series assigned to Y2
        if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.ASSIGNED_TO_Y2 ) {
            if (lSelf.getProperty( model.PROP.ASSIGNED_TO_Y2 ).getValue() === "on") {
                if ( lSelf.getParent().getChilds( model.COMP_TYPE.JET_CHART_AXES ).length === 2 ) {
                    new model.Component({
                        typeId:   model.COMP_TYPE.JET_CHART_AXES,
                        parentId: lSelf.getParent().id,
                        values: [{
                            id:    model.PROP.NAME, // $$$
                            value: "y2"
                        }]
                    });
                }
            } // $$$ we should have an else where remove the y2 if no series is using it anymore
        }

    } // jetChartSeries

    function legacyCalendarPlugin( pAction, pProperty ) {

        var lSelf = this,
            lCalendars;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            new model.Component({
                typeId:   model.COMP_TYPE.CLASSIC_CALENDAR,
                parentId: this.id
            });
            alert( format( "LEGACY_CALENDAR.WARNING" ));

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.REGION_TYPE ) {

            // Raise an error if there is already a legacy calendar on the page
            lCalendars = model.getComponents( model.COMP_TYPE.REGION, {
                properties: [{
                    id: model.PROP.REGION_TYPE,
                    value: "NATIVE_CALENDAR" }
                ],
                filterFunction: function() {
                    return ( this.id !== lSelf.id );
                }
            });

            if ( lCalendars.length > 0 ) {
                return { error: format( "LEGACY_CALENDAR.ONLY_ONE_PER_PAGE" ) };
            }

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove the calendar attributes if it hasn't already been done (i.e if the region is removed)
            _removeChildren( this, model.COMP_TYPE.CLASSIC_CALENDAR );

        }
    } // legacyCalendarPlugin


    function setValuePlugin( pAction, pProperty ) {

        var SET_TYPE_ID     = model.getPluginProperty( model.COMP_TYPE.DA_ACTION, "NATIVE_SET_VALUE", 1 ).id,
            lFireOnPageLoad = this.getProperty( model.PROP.FIRE_ON_PAGE_LOAD );

        // By default, a set value operation of type "Dialog Return Item" should not fire during page load, because
        // it only works in a "Dialog Closed" event.
        if (  pAction === model.CALLBACK_ACTION.CHANGED
            && pProperty.id === SET_TYPE_ID
            && pProperty.getValue() === "DIALOG_RETURN_ITEM"
            && lFireOnPageLoad.getValue() === "Y" )
        {
            lFireOnPageLoad.setValue( "N" );
        }

    } // setValuePlugin


    function webServiceProcessPlugin( pAction, pProperty, pOldValue ) {

        var PLUGIN_NAME,
            WS_OPER_PROPERTY_ID,
            STORE_RESULT_PROPERTY_ID;

        var that           = this,
            lWsOperationId,
            lStoreResultIn;

        function removeAllParams() {
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_I );
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_O );
            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_A );
        }

        function addParams( pWsOperationId, pComponentTypeId, pNewComponentTypeId ) {

            // Get all parameters of that web service operation and attach them to the process
            var lParameters = model.getComponents( pComponentTypeId, { parentId: pWsOperationId });

            for ( var i = 0; i < lParameters.length; i++ ) {
                new model.Component({
                    typeId:   pNewComponentTypeId,
                    parentId: that.id,
                    values: [
                        {
                            id:    model.PROP.PARAMETER_ID,
                            value: lParameters[ i ].id
                        },
                        {
                            id:    model.PROP.NAME,
                            value: lParameters[ i ].getProperty( model.PROP.NAME ).getValue()
                        }
                    ]
                });
            }
        } // addParams

        if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.PAGE_PROCESS_TYPE ) {
            PLUGIN_NAME = pOldValue; // That's actually not the old value, it will contain the new page type. And because
                                     // we do support NATIVE_WEB_SERVICE and NATIVE_WEB_SERVICE_LEGACY we can't just hardcode the plug-in.
        } else {
            PLUGIN_NAME = this.getProperty( model.PROP.PAGE_PROCESS_TYPE ).getValue();
        }
        WS_OPER_PROPERTY_ID      = model.getPluginProperty( model.COMP_TYPE.PAGE_PROCESS, PLUGIN_NAME, 1 ).id;
        STORE_RESULT_PROPERTY_ID = model.getPluginProperty( model.COMP_TYPE.PAGE_PROCESS, PLUGIN_NAME, 2 ).id;

        if ( pAction === model.CALLBACK_ACTION.CREATED || pAction === model.CALLBACK_ACTION.CHANGED ) {
            lWsOperationId = this.getProperty( WS_OPER_PROPERTY_ID ).getValue();
            lStoreResultIn = this.getProperty( STORE_RESULT_PROPERTY_ID ).getValue();
        }

        if (  ( pAction === model.CALLBACK_ACTION.CREATED && lWsOperationId !== "" )
            || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === WS_OPER_PROPERTY_ID && lWsOperationId !== pOldValue ))
        {
            // If the selected web service operation has been changed, remove all existing parameters
            if ( pAction === model.CALLBACK_ACTION.CHANGED ) {
                removeAllParams();
            }

            // Initialize the process specific in/out/auth parameters based on the web service operation parameters
            if ( lWsOperationId !== "" ) {
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_I, model.COMP_TYPE.PAGE_PROC_WS_P_I );
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_H, model.COMP_TYPE.PAGE_PROC_WS_P_I );
                if ( lStoreResultIn === "ITEMS" ) {
                    addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_O, model.COMP_TYPE.PAGE_PROC_WS_P_O );
                }
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_A, model.COMP_TYPE.PAGE_PROC_WS_P_A );
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === STORE_RESULT_PROPERTY_ID && lStoreResultIn !== pOldValue ) {

            _removeChildren( that, model.COMP_TYPE.PAGE_PROC_WS_P_O );

            // Only initialize the output parameters if the result should be stored in items
            if ( lStoreResultIn === "ITEMS" ) {
                addParams( lWsOperationId, model.COMP_TYPE.WS_REF_OPER_P_O, model.COMP_TYPE.PAGE_PROC_WS_P_O );
            }

        } else if ( pAction === model.CALLBACK_ACTION.REMOVED ) {

            // Remove all parameters if that hasn't already been done (i.e if the region is removed)
            removeAllParams();

        }
    } // webServiceProcessPlugin


    function plsqlProcessPlugin( pAction, pProperty, pOldValue ) {

        var lPlsql = this.getProperty( model.PROP.PLSQL_CODE );

        // Trigger a re-validation of the plsql property if the location or the remote database has been changed
        if ((   _hasChangedEqualsTo( this.getProperty( model.PROP.PLSQL_PROCESS_LOCATION ), pAction, pProperty, "LOCAL" )
             || _hasChangedEqualsNotTo( this.getProperty( model.PROP.SOURCE_REMOTE_DATABASE ), pAction, pProperty, "" )
            )
           && lPlsql.getValue() !== "" )
        {
            lPlsql.setValue( lPlsql.getValue(), true );
        }

    } // plsqlProcessPlugin


    function nativeItemPlugins( pAction, pProperty ) {

        var lItemType = this.getProperty( model.PROP.ITEM_TYPE ).getValue(),
            lAllowMultiSelection,
            lHeight;

        if ( lItemType === ITEM_TYPE.SELECT_LIST && ( pAction === model.CALLBACK_ACTION.CREATED || pAction === model.CALLBACK_ACTION.CHANGED )) {

            lAllowMultiSelection = this.getProperty( model.getPluginProperty( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SELECT_LIST, 2 ).id );

            // Only if the item type or the allow multi selection property has changed, we will change the height
            if ( lAllowMultiSelection && ( pAction === model.CALLBACK_ACTION.CREATED || pProperty.id === lAllowMultiSelection.id )) {
                if ( lAllowMultiSelection.getValue() === "Y" ) {
                    lHeight = 5;
                } else {
                    lHeight = 1;
                }
                _setPropertyValue( this, model.PROP.ELEMENT_HEIGHT, lHeight );
            }

        } else if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // For some item types we automatically set the height to 5 because they are designed to be multi line
            if ( $.inArray( lItemType, [ ITEM_TYPE.RICH_TEXT_EDITOR, ITEM_TYPE.TEXTAREA, ITEM_TYPE.SHUTTLE ]) !== -1 ) {

                _setPropertyValue( this, model.PROP.ELEMENT_HEIGHT, "5" );

            } else if ( lItemType === ITEM_TYPE.FILE && getDmlProcesses().length === 0 ) {

                // Don't use "BLOB column specified..." storage type if page doesn't have a Fetch/DML process
                _setPropertyValue( this, model.getPluginProperty( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.FILE, 1 ).id, "APEX_APPLICATION_TEMP_FILES" );
            }

        }

    } // nativeItemPlugins


    function pageItem( pAction, pProperty, pOldValue ) {

        var PAGE_PREFIX = /^(P\d+_)/;

        var lOldDbColumnName,
            lNewDbColumnName,
            lItemLabel,
            lDbSourceColumn,
            lSourceType,
            lSourceUsed,
            lDmlProcesses,
            lColumns;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // We only want to create a page item with source type default to "DB Column" if the
            // current page contains a fetch/DML process. Otherwise it's up to the developer to populate it
            lSourceType = this.getProperty( model.PROP.SOURCE_TYPE );
            if ( lSourceType && lSourceType.getValue() === "DB_COLUMN" ) {

                if ( getDmlProcesses().length === 0 ) {
                    lSourceType.setValue( "ALWAYS_NULL" );
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.ITEM_NAME ) {
                // Has the item name changed?

                lOldDbColumnName = pOldValue.replace( PAGE_PREFIX, "" );
                lNewDbColumnName = pProperty.getValue().replace( PAGE_PREFIX, "" );

                // Keep the "Label" property in sync if the label is empty or equal to the old page item name
                lItemLabel = this.getProperty( model.PROP.ITEM_LABEL );
                if (  lItemLabel
                    && ( initCapColumnName( lOldDbColumnName ) === lItemLabel.getValue() || lItemLabel.getValue() === "" ))
                {
                    lItemLabel.setValue( initCapColumnName( lNewDbColumnName ));
                }

                // Keep the db column name in sync if the DB Column is empty or equal to the old page item name
                lDbSourceColumn = this.getProperty( model.PROP.SOURCE_DB_COLUMN );
                if (  lDbSourceColumn
                    && ( pOldValue.replace( PAGE_PREFIX, "" ) === lDbSourceColumn.getValue() || lDbSourceColumn.getValue() === "" ))
                {
                    lDbSourceColumn.setValue( pProperty.getValue().replace( PAGE_PREFIX, "" ));
                }

            } else if ( pProperty.id === model.PROP.SOURCE_TYPE ) {
                // Always default "Used" to "Always, replacing any existing value in session state" if page item is based on a DB column
                lSourceUsed = this.getProperty( model.PROP.SOURCE_USED );
                if ( lSourceUsed && pProperty.getValue() === "DB_COLUMN" ) {
                    lSourceUsed.setValue( "NO" );
                } else {
                    lSourceUsed.setValue( "YES" );
                }

            } else if ( pProperty.id === model.PROP.SOURCE_DB_COLUMN ) {
                // Has the "DB column" property changed?

                lNewDbColumnName = pProperty.getValue();

                // Try to find the column definition based on the Fetch or DML process specified for the current page
                lDmlProcesses = getDmlProcesses();

                if ( lDmlProcesses.length > 0 ) {
                    if ( lDmlProcesses[ 0 ].getProperty( model.PROP.PAGE_PROCESS_TYPE ).getValue() === "NATIVE_FORM_FETCH" ) {
                        lColumns = lDmlProcesses[ 0 ].getProperty( model.PROP.FORM_FETCH_TABLE_NAME ).getColumns();
                    } else {
                        lColumns = lDmlProcesses[ 0 ].getProperty( model.PROP.FORM_PROCESS_TABLE_NAME ).getColumns();
                    }
                    // Try to lookup the entered DB column name and set the "Value Required" and "Maximum Characters" property based
                    // on the column specification.
                    for ( var i = 0; i < lColumns.length; i++ ) {
                        if ( lColumns[ i ].name === lNewDbColumnName ) {

                            // Set "Value Required" property if the page item has one
                            _setPropertyValue( this, model.PROP.VALUE_REQUIRED, lColumns[ i ].isRequired ? "Y" : "N" );

                            // Set "Maximum Characters" property if the page item has one
                            _setPropertyValue( this, model.PROP.ELEMENT_MAX_CHARACTERS, lColumns[ i ].hasOwnProperty( "maxLen" ) ? lColumns[ i ].maxLen + "" : "" );
                        }
                    }
                }
            }
        }
    } // pageItem


    function button( pAction, pProperty, pOldValue ) {

        var lLabel       = this.getProperty( model.PROP.BUTTON_LABEL ),
            lNameInitCap = initCapColumnName( this.getProperty( model.PROP.BUTTON_NAME ).getValue() );

        function reValidateDynamicActionButtons( pButtonId, pComponentTypeId, pPropertyId ) {

            var lComponents,
                lProperty;

            lComponents = model.getComponents( pComponentTypeId, { properties: [{ id: pPropertyId, value: pButtonId }]} );
            for ( var i = 0; i < lComponents.length; i++ ) {
                lProperty = lComponents[ i ].getProperty( pPropertyId );
                lProperty.setValue( lProperty.getValue(), true );
            }
        } // reValidateDynamicActionButtons

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            lLabel.setValue( lNameInitCap );

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.BUTTON_NAME ) {
                // Keep the "Label" property in sync if the label is empty or equal to the old button name
                lLabel = this.getProperty( model.PROP.BUTTON_LABEL );
                if ( initCapColumnName( pOldValue ) === lLabel.getValue() || lLabel.getValue() === "" ) {
                    lLabel.setValue( lNameInitCap );
                }

            } else if ( pProperty.id === model.PROP.BUTTON_TEMPLATE ) {

                // Re-validate all dynamic actions referencing this button to make sure that the button template does contain #BUTTON_ID#
                reValidateDynamicActionButtons( this.id, model.COMP_TYPE.DA_EVENT,  model.PROP.WHEN_BUTTON );
                reValidateDynamicActionButtons( this.id, model.COMP_TYPE.DA_ACTION, model.PROP.AFFECTED_BUTTON );
            }
        }
    } // button


    function sourceLocationHandling( pAction, pComponent, pProperty, pOldValue, pCompWsParamComponentTypeId ) {

        function addWebSrcParams( pComponentId, pParentId, pParamComponentTypeId ) {

            var lWebSrcParams,
                lValue,
                lValues;

            // Get all In and In/Out (which are not static) parameters of the selected Web Source Module/Operation and create them for the component
            lWebSrcParams = model.getComponents( pParamComponentTypeId, {
                parentId: pParentId,
                properties: [{
                    id:    model.PROP.DIRECTION,
                    value: new RegExp( "^(IN|IN_OUT)$" )
                }],
                filterFunction: function() {
                    return ( this.getProperty( model.PROP.IS_STATIC ).getValue() === "N" );
                }
            });

            for ( var i = 0; i < lWebSrcParams.length; i++ ) {
                lValues = [{
                    id:    model.PROP.WEB_SRC_PARAM,
                    value: lWebSrcParams[ i ].id
                }];

                // Get the default value of the parameter
                lValue = lWebSrcParams[ i ].getProperty( model.PROP.PARAMETER_VALUE ).getValue();

                // Set the default value as static value or initialize it as static value if the parameter is required and the developer should enter something
                if ( lValue !== "" || lWebSrcParams[ i ].getProperty( model.PROP.PARAMETER_REQUIRED ).getValue() === "Y" ) {
                    lValues.push({
                        id:    model.PROP.VALUE_TYPE,
                        value: "STATIC"
                    });
                    if ( lValues !== "" ) {
                        lValues.push({
                            id:    model.PROP.VALUE_STATIC_VALUE,
                            value: lWebSrcParams[ i ].getProperty( model.PROP.PARAMETER_VALUE ).getValue()
                        });
                    }
                } else {
                    lValues.push({
                        id:    model.PROP.VALUE_TYPE,
                        value: "NULL"
                    });
                }

                new model.Component({
                    typeId:   pCompWsParamComponentTypeId,
                    parentId: pComponentId,
                    values:   lValues
                });
            }
        }

        function addSqlQuery( pOptions ) {
            var lValue;

            if ( pOptions.value ) {
                lValue = pOptions.value;
            } else {
                lValue = pComponent.getProperty( pOptions.id ).getValue() || "";
            }

            if ( lValue !== "" ) {
                if ( pOptions.prefix ) {
                    lSqlQuery += pOptions.prefix;
                }
                // Does the identifier contain special characters?
                if ( pOptions.identifier && !/^[A-Z]+[A-Z0-9_$]*$/.test( lValue )) {
                    lSqlQuery += '"' + lValue + '"';
                } else {
                    lSqlQuery += lValue;
                }
                if ( pOptions.postfix ) {
                    lSqlQuery += pOptions.postfix;
                }
            }
        } // addSqlQuery

        var lProperty,
            lWebSrcModuleId,
            lWebSrcOperationId,
            lQueryType,
            lSqlColumns,
            lSqlQuery = "";

        // When switching from Table or SQL Query based query type, we do want to default the SQL query or Function based on SQL Query
        // property with the old table/sql query
        if ( pProperty && pProperty.id === model.PROP.SOURCE_QUERY_TYPE ) {
            lQueryType = pComponent.getProperty( model.PROP.SOURCE_QUERY_TYPE ).getValue();
            if ( pAction === model.CALLBACK_ACTION.VALIDATE ) {
                if ( lQueryType === "TABLE" && $.inArray( pOldValue, [ "SQL", "FUNC_BODY_RETURNING_SQL"]) !== -1 /* it's actually the new value */ ) {
                    lSqlColumns = pComponent.getProperty( model.PROP.SOURCE_QUERY_TABLE ).getColumns();
                    if ( lSqlColumns.length > 0 ) {
                        for ( var i = 0; i < lSqlColumns.length; i++ ) {
                            addSqlQuery( {
                                value:      lSqlColumns[i].name,
                                prefix:     ( i === 0 ) ? "" : "       ",
                                postfix:    ( i < lSqlColumns.length - 1 ) ? ",\n" : "",
                                identifier: true
                            } );
                        }
                        lSqlQuery = "select " + lSqlQuery + "\n  from ";
                        addSqlQuery( {id: model.PROP.SOURCE_QUERY_OWNER, postfix: ".", identifier: true} );
                        addSqlQuery( {id: model.PROP.SOURCE_QUERY_TABLE, identifier: true} );
                        addSqlQuery( {id: model.PROP.SOURCE_QUERY_WHERE, prefix: "\n where " } );
                        addSqlQuery( {id: model.PROP.SOURCE_QUERY_ORDER_BY, prefix: "\n order by "} );
                    }
                    gSavedSourceSqlQuery = lSqlQuery + "";
                } else if ( lQueryType === "SQL" && pOldValue === "FUNC_BODY_RETURNING_SQL" /* it's actually the new value */ ) {
                    gSavedSourceSqlQuery = pComponent.getProperty( model.PROP.SOURCE_SQL_QUERY ).getValue() + "";
                } else {
                    gSavedSourceSqlQuery = "";
                }
            } else if ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pOldValue, [ "TABLE", "SQL" ]) !== -1 && gSavedSourceSqlQuery !== "" ) {
                if ( lQueryType === "SQL" ) {
                    _setPropertyValue( pComponent, model.PROP.SOURCE_SQL_QUERY, gSavedSourceSqlQuery );
                } else if ( lQueryType === "FUNC_BODY_RETURNING_SQL" ) {
                    _setPropertyValue( pComponent, model.PROP.SOURCE_QUERY_PLSQL_FUNCTION_BODY, "return q'~\n" + gSavedSourceSqlQuery + "\n~';" );
                }
                gSavedSourceSqlQuery = "";
            }
        }

        if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.SOURCE_INCLUDE_ROWID_COLUMN ) {
            // revalidate the TABLE property to refresh the columns
            lProperty = pComponent.getProperty( model.PROP.SOURCE_QUERY_TABLE );
            lProperty.setValue( lProperty.getValue(), true );
        }

        // Recreate Web Source Parameter if the selected Web Source Module has been set or changed
        lProperty = pComponent.getProperty( model.PROP.SOURCE_WEB_SRC_QUERY );
        if ( _hasChanged( lProperty, pAction, pProperty )) {
            _removeChildren( pComponent, pCompWsParamComponentTypeId );

            lWebSrcModuleId = lProperty.getValue();
            if ( lWebSrcModuleId !== "" ) {

                // Add the web source module level parameters first
                addWebSrcParams( pComponent.id, lWebSrcModuleId, model.COMP_TYPE.WEB_SRC_MOD_PARAM );

                // And now add the parameters of the "Fetch Rows" web source operation
                lWebSrcOperationId = model.getComponents( model.COMP_TYPE.WEB_SRC_OPERATION, {
                    parentId: lWebSrcModuleId,
                    properties: [{
                        id:    model.PROP.DATABASE_OPERATION,
                        value: "FETCH_COLLECTION"
                    }]
                }) [ 0 ].id;
                addWebSrcParams( pComponent.id, lWebSrcOperationId, model.COMP_TYPE.WEB_SRC_OPER_PARAM );

            }
        }

        // Default Post Processing SQL query and Function returning SQL query with the columns of the web source data profile
        lProperty = pComponent.getProperty( model.PROP.SOURCE_POST_PROCESSING );
        if ( _hasChangedEqualsTo( lProperty, pAction, pProperty, "SQL" ) || _hasChangedEqualsTo( lProperty, pAction, pProperty, "FUNC_BODY_RETURNING_SQL" )) {
            lSqlQuery = "";
            lSqlColumns = pComponent.getProperty( model.PROP.SOURCE_WEB_SRC_QUERY ).getColumns();
            if ( lSqlColumns.length > 0 ) {
                for ( var i = 0; i < lSqlColumns.length; i++ ) {
                    addSqlQuery( {
                        value:      lSqlColumns[i].name,
                        prefix:     ( i === 0 ) ? "" : "       ",
                        postfix:    ( i < lSqlColumns.length - 1 ) ? ",\n" : "",
                        identifier: true
                    } );
                }
                lSqlQuery = "select " + lSqlQuery + "\n  from #APEX$SOURCE_DATA#";
                if ( lProperty.getValue() === "SQL" ) {
                    _setPropertyValue( pComponent, model.PROP.POST_PROC_SQL_QUERY, lSqlQuery );
                } else if ( lProperty.getValue() === "FUNC_BODY_RETURNING_SQL" ) {
                    _setPropertyValue( pComponent, model.PROP.POST_PROC_PLSQL_FUNCTION_BODY, "return q'~\n" + lSqlQuery + "\n~';" );
                }
            }
        }

    } // sourceLocationHandling


    function region( pAction, pProperty, pOldValue ) {

        var lRegionColumns;

        // Don't show sub regions in a "Region Display Selector"
        if (  this.getProperty( model.PROP.PARENT_REGION ).getValue() !== ""
            && (  pAction === model.CALLBACK_ACTION.CREATED
               || ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.PARENT_REGION && pOldValue === "" )
               )
           )
        {
            _setPropertyValue( this, model.PROP.REGION_DISPLAY_SELECTOR, "N" );
        }

        // Reset the "Master Column" property of all IG columns if the "Master Region" property gets changed
        if ( pAction === model.CALLBACK_ACTION.CHANGED && pProperty.id === model.PROP.MASTER_REGION && pOldValue !== "" ) {
            lRegionColumns = this.getChilds( model.COMP_TYPE.IG_COLUMN, {
                filterFunction: function() {
                    var lMasterColumnProp = this.getProperty( model.PROP.MASTER_COLUMN );
                    return ( lMasterColumnProp && lMasterColumnProp.getValue() !== "" );
                }
            });
            for ( var i = 0; i < lRegionColumns.length; i++ ) {
                _setPropertyValue( lRegionColumns[ i ], model.PROP.MASTER_COLUMN, "" );
            }
        }

        sourceLocationHandling( pAction, this, pProperty, pOldValue, model.COMP_TYPE.REGION_WS_PARAM );

    } // region


    function mapChartAttributes ( pAction, pProperty ) {
        if ( pAction === model.CALLBACK_ACTION.CHANGED ) {
            if ( pProperty.id === model.PROP.USE_CUSTOM_XML ) {
                setChartXML( this, pProperty );
            }
        }
    }


    function printAttributes( pAction, pProperty, pOldValue ) {

        var DECIMAL_SEP = locale.getDecimalSeparator(),
            PAGE_SIZES = {
                "LETTER": {
                    units:  "INCHES",
                    width:  "8" + DECIMAL_SEP + "5",
                    height: "11"
                },
                "LEGAL": {
                    units:  "INCHES",
                    width:  "8" + DECIMAL_SEP + "5",
                    height: "14"
                },
                "TABLOID": {
                    units:  "INCHES",
                    width:  "8.5",
                    height: "17"
                },
                "A4": {
                    units:  "MILLIMETERS",
                    width:  "210",
                    height: "297"
                },
                "A3": {
                    units:  "MILLIMETERS",
                    width:  "297",
                    height: "420"
                }
            };

        var lPageSize,
            lWidth,
            lHeight;

        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            if ( $.inArray( model.getPrimaryLanguage(), [ "en", "en-us", "en-ca", "fr-ca" ]) !== -1 ) {
                lPageSize = "LETTER";
            } else {
                lPageSize = "A4";
            }
            _setPropertyValue( this, model.PROP.PRINT_PAGE_SIZE, lPageSize );
            _setPropertyValue( this, model.PROP.PRINT_UNITS,     PAGE_SIZES[ lPageSize ].units );
            _setPropertyValue( this, model.PROP.PRINT_WIDTH,     PAGE_SIZES[ lPageSize ].width );
            _setPropertyValue( this, model.PROP.PRINT_HEIGHT,    PAGE_SIZES[ lPageSize ].height );

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            if ( pProperty.id === model.PROP.PRINT_PAGE_SIZE && pProperty.getValue() !== "CUSTOM" ) {
                // Has the page size been changed changed?

                lPageSize = PAGE_SIZES[ pProperty.getValue() ];

                _setPropertyValue( this, model.PROP.PRINT_UNITS, lPageSize.units );
                if ( this.getProperty( model.PROP.PRINT_ORIENTATION ).getValue() === "VERTICAL" ) {
                    _setPropertyValue( this, model.PROP.PRINT_WIDTH,  lPageSize.width );
                    _setPropertyValue( this, model.PROP.PRINT_HEIGHT, lPageSize.height );
                } else {
                    _setPropertyValue( this, model.PROP.PRINT_WIDTH,  lPageSize.height );
                    _setPropertyValue( this, model.PROP.PRINT_HEIGHT, lPageSize.width );
                }

            } else if ( pProperty.id === model.PROP.PRINT_ORIENTATION ) {

                // Swap existing width and height values
                lWidth  = this.getProperty( model.PROP.PRINT_WIDTH  ).getValue();
                lHeight = this.getProperty( model.PROP.PRINT_HEIGHT ).getValue();

                _setPropertyValue( this, model.PROP.PRINT_WIDTH,  lHeight );
                _setPropertyValue( this, model.PROP.PRINT_HEIGHT, lWidth );

            }
        }
    } // printAttributes


    function validateDaButton( pButtonId ) {

        var lButton,
            lButtonTemplateId;

        // Make sure that the button template contains the #BUTTON_ID# placeholder or that the button has
        // specified id="xxx" in the custom attributes. Without an id tag for a button, dynamic action will not fire
        if ( pButtonId !== "" ) {
            lButton           = model.getComponents( model.COMP_TYPE.BUTTON, { id: pButtonId })[ 0 ];
            lButtonTemplateId = lButton.getProperty( model.PROP.BUTTON_TEMPLATE ).getValue();
            if (  lButtonTemplateId !== ""
                && !model.getButtonTemplates()[ lButtonTemplateId ].hasButtonId
                && !/id=/.test( lButton.getProperty( model.PROP.CUSTOM_ATTRIBUTES ).getValue()) )
            {
                return { error: lang.formatMessage( "PD.PE.BUTTON_NO_ID_ERROR" ) }; // todo replace with format and rename PD.PE.BUTTON_NO_ID_ERROR to MODEL.CALLBACK.BUTTON...
            }
        }

    } // validateDaButton


    function dynamicActionHasNoWhenCondition( pDynamicAction ) {

        var lWhenCondition;

        if ( pDynamicAction.getProperty( model.PROP.JS_CONDITION ) ) {

            lWhenCondition = pDynamicAction.getProperty( model.PROP.JS_CONDITION );

        } else if ( pDynamicAction.getProperty( model.PROP.JS_CONDITION_WHEN_IG ) ) {

            lWhenCondition = pDynamicAction.getProperty( model.PROP.JS_CONDITION_WHEN_IG );

        }

        return ( !lWhenCondition || lWhenCondition.getValue() === "" );

    } // dynamicActionHasNoWhenCondition


    function dynamicActionEvent( pAction, pProperty, pValue ) {

        var i, lWhenButtonProperty, lButtonAction, lFalseActions, lFalseActionResultProperty,
            lDynamicActions, lWhenRegionProperty, lRegionType, lWhenItemsProperty, lConditionItemProperty,
            lIgRegionProperty = this.getProperty( model.PROP.IG_REGION ),
            lIgRegionId = "";

        // For new Dynamic Actions, or when the "When Region" property changes, we need to check if it is an IG region,
        // and update the hidden 'IG Region' property accordingly.
        lWhenRegionProperty = this.getProperty( model.PROP.WHEN_REGION );
        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.WHEN_TYPE, model.PROP.WHEN_REGION ] ) !== -1 )
           )
        {
            if ( lWhenRegionProperty && lWhenRegionProperty.getValue() !== "" ) {
                lRegionType = model.getComponents( model.COMP_TYPE.REGION, { id: lWhenRegionProperty.getValue() } )[ 0 ].getProperty( model.PROP.REGION_TYPE ).getValue();
                if ( lRegionType === "NATIVE_IG" ) {
                    lIgRegionId = lWhenRegionProperty.getValue();
                }
            }
            lIgRegionProperty.setValue( lIgRegionId );

            lDynamicActions = this.getChilds( model.COMP_TYPE.DA_ACTION );

            // synchronize the current IG region id to dynamic actions
            for ( i = 0; i < lDynamicActions.length; i++ ) {
                _setPropertyValue( lDynamicActions[ i ], model.PROP.IG_REGION, lIgRegionId );
            }
        }

        // If the dynamic action sets the when condition to null, remove the corresponding FALSE actions
        if ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.JS_CONDITION, model.PROP.JS_CONDITION_WHEN_IG ]) !== -1 ) {

            lFalseActions = this.getChilds( model.COMP_TYPE.DA_ACTION, {
                properties: [{
                    id: model.PROP.FIRE_WHEN_EVENT_RESULT_IS,
                    value: "FALSE"
                }]
            });

            if ( dynamicActionHasNoWhenCondition( this ) ) {

                // When removing a condition, remove the children that have a FALSE event result
                _removeComponents( lFalseActions );

            } else {

                // When setting a condition, set 'fire when result' action property to itself, to get rid of any false action errors
                for ( i = 0; i < lFalseActions.length; i++ ) {
                    lFalseActionResultProperty = lFalseActions[ i ].getProperty( model.PROP.FIRE_WHEN_EVENT_RESULT_IS );
                    lFalseActionResultProperty.setValue( lFalseActionResultProperty.getValue() );
                }
            }
        }


        // If client-side condition type changes to a type that requires and item or column be defined, or when > item or when > column changes
        // then we default this to the current when > item / column.
        if (  pAction === model.CALLBACK_ACTION.CREATED
           || ( pAction === model.CALLBACK_ACTION.CHANGED && $.inArray( pProperty.id, [ model.PROP.JS_CONDITION, model.PROP.JS_CONDITION_WHEN_IG, model.PROP.WHEN_ITEMS, model.PROP.WHEN_COLUMNS ] ) !== -1 )
           )
        {
            if ( lIgRegionProperty.getValue() === "" ) {
                lWhenItemsProperty     = this.getProperty( model.PROP.WHEN_ITEMS );
                lConditionItemProperty = this.getProperty( model.PROP.JS_CONDITION_ITEM );
            } else {
                lWhenItemsProperty     = this.getProperty( model.PROP.WHEN_COLUMNS );
                lConditionItemProperty = this.getProperty( model.PROP.JS_CONDITION_COLUMN_WHEN_IG );
            }

            if ( lWhenItemsProperty && lConditionItemProperty ) {

                /*
                 * We update the condition item value when any of the following are true:
                 * 1. If the condition item is currently null
                 * 2. If the when > item has changed, and the condition item value was the same as the old when > item value
                 */
                if (  lConditionItemProperty.getValue() === ""
                   || ( pProperty.id === lWhenItemsProperty.id && lConditionItemProperty.getValue() === pValue.split( "," )[ 0 ] ) /* old when item may be multiple, use first item */
                   )
                {
                    // Set the condition item value to the when item, or the 1st of the when items if there are multiple
                    lConditionItemProperty.setValue( lWhenItemsProperty.getValue().split( "," )[ 0 ] );
                }
            }
        }

        // If the dynamic action event is associated to a button, make sure that the button action is set to "Defined by Dynamic Action".
        lWhenButtonProperty = this.getProperty( model.PROP.WHEN_BUTTON );
        if ( _hasChanged( lWhenButtonProperty, pAction, pProperty )) {
            if (  !/^apex/.test( this.getProperty( model.PROP.EVENT ).getValue() ) // apex events are listening event, no need to change the button execution
                && lWhenButtonProperty
                && !lWhenButtonProperty.getMetaData().isReadOnly
                && lWhenButtonProperty.getValue() !== "" )
            {
                lButtonAction = model.getComponents( model.COMP_TYPE.BUTTON, { id: lWhenButtonProperty.getValue() })[ 0 ].getProperty( model.PROP.BUTTON_ACTION );

                if ( lButtonAction.getValue() !== "DEFINED_BY_DA" ) {
                    lButtonAction.setValue( "DEFINED_BY_DA" );
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.WHEN_BUTTON ) {

            return validateDaButton( pValue );

        }
    } // dynamicActionEvent


    function dynamicActionAction( pAction, pProperty, pValue ) {

        var lActionTypeProperty = this.getProperty( model.PROP.DA_ACTION_TYPE ),
            lAffectedTypeProperty = this.getProperty( model.PROP.AFFECTED_TYPE );


        if ( pAction === model.CALLBACK_ACTION.CREATED ) {

            // copy the IG REGION property from the dynamic action event
            _setPropertyValue( this, model.PROP.IG_REGION, this.getParent().getProperty( model.PROP.IG_REGION ).getValue() );

            // Default "Affected Elements - Type" to ITEM or COLUMN depending if it's an IG region and it's supported by the action
            if ( lAffectedTypeProperty && lAffectedTypeProperty.getValue() === "" && lActionTypeProperty.getValue() !== "NATIVE_JAVASCRIPT_CODE" ) {
                if ( this.getProperty( model.PROP.IG_REGION ).getValue() === "" ) {
                    lAffectedTypeProperty.setValue( "ITEM" );
                } else {
                    lAffectedTypeProperty.setValue( "COLUMN" );
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.CHANGED ) {

            // When the action's event changes, if the action's event result is false, check if the parent DA
            // has a condition, and if not set the event result property to TRUE.
            if ( pProperty.id === model.PROP.DA_EVENT ) {

                if ( this.getProperty( model.PROP.FIRE_WHEN_EVENT_RESULT_IS ).getValue() === "FALSE" ) {

                    if ( dynamicActionHasNoWhenCondition( this.getParent() ) ) {

                        _setPropertyValue( this, model.PROP.FIRE_WHEN_EVENT_RESULT_IS, "TRUE" );

                    }
                }
            }

        } else if ( pAction === model.CALLBACK_ACTION.VALIDATE ) {

            if ( pProperty.id === model.PROP.FIRE_WHEN_EVENT_RESULT_IS ) {

                if ( pValue === "FALSE" && dynamicActionHasNoWhenCondition( this.getParent() ) ) {

                    return { error: lang.formatMessage( "PD.PE.INVALID_FALSE_ACTIONS" ) };

                }
            } else if ( pProperty.id === model.PROP.AFFECTED_BUTTON ) {

                return validateDaButton( pValue );

            } else if ( pProperty.id === model.PROP.AFFECTED_COLUMNS ) {

                // Disallow affected columns to be specified when the DA is based on an IG region and the action is show or hide
                if ( this.getProperty( model.PROP.IG_REGION ).getValue() !== "" &&
                     pValue !== "" &&
                     $.inArray( this.getProperty( model.PROP.DA_ACTION_TYPE ).getValue(), [ "NATIVE_SHOW", "NATIVE_HIDE" ] ) > -1 )
                {
                    return { error: lang.formatMessage( "PD.PE.SHOW_HIDE_NOT_SUPPORTED" ) };
                }
            } else if ( pProperty.id === model.PROP.DA_ACTION_TYPE ) {

                // Disallow action type to be show or hide, when affected columns is not null and DA is based on an IG region
                if ( this.getProperty( model.PROP.IG_REGION ).getValue() !== "" &&
                     this.getProperty( model.PROP.AFFECTED_COLUMNS ) &&
                     this.getProperty( model.PROP.AFFECTED_COLUMNS ).getValue() !== "" &&
                     $.inArray( pValue, [ "NATIVE_SHOW", "NATIVE_HIDE" ] ) > -1 )
                {
                    return { error: lang.formatMessage( "PD.PE.SHOW_HIDE_NOT_SUPPORTED" ) };
                }

            }

        }

        // If we switch to "Execute JavaScript code", most of the time we actually don't want to type in an Affected Element
        if ( _hasChangedEqualsTo( lActionTypeProperty, pAction, pProperty, "NATIVE_JAVASCRIPT_CODE" ) ) {

            lAffectedTypeProperty.setValue( "" );
        }

    } // dynamicActionAction


    function regionWebSrcParam( pAction, pProperty, pValue ) {

        var lProperty,
            lWebSrcParam;

        // Make sure that Type = Null isn't picked for the parameter, if the parameter configuration requires to enter a value
        if ( pAction === model.CALLBACK_ACTION.VALIDATE && pProperty.id === model.PROP.VALUE_TYPE && pValue === "NULL" ) {

            // Get the referenced web source parameter configuration
            lWebSrcParam = model.getComponents( model.COMP_TYPE.WEB_SRC_MOD_PARAM, {
                id: this.getProperty( model.PROP.WEB_SRC_PARAM ).getValue()
            })[ 0 ];

            if ( lWebSrcParam.getProperty( model.PROP.PARAMETER_REQUIRED ).getValue() === "Y" ) {
                return { error: format( "WEB_SRC_PARAM.REQUIRES_VALUE" ) };
            }
        }

    } // regionWebSrcParam


    $( document ).on( "modelConfigLoaded", function() {

        var REGION_PLUGINS = model.getComponentType( model.COMP_TYPE.REGION ).pluginType.plugins;

        // Some component types have to execute additional code if they are created/modified/deleted
        model.setComponentTypeCallback( model.COMP_TYPE.PAGE_ITEM,          pageItem );
        model.setComponentTypeCallback( model.COMP_TYPE.BUTTON,             button );
        model.setComponentTypeCallback( model.COMP_TYPE.REGION,             region );
        model.setComponentTypeCallback( model.COMP_TYPE.DA_EVENT,           dynamicActionEvent );
        model.setComponentTypeCallback( model.COMP_TYPE.DA_ACTION,          dynamicActionAction );
        model.setComponentTypeCallback( model.COMP_TYPE.CHART,              chartAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.JET_CHART,          jetChartAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.JET_CHART_SERIES,   jetChartSeries );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_REPORT,     classicRptTabularFormAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_RPT_COLUMN, classicReportColumn );
        model.setComponentTypeCallback( model.COMP_TYPE.TABULAR_FORM,       classicRptTabularFormAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.TAB_FORM_COLUMN,    tabularFormColumn );
        model.setComponentTypeCallback( model.COMP_TYPE.IG_ATTRIBUTES,      interactiveGridAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.IG_COLUMN,          interactiveGridColumn );
        model.setComponentTypeCallback( model.COMP_TYPE.IR_ATTRIBUTES,      interactiveReportAttr );
        model.setComponentTypeCallback( model.COMP_TYPE.IR_PRINT_ATTR,      printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.CLASSIC_RPT_PRINT,  printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.TAB_FORM_PRINT,     printAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.MAP_CHART,          mapChartAttributes );
        model.setComponentTypeCallback( model.COMP_TYPE.REGION_WS_PARAM,    regionWebSrcParam );

        // Register a default handling for region types which use columns
        for ( var lName in REGION_PLUGINS ) {
            if ( REGION_PLUGINS.hasOwnProperty( lName ) && $.inArray( "COLUMNS", REGION_PLUGINS[ lName ].features ) !== -1 ) {
                model.setPluginCallback( model.COMP_TYPE.REGION, lName, regionPluginWithColumns );
            }
        }

        // Some plug-ins need extra handling if the region type or source property gets changed
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_IG",           interactiveGridPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_IR",           interactiveReportPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_SQL_REPORT",   classicReportPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_TABFORM",      tabularFormPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_FLASH_MAP",    mapChartPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_FLASH_CHART5", chartPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_JET_CHART",    jetChartPlugin );
        model.setPluginCallback( model.COMP_TYPE.REGION, "NATIVE_CALENDAR",     legacyCalendarPlugin );
        model.setPluginCallback( model.COMP_TYPE.DA_ACTION, "NATIVE_SET_VALUE", setValuePlugin );

        // Some plug-ins need extra handling if the item type gets changed
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.RICH_TEXT_EDITOR, nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.TEXTAREA,         nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SHUTTLE,          nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.SELECT_LIST,      nativeItemPlugins );
        model.setPluginCallback( model.COMP_TYPE.PAGE_ITEM, ITEM_TYPE.FILE,             nativeItemPlugins );

        // Some plug-ins need extra handling if the process type gets changed
        model.setPluginCallback( model.COMP_TYPE.PAGE_PROCESS, "NATIVE_WEB_SERVICE",        webServiceProcessPlugin );
        model.setPluginCallback( model.COMP_TYPE.PAGE_PROCESS, "NATIVE_WEB_SERVICE_LEGACY", webServiceProcessPlugin );
        model.setPluginCallback( model.COMP_TYPE.PAGE_PROCESS, "NATIVE_PLSQL",              plsqlProcessPlugin )

    });

})( pe, apex.jQuery, apex.debug, apex.util, apex.locale, apex.lang, apex.server );
