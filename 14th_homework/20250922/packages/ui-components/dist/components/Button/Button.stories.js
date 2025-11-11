import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fn } from '@storybook/test';
import Button from './index';
const meta = {
    title: 'UI Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: '다양한 스타일과 크기의 버튼 컴포넌트입니다.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'danger', 'ghost'],
            description: '버튼의 스타일 변형',
        },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
            description: '버튼의 크기',
        },
        disabled: {
            control: { type: 'boolean' },
            description: '버튼 비활성화 여부',
        },
        loading: {
            control: { type: 'boolean' },
            description: '로딩 상태 표시 여부',
        },
        fullWidth: {
            control: { type: 'boolean' },
            description: '전체 너비 사용 여부',
        },
        type: {
            control: { type: 'select' },
            options: ['button', 'submit', 'reset'],
            description: 'HTML 버튼 타입',
        },
        children: {
            control: { type: 'text' },
            description: '버튼 내부 텍스트',
        },
    },
    args: { onClick: fn() },
};
export default meta;
// 기본 버튼
export const Default = {
    args: {
        children: '버튼',
    },
};
// Primary 버튼
export const Primary = {
    args: {
        variant: 'primary',
        children: 'Primary 버튼',
    },
};
// Secondary 버튼
export const Secondary = {
    args: {
        variant: 'secondary',
        children: 'Secondary 버튼',
    },
};
// Danger 버튼
export const Danger = {
    args: {
        variant: 'danger',
        children: 'Danger 버튼',
    },
};
// Ghost 버튼
export const Ghost = {
    args: {
        variant: 'ghost',
        children: 'Ghost 버튼',
    },
};
// 크기 변형
export const Small = {
    args: {
        size: 'small',
        children: 'Small 버튼',
    },
};
export const Medium = {
    args: {
        size: 'medium',
        children: 'Medium 버튼',
    },
};
export const Large = {
    args: {
        size: 'large',
        children: 'Large 버튼',
    },
};
// 비활성화 상태
export const Disabled = {
    args: {
        disabled: true,
        children: '비활성화된 버튼',
    },
};
// 로딩 상태
export const Loading = {
    args: {
        loading: true,
        children: '로딩 중...',
    },
};
// 전체 너비
export const FullWidth = {
    args: {
        fullWidth: true,
        children: '전체 너비 버튼',
    },
    parameters: {
        layout: 'padded',
    },
};
// 모든 변형 조합 예시
export const AllVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "primary", children: "Primary" }), _jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "danger", children: "Danger" }), _jsx(Button, { variant: "ghost", children: "Ghost" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx(Button, { size: "small", children: "Small" }), _jsx(Button, { size: "medium", children: "Medium" }), _jsx(Button, { size: "large", children: "Large" })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { disabled: true, children: "Disabled" }), _jsx(Button, { loading: true, children: "Loading" })] })] })),
    parameters: {
        docs: {
            description: {
                story: '모든 버튼 변형을 한 번에 확인할 수 있습니다.',
            },
        },
    },
};
