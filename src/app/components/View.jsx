import { forwardRef } from "react";

import '../../ui/views.css';


export const View = forwardRef(({ children, viewHead }, ref) => {

    return (
        <div className="view-container mega-max close" ref={ref}>
            <div className="max">
                <div className="view fw flex-col max">
                    {viewHead}
                    <div className="content fw grow">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
})

export const RouteContainer = forwardRef(({ children, heading, id }, ref) => {

    return (
        <div className="route-container max close" id={id} ref={ref}>
            <div className="max">
                <div className="flex-col max">
                    {heading}
                    <div className="fw grow" style={{overflow: "hidden"}}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
})


export function ViewHead({ children }) {
    return (
        <div className="heading fw flex mid-align gap-2">
            {children}
        </div>
    )
}