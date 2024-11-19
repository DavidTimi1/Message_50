import { ManageContact } from "../contacts/components/ContactManager";
import { UserCard } from "../contacts/components/UserCard";
import { Feedback } from "../feedback/page";
import { ProfileEdit } from "../settings/components/ProfileSets";


export const More = ({openOverlays}) => {

    return (
        <>
        <Overlay component={ProfileEdit} name='profile-edit' />
        <Overlay component={ManageContact} name='manage-contact' />
        <Overlay component={UserCard} name='user-card' />
        {/* <Overlay component={ContactCard} name="contact-card" /> */}
        <Overlay component={Feedback} name="feedback" />
        </>
    )


    function Overlay({component, name}){
        const show = openOverlays.get(name);

        return component({show: Boolean( show ), args: show})
    }

}