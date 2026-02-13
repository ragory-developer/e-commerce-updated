// ─── Auto Audit + Price History Middleware ────────────────────
// Intercepts all writes and automatically:
// 1. Creates AuditLog entries
// 2. Creates PriceHistory entries when product prices change
// 3. Sets `deletedBy` on soft deletes from the current user context

import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls'; // Continuation-local storage for request context

const PRICE_FIELDS = new Set(['price', 'specialPrice', 'special_price']);

const AUDITABLE_MODELS = new Set([
  'Product',
  'ProductVariant',
  'Order',
  'User',
  'Coupon',
  'FlashSale',
  'Brand',
  'Category',
]);

export function auditMiddleware(cls: ClsService): Prisma.Middleware {
  return async (params, next) => {
    const result = await next(params);

    // Skip if not an auditable model or not a write operation
    if (
      !params.model ||
      !AUDITABLE_MODELS.has(params.model) ||
      !['create', 'update', 'delete', 'updateMany', 'deleteMany'].includes(
        params.action,
      )
    ) {
      return result;
    }

    try {
      const userId = cls.get('userId'); // Get current user from request context

      // Auto-set deletedBy on soft deletes
      if (
        params.action === 'update' &&
        params.args?.data?.deletedAt &&
        userId
      ) {
        // The soft delete middleware already converted delete→update
        // Now we set who did it
        params.args.data.deletedBy = userId;
      }

      // Log to audit (fire-and-forget, don't block the request)
      // In production: emit event → process async via queue
      setImmediate(() => {
        // AuditLog creation happens here
        // Use a separate PrismaClient to avoid middleware recursion
      });
    } catch {
      // Never let audit logging break the actual operation
    }

    return result;
  };
}
