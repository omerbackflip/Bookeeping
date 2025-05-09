<template>
  <v-app>
    <template v-if="!isAuthenticated">
      <v-container fill-height fluid>
        <v-layout align-center justify-center>
          <login-form @submit="handleLogin" />
        </v-layout>
      </v-container>
    </template>

    <template v-else>
      <Navbar @logout="logout"/>
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script>
  import Navbar from './components/Common/Navbar.vue'
  import LoginForm from './components/shared/login'
  import { loadTable } from "../src/constants/constants.js";

  export default {
    name: "app",
    components: {Navbar,LoginForm},
    data(){
      return {
        isAuthenticated: false,
        validUser: '',
        validpass: '',
      }
    },
    async mounted() {
      this.userInfo = (await loadTable(90)).map((code) => code.description);
    },
    created() {
      const authFlag = localStorage.getItem('BookAuthenticated');
      if (authFlag === 'true') {
        this.isAuthenticated = true;
      }
    },
    methods: {
      async handleLogin({ username, password }) {
        if (username === this.userInfo[0] && password === this.userInfo[1]) {
          this.isAuthenticated = true;
          localStorage.setItem('BookAuthenticated', 'true');
        } else {
          window.alert ("Wrong user/password");
        }
      },
      logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('BookAuthenticated');
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

.theme--dark.v-app-bar.v-toolbar.v-sheet {
    background-color: #1371ce;
}
.theme--dark.v-btn.v-btn--has-bg{
    background-color: #1371ce;
}

.theme--dark.v-text-field--solo > .v-input__control > .v-input__slot{
    background-color: #1371ce;
}
.v-application .primary {
    background-color: #1e0571 !important;
    border-color: #1976d2 !important;
}
</style>
