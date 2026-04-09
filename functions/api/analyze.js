// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // 1. 가중치 로직을 프롬프트에 주입 (신규 70 : 부모 30)
    // 젬마가 이전 말만 반복하지 않도록 '새로운 관점'을 강제합니다.
    const systemInstruction = `너는 마인드맵 지식 확장 엔진이다.
분석 시 다음 가중치를 반드시 준수하라:
- [핵심] 현재 입력된 'Topic'(새 질문)의 중요도: 70%
- [참고] 'Context'(부모 노드)와의 연관성 유지: 30%

응답은 반드시 아래 JSON 형식으로만 하며, 이전 응답과 겹치지 않는 새로운 세부 지식을 제공하라.
{
    "summary": "한국어 설명 2~3문장 (새로운 정보를 우선하여 작성)",
    "title": "대표 핵심 단어 (1단어)"
}`;

    // 기존 요청 데이터의 프롬프트를 우리가 설정한 가중치 로직으로 재구성
    const userTopic = requestData.contents[0].parts[0].text; 
    requestData.contents[0].parts[0].text = `${systemInstruction}\n\n입력 데이터:\n${userTopic}`;

    try {
        const MODEL_ID = "gemma-3-1b-it"; 

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
