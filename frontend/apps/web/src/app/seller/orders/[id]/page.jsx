"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import GlassCard from "@/components/ui/GlassCard";
import StatusTimeline from "@/components/StatusTimeline";
import { API_URL } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_ACTIONS = {
    pending: { next: "confirmed", label: "Confirm Order", icon: "fa-circle-check", color: "bg-blue-500" },
    confirmed: { next: "packed", label: "Mark as Packed", icon: "fa-box", color: "bg-indigo-500" },
    packed: { next: "shipped", label: "Mark as Shipped", icon: "fa-truck", color: "bg-purple-500" },
    shipped: { next: "out_for_delivery", label: "Out for Delivery", icon: "fa-truck-fast", color: "bg-orange-500" },
    out_for_delivery: { next: "delivered", label: "Mark as Delivered", icon: "fa-house-circle-check", color: "bg-green-500" },
};

const SELLER_CANCELLABLE = ["pending", "confirmed", "packed"];

export default function SellerOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/seller/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setOrder(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && id) fetchOrder();
    }, [token, id]);

    const updateStatus = async (newStatus, note = "") => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/api/seller/orders/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, note })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");
            toast.success(data.message || "Status updated");
            await fetchOrder();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        const reason = prompt("Reason for cancellation:");
        if (reason !== null) updateStatus("cancelled", reason || "Cancelled by seller");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-5xl text-orange-500"></i>
                    <p className="font-brutalist text-xl mt-4">LOADING ORDER...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <i className="fa-solid fa-triangle-exclamation text-5xl text-red-500"></i>
                <p className="font-brutalist text-xl mt-4">ORDER NOT FOUND</p>
                <button
                    onClick={() => navigate("/seller/orders")}
                    className="mt-4 px-6 py-2 bg-black text-white font-bold border-4 border-white hover:bg-orange-500"
                >
                    ← Back to Orders
                </button>
            </div>
        );
    }

    const action = STATUS_ACTIONS[order.status];
    const canCancel = SELLER_CANCELLABLE.includes(order.status);
    const isEndState = ["delivered", "cancelled", "returned"].includes(order.status);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Back button + Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate("/seller/orders")}
                        className="text-sm font-bold text-black hover:text-orange-500 mb-2 inline-block"
                    >
                        <i className="fa-solid fa-arrow-left mr-2"></i>Back to Orders
                    </button>
                    <h1 className="font-brutalist text-2xl sm:text-3xl text-black bg-black text-white px-6 py-2 inline-block">
                        ORDER #{order.orderNumber || order.id?.slice(0, 8)}
                    </h1>
                </div>
                <div className="text-right text-sm font-bold text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            {!isEndState && (
                <GlassCard className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {action && (
                            <button
                                onClick={() => updateStatus(action.next)}
                                disabled={updating}
                                className={`${action.color} text-white font-bold px-6 py-3 border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000000] transition-all disabled:opacity-50 cursor-pointer`}
                            >
                                {updating ? (
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                ) : (
                                    <i className={`fa-solid ${action.icon} mr-2`}></i>
                                )}
                                {action.label}
                            </button>
                        )}
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={updating}
                                className="bg-red-500 text-white font-bold px-6 py-3 border-4 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000000] transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <i className="fa-solid fa-xmark mr-2"></i>Cancel Order
                            </button>
                        )}
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Status & Customer */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Timeline */}
                    <GlassCard className="p-6">
                        <h2 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            ORDER STATUS
                        </h2>
                        <StatusTimeline
                            statusHistory={order.statusHistory || []}
                            currentStatus={order.status}
                        />
                    </GlassCard>

                    {/* Customer Info */}
                    <GlassCard className="p-6">
                        <h2 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            CUSTOMER
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p className="font-bold text-black">
                                <i className="fa-solid fa-user mr-2 text-orange-500"></i>
                                {order.customer?.name || "Guest"}
                            </p>
                            <p className="text-gray-600">
                                <i className="fa-solid fa-envelope mr-2 text-orange-500"></i>
                                {order.customer?.email || "N/A"}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Payment Info */}
                    <GlassCard className="p-6">
                        <h2 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            PAYMENT
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method</span>
                                <span className="font-bold">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`font-bold px-2 py-0.5 border-2 border-black ${order.isPaid
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t-2 border-dashed border-gray-200">
                                <span className="font-bold text-black">Total</span>
                                <span className="font-brutalist text-xl text-green-600">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right: Items & Shipping */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <GlassCard className="p-6">
                        <h2 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            ITEMS ({order.items?.length || 0})
                        </h2>
                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 border-3 border-black bg-gray-50">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-16 h-16 object-cover border-2 border-black"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-black text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500">
                                            Qty: {item.quantity} × {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                    <p className="font-brutalist text-green-600">
                                        {formatCurrency(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Shipping Address */}
                    <GlassCard className="p-6">
                        <h2 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            SHIPPING ADDRESS
                        </h2>
                        {order.shippingAddress && (
                            <div className="text-sm space-y-1 text-gray-700">
                                <p className="font-bold text-black">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                    {order.shippingAddress.city}
                                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                                    {" "}{order.shippingAddress.zip}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
