/*
 * @Description: 压位动态页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-18 09:58:37
 * @LastEditTime: 2022-05-11 09:28:01
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import {
  PageHeader,
  Table,
  Form,
  Input,
  Modal,
  Typography,
  Select,
} from "antd";

import axios from "../api";

import BaseSearch from "../components/BaseSearch";
import BasePagination from "../components/BasePagination";

import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const { Column } = Table;
const { Text } = Typography;
const { Option } = Select;

function HoldInfo(props) {
  let propsText = "`expiration`>now()";
  if (props.data) {
    let propsData = props.data;
    propsText += " AND ";

    if (props.type && props.type === "order") {
      // 订单列表传参
      propsText +=
        "`dep_code`='" +
        propsData.dep_code +
        "' AND `arr_code`='" +
        propsData.arr_code +
        "' AND `dep_time`='" +
        propsData.dep_time +
        "' AND `first_flight`='" +
        propsData.first_flight +
        "' AND `price`<'" +
        propsData.push_price_total +
        "'";
    } else {
      propsText +=
        "`air_code`='" +
        propsData.air_code +
        "' AND `dep_code`='" +
        propsData.dep_code +
        "' AND `arr_code`='" +
        propsData.arr_code +
        "'";
    }
  }
  const [dataConfig, setDataConfig] = useState({
    searchText: propsText,
    page: 1,
    pageSize: 20,
  }); // 原始数据
  const [dataList, setDataList] = useState([]); // 数据列表
  const [dataListLoading, setDataListLoading] = useState(false); // 数据列表加载

  const [rowClassName, setRowClassName] = useState(""); // 选中table行

  useEffect(() => {
    getDataList(); //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataConfig]);

  // 获取数据列表
  function getDataList() {
    setDataListLoading(true);
    let data = {
      table: "info_hold",
      page: dataConfig.page,
      size: dataConfig.pageSize,
      where: dataConfig.searchText,
    };
    axios
      .get("/curd/curd.do", { params: data })
      .then((res) => {
        setDataListLoading(false);
        if (res.status === 0) {
          let newList = [];
          res.data.content &&
            res.data.content.forEach((item, index) => {
              item["key"] = index;
              newList.push(item);
            });
          setDataList({
            data: newList,
            count: res.data.count,
          });
          // 判断当页面无数据且分页器不为第一页时返回第一页
          if (!res.data.content && dataConfig.page !== 1) {
            return changePage(1, 10);
          }
        }
      })
      .catch((err) => {
        setDataListLoading(false);
      });
  }

  // 数据筛选
  const onSearch = (val) => {
    let searchText = val.air_code ? "`air_code`='" + val.air_code + "'" : "";
    if (val.pnr) {
      searchText += (searchText ? " AND " : "") + "`pnr`='" + val.pnr + "'";
    }
    if (val.other_code) {
      searchText +=
        (searchText ? " AND " : "") + "`other_code`='" + val.other_code + "'";
    }
    if (val.expiration === 1) {
      searchText += (searchText ? " AND " : "") + "`expiration`>now()";
    }

    setDataConfig({ ...dataConfig, page: 1, searchText: searchText });
  };

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page: page, pageSize: pageSize });
  };

  // 打开会话信息弹窗
  const openSessionMessage = (text) => {
    Modal.info({
      width: 600,
      maskClosable: true,
      destroyOnClose: true,
      centered: true,
      content: text,
      icon: null,
      bodyStyle: { overflow: "auto" },
      okText: "关闭",
    });
  };

  const searchDom = (
    <>
      <Form.Item label="航司代码" name="air_code">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="PNR" name="pnr">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="外部订单号" name="other_code">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="PNR是否过期" name="expiration" initialValue={1}>
        <Select
          style={{
            minWidth: 200,
            width: "100%",
            textAlign: "left",
          }}
        >
          <Option value={0}>全部数据</Option>
          <Option value={1}>未过期数据</Option>
        </Select>
      </Form.Item>
    </>
  );

  return (
    <div className="config_page">
      <PageHeader className="config_page_header" title="压位动态" />

      <BaseSearch
        dom={searchDom}
        loading={dataListLoading}
        search={onSearch}
      ></BaseSearch>

      <Table
        dataSource={dataList.data}
        size="small"
        scroll={{ x: 2300, y: "calc(100% - 35px)" }}
        pagination={false}
        loading={dataListLoading}
        onRow={(record) => {
          return {
            onClick: () => {
              setRowClassName(record.key);
            },
          };
        }}
        rowClassName={(record) => {
          return record.key === rowClassName ? "select_table_row" : "";
        }}
      >
        <Column title="航司代码" dataIndex="air_code" width={100} />
        <Column title="PNR" dataIndex="pnr" width={100} />
        <Column
          title="订单状态"
          width={100}
          dataIndex="status"
          render={(text) => (
            <span
              style={{
                color:
                  text === "0" ? "#faad14" : text === "1" ? "#d48806" : "#000",
              }}
            >
              {text === "0"
                ? "已占位"
                : text === "1"
                ? "已释放"
                : text === "2"
                ? "释放失败"
                : text}
            </span>
          )}
        />
        <Column
          title="乘客姓名"
          render={(render) => `${render.first_name} ${render.last_name}`}
        />
        <Column title="外部订单号" dataIndex="other_code" width={120} />
        <Column
          title="PNR过期时间"
          dataIndex="expiration"
          width={150}
          sorter={(a, b) => {
            let aTime = new Date(a.expiration).getTime();
            let bTime = new Date(b.expiration).getTime();
            return aTime - bTime;
          }}
        />
        <Column title="出发机场" dataIndex="dep_code" width={100} />
        <Column title="到达机场" dataIndex="arr_code" width={100} />
        <Column
          title="起飞时间"
          dataIndex="dep_time"
          width={150}
          sorter={(a, b) => {
            let aTime = new Date(a.dep_time).getTime();
            let bTime = new Date(b.dep_time).getTime();
            return aTime - bTime;
          }}
        />
        <Column title="首飞航班号" dataIndex="first_flight" width={120} />
        <Column
          title="航班号代码"
          dataIndex="flight_code"
          render={(text) =>
            text.length > 30 ? (
              <Text
                code
                style={{ cursor: "pointer" }}
                onClick={() => openSessionMessage(text)}
              >
                {text.substring(0, 25) + "..."}
              </Text>
            ) : (
              text
            )
          }
          width={250}
        />
        <Column
          title="基础运价代码"
          dataIndex="face_base"
          render={(text) =>
            text.length > 30 ? (
              <Text
                code
                style={{ cursor: "pointer" }}
                onClick={() => openSessionMessage(text)}
              >
                {text.substring(0, 25) + "..."}
              </Text>
            ) : (
              text
            )
          }
          width={250}
        />
        <Column title="票价" dataIndex="price" width={100} />
        <Column title="联系电话" dataIndex="phone" width={150} />
        <Column title="联系邮箱" dataIndex="email" />
        <Column
          title="创建订单时间"
          dataIndex="create_time"
          width={150}
          sorter={(a, b) => {
            let aTime = new Date(a.create_time).getTime();
            let bTime = new Date(b.create_time).getTime();
            return aTime - bTime;
          }}
        />
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>
    </div>
  );
}

export default HoldInfo;
