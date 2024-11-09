import './ui/settings.css';

import { useContext, useEffect, useRef, useState } from "react";

import { ToggleOverlay, UserContext } from './contexts.js'
import { Button, IconBut } from "./buttons";
import ProfilePic from './contacts.js';
import { BgImg } from './more.js';
import { View, ViewHead } from "./views";
import { once, transitionEnd } from './ui/helpers.js';


const viewName = "Settings";



export default function Settings({ open }) {
    const User = useContext(UserContext);
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);
    const [profile, setProfile] = useState(false);

    const viewHead =
        <ViewHead>
            <div className="fw flex mid-align gap-2" style={{ padding: "10px" }}>
                <div>
                    <IconBut className="fa-solid fa-angle-left" onClick={close}>
                        <span className="sr-only"> Close </span>
                    </IconBut>
                </div>
                <div className="grow flex mid-align" style={{justifyContent: "space-between"}}>
                    <div className="grow flex mid-align gap-1">
                        <i className="fa-solid fa-gear"></i>
                        <span> {viewName} </span>
                    </div>
                    <IconBut className="fa-solid fa-magnifying-glass" />
                </div>
            </div>
        </ViewHead>;


    useEffect(() => {
        let t_id = open && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [open])


    return (
        open &&

        <View viewHead={viewHead} ref={mainRef}>
            <div className="list accordion custom-scroll max pad" >
                <div className="settings-sec fw" style={{ margin: "20px 0" }}>
                    <button className="no-btn flex mid-align grow gap-2">
                        <div style={{ width: "70px", aspectRatio: "1/1", borderRadius: "50%" }}>
                            <BgImg src={User.dp} />
                        </div>
                        <div className="grow flex-col mid-align">
                            <div> {User.name} </div>
                            <small className="fw crop-excess dets"> {User.handle} </small>
                        </div>
                    </button>

                    <div className='gap-2'>
                        <div>
                            <IconBut className="fa-solid fa-share">
                                <span className='sr-only'> Share </span>
                            </IconBut>
                        </div>
                        <div>
                            <IconBut className="fa-solid fa-pencil">
                                <span className='sr-only'> Edit </span>
                            </IconBut>
                        </div>
                    </div>
                </div>

                <hr></hr>

                <ChatSettings />

                <StorageSettings />

                <Help />

                <Invite />

                <Blocked />

                <Danger />

                <ProfileSettings show={profile} hide={() => setProfile(false)} />
            </div>
        </View>
    )


    function close() {
        once(transitionEnd, mainRef.current, () => toggleOverlay("settings", false));
        mainRef.current.classList.add("close");
    }
}



