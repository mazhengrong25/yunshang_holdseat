/*
 * @Description: 入口页
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 09:36:15
 * @LastEditTime: 2022-04-27 14:12:47
 * @LastEditors: wish.WuJunLong
 */
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Router>
      <App />
    </Router>
  </ConfigProvider>,
  document.getElementById("root")
);
