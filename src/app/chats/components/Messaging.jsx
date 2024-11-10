import './ui/chats.css';
import './ui/views.css';
import wallpaper from './public/Nagi_8.jpg'

import React, { useEffect, useState, useContext, useRef } from "react";

import { runOnComplete, standardUnit } from './helpers';

import { ChatContext } from './contexts';
import { IconBut } from "./buttons";
import ProfilePic from "./contacts";
import { on, once, sanitize, title, transitionEnd } from "./ui/helpers";
import { IDBPromise, openTrans, DB } from './db';
import { DevMode } from './App';
import { BgImg, TimePast } from './more';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faCircleArrowDown, faCirclePause, faCirclePlay, faEllipsisVertical, faFile, faFileAudio, faFilm, faImage, faXmark } from '@fortawesome/free-solid-svg-icons';



export default function MsgInterface({ viewMsg }) {
    const [state, setState] = useState({});
    const [reply, setReply] = useState();
    const [preview, setPrev] = useState({});

    const mainRef = useRef(null);
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;

    const online = true;

    const select = state?.selected, selecting = select?.length > 0 //, options = state.opts;


    useEffect(() => {
        let t_id = chatting && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }

    });


    return (
        chatting &&
        <div id="messaging" className="interface max close" ref={mainRef} >
            <div className="content max flex-col">
                <div className="heading fw flex mid-align gap-2">
                    {
                        selecting ?
                            <>
                                <IconBut className="fa-solid fa-xmark" onClick={clearSelection}>
                                    Clear Selection
                                </IconBut>
                                <div className="flex fw mid-align grow">
                                    <div className="fh grow">
                                        <span> {select.length} </span>
                                        <small>selected</small>
                                    </div>
                                    <div className="flex gap-2">
                                        <IconBut className="fa-solid fa-copy" />
                                        <IconBut className="fa-solid fa-share" />
                                        <IconBut className="fa-solid fa-trash" />
                                        <IconBut className="fa-solid fa-circle-info" />
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                <IconBut className="fa-solid fa-angle-left" onClick={close}>
                                    Back
                                </IconBut>
                                <div className="flex-col fw mid-align grow gap-1" style={{ justifyContent: "center" }}>
                                    <div className="user-pic">
                                        <ProfilePic />
                                    </div>
                                    <div className="flex gap-2" style={{ justifyContent: "space-between" }}>
                                        <div className="user-name"> {chatting && title(chatting)} </div>
                                        <small style={{ color: online ? "green" : "grey" }}> {online ? "Online" : online} </small>
                                    </div>
                                </div>
                            </>

                    }
                </div>
                <div className='fw grow flex-col'>
                    <div className='abs max'>
                        <BgImg src={wallpaper} />
                    </div>
                    {chatting &&
                        <MsgList
                            replyTo={replyTo}
                            toggleSelect={toggleSelection}
                            selected={state?.selected?.slice() ?? []}
                            viewMsg={viewMsg}
                        />
                    }

                    <Footer reply={reply} />
                </div>

                <PreviewFile show={preview.on} />

            </div>
        </div>
    )


    function clearSelection() {
        setState({
            ...state,
            selected: []
        })
    }

    function toggleSelection(id) {
        let curSelection = state?.selected?.slice() ?? [];
        curSelection.length === 0 && navigator.vibrate(100);

        if (curSelection.includes(id)) {
            let index = curSelection.indexOf(id);

            setState({
                ...state,
                selected: curSelection.splice(index, 1)
            })
            return
        }

        setState({
            ...state,
            selected: curSelection.push(id)
        })

    }

    function replyTo(id) {
        setReply(id)
    }

    function close() {
        once(transitionEnd, mainRef.current, () => {
            chatContext.set(false);
            setReply();
            setState({});
        });

        mainRef.current.classList.add("close");
    }

}


