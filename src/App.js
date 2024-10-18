import logo from './logo.png';

import './ui/pallete.css';
import './ui/App.css';
import userDp from './public/Nagi_0.jpg';

import { useContext, useEffect, useState } from 'react';

import Home from './home';
import { ChatContext, ToggleOverlay, UserContext } from './contexts';
import { Media } from './media';
import Settings from './settings';
import MsgInterface from './messaging';
import { NavBar } from './navbar';
import { More } from './more';


export const DevMode = true;

const ovs = new Map();
ovs.set("home", 1);


export default function Msg50App() {
  const [chatting, setChatting] = useState(false);
  const [msgFrom, jumpTo] = useState();
  const [userData, setUserData] = useState(USERDATA);
  const [overlays, setOverlays] = useState(ovs);
  const userErr = userData.error;

  document.title = "Message50";

  useEffect(() => {
    let ignore = false;

    if (DevMode) {
      setUserData(userDevData);

    } else {
      userErr &&
        fetch("/api/user")
          .then(res => res.json())
          .then(!ignore && setUserData)
          .catch(console.error);

    }

    return () => {
      ignore = true;
    };
  }, [userErr]);


  return (
    <UserContext.Provider value={userData}>
      <ToggleOverlay.Provider value={toggleOverlay}>
        <ChatContext.Provider value={{ cur: chatting, set: toggleMessaging }}>
          <div className="App">
            <NavBar open={overlays.has('navbar')} />

            <Home show={overlays.has('home')} />

            <MsgInterface viewMsg={msgFrom} />

            <Media open={overlays.has('media')} />

            <Settings open={overlays.has('settings')} />

            <More openOverlays={overlays} />
          </div>
        </ChatContext.Provider>
      </ToggleOverlay.Provider>
    </UserContext.Provider>
  );


  function toggleMessaging(handle, id) {
    setChatting(handle);
    jumpTo(id);
  }

  function toggleOverlay(name, value) {
    // keep history

    setOverlays((prev) => {
      const list = new Map(prev);
      value ? list.set(name, value) : list.delete(name);

      return list
    });
  }
}




const app = {
  // prevFocus: {},
  activeView: null,
  defaultView: null,
  views: ["chats", "contacts", "media", "notifications", "settings"],

  changeActive(view) {
    // close all open overlays
    //   appHistory.backToBase();

    //
    this.activeView.classList.add('close-view');

    dispatchEvent(new Event(view + '-view'));
  },

}


const USERDATA = await fetch("/api/user")
  .then(res => res.json())
  .then(json => json)
  .catch(err => {
    console.error(err)
    return { error: true }
  })


const userDevData = {
  about: "Experienced programmer, Full stack web developer, AI enthusiast",
  name: "David",
  handle: "@dev_id",
  dp: userDp
}