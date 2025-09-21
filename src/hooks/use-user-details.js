import { useQuery } from "@tanstack/react-query";
import { fetchMyDetails, fetchUserDetails } from "@/app/contacts/lib";


export const useUserDetails = (handle) => {
    return useQuery({
        queryKey: ['user-details', handle],
        queryFn: () => fetchUserDetails(handle),
        enabled: !!handle,
        staleTime: 1000 * 60 * 2, // 2 mins
        cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry: 1,
        refetchOnWindowFocus: false,
    })
}

export const CURRENT_USER_QUERY_KEY = ['user-details', 'me'];

export const useMyDetails = (abort) => {
    return useQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: fetchMyDetails,
        enabled: !abort,
        staleTime: 1000 * 60 * 20, // 20 mins
        cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry: 1,
        refetchOnWindowFocus: false,
    })
}