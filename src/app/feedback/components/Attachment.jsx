
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconBtn } from '../../../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export const Attachment = ({ files, add, remove }) => {
    const count = files.length;

    return (
        <div className="fw">
            <div>
                <span> {count ? `${count} File(s) attached. Only first file will be uploaded` : "No File attached (max: 1)"} </span>
            </div>
            <div className="flex mid-align gap-2 fw" style={{ borderRadius: "10px", flexWrap: "wrap" }}>
                {
                    files.map(key => {
                        const { img } = files[key];

                        return (
                            <div className='atth-view' key={key}>
                                <div className="max">
                                    <div className="bg-img max" style={{backgroundImage: `url(${img})`}}>
                                    </div>
                                </div>

                                <div className='abs' style={{ top: 0, right: 0 }}>
                                    <IconBtn icon={faMinus} size="lg" bg="var(--btn-col)" onClick={() => remove(key)} />
                                </div>
                            </div>
                        )

                    })
                }

                <div className='atth-view'>
                    <label className='br-5 abs-mid' tabIndex="0" role="button">
                        <div className="abs-mid flex-col gap-2">
                            <FontAwesomeIcon icon={faPlus} size="3x" />
                        </div>
                        
                        <input hidden type="file" onInput={handleInput} accept="image/*, video/*" />
                    </label>
                </div>
            </div>
        </div>
    )

    function handleInput({ target }) {
        if (target.value) {
            add(target.files)
        }
    }
}