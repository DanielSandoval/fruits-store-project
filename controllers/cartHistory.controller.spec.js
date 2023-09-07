const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = require('chai');

const userModel = require('../models/user.model');
const inventoryModel = require('../models/inventory.model');
const userCartProductModel = require('../models/userCartProduct.model');
const userCartOrderModel = require('../models/userCartOrder.model');
const cartHistoryModel = require('../models/cartHistory.model');

describe('Unit tests on cartHistoy controller', function() {
    let req, res;

    beforeEach(function() {
        req = { user: { _id: 'fake_id' } };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy(),
            send: sinon.spy()
        };
    });

    describe('Test httpPostToCartHistory function in the controller', function() {
        let getUserByIdStub;
        let updateProductInInventoryStub;
        let findUserCartProductStub;
        let findCartOnUserStub;
        let createUserCartOrderStub;
        let updateCartHistoryStub;

        let userInfo = {
            _id: 'fake_id',
            username: 'test_user@user',
            userCart: [
                {_id: '2', product: 'fruit_2'},
                {_id: '3', product: 'fruit_3'},
                {_id: '1', product: 'fruit_1'}
            ]
        };

        let userInfoWithEmptyCart = {
            _id: 'fake_id',
            username: 'test_user@user',
            userCart: []
        };

        let userCartSorted = [
            {_id: '1', product: 'fruit_1'},
            {_id: '2', product: 'fruit_2'},
            {_id: '3', product: 'fruit_3'}
        ];

        let inventoryProduct = {
            product: { productName: 'fake_product' },
            existence: 10
        };

        let userCartProduct = {
            username: 'test_user@user',
            product: { productName: 'fake_product' },
            quantityBuy: 10
        };

        let userCartArr = [
            {
                username: 'test_user@user',
                product: { productName: 'fake_product_1' },
                quantityBuy: 10
            },
            {
                username: 'test_user@user',
                product: { productName: 'fake_product_2' },
                quantityBuy: 5
            }
        ];

        let cartHistory = {
            username: 'test_user@user',
            ordersList: [
                { userCartArr: [
                    { product: { productName: 'fake_product_1',
                    price: 10 } },
                    { product: { productName: 'fake_product_2',
                    price: 5 } }
                ] },
                { userCartArr: [
                    { product: { productName: 'fake_product_3',
                    price: 8 } },
                    { product: { productName: 'fake_product_4',
                    price: 1 } }
                ] }
            ]
        };

        beforeEach(function() {
            getUserByIdStub = sinon.stub(userModel, 'getUserById');
            updateProductInInventoryStub = sinon.stub(inventoryModel, 'updateProductInInventoryByName');
            findUserCartProductStub = sinon.stub(userCartProductModel, 'findUserCartProductById');
            findCartOnUserStub = sinon.stub(userModel, 'findCartByIdOnUserAndUpdate');
            createUserCartOrderStub = sinon.stub(userCartOrderModel, 'createUserCartOrder');
            updateCartHistoryStub = sinon.stub(cartHistoryModel, 'findOneInCartHistoryAndPushOrder');
        });

        afterEach(function() {
            getUserByIdStub.restore();
            updateProductInInventoryStub.restore();
            findUserCartProductStub.restore();
            findCartOnUserStub.restore();
            createUserCartOrderStub.restore();
            updateCartHistoryStub.restore();
        });

        it('should throw error when it can\'t find user by id', async function() {
            let error = new Error('No user found');
            getUserByIdStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {'../models/user.model': userModel});
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should throw error when trying to update quantity of inventary because there is a error in database', async function() {
            let error = new Error('Error in database');
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
            });
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should throw error when trying to update quantity of inventary because there is not enough products', async function() {
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(null);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
            });
            expect(res.send.called).to.be.true;
            expect(res.send.calledWithExactly('Not enough products in inventory')).to.be.true;
        });

        it('should throw error when it can\'t find existing cart product document', async function() {
            let error = new Error('It can\'t find existing cart product document');
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(inventoryProduct);
            findUserCartProductStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            expect(findUserCartProductStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
                expect(findUserCartProductStub.getCall(index).calledWithExactly(cartElement._id)).to.be.true;
            });
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should throw error trying to update user\'s cart', async function() {
            let error = new Error('Error trying to update user\'s cart')
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(inventoryProduct);
            findUserCartProductStub.resolves(userCartProduct);
            findCartOnUserStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            expect(findUserCartProductStub.called).to.be.true;
            expect(findCartOnUserStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
                expect(findUserCartProductStub.getCall(index).calledWithExactly(cartElement._id)).to.be.true;
                expect(findCartOnUserStub.getCall(index).calledWithExactly(req.user._id, [])).to.be.true;
            });
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should throw error trying creating user cart order document', async function() {
            let error = new Error('Error trying creating user cart order document');
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(inventoryProduct);
            findUserCartProductStub.resolves(userCartProduct);
            findCartOnUserStub.resolves(userInfoWithEmptyCart);
            createUserCartOrderStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel,
                '../models/userCartOrder.model': userCartOrderModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            expect(findUserCartProductStub.called).to.be.true;
            expect(findCartOnUserStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
                expect(findUserCartProductStub.getCall(index).calledWithExactly(cartElement._id)).to.be.true;
                expect(findCartOnUserStub.getCall(index).calledWithExactly(req.user._id, [])).to.be.true;
            });
            expect(createUserCartOrderStub.called).to.be.true;
            expect(createUserCartOrderStub.calledWithExactly(userCartSorted)).to.be.true;
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should throw error trying to update user cart history', async function() {
            let error = new Error('Error trying to update user cart history');
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(inventoryProduct);
            findUserCartProductStub.resolves(userCartProduct);
            findCartOnUserStub.resolves(userInfoWithEmptyCart);
            createUserCartOrderStub.resolves(userCartArr);
            updateCartHistoryStub.rejects(error);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel,
                '../models/userCartOrder.model': userCartOrderModel,
                '../models/cartHistory.model': cartHistoryModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            expect(findUserCartProductStub.called).to.be.true;
            expect(findCartOnUserStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
                expect(findUserCartProductStub.getCall(index).calledWithExactly(cartElement._id)).to.be.true;
                expect(findCartOnUserStub.getCall(index).calledWithExactly(req.user._id, [])).to.be.true;
            });
            expect(createUserCartOrderStub.called).to.be.true;
            expect(createUserCartOrderStub.calledWithExactly(userCartSorted)).to.be.true;
            expect(updateCartHistoryStub.called).to.be.true;
            expect(updateCartHistoryStub.calledWithExactly(req.user.username, userCartArr)).to.be.true;
            expect(res.status.called).to.be.true;
            expect(res.status.calledWithExactly(404)).to.be.true;
            expect(res.json.called).to.be.true;
            expect(res.json.calledWithExactly({error})).to.be.true;
        });

        it('should return user\'s cart history updated', async function() {
            getUserByIdStub.resolves(userInfo);
            updateProductInInventoryStub.resolves(inventoryProduct);
            findUserCartProductStub.resolves(userCartProduct);
            findCartOnUserStub.resolves(userInfoWithEmptyCart);
            createUserCartOrderStub.resolves(userCartArr);
            updateCartHistoryStub.resolves(cartHistory);
            const { httpPostToCartHistory } = proxyquire('./cartHistory.controller', {
                '../models/user.model': userModel,
                '../models/inventory.model': inventoryModel,
                '../models/userCartProduct.model': userCartProductModel,
                '../models/userCartOrder.model': userCartOrderModel,
                '../models/cartHistory.model': cartHistoryModel
            });
            await httpPostToCartHistory(req, res);
            expect(getUserByIdStub.called).to.be.true;
            expect(getUserByIdStub.calledWithExactly(userInfo._id)).to.be.true;
            expect(updateProductInInventoryStub.called).to.be.true;
            expect(findUserCartProductStub.called).to.be.true;
            expect(findCartOnUserStub.called).to.be.true;
            userCartSorted.forEach(function(cartElement, index) {
                expect(updateProductInInventoryStub.getCall(index).calledWithExactly(cartElement)).to.be.true;
                expect(findUserCartProductStub.getCall(index).calledWithExactly(cartElement._id)).to.be.true;
                expect(findCartOnUserStub.getCall(index).calledWithExactly(req.user._id, [])).to.be.true;
            });
            expect(createUserCartOrderStub.called).to.be.true;
            expect(createUserCartOrderStub.calledWithExactly(userCartSorted)).to.be.true;
            expect(updateCartHistoryStub.called).to.be.true;
            expect(updateCartHistoryStub.calledWithExactly(req.user.username, userCartArr)).to.be.true;
            expect(res.send.called).to.be.true;
            expect(res.send.calledWithExactly(cartHistory)).to.be.true;
        });
    });
});