import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth/AuthContexts";
import { useAuth } from "./auth/ProtectedRoutes";
import { apiHost, DevMode } from "./App";

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
				console.log(res.data);

				const {dp} = res.data 

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
