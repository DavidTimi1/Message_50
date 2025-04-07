
"use strict";
import './UserCard.css';

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatContext, StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconBtn, Button } from "../../../components/Button";
import { faEraser, faFlag, faMessage, faPencil, faPlusCircle, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { on, once, transitionEnd } from "../../../utils";
import { UserContext } from "../../../contexts";
import { useOnlineStatus } from '../../components/Hooks';
import { getUserDetails } from '../lib';

const placeholderImg = '/user-icon.svg'; 



export const UserCard = ({ show, args }) => {
    const [err, setError] = useState();
    
    const { pushState, removeState } = useContext( StateNavigatorContext );

    const navId = 'user-card';
    const ref = useRef(null), winRef = useRef(null), dragZone = useRef(null), contentRef = useRef(null), inMotion = useRef(false), Obj = useRef({ touchY: undefined, lastTop: 0, dir: "down" });
    const toggleOverlay = useContext(ToggleOverlay);


    // Close function with animation handling
    const close = useCallback(() => {
        // Trigger animation class
        if (winRef.current){
            ref.current.style.transform = '';
            winRef.current.classList.add("close");

        } else {
            setTimeout(handleTransitionEnd); 
        }

        // Wait for the transition/animation to complete
        once(transitionEnd, ref.current, handleTransitionEnd);

        function handleTransitionEnd() {
            toggleOverlay(navId, false);
        }
    }, [toggleOverlay, navId]);


    useEffect(() => {

        let t_id, ignore = false;

        if (show){

            t_id = setTimeout(() => {
                if (ignore) return

                pushState( navId, close ); // incase nav buttons are used
                winRef.current.classList.remove("close")
            }, 100)

        }

        return () => {
            t_id && clearTimeout(t_id);
            ignore = true;
        }

    }, [show, navId, pushState, close]);


    return (
        show &&
        <div id="user-card" className="max pop-up-window close"
            ref={winRef}
            onClick={handleCloseClick}
        >
            <div className='max'>
                <div className="pop-up-container flex-col abs fw" 
                    // onTouchStart={handleTouchStart}
                    // onTouchMove={handleTouchMove}
                    // onTouchEnd={handleTouchEnd}
                    ref={ref}
                >
                    <div className="fw">
                        <div ref={dragZone} onClick={handleCloseClick} style={{padding: "5px"}}>
                            <div className="notch mx-auto"></div>
                        </div>
                    </div>

                    <div className="custom-scroll grow fw" ref={contentRef} onClick={
                        e => e.stopPropagation()
                    }>
                        {
                            err?
                                <Retry note={err} retry={retry} />
                            :
                                <UserDetails navId={navId} closeModal={handleCloseClick} args={args} showError={setError} />
                        }
                    </div>
                </div>
            </div>
        </div>

    )

    function retry(){
        setError();
    }
    
    // when started touching
    function handleTouchStart(e){
        // prevent pop up translate while scrolling
        if (contentRef.current.scrollTop > 5) {
            inMotion.current = false;
            return
        }
        e.stopPropagation();
        e.preventDefault();

        inMotion.current = true;

        Obj.current.touchY = e.changedTouches[0].clientY;
        ref.current.classList.add("no-trans"); // avoid touch to action delay through transitions
    }

    // when moving
    function handleTouchMove(e){
        // prevent pop up translate while scrolling
        if (contentRef.current.scrollTop > 5) {
            inMotion.current = false;
            return
        }
        e.stopPropagation();
        e.preventDefault();

        if (!inMotion.current) return

        const pointerY = e.changedTouches[0].clientY;

        // cant move the popup above resting position
        let dist = pointerY - Obj.current.touchY;
        dist = dist < 0 ? 0 : dist;

        // get the last moved direction
        const decision = (dist > Obj.current.lastTop && dist > ref.current.clientHeight / 4);

        Obj.current.dir = decision ? "down" : "up";
        ref.current.style.transform = `translateY(${dist}px)`;
        Obj.current.lastTop = dist;
    }

    // when popup is closed
    function handleTouchEnd(e){
        ref.current.classList.remove("no-trans"); // to re-enable transitions
        e.stopPropagation();
        e.preventDefault();

        if (Obj.current.dir == "down") close()

            // hide popup
            // this.main.style.transform = "translateY(100%)";

            // once(transitionEnd, this.main, _ => that.win.style.display = "none");

            // // failsafe if transition end doesnt fire
            // setTimeout(_ => {
            //     if (that.win.style.display == "block") that.win.style.display = "none"
            // }, 500);

        else
            // just re-position
            ref.current.style.transform = '';
    }

    function handleCloseClick(){
        // go back in history to trigger close
        return new Promise( res => {
            once(transitionEnd, ref.current, () =>{
                res( removeState(navId) );
            });

            ref.current.style.transform = '';
            winRef.current.classList.add("close");
        })        
    }

}


const Retry = ({note, retry}) => {

    return (
        <div className="body fw flex-col gap-1">
            <div className="fw center-text" style={{color: "red"}}>
                <span> {note} </span>
            </div>
            <Button onClick={retry}>
                Retry
            </Button>
        </div>
    )
}


const UserDetails = ({args, closeModal, navId, showError}) => {
    const isOnline = useOnlineStatus();
    const [data, setData] = useState(args === true? useContext(UserContext) : undefined);

    useEffect(() => {
        if (data) return;

        getUserDetails(args.id, isOnline)
        .then( async res => {
            if (res.success){
                setTimeout( () => setData(res.data), 500 )
                
            } else
            showError(res.error)
        })
        .catch(_ => showError("An error occured"))

    }, [isOnline]);
    
    const {name, handle, username, dp, bio} = data || {};


    return (
        data ?
            <div className="body fw flex-col gap-4">
                <div className="mx-auto thmb">
                    <div className="img-dp" style={{width: "150px"}}>
                        <img src={dp ?? placeholderImg} alt='user profile picture' className="max" />
                    </div>
                    <div className="abs">
                        <div className="dp-img" style={{width: "20px", backgroundColor: "var(--btn-col)"}}>
                        </div>
                    </div>
                </div>

                <div className='flex-col mx-auto'>
                    <span className="fs-3 fw-800"> {name} </span>
                    <small> {args === true? username : handle} </small>
                </div>

                <Actions id={handle} navId={navId} closeModal={closeModal} />
                
                <div>
                    <small> Bio </small>
                    <div className="fs-5 fw-200">
                        { bio }
                    </div>
                </div>

                <div> <hr></hr> </div>
                
                <div className="flex-col gap-2 fs-5" style={{color: "red"}}>
                    <label className="flex mid-align gap-3">
                        <FontAwesomeIcon icon={faEraser} size="lg" />
                        <span> Clear Chats with {name} </span>
                    </label>
                    
                    <label className="flex mid-align gap-3 fs-5">
                        <FontAwesomeIcon icon={faFlag} size="lg" />
                        <span> Report {name} </span>
                    </label>
                </div>
            </div>
            :
            <LoadingDetails />
    )
}


const Actions = ({id, closeModal}) => {
    const openMessaging = useContext(ChatContext).set;
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <div className="flex mid-align even-space actn" style={{flexWrap: "wrap"}}>
            <button className="no-btn icon-btn" type="button" onClick={loadMessages}>
                <div className="btn-bg abs-mid fw"></div>
                <div className="flex-col mid-align">
                    <FontAwesomeIcon icon={faMessage} size="xl" />
                    <small>
                        Message
                    </small>
                </div>
            </button>
            <button className="no-btn icon-btn" type="button" onClick={editContact}>
                <div className="btn-bg abs-mid fw"></div>
                <div className="flex-col mid-align">
                    <FontAwesomeIcon icon={faPencil} size="xl" />
                    <small>
                        Edit
                    </small>
                </div>
            </button>
            
            <button className="no-btn icon-btn" type="button" onClick={saveContact}>
                <div className="btn-bg abs-mid fw"></div>
                <div className="flex-col mid-align">
                    <FontAwesomeIcon icon={faPlusCircle} size="xl" />
                    <small>
                        Save
                    </small>
                </div>
            </button>

            {/* Invite ?? */}
        </div>
    )

    function loadMessages(){
        closeModal()
        .then(done => {
            if (done){
                setTimeout(() => openMessaging(id), 100)
            }
        })           
        
    }

    function editContact(){
        closeModal()
        .then(done => {
            if (done)
                toggleOverlay('manage-contact', {NEW: false, id: id})
        })
    }

    function saveContact(){
        closeModal()
        .then(done => {
            if (done)
                toggleOverlay('manage-contact', {NEW: true, id: id})
        })           
    }
}


const LoadingDetails = () => (
    <div className="flex align-center gap-3" style={{justifyContent: "center"}}>
        <FontAwesomeIcon icon={faSpinner} size="xl" spin />
        <span>
            Loading ...
        </span>
    </div>
)
