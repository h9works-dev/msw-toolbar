import { useEffect, useCallback, useLayoutEffect, useRef, useState, useMemo } from 'react';
import FooterToolbar from 'ant-design-pro/lib/FooterToolbar';
import { Button, Collapse, Input, Table, Space, Tooltip, Popover, Form, Select } from 'antd';
import {
  SetupWorkerApi,
  RESTMethods,
  MockedRequest,
  RestContext,
  ResponseResolver,
  RequestHandler,
  rest,
  ResponseTransformer,
} from 'msw';
import { cloneDeep, isEqual, uniqueId } from 'lodash';
import { ToolbarHeader } from './ToolbarHeader';

import './MswToolbar.css';
import * as React from 'react';


const { Panel } = Collapse;
const LS_ENDPOINTS = 'endpoints';

export type JsonResolver = {
  code?: number; // default 200
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: NonNullable<any>;
  delay?: number; // default 0
};

export interface Endpoint {
  url: string;
  method: RESTMethods | string;
  resolver: ResponseResolver<MockedRequest, RestContext> | JsonResolver;
}

interface _Endpoint extends Endpoint {
  //using internal only
  once?: boolean;
  //once Endpoint id
  id?: string;
}

export interface MSWToolbarProps {
  /**
   * If the worker is not enabled, we won't ever load it and will just load children.
   */
  isEnabled?: boolean;
  /**
   * An instance of the MSW worker returned from `setupWorker`.
   */
  worker: SetupWorkerApi | undefined;

  endpoints: Endpoint[];
}

interface TableData {
  key: string | number;
  method: string;
  status: string;
  delay: string;
  mock: string;

  isResolverJson: boolean;
  endpoint: _Endpoint;
}

type isJsonResolverType = (payload: ResponseResolver<MockedRequest, RestContext> | JsonResolver) => boolean;

const isJsonResolver: isJsonResolverType = payload => (payload as JsonResolver).json !== undefined;

type endpointKeyGetterType = (endpoint: _Endpoint) => string;

