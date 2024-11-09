import { on, once } from "./ui/helpers";


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
    switch (quantity) {
        case "timestamp":
            value *= 1000;
            let time = new Date(value);

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
            value = Math.floor(value);
            let hrs = Math.floor(value / 3600);
            let val2 = value % 3600;
            let mins = Math.floor(val2 / 60);
            let secs = val2 % 60;
            let str = (hrs && mins < 10 ? "0" + mins : mins) + ":" + ((secs >= 10) ? secs : "0" + secs);

            return hrs ? `${hrs}:${str}` : str;

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


export function runOnComplete(param, ev, el, func, args) {
    if (param) args ? func?.(...args) : func?.()
    else once(ev, el, _ => args ? func?.(...args) : func?.())
}


export function startInterval(func, interval) {
    func?.();
    return setInterval(func, interval)
}


export function csrf() {
    return document.cookie.split("csrf_token=")?.[1]?.split?.(";")?.[0];
}