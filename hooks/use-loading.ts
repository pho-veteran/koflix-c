import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  message: '',
  setMessage: (message: string) => set({ message }),
}));