<template>
  <div class="page-wrapper">
    <p class="title py-8">Everything Food Quick Search</p>
    <input
      type="text"
      class="input w-20"
      placeholder="Type to search"
      @input="searchDebounce($event)"
    />
    <div v-if="loading" class="loader">
      <p>{{ loadingMessage }}</p>
    </div>
    <div class="flex flex-wrap">
      <div v-for="(product, index) in searchResultsToDisplay" :key="index">
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import ProductCard from "@/components/ProductCard";

const BASE_SEARCH_MESSAGE = "Searching";

export default {
  components: {
    ProductCard,
  },
  data() {
    return {
      loading: false,
      searchResults: [],
      searchError: false,
      loadingMessage: BASE_SEARCH_MESSAGE,
      loadingInterval: undefined,
    };
  },
  computed: {
    searchResultsToDisplay() {
      return this.searchResults.slice(0, 10);
    },
  },
  watch: {
    loading() {
      if (this.loading) {
        this.loadingInterval = setInterval(() => {
          this.loadingMessage = this.loadingMessage.includes("...")
            ? BASE_SEARCH_MESSAGE
            : this.loadingMessage.concat(".");
        }, 350);
      } else {
        clearInterval(this.loadingInterval);
      }
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
        this.searchError = true;
      } finally {
        this.loading = false;
      }
    },
    searchDebounce: debounce(function (event) {
      this.getSearchResults(event.target.value);
    }, 300),
  },
};
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS */
.page-wrapper {
  width: 100%;
  @apply min-h-screen w-full flex flex-col items-center;
}

.title {
  @apply font-bold text-5xl;
}

.input {
  width: 300px;
  @apply bg-gray-400 rounded appearance-none py-3 px-4;
}

.loader {
  width: 200px;
  @apply font-medium text-2xl text-left py-8;
}
</style>
