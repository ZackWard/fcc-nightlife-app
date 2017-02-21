import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
      message: '',
      loggedIn: Boolean(window.localStorage.getItem('fcc-nightlife-logged-in'))
  },
  mutations: {
      setMessage (state, payload) {
        state.message = payload.message
      },
      doLoginComplete (state, payload) {
        console.log("Login complete!");
        window.localStorage.setItem('fcc-nightlife-logged-in', "true");
        state.loggedIn = true;
      },
      logout (state, payload) {
        window.localStorage.removeItem('fcc-nightlife-logged-in');
        state.loggedIn = false;
      }

  },
  actions: {
    doSearch (state, payload) {
      
    }
  }
});

window.handleLoginComplete = function () {
  store.commit('doLoginComplete');
};