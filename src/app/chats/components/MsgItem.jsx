import '../messaging.css';

import { useEffect, useState, useRef, useContext } from "react";

import { IconBtn } from "../../../components/Button";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { on, once, timePast } from "../../../utils";

import { faArrowDown, faCheckDouble, faCircleArrowDown, faCirclePause, faCirclePlay, faClock, faEllipsisVertical, faFile, faShare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getMsg } from '../../../db';
import { ChatContext } from '../../contexts';
import StatusIcon from '../../components/status';


export const MsgItem = (props) => {
    const { details, id, select, replyTo } = props;
    const { reply, file, textContent, sent, time, notSent, status } = details;

    const chatContext = useContext( ChatContext ), {cur} = chatContext; 
    const highlightMe = chatContext.id === id, unRequest = () => chatContext.set(cur);

    const itemRef = useRef(null), msgElem = useRef(null);
    select.cur && console.log(select)


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
            <div className="flex-col fw gap-1">
                <div className="msg-item" ref={itemRef}>
                    {reply && <MsgLink id={reply} chatting={cur}></MsgLink>}
                    {file && <MsgAttachment />}

                    <div style={{ lineHeight: "20px", padding: "1px 5px" }}>
                        <div className="text"> {textContent} </div>
                    </div>

                    <div className="abs instr">
                        <IconBtn icon={faShare} className="reply" onClick={replyThis} />
                    </div>
                </div>

                <small className="timestamp br-1 flex mid-align gap-2">
                    {
                        notSent ? <FontAwesomeIcon icon={faClock} />
                        :
                        sent && <StatusIcon statusChar={status} />
                    }

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
                                                <FontAwesomeIcon icon={faArrowDown} className='down-icon' />
                                            </button>
                                            :
                                            <div>
                                                <svg height="50px" width="50px" style={{ backgroundColor: "grey", clipPath: "circle()", rotate: "-90deg" }}>
                                                    <circle cx="25px" cy="25px" r="20px" fill="none" stroke="green" stroke-width="7px" stroke-linecap="round"></circle>
                                                </svg>

                                                <button className='abs-mid' aria-label="Click to download file">
                                                    <FontAwesomeIcon icon={faXmark} className='down-icon' />
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


function TimePast({ time }) {
    const [value, setValue] = useState(timePast(time));

    setTimeout(() => setValue(timePast(time)), 60000);

    return (
        <>{value}</>
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
                            <FontAwesomeIcon icon={faXmark} className='down-icon' />
                        </button>
                    </div>
                    :
                    <button aria-label="Click to download file">
                        <FontAwesomeIcon icon={faArrowDown} className='down-icon' />
                    </button>
            }
        </div>
    </div>
}