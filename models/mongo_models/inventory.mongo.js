const mongoose = require("mongoose");
const productSchemaAndModel = require("./product.mongo");

const productSchema = productSchemaAndModel.productSchema;

const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    product: {
        type: productSchema,
        required: true
    },
    existence: {
        type: Number,
        required: true
    }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;