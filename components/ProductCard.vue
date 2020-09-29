<template>
  <div class="product-card">
    <p class="self-end pb-4">EF Score: {{ product.ABBScore }}</p>
    <img
      :src="product.MainImageFilePath"
      alt="Product Image"
      class="product-image pb-4"
    />
    <p class="pb-4">
      <span class="font-medium">Brand:</span> {{ product.Brand.Desc1 }}
    </p>
    <p class="pb-4">
      <span class="font-medium">Description:</span> {{ product.Desc1 }}
    </p>
    <p v-if="product.SizeDesc1">
      <span class="font-medium">Packaging:</span> {{ product.SizeDesc1 }}
    </p>
    <p v-if="lowestPrice[0]">
      <span class="font-medium">Price:</span> ${{ lowestPrice[0] }}
    </p>
  </div>
</template>

<script>
import { lowestPriceMapper } from "@/helpers/helpers";

export default {
  name: "ProductCard",
  props: {
    product: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    lowestPrice() {
      return lowestPriceMapper(this.product.VendorFoodItems.slice());
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
  width: 250px;
  height: 250px;
}
</style>
