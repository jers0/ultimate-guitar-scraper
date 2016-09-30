var utils = require('../lib/utils');
var ugs   = require('../lib/index');
var fs    = require('fs');


var basicSearchQuery = function () {
  return {
    bandName: 'Muse'
  };
};

var basicAutocompleteQuery = function () {
  return {
    query: 'Ozzy'
  };
};

var completeSearchQuery = function () {
  return {
    query: 'Ozzy Osbourne',
    query: 'Carzy',
    type: 'tab'
  };
};

var completeSearchQuery = function () {
  return {
    bandName: 'Black Keys',
    songName: 'Little Black Submarines',
    type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
    page: 1
  };
};


describe('utils', function() {

  describe('encodeParams', function () {
    it('encode params', function () {
      var query = completeSearchQuery();
      expect(utils.encodeParams(query)).toBe('bandName=Black+Keys&songName=Little+Black+Submarines&type%5B%5D=video+lessons&type%5B%5D=tabs&type%5B%5D=chords&type%5B%5D=bass+tabs&type%5B%5D=guitar+pro+tabs&type%5B%5D=power+tabs&type%5B%5D=drum+tabs&type%5B%5D=ukulele+chords&page=1');
    });
  });

  describe('formatAutocompleteSearchQuery', function () {
    it('is invalid without param query', function () {
      expect(function() {
        utils.formatAutocompleteSearchQuery({});
      }).toThrowError(Error);
    });

    it('is invalid with bad param type', function () {
      expect(function() {
        utils.formatAutocompleteSearchQuery({
          query: 'Muse',
          type: 'artisssssst'
        });
      }).toThrowError(Error);
    });

    it("is invalid without param 'artist' if param 'type' is 'tab'", function () {
      expect(function() {
        utils.formatAutocompleteSearchQuery({
          query: 'New Born',
          type: 'tab'
        });
      }).toThrowError(Error);
    });

    it('uses default params', function() {
      var query = basicAutocompleteQuery();
      expect(utils.formatAutocompleteQuery(query)).toEqual({
        q: 'Ozzy',
        type: 'artist'
      });
    });
  });

  describe('formatSearchQuery', function () {
    it('is invalid without param bandName', function() {
      expect(function() {
        utils.formatSearchQuery({});
      }).toThrowError(Error);
    });

    it('uses default params', function() {
      var query = basicSearchQuery();
      expect(utils.formatSearchQuery(query)).toEqual({
        band_name: 'Muse',
        type: [ 300, 200 ],
        page: 1,
        view_state: 'advanced',
        tab_type_group: 'text',
        app_name: 'ugt',
        order: 'myweight',
        version_la: ''
      });
    });

    it('uses params', function() {
      var query = completeSearchQuery();
      expect(utils.formatSearchQuery(query)).toEqual({
        band_name: 'Black Keys',
        song_name: 'Little Black Submarines',
        type: [ 100, 200, 300, 400, 500, 600, 700, 800 ],
        page: 1,
        view_state: 'advanced',
        tab_type_group: 'text',
        app_name: 'ugt',
        order: 'myweight',
        version_la: ''
      });
    });
  });

  describe('parseListTABs', function() {
    it('parses TABs', function() {
      var html = fs.readFileSync('./spec/request.html');
      var tabs = utils.parseListTABs(html);
      expect(Array.isArray(tabs)).toBe(true);
      expect(tabs.length).toBe(52);
    });
  });

});


describe('ultimate-guitar-scraper', function() {
  it('searches TABs', function (done) {
    var query = basicSearchQuery();
    ugs.search(query, function(error, results) {
     expect(error).toBeNull();
     expect(Array.isArray(results)).toBe(true);
     done();
    });
  });

  it('searches TABs with request options', function (done) {
    var query = completeSearchQuery();
    var requestOptions = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
    };
    ugs.search(query, function(error, results, response, body) {
      expect(error).toBeNull();
      expect(Array.isArray(results)).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(typeof body).toBe('string');
      done();
   }, requestOptions);
  });

});
