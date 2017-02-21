"use strict";
const path = require("path");
const dotenv = require("dotenv");
const yelp = require("./yelp");
const db = require("./db");
const User_1 = require("./models/User");
const express = require("express");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session");
const helmet = require("helmet");
// Read the environment
dotenv.config();
// Set up our connection to MongoDB
db.connect('mongodb://localhost:27017/fcc_nightlife_app');
// For development, we're going to use ngrok to expose our server to the internet so that Twitter can reach our callback URL.
let ngrokUrl = "http://ba04ee06.ngrok.io";
let port = 3006;
let publicPath = path.join(__dirname, "..", "public");
let yelpToken = false;
// Configure Passport
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
passport.use(new TwitterStrategy({
    consumerKey: process.env.FCC_NIGHTLIFE_TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.FCC_NIGHTLIFE_TWITTER_CONSUMER_SECRET,
    callbackURL: ngrokUrl + "/login/twitter/callback"
}, function (token, tokenSecret, profile, cb) {
    // This will be called when a user grants permission to our app to sign in with Twitter. 
    // Store the user in the database. The User object will eventually end up in req.user in Express.
    console.log("In TwitterStrategy::verify");
    User_1.User.findOrCreate(profile)
        .then(user => cb(null, user))
        .catch(error => cb(error, null));
}));
// Configure Passport authorization session persistance
passport.serializeUser(function (user, cb) {
    console.log("In serializeUser");
    console.log(user);
    cb(null, user.twitter_id);
});
passport.deserializeUser(function (twitterId, cb) {
    console.log("In unserializeUser");
    console.log(twitterId);
    User_1.User.find(twitterId)
        .then(user => cb(null, user))
        .catch(error => cb(error, null));
});
let MongoDBStore = mongoDBSession(session);
let store = new MongoDBStore({
    uri: "mongodb://localhost:27017/connect_mongodb_sessions",
    collection: "fcc_nightlife_sessions"
});
store.on('error', function (error) {
    console.log(error);
});
// Configure Yelp API. We need to authenticate with Yelp so that we can make requests
yelp.authenticate();
// Configure Express
let app = express();
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // Days * Hours * Minutes * Seconds * Milliseconds 
app.use(require('express-session')({
    secret: process.env.FCC_NIGHTLIFE_COOKIE_SECRET,
    cookie: {
        maxAge: ONE_WEEK
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));
app.use(helmet());
app.use('/static', express.static(publicPath));
// Initialize passport sessions
app.use(passport.initialize());
app.use(passport.session());
// Define custom middleware
const verifyUser = (req, res, next) => {
    if (req.user == undefined) {
        res.status(401).json({
            error: {
                description: "You need to log in before you can use this API.",
                code: "NOT_AUTHORIZED"
            }
        });
    }
    else {
        next();
    }
};
// Configure Routes
app.get("/", function (req, res) {
    res.sendFile(path.join(publicPath, 'index.html'));
});
app.get('/login/twitter', passport.authenticate('twitter'));
app.get("/login/twitter/callback", passport.authenticate('twitter', { failureRedirect: "/login" }), function (req, res) {
    res.sendFile(path.join(publicPath, 'loginFinished.html'));
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
// API Routes
app.get('/api/v1/search', function (req, res) {
    let offset = req.query.offset == undefined ? 0 : Number(req.query.offset);
    let limit = req.query.limit == undefined ? 20 : Number(req.query.limit);
    limit = limit > 50 ? 50 : limit;
    yelp.query(req.query.query, offset, limit)
        .then(yelpResult => db.getAttendees(yelpResult, req.user))
        .then(yelpResultWithAttendees => res.json({
        receivedQuery: req.query.query,
        results: yelpResultWithAttendees
    }))
        .catch(error => res.status(500).json(error));
});
app.get('/api/v1/toggleReservation', verifyUser, function (req, res) {
    console.log("Received reservation request");
    db.toggleReservation(req.query.yelpID, req.user.twitter_id)
        .then(result => res.json(result))
        .catch(error => res.status(500).end(error));
});
// Yelp Routes
app.get('/yelp', function (req, res) {
    console.log("Serving Yelp route for user:");
    console.log(req.user);
    yelp.query("Monte Vista, CO")
        .then(result => res.end(result))
        .catch(error => res.status(500).end(error));
});
// Start the server
app.listen(port, 'localhost', function () {
    console.log("Server listening on port " + port);
});
