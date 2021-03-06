"use strict";
const request = require("request");
const querystring = require("querystring");
let yelpToken = false;
function authenticate() {
    return new Promise(function (resolve, reject) {
        request({
            uri: 'https://api.yelp.com/oauth2/token',
            method: 'POST',
            form: {
                grant_type: "client_credentials",
                client_id: process.env.FCC_NIGHTLIFE_YELP_APP_ID,
                client_secret: process.env.FCC_NIGHTLIFE_YELP_APP_SECRET
            }
        }, function (error, response, body) {
            if (error) {
                yelpToken = false;
                reject({
                    error: {
                        description: "Unable to authenticate with Yelp API.",
                        code: "CANNOT_AUTHENTICATE"
                    }
                });
            }
            yelpToken = JSON.parse(body);
            console.log("Authenticated with Yelp. Access token " + yelpToken.access_token + " expires in " + yelpToken.expires_in + " seconds.");
            resolve(yelpToken);
        });
    });
}
exports.authenticate = authenticate;
function token() {
    if (yelpToken) {
        return yelpToken.access_token;
    }
    else {
        return false;
    }
}
exports.token = token;
function callYelpAPI(url) {
    return new Promise(function (resolve, reject) {
        if (yelpToken == false) {
            return reject({
                error: {
                    description: "Unable to connect to the Yelp API",
                    code: "NO_TOKEN"
                }
            });
        }
        request({
            uri: url,
            auth: {
                bearer: yelpToken.access_token
            }
        }, function (error, response, body) {
            if (error) {
                reject(error);
            }
            // We may still have an error in the JSON
            let jsonBody = JSON.parse(body);
            if (jsonBody.error) {
                return reject(jsonBody);
            }
            resolve(body);
        });
    });
}
exports.callYelpAPI = callYelpAPI;
function query(location, offset = 0, limit = 20) {
    return new Promise(function (resolve, reject) {
        let params = {
            location: location,
            categories: "nightlife",
            term: "music",
            limit: limit,
            offset: offset
        };
        let queryUrl = "https://api.yelp.com/v3/businesses/search?" + querystring.stringify(params);
        callYelpAPI(queryUrl)
            .then((result) => resolve(JSON.parse(result)))
            .catch(result => {
            if (result.error.code == "TOKEN_INVALID" || result.error.code == "TOKEN_MISSING") {
                authenticate()
                    .then(() => callYelpAPI(queryUrl))
                    .then((result) => resolve(JSON.parse(result)))
                    .catch(error => reject(error));
            }
            else {
                reject(result);
            }
        });
    });
}
exports.query = query;
