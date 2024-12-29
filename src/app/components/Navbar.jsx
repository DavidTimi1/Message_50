import { useContext, useEffect, useRef } from "react";

import { UserContext } from "../../contexts";
import { StateNavigatorContext, ToggleOverlay } from "../contexts";

import { changeTheme } from '../../theme.js';
import { once, transitionEnd } from "../../utils";
import { faBell, faBoltLightning, faComments, faFolder, faGears, faMessage, faMoon, faSun, faUsers, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate } from "react-router-dom";
import { IconBtn } from "./Button";


export function NavBar({ open }) {
    const User = useContext(UserContext);
    const mainRef = useRef(null), navId = "navbar";
    const toggleOverlay = useContext(ToggleOverlay);

    const navigate = useNavigate();
    
    const { pushState, removeState } = useContext( StateNavigatorContext );

    useEffect(() => {
        let t_id, ignore = false;
        
        if (open){

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
    }, [open])

    return (
        open &&
        <aside className="side-wrapper mega-max close" ref={mainRef} onClick={handleCloseClick}>
            <div className="side-bar fw" onClick={ e => e.stopPropagation()}>
                <div className="content custom-scroll max">
                    <div className='flex-col max' style={{ overflow: "hidden auto" }}>
                        <div className="fw">
                            <button className="no-btn flex mid-align fw" style={{ justifyContent: "center" }} onClick={viewMyProfile}>
                                <div className='dp-img' style={{backgroundImage: `url(${User.dp})`}}>
                                </div>
                                <div> Hi, {User.name} </div>
                            </button>
                        </div>
                        <div className="fw">
                            <hr></hr>
                        </div>
                        <NavItem closeNavbar={close} href="/app" icon={faMessage}>
                            Chats
                        </NavItem>
                        <NavItem closeNavbar={close} href="/app/contacts" icon={faUsers}>
                            Contacts
                        </NavItem>
                        <NavItem closeNavbar={close} href="/app/media" icon={faFolder}>
                            Storage & Media
                        </NavItem>
                        {/* <NavItem closeNavbar={close} href="/app/notifications" icon={faBell}>
                            Notifications
                        </NavItem> */}
                        <NavItem closeNavbar={close} href="/app/settings" icon={faGears}>
                            Settings
                        </NavItem>
                        <div style={{marginTop: "auto"}}>
                            <button className="no-btn nav-link fw" onClick={openFeedback}>
                                <div className="flex fw mid-align gap-2">
                                    <FontAwesomeIcon icon={faComments} />
                                    <span>Feedback</span>
                                </div>
                            </button>
                            <div className="fw">
                                <div className='flex fw mid-align even-space' style={{ flexWrap: "wrap" }}>
                                    <IconBtn icon={faBoltLightning} onClick={handleCloseClick}>
                                        Upgrade to plus
                                    </IconBtn>

                                    <label onClick={ e => {
                                        e.stopPropagation();
                                        changeTheme();
                                    }}>
                                        <div className="sun">
                                            <IconBtn icon={faSun}>
                                                Switch to dark theme
                                            </IconBtn>
                                        </div>
                                        <div className="moon">
                                            <IconBtn icon={faMoon}>
                                                Switch to light theme
                                            </IconBtn>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='abs' style={{ right: "10px", top: "10px" }}>
                    <IconBtn icon={faXmark} onClick={handleCloseClick}>
                        Close
                    </IconBtn>
                </div>
            </div>
        </aside>
    )

    function viewMyProfile(){
        close();
        navigate('/app/settings', {state: 'edit-profile'});
    }

    function openFeedback() {
        toggleOverlay("feedback", true)
    }

    function handleCloseClick(){
        removeState(navId);
    }

    function close() {
        if (mainRef.current){
            once(transitionEnd, mainRef.current, () => toggleOverlay("navbar", false));
            mainRef.current.classList.add("close");
        }
    }

}


function NavItem({ children, href, icon, closeNavbar }) {

    return (
        <NavLink className="nav-link" to={href} onClick={handleClick}>
            <div className="flex mid-align gap-2 fw">
                <FontAwesomeIcon icon={icon} />
                <span>
                    {children}
                </span>
            </div>
        </NavLink>
    )

    function handleClick(e){
        closeNavbar();
    }
}