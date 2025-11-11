"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";

type PaymentRow = {
	id: string;
	transaction_key: string;
	amount: number | null;
	status: string; // "Paid" | "Cancel" 등
	created_at: string; // ISO
	start_at: string; // ISO
	end_at: string; // ISO
	end_grace_at: string; // ISO
	next_schedule_at: string | null; // ISO
	next_schedule_id: string | null;
};

type UsePaymentStatusResult = {
	isLoading: boolean;
	statusMessage: "구독중" | "Free";
	canCancel: boolean;
	canSubscribe: boolean;
	transactionKeyForCancel: string | null;
	refetch: () => void;
	// 체크리스트: 요구사항 충족 여부를 간단히 표기
	checklist: string[];
};

// 최신행을 고르기 위한 비교 유틸
function pickLatestByCreatedAt(a: PaymentRow | undefined, b: PaymentRow): PaymentRow {
	if (!a) return b;
	return new Date(a.created_at).getTime() >= new Date(b.created_at).getTime() ? a : b;
}

export function usePaymentStatus(): UsePaymentStatusResult {
	const query = useQuery({
		queryKey: ["payment-status"],
		queryFn: async () => {
			// 1-1) payment 테이블의 목록 조회
			const { data, error } = await supabase
				.from("payment")
				.select(
					"id, transaction_key, amount, status, created_at, start_at, end_at, end_grace_at, next_schedule_at, next_schedule_id"
				)
				.order("created_at", { ascending: false }); // created_at 기준 내림차순 정렬로 최신 데이터 먼저 조회
			if (error) throw error;
			const rows = (data ?? []) as PaymentRow[];

			// 1-1-1) transaction_key 그룹화 후 각 그룹에서 created_at 최신 1건 추출
			// 요구사항: transaction_key 그룹화 → 각 그룹에서 created_at 최신 1건 추출
			const groupMap = new Map<string, PaymentRow>();
			for (const row of rows) {
				if (!row.transaction_key) continue;
				// 각 transaction_key 그룹에서 created_at이 가장 최신인 레코드만 유지
				const current = groupMap.get(row.transaction_key);
				groupMap.set(row.transaction_key, pickLatestByCreatedAt(current, row));
			}
			const latestPerTx = Array.from(groupMap.values());

			// 1-1-2) status === "Paid" && start_at <= now <= end_grace_at
			const now = new Date();
			const active = latestPerTx.filter((row) => {
				// status가 "Paid"가 아니면 제외
				if (row.status !== "Paid") return false;
				// 기간 조건 확인
				const start = new Date(row.start_at);
				const endGrace = new Date(row.end_grace_at);
				return start.getTime() <= now.getTime() && now.getTime() <= endGrace.getTime();
			});

			return {
				all: rows,
				latestPerTx,
				active,
			};
		},
	});

	const {
		statusMessage,
		canCancel,
		canSubscribe,
		transactionKeyForCancel,
		checklist,
	} = useMemo(() => {
		if (query.isLoading || !query.data) {
			return {
				statusMessage: "Free" as const,
				canCancel: false,
				canSubscribe: false,
				transactionKeyForCancel: null,
				checklist: [] as string[],
			};
		}

		// active 배열을 created_at 기준으로 정렬하여 가장 최신 구독을 선택
		const sortedActive = [...query.data.active].sort((a, b) => {
			const timeA = new Date(a.created_at).getTime();
			const timeB = new Date(b.created_at).getTime();
			return timeB - timeA; // 내림차순 (최신이 먼저)
		});
		
		const hasActive = sortedActive.length > 0;
		const txKey = hasActive ? sortedActive[0].transaction_key : null;

		// 체크리스트 구성
		const list: string[] = [
			"[o] payment 목록 조회 (created_at 내림차순 정렬)",
			"[o] transaction_key 그룹화",
			"[o] 각 그룹에서 created_at 최신 1건 추출",
			"[o] status === 'Paid' && 기간(start_at~end_grace_at) 내 활성 여부 판단",
			hasActive ? "[o] 활성 구독 존재 → 상태메시지: 구독중, 취소 버튼 활성화" : "[o] 활성 구독 없음 → 상태메시지: Free, 구독하기 버튼 활성화",
		];

		return {
			statusMessage: hasActive ? ("구독중" as const) : ("Free" as const),
			canCancel: hasActive,
			canSubscribe: !hasActive,
			transactionKeyForCancel: txKey,
			checklist: list,
		};
	}, [query.isLoading, query.data]);

	return {
		isLoading: query.isLoading,
		statusMessage,
		canCancel,
		canSubscribe,
		transactionKeyForCancel,
		refetch: () => query.refetch(),
		checklist,
	};
}

