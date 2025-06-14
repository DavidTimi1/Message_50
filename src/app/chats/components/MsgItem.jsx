import '../messaging.css';

import { useEffect, useState, useRef, useContext } from "react";

import { IconBtn } from "../../../components/Button";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { on, once, standardUnit, timePast } from "../../../utils";

import { faArrowDown, faArrowUp, faCheckDouble, faCircleArrowDown, faCirclePause, faCirclePlay, faClock, faEllipsisVertical, faFile, faShare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { dbName, getFile, getMsg, IDBPromise, updateMessage } from '../../../db';
import { ChatContext, SendMsgContext } from '../../contexts';
import StatusIcon from '../../components/status';
import { useFileDownload } from '../../media/components/Details';


export const MsgItem = (props) => {
    const { details, id, select, replyTo } = props;
    const { reply, file, textContent, sent, time, notSent, status } = details;

    const chatContext = useContext( ChatContext ), {cur} = chatContext; 
    const highlightMe = chatContext.id === id, unRequest = () => chatContext.set(cur);

    const itemRef = useRef(null), msgElem = useRef(null);


    useEffect(() => {
        if (highlightMe){
            once("animationend", unRequest);
            msgElem.current.scrollIntoView({ behaviour: "smooth", inline: "start" });
            
            msgElem.current.classList.add("requested"); // glow

        } else {
            msgElem.current.classList.remove("requested");
        }

    }, [highlightMe]);


    return (
        <div data-id={id} className={`msgcont ${ sent || notSent ? "s-cont" : "r-cont"} fw ${select.cur ? 'selected' : ''}`} onTouchStart={handleTouchStart} ref={msgElem}>
            <div className="flex-col fw">
                <div className="msg-item" ref={itemRef}>
                    {reply && <MsgLink id={reply} chatting={cur}></MsgLink>}
                    {file && <MsgAttachment msgId={id} fileInfo={file} loadType={sent? 'up':'down'} />}

                    <div style={{ lineHeight: "20px", padding: "1px 5px" }}>
                        <div className="text" style={{whiteSpace: "pre-wrap"}}> {textContent} </div>
                    </div>

                    <div className="abs instr">
                        <IconBtn icon={faShare} className="reply" onClick={replyThis} />
                    </div>
                </div>

                <small className="timestamp br-1 flex mid-align gap-2">
                    {
                        notSent ? <FontAwesomeIcon icon={faClock} />
                        :
                        <>
                        { sent && <StatusIcon statusChar={status} /> }
                        <TimePast time={time} />
                        </>
                    }

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

            if (disp.x > 100 && !vibrated) {
                navigator.vibrate(50);
                vibrated = true;
            }

            msgItem.style.transform = `translateX(${cur.x - touch.x}px)`;
        }


        let endMsgTouch = e => {
            msgItem.classList.remove("no-trans");

            let displacement = Math.abs(e.changedTouches[0].clientX - touch.x);
            if (displacement > 100) replyThis();

            msgItem.style.transform = "translateX(0px)";
            document.removeEventListener('touchmove', moveMsg);
            document.removeEventListener('touchend', endMsgTouch);
        }

        on('touchmove', document, moveMsg, { passive: true })
        once('touchend', document, endMsgTouch)

    }

    function replyThis(){
        replyTo(id)
    }
}


