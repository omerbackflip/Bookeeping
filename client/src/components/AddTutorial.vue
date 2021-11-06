<template>
  <div class="submit-form">
    <div v-if="!submitted">
      <div class="form-group">
        <label for="company">Company</label>
        <input
          type="text"
          class="form-control"
          id="company"
          required
          v-model="tutorial.company"
          name="company"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <input
          class="form-control"
          id="description"
          required
          v-model="tutorial.description"
          name="description"
        />
      </div>

      <div class="form-group">
        <label for="amount">Amount</label>
        <input
          class="form-control"
          id="amount"
          required
          v-model="tutorial.amount"
          name="amount"
        />
      </div>
      <button @click="saveTutorial" class="btn btn-success">Submit</button>
    </div>

    <div v-else>
      <h4>You submitted successfully!</h4>
      <button class="btn btn-success" @click="newTutorial">Add</button>
    </div>
  </div>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";

export default {
  name: "add-tutorial",
  data() {
    return {
      tutorial: {
        id: null,
        company: "",
        description: "",
        amount: null,
        published: false
      },
      submitted: false
    };
  },
  methods: {
    saveTutorial() {
      var data = {
        company: this.tutorial.company,
        description: this.tutorial.description,
        amount: this.tutorial.amount
      };

      TutorialDataService.create(data)
        .then(response => {
          this.tutorial.id = response.data.id;
          console.log(response.data);
          this.submitted = true;
        })
        .catch(e => {
          console.log(e);
        });
    },
    
    newTutorial() {
      this.submitted = false;
      this.tutorial = {};
    }
  }
};
</script>

<style>
.submit-form {
  max-width: 300px;
  margin: auto;
}
</style>