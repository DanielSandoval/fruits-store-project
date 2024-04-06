let usersDemo = {'admin1@admin': 'admin123', 'user1@user': 'user123', 'w@w': '123'};

function loginDemoAccount(req, res, next) {
    req.body.username = req.query.username;
    req.body.password = usersDemo[req.query.username];
    next();
}

module.exports = loginDemoAccount;