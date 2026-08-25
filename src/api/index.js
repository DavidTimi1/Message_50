import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../auth/axiosInstance";
import { API_ROUTES } from "../lib/routes";

// --- QUERIES ---

export const useUserSearch = (query) => {
    return useQuery({
        queryKey: ["user-search", query],
        queryFn: async () => {
            if (!query) return [];
            const response = await axiosInstance.get(`${API_ROUTES.USER_SEARCH}?q=${query}`);
            return response.data;
        },
        enabled: !!query,
        staleTime: 1000 * 60,
    });
};

export const useUserSettings = () => {
    return useQuery({
        queryKey: ["user-settings"],
        queryFn: async () => {
            const response = await axiosInstance.get(API_ROUTES.USER_SETTINGS);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useMediaMetadata = (mediaId) => {
    return useQuery({
        queryKey: ["media-metadata", mediaId],
        queryFn: async () => {
            const response = await axiosInstance.get(API_ROUTES.MEDIA_METADATA(mediaId));
            return response.data;
        },
        enabled: !!mediaId,
        staleTime: 1000 * 60 * 60, // highly cacheable
    });
};

export const usePublicKeys = (usernames) => {
    return useQuery({
        queryKey: ["public-keys", usernames],
        queryFn: async () => {
            if (!usernames || usernames.length === 0) return {};
            const response = await axiosInstance.get(API_ROUTES.PUBLIC_KEYS(usernames));
            return response.data;
        },
        enabled: !!usernames && usernames.length > 0,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useMessages = (chatting, viewMsg) => {
    return useQuery({
        queryKey: ["messages", chatting, viewMsg],
        queryFn: async () => {
            const { getMessages } = await import('../app/chats/components/Messaging');
            return getMessages(chatting, viewMsg);
        },
        enabled: !!chatting,
        staleTime: Infinity,
    });
};

export const getChatsFromDB = async (max = 50) => {
    const { loadDB, openTrans, msgsTable, offlineMsgsTable } = await import('../db');
    let list = [], unsent = [], done = [];
    let i = 0;

    return loadDB().then(DB => new Promise(res => {
        openTrans(DB, offlineMsgsTable)
            .openCursor(null, "prev")
            .onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    const { value } = cursor, { handle } = value;
                    if (!done.includes(handle)){
                        unsent.push({...value, notSent: true});
                        done.push(handle);
                    }
                    cursor.continue();
                } else {
                    openTrans(DB, msgsTable)
                        .index('handle_time')
                        .openCursor(null, 'prev')
                        .onsuccess = e => {
                            let cursor = e.target.result;
                            if (cursor && i < max) {
                                const { value } = cursor, { handle } = value;
                                if (!done.includes(handle)) {
                                    list.push(value);
                                    done.push(handle);
                                    i++;
                                }
                                cursor.continue();
                            } else {
                                res({
                                    unsent: unsent,
                                    data: list
                                });
                            }
                        };
                }
            };
    }));
};

export const useChats = (max = 50) => {
    return useQuery({
        queryKey: ["chats"],
        queryFn: () => getChatsFromDB(max),
        staleTime: Infinity, // Rely on cache invalidation or manual setQueryData
    });
};

// --- MUTATIONS ---

export const useUpdateUserSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settingsData) => {
            const response = await axiosInstance.post(API_ROUTES.USER_SETTINGS, settingsData);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["user-settings"], data);
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await axiosInstance.post(API_ROUTES.PROFILE_EDIT, formData);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate current user to fetch new profile picture/bio
            queryClient.invalidateQueries({ queryKey: ['user-details', 'me'] });
        },
    });
};

export const useSubmitFeedback = () => {
    return useMutation({
        mutationFn: async (formData) => {
            const response = await axiosInstance.post(API_ROUTES.FEEDBACK, formData);
            return response.data;
        }
    });
};

export const useUploadMedia = () => {
    return useMutation({
        mutationFn: async ({ formData, onUploadProgress }) => {
            const response = await axiosInstance.post(API_ROUTES.MEDIA_UPLOAD, formData, {
                onUploadProgress,
            });
            return response.data;
        }
    });
};

export const useAuthLogin = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post(API_ROUTES.LOGIN, data);
            return response.data;
        }
    });
};

export const useAuthSignup = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.post(API_ROUTES.SIGNUP, data);
            return response.data;
        }
    });
};

export const useAuthGuest = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post(API_ROUTES.GUEST_AUTH);
            return response.data;
        }
    });
};

// --- RAW API CALLS ---
export const getMediaMetadata = async (mediaId) => {
    const response = await axiosInstance.get(API_ROUTES.MEDIA_METADATA(mediaId));
    return response.data;
};

export const downloadMediaFile = async (mediaId, onDownloadProgress) => {
    const response = await axiosInstance.get(API_ROUTES.MEDIA(mediaId), {
        responseType: 'arraybuffer',
        onDownloadProgress
    });
    return response;
};
