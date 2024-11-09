import { useContext, useEffect, useRef, useState } from "react";
import { Button, IconBut } from "./buttons";
import { once, title, transitionEnd } from "./ui/helpers";
import { ChatContext } from "./contexts";



export default function SearchWindow({ show, closeSearch, initFilters }) {
    const [filters, setFilters] = useState(initFilters);
    const inputRef = useRef(null), myRef = useRef(null);

    const filterKeys = Object.keys(filters);

    useEffect(() => {
        let t_id = show && setTimeout(() => myRef.current.classList.remove("close"), 50)

        return () => t_id && clearTimeout(t_id);
    }, [show])


    return (
        show &&
        <div className="interface close" ref={myRef}>
            <div className="fw flex-col mid-align">
                <div className="header fw flex mid-align gap-2">
                    <IconBut className="fa-solid fa-angle-left" onClick={close} />

                    <div className="grow flex mid-align gap-2">
                        <label className="flex mid-align grow gap-1">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input autoFocus autoComplete="on" className="search-box not-visible max" ref={inputRef} placeholder="Search..." />
                        </label>
                        <IconBut className="fa-solid fa-xmark" onClick={clearInput} />
                    </div>
                </div>

                <div className="filters-list flex mid-align" style={{ flexWrap: "wrap" }}>
                    {
                        filterKeys.map(filter =>
                            <FilterButton key={filter} id={filter} state={filters[filter]} />
                        )
                    }
                </div>
            </div>

            <div className="custom-scroll">
                <div>
                    <ChatUnsaved inputRef={inputRef} closeSearch={close} />
                    <Button>
                        Create New  Contact
                    </Button>
                </div>
                <div className="search-result results-contacts"></div>
                <div className="search-result results-messages"></div>
            </div>
        </div>
    )


    function clearInput() {
        inputRef.current.value = '';
    }

    function FilterButton({ id, state }) {
        return (
            <label className="flex mid-align filter-btn">
                <input type="checkbox" className="" defaultChecked={state} />
                <span>{title(id)}</span>
            </label>
        )
    }

    function close() {
        const el = myRef.current;
        once(transitionEnd, el, closeSearch);
        el.classList.add("close");
    }
}


function ChatUnsaved({ searchBoxRef, closeSearch }) {
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