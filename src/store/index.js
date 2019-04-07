import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = 'https://deckofcardsapi.com/api/deck'
axios.defaults.headers.common['Content-Type'] = 'application/json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    deckId: '',
    listCard: [],
    remaining: 52,
    score: {
      player1: 0,
      player2: 0,
      player3: 0,
      player: 0,
    },
    totalScore: {
      player1: 0,
      player2: 0,
      player3: 0,
      player: 0,
    },
    currentGame: '',
    recap: {}
  },
  getters: {
    deckId: state => {
      return state.deckId
    }
  },
  mutations: {
    setDeckId(state, deckId) {
      state.deckId = deckId
    },
    setRemaining(state, remaining) {
      state.remaining = remaining
    },
    setListCard(state, listCard) {
      state.listCard = listCard
    },
    setScore(state, { player, score }) {
      state.score[player] = score
    },
    setTotalScore(state, { player, totalScore }) {
      state.totalScore[player] += totalScore
    },
    setCurrentGame(state, currentGame) {
      state.currentGame = currentGame
    },
    addReCap(state) {
      state.recap[state.currentGame] = []
    },
    setReCap(state, result) {
      state.recap[state.currentGame].push(result)
    },
    resetTotalScore(state) {
      state.totalScore = {
        player1: 0,
        player2: 0,
        player3: 0,
        player: 0,
      }
    }
  },
  actions: {
    getDeck({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get('new/shuffle?deck_count=1').then(({ data }) => {
          if (data) {
            commit('setDeckId', data.deck_id)
            commit('setRemaining', data.remaining)
            resolve(data)
          }
        }).catch(error => reject(error))
      })
    },
    shuffleDeck({ commit, getters }) {
      return new Promise((resolve, reject) => {
        axios.get(`${getters.deckId}/shuffle`).then(({ data }) => {
          if (data) {
            commit('setRemaining', data.remaining)
            resolve(data)
          }
        }).catch(error => reject(error))
      })
    },
    getListCard({ commit, getters }) {
      return new Promise((resolve, reject) => {
        axios.get(`${getters.deckId}/draw/?count=12`).then(({ data }) => {
          if (data) {
            commit('setListCard', data.cards)
            commit('setRemaining', data.remaining)
            resolve(data)
          }
        }).catch(error => reject(error))
      })
    }
  }
})
