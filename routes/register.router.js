const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/mongo_models/user.mongo');
const userModel = require('../models/user.model');
const registerRouter = express.Router();

registerRouter.route('')
    .get(function(req, res) {
        res.render('register');
    })
    .post(async function(req, res) {
        let username = req.body.username;
        let name = req.body.name;
        let lastname = req.body.lastname;
        let password = req.body.password;
        let role = req.body.role;

        let foundUser = await userModel.getOneByUsername(username);
        if(foundUser)
            return res.send('That username already exists in the database');

        if(password) password = bcrypt.hashSync(password, 12);

        let user = new User({
            username: username,
            name: name,
            lastname: lastname,
            password: password,
            role: role
        });

        user.save(function(err, user) {
            if(err) return res.send(err);
            if(!user) return res.send('Could not save user');
            return res.send(user);
        });
    });

module.exports = registerRouter;