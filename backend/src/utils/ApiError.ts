export class ApiError extends Error {
  statusCode: number;
  /** Machine-readable reason the UI can branch on (e.g. GUEST_LIMIT_REACHED). */
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
