interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  handle: string;
  displayName?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    handle: string;
    displayName: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isPro?: boolean;
    subscriptionTier?: string | null;
    subscriptionEnd?: Date | null;
  };
}

interface UpgradeRequest {
  subscriptionTier: 'monthly' | 'yearly';
  paymentToken?: string;
}

interface UpgradeResponse {
  success: boolean;
  message: string;
  user: AuthResponse['user'];
}

interface ApiError {
  error: string;
  message?: string;
}

export class AuthService {
  private static readonly API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' })) as ApiError;
      throw new Error(errorData.error || errorData.message || 'Login failed');
    }

    return response.json() as Promise<AuthResponse>;
  }

  static async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' })) as ApiError;
      throw new Error(errorData.error || errorData.message || 'Registration failed');
    }

    return response.json() as Promise<AuthResponse>;
  }

  static async getCurrentUser(token: string): Promise<AuthResponse['user']> {
    const response = await fetch(`${this.API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get user info' })) as ApiError;
      throw new Error(errorData.error || errorData.message || 'Failed to get user info');
    }

    return response.json() as Promise<AuthResponse['user']>;
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async upgradeToPro(upgradeData: UpgradeRequest, token: string): Promise<UpgradeResponse> {
    const response = await fetch(`${this.API_BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(upgradeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upgrade failed' })) as ApiError;
      throw new Error(errorData.error || errorData.message || 'Upgrade failed');
    }

    return response.json() as Promise<UpgradeResponse>;
  }

  static async cancelSubscription(token: string): Promise<UpgradeResponse> {
    const response = await fetch(`${this.API_BASE_URL}/auth/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to cancel subscription' })) as ApiError;
      throw new Error(errorData.error || errorData.message || 'Failed to cancel subscription');
    }

    return response.json() as Promise<UpgradeResponse>;
  }
}