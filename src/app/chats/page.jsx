import './page.css';

import { useState } from 'react';
import { Link } from "react-router-dom";


import { SideShelf } from './components/SideShelf';
import { Header } from './components/Header';
import { ChatList } from './components/ChatList';
import SearchWindow from './components/Search';
import MsgInterface from './components/Messaging';


export const ChatsPage = ({viewMsg}) => {
    const [search, setSearch] = useState({ on: false });
    const initFilters = search.filters;

    return (
        <div id="chats" className='max'>
            {/* <div className="abs-mid">
                <p className="fs-1 fw-1000"> 
                    Welcome to Chats | Message50 
                </p>
                <small className="fw-100">
                    Oops! Nothing here yet!
                </small>
                <div>
                    <Link to='/routes'>
                        {"Routes >"}
                    </Link>
                </div>
            </div> */}
            <div className='flex-col max'>
                <Header startSearch={() => setSearch({ on: true })} />
                <div className='grow'>
                    <ChatList />
                </div>
            </div>

            <MsgInterface viewMsg={viewMsg} />

            <SearchWindow initFilters={initFilters} show={search.on} closeSearch={() => setSearch({ on: false })} />
                
            <SideShelf searchContacts={searchContacts} />
        </div>
    )
    
    function searchContacts() {
        setSearch({ 
            on: true, 
            filters: ["contacts", "only"]
        });
    }
}