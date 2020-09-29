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
    <div v-if="searchResultsToDisplay.length > 0" class="self-end mr-8">
      <span class="mr-4">Sort By: </span>
      <select id="sortBy" v-model="selectedSortOption" name="sortBy">
        <option v-for="(option, key) in sortOptions" :key="key" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="flex flex-wrap">
      <div v-for="product in searchResultsToDisplay" :key="product.FoodItemID">
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
import { lowestPriceMapper } from "@/helpers/helpers";

const BASE_SEARCH_MESSAGE = "Searching";
const ITEMS_PER_PAGE = 10;
const SORT_OPTIONS_ENUM = {
  EVERTHING_FOOD_QUALITY_SCORE_HL: "Everything Food Quality Score High to Low",
  EVERTHING_FOOD_QUALITY_SCORE_LH: "Everything Food Quality Score Low to High",
  PRICE_LH: "Price Low to High",
  PRICE_HL: "Price High to Low",
  ALPHABETICAL_AZ: "Alphabetical A-Z",
  ALPHABETICAL_ZA: "Alphabetical Z-A",
};

export default {
  name: "Index",
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
      sortFunctionMap: {
        [SORT_OPTIONS_ENUM.EVERTHING_FOOD_QUALITY_SCORE_HL]: (a, b) =>
          a.ABBScore > b.ABBScore ? -1 : 1,
        [SORT_OPTIONS_ENUM.EVERTHING_FOOD_QUALITY_SCORE_LH]: (a, b) =>
          a.ABBScore > b.ABBScore ? 1 : -1,
        [SORT_OPTIONS_ENUM.PRICE_LH]: (a, b) => {
          console.log(this.sortByPrice(a, b));
          return this.sortByPrice(a, b);
        },
        [SORT_OPTIONS_ENUM.PRICE_HL]: (a, b) => {
          console.log(this.sortByPrice(a, b, false));
          this.sortByPrice(a, b, false);
        },
        [SORT_OPTIONS_ENUM.ALPHABETICAL_AZ]: (a, b) =>
          a.Desc1 > b.Desc1 ? 1 : -1,
        [SORT_OPTIONS_ENUM.ALPHABETICAL_ZA]: (a, b) =>
          a.Desc1 > b.Desc1 ? -1 : 1,
      },
      sortOptions: SORT_OPTIONS_ENUM,
      selectedSortOption: SORT_OPTIONS_ENUM.ALPHABETICAL_AZ,
    };
  },
  computed: {
    searchResultsToDisplay() {
      const sortedSearchResults = this.searchResults
        .slice()
        .sort(this.sortFunctionMap[this.selectedSortOption]);

      if (sortedSearchResults.length > ITEMS_PER_PAGE) {
        console.log(this.sortFunctionMap[this.selectedSortOption]);
        return sortedSearchResults.slice(
          this.currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
          this.currentPage * ITEMS_PER_PAGE
        );
      } else {
        return sortedSearchResults;
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
      this.currentPage = 1;
      this.searchError = false;
      this.loading = true;
      try {
        const data = await this.$axios.$get(`?q=${query}`);
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
    sortByPrice(a, b, LH = true) {
      const lowestPriceA = lowestPriceMapper(a.VendorFoodItems.slice())[0] || 0;
      const lowestPriceB = lowestPriceMapper(b.VendorFoodItems.slice())[0] || 0;

      console.log(lowestPriceA);
      console.log(lowestPriceB);
      console.log("-----");

      return LH
        ? lowestPriceA > lowestPriceB
          ? 1
          : -1
        : lowestPriceA > lowestPriceB
        ? -1
        : 1;
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
