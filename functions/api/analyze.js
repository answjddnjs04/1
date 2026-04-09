// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // 할당량과 성능을 고려한 최적의 순서
    const models = [
        "gemini-3.1-flash-lite", // 1순위: 성능 대비 넉넉한 할당량 (RPM 15)
        "gemini-2.5-flash",      // 2순위: 고성능 메인 모델 (RPM 5)
        "gemma-3-1b-it"          // 3순위: 무제한급 방어선 (RPD 14.4K) 
    ];

    let lastError = null;

    for (const modelId of models) {
        try {
            // Gemma와 Gemini 모두 v1beta 엔드포인트에서 호출 가능합니다.
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData),
                    signal: AbortSignal.timeout(6000) // 6초 안에 응답 없으면 다음 모델로
                }
            );

            const result = await response.json();

            if (response.ok && result.candidates && result.candidates.length > 0) {
                console.log(`[Success] 분석 성공 모델: ${modelId}`);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            lastError = result.error || { message: "Unknown error" };
            console.warn(`[Retry] ${modelId} 실패: ${lastError.message}`);

        } catch (err) {
            lastError = { message: err.message };
            console.warn(`[Retry] ${modelId} 연결 실패`);
        }
    }

    return new Response(JSON.stringify({ error: lastError }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
}
