import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    categories: [],
    tags: [],
    posts: [],
    widgets: [],
    pages: {},
    post: null,
    busy: true,
    forceReload: false,
    page: {},
    token: window.localStorage.token || '',
  },
  actions,
  mutations
})