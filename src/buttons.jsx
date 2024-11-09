export function Button(props){
    const {className, hover, children, style, onClick, type} = props;
    

    return (
        <button type={type ?? "button"} onClick={onClick} className={"btn btn-primary " + (className ?? '')} data-toggle={hover && "tooltip"} style={style} title={hover}>
            <div className="abs btn-bg"></div>
            {children}
        </button>
    )
}


export function IconBut(props){
    let {href, onClick, onContextMenu, hover, className, children, type} = props;
    
    if (href){
        return (
            <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className="no-link">
                <div className="abs btn-bg"></div>
                <i className={className}> {children} </i>
            </a>
        )
    }
 
    return (
        <button type={type ?? "button"} onClick={onClick} onContextMenu={onContextMenu} className="no-btn" data-toggle={hover && "tooltip"} title={hover}>
            <div className="abs btn-bg"></div>
            <i className={className}> {children} </i>
        </button>
    )
}