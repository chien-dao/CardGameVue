<template>
  <div id="app">
    <MainBoard/>
  </div>
</template>

<script>
import MainBoard from './components/MainBoard.vue'

export default {
  name: 'app',
  components: {
    MainBoard
  }
}
</script>

<style lang="scss">
body {
  height: 100vh;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100%;
}
img {
  max-width: 100%;
}
</style>
