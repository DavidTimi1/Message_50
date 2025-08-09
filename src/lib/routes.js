
export const API_ROUTES = {
    HEALTH: "healthz",
    
    LOGIN: "auth/login",
    SIGNUP: "auth/register",
    VERIFY_AUTH: "auth/verify",
    REFRESH_AUTH: "auth/refresh",
    GUEST_AUTH: "auth/guest",

    USER_ME: "user/me",
    USER: (user_id) => `user/${user_id}`,
    PROFILE_EDIT: "user/profile-edit",
    
    MEDIA: (media_id) => `media/${media_id}`,
    MEDIA_METADATA: (media_id) => `media/${media_id}?metadata`,
    MEDIA_UPLOAD: "media/upload",

    USER_PUBLIC_KEY: "user/public-key",
    PUBLIC_KEYS: (usernames) => {
        const params = new URLSearchParams();
        usernames.forEach(username => params.append("username", username));
    
        return `user/public-key/?${params.toString()}`;
    },

    FEEDBACK: "feedback/message50?format=json",

    NOT_FOUND: "*",
    // Add more routes as needed
};