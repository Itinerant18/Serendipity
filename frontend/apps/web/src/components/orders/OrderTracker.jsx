"use client";

import React from "react";

const steps = [
    { id: "placed", label: "Order Placed", icon: "fa-circle-check" },
    { id: "processing", label: "Processing", icon: "fa-box" },
    { id: "shipped", label: "Shipped", icon: "fa-truck" },
    { id: "out_for_delivery", label: "Out for Delivery", icon: "fa-truck-fast" },
    { id: "delivered", label: "Delivered", icon: "fa-house" },
];

const statusToStep = {
    pending: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
    cancelled: 0
};

export default function OrderTracker({ status = "pending", estimatedDelivery }) {
    const currentStep = statusToStep[status?.toLowerCase()] || 1;
    const isCancelled = status?.toLowerCase() === "cancelled";

    return (
        <div className="w-full py-4">
            {isCancelled ? (
                <div className="flex items-center justify-center gap-4 p-4 bg-red-100 border-4 border-black">
                    <div className="w-12 h-12 bg-red-500 border-4 border-black flex items-center justify-center">
                        <i className="fa-solid fa-circle-xmark text-white text-xl" />
                    </div>
                    <div>
                        <p className="font-brutalist text-lg text-black">ORDER CANCELLED</p>
                        <p className="font-bold text-sm text-gray-600">This order has been cancelled</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Progress Bar */}
                    <div className="relative mb-8">
                        {/* Background Line */}
                        <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 border-2 border-black" />

                        {/* Active Progress Line */}
                        <div
                            className="absolute top-5 left-0 h-2 bg-green-500 border-2 border-black transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {/* Step Circles */}
                        <div className="relative flex justify-between">
                            {steps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const isCompleted = stepNum < currentStep;
                                const isActive = stepNum === currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center">
                                        <div
                                            className={`
                                                w-10 h-10 flex items-center justify-center
                                                border-4 border-black font-bold
                                                transition-all duration-300
                                                ${isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : isActive
                                                        ? "bg-orange-500 text-white scale-110 shadow-[4px_4px_0_#000]"
                                                        : "bg-white text-gray-400"
                                                }
                                            `}
                                        >
                                            {isCompleted ? (
                                                <i className="fa-solid fa-check text-sm" />
                                            ) : (
                                                <i className={`fa-solid ${step.icon} text-sm`} />
                                            )}
                                        </div>
                                        <span
                                            className={`
                                                mt-2 text-xs font-bold text-center max-w-[70px]
                                                ${isCompleted || isActive ? "text-black" : "text-gray-400"}
                                            `}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    {estimatedDelivery && currentStep < 5 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-300">
                            <i className="fa-solid fa-calendar text-blue-500" />
                            <span className="font-bold text-sm text-blue-800">
                                Estimated Delivery: {estimatedDelivery}
                            </span>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="flex items-center gap-3 p-3 bg-green-100 border-2 border-green-400">
                            <i className="fa-solid fa-circle-check text-green-600" />
                            <span className="font-bold text-sm text-green-800">
                                Your order has been delivered!
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
