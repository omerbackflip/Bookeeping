<template>
  <v-app>
    <Navbar/>
    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>

<script>
  import Navbar from './components/Navbar.vue'
  export default {
    name: "app",
    components: { Navbar },
    data(){
      return {

      }
    }
  }
  
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px;  */
}
</style>
