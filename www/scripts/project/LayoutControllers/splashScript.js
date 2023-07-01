import { GET, config as APIConfig, uri as APIUri , CacheDataInStorage} from "../Utils/API.js";
import * as UIUtils from "../Utils/UIUtils.js";
import { StartAuthenticationLayout } from "./authentication.js";
import { StartHomeLayout } from "./home.js";

const LAYOUT_NAME = "SPLASH_LAYOUT";
let runtime;

const StartLayout = function(rntm) {
	runtime = rntm;
    runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
    runtime.goToLayout(LAYOUT_NAME);
};

const OnLayoutLoaded = function() {
	runtime.callFunction("PlayBackground")
    setTimeout(SilentLogin, 3000);
};

const SilentLogin = function() {
	const token = APIConfig.TOKEN;
    if (token != null && token != "") {
        GET(APIUri.SILENT_LOGIN_URL(), LoginResponse, (errorResponse) => {
	UIUtils.ShowLoading(()=> StartAuthenticationLayout(runtime));
        });
    } else {
	UIUtils.ShowLoading(()=> StartAuthenticationLayout(runtime));
    }
};

const LoginResponse = function(loginResponse) {
    if (loginResponse.error) {
	UIUtils.ShowLoading(()=>StartAuthenticationLayout(runtime));
    } else {
        if (loginResponse.version != APIConfig.VERSION) {
			const showUpdateAppPopup = function(){
					UIUtils.ShowPopup(UIUtils.config.UPDATE_APP, ()=> {
					showUpdateAppPopup();
					LoginResponse(LoginResponse);
					runtime.callFunction("GoToUrl", loginResponse.android);
				});
			}
			showUpdateAppPopup();
        } else {
		
			CacheDataInStorage("States", loginResponse.STATES);
			CacheDataInStorage("NotAllowedStates", loginResponse.NOT_ALLOWED_STATES);
			UIUtils.ShowLoading(()=>StartHomeLayout(runtime, loginResponse));
        }
    }
};

export { StartLayout as StartSplashLayout };
