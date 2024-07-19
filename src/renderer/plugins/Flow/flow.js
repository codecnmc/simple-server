/*
 * @Author: 羊驼
 * @Date: 2024-05-23 09:24:18
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-06-21 15:36:24
 * @Description: file content
 */
import Vue from "vue";
import WorkFlow from "../FlowComponent/lib/index";
import Start from "./Start";
import Result from "./Result";

import Database from "./Database";
Vue.use(WorkFlow, {
  custom: [Start, Result, Database],
});
