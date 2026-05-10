export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}

export function createAppError(code: string, message: string, cause?: unknown): AppError {
  return { code, message, cause };
}

export function getFriendlyErrorMessage(error: unknown) {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export async function safely<T>(operation: () => Promise<T>): Promise<[T | undefined, AppError | undefined]> {
  try {
    return [await operation(), undefined];
  } catch (error) {
    return [
      undefined,
      isAppError(error)
        ? error
        : createAppError('unexpected_error', getFriendlyErrorMessage(error), error),
    ];
  }
}

function isAppError(error: unknown): error is AppError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      typeof (error as AppError).code === 'string' &&
      typeof (error as AppError).message === 'string'
  );
}
