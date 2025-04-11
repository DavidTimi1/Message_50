import './page.css';

import { useContext, useEffect, useRef, useState } from "react";

import { RouteContainer } from "../components/View";
import { $, title } from '../../utils';

import { replace, useLocation, useNavigate } from 'react-router-dom';

import { ChatSettings } from './components/ChatsSets';
import { StorageSettings } from './components/StorageSets';
import { Help } from './components/Help';
import { Blocked } from './components/BlockedSets';
import { ProfileBrief } from './components/ProfileSets';
import { Heading } from "./components/Heading";
import { ToggleOverlay } from '../contexts';

import { deleteDatabase } from '../../db';
import { UserContext } from '../../contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../auth/AuthContexts';

const viewName = "Settings";



export const SettingsPage = () => {
    const [active, setActive] = useState(null);

    const mainRef = useRef(null), heighter = useRef(null);

    const navigate = useNavigate(), locationState = useLocation().state;
    const toggleOverlay = useContext( ToggleOverlay );

    useEffect(() => {
        let t_id = setTimeout(() => mainRef.current.classList.remove("close"));
        adjustHeight();

        return () => {
            t_id && clearTimeout(t_id);
        }
    }, [])
    
    useEffect(() => {

        if (locationState === 'edit-profile'){
            navigate('', {replace: true});
            toggleOverlay('profile-edit', true);
        }

    }, [locationState])


    return (
        <RouteContainer id="settings" heading={<Heading close={close} />} ref={mainRef}>
            
        <div className='max' ref={heighter}>
            <div className="list accordion custom-scroll max pad" style={{overflow: "hidden auto", display: "none"}} >
                <div className="flex-col gap-1">
                    <ProfileBrief />

                    <div>
                        <hr></hr>
                    </div>
                    
                    <div className="flex-col gap-1">

                        <ChatSettings isActive={active === 'chats'} toggleActive={() => toggleActive('chats')} />

                        <StorageSettings />

                        <Help />

                        <Invite />

                        <Blocked isActive={active === 'blocked'} toggleActive={() => toggleActive('blocked')} />


                    </div>

                    <Danger />
                </div>
            </div>
        </div>
        </RouteContainer>
    )


    function toggleActive(name){
        setActive( prev => prev !== name ? name : undefined);
    }

    function adjustHeight() {
        const el = heighter.current, h = el.clientHeight, child = $("q.list", el);
        child.style.height = `${h}px`;
        child.style.display = '';
    }

    function close() {
        const el = mainRef.current;
        el.classList.add("close");
        setTimeout(() => navigate('/app'), 200);        
    }
}


const Invite = () => {
    const User = useContext(UserContext);

    return (
        <div className="settings-sec fw br-5">
            <button className="no-btn fw" onClick={handleClick}>
                <h3 className='flex gap-4 mid-align'>

                    <span className='flex mid-align'>
                        <span className="abs" style={{left: "-12px"}}>
                            <FontAwesomeIcon icon={faPlus} size="sm" stroke='var(--body-col)' strokeWidth={5} />
                        </span>
                        <FontAwesomeIcon icon={faUsers} />
                    </span>

                    <span> Invite Friends </span>
                </h3>
            </button>
        </div>
    )

    function handleClick(){
        const shareData = {
            title: `${User.username}'s invite`,
            text: "Join me and let's chat on this quick and secure messaging platform",
            url: `/user/${User.username}`
        }

        navigator.share(shareData)
    }
}


const Danger = () => {
    const {logout} = useContext(AuthContext);

    return (
        <div className='fw'>
            <div className="settings-sec">
                <label className="no-accordion fw">
                    <button className="no-btn btn mixed btn-outline-danger fw"  onClick={deleteDatabase}>
                        Clear All Chats
                    </button>
                </label>
            </div>
            <hr />
            <div className="settings-sec">
                <label className="no-accordion fw">
                    <button className="no-btn btn mixed btn-outline-secondary fw" onClick={handleLogoutClick}>
                        Log out
                    </button>
                </label>
            </div>
        </div>
    )

    function handleLogoutClick(){
        const vert = confirm(
            `Logging out will also delete your current info and messages form this device for security purposes.
        Do you wish to continue?`
        );
        if (!vert) return 
        logout();
    }
}