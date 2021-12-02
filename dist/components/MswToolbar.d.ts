/// <reference types="react" />
import { SetupWorkerApi, RESTMethods, MockedRequest, RestContext, ResponseResolver } from 'msw';
import './MswToolbar.css';
export declare type JsonResolver = {
    code?: number;
    json: NonNullable<any>;
    delay?: number;
};
export interface Endpoint {
    url: string;
    method: RESTMethods | string;
    resolver: ResponseResolver<MockedRequest, RestContext> | JsonResolver;
}
export interface MSWToolbarProps {
    isEnabled?: boolean;
    worker: SetupWorkerApi | undefined;
    endpoints: Endpoint[];
}
export declare const MswToolbar: ({ isEnabled, worker, endpoints }: MSWToolbarProps) => JSX.Element | null;
