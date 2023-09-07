const { UserCartOrder } = require('./mongo_models/userCartOrder.mongo');

async function createUserCartOrder(data) {
    let acceptedProductsInCartArr = new UserCartOrder({userCartArr: data});
    return await acceptedProductsInCartArr.save();
};

module.exports = {
    createUserCartOrder
}