const express = require('express');
const cartHistoryRouter = express.Router();
const { httpPostToCartHistory } = require('../controllers/cartHistory.controller');
const CartHistory = require('../models/mongo_models/cartHistory.mongo').CartHistory;

cartHistoryRouter.route('/submit-payment')
    .post(httpPostToCartHistory);

module.exports = cartHistoryRouter;