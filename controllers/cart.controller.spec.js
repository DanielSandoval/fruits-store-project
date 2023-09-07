const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = require('chai');

const userModel = require('../models/user.model');
const inventoryModel = require('../models/inventory.model');
const userCartProductModel = require('../models/userCartProduct.model');

describe('Unit tests on cart controller', function() {
    let mockReq, mockRes;

    beforeEach(function() {
        mockRes = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub(),
            json: sinon.stub(),
            render: sinon.stub()
        };
    });


    describe('Test httpGetCart function in the controller to get cart', function() {
        let getUserByIdStub;

        beforeEach(function() {
            getUserByIdStub = sinon.stub(userModel, 'getUserByIdWithCallback');
        });

        afterEach(function() {
            getUserByIdStub.restore();
        });

        it('should render cart page and pass user and userCart', function() {
            let userData = {
                _id: 'fake_id',
                userCart: {}
            }
            mockReq = {
                user: { _id: 'fake_id' }
            };

            getUserByIdStub.yields(null, userData);
            const { httpGetCart } = proxyquire('./cart.controller', {'../models/user.model': userModel});
            httpGetCart(mockReq, mockRes);
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(getUserByIdStub.calledWith(mockReq.user._id)).to.be.true;
            expect(mockRes.status.notCalled).to.be.true;
            expect(mockRes.send.notCalled).to.be.true;
            expect(mockRes.render.called).to.be.true;
            expect(mockRes.render.calledWithExactly('cart', {user: mockReq.user, userCart: userData.userCart})).to.be.true;
        });

        it('should throw and send error when no user is found', function() {
            mockReq = {
                user: { _id: 'wrong_id' }
            };

            getUserByIdStub.yields('error', null);
            const { httpGetCart } = proxyquire('./cart.controller', {'../models/user.model': userModel});
            httpGetCart(mockReq, mockRes);
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(getUserByIdStub.calledWith(mockReq.user._id)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly('error')).to.be.true;
            expect(mockRes.render.notCalled).to.be.true;
        });
    });
    

    describe('Test httpPostToCart function in the controller to post to cart', function() {
        let findOneInInventoryByName;
        let addNewProductToCart;
        let inventoryProductData;
        let productCartData;

        beforeEach(function() {
            findOneInInventoryByName = sinon.stub(inventoryModel, 'findOneInInventoryByNameWithCallback');
            addNewProductToCart = sinon.stub(userCartProductModel, 'addNewProductToCartWithCallback');

            inventoryProductData = {fruit: 'banana', existence: 15, product: {}};
            productCartData = {username: 'test_user@user', product: 'banana', quantityBuy: 10};
            mockReq = {
                user: { _id: 'fake_id', username: 'test_user@user' },
                params: { fruit: 'banana' },
                body: { quantity: '10' }
            };
        });

        afterEach(function() {
            findOneInInventoryByName.restore();
            addNewProductToCart.restore();
        });

        it('should throw and send error when quantity is not valid type', function() {
            let mockReq = {
                params: { fruit: 'banana' },
                body: { quantity: 'not_a_number' }
            };

            const { httpPostToCart } = proxyquire('./cart.controller', {'../models/inventory.model': inventoryModel});
            httpPostToCart(mockReq, mockRes);
            expect(mockRes.status.called).to.be.true;
            expect(findOneInInventoryByName.notCalled).to.be.true;
        });

        it('should throw an error if it gets an error from database', function() {
            findOneInInventoryByName.yields('error', null);
            const { httpPostToCart } = proxyquire('./cart.controller', {'../models/inventory.model': inventoryModel});
            httpPostToCart(mockReq, mockRes);
            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly('error')).to.be.true;
        });

        it('should not find product in inventory and send an error', function() {
            findOneInInventoryByName.yields(null, null);
            const { httpPostToCart } = proxyquire('./cart.controller', {'../models/inventory.model': inventoryModel});
            httpPostToCart(mockReq, mockRes);
            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.json.called).to.be.true;
            expect(mockRes.json.calledWithExactly({error: 'This product does not exist in stock at this moment'})).to.be.true;
        });

        it('should send error when trying to purchase the quantity of a product greater than the quantity in inventory', function() {
            findOneInInventoryByName.yields(null, {fruit: 'banana', existence: 9});
            const { httpPostToCart } = proxyquire('./cart.controller', {'../models/inventory.model': inventoryModel});
            httpPostToCart(mockReq, mockRes);
            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.json.called).to.be.true;
            expect(mockRes.json.calledWithExactly({error: 'The quantity exceeds the quantity in stock of these products'})).to.be.true;
        });

        it('should throw an error when trying to post a found product to cart', function() {
            findOneInInventoryByName.yields(null, inventoryProductData);
            addNewProductToCart.yields('error', null);
            const { httpPostToCart } = proxyquire('./cart.controller', {
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel
            });
            httpPostToCart(mockReq, mockRes);
            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(addNewProductToCart.called).to.be.true;
            expect(addNewProductToCart.calledWith(mockReq.user.username, inventoryProductData.product, parseInt(mockReq.body.quantity))).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly('error')).to.be.true;
        });

        it('should send error when trying to add new created product document to the user cart array', function() {
            let updateCartByIdOnUser = sinon.stub(userModel, 'findCartByIdOnUserAndUpdateWithCallback');

            findOneInInventoryByName.yields(null, inventoryProductData);
            addNewProductToCart.yields(null, productCartData);
            updateCartByIdOnUser.yields('error', null);
            const { httpPostToCart } = proxyquire('./cart.controller', {
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel,
                '../models/user.model': userModel
            });
            httpPostToCart(mockReq, mockRes);

            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(addNewProductToCart.called).to.be.true;
            expect(addNewProductToCart.calledWith(mockReq.user.username, inventoryProductData.product, parseInt(mockReq.body.quantity))).to.be.true;
            expect(updateCartByIdOnUser.called).to.be.true;
            expect(updateCartByIdOnUser.calledWith(mockReq.user._id, productCartData)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly('error')).to.be.true;
            updateCartByIdOnUser.restore();
        });

        it('should post to cart on user document succesfully and send saved document', function() {
            let updateCartByIdOnUser = sinon.stub(userModel, 'findCartByIdOnUserAndUpdateWithCallback');
            let userData = {_id: 'fake_id', username: 'test_user@user', userCart: productCartData};

            findOneInInventoryByName.yields(null, inventoryProductData);
            addNewProductToCart.yields(null, productCartData);
            updateCartByIdOnUser.yields(null, userData);

            const { httpPostToCart } = proxyquire('./cart.controller', {
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel,
                '../models/user.model': userModel
            });
            httpPostToCart(mockReq, mockRes);

            expect(findOneInInventoryByName.called).to.be.true;
            expect(findOneInInventoryByName.calledWith(mockReq.params.fruit)).to.be.true;
            expect(addNewProductToCart.called).to.be.true;
            expect(addNewProductToCart.calledWith(mockReq.user.username, inventoryProductData.product, parseInt(mockReq.body.quantity))).to.be.true;
            expect(updateCartByIdOnUser.called).to.be.true;
            expect(updateCartByIdOnUser.calledWith(mockReq.user._id, productCartData)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(200)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly(userData)).to.be.true;
        });
    });


    describe('Test httpDeleteCart function in the controller to delete cart', function() {
        let deleteCartStub;
        let updateCartById;
        let deletedCartData;

        beforeEach(function() {
            deleteCartStub = sinon.stub(userCartProductModel, 'deleteCart');
            updateCartById = sinon.stub(userModel, 'findCartByIdOnUserAndUpdate');
            deletedCartData = {fruit: 'banana'};
            mockReq = {
                user: {_id: 'fake_id', username: 'test_user@user', userCart: {}}
            };
        });

        afterEach(function() {
            deleteCartStub.restore();
            updateCartById.restore();
        });

        it('should send error when trying to delete cart document', async function() {
            const error = new Error('error');
            deleteCartStub.rejects(error);
            const { httpDeleteCart } = proxyquire('./cart.controller', {'../models/userCartProduct.model': userCartProductModel});
            await httpDeleteCart(mockReq, mockRes);
            expect(deleteCartStub.called).to.be.true;
            expect(deleteCartStub.calledWithExactly(mockReq.user)).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly(error)).to.be.true;
        });

        it('should send error when trying to delete user\'s cart', async function() {
            const error = new Error('error');
            deleteCartStub.resolves(deletedCartData);
            updateCartById.rejects(error);
            const { httpDeleteCart } = proxyquire('./cart.controller', {
                '../models/userCartProduct.model': userCartProductModel,
                '../models/user.model': userModel
            });
            await httpDeleteCart(mockReq, mockRes);
            expect(deleteCartStub.called).to.be.true;
            expect(deleteCartStub.calledWithExactly(mockReq.user)).to.be.true;
            expect(updateCartById.called).to.be.true;
            expect(updateCartById.calledWithExactly(mockReq.user._id, [])).to.be.true;
            expect(mockRes.status.called).to.be.true;
            expect(mockRes.status.calledWithExactly(404)).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly(error)).to.be.true;
        });

        it('should delete cart document and empty user\'s cart array', async function() {
            deleteCartStub.resolves(deletedCartData);
            updateCartById.resolves(mockReq.user);
            const { httpDeleteCart } = proxyquire('./cart.controller.js', {
                '../models/userCartProduct.model': userCartProductModel,
                '../models/user.model': userModel
            });
            await httpDeleteCart(mockReq, mockRes);
            expect(deleteCartStub.called).to.be.true;
            expect(deleteCartStub.calledWithExactly(mockReq.user)).to.be.true;
            expect(updateCartById.called).to.be.true;
            expect(updateCartById.calledWithExactly(mockReq.user._id, [])).to.be.true;
            expect(mockRes.send.called).to.be.true;
            expect(mockRes.send.calledWithExactly(mockReq.user)).to.be.true;
        });
    });
});