var gulp = require('gulp')
var sass = require('gulp-sass')
var cleanCSS = require('gulp-clean-css')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var htmlhint = require('gulp-htmlhint')
var sassLint = require('gulp-sass-lint')
var standard = require('gulp-standard')
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps = require('gulp-sourcemaps')
var inject = require('gulp-inject')
var gulpif = require('gulp-if')
var sequence = require('run-sequence')
var del = require('del')
var imagemin = require('gulp-imagemin')
var concat = require('gulp-concat')
var hash = require('gulp-hash')
var liveServer = require('gulp-live-server')
var exec = require('child_process').exec

var devEnv = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development')

gulp.task('default', function () {
  sequence('clean', ['styles', 'js', 'image', 'font'], 'hugo', 'html')
})
gulp.task('lint', ['js-lint', 'scss-lint', 'html-lint'])
gulp.task('html', function () {
  sequence('inject')
})
gulp.task('dev', function () {
  var server = liveServer.static('public', 8080)
  server.start()
  gulp.watch('public/**/*', function () {
    server.start.bind(server)()
  })
  gulp.watch('src/js/**/*.js', ['js'])
  gulp.watch('src/scss/**/*.scss', ['styles'])
  gulp.watch('layouts/**/*.html', function () {
    sequence('hugo', 'html')
  })
})

gulp.task('hugo', function (cb) {
  exec('hugo', function (err, stdout, stderr) {
    if (err) {
      console.log(stderr)
    } else {
      console.log(stdout)
    }
    cb()
  })
})

// Compiles SCSS files from /scss into /css
gulp.task('styles', function () {
  return gulp.src('src/scss/main.scss')
    .pipe(gulpif(devEnv, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(devEnv, sourcemaps.write()))
    .pipe(gulpif(!devEnv, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpif(!devEnv, hash()))
    .pipe(gulpif(!devEnv, rename({ suffix: '.min' })))
    .pipe(gulp.dest('public'))
})

// Minify custom JS
gulp.task('js', function () {
  gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/smoothscroll-polyfill/dist/smoothscroll.min.js'
  ])
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public'))

  return gulp.src('src/js/main.js')
    .pipe(gulpif(!devEnv, uglify()))
    .pipe(gulpif(!devEnv, hash()))
    .pipe(gulpif(!devEnv, rename({ suffix: '.min' })))
    .pipe(gulp.dest('public'))
})

gulp.task('image', function () {
  return gulp.src('src/image/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('public/image'))
})

gulp.task('font', function () {
  return gulp.src([
    'node_modules/font-awesome/fonts/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json'
  ])
    .pipe(gulp.dest('public/fonts'))
})

gulp.task('inject', function () {
  return gulp.src(['public/**/*.html'])
    .pipe(
      inject(
        gulp.src(['public/*.css'], { read: false }),
        { addRootSlash: true, relative: true, name: 'head' }
      )
    )
    .pipe(
      inject(
        gulp.src(['public/vendor.min.js', 'public/main*.js'], { read: false }),
        {
          addRootSlash: true,
          relative: true,
          name: 'footer',
          transform: function (filePath, file, i, length) {
            return '<script src="' + filePath + '" defer></script>'
          }
        }
      )
    )
    .pipe(gulp.dest('public'))
})

gulp.task('inject-js', function () {
  gulp.src(['public/**/*.html'])
    .pipe(
      inject(
        gulp.src(['public/vendor.min.js', 'public/main*.js'], { read: false }),
        {
          addRootSlash: true,
          relative: true,
          name: 'footer',
          transform: function (filePath, file, i, length) {
            return '<script src="' + filePath + '" async></script>'
          }
        }
      )
    )
    .pipe(gulp.dest('public'))
})

// HTML Linting task
gulp.task('html-lint', function () {
  return gulp.src(['layouts/**/*.html'])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'))
    .pipe(htmlhint.failAfterError())
})

// SCSS Linting task
gulp.task('scss-lint', function () {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
})

// JS Linting task
gulp.task('js-lint', function () {
  return gulp.src(['src/js/**/*.js', '!js/**/*min.js', 'gulpfile.js'])
    .pipe(standard({ globals: ['jQuery'] }))
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

// Clean the public dir
gulp.task('clean', function () {
  return del('public/**/*')
})
