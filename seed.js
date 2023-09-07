// THE PORPOUSE OF THIS FILE IS TO FILL THE DATABASE WITH INITIAL INFORMATION

const bcrypt = require('bcrypt');
const userModel = require('./models/user.model');
const inventoryModel = require('./models/inventory.model');
const productModel = require('./models/product.model');

async function createInitalAccount(username, name, lastname, password, role) {
    let foundUser = await userModel.getOneByUsername(username);
    if(foundUser) return;
    let hashedPassword = bcrypt.hashSync(password, 12);
    let initialAccount = await userModel.create(username, name, lastname, hashedPassword, role);
    console.log(initialAccount.username + ' account created of type ' + initialAccount.role);
};

async function createInitialInventory(product, existence) {
    let foundProduct = await productModel.findOneProductByName(product.productName);
    if(foundProduct) return;
    return await setDefaultInventory(product, existence);
};

async function setDefaultInventory(product, existence) {
    try {
        await inventoryModel.deleteInventory(product.productName);
        let newProduct = await productModel.createProduct(product.productName, product.price);
        return await inventoryModel.createInventory(newProduct, existence);
    }
    catch(err) {
        console.log(err);
    }
};

async function createFullInitialInventory() {
    Promise.all([
        createInitialInventory({productName: 'apple', price: '2'}, '2500'),
        createInitialInventory({productName: 'banana', price: '1'}, '3000'),
        createInitialInventory({productName: 'orange', price: '2'}, '3000'),
        createInitialInventory({productName: 'pineapple', price: '8'}, '2000'),
        createInitialInventory({productName: 'watermelon', price: '10'}, '1700'),
        createInitialInventory({productName: 'strawberry', price: '5'}, '2500'),
        createInitialInventory({productName: 'melon', price: '7'}, '1800'),
        createInitialInventory({productName: 'pear', price: '3'}, '2000'),
        createInitialInventory({productName: 'grape', price: '4'}, '2500'),
        createInitialInventory({productName: 'mango', price: '3'}, '3000')
    ]).then(function() {
        console.log('INVENTORY OF PRODUCTS CREATED');
    });
};

async function createFullDefaultInventory() {
    return Promise.all([
        setDefaultInventory({productName: 'apple', price: '2'}, '2500'),
        setDefaultInventory({productName: 'banana', price: '1'}, '3000'),
        setDefaultInventory({productName: 'orange', price: '2'}, '3000'),
        setDefaultInventory({productName: 'pineapple', price: '8'}, '2000'),
        setDefaultInventory({productName: 'watermelon', price: '10'}, '1700'),
        setDefaultInventory({productName: 'strawberry', price: '5'}, '2500'),
        setDefaultInventory({productName: 'melon', price: '7'}, '1800'),
        setDefaultInventory({productName: 'pear', price: '3'}, '2000'),
        setDefaultInventory({productName: 'grape', price: '4'}, '2500'),
        setDefaultInventory({productName: 'mango', price: '3'}, '3000')
    ]).then(function(result) {
        console.log('SET DEFAULT INVENTORY');
        orderProducts(result);
        return result;
    });
};

function orderProducts(dataArr) {
    dataArr.sort(function(previousElement, nextElement) {
        return (previousElement.product.productName > nextElement.product.productName) ? 1:
            (previousElement.product.productName < nextElement.product.productName) ? -1: 0;
    });
};

module.exports = {
    createInitalAccount,
    createInitialInventory,
    createFullInitialInventory,
    createFullDefaultInventory
};