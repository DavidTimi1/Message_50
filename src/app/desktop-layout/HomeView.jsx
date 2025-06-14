import { useState } from "react";
import { ChatList } from "../chats/components/ChatList";
import SearchWindow from "../chats/components/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const HomeView =() => {
    
    const [search, setSearch] = useState(false);

    return (
        <div id="chats" className='max'>
            <div className="fw px-1 pt-2">
                <button className="no-btn flex mid-align fw gap-2 br-1 p-2" style={{color: "var(--text2-col)", backgroundColor: "var(--body2-col)"}} onClick={_ => setSearch(true)}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />

                    <div className="span px-2">
                        Search...
                    </div>
                </button>
            </div>
            <hr />
            <section className='max'>
                <ChatList />
            </section>

            { search && <SearchWindow initFilters={[]} closeSearch={() => setSearch(false)} /> }

        </div>
    )
}