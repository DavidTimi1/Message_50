import '../search.css';

import { useContext, useEffect, useRef, useState } from "react";

import { once, title, transitionEnd } from "../../../ui/helpers";
import { ChatContext, StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { Button, IconBtn } from "../../../components/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { contactsTable, loadDB, msgsTable, openTrans } from '../../../db';
import { ContactResultItem, MsgResultItem } from './SearchResults';
import { DevMode } from '../../../App';

const navId = 'searchGeneral';


export default function SearchWindow({ closeSearch, initFilters }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [filters, setFilters] = useState(initFilters ?? []);

    const inputRef = useRef(null), myRef = useRef(null);

    const searchAbort = useRef(null);

    const { pushState, removeState } = useContext( StateNavigatorContext );
    const openChat = useContext( ChatContext ).set;
    const toggleOverlay = useContext( ToggleOverlay );

    const onlyContacts = filters.includes("only-contacts") && filters.length === 2;

    useEffect(() => {
        let contacts = [], msgs = [], ignore = false;

        searchAbort.current?.abort(); // end previous search requests


        if (query){
            const controller = new AbortController(), abortSignal = controller.signal;
            searchAbort.current = controller;

            if (!ignore && (!filters.length || filters.includes("contacts"))){
                searchCl(query, null, abortSignal)
                .then(res => {
                    contacts.push(...res);
                    const showContactsOnly = filters.length === 1 && filters.includes("contacts")
                    
                    !ignore && (onlyContacts || showContactsOnly) && setResults({
                        contacts
                    })
                })

            } else {
                contacts = undefined;
            }
            
            if (!ignore && (!filters.length || filters.includes("messages"))){
                searchMsgs(query, null, abortSignal)
                .then(res => {
                    msgs.push(...res);
                    
                    !ignore && setResults({
                        msgs,
                        contacts
                    })
                })
                
            }

        } else setResults({}) // empty search results

        return () => ignore = true;

    }, [query, onlyContacts, filters]);


    useEffect(() => {
        let t_id = setTimeout(() => {
            pushState(navId, close);
            myRef.current.classList.remove("close");

        }, 50)

        return () => clearTimeout(t_id);

    }, [pushState])

    useEffect(() => {
        let t_id = setTimeout(() => {
            inputRef.current.focus();

        }, 200)

        return () => clearTimeout(t_id);

    }, [])


    return (
        <section className="interface abs close search custom-scroll" style={{overflowY: "auto"}} ref={myRef}>
            <div className="fw flex-col mid-align">
                <div className="header position-sticky top-1 left-0 fw flex mid-align gap-2">
                    <IconBtn icon={faAngleLeft} onClick={handleCloseClick}>
                        close search
                    </IconBtn>

                    <label className="flex mid-align grow gap-1 br-1 nv-input">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />

                        <input autoFocus autoComplete="on" 
                            className="search-box not-visible max" ref={inputRef} 
                            placeholder={`Search ${onlyContacts? "Contacts" : ''}...`} 
                            type="search"
                            value={query}
                            onInput={e => setQuery(e.target.value)}
                        />
                    </label>
                </div>

                {
                    !onlyContacts && (
                        <div className="filters-list fw flex mid-align gap-1 side-scroll hid-scroll">
                            {
                                searchFilters.map(filter =>
                                    <FilterButton key={filter} id={filter} state={filters.includes(filter)} change={toggleFilter} />
                                )
                            }
                        </div>
                    )
                }
            </div>

            <div className="fw p-2">
                {
                    (!filters.length || filters.includes("contacts")) &&
                        <div className='flex-col gap-2'>
                            <ChatUnsaved searchBoxRef={inputRef} closeSearch={close} />
                            
                            <Button className="br-5 fw" onClick={ () => toggleOverlay('manage-contact', {NEW: true}) } >
                                Create New Contact
                            </Button>
                            <hr />
                        </div>
                }
                {
                    results.contacts &&

                    <div className="search-result fw results-contacts" onClick={handleCLClick}>
                        <p className="fw">
                            <small className='mx-auto banner'>
                                Contacts
                            </small>
                        </p>
                        {
                            results.contacts.length?
                            <></>
                            :
                            <em> No matching contacts found 😪 </em>
                        }
                        {
                            results.contacts.map( (data, key) => <ContactResultItem key={key} data={data} /> )
                        }
                    </div>
                }

                {
                    results.msgs &&

                    <div className="search-result fw results-messages" onClick={handleMsgClick}>
                        <br />
                        <p className="fw">
                            <small className='mx-auto banner'>
                                Messages
                            </small>
                        </p>
                        {
                            results.msgs.length?
                            <></>
                            :
                            <em> No matching messages found 😪 </em>
                        }
                        {
                            results.msgs.map( (data, key) => <MsgResultItem key={key} data={data} /> )
                        }
                    </div>

                }
            </div>
        </section>
    )

    function handleMsgClick(e){
        const { target } = e;

        const el = target.closest(".msg-res"), msgId = el?.dataset?.id, userId = el?.dataset?.user;

        if (msgId && userId) {
            handleCloseClick();
            setTimeout( () => openChat(userId, msgId) )
        }
        
    }

    
    function handleCLClick(e){
        const { target } = e;

        const el = target.closest(".contact-res"), userId = el?.dataset?.user;

        if (userId) {
            handleCloseClick();
            setTimeout( () => toggleOverlay('user-card', {id: userId}) )
        }
        
    }

    function toggleFilter(name){
        setFilters(prev => {
            const next = [...prev], i = next.indexOf(name);
            if (i > -1){
                next.splice(i, 1);
            } else 
                next.push(name)

            return next
        })
    }

    function handleCloseClick(){
        const removed = removeState(navId);
        if (!removed) close(); // fallback
    }


    function close() {
        const el = myRef.current;
        if (!el || el.classList.contains("close")) return;
    
        once(transitionEnd, el, closeSearch);
    
        el?.classList?.add("close");
    }
}


const FilterButton = ({ id, state, change }) => {
    return (
        <label className="flex mid-align filter-btn">
            <input type="checkbox" hidden checked={state} onChange={handleChange} />
            <span>{title(id)}</span>
        </label>
    )

    function handleChange(){
        change(id)
    }
}


const ChatUnsaved = ({ searchBoxRef, closeSearch }) => {
    const diaRef = useRef(null), inputRef = useRef(null);
    const [token, setToken] = useState('');
    const message = useContext(ChatContext).set;

    return (
        <>
            <Button className="no-btn fw" type="button" onClick={showDialog}>
                Chat unsaved contact
            </Button>

            <dialog className="dialog-box" ref={diaRef} onClose={close}>
                <form className="dialog-container" method="dialog">
                    <label>
                        {/* same form type from login */}
                        <input autoFocus name="handle" placeholder="User handle" value={token} onInput={e => setToken(e.target.value)} ref={inputRef} />
                    </label>
                    <div className="button-set flex mid-align fw">
                        <button value="">Cancel</button>
                        <button value="chat">Chat</button>
                    </div>
                </form>
            </dialog>
        </>
    )

    function showDialog() {
        setToken(searchBoxRef.current.value);
        diaRef.current.showModal();
    }

    function close({ target: { returnValue } }) {

        if (returnValue) {
            // fetchDetals and chat
            closeSearch();
            message(token.trim());
        }
    }
}


async function searchMsgs(token, msgId, signal, initFilters) {
    let list = [];
    token = token.toLowerCase();
    let i = 0, uB = 20, uB2 = 10;

    const range = msgId ? [IDBKeyRange.upperBound(msgId, true), "prev"] : null;


    // make sure db is loaded first
    return loadDB()
        .then(DB => new Promise( (res, rej) => {

            openTrans(DB, msgsTable)
                .openCursor(range, "prev")
                .onsuccess = e => {
                    let cur = e.target.result;

                    // normally, load 20 if id is set, load only 10 more
                    if (cur && !signal.aborted && ((!msgId && i < uB) || (msgId && i < uB2))) {
                        const text = cur.value.textContent.toLowerCase();
                        const handle = cur.value.handle.toLowerCase();

                        if (text.includes(token) || text.includes(handle))
                            list.push(cur.value);

                        i++;
                        cur.continue();

                    } else {
                        res(list)
                    }
                }
        }))
}


async function searchCl(token, lastId, signal){
    const list = [];
    token = token.toLowerCase();
    let i = 0, uB = 20, uB2 = 10;

    return loadDB()
    .then( DB => new Promise((res, rej) => {

        let req = openTrans(DB, contactsTable).openCursor();

        req.onsuccess = (e) => {
            let cursor = e.target.result;

            // normally, load 20 if id is set, load only 10 more
            if (cursor && !signal.aborted && ((!lastId && i < uB) || (lastId && i < uB2))) {

                const {handle, dp, bio, name} = cursor.value, detail = { id: handle, dp, bio };
                const cmpd = handle + " " + name;
                
                if (cmpd.toLowerCase().includes(token)){
                    list.push(detail);
                }

                cursor.continue();

            } else {
                list.sort( sortByName );
                res(list);
            }
        }

        req.onerror = (e) => rej(e.target.error)
    }))
    

    function sortByName(a, b){
        return ( a.name > b.name ? 1 : a.name == b.name ? 0 : -1 )
    }
}


const searchFilters = [ "contacts", "messages"] //, "media", "images", "videos", "audios", "files" ]