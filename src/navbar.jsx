import { useContext, useEffect, useRef } from "react";

import { ToggleOverlay, UserContext } from "./contexts";
import { Button, IconBut } from './buttons';
import { getTheme } from './theme';
import ProfilePic from './contacts';
import { once, transitionEnd } from "./ui/helpers";


export function NavBar({ open }) {
    const User = useContext(UserContext);
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() => {
        let t_id;
        if (open) {
            t_id = setTimeout(() => mainRef.current.classList.remove("close"));
        }

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
                                    <ProfilePic />
                                </div>
                                <div> Hi, {User.name} </div>
                            </button>
                        </div>
                        <hr className="fw"></hr>
                        <NavItem href="/chats" title="Chats">
                            <i className="fa-solid fa-message"></i>
                        </NavItem>
                        <NavItem href="/contacts" title="Contacts">
                            <i className="fa-solid fa-users"></i>
                        </NavItem>
                        <NavItem href="/media" title="Storage & Media">
                            <i className="fa-solid fa-folder"></i>
                        </NavItem>
                        <NavItem href="/notifications" title="Notifications">
                            <i className="fa-solid fa-bell"></i>
                        </NavItem>
                        <NavItem href="/settings" title="Settings">
                            <i className="fa-solid fa-gears"></i>
                        </NavItem>
                    </div>
                    <div>
                        <footer className="small text-center text-muted">
                            <div className='flex-col mid-align fw'>
                                {/* Button for comments */}
                                <button className="no-btn fw" onClick={() => toggleOverlay("feedback", true)}>
                                    <div className="flex fw">
                                        <i className="fa-solid fa-comments"></i>
                                        <div className="fw">Feedback</div>
                                    </div>
                                </button>

                                {/* More actions at navbar */}
                                <div className='flex fw mid-align' style={{ justifyContent: 'space-evenly' }}>
                                    <Button className="fa-solid fa-bolt-lightning lg" />
                                    <Button className="fa-solid fa-sun moon lg" />
                                    <Button className="fa-solid fa-moon sun lg" />
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
                <div className='abs' style={{ right: "10px", top: "10px" }}>
                    <IconBut className="fa-solid fa-xmark lg" onClick={close}>
                        <span className="sr-only"> Close </span>
                    </IconBut>
                </div>
            </div>
        </aside>
    )


    function close() {
        once(transitionEnd, mainRef.current, () => toggleOverlay("navbar", false));
        mainRef.current.classList.add("close");
    }
}


function NavItem({ children, href, title, nftnCount }) {
    const toggleOverlay = useContext(ToggleOverlay);

    return (
        <a className="nav-link" href={href} onClick={handleClick}>
            <div className='flex fw mid-align'>
                {children}
                <div className="fw flex mid-align">
                    <div> {title} </div>
                    <div> {nftnCount} </div>
                </div>
            </div>
        </a>
    )

    function handleClick(e) {
        e.preventDefault();

        toggleOverlay(href.slice(1), true);
    }
}