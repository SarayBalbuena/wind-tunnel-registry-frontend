/** A failed API call. `details` is the reason the server gave, when it gave one. */
export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, statusText: string, details?: string) {
    super(`API error: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Nest answers `{ message: string | string[] }`; validation errors send a list. */
const readErrorDetails = async (response: Response) => {
  try {
    const body = await response.json();
    const message: unknown = body?.message;
    const text = Array.isArray(message) ? message.join('; ') : message;
    return typeof text === 'string' && text ? text.slice(0, 300) : undefined;
  } catch {
    return undefined;
  }
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      await readErrorDetails(response),
    );
  }

  return response.json();
};
