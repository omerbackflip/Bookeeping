<template>
    <div class="vue-csv-uploader">
        <div class="form">
            <div class="vue-csv-uploader-part-one">
                <div class="form-check form-group csv-import-checkbox" v-if="headers === null">
                    <slot name="hasHeaders" :headers="hasHeaders" :toggle="toggleHasHeaders">
                        <input
                            :class="checkboxClass" type="checkbox"
                            :id="makeId('hasHeaders')"
                            :value="hasHeaders"
                            @change="toggleHasHeaders"
                        />
                        <label class="form-check-label" :for="makeId('hasHeaders')">
                            File Has Headers
                        </label>
                    </slot>
                </div>
                <div class="form-group csv-import-file">
                    <input
                        ref="csv"
                        type="file"
                        @change="setCsvFile"
                        @change.prevent="validFileMimeType"
                        :class="inputClass"
                        name="csv"
                    />
                    <slot name="error" v-if="showErrorMessage">
                        <div class="invalid-feedback d-block">
                            File type is invalid
                        </div>
                    </slot>
                </div>
                <!-- <div class="form-group">
                    <slot name="next" :load="load">
                        <button type="submit" :disabled="disabledNextButton" :class="buttonClass" @click.prevent="load">
                            {{ loadBtnText }}
                        </button>
                    </slot>
                </div> -->
            </div>
            <!-- {{ csv }} -->

            <div class="vue-csv-uploader-part-two">
                <!-- <div class="vue-csv-mapping" v-if="sample">
                    <table :class="tableClass">
                        <slot name="thead">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>CSV Column</th>
                                </tr>
                            </thead>
                        </slot>
                        <tbody> 
                            <tr v-for="(field, key) in fieldsToMap" :key="key">
                                <td>{{ field.label }}</td>
                                <td>
                                    <select
                                        :class="tableSelectClass"
                                        :name="`csv_uploader_map_${key}`"
                                        v-model="map[field.key]"
                                    >
                                        <option :value="null" v-if="canIgnore">{{ ignoreOptionText }}</option>
                                        <option v-for="(column, key) in firstRow" :key="key" :value="key">
                                            {{ column }}
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="form-group" v-if="url">
                        <slot name="submit" :submit="submit">
                            <input type="submit" :class="buttonClass" @click.prevent="submit" :value="submitBtnText"/>
                        </slot>
                    </div>
                </div> -->
                <v-btn @click="importInvoiceRecords">save</v-btn>
            </div>
            <!-- {{ form.csv }} -->
        </div>
    </div>
</template>

<script>
import {drop, every, forEach, get, isArray, map, set} from "lodash";
import axios from "axios";
import Papa from "papaparse";
import mimeTypes from "mime-types";
import InvoiceDataService from "../services/InvoiceDataService";



