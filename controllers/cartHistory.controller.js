const { getUserById, findCartByIdOnUserAndUpdate } = require('../models/user.model');
const { updateProductInInventoryByName } = require('../models/inventory.model');
const { findUserCartProductById } = require('../models/userCartProduct.model');
const { createUserCartOrder } = require('../models/userCartOrder.model');
const { findOneInCartHistoryAndPushOrder } = require('../models/cartHistory.model');

async function httpPostToCartHistory(req, res) {
    let user = req.user;
    let productsArr = [];
    let deletedCart;
    let inventory;
    try {
        let userInfo = await getUserById(user._id);
        // Check if user cart is empty, if so redirect to /
        if (!userInfo.userCart.length) {
            res.setHeader('location', '/');
            res.statusCode = 302;
            return res.end();
        }
        // I need this array sorted because I need to test and compare it with a sorted array
        orderProducts(userInfo.userCart);
        let randomVar = await Promise.all(
            // Loop over every item in shopping cart to compare it with inventory
            userInfo.userCart.map(async function(userCartItem) {
                // Check if there are enough products in inventory
                inventory = await updateProductInInventoryByName(userCartItem);
                // Clear shopping cart if there are enough products in inventory
                if(!inventory) return res.send('Not enough products in inventory');
                deletedCart = await findUserCartProductById(userCartItem._id);
                let userInfo = await findCartByIdOnUserAndUpdate(user._id, []);
                productsArr.push(userCartItem);
            })
        );

        // Place order only if there are enough products in inventory
        if(!inventory) return;
        let userCartCollection = await createUserCartOrder(productsArr);
        let cartHistory = await findOneInCartHistoryAndPushOrder(user.username, userCartCollection);
        orderProducts(cartHistory.ordersList[cartHistory.ordersList.length - 1].userCartArr);
        return res.send(cartHistory);
    } catch(err) {
        res.status(404).json({error: err});
    }
};

function orderProducts(dataArr) {
    dataArr.sort(function(previousElement, currentElement) {
        return (currentElement._id > previousElement._id) ? -1 :
            (currentElement._id < previousElement._id) ? 1 : 0;
    });
};

module.exports = { httpPostToCartHistory };