import { create } from 'zustand';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: SnackbarType;
  duration?: number;
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  duration: 3000,
  showSnackbar: (message, type = 'info', duration = 3000) => set({ isOpen: true, message, type, duration }),
  hideSnackbar: () => set({ isOpen: false }),
}));
