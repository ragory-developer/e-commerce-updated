import { Prisma } from '@prisma/client';

const SOFT_DELETE_MODELS = new Set([
  'User',
  'Address',
  'Brand',
  'Category',
  'Tag',
  'Product',
  'ProductVariant',
  'AttributeSet',
  'Attribute',
  'AttributeValue',
  'Option',
  'OptionValue',
  'Variation',
  'VariationValue',
  'Order',
  'Transaction',
  'OrderDownload',
  'TaxClass',
  'TaxRate',
  'Coupon',
  'Review',
  'FlashSale',
  'FlashSaleProduct',
  'CurrencyRate',
  'Setting',
  'SearchTerm',
  'File',
]);

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
      return next(params);
    }

    // ─── READ Operations: Auto-filter deletedAt IS NULL ──────
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    if (params.action === 'findMany') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    if (params.action === 'count') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = {
        deletedAt: new Date(),
      };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (!params.args) params.args = {};
      params.args.data = {
        deletedAt: new Date(),
      };
    }

    return next(params);
  };
}
