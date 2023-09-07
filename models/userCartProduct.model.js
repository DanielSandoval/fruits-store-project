const { UserCartProduct } = require('./mongo_models/userCartProduct.mongo');

async function findUserCartProductById(id) {
    return await UserCartProduct.findByIdAndDelete(id);
};

function addNewProductToCartWithCallback(username, product, quantity, callback) {
    var newUserCartProduct;
    newUserCartProduct = new UserCartProduct({
        username: username,
        product: product,
        quantityBuy: quantity
    });
    newUserCartProduct.save(function(err, data) {
        if(err)
            return callback(err);
        callback(null, data);
    });
};

async function deleteCart(user) {
    return await UserCartProduct.deleteMany({username: user.username});
};

module.exports = {
    findUserCartProductById,
    addNewProductToCartWithCallback,
    deleteCart
};