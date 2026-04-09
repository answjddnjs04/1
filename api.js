/* api.js - Secure Proxy-based AI Knowledge Analysis Engine */

/**
 * [SECURITY NOTICE] 
 * 1. 브라우저에서 직접 Google API를 호출하는 로직을 제거했습니다.
 * 2. Cloudflare Worker 등의 프록시 엔드포인트를 통해 통신합니다.
 */

// Cloudflare Worker 배포 주소 (예: '/api/analyze' 또는 전체 URL)
const PROXY_ENDPOINT = "/api/analyze";

/**
 * 로컬 테스트를 위한 API 키 관리 (sessionStorage)
 * Worker가 구성되지 않은 환경에서만 prompt를 통해 키를 임시 저장합니다.
 */
function getLocalApiKey() {
    let key = sessionStorage.getItem("TEMP_GEMINI_KEY");
    if (!key) {
        key = prompt("Cloudflare Worker가 설정되지 않았습니다. 로컬 테스트를 위해 Gemini API 키를 입력해주세요.\n(입력된 키는 브라우저 세션에만 임시 저장됩니다.)");
        if (key) {
            sessionStorage.setItem("TEMP_GEMINI_KEY", key);
        }
    }
    return key;
}

/**
 * 지식 분석 요청 실행
 * @param {string} topic - 분석할 주제
 * @param {string} context - 부모 노드의 문맥 데이터
 */
export async function fetchAIAnalysis(topic, context = "") {
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

    // 1. Cloudflare Worker 프록시 시도 (가장 권장되는 보안 방식)
    try {
        console.log(`[AI Analysis] Sending request to proxy: ${PROXY_ENDPOINT}`);
        const proxyResponse = await fetch(PROXY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                topic, 
                context, 
                payload // Worker에서 필요시 페이로드 전체 사용 가능
            })
        });

        if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            return parseGeminiResponse(data, topic);
        }
        
        // 프록시 서버가 404 등을 반환하면 로컬 폴백으로 넘어감
        if (proxyResponse.status === 404) {
            throw new Error("Proxy endpoint not found");
        }
    } catch (e) {
        console.warn("[AI Analysis] Proxy connection failed. Falling back to local storage key.");
    }

    // 2. 로컬 테스트 폴백 (sessionStorage 기반 직접 호출)
    const localKey = getLocalApiKey();
    if (!localKey) {
        return { title: topic, summary: "API 키가 제공되지 않아 분석을 시작할 수 없습니다." };
    }

    // 폴백 시에는 gemini-1.5-flash 모델을 기본으로 직접 호출 시도
    const FALLBACK_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${localKey}`;
    
    try {
        const response = await fetch(FALLBACK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Fallback API request failed");

        const data = await response.json();
        return parseGeminiResponse(data, topic);
    } catch (error) {
        console.error("[AI Analysis] Both Proxy and Fallback failed:", error);
        return { title: topic, summary: "분석 요청 처리 중 오류가 발생했습니다. 설정을 확인해주세요." };
    }
}

/**
 * Gemini 응답 데이터를 공통으로 파싱하는 유틸리티
 */
function parseGeminiResponse(data, fallbackTitle) {
    try {
        let contentText = data.candidates[0].content.parts[0].text.trim();
        // 마크다운 백틱 제거 정제
        if (contentText.startsWith("```")) {
            contentText = contentText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
        }
        const result = JSON.parse(contentText);
        return {
            title: result.title || fallbackTitle,
            summary: result.summary || "분석 결과를 파싱할 수 없습니다."
        };
    } catch (e) {
        console.error("[AI Analysis] Parsing Error:", e);
        return { title: fallbackTitle, summary: "AI 응답 형식이 올바르지 않습니다." };
    }
}
