import { createContext, useEffect, useState } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost } from "./App";
import { generateKeyPair, getPrivateKey } from './app/crypt.js';

import axiosInstance from "./auth/axiosInstance";
import { DBrestart } from "./db.jsx";

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

	const isAuth = Boolean( useAuth().auth );

	const loadDataUrl = "/user/me";
	
	useEffect(() => {
		let ignore = false;

		if (!isAuth && userData.username){
			setUserData({reload: reloadUserData});

		} else if (isAuth && !userData.username) {
			axiosInstance.get(loadDataUrl)
			.then( async res => {
				if (ignore) return;

				const {dp, public_key} = res.data;
				let privateKey;

				try {
					privateKey = await getPrivateKey();
				} catch (err) {
					console.warn("Error getting private key:", err);
				}

				if (!public_key || !privateKey || DBrestart) {
					setUserKeyPair()
				}

				localStorage.setItem('userdata', JSON.stringify(res.data));
				setUserData({...res.data, dp: dp, reload: reloadUserData})
			})
			.catch((error) => {
				console.error('Error Loading Data:', error);
				if (!error.response){
					setUserData({error: "network", reload: reloadUserData})
				}

			});

		}

		return () => ignore = true;
	}, [isAuth, userData]);

    return (
        <UserContext.Provider value={userData}>
			{children}
        </UserContext.Provider>
    );

	function reloadUserData(){
		if (isAuth) {
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
    const PUBLICKEY_URL = apiHost + "/user/public-key/";

    generateKeyPair()
        .then(res => {
            axiosInstance.post(PUBLICKEY_URL, res)
            .then( console.log("Public Key set") )
        })
        .catch(err => {
            throw err
        })
}