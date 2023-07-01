import * as OnTap from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import { StartHomeLayout } from "./home.js";


const LAYOUT_NAME = "AUTHENTICATION_LAYOUT";
const SIGNUP_LAYER = "SIGNUP_LAYER";
const OTP_LAYER = "OTP_LAYER";
const MOBILE_INPUT_LIMIT = 10;
const OTP_INPUT_LIMIT = 6;
const OTP_TIMER = 60;

let initialized;
let runtime;
let signUpLayer, otpLayer;
let referral, referralId;

const StartLayout = function(rntm) {
	if(!initialized){
		initialized = true;
		runtime = rntm;
		runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
	}
    runtime.goToLayout(LAYOUT_NAME);
}

const OnLayoutLoaded = function() {
    const layout = runtime.layout;
    signUpLayer = layout.getLayer(SIGNUP_LAYER);
    otpLayer = layout.getLayer(OTP_LAYER);

	UIUtils.HideLoading();
	
	setTimeout(StartSignUpLayer, 700);
	
	try{
	//https://p1.funnearn.com/api/lagos/referral-ip
	API.GET(API.uri.REFERRAL_IP_URL(), (referralResponse)=> {
		//referralResponse.data.id
		//referralResponse.data.referral
		referral = referralResponse.data.referral;
		referralId = referralResponse.data.id;
		runtime.getInstanceByUid(30).text = referral;
	}, null);
	}
	catch(e){
		console.log("Unable to get referral id for this ip,  reason: " + e);
	}

}

const StartSignUpLayer = function() {
    OnTap.ResetButtonListeners();
    signUpLayer.isVisible = true;
    otpLayer.isVisible = false;

    const signUpButton = runtime.getInstanceByUid(10);
    const tncButton = runtime.getInstanceByUid(18);
    const tncToggle = runtime.getInstanceByUid(39);
    const nameInput = runtime.getInstanceByUid(16);
    const phoneInput = runtime.getInstanceByUid(258);
    const referralInput = runtime.getInstanceByUid(30);

    let tncAccepted = true;

    OnTap.addOnTapButton(tncButton, () => {
        runtime.callFunction("GoToUrl", API.uri.TNC_URL());
    });

    OnTap.addOnTapButton(tncToggle, () => {
        tncAccepted = !tncAccepted
        tncToggle.setAnimation(tncAccepted ? "On" : "Off");
        signUpButton.opacity = tncAccepted ? 1 : 0.5;
    });


    phoneInput.addEventListener("change", () => {
        if (phoneInput.text.length > MOBILE_INPUT_LIMIT) {
            phoneInput.text = phoneInput.text.substr(0, MOBILE_INPUT_LIMIT);
        }
    });
	
	const showInputs = function(state){
		nameInput.isVisible = state;
		phoneInput.isVisible = state;
		referralInput.isVisible = state;
	}

    OnTap.addOnTapButton(signUpButton, () => {
        if (nameInput.text == "") {
			showInputs(false);
            UIUtils.ShowPopup(UIUtils.config.ENTER_NAME, ()=> showInputs(true));
        } else if (phoneInput.text == "") {
			showInputs(false);
            UIUtils.ShowPopup(UIUtils.config.ENTER_NUMBER, ()=> showInputs(true));
        } else if (!tncAccepted) {
			showInputs(false);
            UIUtils.ShowPopup(UIUtils.config.ACCEPT_TNC, ()=> showInputs(true));
        } else if (phoneInput.text.length < MOBILE_INPUT_LIMIT) {
            showInputs(false);
			UIUtils.ShowPopup(UIUtils.config.INCORRECT_NUMBER_LENGTH, ()=> showInputs(true));
        } else {
            const requestBody = {
                name: nameInput.text,
                phone: phoneInput.text,
                referral: referral,
                referralsourceId: referralId,
                type: API.config.TYPE,
                os: navigator.userAgent,
                typeOfUser: API.config.TYPE_OF_USER,
            };
            API.POST(API.uri.SIGNUP_URL(), (signUpResponse) => StartOTPLayer(signUpResponse.data.id), null, requestBody);
        }
    });
}


const StartOTPLayer = function(userID) {
    OnTap.ResetButtonListeners();
    otpLayer.isVisible = true;
    signUpLayer.isVisible = false;

    const loginButton = runtime.getInstanceByUid(36);
    const otpInput = runtime.getInstanceByUid(17);
    const timerText = runtime.getInstanceByUid(250);
    const resendOTPText = runtime.getInstanceByUid(254);
    const resendOTPBtn = runtime.getInstanceByUid(103);

    otpInput.addEventListener("change", () => {
        if (otpInput.text.length > OTP_INPUT_LIMIT) {
            otpInput.text = otpInput.text.substr(0, OTP_INPUT_LIMIT);
        }
    });

    let otpTimer = null;
    let StartOTPTimer = function() {
        resendOTPText.opacity = 0.5;
        let time = OTP_TIMER - 1;

        otpTimer = setInterval(() => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            timerText.text = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
            if (time-- < 0) {
                clearInterval(otpTimer);
                resendOTPText.opacity = 1;
                timerText.text = "";
            }
        }, 1000);
    }
    StartOTPTimer();

    OnTap.addOnTapButton(resendOTPBtn, () => {
        if (timerText.text == "") {
            var resendOTPRequestBody = {
                id: userID,
                typeOfUser: API.config.TYPE_OF_USER
            }
            API.POST(API.uri.RESEND_OTP_URL(), () => StartOTPTimer(), null, resendOTPRequestBody);
        }
    });
    OnTap.addOnTapButton(loginButton, () => {
        const otplength = otpInput.text.length;
        if (otpInput.text == "" || otpInput.text.length < OTP_INPUT_LIMIT) {
			otpInput.isVisible = false;
			UIUtils.ShowPopup(UIUtils.config.NOT_FIELD_DATA, ()=> otpInput.isVisible = true);
        } else {
            const otpRequestBody = {
                otp: otpInput.text,
                id: userID,
            };
            API.POST(API.uri.SUBMIT_OTP_URL(), (otpResponse) => {
                if(otpResponse.error){
					UIUtils.ShowPopup(UIUtils.config.INVALID_OTP, ()=> {});
				}
				else{
				        if (otpTimer != null) {
            clearInterval(otpTimer);
        }
					localStorage.setItem("token", otpResponse.token);
                setTimeout(() => {
                    API.GET(API.uri.SILENT_LOGIN_URL(), (loginResponse) => {
                        if (loginResponse.version != API.config.VERSION) {
const showUpdateAppPopup = function(){
					UIUtils.ShowPopup(UIUtils.config.UPDATE_APP, ()=> {
					showUpdateAppPopup();
// 					LoginResponse(loginResponse);
					runtime.callFunction("GoToUrl", loginResponse.android);
				});
			}
			showUpdateAppPopup();
                        } else {
						
							API.CacheDataInStorage("States", loginResponse.STATES);
							API.CacheDataInStorage("NotAllowedStates", loginResponse.NOT_ALLOWED_STATES);
                            UIUtils.ShowLoading(()=>StartHomeLayout(runtime, loginResponse));
                        }
                    });
                }, 1000);
				}
				}, null, otpRequestBody);
        }
    });

}

export { StartLayout as StartAuthenticationLayout };