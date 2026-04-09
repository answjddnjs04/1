/* utils.js - Stable Adaptive Layout Engine */

export const lerp = (start, end, t) => start + (end - start) * t;

/**
 * 지능형 가변 레이아웃 엔진 (Top-down Anchor & Dynamic Y-Offset)
 * 1. 상단 노드 고정: 클릭된 노드보다 위쪽 노드들은 좌표를 고수 (Frozen)
 * 2. 하단 노드 동적 오프셋: 클릭된 노드보다 아래쪽 노드들을 문서 높이만큼 밀어냄
 * 3. 상태 복구: 문서 닫기 시 기본 대칭 레이아웃으로 부드럽게 복귀
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
        const selfHeight = baseNodeHeight; 

        if (children.length === 0) {
            node.baseHeight = selfHeight;
            return selfHeight;
        }

        const childrenTotalHeight = children.reduce((sum, child) => {
            return sum + calculateBaseSubtreeHeight(child.id);
        }, 0) + (children.length - 1) * margin;

        node.baseHeight = Math.max(selfHeight, childrenTotalHeight);
        return node.baseHeight;
    }

    // 2단계: 기본(Collapsed) 대칭 레이아웃 좌표 배치
    function positionBaseNodes(nodeId, level) {
        const parentNode = nodes[nodeId];
        if (!parentNode) return;

        const children = allNodesArray.filter(n => n.parentId === nodeId);
        if (children.length === 0) return;

        // 부모의 Y 좌표를 기준으로 자식들을 대칭 배치 (기본형)
        let currentY = parentNode.targetY - (parentNode.baseHeight / 2);

        children.forEach((child) => {
            child.targetX = (level + 1) * levelGap;
            child.targetY = currentY + (child.baseHeight / 2);
            
            currentY += child.baseHeight + margin;
            positionBaseNodes(child.id, level + 1);
        });
    }

    if (nodes[rootId]) {
        // 초기화 및 기본 레이아웃 계산
        calculateBaseSubtreeHeight(rootId);
        nodes[rootId].targetX = 0;
        nodes[rootId].targetY = 0;
        positionBaseNodes(rootId, 0);

        // 3단계: 확장(isExpanded)된 노드들에 의한 전역 동적 오프셋 적용
        // Y 좌표 순서대로 정렬하여 상단 노드의 확장이 하단 노드에 누적되도록 함 (Top-down Anchor)
        const sortedNodes = [...allNodesArray].sort((a, b) => a.targetY - b.targetY);
        const cumulativeOffsets = new Map();
        sortedNodes.forEach(n => cumulativeOffsets.set(n.id, 0));

        sortedNodes.forEach(expNode => {
            if (expNode.isExpanded) {
                const shift = docHeight + margin;
                sortedNodes.forEach(otherNode => {
                    // [핵심] 클릭된 노드보다 시각적으로 아래(Y값이 큰)에 있는 노드들만 밀어냄
                    // 이로 인해 클릭 노드 상단 노드들은 Frozen 상태 유지
                    if (otherNode.targetY > expNode.targetY) {
                        cumulativeOffsets.set(otherNode.id, cumulativeOffsets.get(otherNode.id) + shift);
                    }
                });
            }
        });

        // 최종 좌표에 누적 오프셋 반영
        allNodesArray.forEach(node => {
            node.targetY += cumulativeOffsets.get(node.id);
        });
    }
}

export function getSafeElement(id) {
    return document.getElementById(id);
}
