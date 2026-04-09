// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // 정원님이 주신 표에서 할당량이 살아있는 고성능 모델 리스트
    const models = [
        "gemini-2.5-flash",      // 1순위: 메인 모델 (RPM 5)
        "gemini-3.1-flash-lite", // 2순위: 가장 넉넉한 할당량 (RPM 15)
        "gemini-3-flash"         // 3순위: 예비용 (RPM 5)
    ];

    let lastError = null;

    for (const modelId of models) {
        try {
            // v1beta 엔드포인트를 사용하여 최신 모델(3.1 등) 인식 보장
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                }
            );

            const result = await response.json();

            // 성공 시 즉시 반환
            if (response.ok && !result.error) {
                console.log(`[Success] 요청 성공 모델: ${modelId}`);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 실패 시 에러 기록 후 다음 모델로 시도
            lastError = result.error;
            console.warn(`[Retry] ${modelId} 실패: ${lastError.message}`);

        } catch (err) {
            lastError = { message: err.message };
            console.warn(`[Retry] ${modelId} 통신 에러`);
        }
    }

    // 모든 모델이 실패한 경우 최종 에러 반환
    return new Response(JSON.stringify({ error: lastError }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
}
