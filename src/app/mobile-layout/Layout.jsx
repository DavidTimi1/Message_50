import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "../components/Navbar";
import { ChatsPage } from "../chats/page";
import { MediaPage } from "../media/page";
import { SettingsPage } from "../settings/page";
import { ContactsPage } from "../contacts/page";
import { More } from "../components/more";
import { useOverlayData } from "@/hooks/use-overlay";


export default function MobileLayout() {
    const isOpenNavbar = !!useOverlayData('navbar');

    return (
        <>
            <NavBar open={isOpenNavbar} />

            <Routes>
                <Route path='/' element={<ChatsPage />} />

                <Route path='/media' element={<MediaPage />} />

                {/* <Route path='/notifications' element={
                    <NotificationsPage />
                    } /> */}

                <Route path='/settings' element={<SettingsPage />} />

                <Route path='/contacts' element={<ContactsPage />} />

                <Route path='*' element={<Navigate to="/app" replace />} />

            </Routes>

            <More />

        </>
    )
}