/* api.js - Secure Gemini AI Knowledge Analysis Engine */

/**
 * [SECURITY NOTICE] 
 * 하드코딩된 API 키를 삭제하고 프록시 엔드포인트 또는 세션 저장을 사용합니다.
 * 클라이언트 코드에 키를 남기지 마세요.
 */

// Cloudflare Workers 또는 자체 서버 엔드포인트
const PROXY_ENDPOINT = "/api/analyze";

/**
 * API 키 획득 로직 (sessionStorage 활용 및 prompt 폴백)
 */
function getApiKey() {
    let key = sessionStorage.getItem("GEMINI_API_KEY");
    if (!key) {
        key = prompt("Gemini API 키가 설정되지 않았습니다. 테스트를 위해 API 키를 입력해주세요.\n(입력된 키는 브라우저 세션에만 임시 저장됩니다.)");
        if (key) {
            sessionStorage.setItem("GEMINI_API_KEY", key);
        }
    }
    return key;
}

/**
 * Gemini API를 호출하여 주제 분석 및 키워드 추출
 * @param {string} topic - 분석할 주제
 * @param {string} context - 부모 노드의 문맥 데이터 (선택 사항)
 */
export async function fetchAIAnalysis(topic, context = "") {
    const models = [
        "gemini-2.0-flash", 
        "gemini-2.0-flash-lite", 
        "gemini-1.5-flash",
        "gemini-flash-latest"
    ];

    const systemPrompt = `너는 반드시 순수 JSON 객체만 반환하는 API 서버 역할을 수행한다.
질문에 대해 분석한 뒤, 반드시 아래의 JSON 형식으로만 응답하라. 
마크다운 코드 블록(\`\`\`json)이나 설명 텍스트를 절대 포함하지 말고 오직 JSON 문자열만 출력하라.

응답 형식:
{
    "summary": "주제에 대한 전문적인 한국어 설명 (2-3문장)",
    "title": "주제를 대표하는 핵심 단어 (반드시 1단어)"
}

규칙:
1. title은 반드시 공백 없는 한 단어여야 함.
2. summary는 한국어로 작성하며 문맥(Context)이 주어지면 이를 고려하여 내용을 연결할 것.`;

    const userPrompt = `Context: ${context}\n\nTopic: ${topic}`;
    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
    };

    // 1. 먼저 백엔드 프록시(Cloudflare Workers 등) 시도
    try {
        const proxyResponse = await fetch(PROXY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: models[0], payload })
        });

        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            return processResponse(data, topic);
        }
    } catch (e) {
        console.log("[AI Analysis] Proxy endpoint not found or failed, falling back to direct browser request.");
    }

    // 2. 백엔드 실패 시 브라우저 직접 요청 (sessionStorage 키 사용)
    const apiKey = getApiKey();
    if (!apiKey) {
        return { title: topic, summary: "API 키가 입력되지 않아 분석을 수행할 수 없습니다." };
    }

    for (const model of models) {
        console.log(`[AI Analysis] Attempting direct request with model: ${model}`);
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 || response.status === 503) continue;
            if (!response.ok) continue;

            const data = await response.json();
            return processResponse(data, topic, model);

        } catch (error) {
            console.error(`[AI Analysis] Error with model ${model}:`, error);
            continue;
        }
    }

    return { title: topic, summary: "API 할당량이 모두 소진되었거나 요청에 실패했습니다." };
}

/**
 * API 응답 데이터 처리 유틸리티
 */
function processResponse(data, fallbackTitle, modelName = "Proxy") {
    try {
        let contentText = data.candidates[0].content.parts[0].text.trim();
        if (contentText.startsWith("```")) {
            contentText = contentText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
        }
        const result = JSON.parse(contentText);
        console.log(`[AI Analysis] Successfully analyzed using ${modelName}`);
        return {
            title: result.title || fallbackTitle,
            summary: result.summary || "분석 결과를 생성할 수 없습니다."
        };
    } catch (e) {
        console.error("Response Parsing Error:", e);
        throw e;
    }
}
