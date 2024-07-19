<!--
 * @Author: 羊驼
 * @Date: 2024-05-16 16:23:47
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 15:54:55
 * @Description: file content
-->
<template>
  <v-form class="pa-4">
    <div class="d-flex">
      <v-text-field
        label="使用端口"
        outlined
        v-model.number="config.port"
        dense
        hide-details
      ></v-text-field>
      <v-btn
        color="primary"
        class="ml-2"
        @click="startServer"
        v-if="!connect"
      >
        开启
      </v-btn>
      <v-btn
        color="error"
        class="ml-2"
        @click="closeServer"
        v-else
      >
        关闭
      </v-btn>
    </div>
    <!-- logo -->
    <v-select
      class="mt-6"
      v-model="config.type"
      :items="['sqlite','mysql']"
      label="数据库源配置"
      outlined
      dense
    />
    <!-- <template v-if="config.type=='sqlite'">
      <div class="mb-4">
        <v-btn color="info">数据源地址：{{config.sqlite.storage}}</v-btn>
      </div>
    </template> -->
    <template v-if="config.type=='mysql'">
      <v-text-field
        v-model="config.mysql.host"
        label="数据库地址"
        outlined
        dense
        persistent-placeholder
        placeholder="请输入数据库地址"
      />
      <v-text-field
        v-model="config.mysql.port"
        label="数据库端口"
        outlined
        dense
        persistent-placeholder
        placeholder="请输入数据库端口"
      />
      <v-text-field
        v-model="config.mysql.username"
        label="数据库用户名"
        outlined
        dense
        persistent-placeholder
        placeholder="请输入数据库用户名"
      />
      <v-text-field
        v-model="config.mysql.password"
        label="数据库密码"
        outlined
        dense
        type="password"
        persistent-placeholder
        placeholder="请输入数据库密码"
      />
      <v-text-field
        v-model="config.mysql.database"
        label="数据库名称"
        outlined
        dense
        persistent-placeholder
        placeholder="请输入数据库名称"
      />

    </template>
    <div>
      <v-btn color="primary">配置保存</v-btn>
      <v-btn
        color="success"
        @click="testConnect"
      >测试数据库连接</v-btn>
    </div>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      init: false,
      enable: false,
      config: {
        port: 3000,
        type: "sqlite",
        sqlite: {
          storage: "./data.db",
        },
        mysql: {
          database: "",
          username: "",
          password: "",
          host: "127.0.0.1",
          port: "",
        },
      },
    };
  },
  mounted() {
    this.getConfig();
  },
  watch: {
    config: {
      handler(nv, ov) {
        if (!this.init) {
          this.init = true;
        } else {
          this.$ipcRenderer.invoke("setConfig", nv);
        }
      },
      deep: true,
    },
  },
  computed: {
    connect() {
      return this.$store.state.connect;
    },
  },
  methods: {
    async getConfig() {
      let config = await this.$ipcRenderer.invoke("getConfig");
      this.config = config;
    },
    async testConnect() {
      await this.$ipcRenderer.invoke("testConnect");
    },
    async startServer() {
      await this.$ipcRenderer.invoke("startServer", this.config.port);
    },
    async closeServer() {
      await this.$ipcRenderer.invoke("closeServer");
    },
  },
};
</script>

<style>
</style>