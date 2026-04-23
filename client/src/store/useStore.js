import { create } from 'zustand';

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
    components: [],       // array of component objects on canvas
    selectedId: null,     // id of selected component

    setCurrentProject(project) {
        const pageId = project?.pages?.[0]?.id || null;
        set({ currentProject: project, currentPageId: pageId });
    },

    setCurrentPageId(pageId) {
        set({ currentPageId: pageId, selectedId: null });
    },

    setComponents(components) {
        set({ components });
    },

    addComponent(component) {
        set((state) => ({ components: [...state.components, component] }));
    },

    updateComponent(id, updates) {
        set((state) => ({
            components: state.components.map((c) =>
                c._id === id || c.id === id ? { ...c, ...updates } : c
            ),
        }));
    },

    removeComponent(id) {
        set((state) => ({
            components: state.components.filter((c) => c._id !== id && c.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
        }));
    },

    setSelectedId(id) {
        set({ selectedId: id });
    },

    getSelected() {
        const { components, selectedId } = get();
        return components.find((c) => (c._id || c.id) === selectedId) || null;
    },
}));

export default useStore;