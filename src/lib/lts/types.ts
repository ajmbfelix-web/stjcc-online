export type ScreeningStatus =
  | "COLLECTION_PENDING"
  | "COLLECTION_COMPLETE"
  | "CLEARED"
  | "MRO_HOLD"
  | "EXCEPTION";

export type TestType = "DOT_5_PANEL" | "BACKGROUND_CHECK" | "BREATH_ALCOHOL";

export type DriverRecord = {
  id: string;
  name: string;
  cdl: string;
  testType: TestType;
  status: ScreeningStatus;
  barcode: string;
  updatedAt: string;
};

export type WebhookEvent = {
  id: string;
  receivedAt: string;
  source: "ORDER_DISPATCH" | "WEBHOOK" | "SYSTEM";
  path: string;
  payload: unknown;
};

export type OrderRequest = {
  partnerId?: string;
  driver?: {
    name?: string;
    cdl?: string;
    dob?: string;
  };
  testType?: TestType;
  collectionNetwork?: string;
};

export type WebhookPayload = {
  event?: string;
  orderId?: string;
  driverId?: string;
  status?: ScreeningStatus | "NEGATIVE" | "POSITIVE";
  result?: string;
  barcode?: string;
  mroReviewedAt?: string;
};
