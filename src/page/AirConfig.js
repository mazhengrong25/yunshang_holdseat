/*
 * @Description: 航司配置页面
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 13:41:45
 * @LastEditTime: 2022-05-13 14:33:29
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
  Tooltip,
  Popover,
} from "antd";

import axios from "../api";

import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  FormOutlined,
} from "@ant-design/icons";

import BaseSearch from "../components/BaseSearch";
import BasePagination from "../components/BasePagination";

const { Column } = Table;
const { confirm } = Modal;

function AirConfig() {
  const [configForm] = Form.useForm();

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

  const [rowClassName, setRowClassName] = useState(""); // 选中table行

  useEffect(() => {
    getDataList(); //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataConfig]);

  // 获取数据列表
  function getDataList() {
    setDataListLoading(true);
    let data = {
      table: "conf_air",
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
    // if (val.air_code) {
    //   searchText +=
    //     (searchText ? " AND " : "") + "`air_code`='" + val.air_code + "'";
    // }
    setDataConfig({ ...dataConfig, page: 1, searchText: searchText });
  };

  // 打开数据弹窗
  function openConfigModal(val) {
    console.log(val);
    if (val) {
      configForm.setFieldsValue(val);
    } else {
      configForm.resetFields();
    }
    setConfigOldData(val);
    setIsConfigModal(true);
  }

  // 提交数据弹窗
  function submitModalData(value) {
    setIsConfigLoading(true);
    let modalData = value;
    let data;
    if (configOldData) {
      // 修改数据
      data = {
        table: "conf_air",
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
        if (k !== "key" && configOldData[k]) {
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
        table: "conf_air",
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
          table: "conf_air",
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

  const searchDom = (
    <>
      <Form.Item label="航司代码" name="air_code">
        <Input allowClear placeholder="请输入" maxLength={2} />
      </Form.Item>
    </>
  );

  return (
    <div className="config_page air_config">
      <PageHeader
        className="config_page_header"
        title="航司配置"
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
        scroll={{ x: 2800, y: "calc(100% - 35px)" }}
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
          width={80}
          align="center"
          render={(render) => (
            <>
              <Tooltip title="删除">
                <Button
                  danger
                  style={{ marginRight: 5 }}
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
            </>
          )}
        />
        <Column title="航司代码" dataIndex="air_code" width={80} />
        <Column title="查询价格接口" dataIndex="av" ellipsis />
        <Column title="创建订单接口" dataIndex="create" ellipsis />
        <Column title="取消订单接口" dataIndex="cancel" ellipsis />
        <Column title="验价接口" dataIndex="check" ellipsis />
        <Column title="支付订单接口" dataIndex="pay" ellipsis />
        <Column title="币种" dataIndex="currency" width={80} />
        <Column title="支付重试次数" dataIndex="pay_retry_count" width={100} />
        <Column
          title="取消占座间隔"
          dataIndex="ref_create_order_interval"
          width={100}
        />
        <Column
          title="取消占座次数"
          dataIndex="check_descend_interval"
          width={100}
        />
        <Column
          title="检测降舱降价间隔"
          dataIndex="check_descend_interval"
          width={130}
        />
        <Column
          title="压位任务执行间隔"
          dataIndex="hold_interval"
          width={130}
        />
        <Column title="压位生单国籍" dataIndex="hold_nationality" width={100} />

        <Column
          title="OTA最晚出票时间"
          dataIndex="early_end_time"
          width={130}
        />
        <Column title="PNR有效期" dataIndex="pnr_end_time" width={90} />
        <Column
          title="降舱压位开关"
          dataIndex="direct_pay"
          width={100}
          render={(text) =>
            text === "0"
              ? "开启压位降舱"
              : text === "1"
              ? "关闭压位降舱直接出票"
              : text
          }
        />
        <Column
          title="是否允许重复生单"
          width={140}
          dataIndex="release_first"
          render={(text) => (text === "0" ? "否" : text === "1" ? "是" : text)}
        />
        <Column
          title="并发生单"
          width={80}
          dataIndex="concurrent"
          render={(text) =>
            text === "0" ? "支持" : text === "1" ? "不支持" : text
          }
        />
        <Column
          title="降舱模式"
          width={80}
          dataIndex="descend_mode"
          render={(text) =>
            text === "0" ? "占位降舱" : text === "1" ? "余位降舱" : text
          }
        />
      </Table>

      <BasePagination
        count={dataList.count}
        dataConfig={dataConfig}
        changePage={changePage}
      ></BasePagination>

      <Modal
        title="航司配置设置"
        destroyOnClose
        centered
        visible={isConfigModal}
        // onOk={() => submitModalData()}
        onCancel={() => setIsConfigModal(false)}
        confirmLoading={isConfigLoading}
        width={1200}
        bodyStyle={{ maxHeight: 650, overflowY: "auto" }}
        footer={[
          <div
            style={{
              left: 16,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              position: "absolute",
              lineHeight: 1.2,
              fontSize: 12,
            }}
            key="text"
          >
            <div style={{ marginRight: 10, fontSize: 16 }}>降舱模式</div>
            <div>
              <span style={{ fontWeight: "bold" }}>占位降舱</span>：
              航司支持占位，并且占位有效期较长时，使用该模式。
              <br />
              <span style={{ fontWeight: "bold" }}>余位降舱</span>：
              航司不支持占位或占位时间过短时，使用该模式。
              <Popover
                content={() => (
                  <>
                    <div>1. orderRes.PnrCode //不可为空</div>
                    <div>2. orderRes.Routing.BasisAmount //不可为空 </div>
                    <div>3. orderRes.Routing.FareQuotes //可为空 </div>
                    <div>4. orderRes.OtherCode //可为空 </div>
                    <div>
                      5. orderRes.LastTicketTime
                      //不可为空，可随意填写，但要符合日期时间格式规范
                    </div>
                  </>
                )}
                title="该模式下，创建订单接口响应结果中以下字段需要注意："
              >
                <Button type="link" size="small" style={{ fontSize: 12 }}>
                  [模式说明]
                </Button>
              </Popover>
            </div>
          </div>,
          <Button key="back" onClick={() => setIsConfigModal(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isConfigLoading}
            onClick={() =>
              configForm
                .validateFields()
                .then((value) => {
                  submitModalData(value);
                })
                .catch((info) => {
                  console.log("Validate Failed:", info);
                })
            }
          >
            保存
          </Button>,
        ]}
      >
        <Form layout="vertical" labelWrap form={configForm}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="航司代码"
                name="air_code"
                rules={[
                  {
                    required: false,
                    message: "请输入航司代码!",
                  },
                ]}
              >
                <Input placeholder="请输入航司代码" maxLength={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="查询价格接口"
                name="av"
                rules={[
                  {
                    required: false,
                    message: "请输入查询价格接口!",
                  },
                ]}
              >
                <Input placeholder="请输入查询价格接口" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="创建订单接口"
                name="create"
                rules={[
                  {
                    required: false,
                    message: "请输入创建订单接口!",
                  },
                ]}
              >
                <Input placeholder="请输入创建订单接口" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="取消订单接口"
                name="cancel"
                rules={[
                  {
                    required: false,
                    message: "请输入取消订单接口!",
                  },
                ]}
              >
                <Input placeholder="请输入取消订单接口" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="验价接口"
                name="check"
                rules={[
                  {
                    required: false,
                    message: "请输入验价接口!",
                  },
                ]}
              >
                <Input placeholder="验价接口，用于获取最新价格" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="支付订单接口"
                name="pay"
                rules={[
                  {
                    required: false,
                    message: "请输入支付订单接口!",
                  },
                ]}
              >
                <Input placeholder="请输入支付订单接口" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="币种"
                name="currency"
                rules={[
                  {
                    required: false,
                    message: "请输入币种!",
                  },
                ]}
              >
                <Input placeholder="请输入币种" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="支付重试次数"
                name="pay_retry_count"
                rules={[
                  {
                    required: false,
                    message: "请输入支付重试次数!",
                  },
                ]}
              >
                <Input placeholder="请输入支付重试次数" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="【压位功能】取消占座后间隔几秒检测价格变动"
                name="ref_create_order_interval"
                rules={[
                  {
                    required: false,
                    message: "请输入取消占座后间隔几秒检测价格变动!",
                  },
                ]}
              >
                <Input placeholder="单位秒" suffix="秒" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="【压位功能】最多检测几次价格变动"
                name="ref_create_order_check_descend_count"
                rules={[
                  {
                    required: false,
                    message: "请输入最多检测几次价格变动!",
                  },
                ]}
              >
                <Input placeholder="最多允许检测多少次价格变动，检测到后才占座" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="【压位功能】几秒执行一次压位任务"
                name="hold_interval"
                rules={[
                  {
                    required: false,
                    message: "请输入几秒执行一次压位任务!",
                  },
                ]}
              >
                <Input placeholder="单位秒" suffix="秒" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="【降仓压位】询价时价格正负值大于本值视为价格变动"
                name="descend_threshold"
                rules={[
                  {
                    required: false,
                    message: "请输入询价时价格正负值大于本值视为价格变动!",
                  },
                ]}
              >
                <Input placeholder="询价时价格正负值大于本值视为价格变动" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="【降仓功能】几秒检测一次价格变动"
                name="check_descend_interval"
                rules={[
                  {
                    required: false,
                    message: "请输入几秒检测一次价格变动!",
                  },
                ]}
              >
                <Input placeholder="单位秒" suffix="秒" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="压位生单时的国籍"
                name="hold_nationality"
                rules={[
                  {
                    required: false,
                    message: "请输入压位生单时的国籍!",
                  },
                ]}
              >
                <Input placeholder="请输入压位生单时的国籍" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="距离OTA最晚出票时间提前几小时完成出票"
                name="early_end_time"
                rules={[
                  {
                    required: false,
                    message: "请输入距离OTA最晚出票时间提前几小时完成出票!",
                  },
                ]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="距离PNR有效期前几分钟完成出票"
                name="pnr_end_time"
                rules={[
                  {
                    required: false,
                    message: "请输入距离PNR有效期前几分钟完成出票!",
                  },
                ]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="降舱压位开关"
                name="direct_pay"
                rules={[
                  {
                    required: false,
                    message: "请选择降舱压位开关!",
                  },
                ]}
              >
                <Select placeholder="请选择降舱压位开关">
                  <Select.Option value="0">开启压位降舱</Select.Option>
                  <Select.Option value="1">关闭压位降舱直接出票</Select.Option>
                  <Select.Option value="2">暂停降舱压位功能</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="是否允许重复生单"
                name="release_first"
                rules={[
                  {
                    required: false,
                    message: "请选择是否允许重复生单!",
                  },
                ]}
              >
                <Select placeholder="是否压位后生单">
                  <Select.Option value="0">否</Select.Option>
                  <Select.Option value="1">是</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="是否支持并发生单"
                name="concurrent"
                rules={[
                  {
                    required: false,
                    message: "请选择是否支持并发生单!",
                  },
                ]}
              >
                <Select placeholder="部分风控严重的航司建议选不支持">
                  <Select.Option value="0">支持</Select.Option>
                  <Select.Option value="1">不支持</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="降舱模式"
                name="descend_mode"
                rules={[
                  {
                    required: false,
                    message: "请选择降舱模式!",
                  },
                ]}
              >
                <Select placeholder="请选择降舱模式">
                  <Select.Option value="0">占位降舱</Select.Option>
                  <Select.Option value="1">余位降舱</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default AirConfig;
