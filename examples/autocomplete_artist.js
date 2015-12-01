var ugs = require('../lib/index');

ugs.autocomplete({
  query: 'Ozzy',
  type: 'artist'
}, function(error, suggestions) {
  if (error) {
    console.log(error);
  } else {
    console.log(suggestions);
  }
});
