import { env, isApiConfigured } from '@/constants/env';
import { createAppError } from '@/utils/errors';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  if (!isApiConfigured) {
    throw createAppError(
      'api_not_configured',
      'Backend API is not configured. GrantMatch AI is running in mock/local mode.'
    );
  }

  const url = `${env.apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        // TODO: Add bearer token or provider session token when real auth is connected.
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw createAppError('api_request_failed', `Request failed with status ${response.status}.`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    throw createAppError('api_network_error', 'Unable to reach the backend service.', error);
  }
}
