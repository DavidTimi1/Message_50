import styles from '../page.module.css';

import React, { useEffect, useState, useContext, useRef } from "react";

import { ChatContext, ToggleOverlay, SendMsgContext, StateNavigatorContext } from '../../contexts';
import { MsgListContext } from '../contexts';

import { once, title, transitionEnd, standardUnit, int, $ } from "../../../utils";
import { openTrans, getMsg, msgsTable, offlineMsgsTable, loadDB } from '../../../db';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faArrowDown, faCircleInfo, faCopy, faFile, faShare, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

import { MsgItem } from './MsgItem';
import { Footer } from './MsgingFooter';
import { IconBtn } from "../../../components/Button";
import { useContactName } from '../../components/Hooks';
import { MsgListProvider } from '../providers';
import { Link, Route, Routes } from 'react-router-dom';
import { UserProfilePic } from '../../contacts/components/ContactItem';
import { useUserDetails } from '@/hooks/use-user-details';
import { LoadingMessageList } from './MsgListLoader';
import { showToast } from '@/app/components/toaster';



export default function MsgInterface() {
    const [state, setState] = useState({});
    const [preview, setPrev] = useState({});

    const { pushState, removeState } = useContext(StateNavigatorContext);

    // const firstId = msgList[0]?.id, lastId = msgList?.[msgList.length - 1]?.id;

    const mainRef = useRef(null), navId = 'messaging', selectNavId = 'selecting';
    const { cur: chatting, set: setChatting } = useContext(ChatContext);
    const { data: userDetails, isLoading, isError, error } = useUserDetails(chatting);

    const select = state?.selected;


    useEffect(() => {
        if (chatting) {
            let t_id = setTimeout(() => {
                pushState(navId, close); // incase nav buttons are used
                mainRef.current.classList.remove("close")
            })

            return () => clearTimeout(t_id);
            
        } else {
            removeState(navId)
        }
    }, [chatting]);

    useEffect(() => {
        if (chatting && isError) {
            showToast("Error loading user details", "error");
            close();
        }
    }, [chatting, isError]);

    const isSelecting = Boolean(select?.length);

    useEffect(() => {
        if (!chatting) return

        if (isSelecting) {
            pushState(selectNavId, clearSelection);
            navigator.vibrate(100);

        } else {
            removeState(selectNavId);
        }

    }, [chatting, isSelecting]);

    if (!chatting) {
        return (
            <div className="max flex-col mid-align gap-2 no-content" style={{ justifyContent: "center" }}>
                <Routes>
                    <Route path='/' element={
                        <>
                            <div className="dp-img rounded-0" style={{ width: "100px", backgroundColor: "transparent", overflow: "visible", height: "100px", backgroundImage: "url(/logo.png)" }}></div>
                            Click on a chat item to view messages
                        </>
                    } />
                    <Route path='*' element={
                        <>
                            <div className="dp-img rounded-0" style={{ width: "100px", backgroundColor: "transparent", overflow: "visible", height: "100px", backgroundImage: "url(/logo.png)" }}></div>
                            Send and receive messages even without your phone
                            <span className="abs-mid" style={{ bottom: "30px", top: "unset" }}>
                                <span className="smaller"> 🔒 </span> End-to-end encrypted
                            </span>
                        </>
                    } />
                </Routes>
            </div>
        )
    }

    return (
        <aside id="messaging" className={`interface close trans-right ${styles.msging}`} ref={mainRef}>
            <div className="max flex-col">
                <Heading
                    closeMsging={handleCloseClick}
                    selected={select}
                    clearSelection={clearSelection}
                />

                <div className="fw grow flex-col" style={{ overflow: "hidden" }}>
                    <div className='abs max'>
                    </div>

                    {
                        true ? (
                            <LoadingMessageList />

                        ) : (
                            <MsgListProvider viewMsg={viewMsg}>
                                <MsgList
                                    toggleSelect={toggleSelection}
                                    selected={select ?? []}
                                    chatting={chatting}
                                />

                                <div className='fw'>
                                    {preview.on && <PreviewFile data={preview.data} closePreview={() => previewFile(undefined, true)} />}

                                    <Footer previewFile={previewFile} />
                                </div>

                            </MsgListProvider>
                        )
                    }

                </div>

            </div>
        </aside>
    )

    function clearSelection() {
        setState(prevState => {

            return ({
                ...prevState,
                selected: []
            })
        })
    }

    function toggleSelection(id) {
        if (!id) return

        let curSelection = select ?? [];

        setState(prevState => {
            const selections = prevState?.selected?.slice?.() ?? [];
            const index = selections.indexOf(id);

            if (index > -1) {
                selections.splice(index, 1);

            } else {
                selections.push(id)
            }


            return ({
                ...prevState,
                selected: selections
            })

        })

    }

    function previewFile(data, stateIsRemoved) {
        if (data) {
            setPrev({
                on: true,
                data
            })

        } else {
            if (stateIsRemoved) {
                setPrev({});

            } else {
                const done = removeState(previewStateId);
            }
        }
    }

    function handleCloseClick() {
        close(); // fallback
    }

    function close() {
        const el = mainRef.current;
        if (!el || el.classList.contains("close")) {
            setChatting(false);
            return
        }

        once(transitionEnd, el, () => {
            setChatting(false);
            setState({});
        });

        el.classList.add("close");
    }
}


