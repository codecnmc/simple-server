<!--
 * @Author: 羊驼
 * @Date: 2024-05-22 16:10:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 11:28:24
 * @Description: file content
-->
<template>
  <el-form
    class="yt-form"
    label-position="top"
  >
    <el-descriptions
      :title="item.name"
      v-for="(item,index) in setting.commands"
      :key="index"
      :column="1"
      border
      :labelStyle="{width:'150px',textAlign:'center'}"
    >
      <template slot="extra">
        <el-button
          type="danger"
          size="small"
          @click="deleteCommand(index)"
        >删除</el-button>
      </template>
      <template v-if="item.name=='查询'">
        <el-alert class="mb-2">设置数量为-1时代表不应用 查询属性不设置则查询所有</el-alert>
        <el-descriptions-item label="结果赋值">
          <el-select
            v-model="item.target"
            value-key="id"
          >
            <el-option
              v-for="define in custom_define"
              :key="define.id"
              :label="define.name"
              :value="define"
            />
          </el-select>

        </el-descriptions-item>
        <el-descriptions-item label="查询表">
          <el-select
            v-model="item.table"
            value-key="id"
          >
            <el-option
              v-for="table in tables"
              :key="table.id"
              :label="`${table.comment}(${table.name})`"
              :value="table"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item label="查询方式">
          <el-select v-model="item.method">
            <el-option
              v-for="method in find_methods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="查询条件"
          v-if="item.table"
        >
          <el-button
            type="primary"
            size="small"
            @click="openEdit(item)"
          >条件编辑</el-button>
          <!-- 编辑的条件显示 -->
        </el-descriptions-item>
        <el-descriptions-item
          label="查询属性"
          v-if="item.table"
        >
          <el-select
            multiple
            v-model="item.attributes"
            value-key="name"
          >
            <el-option
              v-for="item,index in getAttributes(item)"
              :key="index"
              :label="item.comment"
              :value="item"
            />

          </el-select>
        </el-descriptions-item>
        <el-descriptions-item
          label="扁平化"
          v-if="item.attributes.length==1"
        >
          <el-checkbox v-model="item.flat" />
        </el-descriptions-item>
        <el-descriptions-item
          label="查询数量"
          v-if="item.method!='findOne'"
        >
          <el-input-number
            v-model.number="item.limit"
          ></el-input-number>
        </el-descriptions-item>
        <el-descriptions-item
          label="偏移量"
          v-if="item.method!='findOne'"
        >
          <el-input-number
            v-model.number="item.offset"
          ></el-input-number>
        </el-descriptions-item>
      </template>
    </el-descriptions>

    <el-popover
      placement="bottom"
      width="400"
      trigger="click"
    >
      <div>
        <el-button
          v-for="item in list"
          :key="item.type"
          :type="item.color"
          @click="addCommand(item.type)"
        >{{item.label}}</el-button>
      </div>
      <el-button
        slot="reference"
        class="full-width"
        type="primary"
      >数据库操作</el-button>
    </el-popover>
    <el-dialog
      :visible.sync="visible"
      title="条件编辑"
      append-to-body
      width="700px"
      :before-close="handleClose"
    >
      <el-button
        type="primary"
        size="small"
        @click="pushCondition"
      >添加条件</el-button>
      <el-table
        v-if="current_row"
        :data="current_row.where"
        height="50vh"
      >
        <el-table-column
          label="属性名称"
          #default="{row}"
        >
          <el-select
            v-model="row.name"
            @change="clear(row)"
            value-key="name"
          >
            <el-option
              v-for="item in getAttributes(current_row)"
              :key="item.name"
              :label="item.comment"
              :value="item"
            />
          </el-select>
        </el-table-column>
        <el-table-column
          label="比较符号"
          #default="{row}"
        >
          <el-select v-model="row.operate">
            <el-option
              v-for="item in calOperate(row)"
              :key="item"
              :label="item"
              :value="item"
            />

          </el-select>
        </el-table-column>
        <el-table-column
          label="使用定义对象"
          #default="{row}"
          align="center"
        >
          <el-checkbox v-model="row.useRef" />
        </el-table-column>
        <el-table-column
          label="比较值"
          #default="{row}"
        >
          <div v-if="!row.useRef">
            <el-radio-group
              v-model="row.compare"
              v-if="row.type=='BOOLEAN'"
            >
              <el-radio :label="true">true</el-radio>
              <el-radio :label="false">false</el-radio>
            </el-radio-group>
            <el-input
              v-else-if="['INTEGER','FLOAT','DECIMAL'].includes(row.type)"
              v-model.number="row.compare"
            />
            <el-input
              v-else
              v-model="row.compare"
            />
          </div>
          <el-select
            v-else
            v-model="row.compare"
            value-key="id"
          >
            <el-option
              v-for="item in defines"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-table-column>
        <el-table-column
          label="逻辑符"
          #default="{row}"
        >
          <el-select v-model="row.logic">
            <el-option
              v-for="item in check_type"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-table-column>
        <el-table-column
          label="操作"
          #default="{$index}"
        >
          <el-button
            type="danger"
            size="small"
            @click="deleteCondition($index)"
          >删除</el-button>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-form>