function MsgList({ replyTo, selected, toggleSelect, viewMsg }) {
    const [msgList, setMsgList] = useState(DevMode ? devMsgs : []);
    const listElem = useRef();
    const nowChatting = useContext(ChatContext).cur;

    // const firstId = msgList?.[0]?.id, lastId = msgList?.[msgList.length - 1]?.id;
    const selectOn = Boolean(selected.length);

    useEffect(() => {
        !DevMode && getMessages();

    })

    return (
        <div className="messaging-content custom-scroll fw grow" ref={listElem}>
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

        </div>
    )


    function blockUp(bool) {
        if (bool) {
            if (listElem.scrollHeight !== listElem.clientHeight) // if there is a scrollbar
                listElem.classList.add("block-scroll");
        }
    }


    function getMessages() {
        let list = [];
        let i = 0;

        openTrans(DB, "all_messages_tb")
            .index("handle").openCursor(IDBKeyRange.only(nowChatting), "prev")
            .onsuccess = e => {
                let cur = e.target.result;

                if (cur && ((!viewMsg && i < 50) || (viewMsg && i < 10))) {
                    let id = cur.primaryKey;
                    list.prepend(cur.value);

                    (!viewMsg || id > viewMsg) && i++;
                    cur.continue();

                } else {
                    // show messages that have not yet been sent
                    openTrans(DB, "offline_messages")
                        .index("handle").openCursor(IDBKeyRange.only(nowChatting)).onsuccess = e => {
                            let cur = e.target.result;

                            if (cur) {
                                let id = cur.primaryKey;
                                list.append({ ...cur.value, unsent: true });
                                cur.continue();

                            } else {
                                setMsgList(list)
                            }
                        }
                }
            }
    }
}


