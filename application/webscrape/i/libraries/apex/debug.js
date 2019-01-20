/*!
 Copyright (c) 2012, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*global apex,console*/
/**
 * The apex.debug namespace is used to store all debug functions of Oracle Application Express.
 */

/**
 * This namespace stores all debug functions of Oracle Application Express.
 * @namespace
 */
apex.debug = {};

/* API for compatibility. Use apex.debug.log instead */
apex.debug = function() {
    "use strict";

    apex.debug.log.apply( this, arguments );
}; // debug


(function( debug, $ ) {
    "use strict";

    function noop() {
    }

    // ie7 doesn't support the apply method on console methods such as log so we have this lame version of logging
    function ie7log(a,b,c) {
        if ( c !== undefined ) {
            console.log(a,b,c);
        } else if ( b !== undefined ) {
            console.log(a,b);
        } else {
            console.log(a);
        }
    }

    var gDebugLogLevel = -1,
        log = noop,
        error = noop,
        warn = noop,
        info = noop;

    if ( window.console && console.log ) {
        if ( typeof console.log.apply === "undefined" ) {
            log = ie7log;
            error = ie7log;
            warn = ie7log;
            info = ie7log;
        } else {
            log = console.log;
            if ( console.error ) {
                error = console.error;
            } else {
                error = console.log;
            }
            if ( console.warn ) {
                warn = console.warn;
            } else {
                warn = console.log;
            }
            if ( console.info ) {
                info = console.info;
            } else {
                info = console.log;
            }
        }
    }

    /**
     * Log level constants
     * @member {object} LOG_LEVEL
     * @memberof apex.debug
     * @property {number} LOG_LEVEL.OFF Logging is off. Value is 0.
     * @property {number} LOG_LEVEL.ERROR Error logging level. Value is 1.
     * @property {number} LOG_LEVEL.WARN Warning logging level. Value is 2.
     * @property {number} LOG_LEVEL.INFO Information logging level. Value is 4.
     * @property {number} LOG_LEVEL.APP_TRACE Application tracing logging level. Value is 6.
     * @property {number} LOG_LEVEL.ENGINE_TRACE Engine tracing logging level. Value is 9.
     */
    debug.LOG_LEVEL = {
        OFF: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 4,
        APP_TRACE: 6,
        ENGINE_TRACE: 9
    };

    /**
     * <p>Method that returns the debug log level.
     * The debug log level is synchronized with hidden input element <code class="prettyprint">#pdebug</code>.</p>
     *
     * @function getLevel
     * @memberof apex.debug
     * @returns {number} Logging level as an integer 1 to 9, or 0 to indicate debug logging is turned off.
     * @example <caption>This example retrieves the logging level, prepends "Level=" and logs to the console.</caption>
     * apex.debug.log( "Level=", apex.debug.getLevel() );
     */
    debug.getLevel = function() {
        var lDebugValue;

        if ( gDebugLogLevel < 0 ) {
            lDebugValue = $( "#pdebug", apex.gPageContext$ ).val();

            if ( lDebugValue === "YES" ) {
                gDebugLogLevel = debug.LOG_LEVEL.INFO;
            } else {
                if ( /^LEVEL[0-9]$/.test( lDebugValue ) ) {
                    gDebugLogLevel = parseInt( lDebugValue.substr( 5 ), 10 );
                } else {
                    gDebugLogLevel = debug.LOG_LEVEL.OFF;
                }
            }
        }
        return gDebugLogLevel;
    }; // getLevel

    /**
     * <p>Method that sets the debug log level. Log messages at or below the specified level are written to the
     * console log. It is rarely necessary to call this function because the debug log level is
     * synchronized with the hidden input element <code class="prettyprint">#pdebug</code> that comes from the server.</p>
     *
     * @function setLevel
     * @memberof apex.debug
     * @param {number} pLevel A number from 1 to 9, where level 1 is most important, and level 9 is least important.
     *   Can be one of the LOG_LEVEL constants. Any other value such as 0 will turn off debug logging.
     * @example <caption>This example sets the logging level to application tracing.</caption>
     * apex.debug.setLevel( apex.debug.LOG_LEVEL.APP_TRACE) );
     */
    debug.setLevel = function( pLevel ) {
        var lLevel, lPdebug$,
            lOldLevel = gDebugLogLevel;

        gDebugLogLevel = typeof pLevel === "number" ? pLevel : debug.LOG_LEVEL.OFF;
        if ( gDebugLogLevel < 0 || gDebugLogLevel > 9 ) {
            gDebugLogLevel = debug.LOG_LEVEL.OFF;
        }
        if ( gDebugLogLevel !== lOldLevel ) {
            lLevel = "LEVEL" + gDebugLogLevel;
            lPdebug$ = $( "#pdebug", apex.gPageContext$ );
            if ( lPdebug$.length === 0 ) {
                lPdebug$ = $( "<input id='pdebug' type='hidden' name='p_debug'>" ).prependTo( $( "#wwvFlowForm", apex.gPageContext$ ) );
            }
            lPdebug$.val( lLevel );
        }
    }; // setLevel

    /**
     * <p>Log a message at the given debug log level. The log level set from the server or with {@link apex.debug.setLevel}
     * controls if the message is actually written. If the set log level is >= pLevel then the message is written.
     * Messages are written using the browsers built-in console logging, if available.
     * Older browsers may not support the console object or all of its features.</p>
     *
     * @function message
     * @memberof apex.debug
     * @param {number} pLevel A number from 1 to 9, where level 1 is most important, and level 9 is
     *   least important. Can be one of the {@link apex.debug.LOG_LEVEL} constants.
     *   Any other value such as 0 will turn off debug logging.
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example writes the message "Testing" to the console if the logging level is
     *   greater than or equal to 7.</caption>
     * apex.debug.message( 7, "Testing" );
     */
    debug.message = function( pLevel ) {
        var fn = log;
        // don't have trace and the other methods call this one because of the extra function call and arguments processing overhead
        // Only log message if running in APEX 'Debug Mode' and level is pLevel or more
        if ( debug.getLevel() >= pLevel && pLevel > 0) {
            if ( pLevel === debug.LOG_LEVEL.ERROR ) {
                fn = error;
            } else if ( pLevel <= debug.LOG_LEVEL.WARN ) {
                fn = warn;
            } else if ( pLevel <= debug.LOG_LEVEL.INFO ) {
                fn = info;
            }
            fn.apply( console, Array.prototype.slice.call( arguments, 1 ) );
        }
    }; // message

    /**
     * <p>Log an error message. The error function always writes the error, regardless of the log level from the server
     * or set with {@link apex.debug.setLevel}.
     * Messages are written using the browsers built-in console logging, if available. If supported, console.trace is called.
     * Older browsers may not support the console object or all of its features.</p>
     *
     * @function error
     * @memberof apex.debug
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example writes the message "Update Failed" to the console.</caption>
     * apex.debug.error( "Update Failed" );
     * @example <caption>This example writes an exception message (from variable
     * <code class="prettyprint">ex</code>) to the console.</caption>
     * apex.debug.error( "Exception: ", ex );
     */
    debug.error = function() {
        // always log errors
        error.apply( console, arguments );
        // some console implementations include a trace in the error output but for those that don't...
        if ( console.trace ) {
            console.trace();
        }
        // todo consider adding a stack trace for browsers that don't support trace
        // if dev toolbar is present let it alert the user that there are errors
        if ( apex._dtNotifyErrors ) {
            apex._dtNotifyErrors();
        }
    };  // error

    /**
     * <p>Log a warning message. Similar to {@link apex.debug.message} with the level set to WARN.</p>
     *
     * @function warn
     * @memberof apex.debug
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example writes a warning message to the console if the debug log level is WARN or greater.</caption>
     * apex.debug.warn( "Empty string ignored" );
     */
    debug.warn = function() {
        // Only log message if running in APEX 'Debug Mode' and level is WARN or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.WARN ) {
            warn.apply( console, arguments );
        }
    }; // warn

    /**
     * <p>Log an informational message. Similar to {@link apex.debug.message} with the level set to INFO.</p>
     *
     * @function info
     * @memberof apex.debug
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example prints an informational message to the console if the log level is
     *    INFO or greater.</caption>
     * apex.debug.info( "Command successful" );
     */
    debug.info = function() {
        // Only log message if running in APEX 'Debug Mode' and level is INFO or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.INFO ) {
            info.apply( console, arguments );
        }
    }; // info

    /**
     * <p>Log a trace message. Similar to {@link apex.debug.message} with the level set to APP_TRACE.</p>
     *
     * @function trace
     * @memberof apex.debug
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example writes a log message to the console if the debug log level is APP_TRACE
     *   or greater.</caption>
     * apex.debug.trace( "Got click event: ", event );
     */
    debug.trace = function() {
        // Only log message if running in APEX 'Debug Mode' and level is APP_TRACE or more
        if ( debug.getLevel() >= debug.LOG_LEVEL.APP_TRACE ) {
            log.apply( console, arguments );
        }
    };  // trace

    /**
     * <p>Log a message. Similar to {@link apex.debug.message} with the level set to the highest level.</p>
     *
     * @function log
     * @memberof apex.debug
     * @param {...*} arguments Any number of parameters which will be logged to the console.
     * @example <caption>This example gets the logging level and writes it to the console,
     *   regardless of the current logging level.</caption>
     * apex.debug.log( "Level=", apex.debug.getLevel() );
     */
    debug.log = function() {
        // Only log message if running in APEX 'Debug Mode'
        if ( debug.getLevel() > debug.LOG_LEVEL.OFF ) {
            log.apply( console, arguments );
        }
    }; // log

    /*
     * For internal use only
     */
    debug.deprecated = function( message ) {
        debug.warn( "DEPRECATED: " + message );
    };

    /**
     * <p>Return a function that times how long it takes pFunction to execute when called.</p>
     * <p>This function makes use of the performance API.</p>
     *
     * @ignore
     * @param {string} pLabel
     * @param {function} pFunction
     * @param {*} pContext
     * @param {...*} arguments
     * @return {*}
     */
    debug.timeCall = function( pLabel, pFunction, pContext ) {
        var f = function( ) {
            var ret,
                bl = pLabel + "_begin",
                el = pLabel + "_end";

            // todo consider a polyfill for mark/measure
            if ( performance.mark ) {
                performance.mark( bl );
            }
            ret = pFunction.apply( pContext || this, arguments );
            if ( performance.mark ) {
                performance.mark( el );
                performance.measure( pLabel, bl, el );
            }
            return ret;
        };
        return f;

    };

    /**
     * todo
     * @ignore
     * @param pLabel
     */
    debug.timeBegin = function( pLabel ) {
        if ( performance.mark ) {
            performance.mark( pLabel + "_begin" );
        }
    };

    /**
     * todo
     * @ignore
     * @param pLabel
     */
    debug.timeEnd = function( pLabel ) {
        var ret,
            bl = pLabel + "_begin",
            el = pLabel + "_end";
        if ( performance.mark ) {
            performance.mark( el );
            performance.measure( pLabel, bl, el );
        }
    };

    /**
     * todo
     * @ignore
     * @param pLabel
     */
    debug.timeMark = function( pLabel ) {
        if ( performance.mark ) {
            performance.mark( pLabel );
        }
    };

})( apex.debug, apex.jQuery );
