<template>
  <div class="pa-4">
    <v-btn
      color="success"
      @click="open('create')"
    >
      添加接口
    </v-btn>
    <v-data-table
      :headers="headers"
      :items="interfaces"
      :items-per-page="-1"
      class="elevation-1 mt-2"
      disable-sort
      hide-default-footer
      no-data-text="无接口数据"
      :loading="loading"
    >
      <template v-slot:item.enable="{item}">
        <v-switch
          v-model="item.enable"
          @change="switchStatus(item)"
          class="mt-0"
          hide-details
        />
      </template>
      <template v-slot:item.control="{item}">
        <v-btn
          color="primary"
          small
          @click="open('edit',item)"
        >
          <v-icon left>
            mdi-pencil
          </v-icon>
          编辑
        </v-btn>
        <v-btn
          color="error"
          small
          @click="deleteInterface(item.id)"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          删除
        </v-btn>
      </template>
    </v-data-table>
    <el-dialog
      :visible.sync="edit_visible"
      fullscreen
      :before-close="handleClose"
      :title="mode=='edit'?'接口编辑':'接口创建'"
    >
      <v-form>
        <div class="d-flex">
          <v-text-field
            v-model="form.name"
            label="接口名称"
            outlined
            dense
            hide-details
            placeholder="请输入接口名称"
            persistent-placeholder
          />
          <v-btn
            color="success"
            @click="submit"
            class="ml-4"
          >{{mode=='create'?'创 建':'保 存'}}</v-btn>
        </div>
        <v-tabs
          class="mt-2"
          v-model="active"
        >
          <v-tab>基础配置</v-tab>
          <v-tab>接口逻辑配置</v-tab>
          <v-tab-item class="py-4">
            <v-text-field
              label="路由地址"
              outlined
              hide-details
              dense
              v-model="form.url"
              persistent-placeholder
              placeholder="请输入路由地址"
            />
            <v-radio-group
              row
              v-model="form.enable"
              label="接口启用"
              mandatory
            >
              <v-radio
                label="启用"
                :value="true"
              ></v-radio>
              <v-radio
                label="不启用"
                :value="false"
              ></v-radio>
            </v-radio-group>
            <v-select
              v-model="form.method"
              :items="['get','post','put','delete']"
              label="路由方法"
              outlined
              dense
            />
            <v-select
              v-model="form.middleware"
              :items="['logger']"
              label="中间件"
              outlined
              multiple
              dense
              hide-details
            />
            <v-card-subtitle class="pl-2 mt-2 text-h6">参数配置</v-card-subtitle>
            <v-btn
              color="primary"
              @click="pushParam()"
            >
              添加参数
            </v-btn>
            <v-treeview
              :items="form.body"
              hoverable
            >
              <template v-slot:label="{item}">
                <div class="grid pt-2 align-center">
                  <v-switch
                    label="启用校验"
                    dense
                    v-model="item.validate.test"
                  />
                  <v-text-field
                    label="参数字段"
                    outlined
                    hide-details
                    v-model="item.name"
                    dense
                    persistent-placeholder
                    placeholder="请输入参数字段名称"
                  />
                  <v-text-field
                    label="参数中文名"
                    outlined
                    hide-details
                    v-model="item.comment"
                    placeholder="请输入参数中文名"
                    persistent-placeholder
                    dense
                  />
                  <v-select
                    label="参数类型"
                    :items="['string','number','array','object']"
                    outlined
                    v-model="item.type"
                    hide-details
                    placeholder="请选择参数类型"
                    persistent-placeholder
                    dense
                  />
                  <v-text-field
                    label="正则验证"
                    outlined
                    hide-details
                    v-model="item.validate.regex"
                    placeholder="请输入正则"
                    v-if="!isObject(item.type)"
                    persistent-placeholder
                    dense
                  />
                  <v-checkbox
                    label="允许为空"
                    v-if="!isObject(item.type)"
                    v-model="item.validate.empty"
                  />
                  <v-checkbox
                    label="允许为Null"
                    v-if="!isObject(item.type)"
                    v-model="item.validate.allowNull"
                  />

                  <div class="d-flex">
                    <v-btn
                      color="success"
                      v-if="isObject(item.type)"
                      @click="pushParam(item)"
                    >
                      添加子项</v-btn>
                    <v-btn
                      color="error"
                      class="ml-2"
                      @click="deleteItem(item)"
                    >
                      删除
                    </v-btn>
                  </div>
                </div>
              </template>
            </v-treeview>
          </v-tab-item>
        </v-tabs>
        <work-flow
          :fullscreen="false"
          v-show="active==1"
          height="75vh"
          class="mt-2 show"
          ref="workflow"
        />
      </v-form>
    </el-dialog>
  </div>
</template>

