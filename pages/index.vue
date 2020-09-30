<template>
  <div class="page-wrapper">
    <p class="title pb-8 md:pt-8">Everything Food Quick Search</p>
    <div class="flex flex-col lg:flex-row lg:items-center">
      <p class="mr-4">Search:</p>
      <input
        type="text"
        class="input w-20"
        placeholder="Type to search"
        @input="searchDebounce($event)"
      />
    </div>
    <LoadingText v-if="loading" />
    <div
      v-if="searchResultsToDisplay.length > 0"
      class="flex flex-col lg:flex-row"
    >
      <InputSelect
        v-model="selectedFilterOption"
        :select-options="filterOptions"
        title="Filter Option"
        class="lg:mr-4"
      />
      <InputSelect
        v-model="selectedFilterValue"
        :select-options="filterValues"
        title="Filter Value"
        class="mt-4"
      />
      <button class="float-right mt-2 lg:ml-4 page-btn" @click="clearFilters">
        Clear
      </button>
    </div>
    <div
      v-if="searchResultsToDisplay.length > 0"
      class="flex flex-col lg:flex-row"
    >
      <InputSelect
        v-model="selectedSortOption"
        :select-options="sortOptions"
        title="Sort By"
      />
      <button class="float-right mt-2 lg:ml-4 page-btn" @click="clearSort">
        Clear
      </button>
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
import InputSelect from "@/components/InputSelect";
import LoadingText from "@/components/LoadingText";
import { lowestPriceMapper } from "@/helpers/helpers";

// globals that will not change and do not need to be reactive
const ITEMS_PER_PAGE = 10;

// enums for static values
const SORT_OPTIONS_ENUM = {
  EVERTHING_FOOD_QUALITY_SCORE_HL: "Everything Food Quality Score High to Low",
  EVERTHING_FOOD_QUALITY_SCORE_LH: "Everything Food Quality Score Low to High",
  PRICE_LH: "Price Low to High",
  PRICE_HL: "Price High to Low",
  ALPHABETICAL_AZ: "Alphabetical A-Z",
  ALPHABETICAL_ZA: "Alphabetical Z-A",
};

const FILTER_OPTIONS_ENUM = {
  BRAND: "Brand",
  PACKAGE_SIZE: "Package Size",
};

export default {
  name: "Index",
  components: {
    ProductCard,
    InputSelect,
    LoadingText,
  },
  data() {
    return {
      loading: false,
      searchResults: [],
      currentPage: 1,
      sortFunctionMap: {
        [SORT_OPTIONS_ENUM.EVERTHING_FOOD_QUALITY_SCORE_HL]: (a, b) =>
          a.ABBScore > b.ABBScore ? -1 : 1,
        [SORT_OPTIONS_ENUM.EVERTHING_FOOD_QUALITY_SCORE_LH]: (a, b) =>
          a.ABBScore > b.ABBScore ? 1 : -1,
        [SORT_OPTIONS_ENUM.PRICE_LH]: (a, b) => {
          return this.sortByPrice(a, b);
        },
        [SORT_OPTIONS_ENUM.PRICE_HL]: (a, b) => {
          return this.sortByPrice(a, b, false);
        },
        [SORT_OPTIONS_ENUM.ALPHABETICAL_AZ]: (a, b) =>
          a.Desc1 > b.Desc1 ? 1 : -1,
        [SORT_OPTIONS_ENUM.ALPHABETICAL_ZA]: (a, b) =>
          a.Desc1 > b.Desc1 ? -1 : 1,
      },
      sortOptions: SORT_OPTIONS_ENUM,
      selectedSortOption: "",
      filterOptions: FILTER_OPTIONS_ENUM,
      filterOptionMap: {
        [FILTER_OPTIONS_ENUM.BRAND]: (item) => item.Brand.Desc1,
        [FILTER_OPTIONS_ENUM.PACKAGE_SIZE]: (item) => item.SizeDesc1,
      },
      selectedFilterOption: "",
      selectedFilterValue: "",
    };
  },
  computed: {
    // computes how to display data, first we filter if there are filters to apply, then we sort, then we slice for the pagination
    searchResultsToDisplay() {
      let processedSearchResults = this.searchResults.slice();

      if (this.selectedFilterOption && this.selectedFilterValue) {
        processedSearchResults = processedSearchResults.filter(
          (product) =>
            this.filterOptionMap[this.selectedFilterOption](product) ===
            this.selectedFilterValue
        );
      }

      if (this.selectedSortOption) {
        processedSearchResults.sort(
          this.sortFunctionMap[this.selectedSortOption]
        );
      }

      return processedSearchResults.length > ITEMS_PER_PAGE
        ? processedSearchResults.slice(
            this.currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
            this.currentPage * ITEMS_PER_PAGE
          )
        : processedSearchResults;
    },
    numberOfPages() {
      return Math.ceil(this.searchResults.length / ITEMS_PER_PAGE);
    },
    // determine what values are available to the selected sort option from the data set, prevent duplicates and sort alphabetically
    filterValues() {
      if (this.selectedFilterOption) {
        const values = this.searchResults.reduce((res, product) => {
          const filterOptionValue = this.filterOptionMap[
            this.selectedFilterOption
          ](product);
          if (filterOptionValue && !res[filterOptionValue]) {
            res[filterOptionValue] = filterOptionValue;
          }
          return res;
        }, {});
        return Object.values(values).sort((a, b) => (a > b ? 1 : -1));
      }
      return [];
    },
  },
  watch: {
    selectedFilterOption() {
      this.selectedFilterValue = "";
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
    // price sorting, here we use the price from the lowestPriceMapper which assumes the lowest price available for the item and we sort by that, this can make sort slightly inaccurate for bulk items, I would add more options and get better results with more knowledge of the terms and product Objects. Seems to be a touch slow for larger data sets (looking at you Milk), if only supplying 2 sort options for price this could be done in the background after the data set loads. Also I would prefer to push unpriced items to the end of the sort, in this case I believe using reduce to indentify the sortable items then sorting would drastically improve performance.
    sortByPrice(a, b, LH = true) {
      const lowestPriceA = lowestPriceMapper(a.VendorFoodItems) || 0;
      const lowestPriceB = lowestPriceMapper(b.VendorFoodItems) || 0;

      return LH
        ? lowestPriceA > lowestPriceB
          ? 1
          : -1
        : lowestPriceA > lowestPriceB
        ? -1
        : 1;
    },
    clearFilters() {
      this.selectedFilterValue = "";
      this.selectedFilterOption = "";
    },
    clearSort() {
      this.selectedSortOption = "";
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

.page-btn {
  width: 100px;
  @apply border-solid rounded shadow transition px-2 py-1 mx-1 bg-gray-600 text-white;
}
</style>
