import { create } from 'zustand';

interface UIState {
    isRightSidebarOpen: boolean;
    toggleRightSidebar: () => void;
    closeRightSidebar: () => void;
    openRightSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isRightSidebarOpen: false,
    toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
    closeRightSidebar: () => set({ isRightSidebarOpen: false }),
    openRightSidebar: () => set({ isRightSidebarOpen: true }),
}));
