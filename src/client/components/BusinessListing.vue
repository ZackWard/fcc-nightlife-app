<template>
    <transition name="fade">
        <div class="business-listing">
            <div class="listing-top">
                <div class="business-image" v-bind:style="imageStyle"></div>
                <div class="business-data">
                    <h3>{{ business.name }}</h3>
                    <div class="business-data-body">
                        <div class="business-data-address">
                            <address>
                                {{ business.location.display_address[0] }}<br>
                                {{ business.location.display_address[1] }}<br>
                                <abbr title="Phone">P:</abbr> {{ business.display_phone }}
                            </address>
                        </div>
                        <div class="business-data-yelp text-center">
                            <a v-bind:href="business.url"><img class="yelp-logo" src="https://assets.zackward.net/Yelp_trademark_RGB.png"></a><br />
                            <img class="yelp-rating" v-bind:src="starRating">
                            <p>Based on {{ business.review_count }} reviews</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="listing-bottom">
                <hr>
                <div class="card-footer">
                    <div class="attendance">
                        <p>{{ attendees }} going tonight</p>
                    </div>
                    <template v-if="loggedIn">
                        <div class="card-footer-actions">
                            <a class="btn btn-default" v-if="currentUserAttending" href="#" @click.prevent="toggleReservation">Cancel, not going.</a>
                            <a class="btn btn-default" v-if="! currentUserAttending" href="#" @click.prevent="toggleReservation">I'll go!</a>
                        </div>
                    </template>
                    <template v-else>
                        <div class="card-footer-actions">
                            <a class="btn btn-default" href="#" @click.prevent="attemptLogin"><img src="https://assets.zackward.net/sign-in-with-twitter-link.png"></a>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ["business"],
    data: function () {
        return {
            attendees: this.business.attendeeCount > 0 ? this.business.attendeeCount : 0,
            currentUserAttending: this.business.currentUserAttending,
            imageStyle: {
                backgroundImage: 'url(' + this.business.image_url + ')'
            }
        };
    },
    computed: {
        starRating: function () {
            let ext = String(this.business.rating).length > 1 ? "_half.png" : ".png";
            let fileName = "regular_" + Math.floor(this.business.rating) + ext;
            return "https://assets.zackward.net/stars/" + fileName;
        },
        loggedIn: function () {
            return this.$store.state.loggedIn;
        }
    },
    methods: {
        attemptLogin () {
            window.open('/login/twitter', '_blank');
        },
        toggleReservation () {
            let thisComponent = this;

            $.ajax({
                method: "GET",
                url: "/api/v1/toggleReservation",
                dataType: "json",
                data: {
                    yelpID: this.business.id
                },
                success: (data, textStatus, jqXHR) => { 
                    console.log("Success!"); 
                    console.log(data); 
                    // Optimistically update the local state and UI
                    thisComponent.currentUserAttending = ! this.currentUserAttending;
                    thisComponent.attendees = (this.currentUserAttending ? this.attendees + 1 : this.attendees - 1);
                },
                error: (jqXHR, textStatus, errorThrown) => { console.log(textStatus + "; " + errorThrown); }
            });
            console.log("I'm going!");
        }
    }
};
</script>

<style>
.business-listing {
    border-radius: 2px;
    /* box-shadow: 0px 1.5px 4px black, 0px 1.5px 6px black; */
    box-shadow: 0 6px 20px 0 rgba(0,0,0,.19), 0 8px 17px 0 rgba(0,0,0,.2);
    flex: 1 1 300px;
    margin: 10px;
    overflow: hidden;

    /* This is also a flex container */
    display: flex;
    flex-flow: column;
}

.listing-top {
    flex: 1 0 auto;
}

.business-data-body {
    display: flex;
    align-items: center;
}

.business-data-rating {
    flex: 1 1 auto;
}

.business-data-address {
    flex: 1 1 auto;
}

.listing-bottom {
    flex: 0 0 50px;
}

.listing-bottom hr {
    padding: 0px 0px 0px 0px;
    margin: 0px;
}

.card-footer {
    display: flex;
    align-items: center;
}

.attendance-count {
    flex: 0 1 auto;
    margin-right: auto;
}

.card-footer-actions {
    flex: 0 1 auto;
    margin-left: auto;
}

.listing-bottom a,
.listing-bottom p {
    margin: 10px;
}

.business-image {
    overflow: hidden;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 300px;
}

.business-image::before {
    content: ' ';
}

.business-data {
    width: 100%;
    padding: 0px 15px 15px 15px;
}

.yelp-logo {
    width: 100px;
    height: 64px;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 1s
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0
}
</style>