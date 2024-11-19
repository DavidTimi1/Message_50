import { useRef, useState } from "react";
import { Attachment } from "./Attachment";
import { Rating } from "./Rating";
import { faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../../buttons";



export const Form = () => {
    const [mode, setMode] = useState('')
    const [pending, setPending] = useState(false);
    const [files, setFiles] = useState({}), count = useRef(null);

    const ref = useRef(null);

    return (
        <form method="post" action="/feedback" className="feedback-body grow" dropzone="copy" ref={ref} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <SelectMode handleChange={changeMode} selected={mode} />
            <textarea name="text" cols="30" maxLength="800" rows="8" className="fw" style={{ backgroundColor: "var(--body2-col)" }} required></textarea>
            <Attachment files={files} remove={removeFile} add={addFile} />

            {mode === 'comment' && <Rating />}

            <Button>
                <span style={{ opacity: pending ? 0.2 : 1 }}> Send </span>
                {
                    pending && 
                    <FontAwesomeIcon icon={faSpinner} spin />
                }
            </Button>

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