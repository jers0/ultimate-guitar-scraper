var utils = require('../lib/utils')
var ugs   = require('../lib/index')
var fs    = require('fs');


var basicQuery = function () {
  return {
    bandName: 'Muse'
  };
};

var completeQuery = function () {
  return {
    bandName: 'Black Keys',
    songName: 'Little Black Submarines',
    type: ['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords'],
    page: 3
  };
};


describe('utils', function() {

  describe('generateURL', function() {
    it('generates URL with default values', function() {
      var query = basicQuery();
      var url = 'http://www.ultimate-guitar.com/search.php?band_name=Muse&type%5B%5D=300&type%5B%5D=200&page=1&view_state=advanced&tab_type_group=text&app_name=ugt&order=myweight&version_la=';
      expect(utils.generateURL(query)).toEqual(url);
    });

    it('generates URL', function() {
      var query = completeQuery();
      var url = 'http://www.ultimate-guitar.com/search.php?band_name=Black+Keys&song_name=Little+Black+Submarines&type%5B%5D=100&type%5B%5D=200&type%5B%5D=300&type%5B%5D=400&type%5B%5D=500&type%5B%5D=600&type%5B%5D=700&type%5B%5D=800&page=3&view_state=advanced&tab_type_group=text&app_name=ugt&order=myweight&version_la=';
      expect(utils.generateURL(query)).toEqual(url);
    });
  });


  describe('formatQuery', function () {
    it('is invalid without param bandName', function() {
      expect(function() {
        utils.formatQuery({});
      }).toThrowError(Error);
    });

    it('uses default params', function() {
      var query = basicQuery();
      expect(utils.formatQuery(query)).toEqual({
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
      var query = completeQuery();
      expect(utils.formatQuery(query)).toEqual({
        band_name: 'Black Keys',
        song_name: 'Little Black Submarines',
        type: [ 100, 200, 300, 400, 500, 600, 700, 800 ],
        page: 3,
        view_state: 'advanced',
        tab_type_group: 'text',
        app_name: 'ugt',
        order: 'myweight',
        version_la: ''
      });
    });
  });

  describe('parseTABs', function() {
    it('parses TABs', function() {
      var html = fs.readFileSync('./spec/request.html');
      var tabs = utils.parseTABs(html);
      expect(Array.isArray(tabs)).toBe(true);
      expect(tabs.length).toBe(52);
    });
  });

});


describe('ultimate-guitar-scraper', function() {
  it('searches TABs', function (done) {
    var query = basicQuery();
    ugs.search(query, function(error, results) {
     expect(error).toBeNull();
     expect(Array.isArray(results)).toBe(true);
     done();
    });
  });

  it('searches TABs with request options', function (done) {
    var query = completeQuery();
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
