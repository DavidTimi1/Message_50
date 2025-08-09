import { ManageContact } from "../contacts/components/ContactManager";
import { UserCard } from "../contacts/components/UserCard";
import { Feedback } from "../feedback/page";
import { ProfileEdit } from "../settings/components/ProfileSets";
import { MediaViewer } from "../media/components/MediaViewer";


export const More = ({openOverlays}) => {


    return (
        <>
        <Overlay component={ProfileEdit} key='profile-edit' name='profile-edit' />
        <Overlay component={ManageContact} key='manage-contact' name='manage-contact' />
        <Overlay component={UserCard} key='user-card' name='user-card' />
        <Overlay component={MediaViewer} key='media-viewer' name='media-viewer' />
        <Overlay component={Feedback} key='feedback' name="feedback" />
        </>
    )


    function Overlay({component, name}){
        
        const show = openOverlays.get(name), visible = Boolean( show );

        return component({show: visible, args: show})
    }

}