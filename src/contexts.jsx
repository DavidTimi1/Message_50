import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost, DevMode } from "./App";
import { generateKeyPair } from './app/crypt.js';

import axiosInstance from "./auth/axiosInstance";
import { DBrestart } from "./db.jsx";
import CustomLoader from "./components/Loading.jsx";

export const UserContext = createContext(null);


// AuthProvider Component
export const UserProvider = ({ children, devData }) => {
	const [userData, setUserData] = useState(() => {
        const data = localStorage.getItem('userdata');
		let parsedData;
		try {
			parsedData = data? JSON.parse(data) : {};
		} catch {
			parsedData = {}
		}
        return {...parsedData, reload: reloadUserData};
    });

    const { auth } = useAuth();

	const loadDataUrl = apiHost + "/chat/api/user/me";
	
	useEffect(() => {
		let ignore = false;

		if (!auth && !DevMode) return 

		if (auth && !userData.username) {
			axiosInstance.get(loadDataUrl)
			.then( res => {
				const {dp, public_key} = res.data

				if (!public_key || DBrestart) {
					setUserKeyPair()
				}

				localStorage.setItem('userdata', JSON.stringify(res.data));
				setUserData({...res.data, dp: dp, reload: reloadUserData})
			})
			.catch((error) => {
				console.error('Error Loading Data:', error);
				setUserData({error: error.response ?? 'network'});
			});

		} else if (!auth) {
			DevMode && setUserData(devData);

		}

		return () => ignore = true;
	}, [auth, userData]);

    return (
        <UserContext.Provider value={userData}>
			{
				userData.error?
					<div className="max flex mid-align" style={{justifyContent: "center"}}>
						{
							userData.error === 'network'?
								<div className="max flex-col mid-align gap-4 p-4" style={{justifyContent: "center"}}>
									<span style={{fontSize: "50px"}}> ⚠ </span>
									<p>
										<b> No Internet ! </b>
									</p>
								</div>
							:
								<div className="p-2 br-5" style={{backgroundColor: "pink", border: "1px solid salmon", color: "red"}}>
									Oops!😥 this seems bad <br />
									But no worries, our team is already fixing it 😁
								</div>
						}
					</div>
					:
				userData.username?
					children
					:
					<div className="max flex-col mid-align gap-4 p-4" style={{justifyContent: "center"}}>
						<CustomLoader />
						<p>
							<b> Slow Network </b> - Fetching user data is taking longer than usual <br></br>
							<em> Try checking your internet connection </em>
						</p>
					</div>

			}
        </UserContext.Provider>
    );

	function reloadUserData(){
		if (auth) {
			axiosInstance.get(loadDataUrl)
			.then( res => {
				localStorage.setItem('userdata', JSON.stringify(res.data));
				setUserData({...res.data, reload: reloadUserData})
			})
			.catch((error) => {
				console.error('Error Loading Data:', error);
			});

		}
	}
};



function setUserKeyPair() {
    const PUBLICKEY_URL = apiHost + "/chat/api/user/public-key/";

    generateKeyPair()
        .then(res => {
            axiosInstance.post(PUBLICKEY_URL, res)
            .then( console.log("Public Key set") )
        })
        .catch(err => {
            throw err
        })
}