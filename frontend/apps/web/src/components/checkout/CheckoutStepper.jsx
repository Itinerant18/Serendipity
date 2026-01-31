"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";

const steps = [
    { id: 1, name: "Cart", path: "/cart", icon: "fa-cart-shopping" },
    { id: 2, name: "Shipping", path: "/checkout/shipping", icon: "fa-truck" },
    { id: 3, name: "Payment", path: null, icon: "fa-credit-card" },
    { id: 4, name: "Complete", path: "/checkout/success", icon: "fa-circle-check" },
];

export default function CheckoutStepper({ currentStep = 1 }) {
    const location = useLocation();

    // Auto-detect current step from path if not provided
    const getActiveStep = () => {
        if (location.pathname.includes("/checkout/success")) return 4;
        if (location.pathname.includes("/checkout/shipping")) return 2;
        if (location.pathname.includes("/cart")) return 1;
        return currentStep;
    };

    const activeStep = getActiveStep();

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            {/* Mobile View - Simple badges */}
            <div className="flex md:hidden justify-center gap-2 mb-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`
                            w-10 h-10 flex items-center justify-center font-bold
                            border-3 border-black
                            ${step.id < activeStep
                                ? "bg-green-500 text-white"
                                : step.id === activeStep
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                            }
                        `}
                    >
                        {step.id < activeStep ? (
                            <i className="fa-solid fa-check" />
                        ) : (
                            step.id
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop View - Full stepper */}
            <div className="hidden md:flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-300 -z-10 mx-16" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-6 left-0 h-1 bg-green-500 -z-10 mx-16 transition-all duration-500"
                    style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = step.id < activeStep;
                    const isActive = step.id === activeStep;
                    const isClickable = step.path && step.id < activeStep;

                    const StepContent = (
                        <div className="flex flex-col items-center relative group">
                            {/* Step Circle */}
                            <div
                                className={`
                                    w-12 h-12 flex items-center justify-center
                                    border-4 border-black font-bold text-lg
                                    transition-all duration-200
                                    ${isCompleted
                                        ? "bg-green-500 text-white shadow-[4px_4px_0_#000000]"
                                        : isActive
                                            ? "bg-orange-500 text-white shadow-[6px_6px_0_#000000] scale-110"
                                            : "bg-white text-gray-400"
                                    }
                                    ${isClickable ? "cursor-pointer hover:scale-105" : ""}
                                `}
                            >
                                {isCompleted ? (
                                    <i className="fa-solid fa-check" />
                                ) : (
                                    <i className={`fa-solid ${step.icon}`} />
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`
                                    mt-3 font-bold text-sm uppercase tracking-wide
                                    ${isCompleted
                                        ? "text-green-600"
                                        : isActive
                                            ? "text-orange-600"
                                            : "text-gray-400"
                                    }
                                `}
                            >
                                {step.name}
                            </span>

                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            )}
                        </div>
                    );

                    return (
                        <React.Fragment key={step.id}>
                            {isClickable ? (
                                <Link to={step.path} className="no-underline">
                                    {StepContent}
                                </Link>
                            ) : (
                                StepContent
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
