module.exports = function (options) {
  return function (req, res, next) {
    var nodeSSPI = require('node-sspi');
    var nodeSSPIObj = new nodeSSPI(options);
    nodeSSPIObj.authenticate(req, res, function(err) {
      res.finished || next();
    });
  }
}
