const mongoose = require("mongoose");
const productSchemaAndModel = require("./product.mongo");

const productSchema = productSchemaAndModel.productSchema;

const Schema = mongoose.Schema;

const userCartProductSchema = new Schema({
    username: {type: String},
    product: {type: productSchema},
    quantityBuy: {type: Number}
});

const UserCartProduct = mongoose.model("userCartProduct", userCartProductSchema);

module.exports = {
    userCartProductSchema: userCartProductSchema,
    UserCartProduct: UserCartProduct
};