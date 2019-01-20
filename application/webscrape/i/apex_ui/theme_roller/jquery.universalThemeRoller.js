/*var utr = {
    busy: false,
    opened: false,
    invoke: undefined,
    close: undefined,
    nested: false
};*/

(function($, server, utr, lang){
    var BUILDER_WINDOW_NAME = "APEX_BUILDER"; // keep in sync with builder.js

    function isOpenerApexBuilder() {
        // if *this* is the builder window then don't care what the opener is
        // a builder opening the builder can result in a stale instance without this check
        if ( isBuilderWindow() ) {
            return false;
        }
        try {
            // builder urls are in the 4000s
            if ( window.opener && !window.opener.closed && window.opener.apex &&
                window.opener.apex.jQuery &&
                ( window.opener.location.href.match(/f?p=4\d\d\d:/) || window.opener.document.getElementById("pFlowId") ) ) {
                return true;
            }
        } catch ( ex ) {
            return false; // window must contain a page from another domain
        }
        return false;
    }

    function isBuilderWindow() {
        return window.name && window.name.match( "^" + BUILDER_WINDOW_NAME );
    }

    function getBuilderInstance() {
        if ( isOpenerApexBuilder() ) {
            return window.opener.document.getElementById("pInstance").value;
        }
        return null;
    }

    var requiredFilesImported = false;
    
    var defaultOptions = {
        filePaths: {
            utStylesheet: "less/ut.less",
            themeStylesheets: ["less/ut.less"],
            lessCompilerScript: "js/less.js",
            utrStylesheet: "css/utr.css",
            utrScript: "js/utr.js",
            //colorPickerStylesheet: "js/colorpicker/css/colorpicker.css",
            //colorPickerScript: "js/colorpicker/js/colorpicker.js",
            jQueryUiComponentsScript: "js/jquery-ui.utr.js",
            codeMirrorScript: "js/codemirror/lib/codemirror.js",
            codeMirrorCSSModeScript: "js/codemirror/mode/css/css.js",
            codeMirrorStylesheet: "js/codemirror/lib/codemirror.css",
            d3Script: "js/d3/d3.min.js",
            //BEGIN SHIPIT
            d3ColorPickerScript: "js/d3.oracle.colorpicker.js",
            d3ColorPickerStylesheet: "css/d3.oracle.colorpicker.css",
            d3PaletteScript: "js/d3.oracle.palette.js",
            d3PaletteStylesheet: "css/d3.oracle.palette.css"
            //END SHIPIT
        }, 
        config: {
            themeId: 42,
            builderSessionId: getBuilderInstance(),
            standalone: false,
            nested: false
        }
    };
    var options = defaultOptions;
    var stylesheetCache = {};

    var msgKeys = [
            "UTR.THEME_ROLLER",
            "UTR.COMMON.CONFIRM",
            "UTR.COMMON.SET_CURRENT_WHEN_READ_ONLY_PROMPT",
            "UTR.SET_AS_CURRENT_THEME_STYLE_SUCCESS",
            "UTR.SET_AS_CURRENT_THEME_STYLE",
            "UTR.RESET.STYLE",
            "UTR.CURRENT",
            "UTR.SET_AS_CURRENT",
            "UTR.CHANGE_THEME",
            "UTR.ERROR.SET_AS_CURRENT_FAILED",
            "UTR.COMMON.WARNING",
            "UTR.PALETTE_GENERATOR.DUAL",
            "UTR.COMMON.COPY",
            "UTR.COMMON.SUCCESS",
            "UTR.COMMON.YES",
            "UTR.COMMON.NO",
            "UTR.COMMON.OK",
            "UTR.COMMON.CANCEL",
            "UTR.COMMON.STYLE_NAME",
            "UTR.COMMON.BASE_STYLE",
            "UTR.BUTTONS.CLOSE",
            "UTR.BUTTONS.MINIMIZE",
            "UTR.BUTTONS.CODE_EDITOR",
            "UTR.SAVE_AS",
            "UTR.SAVE_AS.PROMPT",
            "UTR.SAVE_AS.SUCCESS",
            "UTR.SAVE",
            "UTR.SAVE.PROMPT",
            "UTR.SAVE.SUCCESS",
            "UTR.RESET",
            "UTR.RESET.PROMPT",
            "UTR.CUSTOM_CSS",
            "UTR.CUSTOM_CSS.DESCRIPTION",
            "UTR.CUSTOM_CSS.WARNING",
            "UTR.CHANGE.PROMPT",
            "UTR.ERROR",
            "UTR.ERROR.UNSUPPORTED_STYLE",
            "UTR.ERROR.INPUT_NOT_FOUND",
            "UTR.ERROR.INVALID_STYLE",
            "UTR.ERROR.UNSUPPORTED_THEME",
            "UTR.ERROR.CREATE_FAILED",
            "UTR.ERROR.UPDATE_FAILED",
            "UTR.ERROR.LOAD_FAILED",
            "UTR.CONTRAST_VALIDATION.TITLE",
            "UTR.CONTRAST_VALIDATION.MESSAGE",
            "UTR.CONTRAST_VALIDATION.FAILED",
            "UTR.CONTRAST_VALIDATION.PASSED",
            "UTR.CONTRAST_VALIDATION.LARGE_TEXT_NOTICE",
            "UTR.HELP",
            "UTR.HELP.P1",
            "UTR.HELP.P2",
            "UTR.TOOLBAR.BUTTONS.COMMON",
            "UTR.TOOLBAR.BUTTONS.ALL",
            "UTR.TOOLBAR.BUTTONS.PALETTE_GENERATOR",
            "UTR.PALETTE_GENERATOR.BASE_RGB",
            "UTR.PALETTE_GENERATOR.SEPARATION",
            "UTR.PALETTE_GENERATOR.MONOCHROMATIC",
            "UTR.PALETTE_GENERATOR.TRIAD",
            "UTR.PALETTE_GENERATOR.TETRAD",
            "UTR.PALETTE_GENERATOR.WITH_COMPLEMENT",
            "UTR.SEARCH",
            "UTR.UNDO",
            "UTR.REDO",
            "UTR.CONFIG_OUTPUT",
            "UTR.CONFIG_OUTPUT_ERRO",
            'UTR.LESS.HEADER_ACCENT',
            'UTR.LESS.BODY_ACCENT',
            'UTR.LESS.CONTAINER_BORDER_RADIUS',
            'UTR.LESS.LABEL',
            'UTR.LESS.BORDER_RADIUS',
            'UTR.LESS.LINK_COLOR',
            'UTR.LESS.FOCUS_OUTLINE',
            'UTR.LESS.NAVIGATION_TREE',
            'UTR.LESS.ACTIONS_COLUMN',
            'UTR.LESS.LEFT_COLUMN',
            'UTR.LESS.BODY_CONTENT_MAX_WIDTH',
            'UTR.LESS.BACKGROUND',
            'UTR.LESS.HOVER_STATE',
            'UTR.LESS.BODY',
            'UTR.LESS.FOREGROUND',
            'UTR.LESS.SELECTED_STATE',
            'UTR.LESS.TEXT',
            'UTR.LESS.ICON',
            'UTR.LESS.NORMAL',
            'UTR.LESS.ACTIVE_STATE',
            'UTR.LESS.TITLE_BAR',
            'UTR.LESS.HEADER',
            'UTR.LESS.DISABLED',
            'UTR.LESS.PRIMARY',
            'UTR.LESS.SUCCESS',
            'UTR.LESS.INFO',
            'UTR.LESS.WARNING',
            'UTR.LESS.DANGER',
            'UTR.LESS.REGION_HEADER',
            'UTR.LESS.ITEM',
            'UTR.LESS.HOT',
            'UTR.LESS.SIMPLE',
            'UTR.LESS.MENU',
            'UTR.LESS.GLOBAL_COLORS',
            'UTR.LESS.CONTAINERS',
            'UTR.LESS.NAVIGATION',
            'UTR.LESS.REGIONS',
            'UTR.LESS.BUTTONS',
            'UTR.LESS.FORMS',
            'UTR.LESS.STATES',
            'UTR.LESS.PALETTE',
            'UTR.LESS.INTERACTIVE_REPORTS',
            'UTR.LESS.LAYOUT',
            'UTR.LESS.COLOR_1',
            'UTR.LESS.COLOR_2',
            'UTR.LESS.COLOR_3',
            'UTR.LESS.COLOR_4',
            'UTR.LESS.COLOR_5',
            'UTR.LESS.COLOR_6',
            'UTR.LESS.COLOR_7',
            'UTR.LESS.COLOR_8',
            'UTR.LESS.COLOR_9',
            'UTR.LESS.COLOR_10',
            'UTR.LESS.COLOR_11',
            'UTR.LESS.COLOR_12',
            'UTR.LESS.COLOR_13',
            'UTR.LESS.COLOR_14',
            'UTR.LESS.COLOR_15'
        ];
        
    $.universalThemeRoller = $.universalThemeRoller || function(){
        var utrArguments = arguments;
        var firstArgumentType = typeof utrArguments[0];

        function _init(userOptions){
            userOptions = typeof userOptions === "undefined" ? {} : userOptions;
            
            options = $.extend(true, {}, defaultOptions, userOptions);
            
        }
        function _open(){
            utr.invoke.apply(this, Array.prototype.slice.call(utrArguments, 1, 4));
        }
        function _close(){
            utr.close();
        }

        function _importStylesheet(url, importAsLessStylesheet){
            if(typeof importAsLessStylesheet === "undefined"){
                importAsLessStylesheet = false;
            }

            $(document.createElement("link")).attr({
                rel:"stylesheet" + (importAsLessStylesheet ? "/less" : ""),
                type:"text/css",
                href:url
            }).appendTo("head");
        }

        function _importStylesheetSet(urls, callback, callback2){
            var results = [];
            if (urls && urls.length > 0) {
                for (var i = urls.length - 1; i >= 0; i--) { 
                    results[i] = undefined;
                    if (stylesheetCache[urls[i]]) {
                        results[i] = stylesheetCache[urls[i]];

                        var done = true;
                        for (var j = results.length - 1; j >= 0; j--) {
                            if (results[j] === undefined) {
                                done = false;
                                break;
                            } 
                        }

                        if (!done) {
                            continue;
                        } else {
                            callback && callback(results.join('\n'));
                        }

                    } else {
                        $.get(urls[i], $.proxy(function(data){
                            results[this.i] = stylesheetCache[urls[this.i]] = data;
                            for (var j = results.length - 1; j >= 0; j--) {
                                if (results[j] === undefined) return; 
                            }
                            callback && callback(results.join('\n'));

                        }, {i:i}))
                        .fail(function(){
                            callback2 && callback2({ status: 404 });
                        });
                    }
                }
            } else {
                callback && callback(null);
            }
        }

        function _importRequiredFiles(callback){
            if ( !requiredFilesImported ) {
                var paths = options.filePaths;

                _importStylesheet(paths.codeMirrorStylesheet);
                _importStylesheet(paths.codeMirrorThemeStylesheet);
                _importStylesheet(paths.d3PaletteStylesheet);
                _importStylesheet(paths.utrStylesheet);
                _importStylesheet(paths.d3ColorPickerStylesheet);

                less = {
                    env: "production",
                    logLevel: 0,
                    omitComments: true
                };

                lang.loadMessagesIfNeeded(msgKeys, function(){
                    $.getScript( paths.jQueryUiComponentsScript, function () {
                        server.loadScript({
                            "path": paths.lessCompilerScript,
                            "requirejs": true,
                            "global": "less"
                        }, function () {
                            server.loadScript({
                                "path": paths.codeMirrorScript,
                                "requirejs": true,
                                "global": "CodeMirror"
                            }, function () {
                                $.getScript( paths.codeMirrorCSSModeScript, function () {
                                    $.getScript( paths.d3Script, function () {
                                        $.getScript( paths.d3PaletteScript, function () {
                                            $.getScript( paths.d3ColorPickerScript, function () {
                                                $.getScript( paths.utrScript, function () {
                                                    requiredFilesImported = true;
                                                    callback();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                callback();
            }
        }

        function chunk(content) {
            var r = [];
            while (content.length > 4000) {
                r.push(content.substr(0, 4000));
                content = content.substr(4000);
            }
            r.push(content);
            return r;
        }

        function _getThemeStyles(callback, callback2){
            if (!options.config.standalone) {

                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "get_styles",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    }, 
                    error: function(pData) {
                        callback2 && callback2(pData);
                    }
                });
            } else {
                callback([{
                    "id":"static",
                    "name":"Static",
                    "isCurrent":true,
                    "isReadOnly":false,
                    "cssFileUrls":[],
                    "inputFileUrls":options.config.lessFiles,
                    "outputFileUrls":[]
                },{
                    "id":"static2",
                    "name":"Static 2",
                    "isCurrent":false,
                    "isReadOnly":false,
                    "cssFileUrls":[],
                    "inputFileUrls":options.config.lessFiles2,
                    "outputFileUrls":[]
                }]);
            }
        }

        function _createThemeStyle(baseStyleId, styleName, config, styleCSS, callback, callback2) {
            if (!options.config.standalone) {
                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "create_style",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId,
                    x04:            baseStyleId,
                    x05:            styleName,
                    x06:            JSON.stringify(config),
                    f01:            chunk(styleCSS)
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    },
                    error: function(pData) {
                        callback2 && callback2(pData);
                    }
                });
            } else {
                callback && callback({});
            }
        }

        function _updateThemeStyle(styleId, styleName, config, styleCSS, callback, callback2) {
            if (!options.config.standalone) {
                server.process("theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    p_debug:        "NO",
                    x01:            "update_style",
                    x02:            $v("pFlowId"),
                    x03:            options.config.themeId,
                    x04:            styleId,
                    x05:            styleName,
                    x06:            JSON.stringify(config),
                    f01:            chunk(styleCSS)
                }, {
                    success: function(pData) {
                        callback && callback(pData);
                    },
                    error: function(pData) {
                        callback2 && callback2(pData);
                    } 
                });
            } else {
                callback && callback({});
            }
        }

        function _setAsCurrentTheme(styleId, callback, callback2) {
            if (!options.config.standalone) {
                server.process( "theme_roller", {
                    p_flow_id:      4000,
                    p_flow_step_id: 0,
                    p_instance:     options.config.builderSessionId,
                    x01:            "set_current_style",
                    x02:            $v( "pFlowId" ),
                    x03:            options.config.themeId,
                    x04:            styleId
                }, {
                    success: function (pData ) {
                        callback && callback( pData );
                    },
                    error: function( pData ) {
                        callback2 && callback2( pData );
                    }
                });
            } else {
                callback && callback({});
            }
        }

        if(firstArgumentType === "object" || firstArgumentType === "undefined") {
            _init(utrArguments[0]);
        } else if(firstArgumentType === "string") {
            switch(utrArguments[0]){
                case "open":
                    if (!utr.busy) {
                        if (!utr.opened) {
                            var lSpinner$ = apex.util.showSpinner();
                            var load = function() {
                                _open();
                                setTimeout(function() {
                                    lSpinner$.remove();
                                }, 1500);
                            };
                            _importRequiredFiles(load);

                        } else {
                            //TODO UTR is already opened. New settings were not applyed. Close the dialog and open it with the new settings
                        }
                    }
                    break;
                case "close":
                    if (!utr.busy) {
                        if (utr.opened) {
                            _close();
                        } else {
                            //TODO UTR is already closed.
                        }
                    } 
                    break;
                case "getStylesheets":
                    _importStylesheetSet(utrArguments[1], utrArguments[2], utrArguments[3]);
                    break;
                case "getThemeStyles": 
                    _getThemeStyles(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "createThemeStyle": 
                    _createThemeStyle(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "updateThemeStyle":
                    _updateThemeStyle(utrArguments[1], utrArguments[2], utrArguments[3], utrArguments[4], utrArguments[5], utrArguments[6]);
                    break;
                case "setThemeStyleAsCurrent":
                    _setAsCurrentTheme(utrArguments[1], utrArguments[2], utrArguments[3]);
                    break;
            }
        } else {
            //TODO invalid number or type of arguments passed
        }
    };
})(apex.jQuery, apex.server, apex.utr, apex.lang);