<script>
import { uuid } from "vue-uuid";
export default {
  data() {
    return {
      interfaces: [
        // {
        //   name: "测试",
        //   method: "get",
        //   url: "/admin/api",
        //   enable: true,
        // },
      ],
      headers: [
        { text: "接口名称", value: "name", class: "header" },
        { text: "接口方法", value: "method", class: "header" },
        { text: "接口地址", value: "url", class: "header" },
        { text: "启用状态", value: "enable", class: "header" },
        { text: "操作", value: "control", class: "header" },
      ],
      edit_visible: false,
      mode: "create",
      // form: {
      //   enable: true,
      //   name: "登录",
      //   url: "/admin/login",
      //   method: "post",
      //   body: [
      //     {
      //       id: "123",
      //       type: "object",
      //       name: "form",
      //       validate: { test: true },
      //       children: [
      //         {
      //           id: "456",
      //           type: "string",
      //           name: "username",
      //           comment: "用户名",
      //           validate: {
      //             test: true,
      //             allowNull: false,
      //             empty: false,
      //             regex: "^[a-zA-Z][a-zA-Z0-9_]{4,15}$",
      //           },
      //         },
      //       ],
      //       comment: "表单",
      //     },
      //   ],
      //   middleware: ["logger"],
      //   logic: {},
      //   config: {},
      // },
      active: 0,
      loading: false,
    };
  },
  computed: {
    form: {
      get() {
        return this.$store.state.form;
      },
      set(value) {
        this.$store.commit("setForm", value);
      },
    },
  },
  mounted() {
    this.getAllInterface();
    let nodeType = this.$factory.nodeType;
    this.$factory.setAddOptions([
      nodeType.数据库,
      nodeType.条件分支,
      nodeType.结果返回,
    ]);
    console.log(this.$factory.getNodeType());
  },
  methods: {
    open(mode, row) {
      this.mode = mode;
      if (mode != "create") {
        this.form = JSON.parse(JSON.stringify(row));
      }
      this.edit_visible = true;
      this.$nextTick(() => {
        mode != "create"
          ? this.$refs.workflow.loadData(this.form.logic)
          : this.$refs.workflow.reset();
      });
    },
    handleClose() {
      this.edit_visible = false;
      this.form = {
        enable: false,
        name: "",
        url: "",
        method: "",
        body: [],
        middleware: [],
        logic: {},
      };
      this.active = 0;
    },
    flatParams() {
      let dic = {};
      const flat = (list, father) => {
        for (let item of list) {
          dic[item.id] = { ...item, father_id: (father && father.id) || null };
          item.children && flat(item.children, item);
        }
      };
      flat(this.form.body, null);
      return dic;
    },
    isObject(type) {
      return ["object", "array"].includes(type);
    },
    deleteInterface(id) {
      this.$confirm({
        title: "询问",
        message: "是否删除该接口？",
      })
        .then(async () => {
          (await this.$ipcRenderer.invoke("deleteInterface", id)) &&
            this.getAllInterface();
        })
        .catch(() => {});
    },
    pushParam(item) {
      let struct = {
        id: uuid.v4(),
        type: "string",
        name: "",
        comment: "",
        children: [],
        validate: {
          test: true,
          allowNull: false,
          empty: false,
          regex: "",
        },
      };
      item ? item.children.push(struct) : this.form.body.push(struct);
    },
    deleteItem(item) {
      let dic = this.flatParams();
      let target = dic[dic[item.id].father_id];
      let father = (target && target.children) || this.form.body;
      let index = father.findIndex((x) => x.id == item.id);
      index != -1 && father.splice(index, 1);
    },
    async getAllInterface() {
      let interfaces = await this.$ipcRenderer.invoke("queryInterface");
      this.interfaces = interfaces;
    },
    async submit() {
      let result = null;
      if (this.$refs.workflow.validate()) {
        this.form.logic = this.$refs.workflow.exportStruct();
        switch (this.mode) {
          case "create":
            result = await this.$ipcRenderer.invoke(
              "createInterface",
              this.form
            );
            break;
          case "edit":
            let { name, body, logic, middleware, url, method, enable } =
              this.form;
            result = await this.$ipcRenderer.invoke("editInterface", {
              id: this.form.id,
              data: { name, body, logic, middleware, url, method, enable },
            });
            break;
        }
        if (result) {
          this.getAllInterface();
          this.handleClose();
        }
      } else {
        return this.$message.error("流程配置有误");
      }
    },
    async switchStatus(item) {
      this.loading = true;
      let result = await this.$ipcRenderer.invoke("switchStatus", item.id);
      this.loading = false;
      result && this.getAllInterface();
    },
  },
};
</script>

<style lang="scss">
.header {
  background-color: #eee;
}
.grid {
  display: grid;
  grid-template-columns: 120px repeat(7, 12%);
  column-gap: 20px;
}
.workflow {
  .el-button--small.is-round {
    padding: 9px 15px !important;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.show {
  animation: fadeIn 0.5s forwards;
}
</style>