<template>
  <div class="container">
    <p>Everything Food Quick Search</p>
    <input type="text" class="input" @input="searchDebounce($event)" />
    <p>{{ searchResults }}</p>
    <div v-for="(result, index) in searchResultsToDisplay" :key="index">
      <p>{{ result }}</p>
      <p>----------------</p>
    </div>
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      loading: false,
      searchResults: [],
      searchError: false,
    };
  },
  computed: {
    searchResultsToDisplay() {
      return this.searchResults.slice(0, 9);
    },
  },
  methods: {
    async getSearchResults(query) {
      console.log(query);
      this.searchError = false;
      this.loading = true;
      try {
        const data = await this.$axios.$get(`?q=${query}`);
        console.log(data);
        this.searchResults = data.SearchResults;
      } catch (error) {
        this.error = true;
      }

      this.loading = false;
    },
    searchDebounce: debounce(function (event) {
      this.getSearchResults(event.target.value);
    }, 300),
  },
};
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS */
.container {
  @apply min-h-screen flex justify-center items-start text-center mx-auto;
}
.input {
  @apply bg-gray-400 rounded appearance-none py-3 px-4 w-full;
}
</style>
