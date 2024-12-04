import styles from '../page.module.css';

import React, { useEffect, useState, useContext, useRef } from "react";

import { ChatContext, ToggleOverlay, SendMsgContext, StateNavigatorContext } from '../../contexts';
import { MsgListContext } from '../contexts';

import { once, title, transitionEnd, standardUnit, int, $ } from "../../../utils";
import { openTrans, getMsg, msgsTable, offlineMsgsTable, loadDB, getContactDetails } from '../../../db';
import { DevMode } from '../../../App';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faCircleInfo, faCopy, faFile, faShare, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

import { MsgItem } from './MsgItem';
import { Footer } from './MsgingFooter';
import { IconBtn } from "../../components/Button";
import { useContactName } from '../../components/Hooks';
import { MsgListProvider } from '../providers';





export default function MsgInterface() {
    const [state, setState] = useState({});
    const [reply, setReply] = useState();
    const [preview, setPrev] = useState({});

    const { pushState, removeState } = useContext(StateNavigatorContext);

    const [msgList, setMsgList] = useState([]);
    const [pendingList, setPendingList] = useState([]);

    // const firstId = msgList[0]?.id, lastId = msgList?.[msgList.length - 1]?.id;

    const mainRef = useRef(null), navId = 'messaging', selectNavId = 'selecting';
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;

    const { msgsStatus } = useContext(SendMsgContext);


    const select = state?.selected;


    useEffect(() => {
        let t_id, ignore = false;

        if (chatting) {

            t_id = setTimeout(() => {
                if (ignore) return

                pushState(navId, close); // incase nav buttons are used
                mainRef.current.classList.remove("close")
            }, 100)
        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [chatting]);


    // useEffect(() => {
    //     if (!chatting) return

    //     for (let status of msgsStatus) {
    //         const index = pendingList.findIndex(val => val.id === status.id);

    //         if (index > -1) {
    //             setPendingList(prev => {
    //                 const clone = [...prev];
    //                 let replacement;

    //                 if (!status.status?.success) {
    //                     replacement = { ...clone[index], status: status.status };
    //                 }

    //                 clone.splice(index, 1, replacement);

    //                 return clone
    //             })

    //             // if sent
    //             if (status.status?.success) {
    //                 // get message and add to list to be displayed
    //                 getMsg(status.status.id)
    //                     .then(msg => {
    //                         setMsgList(prev => [...prev, msg])
    //                     })
    //             }
    //         }
    //     }

    // }, [chatting, msgsStatus]);


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


    return (
        chatting &&

        <div id="messaging" className={`interface close trans-right ${styles.msging}`} ref={mainRef} >
            <div className="max flex-col">
                <Heading
                    closeMsging={handleCloseClick}
                    selected={select}
                    clearSelection={clearSelection}
                />

                <div className="fw grow flex-col">
                    <div className='abs max'>
                    </div>

                    <MsgListProvider viewMsg={viewMsg}>
                        <MsgList
                            toggleSelect={toggleSelection}
                            selected={select ?? []}
                        />

                        <div className='fw'>
                            {preview.on && <PreviewFile data={preview.data} closePreview={() => previewFile(undefined, true)} />}

                            <Footer previewFile={previewFile} />
                        </div>

                    </MsgListProvider>
                </div>

            </div>
        </div>
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

        id = int(id);
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
        removeState(navId);
    }

    function close() {
        once(transitionEnd, mainRef.current, () => {
            chatContext.set(false);
            setState({});
        });

        mainRef.current.classList.add("close");
    }

}


const Heading = ({ selected, closeMsging, clearSelection }) => {
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;
    const selecting = selected?.length, online = true; // options = state.opts
    
    const name = useContactName(chatting);

    const toggleOverlay = useContext(ToggleOverlay);
    const { removeState } = useContext(StateNavigatorContext);



    return (
        <div className={`${styles.heading}`}>
            <div className={selecting && "disappear"}>
                <div className="fw flex mid-align gap-2 flex">
                    <IconBtn icon={faAngleLeft} onClick={closeMsging}>
                        Back
                    </IconBtn>
                    <div className="flex-col fw mid-align grow gap-1" onClick={showUserProfile} style={{ justifyContent: "center" }}>
                        <div className="dp-img" style={{ width: "40px" }}>
                        </div>

                        <div className="flex gap-2" style={{ justifyContent: "space-between" }}>
                            <div className="fs-3 fw-800"> {chatting && title(name)} </div>
                            <small style={{ color: online ? "green" : "var(--text2-col)" }}>
                                {online ? "Online" : online}
                            </small>
                        </div>
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
        toggleOverlay('user-card', {id: chatting});
    }
}


const MsgList = ({ selected, toggleSelect }) => {
    const listElem = useRef();

    const { replyTo, cur, pending } = useContext( MsgListContext ), msgList = cur, pendingList = pending;
    // const viewMsg = useContext( ChatContext ).id;

    const selectOn = Boolean(selected.length);

    // const isLoaded = Boolean(msgList.length);

    // useEffect(() => {
    //     if (isLoaded && viewMsg) {
    //         showRequested();
    //     }

    // }, [isLoaded, viewMsg])


    return (
        <div className={`${styles.content} msglist fw grow custom-scroll`}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            ref={listElem}
        >
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
                            blockUp={blockUp}
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
                            details={msg}
                            replyTo={replyTo}
                            blockUp={blockUp}
                        />
                    )
                })

            }

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


    function blockUp(bool) {
        if (bool) {
            if (listElem.scrollHeight !== listElem.clientHeight) // if there is a scrollbar
                listElem.classList.add("blockscroll");
        }
    }

    // function showRequested(){
    //     const elem = $("q.requested", listElem.current);
    //     console.log(elem);
        
    //     elem && elem.scrollIntoView({ behaviour: "smooth", inline: "start" });
    // }

}



const PreviewFile = ({ data, closePreview }) => {
    let { type, name, size } = data;
    type = type.split('/')[0];

    const mainRef = useRef(null);

    const { pushState } = useContext(StateNavigatorContext);
    const chatting = useContext(ChatContext).cur;


    const ext = name.split('.').slice(-1)[0];

    let jsx, src = URL.createObjectURL(data);


    useEffect(() => {
        let t_id, ignore = false;

        t_id = setTimeout(() => {
            if (ignore) return

            pushState(previewStateId, close); // incase nav buttons are used
            mainRef.current.classList.remove("close")
        }, 100)


        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [pushState]);



    switch (type) {
        case "video": {
            jsx =
                <div className="media-opt max">
                    <video src={src} controls className="abs-mid" alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
            break;
        }

        case "image": {
            jsx =
                <div className="media-opt max">
                    <img src={src} className="abs-mid" alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
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


    // Close function with animation handling
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
                .index("handle").openCursor(IDBKeyRange.only(nowChatting), "prev")
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
        .then(DB => IDBPromise (
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
