import ChatList from './chats';
import './ui/home.css';

import { useContext, useState } from 'react';
import MsgInterface from './messaging';
import { Button, IconBut } from '../../../buttons';
import { ToggleOverlay } from './contexts';

const searchFilters = {
    unread: true,
    contacts: true,
    messages: true,
    media: false,
    images: false,
    videos: false,
    audios: false,
    files: false
}


export default function Home({ show }) {
    const deviceType = "mobile";
    const [search, setSearch] = useState({ on: false, filters: searchFilters || {} });
    const initFilters = search.filters;
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div id="home" className={show ? 'max' : "max veil"}>
            <div className='flex-col max'>
                <Header startSearch={() => setSearch({ on: true })} />
                <div className='grow'>
                    <ChatList />
                </div>
            </div>
            <SearchWindow initFilters={initFilters} show={search.on} closeSearch={() => setSearch({ on: false })} />

            {
                deviceType === "mobile" &&
                <div className="side-shelf abs gap-2">
                    <IconBut onClick={openAIChat}>
                        <img src="static/ai-chat-icon.svg" alt="" />
                    </IconBut>
                    <IconBut onClick={searchContacts}>
                        <img src="static/new-chat.svg" alt="" />
                    </IconBut>
                </div>
            }
        </div>
    )

    function searchContacts() {
        setSearch({ on: true, filters: ["contacts"] })
    }

    function openAIChat() {
        toggleOverlay('ai-chat', true);
    }

}

