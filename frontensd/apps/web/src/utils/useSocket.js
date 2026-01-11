import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * useSocket Hook
 * Manages WebSocket connection for real-time features
 * @param {Function} onEvent - Optional callback for socket events
 * @returns {{ socket: Socket | null, isConnected: boolean }}
 */
const useSocket = (onEvent) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const onEventRef = useRef(onEvent);
    const [isConnected, setIsConnected] = useState(false);

    // Update the ref whenever onEvent changes
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        // Only connect if user is logged in and no existing connection
        if (!user || !user.id) {
            // Clean up any existing connection if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Don't reconnect if already connected
        if (socketRef.current?.connected) {
            return;
        }

        console.log(`Initializing socket for user: ${user.id}`);

        // Initialize socket connection
        const socket = io(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to socket server. Socket ID:', socket.id);
            setIsConnected(true);
            // Join a private room based on user ID
            socket.emit('join', user.id);
            console.log(`Emitting join for user identity: ${user.id}`);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Listen for new orders (multiple event name formats)
        socket.on('NEW_ORDER', (data) => {
            console.log('NEW_ORDER event received:', data);
            if (onEventRef.current) {
                onEventRef.current('NEW_ORDER', data);
            }
        });

        socket.on('new_order', (data) => {
            console.log('new_order event received:', data);
            if (onEventRef.current) {
                onEventRef.current('new_order', data);
            }
        });

        // Cleanup on unmount or user change
        return () => {
            if (socketRef.current) {
                console.log('Disconnecting socket');
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [user?.id]);

    return {
        socket: socketRef.current,
        isConnected
    };
};

export default useSocket;

