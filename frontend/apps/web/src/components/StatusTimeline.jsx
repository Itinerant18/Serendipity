"use client";

import React from "react";

const STATUS_CONFIG = {
    pending: { label: "Pending", icon: "fa-clock", color: "bg-yellow-400", textColor: "text-yellow-800" },
    confirmed: { label: "Confirmed", icon: "fa-circle-check", color: "bg-blue-400", textColor: "text-blue-800" },
    packed: { label: "Packed", icon: "fa-box", color: "bg-indigo-400", textColor: "text-indigo-800" },
    shipped: { label: "Shipped", icon: "fa-truck", color: "bg-purple-400", textColor: "text-purple-800" },
    out_for_delivery: { label: "Out for Delivery", icon: "fa-truck-fast", color: "bg-orange-400", textColor: "text-orange-800" },
    delivered: { label: "Delivered", icon: "fa-house-circle-check", color: "bg-green-500", textColor: "text-green-800" },
    cancelled: { label: "Cancelled", icon: "fa-xmark", color: "bg-red-500", textColor: "text-red-800" },
    returned: { label: "Returned", icon: "fa-rotate-left", color: "bg-gray-500", textColor: "text-gray-800" },
};

const STATUS_ORDER = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export default function StatusTimeline({ statusHistory = [], currentStatus = "pending" }) {
    const isCancelledOrReturned = currentStatus === "cancelled" || currentStatus === "returned";

    const formatDate = (ts) => {
        if (!ts) return "";
        const d = new Date(ts);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const historyMap = {};
    statusHistory.forEach(entry => {
        historyMap[entry.status] = entry;
    });

    const activeIndex = STATUS_ORDER.indexOf(currentStatus);

    return (
        <div className="relative">
            {/* Main timeline */}
            <div className="space-y-0">
                {STATUS_ORDER.map((status, index) => {
                    const config = STATUS_CONFIG[status];
                    const entry = historyMap[status];
                    const isCompleted = entry || index < activeIndex;
                    const isCurrent = status === currentStatus && !isCancelledOrReturned;
                    const isFuture = !isCompleted && !isCurrent;

                    return (
                        <div key={status} className="flex items-start gap-4">
                            {/* Vertical line + dot */}
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 border-3 border-black flex items-center justify-center flex-shrink-0 ${isCompleted ? config.color : isCurrent ? `${config.color} animate-pulse` : "bg-gray-200"
                                    }`}>
                                    <i className={`fa-solid ${config.icon} text-xs ${isCompleted || isCurrent ? "text-white" : "text-gray-400"
                                        }`}></i>
                                </div>
                                {index < STATUS_ORDER.length - 1 && (
                                    <div className={`w-1 h-8 ${isCompleted ? "bg-black" : "bg-gray-200"
                                        }`}></div>
                                )}
                            </div>

                            {/* Label */}
                            <div className={`pt-1 ${isFuture ? "opacity-40" : ""}`}>
                                <p className={`font-bold text-sm ${isCurrent ? "text-black" : isCompleted ? "text-gray-700" : "text-gray-400"
                                    }`}>
                                    {config.label}
                                    {isCurrent && (
                                        <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 font-mono">CURRENT</span>
                                    )}
                                </p>
                                {entry && (
                                    <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                                )}
                                {entry?.note && (
                                    <p className="text-xs text-gray-400 italic mt-0.5">{entry.note}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cancelled / Returned badge */}
            {isCancelledOrReturned && (
                <div className="mt-4 flex items-start gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 border-3 border-black flex items-center justify-center ${STATUS_CONFIG[currentStatus].color}`}>
                            <i className={`fa-solid ${STATUS_CONFIG[currentStatus].icon} text-xs text-white`}></i>
                        </div>
                    </div>
                    <div className="pt-1">
                        <p className="font-bold text-sm text-red-700">
                            {STATUS_CONFIG[currentStatus].label}
                            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 font-mono">FINAL</span>
                        </p>
                        {historyMap[currentStatus] && (
                            <>
                                <p className="text-xs text-gray-500">{formatDate(historyMap[currentStatus].timestamp)}</p>
                                {historyMap[currentStatus].note && (
                                    <p className="text-xs text-red-400 italic mt-0.5">{historyMap[currentStatus].note}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { STATUS_CONFIG };
