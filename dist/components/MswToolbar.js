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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MswToolbar = void 0;
var react_1 = require("react");
var FooterToolbar_1 = __importDefault(require("ant-design-pro/lib/FooterToolbar"));
var antd_1 = require("antd");
var msw_1 = require("msw");
var lodash_1 = require("lodash");
var ToolbarHeader_1 = require("./ToolbarHeader");
require("./MswToolbar.css");
var React = __importStar(require("react"));
var Panel = antd_1.Collapse.Panel;
var LS_ENDPOINTS = 'endpoints';
var isJsonResolver = function (payload) { return payload.json !== undefined; };
var MswToolbar = function (_a) {
    var _b = _a.isEnabled, isEnabled = _b === void 0 ? false : _b, worker = _a.worker, endpoints = _a.endpoints;
    if ((isEnabled && !worker) || (isEnabled && worker && !worker.start)) {
        console.warn('Unable to use MswToolbar');
    }
    var workerRef = (0, react_1.useRef)();
    var initialEndpoint = (0, react_1.useRef)();
    var _c = (0, react_1.useState)(false), isReady = _c[0], setIsReady = _c[1];
    var _d = (0, react_1.useState)(false), isCollapsed = _d[0], setIsCollapsed = _d[1];
    var _e = (0, react_1.useState)(), groupEndpoint = _e[0], setGroupEndpoint = _e[1];
    var _f = (0, react_1.useState)(), viewEndpoint = _f[0], setViewEndpoint = _f[1];
    var lastApplyEndpoint = (0, react_1.useRef)(new Map());
    (0, react_1.useLayoutEffect)(function () {
        window.addEventListener('keydown', keyDownEvent, { passive: true });
        return function () {
            window.removeEventListener('keydown', keyDownEvent);
        };
    }, [isReady]);
    (0, react_1.useLayoutEffect)(function () {
        if (workerRef && workerRef.current) {
            workerRef.current.events.on('response:mocked', responseMockedEvent);
        }
        return function () {
            if (workerRef && workerRef.current) {
                workerRef.current.events.removeListener('response:mocked', responseMockedEvent);
            }
        };
    }, [viewEndpoint]);
    var setLsEndpoints = function (data) {
        window.localStorage.setItem(LS_ENDPOINTS, JSON.stringify(data));
    };
    var responseMockedEvent = function (res, id) {
        var onceId = res.headers.get('id');
        if (onceId && viewEndpoint && viewEndpoint.length > 0) {
            deleteWithOnceId(viewEndpoint, onceId);
        }
    };
    var keyDownEvent = function (event) {
        if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
            if (isReady) {
                setIsReady(false);
                if (workerRef && workerRef.current) {
                    workerRef.current.stop();
                }
            }
            else {
                setIsReady(true);
                if (workerRef && workerRef.current) {
                    workerRef.current.start();
                }
            }
        }
    };
    (0, react_1.useEffect)(function () {
        if (!worker || !isEnabled || workerRef.current)
            return;
        var prepareWorker = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                worker.start();
                workerRef.current = worker;
                workerRef.current.printHandlers();
                setIsReady(true);
                return [2];
            });
        }); };
        prepareWorker();
    }, [isEnabled, worker]);
    (0, react_1.useEffect)(function () {
        if (!isReady || !endpoints || endpoints.length === 0 || initialEndpoint.current)
            return;
        initialEndpoint.current = endpoints.map(function (endpoint) {
            if (isJsonResolver(endpoint.resolver)) {
                var jsonResolver = endpoint.resolver;
                jsonResolver.json = getJsonString(jsonResolver.json);
            }
            return endpoint;
        });
        setApplyLastEndpoints(initialEndpoint.current, false);
        setViewAndResetHandler(initialEndpoint.current);
    }, [isReady, endpoints]);
    (0, react_1.useEffect)(function () {
        if (viewEndpoint) {
            var groupedEndpoint = groupBy(viewEndpoint, function (endpoint) { return endpoint.url; });
            setGroupEndpoint(groupedEndpoint);
        }
    }, [viewEndpoint]);
    var getKey = function (endpoint) {
        var index;
        if (initialEndpoint.current) {
            index = initialEndpoint.current.findIndex(function (point) { return (0, lodash_1.isEqual)(point, endpoint); });
        }
        return "".concat(endpoint.url, "_").concat(endpoint.method, "_").concat(index);
    };
    var groupBy = function (list, keyGetter) {
        var map = new Map();
        list.forEach(function (item) {
            var key = keyGetter(item);
            var collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            }
            else {
                collection.push(item);
            }
        });
        return map;
    };
    var resetRequestHandlers = function (requestHandlers) {
        var _a;
        if (requestHandlers && requestHandlers.length > 0) {
            console.info('reset!');
            if (workerRef && workerRef.current) {
                (_a = workerRef.current).resetHandlers.apply(_a, requestHandlers);
                workerRef.current.printHandlers();
            }
        }
    };
    var setApplyLastEndpoints = function (endpoints, isSaveToLS) {
        if (isSaveToLS === void 0) { isSaveToLS = true; }
        endpoints.forEach(function (endpoint) { return lastApplyEndpoint.current.set(getKey(endpoint), endpoint); });
        if (isSaveToLS) {
            setLsEndpoints(endpoints);
        }
    };
    var getRequestHandlers = function (endpointList) {
        return endpointList.map(function (endpoint) {
            var resolver;
            if (isJsonResolver(endpoint.resolver)) {
                var jsonResolver_1 = endpoint.resolver;
                resolver = function (req, res, ctx) {
                    var ctxArray = [];
                    ctxArray.push(ctx.status(jsonResolver_1.code !== undefined ? jsonResolver_1.code : 200));
                    ctxArray.push(ctx.delay(jsonResolver_1.delay !== undefined ? jsonResolver_1.delay : 0));
                    ctxArray.push(ctx.json(getJsonString(jsonResolver_1.json)));
                    if (endpoint.once && endpoint.id) {
                        ctxArray.push(ctx.set('id', endpoint.id));
                    }
                    return res.apply(void 0, ctxArray);
                };
            }
            else {
                resolver = endpoint.resolver;
            }
            var method = endpoint.method.toString().toLowerCase();
            return msw_1.rest[method](endpoint.url, resolver);
        });
    };
    var onSearch = (0, react_1.useCallback)(function (value) {
        if (viewEndpoint) {
            var filteredEndpoints = viewEndpoint.filter(function (endpoint) {
                return endpoint.url.toLowerCase().includes(value.trim().toLowerCase());
            });
            var groupedEndpoint = groupBy(filteredEndpoints, function (endpoint) { return endpoint.url; });
            setGroupEndpoint(groupedEndpoint);
        }
    }, [viewEndpoint]);
    var onClickAllReset = (0, react_1.useCallback)(function () {
        if (initialEndpoint.current) {
            setApplyLastEndpoints(initialEndpoint.current);
            setViewAndResetHandler(initialEndpoint.current);
        }
    }, []);
    var findEndpointIndex = function (endpoints, endpoint) {
        return endpoints.findIndex(function (iEndpoint) {
            return !iEndpoint.once &&
                iEndpoint.method.toUpperCase() === endpoint.method.toUpperCase() &&
                iEndpoint.url === endpoint.url;
        });
    };
    var onClickReset = (0, react_1.useCallback)(function (endpoint) {
        if (viewEndpoint && initialEndpoint.current) {
            var cloneViewEndpoint = (0, lodash_1.cloneDeep)(viewEndpoint);
            var findIEndpointIndex = findEndpointIndex(initialEndpoint.current, endpoint);
            if (findIEndpointIndex !== -1) {
                cloneViewEndpoint.splice(findIEndpointIndex, 1, initialEndpoint.current[findIEndpointIndex]);
                setApplyLastEndpoints(cloneViewEndpoint);
                setViewAndResetHandler(cloneViewEndpoint);
            }
        }
    }, [viewEndpoint]);
    var setViewAndResetHandler = function (viewEndpoints) {
        var requestHandlers = getRequestHandlers(viewEndpoints);
        resetRequestHandlers(requestHandlers);
        setViewEndpoint(viewEndpoints);
    };
    var deleteWithOnceId = function (viewEndpoint, onceId) {
        if (viewEndpoint && onceId) {
            var clonedViewEndpoint = (0, lodash_1.cloneDeep)(viewEndpoint);
            var index = clonedViewEndpoint.findIndex(function (endpoint) { return endpoint.id === onceId; });
            if (index !== -1) {
                clonedViewEndpoint.splice(index, 1);
                setViewAndResetHandler(clonedViewEndpoint);
            }
        }
    };
    var onClickDelete = (0, react_1.useCallback)(function (endpoint) {
        if (endpoint.once && endpoint.id && viewEndpoint) {
            deleteWithOnceId(viewEndpoint, endpoint.id);
        }
    }, [viewEndpoint]);
    var onClickApply = (0, react_1.useCallback)(function (endpoint) {
        if (viewEndpoint) {
            var cloneViewEndpoint = (0, lodash_1.cloneDeep)(viewEndpoint);
            var findVEndpointIndex = findEndpointIndex(cloneViewEndpoint, endpoint);
            if (findVEndpointIndex !== -1) {
                cloneViewEndpoint.splice(findVEndpointIndex, 1, endpoint);
                setApplyLastEndpoints(cloneViewEndpoint);
                setViewAndResetHandler(cloneViewEndpoint);
            }
        }
    }, [viewEndpoint]);
    var getJsonString = function (value) {
        var json;
        try {
            json = JSON.parse(value);
        }
        catch (e) {
            json = value;
        }
        return json;
    };
    var onChangeForm = (0, react_1.useCallback)(function (endpoint, type, value) {
        if (viewEndpoint) {
            var data = (0, lodash_1.cloneDeep)(endpoint);
            var jsonResolver = data.resolver;
            if (type === 'status') {
                if (value === '') {
                    jsonResolver.code = 0;
                }
                else if (isNaN(+value)) {
                    return;
                }
                else {
                    jsonResolver.code = +value;
                }
            }
            else if (type === 'delay') {
                if (value === '') {
                    jsonResolver.delay = 0;
                }
                else if (isNaN(+value)) {
                    return;
                }
                else {
                    jsonResolver.delay = +value;
                }
            }
            else {
                jsonResolver.json = getJsonString(value);
            }
            var cloneViewEndpoint = (0, lodash_1.cloneDeep)(viewEndpoint);
            var findVEndpointIndex = findEndpointIndex(cloneViewEndpoint, endpoint);
            if (findVEndpointIndex !== -1) {
                cloneViewEndpoint.splice(findVEndpointIndex, 1, data);
                setViewEndpoint(cloneViewEndpoint);
            }
        }
    }, [viewEndpoint]);
    var onClickCollapseToggle = (0, react_1.useCallback)(function () {
        setIsCollapsed(function (state) { return !state; });
    }, []);
    var createTable = function (endpoints) {
        var isCheckChange = function (endpoint) {
            if (lastApplyEndpoint.current && lastApplyEndpoint.current.size !== 0) {
                var key = getKey(endpoint);
                var findEndpoint = lastApplyEndpoint.current.get(key);
                return (0, lodash_1.isEqual)(findEndpoint, endpoint);
            }
            return false;
        };
        var columns = [
            {
                title: 'Method',
                dataIndex: 'method',
                key: 'method',
                width: 120,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 90,
                render: function (data, recode, index) {
                    return !recode.isResolverJson ? (React.createElement("div", null, "unknown")) : recode.endpoint.once ? (React.createElement(antd_1.Tooltip, { title: data },
                        React.createElement("div", null, data))) : (React.createElement(antd_1.Input, { onChange: function (e) { return onChangeForm(recode.endpoint, 'status', e.target.value); }, value: data }));
                },
            },
            {
                title: 'Delay',
                dataIndex: 'delay',
                key: 'delay',
                width: 90,
                render: function (data, recode, index) {
                    return !recode.isResolverJson ? (React.createElement("div", null, "unknown")) : recode.endpoint.once ? (React.createElement(antd_1.Tooltip, { title: data },
                        React.createElement("div", null, data))) : (React.createElement(antd_1.Input, { onChange: function (e) { return onChangeForm(recode.endpoint, 'delay', e.target.value); }, value: data }));
                },
            },
            {
                title: 'Mock',
                dataIndex: 'mock',
                key: 'mock',
                render: function (data, recode, index) {
                    return !recode.isResolverJson ? (React.createElement("div", null, "unknown")) : recode.endpoint.once ? (React.createElement(antd_1.Tooltip, { title: data },
                        React.createElement("div", null, data))) : (React.createElement(antd_1.Tooltip, { title: data },
                        React.createElement(antd_1.Input, { onChange: function (e) { return onChangeForm(recode.endpoint, 'mock', e.target.value); }, value: data })));
                },
            },
            {
                title: 'Action',
                key: 'action',
                width: 150,
                render: function (data, recode, index) {
                    return !recode.isResolverJson ? (React.createElement("div", null)) : recode.endpoint.once ? (React.createElement(antd_1.Space, null,
                        React.createElement(antd_1.Button, { onClick: function () { return onClickDelete(recode.endpoint); } }, "Delete"))) : (React.createElement(antd_1.Space, null,
                        React.createElement(antd_1.Button, { onClick: function () { return onClickReset(recode.endpoint); } }, "Reset"),
                        React.createElement(antd_1.Button, { onClick: function () { return onClickApply(recode.endpoint); }, disabled: isCheckChange(recode.endpoint) }, "Apply")));
                },
            },
        ];
        var data = endpoints.map(function (endpoint, index) {
            var isJson = isJsonResolver(endpoint.resolver);
            var status, delay, mock, isResolverJson;
            if (isJson) {
                var jsonResolver = endpoint.resolver;
                status = jsonResolver.code !== undefined ? jsonResolver.code : '200';
                delay = jsonResolver.delay !== undefined ? jsonResolver.delay : '0';
                var json = getJsonString(jsonResolver.json);
                mock = typeof json === 'object' ? JSON.stringify(json) : json;
                isResolverJson = true;
            }
            else {
                status = 'unknown';
                delay = 'unknown';
                mock = 'unknown';
                isResolverJson = false;
            }
            return {
                key: index,
                method: endpoint.once ? endpoint.method.toUpperCase() + ' [ONCE]' : endpoint.method.toUpperCase(),
                status: status,
                delay: delay,
                mock: mock,
                endpoint: endpoint,
                isResolverJson: isResolverJson,
            };
        });
        return React.createElement(antd_1.Table, { columns: columns, dataSource: data, pagination: false });
    };
    var renderEndpoints = (0, react_1.useMemo)(function () {
        if (!groupEndpoint)
            return undefined;
        var elements = [];
        groupEndpoint.forEach(function (values, url) {
            elements.push(React.createElement(antd_1.Collapse, { style: { marginTop: '10px', marginBottom: '10px' }, key: url },
                React.createElement(Panel, { style: { whiteSpace: 'pre' }, header: "\t".concat(url), key: "Panel-".concat(url) }, values && values.length > 0 && createTable(values))));
        });
        return elements;
    }, [groupEndpoint]);
    var onFinish = (0, react_1.useCallback)(function (values) {
        var newOnceEndpoint = {
            method: values.method,
            url: values.url,
            resolver: { json: getJsonString(values.mock), code: +values.status, delay: +values.delay },
            once: true,
            id: (0, lodash_1.uniqueId)('once'),
        };
        if (viewEndpoint) {
            var concatViewEndpoint = (0, lodash_1.cloneDeep)(viewEndpoint);
            concatViewEndpoint.splice(0, 0, newOnceEndpoint);
            setViewAndResetHandler(concatViewEndpoint);
            setLsEndpoints(concatViewEndpoint);
        }
    }, [viewEndpoint]);
    var onClickSetEndpoints = (0, react_1.useCallback)(function () {
        var lsEndpoints = window.localStorage.getItem(LS_ENDPOINTS);
        if (lsEndpoints) {
            var parsedEndpoints = JSON.parse(lsEndpoints);
            parsedEndpoints.forEach(function (endpoint) {
                if (!endpoint.resolver && initialEndpoint.current) {
                    var initEndpointHasResolver = initialEndpoint.current.find(function (init) {
                        return endpoint.method.toUpperCase() === init.method.toUpperCase() &&
                            endpoint.url === init.url &&
                            !isJsonResolver(init.resolver);
                    });
                    if (initEndpointHasResolver) {
                        endpoint.resolver = initEndpointHasResolver.resolver;
                    }
                }
            });
            setViewAndResetHandler(parsedEndpoints);
            setApplyLastEndpoints(parsedEndpoints);
        }
    }, []);
    if (!isEnabled || !worker || !isReady)
        return null;
    return (React.createElement(FooterToolbar_1.default, { className: 'antd-pro-footer-toolbar-toolbar-wrap', extra: React.createElement(React.Fragment, null,
            React.createElement(ToolbarHeader_1.ToolbarHeader, { isCollapsed: isCollapsed, onClickAllReset: onClickAllReset, onClickCollapseToggle: onClickCollapseToggle, onFinish: onFinish, onSearch: onSearch, onClickSetEndpoints: onClickSetEndpoints }),
            !isCollapsed && renderEndpoints && renderEndpoints) }));
};
exports.MswToolbar = MswToolbar;
//# sourceMappingURL=MswToolbar.js.map