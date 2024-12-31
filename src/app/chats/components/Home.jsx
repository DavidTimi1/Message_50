import ChatList from './chats';
import './ui/home.css';

import { useContext, useState } from 'react';
import MsgInterface from './Messaging';
import { Button, IconBut } from '../../../buttons';
import { ToggleOverlay } from './contexts';



export default function Home({ show }) {
    const deviceType = "mobile";
    const [search, setSearch] = useState(false);
    const initFilters = search.filters;
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div id="home" className={show ? 'max' : "max veil"}>
            <div className='flex-col max'>
                <Header startSearch={() => setSearch([])} />
                <div className='grow'>
                    <ChatList />
                </div>
            </div>

            { search && <SearchWindow initFilters={initFilters} closeSearch={() => setSearch(false)} /> }

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
        setSearch(["only-contacts", "contacts"])
    }

    function openAIChat() {
        toggleOverlay('ai-chat', true);
    }

}

