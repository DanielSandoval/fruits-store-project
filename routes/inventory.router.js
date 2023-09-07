const express = require('express');
const Inventory = require('../models/mongo_models/inventory.mongo');
const productSchemaAndModel = require('../models/mongo_models/product.mongo');
const Product = productSchemaAndModel.Product;
const { createFullDefaultInventory } = require('../seed');
const inventoryRouter = express.Router();

let acceptedFruits = ['apple', 'banana', 'orange', 'pineapple', 'watermelon', 'strawberry', 'melon', 'pear', 'grape', 'mango'];

inventoryRouter.route('')
    .get(function(req, res) {
        let inventoryProducts;
        Inventory.find({}, function(err, data) {
            if(err) {
                return res.send(err);
            }
            else if(data) {
                data.sort(function(previousElement, nextElement) {
                    return (previousElement.product.productName > nextElement.product.productName) ? 1:
                        (previousElement.product.productName < nextElement.product.productName) ? -1: 0;
                });
                inventoryProducts = data;
            }
            res.render("inventory", {user: req.user, acceptedFruits, inventoryProducts: inventoryProducts});
        });
    })
    .post(function(req, res) {
        let fruit = req.body.fruit;
        let price = req.body.price;
        let existence = req.body.existence;
    
        if(!isNaN(price)) parseInt(price);
        if(!isNaN(existence)) parseInt(existence);
        
        Product.findOneAndUpdate({productName: fruit}, {productName: fruit, price: price}, {upsert: true, new: true}, function(err, product) {
            if(err) {
                res.send(err);
            }
            else if(product) {
                Inventory.findOneAndUpdate({'product.productName': product.productName}, {product: product, existence: existence},
                    {upsert: true, new: true}, function(err, inventoryProduct) {
                    if(err) {
                        res.send(err);
                    }
                    else if(inventoryProduct) {
                        res.send(inventoryProduct);
                    }
                });
            }
            else {
                res.send("No products yet");
            }
        });
    });

inventoryRouter.route('/set-default-data')
    .get(async function(req, res) {
        let result = await createFullDefaultInventory();
        res.send(result);
    });

module.exports = inventoryRouter;