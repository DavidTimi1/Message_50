import { useContext, useEffect, useRef } from "react";

import { UserContext } from "../../contexts";
import { StateNavigatorContext, ToggleOverlay } from "../contexts";

import { changeTheme } from '../../theme.js';
import { once, transitionEnd } from "../../utils";
import { faBell, faBoltLightning, faComments, faFolder, faGears, faMessage, faMoon, faStar, faSun, faUsers, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { IconBtn } from "../../components/Button.jsx";
import { UserProfilePic } from "../contacts/components/ContactItem.jsx";


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
                                
                                <UserProfilePic dp={User.dp} handle={User.username} />
                                
                                <div> Hi, {User.username} </div>
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
                                    <IconBtn icon={faBoltLightning} onClick={() => alert("Plus✨ not available in your region")}>
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

                                    <Link to="https://github.com/DavidTimi1" className="no-link" target="_blank" rel="noopener noreferrer">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            fill="white"
                                            aria-label="GitHub"
                                        >
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.997.108-.774.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.403c1.02.005 2.045.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.823 1.102.823 2.222v3.293c0 .32.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                    </Link>

                                    <Link to="https://github.com/DavidTimi1/Msg50-BE" className="no-link" style={{color: "white"}} target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faStar} />
                                    </Link>

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