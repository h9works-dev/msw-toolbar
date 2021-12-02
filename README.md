# Msw-Toolbar

It is a toolbar component library to improve the usability of msw.

### Requirements

- [msw](https://mswjs.io/)
- [msw install](https://mswjs.io/docs/getting-started/install)

### what is provided 

    1. Rest api endpoint management (json)
    2. Add an endpoint that is used only once
    3. Previous endpoint state load function
    4. msw use toggle function -> showcut provided (shift + (cmd or ctrl) + m)

### How to use

There are two primary ways to use this component:

1. The first step to apply the MswToolbar is to create an Msw Worker that will be managed inside the Toolbar.

    - [msw-init](https://mswjs.io/docs/getting-started/integrate/browser)

   ```javascript
    import { setupWorker } from 'msw';
    export const worker = setupWorker();
   ```

2. Then, you can define the endpoints to be managed by the Toolbar and pass it to the Toolbar component's props.

   ```javascript
    import { MswToolbar, Endpoint } from 'msw-toolbar';
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
    url: 'https://url/api/login',
    method: RESTMethods.POST,
    resolver: { json: { token: 'QpwL5tke4Pnpja7X4' }, code: 200, delay: 1000 },
    } as Endpoint;

    ReactDOM.render(
    <React.StrictMode>
        <App />
        <MswToolbar worker={worker} isEnabled={true} endpoints={[endpoint]} />
    </React.StrictMode>,
    document.getElementById('root')
    );
   ```
   recommended to use it in higher-level components.




