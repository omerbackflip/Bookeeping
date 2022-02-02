<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search..." v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>  -->
    <!-- <AddInvoice></AddInvoice> -->
    <v-layout row wrap>
      <v-flex xs12 md10>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search1"
          single-line
          hide-details
        ></v-text-field>
        <v-data-table :headers="headers" 
                      :items="tables" 
                      :search="search"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="75vh"
                      class="elevation-3"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:[`item.actions`]="{ item }"> 
            <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon>
            <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item.id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item.id}`"
                            @blur="updateOne(item)"/>
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{item.description}}</span>
            </div>
          </template>
        </v-data-table>

      </v-flex>
      <v-flex md10>
        <v-footer color="primary lighten-1" align="center" class="mt-2" elevation="10">
          <v-form ref="form" >
            <v-row>
              <v-col >
                <v-text-field v-model="tblFields.id" label="ID" :rules="fldRules"></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.code" label="Code" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.description" label="Description" required></v-text-field>
              </v-col>
            </v-row>
            <v-btn @click="addToTable"> -Add- </v-btn>
            <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
          </v-form>
        </v-footer>
      </v-flex>
    </v-layout>
  </div>
</template>



<script>
import TableDataService from "../services/TableDataService";

export default {
  name: "table-list",
  data() {
    return {
      tables: [],
      currInvoice: null,
      currentIndex: -1,
      search: '',
      headers:[
        { text: "ID", value: "table_id", class: 'success title'},
        { text: "CODE", value: "table_code", class: 'success title'},
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: true,
      itemToEdit: "",
      tblFields: {
        id:         "",
        code:       "",
        description:"",
      },
      fldRules: [v => !!v || 'Field is required'],
    };
  },

  methods: {


    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        TableDataService.delete(id)
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },


    retrieveTables() {
      TableDataService.getAll()
        .then((response) => {
          this.tables = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTables();
      this.currInvoice = null;
      this.currentIndex = -1;
    },

    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      TableDataService.update(item.id, item)
        .then(response => {
          console.log(response.data);
          this.message = 'The updateOne() updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
        this.itemToEdit = '';
    },

    setEdit(item) {
      this.itemToEdit = item.id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item.id}`).focus()
      }, 1 );
    },

    addToTable() {
      var data = {
        table_id:     this.tblFields.id,
        table_code:   this.tblFields.code,
        description:  this.tblFields.description,
      };
      TableDataService.create(data)
        .then(response => {
          this.tblFields.id = response.data.id;
          this.refreshList();
          this.clearForm();
        })
        .catch(e => {
          console.log("sdkhfjkdh  ")
          console.log(e);
        });
    },



  },

  mounted() {
    this.retrieveTables();
  },
};



</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
}
</style>
