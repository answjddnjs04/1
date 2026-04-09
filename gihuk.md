📝 기획 의도 및 상세 가이드: AI 대화형 지식 확장 마인드맵
1. 기획 의도 (Mission Statement)
"막연한 목표를 시각적인 지식의 지도로 변환하여 학습의 길을 잃지 않게 한다."

일반적인 LLM과의 대화는 휘발성이 강합니다. 사용자가 "영어 원서 읽기"라는 목표를 가지고 대화할 때, 새로운 문법이나 단어 개념이 나와도 대화창 너머로 사라지기 쉽습니다. 본 프로젝트는 대화의 핵심 키워드를 즉시 '마인드맵 노드'로 고정시킴으로써, 사용자가 자신의 학습 경로를 시각적으로 확인하고 저장할 수 있는 **'지식 빌딩 시스템'**을 지향합니다.

2. 핵심 사용자 경험 (UX Scenario)
목표 설정: 사용자가 중앙에 "파이썬 마스터하기"라는 루트 노드를 만듭니다.

탐색적 대화: "파이썬에서 가장 먼저 배워야 할 게 뭐야?"라고 묻습니다.

지식 확장: AI는 "변수와 자료형"이라고 답하며, 동시에 마인드맵에 '변수', '자료형' 노드를 자동으로 생성하고 루트 노드와 연결합니다.

심화 학습: 사용자가 생성된 '자료형' 노드를 클릭하고 "자료형의 종류는?"이라고 물으면, 해당 노드 하위에 '리스트', '딕셔너리' 등이 추가됩니다.

영구 저장: 이 모든 과정은 DB에 저장되어, 내일 다시 들어와도 어제 공부한 지점부터 이어서 학습할 수 있습니다.

3. 기술적 메커니즘 (Technical Core)
A. 초경량 LLM 활용 전략 (Lightweight LLM)
목적: 빠른 응답성과 낮은 운영 비용.

역할: 깊은 철학적 대화보다는 **엔티티 추출(Entity Extraction)**과 **요약(Summarization)**에 집중합니다.

프롬프트 규칙: AI는 답변 시 반드시 브라우저가 해석할 수 있는 특정 구분자(예: JSON 또는 XML)를 포함하여 새로운 노드 정보를 전달해야 합니다.

B. 상태 기반 마인드맵 (State-driven Mindmap)
동기화: 채팅 데이터와 마인드맵 데이터는 실시간으로 동기화됩니다.

영속성: Cloudflare D1 DB를 사용하여 사용자의 MapID별로 노드 좌표, 텍스트, 관계 정보를 저장합니다.

4. AI 개발자를 위한 상세 지침 (Instructions for AI)
1) 데이터 구조의 일관성
마인드맵은 Nodes와 Edges의 배열로 관리됩니다. AI가 새로운 개념을 제시할 때마다 시스템은 기존 배열에 새로운 객체를 push하고 화면을 리렌더링해야 합니다.

2) 맥락 유지 (Context Awareness)
사용자가 특정 노드를 클릭한 상태에서 질문하면, AI에게 **"현재 사용자는 [특정 노드]에 대해 질문 중입니다"**라는 컨텍스트를 프롬프트에 자동으로 삽입하여 답변의 정확도를 높입니다.

3) 시각적 피드백
새로운 노드가 생성될 때 단순히 나타나는 것이 아니라, 부모 노드에서 뻗어 나오는 애니메이션 효과를 주어 사용자가 '지식이 확장되고 있음'을 체감하게 합니다.

5. 최종 기대 효과 (Expected Impact)
학습 효율: 텍스트 더미 속에서 정보를 찾는 대신, 구조화된 지도를 보며 본인의 취약점을 파악할 수 있습니다.

Vibe Coding의 정수: 복잡한 서버 설정 없이 Cloudflare의 서버리스 환경에서 구동되므로, 아이디어를 즉시 배포하고 확장하기에 최적화된 구조입니다.

💡 AI에게 전달할 메시지:

