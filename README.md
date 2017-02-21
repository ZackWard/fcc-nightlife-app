# FCC Nightlife App

User Stories:

- [ ] User Story: As an unauthenticated user, I can view all bars in my area.
- [ ] User Story: As an authenticated user, I can add myself to a bar to indicate I am going there tonight.
- [ ] User Story: As an authenticated user, I can remove myself from a bar if I no longer want to go there.
- [ ] User Story: As an unauthenticated user, when I login I should not have to search again.

### Strategy

Use passport.js to allow user authentication with Twitter. 
Use the Yelp API for nightlife venues

When a user clicks "going", store the user id, the yelp id, and the date in the database. 

Format:
{
    yelpVenueId: Number,
    dates: [
        {
            date: Date,
            attendees: [user1TwitterId, user2TwitterId, user3TwitterId, ...]
        }
    ]
}

When a user searches for venues, check our database for all of the Yelp results. If any are found, check for today's date. If found, show a count of attendees.