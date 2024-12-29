import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconBtn } from '../../components/Button';



export const Heading = ({ close }) => {

    return (
        <div className="fw heading">
            <div className="flex mid-align fw" style={{justifyContent: "space-between"}}>
                <h5 className="grow"> Help & Feedback </h5>
                <IconBtn icon={faXmark} onClick={close} />
            </div>
        </div>
    )
}