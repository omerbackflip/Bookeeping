<template>
	<div class="text-center">
		<v-dialog v-model="dialog" width="500" persistent>
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{ importData }}
				</v-card-title>
				<v-progress-linear :indeterminate="loading" color="cyan" height="10"></v-progress-linear>
                <div v-show="importData==='BOOKS'">
					<v-row class="v-row">
						<v-col cols="9">
							<!-- <v-radio-group row v-model="importYear" v-for="(item,index) in years" :key="index" class="v-radio-group"> -->
							<v-radio-group row v-model="importYear" class="radio-group">
								<p v-for="(item,index) in years" :key="index">
									<v-radio :label=item :value="item"></v-radio>
								</p>
							</v-radio-group>
						</v-col>
						<v-col cols="3">
							<v-radio-group v-model="company" class="radio-group">
								<v-radio label="ביצועים" value="ביצועים"></v-radio>
								<v-radio label="יזמות" value="יזמות"></v-radio>
							</v-radio-group>
						</v-col>
					</v-row>
                </div>
				<v-card-text> DATA will be overwritten </v-card-text>
				<v-file-input truncate-length="50" @change="setFile"></v-file-input>
				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="closeImportDialog()"> Close </v-btn>
					<v-btn :disabled = "!file" color="primary" text @click="submitFile()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-snackbar :v-model="message.length" :multi-line="true">
			{{ message }}

			<template v-slot:action="{ attrs }">
				<v-btn color="red" text v-bind="attrs" @click="message = ''">
				Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script>
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { TABLE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

export default {
	props: {
		// openImportModal: Boolean,
		setImportModal: Function,
		importData:[],
	},
	data() {
		return {
			file: null,
			message: "",
			dialog: false,
			company: '',
			importYear: '',
			years: [],
			loading: false,
		};
	},
	methods: {
		closeImportDialog() {
			this.setImportModal(false);
		},
		setFile(file) {
			if (file.type === "text/csv")
				this.file = file; 
			else
				alert("file type MUST be csv")
		},
		async submitFile() {
			this.loading = true;
			try {
				let response = '';
				switch (this.importData){
					case "INVOICES" :
						response = await SpecificServiceEndPoints.saveInvoicesBulk(this.file)
						break
					case "BOOKS" :
						if (this.company && this.file.name.includes(this.company) 
							&& this.importYear && this.file.name.includes(this.importYear)) {
							response = await SpecificServiceEndPoints.saveBooksBulk(this.file,this.company,this.importYear) ;
						} else alert("company or year does not fits")
						break
					case "REVENUES" :
						response = await SpecificServiceEndPoints.saveRevenuesBulk(this.file)
						break
					default : alert("switch/case statment not resolved")
				}
				if (response.data && response.data.success) {
					this.message = "CSV Data successfully imported";
					setTimeout(() => {
						this.closeImportDialog();
					}, 3500);
					window.location.reload();
				}
			} catch (error) {
				console.log(error);
				this.message = "Something went wrong! Please try again later!";
			}
			this.loading = false;
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
		// console.log(this.years)
      },
	},
	async mounted() {
		// this.dialog = this.openImportModal;
		await this.loadTable(4, "years");
		this.dialog = true;
	}
};
</script>

<style scoped>
/* .v-radio-group {
	margin-top: 0px; 
	padding-top: 0px;
} */
.radio-group{
	border-right-style: outset;
	direction: rtl;
}
.v-row {
	margin-left: 0px;
    margin-right: 0px;
}
</style>