/*
 * @Description:全局状态管理器
 * @Author: wish.WuJunLong
 * @Date: 2022-04-27 14:02:19
 * @LastEditTime: 2022-04-27 17:05:57
 * @LastEditors: wish.WuJunLong
 */

//引入
import { makeAutoObservable } from "mobx";

// 是否为H5页面配置
class H5Status {
  isH5 = false;
  constructor() {
    //定义this
    makeAutoObservable(this);
  }
  changeH5Status = (status) => {
    this.isH5 = status;
  };
}
// 实例化导出 （这里必须实例化导出，否则无法使用）
//这里注意大小写，导出的是小写的
const h5Status = new H5Status();
export { h5Status };
