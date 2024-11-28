import wallpaper from '../assets/Nagi_8.jpg';
import styles from '../page.module.css';

import React, { useEffect, useState, useContext, useRef } from "react";

import { ChatContext, ToggleOverlay, SendMsgContext, StateNavigatorContext } from '../../contexts';
import { IconBtn } from "../../components/Button";

import { on, once, title, transitionEnd, runOnComplete, standardUnit, int } from "../../../utils";
import { IDBPromise, openTrans, DB } from '../../../db';
import { DevMode } from '../../../App';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faCircleInfo, faCopy, faFile, faFileAudio, faFilm, faImage, faMicrophone, faPaperPlane, faShare, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

import { MsgItem } from './MsgItem';
import { getMsg, msgsTable, offlineMsgsTable } from '../../page';
import { MsgListContext } from '../contexts';
import { useOfflineActivities } from '../../components/Offline';
import { useOnlineStatus } from '../../components/Hooks';



export default function MsgInterface({ viewMsg }) {
    const [state, setState] = useState({});
    const [reply, setReply] = useState();
    const [preview, setPrev] = useState({});

    const { pushState, removeState } = useContext( StateNavigatorContext );
    
    const [msgList, setMsgList] = useState(DevMode ? devMsgs : []);
    const [pendingList, setPendingList] = useState([]);
    
    const firstId = msgList[0]?.id, lastId = msgList?.[msgList.length - 1]?.id;

    const mainRef = useRef(null), navId = 'messaging', selectNavId = 'selecting';
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;

    const {msgsStatus} = useContext(SendMsgContext);


    const select = state?.selected;


    useEffect(() => {
        let t_id, ignore = false;
        
        if (chatting){

            t_id = setTimeout(() => {
                if (ignore) return

                pushState(navId, close); // incase nav buttons are used
                mainRef.current.classList.remove("close")
            }, 100)
        }

        if (!DevMode){
            getMessages()
            .then (res => {
                setMsgList(res.data)
                setPendingList(res.unsent)
            })
        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [chatting]);
    

    useEffect(() => {
        if (!chatting) return
        
        for (let status of msgsStatus){
            const index = pendingList.findIndex( val => val.id === status.id);

            if (index > -1){
                setPendingList( prev => {
                    const clone = [...prev];
                    let replacement;
                    
                    if (!status.status?.success){
                        replacement = {...clone[index], status: status.status };
                    }

                    clone.splice(index, 1, replacement);

                    return clone
                })

                // if sent
                if (status.status?.success){
                    // get message and add to list to be displayed
                    getMsg(status.status.id)
                    .then( msg => {
                        setMsgList( prev => [...prev, msg] )
                    } )
                }
            }
        }

    }, [chatting, msgsStatus]);


    const isSelecting = Boolean(select?.length);
    useEffect(() => {
        if (!chatting) return

        if (isSelecting){
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

                    <MsgListContext.Provider value={{
                            loadPrevious: loadPreviousMsgs,
                            cur: msgList
                        }}
                    >
                        { chatting &&
                            <MsgList
                                msgList={msgList}
                                pendingList={pendingList}
                                replyTo={replyTo}
                                toggleSelect={toggleSelection}
                                selected={select ?? []}
                                viewMsg={viewMsg}
                            />
                        }

                        <div className='fw'>
                            { preview.on && <PreviewFile data={preview.data} close={() => previewFile()} /> }
                            <Footer reply={reply} addUnsent={addUnsent} removeReply={() => setReply()} previewFile={previewFile} />
                        </div>
                    </MsgListContext.Provider>
                </div>

            </div>
        </div>
    )


    function loadPreviousMsgs(){
        loadMoreMessages(null, firstId)
        .then(msgs => {
            setMsgList( prev => [...msgs, ...prev])
        })
    }

    function addUnsent(data){
        setPendingList( prev => [...prev, data] );
    }

    function clearSelection() {
        setState( prevState => {

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

        setState( prevState => {
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

    function replyTo(id) {
        setReply(id)
    }

    function previewFile(data){
        if (data){
            setPrev({
                on: true,
                data
            })

        } else {
            setPrev({})
        }
    }

    function handleCloseClick(){
        removeState(navId);
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


const Heading = ({selected, closeMsging, clearSelection}) => {
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;
    const selecting = selected?.length, online = true; // options = state.opts

    const toggleOverlay = useContext(ToggleOverlay);
    const { removeState } = useContext(StateNavigatorContext)


    return (
        <div className={`${styles.heading}`}>
            <div className={selecting && "disappear"}>
                <div className="fw flex mid-align gap-2 flex">
                    <IconBtn icon={faAngleLeft} onClick={closeMsging}>
                        Back
                    </IconBtn>
                    <div className="flex-col fw mid-align grow gap-1" onClick={showUserProfile} style={{ justifyContent: "center" }}>
                        <div className="dp-img" style={{width: "40px"}}>
                        </div>

                        <div className="flex gap-2" style={{ justifyContent: "space-between" }}>
                            <div className="fs-3 fw-800"> {chatting && title(chatting)} </div>
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

    function showUserProfile(){
        toggleOverlay('user-card', true);
    }
}


function MsgList({ replyTo, selected, toggleSelect, viewMsg, msgList, pendingList }) {
    const listElem = useRef();

    const selectOn = Boolean(selected.length);


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
                pendingList.map( msg => {
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

    function handleContextMenu(e){
        const {target} = e;
        e.preventDefault();

        const el = target.closest(".msgcont"), id = el?.dataset?.id;

        if (id){
            toggleSelect(id)            
        }
    }

    function handleClick(e){
        const {target} = e;

        const el = target.closest(".msgcont"), id = el?.dataset?.id;

        if (id){
            selectOn && toggleSelect(id)            
        }
    }


    function blockUp(bool) {
        if (bool) {
            if (listElem.scrollHeight !== listElem.clientHeight) // if there is a scrollbar
                listElem.classList.add("blockscroll");
        }
    }

}


function Footer({previewFile, reply, removeReply, addUnsent}) {
    const [UI, setUI] = useState({});
    const fileRef = useRef(null), inputRef = useRef(null);
    const showOpts = UI.opts, canSend = UI.ready;

    const chatting = useContext(ChatContext).cur;
    const isOnline = useOnlineStatus();
    const offloadQueue = useOfflineActivities().sendMsg;

    return (
        <div className="msgg-bottom fw mx-auto">
            <div className="fw">
                <UploadOptions open={showOpts} selectFile={selectFile} />

                <div className="form flex fw gap-2" style={{ alignItems: "last baseline", justifyContent: "space-around" }}>
                    <div className="xmark plus">
                        <IconBtn icon={faXmark} onClick={toggleOpts}>
                            Add attachment
                        </IconBtn>
                    </div>
                    <label className='grow nv-input br-1'>
                        <textarea
                            className='fw' rows="1" placeholder="Type a message..." id="msg-field"
                            autoCorrect="on"
                            ref={inputRef}
                            onInput={resize}
                        ></textarea>
                    </label>
                    <div className="acticon">
                        {canSend ?
                            <IconBtn type="submit" icon={faPaperPlane} onClick={queueToSend} />
                            :
                            <label onContextMenu={recordVN}>
                                <IconBtn icon={faMicrophone} />
                            </label>
                        }
                    </div>
                </div>
            </div>
        </div>
    )


    function toggleOpts(e) {
        const { target } = e, parent = target.closest(".xmark");

        if (fileRef.current){
            fileRef.current = null;
            previewFile();
            parent.classList.add("plus")
            return
        }
        
        showOpts ? parent.classList.add("plus") : parent.classList.remove("plus");
        setUI({
            ...UI,
            opts: !showOpts
        })
    }

    function recordVN(e) {
        e.preventDefault();
        console.log("recording")
    }

    async function queueToSend(e) {
        let receivers, file, textContent;

        receivers = chatting instanceof Array? chatting : [chatting];
        textContent = inputRef.current.value;    
        file = fileRef.current;
    
        // if user tries to send a message add it to browser's db
        console.log(DB);
        const data = {
            reply,
            receivers,
            textContent,
            file
        }

        let id = await IDBPromise( openTrans(DB, offlineMsgsTable, 'readwrite') )
            .add(data);

        // TODO offload Queue , addUnsent

        addUnsent({...data, id:id})

        isOnline && offloadQueue();
            
        // remove reply
        removeReply();
        // remove image
        fileRef.current = undefined;
        // remove text
        inputRef.current.value = '';
        setUI({ ...UI, opts: false, ready: false });
        // scroll to bottom
    }

    function selectFile(value) {
        fileRef.current = value.files[0];
        setUI({ ...UI, opts: false, ready: true });
        previewFile(value.files[0]);
    }

    function updatedCanSend(){
        return Boolean (inputRef.current?.value?.trim?.() || fileRef.current );
    }

    function resize(e) {
        const { target } = e, { value } = target;

        // set rows to 1
        let cur = 1, threshold = 5;
        target.setAttribute("rows", cur);
        let size = target.clientHeight;

        // if too large but within allowed threshold, increase box size
        while (size < target.scrollHeight && cur < threshold) {
            target.setAttribute("rows", ++cur);

            size = target.clientHeight;
        }

        const readyToSend = updatedCanSend();
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

        <div className="abs br-1 flex opts close gap-2 even-space" ref={mainRef}>
            <Option label="Image" icon={faImage} accept="image/*" />
            <Option label="Audio" icon={faFileAudio} accept="audio/*" />
            <Option label="Video" icon={faFilm} accept="video/*" />
            <Option label="Other" icon={faFile} />
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
                <div>
                    <div className="abs-mid">
                        <FontAwesomeIcon icon={icon} />
                    </div>

                    <input className='hide' type='file' accept={accept} onInput={handleInput} />
                </div>
                <small>{label}</small>
            </label>
        )
    }
}


const PreviewFile = ({data, close}) => {
    let { type, name, size } = data;
    type = type.split('/')[0];

    const mainRef = useRef(null);
    const chatting = useContext(ChatContext).cur;
    const ext = name.split('.').slice(-1)[0];

    let jsx, src = URL.createObjectURL(data);

    useEffect(() => {
        let t_id = setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, []);

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
}




function getMessages(nowChatting) {
    let list = [];
    let unsent = [];
    let i = 0, uB = 50, uB2 = 10;


    return new promise(res => {

        openTrans(DB, msgsTable)
        .index("handle").openCursor(IDBKeyRange.only(nowChatting), "prev")
        .onsuccess = e => {
            let cur = e.target.result;

            if (cur && ((!viewMsg && i < uB) || (viewMsg && i < uB2))) {
                let id = cur.primaryKey;
                list.prepend(cur.value);

                (!viewMsg || id > viewMsg) && i++;
                cur.continue();

            } else {
                // show messages that have not yet been sent
                openTrans(DB, offlineMsgsTable)
                    .index("handle").openCursor(IDBKeyRange.only(nowChatting))
                    .onsuccess = e => {
                        let cur = e.target.result;

                        if (cur) {
                            let id = cur.primaryKey;
                            unsent.append({ ...cur.value, id:id });
                            cur.continue();

                        } else {
                            res ({
                                unsent: unsent,
                                data: list
                            })
                        }
                    }
            }
        }
    })
}


function loadMoreMessages(afterId, beforeId) {
    let range, i = 0, list = [];

    if (afterId){
        range = [IDBKeyRange.lowerBound( afterId, true )];

    } else if (beforeId) {
        range = [IDBKeyRange.upperBound(beforeId, true), "prev"];

    }

    // return a promise resolving the list or rejecting undefined
    return new Promise( (res, rej) => {
        !range && rej();

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
    })

}

let justSent = [];


const devMsgs = [
    {
        id: 3,
        time: 1725142641588,
        textContent: "Hello bruvver",
        action: "sent"
    },
    {
        id: 7,
        time: 1725142622810,
        textContent: "Hello bruvver",
        action: "received"
    },
    {
        id: 30,
        time: 1725142599711,
        textContent: "Hello bruvver",
        action: "sent",
    },
]