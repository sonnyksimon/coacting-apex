/*!
 *
 * Require JS configuration for JET
 * Copyright (c) 1999, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 */
/**
 * Require.js configuration
 */
( function( $, debug ) {
    "use strict";

    var dbg = !!$v( "pdebug" );

    requirejs.config({

        // Path mappings for the logical module names
        baseUrl: apex_img_dir + "libraries/",
        paths: {
            "jquery":               "./jquery/3.1.1/jquery-3.1.1.min",
            "jqueryui-amd":         "./oraclejet/4.2.0/js/libs/jquery/jqueryui-amd-1.12.0.min",
            "ojs":                  "./oraclejet/4.2.0/js/libs/oj/v4.2.0/" + ( dbg ? "debug" : "min" ),
            "ojL10n":               "./oraclejet/4.2.0/js/libs/oj/v4.2.0/ojL10n",
            "ojtranslations":       "./oraclejet/4.2.0/js/libs/oj/v4.2.0/resources",
            "text":                 "./oraclejet/4.2.0/js/libs/require/text",
            "promise":              "./oraclejet/4.2.0/js/libs/es6-promise/es6-promise.min",
            "hammerjs":             "./hammer/2.0.8/hammer-2.0.8.min",
            "signals":              "./oraclejet/4.2.0/js/libs/js-signals/signals.min",
            "ojdnd":                "./oraclejet/4.2.0/js/libs/dnd-polyfill/dnd-polyfill-1.0.0.min",
            "css":                  "./oraclejet/4.2.0/js/libs/require-css/css.min",
            "customElements":       "./oraclejet/4.2.0/js/libs/webcomponents/custom-elements.min",
            "proj4":                "./oraclejet/4.2.0/js/libs/proj4js/dist/proj4"
        },

        // Shim configurations for modules that do not expose AMD
        shim: {
            "jquery": {
                exports: [ "jQuery", "$" ]
            }
        },

        // This section configures the i18n plugin. It is merging the Oracle JET built-in translation
        // resources with a custom translation file.
        // Any resource file added, must be placed under a directory named "nls". You can use a path mapping or you can define
        // a path that is relative to the location of this main.js file.
        config: {
            ojL10n: {
                merge: {
                    //"ojtranslations/nls/ojtranslations": "./oraclejet/3.0.0/js/libs/oj/v3.0.0/resources/nls/myTranslations"
                }
            }
        }
    });

})( apex.jQuery, apex.debug );