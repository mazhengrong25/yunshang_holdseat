/*
 * @Description: 降舱动态页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-18 09:58:28
 * @LastEditTime: 2022-05-11 09:11:00
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import {
  PageHeader,
  Table,
  Form,
  Input,
  Typography,
  Modal,
  message,
} from "antd";

import axios from "../api";

import JsonView from "react-json-view";

import BaseSearch from "../components/BaseSearch";
import BasePagination from "../components/BasePagination";

import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const { Column } = Table;
const { Text } = Typography;

function DescendInfo(props) {
  let propsText;
  if (props.data && !propsText) {
    let propsData = props.data;
    propsText = "`order_id`='" + propsData.order_id + "'";
  }
  const [dataConfig, setDataConfig] = useState({
    searchText: propsText ? propsText : "",
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
      table: "info_descend",
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
    let searchText = val.order_id ? "`order_id`='" + val.order_id + "'" : "";
    if (val.pnr) {
      searchText += (searchText ? " AND " : "") + "`pnr`='" + val.pnr + "'";
    }
    if (val.other_code) {
      searchText +=
        (searchText ? " AND " : "") + "`other_code`='" + val.other_code + "'";
    }

    setDataConfig({ ...dataConfig, page: 1, searchText: searchText });
  };

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page: page, pageSize: pageSize });
  };

  // 打开会话信息弹窗
  const openSessionMessage = (text) => {
    let modalData;
    let modalWidth = 600;
    try {
      if (typeof JSON.parse(text) == "object") {
        modalWidth = 900;
        modalData = (
          <JsonView
            src={JSON.parse(text)}
            iconStyle="square"
            collapsed={2}
            collapseStringsAfterLength
            enableClipboard={() => message.success("复制内容到粘贴板")}
          />
        );
      } else {
        modalData = text;
      }
    } catch (e) {
      modalData = text;
    }

    Modal.info({
      width: modalWidth,
      maskClosable: true,
      destroyOnClose: true,
      centered: true,
      content: modalData,
      icon: null,
      bodyStyle: { overflow: "auto" },
      okText: "关闭",
    });
  };

  const searchDom = (
    <>
      <Form.Item label="订单ID" name="order_id">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="PNR" name="pnr">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="外部订单号" name="other_code">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
    </>
  );

  return (
    <div className="config_page">
      <PageHeader className="config_page_header" title="降舱动态" />

      <BaseSearch
        dom={searchDom}
        loading={dataListLoading}
        search={onSearch}
      ></BaseSearch>

      <Table
        dataSource={dataList.data}
        size="small"
        scroll={{ x: 2000, y: "calc(100% - 35px)" }}
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
        <Column title="订单ID" dataIndex="order_id" width={300} />
        <Column title="PNR" dataIndex="pnr" width={100} />
        <Column
          title="订单状态"
          width={100}
          dataIndex="status"
          render={(text) => (
            <span
              style={{
                color:
                  text === "0"
                    ? "#faad14"
                    : text === "1"
                    ? "#d48806"
                    : text === "2"
                    ? "#52c41a"
                    : text === "3"
                    ? "#1890ff"
                    : text === "4"
                    ? "#ff4d4f"
                    : text === "5"
                    ? "#ff4d4f"
                    : text === "6"
                    ? "#ff4d4f"
                    : text === "7"
                    ? "#999"
                    : "#000",
              }}
            >
              {text === "0"
                ? "已占位"
                : text === "1"
                ? "已释放"
                : text === "2"
                ? "已支付"
                : text === "3"
                ? "已出票"
                : text === "4"
                ? "出票失败"
                : text === "5"
                ? "释放压位失败"
                : text === "6"
                ? "支付失败"
                : text === "7"
                ? "已过期"
                : text}
            </span>
          )}
        />
        <Column title="外部订单号" dataIndex="other_code" ellipsis />
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
        <Column title="单价" dataIndex="price_total" width={100} />
        <Column
          title="价格明细"
          dataIndex="price_detail"
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
          title="创建订单时间"
          dataIndex="create_time"
          width={150}
          sorter={(a, b) => {
            let aTime = new Date(a.create_time).getTime();
            let bTime = new Date(b.create_time).getTime();
            return aTime - bTime;
          }}
        />
        <Column
          title="支付时间"
          dataIndex="pay_time"
          width={150}
          sorter={(a, b) => {
            let aTime = new Date(a.pay_time).getTime();
            let bTime = new Date(b.pay_time).getTime();
            return aTime - bTime;
          }}
        />
        <Column
          title="支付响应记录"
          dataIndex="pay_res"
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
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>

    </div>
  );
}

export default DescendInfo;
