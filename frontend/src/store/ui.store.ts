import { create } from 'zustand';

interface UIState {
    sidebarCollapsed: boolean;
    modalOpen: string | null;

    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarCollapsed: false,
    modalOpen: null,

    toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

    openModal: (modalId) =>
        set({ modalOpen: modalId }),

    closeModal: () =>
        set({ modalOpen: null }),
}));
