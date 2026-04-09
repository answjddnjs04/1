// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: { message: "API 키 설정 누락" } }), { status: 500 });
    }

    try {
        const requestData = await context.request.json();

        // 할당량이 가장 넉넉한 3.1 모델을 1순위로 배치합니다.
        const models = [
            "gemini-3.1-flash-lite", // RPM 15 (가장 안정적)
            "gemini-2.5-flash",      // RPM 5
            "gemini-3-flash"         // RPM 5
        ];

        let lastError = { message: "모든 모델이 응답에 실패했습니다." };

        for (const modelId of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestData),
                        signal: AbortSignal.timeout(8000) // 8초 넘으면 다음 모델로 패스
                    }
                );

                const result = await response.json();

                // 1. 응답이 성공적이고 결과가 있는 경우
                if (response.ok && result.candidates && result.candidates.length > 0) {
                    console.log(`[Success] 분석 완료: ${modelId}`);
                    return new Response(JSON.stringify(result), {
                        headers: { "Content-Type": "application/json" }
                    });
                }

                // 2. 구글에서 에러 응답을 보낸 경우 기록하고 다음 모델 시도
                if (result.error) {
                    lastError = result.error;
                    console.warn(`[Retry] ${modelId} 거절: ${lastError.message}`);
                }

            } catch (err) {
                console.warn(`[Retry] ${modelId} 연결 실패: ${err.message}`);
                lastError = { message: err.message };
            }
        }

        // 모든 모델 실패 시 마지막 에러 반환
        return new Response(JSON.stringify({ error: lastError }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });

    } catch (globalErr) {
        return new Response(JSON.stringify({ error: { message: globalErr.message } }), { status: 500 });
    }
}
