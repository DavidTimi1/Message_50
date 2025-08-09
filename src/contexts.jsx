import { createContext, useEffect, useState } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost } from "./App";
import { generateKeyPair, getPrivateKey } from './app/crypt.js';

import axiosInstance from "./auth/axiosInstance";
import { DBrestart } from "./db.jsx";
import { API_ROUTES } from "./lib/routes.js";

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
	const isError = Boolean( userData.error );
	const username = userData.username;
	
	useEffect(() => {
		let ignore = false;

		if (isError) 
			return;

		if (!isAuth && username){
			setUserData({reload: reloadUserData});

		} else if (isAuth && !username) {
			axiosInstance.get(API_ROUTES.USER_ME)
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
	}, [isAuth, username]);

    return (
        <UserContext.Provider value={userData}>
			{children}
        </UserContext.Provider>
    );

	function reloadUserData(){
		if (isAuth) {
			axiosInstance.get(API_ROUTES.USER_ME)
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
    generateKeyPair()
        .then(res => {
            axiosInstance.post( API_ROUTES.USER_PUBLIC_KEY , res)
            .then( console.log("Public Key set") )
        })
        .catch(err => {
            throw err
        })
}