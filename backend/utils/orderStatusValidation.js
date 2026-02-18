/**
 * Order status lifecycle and validation helpers.
 *
 * Statuses: pending → confirmed → packed → shipped → out_for_delivery → delivered | cancelled | returned
 */

const STATUSES = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PACKED: 'packed',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
};

const ALLOWED_TRANSITIONS = {
    [STATUSES.PENDING]: [STATUSES.CONFIRMED, STATUSES.CANCELLED],
    [STATUSES.CONFIRMED]: [STATUSES.PACKED, STATUSES.CANCELLED],
    [STATUSES.PACKED]: [STATUSES.SHIPPED],
    [STATUSES.SHIPPED]: [STATUSES.OUT_FOR_DELIVERY],
    [STATUSES.OUT_FOR_DELIVERY]: [STATUSES.DELIVERED],
    [STATUSES.DELIVERED]: [STATUSES.RETURNED],
    [STATUSES.CANCELLED]: [],
    [STATUSES.RETURNED]: [],
};

const BUYER_CANCELLABLE = [STATUSES.PENDING, STATUSES.CONFIRMED];
const STOCK_DEDUCT_ON = STATUSES.CONFIRMED;
const STOCK_RESTORE_ON = [STATUSES.CANCELLED, STATUSES.RETURNED];

function isValidTransition(from, to) {
    const allowed = ALLOWED_TRANSITIONS[from];
    return Array.isArray(allowed) && allowed.includes(to);
}

function buildStatusHistoryEntry(status, updatedBy, note) {
    return {
        status,
        timestamp: new Date().toISOString(),
        updatedBy,
        note: note || null,
    };
}

function statusLabel(status) {
    const labels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        packed: 'Packed',
        shipped: 'Shipped',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        returned: 'Returned',
    };
    return labels[status] || status;
}

module.exports = {
    STATUSES,
    ALLOWED_TRANSITIONS,
    BUYER_CANCELLABLE,
    STOCK_DEDUCT_ON,
    STOCK_RESTORE_ON,
    isValidTransition,
    buildStatusHistoryEntry,
    statusLabel,
};
