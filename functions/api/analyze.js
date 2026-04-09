// functions/api/analyze.js

export async function onRequestPost(context) {
    try {
        const API_KEY = context.env.GEMINI_API_KEY;
        const requestData = await context.request.json();

        // [중요] 정원님이 쓰고 싶은 모델명을 여기에 적으세요.
        // gemini-2.5-flash가 현재 API에서 지원된다면 아래 주소로 바로 작동합니다.
        const MODEL_NAME = "gemini-1.5-flash"; // 또는 "gemini-2.0-flash-exp" 등 사용 가능

        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            }
        );

        const result = await googleResponse.json();
        
        // 만약 구글에서 여전히 "모델을 찾을 수 없다"고 하면 그 에러를 브라우저로 그대로 보냅니다.
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
    }
}
