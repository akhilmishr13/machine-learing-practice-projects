import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/v1/auth/login-json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          // Check if response is ok and has content
          if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
              const errorData = await response.json();
              errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
              // If response is not JSON, use status text
              errorMessage = response.statusText || `Server error (${response.status})`;
            }
            throw new Error(errorMessage);
          }

          // Check if response has content before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned invalid response. Please check if the backend is running.');
          }

          const text = await response.text();
          if (!text) {
            throw new Error('Server returned empty response. Please check if the backend is running.');
          }

          const data = JSON.parse(text);
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Login failed:', error);
          // Provide more helpful error messages
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000.');
          }
          throw error;
        }
      },

      register: async (email: string, username: string, password: string, fullName?: string) => {
        try {
          const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password, full_name: fullName }),
          });

          // Check if response is ok and has content
          if (!response.ok) {
            let errorMessage = 'Registration failed';
            try {
              const errorData = await response.json();
              errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
              // If response is not JSON, use status text
              errorMessage = response.statusText || `Server error (${response.status})`;
            }
            throw new Error(errorMessage);
          }

          // Check if response has content before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned invalid response. Please check if the backend is running.');
          }

          const text = await response.text();
          if (!text) {
            throw new Error('Server returned empty response. Please check if the backend is running.');
          }

          const data = JSON.parse(text);
          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Registration failed:', error);
          // Provide more helpful error messages
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000.');
          }
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const state = useAuthStore.getState();
        if (!state.token) {
          return;
        }

        try {
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Not authenticated');
          }

          const user = await response.json();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token invalid, logout
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

