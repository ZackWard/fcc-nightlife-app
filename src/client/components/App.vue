<template>
    <div class="container">
        <div class="login-logout text-right">
            <template v-if="! this.$store.state.loggedIn">
                <button class="btn btn-default">
                    <a href="#" @click.prevent="openLoginTab"><img src="https://assets.zackward.net/sign-in-with-twitter-link.png"></a>
                </button>
            </template>
            <template v-else>
                <a class="btn btn-default" href="#" @click.prevent="logout">Logout</a>
            </template>
        </div>
        <div class="text-center">
            <h1>Concert Planner</h1>
            <h4>Coordinate your concert plans with your friends!</h4>
        </div>
        <div class="input-group">
            <input type="text" id="search-box" v-model="search" class="form-control" placeholder="Where are you?">
            <span class="input-group-btn">
                <button class="btn btn-default" type="button" @click.prevent="doSearch" @keyup.enter="doSearch">Search</button>
            </span>
        </div>
        <business-list v-bind:businesses="businesses"></business-list>
         <div id="more-button" class="text-center">
            <a class="btn btn-default" v-if="businessCount < totalBusinesses && ! loading" href="#" @click.prevent="getMore">More...</a>
            <a class="btn btn-default" v-else-if="loading">Loading...</a>
        </div>
    </div>
</template>

<script>
    import BusinessList from "./BusinessList.vue";

    export default {
        components: { BusinessList },
        data: function () {
            return {
                search: "",
                businesses: [],
                totalBusinesses: 0,
                limit: 20,
                loading: false
            };
        },
        computed: {
            loggedIn: function () {
                return this.$store.state.loggedIn
            },
            businessCount: function () {
                return this.businesses.length;
            }
        },
        methods: {
            openLoginTab () {
                window.open('/login/twitter', '_blank');
            },
            logout () {
                this.$store.commit('logout');
            },
            getMore () {
                this.doSearch(false);
            },
            doSearch (clearResults = true) {
                let thisComponent = this;
                this.loading = true;
                $.ajax({
                        url: "/api/v1/search",
                        method: "GET",
                        data: {
                            query: this.search,
                            offset: this.businessCount,
                            limit: this.limit
                        },
                        dataType: "json",
                        success: function (data, textStatus, jqXHR) {
                            console.log("Got AJAX response.");
                            console.log(data);
                            let msBetweenInserts = 50;
                            thisComponent.businesses = clearResults ? [] : thisComponent.businesses;

                            for (let i = 0; i < data.results.businesses.length; i++) {
                                window.setTimeout(function (index) {
                                    thisComponent.businesses.push(data.results.businesses[index]);
                                }, msBetweenInserts * i, i);
                            } 

                            thisComponent.loading = false;
                            thisComponent.totalBusinesses = data.results.total;
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            thisComponent.loading = false;
                            console.log("AJAX error.");
                        }                      
                });
            }
        }
    };
</script>

<style>
#more-button {
    margin-top: 75px;
    margin-bottom: 75px;
}

.login-logout {
    padding-top: 25px;
    padding-bottom: 25px;
}
</style>