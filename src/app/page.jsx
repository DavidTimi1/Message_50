import "./page.css";

import { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";

import { ChatContext, ToggleOverlay } from './contexts';
import { NavBar } from "./components/Navbar";
import { ChatsPage } from "./chats/page";
import { MediaPage } from "./media/page";
import { SettingsPage } from "./settings/page";
import { ContactsPage } from "./contacts/page";

import { More } from "./components/more";
import { SendMsgsProvider } from "./components/Offline";
import { StateNavigatorProvider } from "./history";
import ProtectedRoute, { useAuth } from "../auth/ProtectedRoutes";
import { connectSocket, disconnectSocket, newMsgEvent, socketSend } from "./components/Sockets";
import { getUserDetails } from "./contacts/lib";
import { useOnlineStatus } from "./components/Hooks";
import { hasMessaged, IDBPromise, loadDB, openTrans, msgsTable } from "../db";
import { decryptMessage } from "./crypt";
import { UserContext } from "../contexts";
import { Button } from "../components/Button";
import CustomLoader from "../components/Loading";




const Msg50App = () => {
    const [chatting, setChatting] = useState({ user: false });
    const [overlays, setOverlays] = useState(new Map());
    const isOnline = useOnlineStatus();
    const [msgFrom, jumpTo] = useState();
    const userError = useContext(UserContext).error;

    const navigate = useNavigate();
    const location = useLocation(), locationState = location.state;
    const authenticated = useAuth().auth;


    useEffect(() => {
        if (!authenticated) return

        const socket = connectSocket();

        socket.addEventListener('message', handleMessageReceipt);
        setTimeout(()=> {socketSend("ready")}, 1000);

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
            toggleOverlay('user-card', {id: queriedUser});
        }
    }, [locationState])


    return (
        <div className="max main-app">
            {
                userError?
                    <BlankErrorPage />
                :
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
            }
        </div>
    )

    async function toggleMessaging(handle, id) {
        let success = false;

        if (!handle){
            setChatting({ user: false });
            return
        }

        await hasMessaged(handle)
        .then( async count => {

            if (count){
                success = Boolean(count);
                return
            }

            const queryUserExistence = getUserDetails(handle, isOnline);
            await queryUserExistence.then( res => {
                success = res.success || success

            }).catch (console.error)
        })

        if (!success){
            setChatting({ user: false });
            return
        }

        setChatting({ user: handle, msgId: id });

        // to navigate from elsewhere
        if (handle && location.pathname !== '/app') {
            navigate('/app')
        }
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


export default Msg50App;

async function handleMessageReceipt(msgEvent){
    const json_data = msgEvent.data;
    const parsed = json_data && JSON.parse(json_data)
    const type = parsed.type, payload = parsed.data;

    if (['new-message', 'status-change'].includes(type)){
        let decryptedMsg;

        try {
            const {encryptedData, iv, key, file} = payload.data
            decryptedMsg = await decryptMessage(key, encryptedData, iv, Boolean(file));

        } catch (error) {
            console.error('Failed to decrypt message:', error);
            return

        }

        if (type === 'new-message'){
            const file = payload.data.file;

            const fullMsgData = {
                id: payload.id, sent: false, key: undefined,
                ...decryptedMsg,
                file: file? {...file, key: decryptedMsg.key} : file
            }
            
            loadDB()
            .then( DB => (
                IDBPromise (
                    openTrans(DB, msgsTable, 'readwrite')
                    .put( fullMsgData )
                )
            ))

            dispatchEvent( new CustomEvent(newMsgEvent, {detail: fullMsgData}) )

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
            <div className="max flex-col mid-align gap-4 p-4 center-text" style={{justifyContent: "center"}}>
                {
                    graceOver?
                    <>
                    <span style={{fontSize: "50px"}}> ⚠ </span>
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