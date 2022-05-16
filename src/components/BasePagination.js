/*
 * @Description: 公用分页器 兼容H5
    count 总数
    dataConfig：{pageSize 页数 page 页码} 分页器数据
    function changePage 修改分页方法
 * @Author: wish.WuJunLong
 * @Date: 2022-05-11 09:13:24
 * @LastEditTime: 2022-05-11 09:21:29
 * @LastEditors: wish.WuJunLong
 */
import React from "react";

import { Pagination } from "antd";

import { h5Status } from "../store";
import { observer } from "mobx-react-lite";

function BasePagination(props) {
  return (
    <div className="config_pagination">
      <Pagination
        size={h5Status.isH5 ? "default" : "small"}
        simple={h5Status.isH5}
        total={props.count}
        showTotal={(total) => `共 ${total} 条数据`}
        showSizeChanger
        defaultPageSize={20}
        pageSize={props.dataConfig.pageSize}
        current={props.dataConfig.page}
        onChange={props.changePage}
      />
    </div>
  );
}

export default observer(BasePagination);
