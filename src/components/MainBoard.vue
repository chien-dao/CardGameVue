<template>
  <div class="background">
    <Player
      :customStyle="{
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        'z-index': 2
      }"
      player="player1"
      :cards="playersCards(0)"
      :earned="provideScore('player1')"
      :round="round"
      :reveal="reveal"
    />
    <Player
      :customStyle="{
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        'z-index': 1
      }"
      player="player2"
      :cards="playersCards(1)"
      :earned="provideScore('player2')"
      :round="round"
      :reveal="reveal"
    />
    <Player
      :customStyle="{
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        'z-index': 1
      }"
      player="player3"
      :cards="playersCards(3)"
      :earned="provideScore('player3')"
      :round="round"
      :reveal="reveal"
    />
    <div class="players-score-board">
      <div class="info">
        <p class="score">This round's score: {{ ownedScore }}</p>
        <p class="score">Total score: {{ ownedTotalScore }}</p>
      </div>
      <div class="buttons">
        <button class="btn-shuffle" @click="shuffleDeck">Shuffle</button>
        <button class="btn-draw" @click="dealCards" :disabled="!reveal">Draw</button>
        <button class="btn-reveal" @click="revealAllCards" :disabled="gettingData">Reveal</button>
        <button class="btn-recap" @click="getGamesResult" :disabled="!(gameRound === 5)">Recap</button>
      </div>
      <h2 class="round">Round {{ gameRound }}</h2>
    </div>
    <div class="main-player">
      <div class="main-player__info">
        <h3 class="name">Player</h3>
        <p class="score">{{ ownedScore }}</p>
        <p class="score">{{ ownedTotalScore }}</p>
      </div>
      <div class="main-player__cards">
        <div v-for="ownedCard in ownedCards" :key="ownedCard.code" class="card-img">
          <img :src="ownedCard.image" alt="">
        </div>
      </div>
    </div>
    <div class="deck">
      <div class="cards">
        <img class="card-back" v-for="index in remaining" :key="index" :ref="'cards'" src="../assets/cards-back.png" alt="">
      </div>
    </div>
    <div class="fade" v-if="isShowRecap" @click="hideRecap">
      <div class="recap-container">
        <div v-for="game in Object.keys(this.currentRecap)" :key="game" class="recap" @click.stop>
          <h3 class="game-name">{{ game }}</h3>
          <div v-for="(round, index) in currentRecap[game]" :key="`round-${index}`" class="recap__info">
            <h4 class="round-name">Round {{ index + 1 }}</h4>
            <div class="info-container">
              <div v-for="player in round" :key="player.player" class="recap__players">
                <h4>{{ player.player }}</h4>
                <p>{{ Number.isFinite(player.score) ? player.score : 'Win this round' }}</p>
                <p>{{ player.totalScore }}</p>
              </div>
            </div>
          </div>
          <div class="recap__winners">
            <h3 class="winners-title">{{ currentRecap[game].length === 5 ? winners.length > 1 ? 'Winners' : 'Winner' : winners.length > 1 ? 'Lead players' : 'Lead player' }}</h3>
            <div class="winners-container">
              <div v-for="winner in winners" :key="winner.player" class="winner">
                <h2>{{ winner.player }} - {{ winner.totalScore }}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Player from './Player'

