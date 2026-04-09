// functions/api/analyze.js
export async function onRequestPost(context) {
    try {
        const API_KEY = context.env.GEMINI_API_KEY;
        const requestData = await context.request.json();

        // 정원님이 말씀하신 바로 그 모델입니다.
        const MODEL_NAME = "gemini-2.5-flash"; 

        // 최신 모델을 인식하는 v1beta 엔드포인트를 사용합니다.
        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            }
        );

        const result = await googleResponse.json();
        
        // 에러가 나더라도 그 내용을 정직하게 브라우저로 전달합니다.
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
