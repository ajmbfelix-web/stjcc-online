export type TestingEventStatus =
  | "ordered"
  | "collection_pending"
  | "collected"
  | "result_pending"
  | "mro_hold"
  | "cleared"
  | "exception"
  | "cancelled";

export type TestingEventTransition = {
  from: TestingEventStatus;
  to: TestingEventStatus;
  result?: string;
};

const transitions: Record<TestingEventStatus, readonly TestingEventStatus[]> = {
  ordered: ["collection_pending", "cancelled"],
  collection_pending: ["collected", "cancelled", "exception"],
  collected: ["result_pending", "cancelled", "exception"],
  result_pending: ["mro_hold", "cleared", "exception"],
  mro_hold: ["cleared", "exception"],
  cleared: [],
  exception: [],
  cancelled: [],
};

export function canTransition(from: TestingEventStatus, to: TestingEventStatus): boolean {
  return from === to || transitions[from].includes(to);
}

export function transitionEvent({ from, to, result }: TestingEventTransition): TestingEventStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid testing event transition: ${from} -> ${to}`);
  }
  if (to === "cleared" && !result?.trim()) {
    throw new Error("A cleared testing event requires a result");
  }
  return to;
}

export function statusForVendorEvent(eventType: string, result?: string): TestingEventStatus {
  switch (eventType.trim().toLowerCase()) {
    case "order.created":
      return "ordered";
    case "collection.started":
      return "collection_pending";
    case "collection.completed":
      return "collected";
    case "result.pending":
      return "result_pending";
    case "mro.hold":
      return "mro_hold";
    case "result.negative":
      return "cleared";
    case "result.positive":
    case "result.refused":
    case "process.exception":
      return "exception";
    default:
      if (result?.toLowerCase().includes("negative")) return "cleared";
      throw new Error(`Unsupported vendor event: ${eventType}`);
  }
}

export function exceptionForStatus(status: TestingEventStatus): { title: string; description: string } | null {
  if (status === "mro_hold") {
    return {
      title: "Medical review officer hold",
      description: "The result requires medical review before the driver can be cleared.",
    };
  }
  if (status === "exception") {
    return {
      title: "Compliance exception requires review",
      description: "The testing workflow produced an exception that needs owner action.",
    };
  }
  return null;
}