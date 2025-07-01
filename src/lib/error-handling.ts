import { TRPCError } from "@trpc/server";

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Error Handling Utility
 * Centralized error handling for consistent error responses
 */
export class ErrorHandler {
  /**
   * Create a standardized TRPC error
   */
  static createTRPCError(
    code: TRPCError["code"],
    message: string,
    details?: Record<string, unknown>
  ): TRPCError {
    return new TRPCError({
      code,
      message,
      cause: details ? new Error(JSON.stringify(details)) : undefined,
    });
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: unknown, context: string): TRPCError {
    console.error(`Database error in ${context}:`, error);
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes("Unique constraint")) {
        return this.createTRPCError(
          "CONFLICT",
          "A record with this information already exists"
        );
      }
      
      if (error.message.includes("Foreign key constraint")) {
        return this.createTRPCError(
          "BAD_REQUEST",
          "Invalid reference to related record"
        );
      }
      
      if (error.message.includes("Record to update not found")) {
        return this.createTRPCError(
          "NOT_FOUND",
          "Record not found"
        );
      }
    }
    
    return this.createTRPCError(
      "INTERNAL_SERVER_ERROR",
      "Database operation failed"
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    field: string,
    message: string,
    value?: unknown
  ): TRPCError {
    return this.createTRPCError(
      "BAD_REQUEST",
      `Validation error: ${message}`,
      { field, value }
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message = "Authentication required"): TRPCError {
    return this.createTRPCError("UNAUTHORIZED", message);
  }

  /**
   * Handle authorization errors
   */
  static handleForbiddenError(
    message = "Insufficient permissions"
  ): TRPCError {
    return this.createTRPCError("FORBIDDEN", message);
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(
    resource: string,
    identifier?: string
  ): TRPCError {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    return this.createTRPCError("NOT_FOUND", message);
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(
    message = "Too many requests"
  ): TRPCError {
    return this.createTRPCError("TOO_MANY_REQUESTS", message);
  }

  /**
   * Log error with context
   */
  static logError(
    error: unknown,
    context: string,
    additionalInfo?: Record<string, unknown>
  ): void {
    const errorInfo = {
      context,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...additionalInfo,
    };
    
    console.error(`[${context}] Error:`, errorInfo);
  }

  /**
   * Safe async operation wrapper
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, context);
      if (fallback !== undefined) {
        return fallback;
      }
      throw this.handleDatabaseError(error, context);
    }
  }
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  AUTH: {
    UNAUTHORIZED: "You must be signed in to perform this action",
    INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action",
    INVALID_CREDENTIALS: "Invalid email or password",
  },
  SHOP: {
    NOT_FOUND: "Shop not found",
    ALREADY_MEMBER: "You are already a member of a shop",
    NOT_MEMBER: "You must be a member of a shop to perform this action",
    ADMIN_REQUIRED: "Admin privileges required for this action",
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `${field} has an invalid format`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  },
  DATABASE: {
    OPERATION_FAILED: "Database operation failed",
    RECORD_NOT_FOUND: "Record not found",
    DUPLICATE_ENTRY: "A record with this information already exists",
  },
} as const; 