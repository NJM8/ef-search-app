<template>
  <div>
    <span class="mr-4">Sort By: </span>
    <select
      id="sort-by"
      :value="value"
      name="sort-by"
      class="input"
      @input="onInput"
    >
      <option v-for="(option, key) in sortOptions" :key="key" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
// sort by component, could easily be adapted to be more universal and be used for all select menus
export default {
  name: "SortBy",
  props: {
    value: {
      type: String,
      default: "",
    },
    sortOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    onInput(event) {
      this.$emit("input", event.target.value);
    },
  },
};
</script>
