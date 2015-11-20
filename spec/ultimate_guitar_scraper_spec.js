var utils = require('../lib/utils')
var ugs   = require('../lib/index')
var fs    = require('fs');

describe('utils', function() {

  describe('searchURL', function() {
    it('is invalid without param bandName', function() {
      expect(function() {
        utils.searchURL({});
      }).toThrowError(Error);
    });

    it('uses default params', function() {
      var query = {
        bandName: 'Muse'
      };
      expect(utils.searchURL(query)).toEqual('http://www.ultimate-guitar.com/search.php?band_name=Muse&type%5B%5D=300&type%5B%5D=200&page=1&view_state=advanced&tab_type_group=text&app_name=ugt&order=myweight&version_la=');
    });

    it('uses params', function() {
      var query = {
        bandName: 'Muse',
        type: ['chords'],
        page: 3
      };
      expect(utils.searchURL(query)).toEqual('http://www.ultimate-guitar.com/search.php?band_name=Muse&type%5B%5D=300&page=3&view_state=advanced&tab_type_group=text&app_name=ugt&order=myweight&version_la=');
    });
  });

  describe('parseTAB', function() {
    it('parse TAB', function() {
      var html = fs.readFileSync('./spec/request.html');
      var tabs = utils.parseTAB(html);
      expect(Array.isArray(tabs)).toBe(true);
      expect(tabs.length).toBe(52);
    });
  });

});


describe('ultimate-guitar-scraper', function() {
  it('search TABs', function (done) {
    ugs.search({ bandName: 'Muse'}, function(error, results) {
     expect(error).toBeNull();
     expect(Array.isArray(results)).toBe(true);
     done();
    });
  });

  it('search TABs with request options', function (done) {
    var requestOptions = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36' }
    };
    ugs.search({ bandName: 'Muse'}, function(error, results) {
      expect(error).toBeNull();
      expect(Array.isArray(results)).toBe(true);
      done();
   }, requestOptions);
  });
});
