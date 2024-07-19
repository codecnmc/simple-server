<!--
 * @Author: 羊驼
 * @Date: 2024-04-30 10:45:24
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-17 10:19:01
 * @Description: file content
-->
<template>
  <div class="modal">
    <v-card
      class="dialog"
      max-width="290"
      v-if="options"
    >
      <v-card-title class="headline">
        {{options.title}}
      </v-card-title>
      <v-card-text>
        {{ options.message }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="green"
          text
          @click="cancel"
        >
          取消
        </v-btn>
        <v-btn
          color="#4caf50"
          text
          @click="confirm"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
 
<script>
export default {
  props: {
    options: Object,
    reject: Promise,
    resolve: Promise,
  },
  methods: {
    handleAfterLeave() {
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
    cancel() {
      this.handleAfterLeave();
      this.reject && this.reject();
    },
    confirm() {
      this.handleAfterLeave();
      this.resolve && this.resolve();
    },
  },
};
</script>
<style lang="scss">
.modal {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 998;
  pointer-events: none;
}
.dialog {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  min-width: 290px;
  z-index: 999;
  border-radius: 4px;
  overflow-y: auto;
  pointer-events: auto;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>