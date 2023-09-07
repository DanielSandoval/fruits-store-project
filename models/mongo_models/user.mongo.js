const mongoose = require("mongoose");
const userCartProductSchema = require('./userCartProduct.mongo').userCartProductSchema;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    userCart: { type: [userCartProductSchema] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model("user", userSchema);

module.exports = User;