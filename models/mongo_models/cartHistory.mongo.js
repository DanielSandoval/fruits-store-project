const mongoose = require("mongoose");
const userCartOrderSchema = require('./userCartOrder.mongo').userCartOrderSchema;

const Schema = mongoose.Schema;

const cartHistorySchema = new Schema({
    username: {
        type: 'String',
        required: true
    },
    ordersList: {
        type: [userCartOrderSchema],
        required: true
    }
});

const CartHistory = mongoose.model("cartHistory", cartHistorySchema);

module.exports = {cartHistorySchema, CartHistory};