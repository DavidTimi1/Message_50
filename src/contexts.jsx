import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost, DevMode } from "./App";
import { generateKeyPair } from './app/crypt.js';

import axiosInstance from "./auth/axiosInstance";
import { DBrestart } from "./db.jsx";

export const UserContext = createContext(null);


// AuthProvider Component
export const UserProvider = ({ children, devData }) => {
	const [userData, setUserData] = useState({});
    const { auth } = useAuth();

	const loadDataUrl = apiHost + "/chat/api/user/me";
	
	useEffect(() => {
		let ignore = false;

		if (!auth && !DevMode) return 

		if (auth) {
			axiosInstance.get(loadDataUrl)
			.then( res => {
				const {dp, public_key} = res.data

				if (!public_key || DBrestart) {
					setUserKeyPair()
				}

				setUserData({...res.data, dp: dp, reload: reloadUserData})
			})
			.catch((error) => {
				console.error('Error Loading Data:', error);
			});

		} else {
			DevMode && setUserData(devData);

		}

		return () => ignore = true;
	}, [auth]);

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    );

	function reloadUserData(){
		if (auth) {
			axiosInstance.get(loadDataUrl)
			.then( res => {
				console.log(res.data)
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