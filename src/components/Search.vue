<template lang="pug">
  header.search
    input.search-text(v-model="text", placeholder="Search here.")
    button Search!
</template>

<script>

export default {
  name: 'Search',
  data () {
    return {
      text: ''
    };
  }
};
</script>

<style lang="scss">
header.search {
  display: flex;

  input.search-text {
    flex-grow: 1;
    flex-shrink: 1;
  }
}
</style>
