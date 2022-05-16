/*
 * @Description: 压位配置页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 14:31:53
 * @LastEditTime: 2022-05-11 09:05:59
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import {
  PageHeader,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
  Tooltip,
  Space,
} from "antd";

import axios from "../api";

import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  FormOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import HoldInfo from "./HoldInfo";

import BaseSearch from "../components/BaseSearch";
import BasePagination from "../components/BasePagination";

const { Column } = Table;
const { confirm } = Modal;
const { Text } = Typography;

function HoldConfig() {
  const [dataConfig, setDataConfig] = useState({
    searchText: "",
    page: 1,
    pageSize: 20,
  }); // 原始数据
  const [dataList, setDataList] = useState([]); // 数据列表
  const [dataListLoading, setDataListLoading] = useState(false); // 数据列表加载
  const [isConfigModal, setIsConfigModal] = useState(false); // 数据弹窗
  const [isConfigLoading, setIsConfigLoading] = useState(false); // 数据弹窗加载
  const [configOldData, setConfigOldData] = useState(undefined); // 原始数据
  const [isDeleteLoading, setIsDeleteLoading] = useState(false); // 删除数据加载

  const [infoData, setInfoData] = useState({}); // 详情数据
  const [infoModal, setInfoModal] = useState(false); // 详情弹窗

  const [rowClassName, setRowClassName] = useState(""); // 选中table行

  useEffect(() => {
    getDataList(); //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataConfig]);

  // 获取数据列表
  function getDataList() {
    setDataListLoading(true);
    let data = {
      table: "conf_hold",
      page: dataConfig.page,
      size: dataConfig.pageSize,
      where: dataConfig.searchText,
    };
    axios
      .get("/curd/curd.do", { params: data })
      .then((res) => {
        setDataListLoading(false);
        if (res.status === 0) {
          // 判断当页面无数据且分页器不为第一页时返回第一页
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
          if (!res.data.content && dataConfig.page !== 1) {
            return changePage(1, 10);
          }
          if (res.data.content.length < 1 && dataConfig.page > 1) {
            return setDataConfig({ ...dataConfig, page: 1 });
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
    if (val.dep_code) {
      searchText +=
        (searchText ? " AND " : "") + "`dep_code`='" + val.dep_code + "'";
    }
    if (val.arr_code) {
      searchText +=
        (searchText ? " AND " : "") + "`arr_code`='" + val.arr_code + "'";
    }
    if (val.dis) {
      searchText += (searchText ? " AND " : "") + "`dis`='" + val.dis + "'";
    }
    setDataConfig({ ...dataConfig, page: 1, searchText: searchText });
  };

  const [configForm] = Form.useForm();

  // 打开数据弹窗
  function openConfigModal(val) {
    if (val) {
      configForm.setFieldsValue(val);
    } else {
      configForm.resetFields();
    }
    setConfigOldData(val);
    setIsConfigModal(true);
  }

  // 提交数据弹窗
  function submitModalData() {
    setIsConfigLoading(true);
    let modalData = configForm.getFieldsValue();
    let data;
    if (configOldData) {
      // 修改数据
      data = {
        table: "conf_hold",
        orig: [],
        new: [],
      };
      for (const k in modalData) {
        data.new.push({
          name: k,
          val: modalData[k] || "",
        });
      }
      for (const k in configOldData) {
        if (k !== "key") {
          data.orig.push({
            name: k,
            val: configOldData[k] || "",
          });
        }
      }
    } else {
      // 新增数据
      let dataList = [];
      for (const k in modalData) {
        dataList.push({
          name: k,
          val: modalData[k] || "",
        });
      }

      data = {
        table: "conf_hold",
        vals: [dataList],
      };
    }

    console.log(data);
    axios({
      method: configOldData ? "PUT" : "POST",
      data: data,
      url: "/curd/curd.do",
    }).then((res) => {
      setIsConfigLoading(false);
      if (res.status === 0) {
        setIsConfigModal(false);
        message.success("保存成功");
        getDataList();
      } else {
        message.warning(res.message);
      }
    });
  }

  // 删除数据
  function deleteConfigModal(val) {
    confirm({
      title: "敏感操作",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: "是否确认删除该条数据？",
      confirmLoading: isDeleteLoading,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        setIsDeleteLoading(true);

        let data = {
          table: "conf_hold",
          val: [],
        };
        for (const k in val) {
          if (k !== "key") {
            data.val.push({
              name: k,
              val: val[k] || "",
            });
          }
        }

        axios
          .post("/curd/del.do", data)
          .then((res) => {
            setIsDeleteLoading(false);
            if (res.status === 0) {
              getDataList();
              message.success("删除成功");
            } else {
              message.success(res.message);
            }
          })
          .catch((err) => {
            setIsDeleteLoading(false);
          });
      },
    });
  }

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page: page, pageSize: pageSize });
  };

  // 前往压位动态详情
  const openViewDetail = (val) => {
    console.log(val);
    setInfoModal(true);
    setInfoData({
      air_code: val.air_code,
      dep_code: val.dep_code,
      arr_code: val.arr_code,
    });
  };

  const searchDom = (
    <>
      <Form.Item label="航司代码" name="air_code">
        <Input allowClear placeholder="请输入" maxLength={2} />
      </Form.Item>
      <Form.Item label="出发城市" name="dep_code">
        <Input allowClear placeholder="请输入" maxLength={3} />
      </Form.Item>
      <Form.Item label="到达城市" name="arr_code">
        <Input allowClear placeholder="请输入" maxLength={3} />
      </Form.Item>
      <Form.Item label="是否禁用" name="dis">
        <Select
          placeholder="请选择"
          style={{ minWidth: 200, width: "100%", textAlign: "left" }}
          allowClear
        >
          <Select.Option value="0">启用</Select.Option>
          <Select.Option value="1">禁用</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  return (
    <div className="config_page">
      <PageHeader
        className="config_page_header"
        title="压位配置"
        extra={[
          <Button key="1" type="primary" onClick={() => openConfigModal()}>
            新增
          </Button>,
        ]}
      />

      <BaseSearch
        dom={searchDom}
        loading={dataListLoading}
        search={onSearch}
      ></BaseSearch>

      <Table
        dataSource={dataList.data}
        size="small"
        scroll={{ x: 1100, y: "calc(100% - 35px)" }}
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
        <Column
          title="操作"
          fixed="left"
          width={120}
          align="center"
          render={(render) => (
            <Space>
              <Tooltip title="压位动态">
                <Button
                  size="small"
                  ghost
                  type="primary"
                  onClick={() => openViewDetail(render)}
                  icon={<LogoutOutlined rotate={90} />}
                ></Button>
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  danger
                  size="small"
                  onClick={() => deleteConfigModal(render)}
                  icon={<DeleteOutlined />}
                ></Button>
              </Tooltip>
              <Tooltip title="编辑">
                <Button
                  size="small"
                  onClick={() => openConfigModal(render)}
                  icon={<FormOutlined />}
                ></Button>
              </Tooltip>
            </Space>
          )}
        />
        <Column title="航司代码" dataIndex="air_code" width={100} />
        <Column title="出发城市" dataIndex="dep_code" />
        <Column title="到达城市" dataIndex="arr_code" />
        <Column title="最小压位天数" dataIndex="min_hold_day" />
        <Column title="最大压位天数" dataIndex="max_hold_day" />
        <Column title="压余位数小航班" dataIndex="threshold" />
        <Column
          title="是否禁用规则"
          dataIndex="dis"
          render={(text) =>
            text === "0" ? (
              <Text type="success">启用</Text>
            ) : text === "1" ? (
              <Text type="danger">禁用</Text>
            ) : (
              text()
            )
          }
        />
        <Column title="标签" dataIndex="tag" />
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>

      <Modal
        title="压位配置设置"
        destroyOnClose
        centered
        visible={isConfigModal}
        onOk={() => submitModalData()}
        onCancel={() => setIsConfigModal(false)}
        confirmLoading={isConfigLoading}
        okText="保存"
        width={1000}
        bodyStyle={{ maxHeight: 600, overflowY: "auto" }}
      >
        <Form layout="vertical" labelWrap form={configForm}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="航司代码" name="air_code">
                <Input placeholder="请输入航司代码" maxLength={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="出发城市" name="dep_code">
                <Input placeholder="请输入出发机场" maxLength={3} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="到达城市" name="arr_code">
                <Input placeholder="请输入到达机场" maxLength={3} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="最小压位天数" name="min_hold_day">
                <Input placeholder="指从今天开始往后推N天开始压位" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="最大压位天数" name="max_hold_day">
                <Input placeholder="指从今天开始往后推N天结束压位" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="压余位数小于等于本值的航班" name="threshold">
                <Input placeholder="请输入压余位数小于等于本值的航班" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="是否禁用规则" name="dis">
                <Select placeholder="是否禁用规则">
                  <Select.Option value="0">启用</Select.Option>
                  <Select.Option value="1">禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="标签" name="tag">
                <Input placeholder="多个用|号隔开，比如AI|人工" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="压位动态"
        width={1200}
        visible={infoModal}
        footer={null}
        style={{ top: 20 }}
        destroyOnClose
        onCancel={() => setInfoModal(false)}
        wrapClassName="infoModal"
      >
        <HoldInfo data={infoData} />
      </Modal>
    </div>
  );
}

export default HoldConfig;
