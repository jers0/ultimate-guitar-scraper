var request = require('request'),
    utils   = require('./utils');

var search = function (query, callback, requestOptions) {
  requestOptions = requestOptions || {};
  query = utils.formatSearchQuery(query);
  requestOptions.url = 'http://www.ultimate-guitar.com/search.php?' + utils.encodeParams(query);
  request(requestOptions, function(error, response, body) {
    if (error) {
      callback(error);
    } else if (response.statusCode != 200) {
      callback("Bad response");
    } else {
      var tabs = utils.parseListTABs(body);
      callback(null, tabs, response, body);
    }
  });
};

var autocomplete = function (query, callback, requestOptions) {
  requestOptions = requestOptions || {};
  query = utils.formatAutocompleteQuery(query);
  requestOptions.url = 'http://www.ultimate-guitar.com/contribution/submit/autocomplete?' + utils.encodeParams(query);
  request(requestOptions, function(error, response, body) {
    if (error) {
      callback(error);
    } else if (response.statusCode != 200) {
      callback("Bad response");
    } else {
      try {
        var results = JSON.parse(body);
        if (results.hasOwnProperty) {
          callback(null, results['results'], response, body);
        } else {
          callback("Bad response");
        }
      } catch (e) {
        callback("Bad response");
      }
    }
  });
};

var get = function (TABUrl, callback, requestOptions) {
  requestOptions = requestOptions || {};
  requestOptions.url = TABUrl;
  request(requestOptions, function(error, response, body) {
    if (error) {
      callback(error);
    } else if (response.statusCode != 200) {
      callback("Bad response");
    } else {
      var tab = utils.parseSingleTAB(body);
      if (tab) {
        callback(null, tab, response, body);
      } else {
        callback("Can't parse TAB", null, response, body);
      }
    }
  });
};



module.exports = {
  search: search,
  autocomplete: autocomplete,
  get: get
};
