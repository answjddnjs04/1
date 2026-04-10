/* mindmap.js - Robust Synapse & Interaction Engine with MathJax Support */
import { lerp, calculateNodeLayout, getSafeElement } from './utils.js';
import { fetchAIAnalysis } from './api.js';

let nodes = {}; 
let links = [];
let synapses = []; 
let selectedNodeId = 'central-node';
let nodeCounter = 0;
let viewX = 0, viewY = 0;
let targetViewX = 0, targetViewY = 0;
let viewScale = 1;
let targetScale = 1;

const NODE_WIDTH = 160; 
const NODE_HEIGHT = 54; 

export function initMindmap(rootTopic) {
    const canvas = getSafeElement('mindmap-canvas');
    if (!canvas) return;
    canvas.innerHTML = ''; nodes = {}; links = []; synapses = []; nodeCounter = 0;
    createNode('central-node', rootTopic, 0, null);
    requestAnimationFrame(updateFrame);
    setupInteractions();
}

function updateFrame() {
    const canvas = getSafeElement('mindmap-canvas');
    if (!canvas) return;
    viewX = lerp(viewX, targetViewX, 0.15); viewY = lerp(viewY, targetViewY, 0.15);
    viewScale = lerp(viewScale, targetScale, 0.15);
    canvas.style.transform = `translate(${viewX}px, ${viewY}px) scale(${viewScale})`;

    for (const id in nodes) {
        const n = nodes[id];
        n.x = lerp(n.x, n.targetX, 0.2); n.y = lerp(n.y, n.targetY, 0.2);
        n.element.style.left = `calc(50% + ${n.x}px)`;
        n.element.style.top = `calc(50% + ${n.y}px)`;
    }
    updateEdges();
    autoManageSynapses();
    requestAnimationFrame(updateFrame);
}

function updateEdges() {
    links.forEach(link => {
        const p = nodes[link.from], c = nodes[link.to];
        if (!p || !c) return;
        const startX = p.x + (NODE_WIDTH / 2), startY = p.y;
        const endX = c.x - (NODE_WIDTH / 2), endY = c.y;
        const dx = endX - startX, dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        link.element.style.width = `${dist}px`;
        link.element.style.left = `calc(50% + ${startX}px)`;
        link.element.style.top = `calc(50% + ${startY}px)`;
        link.element.style.transform = `rotate(${angle}deg)`;
    });
}

function autoManageSynapses() {
    const allNodes = Object.values(nodes);
    const expandedNodes = allNodes.filter(n => n.isExpanded);
    
    const requiredSynapses = [];
    expandedNodes.forEach(source => {
        allNodes.forEach(target => {
            if (source.id === target.id) return;
            if (!source.rawSummary || !target.title) return;
            const keyword = target.title.trim().toLowerCase();
            if (keyword.length < 2) return;

            if (source.rawSummary.toLowerCase().includes(keyword)) {
                requiredSynapses.push({ from: source.id, to: target.id });
            }
        });
    });

    synapses = synapses.filter(syn => {
        const stillRequired = requiredSynapses.some(req => req.from === syn.fromId && req.to === syn.toId);
        if (!stillRequired) syn.element.remove();
        return stillRequired;
    });

    requiredSynapses.forEach(req => {
        const exists = synapses.some(syn => syn.fromId === req.from && syn.toId === req.to);
        if (!exists) {
            const el = document.createElement('div');
            el.className = 'synapse-line';
            getSafeElement('mindmap-canvas').appendChild(el);
            synapses.push({ fromId: req.from, toId: req.to, element: el });
        }
    });

    synapses.forEach(syn => {
        const from = nodes[syn.fromId], to = nodes[syn.toId];
        const dx = to.x - from.x, dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        syn.element.style.width = `${dist}px`;
        syn.element.style.left = `calc(50% + ${from.x}px)`;
        syn.element.style.top = `calc(50% + ${from.y}px)`;
        syn.element.style.transform = `rotate(${angle}deg)`;
    });
}

