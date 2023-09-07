const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const db = require('./db');
const printHttpVerbAndRoute = require('../util/printHttpVerbAndRoute');
const expect = chai.expect;

let app;
let authenticatedUser, authenticatedUserAdmin;
let fruitsArr = [{fruit: 'banana', quantity: '10'}, {fruit: 'apple', quantity: '5'}]; // Info to work with the database.

chai.use(chaiHttp);

// This two lines will be used elsewhere but would normally go here and I leave them here for future reference only.
//const app = require('../app');
//const authenticatedUser = request.agent(app);

// Do the following before all tests start
before('Login before tests', async function() {
    // This line is in case the server is too slow.
    this.timeout(0);

    // Connect to a new in-memory database server.
    await db.connect();

    // We will use stub to avoid printing the routes when we make a request from testing.
    sinon.stub(printHttpVerbAndRoute, 'printHttpVerbAndRoute').callsFake(function(req, res, next) {
        next();
    });

    app = require('../app');
    authenticatedUserAdmin = request.agent(app);
    authenticatedUser = request.agent(app);

    await db.clear();

    const UserModel = require('../models/mongo_models/user.mongo');

    let userAdmin = new UserModel({
        username: 'admin1@admin',
        name: 'admin',
        lastname: '1',
        password: bcrypt.hashSync('admin123', 12),
        role: 'admin'
    });

    let user = new UserModel({
        username: 'w@w',
        name: 'w',
        lastname: 'w',
        password: bcrypt.hashSync('123', 12),
        role: 'user'
    });

    try {
        await userAdmin.save();
        await user.save();

        // authenticatedUserAdmin saves the authenticated user so we can make new requeste tests.
        // If want to make requests with no authenticated user use request(app). ...
        authenticatedUserAdmin
            .post('/login')
            .send({username: 'admin1@admin', password: 'admin123'})
            .then(function(res) {
                expect(res).to.have.status(302);
                expect(res).to.redirect;
            });
    
        // authenticatedUser saves the authenticated user so we can make new requeste tests.
        // If want to make requests with no authenticated user user request(app). ...
        authenticatedUser
            .post('/login')
            .send({username: 'w@w', password: '123'})
            .then(function(res) {
                expect(res).to.have.status(302);
                expect(res).to.redirect;
                expect(res).to.redirectTo('/');
                expect(res).to.have.header('Location', '/');
            });

        let authenticationUsersArr = [authenticatedUserAdmin, authenticatedUser];
        return Promise.all(authenticationUsersArr).then(function(values) {});
    }
    catch(err) {
        console.log(err);
    };
});

after('After', async function() {
    await db.close();
});

