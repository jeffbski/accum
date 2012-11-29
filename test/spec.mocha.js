/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var spec = require('stream-spec');
var tester = require('stream-tester');
var accum = require('..'); // require('accum');

var t = chai.assert;

suite('stream-spec');

test('spec random pausing string stream - default auto factory', function (done) {
  var result;
  var astream = accum(function (err, alldata) {
    result = alldata;
  });
  spec(astream)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return 'abc';
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k 3char strings
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(astream)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(data); })
    .on('end', function () {
      t.equal(result.length, 3000);
      t.equal(result, manualAccum.join(''));
      done();
    });
});

test('spec random pausing Buffer stream with binary data - default auto factory', function (done) {
  var result;
  var astream = accum(function (err, alldata) {
    result = alldata;
  });
  spec(astream)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return new Buffer(crypto.randomBytes(1000));
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k * 1k binary Buffers
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(astream)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(data); })
    .on('end', function () {
      t.equal(result.length, 1000 * 1000);
      var digest = crypto.createHash('sha1').update(result).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(Buffer.concat(manualAccum)).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    });
});


// accum.buffer

test('spec random pausing string stream - accum.buffer factory', function (done) {
  var result;
  var astream = accum.buffer(function (err, alldata) {
    result = alldata;
  });
  spec(astream)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return 'abc';
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k 3char strings
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(astream)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(new Buffer(data)); })
    .on('end', function () {
      t.equal(result.length, 3000);
      var digest = crypto.createHash('sha1').update(result).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(Buffer.concat(manualAccum)).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    });
});

test('spec random pausing Buffer stream with binary data - accum.buffer factory', function (done) {
  var result;
  var astream = accum.buffer(function (err, alldata) {
    result = alldata;
  });
  spec(astream)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return new Buffer(crypto.randomBytes(1000));
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k * 1k binary Buffers
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(astream)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(data); })
    .on('end', function () {
      t.equal(result.length, 1000 * 1000);
      var digest = crypto.createHash('sha1').update(result).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(Buffer.concat(manualAccum)).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    });
});

