"use strict";
const db = require("../db");
class User {
    static find(twitter_id) {
        return new Promise(function (resolve, reject) {
            db.get().collection('users').findOne({ twitter_id: twitter_id }, function (error, doc) {
                if (error) {
                    return reject(error);
                }
                if (doc == null) {
                    return reject("User not found");
                }
                resolve(doc);
            });
        });
    }
    static findOrCreate(profile) {
        return new Promise(function (resolve, reject) {
            db.get().collection('users').findOne({ twitter_id: profile.id }, function (error, doc) {
                if (error) {
                    return reject(error);
                }
                if (doc != null) {
                    return resolve(doc);
                }
                let userDoc = {
                    twitter_id: profile.id,
                    username: profile.username,
                    displayName: profile.displayName,
                    photos: profile.photos
                };
                db.get().collection('users').insertOne(userDoc, function (error, result) {
                    if (error) {
                        return reject(error);
                    }
                    if (result.insertedCount != 1) {
                        return reject("Unable to insert document into database.");
                    }
                    resolve(userDoc);
                });
            });
        });
    }
}
exports.User = User;
