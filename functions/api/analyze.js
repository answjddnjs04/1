// functions/api/analyze.js

export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: { message: "API 키 설정이 누락되었습니다." } }), { status: 500 });
    }

    try {
        const requestData = await context.request.json();

        // 정원님이 선택하신 무제한급 체력의 모델
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

        // 응답 성공 여부 확인
        if (response.ok) {
            return new Response(JSON.stringify(result), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // 구글에서 에러 응답을 준 경우
            return new Response(JSON.stringify(result), { 
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
