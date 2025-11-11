import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fn } from '@storybook/test';
import Input from './index';
const meta = {
    title: 'UI Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: '다양한 타입과 스타일의 입력 필드 컴포넌트입니다.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: { type: 'select' },
            options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
            description: '입력 필드의 타입',
        },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
            description: '입력 필드의 크기',
        },
        disabled: {
            control: { type: 'boolean' },
            description: '입력 필드 비활성화 여부',
        },
        required: {
            control: { type: 'boolean' },
            description: '필수 입력 여부',
        },
        error: {
            control: { type: 'boolean' },
            description: '에러 상태 여부',
        },
        fullWidth: {
            control: { type: 'boolean' },
            description: '전체 너비 사용 여부',
        },
        readOnly: {
            control: { type: 'boolean' },
            description: '읽기 전용 여부',
        },
        placeholder: {
            control: { type: 'text' },
            description: '플레이스홀더 텍스트',
        },
        label: {
            control: { type: 'text' },
            description: '라벨 텍스트',
        },
        errorMessage: {
            control: { type: 'text' },
            description: '에러 메시지',
        },
    },
    args: {
        onChange: fn(),
        onBlur: fn(),
        onFocus: fn(),
    },
};
export default meta;
// 기본 입력 필드
export const Default = {
    args: {
        placeholder: '텍스트를 입력하세요',
    },
};
// 라벨이 있는 입력 필드
export const WithLabel = {
    args: {
        label: '이름',
        placeholder: '이름을 입력하세요',
    },
};
// 필수 입력 필드
export const Required = {
    args: {
        label: '이메일',
        type: 'email',
        required: true,
        placeholder: '이메일을 입력하세요',
    },
};
// 에러 상태
export const Error = {
    args: {
        label: '비밀번호',
        type: 'password',
        error: true,
        errorMessage: '비밀번호는 8자 이상이어야 합니다',
        placeholder: '비밀번호를 입력하세요',
    },
};
// 크기 변형
export const Small = {
    args: {
        size: 'small',
        placeholder: 'Small 입력 필드',
    },
};
export const Medium = {
    args: {
        size: 'medium',
        placeholder: 'Medium 입력 필드',
    },
};
export const Large = {
    args: {
        size: 'large',
        placeholder: 'Large 입력 필드',
    },
};
// 비활성화 상태
export const Disabled = {
    args: {
        label: '비활성화된 필드',
        disabled: true,
        placeholder: '입력할 수 없습니다',
    },
};
// 읽기 전용
export const ReadOnly = {
    args: {
        label: '읽기 전용 필드',
        readOnly: true,
        value: '읽기 전용 값',
    },
};
// 전체 너비
export const FullWidth = {
    args: {
        label: '전체 너비 입력 필드',
        fullWidth: true,
        placeholder: '전체 너비를 사용합니다',
    },
    parameters: {
        layout: 'padded',
    },
};
// 다양한 타입들
export const Email = {
    args: {
        label: '이메일',
        type: 'email',
        placeholder: 'example@email.com',
    },
};
export const Password = {
    args: {
        label: '비밀번호',
        type: 'password',
        placeholder: '비밀번호를 입력하세요',
    },
};
export const Number = {
    args: {
        label: '나이',
        type: 'number',
        placeholder: '나이를 입력하세요',
    },
};
export const Tel = {
    args: {
        label: '전화번호',
        type: 'tel',
        placeholder: '010-1234-5678',
    },
};
export const URL = {
    args: {
        label: '웹사이트',
        type: 'url',
        placeholder: 'https://example.com',
    },
};
export const Search = {
    args: {
        label: '검색',
        type: 'search',
        placeholder: '검색어를 입력하세요',
    },
};
// 모든 변형 조합 예시
export const AllVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px', width: '400px' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsx("h3", { children: "\uD06C\uAE30 \uBCC0\uD615" }), _jsx(Input, { size: "small", placeholder: "Small" }), _jsx(Input, { size: "medium", placeholder: "Medium" }), _jsx(Input, { size: "large", placeholder: "Large" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsx("h3", { children: "\uC0C1\uD0DC \uBCC0\uD615" }), _jsx(Input, { label: "\uC815\uC0C1", placeholder: "\uC815\uC0C1 \uC0C1\uD0DC" }), _jsx(Input, { label: "\uC5D0\uB7EC", error: true, errorMessage: "\uC5D0\uB7EC\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4", placeholder: "\uC5D0\uB7EC \uC0C1\uD0DC" }), _jsx(Input, { label: "\uBE44\uD65C\uC131\uD654", disabled: true, placeholder: "\uBE44\uD65C\uC131\uD654 \uC0C1\uD0DC" }), _jsx(Input, { label: "\uC77D\uAE30 \uC804\uC6A9", readOnly: true, value: "\uC77D\uAE30 \uC804\uC6A9 \uAC12" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsx("h3", { children: "\uD0C0\uC785 \uBCC0\uD615" }), _jsx(Input, { label: "\uD14D\uC2A4\uD2B8", type: "text", placeholder: "\uD14D\uC2A4\uD2B8 \uC785\uB825" }), _jsx(Input, { label: "\uC774\uBA54\uC77C", type: "email", placeholder: "\uC774\uBA54\uC77C \uC785\uB825" }), _jsx(Input, { label: "\uBE44\uBC00\uBC88\uD638", type: "password", placeholder: "\uBE44\uBC00\uBC88\uD638 \uC785\uB825" }), _jsx(Input, { label: "\uC22B\uC790", type: "number", placeholder: "\uC22B\uC790 \uC785\uB825" })] })] })),
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                story: '모든 입력 필드 변형을 한 번에 확인할 수 있습니다.',
            },
        },
    },
};
