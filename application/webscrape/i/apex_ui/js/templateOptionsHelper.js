/*!
 @license
 Oracle Database Application Express, Release 5.0
 Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.
 */
(function( $, apex ) {
    "use strict";
    apex.templateOptionsHelper = {
        getValuesFromDialog: function( properties, dialog$ ) {
            var lValue;
            var lValues = [];
            function addValues( pProperties ) {
                for ( var i = 0; i < pProperties.length; i++ ) {
                    lValue = dialog$.propertyEditor( "getPropertyValue", pProperties[ i ].propertyName );
                    if ( lValue !== "" ) {
                        lValues.push( lValue );
                    }
                }
            }
            // Get selected template options from all our properties
            addValues( properties.common );
            addValues( properties.advanced );
            return lValues;
        },
        getProperties: function( templateOptions, lValues, readOnly ) {
            var i,
                lGroupId,
                lGroupIdx,
                lDisplayGroupId,
                lGroups           = [],
                lGroupsMap        = {},
                lGeneralValues    = [],
                lGeneralLovValues = [],
                lProperties       = {
                    common:   [],
                    advanced: []
                };

            // Build a list of "general" template options and one for each group
            for ( i = 0; i < templateOptions.values.length; i++ ) {

                if ( templateOptions.values[ i ].groupId ) {
                    lGroupId = templateOptions.values[ i ].groupId;
                    if ( !lGroupsMap.hasOwnProperty( lGroupId )) {
                        lGroups.push({
                            title:      templateOptions.groups[ lGroupId ].title,
                            seq:        templateOptions.groups[ lGroupId ].seq,
                            nullText:   templateOptions.groups[ lGroupId ].nullText,
                            isAdvanced: templateOptions.groups[ lGroupId ].isAdvanced,
                            isRequired: false,
                            lovValues:  [],
                            value:      ""
                        });
                        lGroupIdx = lGroups.length - 1;
                        lGroupsMap[ lGroupId ] = lGroupIdx;
                    } else {
                        lGroupIdx = lGroupsMap[ lGroupId ];
                    }
                    // If a preset is set for one of the list of values entries of the group, we expect that the
                    // group has to be required
                    if ( $.inArray( templateOptions.values[ i ].r, templateOptions.presetValues ) !== -1 ) {
                        lGroups[ lGroupIdx ].isRequired = true;
                        if ( lGroups[ lGroupIdx ].value === "" ) {
                            lGroups[ lGroupIdx ].value = templateOptions.values[ i ].r;
                        }
                    }
                    // Set the current selection for that group
                    if ( $.inArray( templateOptions.values[ i ].r, lValues ) !== -1 ) {
                        lGroups[ lGroupIdx ].value = templateOptions.values[ i ].r;
                    }
                    lGroups[ lGroupIdx ].lovValues.push({
                        r: templateOptions.values[ i ].r,
                        d: templateOptions.values[ i ].d
                    });

                } else {

                    lGeneralLovValues.push( templateOptions.values[ i ] );

                    // Is the LOV value one of our selected values?
                    if ( $.inArray( templateOptions.values[ i ].r, lValues ) !== -1 ) {
                        lGeneralValues.push( templateOptions.values[ i ].r );
                    }

                }
            }

            // Sort result based on sequence and if they are equal, use title as second sort option
            lGroups.sort( function( a, b ) {
                if ( a.seq === b.seq ) {
                    return a.title.localeCompare( b.title );
                } else {
                    return a.seq - b.seq;
                }
            });
            var joinedGeneralValues = lGeneralValues.join( ":" );
            // There is always a "General" property, because we will at least have a #DEFAULT# entry
            lProperties.common[ 0 ] = {
                propertyName: "general",
                value:          joinedGeneralValues,
                oldValue:       joinedGeneralValues,
                originalValue:  joinedGeneralValues,
                metaData: {
                    type:           "TEMPLATE OPTIONS GENERAL",
                    prompt:         apex.lang.getMessage("TEMPLATE_OPTIONS.GENERAL"),
                    isReadOnly:     !!readOnly,
                    isRequired:     false,
                    lovValues:      lGeneralLovValues,
                    displayGroupId: "common",
                    defaultTemplateOptions: templateOptions.defaultValues
                },
                errors:   [],
                warnings: []
            };

            // Add a select list for each template options group
            for ( i = 0; i < lGroups.length; i++ ) {

                if ( lGroups[ i ].isAdvanced ) {
                    lDisplayGroupId = "advanced";
                } else {
                    lDisplayGroupId = "common";
                }
                lProperties[ lDisplayGroupId ].push({
                    propertyName: "grp" + i,
                    value:          lGroups[ i ].value,
                    oldValue:       lGroups[ i ].value,
                    originalValue:  lGroups[ i ].value,
                    metaData: {
                        type:       $.apex.propertyEditor.PROP_TYPE.SELECT_LIST,
                        prompt:     lGroups[ i ].title,
                        isReadOnly: !!readOnly,
                        isRequired: lGroups[ i ].isRequired,
                        nullText:   lGroups[ i ].nullText,
                        lovValues:  lGroups[ i ].lovValues,
                        displayGroupId: lDisplayGroupId
                    },
                    errors:   [],
                    warnings: []
                });
            }

            return lProperties;
        },
        addGeneralPropertyType: function () {
            $.apex.propertyEditor.addPropertyType( "TEMPLATE OPTIONS GENERAL", {
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

                    var checkboxes$      = pElement$.find( "input[type=checkbox]" );
                    var defaultCheckbox$ = checkboxes$.filter( "[value='#DEFAULT#']" );

                    // Get all default template options checkboxes
                    for ( var i = 0; i < prop.metaData.defaultTemplateOptions.length; i++ ) {
                        lDefaultCheckboxes$ =
                            lDefaultCheckboxes$.add(
                                checkboxes$.filter(
                                    "[value='" +
                                    apex.util.escapeCSS(
                                        prop.metaData.defaultTemplateOptions[ i ]) + "']" ));
                    }

                    defaultCheckbox$
                        .on( "click setdefaultcheckboxes", _setDefaultOptions )
                        .trigger( "setdefaultcheckboxes" );
                },
                getValue: function( pProperty$ ) {
                    var lValues = [];
                    pProperty$.find("input[type=checkbox]").filter( ":checked:not(:disabled)" ).each( function() {
                        lValues.push( this.value );
                    });

                    return lValues.join( ":" );
                },
                setValue: function( pElement$, prop, value ) {
                    this[ "super" ]( "setValue", pElement$, prop, value );
                    pElement$.find( "input[type=checkbox]" ).filter( "[value='#DEFAULT#']").trigger( "setdefaultcheckboxes" );
                }

            }, "CHECKBOXES" );
        }
    };
}( jQuery, apex ));