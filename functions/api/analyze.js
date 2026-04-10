export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: { message: "API 키 설정 누락" } }), { status: 500 });
    }

    try {
        const requestData = await context.request.json();

        // [개방형 프롬프트] 제약을 풀고 전문성을 강화했습니다.
        const systemInstruction = `당신은 공학 및 과학 분야의 심층 지식 분석가입니다. 
사용자의 질문(Topic 70%)을 중심으로 지식의 지도를 확장하되, 다음 원칙을 따르세요:

1. [전문 지식 해방] 단순 요약에 갇히지 마세요. 개념의 근원, 물리적 의미, 그리고 전공 수준의 심화 이론을 자유롭게 서술하세요.
2. [LaTeX 수식 활용] 관계를 명확히 하기 위해 LaTeX 수식을 적극적으로 사용하세요. (예: $\sigma = E\epsilon$, $\tau = \frac{Tr}{J}$ 등)
   - 모든 수식은 $ 기호로 감싸서 표현하세요.
3. [지식 확장] 부모 문맥(30%)을 토대로 하되, 거기서 멈추지 말고 관련된 상위/하위/응용 이론으로 과감하게 지평을 넓히세요.
4. [어조] 지식을 전수하는 전문가의 태도로, "합니다" 체를 사용하여 정보 밀도가 높은 문장을 작성하세요.

{
    "title": "가장 적절한 전문 용어",
    "summary": "핵심 이론과 수식적 근거를 포함하여 깊이 있게 설명하세요. (2~4문장)"
}`;

        const userTopic = requestData.contents[0].parts[0].text;
        requestData.contents[0].parts[0].text = `${systemInstruction}\n\n분석할 대상: ${userTopic}`;

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
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