</template>

<script>
import mixin from "../mixin";
export default {
  mixins: [mixin],
  name: "databaseForm",
  data() {
    return {
      list: [
        { type: "select", label: "查询", color: "primary" },
        { type: "insert", label: "新增", color: "success" },
        { type: "update", label: "修改", color: "warning" },
        { type: "delete", label: "删除", color: "danger" },
      ],
      find_methods: [
        { label: "查找一个", value: "findOne" },
        { label: "查找多个", value: "findAll" },
      ],
      visible: false,
      current_row: null,
      operate: {
        0: "大于",
        1: "等于",
        2: "小于",
        3: "大于等于",
        4: "小于等于",
        5: "不等于",
        6: "包含",
      },
      check_type: ["与", "或"],
    };
  },
  computed: {
    data_tables() {
      return this.$store.state.data_tables;
    },
    tables() {
      let tables = this.data_tables
        .filter((x) => x.status == "存在")
        .map((x) => {
          return {
            id: x.id,
            comment: x.comment,
            name: x.name,
          };
        });
      return tables;
    },
    defines() {
      return this.$store.state.current_defines;
    },
    custom_define() {
      return this.defines.filter((x) => x.source == "define");
    },
  },
  methods: {
    calOperate(row) {
      let options = ["等于", "不等于"];
      switch (row.type) {
        case "STRING":
        case "TEXT":
          return options.concat(["包含", "不包含"]);
        case "DATE":
        case "INTEGER":
        case "FLOAT":
        case "DECIMAL":
          return options.concat(["大于", "大于等于", "小于", "小于等于"]);
        default:
          return options;
      }
    },
    openEdit(item) {
      this.current_row = item;
      this.visible = true;
    },
    getAttributes(row) {
      if (!row.table) return [];
      return [{ comment: "id", name: "id" }].concat(
        this.data_tables.find((x) => x.id == row.table.id).data
      );
    },
    addCommand(type) {
      this.setting.commands.push({
        table: "",
        type,
        ...this.createStruct(type),
      });
    },
    createStruct(type) {
      switch (type) {
        case "select":
          return {
            name: "查询",
            table: "",
            method: "findOne",
            where: [],
            offset: 1,
            limit: 10,
            attributes: [],
            target: "",
            flat: false,
          };
        case "insert":
          return {
            name: "插入",
            insert_data: [],
          };
        case "update":
          return {
            name: "更新",
            where: {},
            value: {},
          };
        case "delete":
          return {
            name: "删除",
            where: {},
          };
      }
    },
    deleteCommand(index) {
      this.setting.commands.splice(index, 1);
    },
    handleClose() {
      this.visible = false;
    },
    pushCondition() {
      this.current_row.where.push({
        name: "",
        operate: "等于",
        useRef: false,
        compare: "",
        logic: "与",
        type: "",
      });
    },
    deleteCondition(index) {
      this.current_row.where.splice(index, 1);
    },
    clear(row) {
      row.operate = "等于";
      row.useRef = false;
      row.logic = "与";
      row.type = row.name.type;
      if (row.type == "BOOLEAN") {
        row.compare = true;
      } else {
        row.compare = "";
      }
    },
  },
};
</script>
<style lang="scss" >
</style>