<!--
 * @Author: 羊驼
 * @Date: 2024-05-22 16:10:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-10 10:47:49
 * @Description: file content
-->
<template>
  <el-form
    class="yt-form"
    label-position="top"
  >
    <el-table :data="setting.define">
      <el-table-column
        label="值名称"
        #default="{row}"
      >
        <el-input
          v-model="row.key"
          @change="checkKey"
        />
      </el-table-column>
      <el-table-column
        label="值类型"
        #default="{row}"
      >
        <el-select
          v-model="row.type"
          @change="row.default=''"
        >
          <el-option
            v-for="item in ['string','number','object']"
            :key="item"
            :label="item"
            :value="item"
          />

        </el-select>
      </el-table-column>
      <el-table-column
        label="默认值"
        #default="{row}"
      >
        <el-input
          v-model="row.default"
          v-if="row.type=='string'"
        />
        <el-input
          v-model="row.default"
          v-if="row.type=='number'"
        />
      </el-table-column>
      <el-table-column
        label="操作"
        #default="{$index}"
      >
        <el-button
          type="danger"
          size="mini"
          @click="deleteDefine($index)"
        >删除</el-button>
      </el-table-column>
    </el-table>
    <el-button
      type="primary"
      class="full-width"
      @click="pushDefine"
    >新增定义</el-button>

  </el-form>
</template>

<script>
import mixin from "../mixin";
export default {
  mixins: [mixin],
  inject: ["getFlatRoot"],
  name: "startForm",
  methods: {
    pushDefine() {
      this.setting.define.push({
        key: "",
        default: "",
        type: "string",
      });
    },
    deleteDefine(index) {
      // 检测使用的依赖
      this.setting.define.splice(index, 1);
    },
    checkKey(value) {
      let exist = false;
      for (let item of this.setting.define) {
        if (item.key == value) {
          if (exist) {
            item.key = "";
            return this.$message.error("该key值重复使用");
          }
          exist = true;
        }
      }
    },
  },
};
</script>
<style lang="scss" >
.yt-form .full-width {
  width: 100% !important;
}
</style>