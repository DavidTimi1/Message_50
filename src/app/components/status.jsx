import { faCancel, faCheck, faCheckDouble, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function StatusIcon({statusChar}){

    let statusIcon, color;

    switch (statusChar){
        case 'r': statusIcon = faEye;
            color = "var(--btn-col)";
            break;

        case 's': statusIcon = faCheck;
            break;
        
        case 'x': statusIcon = faCancel;
            break;
        
        case 'd': statusIcon = faCheckDouble;
            color = "var(--btn-col)";
            break;

        default: 
            return <></>
    }

    return <FontAwesomeIcon icon={statusIcon} size="sm" style={{margin: ".25rem", color}} />
    
}