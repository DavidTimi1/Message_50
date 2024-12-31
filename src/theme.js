const THEMES = ["light", "dark"];
const themeColors = ["#eee", "#030508"]

export function getTheme() {
    let pref = localStorage.getItem("theme");
    if (!pref) {
        let prefLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        pref = prefLight ? "light" : "dark"
    }

    return pref;
}


export function changeTheme(){
    const theme = getTheme();
    const newTheme = THEMES[THEMES.indexOf(theme) ? 0 : 1];

    const root = document.querySelector(":root"), themeColor = root.querySelector("meta[name='theme-color']"), colorScheme = root.querySelector("meta[name='color-scheme']");

    if (theme === "light") {
        colorScheme.content = "dark";
        themeColor.content = themeColors[1];

    } else {
        colorScheme.content = "light";
        themeColor.content = themeColors[0];
    }

    try {
        localStorage.setItem("theme", newTheme)
    } catch (err) {
        console.error(err)
    }

    return newTheme
}
