import './page.css';

import { useState } from 'react';


import { SideShelf } from './components/SideShelf';
import { Header } from './components/Header';
import { ChatList } from './components/ChatList';
import SearchWindow from './components/Search';
import MsgInterface from './components/Messaging';


export const ChatsPage = ({viewMsg}) => {
    const [search, setSearch] = useState(false);

    return (
        <div id="chats" className='max'>
            <div className='flex-col max'>
                <Header startSearch={() => setSearch([])} />
                <section className='grow'>
                    <ChatList />
                </section>
            </div>

            <MsgInterface viewMsg={viewMsg} />

            { search && <SearchWindow initFilters={search} closeSearch={() => setSearch(false)} /> }
                
            <SideShelf searchContacts={searchContacts} />
        </div>
    )
    
    function searchContacts() {
        setSearch(["only-contacts", "contacts"])
    }
}
