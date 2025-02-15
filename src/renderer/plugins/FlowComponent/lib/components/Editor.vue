<!--
 * @Author: 羊驼
 * @Date: 2023-04-27 11:47:24
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-10 10:47:01
 * @Description: 节点编辑器
-->
<template>
  <el-drawer
    :visible.sync="approverDrawer"
    custom-class="set_promoter"
    append-to-body
    direction="rtl"
    :before-close="saveData"
    :size="size"
  >
    <template v-if="approverConfig">
      <div
        slot="title"
        class="title flex"
      >
        <span v-if="!titleInputFlag">{{ nodeName }}</span>
        <el-input
          maxlength="20"
          autofocus
          v-else
          v-model="nodeName"
          placeholder=""
        ></el-input>
        <!-- 默认条件不需编辑 -->
        <el-button
          class="el-icon-edit edit_button"
          type="text"
          @click="clickEdit"
        ></el-button>
      </div>

      <div>
        <component
          :is="getFormComponent"
          v-model="approverConfig"
          :defaultApprovalDrawer="defaultApprovalDrawer"
        />
      </div>

      <div class="set_promoter_footer flex">
        <!-- 默认条件弹框只展示关闭按钮 -->
        <div v-if="defaultApprovalDrawer">
          <el-button
            type="primary"
            @click="approverDrawer = false"
          >关闭</el-button>
        </div>
        <div
          class="flex"
          v-else
        >
          <el-button
            type="primary"
            @click="saveApprover"
          >确定</el-button>
          <el-button @click="approverDrawer = false">取消</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script>
export default {
  inject: ["findNode"],
  props: {
    size: {
      type: String,
      default: "500px",
    },
  },
  computed: {
    // 获取表单组件
    getFormComponent() {
      if (!this.approverConfig) return;
      return this.$factory.getFormComponentName(this.approverConfig.type);
    },
    // 默认条件表单
    defaultApprovalDrawer() {
      return this.approverConfig.nodeName == "默认";
    },
  },
  data() {
    return {
      approverDrawer: false, //审批弹框
      //审批弹框字段Obj
      approverConfig: {},
      // 处理节点名称更改的标志位
      titleInputFlag: false,
      // 更改的节点名称
      nodeName: "",
    };
  },
  methods: {
    // 显示input框 以及校验输入
    clickEdit() {
      this.titleInputFlag = !this.titleInputFlag;
      if (!this.titleInputFlag && this.nodeName == "默认") {
        this.nodeName = this.approverConfig.nodeName;
        this.titleInputFlag = true;
        return this.$message.error("不能取名为默认");
      }
    },
    //审批人抄送人显示和校验
    setApproverStr() {
      return this.$factory.getTypeTextHandle(
        this.approverConfig.type,
        this.approverConfig
      );
    },
    getBeforeSave() {
      return this.$factory.getTypeBeforeSave(
        this.approverConfig.type,
        this.approverConfig
      );
    },
    //保存弹框设置
    saveApprover() {
      this.approverDrawer = false;
      this.saveData();
    },
    saveData() {
      this.approverConfig.error = !this.getBeforeSave();
      let node = this.findNode(this.approverConfig.nodeId);
      if (!node) {
        throw Error("无效节点对象");
      }
      for (let kv in this.approverConfig) {
        if (
          [
            "nodeName",
            "nodeId",
            "childNode",
            "type",
            "fatherID",
            "conditionNodes",
            "level",
          ].includes(kv)
        )
          continue;
        node[kv] = this.approverConfig[kv];
      }
      node.nodeName = this.nodeName;
      this.approverDrawer = false;
    },
    //打开弹框
    openDrawer(data) {
      this.approverDrawer = true;
      this.titleInputFlag = false;
      // 默认条件
      this.approverConfig = JSON.parse(JSON.stringify(data));
      this.nodeName = this.approverConfig.nodeName;
      this.$factory.getEditorOpenHandle(
        this.approverConfig.type,
        this.approverConfig
      );
    },
  },
};
</script>