export const MswToolbar = ({ isEnabled = false, worker, endpoints }: MSWToolbarProps) => {
  if ((isEnabled && !worker) || (isEnabled && worker && !worker.start)) {
    console.warn(
      'Unable to use MswToolbar',
    );
  }

  const workerRef = useRef<SetupWorkerApi>();
  const initialEndpoint = useRef<_Endpoint[]>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [groupEndpoint, setGroupEndpoint] = useState<Map<string, _Endpoint[]>>();
  const [viewEndpoint, setViewEndpoint] = useState<_Endpoint[]>();
  const lastApplyEndpoint = useRef<Map<string, _Endpoint>>(new Map<string, _Endpoint>());

  useLayoutEffect(() => {
    window.addEventListener('keydown', keyDownEvent, { passive: true });

    return () => {
      window.removeEventListener('keydown', keyDownEvent);
    };
  }, [isReady]);

  useLayoutEffect(() => {
    if(workerRef && workerRef.current) {
      workerRef.current.events.on('response:mocked', responseMockedEvent);
    }
    
    return () => {
      if(workerRef && workerRef.current) {
      workerRef.current.events.removeListener('response:mocked', responseMockedEvent);
      }
    };
  }, [viewEndpoint]);

  const setLsEndpoints = (data: _Endpoint[]) => {
    window.localStorage.setItem(LS_ENDPOINTS, JSON.stringify(data));
  };

  const responseMockedEvent = (res: Response, id: string) => {
    

    const onceId = res.headers.get('id');

    if (onceId && viewEndpoint && viewEndpoint.length > 0) {
      deleteWithOnceId(viewEndpoint, onceId);
    }
  };

  const keyDownEvent = (event: KeyboardEvent) => {
    if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
      if (isReady) {
        setIsReady(false);
        if(workerRef && workerRef.current) {
          workerRef.current.stop();
        }
        
      } else {
        setIsReady(true);
        if(workerRef && workerRef.current) {
          workerRef.current.start();
        }
        
      }
    }
  };
  useEffect(() => {
    if (!worker || !isEnabled || workerRef.current) return;

    const prepareWorker = async () => {
      worker.start();

      workerRef.current = worker;
      workerRef.current.printHandlers();
      setIsReady(true);
    };

    prepareWorker();
  }, [isEnabled, worker]);

  useEffect(() => {
    if (!isReady || !endpoints || endpoints.length === 0 || initialEndpoint.current) return;

    initialEndpoint.current = endpoints.map((endpoint: _Endpoint) => {
      if (isJsonResolver(endpoint.resolver)) {
        const jsonResolver = endpoint.resolver as JsonResolver;

        jsonResolver.json = getJsonString(jsonResolver.json);
      }

      return endpoint;
    });

    setApplyLastEndpoints(initialEndpoint.current, false);

    setViewAndResetHandler(initialEndpoint.current);
  }, [isReady, endpoints]);

  useEffect(() => {
    if (viewEndpoint) {
      const groupedEndpoint = groupBy(viewEndpoint, (endpoint: _Endpoint) => endpoint.url);
      setGroupEndpoint(groupedEndpoint);
    }
  }, [viewEndpoint]);

  const getKey = (endpoint: _Endpoint) => {
  
    
    let index;
    if(initialEndpoint.current) {
      index = initialEndpoint.current.findIndex(point => isEqual(point, endpoint));
    }
    

    return `${endpoint.url}_${endpoint.method}_${index}`;
  };

  const groupBy = (list: _Endpoint[], keyGetter: endpointKeyGetterType) => {
    const map = new Map();
    list.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  };


  const resetRequestHandlers = (requestHandlers: RequestHandler[]) => {
    if (requestHandlers && requestHandlers.length > 0) {
      console.info('reset!');
      if(workerRef && workerRef.current) {
        workerRef.current.resetHandlers(...requestHandlers);
        workerRef.current.printHandlers();
      }
      
    }
  };

  const setApplyLastEndpoints = (endpoints: _Endpoint[], isSaveToLS = true): void => {
    endpoints.forEach((endpoint: _Endpoint) => lastApplyEndpoint.current.set(getKey(endpoint), endpoint));

    if (isSaveToLS) {
      setLsEndpoints(endpoints);
    }
  };

  const getRequestHandlers = (endpointList: _Endpoint[]): RequestHandler[] => {
    return endpointList.map((endpoint: _Endpoint) => {
      let resolver: ResponseResolver<MockedRequest, RestContext>;

      if (isJsonResolver(endpoint.resolver)) {
        const jsonResolver = endpoint.resolver as JsonResolver;

        resolver = (req, res, ctx) => {
          const ctxArray: ResponseTransformer[] = [];
          ctxArray.push(ctx.status(jsonResolver.code !== undefined ? jsonResolver.code : 200));
          ctxArray.push(ctx.delay(jsonResolver.delay !== undefined ? jsonResolver.delay : 0));
          ctxArray.push(ctx.json(getJsonString(jsonResolver.json)));

          if (endpoint.once && endpoint.id) {
            ctxArray.push(ctx.set('id', endpoint.id));
          }

          return res(...ctxArray);
        };
      } else {
        resolver = endpoint.resolver as ResponseResolver<MockedRequest, RestContext>;
      }

      const method: string = endpoint.method.toString().toLowerCase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (rest as any)[method](endpoint.url, resolver);
    });
  };

  const onSearch = useCallback(
    (value: string) => {
      

      if (viewEndpoint) {
        const filteredEndpoints = viewEndpoint.filter((endpoint: _Endpoint) =>
          endpoint.url.toLowerCase().includes(value.trim().toLowerCase()),
        );

        const groupedEndpoint = groupBy(filteredEndpoints, (endpoint: _Endpoint) => endpoint.url);

        setGroupEndpoint(groupedEndpoint);
      }
    },
    [viewEndpoint],
  );

  const onClickAllReset = useCallback(() => {
    if (initialEndpoint.current) {
      setApplyLastEndpoints(initialEndpoint.current);

      setViewAndResetHandler(initialEndpoint.current);
    }
  }, []);

  const findEndpointIndex = (endpoints: _Endpoint[], endpoint: _Endpoint): number => {
    return endpoints.findIndex(
      (iEndpoint: _Endpoint) =>
        !iEndpoint.once &&
        iEndpoint.method.toUpperCase() === endpoint.method.toUpperCase() &&
        iEndpoint.url === endpoint.url,
    );
  };

  const onClickReset = useCallback(
    (endpoint: _Endpoint) => {
      if (viewEndpoint && initialEndpoint.current) {
        const cloneViewEndpoint = cloneDeep(viewEndpoint);
        const findIEndpointIndex = findEndpointIndex(initialEndpoint.current, endpoint);

        if (findIEndpointIndex !== -1) {
          cloneViewEndpoint.splice(findIEndpointIndex, 1, initialEndpoint.current[findIEndpointIndex]);

          setApplyLastEndpoints(cloneViewEndpoint);

          setViewAndResetHandler(cloneViewEndpoint);
        }
      }
    },
    [viewEndpoint],
  );

  const setViewAndResetHandler = (viewEndpoints: _Endpoint[]) => {
    const requestHandlers = getRequestHandlers(viewEndpoints);

    resetRequestHandlers(requestHandlers);
    setViewEndpoint(viewEndpoints);
  };

  const deleteWithOnceId = (viewEndpoint: _Endpoint[], onceId: string) => {
    if (viewEndpoint && onceId) {
      const clonedViewEndpoint = cloneDeep(viewEndpoint);

      const index = clonedViewEndpoint.findIndex((endpoint: _Endpoint) => endpoint.id === onceId);

      if (index !== -1) {
        clonedViewEndpoint.splice(index, 1);

        setViewAndResetHandler(clonedViewEndpoint);
      }
    }
  };

  const onClickDelete = useCallback(
    (endpoint: _Endpoint) => {
      if (endpoint.once && endpoint.id && viewEndpoint) {
        deleteWithOnceId(viewEndpoint, endpoint.id);
      }
    },
    [viewEndpoint],
  );

  const onClickApply = useCallback(
    (endpoint: _Endpoint) => {
      if (viewEndpoint) {
        const cloneViewEndpoint = cloneDeep(viewEndpoint);

        const findVEndpointIndex = findEndpointIndex(cloneViewEndpoint, endpoint);

        if (findVEndpointIndex !== -1) {
          cloneViewEndpoint.splice(findVEndpointIndex, 1, endpoint);

          setApplyLastEndpoints(cloneViewEndpoint);

          setViewAndResetHandler(cloneViewEndpoint);
        }
      }
    },
    [viewEndpoint],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJsonString = (value: NonNullable<any>) => {
    let json;
    try {
      json = JSON.parse(value);
    } catch (e) {
      json = value;
    }

    return json;
  };

  const onChangeForm = useCallback(
    (endpoint: _Endpoint, type: string, value: string) => {
      if (viewEndpoint) {
        const data = cloneDeep(endpoint);

        const jsonResolver = data.resolver as JsonResolver;

        if (type === 'status') {
          if (value === '') {
            jsonResolver.code = 0;
          } else if (isNaN(+value)) {
            return;
          } else {
            jsonResolver.code = +value;
          }
        } else if (type === 'delay') {
          if (value === '') {
            jsonResolver.delay = 0;
          } else if (isNaN(+value)) {
            return;
          } else {
            jsonResolver.delay = +value;
          }
        } else {
          jsonResolver.json = getJsonString(value);
        }

        const cloneViewEndpoint = cloneDeep(viewEndpoint);

        const findVEndpointIndex = findEndpointIndex(cloneViewEndpoint, endpoint);

        if (findVEndpointIndex !== -1) {
          cloneViewEndpoint.splice(findVEndpointIndex, 1, data);

          setViewEndpoint(cloneViewEndpoint);
        }
      }
    },
    [viewEndpoint],
  );

  const onClickCollapseToggle = useCallback(() => {
    setIsCollapsed(state => !state);
  }, []);

  const createTable = (endpoints: _Endpoint[]) => {
    const isCheckChange = (endpoint: _Endpoint) => {
      if (lastApplyEndpoint.current && lastApplyEndpoint.current.size !== 0) {
        const key = getKey(endpoint);

        const findEndpoint = lastApplyEndpoint.current.get(key);

        return isEqual(findEndpoint, endpoint);
      }

      return false;
    };

    const columns = [
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
        render: (data: string, recode: TableData, index: number) =>
          !recode.isResolverJson ? (
            <div>unknown</div>
          ) : recode.endpoint.once ? (
            <Tooltip title={data}>
              <div>{data}</div>
            </Tooltip>
          ) : (
            <Input onChange={e => onChangeForm(recode.endpoint, 'status', e.target.value)} value={data} />
          ),
      },
      {
        title: 'Delay',
        dataIndex: 'delay',
        key: 'delay',
        width: 90,
        render: (data: string, recode: TableData, index: number) =>
          !recode.isResolverJson ? (
            <div>unknown</div>
          ) : recode.endpoint.once ? (
            <Tooltip title={data}>
              <div>{data}</div>
            </Tooltip>
          ) : (
            <Input onChange={e => onChangeForm(recode.endpoint, 'delay', e.target.value)} value={data} />
          ),
      },
      {
        title: 'Mock',
        dataIndex: 'mock',
        key: 'mock',
        render: (data: string, recode: TableData, index: number) =>
          !recode.isResolverJson ? (
            <div>unknown</div>
          ) : recode.endpoint.once ? (
            <Tooltip title={data}>
              <div>{data}</div>
            </Tooltip>
          ) : (
            <Tooltip title={data}>
              <Input onChange={e => onChangeForm(recode.endpoint, 'mock', e.target.value)} value={data} />
            </Tooltip>
          ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 150,
        render: (data: string, recode: TableData, index: number) =>
          !recode.isResolverJson ? (
            <div></div>
          ) : recode.endpoint.once ? (
            <Space>
              <Button onClick={() => onClickDelete(recode.endpoint)}>Delete</Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={() => onClickReset(recode.endpoint)}>Reset</Button>
              <Button onClick={() => onClickApply(recode.endpoint)} disabled={isCheckChange(recode.endpoint)}>
                Apply
              </Button>
            </Space>
          ),
      },
    ];

    const data = endpoints.map((endpoint: _Endpoint, index: number) => {
      const isJson = isJsonResolver(endpoint.resolver);

      let status, delay, mock, isResolverJson;

      if (isJson) {
        const jsonResolver = endpoint.resolver as JsonResolver;
        status = jsonResolver.code !== undefined ? jsonResolver.code : '200';
        delay = jsonResolver.delay !== undefined ? jsonResolver.delay : '0';

        const json = getJsonString(jsonResolver.json);

        mock = typeof json === 'object' ? JSON.stringify(json) : json;
        isResolverJson = true;
      } else {
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
        isResolverJson,
      } as TableData;
    });

    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const renderEndpoints = useMemo(() => {
    if (!groupEndpoint) return undefined;

    const elements: React.ReactNode[] = [];

    groupEndpoint.forEach((values: _Endpoint[], url: string) => {
      elements.push(
        <Collapse style={{ marginTop: '10px', marginBottom: '10px' }} key={url}>
          <Panel style={{ whiteSpace: 'pre' }} header={`\t${url}`} key={`Panel-${url}`}>
            {values && values.length > 0 && createTable(values)}
          </Panel>
        </Collapse>,
      );
    });

    return elements;
  }, [groupEndpoint]);

  const onFinish = useCallback(
    values => {
      

      const newOnceEndpoint = {
        method: values.method,
        url: values.url,
        resolver: { json: getJsonString(values.mock), code: +values.status, delay: +values.delay },
        once: true,
        id: uniqueId('once'),
      } as _Endpoint;

      if (viewEndpoint) {
        const concatViewEndpoint: _Endpoint[] = cloneDeep(viewEndpoint);

        concatViewEndpoint.splice(0, 0, newOnceEndpoint);

        setViewAndResetHandler(concatViewEndpoint);
        setLsEndpoints(concatViewEndpoint);
      }
    },
    [viewEndpoint],
  );

  const onClickSetEndpoints = useCallback(() => {
    const lsEndpoints = window.localStorage.getItem(LS_ENDPOINTS);

    if (lsEndpoints) {
      const parsedEndpoints = JSON.parse(lsEndpoints);

      // if there's endpoint which hasn't resolver, apply resolver from initialEndpoints
      parsedEndpoints.forEach((endpoint: _Endpoint) => {
        if (!endpoint.resolver && initialEndpoint.current ) {
          const initEndpointHasResolver = initialEndpoint.current.find(
            init =>
              endpoint.method.toUpperCase() === init.method.toUpperCase() &&
              endpoint.url === init.url &&
              !isJsonResolver(init.resolver),
          );

          if (initEndpointHasResolver) {
            endpoint.resolver = initEndpointHasResolver.resolver;
          }
        }
      });

      setViewAndResetHandler(parsedEndpoints);

      setApplyLastEndpoints(parsedEndpoints);
    }
  }, []);

  if (!isEnabled || !worker || !isReady) return null;

  return (
    <FooterToolbar
      className={'antd-pro-footer-toolbar-toolbar-wrap'}
      extra={
        <>
          <ToolbarHeader
            isCollapsed={isCollapsed}
            onClickAllReset={onClickAllReset}
            onClickCollapseToggle={onClickCollapseToggle}
            onFinish={onFinish}
            onSearch={onSearch}
            onClickSetEndpoints={onClickSetEndpoints}
          />
          {!isCollapsed && renderEndpoints && renderEndpoints}
        </>
      }
    ></FooterToolbar>
  );
};
