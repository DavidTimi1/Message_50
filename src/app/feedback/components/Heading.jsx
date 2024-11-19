import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconBtn } from '../../components/Button';



export const Heading = ({ close }) => {

    return (
        <div className="fw" style={{ padding: "10px" }}>
            <div className="flex mid-align fw gap-2">
                <IconBtn icon={faXmark} onClick={close} />
                <h5 className="grow"> Help & Feedback </h5>
            </div>
        </div>
    )
}