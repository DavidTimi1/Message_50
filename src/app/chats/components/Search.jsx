import { useContext, useEffect, useRef, useState } from "react";


import { once, title, transitionEnd } from "../../../ui/helpers";
import { ChatContext, StateNavigatorContext } from "../../contexts";
import { IconBtn } from "../../components/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

const navId = 'searchGeneral';

export default function SearchWindow({ show, closeSearch, initFilters }) {
    const filters = initFilters ?? [];
    const inputRef = useRef(null), myRef = useRef(null);

    const { pushState, removeState } = useContext( StateNavigatorContext );

    const only = filters.includes("only") && filters.length === 2;


    useEffect(() => {
        let t_id;
        
        if (show){
            t_id = setTimeout(() => {
                pushState(navId, close);
                myRef.current.classList.remove("close");

            }, 50)
        }

        return () => t_id && clearTimeout(t_id);

    }, [show, pushState])


    return (
        show &&
        <div className="interface close search" ref={myRef}>
            <div className="fw flex-col mid-align">
                <div className="header fw flex mid-align gap-2">
                    <IconBtn icon={faAngleLeft} onClick={handleCloseClick}>
                        close search
                    </IconBtn>

                    <div className="grow flex mid-align gap-2">
                        <label className="flex mid-align grow gap-1 br-1 nv-input">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            <input autoFocus autoComplete="on" 
                                className="search-box not-visible max" ref={inputRef} 
                                placeholder={`Search ${only? filters[0] : ''}...`} 
                            />
                        </label>

                        <button onClick={clearInput}>
                            <div className="abs btn-bg fw"></div>
                            <FontAwesomeIcon icon={faXmark} />
                            <span className="sr-only">
                                close
                            </span>
                        </button>
                    </div>
                </div>

                <div className="filters-list flex mid-align" style={{ flexWrap: "wrap" }}>
                    {
                        !only && (
                            Object.keys(searchFilters).map(filter =>
                                <FilterButton key={filter} id={filter} state={filters.includes(filter)} />
                            )
                        )
                    }
                </div>
            </div>

            <div className="custom-scroll">
                <div>
                    <ChatUnsaved inputRef={inputRef} closeSearch={close} />
                    <button>
                        Create New  Contact
                    </button>
                </div>
                <div className="search-result results-contacts"></div>
                <div className="search-result results-messages"></div>
            </div>
        </div>
    )


    function clearInput() {
        inputRef.current.value = '';
    }

    function handleCloseClick(){
        removeState(navId);
    }


    function close() {
        const el = myRef.current;
        once(transitionEnd, el, closeSearch);
        el.classList.add("close");
    }
}


const FilterButton = ({ id, state }) => {
    return (
        <label className="flex mid-align filter-btn">
            <input type="checkbox" className="" defaultChecked={state} />
            <span>{title(id)}</span>
        </label>
    )
}


const ChatUnsaved = ({ searchBoxRef, closeSearch }) => {
    const diaRef = useRef(null), inputRef = useRef(null);
    const [token, setToken] = useState('');
    const message = useContext(ChatContext).set;

    return (
        <>
            <button className="no-btn fw" type="button" onClick={showDialog}>
                Chat unsaved contact
            </button>

            <dialog className="dialog-box" ref={diaRef}>
                <form className="dialog-container" method="dialog">
                    <label>
                        {/* same form type from login */}
                        <input autoFocus name="handle" placeholder="User handle" defaultValue={token} ref={inputRef} />
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
        diaRef.current.onclose = close;
        diaRef.current.showModal();
    }

    function close({ target: { returnValue } }) {
        if (returnValue) {
            // fetchDetals and chat
            getDetails(returnValue)
                .then(() => {
                    closeSearch();
                    message(inputRef.current.value);

                })
                .catch(err => {
                    console.error(err)
                })
        }
    }
}


async function getDetails(id) {
    // try to check for contact if successsful, open chat
    return fetch("/users/" + id)
        .then(res => res.json())
    // show not found error
}



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