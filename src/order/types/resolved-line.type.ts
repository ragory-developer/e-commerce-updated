// ─── A fully-validated line item resolved from raw checkout input ──

export interface ResolvedLine {
  productId: string;
  productVariantId: string | null;
  taxClassId: string | null;

  // Snapshot data
  productName: string;
  productSku: string | null;
  productSlug: string;
  productImage: object | null;

  unitPrice: number;
  qty: number;
  lineTotal: number;

  manageStock: boolean;
  currentStockQty: number | null;
}
