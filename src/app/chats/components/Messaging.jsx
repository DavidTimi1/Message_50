import wallpaper from '../assets/Nagi_8.jpg';
import styles from '../page.module.css';

import React, { useEffect, useState, useContext, useRef } from "react";

import { ChatContext } from '../../contexts';
import { IconBtn } from "../../components/Button";

import { on, once, title, transitionEnd, runOnComplete, standardUnit, int } from "../../../utils";
import { IDBPromise, openTrans, DB } from '../../../db';
import { DevMode } from '../../../App';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faCircleInfo, faCopy, faFile, faFileAudio, faFilm, faImage, faMicrophone, faPaperPlane, faShare, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

import { MsgItem } from './MsgItem';



export default function MsgInterface({ viewMsg }) {
    const [state, setState] = useState({});
    const [reply, setReply] = useState();
    const [preview, setPrev] = useState({});

    const mainRef = useRef(null);
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;

    const select = state?.selected;


    useEffect(() => {
        let t_id = chatting && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }

    }, [chatting]);


    return (
        chatting &&
        <div id="messaging" className={`interface close trans-right ${styles.msging}`} ref={mainRef} >
            <div className="max flex-col">
                <Heading
                    clearSelection={clearSelection}
                    closeMsging={close}
                    selected={select}
                />

                <div className="fw grow flex-col">
                    <div className='abs max'>
                    </div>
                    { chatting &&
                        <MsgList
                            replyTo={replyTo}
                            toggleSelect={toggleSelection}
                            selected={select ?? []}
                            viewMsg={viewMsg}
                        />
                    }

                    <div className='fw'>
                        { preview.on && <PreviewFile data={preview.data} close={() => previewFile()} /> }
                        <Footer reply={reply} previewFile={previewFile} />
                    </div>
                </div>

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
        if (!id) return 

        id = int(id);
        let curSelection = select ?? [];
        curSelection.length === 0 && navigator.vibrate(100);

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

    function close() {
        once(transitionEnd, mainRef.current, () => {
            chatContext.set(false);
            setReply();
            setState({});
        });

        mainRef.current.classList.add("close");
    }

}


const Heading = ({selected, clearSelection, closeMsging}) => {
    const chatContext = useContext(ChatContext), chatting = chatContext.cur;
    const selecting = selected?.length, online = true; // options = state.opts

    return (
        <div className={`${styles.heading}`}>
            <div className={selecting && "disappear"}>
                <div className="fw flex mid-align gap-2 flex">
                    <IconBtn icon={faAngleLeft} onClick={closeMsging}>
                        Back
                    </IconBtn>
                    <div className="flex-col fw mid-align grow gap-1" style={{ justifyContent: "center" }}>
                        <div className="dp-img" style={{width: "40px"}}>
                        </div>

                        <div className="flex gap-2" style={{ justifyContent: "space-between" }}>
                            <div className="fs-3 fw-800"> {chatting && title(chatting)} </div>
                            <small style={{ color: online ? "green" : "grey" }}> 
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
        <div className={`${styles.content} msglist fw grow custom-scroll`} 
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            ref={listElem}
        >
            {
                msgList.map(msg => {
                    let select = selected.includes(msg.id);
                    console.log(select, msg.id, selected);

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


function Footer({previewFile}) {
    const [UI, setUI] = useState({});
    const fileRef = useRef(null), inputRef = useRef(null);
    const showOpts = UI.opts, canSend = UI.ready;

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

    function queueToSend() {

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