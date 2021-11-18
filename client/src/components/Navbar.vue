<template>
    <nav>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-app-bar-title>
                Invoices
            </v-app-bar-title>
            <v-spacer></v-spacer>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on">
                        <v-icon left>expand_more</v-icon>
                        <span>Menu1</span>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
                        <v-list-item-title>{{link.text}}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            
        <v-btn color="success" v-bind="attrs" v-on="on">Add</v-btn>

            <v-btn color="gray">
                <span>Sign Out</span>
                <v-icon right>exit_to_app</v-icon>
            </v-btn>            
        </v-app-bar>

        <v-navigation-drawer app v-model="drawer" class="primary">
            <v-list>
                <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
                    <v-list-item-action>
                        <v-icon class="white--text">{{link.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">{{link.text}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </nav>
    
</template>



<script>
export default {
    data() {
        return {
            drawer: false,
            links: [
                {icon: 'dashboard', text: 'Dashboard', route: '/'},
                {icon: 'folder', text: 'My Projects (Tutorial)', route: '/tutorials'},
                {icon: 'person', text: 'Team (Add)', route: '/add'},
                {icon: 'folder', text: 'Load Scv', route: '/loadCsv'},
            ]
        }
    }
    
}
</script>