import { useEffect, useState } from "react"
import { on } from "../../utils";
import { getContactDetailsFromDB } from "../../db";
import { DevMode } from "../../App";



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
    const [ name, setName ] = useState(id);

    useEffect(() => {
        if (!id) return

        getContactDetailsFromDB(id)
        .then( res => {
            setName(res?.name ?? id);
        });

    }, [id]);

    return name
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