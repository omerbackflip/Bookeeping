<template>
  <v-app>
    <template v-if="!isAuthenticated">
      <v-container fill-height fluid>
        <v-layout column align-center justify-center>
          <v-alert v-if="loginError" type="error" role="alert">{{ loginError }}</v-alert>
          <v-progress-linear v-if="usersLoading" indeterminate />
          <v-btn v-if="!usersLoading && !usersLoaded" text @click="loadUsers">Retry loading users</v-btn>
          <login-form @submit="handleLogin" />
        </v-layout>
      </v-container>
    </template>
    <template v-else>
      <Navbar @logout="logout" />
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script>
import Navbar from './components/Common/Navbar.vue';
import LoginForm from './components/shared/login';
import { loadTable, TABLE_IDS } from './constants/constants';

const AUTH_STORAGE_KEY = 'BookAuthenticated';

export default {
  name: 'app',
  components: { Navbar, LoginForm },
  data() {
    return {
      isAuthenticated: false,
      userInfo: [],
      usersLoading: false,
      usersLoaded: false,
      loginError: ''
    };
  },
  created() {
    const role = localStorage.getItem(AUTH_STORAGE_KEY);
    this.isAuthenticated = role === 'admin' || role === 'viewer';
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      if (this.usersLoading) return false;
      this.usersLoading = true;
      this.usersLoaded = false;
      this.loginError = '';
      this.userInfo = [];
      try {
        const users = await loadTable(TABLE_IDS.USERS);
        if (!Array.isArray(users)) {
          this.loginError = 'Could not load users. Please retry.';
          return false;
        }
        this.userInfo = users;
        this.usersLoaded = true;
        this.loginError = users.length ? '' : 'No users are configured.';
        return users.length > 0;
      } catch (_) {
        this.loginError = 'Could not load users. Please retry.';
        return false;
      } finally {
        this.usersLoading = false;
      }
    },
    async handleLogin({ username, password }) {
      if (this.usersLoading) {
        this.loginError = 'Users are still loading. Please wait.';
        return;
      }
      if (!this.usersLoaded && !(await this.loadUsers())) return;
      this.loginError = '';
      const foundUser = this.userInfo.find(user =>
        user.table_id === TABLE_IDS.USERS &&
        user.description === username && user.textValue === password
      );
      if (!foundUser) {
        this.loginError = 'Wrong username or password.';
        return;
      }
      const role = Number(foundUser.table_code) === 1 ? 'admin' : 'viewer';
      localStorage.setItem(AUTH_STORAGE_KEY, role);
      this.isAuthenticated = true;
    },
    logout() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      this.isAuthenticated = false;
      this.loginError = '';
    }
  }
};
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
