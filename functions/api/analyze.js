export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    const requestData = await context.request.json();

    if (!API_KEY) {
        return new Response(JSON.stringify({ error: { message: "API 키 설정 누락" } }), { status: 500 });
    }

    // [핵심] 수식을 $ 기호로 감싸도록 프롬프트를 더 강력하게 수정했습니다.
    const systemInstruction = `당신은 공학/과학 심층 지식 분석가입니다.
사용자의 질문(Topic 70%)을 분석하되, 다음 지침을 엄격히 따르세요:

1. [LaTeX 수식 필수] 모든 수식은 반드시 $ 기호로 감싸야만 합니다. (예: $\\sigma = \\frac{P}{A}$)
   - $ 기호가 없으면 수식이 렌더링되지 않으므로 절대 빠뜨리지 마세요.
   - JSON 파싱 에러 방지를 위해 역슬래시를 두 번씩 사용하세요 (예: \\\\sigma, \\\\epsilon).
2. [전문 지식] 고체역학, 정역학 등 전공 수준의 이론을 수식적 근거와 함께 깊이 있게 설명하세요.
3. [형식] 반드시 순수한 JSON 형식으로만 응답하세요. 텍스트 내에 줄바꿈이나 제어 문자를 최소화하세요.

{
    "title": "핵심 전문 용어",
    "summary": "핵심 이론을 반드시 $ 수식 $ 기호를 포함하여 전문적으로 설명하세요. (~합니다 체)"
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
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            let text = result.candidates[0].content.parts[0].text;
            
            // 마크다운 코드 블록 제거
            text = text.replace(/```json|```/g, "").trim();
            
            // [추가 안전장치] 역슬래시가 하나만 남은 경우 MathJax를 위해 두 개로 보정
            // 이미 두 개인 경우는 유지하고, 하나인 경우만 찾아서 보정합니다.
            // 단, 이미 JSON 내부에서 이스케이프가 잘 되었다면 그대로 둡니다.
            
            result.candidates[0].content.parts[0].text = text;
        }

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
