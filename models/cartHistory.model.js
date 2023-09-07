const { CartHistory } = require('./mongo_models/cartHistory.mongo');

async function findOneInCartHistoryAndPushOrder(username, userCartCollection) {
    return await CartHistory.findOneAndUpdate(
        { username: username }, 
        { $push: {ordersList: userCartCollection} }, 
        { upsert: true, new: true });
};

module.exports = {
    findOneInCartHistoryAndPushOrder
}