export async function createNode(id, userInput, level = 0, parentId = null) {
    const canvas = getSafeElement('mindmap-canvas');
    nodeCounter++;
    const currentIndex = nodeCounter;
    
    const el = document.createElement('div');
    el.id = id;
    el.className = `mind-node animate-node loading ${level === 0 ? 'selected' : ''}`;
    el.innerHTML = `<div class="node-header"><span class="animate-pulse">Analyzing Knowledge...</span></div>`;
    
    const parent = nodes[parentId];
    const initialX = parent ? parent.x : 0;
    const initialY = parent ? parent.y : 0;
    
    nodes[id] = { 
        id, 
        index: currentIndex,
        title: userInput, 
        level, 
        parentId, 
        x: initialX, 
        y: initialY, 
        targetX: initialX, 
        targetY: initialY, 
        isExpanded: false, 
        isPinned: false, 
        element: el, 
        rawSummary: "" 
    };

    canvas.appendChild(el);
    if (parentId) {
        const line = document.createElement('div'); line.className = "edge-line";
        canvas.appendChild(line); links.push({ from: parentId, to: id, element: line });
    }

    const context = parent ? parent.rawSummary : "";
    const analysis = await fetchAIAnalysis(userInput, context);
    
    nodes[id].title = analysis.title;
    nodes[id].rawSummary = analysis.summary;
    el.classList.remove('loading');
    
    el.onclick = (e) => {
        e.stopPropagation(); selectNode(id);
        if (e.target.closest('.expand-btn')) toggleExpand(id);
        if (e.target.closest('.pin-btn')) togglePin(id);
    };

    refreshLayout();
    renderAllKeywords();
}

function renderAllKeywords() {
    const allNodes = Object.values(nodes);
    allNodes.forEach(node => {
        if (!node.rawSummary) return;

        let html = node.rawSummary;
        allNodes.forEach(target => {
            if (target.id === node.id || !target.title) return;
            const keyword = target.title.trim();
            const regex = new RegExp(`(${keyword})`, 'gi');
            html = html.replace(regex, `<span class="keyword-link" data-target-id="${target.id}">$1</span>`);
        });
        
        const header = `<span>${node.index}. ${node.title}</span><div class="flex items-center"><button class="pin-btn"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg></button><button class="expand-btn">＋</button></div>`;
        const content = `<div class="node-content custom-scroll"><div style="color:var(--accent-color); font-weight:800; font-size:11px; margin-bottom:8px; text-transform:uppercase;">Knowledge Sync #${node.index}</div><p style="color:#eee; font-size:13px; line-height:1.5;">${html}</p></div>`;
        
        node.element.innerHTML = `<div class="node-header">${header}</div>${content}`;

        node.element.querySelectorAll('.keyword-link').forEach(link => {
            link.onmouseover = () => nodes[link.dataset.targetId]?.element.classList.add('synapse-glow');
            link.onmouseout = () => nodes[link.dataset.targetId]?.element.classList.remove('synapse-glow');
        });
    });

    // [추가] 모든 키워드 렌더링 후 MathJax 실행하여 수식 변환
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

function toggleExpand(id) {
    const n = nodes[id]; if (!n || !n.rawSummary) return;
    n.isExpanded = !n.isExpanded;
    n.element.classList.toggle('expanded', n.isExpanded);
    if (n.isExpanded) {
        targetViewX = -n.targetX * targetScale + 100;
        targetViewY = -n.targetY * targetScale;
    }
    refreshLayout();
    renderAllKeywords();
}

function togglePin(id) {
    const n = nodes[id]; if (!n) return;
    n.isPinned = !n.isPinned;
    n.element.querySelector('.pin-btn').classList.toggle('pinned', n.isPinned);
}

function selectNode(id) {
    if (nodes[selectedNodeId]) nodes[selectedNodeId].element.classList.remove('selected');
    selectedNodeId = id;
    if (nodes[id]) nodes[id].element.classList.add('selected');
}

function refreshLayout() {
    calculateNodeLayout(nodes, { levelGap: 320, baseNodeHeight: 80, docHeight: 280, margin: 60 });
}

function setupInteractions() {
    const container = getSafeElement('mindmap-container');
    if (!container) return;
    let isDragging = false, lastX, lastY;
    container.onmousedown = (e) => {
        if (e.target === container || e.target.id === 'mindmap-canvas') {
            isDragging = true; lastX = e.clientX; lastY = e.clientY; container.style.cursor = 'grabbing';
        }
    };
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        targetViewX += (e.clientX - lastX); targetViewY += (e.clientY - lastY);
        lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDragging = false; container.style.cursor = 'grab'; });
    container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = targetScale * delta;
        if (newScale > 0.2 && newScale < 3) targetScale = newScale;
    };
}

export function addNewSubNode(topic) {
    const parent = nodes[selectedNodeId] || nodes['central-node'];
    if (!parent) return;
    createNode(`node-${Date.now()}`, topic, (parent.level || 0) + 1, parent.id);
}
