// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // [수정된 프롬프트] 70:30 법칙과 '반복 금지'를 극단적으로 강조
    const systemInstruction = `당신은 지식 마인드맵의 분석 엔진입니다.
지침을 어길 시 서비스가 중단되니 다음 규칙을 엄수하세요:

1. [가중치] 새로 입력된 질문(Topic)에 70%의 비중을 두고 '구체적인 실행 방법'을 제시하세요. 부모 문맥(Context)은 30%만 참고하여 흐름만 유지하세요.
2. [절대 금지] "파이썬은 배우기 쉽고..." 같은 서술형 정의나 개요를 절대 반복하지 마세요. 이미 알고 있는 내용은 생략하세요.
3. [형식] 질문에 대한 '직설적인 답변'만 JSON으로 출력하세요.
   - 예: "뭐부터 해야할까" -> "파이썬 설치 및 VS Code 세팅부터 시작하세요."

{
    "summary": "서론 빼고 바로 본론만 말하세요. (~하세요 체 사용)",
    "title": "가장 중요한 핵심 명사 1개"
}`;

    // 사용자 입력 재구성
    const userTopic = requestData.contents[0].parts[0].text; 
    requestData.contents[0].parts[0].text = `${systemInstruction}\n\n사용자 질문(70% 비중): ${userTopic}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-1b-it:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            }
        );

        const result = await response.json();
        return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
