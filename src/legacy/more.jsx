import { useState } from "react"
import { standardUnit } from "../helpers";
import { ContactCard } from "./popups";
import Feedback from "./feedback";



export function More({ openOverlays }) {

    return (
        <>
            <Overlay component={ContactCard} name="contact-card" />
            <Overlay component={Feedback} name="feedback" />
        </>
    )


    function Overlay({ component, name }) {
        const show = openOverlays.get(name);

        return component({ show: Boolean(show), args: show })
    }

}


export function BgImg({ src, inline, children, style }) {
    let styles = { backgroundImage: `url(${src})` };
    if (inline) {
        styles = { ...styles, width: "1.5em", aspectRatio: "1/1" }
    }
    styles = { ...styles, ...style }


    return (
        <div className={`bg-img ${inline ? '' : "max"}`} style={styles}>
            <div className='sr-only'>
                {children}
            </div>
        </div>
    )
}

export function Loading({ children }) {

    return (
        <div className="abs mid-align fw">

            <div className="center-text">
                {children}
            </div>
        </div>
    )
}


export function TimePast({ time }) {
    const [value, setValue] = useState(timePast(time));

    setTimeout(() => setValue(timePast(time)), 60000);

    return (
        <>{value}</>
    )

}


function timePast(timestamp) {
    const data = standardUnit('timestamp', (new Date().getTime() - timestamp) / 1000);

    if (!data) throw Error("Invalid timestamp value");
    let { year, month, day, hr, min } = data;

    if (year - 1970)
        return `${year} year${year > 1 ? 's' : ''} ago`

    if (month)
        return `${month} month${month > 1 ? 's' : ''} ago`

    if (--day) {
        const week = day > 13 && Math.floor(day / 7);
        if (week)
            return `${week} weeks ago`

        return `${day} day${day > 1 ? 's' : ''} ago`
    }

    if (hr)
        return `${hr} hour${hr > 1 ? 's' : ''} ago`

    if (min)
        return `${min} min${min > 1 ? 's' : ''} ago`

    return `Just now`
}