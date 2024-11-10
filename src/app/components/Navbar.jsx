import { useContext, useEffect, useRef } from "react";

import { UserContext } from "../../contexts";
import { ToggleOverlay } from "../contexts";

import { changeTheme } from '../../theme';
import { once, transitionEnd } from "../../utils";
import { faBell, faBoltLightning, faComments, faFolder, faGears, faMessage, faMoon, faSun, faUsers, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";


export function NavBar({ open }) {
    const User = useContext(UserContext);
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        let t_id =  open && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [open])

    return (
        open &&
        <aside className="side-wrapper mega-max close" ref={mainRef} onClick={close}>
            <div className="side-bar fw">
                <div className="content custom-scroll max">
                    <div className='flex-col fw' style={{ overflow: "hidden auto" }}>
                        <div className="fw">
                            <button className="no-btn flex mid-align fw" style={{ justifyContent: "center" }}>
                                <div className='dp-img'>
                                </div>
                                <div> Hi, {User.name} </div>
                            </button>
                        </div>
                        <div className="fw">
                            <hr></hr>
                        </div>
                        <NavItem href="/app" icon={faMessage}>
                            Chats
                        </NavItem>
                        <NavItem href="/app/contacts" icon={faUsers}>
                            Contacts
                        </NavItem>
                        <NavItem href="/app/media" icon={faFolder}>
                            Storage & Media
                        </NavItem>
                        <NavItem href="/app/notifications" icon={faBell}>
                            Notifications
                        </NavItem>
                        <NavItem href="/app/settings" icon={faGears}>
                            Settings
                        </NavItem>
                    </div>
                    <div>
                        <footer className="small text-center text-muted">
                            <div className='flex-col mid-align fw'>
                                {/* Button for comments */}
                                <button className="no-btn fw" onClick={openFeedback}>
                                    <div className="flex fw">
                                        <FontAwesomeIcon icon={faComments} size="lg" />
                                        <div className="grow">Feedback</div>
                                    </div>
                                </button>

                                {/* More actions at navbar */}
                                <div className='flex fw mid-align even-space' style={{flexWrap: "wrap"}}>
                                    <button>
                                        <FontAwesomeIcon icon={faBoltLightning} size="lg" />
                                        <span className="sr-only">
                                            Upgrade to plus
                                        </span>
                                    </button>
                                    
                                    <button onClick={changeTheme}>
                                        <FontAwesomeIcon icon={faSun} className="sun" size="lg" />
                                        <FontAwesomeIcon icon={faMoon} className="moon" size="lg" />
                                        <span className="sr-only">
                                            Switch theme
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
                <div className='abs' style={{ right: "10px", top: "10px" }}>
                    <button onClick={close}>
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                        <span className="sr-only"> Close </span>
                    </button>
                </div>
            </div>
        </aside>
    )


    function close() {
        once(transitionEnd, mainRef.current, () => toggleOverlay("navbar", false));
        mainRef.current.classList.add("close");
    }

    function openFeedback(){
        toggleOverlay("feedback", true)
    }
}


function NavItem({ children, href, icon }) {

    return (
        <NavLink className="nav-link" to={href}>
            <div className="flex mid-align gap-2 fw">
                <FontAwesomeIcon icon={icon} />
                <span>
                    {children}
                </span>
            </div>
        </NavLink>
    )
}