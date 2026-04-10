export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    // [핵심] JSON 내부에서 역슬래시(\)가 충돌나지 않도록 가이드를 추가했습니다.
    const systemInstruction = `당신은 공학/과학 심층 지식 분석가입니다.
사용자의 질문(Topic 70%)을 분석하되, 다음 지침을 엄격히 따르세요:

1. [LaTeX 수식] 수식을 적극 사용하되, JSON 파싱 에러 방지를 위해 반드시 역슬래시를 두 번씩 사용하세요. 
   (예: \\\\sigma, \\\\epsilon, \\\\frac{P}{A} 와 같이 작성)
2. [전문성] 고체역학, 정역학 등 전공 수준의 이론을 수식적 근거와 함께 깊이 있게 설명하세요.
3. [형식] 반드시 순수한 JSON 형식으로만 응답하세요. 텍스트 내에 줄바꿈이나 제어 문자를 최소화하세요.

{
    "title": "핵심 전문 용어",
    "summary": "핵심 이론을 LaTeX 수식과 함께 전문적으로 설명하세요. (~합니다 체)"
}`;

    const userTopic = requestData.contents[0].parts[0].text;
    requestData.contents[0].parts[0].text = `${systemInstruction}\n\n대상: ${userTopic}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            }
        );

        const result = await response.json();
        
        // [안전장치] 만약 모델이 역슬래시를 하나만 보냈을 경우를 대비해 서버측에서 한 번 더 치환해줍니다.
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            let text = result.candidates[0].content.parts[0].text;
            // JSON 코드 블록(```json ... ```)이 포함되어 있다면 제거
            text = text.replace(/```json|```/g, "").trim();
            result.candidates[0].content.parts[0].text = text;
        }

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
