import "./page.css";

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { ChatContext, ToggleOverlay } from './contexts';
import { NavBar } from "./components/Navbar";
import { ChatsPage } from "./chats/page";
import { MediaPage } from "./media/page";
import { NotificationsPage } from "./notifications/page";
import { SettingsPage } from "./settings/page";
import { ContactsPage } from "./contacts/page";

import { More } from "./components/more";
import { SendMsgsProvider } from "./components/Offline";
import { StateNavigatorProvider } from "./history";
import ProtectedRoute, { useAuth } from "../auth/ProtectedRoutes";
import { connectSocket, disconnectSocket } from "./components/Sockets";
import { getUserDetails } from "./contacts/lib";
import { useOnlineStatus } from "./components/Hooks";




export const Msg50App = () => {
    const [chatting, setChatting] = useState({ user: false });
    const [overlays, setOverlays] = useState(new Map());
    const isOnline = useOnlineStatus();
    const [msgFrom, jumpTo] = useState();

    const navigate = useNavigate();
    const location = useLocation();
    const authenticated = useAuth().auth?.token;


    useEffect(() => {
        if (!authenticated) return

        const socket = connectSocket(authenticated);

        socket.addEventListener('message', async (msg) => {
            try {
                console.log(msg)
                // const decryptedMsg = await decryptMessage(encryptedMsg);
                // await storeMessageInDB(decryptedMsg);

            } catch (error) {
                console.error('Failed to decrypt or store message:', error);
            }
        });

        return disconnectSocket;
    }, [authenticated])


    return (
        <div className="max main-app">
            <StateNavigatorProvider>
                <ToggleOverlay.Provider value={toggleOverlay}>
                    <SendMsgsProvider>
                        <ChatContext.Provider value={{ cur: chatting.user, set: toggleMessaging, id: chatting.msgId }}>
                            <NavBar open={overlays.has('navbar')} />

                            <Routes>
                                <Route path='/' element={
                                    <ProtectedRoute>
                                        <ChatsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path='/media' element={
                                    <ProtectedRoute>
                                        <MediaPage />
                                    </ProtectedRoute>
                                } />
                                {/* <Route path='/notifications' element={
                    <ProtectedRoute>
                        <NotificationsPage />
                    </ProtectedRoute>
                } /> */}
                                <Route path='/settings' element={
                                    <ProtectedRoute>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path='/contacts' element={
                                    <ProtectedRoute>
                                        <ContactsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path='*' element={
                                    <Navigate to="/app" replace />
                                } />
                            </Routes>

                            <More openOverlays={overlays} />
                        </ChatContext.Provider>
                    </SendMsgsProvider>
                </ToggleOverlay.Provider>
            </StateNavigatorProvider>
        </div>
    )

    function toggleMessaging(handle, id) {
        const queryUserExistence = getUserDetails(handle, isOnline);
        queryUserExistence.then( res => {
            if (!res.success){
                // show error
                return
            }
    
            setChatting({ user: handle, msgId: id });
    
            // to navigate from elsewhere
            if (handle && location.pathname !== '/app') {
                navigate('/app')
            }

        }).catch (console.error)
    }

    function toggleOverlay(name, value) {
        // keep history
        setOverlays(prev => {
            const list = new Map(prev);
            value ? list.set(name, value) : list.delete(name);

            return list
        });
    }
}