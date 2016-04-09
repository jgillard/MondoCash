const gulp = require('gulp');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const eslint = require('gulp-eslint');
const gCrashSound = require('gulp-crash-sound');

gulp.task('default', ['watch']);

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.js',['js']);
});

gulp.task('build', function(callback) {
  runSequence('clean', 'static', 'lib', 'js', callback);
});

gulp.task('clean', () =>
  gulp.src('build', {read: false})
    .pipe(clean())
);

gulp.task('static', () =>
  gulp.src(['src/**/*.html', 'src/**/*.css'])
    .pipe(gulp.dest('build'))
);

gulp.task('lib', () =>
  gulp.src('src/lib/**.*')
    .pipe(gulp.dest('build/lib'))
);

gulp.task('js', () => {
    browserify({
      entries: 'src/script.js',
      debug: true
    })
    .transform(["babelify",{presets: ["es2015"]}])
    .bundle()
    .pipe(eslint.format())
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('build'));
});