import { create } from 'zustand';

const MAX_HISTORY = 100;
const getId = (node) => node?._id || node?.id;

function cloneSnapshot(data) {
    return JSON.parse(JSON.stringify(data));
}

function findInTree(nodes, targetId) {
    for (const node of nodes || []) {
        if (getId(node) === targetId) return node;
        const child = findInTree(node.children || [], targetId);
        if (child) return child;
    }
    return null;
}

function updateInTree(nodes, targetId, updater) {
    return (nodes || []).map((node) => {
        if (getId(node) === targetId) {
            return updater(node);
        }

        if (!node.children?.length) return node;
        return {
            ...node,
            children: updateInTree(node.children, targetId, updater),
        };
    });
}

function removeFromTree(nodes, targetId) {
    return (nodes || [])
        .filter((node) => getId(node) !== targetId)
        .map((node) => ({
            ...node,
            children: removeFromTree(node.children || [], targetId),
        }));
}

function buildSnapshot(state) {
    return {
        currentProject: state.currentProject ? cloneSnapshot(state.currentProject) : null,
        currentPageId: state.currentPageId,
        components: cloneSnapshot(state.components || []),
        selectedComponentId: state.selectedComponentId,
    };
}

const useStore = create((set, get) => ({
    // Auth
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,

    login(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    // Editor state
    currentProject: null,
    currentPageId: null,
    components: [],       // root components tree
    selectedComponentId: null,
    history: [],
    isUndoing: false,

    pushHistory() {
        const state = get();
        if (state.isUndoing) return;

        const snapshot = buildSnapshot(state);
        set((curr) => ({
            history: [...curr.history, snapshot].slice(-MAX_HISTORY),
        }));
    },

    setCurrentProject(project) {
        const prev = get().currentProject;
        if (prev) get().pushHistory();
        const pageId = project?.pages?.[0]?.id || null;
        set({ currentProject: project, currentPageId: pageId });
    },

    setCurrentPageId(pageId) {
        if (get().currentPageId !== pageId) get().pushHistory();
        set({ currentPageId: pageId, selectedComponentId: null });
    },

    setComponents(components) {
        const prev = get().components;
        if (prev !== components) get().pushHistory();
        set({ components });
    },

    addComponent(component) {
        get().pushHistory();
        set((state) => ({ components: [...state.components, component] }));
    },

    updateComponent(id, updates) {
        get().pushHistory();
        set((state) => ({
            components: updateInTree(state.components, id, (component) => ({ ...component, ...updates })),
        }));
    },

    removeComponent(id) {
        get().pushHistory();
        set((state) => ({
            components: removeFromTree(state.components, id),
            selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        }));
    },

    setSelectedComponentId(id) {
        set({ selectedComponentId: id });
    },

    // Backward-compatible alias for existing callers
    setSelectedId(id) {
        set({ selectedComponentId: id });
    },

    getSelected() {
        const { components, selectedComponentId } = get();
        return findInTree(components, selectedComponentId);
    },

    undo() {
        const { history } = get();
        if (!history.length) return;

        const previous = history[history.length - 1];
        set({
            isUndoing: true,
            currentProject: previous.currentProject,
            currentPageId: previous.currentPageId,
            components: previous.components,
            selectedComponentId: previous.selectedComponentId,
            history: history.slice(0, -1),
        });

        // Reset guard on next tick so subsequent edits can be tracked
        setTimeout(() => set({ isUndoing: false }), 0);
    },
}));

export default useStore;