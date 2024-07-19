<!--
 * @Author: 羊驼
 * @Date: 2024-05-14 10:37:12
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 16:31:56
 * @Description: file content
-->
<template>
  <v-app id="app">
    <v-navigation-drawer
      app
      permanent
      width="200"
    >
      <!-- -->
      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="active"
          color="primary"
          mandatory
        >
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
          >
            <v-list-item-content>
              <v-list-item-title>{{item.text}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-system-bar
      window
      dark
      app
    >
      <v-icon>mdi-alpha-s-circle</v-icon>
      <span>简易服务器</span>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="invoke('minimize')"
        class="system-btn"
        x-small
      > <v-icon>mdi-minus</v-icon></v-btn>
      <v-btn
        text
        class="system-btn"
        x-small
        @click="invoke('fullscreen')"
      > <v-icon>mdi-checkbox-blank-outline</v-icon></v-btn>
      <v-btn
        text
        class="system-btn"
        x-small
        @click="invoke('close')"
      > <v-icon>mdi-close</v-icon></v-btn>

    </v-system-bar>

    <!-- 根据应用组件来调整你的内容 -->
    <v-main>
      <keep-alive>
        <component :is="calComponent" />
      </keep-alive>
    </v-main>
    <v-snackbar v-model="snackbar">
      <v-icon v-if="message.type=='success'">mdi-check-circle</v-icon>
      <v-icon v-if="message.type=='error'">mdi-close-circle</v-icon>
      <span class="ml-2"> {{ message.message }}</span>
    </v-snackbar>
  </v-app>
</template>

<script>
import BaseSetting from "./components/BaseSetting.vue";
import Database from "./components/Database.vue";
import Interface from "./components/Interface.vue";
import Logger from "./components/Logger.vue";

export default {
  components: { BaseSetting, Interface, Database, Logger },
  name: "App",
  data() {
    return {
      items: [
        { text: "基础配置" },
        { text: "接口管理" },
        { text: "数据表管理" },
        { text: "服务器日志" },
        { text: "自定义中间件" },
      ],
      active: 0,
      snackbar: false,
      message: {},
    };
  },
  mounted() {
    this.$ipcRenderer.removeAllListeners();
    this.$ipcRenderer.on("message", (event, data) => {
      this.snackbar = true;
      this.message = data;
    });

    this.$ipcRenderer.on("connect", (event, data) => {
      this.$store.commit("setStatus", true);
    });

    this.$ipcRenderer.on("disconnect", (event, data) => {
      this.$store.commit("setStatus", false);
    });

    this.$ipcRenderer.on("logger", (event, data) => {
      this.$store.commit("setLogger", data);
    });

    this.$store.dispatch("getTableData");
  },
  computed: {
    calComponent() {
      switch (this.active) {
        case 0:
          return "base-setting";
        case 1:
          return "interface";
        case 2:
          return "database";
        case 3:
          return "logger";
      }
    },
  },
  methods: {
    invoke(type) {
      this.$ipcRenderer.invoke(type);
    },
  },
};
</script>

<style lang="scss">
html {
  overflow-y: hidden !important;
}
#app {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  .v-system-bar {
    z-index: 1002;
    -webkit-app-region: drag;
    .system-btn {
      cursor: pointer;
      -webkit-app-region: no-drag !important;
    }
  }
}
.workflow {
  .node-wrap-box.error {
    background-color: #fff !important;
  }
  .add-branch {
    background-color: #409eff !important;
  }
}
.el-button--success,
.el-button--warning,
.el-button--danger,
.el-button--primary {
  color: #fff !important;
}
.v-snack--bottom {
  bottom: 20px !important;
}
</style>
