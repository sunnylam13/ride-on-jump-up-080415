// this is a little Node program, running on a Node server
// require() will look inside of a folder and get information, similar to import

// NOTE:  gulpfile.js must be in the main directory

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss = require('gulp-minify-css');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');

////////////////////////////////////////////
// 		JADE COMPILE
////////////////////////////////////////////

gulp.task('jade', function() {
	var jade_locals = {};

	// using src = ./*.jade causes index.layout.jade to also compile which we don't want... unless we have multiple main directory files... in which case we do use ./*.jade
	// otherwise use src = ./index.jade if there aren't other jade files in ./ (i.e. contact.jade, about.jade, etc.)
	return gulp.src('./index.jade')
		.pipe(plumber())
		.pipe(jade({
			locals: jade_locals,
			pretty: true
		}))
		.pipe(gulp.dest('./'))
});

////////////////////////////////////////////
// 		END JADE COMPILE
////////////////////////////////////////////


////////////////////////////////////////////
// 		SASS COMPILE
////////////////////////////////////////////

gulp.task('sass', function () {
	return gulp.src('css/*.scss')
				.pipe(plumber())
				.pipe(sass({
					'sourcemap=none':true,
					'errLogToConsole':true
				}))
				.pipe(concat('style.css'))
				.pipe(autoprefixer({
		            browsers: ['last 2 versions'],
		            cascade: false
		        }))
		        // .pipe(minifyCss({compatibility: 'ie8'}))
				.pipe(gulp.dest('css/'))
				.pipe(browserSync.stream());

});


////////////////////////////////////////////
// 		END SASS COMPILE
////////////////////////////////////////////





////////////////////////////////////////////
// 		BROWSER SYNC
////////////////////////////////////////////

gulp.task('server', ['sass','jade'], function() {

    browserSync.init({
        server: "./",
    });

    gulp.watch("css/*.scss", ['sass']);
    // to get SASS partials to trigger changes
    // the SCSS partials need to be in their own folder because css/*.scss causes all of them to trigger in the same directory, in the order they currently are which messes up everything
    gulp.watch("css/partials/*.scss", ['sass']);
    gulp.watch('./*.jade',['jade']);
    // to get jade partials to trigger changes
    gulp.watch('includes/*.jade',['jade']);
    // whenever the .js files change reload
    gulp.watch("js/*.js").on('change', reload);
    // whenever the .css file changes reload
    gulp.watch("css/*.css").on('change', reload);
    // whenever the .html file changes reload
    gulp.watch("*.html").on('change', reload);

    /* 
    * for angular view templates
    */
    gulp.watch("js/**/*.html").on('change', reload);
});

////////////////////////////////////////////
// 		END BROWSER SYNC
////////////////////////////////////////////



////////////////////////////////////////////
// 		DEFAULT
////////////////////////////////////////////

gulp.task('default', ['server'], function () {	
	// place everything in here in 'server'
});

////////////////////////////////////////////
// 		END DEFAULT
////////////////////////////////////////////


