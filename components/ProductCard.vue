<template>
  <div class="product-card">
    <p class="self-end pb-4">EF Score: {{ product.ABBScore }}</p>
    <img
      :src="product.MainImageFilePath"
      alt="Product Image"
      class="product-image pb-4"
    />
    <p class="pb-4">Brand: {{ product.Brand.Desc1 }}</p>
    <p class="pb-4">Description: {{ product.Desc1 }}</p>
    <p v-if="product.SizeDesc1">Packaging: {{ product.SizeDesc1 }}</p>
  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style>
.product-card {
  width: 300px;
  height: 500px;
  @apply flex flex-col rounded shadow-outline p-8 m-4;
}
.product-image {
  width: 275px;
  height: 275px;
}
</style>
