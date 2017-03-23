var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var exec = require('child_process').exec;
var http = require('http');
var path = require('path');
var st = require('st');
var Router = require('routes-router');

var main = require('./package.json').main;

gulp.task('watch', function() {
  gulp.watch(['./*.js'], ['protractor']);
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
  server.listen(9000);
  return server;
}

gulp.task('protractor', ['build', 'webdriver'], function (cb) {
  var server = startServer();
  var cmd = path.resolve(__dirname, 'node_modules/.bin/protractor') + ' protractor' +
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
  exec(path.resolve(__dirname, 'node_modules/.bin/webdriver-manager') + ' update', cb);
});

gulp.task('test', ['protractor']);
gulp.task('build', ['browserify']);
gulp.task('default', ['test']);
