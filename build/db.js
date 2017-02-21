"use strict";
const mongo = require("mongodb");
let state = {
    db: false
};
const MIN_HOURS_BETWEEN_RESERVATIONS = 24;
function connect(url) {
    return new Promise(function (resolve, reject) {
        mongo.MongoClient.connect(url, function (error, db) {
            if (error) {
                reject(error);
            }
            else {
                state.db = db;
                console.log("Connected to MongoDB");
                resolve(db);
            }
        });
    });
}
exports.connect = connect;
function get() {
    return state.db;
}
exports.get = get;
function getAttendees(yelpResponse, user) {
    return new Promise(function (resolve, reject) {
        // Check each yelp business id against our checkins database, and see how many other users are attending each business tonight
        let yelpIDs = yelpResponse.businesses.map(business => business.id);
        let reservationCutoff = new Date(Date.now() - MIN_HOURS_BETWEEN_RESERVATIONS * 60 * 60 * 1000);
        // Find all other reservations to the same venues in the last period defined by MIN_HOURS_BETWEEN_RESERVATIONS, then aggregate them
        // to find a count of how many others will be attending, and a list of the users who will be attending.
        let matchStage = { "$match": { business: { "$in": yelpIDs }, when: { "$gt": reservationCutoff } } };
        let groupStage = { "$group": { "_id": "$business", count: { "$sum": 1 }, attendees: { "$addToSet": "$user" } } };
        let cursor = state.db.collection('reservations').aggregate([matchStage, groupStage]);
        cursor.toArray(function (error, docs) {
            if (error) {
                console.log(error);
                return reject(error);
            }
            console.log(docs);
            // Now, we just need to merge this data back into our Yelp API response
            yelpResponse.businesses.forEach((business, businessIndex) => {
                docs.forEach((doc) => {
                    if (business.id == doc["_id"]) {
                        business.attendeeCount = doc.count;
                        if (user) {
                            business.currentUserAttending = doc.attendees.indexOf(String(user.twitter_id)) == -1 ? false : true;
                        }
                    }
                });
            });
            resolve(yelpResponse);
        });
    });
}
exports.getAttendees = getAttendees;
function toggleReservation(yelpID, userTwitterID) {
    return new Promise(function (resolve, reject) {
        let reservation = {
            business: yelpID,
            user: userTwitterID,
            when: new Date()
        };
        // Check to see if we already have a record with this business and user in the last 12 hours. If so, we'll remove it
        state.db.collection('reservations').find({ business: yelpID, user: userTwitterID }).toArray(function (err, documents) {
            if (err) {
                return reject(err);
            }
            let nowMS = new Date().valueOf();
            let recentReservationExists = false;
            let recentReservationID = null;
            documents.forEach(doc => {
                let reservationMS = doc.when.valueOf();
                let hoursSinceReservation = (nowMS - reservationMS) / 1000 / 60 / 60;
                if (hoursSinceReservation < MIN_HOURS_BETWEEN_RESERVATIONS) {
                    recentReservationExists = true;
                    recentReservationID = doc["_id"];
                }
            });
            if (recentReservationExists) {
                state.db.collection('reservations').deleteOne({ "_id": recentReservationID }, {}, function (error, status) {
                    if (error) {
                        return reject(error);
                    }
                    resolve({ status: "Reservation removed" });
                });
            }
            else {
                state.db.collection('reservations').insertOne(reservation, function (error, result) {
                    if (error) {
                        return reject(error);
                    }
                    resolve({ status: "Reservation added" });
                });
            }
        });
    });
}
exports.toggleReservation = toggleReservation;
