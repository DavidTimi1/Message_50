import axiosInstance from "@/auth/axiosInstance";
import { getContactDetailsFromDB, saveContactToDB } from "../../db";
import { API_ROUTES } from "../../lib/routes";


export const getUserDetails = async (handle, isOnline) => {
    let error, details, refresh = true;
    const now = new Date().getTime();

    if (!handle){
        return {
            success: false,
            error: "😥 User could not be found",
        }
    }

    let user = await getContactDetailsFromDB(handle);

    if (user) {
        details = user
        const daysPassed = Math.floor((now - user.lastUpdated) / (1000 * 60 * 60 * 24));
        refresh = daysPassed > 1;
    }

    if (isOnline && refresh) {
        details = await axiosInstance.get(API_ROUTES.USER(handle))
            .then ( ({data}) => {
                const transData = {
                    id: data.id,
                    handle: data.username,
                    dp: data.dp,
                    bio: data.bio,
                    lastUpdated: now
                }

                if (!user)
                    saveContactToDB(transData);
                
                return {...user, ...transData, isSaved: user?.name}
            })
            .catch(err => {
                error =  err.response? "😥 User could not be found, confirm user handle" : err.message;
            })

    } else {
        error = "🚫 Network error, could not get user data"
    }
    
    if (error && !details){
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        data: details
    }
}

export const fetchUserDetails = (handle) => {
    const now = new Date().getTime();

    try {
        const response = axiosInstance.get(API_ROUTES.USER(handle));
        return {
            ...response.data,
            lastUpdated: now
        };

    } catch (error) {
        if (error?.response?.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("Could not get user details");
    }
}

export const fetchMyDetails = () => {
    const now = new Date().getTime();

    try {
        const response = axiosInstance.get(API_ROUTES.USER_ME);
        console.log(response)
        return {
            ...response.data,
            lastUpdated: now
        };

    } catch (error) {
        if (error?.response?.status === 404) {
            throw new Error("User not found");
        }
        throw new Error("Could not get user details");
    }
}