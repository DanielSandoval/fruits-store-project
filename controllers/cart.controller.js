const {
    getUserByIdWithCallback,
    findCartByIdOnUserAndUpdateWithCallback,
    findCartByIdOnUserAndUpdate
} = require('../models/user.model');
const { findOneInInventoryByNameWithCallback } = require('../models/inventory.model');
const { addNewProductToCartWithCallback, deleteCart } = require('../models/userCartProduct.model');

let user;

function httpGetCart(req, res) {
    let userCart;
    user = req.user;
    getUserByIdWithCallback(user._id, function(err, userData) {
        if(err)
            return res.status(404).send(err);
        else if(userData)
            userCart = userData.userCart;
        res.render('cart', {user, userCart});
    });
};

function httpPostToCart(req, res) {
    var quantityBuy = req.body.quantity;
    var fruit = req.params.fruit;
    user = req.user;

    if(isNaN(quantityBuy))
        return res.status(404).json({error: 'Quantity must be a number'});
    quantityBuy = parseInt(quantityBuy);

    findOneInInventoryByNameWithCallback(fruit, function(err, inventoryProduct) {
        if(err) {
            return res.status(404).send(err);
        }
        else if(!inventoryProduct) {
            return res.status(404).json({error: 'This product does not exist in stock at this moment'});
        }
        else if(inventoryProduct.existence < quantityBuy) {
            return res.status(404).json({error: 'The quantity exceeds the quantity in stock of these products'});
        }
        
        addNewProductToCartWithCallback(user.username, inventoryProduct.product, quantityBuy, function(err, data) {
            if(err) return res.status(404).send(err);
            findCartByIdOnUserAndUpdateWithCallback(req.user._id, data, function(err, user) {
                if(err) return res.status(404).send(err);
                else if(user) return res.status(200).send(user);
            });
        });
    });
};

async function httpDeleteCart(req, res) {
    let deletedCart, deletedCartOnUser;
    user = req.user;
    try {
        deletedCart = await deleteCart(user);
        deletedCartOnUser = await findCartByIdOnUserAndUpdate(user._id, []);
        return res.send(deletedCartOnUser);
    }
    catch(err) {
        return res.status(404).send(err);
    }
};

module.exports = {
    httpGetCart,
    httpPostToCart,
    httpDeleteCart
};