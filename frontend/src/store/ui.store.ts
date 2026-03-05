import { create } from 'zustand';

interface UIState {
    sidebarCollapsed: boolean;
    isSidebarOpen: boolean;
    modalOpen: string | null;

    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
    closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarCollapsed: false,
    isSidebarOpen: true,
    modalOpen: null,

    toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

    closeSidebar: () =>
        set({ isSidebarOpen: false }),

    openModal: (modalId) =>
        set({ modalOpen: modalId }),

    closeModal: () =>
        set({ modalOpen: null }),
}));
