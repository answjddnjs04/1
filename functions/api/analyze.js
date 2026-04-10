// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // functions/api/analyze.js 수정 부분

    const systemInstruction = `당신은 공학 전문 지식 지도 생성 엔진입니다. 
사용자의 질문(Topic)에 70%, 부모 문맥(Context)에 30% 비중을 두어 분석하되, 다음 지침을 엄격히 따르세요:

1. [구체성] "계산하세요", "모델링하세요" 같은 모호한 동사 대신, 해당 주제의 '핵심 공식', '물리적 단위', '재료의 성질'을 구체적으로 설명하세요.
2. [공학적 접근] 고체역학이라면 응력($\sigma$), 변형률($\epsilon$), 탄성 계수($E$), 모멘트($M$) 등 실제 전공 용어와 관계를 언급하세요.
3. [중복 배제] 부모 노드에 나온 "자유물체도", "훅의 법칙" 등을 단순히 나열하지 말고, 현재 주제에 특화된 세부 이론(예: 모어 원, 보의 굽힘, 전단력도 등)으로 확장하세요.
4. [형식] 반드시 JSON으로 응답하세요.

{
    "title": "세부 주제명 (예: 전단 응력, 주응력 등)",
    "summary": "핵심 이론을 2~3문장으로 설명하세요. 수식적 관계를 포함하면 좋습니다. (~입니다 체 사용)"
}`;

{
    "title": "핵심 키워드 1개",
    "summary": "서론 없이 본론만 2~3문장 (~하세요 체)"
}`;

    const userTopic = requestData.contents[0].parts[0].text;
    requestData.contents[0].parts[0].text = `${systemInstruction}\n\n입력 데이터: ${userTopic}`;

    try {
        // [중요] 'preview'가 붙어야 API가 인식합니다.
        const MODEL_ID = "gemini-3.1-flash-lite-preview"; 

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
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
