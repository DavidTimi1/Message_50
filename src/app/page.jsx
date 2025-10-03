import "./page.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { ChatContext, ToggleOverlay } from './contexts';

import { SendMsgsProvider } from "./components/Offline";
import { StateNavigatorProvider } from "./history";
import ProtectedRoute, { useAuth } from "../auth/ProtectedRoutes";
import { connectSocket, disconnectSocket, newMsgEvent, socketSend } from "./components/Sockets";
import { useIsMobile } from "./components/Hooks";
import { IDBPromise, loadDB, openTrans, msgsTable } from "../db";
import { decryptMessage } from "./crypt";
import { UserContext } from "../contexts";
import { Button } from "../components/Button";

import CustomLoader from "../components/Loading";
import DesktopLayout from "./desktop-layout/Layout.";
import MobileLayout from "./mobile-layout/Layout";

const Msg50App = () => {
    const [chatting, setChatting] = useState({ user: false });
    const [overlays, setOverlays] = useState([]);
    const userError = useContext(UserContext).error;

    const navigate = useNavigate();
    const location = useLocation(), locationState = location.state;
    const authenticated = useAuth().auth;

    const isMobile = useIsMobile();


    useEffect(() => {
        if (!authenticated) return

        const socket = connectSocket();

        socket.addEventListener('message', handleMessageReceipt);
        setTimeout(() => { socketSend("ready") }, 1000);

        return () => {
            socket.removeEventListener('message', handleMessageReceipt)
            disconnectSocket();
        }

    }, [authenticated])

    useEffect(() => {
        const queriedUser = locationState?.showUser;
        if (queriedUser) {
            // same route jsut remove the state
            navigate(window.location.pathname, { replace: true, state: null });
            toggleOverlay('user-card', { id: queriedUser });
        }
    }, [locationState])


    return (
        <ProtectedRoute>
            <main className="max main-app">
                {
                    // userError?
                    //     <BlankErrorPage />
                    // :
                    <StateNavigatorProvider>
                        <ToggleOverlay.Provider value={toggleOverlay}>
                            <SendMsgsProvider>

                                <ChatContext.Provider value={{ cur: chatting.user, set: toggleMessaging, id: chatting.msgId }}>
                                    {
                                        isMobile ? <MobileLayout overlays /> :
                                            <DesktopLayout overlays />
                                    }
                                </ChatContext.Provider>

                            </SendMsgsProvider>
                        </ToggleOverlay.Provider>
                    </StateNavigatorProvider>
                }
            </main>
        </ProtectedRoute>
    )

    async function toggleMessaging(handle, id) {
        if (!handle) {
            setChatting({ user: false });
            return
        }

        setChatting({ user: handle, msgId: id });

        // to navigate from elsewhere
        if (handle && location.pathname !== '/app') {
            navigate('/app')
        }
    }


    function toggleOverlay(name, value, list) {
        if (list) {
            return overlays
        }
        // keep history
        setOverlays(prev => {
            const list = [...prev];
            const index = list.findIndex(overlay => overlay.name === name);

            if (index !== -1)
                list.splice(list.findIndex(overlay => overlay.name === name), 1);

            if (value) {
                list.push({ name, value });
            }

            return list
        });
    }
}


export default Msg50App;

async function handleMessageReceipt(msgEvent) {
    const json_data = msgEvent.data;
    const parsed = json_data && JSON.parse(json_data)
    const type = parsed.type, payload = parsed.data;

    if (['new-message', 'status-change'].includes(type)) {
        let decryptedMsg;

        try {
            const { encryptedData, iv, key, file } = payload.data
            decryptedMsg = await decryptMessage(key, encryptedData, iv, Boolean(file));

        } catch (error) {
            console.error('Failed to decrypt message:', error);
            return

        }

        if (type === 'new-message') {
            const file = payload.data.file;

            const fullMsgData = {
                id: payload.id, sent: false, key: undefined,
                ...decryptedMsg,
                file: file ? { ...file, key: decryptedMsg.key } : file
            }

            loadDB()
                .then(DB => (
                    IDBPromise(
                        openTrans(DB, msgsTable, 'readwrite')
                            .put(fullMsgData)
                    )
                ))

            dispatchEvent(new CustomEvent(newMsgEvent, { detail: fullMsgData }))

        } else {

        }

    }



}


const BlankErrorPage = () => {
    const [graceOver, setGraceOver] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setGraceOver(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="max flex-col mid-align gap-4 p-4 center-text" style={{ justifyContent: "center" }}>
            {
                graceOver ?
                    <>
                        <span style={{ fontSize: "50px" }}> ⚠ </span>
                        <div>
                            <b> Error </b> - Something went wrong while fetching user data <br></br>
                            <em> Try checking your internet connection </em>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </>
                    :
                    <CustomLoader />
            }
        </div>
    )
}