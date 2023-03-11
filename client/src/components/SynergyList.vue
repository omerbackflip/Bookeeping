<template>
    <div>
		<div class="max-height-50">
			<invoice-list/>
		</div>

		<div class="max-height-50 mt-2">
			<booking-list ref="bookingRef"/>
			<!-- <v-fab-transition>
				<v-btn
					color="pink"
					dark
					@click="dialog=true"
					class="fab-button-placement"
					absolute
					bottom
					right
					fab
				>
					<v-icon>mdi-magnify</v-icon>
				</v-btn>
			</v-fab-transition>
			<v-btn @click="search = ''; searchSubmit();" class="clear-search">Clear search</v-btn> -->
		</div>

		<!-- <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <v-card>
            <v-card-text>
              <v-text-field v-model="search" label="Search booking list ..."></v-text-field>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                text
                color="primary"
                @click="searchSubmit"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog> -->

	</div>		  
</template>

<script>
import BookingListVue from './BookingList.vue';
import InvoicesListVue from './InvoicesList.vue';

export default {
	// name:"Synergy list",
	components: { 'invoice-list': InvoicesListVue, 'booking-list': BookingListVue },
	data() {
		return {
			dialog: false,
			search: ''
		}
	},
	methods: {
		searchSubmit() {
			this.$refs.bookingRef.onSearch(this.search);
			this.dialog = false;
			this.search = '';
		}
	}
};
</script>

<style>

.max-height-50{
	max-height: 50%;
}

.mt-4{
	margin-top: 13px;
}
.clear-search{
	font-size: 12px !important;
    background: cornflowerblue !important;
    height: 20px !important;
    color: white !important;
    top: 17px;
    float: right;
    margin-right: 32px;
}

div.max-height-50 > div > div > div.flex > div > div {
	height: 40vh !important;
	width: 200vh !important;
}

</style>