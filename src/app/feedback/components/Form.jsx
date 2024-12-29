import { useEffect, useRef, useState } from "react";
import { Attachment } from "./Attachment";
import { Rating } from "./Rating";
import { faCircleCheck, faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../components/Button";



export const Form = ({closeModal}) => {
    const [mode, setMode] = useState('')
    const [status, setStatus] = useState(false);
    const [files, setFiles] = useState({}), count = useRef(null);

    const ref = useRef(null);

    useEffect(() => {
        if (status === true) {
            setTimeout(closeModal, 1500);
        }
    }, [status])

    return (
        <form method="post" action="/feedback" className="feedback-body flex-col gap-3 grow"
            ref={ref}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave} 
            onDrop={handleDrop}
            onSubmit={handleSubmit}
        >
            {
                status === true ?
                    <div className="abs-mid">
                        <div className="flex-col mid-align gap-2 center-text">
                            <FontAwesomeIcon icon={faCircleCheck} size="3x" />
                            <span>
                                Thank you a lot for the feedback. It will be reviewed promptly.
                            </span>
                        </div>
                    </div>

                :

                    <>
                    <SelectMode handleChange={changeMode} selected={mode} />
                    <textarea name="text" maxLength="800" rows="8" className="fw" style={{ backgroundColor: "var(--body2-col)" }} required></textarea>
                    <Attachment files={files} remove={removeFile} add={addFile} />

                    {mode === 'comment' && <Rating />}

                    <Button type="submit">
                        {
                            status === false ?
                            "Send"
                            : 
                            <FontAwesomeIcon icon={faSpinner} spin />
                        }
                    </Button>

                    <div className="drop-info flex-col gap-2 abs-mid center-text">
                        <FontAwesomeIcon icon={faUpload} size="3x" />
                        <span> Drop here to add file </span>
                    </div>
                    </>
            }

        </form>
    )


    function changeMode(e) {
        const { target: { value } } = e;
        setMode(value);
    }

    function handleDragOver(e){
        e.preventDefault();
        
        if (ref.current){
            ref.current.classList.add("dragging")
        }
    }

    function handleDragLeave(e){
        e.stopPropagation();
        ref.current && ref.current.classList.remove("dragging")
    }

    function handleDrop(e){
        e.preventDefault();
        e.stopPropagation();

        if (!ref.current) return
           
        ref.current.classList.remove("dragging")
        
        const files = e.dataTransfer.files;
        addFile(files);
    }

    function removeFile(id) {
        const img = files?.[id]?.img;
        img && URL.revokeObjectURL(img);

        setFiles(prevFiles => {
            const newFiles = { ...prevFiles }
            delete newFiles[id];

            return newFiles
        })
    }

    function addFile(files) {
        for (let file of files) {
            let imgURL = URL.createObjectURL(file);

            setFiles(prevFiles => {
                ++count.current;

                const nextFiles = {
                    ...prevFiles, [count.current]: {
                        img: imgURL, file
                    }
                };

                return nextFiles;
            })
        }
    }

    function handleSubmit(e){
        e.preventDefault();

        const fd = new FormData(e.target);
        setStatus(true);
    }
}


const SelectMode = ({ handleChange, selected }) => {

    return (
        <label>
            <span>Feedback Intent: </span>
            <select name="type" className="feedback-type br-5" defaultValue={selected} required onChange={handleChange}>
                {
                    Object.keys(modes).map(mode =>
                        <option key={mode} value={mode} disabled={mode === ''}> {modes[mode]} </option>
                    )
                }
            </select>
        </label>
    )

}


const modes = {
    '': "Choose a Feedback type",
    bug: "Report a bug",
    help: "Need Help?",
    comment: "Leave a Feedback Comment"
}