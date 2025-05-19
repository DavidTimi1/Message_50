import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { useState } from "react";

function getPWADisplayMode() {
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  // iOS-specific check
  if (isIOS && window.navigator.standalone) {
    return 'standalone'; // iOS Safari in standalone mode
  }

  // Android TWA
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  }

  // Standard display-mode detection
  const modes = [
    'fullscreen', 'standalone', 'minimal-ui', 'browser', 'window-controls-overlay'
  ];

  for (const mode of modes) {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) {
      return mode;
    }
  }

  return 'unknown';
}


let initDisplayMode = null;
window.addEventListener('DOMContentLoaded', () => {
  // Log launch display mode to analytics

  initDisplayMode = getPWADisplayMode();
  console.log('DISPLAY_MODE_LAUNCH:', getPWADisplayMode());
});


let relatedApps = [];
if (navigator.getInstalledRelatedApps) {
  navigator.getInstalledRelatedApps()
    .then((apps) => {
      relatedApps = apps;
    })
    .catch((error) => {
      console.error('Error fetching related apps:', error);
    });
} else {
  console.log('getInstalledRelatedApps is not supported on this browser.');
}


const PWAContext = createContext(null);


const PWAProvider = ({ children }) => {
  const [displayMode, setDisplay] = useState(initDisplayMode);
  const isActive = ['standalone', 'twa'].includes(displayMode);
  const [isInstalled, setInstalled] = useState((relatedApps.length > 0) || isActive);
  const [installPrompt, setInstallPrompt] = useState();

  useEffect(() => {
    const appInstalled = () => {
      // Log install to analytics
      setInstalled(true);
      console.log('INSTALL: Success');
    };

    const installPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    const DOMLoaded = () => {
      // Replace "standalone" with the display mode used in your manifest
      window.matchMedia('(display-mode: standalone)')
        .addEventListener('change', () => {
          // Log display mode change to analytics
          setDisplay(getPWADisplayMode());
          console.log('DISPLAY_MODE_CHANGED', getPWADisplayMode());
        });
    };

    window.addEventListener('appinstalled', appInstalled);
    window.addEventListener('beforeinstallprompt', installPrompt);
    window.addEventListener('DOMContentLoaded', DOMLoaded);

    // Log install status to analytics

    return () => {
      window.removeEventListener('appinstalled', appInstalled);
      window.removeEventListener('DOMContentLoaded', DOMLoaded);
      window.removeEventListener('beforeinstallprompt', installPrompt);

    };
  }, []);


  return (
    <PWAContext.Provider value={{ isInstalled, isActive, displayMode, installPrompt }}>
      {children}
    </PWAContext.Provider>
  );
}


export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWADetails must be used within a PWAProvider');
  }
  return context;
}

export const installPWA = (prompt) => {
  if (!prompt)
    return
  // Show the install prompt
  prompt.prompt();

  // Wait for the user to respond to the prompt
  prompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
  });
}


export default PWAProvider;