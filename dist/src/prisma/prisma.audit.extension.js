"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditExtension = void 0;
const client_1 = require("@prisma/client");
const AUDITABLE_MODELS = new Set([
    'Product',
    'ProductVariant',
    'Order',
    'Admin',
    'Customer',
    'Coupon',
    'FlashSale',
    'Brand',
    'Category',
    'Transaction',
]);
exports.auditExtension = client_1.Prisma.defineExtension({
    name: 'audit',
    query: {
        $allModels: {
            async create({ model, args, query }) {
                const result = await query(args);
                if (AUDITABLE_MODELS.has(model)) {
                    setImmediate(() => {
                        console.log('[AUDIT]', {
                            model,
                            operation: 'CREATE',
                            entityId: result?.id,
                            timestamp: new Date().toISOString(),
                        });
                    });
                }
                return result;
            },
            async update({ model, args, query }) {
                const result = await query(args);
                if (AUDITABLE_MODELS.has(model)) {
                    setImmediate(() => {
                        console.log('[AUDIT]', {
                            model,
                            operation: 'UPDATE',
                            entityId: result?.id,
                            changes: args.data,
                            timestamp: new Date().toISOString(),
                        });
                    });
                }
                return result;
            },
            async delete({ model, args, query }) {
                const result = await query(args);
                if (AUDITABLE_MODELS.has(model)) {
                    setImmediate(() => {
                        console.log('[AUDIT]', {
                            model,
                            operation: 'DELETE',
                            entityId: result?.id,
                            timestamp: new Date().toISOString(),
                        });
                    });
                }
                return result;
            },
        },
    },
});
//# sourceMappingURL=prisma.audit.extension.js.map