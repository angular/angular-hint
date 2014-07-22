var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var exec = require('child_process').exec;
var http = require('http');
var st = require('st');
var Router = require('routes-router');

var main = require('./package.json').main;

gulp.task('watch', function() {
  gulp.watch(['./*.js'], ['browserify']);
});

gulp.task('browserify', function() {
  var bundleStream = browserify('./' + main).bundle().pipe(source(main));
  return bundleStream.pipe(gulp.dest('./dist'));
});


gulp.task('serve', startServer);

function startServer() {
  var app = Router();
  app.addRoute('/*', st({
    path: __dirname + '/',
    url: '/',
    index: 'index.html'
  }));
  server = http.createServer(app);
  server.listen(8080);
  return server;
}

gulp.task('protractor', ['webdriver'], function (cb) {
  var server = startServer();
  var cmd = './node_modules/.bin/protractor protractor' +
      (process.env.TRAVIS_JOB_NUMBER ? '-travis' : '') +
      '.conf.js';

  exec(cmd, function (err, stdout, stderr) {
    server.close();
    if (err) {
      console.log(stdout, stderr);
    } else {
      console.log(stdout);
    }
    cb(err);
  });
});

gulp.task('webdriver', function (cb) {
  exec('./node_modules/.bin/webdriver-manager update', cb);
});

gulp.task('test', ['webdriver', 'protractor']);
gulp.task('build', ['browserify']);
gulp.task('default', ['build', 'test']);