"이 문서는 프로젝트의 핵심 철학입니다. 코드를 짤 때 단순히 기능 구현에 그치지 말고, 사용자가 대화를 통해 '지식의 영토'를 넓혀가는 경험을 할 수 있도록 UI와 로직을 설계해 주세요. 특히 가벼운 모델을 사용하므로 프롬프트는 짧고 구조적인 데이터 위주로 처리하도록 구성하세요."

📋 AI 대화형 지식 확장 마인드맵 제작을 위한 10단계 개발 로드맵
아래는 주어진 기획 의도(지식 빌딩 시스템, 초경량 LLM 중심, Cloudflare 서버리스 환경, 상태 기반 마인드맵)를 완벽히 반영하여 정확히 10단계로 세분화한 제작 계획입니다.
각 단계는 목표 · 세부 작업 · 산출물 · 예상 소요시간(참고) · 주의사항으로 구성하여, 초보자도 따라 하기 쉽게 디테일하게 작성했습니다.
전체 프로젝트는 Cloudflare Pages + Workers + D1 DB + Hono(백엔드) + React + React Flow(마인드맵) 조합을 기준으로 하며, 필요 시 대체 기술은 괄호 안에 표기했습니다.
단계 1: 프로젝트 초기화 및 기술 스택 확정 (1~2일)

GitHub(또는 GitLab) Private Repository 생성 및 README.md에 기획 의도 전체 복사
Cloudflare 계정에서 Pages, Workers, D1 Database, KV 생성
로컬 개발 환경: Node.js 20+, pnpm 설치 → pnpm create cloudflare@latest로 Workers + Pages 템플릿 생성
프론트엔드: React 18 + Vite (또는 Next.js App Router)
백엔드: Hono + Cloudflare Workers
마인드맵 라이브러리: react-flow (또는 @xyflow/react)
LLM 연동: Groq(초경량) 또는 Cloudflare AI Gateway + Llama-3.1-8B (프롬프트 비용 최소화)
.env.example 파일 생성 (D1 DB ID, AI API Key, JWT Secret 등)
산출물: package.json, wrangler.toml, 폴더 구조(frontend/backend/shared), GitHub Actions CI/CD 기본 설정
주의: 모든 코드가 Cloudflare 서버리스에서 동작하도록 wrangler dev로 로컬 테스트 환경 먼저 구축

단계 2: 데이터베이스 스키마 설계 및 D1 테이블 생성 (1일)

테이블 설계:
users (userId, email, createdAt)
mindmaps (mapId, userId, rootNodeText, title, createdAt, updatedAt)
nodes (nodeId, mapId, parentNodeId, text, x, y, color, createdAt)
edges (edgeId, mapId, sourceNodeId, targetNodeId)
chat_history (chatId, mapId, nodeId, message, role, structuredOutputJson, timestamp) ← LLM 응답 JSON 저장용

D1 Migration 파일 작성 (drizzle 또는 raw SQL)
Seed 데이터: 기본 루트 노드 “파이썬 마스터하기” 예시 삽입
산출물: schema.sql, Drizzle ORM 타입 정의 (shared/types/db.ts)
주의: node 좌표(x,y)는 React Flow와 완벽 동기화되도록 float 타입으로 저장

단계 3: 인증 및 사용자 세션 관리 (1일)

