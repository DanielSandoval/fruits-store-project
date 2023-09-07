module.exports = function(req, res, next) {
    if(req.user.role == 'admin') return next();
    res.status(403).json({error: 'Unauthorized'});
}