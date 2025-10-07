/**
 * Django API Authentication Service
 * Handles real authentication with Django backend using session-based auth
 */

// Base API URL - adjust if your Django server runs on different port
const API_BASE_URL = 'http://localhost:8000';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    phone_number?: string;
    bio?: string;
    location?: string;
    is_verified: boolean;
    profile_photo?: string;
  };
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  referral_code?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  user?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

class AuthService {
  private csrfToken: string | null = null;

  /**
   * Get CSRF token from Django
   */
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }
      
      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return '';
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const csrfToken = await this.getCsrfToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: data.error || data.detail || 'An error occurred'
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.apiRequest<ApiResponse<User>>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (error) {
      return { user: null, error };
    }

    if (data?.user) {
      return { user: data.user, error: null };
    }

    return { user: null, error: 'Registration failed' };
  }

  /**
   * Login user
   */
  async login(credentials: LoginData): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.apiRequest<ApiResponse<User>>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (error) {
      return { user: null, error };
    }

    if (data?.user) {
      return { user: data.user, error: null };
    }

    return { user: null, error: 'Login failed' };
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; error: string | null }> {
    const { data, error } = await this.apiRequest<ApiResponse<any>>('/auth/logout/', {
      method: 'POST',
    });

    if (error) {
      return { success: false, error };
    }

    this.csrfToken = null; // Clear cached CSRF token
    return { success: true, error: null };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.apiRequest<ApiResponse<User>>('/auth/user/', {
      method: 'GET',
    });

    if (error) {
      return { user: null, error };
    }

    if (data?.user) {
      return { user: data.user, error: null };
    }

    return { user: null, error: null }; // Not logged in
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User['profile']>): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await this.apiRequest<ApiResponse<User>>('/api/profiles/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });

    if (error) {
      return { user: null, error };
    }

    if (data?.user) {
      return { user: data.user, error: null };
    }

    return { user: null, error: 'Profile update failed' };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;