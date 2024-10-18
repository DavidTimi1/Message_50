export const $ = (elem, inParent) => {
    let parent = inParent ? inParent : document;

    let pre = elem[0];
    elem = elem.slice(1);

    switch (pre) {
        // if query was given
        case "q": return parent.querySelector(`${elem}`);
        // if id is given
        case "#": return parent.getElementById(`${elem}`);
        // if classname(s) were given
        case ".": return parent.getElementsByClassName(`${elem}`)
        // else tagnames were given
        default: return parent.getElementsByTagName(`${pre + elem}`);
    }
}


export const root = $("q:root");


export const on = (eventType, elem, func, args) => {
    if (typeof (elem) === 'function')
        // variable shift
        window.addEventListener(eventType, elem, func)
    else
        elem?.addEventListener(eventType, func, args)
}

export const once = (eventType, elem, func, args) => {
    if (typeof (elem) === 'function')
        // variable shift
        window.addEventListener(eventType, elem, { once: true, ...func })
    else
        elem?.addEventListener(eventType, func, { once: true, ...args })
}

export const int = str => parseInt(str)



export const hasTouchSupport = _ => 'ontouchstart' in window || navigator.maxTouchPoints > 0


export const getTransitionEndEventName = _ => {
    let transitions = {
        transition: "transitionend",
        OTransition: "oTransitionEnd",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
    }
    let bodyStyle = document.body.style;
    for (let transition in transitions)
        if (bodyStyle[transition] !== undefined)
            return transitions[transition];
}

export const transitionEnd = getTransitionEndEventName();


export const progressDownload = (url, downId, progressFunc, responseType = 'blob') => {
    return new Promise((res, rej) => {
        let xhr = new XMLHttpRequest();
        on('readystatechange', xhr, _ => {
            if (xhr.readyState === 2 && xhr.status === 200) {
                // Download is being started
                on('progress', xhr, progressFunc);
            } else if (xhr.readyState === 4) {
                // Downloaing has finished
                xhr.status < 400 ? res(xhr.response) : rej(xhr.response)
            }
        });

        xhr.onerror = _ => rej("Could not download resource!: " + xhr.status + ".")
        xhr.onabort = _ => rej("Download stopped")

        on('downloadstopped-' + downId, xhr.abort, { once: true })

        xhr.responseType = responseType;
        xhr.open("get", url)
        xhr.send();
    })
}


export const progressUpload = (url, upId, progressFunc, data, responseType = "json") => {
    return new Promise((res, rej) => {
        let xhr = new XMLHttpRequest();

        xhr.upload.onloadstart = _ => {
            console.log("Upload has begun");

            xhr.upload.onprogress = progressFunc;
        }


        xhr.upload.onerror = _ => rej("Could not upload file!: " + xhr.status + ".");
        xhr.onload = _ => res(xhr.response);

        xhr.onabort = _ => rej("Upload stopped")

        on('uploadstopped-' + upId, xhr.abort, { once: true })

        xhr.responseType = responseType;
        xhr.open("post", url)
        xhr.send(data);
    })
}


export const title = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();


export const formButton = form => form.querySelector("button:not([type]), button[type=submit]");


export const sanitize = text => encodeURI(text);


export function* generateArray(arr) {
    for (let item of arr) yield item
}


export function isRendered(elem){
    ```Checks if an element is in the DOM```
    return Boolean(elem.closest('html'))
}