import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const IconBtn = (props) => {
    let {href, onClick, icon, size, children, type, bg} = props, styles = {};
    size = size ?? "xl"

    if (bg) styles["--bg"] = bg;

    
    if (href){
        return (
            <a href={href} target="_blank" rel="noreferrer" className="no-btn icon-btn" onClick={onClick} style={styles} >
                <div className="abs-mid btn-bg fw"></div>
                <FontAwesomeIcon icon={icon} size={size} />
                <span className="sr-only"> {children} </span>
            </a>
        )
    }
 
    return (
        <button type={type ?? "button"} className="no-btn icon-btn" onClick={onClick} style={styles} >
            <div className="abs-mid btn-bg fw"></div>
            <FontAwesomeIcon icon={icon} size={size} />
            <span className="sr-only"> {children} </span>
        </button>
    )
}