<template>
  <div class="player" :style="customStyle">
    <div class="player__info">
      <img src="../assets/avatar.png" alt="">
      <h3 class="player__name">{{ player }}</h3>
    </div>
    <p class="player__score">{{ playerScore }}</p>
    <p class="player__score">{{ playerTotalScore }}</p>
    <div class="player__cards">
      <div v-for="card in cards" :key="card.code" class="card-img" :class="{ 'reveal': reveal }">
        <img class="front face" src="../assets/cards-back.png" alt="">
        <img class="back face" :src="card.image" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { specialValue } from './MainBoard'

export default {
  name: 'Player',
  props: {
    customStyle: {
      type: Object,
      required: true
    },
    player: {
      type: String,
      required: true
    },
    cards: {
      type: Array,
      required: true
    },
    earned: {
      type: Number,
      required: true
    },
    round: {
      type: String,
      required: true
    },
    reveal: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      royalSet: ['JACK', 'QUEEN', 'KING'],
      run: 0
    }
  },
  computed: {
    ...mapState(['score', 'totalScore']),
    playerScore() {
      if (this.reveal) {
        return this.score[this.player] === Number.POSITIVE_INFINITY ? 'Win this round' : this.score[this.player]
      } else {
        return 'Waiting ....'
      }
    },
    playerTotalScore() {
      return this.totalScore[this.player]
    }
  },
  watch: {
    cards(newVal, oldVal) {
      if (!(JSON.stringify(newVal) === JSON.stringify(oldVal))) {
        if (this.cards.length) {
          const totalScore = this.cards.reduce((total, current) => {
            this.spliceRoyalSet(current.value)
            const parsedValue = specialValue[current.value] ? specialValue[current.value] : +current.value
            return total + parsedValue
          }, 0)
          const isInstanceWin = this.royalSet.length > 0 ? false : true
          this.setScore({
            player: this.player,
            score: isInstanceWin ? Number.POSITIVE_INFINITY : totalScore % 10
          })
        }
      }
    },
    reveal() {
      if (this.reveal) {
        this.setTotalScore({
          player: this.player,
          totalScore: this.earned
        })
        this.resetRoyalSet()
      }
    }
  },
  methods: {
    ...mapMutations(['setScore', 'setTotalScore']),
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

<style lang="scss" scoped>
.player {
  position: absolute;
  text-align: center;
  &__info {
    img {
      border-radius: 50%;
      box-shadow: 0px 1px 5px 1px #000;
    }
  }
  &__name {
    text-transform: capitalize;
    font-size: 25px;
    margin-bottom: 10px;
    margin-top: 5px;
  }
  &__score {
    font-weight: bold;
  }
  .card-img {
    transform-style: preserve-3d;
    .face {
      backface-visibility: hidden;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
    .back {
      transform: rotateY(180deg);
    }
    &.reveal {
      transform: rotateY(180deg);
      &:first-child {
        transform: rotateY(180deg);
      }
      &:last-child {
        transform: rotateY(180deg);
      }
    }
  }
}
</style>

