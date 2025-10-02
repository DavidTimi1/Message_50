import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { StateNavigatorContext, ToggleOverlay } from "../../contexts";
import { IconBtn } from "../../../components/Button";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { once, transitionEnd } from "../../../utils";




export const MediaViewer = ({ show, args }) => {
    const { pushState, removeState } = useContext(StateNavigatorContext);
    const [full, setFull] = useState(false);
    const viewable = ['image', 'video', 'audio'].includes(args?.type);
    const localSrc = args?.src, caption = args?.caption;

    const navId = 'media-viewer';
    const mainRef = useRef(null);
    const toggleOverlay = useContext(ToggleOverlay);

    // Close function with animation handling
    const close = useCallback(() => {
        URL.revokeObjectURL(localSrc); // revoke the object URL

        if (mainRef.current) {
            mainRef.current.classList.add("close");

        } else {
            setTimeout(handleTransitionEnd);
        }

        // Wait for the transition/animation to complete
        once(transitionEnd, mainRef.current, handleTransitionEnd);

        function handleTransitionEnd() {
            toggleOverlay(navId, false);
        }
    }, [toggleOverlay, navId]);


    // Close the overlay if the type is not viewable
    useEffect(() => {
        if (show && !viewable) {
            close();
        }
    }, [show, viewable, close]);

    useEffect(() => {
        if (!show) return
        
        let t_id = setTimeout(() => {
            pushState(navId, close); // incase nav buttons are used
            mainRef.current.classList.remove("close")
        })

        return () => clearTimeout(t_id);
    }, [show]);


    return (
        show &&
        <div id="media-viewer" className={`prev-interface overlay flex mid-align ${full ? 'fullscreen' : ''}`}
            style={{ justifyContent: "center" }}
            ref={mainRef}
            onClick={toggleImmersion}
        >
            <div className="fw banner top-banner">
                <IconBtn icon={faArrowLeft} onClick={handleCloseClick} />
            </div>

            {args.type === 'image' && (
                <img className="mx-auto" src={localSrc} alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
            )}

            {args.type === 'video' && (
                <video className="mx-auto" src={localSrc} controls alt="" style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
            )}

            {args.type === 'audio' && (
                <audio className="mx-auto" src={localSrc} controls style={{ width: "95%", maxHeight: "100%", objectFit: "contain" }} />
            )}

            {
                caption &&
                <div className="fw banner bottom-banner crop-excess2">
                    {caption}
                </div>
            }
        </div>

    )

    function toggleImmersion() {
        setFull(!full);
    }

    function handleCloseClick(e) {
        e.stopPropagation();

        return new Promise(res => {
            const el = mainRef.current;

            if (!el) {
                res(false);
                return;
            }

            // If already closing, resolve immediately
            if (el.classList.contains("close")) {
                res(removeState(navId));
                return;
            }

            once(transitionEnd, el, () => {
                res(removeState(navId));
            });

            el.classList.add("close");
        });

    }

}