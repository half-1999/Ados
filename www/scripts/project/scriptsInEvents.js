import * as TapButtons from './Utils/TapButtons.js';
import * as UIUtils from './Utils/UIUtils.js';
import { StartSplashLayout } from './LayoutControllers/splashScript.js';

runOnStartup(async (runtime) => {
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
	try{
		// Check if the Wake Lock API is available
if ('wakeLock' in navigator) {
  // Request a wake lock
  async function requestWakeLock() {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock activated!');
  
      // Handle if the wake lock is released
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock released!');
      });
    } catch (error) {
      console.error('Error requesting wake lock:', error);
    }
  }
  
  // Call the function to request a wake lock
  requestWakeLock();
} else {
  console.log('Wake Lock API is not supported in this browser.');
}

	}catch(e){}
	
});

async function OnBeforeProjectStart(runtime) {
	TapButtons.Init(runtime)
	UIUtils.Init(runtime)
	StartSplashLayout(runtime);
}

function OnTap() {
  TapButtons.OnTap();
}


const scriptsInEvents = {

	async Global_eventsheet_Event1_Act4(runtime, localVars)
	{
		OnTap()
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

