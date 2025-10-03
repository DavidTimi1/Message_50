import { ToggleOverlay } from "@/app/contexts";
import { useContext } from "react";


export const useOverlayData = (overlayName) => {
    const openOverlays = useContext(ToggleOverlay)(null, null, true);
    const overlayValue = openOverlays.find(item => item.name === overlayName)?.value;
    return overlayValue;
}