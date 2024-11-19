import './ui/pallete.css';
import './ui/views.css';
import './ui/App.css';

import userDp from './public/Nagi_0.jpg';

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Home from './home';
// import { Media } from './media';
// import Settings from './settings';
// import MsgInterface from './messaging';
// import { NavBar } from './navbar';
// import { More } from './more';

import { UserContext } from './contexts';

import { LandingPage } from './landing/page';
import { Msg50App } from './app/page';
import { AppRoutes } from './Routes';


export const DevMode = true;


export const Msg50 = () => {
	const [userData, setUserData] = useState(userDevData);
	const userErr = userData?.error;
	
	useEffect(() => {
		let ignore = false;

		if (!userData && DevMode) {
			setUserData(userDevData);

		} else {
			userErr &&
				fetch("/api/user")
				.then(res => res.json())
				.then(!ignore && setUserData)
				.catch(console.error);

		}

		return () => ignore = true;
	});

	return (
		<div className='max App'>
			<UserContext.Provider value={userData}>
			<Router>
				<Routes>
					<Route path='/' element={<LandingPage />} />
					<Route path='/app/*' element={<Msg50App />} />
					<Route path='/routes' element={<AppRoutes />} />
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Router>
			</UserContext.Provider>
		</div>
	)
}

// 	export default function Msg50Ap() {
// 	const [chatting, setChatting] = useState(false);
// 	const [msgFrom, jumpTo] = useState();
// 	const [userData, setUserData] = useState(USERDATA);
// 	const [overlays, setOverlays] = useState(ovs);
// 	const userErr = userData.error;

// 	document.title = "Message50";

// 	useEffect(() => {
// 		let ignore = false;

// 		if (DevMode) {
// 		setUserData(userDevData);

// 		} else {
// 		userErr &&
// 			fetch("/api/user")
// 			.then(res => res.json())
// 			.then(!ignore && setUserData)
// 			.catch(console.error);

// 		}

// 		return () => {
// 		ignore = true;
// 		};
// 	}, [userErr]);


// 	return (
// 		<UserContext.Provider value={userData}>
// 		<ToggleOverlay.Provider value={toggleOverlay}>
// 			<ChatContext.Provider value={{ cur: chatting, set: toggleMessaging }}>
// 			<div className="App">
// 				<NavBar open={overlays.has('navbar')} />

// 				<Home show={overlays.has('home')} />

// 				<MsgInterface viewMsg={msgFrom} />

// 				<Media open={overlays.has('media')} />

// 				<Settings open={overlays.has('settings')} />

// 				<More openOverlays={overlays} />
// 			</div>
// 			</ChatContext.Provider>
// 		</ToggleOverlay.Provider>
// 		</UserContext.Provider>
// 	);


// 	function toggleMessaging(handle, id) {
// 		setChatting(handle);
// 		jumpTo(id);
// 	}

// 	function toggleOverlay(name, value) {
// 		// keep history

// 		setOverlays((prev) => {
// 		const list = new Map(prev);
// 		value ? list.set(name, value) : list.delete(name);

// 		return list
// 		});
// 	}
// }



let USERDATA;

fetch("/api/user")
	.then(res => res.json())
	.then(json => {
		USERDATA = json;
	})
	.catch(err => {
		console.error(err)
		USERDATA = { error: true }
	})


export const userDevData = {
	about: "Experienced programmer, Full stack web developer, AI enthusiast",
	name: "David",
	handle: "@dev_id",
	dp: userDp
}
