const User = require('./mongo_models/user.mongo');

async function create(username, name, lastname, password, role) {
    let newUser = new User({
        username,
        name,
        lastname,
        password,
        role
    });
    return await newUser.save();
};

async function getOneByUsername(username) {
    return await User.findOne({username});
};

function getUserByIdWithCallback(id, callback) {
    User.findById(id, function(err, user) {
        if(err)callback(err);
        else callback(null, user);
    });
};

async function getUserById(id) {
    return await User.findById(id);
};

function findCartByIdOnUserAndUpdateWithCallback(id, data, callback) {
    User.findByIdAndUpdate(id, 
        {$push: {userCart: data}}, 
        {upsert: true, new: true}, 
        function(err, user) {
            if(err)
                return callback(err);
            else
                return callback(null, user);
        }
    );
};

async function findCartByIdOnUserAndUpdate(id, data) {
    return await User.findByIdAndUpdate(id, {userCart: data});
};

module.exports = {
    create,
    getOneByUsername,
    getUserByIdWithCallback,
    getUserById,
    findCartByIdOnUserAndUpdateWithCallback,
    findCartByIdOnUserAndUpdate
};