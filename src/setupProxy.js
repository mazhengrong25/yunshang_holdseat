/*
 * @Description: 
 * @Author: wish.WuJunLong
 * @Date: 2022-04-26 18:07:33
 * @LastEditTime: 2022-04-29 15:53:58
 * @LastEditors: wish.WuJunLong
 */
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(createProxyMiddleware('/curd', {
    target: 'http://47.89.249.27:12026',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/curd": "/curd"
    }
  }))
}