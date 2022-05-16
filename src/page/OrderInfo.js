/*
 * @Description: 订单列表页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-18 09:58:53
 * @LastEditTime: 2022-05-11 09:27:33
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import {
  PageHeader,
  Button,
  Table,
  Form,
  Input,
  DatePicker,
  Modal,
  Typography,
  message,
  Tooltip,
  Select,
  Space,
} from "antd";

import {
  ExclamationCircleOutlined,
  RollbackOutlined,
  FallOutlined,
  LogoutOutlined,
  TransactionOutlined,
} from "@ant-design/icons";

import axios from "../api";

import DescendInfo from "./DescendInfo"; // 降舱信息
import HoldInfo from "./HoldInfo"; // 压位信息

import JsonView from "react-json-view";

import { h5Status } from "../store";
import { observer } from "mobx-react-lite";

import { accMul, accAdd } from "../utils/Tools";

import BaseSearch from "../components/BaseSearch";
import BasePagination from "../components/BasePagination";

import moment from "moment";
import "moment/locale/zh-cn";

const { Column } = Table;
const { Text } = Typography;
const { Option } = Select;

moment.locale("zh-cn");

function OrderInfo() {
  const [dataConfig, setDataConfig] = useState({
    searchText: "",
    page: 1,
    pageSize: 20,
  }); // 原始数据
  const [dataList, setDataList] = useState([]); // 数据列表
  const [dataListLoading, setDataListLoading] = useState(false); // 数据列表加载

  const [infoData, setInfoData] = useState({}); // 详情数据
  const [infoModal, setInfoModal] = useState(false); // 详情弹窗

  const [payModal, setPayModal] = useState(false); // 支付弹窗
  const [payMessage, setPayMessage] = useState({}); // 支付信息
  const [payLoading, setPayLoading] = useState(false); // 支付按钮加载

  const [rowClassName, setRowClassName] = useState(""); // 选中table行

  const [submitMessageModal, setSubmitMessageModal] = useState(""); // 弹窗状态

  useEffect(() => {
    getDataList(); //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataConfig]);

  // 获取数据列表
  function getDataList() {
    setDataListLoading(true);
    let data = {
      table: "info_order",
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
    if (val.air_code) {
      searchText +=
        (searchText ? " AND " : "") + "`air_code`='" + val.air_code + "'";
    }
    if (val.dep_code) {
      searchText +=
        (searchText ? " AND " : "") + "`dep_code`='" + val.dep_code + "'";
    }
    if (val.arr_code) {
      searchText +=
        (searchText ? " AND " : "") + "`arr_code`='" + val.arr_code + "'";
    }
    if (val.dep_time) {
      searchText +=
        (searchText ? " AND " : "") +
        "`dep_time`='" +
        moment(val.dep_time).format("yyyy-MM-DD HH:mm:00") +
        "'";
    }
    if (val.first_flight) {
      searchText +=
        (searchText ? " AND " : "") +
        "`first_flight`='" +
        val.first_flight +
        "'";
    }
    if (val.first_name) {
      searchText +=
        (searchText ? " AND " : "") + "`first_name`='" + val.first_name + "'";
    }
    if (val.last_name) {
      searchText +=
        (searchText ? " AND " : "") + "`last_name`='" + val.last_name + "'";
    }
    if (val.init_pnr) {
      searchText +=
        (searchText ? " AND " : "") + "`init_pnr`='" + val.init_pnr + "'";
    }
    if (val.status) {
      searchText +=
        (searchText ? " AND " : "") + "`status`='" + val.status + "'";
    }
    setDataConfig({ ...dataConfig, page: 1, searchText: searchText });
  };

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page: page, pageSize: pageSize });
  };

  // 前往降舱信息详情
  const openViewDetail = (val, type) => {
    switch (type) {
      case 1:
        // 降舱
        setInfoData({
          dom: (
            <DescendInfo
              data={{
                order_id: val.order_id,
              }}
            />
          ),
          type,
        });
        break;
      case 2:
        // 压位
        setInfoData({
          dom: <HoldInfo data={val} type="order" />,
          type,
        });

        break;

      default:
        setInfoData();
        break;
    }

    setInfoModal(true);
  };

  // 打开请求数据弹窗
  const openSessionMessage = (text) => {
    Modal.info({
      width: 1000,
      maskClosable: true,
      destroyOnClose: true,
      centered: true,
      content: text ? (
        <JsonView
          src={JSON.parse(text)}
          iconStyle="square"
          collapsed={2}
          collapseStringsAfterLength
          enableClipboard={() => message.success("复制内容到粘贴板")}
        />
      ) : (
        text
      ),
      icon: null,
      okText: "关闭",
    });
  };

  const openPayModal = (val) => {
    setPayModal(true);
    setPayMessage(val);
    setSubmitMessageModal("payOrder");
  };

  // 重新生单按钮
  const returnOrderBtn = (val) => {
    setPayModal(true);
    setPayMessage(val);
    setSubmitMessageModal("returnOrder");
  };

  // 支付按钮
  const submitPay = () => {
    setPayLoading(true);
    let data = {
      air_code: payMessage.air_code,
      top_order: payMessage.top_order_id,
      pnr: payMessage.init_pnr,
      first_flight: payMessage.first_flight,
      dep_time: payMessage.dep_time,
      field:
        submitMessageModal === "payOrder"
          ? "3"
          : submitMessageModal === "returnOrder"
          ? "4"
          : "",
      data: "",
    };

    axios
      .post("/curd/upota.do", data)
      .then((res) => {
        setPayLoading(false);
        getDataList();
        if (res.status === 0) {
          setPayModal(false);
          message.success(res.message);
        } else {
          message.warning(res.message);
        }
      })
      .catch((err) => {
        setPayLoading(false);
      });
  };

  // 统计总价
  const getPageTotalPrice = (pageData) => {
    // head_count 人数
    // push_price_total 进单采购单价
    // pop_price_total 出票采购总价
    let totalPushPrice = 0;
    let totalPopPrice = 0;
    pageData.forEach(({ head_count, push_price_total, pop_price_total }) => {
      totalPushPrice = accAdd(
        totalPushPrice,
        accMul(head_count, push_price_total)
      );
      totalPopPrice = accAdd(totalPopPrice, pop_price_total);
    });
    return {
      totalPushPrice,
      totalPopPrice,
    };
  };

  const searchDom = (
    <>
      <Form.Item label="订单ID" name="order_id">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="初始PNR" name="init_pnr">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="订单状态" name="status">
        <Select
          allowClear
          style={{ minWidth: 200, width: "100%", textAlign: "left" }}
          placeholder="请选择"
        >
          <Option value="0">待支付</Option>
          <Option value="1">已付款未出票</Option>
          <Option value="2">取消</Option>
          <Option value="3">已出票</Option>
          <Option value="4">支付失败</Option>
        </Select>
      </Form.Item>
      <Form.Item label="航司代码" name="air_code">
        <Input allowClear placeholder="请输入" maxLength={2} />
      </Form.Item>
      <Form.Item label="出发机场" name="dep_code">
        <Input allowClear placeholder="请输入" maxLength={3} />
      </Form.Item>
      <Form.Item label="到达机场" name="arr_code">
        <Input allowClear placeholder="请输入" maxLength={3} />
      </Form.Item>
      <Form.Item label="起飞时间" name="dep_time">
        <DatePicker
          inputReadOnly
          style={{ minWidth: 200, width: "100%" }}
          placeholder="请选择"
          showTime
          format="YYYY-MM-DD HH:mm"
        />
      </Form.Item>
      <Form.Item label="首飞航班" name="first_flight">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="主乘客名" name="first_name">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
      <Form.Item label="主乘客姓" name="last_name">
        <Input allowClear placeholder="请输入" />
      </Form.Item>
    </>
  );

  return (
    <div className="config_page order_info">
      <PageHeader className="config_page_header" title="订单列表" />

      <BaseSearch
        dom={searchDom}
        loading={dataListLoading}
        search={onSearch}
      ></BaseSearch>

      <Table
        dataSource={dataList.data}
        size="small"
        scroll={{ x: 3980, y: "calc(100% - 80px)" }}
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
        summary={(pageData) => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <div style={{ fontSize: 12, lineHeight: 1.2 }}>
                  预估订单总额：{getPageTotalPrice(pageData).totalPushPrice}
                  <br />
                  实际订单总额：{getPageTotalPrice(pageData).totalPopPrice}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      >
        <Column
          title="操作"
          width={150}
          fixed={!h5Status.isH5}
          align="center"
          render={(render) => (
            <Space>
              <Tooltip title="降舱信息">
                <Button
                  size="small"
                  ghost
                  type="primary"
                  onClick={() => openViewDetail(render, 1)}
                  icon={<FallOutlined />}
                ></Button>
              </Tooltip>

              <Tooltip title="压位信息">
                <Button
                  size="small"
                  ghost
                  type="primary"
                  onClick={() => openViewDetail(render, 2)}
                  icon={<LogoutOutlined rotate={90} />}
                ></Button>
              </Tooltip>

              <Tooltip title="重新生单">
                <Button
                  size="small"
                  type="primary"
                  disabled={render.status !== "1" && render.status !== "4"}
                  onClick={() => returnOrderBtn(render)}
                  icon={<RollbackOutlined />}
                ></Button>
              </Tooltip>

              <Tooltip title="支付">
                <Button
                  size="small"
                  type="primary"
                  className="ant-btn-success"
                  disabled={render.status !== "1" && render.status !== "4"}
                  onClick={() => openPayModal(render)}
                  icon={<TransactionOutlined />}
                ></Button>
              </Tooltip>
            </Space>
          )}
        />
        <Column title="订单ID" ellipsis dataIndex="order_id" width={140} />
        <Column title="上游订单ID" dataIndex="top_order_id" width={100} />
        <Column
          title="预测支付时间"
          sorter={(a, b) => {
            let aTime = new Date(a.expect_confirm_time).getTime();
            let bTime = new Date(b.expect_confirm_time).getTime();
            return aTime - bTime;
          }}
          dataIndex="expect_confirm_time"
          width={150}
        />
        <Column title="初始化PNR" dataIndex="init_pnr" width={100} />
        <Column
          title="订单状态"
          width={120}
          dataIndex="status"
          render={(text) => (
            <span
              style={{
                color:
                  text === "0"
                    ? "#faad14"
                    : text === "1"
                    ? "#52c41a"
                    : text === "2"
                    ? "#00000040"
                    : text === "3"
                    ? "#1890ff"
                    : text === "4"
                    ? "#ff4d4f"
                    : "#000",
              }}
            >
              {text === "0"
                ? "待支付"
                : text === "1"
                ? "已付款未出票"
                : text === "2"
                ? "取消"
                : text === "3"
                ? "已出票"
                : text === "4"
                ? "支付失败"
                : text}
            </span>
          )}
        />
        <Column
          title="OTA最晚出票时间"
          sorter={(a, b) => {
            let aTime = new Date(a.last_ticket_time).getTime();
            let bTime = new Date(b.last_ticket_time).getTime();
            return aTime - bTime;
          }}
          dataIndex="last_ticket_time"
          width={150}
        />
        <Column
          title="创建订单时间"
          sorter={(a, b) => {
            let aTime = new Date(a.create_time).getTime();
            let bTime = new Date(b.create_time).getTime();
            return aTime - bTime;
          }}
          dataIndex="create_time"
          width={150}
        />
        <Column title="航司代码" dataIndex="air_code" width={80} />
        <Column title="出发机场" dataIndex="dep_code" width={80} />
        <Column title="到达机场" dataIndex="arr_code" width={80} />
        <Column title="出发城市" dataIndex="dcity_code" width={80} />
        <Column title="到达城市" dataIndex="acity_code" width={80} />
        <Column
          title="起飞时间"
          dataIndex="dep_time"
          width={150}
          render={(text) =>
            text ? moment(text).format("yyyy-MM-DD HH:mm") : text
          }
          sorter={(a, b) => {
            let aTime = new Date(a.dep_time).getTime();
            let bTime = new Date(b.dep_time).getTime();
            return aTime - bTime;
          }}
        />
        <Column title="首飞航班号" dataIndex="first_flight" width={100} />
        <Column
          title="航班号代码"
          dataIndex="flight_code"
          width={220}
          render={(text) =>
            text.length > 23 ? (
              <Tooltip title={text}>
                <Text strong>{text.substring(0, 22) + "..."}</Text>
              </Tooltip>
            ) : (
              text
            )
          }
        />
        <Column
          title="乘客姓名"
          ellipsis
          render={(render) => `${render.first_name} ${render.last_name}`}
        />
        <Column title="订单人数" dataIndex="head_count" width={80} />
        <Column
          title="联系人姓名"
          ellipsis
          dataIndex="contact_name"
          width={150}
        />
        <Column title="联系电话" dataIndex="contact_phone" width={150} />
        <Column
          title="联系邮箱"
          ellipsis
          dataIndex="contact_email"
          width={180}
        />
        <Column title="进单采购单价" dataIndex="push_price_total" width={100} />
        <Column title="出票采购总价" dataIndex="pop_price_total" width={100} />
        <Column
          title="实时票价"
          dataIndex="now_price"
          width={80}
          render={(text, render) => (
            <span
              style={{
                color:
                  Number(render.push_price_total) < Number(text)
                    ? "red"
                    : Number(render.push_price_total) > Number(text)
                    ? "#52c41a"
                    : "#999",
              }}
            >
              {text}
            </span>
          )}
        />
        <Column title="实时余位" dataIndex="now_seat_count" width={80} />
        <Column
          title="生单请求提交的数据"
          dataIndex="order_post_data"
          width={250}
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
        />
        <Column
          title="验价请求提交的数据"
          dataIndex="check_post_data"
          width={250}
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
        />
        <Column
          title="是否催单"
          width={80}
          dataIndex="immediately_out_ticket"
          render={(text) =>
            text === "0" ? "未催单" : text === "1" ? "已催单" : text
          }
        />
        <Column
          title="是否释放提前压"
          width={120}
          dataIndex="is_release"
          render={(text) =>
            text === "0" ? "未释放" : text === "1" ? "已释放" : text
          }
        />

        <Column title="扩展字段" ellipsis dataIndex="exts" />
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>

      <Modal
        title={`${infoData.type === 1 ? "降舱" : "压位"}详情`}
        width={1200}
        visible={infoModal}
        footer={null}
        style={{ top: 20 }}
        destroyOnClose
        onCancel={() => setInfoModal(false)}
        wrapClassName="infoModal"
      >
        {infoData.dom}
      </Modal>

      {/* 支付弹窗 */}
      <Modal
        visible={payModal}
        centered
        width={400}
        closable={false}
        keyboard={!payLoading}
        maskClosable={!payLoading}
        onCancel={() => setPayModal(false)}
        footer={null}
        bodyStyle={{ padding: "32px 32px 24px" }}
      >
        <h2>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} /> 敏感操作
        </h2>
        <p>
          {submitMessageModal === "payOrder"
            ? "是否确认支付当前订单？"
            : submitMessageModal === "returnOrder"
            ? "是否确认重新生单？"
            : ""}
        </p>
        <div style={{ textAlign: "right", marginTop: 30 }}>
          <Space>
            <Button
              key="back"
              disabled={payLoading}
              onClick={() => setPayModal(false)}
            >
              关闭
            </Button>
            <Button
              key="submit"
              type="primary"
              className={
                submitMessageModal === "payOrder" ? "ant-btn-success" : ""
              }
              loading={payLoading}
              onClick={() => submitPay()}
            >
              {submitMessageModal === "payOrder"
                ? "立即支付"
                : submitMessageModal === "returnOrder"
                ? "重新生单"
                : ""}
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
}

export default observer(OrderInfo);
