import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { apiHost } from "../../App";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimerRef = useRef(null);
    const retriesRef = useRef(0);
    const listenersRef = useRef({});

    const HEARTBEAT_INTERVAL = 25000; // 25 seconds
    const RECONNECT_INTERVAL = 5000; // 5 seconds
    const MAX_RETRIES = 3;

    const connect = useCallback(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

        const socketHost = `ws${apiHost.slice(4)}/ws/chat/`;
        const socket = new WebSocket(socketHost);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            retriesRef.current = 0;

            heartbeatTimerRef.current = setInterval(() => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ type: "ping" }));
                }
            }, HEARTBEAT_INTERVAL);

            // Send ready message
            socket.send(JSON.stringify({ action: "ready" }));
        };

        socket.onmessage = (event) => {
            const json_data = event.data;
            if (!json_data) return;
            try {
                const parsed = JSON.parse(json_data);
                const type = parsed.type;
                
                // Call listeners specific to the message type
                const typeListeners = listenersRef.current[type] || [];
                typeListeners.forEach(callback => callback(parsed));

                // Call wildcard listeners (e.g., for raw event processing)
                const allListeners = listenersRef.current['*'] || [];
                allListeners.forEach(callback => callback(event));
            } catch (e) {
                console.error("Socket message parse error", e);
            }
        };

        socket.onclose = (e) => {
            setIsConnected(false);
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
            socketRef.current = null;

            if (e.code === 400) {
                console.error("❌ WebSocket auth failed: User is not authenticated.");
                window.location.href = "/login";
                return;
            }

            if (e.code !== 1000 && retriesRef.current < MAX_RETRIES) {
                console.warn("❌ WebSocket closed. Reconnecting...");
                reconnectTimerRef.current = setTimeout(() => {
                    retriesRef.current++;
                    console.log(`🔁 Reconnecting WebSocket (${MAX_RETRIES - retriesRef.current} retries left)...`);
                    connect();
                }, RECONNECT_INTERVAL);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }, []);

    const disconnect = useCallback(() => {
        clearInterval(heartbeatTimerRef.current);
        clearTimeout(reconnectTimerRef.current);
        heartbeatTimerRef.current = null;
        reconnectTimerRef.current = null;
        
        if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
            socketRef.current.close(1000, "Disconnected manually");
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    const sendMsg = useCallback((action, payload) => {
        const func = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ action, ...payload }));
            }
        };

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            func();
        } else {
            connect();
            // Wait for open
            const onOpen = () => {
                func();
                socketRef.current?.removeEventListener("open", onOpen);
            };
            socketRef.current?.addEventListener("open", onOpen);
        }
    }, [connect]);

    const subscribe = useCallback((event, callback) => {
        if (!listenersRef.current[event]) {
            listenersRef.current[event] = [];
        }
        listenersRef.current[event].push(callback);
    }, []);

    const unsubscribe = useCallback((event, callback) => {
        if (!listenersRef.current[event]) return;
        listenersRef.current[event] = listenersRef.current[event].filter(cb => cb !== callback);
    }, []);

    return (
        <SocketContext.Provider value={{ isConnected, sendMsg, subscribe, unsubscribe, connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const useSocketEvent = (eventType, callback) => {
    const { subscribe, unsubscribe } = useSocket();

    useEffect(() => {
        subscribe(eventType, callback);
        return () => unsubscribe(eventType, callback);
    }, [eventType, callback, subscribe, unsubscribe]);
};
