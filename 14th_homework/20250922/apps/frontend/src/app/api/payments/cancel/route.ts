import { NextRequest, NextResponse } from "next/server";

interface CancelRequestBody {
	transactionKey?: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: CancelRequestBody = await request.json().catch(() => ({}));

		if (!body?.transactionKey) {
			return NextResponse.json(
				{ success: false, error: "transactionKey가 필요합니다." },
				{ status: 400 }
			);
		}

		const portoneApiSecret = process.env.PORTONE_API_SECRET;
		if (!portoneApiSecret) {
			return NextResponse.json(
				{ success: false, error: "Portone API Secret이 설정되지 않았습니다." },
				{ status: 500 }
			);
		}

		const cancelResponse = await fetch(
			`https://api.portone.io/payments/${encodeURIComponent(body.transactionKey)}/cancel`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `PortOne ${portoneApiSecret}`,
				},
				body: JSON.stringify({
					reason: "취소 사유 없음",
				}),
			}
		);

		if (!cancelResponse.ok) {
			const errorData = await cancelResponse.json().catch(() => ({} as any));
			return NextResponse.json(
				{ success: false, error: errorData?.message || "결제 취소에 실패했습니다." },
				{ status: cancelResponse.status }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("결제 취소 API 오류:", error);
		return NextResponse.json(
			{ success: false, error: "서버 오류가 발생했습니다." },
			{ status: 500 }
		);
	}
}


