import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { MswToolbar, Endpoint } from '@hnine-dev/msw-toolbar';
 import { SetupWorkerApi, RESTMethods } from 'msw';


 const getWorker = (): SetupWorkerApi | undefined => {
  if (process.env.NODE_ENV === 'development') {
      const { worker } = require('./mocks/browser');
 
      return worker;
  }
 
  return undefined;
  };
 
  const worker = getWorker();
 
  const endpoint = {
  url: 'https://url/api/token',
  method: RESTMethods.GET,
  resolver: { json: { token: 'QpwL5tke4Pnpja7X4' }, code: 200, delay: 0 },
  } as Endpoint;
 

ReactDOM.render(
  <React.StrictMode>
    <App />
    <MswToolbar worker={worker} isEnabled={true} endpoints={[endpoint]} />
  </React.StrictMode>,
  document.getElementById('root')
);