Cloudflare Workers에서 JWT 기반 인증 구현 (Clerk 또는 Lucia Auth 대체 가능)
로그인/회원가입 API (/api/auth/*)
Middleware로 모든 /api/mindmap/* 엔드포인트 보호
산출물: 로그인 페이지 + Protected Route HOC
주의: mindmap 데이터는 반드시 userId로 격리하여 다른 사용자 데이터 유출 방지

단계 4: 마인드맵 CRUD 백엔드 API 완성 (2일)

Hono 라우트:
GET /api/mindmap/:mapId → Nodes + Edges 전체 반환
POST /api/mindmap → 새 마인드맵 생성 (루트 노드 자동 생성)
PATCH /api/mindmap/:mapId/node → 노드 위치/텍스트 업데이트
POST /api/mindmap/:mapId/edge → 엣지 추가

산출물: OpenAPI 스펙(YAML) 또는 Swagger UI
주의: 모든 응답에 version 필드 추가 → 프론트와의 동기화 충돌 방지

단계 5: 프론트엔드 기본 UI 및 마인드맵 시각화 구현 (2~3일)

React + TailwindCSS로 레이아웃 구성:
좌측 30%: 채팅 패널 (고정)
중앙 70%: React Flow 캔버스 (zoom, pan, mini-map 활성화)

React Flow 설정:
Custom Node (텍스트 + “+” 버튼 + 클릭 이벤트)
Edge 타입: smoothstep + 애니메이션
Node 클릭 시 currentActiveNodeId 상태 전역 관리 (Zustand)

산출물: 빈 마인드맵 + 루트 노드 렌더링 화면
주의: React Flow의 onNodesChange, onEdgesChange를 useCallback으로 최적화

단계 6: 초경량 LLM 프롬프트 엔지니어링 및 구조화 출력 정의 (2일)

핵심 프롬프트 (항상 포함):JSON{
  "response": "자연어 답변",
  "newNodes": [{"id": "auto", "text": "...", "parentNodeId": "..."}],
  "newEdges": [{"source": "...", "target": "..."}],
  "suggestedQuestions": ["질문1", "질문2"]
}
System Prompt: “너는 Entity Extraction 전문가다. 사용자가 학습 목표를 말하면 반드시 JSON만 반환하고, 새로운 개념이 나오면 newNodes에 추가하라.”
Groq API 호출 Wrapper 함수 제작 (streaming + JSON mode)
산출물: lib/prompts/knowledge-expansion.ts 파일
주의: JSON 파싱 실패 시 재시도 로직(최대 2회) 필수

단계 7: 채팅 → 마인드맵 자동 확장 로직 구현 (3일)

채팅 입력 → Workers로 전송 → LLM 호출 → JSON 파싱
파싱 성공 시:
newNodes → D1에 INSERT + React Flow에 setNodes + 부모 노드에서 뻗어나오는 Framer Motion 애니메이션
newEdges → 자동 연결
채팅창에 자연어 답변 + “노드가 2개 추가되었습니다” 토스트

산출물: 실시간으로 노드가 생성되는 데모 (영상 녹화 권장)
주의: LLM 응답이 3초 이내에 나와야 하므로 prompt 길이 800토큰 이하로 제한

단계 8: 노드 클릭 컨텍스트 인식 및 심화 학습 기능 (2일)

노드 클릭 → currentActiveNodeId 업데이트 → 채팅 입력 시 System Prompt에 자동 삽입
"현재 사용자는 [노드 텍스트] 노드에 대해 질문 중입니다."
“자료형의 종류는?” → 해당 노드의 하위에만 newNodes 추가
산출물: 컨텍스트 배지(노드 이름 표시) + “이 노드에 대해 물어보기” 버튼
주의: 전역 컨텍스트가 해제되는 “전체 지도 보기” 버튼 필수

단계 9: 실시간 동기화, UX 폴리싱, 애니메이션 완성 (2~3일)

WebSocket (Cloudflare Durable Objects) 또는 polling(5초)으로 여러 기기 동기화
노드 생성 시 부모 → 자식 뻗어나가는 SVG 선 애니메이션 (React Flow + Framer Motion)
Undo/Redo (로컬 Zustand + D1 history 테이블)
모바일 반응형 + 다크모드
산출물: 완전한 사용자 경험 데모
주의: “지식의 영토가 넓어지고 있습니다”라는 토스트 메시지로 기획 의도 전달

단계 10: 통합 테스트, 배포, 문서화 및 확장 준비 (2일)

E2E 테스트: Playwright (루트 노드 생성 → 5개 노드 자동 확장 시나리오)
Cloudflare Pages 배포 + Custom Domain 연결
README에 사용자 가이드 + 개발자 가이드 작성 (프롬프트 예시 포함)
추가 기능 로드맵 작성 (1.0 → 1.1: 노드 공유, 1.2: AI 요약 PDF 내보내기)
최종 산출물: 실제 배포 URL + GitHub Release v1.0
주의: 배포 후 첫 100명 사용자 피드백 수집 계획 세우기


전체 예상 기간: 약 3주 (평일 기준, 하루 4~6시간)
추천 개발 순서: 1→2→3→4→5→6→7→8→9→10 (순차 진행 필수, 7단계에서 LLM이 살아야 나머지가 의미 있음)
이 10단계를 그대로 따라가면 기획 의도에 100% 부합하는 “휘발성 없는 지식 빌딩 시스템”이 완성됩니다.


1. 기획 의도 (Mission Statement)
"막연한 목표를 시각적인 지식의 지도로 변환하여 학습의 길을 잃지 않게 한다."
디자인 철학 (Design Philosophy)

Clarity First: 한 화면에서 전체 학습 구조를 즉시 이해할 수 있게
Minimal Cognitive Load: 불필요한 장식과 애니메이션 최소화
Functional Beauty: 정보 전달에 최적화된 미니멀한 시각 언어
Consistency: 모든 요소(노드, 엣지, 패널)가 동일한 디자인 시스템으로 통일
Accessibility: WCAG 2.2 AA 준수, 키보드 완벽 지원

2. 핵심 사용자 경험 (UX Scenario)

초기 진입 (Landing Page)
사이트 접속 시 구글.com과 동일한 형태로 전체 화면 중앙에 검색창만 표시
검색창 위에 “어떤 걸 배우고 싶으신가요?” 문구 (Pretendard 24px, font-weight 500, 색상 #a0a0a0)
검색 입력 후 Enter 또는 버튼 클릭 → 즉시 다음 화면으로 전환 (전환 효과: fade 0.3초)

메인 화면 전환 후
좌측: 고정 380px 채팅 패널 (AI와 대화 가능)
우측: flex-1 마인드맵 캔버스 (초기 루트 노드는 검색한 텍스트로 자동 생성)
루트 노드는 캔버스 왼쪽 가장자리에 위치 (x=80, y=중앙)

대화 → 마인드맵 확장
채팅에서 질문을 입력하면 AI가 설명을 생성
AI 응답과 동시에 우측 마인드맵에 새 노드가 왼쪽→오른쪽 방향으로 추가됨
새로 생성된 노드(질문 노드) 근처에 + 버튼이 자동으로 표시됨

버튼 클릭 시 해당 노드가 위아래로 갈라지며 (상단 반원: 노드 라벨, 하단 반원: 문서 영역) AI 설명 문서가 표시됨

새로운 질문으로 마인드맵이 확장될 때마다 해당 질문 노드는 생성 즉시 문서 영역이 펼쳐진 상태로 시작

문서 영역 제어
펼쳐진 노드의 상단 반원 오른쪽에 최소화 버튼 (□ 아이콘, 20×20px) 표시
최소화 버튼 클릭 시 노드가 다시 하나의 원형 노드로 합쳐지며 문서 영역이 사라짐
이 확장/축소는 모든 노드에서 무한히 반복 가능

마인드맵 조작
전체 마인드맵은 왼쪽(루트)에서 오른쪽으로 수평으로 퍼져 나감 (Tree layout, horizontal)
마우스 휠 또는 트랙패드로 확대/축소 (zoom 0.2x ~ 4x)
드래그로 캔버스 이동 (pan)
노드 간 연결은 시냅스 형태를 모방하되, 가시성을 위해 최대한 얇고 직선에 가까운 선으로 처리


3. 상세 디자인 시스템 (Detailed Design System)
3.1 전체 레이아웃 (Desktop Only)

고정 분할:
Left Panel (채팅): width 380px (최소 320px, resize 가능)
Right Canvas (마인드맵): flex-1 (최소 600px)
Gap between panels: 16px

전체 Padding: 24px
Canvas 내부 Grid: 20px × 20px (snap-to-grid 기본 ON)
Background:
전체 페이지: #0f0f0f
Canvas 영역: #111111 + 미세 noise texture (opacity 0.03)


3.2 색상 팔레트
Base Colors

Background: #0f0f0f
Surface (패널, 노드): #1a1a1a
Border: #2a2a2a
Text Primary: #f0f0f0
Text Secondary: #a0a0a0
Text Muted: #6b6b6b

Accent Colors

Primary: #00d4ff
Primary Hover: #00eaff
Primary Active: #00b8e0
Success (완료 노드): #22c55e

Semantic States

Node Default: background #1a1a1a, border #2a2a2a
Node Selected: border #00d4ff (3px), box-shadow 0 0 0 4px rgba(0, 212, 255, 0.2)
Node Expanded (문서 표시 중): border #00d4ff (3px), 내부 divider #2a2a2a

3.3 노드 디자인 (Custom Node — 확장 기능 포함)

기본 노드 (축소 상태):
Shape: border-radius 50% (완전 원형) 또는 16px (타원형)
크기: Root 320×108px, Level 1+ 200×72px
내부: Icon(28×28px) + Text (Pretendard 600, 16px)
오른쪽 하단에 + 버튼 (20×20px, 원형, background #00d4ff, 아이콘 + , hover scale 1.1)

확장 상태 (문서 표시):
노드가 위아래로 갈라짐 (상단 반원 + 하단 직사각형 영역)
상단 반원: 기존 노드 라벨 + 최소화 버튼 (오른쪽 상단, □ 아이콘)
하단 영역: 문서 영역 (height 240px 기본, padding 16px, overflow auto)
내용: AI 설명 텍스트 (Pretendard 15px, line-height 1.5)
배경: #1a1a1a, 상단에 1px divider (#2a2a2a)

전체 너비: 확장 시 320px 고정 (문서 영역은 좌우 full)

등장/전환 애니메이션:
새 노드: scale 0.92 → 1.0 + opacity 0 → 1 (400ms)
확장: 상단 반원 + 하단 영역이 위아래로 분리 (height 0 → 240px, 300ms ease-out)
최소화: 반대로 합쳐짐 (reverse)


3.4 엣지 디자인 (시냅스 연결 최소화)

Type: smoothstep (또는 bezier)
Stroke width: 1.8px
Color: #00d4ff (opacity 0.55)
생성 애니메이션: dashoffset 0 → -40 (400ms)
Hover: stroke-width 2.8px, opacity 0.85
전체적으로 선이 많아지지 않도록 자동 정리 (React Flow auto-layout 사용)

3.5 마인드맵 레이아웃 규칙

방향: 왼쪽(루트) → 오른쪽 수평 확장 (horizontal tree layout)
React Flow 설정:
Layout: dagre 또는 elk horizontal
Node spacing: horizontal 180px, vertical 80px
Root node 위치: 항상 캔버스 왼쪽 80px

Zoom: 0.2x ~ 4.0x (마우스 휠 + 버튼)
Pan: 자유 드래그

3.6 채팅 패널 (변경 없음, 기존 유지)

width 380px, background #1a1a1a
Message Bubble, Input Area 등은 버전 2.2와 동일

3.7 애니메이션 & 마이크로 인터랙션

모든 전환: duration 300~400ms, cubic-bezier(0.4, 0, 0.2, 1)

버튼 클릭 → 확장

최소화 버튼 클릭 → 축소
다중 노드 확장 시 stagger 60ms

3.8 타이포그래피 및 추가 규칙

동일 (버전 2.2 유지)
Focus ring, Scrollbar, Dark mode only 유지

4. 기술적 메커니즘 (디자인 연동)

React Flow Custom Node에 축소/확장 상태 (isExpanded boolean) 추가
Zustand로 nodes, edges, expandedNodeIds 관리
문서 영역은 노드 내부에 별도 div (height animate)
Layout: React Flow + dagre 라이브러리로 left-to-right 자동 배치

5. 최종 기대 효과
사용자는 첫 화면에서 바로 학습 목표를 입력하고, 좌측 채팅과 우측 마인드맵을 동시에 사용하면서, 각 질문 노드의 + 버튼으로 AI 설명 문서를 즉시 확인하거나 접을 수 있다. 마인드맵은 왼쪽에서 오른쪽으로 깔끔하게 확장되어 가독성이 높다.