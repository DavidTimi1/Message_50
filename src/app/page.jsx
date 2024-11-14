import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ChatContext, ToggleOverlay } from './contexts';
import { NavBar } from "./components/navbar";
import { ChatsPage } from "./chats/page";
import { MediaPage } from "./media/page";
import { NotificationsPage } from "./notifications/page";
import { SettingsPage } from "./settings/page";
import { ContactsPage } from "./contacts/page";
import { More } from "./components/more";

export const Msg50App = () => {
	const [chatting, setChatting] = useState(false);
	const [overlays, setOverlays] = useState(new Map());
	const [msgFrom, jumpTo] = useState();


    return (
		<ToggleOverlay.Provider value={toggleOverlay}>
        <ChatContext.Provider value={{ cur: chatting, set: toggleMessaging }}>
            <NavBar open={overlays.has('navbar')} />

        <Routes>
            <Route path='/' element={<ChatsPage />} />
            <Route path='/media' element={<MediaPage />} />
            <Route path='/notifications' element={<NotificationsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/contacts' element={<ContactsPage />} />
            <Route path='*' element={<Navigate to="/app" replace />} />
        </Routes>

            <More openOverlays={overlays} />
        </ChatContext.Provider>
		</ToggleOverlay.Provider>
    )

	function toggleMessaging(handle, id) {
		setChatting(handle);
		jumpTo(id);

        if (handle){
            return <Navigate to='/' />
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