const Heading = ({ selected, closeMsging, clearSelection }) => {
    const { cur: chatting } = useContext(ChatContext);
    const selecting = selected?.length;

    const name = useContactName(chatting);

    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="msging-heading">
            <div className={selecting && "disappear"}>
                <div className="fw flex mid-align gap-2 flex">
                    <IconBtn icon={faAngleLeft} onClick={closeMsging}>
                        Back
                    </IconBtn>
                    <div className="flex fw mid-align grow gap-2" onClick={showUserProfile} style={{ justifyContent: "center" }}>
                        <div>
                            <UserProfilePic width="30px" handle={chatting} />
                            {

                                <div className="abs online-bubble">
                                    <div className="dp-img" style={{ width: "10px", backgroundColor: "var(--btn-col)" }}>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="fs-4 fw-800"> {chatting && title(name)} </div>
                    </div>
                </div>
            </div>

            {
                selecting ?
                    <div className='abs-mid-y fw flex mid-align gap-2'>
                        <IconBtn icon={faXmark} onClick={clearSelection}>
                            Clear Selection
                        </IconBtn>
                        <div className="flex fw mid-align grow">
                            <div className="fh grow">
                                <span> {selecting} </span>
                                <small> Selected </small>
                            </div>
                            <div className="flex gap-2">
                                <IconBtn icon={faCopy} />
                                <IconBtn icon={faShare} />
                                <IconBtn icon={faTrash} />
                                <IconBtn icon={faCircleInfo} />
                            </div>
                        </div>
                    </div>
                    :
                    <></>
            }
        </div>
    )

    function showUserProfile() {
        toggleOverlay('user-card', { id: chatting });
    }
}


const MsgList = ({ selected, toggleSelect, chatting }) => {
    const listElem = useRef(), bottomBtn = useRef();

    const { replyTo, cur, pending } = useContext(MsgListContext), msgList = cur, pendingList = pending;

    const selectOn = Boolean(selected.length);

    useEffect(handleScroll, []);

    return (
        <div className={`${styles.content} ${selectOn ? 'blockscroll' : ''} msglist fw grow custom-scroll`}
            onContextMenu={handleContextMenu}
            onScroll={handleScroll}
            onClick={handleClick}
            ref={listElem}
        >
            <div className="fw">
                <small className='mx-auto banner'>
                    Messages between you and
                    <span style={{ color: "var(--btn-col)" }}> {chatting} </span>
                    are
                    <Link to="https://en.wikipedia.org/wiki/End-to-end_encryption" target="_blank" className="no-link m-1">
                        end-to-end encrypted
                    </Link>
                    🔒
                </small>
            </div>
            {
                msgList.map(msg => {
                    let select = selected.includes(msg.id);

                    return (
                        <MsgItem
                            key={msg.id}
                            id={msg.id}
                            select={{ cur: select, toggle: toggleSelect, on: selectOn }}
                            details={msg}
                            replyTo={replyTo}
                        />
                    )
                })
            }

            {
                pendingList.map(msg => {
                    let select = selected.includes(msg.id);

                    return (
                        <MsgItem
                            key={msg.id}
                            id={msg.id}
                            select={{ cur: select, toggle: toggleSelect, on: selectOn }}
                            details={{ ...msg, notSent: true, sent: true }}
                            replyTo={replyTo}
                        />
                    )
                })

            }

            <div className='flex' ref={bottomBtn} style={{ position: "sticky", bottom: "-20px", justifyContent: "flex-end" }}>
                <IconBtn icon={faArrowDown} onClick={scrollToBtm} bg="var(--body-col)" />
            </div>

        </div>
    )

    function handleContextMenu(e) {
        const { target } = e;
        e.preventDefault();

        const el = target.closest(".msgcont"), id = el?.dataset?.id;

        if (id) {
            toggleSelect(id)
        }
    }

    function handleClick(e) {
        const { target } = e;

        const el = target.closest(".msgcont"), id = el?.dataset?.id;

        if (id) {
            selectOn && toggleSelect(id)
        }
    }

    function scrollToBtm() {
        listElem.current.scrollTop = listElem.current.scrollHeight;
    }

    function handleScroll(e) {
        if (listElem.current.scrollHeight - (listElem.current.scrollTop + listElem.current.clientHeight) < 30) {
            bottomBtn?.current?.classList?.add("disappear");

        } else {
            bottomBtn?.current?.classList?.remove("disappear");
        }
    }

}



