// src/errors/BaseError.ts
class BaseError extends Error {
  public name: string;
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'Internal Error';
    this.statusCode = 500; // Default status code
  }
}

export default BaseError;
