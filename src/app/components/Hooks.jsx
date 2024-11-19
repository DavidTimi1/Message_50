import { useEffect, useState } from "react"
import { on } from "../../utils";



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