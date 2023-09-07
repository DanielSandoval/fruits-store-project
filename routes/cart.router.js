const express = require('express');

const { httpGetCart, httpPostToCart, httpDeleteCart } = require('../controllers/cart.controller');
const ensureAuthenticated = require('../config/ensureAuthenticatedFunc');
const { printHttpVerbAndRoute } = require('../util/printHttpVerbAndRoute');
const cartRouter = express.Router();

cartRouter.route('')
    .get(printHttpVerbAndRoute, ensureAuthenticated, httpGetCart);

cartRouter.route('/add-fruit-to-cart/:fruit')
    .post(printHttpVerbAndRoute, ensureAuthenticated, httpPostToCart);

cartRouter.route('/delete-cart')
    .get(printHttpVerbAndRoute, ensureAuthenticated, httpDeleteCart);

module.exports = cartRouter;