import { useQuery } from "@tanstack/react-query";
import { fetchUserDetails } from "@/app/contacts/lib";


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