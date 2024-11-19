import { faAngleLeft, faGears } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconBtn } from "../../components/Button"


export const Heading = ({close}) => {

    return (
        <div className="heading fw">
            <div className="fw flex mid-align gap-2">
                <IconBtn icon={faAngleLeft} onClick={close}>
                    back
                </IconBtn>
                <div className="grow gap-2 flex mid-align fs-3 fw-800">
                    <FontAwesomeIcon icon={faGears} />
                    <span> Settings </span>
                </div>
            </div>
        </div>
    )
}