function MsgLink({ chatting, id }) {
    const [status, setStatus] = useState(false);
    const { cur, set } = useContext( ChatContext );

    useEffect(() => {
        if (!id) return

        getMsg(id)
            .then(msg => {
                // if it is continue else remove
                if (msg) {
                    // TODO check if name is saved
                    let person = msg.sent? "You" : msg.person;

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
                    <div className="no-btn fw" style={{ overflow: "hidden" }} onClick={showMsg}>
                        <small className="fw flex-col msg-reply">
                            <div className="crop-excess" style={{ color: "var(--btn-col)" }}>
                                {status.name}
                            </div>
                            <div className="crop-excess" style={{ color: "var(--grey)" }}>
                                {status.text}
                            </div>
                        </small>
                    </div>
                    :
                    <></>
            }
        </>
    )

    function showMsg(){
        set(cur, id);
    }
}


function MsgAttachment({msgId, fileInfo, loadType, status }) {
    const [{fileId, src, metadata, key}, setFileInfo] = useState(fileInfo);
    const uuid = loadType + 'load_' + msgId;  // id for tracking updates
    const fileDownloader = useFileDownload();

    const [file, setFile] = useState();

    const {loadStatus} = useContext(SendMsgContext);
    const statusMsg = loadStatus.find(msg => msg.id === uuid);
    const loadProgress = statusMsg?.status //status of each file

    const {name, size, ext, type, duration, localUrl} = file || metadata || {} ;

    useEffect(() => {
        const loadProgress = statusMsg?.status;

        if (loadProgress === undefined) return

        if (loadProgress === true && loadType === "down"){
            // update file info
            statusMsg.args && setFileInfo({...fileInfo, ...statusMsg.args})
            updateMessage(msgId, 'file', statusMsg.args)
        }

    }, [statusMsg]);


    useEffect(() => {
        if (!fileId) return

        getFile(fileId)
        .then(res => {
            if (res?.data){
                setFile({
                    type: res.type,
                    name: res.data.name, 
                    size: res.data.size, 
                    ext: res.data.ext ?? res.data.name.split('.').pop(),
                    localUrl: URL.createObjectURL(res.data)
                })
            } else {
                setFile(false)
            }
        })

    }, [fileId])


    let Frag;
    switch (type) {
        case 'image': {
            Frag =
                localUrl?
                <div className="img-cont max">
                    <img src={localUrl} alt="" />
                    <div className="dropdown">
                        <button className="no-btn" data-bs-toggle="dropdown" aria-expanded="false">
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>

                        <ul className="dropdown-menu">
                            <li><a href={localUrl} className="dropdown-item" download={name} >Save to device</a></li>
                        </ul>
                    </div>
                </div>
                :
                <div className="img-cont max">
                    <img className="timg fw" style={{aspectRatio: "1/1", backgroundColor: "grey"}} alt="" />
                    <LoadVeil size={size} loadProgress={loadProgress} loadType={loadType} handleClick={handleIconClick} />
                </div>
            break;
        }
        case 'audio': {
            Frag =
            <div className="audio-cont flex-col">
                <div className="fw flex mid-align">
                    {
                        localUrl ?
                            <audio src={localUrl} controls className="audio-player fw" />
                            :
                            <button className="no-btn">
                                {
                                    loadProgress === undefined ?
                                    <FontAwesomeIcon icon={faArrowDown} size="xl" className="down-icon" aria-label="Click to download audio" />
                                    :
                                    <div className="fw">
                                        <svg height="40px" width="40px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                                            <circle cx="20px" cy="20px" r="17px" fill="none" stroke="white" strokeWidth="3px" strokeLinecap="round"></circle>
                                        </svg>
                                        <FontAwesomeIcon icon={faXmark} size="xl" className="down-icon" aria-label="Click to download audio" />
                                    </div>
                                }
                            </button>
                    }
                </div>
                <div>
                    <small className="aud-dets">
                        <span className="audio-duration"> {ext} </span>
                        <span>•</span>
                        <span className="audio-size"> { standardUnit('data', size) } </span>
                    </small>
                </div>
            </div>
            break;
        }
        case 'video': {
            Frag =
            <div className="vid-cont max">
                {
                    localUrl ?
                    <>
                    <video src={localUrl}></video>
                    <FontAwesomeIcon icon={faCirclePlay} className='abs-mid' size="2xl" />

                    <div className="dropdown">
                        <button  className="no-btn abs-mid" data-bs-toggle="dropdown" aria-expanded="false">
                            <FontAwesomeIcon icon={faEllipsisVertical} size="2xl" />
                        </button>

                        <ul className="dropdown-menu">
                            <li><a href={localUrl} className="dropdown-item" download={name} >Save to device</a></li>
                        </ul>
                    </div>
                    </>
                    :
                    <>
                        <img className="timg fw" style={{aspectRatio: "1/1", backgroundColor: "grey"}} alt="" />
                        <LoadVeil size={size} loadProgress={loadProgress} loadType={loadType}  handleClick={handleIconClick} />
                    </>
                }
            </div>
            break;
        }

        default: {
            Frag =
                <div className="file-cont flex mid-align fw" style={{ padding: "10px" }}>
                    {
                        localUrl ?
                            <>
                                <div className="icon">
                                    <div aria-hidden="true">
                                        <FontAwesomeIcon icon={faFile} />
                                    </div>
                                </div>
                                <div className="flex-col fw" style={{ margin: "0 10px" }}>
                                    <div className="crop-excess2" style={{ lineHeight: "20px", maxHeight: "41px" }}>
                                        {name}
                                    </div>
                                    <div className="fw">
                                        <small className="meta">
                                            <span> { standardUnit('data', size) } </span>
                                            <span> • </span>
                                            <span> {ext} </span>
                                        </small>
                                    </div>
                                </div>
                                <div className="dropdown abs">
                                    <button className="no-btn" data-bs-toggle="dropdown" aria-expanded="false">
                                        <FontAwesomeIcon icon={faEllipsisVertical} size="xl" />
                                    </button>

                                    <ul className="dropdown-menu">
                                        <li><a href={localUrl} className="dropdown-item" download={name} >Save to device</a></li>
                                    </ul>
                                </div>
                            </>
                            :
                            <>
                                <div className="icon">
                                    {
                                        loadProgress === undefined ?
                                            <button className="no-btn" aria-label="Click to download file">
                                                <FontAwesomeIcon icon={faArrowDown} />
                                            </button>
                                            :
                                            <div>
                                                <svg height="40px" width="40px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                                                    <circle cx="20px" cy="20px" r="17px" fill="none" stroke="white" strokeWidth="3px" strokeLinecap="round"></circle>
                                                </svg>

                                                <button  className="no-btn mid-align" aria-label="Click to download file">
                                                    <FontAwesomeIcon icon={faXmark} className='down-icon' />
                                                </button>
                                            </div>
                                    }
                                </div>
                                <div className="flex-col">
                                    <div>{name}</div>
                                    <div className="fw">
                                        <small className="meta">
                                            <span>{ standardUnit('data', size) }</span>
                                            <span>•</span>
                                            <span>{ext}</span>
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
            {
                !localUrl && !src?
                <div className='fw' style={{aspectRatio: "1/1", backgroundColor: "grey"}}></div>
                :
                Frag
            }
        </div>
    )

    function handleIconClick(){
        if (loadType === "down"){
            fileDownloader.download(src, key, uuid)
        }
    }
}


function TimePast({ time }) {
    const [value, setValue] = useState(timePast(time));

    setTimeout(() => setValue(timePast(time)), 60000);

    return (
        <>{value}</>
    )

}

function LoadVeil({ loadType, size, loadProgress, handleClick }) {
    const progressRef = useRef();
    const circumference = 2 * Math.PI * 17;

    useEffect(() => {
        if (progressRef.current && loadProgress !== undefined) {
            const offset = circumference - loadProgress * circumference;
            progressRef.current.style.strokeDashoffset = offset;
        }
    }, [loadProgress]);


    return (
        <div className="veil max flex mid-align" style={{justifyContent: "center"}}>
            <div className="">
                {
                loadProgress !== undefined ?

                    <div>
                        <svg height="40px" width="40px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                            <circle cx="20px" cy="20px" ref={progressRef} r="17px" fill="none" stroke="white" 
                                strokeWidth="3px" strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.3s ease" }}
                                strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference}
                            ></circle>
                        </svg>

                        <div className='abs-mid ds' aria-label="Click to download file">
                            <IconBtn icon={faXmark} size="xl" />
                        </div>
                    </div>
                    :

                    <label> {/* To capture clicks on the label too */}
                        <IconBtn onClick={handleClick} icon={loadType == 'up'? faArrowUp : faArrowDown} size="xl" />
                        <span> {standardUnit('data', size)} </span>

                    </label>
                }
            </div>
        </div>
    )
}

