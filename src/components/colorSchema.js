function activateDarkMode() {
  const rootElement = document.querySelector(":root");
  const darkTheme = {
    "--bg": "rgb(26, 30, 34)",
    "--default": "#157efb"
  };
  for (const k in darkTheme) {
    rootElement.style.setProperty(k, darkTheme[k]);
  }
}

function activateLightMode() {
  const rootElement = document.querySelector(":root");
  const lightTheme = {
    "--font": "Source Code Pro",
    "--font2": "Source Sans Pro",
    "--light": "rgb(246, 248, 250)",
    "--blue": "rgb(0, 112, 243)",
    "--dark": "rgb(26, 30, 34)",
    "--row": "70em",
    "--in-row": "40em",
    "--black": "#000"
  };
  for (const k in lightTheme) {
    rootElement.style.setProperty(k, lightTheme[k]);
  }
}

/**
 * Sets a color scheme for the website.
 * If browser supports "prefers-color-scheme" it will respect the setting for light or dark mode
 * otherwise it will set a dark theme during night time
 */
function setColorScheme() {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isLightMode = window.matchMedia("(prefers-color-scheme: light)")
    .matches;
  const isNotSpecified = window.matchMedia(
    "(prefers-color-scheme: no-preference)"
  ).matches;
  const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addListener(e => e.matches && activateDarkMode());
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addListener(e => e.matches && activateLightMode());

  if (isDarkMode) activateDarkMode();
  if (isLightMode) activateLightMode();

  if (isNotSpecified || hasNoSupport) {
    console.info(
      "You specified no preference for a color scheme or your browser does not support it. I Schedule dark mode during night time."
    );
    const now = new Date();
    const hour = now.getHours();
    if (hour < 4 || hour >= 16) {
      activateDarkMode();
    }
  }
}

export default setColorScheme;
