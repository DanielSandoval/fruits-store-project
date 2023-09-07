const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// This are the options to pass when connecting to a mongodb database.
const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Connect to a new in-memory database server.
const connect = async function() {
    // NOTE: before establishing a new connection close previous
    await mongoose.disconnect();

    mongoServer = await MongoMemoryServer.create();

    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, opts, function(err) {
        if(err) console.log(err);
    });
    // process.env.MONGO_URI = mongoUri;
}

// Remove and close the database and server.
const close = async function() {
    await mongoose.disconnect();
    await mongoServer.stop();
}

// Remove all data from collections.
const clear = async function() {
    const collections = mongoose.connection.collections;

    for(const key in collections) {
        await collections[key].deleteMany();
    }
}

module.exports = {
    connect,
    close,
    clear
}