// modules
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

// require routers
const indexRouter = require('./routes/index.router');
const aboutRouter = require('./routes/about.router');
const registerRouter = require('./routes/register.router');
const loginRouter = require('./routes/login.router');
const inventoryRouter = require('./routes/inventory.router');
const cartRouter = require('./routes/cart.router');
const logoutRouter = require('./routes/logout.router');
const chatRouter = require('./routes/chat.router');
const cartHistoryRouter = require('./routes/cartHistory.router');
const notFoundedRouter = require('./routes/404.router');

// require authentication
const auth = require("./config/auth");
const { emit } = require("process");

// require check authenticacion and authorized functions
const ensureAuthenticated = require('./config/ensureAuthenticatedFunc');
const checkAuthorized = require('./config/checkAdminAuthorizationFunc');

// cors
app.use(cors());

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// mongodb connection
if(process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});
}

// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    key: 'express.sid',
    store: store
}));

app.use(passport.initialize());
app.use(passport.session());

// session parsing and decoding the cookie
io.use(
    passportSocketIo.authorize({
        cookieParser: cookieParser,
        key: 'express.sid',
        secret: process.env.SESSION_SECRET,
        store: store,
        success: onAuthorizeSuccess,
        fail: onAuthorizeFail
    })
);

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    if(error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
}

// listen for requests
http.listen(process.env.PORT, function() {
    console.log('Listening on port 3000');
});

// set ejs
app.set('view engine', 'ejs');

// static files
app.use(express.static(__dirname + '/public'));

// routing
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/api/inventory', ensureAuthenticated, checkAuthorized, inventoryRouter);
app.use('/api/cart', cartRouter);
app.use('/chat', chatRouter);
app.use('/api/cart-history', ensureAuthenticated, cartHistoryRouter);
app.use('*', notFoundedRouter);

// authenticate
auth();

// socket
let socket = require('./socket/socket');
socket(io);

// seed - fill the database with initial information
let seed = require('./seed');
seed.createInitalAccount('admin1@admin', 'admin', '1', 'admin123', 'admin');
seed.createInitalAccount('w@w', 'user', 'test', '123', 'user');
seed.createInitalAccount('user1@user', 'user', '1', 'user123', 'user');
seed.createFullInitialInventory();

// export the app-express object for testing
module.exports = app;