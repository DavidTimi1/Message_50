import { useEffect, useState } from "react"
import { on } from "../../utils";
import { getContactDetails } from "../../db";



export const useOnlineStatus = () => {

    const [isOnline, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        on('online', handleOnline);
        on('offline', handleOffline);

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

        getContactDetails(id)
        .then( res => {
            setName(res?.name ?? id);
        });

    }, [id]);

    return name
}

export const useTransitionOnLoad = (ref) => {

    useEffect(() => {
        setTimeout(() => ref.current.classList.remove('not-animated'));

    }, [ref])

}