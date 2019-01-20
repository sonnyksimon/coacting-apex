'use strict';
/**
 *  Universal Theme Build
 *
 *  Assembles the styles and scripts for UT.
 *  Comes with the following features:
 *    -  Theme-Roller compatible Theme Creation
 *    -  "Overriding" Theme Roller themes
 *    -  Concatenates javascript files.
 *
 */
(function() {
    var buildStart = new Date().getTime();
    // The core build to be used for the normal SCSS conversions.
    var coreBuild = require('../../../../internal_utilities/apex_node_build/build.js');
    var gulp = require('gulp');
    var config = require('./config.json');
    var gutil = require('gulp-util');

    // Writing custom functions in less is difficult. To workaround this, all the functions we have in SASS
    // are just shorthands, i.e. functions inside of functions without any control flow or conditionals.
    var function_replacements = require('./node_modules/function_replacements.js');
    // The replacements for SASS are the function replacements + the SASS-to-LESS syntax replacements.
    var sassReplacements = function_replacements.concat(require('./node_modules/less_replacements.js'));

    var lessBuilds = [];
    (function() {
        for (var key in config.dir) {
            var dir = config.dir[key];
            if (dir.less) {
                lessBuilds.push(key);
                dir.paths = (dir.paths || []).concat([
                    [".*less/", ""],
                    [".*less-src", "theme/" + key +  "/less-src"]
                ]);
                dir.watch = ["./scss/theme/" + key + "/**/*.scss"];
                dir.clean = ["./less/theme/" + key + "/**/*.less"];
                dir.outputDir = "theme/";
                // Original SRC is only for transferring the files over!
                dir.cwd = "./";
                dir.src.forEach(function(src, index, arr) {
                    arr[index] = "./scss/" + arr[index];
                });
                dir.originalSrc = dir.src;
                dir.src = [];
                dir.originalSrc.forEach(function(src ) {
                    dir.src.push(src.replace(/scss/g, 'less'));
                });
                if (dir.override) {
                    dir.originalSrc.unshift( "!./scss/theme/" +  dir.override +  "/_variables.scss" );
                    dir.originalSrc.push( "./scss/theme/" +  dir.override +  "/**/*.scss" );
                }
            }
        };
    })();
    var rq = coreBuild(gulp, config, {
        "apex": {
            "require": require
        }
    });
    lessBuilds.forEach(function(dir) {
        var configDir = config.dir[dir];
        configDir.alterSrc = function ( piped ) {
            return require("merge2")(
                piped,
                gulp.src(['less/less-src/**/*.less'], {base: "./less"})
                    .pipe(
                        rq("gulp-replace")(/@import.*_variables/, "@import \"../theme/" + dir + "/_variables")
                )
            )
        };
        configDir.buildCSS = function (vinyl) {
            var piped = gulp.src( configDir.originalSrc );
            var replace = rq("gulp-replace");
            var rename = rq("gulp-rename");
            var clone = rq("gulp-clone");
            var merge = require("merge2");
            var chmod = rq('gulp-chmod');

            piped = piped.pipe(chmod({
                        owner: {
                            read: true,
                            write: true,
                            execute: true
                        },
                        group: {
                            execute: true
                        },
                        others: {
                            execute: true
                        }
                    }));
            var convertSassToLess = function() {
                var convert = function ( piped, replacements ) {
                    replacements.forEach(function (replacement) {
                        piped = piped.pipe(
                            replace(
                                replacement.pattern,
                                replacement.replacement
                            )
                        )
                    });
                    return piped;
                };
                convert( piped, sassReplacements );
                piped = piped
                    .pipe(replace(/\.\.\/\.\.\/modules\//, ""))
                    .pipe(replace(/"variables/, "\"_variables"))
                var concatPipe =  piped .pipe(clone());
                if ( !vinyl ) {
                    if (configDir.override) {
                        concatPipe = merge(
                            convert( gulp.src( "./scss/theme/" + configDir.override + "/_variables.scss" ), sassReplacements ),
                            concatPipe
                        );
                    }
                    merge(
                        concatPipe,
                        convert(
                            gulp.src( "./less/less-src/**/*.less" ), function_replacements)
                                .pipe(replace(".*@import.*", "")))
                        .pipe(replace(/.*@import.*/g, ""))
                        .pipe(rq("gulp-concat")(config.dir[dir].name + ".less"))
                        .pipe(gulp.dest("less/theme/"));
                }
                piped
                    .pipe(rename({
                        extname: ".less"
                    }))
                    .pipe(gulp.dest("./less/theme/" + dir).on("end", function () {
                        return rq("apex").buildCSS(dir, vinyl);
                    }));
                return piped;
            };
            if ( vinyl ) {
                if ( vinyl.event !== "add" && vinyl.event !== "unlink" )  {
                    // Removing to stop gulp from breaking
                    // piped = piped.pipe( cache( "less" ) );
                } else if (vinyl.event === "unlink") {
                    rq("del")([vinyl.path.replace(/scss/g,"less")]).then(convertSassToLess);
                    return piped;
                }
            }
            return convertSassToLess();
        };
        configDir.preProcessor = function() {
            return  require("gulp-less")({
                compress: true
            }).on('error', function(err) {
                gutil.log(err.message);
            });
        }

    });
    gulp.task("clean", function() {
        return rq("del")(
            [
                "!.svn", "css/**/*.css", "less/theme/**/*.less", "less/theme/**/*.scss"
            ]
        );
    });

    gutil.log("Finished setting up UT 1.2 build. (Took "  +  (new Date().getTime() - buildStart) + " ms )");

    gulp.task("watch-apex", function( cb ) {
        rq("browser-sync").init({
                proxy: {
                    target: "myapex/apex52"
                }
            }
        );
        rq("apex").watch( cb );
    });

    gulp.task("watch-server", function( cb ) {
        var watch2 =  rq("gulp-watch");
        rq("apex").watchServer(cb);
    });

})();
