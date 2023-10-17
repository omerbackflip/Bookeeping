<template>
    <nav>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <div :class="local ? 'bckg-red' :''" style="font-size: x-small;">
                <div v-if="isMobile()">
                    {{local ? 'L' : 'P'}}
                </div>
                <div v-else>
                    {{local ? 'LocalHost' : 'Production'}}
                </div>
            &nbsp; {{ version }}
            </div>
            <v-spacer></v-spacer>
            <template>
                <div v-if="showControl" class="mt-2 text-center d-flex">
                        <v-btn-toggle v-model="toggleCompany" group mandatory @change="onCompanyChange" >
                            <v-btn value="ביצועים" elevation="3" small v-show="selectedYear > 2017">ביצועים</v-btn>
                            <v-btn value="יזמות"   elevation="3" small > יזמות </v-btn>
                        </v-btn-toggle>
                        <v-select class="year-input" 
                            v-model="selectedYear"
                            :items="yearList"
                            @change="onYearChange"
                            :value="2023"
                            dense
                            solo
                            elevation="3"
                        ></v-select>
                    <div v-if="this.$route.name==='invoicesList'">
                        <v-btn x-small @click="callAddNewInvoice">
                                <v-icon small>mdi-plus</v-icon>
                        </v-btn>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon>mdi-dots-vertical</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="(item, index) in items" :key="index">
                                    <v-list-item-title class="cursor-pointer" @click="onMenuItemClick(index)">
                                        {{item.title}}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
            </template>
        </v-app-bar>
        <v-navigation-drawer app v-model="drawer" class="primary" temporary>
            <v-list>
                <v-list-item v-for="link in navItems" :key="link.text" router @click="navigate(link)">
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
            <ImportCSV :setImportModal="closeModal" :importData="importData"/>
        </template>
    </nav>
</template>



<script>
import ImportCSV from '../ImportCSV.vue';
import { navItems, isMobile } from '../../constants/constants';
import SpecificServiceEndPoints from "../../services/specificServiceEndPoints";
import { TABLE_MODEL } from "../../constants/constants";
import apiService from "../../services/apiService";

export default {
    components: { ImportCSV },
    data() {
        return {
            navItems,
            isMobile,
            query: null,
            drawer: false,
            openImportModal: false,
            importData: [], // InvoicesCsvData or BooksCsvData
            items: [
                { title: 'Remove all Invoices', onClick:  this.onMenuItemClick },
                { title: 'Book Marge', onClick: this.onMenuItemClick },
                { title: 'Invoice Marge', onClick: this.onMenuItemClick },
                { title: 'Clear ExcelRecID', onClick: this.onMenuItemClick },
            ],
            toggleCompany : 'ביצועים',
            selectedYear: 2023,
            yearList: [],
            local: false,
            version: '',
        }
    },
    methods:{
        callAddNewInvoice() {
            this.$root.$emit('addNewInvoice',{ newRow: true});
        },

        onYearChange(event) {
            // this.query = { year: event };
            // router.push({query: this.query});
            this.$root.$emit('yearChange',event);
        },

        onCompanyChange() {
            this.$root.$emit('companyChange',this.toggleCompany);
        },

        closeModal() {
            this.openImportModal = false;
        },

        runModal(importData) {
            // console.log(importData)
            switch (importData) {
                case 'INVOICES' :
                    this.importData = "INVOICES";
                    break;
                case 'BOOKS' :
                    this.importData = "BOOKS";
                    break;
                case 'REVENUES' :
                    this.importData = "REVENUES";
                    break;
            }
            this.openImportModal = true;
        },

        onMenuItemClick(index) {
            switch (index) {
                case 0 : this.$root.$emit('removeAllItems',false);  break;
                case 1 : this.$root.$emit('bookMarge',false);  break; 
                case 2 : this.$root.$emit('invoiceMarge',false);  break; 
                case 3 : this.$root.$emit('clearExcelRecID',false);  break; 
            }
        }, 

        navigate(link) {
            if(link.route) {
                if (this.$router.history.current.fullPath != link.route) { // avoid calling same route
                    this.$router.push({ path: link.route , query: this.query || {}});
                }
            } else {
                this[link.onClick](link.import);
            }
        },

        async getDatabaseInformation() {
            try {
                const response = await SpecificServiceEndPoints.getDbInfo();
                if(response && response.data && response.data.success) {
                    this.local = response.data.local;
                    this.version = response.data.version;
                }
            } catch (error) {
                console.log(error);

            }
        },

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
				if (response) {
					this[tableName] = response.data.map((code) => code.description);
				}
			} catch (error) {
				console.log(error);
			}
		},

    },

    async mounted() {
		await this.loadTable(4, "yearList");
        this.getDatabaseInformation();
    },

    computed: {
        showControl() {
            let show = false
            switch (this.$route.name) {
                case 'invoicesList': 
                case 'bookingList': 
                case 'synergyList': 
                case 'forecastPayment': 
                    show = true;
                    break;
            }
            return show;
        }
    }
}
</script>

<style scoped>
    .plus-button{
        font-size: 29px !important;
        padding-top: 0px;
        /* padding-left: 15px; */
        border: 1px solid #ffffff;
        /* margin-top: 0; */
        margin-left: 14px;
        height: 42px !important;
        margin-right: 3px;
    }
    .year-input{
        /* padding: 0px; */
        /* margin-top: 7px; */
        margin: 0.3rem;
        width: -webkit-min-content;
        /* width: -moz-min-content; */
        /* width: min-content; */
        color: white;
        font-size: 12px;
        /* height: 42px; */
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
    .bckg-red {
        background-color: red;
        /* -webkit-writing-mode: vertical-rl */
    }
    /* ::v-deep .v-toolbar__content {
        padding-left: 2px;
        padding-right: 2px;
        inline-size: max-content !important;
    } */
</style>


