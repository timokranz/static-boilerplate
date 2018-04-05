// basic gulp package
var gulp = require("gulp");

// for watching sass files
var sass = require("gulp-sass");

// for working on sass globs on the component folder
var sassGlob = require("gulp-sass-glob");

// sourcemaps for to trace which sass file
var sourcemaps = require("gulp-sourcemaps");

// for autoprefixing
var autoprefixer = require("gulp-autoprefixer");

// for live reloading
var browserSync = require("browser-sync").create();

// minifying images
var imagemin = require("gulp-imagemin");

// minifying css
var cssnano = require("gulp-cssnano");

var useref = require("gulp-useref");
var cache = require("gulp-cache");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");

// runs gulp tasks in specified order
var runSequence = require("run-sequence");

var del = require("del");

gulp.task("images", function() {
  return (
    gulp
      .src("app/img/**/*.+(png|jpg|jpeg|gif|svg)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin({
            interlaced: true
          })
        )
      )
      .pipe(gulp.dest("dist/img"))
  );
});

gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));
});

gulp.task("watch", ["browserSync", "sass"], function() {
  gulp.watch("app/scss/*.scss", ["sass"]).on("change", browserSync.reload);
  gulp.watch("app/scss/**/*.scss", ["sass"]).on("change", browserSync.reload);
  gulp.watch("app/*.html", browserSync.reload);
  gulp.watch("app/js/**/*.js", browserSync.reload);
});

gulp.task("build", ["clean", "sass", "useref", "images", "fonts"], function() {
  console.log("Building our awesome site yo!");
});

gulp.task("build", function(callback) {
  runSequence("clean:dist", ["sass", "useref", "images", "fonts"], callback);
});

gulp.task("default", function(callback) {
  runSequence(["sass", "browserSync", "watch"], callback);
});

gulp.task("clean:dist", function() {
  return del.sync("dist");
});

gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "app"
    }
  });
});

gulp.task("sass", function() {
  return gulp
    .src("app/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(autoprefixer({ browsers: ["last 2 versions"], cascade: false }))
    .pipe(sass())
    .pipe(sourcemaps.write("./maps"))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("useref", function() {
  return (
    gulp
      .src("app/*.html")
      .pipe(useref())
      //minifies only if js file
      .pipe(gulpIf("*.js", uglify()))
      //minifies only if css file
      .pipe(gulpIf("*.css", cssnano()))
      .pipe(gulp.dest("dist"))
  );
});
