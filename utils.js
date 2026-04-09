/* utils.js - Stable Adaptive Layout Engine */

export const lerp = (start, end, t) => start + (end - start) * t;

/**
 * 지능형 가변 레이아웃 엔진
 * 1. ReferenceError 수정: parentId 참조 오류 해결
 * 2. X축 간격 확장: 320px로 상향 조정
 */
export function calculateNodeLayout(nodes, config = {}) {
    const {
        levelGap = 320,      // [수평 간격 확장] 320px
        baseNodeHeight = 80,  
        docHeight = 280,      
        margin = 60,          
        rootId = 'central-node'
    } = config;

    // 1단계: 각 노드의 서브트리 전체 높이 계산
    function calculateSubtreeHeight(nodeId) {
        const node = nodes[nodeId];
        if (!node) return 0;
        
        const children = Object.values(nodes).filter(n => n.parentId === nodeId);
        const selfHeight = baseNodeHeight + (node.isExpanded ? docHeight + margin : 0);

        if (children.length === 0) {
            node.subtreeHeight = selfHeight;
            return selfHeight;
        }

        const childrenTotalHeight = children.reduce((sum, child) => {
            return sum + calculateSubtreeHeight(child.id);
        }, 0) + (children.length - 1) * margin;

        node.subtreeHeight = Math.max(selfHeight, childrenTotalHeight);
        return node.subtreeHeight;
    }

    // 2단계: 좌표 배치 (ReferenceError 해결)
    function positionNodes(nodeId, level) {
        const parentNode = nodes[nodeId];
        if (!parentNode) return;

        const children = Object.values(nodes).filter(n => n.parentId === nodeId);
        if (children.length === 0) return;

        // 부모의 Y 좌표를 기준으로 자식들을 대칭 배치
        let currentY = parentNode.targetY - (parentNode.subtreeHeight / 2);

        children.forEach((child) => {
            child.targetX = (level + 1) * levelGap;
            // 자식 서브트리의 중앙에 노드 위치
            child.targetY = currentY + (child.subtreeHeight / 2);
            
            // 다음 형제를 위해 Y 좌표 이동
            currentY += child.subtreeHeight + margin;

            // 재귀 호출
            positionNodes(child.id, level + 1);
        });
    }

    if (nodes[rootId]) {
        calculateSubtreeHeight(rootId);
        nodes[rootId].targetX = 0;
        nodes[rootId].targetY = 0;
        positionNodes(rootId, 0);
    }
}

export function getSafeElement(id) {
    return document.getElementById(id);
}
