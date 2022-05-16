/*
 * @Description: 主页面模块
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 09:36:15
 * @LastEditTime: 2022-03-18 15:20:07
 * @LastEditors: wish.WuJunLong
 */
import { useRoutes } from "react-router-dom";
import "./App.scss";
import { routers } from "./routers/index";

import { getConfirmation } from "./api";

function App() {
  // 切换路由调用中断请求接口
  getConfirmation();
  return useRoutes(routers);
}

export default App;
