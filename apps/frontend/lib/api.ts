import { useAuth } from '@clerk/nextjs';

export function useSecureApi() {
  const { getToken } = useAuth();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

  const secureFetch = async (endpoint: string, options: RequestInit = {}) => {
    // 🧠 Fetch the raw JWT token straight from Clerk's memory cache
    const token = await getToken();

    return fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`, // Cryptographic key delivered safely
        'Content-Type': 'application/json',
      },
    });
  };

  return { secureFetch };
}