import { faCancel, faCheck, faCheckDouble, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function StatusIcon({statusChar}){

    let statusIcon;

    switch (statusChar){
        case 'r': statusIcon = faEye;
            break;

        case 's': statusIcon = faCheck;
            break;
        
        case 'x': statusIcon = faCancel;
            break;
        
        case 'd': statusIcon = faCheckDouble;
            break;

        default: 
            return <></>
    }

    return <FontAwesomeIcon icon={statusIcon} size="lg" style={{margin: ".25rem"}} />
    
}