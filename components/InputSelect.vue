<template>
  <div class="mt-4 flex flex-col lg:flex-row items-start lg:items-center">
    <span class="mr-4">{{ title }}: </span>
    <select :value="value" name="input-select" class="input" @input="onInput">
      <option disabled :selected="value === ''" value="">Select a value</option>
      <option
        v-for="(option, index) in selectOptions"
        :key="index"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "InputSelect",
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    selectOptions: {
      type: [Array, Object],
      default: () => [],
    },
  },
  methods: {
    onInput(event) {
      this.$emit("input", event.target.value);
    },
  },
};
</script>
