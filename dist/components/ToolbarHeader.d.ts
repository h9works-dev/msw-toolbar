/// <reference types="react" />
interface ToolbarHeaderProps {
    isCollapsed: boolean;
    onClickCollapseToggle: () => void;
    onClickAllReset: () => void;
    onFinish: (values: any) => void;
    onSearch: (value: string) => void;
    onClickSetEndpoints: () => void;
}
export declare const ToolbarHeader: ({ isCollapsed, onClickCollapseToggle, onClickAllReset, onFinish, onSearch, onClickSetEndpoints, }: ToolbarHeaderProps) => JSX.Element;
export {};
