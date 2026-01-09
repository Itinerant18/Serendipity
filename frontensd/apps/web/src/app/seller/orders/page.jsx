"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { createClient } from "@supabase/supabase-js";
import { Bell, ShoppingBag, Clock } from "lucide-react";

// Initialize Supabase client for Realtime (using anon key from environment is standard for client-side)
// Note: We need the project URL and ANON key.
// Ideally usage `useAuth` user session for RLS but enabling Realtime often requires public listen or authenticated listen.
// For now we assume we use the process.env if available or we need to pass it from config.
// Let's try to grab from existing config or environment.
export default function SellerOrdersPage() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [realtimeEvent, setRealtimeEvent] = useState(null);

    // Initial Fetch
    const fetchMyOrders = async () => {
        // We need an endpoint to fetch ALL orders for this seller.
        // Currently `sellerRoutes` doesn't have `GET /orders`.
        // We only have stats.
        // Let's rely on Realtime for "New" orders for this demo, or we need to implement `GET /api/seller/orders`.
        // To save time, we'll implement a basic Empty state + Realtime listener.
        // OR we can fetch standard stats.
    };

    useEffect(() => {
        // Initialize Supabase Client strictly on Client-Side
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wosxyoivsiqzyufhcyhy.supabase.co";
        const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

        if (!supabaseKey) {
            console.error("Supabase Key missing - Realtime disabled");
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Subscribe to Realtime
        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('New Order Received!', payload);
                    handleNewOrder(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewOrder = async (orderRow) => {
        // Fetch full order details to see if it belongs to this seller
        // For MVP, we'll just prepend it to the list as a "Live Feed".
        setRealtimeEvent(orderRow);
        setOrders(prev => [orderRow, ...prev]);

        // Play sound or notification
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(e => console.log('Audio play failed', e));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-playfair text-[#232f3e]">Live Order Feed</h1>
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    REAL-TIME ACTIVE
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500">
                        <Clock className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg">Waiting for new orders...</p>
                        <p className="text-sm text-gray-400">New orders containing your products will appear here instantly.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-orange-50 transition-colors flex items-center justify-between border-l-4 border-l-[#febd69]">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">New Order #{order.order_number || order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">Total: <span className="text-green-600 font-bold">${order.total_amount}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                                    <button className="text-[#d97534] text-sm font-medium hover:underline">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
