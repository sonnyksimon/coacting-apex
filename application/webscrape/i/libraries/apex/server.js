/*global apex,$v,$v2,$x,require,requirejs,define,flowSelectArray*/
/*
 * Oracle Application Express, Release 18.2
 * Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/**
 * The apex.server namespace contains all Ajax functions to communicate with the Oracle Application Express server.
 * @namespace
 */
apex.server = {};

/**
 * <p>This event is triggered by a number of page or column items just before they are refreshed with new content or
 * data from the server. It is equivalent to the Dynamic Action event Before Refresh. Specifically any item that
 * supports the Cascading LOV Parent Item(s) attribute should trigger this event. This event can also be triggered
 * by the {@link apex.server.plugin} and {@link apex.server.process} APIs if the <code class="prettyprint">refreshObject</code> option is provided.
 * The event is triggered on the item element or the element given by the <code class="prettyprint">refreshObject</code>. The event handler receives
 * the data given in <code class="prettyprint">refreshObjectData</code> if any.</p>
 *
 * @event apexbeforerefresh
 * @memberof apex
 * @property {Event} event <code class="prettyprint">jQuery</code> event object.
 * @property {Object} [data] The <code class="prettyprint">refreshObjectData</code> if any.
 *
 * @example <caption>This example disables the button with static id B1 while any refresh is in progress.</caption>
 * apex.jQuery( "body" ).on( "apexbeforerefresh", function() {
 *     apex.jQuery( "#B1" ).prop( "disabled", true);
 * } ).on( "apexafterrefresh", function() {
 *     apex.jQuery( "#B1" ).prop( "disabled", false);
 * } );
 */

/**
 * <p>This event is triggered by a number of page or column items just after they are refreshed with new content or
 * data from the server. It is equivalent to the Dynamic Action event After Refresh. Specifically any item that
 * supports the Cascading LOV Parent Item(s) attribute should trigger this event. This event can also be triggered
 * by the {@link apex.server.plugin} and {@link apex.server.process} APIs if the <code class="prettyprint">refreshObject</code> option is provided.
 * The event is triggered on the item element or the element given by the <code class="prettyprint">refreshObject</code>. The event handler receives
 * the data given in <code class="prettyprint">refreshObjectData</code> if any.</p>
 *
 * @event apexafterrefresh
 * @memberof apex
 * @property {Event} event <code class="prettyprint">jQuery</code> event object.
 * @property {Object} [data] The <code class="prettyprint">refreshObjectData</code> if any.
 *
 * @example <caption>This example disables the button with static id B1 while any refresh is in progress.</caption>
 * apex.jQuery( "body" ).on( "apexbeforerefresh", function() {
 *     apex.jQuery( "#B1" ).prop( "disabled", true);
 * } ).on( "apexafterrefresh", function() {
 *     apex.jQuery( "#B1" ).prop( "disabled", false);
 * } );
 */

/* required for AJAX calls to APEX engine */
apex.jQuery.ajaxSettings.traditional = true;

/* Always use browser cache if scripts are loaded via AJAX. (bug# 16177617)
   The default is false, but which causes that each JavaScript file which is embedded in a jQM page (for example our widget.jqmListview.js)
   gets loaded again if the page is requested by jQM via an AJAX call.
 */
apex.jQuery.ajaxPrefilter( "script", function( options ) {
    options.cache = true;
});

