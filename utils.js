/* utils.js - Stable Adaptive Layout Engine */

export const lerp = (start, end, t) => start + (end - start) * t;

export function getSafeElement(id) {
    return document.getElementById(id);
}

/**
 * 지능형 상단 고정 + 전역 충격 기반 레이아웃 엔진
 * 1. Frozen Ancestors: 상단 및 부모 노드 좌표 고정
 * 2. Global Collision Sweep: 부모 관계 상관없이 Y축 기준 아래 모든 노드 최소 오프셋 밀어내기
 */
export function calculateNodeLayout(nodes, config = {}) {
    const {
        levelGap = 320,
        baseNodeHeight = 80,
        docHeight = 280,
        margin = 60,
        rootId = 'central-node'
    } = config;

    const allNodesArray = Object.values(nodes);
    if (allNodesArray.length === 0) return;

    // 1단계: 모든 노드의 '기본(Collapsed)' 서브트리 높이 계산
    function calculateBaseSubtreeHeight(nodeId) {
        const node = nodes[nodeId];
        if (!node) return 0;
        const children = allNodesArray.filter(n => n.parentId === nodeId);
        if (children.length === 0) {
            node.baseHeight = baseNodeHeight;
            return baseNodeHeight;
        }
        const h = children.reduce((sum, child) => sum + calculateBaseSubtreeHeight(child.id), 0) + (children.length - 1) * margin;
        node.baseHeight = Math.max(baseNodeHeight, h);
        return node.baseHeight;
    }

    // 2단계: 기본 대칭 레이아웃 배치
    function positionBaseNodes(nodeId, level) {
        const parentNode = nodes[nodeId];
        if (!parentNode) return;
        const children = allNodesArray.filter(n => n.parentId === nodeId);
        if (children.length === 0) return;
        let currentY = parentNode.targetY - (parentNode.baseHeight / 2);
        children.forEach((child) => {
            child.targetX = (level + 1) * levelGap;
            child.targetY = currentY + (child.baseHeight / 2);
            currentY += child.baseHeight + margin;
            positionBaseNodes(child.id, level + 1);
        });
    }

    if (nodes[rootId]) {
        calculateBaseSubtreeHeight(rootId);
        nodes[rootId].targetX = 0;
        nodes[rootId].targetY = 0;
        positionBaseNodes(rootId, 0);

        // 3단계: 전역 충격 기반 레이아웃 (Global Collision-aware Sweep)
        // 부모 관계를 무시하고 Y축 순서대로 전체 노드 정렬
        const sortedNodes = [...allNodesArray].sort((a, b) => a.targetY - b.targetY);
        
        // 정렬된 리스트를 순회하며 충돌(Overlap) 해결
        for (let i = 0; i < sortedNodes.length - 1; i++) {
            const current = sortedNodes[i];
            
            // 현재 노드의 실제 하단 경계 계산
            // 노드 헤더 중심(targetY) + 헤더 절반 + (확장 시) 문서 오프셋 및 문서 높이
            const currentBottom = current.targetY + (baseNodeHeight / 2) + 
                                (current.isExpanded ? (8 + docHeight) : 0);
            
            // 다음으로 올 수 있는 가장 가까운 노드와의 간격 체크
            const next = sortedNodes[i + 1];
            const nextTop = next.targetY - (baseNodeHeight / 2);
            
            // 실제 겹치는 영역 계산 (최소 마진 margin 포함)
            const overlap = (currentBottom + margin) - nextTop;

            if (overlap > 0) {
                // 충돌이 발견되면 "이후의 모든 노드"를 겹치는 만큼만 밀어냄
                // 이를 통해 전체적인 수직 순서와 상대적 간격을 보존 (Order Preservation)
                for (let j = i + 1; j < sortedNodes.length; j++) {
                    sortedNodes[j].targetY += overlap;
                }
            }
        }
    }
}