const PreviewFile = ({ data, closePreview }) => {
    let { type, name, size, localSrc } = data;
    type = type.split('/')[0];

    const mainRef = useRef(null);

    const { pushState } = useContext(StateNavigatorContext);
    const chatting = useContext(ChatContext).cur;

    const ext = name.split('.').slice(-1)[0];

    let jsx;


    useEffect(() => {
        let t_id = setTimeout(() => {
            pushState(previewStateId, close); // incase nav buttons are used
            mainRef.current.classList.remove("close")
        })

        return () => clearTimeout(t_id);
    }, [pushState]);



    switch (type) {
        case "video": {
            jsx =
                <div className="media-opt max">
                    <video src={localSrc} controls className="abs-mid" alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
            break;
        }

        case "image": {
            jsx =
                <div className="media-opt max">
                    <img src={localSrc} className="abs-mid" alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
            break;
        }

        default: {
            jsx =
                <div className="file-opt abs-mid flex-col mid-align">
                    <div className="file-icon">
                        <FontAwesomeIcon icon={faFile} size="4x" />
                    </div>
                    <div className="fnom"> {name} </div>
                    <div className="fdets"><span> {ext.toUpperCase()} </span> • <span> {standardUnit('data', size)} </span></div>
                </div>
            break;
        }
    }


    return (
        <div className="abs fw prev-interface" ref={mainRef}>
            <div className='max flex-col'>
                {/* <div className="head fw" style={{ padding: "5px" }}>
                    <div className="fw flex mid-align">
                        <IconBtn icon={faXmark} onClick={close}>
                            close
                        </IconBtn>

                        <div className='grow' style={{ marginLeft: "10px" }}>
                            To:
                            <span className="to"> {chatting} </span>
                        </div>
                    </div>
                </div> */}
                <div className="file-preview grow fw">
                    {jsx}
                </div>
            </div>
        </div>
    )


    function close() {
        // Trigger animation class

        if (mainRef.current) {
            mainRef.current.classList.add("close");

        } else {
            setTimeout(closePreview);
        }

        // Wait for the transition/animation to complete
        once(transitionEnd, mainRef.current, closePreview);
    }

}


export function getMessages(nowChatting, msgId) {
    let list = [];
    let unsent = [];
    let i = 0, uB = 50, uB2 = 10;


    // make sure db is loaded first
    return loadDB()
        .then(DB => new Promise(res => {

            openTrans(DB, msgsTable)
                .index("handle_time").openCursor(IDBKeyRange.bound([nowChatting, 0], [nowChatting, Infinity]), "prev")
                .onsuccess = e => {
                    let cur = e.target.result;

                    // normally, load 50 if id is set, load only 10 more
                    if (cur && ((!msgId && i < uB) || (msgId && i < uB2))) {

                        let id = cur.primaryKey;
                        list.unshift(cur.value);

                        (!msgId || id > msgId) && i++;
                        cur.continue();

                    } else {
                        // show messages that have not yet been sent
                        openTrans(DB, offlineMsgsTable)
                            .index("handle").openCursor(IDBKeyRange.only(nowChatting))
                            .onsuccess = e => {
                                let cur = e.target.result;

                                if (cur) {
                                    let id = cur.primaryKey;
                                    unsent.push({ ...cur.value, notSent: true, id });
                                    cur.continue();

                                } else {
                                    res({
                                        data: list,
                                        unsent
                                    })
                                }
                            }
                    }
                }
        }))
}


export function loadMoreMessages(afterId, beforeId) {
    let range, i = 0, list = [];

    if (afterId) {
        range = [IDBKeyRange.lowerBound(afterId, true)];

    } else if (beforeId) {
        range = [IDBKeyRange.upperBound(beforeId, true), "prev"];

    }

    // return a promise resolving the list or rejecting undefined
    return new Promise((res, rej) => {
        !range && rej();

        return loadDB()
            .then(DB => IDBPromise(
                openTrans(DB, msgsTable)
                    .openCursor(...range)
                    .onsuccess = e => {
                        let cursor = e.target.result;

                        if (cursor && i < 20) {
                            let id = cursor.primaryKey;

                            list.append(cursor.value)

                            i++;
                            cursor.continue();
                        } else {
                            res(list);
                        }
                    }
            )
            )
    })

}

let justSent = [];

let viewMsg;

const previewStateId = 'preview-upload';
