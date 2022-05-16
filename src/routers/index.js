/*
 * @Description: 路由文件
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 11:52:28
 * @LastEditTime: 2022-03-21 09:30:33
 * @LastEditors: wish.WuJunLong
 */
import { lazy, Suspense } from "react";

import BaseLayout from "../components/BaseLayout";

// 懒加载
const AirConfig = lazy(() => import("../page/AirConfig")); // 航司配置
const HoldConfig = lazy(() => import("../page/HoldConfig")); // 压位配置
const DescendInfo = lazy(() => import("../page/DescendInfo")); // 降舱动态
const HoldInfo = lazy(() => import("../page/HoldInfo")); // 压位动态
const LogsInfo = lazy(() => import("../page/LogsInfo")); // 日志查询
const OrderInfo = lazy(() => import("../page/OrderInfo")); // 日志查询
// const Login = lazy(() => import("../page/Login")); // 登陆页

// 实现懒加载的用Suspense包裹 定义函数
const lazyLoad = (children) => {
  return <Suspense fallback={<h1>页面载入中...</h1>}>{children}</Suspense>;
};

export const routers = [
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      {
        index: true,
        element: lazyLoad(<AirConfig />),
      },
      {
        path: "/orderInfo",
        element: lazyLoad(<OrderInfo />),
      },
      {
        path: "/descendInfo",
        element: lazyLoad(<DescendInfo />),
      },
      {
        path: "/holdConfig",
        element: lazyLoad(<HoldConfig />),
      },
      {
        path: "/holdInfo",
        element: lazyLoad(<HoldInfo />),
      },
      {
        path: "/logsInfo",
        element: lazyLoad(<LogsInfo />),
      },
    ],
  },
  // {
  //   path: "/login",
  //   element: lazyLoad(<Login />),
  // },
];
