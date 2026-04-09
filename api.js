/* api.js - Cloudflare Functions Proxy Client */

/**
 * [SECURITY NOTICE] 
 * 1. 브라우저에서 직접 Google API를 호출하는 모든 로직을 삭제했습니다.
 * 2. 모든 요청은 Cloudflare Pages Functions (/api/analyze)를 통해 처리됩니다.
 * 3. 클라이언트 코드에는 어떠한 API 키도 포함되지 않습니다.
 */

const ENDPOINT = "/api/analyze";

/**
 * 지식 분석 요청 실행 (Cloudflare Functions 전용)
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
    
    // Cloudflare Functions가 전달받을 표준 Google AI 페이로드 구성
    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
    };

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.error("[AI Analysis] Cloudflare Functions 설정 확인 필요: /api/analyze 경로를 찾을 수 없습니다.");
            }
            throw new Error(`API Proxy Error: ${response.status}`);
        }

        const data = await response.json();
        return parseAIResponse(data, topic);

    } catch (error) {
        console.error("[AI Analysis] Request failed:", error.message);
        return { 
            title: topic, 
            summary: "지식 분석 서버와 통신할 수 없습니다. Cloudflare Functions 설정을 확인해주세요." 
        };
    }
}

/**
 * 서버로부터 받은 응답 데이터를 파싱하는 유틸리티
 */
function parseAIResponse(data, fallbackTitle) {
    try {
        // 1. 데이터 구조가 정상인지 먼저 확인 (가장 중요!)
        if (!data || !data.candidates || data.candidates.length === 0) {
            console.error("[AI Analysis] API 응답에 결과가 없습니다:", data);
            
            // 만약 서버에서 에러 메시지를 보냈다면 출력
            if (data.error) {
                return { title: fallbackTitle, summary: `에러 발생: ${data.error.message}` };
            }
            return { title: fallbackTitle, summary: "AI가 응답을 생성하지 못했습니다. (세이프티 필터 또는 할당량 초과)" };
        }

        // 2. 텍스트 추출
        let contentText = data.candidates[0].content.parts[0].text.trim();
        
        // 3. JSON 추출 및 파싱 (기존 로직 유지하되 안전하게)
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) contentText = jsonMatch[0];
        
        const result = JSON.parse(contentText);
        return {
            title: result.title || fallbackTitle,
            summary: result.summary || "내용을 분석할 수 없습니다."
        };
    } catch (e) {
        console.error("[AI Analysis] 파싱 중 오류 발생:", e, "\n받은 데이터:", data);
        return { 
            title: fallbackTitle, 
            summary: "AI 응답 형식이 올바르지 않거나 분석에 실패했습니다." 
        };
    }
}