function ProfileSettings({ show, hide }) {
    const title = "Profile Information";
    const mainRef = useRef(null);

    useEffect(() => {
        let t_id = show && setTimeout(() => mainRef.current.classList.remove("close"));

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [show])

    return (
        show &&
        <div className="interface close">
            <div className="content max custom-scroll">
                <div className="fw flex mid-align gap-2">
                    <IconBut className="fa-solid fa-angle-left lg" onClick={close}>
                        <span className="sr-only"> Close </span>
                    </IconBut>
                    <h3> {title} </h3>
                </div>
                <div className="fw pad">
                    <div>
                        <div className="dp-img">
                            <ProfilePic />
                        </div>
                        <div className='abs'>
                            <IconBut className="fa-solid fa-pencil">
                                <span className="sr-only"> Close </span>
                            </IconBut>
                        </div>
                    </div>
                    <ProfileForm />
                </div>
            </div>
        </div>
    )

    function close() {
        once(transitionEnd, mainRef.current, hide);
        mainRef.current.classList.add("close");
    }
}


function ProfileForm() {
    const { name, about } = useContext(UserContext);
    const nameRef = useRef(null), aboutRef = useRef(null);

    useEffect(() => {
        nameRef.current.value = name;
        aboutRef.current.value = about;
    }, [about, name])

    return (
        <form method="" action="" className="my-details">
            <input type="file" accept="image/*" hidden />
            <label className="no-dp b-but bg-body-btn">
                <i className="fa-solid fa-User"></i>
                <div>
                    <small className="dets crop-excess"> Username </small>
                    <input className="not-visible fw" ref={nameRef} contentEditable="false" />
                </div>
            </label>
            <label className="no-dp b-but bg-body-btn">
                <i className="fa-solid fa-note"></i>
                <div>
                    <small className="dets crop-excess"> About </small>
                    <textarea className="not-visible fw" ref={aboutRef} maxLength="100"></textarea>
                </div>
                <small className="limit dets"> 100 </small>
            </label>

            <div className='flex fw' style={{ position: "sticky", bottom: "10px", justifyContent: "right" }}>
                <Button type="submit"> Save </Button>
            </div>
        </form>
    )
}


function ChatSettings() {
    const title = "Chats", descr = "Theme, wallpaper";

    return (
        <div id="chat-sets" className="settings-sec accordion-item">
            <div className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#chat-sets-more" aria-expanded="false" aria-controls="chat-sets-more">
                    <div className="fw flex mid-align">
                        <SetIcon src="#TODO" />
                        <div>
                            <h3 className="setting-head"> {title} </h3>
                            <small className="dets setting-more"> {descr} </small>
                        </div>
                    </div>
                </button>
            </div>

            <div id="chat-sets-more" className="accordion-collapse collapse" data-bs-parent=".list">
                <div className="accordion-body">
                    <div className="theme-sets set-group">
                        <h6>Theme</h6>
                        <div className="fw flex mid-align space-out col" style={{ marginLeft: "5px" }}>
                            <label className="fw">
                                <input type="radio" name="theme" value="light" />
                                <span> Light </span>
                            </label>
                            <label className="fw">
                                <input type="radio" name="theme" value="dark" />
                                <span> Dark </span>
                            </label>
                        </div>
                    </div>
                    <div className="font-sets set-group">
                        <h6>Font Size</h6>
                        <label className="block" style={{ width: "80%", margin: "auto" }}>
                            <small className="fw block flex center-text" style={{ justifyContent: "space-between" }}>
                                <span>Small</span>
                                <span>Medium</span>
                                <span>Large</span>
                            </small>
                            <input className="fw" type="range" step="50" min="0" max="100" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StorageSettings() {
    const title = "Manage Storage", descr = "Media files: photos, videos, audios, other";

    return (
        <button id="storage-sets" className="no-btn settings-sec accordion-item fw">
            <div className="no-accordion flex mid-align">
                <SetIcon src="#TODO" />
                <div>
                    <h3 className="setting-head"> {title} </h3>
                    <small className="dets setting-more"> {descr} </small>
                </div>
            </div>
        </button>
    )
}

function Help() {
    const title = "", descr = "Help, contact us, report a bug";

    return (
        <button id="help-sets" className="no-btn settings-sec fw">
            <div className="no-accordion flex mid-align">
                <SetIcon src="#TODO" />
                <div>
                    <h3 className="setting-head"> {title} </h3>
                    <small className="setting-more dets"> {descr} </small>
                </div>
            </div>
        </button>
    )
}

function Invite() {
    return (
        <div className="settings-sec">
            <label className="no-accordion fw">
                <button className="no-btn btn btn-outline-primary flex mid-align">
                    <SetIcon src="#TODO" />
                    <span> Invite Friends </span>
                </button>
            </label>
        </div>
    )
}

function Blocked() {
    const title = "Blocked Users";

    return (
        <div id="blocked-users" className="settings-sec accordion-item">
            <div className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#blocked-users-more" aria-expanded="false" aria-controls="blocked-users-more">
                    <div className="flex mid-align">
                        <SetIcon src="#TODO" />
                        <h3 className="setting-head"> {title} </h3>
                    </div>
                </button>
            </div>
            <div id="blocked-users-more" className="accordion-collapse collapse" data-bs-parent=".list">
                <ul className="accordion-body">
                    {blocked.map(user =>
                        <li key={user.handle}>
                            <button className="fw">{user.name}</button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

function Danger() {

    return (
        <>
            <hr></hr>
            <div className="settings-sec">
                <label className="no-accordion fw">
                    <button className="no-btn btn mixed btn-outline-secondary fw">
                        Log out
                    </button>
                </label>
            </div>
            <hr></hr>
            <div className="settings-sec">
                <label className="no-accordion fw">
                    <button className="no-btn btn mixed btn-outline-danger fw">
                        Clear All Chats
                    </button>
                </label>
            </div>
        </>
    )
}


function SetIcon({ src }) {
    return (
        <div style={{ margin: "0 20px", width: "70px", aspectRatio: "1/1", borderRadius: "10px" }}>
            <BgImg src={src} />
        </div>
    )
}


const blocked = [];