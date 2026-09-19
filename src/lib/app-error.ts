export class AppError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export function getErrorPayload(
  error: unknown,
  fallbackMessage: string
): { status: number; body: { error: string; details?: string[] } } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        ...(error.details?.length ? { details: error.details } : {})
      }
    };
  }

  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    console.error(fallbackMessage, error);
  }
  return { status: 500, body: { error: fallbackMessage } };
}
