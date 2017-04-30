var utils = require('../lib/utils'),
    ugs   = require('../lib/index'),
    fs    = require('fs');


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;


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

  describe("formatAutocompleteQuery", function () {

    // TODO implement this spec.
    // ...

  });

});


describe('ultimate-guitar-scraper', function() {

  describe('search', function () {
    it('searches TABs', function (done) {
      var query = basicSearchQuery();
      ugs.search(query, function(error, results) {
        expect(error).toBeNull();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
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
        expect(results.length).toBeGreaterThan(0);

        expect(response.statusCode).toBe(200);
        expect(typeof body).toBe('string');
        done();
      }, requestOptions);
    });
  });

  describe("get", function () {
    var tabURl;

    beforeEach(function () {
      tabUrl = 'https://tabs.ultimate-guitar.com/t/the_black_keys/little_black_submarines_ver2_tab.htm';
    });

    it("get the TAB", function (done) {
      ugs.get(tabUrl, function(error, tab) {
        expect(error).toBeNull();
        expect(typeof tab).toBe('object');
        expect(typeof tab.name).toBe('string');
        expect(typeof tab.type).toBe('string');
        expect(typeof tab.artist).toBe('string');
        // Optional properties.
        expect(typeof tab.rating).not.toBe('undefined');
        expect(typeof tab.numberRates).not.toBe('undefined');
        expect(typeof tab.difficulty).not.toBe('undefined');
        done();
      });
    });

    it("get the TAB with request options", function (done) {
      var requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      };
      ugs.get(tabUrl, function(error, tab, response, body) {
        expect(error).toBeNull();
        expect(typeof tab).toBe('object');
        expect(typeof tab.name).toBe('string');
        expect(typeof tab.type).toBe('string');
        expect(typeof tab.artist).toBe('string');
        // Optional properties.
        expect(typeof tab.rating).not.toBe('undefined');
        expect(typeof tab.numberRates).not.toBe('undefined');
        expect(typeof tab.difficulty).not.toBe('undefined');

        expect(response.statusCode).toBe(200);
        expect(typeof body).toBe('string');
        done();
      }, requestOptions);
    });
  });

  describe("autocomplete", function () {
    it("get suggestions for tab", function (done) {
      var query = {
        query: 'Crazy',
        artist: 'Ozzy Osbourne',
        type: 'tab'
      };
      ugs.autocomplete(query, function(error, suggestions) {
        expect(error).toBeNull();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        done();
      });
    });

    it("get suggestions for artist, with request options", function (done) {
      var requestOptions = {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
      };
      var query = {
        query: 'Ozzy',
        type: 'artist'
      };
      ugs.autocomplete(query, function(error, suggestions, response, body) {
        expect(error).toBeNull();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);

        expect(response.statusCode).toBe(200);
        expect(typeof body).toBe('string');
        done();
      }, requestOptions);
    });

  });

});
