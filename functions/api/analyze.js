// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // [강력한 지시] 3.1 모델은 이 프롬프트를 아주 잘 이해합니다.
    const systemInstruction = `당신은 지식 마인드맵 분석 엔진입니다. 
다음 규칙을 엄격히 준수하세요:
1. 가중치: 새로운 질문(Topic)에 70%, 부모 문맥(Context)에 30% 비중을 둡니다.
2. 서론 생략: "파이썬은~" 같은 정의나 뻔한 설명은 절대 하지 마세요.
3. 즉각 답변: 질문에 대한 구체적인 '다음 단계'나 '핵심 내용'을 바로 본론만 말하세요.
4. 출력 형식: 반드시 아래 JSON 구조로만 응답하세요.

{
    "title": "핵심 키워드 1개",
    "summary": "서론 없이 바로 본론만 2~3문장으로 설명 (~하세요 체)"
}`;

    // 사용자 입력 데이터 재구성
    const userTopic = requestData.contents[0].parts[0].text;
    requestData.contents[0].parts[0].text = `${systemInstruction}\n\n입력 데이터: ${userTopic}`;

    try {
        // 정원님이 선택하신 3.1 Flash Lite 모델
        const MODEL_ID = "gemini-3.1-flash-lite";

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            }
        );

        const result = await response.json();
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
