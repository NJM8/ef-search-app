<template>
  <div class="loader">
    <p>{{ loadingMessage }}</p>
  </div>
</template>

<script>
// cheesy loading indicator, better served by a fancy loading spinner in a global component
const BASE_SEARCH_MESSAGE = "Searching";

export default {
  name: "LoadingText",
  data() {
    return {
      loadingMessage: BASE_SEARCH_MESSAGE,
      loadingInterval: undefined,
    };
  },
  created() {
    this.loadingInterval = setInterval(() => {
      this.loadingMessage = this.loadingMessage.includes("...")
        ? BASE_SEARCH_MESSAGE
        : this.loadingMessage.concat(".");
    }, 350);
  },
  destroyed() {
    clearInterval(this.loadingInterval);
  },
};
</script>

<style>
.loader {
  width: 200px;
  @apply font-medium text-2xl text-left py-8;
}
</style>
