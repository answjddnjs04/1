// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // 정원님이 주신 표에서 할당량이 살아있는 고성능 모델 리스트 (전부 소문자)
    const models = [
        "gemini-2.5-flash",        // 1순위: 메인 (RPM 5)
        "gemini-3.1-flash-lite",   // 2순위: 할당량 넉넉함 (RPM 15)
        "gemini-3-flash"           // 3순위: 예비용 (RPM 5)
    ];

    let lastError = null;

    for (const modelId of models) {
        try {
            // 최신 모델 인식을 위해 v1beta 경로 사용
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                }
            );

            const result = await response.json();

            // 성공하면 바로 반환
            if (response.ok && !result.error) {
                console.log(`[Success] 사용된 모델: ${modelId}`);
                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 에러가 "High Demand" 면 다음 모델로 즉시 이동
            lastError = result.error;
            console.warn(`[Retry] ${modelId} 실패 사유: ${lastError.message}`);

        } catch (err) {
            lastError = { message: err.message };
            console.warn(`[Retry] ${modelId} 통신 장애 발생`);
        }
    }

    // 모든 시도가 실패했을 때만 에러 반환
    return new Response(JSON.stringify({ error: lastError }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
}
