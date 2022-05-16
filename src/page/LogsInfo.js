/*
 * @Description: 日志查询页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-18 09:58:45
 * @LastEditTime: 2022-05-10 18:14:24
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import {
  PageHeader,
  Table,
  Form,
  Input,
  Typography,
  Select,
  DatePicker,
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
const { RangePicker } = DatePicker;

function LogsInfo() {
  const [dataConfig, setDataConfig] = useState({
    searchText: "",
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
      table: "info_logs",
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
    let searchText = "";
    if (val.module) {
      searchText +=
        (searchText ? " AND " : "") + "`module`='" + val.module + "'";
    }
    if (val.level) {
      searchText += (searchText ? " AND " : "") + "`level`='" + val.level + "'";
    }
    if (val.message) {
      searchText +=
        (searchText ? " AND " : "") + "`message` LIKE '%" + val.message + "%'";
    }
    if (val.time) {
      searchText +=
        (searchText ? " AND " : "") +
        "`time` BETWEEN '" +
        moment(val.time[0]).format("yyyy-MM-DD HH:mm:00") +
        "'AND'" +
        moment(val.time[1]).format("yyyy-MM-DD HH:mm:00") +
        "'";
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
      <Form.Item label="模块名称" name="module">
        <Select
          placeholder="请选择"
          style={{ minWidth: 200, width: "100%", textAlign: "left" }}
          allowClear
        >
          <Select.Option value="查询数据">查询数据</Select.Option>
          <Select.Option value="添加数据">添加数据</Select.Option>
          <Select.Option value="更新数据">更新数据</Select.Option>
          <Select.Option value="删除数据">删除数据</Select.Option>
          <Select.Option value="OTA通知">OTA通知</Select.Option>
          <Select.Option value="同步生单">同步生单</Select.Option>
          <Select.Option value="压位降舱">压位降舱</Select.Option>
          <Select.Option value="自动压位">自动压位</Select.Option>
          <Select.Option value="直接支付">直接支付</Select.Option>
          <Select.Option value="NK生单">NK生单</Select.Option>
          <Select.Option value="NK支付">NK支付</Select.Option>
          <Select.Option value="NK回填">NK回填</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="日志等级" name="level">
        <Select
          placeholder="请选择"
          style={{ minWidth: 200, width: "100%", textAlign: "left" }}
          allowClear
        >
          <Select.Option value="info">Info</Select.Option>
          <Select.Option value="warn">Warn</Select.Option>
          <Select.Option value="error">Error</Select.Option>
          <Select.Option value="fatal">Fatal</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="日志内容" name="message">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="时间范围" name="time">
        <RangePicker
          inputReadOnly
          style={{ minWidth: 366, width: "100%", textAlign: "left" }}
          showTime
          format="YYYY-MM-DD HH:mm"
        />
      </Form.Item>
    </>
  );

  return (
    <div className="config_page">
      <PageHeader className="config_page_header" title="日志查询" />

      <BaseSearch
        dom={searchDom}
        loading={dataListLoading}
        search={onSearch}
      ></BaseSearch>

      <Table
        dataSource={dataList.data}
        size="small"
        scroll={{ x: 1200, y: "calc(100% - 35px)" }}
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
        <Column title="日志ID" dataIndex="biz_id" width={40} />
        <Column title="模块名称" dataIndex="module" width={60} />
        <Column
          title="日志等级"
          dataIndex="level"
          width={50}
          render={(text) => (
            <>
              {text === "info" ? (
                <Text type="success">Info</Text>
              ) : text === "warn" ? (
                <Text type="warning">Warn</Text>
              ) : text === "error" ? (
                <Text type="danger">Error</Text>
              ) : text === "fatal" ? (
                <Text disabled>Fatal</Text>
              ) : (
                text
              )}
            </>
          )}
        />
        <Column
          title="日志内容"
          dataIndex="message"
          ellipsis={{ showTitle: false }}
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
          width={180}
        />
        <Column
          title="日志记录时间"
          dataIndex="time"
          width={100}
          sorter={(a, b) => {
            let aTime = new Date(a.time).getTime();
            let bTime = new Date(b.time).getTime();
            return aTime - bTime;
          }}
        />
        <Column title="扩展字段" dataIndex="exts" width={260} ellipsis />
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>

    </div>
  );
}

export default LogsInfo;
