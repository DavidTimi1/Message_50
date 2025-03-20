
// Establish socket connection initaily
// Handle on receive socket messsage
// add received message to msgs and chat lists
// receive socket message when user goes off or online


// Connect to socket server
let SOCKET = null;
const socketHost = "ws://127.0.0.1:5173/ws/chat/";


export const newMsgEvent = "message-receipt";
export const statusChangeEvent = "message-status-change";


export function connectSocket(token){
    token = localStorage.getItem('jwt');

    if (!token) {
        console.log("User not Auth")
    }

    SOCKET = new WebSocket(`${ socketHost }?token=${token}`);

    SOCKET.onopen = () => {
        console.log('Connected to socket server');
    };

    SOCKET.onerror = (error) => console.error("WebSocket error:", error);

    return SOCKET;
}


export function useSocket(){
    return SOCKET;
}


// disconnect socket
export function disconnectSocket(errCode, reason){
    SOCKET.close(errCode, reason);
}


export function socketSend(action, payload){
    const func = _ => SOCKET.send(JSON.stringify({action, ...payload}));
    
    if (SOCKET.readyState === SOCKET.OPEN){
        func()

    } else {
        connectSocket()
        SOCKET.addEventListener("open", func)
    }
}

