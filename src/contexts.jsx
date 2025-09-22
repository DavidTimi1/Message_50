import { createContext, useEffect, useRef } from "react";
import { useAuth } from "./auth/ProtectedRoutes";
import { generateKeyPair, getPrivateKey } from './app/crypt.js';

import axiosInstance from "./auth/axiosInstance";
import { DBrestart } from "./db.jsx";
import { API_ROUTES } from "./lib/routes.js";
import { CURRENT_USER_QUERY_KEY, useMyDetails } from "./hooks/use-user-details";
import { showToast } from "./app/components/toaster";
import { useQueryClient } from "@tanstack/react-query";

export const UserContext = createContext(null);

const MAX_RETRIES = 3;

// AuthProvider Component
export const UserProvider = ({ children }) => {
	const isAuth = Boolean(useAuth().auth);
	const retries = useRef(0);

	const { data: userData, isLoading, isError, error } = useMyDetails(!isAuth);
	const queryClient = useQueryClient();

	const userObject = {
		...(userData || {}),
		isLoading,
		error: isError && error.message,
		reload: reloadUserData
	};

	useEffect(() => {

		async function getKeysAndSetIfNeeded() {
			const public_key = userData?.public_key;

			let privateKey;

			try {
				privateKey = await getPrivateKey();
			} catch (err) {
				console.warn("Error getting private key:", err);
			}

			if (!public_key || !privateKey || DBrestart) {

				if (retries.current >= MAX_RETRIES) {
					console.error("Max retries reached for setting user key pair.");
					showToast('Error setting up encryption keys. Please try signing out and back in.', { type: 'error' });
					return;
				}
				retries.current += 1;

				try {
					await setUserKeyPair();
					reloadUserData();
					retries.current = 0;

				} catch (err) {
					console.error("Error setting user key pair:", err);
					showToast('Error setting up encryption keys. Please try signing out and back in.', { type: 'error' });
				}
			}
		}

		if (userData?.username) {
			getKeysAndSetIfNeeded();
		}

	}, [userData]);

	return (
		<UserContext.Provider value={userObject}>
			{children}
		</UserContext.Provider>
	);

	function reloadUserData() {
		queryClient.invalidateQueries({
			queryKey: CURRENT_USER_QUERY_KEY
		})
	}
};



async function setUserKeyPair() {
	generateKeyPair()
		.then(res => {
			axiosInstance.post(API_ROUTES.USER_PUBLIC_KEY, res)
		})
		.catch(err => {
			throw err
		})
}