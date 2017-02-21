<template>
    <transition name="fade">
        <div id="business-list" class="business-list">
            <div id="business-list-flexbox">
                    <business-listing v-for="business in businesses" v-bind:business="business" v-bind:key="business.id"></business-listing>
            </div>
        </div>
    </transition>
</template>

<script>
import BusinessListing from "./BusinessListing.vue";

export default {
    props: ["businesses"],
    components: {
        BusinessListing
    }
};
</script>

<style>
    #business-list {
        margin-top: 100px;
    }

    #business-list-flexbox {
        display: flex;
        flex-flow: row wrap;
    }
</style>