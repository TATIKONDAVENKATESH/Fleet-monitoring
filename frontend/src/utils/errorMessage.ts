/**
 * Extracts a human-readable error message from an unknown error value.
 * Handles Axios-style errors (err.response.data.message), plain Error
 * instances, and string errors, falling back to a generic message.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (typeof err === 'string') {
    return err;
  }

  if (err && typeof err === 'object') {
    const anyErr = err as any;

    // Axios-style error response
    const responseMessage = anyErr?.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
      return responseMessage;
    }

    const responseError = anyErr?.response?.data?.error;
    if (typeof responseError === 'string' && responseError.trim().length > 0) {
      return responseError;
    }

    // Standard Error instance
    if (anyErr instanceof Error && anyErr.message) {
      return anyErr.message;
    }

    if (typeof anyErr.message === 'string' && anyErr.message.trim().length > 0) {
      return anyErr.message;
    }
  }

  return fallback;
}