export const specialValue = {
  ACE: 1,
  JACK: 10,
  QUEEN: 10,
  KING: 10
}
let uniqueId = 0;
const totalEarned = 20000
export default {
  name: 'MainBoard',
  props: {
    msg: String
  },
  data() {
    return {
      highestScore: 0,
      earnedScore: totalEarned,
      results: [],
      currentRecap: {},
      gameRound: 0,
      revealCards: false,
      royalSet: ['JACK', 'QUEEN', 'KING'],
      isShowRecap: false,
      isShowWinner: false,
      isGettingData: false,
      winners: []
    }
  },
  created: async function() {
    await this.getDeck()
    this.dealCards()
  },
  mounted() {
    this.setGame()
    this.cards.forEach((card, index) => {
      card.style.transform = `translate(-${0.25 * index}px, -${0.25 * index}px)`
    })
  },
  components: {
    Player
  },
  computed: {
    ...mapState(['remaining', 'listCard', 'score', 'totalScore','currentGame', 'recap']),
    cards() {
      return this.$refs.cards
    },
    ownedCards() {
      const ownedCard = this.playersCards(2)
      if (ownedCard.length) {
        const totalScore = ownedCard.reduce((total, current) => {
          this.spliceRoyalSet(current.value)
          const parsedValue = specialValue[current.value] ? specialValue[current.value] : +current.value
          return total + parsedValue
        }, 0)
        const isInstanceWin = this.royalSet.length > 0 ? false : true
        this.setScore({
          player: 'player',
          score: isInstanceWin ? Number.POSITIVE_INFINITY : totalScore % 10
        })
      }
      return ownedCard
    },
    ownedScore() {
      return this.score.player === Number.POSITIVE_INFINITY ? 'Win this round' : this.score.player
    },
    ownedTotalScore() {
      return this.totalScore.player
    },
    round() {
      return `round-${this.gameRound}`
    },
    reveal() {
      return this.revealCards
    },
    gettingData() {
      return this.isGettingData
    },
  },
  methods: {
    ...mapActions(['getDeck', 'getListCard', 'shuffleDeck']),
    ...mapMutations(['setCurrentGame', 'addReCap', 'setReCap', 'setScore', 'setTotalScore', 'resetTotalScore']),
    playersCards(index) {
      if (this.listCard.length) {
        return this.listCard.filter((card, i) => (i%4) === index)
      }
      return []
    },
    setGame() {
      uniqueId++;
      this.setCurrentGame(`game-${uniqueId}`)
      this.addReCap()
    },
    async dealCards() {
      this.revealCards = false
      this.isGettingData = true
      this.resetRoyalSet()
      if (this.remaining < 12) {
        await this.shuffleDeck()
      }
      await this.getListCard()
      this.isGettingData = false
      this.gameRound++;
      this.setResults()
      this.saveRecap()
    },
    revealAllCards() {
      this.revealCards = true
      this.setMainPlayerTotalScore(this.provideScore('player'))
      if (this.gameRound === 5) {
        this.getGamesResult()
        this.setGame()
        this.gameRound = 0
        this.shuffleDeck()
        this.resetTotalScore()
      }
    },
    setResults() {
      const { player: playerScore, player1: player1Score, player2: player2Score, player3: player3Score } = this.score
      const { player: playerTotalScore, player1: player1TotalScore, player2: player2TotalScore, player3: player3TotalScore } = this.totalScore
      this.highestScore = Math.max(playerScore, player1Score, player2Score, player3Score)
      this.results = this.results.length ? this.results.map(res => {
        switch(res.player) {
          case 'player':
            return {
              ...res,
              score: playerScore,
              totalScore: playerTotalScore
            }
          case 'player1':
            return {
              ...res,
              score: player1Score,
              totalScore: player1TotalScore
            }
          case 'player2':
            return {
              ...res,
              score: player2Score,
              totalScore: player2TotalScore
            }
          case 'player3':
            return {
              ...res,
              score: player3Score,
              totalScore: player3TotalScore
            }
          default:
            return {
              ...res,
              score: playerScore,
              totalScore: playerTotalScore
            }
        }
      }) : [{
          player: 'player',
          score: playerScore,
          totalScore: playerTotalScore
        },
        {
          player: 'player1',
          score: player1Score,
          totalScore: player1TotalScore
        },
        {
          player: 'player2',
          score: player2Score,
          totalScore: player2TotalScore
        },
        {
          player: 'player3',
          score: player3Score,
          totalScore: player3TotalScore
        },
      ]
      this.results.sort((a, b) => b.score - a.score)
      this.results = this.results.map((result, index) => {
        if (result.score === this.highestScore) {
          return {
            ...result,
            ranked: 1,
            ranked1Count: result.ranked1Count ? result.ranked1Count + 1 : 1
          }
        }
        return {
          ...result,
          ranked: index + 1,
          ranked1Count: result.ranked1Count ? result.ranked1Count : 0
        }
      })
      this.earnedScore = Math.floor(totalEarned / this.results.filter(res => res.ranked === 1).length)
      this.results = this.results.map(result => {
        if (result.score === this.highestScore) {
          return {
            ...result,
            totalScore: result.totalScore + this.earnedScore
          }
        }
        return {
          ...result
        }
      })
    },
    saveRecap() {
      this.setReCap(this.results)
    },
    hideRecap() {
      this.isShowRecap = false
    },
    provideScore(playersName) {
      if (this.results.length) {
        return this.results.filter(res => res.player === playersName)[0].ranked === 1 ? this.earnedScore : 0
      }
      return 0
    },
    setMainPlayerTotalScore(score) {
      this.setTotalScore({
        player: 'player',
        totalScore: score
      })
    },
    getGamesResult() {
      this.isShowRecap = true
      this.currentRecap[this.currentGame] = this.recap[this.currentGame]
      const lastGames = this.currentRecap[this.currentGame][this.currentRecap[this.currentGame].length - 1]
      const highestScore = Math.max.apply(Math, lastGames.map(player => player.totalScore))
      this.winners = lastGames.filter(player => player.totalScore === highestScore)
    },
    spliceRoyalSet(name) {
      const index = this.royalSet.indexOf(name)
      if (index > -1) {
        this.royalSet.splice(index, 1)
      }
    },
    resetRoyalSet() {
      this.royalSet = ['JACK', 'QUEEN', 'KING']
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.background {
  position: relative;
  height: 100%;
  background-image: url(../assets/background.png);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: #844200;
}
.deck {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.cards {
  position: relative;
  width: 125px;
  height: 176px;
  .card-back {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 10px;
    max-width: 100%;
    box-shadow: 0px 2px 1px 0px rgba(0, 0, 0, 0.3);
  }
}
.players-score-board {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  border: solid;
  background: linear-gradient(to right, red, purple);
  border-width: 0 3px 3px 0;
  padding: 5px;
  box-shadow: 1px 1px 15px 2px #040404;
  .info {
    text-align: left;
    margin-right: 18px;
    padding-right: 18px;
    border-right: solid 1px #fff;
  }
  .score {
    font-weight: bold;
  }
  .buttons {
    display: flex;
    align-items: center;
    margin-right: 18px;
    padding-right: 18px;
    border-right: solid 1px;
    .btn-draw {
      background-color: #3079e8;
      box-shadow: 1px 1px 5px 0px #484343, inset -1px 0px 6px 0px #1f4886;
    }
    .btn-shuffle {
      background-color: #f3c763;
    }
    .btn-reveal {
      background-color: #e83030;
      box-shadow: 1px 1px 5px 0px #484343, inset -1px 0px 6px 0px #440a0a;
    }
    .btn-recap {
      background-color: #e83030;
      box-shadow: 1px 1px 5px 0px #484343, inset -1px 0px 6px 0px #440a0a;
    }
    button {
      cursor: pointer;
      padding: 10px;
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: bold;
      margin: 0 5px;
      box-shadow: 1px 1px 5px 0px #484343, inset -1px 0px 6px 0px #7d604e;
      transition: all .5s cubic-bezier(0.14, 0.45, 0.5, 1.35);
      &:hover {
        box-shadow: 1px 1px 5px 0px #000000, inset -1px 0px 6px 0px #1b130e;
        padding: 10px 20px;
      }
      &:disabled {
        background-color: #909490;
      }
    }
  }
  .round {
    margin: 0;
    align-self: center;
  }
}
.main-player {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  .score {
    font-weight: bold;
  }
  .name {
    font-size: 25px;
    margin-bottom: 10px;
    margin-top: 5px;
  }
}
.main-player__cards,
.player__cards {
  display: flex;
  .card-img {
    width: 110px;
    transition: transform .5s;
    z-index: 1;
    &:first-child {
      transform: translateX(75px);
    }
    &:last-child {
      transform: translateX(-75px);
    }
  }
}
.main-player__cards {
  .card-img {
    &:first-child {
      &:hover {
        transform: translate(75px, -50px);
      }
    }
    &:last-child {
      &:hover {
        transform: translate(-75px, -50px);
      }
    }
    &:hover {
      transform: translateY(-50px);
    }
  }
}
.fade {
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  .recap-container {
    width: 900px;
    height: 90%;
    position: absolute;
    overflow: auto;
    background: #e6e6e6;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 15px;
    border-radius: 15px;
    box-shadow: inset 0 0 10px #000;
    color: #000;
  }
  .recap {
    border-bottom: solid 10px;
    padding-bottom: 40px;
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .game-name {
      border-bottom: solid 5px #63b75e;
      padding-bottom: 25px;
    }
    &__players {
      flex: 1 0;
    }
    &__info {
      display: flex;
      padding: 0 45px;
      border-bottom: solid 1px;
      .round-name {
        flex: 1 0 200px;
        text-align: left;
      }
      .info-container {
        flex-grow: 1;
        display: flex;
      }
    }
    &__winners {
      border: solid 10px red;
      .winners-title {
        position: relative;
        &:before {
          content: '';
          display: block;
          width: 100px;
          height: 2px;
          background-color: #000;
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      .winners-container {
        display: flex;
        justify-content: space-around;
        .winner {
          text-transform: uppercase;
        }
      }
    }
  }
}
</style>
