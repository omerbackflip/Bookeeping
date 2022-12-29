<template>
    <nav>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <div v-show="isInvoices" :class="isMobile() ? 'mobile-search' : ''" class="search-wrapper">
                <v-text-field
                append-icon="mdi-magnify"
                @change="onSearch"
                label="Search..."
                single-line                
                ></v-text-field>
            </div>
            <div :class="isMobile() ? 'search-wrapper-mobile' : ''" v-show="isBookingList" class="search-wrapper">
                <v-row>
                    <v-col>
                        <v-text-field
                        @change="onSearchBooking"
                        append-icon="mdi-magnify"
                        :class="isMobile() ? 'mobile-search' : 'mt-4'"
                        label="Search booking..."
                        single-line
                        ></v-text-field>

                    </v-col>
                    <v-col>
                        <v-btn :class="isMobile() ? 'mobile-button' : ''" class="m-3 btn btn-sm btn-danger" @click="removeAllBooks">
                            Remove All books
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
            <v-spacer></v-spacer>
            <template>
                <div class="mt-2 text-center d-flex">
                <span class="d-content" v-show="isInvoices">
                    <v-btn small @click="setAddNewRow" class="plus-button">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <v-select class="year-input" 
                        :items="[2019, 2020, 2021, 2022]"
                        @change="onYearChange"
                        :value="2022"
                        dense
                        solo
                    ></v-select>
                </span>
                <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" class="float-right">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list v-show="isInvoices">
                    <v-list-item v-for="(item, index) in items" :key="index">
                        <v-list-item-title class="cursor-pointer" @click="onMenuItemClick(index)">
                            {{item.title}}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
                <v-list>
                    <!-- <v-list-item v-for="link in links" :key="link.text" router :to="link.route"> -->
                    <v-list-item v-for="link in links" :key="link.text" router @click="navigate(link)">
                        <v-list-item-title>{{link.text}}</v-list-item-title>
                    </v-list-item>
                </v-list>
                </v-menu>
                </div>
            </template>
        </v-app-bar>
        <v-navigation-drawer app v-model="drawer" class="primary">
            <v-list>
                <!-- <v-list-item v-for="link in links" :key="link.text" router :to="link.route"> -->
                <v-list-item v-for="link in links" :key="link.text" router @click="navigate(link)">
                    <v-list-item-action>
                        <v-icon class="white--text">{{link.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">{{link.text}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <template v-if="openImportModal">
            <ImportCSV :openImportModal="openImportModal" :setImportModal="toggleModal" :importData="importData"/>
        </template>
    </nav>
</template>



<script>
import ImportCSV from '../ImportCSV.vue';

export default {
    components: { ImportCSV},
    data() {
        return {
            drawer: false,
            openImportModal: false,
            importData: [], // InvoicesCsvData or BooksCsvData
            links: [
                {icon: 'dashboard', text: 'כרטסת ראשית', route: '/'},
                {icon: 'person', text: 'הוסף רשומה (קוד מקורי)', route: '/add'},
                {icon: 'folder', text: 'Import INVOICEs', route: null , onClick: this.toggleModal},
                {icon: 'folder', text: 'Import BOOKs', route: null , onClick: this.toggleBook},
                {icon: 'folder', text: 'כרטסת רו"ח', route: '/bookingList'},
                {icon: 'folder', text: 'טבלת הטבלאות', route: '/tableList'},
            ],
            items: [
                { title: 'Remove all items', onClick:  this.onMenuItemClick },
                { title: 'Download to excel', onClick: this.onMenuItemClick },
                { title: 'Batch-merge', onClick: this.onMenuItemClick },
                { title: 'Sammary B', onClick: this.onMenuItemClick },
            ],
        }
    },
    methods:{
        setAddNewRow() {
            this.$root.$emit('addNewRow',{ newRow: true});
        },
        onYearChange(event) {
            this.$root.$emit('yearChange',event);
        },
        toggleModal() {
            this.importData = "INVOICES";
            this.openImportModal = !this.openImportModal;
        },
        toggleBook() {
            this.importData = "BOOKS";
            this.openImportModal = !this.openImportModal;
        },
        onSearch(event) {
            this.$root.$emit('onSearch',event);
        },
        onSearchBooking(event) {
            this.$root.$emit('onSearchBooking',event);
        },
        removeAllBooks(event) {
            this.$root.$emit('removeAllBooksItems',event);
        },
        onMenuItemClick(index) {
            switch (index) {
                case 0 : this.$root.$emit('removeAllItems',false);  break;
                case 1 : this.$root.$emit('downloadExcel',false);   break; 
                case 2 : console.log('Run BATCH'); this.$root.$emit('runBatch',false);  break; 
                case 3 : console.log('Summary B');   break; 
            }
        }, 
        navigate(link) {
            if(link && link.route) {
                if (this.$router.history.current.fullPath != link.route) {
                    this.$router.push({ path: link.route });
                }
            } else {
                link.onClick();
            }
        },

        isMobile() {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        },

    },
    computed: {
        isInvoices() {
            return this.$route.name === 'invoices';
        },
        isBookingList() {
            return this.$route.name === 'bookingList';
        }
    }
}
</script>

<style scoped>
    .plus-button{
        font-size: 29px !important;
        padding-top: 0px;
        padding-left: 15px;
        border: 1px solid #ffffff;
        margin-top: 0;
        margin-left: 0;
        height: 42px !important;
        margin-right: 12px;
    }
    .year-input{
        padding: 0;
        margin-top: 7px;
        width: -webkit-min-content;
        width: -moz-min-content;
        /* width: min-content; */
        color: white;
        font-size: 12px;
        border: 1px solid white;
        height: 42px;
        box-shadow: none;
    }
    .search-wrapper{
        margin: 10px 0 0 44px;
    }
    .search-wrapper-mobile{
        margin: auto !important;
    }
    .cursor-pointer{
        cursor: pointer ;
    }
    .d-flex{
        display: flex;
    }
    .mt-4{
        margin-top: 15px;
    }
    .d-content{
        display: contents;
    }
    .mobile-search{
        margin: 8px 0 4px 3px !important; 
    }

    .mobile-button{
        width: 103px !important;
        font-size: 8px !important;
        margin: 8px 0 !important;
    }
</style>


