import "./page.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { ChatContext, ToggleOverlay } from './contexts';

import { SendMsgsProvider } from "./components/Offline";
import { StateNavigatorProvider } from "./history";
import ProtectedRoute, { useAuth } from "../auth/ProtectedRoutes";
import { newMsgEvent } from "./components/Sockets";
import { SocketProvider, useSocketEvent } from "./contexts/SocketContext";
import { useIsMobile } from "./components/Hooks";
import { IDBPromise, loadDB, openTrans, msgsTable, updateMessage, getContactDetailsFromDB } from "../db";
import { decryptMessage } from "./crypt";
import axiosInstance from "../auth/axiosInstance";
import { API_ROUTES } from "../lib/routes";
import { UserContext } from "../contexts";
import { Button } from "../components/Button";

import CustomLoader from "../components/Loading";
import DesktopLayout from "./desktop-layout/Layout.";
import MobileLayout from "./mobile-layout/Layout";

const Msg50App = () => {
    const [chatting, setChatting] = useState({ user: false });
    const [overlays, setOverlays] = useState([]);
    const userError = useContext(UserContext).error;
    const queryClient = useQueryClient();

    const navigate = useNavigate();
    const location = useLocation(), locationState = location.state;
    const authenticated = useAuth().auth;

    const isMobile = useIsMobile();


    // Socket connection is now handled by SocketProvider

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
            <SocketProvider>
                <SocketMessageListener />
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
                                            isMobile ? <MobileLayout /> :
                                                <DesktopLayout />
                                        }
                                    </ChatContext.Provider>

                                </SendMsgsProvider>
                            </ToggleOverlay.Provider>
                        </StateNavigatorProvider>
                    }
                </main>
            </SocketProvider>
        </ProtectedRoute>
    )

    async function toggleMessaging(handle, id) {
        if (!handle) {
            setChatting({ user: false });
            queryClient.setQueryData(["active-chat"], null);
            return
        }

        setChatting({ user: handle, msgId: id });
        queryClient.setQueryData(["active-chat"], handle);

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

const SocketMessageListener = () => {
    const queryClient = useQueryClient();
    const { sendMsg } = useSocket();
    useSocketEvent('*', (e) => handleMessageReceipt(e, queryClient, sendMsg));
    return null;
}

export default Msg50App;

async function handleMessageReceipt(msgEvent, queryClient, sendMsg) {
    const json_data = msgEvent.data;
    const parsed = json_data && JSON.parse(json_data)
    if (!parsed) return;
    const type = parsed.type, payload = parsed.data || parsed;

    if (type === 'typing-status') {
        queryClient.setQueryData(["typing", payload.senderID], payload.isTyping);
        return;
    }

    if (['new-message', 'status-change'].includes(type)) {
        let decryptedMsg;

        try {
            const { encryptedData, iv, key, file } = payload.data || payload;
            decryptedMsg = await decryptMessage(key, encryptedData, iv, Boolean(file));

        } catch (error) {
            console.error('Failed to decrypt message:', error);
            return
        }

        if (type === 'new-message') {
            const file = (payload.data || payload).file;
            
            const activeChat = queryClient.getQueryData(["active-chat"]);
            const isCurrentChat = (activeChat === decryptedMsg.handle);
            const statusVal = isCurrentChat ? 'r' : 'd';

            const fullMsgData = {
                id: payload.id, sent: false, key: undefined,
                ...decryptedMsg,
                status: statusVal,
                file: file ? { ...file, key: decryptedMsg.key } : file
            }

            // Immediately send a status-ack for delivery ('d') or read ('r')
            // Get sender UUID
            getContactDetailsFromDB(decryptedMsg.handle).then(async (contact) => {
                let senderUuid = contact?.id;
                if (!senderUuid) {
                    const keys = await axiosInstance.get(API_ROUTES.PUBLIC_KEYS([decryptedMsg.handle])).then(r => r.data).catch(() => ({}));
                    senderUuid = Object.keys(keys)[0];
                }
                if (senderUuid) {
                    sendMsg("status-ack", {
                        receiverID: senderUuid,
                        id: payload.id,
                        status: statusVal
                    });
                }
            });

            loadDB()
                .then(DB => (
                    IDBPromise(
                        openTrans(DB, msgsTable, 'readwrite')
                            .put(fullMsgData)
                    )
                ))
                .then(() => {
                    // Update messages cache
                    queryClient.setQueriesData({ queryKey: ["messages", decryptedMsg.handle] }, (old) => {
                        if (!old) return old;
                        return {
                            ...old,
                            data: [...old.data, fullMsgData]
                        };
                    });

                    // Update chats list cache
                    queryClient.setQueryData(["chats"], (old) => {
                        if (!old) return old;
                        const newData = [...old.data];
                        const index = newData.findIndex(c => c.handle === decryptedMsg.handle);
                        if (index > -1) {
                            newData.splice(index, 1, fullMsgData);
                        } else {
                            newData.push(fullMsgData);
                        }
                        return {
                            ...old,
                            data: newData
                        };
                    });
                })

        } else if (type === 'status-change') {
            const statusData = payload.data; // { status: "r", senderID: "..." }
            const messageId = payload.message_id;
            
            // update in IDB
            updateMessage(messageId, 'status', statusData.status);
            
            // update react query messages cache
            queryClient.setQueriesData({ queryKey: ["messages", statusData.senderID] }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(msg => msg.id === messageId ? { ...msg, status: statusData.status } : msg)
                };
            });

            // update react query chats cache (status icon in chat list preview)
            queryClient.setQueryData(["chats"], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(msg => msg.id === messageId ? { ...msg, status: statusData.status } : msg)
                };
            });
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