// ─── Read-only queries for orders ─────────────────────────────

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ListOrdersDto } from '../dto';

const ORDER_INCLUDE = {
  products: {
    include: {
      variations: { include: { variationValues: true } },
      options: { include: { optionValues: true } },
    },
  },
  taxes: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
  packages: true,
  transaction: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
};

@Injectable()
export class OrderQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(dto.status && { status: dto.status }),
      ...(dto.customerId && { customerId: dto.customerId }),
      ...(dto.search && {
        OR: [
          {
            customerEmail: {
              contains: dto.search,
              mode: 'insensitive' as const,
            },
          },
          {
            customerFirstName: {
              contains: dto.search,
              mode: 'insensitive' as const,
            },
          },
          { customerPhone: { contains: dto.search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          products: {
            select: { id: true, productName: true, qty: true, lineTotal: true },
          },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: dto.skip,
        take: dto.take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      meta: {
        skip: dto.skip ?? 0,
        take: dto.take ?? 20,
        page: Math.floor((dto.skip ?? 0) / (dto.take ?? 20)) + 1,
        pageCount: Math.ceil(total / (dto.take ?? 20)) || 1,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findCustomerOrders(customerId: string, skip = 0, take = 20) {
    return this.findAll({ customerId, skip, take });
  }
}
