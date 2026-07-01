const PAID_ASAAS_STATUSES = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);

export function mapAsaasPaymentStatus(status?: string | null) {
  if (!status) {
    return "pending";
  }

  if (PAID_ASAAS_STATUSES.has(status)) {
    return "approved";
  }

  if (status === "OVERDUE") {
    return "overdue";
  }

  if (status === "REFUNDED" || status === "REFUND_REQUESTED") {
    return "refunded";
  }

  if (status === "DELETED") {
    return "cancelled";
  }

  return "pending";
}

export function isApprovedStatus(status?: string | null) {
  return status === "paid" || status === "approved";
}
