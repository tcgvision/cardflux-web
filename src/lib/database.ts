import { db } from "~/server/db";
import { ErrorHandler } from "./error-handling";

/**
 * Database Utility
 * Handles database transactions and common operations
 */
export class DatabaseService {
  /**
   * Execute a function within a database transaction
   */
  static async transaction<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return await db.$transaction(async (tx) => {
      try {
        return await operation();
      } catch (error) {
        ErrorHandler.logError(error, `${context} transaction`);
        throw error;
      }
    });
  }

  /**
   * Safe database query with error handling
   */
  static async safeQuery<T>(
    query: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T> {
    try {
      return await query();
    } catch (error) {
      ErrorHandler.logError(error, context);
      if (fallback !== undefined) {
        return fallback;
      }
      throw ErrorHandler.handleDatabaseError(error, context);
    }
  }

  /**
   * Create a record with error handling
   */
  static async create<T>(
    model: { create: (args: { data: unknown; include?: unknown }) => Promise<T> },
    data: unknown,
    context: string,
    include?: unknown
  ): Promise<T> {
    return await this.safeQuery(
      () => model.create({ data, include }),
      context
    );
  }

  /**
   * Find a unique record with error handling
   */
  static async findUnique<T>(
    model: { findUnique: (args: { where: unknown; include?: unknown }) => Promise<T | null> },
    where: unknown,
    context: string,
    include?: unknown
  ): Promise<T | null> {
    return await this.safeQuery(
      () => model.findUnique({ where, include }),
      context,
      null
    );
  }

  /**
   * Find many records with error handling
   */
  static async findMany<T>(
    model: any,
    where: any,
    context: string,
    include?: any,
    orderBy?: any
  ): Promise<T[]> {
    return await this.safeQuery(
      () => model.findMany({ where, include, orderBy }),
      context,
      []
    );
  }

  /**
   * Update a record with error handling
   */
  static async update<T>(
    model: any,
    where: any,
    data: any,
    context: string,
    include?: any
  ): Promise<T> {
    return await this.safeQuery(
      () => model.update({ where, data, include }),
      context
    );
  }

  /**
   * Delete a record with error handling
   */
  static async delete<T>(
    model: any,
    where: any,
    context: string
  ): Promise<T> {
    return await this.safeQuery(
      () => model.delete({ where }),
      context
    );
  }

  /**
   * Count records with error handling
   */
  static async count(
    model: any,
    where: any,
    context: string
  ): Promise<number> {
    return await this.safeQuery(
      () => model.count({ where }),
      context,
      0
    );
  }

  /**
   * Aggregate records with error handling
   */
  static async aggregate<T>(
    model: any,
    aggregation: any,
    context: string
  ): Promise<T> {
    return await this.safeQuery(
      () => model.aggregate(aggregation),
      context
    );
  }

  /**
   * Upsert a record with error handling
   */
  static async upsert<T>(
    model: any,
    where: any,
    create: any,
    update: any,
    context: string
  ): Promise<T> {
    return await this.safeQuery(
      () => model.upsert({ where, create, update }),
      context
    );
  }

  /**
   * Check if a record exists
   */
  static async exists(
    model: { count: (args: { where: unknown }) => Promise<number> },
    where: unknown,
    context: string
  ): Promise<boolean> {
    const count = await this.safeQuery(
      () => model.count({ where }),
      context,
      0
    );
    return count > 0;
  }

  /**
   * Get paginated results
   */
  static async paginate<T>(
    model: any,
    where: any,
    page: number,
    limit: number,
    context: string,
    include?: any,
    orderBy?: any
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.findMany<T>(model, where, context, include, orderBy),
      this.count(model, where, context),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Common database operations for specific models
 */
export class UserService {
  static async findByClerkId(clerkId: string) {
    return await DatabaseService.safeQuery(
      () => db.user.findUnique({
        where: { clerkId },
        include: { shop: true }
      }),
      "UserService.findByClerkId",
      null
    );
  }

  static async updateShopLink(userId: number, shopId: string, role: string) {
    return await DatabaseService.safeQuery(
      () => db.user.update({
        where: { id: userId },
        data: { shopId, role }
      }),
      "UserService.updateShopLink"
    );
  }
}

export class ShopService {
  static async findById(id: string) {
    return await DatabaseService.safeQuery(
      () => db.shop.findUnique({
        where: { id },
        include: { settings: true }
      }),
      "ShopService.findById",
      null
    );
  }

  static async findBySlug(slug: string) {
    return await DatabaseService.safeQuery(
      () => db.shop.findUnique({
        where: { slug }
      }),
      "ShopService.findBySlug",
      null
    );
  }

  static async createShop(data: unknown) {
    return await DatabaseService.safeQuery(
      () => db.shop.create({
        data: data as any,
        include: { settings: true }
      }),
      "ShopService.createShop"
    );
  }

  static async getMembers(shopId: string) {
    return await DatabaseService.safeQuery(
      () => db.user.findMany({
        where: { shopId },
        orderBy: { id: "asc" }
      }),
      "ShopService.getMembers",
      []
    );
  }
} 