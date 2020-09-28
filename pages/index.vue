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
    <div v-if="searchResultsToDisplay.length > 0" class="self-end flex mt-8">
      <p class="mr-4">Viewing page {{ currentPage }}/{{ numberOfPages }}</p>
      <button class="page-btn" @click="seePrevPage">Prev</button>
      <button class="page-btn" @click="seeNextPage">Next</button>
    </div>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import ProductCard from "@/components/ProductCard";

const BASE_SEARCH_MESSAGE = "Searching";
const ITEMS_PER_PAGE = 10;

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
      currentPage: 1,
    };
  },
  computed: {
    searchResultsToDisplay() {
      if (this.searchResults.length > ITEMS_PER_PAGE) {
        return this.searchResults.slice(
          this.currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
          this.currentPage * ITEMS_PER_PAGE
        );
      } else {
        return this.searchResults;
      }
    },
    numberOfPages() {
      return Math.ceil(this.searchResults.length / ITEMS_PER_PAGE);
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
    seePrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    seeNextPage() {
      if (this.currentPage < this.numberOfPages) {
        this.currentPage++;
      }
    },
  },
};
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS */
.page-wrapper {
  width: 100%;
  @apply min-h-screen w-full flex flex-col items-center p-16;
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

.page-btn {
  @apply border-solid rounded shadow transition px-2 py-1 mx-1 bg-gray-600 text-white;
}
</style>
