import { SparePart } from "../../../../common/types";

export type { SparePart };

export interface StockAdjustmentPayload {
  partId: string;
  adjustmentQty: number;
  reason: string;
}
