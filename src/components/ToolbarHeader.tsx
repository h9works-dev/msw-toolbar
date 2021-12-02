import  { Button, Input, Popover, Form, Select } from 'antd';
import {
  UndoOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import * as React from 'react';
import { useCallback, useState, memo } from 'react';
import { RESTMethods } from 'msw';
import { RuleObject } from 'antd/lib/form/index';

const { Search } = Input;
const { Option } = Select;

interface ToolbarHeaderProps {
  isCollapsed: boolean;

  onClickCollapseToggle: () => void;
  onClickAllReset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFinish: (values: any) => void;

  onSearch: (value: string) => void;

  onClickSetEndpoints: () => void;
}

export const ToolbarHeader = ({
  isCollapsed,
  onClickCollapseToggle,
  onClickAllReset,
  onFinish,
  onSearch,
  onClickSetEndpoints,
}: ToolbarHeaderProps) => {
  const [form] = Form.useForm();

  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const onFormReset = useCallback(() => {
    if(form) {
      form.resetFields();
    }
    
  }, [form]);

  const onPopoverVisibleChange = useCallback((visible: boolean) => {
    setPopoverVisible(visible);
  }, []);

  const hofNumberVaildator =
    (name: string) => (rule: RuleObject, value: string, callback: (error: string | undefined) => void) => {
      if (!value) {
        return Promise.reject(`Please input ${name}!`);
      } else {
        if (isNaN(+value)) {
          return Promise.reject(`${value} is not a number type `);
        }
      }

      return Promise.resolve();
    };

  const hofJsonValidator =
    (name: string) => (rule: RuleObject, value: string, callback: (error: string | undefined) => void) => {
      if (!value) {
        return Promise.reject(`Please input ${name}!`);
      } else {
        try {
          const jsonObj = JSON.parse(value);
          if (jsonObj) {
            return Promise.resolve(jsonObj);
          }
        } catch {
          return Promise.resolve(value);
        }
      }
    };

  const _onFinish = useCallback(
    values => {
      if (onFinish) {
        onFinish(values);
      }

      setPopoverVisible(false);
      if(form) {
        form.resetFields();
      }
    },
    [onFinish],
  );

  return (
    <div style={{ display: 'flex' }}>
      <Search placeholder="input search text" onSearch={onSearch} enterButton />

      <Popover
        visible={popoverVisible}
        onVisibleChange={onPopoverVisibleChange}
        content={
          <div>
            <div>It has a higher priority than the previously registered endpoint, runs once and disappears.</div>
            <Form style={{ marginTop: 18 }} form={form} layout={'horizontal'} onFinish={_onFinish}>
              <Form.Item
                label="Url"
                name="url"
                rules={[
                  {
                    required: true,
                    message: 'Please input url!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="method"
                label="Method"
                rules={[
                  {
                    required: true,
                    message: 'Please input method!',
                  },
                ]}
              >
                <Select>
                  {Object.values(RESTMethods).map((method: RESTMethods) => (
                    <Option key={method} value={method}>
                      {method}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Status"
                name="status"
                rules={[
                  {
                    required: true,
                    validator: hofNumberVaildator('status'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Delay"
                name="delay"
                rules={[
                  {
                    required: true,
                    validator: hofNumberVaildator('delay'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Mock"
                name="mock"
                rules={[
                  {
                    required: true,
                    validator: hofJsonValidator('mock'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item style={{ alignItems: 'end', marginBottom: 5, marginTop: 5 }}>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button style={{ marginLeft: '8px' }} type="primary" onClick={onFormReset}>
                  Reset
                </Button>
              </Form.Item>
            </Form>
          </div>
        }
        title="Generate endpoint responses that are executed only once."
        trigger="click"
      >
        <Button style={{ marginLeft: '8px' }} type="primary" icon={<PlusOutlined />}>
          Once
        </Button>
      </Popover>

      <Button
        style={{ marginLeft: '8px' }}
        type="primary"
        icon={<CloudDownloadOutlined />}
        onClick={onClickSetEndpoints}
      >
        Load
      </Button>

      <Button style={{ marginLeft: '8px' }} type="primary" icon={<UndoOutlined />} onClick={onClickAllReset}>
        Reset
      </Button>

      <Button
        type="primary"
        icon={isCollapsed ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        onClick={onClickCollapseToggle}
      >
        {isCollapsed ? 'Expand' : 'Collapse'}
      </Button>
    </div>
  );
};

memo(ToolbarHeader);
