<template>
  <div class="pa-4">
    <div v-if="!logger.length">暂无数据</div>
    <v-virtual-scroll
      :items="logger"
      height="700px"
      item-height="64"
    >
      <template v-slot:default="{ item }">
        <v-list-item :key="item">
          <v-list-item-content>
            <v-list-item-title>
              {{item}}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
      </template>
    </v-virtual-scroll>
  </div>
</template>

<script>
export default {
  computed: {
    logger() {
      return this.$store.state.logger;
    },
  },
};
</script>

<style lang="less" scoped>
</style>