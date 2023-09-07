const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: {type: String, required: true},
    price: {type: Number, required: true}
});

const Product = mongoose.model("Product", productSchema);

module.exports = {
    productSchema: productSchema, 
    Product: Product
};