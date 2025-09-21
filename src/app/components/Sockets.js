
// Establish socket connection initaily
// Handle on receive socket messsage
// add received message to msgs and chat lists
// receive socket message when user goes off or online

import { apiHost } from "../../App";


// Connect to socket server
let SOCKET = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let manuallyClosed = false;
let retries = 0;

const HEARTBEAT_INTERVAL = 25000; // 25 seconds
const RECONNECT_INTERVAL = 5000; // 5 seconds


export const newMsgEvent = "message-receipt";
export const statusChangeEvent = "message-status-change";


export function connectSocket(){
    const socketHost = `ws${apiHost.slice(4)}/ws/chat/`;
    
    if (SOCKET && SOCKET.readyState === WebSocket.OPEN)
        return SOCKET;

    manuallyClosed = false; // we're initiating connection manually    

    SOCKET = new WebSocket(socketHost);

    SOCKET.onopen = () => {
        retries = 0;

        heartbeatTimer = setInterval(() => {
          if (SOCKET.readyState === WebSocket.OPEN) {
            SOCKET.send(JSON.stringify({ type: "ping" }));
          }
        }, HEARTBEAT_INTERVAL);
    };

    SOCKET.onclose = () => {
        clearInterval(heartbeatTimer);
        heartbeatTimer = SOCKET = null;

        if (!manuallyClosed && retries < 3) {
            console.warn("❌ WebSocket closed");
            reconnectTimer = setTimeout(() => {
                retries++;
                console.log("🔁 Reconnecting WebSocket (", 3 - retries, "retries left )...");
                connectSocket();
            }, RECONNECT_INTERVAL);
        }
    }
    

    SOCKET.onerror = (error) => {
        console.error("WebSocket error:", error)
    };

    return SOCKET;
}


export function useSocket(){
    return SOCKET;
}


// disconnect socket
export function disconnectSocket(errCode, reason){
    manuallyClosed = true;

    clearInterval(heartbeatTimer);
    clearTimeout(reconnectTimer);
    heartbeatTimer = null;
    reconnectTimer = null;
    
    if (SOCKET?.readyState === WebSocket.OPEN || SOCKET?.readyState === WebSocket.CONNECTING) {
        SOCKET.close();
    }
}


export function socketSend(action, payload){
    if (!SOCKET) return

    const func = _ => SOCKET.send(JSON.stringify({action, ...payload}));
    
    if (SOCKET.readyState === WebSocket.OPEN){
        func()

    } else {
        SOCKET = connectSocket();
        SOCKET.addEventListener("open", func);
    }
}

