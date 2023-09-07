module.exports.printHttpVerbAndRoute = function(req, res, next) {
    console.log(req.method + ' ---> ' + req.originalUrl);
    next();
};