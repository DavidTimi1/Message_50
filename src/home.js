import ChatList from './chats';
import './ui/home.css';

import { useContext, useState } from 'react';
import MsgInterface from './messaging';
import { Button, IconBut } from './buttons';
import ProfilePic from './contacts';
import { ToggleOverlay } from './contexts';
import SearchWindow from './search';

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



function Header({ startSearch }) {
    const deviceType = "mobile";
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <header className="app-heading">
            {
                deviceType === "mobile" ?
                    <div className="main-heading">
                        <div className='flex gap-2 mid-align'>
                            <button className="no-btn" type="button" onClick={openNavBar}>
                                <div className='dp-img' style={{ backgroundColor: "grey", width: "35px"}}>
                                    <ProfilePic />
                                </div>
                                <span className="fa-stack fa-1x hide no-wifi-icon abs">
                                    <i className="fa-solid fa-wifi fa-stack-1x fa-lg"></i>
                                    <i className="fa-solid fa-xmark fa-stack-1x fa-xs"></i>
                                </span>
                            </button>
                            <div className='flex grow mid-align' style={{ justifyContent: "space-between" }}>
                                <h4 className='hero-txt'> Message50 </h4>
                                <IconBut className="fa-solid fa-magnifying-glass" onClick={startSearch}>
                                    <span className='sr-only'>
                                        Search
                                    </span>
                                </IconBut>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="main-heading">
                        <div className='flex'>
                            <div className='fs-2'> Chats </div>
                            <div className='flex mid-align gap-2'>
                                <Button style={{ gap: "10px" }}>
                                    <i className='fa-solid fa-plus'></i>
                                    <span>New Chat</span>
                                </Button>
                                <Button style={{ gap: "10px" }}>
                                    <i className='fa-solid fa-plus'></i>
                                    <span>AI Chat</span>
                                </Button>
                                <h4 className='hero-txt'> Message50 </h4>
                            </div>
                        </div>
                    </div>
            }
        </header>
    )


    function openNavBar() {
        toggleOverlay("navbar", true);
    }
}