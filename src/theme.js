const THEMES = ["light", "dark"];

export function getTheme() {
    let pref = localStorage.getItem("theme");
    if (!pref) {
        let prefLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        pref = prefLight ? "light" : "dark"
    }
    // let invPref = THEMES[!THEMES.indexOf(pref)];

    return pref;
}


export function changeTheme(){
    const html = document.querySelector("html"), theme = getTheme();
    let colScheme = document.querySelector("meta[name=color-scheme]");
    const newTheme = THEMES[THEMES.indexOf(theme) ? 0 : 1];

    if (!colScheme){
        colScheme = document.createElement('meta');
        colScheme.setAttribute('name', "color-scheme");
    }

    if (theme === "light") {
        colScheme.content = "light dark";
        html.classList.add("dark-mode");
    } else {
        colScheme.content = "light";
        html.classList.remove("dark-mode");
    }

    try {
        localStorage.setItem("theme", newTheme)
    } catch (err) {
        console.error(err)
    }

    return newTheme
}