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


export class TransferNotification {
    constructor(type) {
        this.type = type;
        this.total = 0;
        this.loaded = 0;
        this.completed = true;
        this.transfers = [];
    }

    add(source) {
        let id = this.transfers.length;
        this.transfers.push(source && this.type === "downloads" ? { source } : {});
        this.completed = false;
        return id
    }

    stop(id) {
        dispatchEvent(new Event(this.type.slice(0, -1) + 'stopped-' + id));
        this.transfers.splice(id);
        this.length--;
    }

    update(id, loaded, total) {
        if (!this.transfers[id]?.loaded) {
            this.transfers[id].loaded = loaded;
            this.transfers[id].total = total;
        }

        let diff = loaded - this.transfers[id].loaded
        this.transfers[id].loaded = loaded;
        this.loaded += diff;
    }

    ended(id) {
        // let ddet = this.transfers[id];
        this.completed = true;
    }
}

export const downloadNotifications = new TransferNotification("downloads");
export const uploadNotifications = new TransferNotification("uploads");


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

export const standardUnit = (quantity, value) => {
    let time;
    switch (quantity) {
        case "timestamp":
            time = new Date(value);

            return {
                sec: time.getSeconds(),
                min: time.getMinutes(),
                hr: time.getHours(),
                weekday: time.getDay(),
                day: time.getDate(),
                month: time.getMonth(),
                year: time.getFullYear()
            }

        case "time":
            time = new Date(value);
            // show time in fromat hour:mins
            return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

        case "data":
            if (!value) return value;

            let pow = Math.floor(Math.log10(value) / Math.log10(1024));
            switch (pow) {
                case 0: return value + "B";
                case 1: return (value / 1024).toFixed(1) + "KB";
                case 2: return (value / (1024 ** 2)).toFixed(1) + "MB";
                default: return (value / (1024 ** 3)).toFixed(1) + "GB";
            }

        default: {
            console.error("Default case!!!")
        }
    }
}

export const bytesToURL = (url) => {
    return new Promise((res, rej) => {
        let img = new Image();

        img.onerror = rej;

        img.onload = _ => {
            // Create a canvas element to manipulate the image
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");

            // Set the canvas dimensions to match the image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            context.drawImage(img, 0, 0);

            // Get the image data as a data URL
            res(canvas.toDataURL()) // You can specify the image format you want
        }
        img.src = url;
    })
}


export async function runOnComplete(param, ev, el, func, args) {
    func = func ?? mTFunc;

    return new Promise( resolve => {
        if (param) resolve();
            
        else once( ev, el, resolve )

    }).then (() =>  args ? func?.(...args) : func?.() )

    
    function mTFunc(){}
}


export function startInterval(func, interval) {
    func?.();
    return setInterval(func, interval)
}


export function csrf() {
    return document.cookie.split("csrf_token=")?.[1]?.split?.(";")?.[0];
}

export function timePast(timestamp) {
    const currentTime = new Date().getTime();
    const data = standardUnit('timestamp', currentTime - timestamp);

    if (!data) throw Error("Invalid timestamp value");
    let { year, month, day, hr, min } = data;

    if (year - 1970)
        return `${year} yr${year > 1 ? 's' : ''}`

    if (month)
        return `${month} mo${month > 1 ? 's' : ''}`

    if (--day) {
        const week = day > 13 && Math.floor(day / 7);
        if (week)
            return `${week} wks`

        return `${day} day${day > 1 ? 's' : ''}`
    }

    if (min > 2)
        return standardUnit('time', timestamp)

    return `Just now`
}



export const createVideoThumbnail = (videoFile, width = 100, height = 100, seekTime = 0) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.src = URL.createObjectURL(videoFile);

        video.onloadedmetadata = () => {
            video.currentTime = seekTime;
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject('Error creating thumbnail blob');
                }
            }, 'image/jpeg', 0.8);
        };

        video.onerror = (error) => {
            reject(`Error processing video: ${error.message}`);
        };
    });
};

export const createImgThumbnail = (fileData, width = 100, height = 100) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject('Error creating thumbnail blob');
                }
            }, 'image/jpeg', 0.8);
        };

        img.onerror = (error) => {
            reject(`Error loading image: ${error.message}`);
        };

        img.src = URL.createObjectURL(fileData);
    });
};