describe('FUNCTIONAL TESTS', function() {
    describe('Test /login', function() {
        it('Test /login for normal type user with wrong credentials', function(done) {
            request(app)
                .post('/login')
                .send({username: 'w@w', password: 'wrong_password'})
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    expect(res).to.have.header('Location', '/login');
                    done();
                });
        });
        it('Test /login for normal type user with right credentials', function(done) {
            request(app)
                .post('/login')
                .send({username: 'w@w', password: '123'})
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/');
                    expect(res).to.have.header('Location', '/');
                    done();
                });
        });
        it('Test /login for admin type user with wrong credentials', function(done) {
            request(app)
                .post('/login')
                .send({username: 'admin1@admin', password: 'wrong_password'})
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    expect(res).to.have.header('Location', '/login');
                    done();
                });
        });
        it('Test /login for admin type user with right credentials', function(done) {
            request(app)
                .post('/login')
                .send({username: 'admin1@admin', password: 'admin123'})
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/');
                    expect(res).to.have.header('Location', '/');
                    done();
                });
        });
    });

    describe('Test /api/inventory', function() {
        let inventoryRoute = '/api/inventory';
        it('Test GET /api/inventory with no authenticated user', function(done) {
            // We use request(app). ... to make requests with no authenticated user.
            request(app)
                .get(inventoryRoute)
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    done();
                });
        });
        it('Test GET /api/inventory with authenticated non-administrator user account', function(done) {
            authenticatedUser
                .get(inventoryRoute)
                .end(function(err, res) {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').and.be.equal('Unauthorized');
                    done();
                });
        });
        it('Test GET /api/inventory with an authenticated account of type admin', function(done) {
            authenticatedUserAdmin
                .get(inventoryRoute)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.not.redirect;
                    expect(res).to.be.html;
                    done();
                });
        });
        it('Test POST /api/inventory with an authenticated account of type admin', function() {
            let productToInventory1 = {fruit: 'banana', price: 1, existence: 2000};
            let productToInventory2 = {fruit: 'apple', price: 2, existence: 2500};
            let addProductsToInventoryArr = [];
            addProductsToInventoryArr.push(
                authenticatedUserAdmin
                    .post(inventoryRoute)
                    .send(productToInventory1)
                    .then(function(res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.all.keys(['existence', 'product']);
                        expect(res.body.existence).to.be.a('number').and.be.equal(productToInventory1.existence);
                        expect(res.body.product).to.be.an('object').that.include.all.keys(['productName', 'price']);
                        expect(res.body.product.productName).to.be.an('string').and.be.equal(productToInventory1.fruit);
                        expect(res.body.product.price).to.be.an('number').and.be.equal(productToInventory1.price);
                    }));
            addProductsToInventoryArr.push(
                authenticatedUserAdmin
                    .post(inventoryRoute)
                    .send(productToInventory2)
                    .then(function(res) {
                        expect(res).to.have.status(200);
                        expect(res.body).to.include.all.keys(['existence', 'product']);
                        expect(res.body.existence).to.be.a('number').and.be.equal(productToInventory2.existence);
                        expect(res.body.product).to.be.an('object').that.include.all.keys(['productName', 'price']);
                        expect(res.body.product.productName).to.be.an('string').and.be.equal(productToInventory2.fruit);
                        expect(res.body.product.price).to.be.an('number').and.be.equal(productToInventory2.price);
                    }));
            Promise.all(addProductsToInventoryArr).then(function(values) {});
        });
    });

    describe('Test / (index)', function() {
        it('Test GET / with no authenticated user', function(done) {
            request(app)
                .get('/')
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    expect(res).to.have.header('Location', '/login');
                    done();
                });
        });
        it('Test GET / with authenticated user', function(done) {
            authenticatedUser
                .get('/')
                .end(function(err, res) {
                    expect(res.statusCode).to.equal(200);
                    expect(res).to.not.redirect;
                    done();
                });
        });
    });

    describe('Test /api/cart', function() {
        let cartRoute = '/api/cart';
        it('Test GET /api/cart with no authenticated user', function(done) {
            request(app)
                .get(cartRoute)
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    done();
                });
        });
        it('Test GET /api/cart with authenticated user', function(done) {
            authenticatedUser
                .get(cartRoute)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.not.redirect;
                    done();
                })
        });
        it('Test POST /api/cart/add-fruit-to-cart/:fruit with no authenticated user', function(done) {
            request(app)
                .post(cartRoute + '/add-fruit-to-cart/banana')
                .send({quantity: '10'})
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    done();
                });
        });
        it('Test POST /api/cart/add-fruit-to-cart/:fruit with authenticated user and wrong quantity value', function(done) {
            authenticatedUser
                .post(cartRoute + '/add-fruit-to-cart/' + fruitsArr[0].fruit)
                .send({quantity: 'wrong-quantity'})
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.be.a('string');
                    expect(res.body.error).to.be.equal('Quantity must be a number');
                    done();
                });
        });
        it('Test POST /api/cart/add-fruit-to-cart/:fruit with authenticated user and wrong fruit', function(done) {
            authenticatedUser
                .post(cartRoute + '/add-fruit-to-cart/wrong-random-fruit')
                .send({quantity: '10'})
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.be.a('string');
                    expect(res.body.error).to.be.equal('This product does not exist in stock at this moment');
                    done();
                });
        });
        it('Test POST /api/cart/add-fruit-to-cart/:fruit with authenticated user and more products than we have in stock', function(done) {
            authenticatedUser
                .post(cartRoute + '/add-fruit-to-cart/' + fruitsArr[0].fruit)
                .send({quantity: '1000000'})
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.be.a('string');
                    expect(res.body.error).to.be.equal('The quantity exceeds the quantity in stock of these products');
                    done();
                });
        });
        it('Test POST /api/cart/add-fruit-to-cart/:fruit with authenticated user', function(done) {
            authenticatedUser
                .post(cartRoute + '/add-fruit-to-cart/banana')
                .send({quantity: '10'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.not.redirect;
                    expect(res.body).to.include.all.keys(['username', 'name', 'lastname', 'password', 'role', 'userCart']);
                    expect(res.body.username).to.be.a('string');
                    expect(res.body.name).to.be.a('string');
                    expect(res.body.lastname).to.be.a('string');
                    expect(res.body.password).to.be.a('string');
                    expect(res.body.role).to.be.a('string');
                    expect(res.body.userCart).to.be.an('array');
                    res.body.userCart.forEach(function(userCartElement) {
                        expect(userCartElement).to.be.an('object');
                        expect(userCartElement).to.include.all.keys(['username', 'product', 'quantityBuy']);
                        expect(userCartElement.username).to.be.a('string');
                        expect(userCartElement.product).to.be.an('object');
                        expect(userCartElement.quantityBuy).to.be.a('number');
                    });
                    done();
                });
        });
        it('Test GET /api/cart/delete-cart with no authenticated user', function(done) {
            request(app)
                .get(cartRoute + '/delete-cart')
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login')
                    done();
                });
        });
        it('Test GET /api/cart/delete-cart with authenticated user', function(done) {
            authenticatedUser
                .get(cartRoute + '/delete-cart')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    expect(res).to.not.redirect;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.all.keys(['username', 'userCart']);
                    expect(res.body.username).to.be.a('string');
                    expect(res.body.userCart).to.be.an('array');
                    res.body.userCart.forEach(function(userCartElement) {
                        expect(userCartElement).to.be.an('object');
                        expect(userCartElement).to.include.all.keys(['username', 'product', 'quantityBuy']);
                        expect(userCartElement.username).to.be.a('string');
                        expect(userCartElement.product).to.be.an('object');
                        expect(userCartElement.quantityBuy).to.be.a('number');
                    });
                    done();
                });
        });
    });

    describe('Test /api/cart-history', function() {
        let cartHistoryRoute = '/api/cart-history';
        let cartPromiseArr = [];
        it('Test POST /api/cart-history with no authenticated user', function(done) {
            request(app)
                .post(cartHistoryRoute + '/submit-payment')
                .end(function(err, res) {
                    expect(res).to.have.status(302);
                    expect(res).to.redirect;
                    expect(res).to.redirectTo('/login');
                    done();
                });
        });
        it('Test POST /api/cart-history with authenticated user', function(done) {
            // First we create a product cart so we can later place the order.
            // We create a promise for every product to add it to the Cart. Every promise is added to an array of promises.
            fruitsArr.forEach(function(fruitInfo, index) {
                cartPromiseArr.push(
                    authenticatedUser
                        .post('/api/cart/add-fruit-to-cart/' + fruitInfo.fruit)
                        .send({quantity: fruitInfo.quantity})
                        .then(function(res) {
                            expect(res).to.have.status(200);
                            expect(res).to.not.redirect;
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.include.all.keys(['username', 'userCart']);
                            expect(res.body.username).to.be.a('string');
                            expect(res.body.userCart).to.be.an('array');
                            res.body.userCart.forEach(function(userCartElement) {
                                expect(userCartElement).to.be.an('object');
                                expect(userCartElement).to.include.all.keys(['username', 'product', 'quantityBuy']);
                                expect(userCartElement.username).to.be.a('string');
                                expect(userCartElement.product).to.be.an('object');
                                expect(userCartElement.quantityBuy).to.be.a('number');
                                fruitsArr[index]._id = userCartElement._id;
                            });
                            return res;
                        })
                )
            });
            // If all products were succesfully posted to the Cart we then procede to submit the payment.
            Promise.all(cartPromiseArr)
                .then(function(values) {
                    let sortedFruitsArr = [...fruitsArr];
                    sortedFruitsArr.sort(function(previousElement, currentElement) {
                        return (currentElement._id > previousElement._id) ? -1 :
                            (currentElement._id < previousElement._id) ? 1 : 0;
                    });
                    authenticatedUser
                        .post(cartHistoryRoute + '/submit-payment')
                        .end(function(err, res) {
                            expect(res).to.have.status(200);
                            expect(res).to.not.redirect;
                            expect(res.body).to.include.all.keys(['username', 'ordersList']);
                            expect(res.body.username).to.be.a('string');
                            expect(res.body.ordersList).to.be.an('array');
                            res.body.ordersList.forEach(function(completeOrderHistoryElementArr, indexInCompleteHistory) {
                                // Only compare with last order added to the history orders list.
                                if(indexInCompleteHistory != res.body.ordersList.length - 1) return;
                                expect(completeOrderHistoryElementArr).to.be.an('object');
                                expect(completeOrderHistoryElementArr).to.include.all.keys(['userCartArr']);
                                expect(completeOrderHistoryElementArr.userCartArr).to.be.an('array');
                                completeOrderHistoryElementArr.userCartArr.forEach(function(elementInIndividualOrder, indexInIndividualOrderObject) {
                                    expect(elementInIndividualOrder).to.be.an('object');
                                    expect(elementInIndividualOrder).to.include.all.keys(['username', 'product', 'quantityBuy']);
                                    expect(elementInIndividualOrder.username).to.be.a('string');
                                    expect(elementInIndividualOrder.product).to.be.an('object');
                                    expect(elementInIndividualOrder.product).to.have.nested.property('productName', sortedFruitsArr[indexInIndividualOrderObject].fruit);
                                    expect(elementInIndividualOrder.quantityBuy).to.be.a('number').and.to.equal(parseInt(sortedFruitsArr[indexInIndividualOrderObject].quantity));
                                });
                            });
                            done();
                        });
                })
                .catch(function(error) {
                    done(error);
                });
        });
    });
});