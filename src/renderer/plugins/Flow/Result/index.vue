<!--
 * @Author: 羊驼
 * @Date: 2024-05-22 16:10:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 14:05:52
 * @Description: file content
-->
<template>
  <el-form
    class="yt-form"
    label-position="top"
  >
    <el-form-item label="以结构的形式返回（此时返回的状态不影响接口的状态）">
      <el-swtich v-model="setting.tradtion" />
    </el-form-item>
    <el-form-item label="返回状态">
      <el-input v-model.number="setting.status" />
    </el-form-item>
    <el-form-item label="返回值">
      <el-select
        v-model="setting.custom"
        @change="changeReturn"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="自定义返回值"
      v-if="setting.custom=='input'"
    >
      <el-input v-model="setting.value" />
    </el-form-item>
    <el-form-item
      label="返回定义"
      v-if="setting.custom=='params'"
    >
      <el-select
        v-model="setting.value"
        value-key="id"
      >
        <el-option
          v-for="item in defines"
          :key="item.id"
          :label="item.name"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import mixin from "../mixin";
export default {
  mixins: [mixin],
  inject: ["getFlatRoot"],
  name: "resultForm",
  data() {
    return {
      options: [
        { label: "不返回", value: "null" },
        { label: "自定义输入", value: "input" },
        { label: "返回定义", value: "params" },
      ],
    };
  },
  computed: {
    defines() {
      return this.$store.state.current_defines;
    },
  },
  methods: {
    changeReturn() {
      this.setting.value = "";
    },
  },
};
</script>
<style lang="scss" >
.yt-form .full-width {
  width: 100% !important;
}
</style>