import { create } from 'zustand';

interface StoreState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useStore = create<StoreState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

