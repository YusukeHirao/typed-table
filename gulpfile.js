var gulp = require('gulp');
var plumber = require("gulp-plumber");
var ts = require('gulp-typescript');
var notify  = require('gulp-notify');

var mainProject = ts.createProject('./tsconfig.json');

gulp.task('default', function () {
	var result = mainProject.src()
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(ts(mainProject));
	result.dts.pipe(gulp.dest('lib'));
	result.js.pipe(gulp.dest('lib'));
});

gulp.task('watch', function () {
	gulp.watch('src/*.ts', ['default']);
});