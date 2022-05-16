/*
 * @Description: axios 封装
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 16:24:37
 * @LastEditTime: 2022-05-09 14:02:44
 * @LastEditors: wish.WuJunLong
 */
import axios from "axios";

import { message, Modal } from "antd";

import eventBus from "../utils/eventBus";

// if (process.env.NODE_ENV === "production") {
  // axios.defaults.baseURL = "http://47.89.249.27:12026";
// }

axios.defaults.timeout = 180000;

// 取消请求操作
const allPendingRequestsRecord = [];
const pending = {};
const removeAllPendingRequestsRecord = () => {
  allPendingRequestsRecord &&
    allPendingRequestsRecord.forEach((func) => {
      // 取消请求（调用函数就是取消该请求）
      func("路由跳转了取消所有请求");
    });
  // 移除所有记录
  allPendingRequestsRecord.splice(0);
};

// 取消同一个重复的ajax请求
const removePending = (key, isRequest = false) => {
  if (pending[key] && isRequest) {
    pending[key]("取消重复请求");
  }
  delete pending[key];
};

// 取消所有请求的函数
export const getConfirmation = (mes = "", callback = () => {}) => {
  removeAllPendingRequestsRecord();
  callback();
};

// http request 拦截器
axios.interceptors.request.use(
  (config) => {
    // 在请求发送前执行一下取消操作，防止连续点击重复发送请求(例如连续点击2次按钮)
    let reqData = "";
    // 处理如url相同请求参数不同时上一个请求被屏蔽的情况
    if (config.method === "get") {
      reqData = config.url + config.method + JSON.stringify(config.params);
    } else {
      reqData = config.url + config.method + JSON.stringify(config.data);
    }
    // 如果用户连续点击某个按钮会发起多个相同的请求，可以在这里进行拦截请求并取消上一个重复的请求
    removePending(reqData, true);
    // 设置请求的 cancelToken（设置后就能中途控制取消了）
    config.cancelToken = new axios.CancelToken((c) => {
      pending[reqData] = c;
      allPendingRequestsRecord.push(c);
    });

    // application/x-www-form-urlencoded
    if (config.resType === "form") {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = JSON.stringify(config.data);
      return config;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// http response 拦截器
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (err) => {
    if (axios.isCancel(err)) {
      return new Promise(() => {});
    }
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = "请求错误(400)";
          break;
        case 401:
          eventBus.emit("emit", true);
          err.message = "未授权，请重新登录(401)";
          break;
        case 403:
          err.message = "拒绝访问(403)";
          break;
        case 404:
          err.message = "请求出错(404)";
          break;
        case 408:
          err.message = "请求超时(408)";
          break;
        case 500:
          err.message = "服务器错误(500)";
          Modal.destroyAll();
          Modal.error({
            centered: true,
            title: "服务器错误(500)",
            content: "无法获取数据，请联系管理员",
          });
          break;
        case 501:
          err.message = "服务未实现(501)";
          break;
        case 502:
          err.message = "网络错误(502)";
          break;
        case 503:
          err.message = "服务不可用(503)";
          break;
        case 504:
          err.message = "网络超时(504)";
          break;
        case 505:
          err.message = "HTTP版本不受支持(505)";
          break;
        default:
          err.message = `连接出错(${err.response.status})!`;
      }
    } else {
      err.message = "连接服务器失败!";
    }
    message.error(err.message);
    return Promise.reject(err);
  }
);

export default axios;
