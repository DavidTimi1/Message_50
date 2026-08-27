import { useEffect, useState } from "react"
import { on } from "../../utils";
import { getContactDetailsFromDB, saveContactToDB } from "../../db";
import { DevMode } from "../../App";
import { useUserDetails } from "../../hooks/use-user-details";



export const useOnlineStatus = () => {

    const [isOnline, setOnline] = useState(DevMode? true : navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        on('online', handleOnline);
        !DevMode && on('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])
    
    return isOnline
}


export const useContactName = (id) => {
    const [localName, setLocalName] = useState(null);
    const { data: userDetails } = useUserDetails(localName ? null : id);

    useEffect(() => {
        if (!id) return;

        getContactDetailsFromDB(id)
        .then(res => {
            if (res?.name) {
                setLocalName(res.name);
            } else if (res) {
                // If it is in IndexedDB contacts table but doesn't have a name, set to username/id
                setLocalName(res.handle || id);
            } else {
                setLocalName(null);
            }
        });
    }, [id]);

    useEffect(() => {
        if (userDetails && !localName) {
            const transData = {
                handle: userDetails.username,
                name: userDetails.username, // Fallback name is the username itself
                dp: userDetails.dp,
                bio: userDetails.bio,
                lastUpdated: new Date().getTime()
            };
            saveContactToDB(transData).then(() => {
                setLocalName(userDetails.username);
            });
        }
    }, [userDetails, localName]);

    if (localName) return localName;
    return userDetails?.username || id;
}

export const useContactDetails = (id) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!id) return

        getContactDetailsFromDB(id)
        .then( res => {
            if (res)
                setData(res);
        });

    }, [id]);

    return data
}

export const useTransitionOnLoad = (ref) => {

    useEffect(() => {
        setTimeout(() => ref.current.classList.remove('not-animated'));

    }, [ref])

}



export const useIsMobile =() => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}