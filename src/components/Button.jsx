import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export const IconBtn = (props) => {
    let {href, onClick, icon, size, children, type, bg, disabled} = props, styles = {};
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
        <button type={type ?? "button"} className="no-btn icon-btn" disabled={disabled} onClick={onClick} style={styles} >
            <div className="abs-mid btn-bg fw"></div>
            <FontAwesomeIcon icon={icon} size={size} />
            <span className="sr-only"> {children} </span>
        </button>
    )
}


export function Button(props){
    const type = props.type ?? "button";
    const {className} = props;
    

    return (
        <button {...props} type={type} className={"my-btn no-btn " + (className ?? '')}>
            <div className="btn-bg">
                <div className="btn max">
                    {props.children}
                </div>
            </div>
        </button>
    )
}