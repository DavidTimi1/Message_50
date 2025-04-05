import { useEffect } from "react";
import { ManageContact } from "../contacts/components/ContactManager";
import { UserCard } from "../contacts/components/UserCard";
import { Feedback } from "../feedback/page";
import { ProfileEdit } from "../settings/components/ProfileSets";
import { MediaViewer } from "../media/components/MediaViewer";


export const More = ({openOverlays}) => {


    return (
        <>
        <Overlay component={ProfileEdit} name='profile-edit' />
        <Overlay component={ManageContact} name='manage-contact' />
        <Overlay component={UserCard} name='user-card' />
        <Overlay component={MediaViewer} name='media-viewer' />
        {/* <Overlay component={ContactCard} name="contact-card" /> */}
        <Overlay component={Feedback} name="feedback" />
        </>
    )


    function Overlay({component, name}){
        
        const show = openOverlays.get(name), visible = Boolean( show );

        return component({show: visible, args: show})
    }

}