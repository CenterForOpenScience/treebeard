var gulp = require('gulp');
var concat = require("gulp-concat");
var minifyCSS = require('gulp-minify-css');
var less = require('gulp-less');
var generate = require('./scripts/generate');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var paths = {
    cssfiles : [
        "./bower_components/bootstrap/dist/css/*.min.css",
        "./less/*.css",
        "./css/*.css"
    ],
    jsfiles : [
        "./bower_components/jquery/dist/*.min.js",
        "./bower_components/jquery-ui/*.min.js",
        "./bower_components/jquery-mockjax/*.js",
        "./bower_components/bootstrap/dist/js/*.min.js",
        "./bower_components/mithril/mithril.min.js",
        "./scripts/dropzone.js",
        "./scripts/grid.js"
    ],
    json : "./sample.json",
    less : "./less/*.less"
};

gulp.task('generate-max', function() {
    // gulp.src -- get html template
    return gulp.src(paths.json)
        // pipe through plugin
        .pipe(generate(100000, 7))
        // set destination
        .pipe(gulp.dest("./demo"));
});

gulp.task('generate-min', function() {
    // gulp.src -- get html template
    return gulp.src(paths.json)
        // pipe through plugin
        .pipe(generate(50, 6))
        .pipe(rename("small.json"))
        // set destination
        .pipe(gulp.dest("./demo"));
});


gulp.task("less", function(){
    gulp.src(paths.less)
        .pipe(less())
        .pipe(gulp.dest('./less'));
});

gulp.task('css', ["less"], function(){
    return gulp.src(paths.cssfiles)
        .pipe(concat('bundle.css'))
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest('./demo/'));
});

gulp.task('js', function(){
    return gulp.src(paths.jsfiles)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./demo/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.less, ['css', 'css-dist-min']);
    gulp.watch(paths.jsfiles, ['js', 'js-dist-min']);
});

gulp.task('css-dist-min', ["less"], function(){
    return gulp.src("./less/style.css")
        .pipe(minifyCSS())
        .pipe(rename("treebeard.min.css"))
        .pipe(gulp.dest('./dist'));
});

gulp.task('js-dist-min', function(){
    return gulp.src('./scripts/grid.js')
        .pipe(uglify())
        .pipe(rename("treebeard.min.js"))
        .pipe(gulp.dest('./dist'));
});

gulp.task('css-dist-full', ["css-dist-min"], function(){
    return gulp.src("./less/style.css")
        .pipe(rename("treebeard.css"))
        .pipe(gulp.dest('./dist'));
});

gulp.task('js-dist-full',  ["js-dist-min"], function(){
    return gulp.src('./scripts/grid.js')
        .pipe(rename("treebeard.js"))
        .pipe(gulp.dest('./dist'));
});


gulp.task("default", ["css", "js", "watch","js-dist-full", "css-dist-full" ]);