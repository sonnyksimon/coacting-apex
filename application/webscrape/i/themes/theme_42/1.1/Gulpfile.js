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
                    .pipe(rq("gulp-chmod")(777));
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
                "!.svn", "css/**/*.css", "less/theme/**/*.less"
            ]
        );
    });

    gulp.task('build:js', function() {
        jsBuild();
    });

    var jsBuild = function() {
      var tmpDir = "js/tmp";
      var tmpModules = "theme42_modules.js";
      rq("del")(['js/tmp','js/theme42.js']);
      console.log('in js build');
      gulp.src(config.scripts.modules)
        .pipe(rq("gulp-concat")(tmpModules))
        .pipe(rq("gulp-chmod")(777))
        .pipe(gulp.dest(tmpDir + "/")
          .on("end", function() {
            var fs = require("fs");
            console.log('after require fs');
            var modulesFilename = fs.readFileSync(require("path").join(__dirname, tmpDir) + '/' + tmpModules, 'utf8');
            gulp.src(config.scripts.src).pipe(
              rq("gulp-replace")(
                /\/\* @import_modules \*\//ig,
                modulesFilename
              )
            )
            .pipe(rq("gulp-rename")("theme42.js"))
            .pipe(rq("gulp-chmod")({ //Chmod 777 because I lose patience. Sorry, Vlad.
                owner: {
                    read: true,
                    write: true,
                    execute: false
                },
                group: {
                    read: true,
                    write: false,
                    execute: false
                },
                others: {
                    read: true,
                    write: false,
                    execute: false
                }
            }))
            .pipe(gulp.dest("js/")
              .on("end", function() {
                gutil.log("Finished building theme42.js");
                rq("del")([tmpDir]);
              })
            )
          })
        );
    };

    gutil.log("Finished setting up UT 1.1 build. (Took "  +  (new Date().getTime() - buildStart) + " ms )");

    gulp.task("watch-apex", function( cb ) {
        rq("browser-sync").init({
                proxy: {
                    target: "myapex/apex51"
                }
            }
        );
        rq("apex").watch( cb );
    });

    gulp.task("watch-server", function( cb ) {
        var watch2 =  rq("gulp-watch");
        watch2(['./js/src/**/*.js','!./js/src/tmp/*'], function( vinyl ) {
            gutil.log('File ' + vinyl.basename + ' modified.');
            jsBuild();
        });
        rq("apex").watchServer(cb);
    });

    gulp.task('build',function() {
        console.log('Building Production UT');
        jsBuild();
        rq("apex").build('prod');
    });

    gulp.task('build-dev',function() {
        console.log('Building Development UT');
        jsBuild();
        rq("apex").build('dev');
    });

})();
