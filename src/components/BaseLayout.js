/*
 * @Description: UI框架布局
 * @Author: wish.WuJunLong
 * @Date: 2022-03-15 11:59:34
 * @LastEditTime: 2022-05-09 14:03:01
 * @LastEditors: wish.WuJunLong
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Menu,
  Dropdown,
  Modal,
  Button,
  Form,
  Input,
  message,
  Spin,
  Drawer,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuUnfoldOutlined, AppstoreOutlined, DownOutlined } from "@ant-design/icons";

import axios from "../api";

import eventBus from "../utils/eventBus";

import cookie from "react-cookies";

import { h5Status } from "../store";
import { observer } from "mobx-react-lite";

const { Header, Content, Footer, Sider } = Layout;
function BaseLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // 当前路由地址
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState("home"); // 导航栏默认选中
  const [isInit, setIsInit] = useState(false); // 初次加载

  const [userInfo, setUserInfo] = useState(
    localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : {}
  ); // 用户信息
  const [loginModal, setLoginModal] = useState(false); // 登录弹窗
  const [loginLoading, setLoginLoading] = useState(false); // 登录弹窗加载

  const [signOutLoading, setSignOutLoading] = useState(false); // 登出

  const [collapsed, setCollapsed] = useState(false); // 展开收起导航栏 [h5]

  const menuItems = [
    {
      key: "home",
      icon: <AppstoreOutlined />,
      label: "航司配置",
    },
    {
      key: "/orderInfo",
      icon: <AppstoreOutlined />,
      label: "订单列表",
    },
    {
      key: "/descendInfo",
      icon: <AppstoreOutlined />,
      label: "降舱动态",
    },
    {
      key: "/holdConfig",
      icon: <AppstoreOutlined />,
      label: "压位配置",
    },
    {
      key: "/holdInfo",
      icon: <AppstoreOutlined />,
      label: "压位动态",
    },
    {
      key: "/logsInfo",
      icon: <AppstoreOutlined />,
      label: "日志查询",
    },
  ];

  const jumpRoute = (url) => {
    navigate(`${url.key === "home" ? "" : url.key}`);
  };

  // 获取通信 弹出登录框
  const acceptLogin = useCallback((type) => {
    console.log(type);
    setLoginModal(type);
  }, []);

  // 接受api文件通讯
  useEffect(() => {
    eventBus.addListener("emit", acceptLogin);
    return () => {
      eventBus.removeListener("emit", acceptLogin);
    };
  }, [acceptLogin]);

  // 导航路由赋值 / 判断是否初次加载
  useEffect(() => {
    setDefaultSelectedKeys(location.pathname === "/" ? "home" : location.pathname);
    setIsInit(true);
    return () => {
      setDefaultSelectedKeys("home");
      setIsInit(true);
    };
  }, [location.pathname]);
  if (!isInit) {
    return null;
  }

  // 提交登录
  const submitLogin = (values) => {
    setLoginLoading(true);
    loginData(values);
  };

  // 退出登录
  function signOutBtn() {
    if (!signOutLoading) {
      setSignOutLoading(true);

      axios.get("/curd/login.do").then((res) => {
        setSignOutLoading(false);
        if (res.status === 0) {
          localStorage.clear();
          cookie.remove("cid", { path: "/" });
          setLoginModal(true);
          message.success(res.message);
        } else {
          message.warning("登出失败，请重试");
        }
      });
    }
  }

  function loginData(data) {
    axios
      .post("/curd/login.do", data)
      .then((res) => {
        setLoginLoading(false);
        if (res.status === 0) {
          message.success(res.message);
          localStorage.setItem("userInfo", JSON.stringify(res.data));
          setUserInfo(res.data);
          setLoginModal(false);
        } else {
          message.warning(res.message);
        }
      })
      .catch((err) => {
        setLoginLoading(false);
      });
  }

  return (
    <Layout>
      <Drawer
        title="HoldSeatOS"
        placement="left"
        onClose={() => setCollapsed(!collapsed)}
        visible={collapsed}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={[defaultSelectedKeys]}
          onClick={(url) => {
            setCollapsed(!collapsed);
            jumpRoute(url);
          }}
          items={menuItems}
        ></Menu>
      </Drawer>
      <Sider
        collapsible
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        style={{
          overflow: "auto",
          height: "100vh",
          minHeight: 426,
        }}
        onBreakpoint={(broken) => {
          h5Status.changeH5Status(broken);
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[defaultSelectedKeys]}
          items={menuItems}
          onClick={(url) => jumpRoute(url)}
        ></Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className="header_main site-layout-background"
          style={{ justifyContent: h5Status.isH5 ? "" : "end" }}
        >
          {h5Status.isH5 ? (
            <Button type="primary" onClick={() => setCollapsed(!collapsed)}>
              <MenuUnfoldOutlined />
            </Button>
          ) : (
            ""
          )}

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="0" onClick={() => signOutBtn()}>
                  {signOutLoading ? (
                    <Spin size="small" style={{ marginRight: 10 }} />
                  ) : (
                    ""
                  )}
                  退出登录
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <span
              style={{ color: "#1890ff", cursor: "pointer" }}
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              {userInfo.user
                ? `${userInfo.user} [${userInfo.main_cls}] `
                : "用户数据错误"}
              <DownOutlined />
            </span>
          </Dropdown>
        </Header>
        <Content
          style={{
            height: "calc(100vh - 158px)",
            minWidth: h5Status.isH5 ? 0 : 950,
            minHeight: 200,
            margin: "24px 16px 0",
            overflow: "initial",
          }}
        >
          <div
            className="content_main site-layout-background"
            style={{ padding: 24, textAlign: "center" }}
          >
            {loginModal ? "" : <Outlet />}
          </div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "8px 50px" }}>
          HoldSeatOS ©2022 Created by Wish
        </Footer>
      </Layout>

      <Modal
        title="系统登录"
        visible={loginModal}
        closable={false}
        keyboard={false}
        maskClosable={false}
        centered
        footer={null}
      >
        <div className="login_main">
          <Form
            name="basic"
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 16,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={submitLogin}
            autoComplete="off"
          >
            <Form.Item
              label="账号"
              name="user"
              rules={[
                {
                  required: true,
                  message: "请输入账号",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                {
                  required: true,
                  message: "请输入密码",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 18, justify: "end" }}>
              <Button loading={loginLoading} type="primary" htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Layout>
  );
}

export default observer(BaseLayout);
