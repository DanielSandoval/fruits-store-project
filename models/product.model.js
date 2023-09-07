const { Product } = require('./mongo_models/product.mongo');

async function createProduct(productName, price) {
    let newProduct = Product({
        productName,
        price
    });
    return await newProduct.save();
};

async function findOneProductByName(productName) {
    return await Product.findOne({productName});
};

module.exports = {
    createProduct,
    findOneProductByName
};