function Footer() {
    const [UI, setUI] = useState({});
    const fileRef = useRef(null);
    const showOpts = UI.opts, canSend = UI.ready;

    return (
        <div className="msgg-bottom fw">
            <div className="fw">
                <UploadOptions open={showOpts} selectFile={selectFile} />

                <div className="form flex fw gap-2" style={{ alignItems: "last baseline" }}>
                    <IconBut className="fa-solid fa-xmark plus" onClick={toggleOpts}>
                        <span className='sr-only'> Add attachment </span>
                    </IconBut>
                    <textarea
                        className='grow' row="1" placeholder="Type a message..." id="msg-field"
                        onInput={resize}
                        style={{ paddingBlock: "5px" }}
                    ></textarea>
                    <div className="acticon">
                        {canSend ?
                            <IconBut type="submit" className="fa-solid fa-paper-plane" onClick={queueToSend} />
                            :
                            <IconBut className="fa-solid fa-microphone" onContextMenu={recordVN} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )


    function toggleOpts(e) {
        const { target } = e;
        fileRef.current = null;

        showOpts ? target.classList.remove("plus") : target.classList.add("plus");

        setUI({
            ...UI,
            opts: !showOpts
        })
    }

    function recordVN(e) {
        e.preventDefault();
    }

    function queueToSend() {

    }

    function selectFile(value) {
        fileRef.current = value;
    }

    function resize(e) {
        const { target } = e, { value } = target;

        const readyToSend = value.trim() || fileRef.current;

        let size = target.clientHeight;
        let cur = target.getAttribute("rows");

        if (size < target.scrollHeight) {
            if (cur < 5) {
                target.setAttribute("rows", ++cur);
                resize({ target: target });
            }

        } else if (size > target.scrollHeight) {
            target.setAttribute("rows", cur === 1 ? cur : --cur);
            resize({ target })
        }

        if (readyToSend !== canSend) {
            setUI({ ...UI, ready: readyToSend })
        }
    }
}


function UploadOptions({ open, selectFile }) {
    const mainRef = useRef(null);
    const [opened, setOpen] = useState(open);

    useEffect(() => {
        let t_id;

        if (open !== opened) {
            toggle(open);
        } else {
            t_id = mainRef.current && setTimeout(() => mainRef.current.classList.remove("close"), 20);
        }

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [open, opened]);

    return (
        opened &&

        <div className="abs br-1 flex opts close gap-2" ref={mainRef}>
            <Option label="Image" icon={faImage} accept="image/*" />
            <Option label="Audio" icon={faFileAudio} accept="audio/*" />
            <Option label="Video" icon={faFilm} accept="video/*" />
            <Option label="Other" icon={faFile}/>
        </div>
    )

    function toggle(bool) {
        if (bool) setOpen(bool)
        else {
            let cond = mainRef.current.classList.contains("close");
            runOnComplete(cond, transitionEnd, mainRef.current, () => setOpen(bool));
            mainRef.current.classList.add("close");
        }
    }

    function handleInput(e) {
        const { target } = e;
        if (target.files[0]) {
            selectFile(target);
        }
    }

    function Option({ label, icon, accept }) {

        return (
            <label className="flex-col mid-align">
                <div style={{ aspectRatio: "1/1", width: "100px", borderRadius: "50%", backgroundColor: "var(--sec-col)" }}>
                    <div className="abs-mid">
                        <FontAwesomeIcon icon={icon} />
                    </div>

                    <input className='hide' type='file' accept={accept} />
                </div>
                <small>{label}</small>
            </label>
        )
    }
}


function MsgItem(props) {
    const { details, id, select, replyTo, blockUp } = props;
    const { reply, file, textContent, action, time } = details;

    const itemRef = useRef(null);

    return (
        <div className={`msg-cont ${action === "sent" ? "s-cont" : "r-cont"} fw ${select.cur ? 'selected' : ''}`} onClick={handleClick} onContextMenu={select.toggle} onTouchStart={handleTouchStart}>
            <div className="flex-col fw gap-1">
                <div className="message-item" ref={itemRef}>
                    {reply && <MsgLink id={reply}></MsgLink>}
                    {file && <MsgAttachment />}

                    <div style={{ lineHeight: "20px", padding: "1px 5px" }}>
                        <div className="text"> {textContent} </div>
                    </div>

                    <div className="abs instr">
                        <IconBut className="fa-solid fa-share reply" onClick={_ => replyTo(id)} />
                    </div>
                </div>
                <small className="timestamp br-1">
                    <TimePast time={time} />
                </small>
            </div>
        </div>
    )


    function handleTouchStart(e) {
        const msgItem = itemRef.current;

        if (select.on) return

        msgItem.classList.add("no-trans");
        let touch = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        let inMotion = false, vibrated = false;

        let moveMsg = e => {
            let cur = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            }, disp = {
                x: Math.abs(cur.x - touch.x),
                y: Math.abs(cur.y - touch.y)
            };

            if (((disp.x < 30 || disp.y > 10) && !inMotion) || disp.x > 170) return

            inMotion = true;
            blockUp(true);

            if (disp.x > 100 && !vibrated) {
                navigator.vibrate(25);
                vibrated = true;
            }

            msgItem.style.transform = `translateX(${cur.x - touch.x}px)`;
        }


        let endMsgTouch = e => {
            blockUp(false);
            msgItem.classList.remove("no-trans");

            let displacement = Math.abs(e.changedTouches[0].clientX - touch.x);
            if (displacement > 100) replyTo(id);

            msgItem.style.transform = "translateX(0px)";
            document.removeEventListener('touchmove', moveMsg);
            document.removeEventListener('touchend', endMsgTouch);
        }

        on('touchmove', document, moveMsg, { passive: true })
        once('touchend', document, endMsgTouch)

    }


    function handleClick(e) {
        select.on && select.toggle(id);
    }
}


function MsgLink({ id }) {
    const [status, setStatus] = useState(false);
    // TODO get name and message

    useEffect(() => {
        if (!id) return

        getMsg(id)
            .then(msg => {
                // if it is continue else remove
                if (msg) {
                    // TODO check if name is saved
                    let person = msg.action === 's' ? "You" : msg.person;

                    if (msg.status === 'x') {
                        setStatus(false);
                    } else {
                        setStatus({
                            name: person,
                            text: msg.textContent.slice(0, 30)
                        })
                    }
                } else {
                    setStatus(false);
                }
            })
    })

    return (
        <>
            {
                status ?
                    <button className="no-btn fw" style={{ overflow: "hidden" }}>
                        <small className="fw flex-col msg-reply gap-1">
                            <div className="crop-excess" style={{ color: "var(--but-col)" }}>
                                {status.name}
                            </div>
                            <div className="crop-excess" style={{ color: "var(--grey)" }}>
                                {status.text}
                            </div>
                        </small>
                    </button>
                    :
                    <></>
            }
        </>
    )
}


function MsgAttachment({ type, isSaved, loadType }) {
    const [saved, setSaved] = useState(isSaved);
    const [loadProgress, setProgress] = useState(false);
    // const chatting = useContext(ChatContext).cur;

    let fileName, fileSize, fileExt;

    function startLoad() {
        setSaved(false);
        setProgress(0)
    }

    let frag;
    switch (type) {
        case 'image': {
            frag =
                <div className="img-cont max-child">
                    {
                        saved ?
                            <>
                                {/* TODO */}
                                <img src="" alt="" />
                                <div className="dropdown">
                                    <button data-bs-toggle="dropdown" aria-expanded="false">
                                        <FontAwesomeIcon icon={faEllipsisVertical} />
                                    </button>

                                    <ul className="dropdown-menu">
                                        <li><button className="dropdown-item">Save to device</button></li>
                                    </ul>
                                </div>
                            </>
                            :
                            <>
                                <img className="timg" alt="" />
                                <LoadVeil loadProgress={loadProgress} loadType={loadType} />
                            </>
                    }
                </div>
            break;
        }
        case 'audio': {
            frag =
                <div className="audio-cont flex-col">
                    <div className="fw flex mid-align">
                        {
                            saved ?
                                <>
                                    <button className="no-btn p-but">
                                        <FontAwesomeIcon icon={faCirclePlay} size='xl' />
                                        <FontAwesomeIcon icon={faCirclePause} size='xl' />
                                    </button>
                                </>
                                :
                                <>
                                    <button className="no-btn p-but">
                                        {
                                            loadProgress === false ?
                                                <FontAwesomeIcon icon={faCircleArrowDown} size="xl" className="down-icon" aria-label="Click to download audio" />
                                                :
                                                <span className="hide block">
                                                    <svg height="50px" width="50px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                                                        <circle cx="25px" cy="25px" r="20px" fill="none" stroke="green" stroke-width="7px" stroke-linecap="round"></circle>
                                                    </svg>
                                                    <FontAwesomeIcon icon={faXmark} size="xl" className="down-icon" aria-label="Click to download audio" />
                                                </span>
                                        }
                                    </button>
                                </>
                        }
                    </div>
                    <div>
                        <small className="aud-dets">
                            <span className="audio-duration"></span>
                            <span>•</span>
                            <span className="audio-size"></span>
                        </small>
                    </div>
                </div>
            break;
        }
        case 'video': {
            frag =
                <div className="vid-cont max-child">
                    {
                        saved ?
                            <>
                                <video src=""></video>
                                <FontAwesomeIcon icon={faCirclePlay} className='abs-mid' size="2xl" />
                                
                                <div className="dropdown">
                                    <button className='abs-mid' data-bs-toggle="dropdown" aria-expanded="false">
                                        <FontAwesomeIcon icon={faEllipsisVertical} size="2xl" />
                                    </button>
                                    
                                    <ul className="dropdown-menu">
                                        <li><button className="dropdown-item">Save to device</button></li>
                                    </ul>
                                </div>
                            </>
                            :
                            <>
                                <img alt="" className="timg" src="" />
                                <LoadVeil loadProgress={loadProgress} loadType={loadType} />
                            </>
                    }
                </div>
            break
        }
        default: {
            frag =
                <div className="file-cont flex mid-align fw" style={{ padding: "10px" }}>
                    {
                        saved ?
                            <>
                                <div className="icon">
                                    <div aria-hidden="true">
                                        <FontAwesomeIcon icon={faFile} size="xl" />
                                    </div>
                                </div>
                                <div className="flex-col fw" style={{ margin: "0 10px" }}>
                                    <div className="crop-excess2" style={{ lineHeight: "20px", maxHeight: "41px" }}>
                                        {fileName}
                                    </div>
                                    <div className="fw">
                                        <small className="meta">
                                            <span>{fileSize}</span>
                                            <span>•</span>
                                            <span>{fileExt}</span>
                                        </small>
                                    </div>
                                </div>
                                <div className="dropdown abs">
                                    <button data-bs-toggle="dropdown" aria-expanded="false">
                                        <FontAwesomeIcon icon={faEllipsisVertical} size="2xl" />
                                    </button>
                                    
                                    <ul className="dropdown-menu">
                                        <li><button className="dropdown-item">Save to device</button></li>
                                    </ul>
                                </div>
                            </>
                            :
                            <>
                                <div className="file-icon">
                                    {
                                        loadProgress === false ?
                                            <button aria-label="Click to download file">
                                                <FontAwesomeIcon icon={faArrowDown} size="lg" className='down-icon' />
                                            </button>
                                            :
                                            <div>
                                                <svg height="50px" width="50px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                                                    <circle cx="25px" cy="25px" r="20px" fill="none" stroke="green" stroke-width="7px" stroke-linecap="round"></circle>
                                                </svg>

                                                <button className='abs-mid' aria-label="Click to download file">
                                                    <FontAwesomeIcon icon={faXmark} size="lg" className='down-icon' />
                                                </button>
                                            </div>
                                    }
                                </div>
                                <div className="file-details flex-col">
                                    <div>{fileName}</div>
                                    <div className="file-details-down fw">
                                        <small className="dets">
                                            <span>{fileSize}</span>
                                            <span>•</span>
                                            <span>{fileExt}</span>
                                        </small>
                                    </div>
                                </div>
                            </>
                    }
                </div>
        }

    }

    return (
        <div className="msg-atth fw">
            {frag}
        </div>
    )
}


function LoadVeil({ loadType, loadProgress, handleClick }) {

    <div className="veil max-child">
        <div className="abs-mid">
            {
                loadProgress !== false ?

                    <div onClick={_ => handleClick("cancel")}>
                        <svg height="50px" width="50px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                            <circle cx="25px" cy="25px" r="20px" fill="none" stroke="green" stroke-width="7px" stroke-linecap="round"></circle>
                        </svg>

                        <button className='abs-mid ds' aria-label="Click to download file">
                            <FontAwesomeIcon icon={faXmark} size="lg" className='down-icon' />
                        </button>
                    </div>
                    :
                    <button aria-label="Click to download file">
                        <FontAwesomeIcon icon={faArrowDown} size="lg" className='down-icon' />
                    </button>
            }
        </div>
    </div>
}


function PreviewFile({ type, name, ext, size, src, show }) {
    const mainRef = useRef(null);
    const chatting = useContext(ChatContext).cur;

    let jsx;

    useEffect(() => {
        let t_id = show && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [show]);

    if (!show) return <></>

    switch (type) {
        case "file": {
            jsx =
                <div className="file-opt abs-mid flex-col mid-align">
                    <div className="file-icon">
                        <FontAwesomeIcon icon={faFile} />
                    </div>
                    <div className="fnom"> {name} </div>
                    <div className="fdets"><span> {ext.toUpperCase()} </span> • <span> {standardUnit('data', size)} </span></div>
                </div>
            break;
        }

        case " " | "": {
            jsx =
                <div className="media-opt max-child">
                    <img src={src} className="abs-mid" alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
            break;
        }

        default: {
            console.error("Default case!!")
        }
    }


    return (
        <div className="prvw-up interface close" ref={mainRef}>
            <div className="head fw" style={{ padding: "5px" }}>
                <div className="fw flex mid-align">
                    <IconBut className="fa-solid fa-xmark">
                        <span className="sr-only">close</span>
                    </IconBut>
                    <div style={{ marginLeft: "10px" }}>
                        To:
                        <span className="to"> {chatting} </span>
                    </div>
                </div>
            </div>
            <div className="file-preview fw">
                {jsx}
            </div>
        </div>
    )
}


export async function getMsg(id) {

    return await IDBPromise(openTrans(DB, "all_messages_tb").get(id))
        .then(msg => {
            // if it is continue else remove
            if (msg && msg.status === 'x') {
                return null
            }
            return msg
        })
        .catch(err => {
            console.error(err);
            return null
        })
}


// const devMsgs = [
//     {
//         id: 3,
//         time: 1725142641588,
//         textContent: "Hello bruvver",
//         action: "sent"
//     },
//     {
//         id: 7,
//         time: 1725142622810,
//         textContent: "Hello bruvver",
//         action: "received"
//     },
//     {
//         id: 30,
//         time: 1725142599711,
//         textContent: "Hello bruvver",
//         action: "sent",
//     },
// ]