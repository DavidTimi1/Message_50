import { apiHost } from "../../App";
import axiosInstance from "../../auth/axiosInstance";
import { getContactDetailsFromDB, saveContactToDB } from "../../db";


export const getUserDetails = async (handle, isOnline) => {
    let error, details, isSaved = false;
    const userAPIRoute = apiHost + "/chat/api/user/" + handle;

    if (!handle){
        return {
            success: false,
            error: "😥 User could not be found",
        }
    }

    let user = await getContactDetailsFromDB(handle);

    if (user) {
        isSaved = true; // The user data has been saved previously
        details = user
    }

    if (isOnline) {
        details = await axiosInstance.get(userAPIRoute)
            .then ( ({data}) => {
                const transData = {
                    id: data.id,
                    handle: data.username,
                    dp: data.dp,
                    bio: data.bio
                }

                if (!user)
                    saveContactToDB(transData);
                
                return {...user, ...transData, isSaved: user.name}
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