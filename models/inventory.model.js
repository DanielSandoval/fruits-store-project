const Inventory = require('./mongo_models/inventory.mongo');

async function createInventory(product, existence) {
    try {
        let newInventory = new Inventory({product, existence});
        return await newInventory.save();
    }
    catch(err) {
        return err;
    };
};

async function deleteInventory(productName) {
    let myVar = await Inventory.deleteMany({'product.productName': productName});
    return myVar;
};

async function findOneInInventoryByNameWithCallback(fruit, callback) {
    Inventory.findOne({"product.productName": fruit}, function(err, inventoryProduct) {
        if(err)
            return callback(err)
        else 
            return callback(null, inventoryProduct);
    });
};

async function findOneInInventoryByName(fruit) {
    return await Inventory.findOne({"product.productName": fruit});
};

async function updateProductInInventoryByName(userCartItem) {
    return await Inventory.findOneAndUpdate(
        {'product.productName': userCartItem.product.productName, 
        existence: { $gte: userCartItem.quantityBuy }}, 
        {$inc: { existence: -userCartItem.quantityBuy }}
    );
};

module.exports = {
    createInventory,
    deleteInventory,
    findOneInInventoryByNameWithCallback,
    findOneInInventoryByName,
    updateProductInInventoryByName
};