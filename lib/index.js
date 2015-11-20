var request = require('request'),
    utils   = require('./utils');

var search = function (query, callback, requestOptions) {
  requestOptions = requestOptions || {};
  requestOptions.url = utils.searchURL(query);
  request(requestOptions, function(error, response, body) {
    if (error) {
      callback(error);
    } else if (response.statusCode != 200) {
      callback("Bad response");
    } else {
      var tabs = utils.parseTAB(body);
      callback(null, tabs);
    }
  });
}

module.exports = {
  search: search
};
