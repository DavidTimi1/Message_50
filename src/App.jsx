import './ui/pallete.css';
import './ui/views.css';
import './ui/App.css';

import userDp from './public/Nagi_0.jpg';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContexts";

// import Home from './home';
// import { Media } from './media';
// import Settings from './settings';
// import MsgInterface from './messaging';
// import { NavBar } from './navbar';
// import { More } from './more';

import { UserProvider } from './contexts';
import { lazy, Suspense } from 'react';

import LandingPage from './landing/page';
import { AppRoutes } from './Routes';
import { SignIn } from './sign-in/page';
import UserProfilePage from './users/page';
import { LoadingPage } from './components/Loading';


export const ProdName = "Message50";
export const githubLink = "https://github.com/DavidTimi1";
export const portfolioLink = "https://davidtimi1.github.io";
export const DevMode = import.meta.env.MODE === 'development';

export const apiHost = DevMode? "http://localhost:5173" : import.meta.env.VITE_BACKEND_HOST;

const Msg50App =  lazy(() => import('./app/page'))

export const Msg50 = () => {

	return (
		<div className='max App'>
        <AuthProvider>
			<UserProvider devData={userDevData}>
			<Router>
				<Routes>
					<Route path='/' element={<LandingPage />} />
					<Route path='/register' element={<SignIn isLogin={false} />} />
					<Route path='/login' element={<SignIn isLogin={true} />} />
					<Route path='/app/*' element={	
						<Suspense fallback={<LoadingPage />}>
							<Msg50App />
						</Suspense>
					} />
					<Route path='/user/:username' element={<UserProfilePage />} />
					<Route path='/routes' element={<AppRoutes />} />
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Router>
			</UserProvider>
			
		</AuthProvider>
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


export const userDevData = {
	bio: "Experienced programmer, Full stack web developer, AI enthusiast",
	username: "David",
	handle: "@dev_id",
	dp: userDp
}
