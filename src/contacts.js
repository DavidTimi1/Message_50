import userLogo from './user-icon.svg';

import { useContext } from "react";
import { UserContext } from "./contexts";
import { IDBPromise, openTrans, DB } from './db';
import { BgImg } from './more';
import { sanitize } from './ui/helpers';


export default function ProfilePic({src, children}) {
    const User = useContext(UserContext), userLogo = src || User.dp

    return (
        <BgImg src={userLogo}>
            {children}
        </BgImg>
    )
}

export function ContactItem({ data }) {
    const { dp, name, about } = data;

    return (
        <div className="contact-cont flex mid-align gap-2 fw" onClick={handleClick}>
            <div className='dp'>
                <BgImg src={dp} />
            </div>
            <div className="grow">
                <div className='fw flex-col gap-1'>
                    <div> {sanitize(name)} </div>
                    <small> {sanitize(about)} </small>
                </div>
            </div>
        </div>
    )

    function handleClick() {
        console.log("Clicked contact with data:", data)
    }
}

const getContactDetails = h => IDBPromise(openTrans(DB, "people_tb").index('handle').get(h))




// export function getContactDetails(id){
//     return IDBPromise( openTrans(DB, 'people_chats_tb').get(id) )
//     .then(res => {
//         if (res)
//             return {id: res.handle, name: res.name}
//     })
// }