export default {
    props: {
        value: Array,
        url: {
            type: String,
        },
        // mapFields: {
        //     required: true,
        // },
        callback: {
            type: Function,
            default: () => ({}),
        },
        catch: {
            type: Function,
            default: () => ({}),
        },
        finally: {
            type: Function,
            default: () => ({}),
        },
        parseConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        headers: {
            default: null,
        },
        loadBtnText: {
            type: String,
            default: "Load Invoices",
        },
        submitBtnText: {
            type: String,
            default: "Submit",
        },
        ignoreOptionText: {
            type: String,
            default: "Ignore",
        },
        autoMatchFields: {
            type: Boolean,
            default: true,
        },
        autoMatchIgnoreCase: {
            type: Boolean,
            default: false,
        },
        tableClass: {
            type: String,
            default: "table",
        },
        checkboxClass: {
            type: String,
            default: "form-check-input",
        },
        buttonClass: {
            type: String,
            default: "btn btn-primary",
        },
        inputClass: {
            type: String,
            default: "form-control-file",
        },
        validation: {
            type: Boolean,
            default: true,
        },
        fileMimeTypes: {
            type: Array,
            default: () => {
                return ["text/csv", "text/x-csv", "application/vnd.ms-excel", "text/plain"];
            },
        },
        tableSelectClass: {
            type: String,
            default: "form-control",
        },
        canIgnore: {
            type: Boolean,
            default: false,
        },
    },

    data: () => ({
        form: {
            csv: null,
        },
        fieldsToMap: [],
        mapFields : [
            "date",
            "invoiceId",
            "description",
            "amount",
            "vat",
            "total",
            "remark",
            "supplier",
            "published",
            "excelRecId",
            "project",
            "company",
            "group",
            "year"
        ],
        map: {},
        hasHeaders: true,
        csv: null,
        sample: null,
        isValidFileMimeType: false,
        fileSelected: false,
        //obj: '',
    }),

    created() {
        this.initializeFromProps();
    },

    methods: {
        initializeFromProps() {
            this.hasHeaders = this.headers;

            if (isArray(this.mapFields)) {
                this.fieldsToMap = map(this.mapFields, (item) => {
                    return {
                        key: item,
                        label: item,
                    };
                });
            } else {
                this.fieldsToMap = map(this.mapFields, (label, key) => {
                    return {
                        key: key,
                        label: label,
                    };
                });
            }
        },
        submit() {
            const _this = this;
            this.form.csv = this.buildMappedCsv();
            this.form.csv = this.form.csv.splice(1,this.form.csv.length); // remove the first header row
            this.form.csv.map( (item) => {  //convert string to Number to fits with schema definition
                item.amount = Number(item.amount);
                item.vat = Number(item.vat);
                item.total = Number(item.total);
                item.group = Number(item.group);
                item.excelRecID = Number(item.excelRecID);
                item.published = (item.published === 'T '); })
            this.$emit("input", this.form.csv);

            if (this.url) {
                axios
                    .post(this.url, this.form)
                    .then((response) => {
                        _this.callback(response);
                    })
                    .catch((response) => {
                        _this.catch(response);
                    })
                    .finally((response) => {
                        _this.finally(response);
                    });
            } else {
                _this.callback(this.form.csv);
            }
        },
        buildMappedCsv() {
            const _this = this;

            let csv = this.hasHeaders ? drop(this.csv) : this.csv;

            return map(csv, (row) => {
                let newRow = {};

                forEach(_this.map, (column, field) => {
                    set(newRow, field, get(row, column));
                });

                return newRow;
            });
        },
        validFileMimeType() {
            let file = this.$refs.csv.files[0];
            const mimeType = file.type === "" ? mimeTypes.lookup(file.name) : file.type;

            if (file) {
                this.fileSelected = true;
                this.isValidFileMimeType = this.validation ? this.validateMimeType(mimeType) : true;
            } else {
                this.isValidFileMimeType = !this.validation;
                this.fileSelected = false;
            }
        },
        validateMimeType(type) {
            return this.fileMimeTypes.indexOf(type) > -1;
        },
        load() {
            const _this = this;

            this.readFile((output) => {
                _this.sample = get(Papa.parse(output, {preview: 2, skipEmptyLines: true}), "data");
                _this.csv = get(Papa.parse(output, {skipEmptyLines: true}), "data");
            });
        },
        readFile(callback) {
            let file = this.$refs.csv.files[0];

            if (file) {
                let reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    callback(evt.target.result);
                };
                reader.onerror = function () {
                };
            }
        },
        toggleHasHeaders() {
            this.hasHeaders = !this.hasHeaders;
        },
        makeId(id) {
            return `${id}${this._uid}`;
        },
        saveInvoice() {
            if (window.confirm(`Confirm importing records into Invoice table...`)){
                for (let i = 1; i < this.form.csv.length; i++) { 
                    var data = {
                        company:      this.form.csv[i].Company && this.form.csv[i].Company.replace(/\s+/g, '') ,
                        description:  this.form.csv[i].Description,
                        amount:       parseInt(this.form.csv[i].Amount),
                        vat:          parseInt(this.form.csv[i].Vat),
                        total:        parseInt(this.form.csv[i].Total),
                        group:        parseInt(this.form.csv[i].GroupID),
                        date:         this.form.csv[i].InvDate,
                        supplier:     this.form.csv[i].supplier,
                        invoiceId:    this.form.csv[i].invoiceID,
                        remark:       this.form.csv[i].Remark,
                        excelRecID:   parseInt(this.form.csv[i].ExcelRecordID),
                        published:    this.form.csv[i].published.trim() === 'T' ? true : false,
                        project:      this.form.csv[i].Project,
                        year:      this.form.csv[i].Year,
                    };
                    InvoiceDataService.create(data)
                    .then(response => {
                        console.log(response.data);
                    })
                    .catch(e => {
                        console.log("error while insert new Invoice " + e);
                    });
                }
                window.alert(`${this.form.csv.length} records were processed`)
            }
        },
        setCsvFile(event){
            if(event && event.target && event.target.files[0]) {
                this.form.csv = event.target.files[0];
            }
        },
        async importInvoiceRecords() {
            try {
                if (window.confirm(`Confirm Importing records into Invoice table...`)){
                    await InvoiceDataService.saveBulk(this.form.csv)
                    window.alert(`Records were processed and saved`)
                }                
            } catch (error) {
                console.log("error while saing bulk " + error);                
            }
        },
    },

    watch: {
        map: {
            deep: true,
            handler: function (newVal) {
                if (!this.url) {
                    let hasAllKeys = Array.isArray(this.mapFields)
                        ? every(this.mapFields, function (item) {
                            return Object.prototype.hasOwnProperty.call(newVal, item);
                        })
                        : every(this.mapFields, function (item, key) {
                            return Object.prototype.hasOwnProperty.call(newVal, key);
                        });

                    if (hasAllKeys) {
                        this.submit();
                    }
                }
            },
        },

        sample(newVal) {
            if (this.autoMatchFields) {
                if (newVal !== null) {
                    this.fieldsToMap.forEach((field) => {
                        newVal[0].forEach((columnName, index) => {
                            if (this.autoMatchIgnoreCase === true) {
                                if (field.label.toLowerCase().trim() === columnName.toLowerCase().trim()) {
                                    this.$set(this.map, field.key, index);
                                }
                            } else {
                                if (field.label.trim() === columnName.trim()) {
                                    this.$set(this.map, field.key, index);
                                }
                            }
                        });
                    });
                }
            }
        },
        
        mapFields() {
            this.initializeFromProps();
        }
    },
    
    computed: {
        firstRow() {
            return get(this, "sample.0");
        },
        showErrorMessage() {
            return this.fileSelected && !this.isValidFileMimeType;
        },
        disabledNextButton() {
            return !this.isValidFileMimeType;
        },
    },
};
</script>
