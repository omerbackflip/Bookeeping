<template>
	<div class="text-center">
		<v-dialog v-model="dialog" width="500">
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{ importData }}
				</v-card-title>

                <div class="radioBtn" v-show="importData==='BOOKS'">
					<v-row>
						<v-col>
							<v-radio-group v-model="company">
								<v-radio label="ביצועים" value="ביצועים"></v-radio>
								<v-radio label="יזמות" value="יזמות"></v-radio>
							</v-radio-group>
						</v-col>
						<v-col>
							<v-radio-group v-model="importYear">
								<v-radio label="2020" value="2020"></v-radio>
								<v-radio label="2021" value="2021"></v-radio>
								<v-radio label="2022" value="2022"></v-radio>
							</v-radio-group>
						</v-col>
					</v-row>
                </div>
				<v-card-text> DATA will be overwritten </v-card-text>
				<v-file-input truncate-length="50" @change="setFile"></v-file-input>
				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="toggleDialog()"> Close </v-btn>
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

export default {
	props: {
		openImportModal: Boolean,
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
		};
	},
	methods: {
		toggleDialog() {
			this.setImportModal(false);
		},
		setFile(file) {
			if (file.type === "text/csv")
				this.file = file; 
			else
				alert("file type MUST be csv")
		},
		async submitFile() {
			try {
				let response = '';
				switch (this.importData){
					case "INVOICES" :
						response = await SpecificServiceEndPoints.saveInvoicesBulk(this.file)
						break
					case "BOOKS" :
						if (this.file.name.includes(this.company) && this.file.name.includes(this.importYear)) {
							response = await SpecificServiceEndPoints.saveBooksBulk(this.file,this.company,this.importYear) ;
						} else alert("company or year does not fits")
						break
					default : alert("switch/case statment not resolved")
				}
				if (response.data && response.data.success) {
					this.message = "CSV Data successfully imported";
					setTimeout(() => {
						this.toggleDialog();
					}, 3500);
					window.location.reload();
				}
			} catch (error) {
				console.log(error);
				this.message = "Something went wrong! Please try again later!";
			}
		},
	},
	mounted() {
		this.dialog = this.openImportModal;
	}
};
</script>