
import React, { useEffect, useState, useContext, useRef } from "react";

import { ChatContext } from '../../contexts';
import { IconBtn } from "../../../components/Button";

import { transitionEnd, runOnComplete } from "../../../utils";
import { IDBPromise, openTrans, getMsg, offlineMsgsTable, loadDB, saveFile } from '../../../db';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFileAudio, faFilm, faImage, faMicrophone, faPaperPlane, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';

import { useOfflineActivities } from '../../components/Offline';
import { useContactName, useOnlineStatus } from '../../components/Hooks';

import { MsgListContext } from "../contexts";
import { newMsgEvent } from "../../components/Sockets";
import { ALLOWED_MEDIA_TYPES } from "../../media/page";



export const Footer = ({previewFile}) => {

    const { reply, replyTo} = useContext( MsgListContext );

    const [UI, setUI] = useState({});
    const fileRef = useRef(null), inputRef = useRef(null), optsToggleRef = useRef(null);
    const showOpts = UI.opts, canSend = UI.ready;

    const chatting = useContext(ChatContext).cur;
    const isOnline = useOnlineStatus();
    const offloadQueue = useOfflineActivities().sendMsg;


    return (
        <div className="msgg-bottom fw mx-auto">
            <div className="fw">
                <UploadOptions open={showOpts} selectFile={selectFile} />

                <div className="form flex fw gap-2" style={{ alignItems: "last baseline", justifyContent: "space-around" }}>
                    <div ref={optsToggleRef} className="xmark plus">
                        <IconBtn icon={faXmark} onClick={toggleOpts}>
                            Add attachment
                        </IconBtn>
                    </div>
                    <div className="grow flex-col br-1 contain">
                        <div className="ref">
                            <FooterReply id={reply} remove={removeReply} />
                        </div>

                        <label className='nv-input br-1'>
                            <textarea
                                className='fw' rows="1" placeholder="Type a message..." id="msg-field"
                                autoCorrect="on"
                                ref={inputRef}
                                onInput={resize}
                            ></textarea>
                        </label>
                    </div>
                    <div className="acticon">
                        {canSend ?
                            <IconBtn type="submit" icon={faPaperPlane} onClick={queueToSend} />
                            :
                            // <label onContextMenu={recordVN}>
                            //     <IconBtn icon={faMicrophone} />
                            // </label>
                            <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )


    function toggleOpts() {
        const parent = optsToggleRef.current;

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

    async function queueToSend() {
        let receivers, file, textContent;

        receivers = chatting instanceof Array? chatting : [chatting];
        textContent = inputRef.current.value.trim();    
        file = fileRef.current;
    
        // if user tries to send a message add it to browser's db
        const data = {
            handle: receivers[0],
            reply,
            receivers,
            textContent
        }

        let fileObj;

        let id = await loadDB()
                .then(async  DB => {

                    if (file){
                        let type = file.type.split("/")[0];
                        type = ALLOWED_MEDIA_TYPES.includes(type) ? type : "other"
                        
                        const fileId = await saveFile(file)

                        fileObj = {fileId, metadata: {type, size: file.size, name: file.name}};
                    }
                        
                    return IDBPromise( openTrans(DB, offlineMsgsTable, 'readwrite').add({...data, rawFile: file, file: fileObj}) ) 
                    
            })

        dispatchEvent( new CustomEvent(newMsgEvent, {detail: {
            ...data, id, file: fileObj , notSent: true, time: new Date().getTime()
        }}) )

        isOnline && offloadQueue();
        resetUI();
    }

    function resetUI(){
        const parentToggler = optsToggleRef.current;
        const msgList = document.getElementsByClassName('msglist')[0];
        
        removeReply(); // remove reply

        fileRef.current = null;
        previewFile();
        parentToggler.classList.add("plus")

        inputRef.current.value = ''; // remove text
        setUI({ ...UI, opts: false, ready: false }); 
        msgList.scrollTop = msgList.scrollHeight;   // scroll to bottom
    }

    function selectFile(value) {
        const file = value.files[0];
        file.localSrc = URL.createObjectURL(value.files[0]);
        fileRef.current = file;
        setUI({ ...UI, opts: false, ready: true });
        previewFile(file);
    }

    function updatedCanSend(){
        return Boolean (inputRef.current?.value?.trim?.() || fileRef.current );
    }

    function removeReply(){
        replyTo();
    }

    function resize(e) {
        const { target } = e;

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


const UploadOptions = ({ open, selectFile }) => {
    const mainRef = useRef(null);
    const [opened, setOpen] = useState(open);


    useEffect(() => {
        let t_id;

        if (Boolean(open) !== Boolean(opened)) {
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


const FooterReply = ({id, remove}) => {
    const [msgData, setMsgData] = useState();

    const ref = useRef(null);

    const chatContext = useContext( ChatContext ), setChatting = chatContext.set, chatting = chatContext.cur;

    const {handle, textContent} = msgData ?? {};
    const name = useContactName(handle) || 'You';


    useEffect(() => {
        if (id){
            getMsg(id)
            .then( msg => {
                if (msg){
                    msg.handle = msg.sent? '' :  msg.handle;
                    setMsgData(msg);
                    return
                }

                remove();
            })
        } else setMsgData()


    }, [id])
    

    return (
        msgData &&

        <div className="max" ref={ref}>
            <div className="abs" style={{ right: 0, top: 0 }}>
                <IconBtn icon={faXmark} size="sm" onClick={remove} />
            </div>

            {
                msgData?
                    <div className="fw" style={{ overflow: "hidden" }} onClick={showMsg}>
                        
                        <small className="fw flex-col msg-reply">
                            <div className="crop-excess" style={{ color: "var(--btn-col)" }}>
                                {name}
                            </div>
                            <div className="crop-excess" style={{ color: "var(--grey)" }}>
                                {textContent.slice(0, 50)}
                            </div>
                        </small>
                    </div>
                :
                    <span className="mx-auto">
                        <FontAwesomeIcon icon={faSpinner} size="sm" spin />
                    </span>

            }

        </div>
    )

    function showMsg(){
        setChatting(chatting, id);
    }
}

