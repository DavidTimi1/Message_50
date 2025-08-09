import { useEffect, useRef, useState } from "react";
// import { Attachment } from "./Attachment";
import { Rating } from "./Rating";
import { faCircleCheck, faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../../components/Button";
import { apiHost } from "../../../App";
import axios  from "axios";
import { Input } from "../../../sign-in/page";
import { API_ROUTES } from "../../../lib/routes";
import axiosInstance from "../../../auth/axiosInstance";



export const Form = ({closeModal}) => {
    const [mode, setMode] = useState('')
    const [status, setStatus] = useState(false);
    const [files, setFiles] = useState([]);

    const ref = useRef(null);

    useEffect(() => {
        if (status === true) {
            setTimeout(closeModal, 1500);
        }
    }, [status])

    return (
        <form method="post" action="/feedback/message50" className="feedback-body flex-col gap-3 grow"
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
                    {
                        status.error &&
                        <div className="err-msg center-text">
                            {status.error}
                        </div>
                    }

                    <SelectMode handleChange={changeMode} selected={mode} />

                    <Input name="email" type="email" className="fw"
                        label="Email (optional, for follow-up):"
                        placeholder="Enter your email"
                        style={{ backgroundColor: "var(--body2-col)" }} 
                    />

                    <textarea name="message" maxLength="800" rows="8" className="fw" style={{ backgroundColor: "var(--body2-col)" }} required></textarea>
                    {/* <Attachment files={files} remove={removeFile} add={addFile} /> */}

                    {mode === 'Comment' && <Rating />}

                    <Button type="submit">
                        {
                            status === 'loading' ?
                            <FontAwesomeIcon icon={faSpinner} spin />
                            :
                            "Send"
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
            const newFiles = [ ...prevFiles ]
            newFiles.splice(id, 1)

            return newFiles
        })
    }

    function addFile(files) {
        for (let file of files) {
            let imgURL = URL.createObjectURL(file);

            setFiles( prevFiles => [
                    ...prevFiles, {
                        img: imgURL, file
                    }
                ]
            )
        }
    }

    function handleSubmit(e){
        e.preventDefault();
        setStatus('loading');
        
        const form = e.target;
        const fd = new FormData(form);

        const email = form["email"]?.value?.trim();
        fd.set("subscribed", Boolean(email))
        // // files.length && fd.set("image", files[0]);

        axiosInstance.post( API_ROUTES.FEEDBACK , fd)
        .then( ({data}) => {
            setStatus(true);
        }).catch( error => {
            console.error(error)
            setStatus({
                error: error.response?.data?.detail || error.message || "An error occurred. Please try again."
            })
        })
    }
}


const SelectMode = ({ handleChange, selected }) => {

    return (
        <label>
            <span>Feedback Intent: </span>
            <select name="subject" className="feedback-type br-5" defaultValue={selected} required onChange={handleChange}>
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
    Comment: "Leave a Feedback Comment",
    Help: "Need Help?",
    Bug: "Report a bug",
}