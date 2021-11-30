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
                            File Has Headers  -  Book !!!!!
                        </label>
                    </slot>
                </div>
                <div class="form-group csv-import-file">
                    <input
                        ref="csv"
                        type="file"
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
                <div class="form-group">
                    <slot name="next" :load="load">
                        <!-- <button type="submit" :disabled="disabledNextButton" :class="buttonClass" @click.prevent="load"> {{ loadBtnText }} </button> -->
                        <v-btn  type="submit" :disabled="disabledNextButton" :class="buttonClass" @click.prevent="load" :loading="loading" > {{ loadBtnText }} </v-btn>
                    </slot>
                </div>
            </div>
            <!-- {{ csv }} -->

            <div class="vue-csv-uploader-part-two">
                <div class="vue-csv-mapping" v-if="sample">
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
                                <!-- <td>{{ field }}</td> -->
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
                </div>
                <v-btn class="ma-2" :loading="loading" :disabled="loading" @click="saveBook">save</v-btn>
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
import BookDataService from "../services/BookDataService";



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
            default: "Next",
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
            default: false,
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
            "asmchta_date",
            "record_id",
            "record_schum",
            "pratim",
            "asmacta1",
            "schum_hova",
            "schum_zchut",
            "cust_lname",
            "cust_fname",
            "bs_item_name",
            "bs_group_name",
        ],
        map: {},
        hasHeaders: true,
        csv: null,
        sample: null,
        isValidFileMimeType: false,
        fileSelected: false,
        //obj: '',
        loading: false,
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
        saveBook() {

            if (window.confirm('This operation will delete all currnet records in Book table...')){
                this.loading = true;                    
                BookDataService.deleteAll()
                    .then((response) => {
                        console.log(response.data);
                        for (let i = 1; i < this.form.csv.length; i++) { 
                            var data = {
                                asmchta_date:   this.form.csv[i].asmchta_date,
                                record_id:      parseInt(this.form.csv[i].record_id),
                                record_schum:   parseInt(this.form.csv[i].record_schum),
                                pratim:         this.form.csv[i].pratim,
                                asmacta1:       parseInt(this.form.csv[i].asmacta1),
                                schum_hova:     parseInt(this.form.csv[i].schum_hova),
                                schum_zchut:    parseInt(this.form.csv[i].schum_zchut),
                                cust_lname:     this.form.csv[i].cust_lname,
                                cust_fname:     this.form.csv[i].cust_fname,
                                bs_item_name:   this.form.csv[i].bs_item_name,
                                bs_group_name:  this.form.csv[i].bs_group_name,                
                            };
                            BookDataService.create(data)
                            .then(response => {
                                console.log(response.data);
                            })
                            .catch(e => {
                                console.log(e);
                                console.log('--------')
                                console.log(e.data);
                            });
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                    });
                this.loading = false;
            }
        }

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
