/*global apex,$v*/

/**
 @license

 Oracle Database Application Express, Release 5.0

 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * The {@link apex}.server namespace is used to store all AJAX functions to communicate with the server part
 * of Oracle Application Express.
 **/

(function( model, pd, util, debug, lang, $ ) {
    "use strict";

    var WIDGET = "COMPONENT_VIEW",
        CSS = {
            IS_SELECTED: "is-selected"
        },
        WHEN_PROPS = [
            model.PROP.WHEN_REGION,
            model.PROP.WHEN_BUTTON,
            model.PROP.WHEN_ITEMS,
            model.PROP.WHEN_DOM_OBJECT,
            model.PROP.WHEN_JQUERY_SELECTOR,
            model.PROP.WHEN_JAVASCRIPT_EXPRESSION ];

    var gSelectedComponents = [];


    function msg( pKey ) {
        return lang.getMessage( "PD.CV." + pKey );
    }

    function format( pKey ) {
        var pattern = msg( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    }


    function addGroup( out, pOptions ) {

        var createUrl,
            createMsg;

        out.markup( '<div class="a-CV-group"><div class="a-CV-groupHeader"><h3 class="a-CV-groupTitle">' );
        if ( pOptions.title ) {
            out.content( pOptions.title );
        } else {
            out.content( model.getComponentType( pOptions.componentTypeId ).title.plural );
        }
        out.markup( "</h3>" );

        if ( !model.isPageReadOnly() && pOptions.componentTypeId ) {
            createUrl = model.getComponentType( pOptions.componentTypeId ).createUrl;
            out.markup( '<a class="a-Button a-Button--regionHeader create" href="#" ' );
            if ( createUrl ) {
                out.attr( "data-url", createUrl );
            } else {
                // Use data attributes to store which component type and default property a new component should be created with
                out.attr( "data-componenttypeid", pOptions.componentTypeId );
                if ( pOptions.property ) {
                    out.attr( "data-propertyid",     pOptions.property.id )
                        .attr( "data-propertyvalue", pOptions.property.value );
                }
            }
            createMsg = format( "CREATE_COMPONENT", model.getComponentType( pOptions.componentTypeId ).title.singular );
            out.markup( ' title="' + createMsg + '" aria-label="' + createMsg + '"><span class="a-Icon icon-plus" aria-hidden="true"></span></a>' );
        }

        out.markup( '</div><div class="a-CV-groupBody" ' );

        if ( pOptions.domId ) {
            out.attr( "id", pOptions.domId );
        }

        out.markup( '>' );

    }


    function addCloseGroup( out ) {

        out.markup( '</div></div>' );

    }


    function addComponentGroup( out, pOptions ) {

        var classes = "a-CV-componentGroup";

        out.markup( '<div ' );

        if ( pOptions.hasWarnings ) {
            classes += " " + pd.CSS.IS_WARNING;
        }
        out.attr( "class", classes );

        if ( pOptions.component instanceof model.Component ) {
            out.attr( "data-componenttypeid", pOptions.component.typeId )
                .attr( "data-componentid", pOptions.component.id );
        }
        out.markup( ">" );

        if ( pOptions.component || pOptions.title ) {

            out.markup( '<h4 class="a-CV-componentGroupTitle">' );

            if ( pOptions.component instanceof model.Component ) {
                out.markup( '<span class="a-CV-componentGroupTitle-context">' )
                    .content( model.getComponentType( pOptions.component.typeId ).title.singular )
                    .markup( '</span><a class="edit" href="#" title="">' )
                    .content( pOptions.component.getDisplayTitle() )
                    .markup( '</a>' );
            } else {
                out.content( pOptions.title );
            }

            out.markup( '</h4>' );
        }
    }


    function addCloseComponentGroup( out ) {

        out.markup( '</div>' );

    }


    function getComponentDomId( pComponent ) {
        return "CVT" + pComponent.typeId + "_" + pComponent.id;
    }


    function addComponent( out, pComponent, pOptions ) {

        var classes = "",
            additionalDisplayValue,
            typeProperty,
            typeDisplayValue,
            lRegionAttributes = [],
            icon;

        function getIndent() {
            var indentTag = "";
            for ( var i = 0; i < pOptions.indent; i++ ) {
                indentTag += '<span class="a-CV-indent"></span>';
            }
            return indentTag;
        }

        function getRegionAttributes( pRegionType ) {

            var REGION_TYPES = {
                "NATIVE_IR":           model.COMP_TYPE.IR_ATTRIBUTES,
                "NATIVE_IG":           model.COMP_TYPE.IG_ATTRIBUTES,
                "NATIVE_SQL_REPORT":   model.COMP_TYPE.CLASSIC_REPORT,
                "NATIVE_FNC_REPORT":   model.COMP_TYPE.CLASSIC_REPORT,
                "NATIVE_TABFORM":      model.COMP_TYPE.TABULAR_FORM,
                "NATIVE_FLASH_MAP":    model.COMP_TYPE.MAP_CHART,
                "NATIVE_FLASH_CHART5": model.COMP_TYPE.CHART,
                "NATIVE_JET_CHART":    model.COMP_TYPE.JET_CHART,
                "NATIVE_CALENDAR":     model.COMP_TYPE.CLASSIC_CALENDAR
            };
            var componentTypeId = model.COMP_TYPE.REGION_PLUGIN_ATTR;

            if ( REGION_TYPES.hasOwnProperty( pRegionType )) {
                componentTypeId = REGION_TYPES[ pRegionType ];
            }

            return model.getComponents( componentTypeId, { parentId: pComponent.id });
        }

        function getButtonAction() {

            var targetProp = pComponent.getProperty( model.PROP.BUTTON_TARGET ),
                action;
            if ( targetProp ) {
                action = pd.splitApexUrl( targetProp.getValue(), true ).display;
            } else {
                action = pComponent.getProperty( model.PROP.BUTTON_ACTION ).getDisplayValue();
            }
            return action;
        }


        if ( pd.isNever( pComponent )) {
            classes += " " + pd.CSS.IS_NEVER;
        } else if ( pd.isConditional( pComponent )) {
            classes += " " + pd.CSS.IS_CONDITIONAL;
        }
        if ( pComponent.hasChanged() ) {
            classes += " " + pd.CSS.IS_CHANGED;
        }
        if ( pComponent.hasErrors()) {
            classes += " " + pd.CSS.IS_ERROR;
        }
        if ( pComponent.hasWarnings()) {
            classes += " " + pd.CSS.IS_WARNING;
        }
        out.markup( "<li " )
            .attr( "id", getComponentDomId( pComponent ))
            .attr( "class", "a-CV-component" + classes )
            .attr( "data-componenttypeid", pComponent.typeId )
            .attr( "data-componentid", pComponent.id )
            .markup( ">" );

        if ( pOptions.type ) {
            if ( $.isArray( pOptions.type )) {
                // Validations do use a different validation type property depending if it's for tabular forms or for page level validations.
                typeProperty = ( pComponent.getProperty( pOptions.type[ 0 ]) || pComponent.getProperty( pOptions.type[ 1 ]) );
            } else {
                typeProperty = pComponent.getProperty( pOptions.type );
            }
        }

        if ( pOptions.seq ) {
            out.markup( '<span class="a-CV-cell a-CV-cell--seq u-tE">' )
                .content( pComponent.getProperty( pOptions.seq ).getDisplayValue() )
                .markup( "</span>" );
        }

        if ( pOptions.name ) {
            out.markup( '<span class="a-CV-cell a-CV-cell--primary">' );

            if ( pOptions.icon ) {

                if ( pOptions.icon === "region" || pOptions.icon === "item" ) {
                    icon = pd.getComponentIconClass( pOptions.icon, typeProperty.getValue() );
                    typeDisplayValue = typeProperty.getDisplayValue();
                } else if ( pOptions.icon === "button" ) {
                    icon = pd.getComponentIconClass( "button", pComponent.getProperty( model.PROP.BUTTON_IS_HOT ).getValue() === "Y" ? "hot" : "normal" );
                    typeDisplayValue = ""; // todo what should we add here or should we skip it?
                } else {
                    icon = pOptions.icon;
                    typeDisplayValue = ""; // todo what should we add here or should we skip it?
                }
                out.markup( '<span class="a-CV-cellWrap">' + getIndent() + '<span ' )
                    .attr( "class", "a-CV-icon a-Icon " + icon )
                    .attr( "title", typeDisplayValue )
                    .markup( '></span><span class="u-VisuallyHidden">' )
                    .content( typeDisplayValue )
                    .markup( "</span>" );
            }

            out.markup( '<a class="edit" href="#" title="">' );
            if ( pComponent.typeId === model.COMP_TYPE.REGION || pOptions.name === true ) {
                out.content( pComponent.getDisplayTitle() ); // we use getDisplayTitle because it includes [Global]
            } else {
                out.content( pComponent.getProperty( pOptions.name ).getDisplayValue() );
            }
            out.markup( '</a></span>' );

            if ( pOptions.icon ) {
                out.markup( "</span>" ); // close for a-CV-cellWrap
            }
        }

        if ( pOptions.additional ) {
            additionalDisplayValue = pOptions.additional.apply( pComponent );
            out.markup( '<span class="a-CV-cell a-CV-cell--secondary">' )
                .content( additionalDisplayValue )
                .markup( "</span>");
        }

        if ( typeProperty ) {
            out.markup( '<span class="a-CV-cell a-CV-cell--secondary">' );

            // For regions we do want to make the region type clickable if it has an attributes node
            if ( pComponent.typeId === model.COMP_TYPE.REGION ) {
                lRegionAttributes = getRegionAttributes( typeProperty.getValue() );
            }

            // For regions we also do want to make the region type clickable if attributes are available
            if ( lRegionAttributes.length > 0 ) {
                out.markup( '<a class="edit" href="#" title=""' )
                    .attr( "data-componenttypeid", lRegionAttributes[ 0 ].typeId )
                    .attr( "data-componentid",     lRegionAttributes[ 0 ].id )
                    .markup( ">" )
                    .content( typeProperty.getDisplayValue() )
                    .markup( '</a></span>' );
            } else {
                // For button actions we also want to emit the target page if specified
                if ( typeProperty.id === model.PROP.BUTTON_ACTION ) {
                    out.content( getButtonAction() );
                } else {
                    out.content( typeProperty.getDisplayValue() );
                }
            }

            out.markup( "</span>" );
        }
        out.markup( "</li>" );

    }


    function addComponents( out, pOptions ) {

        var header = {},
            components,
            filters   = [],
            configMap = {},
            hasComponents = false,
            i;

        if ( $.isArray( pOptions.component )) {

            for ( i = 0; i < pOptions.component.length; i++ ) {
                filters[ i ] = {
                    typeId: pOptions.component[ i ].typeId,
                    filter: pOptions.component[ i ].filter
                };
                configMap[ pOptions.component[ i ].typeId ] = pOptions.component[ i ];
            }

        } else {

            filters[ 0 ] = {
                typeId: pOptions.component.typeId,
                filter: pOptions.component.filter
            };
            configMap[ pOptions.component.typeId ] = pOptions.component;
        }

        // Get and emit all components specified by the filter
        components = model.getComponentsAdvanced( filters );

        // Only show the header if we do have components which are getting displayed
        if ( components.length > 0 ) {

            for ( i = 0; i < components.length; i++ ) {
                // Component View shouldn't show any Global Page components
                if ( !components[ i ].isOnGlobalPage() && pd.isDisplayed( components[ i ] )) {
                    hasComponents = true;
                    break;
                }
            }

            if ( hasComponents ) {
                if ( pOptions.header ) {
                    if ( pOptions.header.component instanceof model.Component ) {
                        header = { component: pOptions.header.component };
                    } else if ( pOptions.header.title ) {
                        header = { title: pOptions.header.title };
                    } else {
                        header = { title: model.getComponentType( pOptions.component.typeId ).title.plural };
                    }
                    header.hasWarnings = pOptions.header.hasWarnings;
                    addComponentGroup( out, header );
                }

                if ( !pOptions.noComponentGrouping ) {
                    out.markup( '<ul class="a-CV-components">' );
                }

                // Emit components
                for ( i = 0; i < components.length; i++ ) {
                    // Component View shouldn't show any Global Page components
                    if ( !components[ i ].isOnGlobalPage() && pd.isDisplayed( components[ i ] )) {
                        addComponent( out, components[ i ], configMap[ components[ i ].typeId ].display );
                        if ( configMap[ components[ i ].typeId ].addSubComponents ) {
                            configMap[ components[ i ].typeId ].addSubComponents( out, components[ i ]);
                        }
                    }
                }
                if ( !pOptions.noComponentGrouping ) {
                    out.markup( "</ul>" );
                }
                if ( pOptions.header ) {
                    addCloseComponentGroup( out );
                }
            }
        }

    } // addComponents


    function getComponent$( pComponent, pContainer$ ) {

        return pContainer$.find( "#" + util.escapeCSS( getComponentDomId( pComponent )));

    }


    function getRefByCompProps( pComponentTypeId ) {

        var type = model.getComponentType( pComponentTypeId ),
            refProperty,
            refType,
            result = [],
            i, j;

        // Find all properties which are using the current component type as LOV
        for ( i = 0; i < type.refByProperties.length; i++ ) {

            // Find all the component types which are using that property
            refProperty = model.getProperty( type.refByProperties[ i ]);
            for ( j = 0; j < refProperty.refByComponentTypes.length; j++ ) {

                // Only scan page level component types
                refType = model.getComponentType( refProperty.refByComponentTypes[ j ] );
                if ( refType.isPageComponent || refType.id === model.COMP_TYPE.PAGE ) {
                    result.push({
                        typeId:     refType.id,
                        propertyId: refProperty.id
                    });
                }
            }
        }
        return result;
    }


    function selectComponents( pContainer$ ) {

        for ( var i = 0; i < gSelectedComponents.length; i++ ) {
            getComponent$( gSelectedComponents[ i ], pContainer$ ).addClass( CSS.IS_SELECTED );
        }
    }


    function registerObserver( pOptions, pRenderFunction ) {

        function refresh( pNotifications ) {

            var out = util.htmlBuilder(),
                container$ = $( "#" + pOptions.domId );

            debug.trace( "%s: CHANGE/ADD_PROP/REMOVE_PROP component notification received for display relevant properties", pOptions.domId, pNotifications );

            pRenderFunction( out );

            container$
                .empty()
                .append( out.toString() );

            // after a refresh, we have to re-select the currently selected components
            selectComponents( container$ );
        }

        function addProperty( pPropertyId ) {
            if ( pPropertyId ) {
                properties.push( pPropertyId );
            }
        }

        var components = [],
            properties = [],
            container$,// can't immediately populate, because at the time when we call registerObserver the dom element does not exist yet
            i;

        addProperty( pOptions.display.seq );
        addProperty( pOptions.display.name );
        addProperty( pOptions.display.additional );
        addProperty( pOptions.display.type );
        addProperty( pOptions.pointPropertyId );

        if ( pOptions.componentTypeId ) {
            components = [{ typeId: pOptions.componentTypeId }];
        } else {
            components = pOptions.components;
        }
        if ( pOptions.addProperties ) {
            for ( i = 0; i < pOptions.addProperties.length; i++ ) {
                addProperty( pOptions.addProperties[ i ]);
            }
        }

        // Register observers to find out if components have been created or deleted or display relevant properties have changed
        model.observer(
            WIDGET, {
                components: components,
                events:     [ model.EVENT.CREATE, model.EVENT.DELETE ]
            },
            refresh,
            true );

        model.observer(
            WIDGET, {
                components: components,
                events:     [ model.EVENT.CHANGE, model.EVENT.ADD_PROP, model.EVENT.REMOVE_PROP ],
                properties: properties
            },
            refresh,
            true );

        // Register observers to find out if a component has errors, warnings or is conditional
        model.observer(
            WIDGET, {
                components: components,
                events:     [ model.EVENT.ERRORS, model.EVENT.NO_ERRORS, model.EVENT.WARNINGS, model.EVENT.NO_WARNINGS ]
            },
            function( pNotification ) {
                function handle( pTrue, pClass ) {
                    if ( pTrue ) {
                        getComponent$( pNotification.component, container$ ).addClass( pClass );
                    } else {
                        getComponent$( pNotification.component, container$ ).removeClass( pClass );
                    }
                }
                container$ = $( "#" + pOptions.domId );
                handle( pNotification.component.hasErrors(),   pd.CSS.IS_ERROR );
                handle( pNotification.component.hasWarnings(), pd.CSS.IS_WARNING );
            });
        pd.observerIsConditional( WIDGET, components,
            function( pNotification ) {
                container$ = $( "#" + pOptions.domId );
                getComponent$( pNotification.component, container$ ).removeClass( pd.CSS.IS_CONDITIONAL );
                getComponent$( pNotification.component, container$ ).removeClass( pd.CSS.IS_NEVER );

                if ( pd.isNever( pNotification.component )) {
                    getComponent$( pNotification.component, container$ ).addClass( pd.CSS.IS_NEVER );
                } else if ( pd.isConditional( pNotification.component )) {
                    getComponent$( pNotification.component, container$ ).addClass( pd.CSS.IS_CONDITIONAL );
                }
            });


// todo        pd.observerIsConditional( WIDGET, components, refresh );
    }


    function addPointComponents( out, pOptions ) {

        function renderComponents( out ) {

            var i;

            for ( i = 0; i < pOptions.points.length; i ++ ) {

                addComponents( out, {
                    header:    {
                        title: model.getLovTitle( pOptions.componentTypeId, pOptions.pointPropertyId, pOptions.points[ i ] )
                    },
                    component: {
                        typeId: pOptions.componentTypeId,
                        filter: {
                            properties: [{
                                id:    pOptions.pointPropertyId,
                                value: pOptions.points[ i ]
                            }]
                        },
                        display: pOptions.display
                    }
                });
            }

        }

        addGroup( out, {
            domId:           pOptions.domId,
            componentTypeId: pOptions.componentTypeId,
            property:        { id: pOptions.pointPropertyId, value: pOptions.defaultCreatePoint }
        });
        renderComponents( out );
        addCloseGroup( out );

        registerObserver( pOptions, renderComponents );
    }


    function addRegionComponents( out, pRegion, pComponents ) {

        var header = {},
            regionId = "",
            i;

        if ( pRegion instanceof model.Component ) {
            regionId = pRegion.id;
            header.component = pRegion;
        } else {
            header.title       = msg( "NO_REGION" );
            header.hasWarnings = true;
        }

        // Always add a region filter if we are performing a property search. Note: It "filter" could also be a function
        for ( i = 0; i < pComponents.length; i++ ) {
            if ( pComponents[ i ].filter.properties ) {
                pComponents[ i ].filter.properties.push({
                    id:    model.PROP.REGION,
                    value: regionId
                })
            }
        }

        addComponents( out, {
            header:    header,
            component: pComponents
        });

    }


    function addBranches( out, pDomId, pPoints, pDefaultCreatePoint ) {

        addPointComponents( out, {
            domId:              pDomId,
            componentTypeId:    model.COMP_TYPE.BRANCH,
            pointPropertyId:    model.PROP.BRANCH_POINT,
            defaultCreatePoint: pDefaultCreatePoint,
            points:             pPoints,
            display: {
                seq:  model.PROP.EXECUTION_SEQUENCE,
                icon: "icon-tree-branch",
                name: model.PROP.NAME,
                type: model.PROP.BRANCH_TYPE
            }
        });
    }


    function addValidations( out, pDomId ) {

        var options = {
            domId:           pDomId,
            componentTypeId: model.COMP_TYPE.VALIDATION,
            display: {
                seq:  model.PROP.EXECUTION_SEQUENCE,
                icon: "icon-tree-validation",
                name: model.PROP.NAME,
                type: [ model.PROP.VALIDATION_TYPE, model.PROP.REGION_VALIDATION_TYPE ]
            }
        };

        function render( out ){
            addComponents( out, {
                header:    false,
                component: {
                    typeId:  options.componentTypeId,
                    display: options.display
                }
            });
        }

        addGroup( out, {
            domId:           options.domId,
            componentTypeId: options.componentTypeId
        });
        render( out );
        addCloseGroup( out );
        registerObserver( options, render );
    }


    function addComputations( out, pDomId, pPoints, pDefaultCreatePoint ) {

        addPointComponents( out, {
            domId:              pDomId,
            componentTypeId:    model.COMP_TYPE.PAGE_COMPUTATION,
            pointPropertyId:    model.PROP.COMPUTATION_POINT,
            defaultCreatePoint: pDefaultCreatePoint,
            points:             pPoints,
            display: {
                seq:  model.PROP.EXECUTION_SEQUENCE,
                icon: "icon-tree-computation",
                name: model.PROP.COMPUTATION_ITEM_NAME,
                type: model.PROP.COMPUTATION_TYPE
            }
        });
    }


    function addProcesses( out, pDomId, pPoints, pDefaultCreatePoint ) {

        addPointComponents( out, {
            domId:              pDomId,
            componentTypeId:    model.COMP_TYPE.PAGE_PROCESS,
            pointPropertyId:    model.PROP.PROCESS_POINT,
            defaultCreatePoint: pDefaultCreatePoint,
            points:             pPoints,
            display: {
                seq:  model.PROP.EXECUTION_SEQUENCE,
                icon: "icon-tree-process",
                name: model.PROP.NAME,
                type: model.PROP.PAGE_PROCESS_TYPE
            }
        });
    }


    function addDynamicActions( out, pDomId ) {

        var options = {
            domId:           pDomId,
            componentTypeId: model.COMP_TYPE.DA_EVENT,
            display: {
                seq:        model.PROP.EXECUTION_SEQUENCE,
                icon:       "icon-tree-da-event",
                name:       model.PROP.NAME,
                additional: function() {

                    var i,
                        whenProperty;

                    for ( i = 0; i < WHEN_PROPS.length; i++ ) {
                        whenProperty = this.getProperty( WHEN_PROPS[ i ] );
                        if ( whenProperty ) {
                            return whenProperty.getDisplayValue();
                        }
                    }
                    return "";
                },
                type:  model.PROP.EVENT
            }
        };

        function render( out ){
            addComponents( out, {
                header:    false,
                component: {
                    typeId:  options.componentTypeId,
                    display: options.display
                }
            });
        }

        addGroup( out, {
            domId:           options.domId,
            componentTypeId: options.componentTypeId
        });
        render( out );
        addCloseGroup( out );

        options.addProperties = WHEN_PROPS;
        registerObserver( options, render );
    }


    function addRegionsForPoint( out, pFilter, pIndent ) {

        function addSubRegions( out, pRegion ) {

            addRegionsForPoint( out, { region: pRegion }, pIndent + 1 );
        }

        var filter = {},
            header = {};

        if ( pFilter.hasOwnProperty( "region" )) {

            header = false;

            filter.properties = [{
                id:    model.PROP.PARENT_REGION,
                value: pFilter.region.id
            }];

        } else if ( pFilter.hasOwnProperty( "point" )) {

            header.title = pFilter.point.name;

            filter.properties = [];
            filter.properties.push({
                id:    model.PROP.PARENT_REGION,
                value: ""
            });
            filter.properties.push({
                id:    model.PROP.REGION_POSITION,
                value: pFilter.point.id
            });
        } else if ( pFilter.hasOwnProperty( "validPointsMap" )) {

            header.title       = msg( "INVALID_POSITION" );
            header.hasWarnings = true;

            // Find all regions which reference a non-existing region display point
            filter.filterFunction = function() {

                var regionPosition = this.getProperty( model.PROP.REGION_POSITION );

                if ( regionPosition ) {
                    return ( !pFilter.validPointsMap.hasOwnProperty( regionPosition.getValue()) );
                } else {
                    return false;
                }
            };

        }

        addComponents( out, {
            header:    header,
            component: {
                typeId:           model.COMP_TYPE.REGION,
                filter:           filter,
                addSubComponents: addSubRegions,
                display: {
                    seq:    model.PROP.DISPLAY_SEQUENCE,
                    icon:   "region",
                    name:   model.PROP.TITLE,
                    type:   model.PROP.REGION_TYPE,
                    indent: pIndent
                }
            },
            noComponentGrouping: ( pIndent > 0 )
        });

    }


    function addPageItemForRegion( out, pRegion ) {

        addRegionComponents( out, pRegion, [
            {
                typeId: model.COMP_TYPE.PAGE_ITEM,
                filter: {
                    properties: []
                },
                display: {
                    seq:        model.PROP.DISPLAY_SEQUENCE,
                    icon:       "item",
                    name:       model.PROP.ITEM_NAME,
                    additional: function(){
                        var labelProp = this.getProperty( model.PROP.ITEM_LABEL );

                        if ( labelProp ) {
                            return labelProp.getDisplayValue();
                        } else {
                            return "";
                        }
                    },
                    type: model.PROP.ITEM_TYPE
                }
            }, {
                typeId: model.COMP_TYPE.BUTTON,
                filter: {
                    properties: [{
                        id:    model.PROP.BUTTON_POSITION,
                        value: "BODY"
                    }]
                },
                display: {
                    seq:  model.PROP.DISPLAY_SEQUENCE,
                    icon: "button",
                    name: model.PROP.BUTTON_LABEL,
                    type: model.PROP.BUTTON_ACTION
                }
            }]
        );
    }


    function addRegionButtonsForRegion( out, pRegion ) {

        var REGION_ID = ( pRegion instanceof model.Component ) ? pRegion.id : "";

        addRegionComponents( out, pRegion, [
            {
                typeId: model.COMP_TYPE.BUTTON,
                filter: {
                    filterFunction: function() {
                        return (  this.getProperty( model.PROP.REGION ).getValue() === REGION_ID
                               && this.getProperty( model.PROP.BUTTON_POSITION ).getValue() !== "BODY" // don't show buttons displayed next to items
                               );
                    }
                },
                display: {
                    seq:  model.PROP.DISPLAY_SEQUENCE,
                    icon: "button",
                    name: model.PROP.BUTTON_LABEL,
                    type: model.PROP.BUTTON_ACTION
                }
            }]
        );
    }


    function addRegions( out, pDomId ) {

        function render( out ) {
            var pageTemplate,
                i;

            pageTemplate = model.getPageTemplate();

            // Emit "Invalid Region Position"
            addRegionsForPoint( out, { validPointsMap: pageTemplate.displayPointsMap }, 0 );

            // Emit valid display points
            for ( i = 0; i < pageTemplate.displayPoints.length; i++ ) {
                addRegionsForPoint( out, { point: pageTemplate.displayPoints[ i ]}, 0 );
            }
        }

        addGroup( out, {
            domId:           pDomId,
            componentTypeId: model.COMP_TYPE.REGION
        });
        render( out );
        addCloseGroup( out );

        registerObserver( {
            domId: pDomId,
            components: [
                { typeId: model.COMP_TYPE.REGION },
                { typeId: model.COMP_TYPE.PAGE }],
            display: {
                seq:   model.PROP.DISPLAY_SEQUENCE,
                name:  model.PROP.TITLE,
                type:  model.PROP.REGION_TYPE
            },
            addProperties: [
                model.PROP.PARENT_REGION,
                model.PROP.REGION_POSITION,
                // Refresh regions if the page/dialog template changes because that will cause different display positions
                model.PROP.PAGE_TEMPLATE,
                model.PROP.DIALOG_TEMPLATE
            ]
        }, render );
    }


    function addPageItems( out, pDomId ) {

        function render( out ) {

            // Get all regions and render items for those regions
            var regions = model.getComponents( model.COMP_TYPE.REGION, {} ),
                i;

            // Emit "Page Items which are not assigned to a region"
            addPageItemForRegion( out, null );

            // Emit associated page items for each region
            for ( i = 0; i < regions.length; i++ ) {
                addPageItemForRegion( out, regions[ i ]);
            }


        }

        addGroup( out, {
            domId:           pDomId,
            componentTypeId: model.COMP_TYPE.PAGE_ITEM
        });
        render( out );
        addCloseGroup( out );

        // We have to listen for changes of rename name, page items and buttons next to items
        registerObserver( {
            domId:      pDomId,
            components: [
                { typeId: model.COMP_TYPE.REGION },
                { typeId: model.COMP_TYPE.PAGE_ITEM },
                { typeId: model.COMP_TYPE.BUTTON }],
            display: {},
            addProperties: [
                model.PROP.DISPLAY_SEQUENCE,
                model.PROP.ITEM_NAME,
                model.PROP.ITEM_LABEL,
                model.PROP.ITEM_TYPE,
                model.PROP.BUTTON_LABEL,
                model.PROP.BUTTON_ACTION,
                model.PROP.BUTTON_TARGET,
                model.PROP.REGION,
                model.PROP.TITLE ]
        }, render );
    }


    function addRegionButtons( out, pDomId ) {

        function render( out ) {

            // Get all regions and render region buttons those regions
            var regions = model.getComponents( model.COMP_TYPE.REGION, {} ),
                i;

            // Emit all region buttons which are not associated with a region
            addRegionButtonsForRegion( out, null );

            // Emit associated buttons for each region
            for ( i = 0; i < regions.length; i++ ) {
                addRegionButtonsForRegion( out, regions[ i ]);
            }

        }

        addGroup( out, {
            domId:           pDomId,
            componentTypeId: model.COMP_TYPE.BUTTON
        });
        render( out );
        addCloseGroup( out );

        // We have to listen for changes of rename region name and region buttons
        registerObserver( {
            domId:      pDomId,
            components: [
                { typeId: model.COMP_TYPE.REGION },
                { typeId: model.COMP_TYPE.BUTTON }],
            display:    {},
            addProperties: [
                model.PROP.DISPLAY_SEQUENCE,
                model.PROP.BUTTON_LABEL,
                model.PROP.BUTTON_ACTION,
                model.PROP.BUTTON_TARGET,
                model.PROP.REGION,
                model.PROP.TITLE ]
        }, render );
    }


    function createComponent() {

        var a$ = $( this ),
            url = a$.data( "url" ),
            typeId = a$.data( "componenttypeid" ) + "",
            propertyId = a$.data( "propertyid" ),
            propertyValue = a$.data( "propertyvalue" ),
            values = [],
            message,
            transaction,
            newComponent;

        // Shared Component Create buttons do use an external link to create a new component
        if ( url ) {
            goToUrl( url );
        } else {
            // Do we have a default property we have to set?
            if ( propertyId ) {
                values.push({
                    id:    propertyId,
                    value: propertyValue
                })
            }

            // Create a new Component in the model
            message = model.transaction.message( {
                action:    model.MESSAGE_ACTION.CREATE,
                component: typeId
            });

            transaction = model.transaction.start( "", message );

            newComponent = new model.Component({
                previousComponent: "last",
                typeId: typeId,
                values: values
            });

            apex.commandHistory.execute( transaction );

            // Select the newly created component
            window.pageDesigner.goToComponent( newComponent.typeId, newComponent.id );
        }
    }

    function goToComponent() {

        var element$ = $( this ).closest( "[data-componentid]"),
            component = model.getComponents( element$.data( "componenttypeid" ), { id: element$.data( "componentid" )})[ 0 ];

        window.pageDesigner.goToComponent( component.typeId, component.id, element$.data( "propertyid" ));
    }


    function goToUrl( pUrl, pPkValue ) {

        apex.navigation.redirect(
            pUrl.replace( /\\u002525/g,        '%' )
                .replace( /%25/g,              '%' )
                .replace( /%session%/g,        $v( "pInstance" ))
                .replace( /%pk_value%/g,       pPkValue )
                .replace( /%application_id%/g, model.getCurrentAppId() )
                .replace( /%page_id%/g,        model.getCurrentPageId() )
        );
    }


    function finalizeInit( pContainer$, out ) {

        pContainer$
            .empty()
            .append( out.toString() )
            .on( "click", "a.create", createComponent )
            .on( "click", "a.edit", goToComponent );
    }


    function initRendering( pContainer$ ) {

        var out = util.htmlBuilder();

        addRegions( out, "cvRenderingRegions" );
        addRegionButtons( out, "cvRenderingRegionButtons" );
        addPageItems( out, "cvRenderingPageItems" );

        if ( !model.isGlobalPage() ) {
            addComputations( out, "cvRenderingComputations", [ "ON_NEW_INSTANCE", "BEFORE_HEADER", "AFTER_HEADER", "BEFORE_BOX_BODY", "AFTER_BOX_BODY", "BEFORE_FOOTER", "AFTER_FOOTER" ], "AFTER_HEADER" );
            addProcesses( out, "cvRenderingProcesses", [ "ON_NEW_INSTANCE", "BEFORE_HEADER", "AFTER_HEADER", "BEFORE_BOX_BODY", "AFTER_BOX_BODY", "BEFORE_FOOTER", "AFTER_FOOTER" ], "AFTER_HEADER" );
            addDynamicActions( out, "cvRenderingDynamicActions" );
        }

        finalizeInit( pContainer$, out );
    }


    function initProcessing( pContainer$ ) {

        var out = util.htmlBuilder();

        // Don't show processing for global page
        if ( !model.isGlobalPage() ) {
            addComputations( out, "cvProcessingComputations", [ "AFTER_SUBMIT" ], "AFTER_SUBMIT" );
            addValidations( out, "cvProcessingValidations" );
            addProcesses( out, "cvProcessingProcesses", [ "ON_SUBMIT_BEFORE_COMPUTATION", "AFTER_SUBMIT", "ON_DEMAND" ], "AFTER_SUBMIT" );
            addBranches( out, "cvProcessingBranches", [ "BEFORE_COMPUTATION", "BEFORE_VALIDATION", "BEFORE_PROCESSING", "AFTER_PROCESSING" ], "AFTER_PROCESSING" );
        }

        finalizeInit( pContainer$, out );
    }


    function destroy( pContainer$ ) {

        pContainer$
            .empty()
            .off( "click", "a.create" )
            .off( "click", "a.edit" );

    }

    $( function(){

        var componentView$ = $( "#componentView-container" ),
            rendering$     = $( "#PDrenderingCV" ),
            processing$    = $( "#PDprocessingCV" );

        // Load the component view as soon as the model has loaded the data
        $( document ).on( "modelReady", function() {

            initRendering( rendering$ );
            initProcessing( processing$ );

            // Register an event handler to set highlight components if other widgets on the page select components
            $( document ).on( "selectionChanged." + WIDGET, function( pEvent, pWidget, pComponents ) {

                if ( pWidget !== WIDGET ) {
                    debug.trace( "%s: selectionChanged event received from %s", WIDGET, pWidget, pComponents );

                    // deselect all existing components
                    componentView$.find( "li.a-CV-component." + CSS.IS_SELECTED ).removeClass( CSS.IS_SELECTED );

                    // mark the provided components as selected
                    gSelectedComponents = pComponents;
                    selectComponents( componentView$ );
                }
            });

            // Clear regions if the model gets cleared
            $( document ).one( "modelCleared", function() {

                model.unobserver( WIDGET, {} );
                $( document ).off( "selectionChanged." + WIDGET );
                gSelectedComponents = [];

                destroy( rendering$ );
                destroy( processing$ );
            });
        });
    });

})( pe, window.pageDesigner, apex.util, apex.debug, apex.lang, apex.jQuery );