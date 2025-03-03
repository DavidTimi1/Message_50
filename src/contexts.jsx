import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost, DevMode } from "./App";
import { generateKeyPair } from './app/crypt.js';

import noDp from './public/Nagi_0.jpg';

import axiosInstance from "./auth/axiosInstance";

export const UserContext = createContext(null);


// AuthProvider Component
export const UserProvider = ({ children, devData }) => {
	const [userData, setUserData] = useState(devData);
    const { auth } = useAuth();

	const loadDataUrl = apiHost + "/chat/api/user/me";
	
	useEffect(() => {
		let ignore = false;

		if (!auth && !DevMode) return 

		if (auth) {
			axiosInstance.get(loadDataUrl)
			.then( res => {
				const {dp, public_key} = res.data

				!public_key && setUserKeyPair();

				setUserData({...res.data, dp: dp || noDp})
			})
			.catch((error) => {
				console.error('Error Loading Data:', error);
			});

		} else {
			setUserData(devData);

		}

		return () => ignore = true;
	}, [auth]);

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    );
};



function setUserKeyPair() {
    const PUBLICKEY_URL = apiHost + "/chat/api/user/me/public-key";

    generateKeyPair()
        .then(res => {
            axiosInstance.post(PUBLICKEY_URL, res)
            .then( console.log("Public Key set") )
        })
        .catch(err => {
            throw err
        })
}