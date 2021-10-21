// Import important packages
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const gutil = require('gulp-util');

// SASS -> CSS
var sass = require('gulp-sass')(require('sass'));
const Fiber = require('fibers');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sassLint = require('gulp-sass-lint');

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript / TypeScript
const buffer = require('vinyl-buffer');
const { createGulpEsbuild } = require('gulp-esbuild');

// Define important variables
const src = './src';
const dest = './dest';

// function Reload the Browser
const reload = (done) => {
  browserSync.reload();
  done();
};

// function für dev server
const serve = (done) => {
  browserSync.init({
    server: {
      baseDir: dest,
    },
  });
  done();
};

// Compile sass => css
const css = () => {
  return (
    gulp
      .src(`${src}/sass/**/*.sass`)
      .pipe(plumber())
      //Lint Sass
      .pipe(
        sassLint({
          options: {
            formatter: 'stylish',
          },
          rules: {
            'no-ids': 1,
            'final-newline': 0,
            'no-mergeable-selectors': 1,
            indentation: 0,
          },
        })
      )
      //Format Sass
      .pipe(sassLint.format())
      // 1-Start sourcemap , eigentliche resource für den css im dev untersuchen modus
      .pipe(sourcemaps.init())
      // Compile Sass -> CSS
      .pipe(sass.sync({ outputStyle: 'compressed' }))
      .on('error', sass.logError)
      // Add suffix
      .pipe(rename({ basename: 'style', suffix: '.min' }))
      //Add autoprefixer und cssNano webkit moz usw.
      .pipe(postcss([autoprefixer(), cssnano()]))
      // 2-Write sourcemap
      .pipe(sourcemaps.write(''))
      .pipe(gulp.dest(`${dest}/css`))
      // update browser
      .pipe(browserSync.stream())
  );
};

// compile .html to minify .html
const html = () => {
  return gulp
    .src(`${src}/*.html`)
    .pipe(plumber())
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        html5: true,
        removeEmptyAttributes: true,
        removeTagWhitespace: true,
        sortAttributes: true,
        sortClassName: true,
      })
    )
    .pipe(gulp.dest(`${dest}`));
};

//function to watch our changes and refraesh page
const watch = () =>
  gulp.watch(
    [`${src}/sass/**/*.sass`, `${src}/*.html`, `${src}/js/**/*.js`],
    gulp.series(html, css, reload)
  );

// all tastks for this project
const dev = gulp.series(html, css, serve, watch);

// Just build the Project
const build = gulp.series(html, css);

// Default function
exports.dev = dev;
exports.build = build;
exports.default = build;
