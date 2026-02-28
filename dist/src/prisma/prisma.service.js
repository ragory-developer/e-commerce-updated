"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const SOFT_DELETE_MODELS = new Set([
    'Admin',
    'Customer',
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
    'DeliveryRider',
    'OrderPackage',
]);
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development'
                ? [
                    { emit: 'event', level: 'query' },
                    { emit: 'stdout', level: 'info' },
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ]
                : [
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ],
        });
        return this.$extends({
            name: 'softDelete',
            query: {
                $allModels: {
                    async findUnique({ model, args, query }) {
                        if (!SOFT_DELETE_MODELS.has(model)) {
                            return query(args);
                        }
                        return query(args);
                    },
                    async findFirst({ model, args, query }) {
                        if (!SOFT_DELETE_MODELS.has(model)) {
                            return query(args);
                        }
                        if (!args.where)
                            args.where = {};
                        if (args.where.deletedAt === undefined) {
                            args.where.deletedAt = null;
                        }
                        return query(args);
                    },
                    async findMany({ model, args, query }) {
                        if (!SOFT_DELETE_MODELS.has(model)) {
                            return query(args);
                        }
                        if (!args)
                            args = {};
                        if (!args.where)
                            args.where = {};
                        if (args.where.deletedAt === undefined) {
                            args.where.deletedAt = null;
                        }
                        return query(args);
                    },
                    async count({ model, args, query }) {
                        if (!SOFT_DELETE_MODELS.has(model)) {
                            return query(args);
                        }
                        if (!args)
                            args = {};
                        if (!args.where)
                            args.where = {};
                        if (args.where.deletedAt === undefined) {
                            args.where.deletedAt = null;
                        }
                        return query(args);
                    },
                },
            },
        });
    }
    async onModuleInit() {
        if (process.env.NODE_ENV === 'development') {
            this.$on('query', (e) => {
                this.logger.debug(`Query: ${e.query}`);
                this.logger.debug(`Duration: ${e.duration}ms`);
            });
        }
        await this.$connect();
        this.logger.log('✅ Database connected successfully');
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async softDelete(model, id, deletedBy) {
        await this[model].update({
            where: { id },
            data: {
                deletedAt: new Date(),
                ...(deletedBy ? { deletedBy } : {}),
            },
        });
    }
    async restore(model, id) {
        await this[model].update({
            where: { id },
            data: {
                deletedAt: null,
                deletedBy: null,
            },
        });
    }
    async hardDelete(model, id) {
        const client = new client_1.PrismaClient();
        try {
            await client[model].delete({ where: { id } });
        }
        finally {
            await client.$disconnect();
        }
    }
    async purgeDeletedRecords(model, olderThanDays = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const client = new client_1.PrismaClient();
        try {
            const result = await client[model].deleteMany({
                where: {
                    deletedAt: { not: null, lt: cutoffDate },
                },
            });
            this.logger.log(`Purged ${result.count} ${model} records older than ${olderThanDays} days`);
            return result.count;
        }
        finally {
            await client.$disconnect();
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map