import { Navigate, Route, Routes } from "react-router-dom";
import { DesktopNavBar } from "./Navbar";
import { MediaPage } from "../media/page";
import { SettingsPage } from "../settings/page";
import { ContactsPage } from "../contacts/page";
import { More } from "../components/more";
import { HomeView } from "./HomeView";
import MsgInterface from "../chats/components/Messaging";

import "./desktop.css";


export default function DesktopLayout({ viewMsg}){

    return (
        <div id="desktop" className="max">
            <DesktopNavBar />

            <div className="chat-pool fh">
                <Routes>
                    <Route path='/' element={
                        <HomeView />
                    } />
                    <Route path='/media' element={
                        <MediaPage />
                    } />
                    {/* <Route path='/notifications' element={
                    <ProtectedRoute>
                        <NotificationsPage />
                    </ProtectedRoute>
                    } /> */}
                    <Route path='/settings' element={
                        <SettingsPage />
                    } />
                    <Route path='/contacts' element={
                        <ContactsPage />
                    } />
                    <Route path='*' element={
                        <Navigate to="/app" replace />
                    } />
                </Routes>
            </div>
            
            <div className="messaging-pool fh">
                <MsgInterface viewMsg={viewMsg} />
            </div>

            <div className="more-pool fh">
                <More />
            </div>

        </div>
    )
}