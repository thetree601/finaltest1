"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SecretsForm, { SecretsFormData } from "@/components/secrets-form";
import { updateSecret } from "@/components/secrets-list/mutations";

interface SecretsEditProps {
	secretId: string;
	initialData?: Partial<SecretsFormData>;
	existingImageUrl?: string | null | string[]; // 기존 이미지 URL 배열 추가
}

export default function SecretsEdit({ secretId, initialData, existingImageUrl }: SecretsEditProps) {
	const router = useRouter();

	const handleSubmit = async (data: SecretsFormData, updatedExistingImageUrls?: string[]) => {
		// 업데이트된 existingImageUrls가 있으면 사용, 없으면 초기값 사용
		const imageUrlsToUse = updatedExistingImageUrls !== undefined ? updatedExistingImageUrls : existingImageUrl;
		const result = await updateSecret(secretId, data, imageUrlsToUse);
		
		if (result.success) {
			// 수정 성공 후 상세 페이지로 이동 (캐시 무효화를 위해 window.location 사용)
			window.location.href = `/secrets/${secretId}`;
		} else {
			// 에러 처리
			alert(result.error || "비밀 수정에 실패했습니다.");
		}
	};

	const handleCancel = () => {
		router.push(`/secrets/${secretId}`);
	};

	return (
		<SecretsForm
			mode="edit"
			initialData={initialData}
			existingImageUrl={existingImageUrl}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	);
}

