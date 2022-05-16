/*
 * @Description: 公用搜索框外壳 兼容H5显示
    dom 筛选form items
    loading 筛选按钮loading
    function search 筛选按钮方法
 * @Author: wish.WuJunLong
 * @Date: 2022-05-10 17:54:48
 * @LastEditTime: 2022-05-11 09:22:48
 * @LastEditors: wish.WuJunLong
 */
import React, { useEffect, useState } from "react";

import { Button, Drawer, Form } from "antd";

import { h5Status } from "../store";
import { observer } from "mobx-react-lite";

function BaseSearch(props) {
  const [searchDrawer, setSearchDrawer] = useState(false); // 搜索弹窗加载 [h5]

  useEffect(() => {
    setSearchDrawer(false);
  }, [props.loading]);

  return (
    <>
      {h5Status.isH5 ? (
        <>
          <Button
            type="primary"
            block
            onClick={() => setSearchDrawer(true)}
            style={{ marginBottom: 15 }}
          >
            筛选
          </Button>
          <Drawer
            title="筛选条件"
            placement="bottom"
            onClose={() => setSearchDrawer(false)}
            visible={searchDrawer}
            height="70vh"
          >
            <Form
              layout="vertical"
              onFinish={props.search}
              labelCol={{ span: 18 }}
            >
              {props.dom}
              <Form.Item>
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  loading={props.loading}
                >
                  搜索
                </Button>
              </Form.Item>
            </Form>
          </Drawer>
        </>
      ) : (
        <div className="config_search">
          <Form layout="inline" onFinish={props.search} labelCol={{ span: 18 }}>
            {props.dom}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={props.loading}>
                搜索
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  );
}

export default observer(BaseSearch);
