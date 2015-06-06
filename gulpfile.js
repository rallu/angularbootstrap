var gulp = require('gulp');
var domSrc = require('gulp-dom-src');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var cheerio = require('gulp-cheerio');
var clean = require('gulp-clean');
var ngAnnotate = require('gulp-ng-annotate');
var sass = require('gulp-sass');
var htmlmin = require('gulp-htmlmin');
var debug = require('gulp-debug');
var pleeease = require('gulp-pleeease');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var templateCache = require('gulp-angular-templatecache');
var ngModuleInject = require('gulp-angular-inject-module');
var gulpAngularExtender = require('gulp-angular-extender');
var config = require("./config.json");

var options = {
    mainmodulename: config.mainmodulename,
    mainScss: "public_html/app/main.scss",
    pleeaseOptions: {
        minifier: false,
        sourcemaps: false
    },
    htmlmin: {
        collapseWhitespace: true,
        addRootSlash: false,
        removeCommens: true
    }
};

gulp.task("bowerCSS", ['clean'], function(){
    return domSrc({file: 'public_html/index.html', selector: 'link[href^=bower]', attribute: 'href'})
        .pipe(concat("bower.css"))
        .pipe(cssmin())
        .pipe(gulp.dest('release/css/'));
});

gulp.task("clean", function() {
    return gulp.src('./release', {read: false})
        .pipe(clean());
});

gulp.task("copy", ['clean'], function() {
    return gulp.src(['./**/*', '!./bower{,/**/*}', '!./app{,/**/*}'], {
        cwd: 'public_html'
    }).pipe(gulp.dest('./release/'));
});


gulp.task("templateCache", ['clean'], function() {
    return gulp.src('public_html/app/**/*.html')
    .pipe(htmlmin(options.htmlmin))
    .pipe(templateCache({
        root: "app",
        standalone: true
    }))
    .pipe(gulp.dest("release/js/"));
});

gulp.task("bowerJS", ['clean'], function() {
    return domSrc({file: 'public_html/index.html', selector: 'script[src^=bower]', attribute: 'src'})
        .pipe(concat("libs.js"))
        .pipe(uglify())
        .pipe(gulp.dest('release/js/'));
});

gulp.task("appJS", ['clean'], function() {
    var angularExtenederOptions = {};
    angularExtenederOptions[options.mainmodulename] = ["templates"];

    return domSrc({file: 'public_html/index.html', selector: 'script[src]:not([src^=http]):not([src^=bower])', attribute: 'src'})
        .pipe(gulpAngularExtender(angularExtenederOptions))
        .pipe(concat("app.js"))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest("release/js/"));
});

gulp.task("sass", ['clean'], function() {
    return gulp.src(options.mainScss)
        .pipe(sass())
        .pipe(pleeease(options.pleeeaseOptions))
        .pipe(gulp.dest("release/css"));
});

gulp.task("cleanReleaseIndex", ['copy'], function() {
    var dt = new Date().getTime();

    return gulp.src('./public_html/index.html')
        .pipe(cheerio(function($) {
            $("script[src]:not([src^=http]), link[href^=bower]").remove();
            $("body").append('<script src="js/libs.js?'+dt+'"></script>');
            $("body").append('<script src="js/templates.js?'+dt+'"></script>');
            $("body").append('<script src="js/app.js?'+dt+'"></script>');
            $("head").append('<link href="css/bower.css" rel="stylesheet">');
            $("head link:not([href^=http])").each(function(index, elem) {
                $(elem).attr("href", $(elem).attr("href") + "?" + dt);
            });
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeCommens: true
        }))
        .pipe(gulp.dest('./release/'));
});

gulp.task('release', [
    'copy',
    //'bowerCSS',
    'bowerJS',
    'appJS',
    'templateCache',
    'cleanReleaseIndex',
    'sass'
]);

//////////////////////////////////////
// NODE DEVELOPMENT MODE
//////////////////////////////////////

var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
  return gulp.src('./**/*.js')
    .pipe(jshint());
});

gulp.task('develop:sass', function() {
  return gulp.src(options.mainScss)
    .pipe(sourcemaps.init())
    .pipe(sass({
        errLogToConsole: true
    }))
    .pipe(sourcemaps.write())
    .pipe(pleeease(options.pleeeaseOptions))
    .pipe(gulp.dest('./public_html/css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('develop', function () {
    browserSync({
        proxy: "localhost:8080",
        notify: false
    });

    gulp.run('develop:sass');
    gulp.watch('./public_html/scss/**/*', ['develop:sass']);
    gulp.watch(['./public_html/**/*.html', './public_html/**/*.js'], function() {
        browserSync.reload();
    });

    nodemon({
        script: 'server/server.js',
        ext: 'html js',
        ignore: ['node_modules', 'public_html', 'release'],
        env: { 'NODE_ENV': 'development', 'PORT': 8080
        }
    })
        .on('change', ['lint'])
        .on('restart', function () {
            console.log('restarted!');
        });
});

gulp.task('default', ['develop']);
