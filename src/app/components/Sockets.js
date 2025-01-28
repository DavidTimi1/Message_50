import io from 'socket.io-client';
import { apiHost } from '../../App';



// Establish socket connection initaily
// Handle on receive socket messsage
// add received message to msgs and chat lists
// receive socket message when user goes off or online


// Connect to socket server
let SOCKET = null;
const socketUrl = apiHost;

export function connectSocket(){
    SOCKET = io(socketUrl);
    SOCKET.on('connect', () => {
        console.log('Connected to socket server');
    });
    SOCKET.on('message', handleSocketMessage);

    return SOCKET;
}


export function useSocket(){
    return SOCKET;
}


// disconnect socket
export function disconnectSocket(){
    SOCKET.off('message', handleSocketMessage);
    SOCKET.disconnect();
}

function handleSocketMessage(message){
    console.log('Received message:', message);
}