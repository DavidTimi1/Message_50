import './UserCard.css';

import { useContext, useEffect, useRef } from "react";
import { ToggleOverlay } from "../../contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconBtn } from "../../components/Button";
import { faEraser, faFlag, faMessage, faPencil, faPlusCircle, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../buttons";
import { once, transitionEnd } from "../../../utils";
import { UserContext } from "../../../contexts";



export const UserCard = ({ show, args }) => {
    const ref = useRef(null), winRef = useRef(null), dragZone = useRef(null), contentRef = useRef(null), inMotion = useRef(false), Obj = useRef({ touchY: undefined, lastTop: 0, dir: "down" });
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        let t_id = show && setTimeout(() => winRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [show])


    return (
        show &&
        <div id="user-card" className="max pop-up-window close"
            ref={winRef}
            onClick={close}
        >
            <div className='max'>
                <div className="pop-up-container flex-col abs fw" 
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    ref={ref}
                >
                    <div className="fw">
                        <div ref={dragZone} onClick={close} style={{padding: "5px"}}>
                            <div className="notch mx-auto"></div>
                        </div>
                    </div>

                    <div className="custom-scroll grow fw" ref={contentRef} onClick={
                        e => e.stopPropagation()
                    }>
                        {/* <div className="x flex">
                            <IconBtn icon={faXmark} onClick={close}>
                                <span className="sr-only"> Close </span>
                            </IconBtn>
                        </div> */}
                        <Retry />
                        <UserDetails />
                    </div>
                </div>
            </div>
        </div>

    )

    
    // when started touching
    function handleTouchStart(e){
        // prevent pop up translate while scrolling
        if (contentRef.current.scrollTop > 5) {
            inMotion.current = false;
            return
        }

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

    function close() {
        once(transitionEnd, ref.current, () => {
            toggleOverlay('user-card', false)
        });

        ref.current.style.transform = '';
        winRef.current.classList.add("close");
    }
}


const Retry = ({note}) => {

    return (
        <div className="body">
            <div className="alert alert-danger">
                <span> {note} </span>
                <Button>
                    Retry
                </Button>
            </div>
        </div>
    )
}


const UserDetails = () => {
    const devData = useContext(UserContext);
    const {name, handle, dp, about} = devData;

    return (
        <div className="body fw flex-col gap-4">
            <div className="mx-auto thmb">
                <div className="img-dp" style={{width: "150px"}}>
                    <img src={dp} alt='user profile picture' className="max" />
                </div>
                <div className="abs">
                    <div className="dp-img" style={{width: "20px", backgroundColor: "var(--btn-col)"}}>
                    </div>
                </div>
            </div>

            <div className='flex-col mx-auto'>
                <span className="fs-3 fw-800"> {name} </span>
                <small> {handle} </small>
            </div>

            <Actions />
            
            <div>
                <small> About </small>
                <div className="fs-5 fw-200">
                    { about }
                </div>
            </div>

            <div> <hr></hr> </div>
            
            <div className="flex-col gap-2" color="red">
                <label className="flex mid-align gap-3">
                    <FontAwesomeIcon icon={faEraser} />
                    <span> Clear Chats with {name} </span>
                </label>
                
                <label className="flex mid-align gap-3">
                    <FontAwesomeIcon icon={faFlag} />
                    <span> Clear Chats with {name} </span>
                </label>
            </div>
        </div>
    )
}


const Actions = () => {

    return (
        <div className="flex mid-align even-space" style={{flexWrap: "wrap"}}>
            <label className="flex-col mid-align">
                <IconBtn icon={faMessage} />
                <small>
                    Message
                </small>
            </label>
            
            <label className="flex-col mid-align">
                <IconBtn icon={faPencil} />
                <small>
                    Edit
                </small>
            </label>
            
            <label className="flex-col mid-align">
                <IconBtn icon={faPlusCircle} />
                <small>
                    Save
                </small>
            </label>

            {/* Invite ?? */}
        </div>
    )
}


// const getUserDetails = async (id, handle) => {
//     let error, details, csvd = false, done = false;

//     if (isOnline() && handle) {
//         let req = await fetch("/users/" + handle + "?details")
//         details = req.status < 400 ? await req.json() : { error: titleCase(req.statusText) }
//         done = true
//     }
//     if (id) {
//         let res = await IDBPromise(openTrans(db, "people_tb").get(id))
//         if (res) {
//             csvd = true;
//             if (!details) {

//             }
//             done = true
//         }
//     }
//     if (!done) {
//         details = { error: "Not Found" }
//     }

//     return {
//         saved: csvd,
//         ...details
//     }
// }