<template>
  <div class="pa-4">
    <div class="mb-4">
      <v-btn
        color="info"
        @click="open('create')"
      >添加数据表</v-btn>
      <v-btn
        color="success"
        @click="tableSync"
      >表初始化</v-btn>
      <v-btn
        color="warning"
        @click="truncate"
      >清空表数据</v-btn>
      <v-btn
        color="primary"
        @click="openQuery()"
      >自定义查询</v-btn>
    </div>
    <v-data-table
      :headers="headers"
      :items="tables"
      :items-per-page="-1"
      class="elevation-1"
      hide-default-footer
      no-data-text="暂无表数据"
      disable-sort
    >
      <template v-slot:item.control="{item}">
        <v-btn
          color="primary"
          small
          @click="open('edit',item)"
        >编辑</v-btn>
        <v-btn
          color="error"
          @click="deleteTable(item.id)"
          small
        >删除</v-btn>
      </template>
    </v-data-table>
    <v-dialog
      v-model="visible"
      fullscreen
      @input="handleClose"
    >
      <v-card>
        <v-card-title class="pt-12 mb-2">
          <span>{{mode=='edit'?'数据表编辑':'数据表创建'}}</span>
          <v-spacer />
          <v-btn
            icon
            @click="visible=false"
          ><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <div class="d-flex">
              <v-autocomplete
                v-model="copy"
                label="复制表结构"
                outlined
                dense
                return-object
                :items="tables"
                item-text="name"
              />
              <v-btn
                class="ml-2"
                color="primary"
                @click="applyCopy"
              >应用</v-btn>
            </div>
            <div class="d-flex">
              <v-text-field
                v-model="form.name"
                label="表名"
                :rules="[v => !!v || '表名不能为空',v=>/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(v)||'表名格式有误']"
                placeholder="请输入表名"
                outlined
                dense
                :disabled="mode=='edit'"
                persistent-placeholder
              >
              </v-text-field>
              <v-text-field
                class="ml-4"
                v-model="form.comment"
                label="表备注"
                placeholder="请输入表备注"
                :rules="[v => !!v || '表备注不能为空']"
                outlined
                dense
                persistent-placeholder
              >
              </v-text-field>
            </div>
            <v-card-title class="pa-0 mb-4">表字段(自动添加id为主键)</v-card-title>
            <v-data-table
              :headers="field_header"
              :items="form.fields"
              :items-per-page="-1"
              class="elevation-1"
              disable-sort
              hide-default-footer
              no-data-text="暂无字段数据"
            >
              <template #item.name="{item}">
                <v-text-field
                  v-model="item.name"
                  dense
                  class="my-2"
                  persistent-placeholder
                  :rules="[v => !!v || '字段名不能为空',v=>/^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(v)||'字段名格式有误']"
                  placeholder="请输入字段名"
                  hide-details
                />
              </template>
              <template #item.type="{item}">
                <v-autocomplete
                  v-model="item.type"
                  dense
                  class="my-2"
                  persistent-placeholder
                  @change="item.default=''"
                  placeholder="请选择类型"
                  :items="type_options"
                  hide-details
                />
              </template>
              <template #item.default="{item}">
                <v-text-field
                  v-model="item.default"
                  v-if="['STRING','TEXT'].includes(item.type)"
                  dense
                  class="my-2"
                  persistent-placeholder
                  placeholder="请输入默认值"
                  hide-details
                />
                <v-text-field
                  v-model.number="item.default"
                  v-else-if="['FLOAT','INT','DECIMAL'].includes(item.type)"
                  dense
                  class="my-2"
                  persistent-placeholder
                  placeholder="请输入默认值"
                  hide-details
                />
                <v-checkbox
                  v-model="item.default"
                  v-else-if="['BOOLEAN'].includes(item.type)"
                />
                <span v-else>-</span>
              </template>
              <template #item.comment="{item}">
                <v-text-field
                  v-model="item.comment"
                  dense
                  class="my-2"
                  persistent-placeholder
                  placeholder="请输入字段备注"
                  :rules="[v => !!v || '字段备注不能为空']"
                  hide-details
                />
              </template>
              <template #item.null="{item}">
                <v-checkbox v-model="item.null" />
              </template>
              <template #item.control="{item,index}">
                <v-btn
                  color="error"
                  @click="deleteField(index)"
                >删除</v-btn>
              </template>
              <template #footer>
                <v-btn
                  block
                  color="info"
                  @click="pushFields"
                >添加字段</v-btn>
              </template>
            </v-data-table>
            <v-card-title class="pa-0  my-4">关联（待开发）</v-card-title>
          </v-form>
          <v-btn
            block
            @click="submit"
            color="success"
          >{{mode=='create'?'创建':'保存'}}</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      fullscreen
      v-model="query_visible"
    >
      <v-card>
        <v-card-title class="pt-12 mb-2">
          <span>查询</span>
          <v-spacer />
          <v-btn
            icon
            @click="query_visible=false"
          ><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="d-flex">
            <v-list
              width="300px"
              class="pt-0"
            >
              <v-list-item-group v-model="query.current_table">
                <v-list-item
                  v-for="(item, i) in tables"
                  :key="i"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{item.name}}({{item.comment}})</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <div style="flex:1">
              <v-data-table
                height="80vh"
                hide-default-footer
                :headers="getHeader"
                :items="query.query_data"
                no-data-text="未找到任何数据"
              >
              </v-data-table>
              <div class="text-center">
                <v-pagination
                  v-model="query.current_page"
                  :length="query.total"
                  v-if="query.total>0"
                ></v-pagination>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        { text: "表名称", value: "name", class: "header" },
        { text: "表备注", value: "comment", class: "header" },
        { text: "表状态", value: "status", class: "header" },
        { text: "数据数量", value: "count", class: "header" },
        { text: "创建时间", value: "createdAt", class: "header" },
        { text: "修改时间", value: "updatedAt", class: "header" },
        { text: "操作", value: "control", class: "header" },
      ],
      visible: false,
      mode: "create",
      form: {
        name: "",
        comment: "",
        fields: [],
      },
      type_options: [
        "STRING",
        "DATE",
        "INTEGER",
        "FLOAT",
        "DECIMAL",
        "TEXT",
        "BOOLEAN",
      ],
      field_header: [
        { text: "字段名", value: "name", class: "header", width: "20%" },
        { text: "字段类型", value: "type", class: "header", width: "20%" },
        { text: "默认值", value: "default", class: "header", width: "20%" },
        { text: "字段备注", value: "comment", class: "header", width: "20%" },
        { text: "允许为Null", value: "null", class: "header", width: "10%" },
        { text: "操作", value: "control", class: "header" },
      ],
      current: null,
      copy: null,
      query_visible: false,
      query: {
        current_table: 0,
        query_data: [],
        total: 0,
        current_page: 1,
        page_size: 100,
      },
    };
  },
  computed: {
    tables() {
      return this.$store.state.data_tables;
    },
    getHeader() {
      let table = this.tables[this.query.current_table];
      if (!table) {
        return [];
      }

      let headers = [{ text: "id", value: "id", class: "header" }];
      for (let item of table.data) {
        headers.push({
          text: `${item.name}(${item.comment})`,
          value: item.name,
          class: "header",
        });
      }
      return headers;
    },
  },
  methods: {
    getTableData() {
      this.$store.dispatch("getTableData");
    },
    open(mode, item) {
      this.mode = mode;
      if (mode == "edit") {
        let current = JSON.parse(JSON.stringify(item));
        this.current = current;
        this.form = {
          name: current.name,
          comment: current.comment,
          fields: current.data,
        };
      }
      this.visible = true;
    },
    pushFields() {
      this.form.fields.push({
        name: "",
        type: "STRING",
        null: false,
        default: "",
        comment: "",
      });
    },
    deleteField(index) {
      this.form.fields.splice(index, 1);
    },
    handleClose(value) {
      this.$refs.form.resetValidation();
      this.visible = false;
      this.copy = null;
      this.form = {
        name: "",
        comment: "",
        fields: [],
      };
    },
    async submit() {
      if (this.$refs.form.validate()) {
        let result = null;
        switch (this.mode) {
          case "create":
            result = await this.$ipcRenderer.invoke("insertTable", this.form);
            break;
          case "edit":
            result = await this.$ipcRenderer.invoke("editTable", {
              id: this.current.id,
              data: this.form,
            });
            break;
        }
        result && this.getTableData();
        this.handleClose();
      }
    },
    applyCopy() {
      this.form.fields = JSON.parse(JSON.stringify(this.copy.data));
    },
    deleteTable(id) {
      this.$confirm({
        title: "询问",
        message: "是否删除该该表,可能会导致流程中的功能报错。",
      })
        .then(async () => {
          let result = await this.$ipcRenderer.invoke("deleteTable", id);
          result && this.getTableData();
        })
        .catch(() => {});
    },
    async truncate() {
      return (
        (await this.$ipcRenderer.invoke("truncate")) && this.getTableData()
      );
    },
    async tableSync() {
      await this.$ipcRenderer.invoke("tableSync");
      this.getTableData();
    },
    async openQuery(index) {
      if (index !== undefined) this.query.current_table = index;
      this.query_visible = true;
      this.queryDatabase();
    },
    async queryDatabase() {
      let table = this.tables[this.query.current_table];
      let { current_page, page_size } = this.query;
      let { count, rows } = await this.$ipcRenderer.invoke("customQuery", {
        table: table.name,
        condition: {
          limit: page_size,
          offset: (current_page - 1) * page_size,
        },
      });
      this.query.query_data = rows;
      this.query.total = Math.ceil(count / this.query.page_size) || 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  background-color: #eee;
}
</style>