const mongoose = require('mongoose');
const userCartProductSchema = require('./userCartProduct.mongo').userCartProductSchema;

const Schema = mongoose.Schema;

const userCartOrderSchema = new Schema({
    userCartArr: { type: [userCartProductSchema] }
});

const UserCartOrder = mongoose.model('userCartOrder', userCartOrderSchema);

module.exports = {
    userCartOrderSchema,
    UserCartOrder
};