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
            toggleOverlay('profile-edit', 1);
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

    return (
        <div className="settings-sec fw br-5">
            <button className="no-btn fw">
                <h3 className='flex-col'>
                    {/* <SetIcon src="#TODO" /> */}
                    <span> Invite Friends </span>
                </h3>
            </button>
        </div>
    )
}


const Danger = () => {

    return (
        <div className='fw'>
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
        </div>
    )
}