(function( server, $, util ) {
    "use strict";

/**
 * <p>This function calls the PL/SQL ajax function that has been defined for a plug-in. This function is a
 * wrapper around the jQuery.ajax function and supports a subset of the jQuery.ajax options plus additional
 * Oracle Application Express specific options.</p>
 *
 * <p>The plug-in PL/SQL Ajax function is identified using the value returned by the PL/SQL package
 * apex_plugin.get_ajax_identifier. There are two ways to provide the plug-in Ajax identifier:</p>
 * <ul>
 * <li>Provide the pAjaxIdentifier as the first argument</li>
 * <li>Provide information about the region(s) including the ajaxIdentifier in the
 *   pData object structure. See pData description for details.</li>
 * </ul>
 *
 * @function plugin
 * @memberof apex.server
 * @param {string} [pAjaxIdentifier] The plug-in Ajax identifier. If not given then pData must include a regions
 *                                   array that includes a region with property ajaxIdentifier.
 * @param {Object} [pData] Object containing data to send to the server in the ajax request.
 *     The object is serialized as JSON and sent to the server in parameter p_json.
 *     Data for specific regions can be sent in the following format:
 * <pre class="prettyprint"><code>{
 *     "regions": [ {
 *        "id": &lt;region-id-or-static-id>,
 *        "ajaxIdentifier": &lt;ajaxIdentifier>,
 *        &lt;any other data specific to the region plug-in>
 *     }, ...]
 * }
 * </code></pre>
 *     <p>The following properties are treated as special:</p>
 * @param { string | jQuery | Element | string[] } [pData.pageItems] Identifies the page or column items that will be
 *     included in the request. It can be a jQuery selector, jQuery object, Element, or an array of item names.
 *     These items will be made available in session state on the server. If pageItems contains column items then
 *     pOptions should include the target property, so that the region session state context can be determined.
 * @param { string } [pData.x01 - x20] These properties are moved out of the p_json object
 *     and sent as x01 - x20 scalar parameters.
 * @param { string | Array } [pData.f01 - f20] These properties are moved out of the p_json object
 *     and sent as f01 - f20 array parameters.
 *
 * @param {Object} [pOptions] <p>An object that is used to set additional options to control the Ajax call
 *     including before and after processing. See jQuery documentation of jQuery.ajax for these supported
 *     options: accepts, dataType, beforeSend, contents, converters, dataFilter, headers, complete, statusCode, error,
 *     success. The dataType option defaults to json. The async option is deprecated and will be removed in a
 *     future release. See {@link https://docs.jquery.com/}</p>
 *     <p>The following Oracle Application Express specific options are supported:</p>
 * @param { jQuery | Element | string } [pOptions.refreshObject] A jQuery selector string, jQuery object, or Element
 *     that identifies the DOM element that the {@link apex.event:apexbeforerefresh} and {@link apex.event:apexafterrefresh}
 *     events are triggered on. If this option is not supplied these events are not triggered.
 * @param { Object | Array} [pOptions.refreshObjectData] Only applies if the refreshObject option is given.
 *     Specifies extra data that is passed in the {@link apex.event:apexbeforerefresh}
 *     and {@link apex.event:apexafterrefresh} events so that any handlers
 *     defined for these events can access this data. In Dynamic Actions defined for the Before Refresh or
 *     After Refresh events, this can be accessed from JavaScript using the <code class="prettyprint">this.data</code> property.
 *     For custom jQuery event handlers, this can be accessed through the <code class="prettyprint">pData</code> parameter of the event handler.
 * @param {function} [pOptions.clear] A no argument function that is called after the
 *     {@link apex.event:apexbeforerefresh} event has fired and before the actual Ajax call is made.
 *     This function can be used to clear the DOM or any other state maintained
 *     by the Element or component for which this Ajax request is being made.
 * @param { string | jQuery | Element | function } [pOptions.loadingIndicator] Identifies the element(s) that will
 *     have a loading indicator (progress spinner) displayed next to it during the Ajax call. The element can be
 *     specified with a jQuery selector, jQuery object or Element. The loadingIndicator can also be a function that
 *     receives the loading indicator as a jQuery object, which it can use as is or modify or replace and attach to the
 *     DOM where appropriate. The function must return a reference to the jQuery loading indicator. For example:
 *     <pre class="prettyprint"><code>function( pLoadingIndicator ) {
 *     return pLoadingIndicator.prependTo(
 *         apex.jQuery( "td.shuttleControl", gShuttle) );
 * }
 * </code></pre>
 * @param {string} [pOptions.loadingIndicatorPosition] One of the following six options to define the position of the
 *     loading indicator displayed. Only considered if the value passed to loadingIndicator is not a function.
 *     <ul>
 *     <li>before: Displays before the DOM element(s) defined by loadingIndicator.</li>
 *     <li>after: Displays after the DOM element(s) defined by loadingIndicator.</li>
 *     <li>prepend: Displays inside at the beginning of the DOM element(s) defined by loadingIndicator.</li>
 *     <li>append: Displays inside at the end of the DOM element(s) defined by loadingIndicator.</li>
 *     <li>centered: Displays in the center of the DOM element defined by loadingIndicator.</li>
 *     <li>page: Displays in the center of the page.</li>
 *     </ul>
 *@param {Object} [pOptions.queue] An object specifying the name of a queue and queue action. For example:
 * <pre class="prettyprint"><code>{
 *     name: "updateList",
 *     action: "replace"
 * }
 * </code></pre>
 *     <p>If no queue option is given, the request is made right away without regard to any previous requests.</p>
 *     <p>The name property specifies the name of the queue to add this request to.</p>
 *     <p>The action property can be one of "wait" (the default), "replace", "lazyWrite".</p>
 *     <ul>
 *     <li>wait: This action is the default and is used to send requests one after the other.
 *     When the action is wait, the request is added to the named queue. If there are no other requests in that
 *     queue, in progress or waiting, then this request is executed. Otherwise it waits on the named queue until
 *     the ones before it are complete.</li>
 *     <li>replace: This action is used when this current request makes any previous requests on the named queue,
 *     in progress or waiting, obsolete or invalid. This current request aborts any in progress request and clears
 *     out any waiting requests on the named queue and then is executed.
 *     Waiting requests are rejected with status "superseded".</li>
 *     <li>lazyWrite: This action is used to throttle requests to the server to persist data. This should only be used
 *     to persist non-critical data such as user interface settings or state. Use when the data may change
 *     frequently and only the last data values need to be saved. For example this is useful for persisting
 *     splitter position, or tree expansion and focus state etc. The queue name is unique for each data unit.
 *     For example if you were saving the position of two different splitters use a unique name for each one so that
 *     latest update to one doesn't overwrite a previous lazy write of the other. When using lazyWrite Queue the
 *     refreshObject, clear, loadingIndicator, and loadingIndicatorPosition are most likely not useful because
 *     nothing is being loaded or refreshed.</li>
 *     </ul>
 *     <p>It is possible to mix requests with wait and replace actions on the same queue. The lazyWrite action
 *     should not be used with a queue name that is also used with wait and replace actions.</p>
 * @param { jQuery | Element } [pOptions.target] The target element (DOM element or jQuery Selector) that this request pertains to.
 *     This is used to get session state context from the enclosing region. This option must be provided if pageItems
 *     property of pData contains any column items.
 *
 * @return {Promise} A promise object. The promise done method is called if the Ajax request completes successfully.
 *     This is called in the same cases as the success callback function in pOptions.
 *     The promise fail method is called if the Ajax request completes with an error including internally detected
 *     Oracle Application Express errors. This is called in the same cases as the error callback function in pOptions.
 *     The promise also has an always method that is called after done and error. The promise is returned
 *     even when queue options are used. The promise is not a jqXHR object but does have an abort method.
 *     The abort method does not work for requests that use any queue options.
 *
 * @example <caption>This example demonstrates a call to apex.server.plugin, sets the scalar value x01 to test
 *     (which can be accessed from PL/SQL using apex_application.g_x01) and sets the page item's P1_DEPTNO and P1_EMPNO
 *     values in session state (using jQuery selector syntax). The P1_MY_LIST item is used as the element for which
 *     the apexbeforerefresh and apexafterrefresh events are fired. P1_MY_LIST is used as the element for which to
 *     display the loading indicator next to. The success callback is stubbed out and is used for developers to add
 *     their own code that fires when the call successfully returns. The value for lAjaxIdentifier must be set to the
 *     value returned by the server PL/SQL API apex_plugin.get_ajax_identifier.</caption>
 * apex.server.plugin ( lAjaxIdentifier, {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 * }, {
 *     refreshObject: "#P1_MY_LIST",
 *     loadingIndicator: "#P1_MY_LIST",
 *     success: function( data ) {
 *         // do something here
 *     }
 * } );
 */
// todo need an example of using regions
server.plugin = function( pAjaxIdentifier, pData, pOptions ) {
    var request = null;

    if ( typeof pAjaxIdentifier === "string" ) {
        request = "PLUGIN=" + pAjaxIdentifier;
    } else {
        // shift the arguments
        pOptions = pData;
        pData = pAjaxIdentifier;
    }
    return callOrQueue( request, pData, pOptions );

}; // plugin

/**
 * <p>Returns the URL to issue a GET request to the PL/SQL Ajax function which has been defined for a plug-in.</p>
 *
 * @function pluginUrl
 * @memberof apex.server
 * @param {string} pAjaxIdentifier Use the value returned by the PL/SQL package apex_plugin.get_ajax_identifier to identify your plug-in.
 * @param {Object} [pData] Optional object that is used to set additional values which are included into the URL.
 *     The special property, pageItems, which can be of type jQuery selector, jQuery or DOM object or array of item
 *     names, identifies the page items which are included in the URL. You can also set additional parameters that
 *     the apex.show procedure provides (for example you can set the scalar parameters x01 - x10 and the
 *     arrays f01 - f20).
 * @return {string} The URL to issue a GET request.
 *
 * @example <caption>This example returns a URL to issue a GET request to the PL/SQL Ajax function which has been
 *     defined for a plug-in, where the URL sets the scalar value x01 to test (which can be accessed from PL/SQL
 *     using apex_application.g_x01) and will also set the page item's P1_DEPTNO and P1_EMPNO values in session
 *     state (using jQuery selector syntax). The value for lAjaxIdentifier must be set to the value returned
 *     by the server PL/SQL API apex_plugin.get_ajax_identifier.</caption>
 *
 * var lUrl = apex.server.pluginUrl ( lAjaxIdentifier, {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 * } );
 */
server.pluginUrl = function( pAjaxIdentifier, pData ) {

    return server.url( $.extend({}, pData, { p_request: "PLUGIN=" + pAjaxIdentifier }));

}; // pluginUrl


/**
 * <p>Returns the URL to issue a GET request to the wwv_flow.ajax function.<p>
 * <p>TODO this function and apex.server.url are under consideration for being merged in some way.</p>
 *
 * @ignore
 * @function ajaxUrl
 * @memberof apex.server
 * @param {Object} [pData]  Object which is being passed as the p_json parameter
 *                          The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                          identifies the page items which should be included in the URL. But you can also set additional
 *                          parameters that wwv_flow.ajax procedure provides. For example you can set the scalar parameters
 *                          p_request, x01 - x10 and the arrays f01 - f20
 * @param {Object} [pOptions] todo
 * @return {string} The URL to issue a GET request.
 *
 * @example <caption>todo</caption>
 * apex.server.ajaxUrl ({
 *     p_request: "DELETE",
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO" } );
 *
 */
server.ajaxUrl = function( pData, pOptions ) {
    var i, lUrl, lParameterName, lParamLC, lRegion, lValue, lJSON;

    function normalizeLineEndings( pValue ) {
        return ( typeof pValue === "string" ? pValue.replace( rCRLF, "\r\n" ) : pValue );
    }

    function addToUrl( pParameterName, pChunks ) {
        var i;

        if ( !$.isArray( pChunks ) ) {
            lUrl = lUrl + "&" + pParameterName + "=" + encodeURIComponent( pChunks );
        } else {
            for ( i = 0; i < pChunks.length; i++ ) {
                lUrl = lUrl + "&" + pParameterName + "=" + encodeURIComponent( pChunks[ i ] );
            }
        }
    }

    lUrl = "wwv_flow.ajax" +
           "?p_flow_id="      + $v( "pFlowId" ) +
           "&p_flow_step_id=" + $v( "pFlowStepId" ) +
           "&p_instance="     + $v( "pInstance" ) +
           "&p_debug="        + $v( "pdebug" );

    if ( !pOptions ) {
        pOptions = {};
    }

    // Most of the input pData gets serialized as JSON into the p_json parameter but a few things need to be moved
    // into the traditional parameters.
    // Specifically move x01 - x20, f01-f50, fcs, fmap, fhdr, fcud, frowid, p_trace, p_widget_name
    // copy pData so it doesn't get modified
    lJSON = {};
    for ( lParameterName in pData ) {
        if ( pData.hasOwnProperty( lParameterName ) ) {
            lParamLC = lParameterName.toLowerCase();
            lValue = pData[lParameterName];
            if ( !isValidPageItemName( lParamLC ) ) {
                if ( !$.isArray( lValue ) ) {
                    addToUrl( lParameterName, chunk( normalizeLineEndings( lValue + "" ) ) );
                } else {
                    for ( i = 0; i < pData[ lParameterName ].length; i++ ) {
                        addToUrl( lParameterName, chunk( normalizeLineEndings( lValue[i] + "" ) ) );
                    }
                }
            } else {
                if ( lValue !== null && typeof lValue === "object" ) {
                    lJSON[lParameterName] = $.extend( true, $.isArray( lValue ) ? [] : {}, lValue );
                } else {
                    lJSON[lParameterName] = lValue;
                }
            }
        }
    }

    // When there is a target option it is used to get context information from a region including
    // any column items that may be included in pageItems.
    if ( pOptions.target ) {
        lRegion = apex.region.findClosest( pOptions.target );
        if ( lRegion ) {
            addRegionSessionState( lRegion, lJSON );
        }
    }
    addPageItemsToRequest( lJSON.pageItems, lJSON );

    addToUrl( "p_json", chunk( normalizeLineEndings( JSON.stringify( lJSON ) ) ) );

    return lUrl;
};

/**
 * <p>This function returns a URL to issue a GET request to the current page or page specified in pPage.</p>
 *
 * @function url
 * @memberof apex.server
 * @param {Object} [pData] Optional object that is used to set additional values which are included into the URL.
 *     The special property, pageItems, which can be of type jQuery selector, jQuery or DOM object or array of item
 *     names, identifies the page items which are included in the URL. You can also set additional parameters that
 *     the apex.show procedure provides (for example you can set the scalar parameters x01 - x10 and the
 *     arrays f01 - f20).
 * @param {string} [pPage] The ID of the page to issue a GET request for. The default is the current page.
 * @return {string} The URL to issue a GET request.
 *
 * @example <caption>This example gets a URL to issue a GET request to the DELETE function which has been defined
 *     for this page, where the URL sets the scalar value x01 to test (which can be accessed from PL/SQL using
 *     apex_application.g_x01) and will also set the page item's P1_DEPTNO and P1_EMPNO values in session
 *     state (using jQuery selector syntax).</caption>
 * apex.server.url( {
 *     p_request: "DELETE",
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 * } );
 */
server.url = function( pData, pPage ) {
    var i, lKey, lUrl, lItem,
        lPage = pPage;

    if ( lPage === null || lPage === undefined ) {
        lPage = $v( "pFlowStepId" );
    }

    lUrl = "wwv_flow.show" +
        "?p_flow_id="      + $v( "pFlowId" ) +
        "&p_flow_step_id=" + lPage +
        "&p_instance="     + $v( "pInstance" ) +
        "&p_debug="        + $v( "pdebug" );

    // add all data parameters to the URL
    for ( lKey in pData ) {
        if ( pData.hasOwnProperty( lKey )) {
            // the pageItems is a special parameter and will actually store all the specified page items in p_arg_names/values
            if ( lKey === "pageItems" ) {

                if ( $.isArray( pData.pageItems )) {
                    for ( i = 0; i < pData.pageItems.length; i++ ) {
                        lItem = $x( pData.pageItems[i] );
                        if ( lItem ) {
                            lUrl = lUrl +
                                '&p_arg_names='  + encodeURIComponent( lItem.id ) +
                                '&p_arg_values=' + encodeURIComponent( $v( lItem ));
                        }
                    }
                } else {
                    $( pData.pageItems, apex.gPageContext$ ).each( function() {
                        lUrl = lUrl +
                            '&p_arg_names='  + encodeURIComponent( this.id ) +
                            '&p_arg_values=' + encodeURIComponent( $v( this ));
                    });
                }

            } else {
                lUrl = lUrl + '&' + lKey + '=' + encodeURIComponent( pData[lKey] );
            }
        }
    }

    return lUrl;
}; // url


/**
 * <p>This function calls a PL/SQL on-demand (Ajax callback) process defined on page or application level.
 * This function is a wrapper around the jQuery.ajax function and supports a subset of the jQuery.ajax options
 * plus additional Oracle Application Express specific options.</p>
 *
 * @function process
 * @memberof apex.server
 * @param {string} pName The name of the PL/SQL on-demand page or application process to call.
 * @param {Object} [pData] Object containing data to send to the server in the ajax request.
 *     The Object is serialized as JSON and sent to the server in parameter p_json.
 *     Data for specific regions can be sent in the following format:
 * <pre class="prettyprint"><code>{
 *     "regions": [ {
 *        "id": &lt;region-id-or-static-id>,
 *        &lt;any other data specific to the region plug-in>
 *     }, ...]
 * }
 * </code></pre>
 *     <p>The following properties are treated special:</p>
 * @param { string | jQuery | Element | string[] } [pData.pageItems] Identifies the page or column items that will be
 *     included in the request. It can be a jQuery selector, jQuery object, Element, or array of item names.
 *     These items will be made available in session state on the server. If pageItems contains column items then
 *     pOptions should include the target property so that the region session state context can be determined.
 * @param { string } [pData.x01 - x20] These properties are moved out of the p_json object
 *     and sent as x01 - x20 scalar parameters.
 * @param { string | Array } [pData.f01 - f20] These properties are moved out of the p_json object
 *     and sent as f01 - f20 array parameters.
 *
 * @param {Object} [pOptions] <p>An object that is used to set additional options to control the Ajax call
 *     including before and after processing. See jQuery documentation of jQuery.ajax for these supported
 *     options: accepts, dataType, beforeSend, contents, converters, dataFilter, headers, complete, statusCode, error,
 *     success. The dataType option defaults to json. The async option is deprecated and will be removed in a
 *     future release. See {@link https://docs.jquery.com/}</p>
 *     <p>The following Oracle Application Express specific options are supported:</p>
 * @param { jQuery | Element | string } [pOptions.refreshObject] A jQuery selector string, jQuery object, or Element
 *     that identifies the DOM element that the {@link apex.event:apexbeforerefresh} and {@link apex.event:apexafterrefresh}
 *     events are triggered on. If this option is not supplied these events are not triggered.
 * @param { Object | Array} [pOptions.refreshObjectData] Only applies if the refreshObject option is given.
 *     Specifies extra data that is passed in the {@link apex.event:apexbeforerefresh}
 *     and {@link apex.event:apexafterrefresh} events so that any handlers
 *     defined for these events can access this data. In Dynamic Actions defined for the Before Refresh or
 *     After Refresh events, this can be accessed from JavaScript using the <code class="prettyprint">this.data</code> property.
 *     For custom jQuery event handlers, this can be accessed through the <code class="prettyprint">pData</code> parameter of the event handler.
 * @param {function} [pOptions.clear] A no argument function that is called after the
 *     {@link apex.event:apexbeforerefresh} event has fired and before the actual Ajax call is made.
 *     This function can be used to clear the DOM or any other state maintained
 *     by the Element or component for which this Ajax request is being made.
 * @param { string | jQuery | Element | function } [pOptions.loadingIndicator] Identifies the element(s) that will
 *     have a loading indicator (progress spinner) displayed next to it during the Ajax call. The element can be
 *     specified with a jQuery selector, jQuery object or Element. The loadingIndicator can also be a function that
 *     receives the loading indicator as a jQuery object, which it can use as is or modify or replace and attach to the
 *     DOM where appropriate. The function must return a reference to the jQuery loading indicator. For example:
 *     <pre class="prettyprint"><code>function( pLoadingIndicator ) {
 *     return pLoadingIndicator.prependTo(
 *         apex.jQuery( "td.shuttleControl", gShuttle) );
 * }
 * </code></pre>
 * @param {string} [pOptions.loadingIndicatorPosition] One of the following six options to define the position of the
 *     loading indicator displayed. Only considered if the value passed to loadingIndicator is not a function.
 *     <ul>
 *     <li>before: Displays before the DOM element(s) defined by loadingIndicator.</li>
 *     <li>after: Displays after the DOM element(s) defined by loadingIndicator.</li>
 *     <li>prepend: Displays inside at the beginning of the DOM element(s) defined by loadingIndicator.</li>
 *     <li>append: Displays inside at the end of the DOM element(s) defined by loadingIndicator.</li>
 *     <li>centered: Displays in the center of the DOM element defined by loadingIndicator.</li>
 *     <li>page: Displays in the center of the page.</li>
 *     </ul>
 *@param {Object} [pOptions.queue] An object specifying the name of a queue and queue action. For example:
 * <pre class="prettyprint"><code>{
 *     name: "updateList",
 *     action: "replace"
 * }
 * </code></pre>
 *     <p>If no queue option is given, the request is made right away without regard to any previous requests.</p>
 *     <p>The name property specifies the name of the queue to add this request to.</p>
 *     <p>The action property can be one of "wait" (the default), "replace", "lazyWrite".</p>
 *     <ul>
 *     <li>wait: This action is the default and is used to send requests one after the other.
 *     When the action is wait, the request is added to the named queue. If there are no other requests in that
 *     queue in progress or waiting, then this request is executed. Otherwise it waits on the named queue until
 *     the ones before it are complete.</li>
 *     <li>replace: This action is used when this current request makes any previous requests on the named queue
 *     in progress or waiting obsolete or invalid. This current request aborts any in progress request and clears
 *     out any waiting requests on the named queue and then is executed.
 *     Waiting requests are rejected with status "superseded".</li>
 *     <li>lazyWrite: This action is used to throttle requests to the server to persist data. This should only be used
 *     to persist non-critical data such as user interface settings or state. Use when the data may change
 *     frequently and only the last data values need to be saved. For example this is useful for persisting
 *     splitter position, or tree expansion and focus state etc. The queue name is unique for each data unit.
 *     For example if you were saving the position of two different splitters use a unique name for each one so that
 *     latest update to one doesn't overwrite a previous lazy write of the other. When using lazyWrite Queue the
 *     refreshObject, clear, loadingIndicator, and loadingIndicatorPosition are most likely not useful because
 *     nothing is being loaded or refreshed.</li>
 *     </ul>
 *     <p>It is possible to mix requests with wait and replace actions on the same queue. The lazyWrite action
 *     should not be used with a queue name that is also used with wait and replace actions.</p>
 * @param { jQuery | Element } [pOptions.target] The target element (DOM element or jQuery Selector) that this request pertains to.
 *     This is used to get session state context from the enclosing region. This option must be provided if pageItems
 *     property of pData contains any column items.
 *
 * @return {Promise} A promise object. The promise done method is called if the Ajax request completes successfully.
 *     This is called in the same cases as the success callback function in pOptions.
 *     The promise fail method is called if the Ajax request completes with an error including internally detected
 *     Oracle Application Express errors. This is called in the same cases as the error callback function in pOptions.
 *     The promise also has an always method that is called after done and error. The promise is returned
 *     even when queue options are used. The promise is not a jqXHR object but does have an abort method.
 *     The abort method does not work for requests that use any queue options.
 *
 * @example <caption>This example demonstrates an Ajax call to an on-demand process called MY_PROCESS and sets the
 *     scalar value x01 to test (which can be accessed from PL/SQL using apex_application.g_x01) and sets the page
 *     item's P1_DEPTNO and P1_EMPNO values in session state (using jQuery selector syntax). The success callback is
 *     stubbed out so that developers can add their own code that fires when the call successfully returns.
 *     The <code class="prettyprint">data</code> parameter to the success callback contains the response returned
 *     from on-demand process.</caption>
 * apex.server.process( "MY_PROCESS", {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 * }, {
 *     success: function( data )  {
 *         // do something here
 *     },
 *     error: function( jqXHR, textStatus, errorThrown ) {
 *         // handle error
 *     }
 * } );
 * @example <caption>This example is similar to the previous one except that the response is handled using the returned
 * promise and the page items are given as an array.</caption>
 * var result = apex.server.process( "MY_PROCESS", {
 *     x01: "test",
 *     pageItems: ["P1_DEPTNO","P1_EMPNO"]
 * } );
 * result.done( function( data ) {
 *     // do something here
 * } ).fail(function( jqXHR, textStatus, errorThrown ) {
 *     // handle error
 * } ).always( function() {
 *     // code that needs to run for both success and failure cases
 * } );
 */
server.process = function( pName, pData, pOptions ) {
    return callOrQueue( "APPLICATION_PROCESS=" + pName, pData, pOptions );
}; // process


function chunk( text ) {
    var MAX_SAFE_LEN = 8000; // Only 8000 instead of 32767, because of unicode multibyte characters
    var offset, chunkArray;

    if ( text.length > MAX_SAFE_LEN ) {
        chunkArray = [];
        offset = 0;
        while ( offset < text.length ) {
            chunkArray.push( text.substr( offset, MAX_SAFE_LEN ) );
            offset += MAX_SAFE_LEN;
        }
        return chunkArray;
    } // else
    return text;
}

/**
 * Given a text string, break it up in to an array of strings no greater than 8000 chars each if needed.
 * If the original text is less than 8000 chars, return it.
 *
 * @function chunk
 * @memberof apex.server
 * @param {string} Text string to split into an array of chunks no bigger than 8000 chars.
 * @return {string | string[]} The input text string, if less than 8000 chars, or an array of the split up input text.
 * @example <caption>This example gets around the 32k size limit by sending text from text area item P1_TEXTAREA as
 * the F01 array. A server process needs to loop over the apex_application.g_f01 array.</caption>
 * apex.gPageContext$.on( "apexpagesubmit", function() {
 *     var $ = apex.jQuery,
 *         form$ = $( "#wwvFlowForm" ),
 *         f1 = apex.server.chunk( $v( "P1_TEXT" ) );
 *
 *     if ( !$.isArray( f1 ) ) {
 *         f1 = [f1];
 *     }
 *     f1.forEach( function( v ) {
 *         form$.append( "<input type='hidden' name='f01' value='" + v + "'>" );
 *     });
 *     $s( "P1_TEXT", " " );
 * } );
 */
server.chunk = chunk;

/**
 * <p>Load JavaScript files asynchronously using RequireJS require or jQuery getScript.
 * It is rare that an APEX app needs to dynamically load JavaScript but if it does it should use this rather than
 * getScript.
 * The reason is that RequreJS may or may not be on a page. If it is and libraries that are RequireJS aware are loaded
 * they will give an error because they expect to be loaded by a call to require. If RequireJS is not on the page then
 * require cannot be used.</p>
 *
 * @function loadScript
 * @memberof apex.server
 * @param {Object} pOptions An object that contains the following attributes:
 * @param {string} pOptions.path The location of the JavaScript file to load.
 * @param {boolean} [pOptions.requirejs] Whether to use RequireJS to load this file. The default is false.
 * @param {string} [pOptions.global] The global name introduced by this file. The existing
 *     one is overwritten. Leave this option empty if the file is generated by RequireJS optimizer.
 * @param {function} [callback] A no argument function to be executed once script is loaded.
 * @return {*} If getScript is used then the return value is a jqXHR style promise. Otherwise there is no return value.
 *
 * @example <caption>The following example loads a regular library that does not need RequireJS.</caption>
 * apex.server.loadScript( {
 *    path: "./library_1.js"
 * }, function() {
 *    console.log( "library_1 is ready." );
 * } );
 *
 * @example <caption>The following example loads a library that requires RequireJS and creates its own
 *     namespace "myModule".</caption>
 * apex.server.loadScript( {
 *    path: "./library_2.js",
 *    requirejs: true,
 *    global: "myModule"
 * }, function() {
 *    console.log( "library 2 loaded ", myModule );
 * } );
 *
 * @example <caption>The following example loads a concatenated libraries file generated by RequireJS Optimizer,
 *     assuming requireJS is already on the page.</caption>
 * apex.server.loadScript( {
 *    path: "./library_all.js",
 *    requirejs: true
 * }, function() {
 *    console.log( myModule_1, myModule_2 ... );
 * } );
 */
server.loadScript = function ( pOptions, callback ) {
    var path,
        globalName,
        requireJSPath,
        pathsObj = {},
        fileName;

    if ( pOptions.requirejs && typeof define === "function" && define.amd ) {
        path = pOptions.path;
        globalName = pOptions.global;
        requireJSPath = path.substring(0, path.length - 3); // remove .js extension name
        fileName = requireJSPath.replace(/^.*[\\\/]/, '');

        if ( requirejs.s.contexts._.config.paths[fileName] ) {
            fileName = fileName + $.guid++; // Adding GUID as fileName from URL may not be unique
        }

        pathsObj[fileName] = requireJSPath;

        requirejs.config({
            paths: pathsObj
        });

        return require( [fileName], function ( file ) {
            if ( typeof globalName === 'string' ) {
                window[ globalName ] = file;
            }
            if ( typeof callback === "function" ) {
                callback();
            }
        });

    } else {
        return $.getScript( pOptions.path, callback );
    }
};

/* =================================================================
 * Private, Internal Only
 */

// register "Not page items" in order to not submit them in p_json
var gNotAPageItem = {
    p_flow_id: 1,
    p_flow_step_id: 1,
    p_instance: 1,
    p_debug: 1,
    p_trace: 1,
    p_page_submission_id: 1,
    p_request: 1,
    p_reload_on_submit: 1,
    fmap: 1,
    fhdr: 1,
    fcud: 1,
    fcs: 1,
    frowid: 1
};

for ( var i = 1; i <= 20; i++ ) {
    gNotAPageItem["x" + ( i < 10 ? "0" + i : i )] = 1;
}
for ( i = 1; i <= 50; i++ ) {
    gNotAPageItem["f" + ( i < 10 ? "0" + i : i )] = 1;
    gNotAPageItem["f" + ( i < 10 ? "0" + i : i ) + "_NOSUBMIT" ] = 1;
}
for ( i = 1; i <= 10; i++ ) {
    gNotAPageItem["p_ignore_" + ( i < 10 ? "0" + i : i )] = 1;
}

// return true if pName may be a pageItem
function isValidPageItemName( pName ) {
    return !gNotAPageItem[ pName.toLowerCase() ];
}

/**
 * Internal use only
 * @private
 */
server.isValidPageItemName = isValidPageItemName;

var rCRLF = /\r?\n/g,
    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    rsubmittable = /^(?:input|select|textarea|keygen)/i,
    rcheckableType = /^(?:checkbox|radio)$/i;

function addRegionSessionState( pRegion, pData ) {
    var lPageItems, lCurRegion, lTargetRegion;

    // its called pageItems for legacy reasons but can include column items. Only the region knows which is which.
    lPageItems = pData.pageItems; // pageItems could include column items
    if ( !$.isArray( lPageItems )) {
        // turn it into an array of item names
        lPageItems = [];
        $( pData.pageItems, apex.gPageContext$ ).each( function() {
            if ( this.id ) { // should always have an id
                lPageItems.push( this.id );
            }
        });
    }
    lTargetRegion = pRegion.getSessionState( lPageItems );
    if ( lTargetRegion ) {
        pData.pageItems = lTargetRegion.pageItems; // this is the input "page" items with column items removed
        // now merge in the region
        if ( !pData.regions ) {
            // if there are no regions just add the one
            pData.regions = [
                lTargetRegion.region
            ];
        } else {
            for ( i = 0; i < pData.regions.length; i++ ) {
                lCurRegion = pData.regions[i];
                if ( lCurRegion.id === lTargetRegion.region.id ) {
                    pData.regions[i] = $.extend( lCurRegion, lTargetRegion.region );
                    break;
                }
            }
            if ( i >= pData.regions.length ) {
                // wasn't found so add it
                pData.regions.push( lTargetRegion.region );
            }
        }
    }
    return lTargetRegion;
}

// pPageItems identifies one or more items (page or column) that will be included in a request.
//     It is of type jQuery selector, jQuery object, DOM object or array of item names.
//     It is most commonly an array of item names. If it is a jQuery selector, jQuery object or DOM object then it
//     must represent the element(s) that apex.item api can act on.
//     In the case where the call comes from the page module (to submit the page)
//     it is an array of form element names (from the name attribute value) that are likely to be page items.
//     It may contain duplicate names which will get reduced to a single element when looked up by id.
//     A name that can't be found as a lookup by id (as in #<name>) is not a page item and safely ignored.
function addPageItemsToRequest( pPageItems, pData, pFullPage ) {
    var lItems,
        lFileItemsAdded = [],
        lNextFileIndex = 1;

    function getValueByName( name ) {
        var values = [];
        // get the value of the named elements but only if they are:
        //   not disabled, on a submittable form element, and, if checkbox or radio, are checked
        $( "[name='" + name + "']" ).filter( function() {
            var type = this.type;

            return !this.disabled &&
                rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
                ( this.checked || !rcheckableType.test( type ) );
        } ).each(function() {
            values.push( $( this ).val() );
        });
        if ( values.length === 0 ) {
            values = "";
        } else if ( values.length === 1 ) {
            values = values[0];
        }
        return values;
    }

    // for a full page submit: trigger submit handlers added to the <form> element; note: will only execute handlers added with jQuery
    if ( pFullPage ) {
        $( "form#wwvFlowForm" ).triggerHandler( "submit" );
    }

    // Always include the page salt
    pData.salt = $v( "pSalt" );

    // Add any specified page items
    if ( pPageItems ) {
        lItems = [];
        pData.pageItems = {
            "itemsToSubmit": lItems,
            "protected":     $v( "pPageItemsProtected" ),
            "rowVersion":    $v( "pPageItemsRowVersion" )
        };

        if ( $.isArray( pPageItems ) ) {
            pPageItems = pPageItems.map( function( i ) { return "#" + util.escapeCSS( i ); } ).join( "," );
        }
        $( pPageItems, apex.gPageContext$ ).each( function() {
            var i, lCk, lItem, lItemValue, lValue,
                lItemName = this.id,
                el$ = $( this );

            // exclude "non page items" like X01-X10,F01-F50,pFlowId,pInstance, ...
            if ( isValidPageItemName( lItemName ) ) {
                lItem = apex.item( lItemName );

                // Get the item's value. In theory the apex.item getValue function should always be used however
                // in the case of some legacy or oddly implemented page items where the name attribute and id
                // attribute (with value = to the item name) are on different elements AND there is no apex item
                // plug-in registered (e.g. with apex.item.create) that can compensate with its own getValue then
                // there is a special case where the value is taken from the element(s) with the matching name attribute.
                if ( lItem.node && lItem.isDisabled() && pFullPage ) {
                    // Although the browser would never submit a disabled form element or a checkbox or radio input that is
                    // not checked, because p_arg_names was submitted the server would still interpret the not submitted page
                    // item as an empty string or null. So by disabling something you set it to null in session state.
                    // This may or may not be desired but it is the way APEX pages have always worked and needs to be handled
                    // the same way when submitting the page via ajax. Note this only applies to page items.
                    lValue = "";
                } else if ( el$.attr( "name" ) === lItemName || apex.page.itemCallbacks[ lItemName ] || ( lItem.item_type !== false && !pFullPage ) ) {
                    lValue = lItem.getValue( lItemName );
                } else {
                    lValue = getValueByName( lItemName );
                }

                // When the browser sends data to the server in a url form encoded or multi part post request it always
                // normalizes line endings as CRLF (\r\n). We do the same for page items.
                if ( $.isArray( lValue ) ) {
                    for ( i = 0; i < lValue.length; i++ ) {
                        lValue[i] = lValue[i].replace( rCRLF, "\r\n" );
                    }
                } else {
                    lValue = lValue.replace( rCRLF, "\r\n" );
                }

                lItemValue = {
                    n: lItemName,
                    v: lValue
                };

                // check for file upload item
                if ( this.nodeName === "INPUT" && this.type === "file" && this.name && this.files.length > 0 ) {
                     lFileItemsAdded.push( this );
                     lItemValue.fileIndex = lNextFileIndex;
                     lItemValue.fileCount = this.files.length;
                     lNextFileIndex += this.files.length;
                }

                // include the checksum if there is one
                lCk = $('input[data-for="' + util.escapeCSS( lItemName ) + '"]' ).val(); 
                if ( lCk ) {
                    lItemValue.ck = lCk;
                }
                lItems.push( lItemValue );
            }
        } );
    }
    return lFileItemsAdded;
}

/**
 * Internal use only
 * @ignore
 */
server.addPageItemsToRequest = addPageItemsToRequest;

/**
 * Internal use only
 * @ignore
 */
server.accept = function( pData, pOptions ) {
    var deferred = $.Deferred();
    pOptions.fullPage = true;
    ajaxCall( null, pData, pOptions, deferred );
    return deferred.promise();
};

/**
 * FOR INTERNAL USE ONLY!!!
 *
 * Function that calls the server side part of a widget. This function is a wrapper of the jQuery.ajax function and
 * supports all the setting the jQuery function provides but provides additional APEX features.
 *
 * @ignore
 * @function widget
 * @memberof apex.server
 * @param {String} pName      Name of the internal widget.
 * @param {Object} [pData]    Object which can optionally be used to send additional values which are sent with the AJAX request.
 *                            The special attribute "pageItems" which can be of type jQuery selector, jQuery-, DOM object or array of item names
 *                            identifies the page items which should be included in the URL. But you can also set additional
 *                            parameters that wwv_flow.show procedure provides. For example you can set the scalar parameters
 *                            x01 - x10 and the arrays f01 - f20
 * @param {Object} [pOptions] Object which can optionally be used to set additional options used by the AJAX.
 *                            It supports the following optional APEX specific attributes:
 *                              - "refreshObject"       jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      for which the apexbeforerefresh and apexafterrefresh events are fired
 *                              - "clear"               JavaScript function which can be used to clear the DOM after the
 *                                                      "apexbeforerefresh" event has fired and before the actual AJAX call is triggered.
 *                              - "loadingIndicator"    jQuery selector, jQuery- or DOM object which identifies the DOM element
 *                                                      where the loading indicator should be displayed next to it.
 *                                                      loadingIndicator can also be a function which gets the loading Indicator as
 *                                                      jQuery object and has to return the jQuery reference to the created loading indicator.
 *                                                      eg. function( pLoadingIndicator ) { return pLoadingIndicator.prependTo ( apex.jQuery( "td.shuttleControl", gShuttle )) }
 *                              - "loadingIndicatorPosition"
 *                                                      6 options to define the position of the loading indicator displayed. Only considered if the value passed to
 *                                                      loadingIndicator is not a function.
 * <ul>
 * <li>before":   Displays before the DOM element(s) defined by loadingIndicator</li>
 * <li>after":    Displays after the DOM element(s) defined by loadingIndicator</li>
 * <li>prepend":  Displays inside at the beginning of the DOM element(s) defined by loadingIndicator</li>
 * <li>append":   Displays inside at the end of the DOM element(s) defined by loadingIndicator</li>
 * <li>centered": Displays in the center of the DOM element defined by loadingIndicator</li>
 * <li>page"    : Displays in the center of the page.</li>
 * </ul>
 *                            See jQuery documentation of jQuery.ajax for all other available attributes. The attribute dataType is defaulted to json.
 * @return {promise}
 *
 * @example
 *
 * apex.server.widget ( "calendar", {
 *     x01: "test",
 *     pageItems: "#P1_DEPTNO,#P1_EMPNO"
 *     }, {
 *     success: function( pData ) { ... do something here ... }
 *     } );
 */
server.widget = function( pName, pData, pOptions ) {
    var deferred = $.Deferred();

    pData = pData || {};
    pData.p_widget_name = pName;

    ajaxCall( "APXWGT", pData, pOptions, deferred );
    return deferred.promise();
}; // widget

// variables for queue processing and lazy write back functionality
var MIN_LAZY_WRITE_FREQ = 5 * 1000; // 5 seconds

var lastWriteTimerId = null,
    lastWriteTime = null,
    lazyWriteQueue = [], // array of { name: <str>, request: <str>, data: {}, options: {}, call: <fn>, deferred: {} }
    queues = {}, // name -> [{ request: <str>, data: {}, options: {}, call: <fn>, deferred: {} },...]
    progressScopeNameIndex = 0;

function addToQueue( pQueueName, pAction, pRequest, pData, pOptions, pFn, pDeferred ) {
    var queue, delta, config, currentItem;

    function getQueue( name ) {
        var queue = queues[name];
        if ( !queue ) {
            queue = queues[name] = [];
        }
        return queue;
    }

    function sendNext( name ) {
        var item, p,
            queue = getQueue( name );

        if ( queue.length >= 1 ) {
            item = queue[0];
            p = item.deferred.promise();
            item.jqXHR = item.call( item.request, item.data, item.options, item.deferred );
            p.then( function( data, status ) {
                // success
                queue.shift(); // take this completed request off the queue
                setTimeout( function() {
                    sendNext( name ); // start the next one if any but let any other promise handlers finish first
                }, 0 );
            }, function( jqXHR, status ) {
                // failure
                // clear out the queue but after any other promise handlers from failed request
                setTimeout( function() {
                    var i, item;
                    // if there are any waiters that specified an error or complete callback they are expecting to be called
                    // let them know that they were aborted
                    // skip the first one because that is the one that was in progress and already notified
                    for (i = 1; i < queue.length; i++) {
                        item = queue[i];
                        // because this call is aborted before it was started the error callback is the user's not our
                        // internal error handler so must also reject the deferred here.
                        if ( item.options.error ) {
                            item.options.error( {status:0}, "abort", null );
                        }
                        item.deferred.reject( {status:0}, "abort", null );
                        if ( item.options.complete ) {
                            item.options.complete( {status:0}, "abort" );
                        }
                    }
                    queue.length = 0;
                }, 0 );
            });
        }
    }

    function findInQueue( pQueue, pName) {
        var i;
        for ( i = 0; i < pQueue.length; i++ ) {
            if ( pQueue[i].name === pName ) {
                return pQueue[i];
            }
        }
        return null;
    }

    if (pAction === "lazyWrite") {
        // if already on queue don't add it again just update the call data
        config = findInQueue( lazyWriteQueue, pQueueName );
        if ( config ) {
            // reject previous deferred
            config.deferred.reject( {status: 0}, "superseded", null );

            config.request = pRequest;
            config.data = pData;
            config.options = pOptions;
            config.call = pFn;
            config.deferred = pDeferred;
            return;
        } // else
        lazyWriteQueue.push( { name: pQueueName, request: pRequest, data: pData, options: pOptions, call: pFn, deferred: pDeferred } );
        if ( lastWriteTimerId ) {
            return; // a write call will happen
        } // else
        // check if a write happened recently and if so wait a bit
        if ( lastWriteTime === null ) {
            delta = 10;
        } else {
            delta = ( lastWriteTime + MIN_LAZY_WRITE_FREQ ) - (new Date()).getTime();
            delta = delta < 0 ? 10 : delta;
        }
        lastWriteTimerId = setTimeout(function() {
            var item;

            lastWriteTimerId = null;
            lastWriteTime = (new Date()).getTime();

            while (lazyWriteQueue.length > 0) {
                item = lazyWriteQueue.shift();
                item.call( item.request, item.data, item.options, item.deferred );
            }
        }, delta);
    } else {
        queue = getQueue( pQueueName );

        if ( pAction === "replace" && queue.length >= 1 ) {
            // replace any waiting requests and abort the current one if any
            currentItem = queue.shift();
            if ( currentItem.jqXHR )  {
                currentItem.jqXHR.abort(); // this should reject the deferred
            } else {
                // unlikely but just in case
                currentItem.deferred.reject( {status: 0}, "superseded", null );
            }
            while ( queue.length > 0 ) {
                currentItem = queue.shift();
                currentItem.deferred.reject( {status: 0}, "superseded", null );
            }
        }
        queue.push( {request: pRequest, data: pData, options: pOptions, call: pFn, deferred: pDeferred } );
        if ( queue.length === 1 ) {
            sendNext( pQueueName );
        }
    }
}

function callOrQueue( pRequest, pData, pOptions ) {
    var lQName, lAction, jqXHR, promise,
        deferred = $.Deferred();

    // TODO consider if something should be done to consolidate the delayLinger spinner for each queue

    /*
     * We use our own deferred for two reasons
     * 1) in the case where the request is queued the promise can be returned now (whereas the jqXHR doesn't exist yet)
     * 2) the internal success handler can turn a successful response into an error and we need to be able to reject
     * the deferred of the promise the caller has and we don't have access to the internal deferred of the jqXHR.
     * This keep the promise done and fail callbacks in line with the option success and error callbacks
     */

    if ( pOptions && pOptions.queue ) {
        lQName = pOptions.queue.name;
        lAction = pOptions.queue.action;
        delete pOptions.queue;
        addToQueue( lQName, lAction, pRequest, pData, pOptions, ajaxCall, deferred );
    } else {
        jqXHR = ajaxCall( pRequest, pData, pOptions, deferred );

    }
    promise = deferred.promise();
    promise.abort = function() {
        if ( jqXHR ) {
            jqXHR.abort();
        }
    };
    return promise;
}

var gTopLevelNames = {
    p_flow_id: 1,
    p_flow_step_id: 1,
    p_instance: 1,
    p_trace: 1,
    fcs: 1,
    fmap: 1,
    fhdr: 1,
    fcud: 1,
    frowid: 1,
    p_clob_01: 1,
    p_widget_name: 1,
    p_widget_mod: 1,
    p_widget_action: 1,
    p_widget_action_mod: 1,
    p_widget_num_return: 1,
    p_widget_view_mode: 1,
    p_fsp_region_id: 1,
    p_clear_cache: 1,
    p_pg_min_row: 1,
    p_pg_max_rows: 1,
    p_pg_rows_fetched: 1
};

function ajaxCall( pRequest, pData, pOptions, pDeferred ) {
    var i, j, lFD, lParameterName, lSuccessCallback, lErrorCallback, lItems, lValue, lParamLC, lRegion, lTargetRegion, lJSON,
        lProgressScopeName = null,
        // Initialize the ajax call parameters required by APEX
        lOptions = {
                dataType:                 "json",
                type:                     "post",
                async:                    true,
                url:                      "wwv_flow.ajax",
                traditional:              true
        },
        // Initialize all the default parameters which are expected by APEX
        lData = {
            p_flow_id:      $v( 'pFlowId' ),
            p_flow_step_id: $v( 'pFlowStepId' ),
            p_instance:     $v( 'pInstance' ),
            p_debug:        $v( 'pdebug' )
        },
        lLoadingIndicatorTmpl$,
        lLoadingIndicator$,
        lLoadingIndicators$ = $(),
        lLoadingIndicatorPosition,
        lFileItemsAdded;

    function normalizeLineEndings( pValue ) {
        return ( typeof pValue === "string" ? pValue.replace( rCRLF, "\r\n" ) : pValue );
    }

    function addParameter( fd, data, parameterName ) {
        var i, value = data[parameterName];
        // if value is array like
        if ( typeof value !== "string" && value.length !== null && value.length !== undefined ) {
            for ( i = 0; i < value.length; i++ ) {
                fd.append( parameterName, value[i] );
            }
        } else {
            fd.append( parameterName, value );
        }
    }

    // add p_request only if there is one
    if ( pRequest ) {
        lData.p_request = pRequest;
    }

    if ( !pOptions ) {
        pOptions = {};
    }
    // Be specific about what options are passed to jQuery.ajax. Options error and success are allowed but treated special
    // async is deprecated and will be removed in a future release
    ["accepts", "dataType", "beforeSend", "contents", "converters", "dataFilter", "headers", "complete", "statusCode", "async"].forEach( function( prop ) {
            if ( pOptions.hasOwnProperty( prop ) ) {
                lOptions[prop] = pOptions[prop];
            }
        } );

    // Save the callbacks for later use because we overwrite them with standard handlers
    lSuccessCallback = pOptions.success;
    lErrorCallback   = pOptions.error;
    lLoadingIndicatorPosition = pOptions.loadingIndicatorPosition || "after";

    // add a few more parameters needed for a full page "submit" request
    if ( pOptions.fullPage ) {
        lData.p_request = $v( "pRequest" );
        lData.p_reload_on_submit = $v( "pReloadOnSubmit" );
        lData.p_page_submission_id = $v( "pPageSubmissionId" );
        // full page submit uses the accept procedure
        lOptions.url = "wwv_flow.accept";
    }

    // Most of the input pData gets serialized as JSON into the p_json parameter but a few things need to be moved
    // into the traditional parameters.
    // Specifically move x01 - x20, f01-f50, fcs, fmap, fhdr, fcud, frowid, p_trace, p_widget_name
    // copy pData so it doesn't get modified
    lJSON = {};
    for ( lParameterName in pData) {
        if ( pData.hasOwnProperty( lParameterName ) ) {
            lParamLC = lParameterName.toLowerCase();
            lValue = pData[lParameterName];
            // Note: wwv_flow.accept allows up to f50 but wwv_flow.show only allows up to f20.
            // So f01 to f20 supported for plugin and process calls but call should consider f[0-9][0-9] reserved
            // yes this is a little looser than it should be allowing for example f59 but is close enough
            if ( /f[0-5][0-9]/.exec(lParamLC) ) {
                if ( !$.isArray( lValue ) ) {
                    lData[lParameterName] = chunk( normalizeLineEndings( lValue + "" ) );
                } else {
                    lData[lParameterName] = [];
                    for ( i = 0; i < lValue.length; i++ ) {
                        lData[lParameterName][i] = normalizeLineEndings( lValue[i] );
                    }
                }
            } else if ( /x[0-2][0-9]/.exec(lParamLC) || gTopLevelNames[lParamLC] ) {
                lData[lParameterName] = normalizeLineEndings( lValue );
            } else {
                if ( lValue !== null && typeof lValue === "object" ) {
                    lJSON[lParameterName] = $.extend( true, $.isArray( lValue ) ? [] : {}, lValue );
                } else {
                    lJSON[lParameterName] = lValue;
                }
            }
        }
    }

    // When there is a target option it is used to get context information from a region including
    // any column items that may be included in pageItems.
    if ( pOptions.target ) {
        lRegion = apex.region.findClosest( pOptions.target );
        if ( lRegion ) {
            lTargetRegion = addRegionSessionState( lRegion, lJSON );
        }
    }

    lFileItemsAdded = addPageItemsToRequest( lJSON.pageItems, lJSON, pOptions.fullPage );

    // legacy support for passing page items in p_arg_names, p_arg_values arrays
    if ( lJSON.p_arg_names && lJSON.p_arg_values && lJSON.p_arg_names.length === lJSON.p_arg_values.length ) {
        if ( !lJSON.pageItems || !lJSON.pageItems.itemsToSubmit ) {
            lJSON.pageItems = {
                itemsToSubmit: [],
                "protected":     $v( "pPageItemsProtected" ),
                "rowVersion":    $v( "pPageItemsRowVersion" )
            };
        }
        lItems = lJSON.pageItems.itemsToSubmit;
        for ( i = 0; i < lJSON.p_arg_names.length; i++ ) {
            lItems.push( {
                n: lJSON.p_arg_names[i],
                v: lJSON.p_arg_values[i]
            } );
        }
    }
    delete lJSON.p_arg_names;
    delete lJSON.p_arg_values;

    lData.p_json = chunk( JSON.stringify( lJSON ) );
    // Files of the file type elements have to be mapped to the p_files array
    lData.p_files = [];
    for ( i = 0; i < lFileItemsAdded.length; i++ ) {
        for ( j = 0; j < lFileItemsAdded[i].files.length; j++ ) {
            lData.p_files.push( lFileItemsAdded[i].files[ j ]);
        }
    }

    if ( lFileItemsAdded.length > 0 ) {
        lFD = new FormData();
        lOptions.enctype = 'multipart/form-data';
        lOptions.processData = false;  // tell jQuery not to process the data
        lOptions.contentType = false;  // tell jQuery not to set contentType

        // make sure p_json is sent first (so it is before p_files)
        addParameter( lFD, lData, "p_json" );
        for ( lParameterName in lData) {
            if ( lData.hasOwnProperty( lParameterName ) && lParameterName !== "p_json" ) {
                addParameter(lFD, lData, lParameterName);
            }
        }
        lOptions.data = lFD;
    } else {
        lOptions.data = lData;
    }

    // Trigger the before refresh event if the attribute has been specified
    if ( apex.event.trigger( pOptions.refreshObject, "apexbeforerefresh", pOptions.refreshObjectData ) ) {
        // If trigger function returns true, cancel the ajax request
        pDeferred.reject( {status:0}, "cancel", null );
        return null;
    }

    // Call clear callback if the attribute has been specified and if it's a function
    if ( $.isFunction( pOptions.clear ) ) {
        pOptions.clear();
    }

    /*
     * Loading indicator logic relevant if either a loading indicator element is defined, or in the case where the
     * loading indicator position is 'page' (where no loading indicator element is needed).
     */
    if ( pOptions.loadingIndicator || lLoadingIndicatorPosition === "page" ) {
        lLoadingIndicatorTmpl$ = $( '<span class="u-Processing u-Processing--inline"><span class="u-Processing-spinner"></span></span>' );

        /*
         * Because of the way ajaxCall works overall it is not really possible for multiple calls to share the same
         * progress scope name so we make sure it is unique.
         */
        progressScopeNameIndex += 1;
        lProgressScopeName = "_call" + progressScopeNameIndex;
        util.delayLinger.start( lProgressScopeName, function() {

            // First lets deal with the simplest 'page' centered indicator
            if ( lLoadingIndicatorPosition === "page" ) {

                lLoadingIndicator$ = util.showSpinner();
                lLoadingIndicators$ = lLoadingIndicators$.add( lLoadingIndicator$ );

            } else {

                // Add a loading indicator if the attribute has been specified and store the reference to it to remove it later on
                if ( $.isFunction( pOptions.loadingIndicator ) ) {

                    // function has to return the created jQuery object or a function which removes the loading indicator
                    lLoadingIndicators$ = pOptions.loadingIndicator ( lLoadingIndicatorTmpl$ );
                } else {

                    // Iterate over elements in the loadingIndicator as this could be more than 1 element
                    $( pOptions.loadingIndicator ).each( function() {
                        var lAltLoading$ = null,
                            lElement$ = $( this, apex.gPageContext$ ),
                            lItem = apex.item( this );

                        lLoadingIndicator$ = lLoadingIndicatorTmpl$.clone();

                        // First check if a region wants to override where the loading indicator goes
                        if ( lRegion && lRegion.alternateLoadingIndicator ) {
                            lAltLoading$ = lRegion.alternateLoadingIndicator( this, lLoadingIndicator$ );
                        }
                        if ( lAltLoading$ ){
                            lLoadingIndicator$ = lAltLoading$;
                        } else if ( lItem.callbacks.loadingIndicator !== undefined ) { // Next check if element has a loadingIndicator callback, if so use it
                            lLoadingIndicator$ = lItem.loadingIndicator( lLoadingIndicator$ );
                        } else {

                            // Now we know loadingIndicator is not a function, we consider the position passed as well.
                            if ( lLoadingIndicatorPosition === "before" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.insertBefore( lElement$.filter( ":not(:hidden)" ) );
                            } else if ( lLoadingIndicatorPosition === "after" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.insertAfter( lElement$.filter( ":not(:hidden)" ) );
                            } else if ( lLoadingIndicatorPosition === "prepend" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.prependTo( lElement$ );
                            } else if ( lLoadingIndicatorPosition === "append" ) {
                                lLoadingIndicator$ = lLoadingIndicator$.appendTo( lElement$ );
                            } else if ( lLoadingIndicatorPosition === "centered" ) {
                                lLoadingIndicator$ = util.showSpinner( lElement$ );
                            }
                        }

                        lLoadingIndicators$ = lLoadingIndicators$.add( lLoadingIndicator$ );
                    });
                }
            }
        });
    }

    // Set the values which should get submitted and register our callbacks
    // which will perform some basic handling after an AJAX call completes.
    lOptions.error =
        function( pjqXHR, pTextStatus, pErrorThrown ) {
            error( pjqXHR, pTextStatus, pErrorThrown, {
                deferred:         pDeferred,
                callback:         lErrorCallback,
                loadingIndicator: lLoadingIndicators$,
                progressScopeName: lProgressScopeName
            });
        };
    lOptions.success =
        function( pData, pTextStatus, pjqXHR ) {
            success( pData, pTextStatus, pjqXHR, {
                deferred:         pDeferred,
                callback:         lSuccessCallback,
                errorCallback:    lOptions.error, // the error handler assigned above
                loadingIndicator: lLoadingIndicators$,
                progressScopeName: lProgressScopeName,
                refreshObject:    pOptions.refreshObject,
                refreshObjectData: pOptions.refreshObjectData
            });
        };

    if ( lTargetRegion && lTargetRegion.beforeAsync && lTargetRegion.afterAsync ) {
        lTargetRegion.beforeAsync();
        pDeferred.always( function() {
            lTargetRegion.afterAsync();
        } );
    }
    // perform the AJAX call and return the jQuery object
    return $.ajax( lOptions ); // the return value is mainly used to abort the request
} // ajaxCall


function removeLoadingIndicator ( pLoadingIndicator, pProgressScopeName ) {

    function cleanup() {
        // Remove a loading indicator if the attribute has been specified
        if ( $.isFunction( pLoadingIndicator ) ) {
            pLoadingIndicator();
        } else {
            $( pLoadingIndicator, apex.gPageContext$ ).remove();
        }
    }

    if ( pProgressScopeName ) {
        util.delayLinger.finish( pProgressScopeName, function(){
            cleanup();
        });
    } else {
        cleanup();
    }

} // removeLoadingIndicator


// noinspection FunctionWithMultipleReturnPointsJS
function success( pData, pTextStatus, pjqXHR, pOptions ) {

    var lResult      = true,
        lErrorHeader = pjqXHR.getResponseHeader( "APEX-ERROR" );

    // check for errors first, allowing for pData to be null or undefined where the call returns nothing
    if ( pData ) {
        if ( pData.error ) {
            // TODO not sure why we can't just use pjqXHR.error - have to investigate
            return pOptions.errorCallback( pjqXHR, "APEX", pData.error );
        } else if ( lErrorHeader ) {
            return pOptions.errorCallback( pjqXHR, "APEX", decodeURIComponent( lErrorHeader ));
        }
    }

    removeLoadingIndicator( pOptions.loadingIndicator, pOptions.progressScopeName );

    // call success callback if one is specified
    if ( $.isFunction( pOptions.callback ) ) {
        lResult = pOptions.callback( pData, pTextStatus, pjqXHR );
    }

    // Trigger the after refresh event if the attribute has been specified
    // But only do it if the callback returned <> false.
    // Note: By intention we check with == to capture null as well
    //noinspection JSHint
    if ( lResult || lResult == undefined ) {
        if ( apex.event.trigger( pOptions.refreshObject, "apexafterrefresh", pOptions.refreshObjectData ) ) {

            // If trigger function returns true, cancel the refresh by exiting the function, returning false
            lResult = false;
        }
    }

    pOptions.deferred.resolve( pData, pTextStatus, pjqXHR );

    return lResult;

} // success


function error( pjqXHR, pTextStatus, pErrorThrown, pOptions ) {

    var lMsg,
        lResult = false;

    removeLoadingIndicator( pOptions.loadingIndicator, pOptions.progressScopeName );

    // TODO Handle APEX standard errors here $$$ (eg. session expired, ...)

    // call error callback if one is specified
    if ( $.isFunction( pOptions.callback ) ) {
        lResult = pOptions.callback( pjqXHR, pTextStatus, pErrorThrown );
    } else if ( pjqXHR.status !== 0 ) {
        // When pjqXHR.status is zero it indicates that the page is unloading
        // (or a few other cases that can't be distinguished such as server not responding)
        // and it is very important to not call alert (or any other action that could
        // potentially block on user input or distract the user) when the page is unloading.
        if ( pTextStatus === "APEX" ) {

            // If this is an APEX error, then just show the error thrown
            lMsg = pErrorThrown;
        } else {

            // Otherwise, also show more information about the status
            lMsg = "Error: " + pErrorThrown;
        }
        // Emit the error.
        //todo Should also pass additional and tech info
        apex.message.clearErrors();
        apex.message.showErrors({
            message: lMsg,
            location: "page"
        });
    }
    pOptions.deferred.reject( pjqXHR, pTextStatus, pErrorThrown );

    return lResult;
} // error


})( apex.server, apex.jQuery, apex.util );
