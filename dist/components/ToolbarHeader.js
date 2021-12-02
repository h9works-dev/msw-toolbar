"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarHeader = void 0;
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var React = __importStar(require("react"));
var react_1 = require("react");
var msw_1 = require("msw");
var Search = antd_1.Input.Search;
var Option = antd_1.Select.Option;
var ToolbarHeader = function (_a) {
    var isCollapsed = _a.isCollapsed, onClickCollapseToggle = _a.onClickCollapseToggle, onClickAllReset = _a.onClickAllReset, onFinish = _a.onFinish, onSearch = _a.onSearch, onClickSetEndpoints = _a.onClickSetEndpoints;
    var form = antd_1.Form.useForm()[0];
    var _b = (0, react_1.useState)(false), popoverVisible = _b[0], setPopoverVisible = _b[1];
    var onFormReset = (0, react_1.useCallback)(function () {
        if (form) {
            form.resetFields();
        }
    }, [form]);
    var onPopoverVisibleChange = (0, react_1.useCallback)(function (visible) {
        setPopoverVisible(visible);
    }, []);
    var hofNumberVaildator = function (name) { return function (rule, value, callback) {
        if (!value) {
            return Promise.reject("Please input ".concat(name, "!"));
        }
        else {
            if (isNaN(+value)) {
                return Promise.reject("".concat(value, " is not a number type "));
            }
        }
        return Promise.resolve();
    }; };
    var hofJsonValidator = function (name) { return function (rule, value, callback) {
        if (!value) {
            return Promise.reject("Please input ".concat(name, "!"));
        }
        else {
            try {
                var jsonObj = JSON.parse(value);
                if (jsonObj) {
                    return Promise.resolve(jsonObj);
                }
            }
            catch (_a) {
                return Promise.resolve(value);
            }
        }
    }; };
    var _onFinish = (0, react_1.useCallback)(function (values) {
        if (onFinish) {
            onFinish(values);
        }
        setPopoverVisible(false);
        if (form) {
            form.resetFields();
        }
    }, [onFinish]);
    return (React.createElement("div", { style: { display: 'flex' } },
        React.createElement(Search, { placeholder: "input search text", onSearch: onSearch, enterButton: true }),
        React.createElement(antd_1.Popover, { visible: popoverVisible, onVisibleChange: onPopoverVisibleChange, content: React.createElement("div", null,
                React.createElement("div", null, "It has a higher priority than the previously registered endpoint, runs once and disappears."),
                React.createElement(antd_1.Form, { style: { marginTop: 18 }, form: form, layout: 'horizontal', onFinish: _onFinish },
                    React.createElement(antd_1.Form.Item, { label: "Url", name: "url", rules: [
                            {
                                required: true,
                                message: 'Please input url!',
                            },
                        ] },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { name: "method", label: "Method", rules: [
                            {
                                required: true,
                                message: 'Please input method!',
                            },
                        ] },
                        React.createElement(antd_1.Select, null, Object.values(msw_1.RESTMethods).map(function (method) { return (React.createElement(Option, { key: method, value: method }, method)); }))),
                    React.createElement(antd_1.Form.Item, { label: "Status", name: "status", rules: [
                            {
                                required: true,
                                validator: hofNumberVaildator('status'),
                            },
                        ] },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { label: "Delay", name: "delay", rules: [
                            {
                                required: true,
                                validator: hofNumberVaildator('delay'),
                            },
                        ] },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { label: "Mock", name: "mock", rules: [
                            {
                                required: true,
                                validator: hofJsonValidator('mock'),
                            },
                        ] },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { style: { alignItems: 'end', marginBottom: 5, marginTop: 5 } },
                        React.createElement(antd_1.Button, { type: "primary", htmlType: "submit" }, "Create"),
                        React.createElement(antd_1.Button, { style: { marginLeft: '8px' }, type: "primary", onClick: onFormReset }, "Reset")))), title: "Generate endpoint responses that are executed only once.", trigger: "click" },
            React.createElement(antd_1.Button, { style: { marginLeft: '8px' }, type: "primary", icon: React.createElement(icons_1.PlusOutlined, null) }, "Once")),
        React.createElement(antd_1.Button, { style: { marginLeft: '8px' }, type: "primary", icon: React.createElement(icons_1.CloudDownloadOutlined, null), onClick: onClickSetEndpoints }, "Load"),
        React.createElement(antd_1.Button, { style: { marginLeft: '8px' }, type: "primary", icon: React.createElement(icons_1.UndoOutlined, null), onClick: onClickAllReset }, "Reset"),
        React.createElement(antd_1.Button, { type: "primary", icon: isCollapsed ? React.createElement(icons_1.ArrowUpOutlined, null) : React.createElement(icons_1.ArrowDownOutlined, null), onClick: onClickCollapseToggle }, isCollapsed ? 'Expand' : 'Collapse')));
};
exports.ToolbarHeader = ToolbarHeader;
(0, react_1.memo)(exports.ToolbarHeader);
//# sourceMappingURL=ToolbarHeader.js.map