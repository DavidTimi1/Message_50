import './ui/feedback.css';

import { useContext, useEffect, useRef, useState } from 'react';
import { Button, IconBut } from './buttons';
import { BgImg } from './more';
import { ToggleOverlay } from './contexts';


export default function Feedback({show}){
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    useEffect(() =>{
        if (show){
            mainRef.current.showModal();
        } else {
            mainRef.current.close();
        }
    }, [show])
    
    return (
        <dialog className='feed-zone max' ref={mainRef}>
            <div className='content max flex-col'>
                <Heading close={close} />
                <Form />
            </div>
        </dialog>
    )

    function close(){
        toggleOverlay('feedback', false);
    }
}


function Heading({close}){

    return (
        <div className="fw flex gap-2 mid-align" style={{padding: "10px"}}>
            <IconBut className="fa-solid fa-xmark" onClick={close} />
            <h5 className="fw"> Help & Feedback </h5>
        </div>
    )
}


const modes = {
    '': "Choose a Feedback type",
    bug: "Report a bug",
    help: "Need Help?",
    comment: "Leave a Feedback Comment"
}

function Form(){
    const [mode, setMode] = useState('')
    const [pending, setPending] = useState(false);
    const [files, setFiles] = useState({}), count = useRef(null);

    return (
        <form method="post" action="/feedback" className="feedback-body grow" dropzone="copy">
            <SelectMode handleChange={changeMode} selected={mode} />
            <textarea name="text" cols="30" maxLength="800" rows="8" className="fw" style={{ backgroundColor: "var(--body2-col)" }} required></textarea>
            <Attachment files={files} remove={removeFile} add={addFile} />
            { mode === 'comment' && <Rating /> }
            <Button>
                <span style={{opacity: pending? 0.2 : 1}}> Send </span>
                { pending && <i className="fa-solid fa-spinner fa-spin"></i> }
            </Button>
        </form>
    )

    function changeMode(e){
        const {target: {value}} = e;
        setMode(value);
    }

    function removeFile(id){
        const img = files?.[id]?.img;
        img && URL.revokeObjectURL(img);
        console.log(img)

        setFiles(prevFiles => {
            const newFiles = {...prevFiles}
            delete newFiles[id];

            return newFiles
        })
    }

    function addFile(files){
        for (let file of files){
            let imgURL = URL.createObjectURL(file);

            setFiles(prevFiles => {
                ++count.current;
                const nextFiles = {...prevFiles, [count.current]: {
                        img: imgURL, file
                    }
                };

                return nextFiles;
            })
        }
    }
}


function SelectMode({handleChange, selected}){

    return (
        <label>
            <span>Feedback Intent: </span>
            <select name="type" className="feedback-type" defaultValue={selected} required onChange={handleChange}>
                {
                    Object.keys(modes).map( mode => 
                        <option key={mode} value={mode} disabled={mode === ''}> {modes[mode]} </option>
                    )
                }
            </select>
        </label>
    )

}


function Attachment({files, add, remove}){
    const fileKeys = Object.keys(files), count = fileKeys.length;

    return (
        <div className="fw">
            <div>
                <span>{count? `${count} File(s)` : "No File"} attached </span>
            </div>
            <div className="flex mid-align even-space gap-2 fw" style={{borderRadius: "10px", flexWrap: "wrap"}}>
                {
                    fileKeys.map( key => {
                        const {img} = files[key];

                        return (
                        <div className='atth-view' key={key}>
                            <BgImg src={img} />
                            <div className='abs' style={{top: 0, right: "0px", transform: "translate(-50%, -50%)"}}>
                                <IconBut className="fa-solid fa-minus fa-lg" onClick={() => remove(key)} />
                            </div>
                        </div>
                        )

                    })
                }
                <div className='atth-view'>
                    <label className='br-5' tabIndex="0" role="button">
                        <i className='fa-solid fa-plus' style={{width: "80%"}}></i>
                        <input className='hide' type="file" onInput={handleInput} accept="image/*, video/*" />
                    </label>
                </div>
            </div>
        </div>
    )

    function handleInput({target}){
        if (target.value){
            add(target.files)
        }
    }
}


function Rating(){
    const [rate, setRate] = useState(0);

    return (
        <div className='fw'>
            <label className="fa-solid fa-circle-xmark" style={{color: "red"}}>
                <input type="radio" name="rating" value="0" checked={rate === 0}></input>
            </label>
            {   
                [1,2,3,4,5].map( i =>
                    <label key={i} className="fa-solid fa-star">
                        <input onClick={handleClick} type="radio" name="rating" value={i} checked={rate === i}></input>
                    </label>
                )
            }
        </div>
    )

    function handleClick(e){
        const {taget: {value}} = e;
        value > 0 && value <= 5 && setRate(value)
    }

}
