'use strict';
(function() {
    var gulp = require('gulp');
    var config = require('./config.json');

    var rq = require('../../internal_utilities/apex_node_build/build.js')(gulp, config, {
        "apex": {
            "require": require
        }
    });

    var uglify = require('gulp-uglify');
    var flatten = require('gulp-flatten');
    var jsBuild = function() {
        rq("del")('js/minified/*.js');
        return gulp.src('js/*.js')
                .pipe(uglify({
                    mangle:           {},
                    preserveComments: false
                }))
                .pipe(flatten())
                .pipe(rq("gulp-chmod")({
                    owner: {
                        read: true,
                        write: true,
                        execute: true
                    },
                    group: {
                        read: true,
                        write: true,
                        execute: true
                    },
                    others: {
                        read: true,
                        write: true,
                        execute: true
                    }
                }))
                .pipe(rq("gulp-rename")({
                    suffix: '.min'
                }))
                .pipe(gulp.dest('js/minified'))
                .on("end", function() {
                    console.log("finished building JS for APEX_UI");
                    return gulp.src(
                            config.scripts.concat.files
                    )
                            .pipe(rq("gulp-concat")( config.scripts.concat.filename ))
                            .pipe(gulp.dest("js/minified/"))
                });
    };
    // gulp.task('js-build', jsBuild);
    // rq("apex").extendApexModule("build", jsBuild);

    gulp.task("watch-apex", function( cb ) {
        rq("browser-sync").init({
                proxy: {
                    target: "myapex/apex51"
                }
            }
        );
        rq("apex").watch( cb );
    });

})();
