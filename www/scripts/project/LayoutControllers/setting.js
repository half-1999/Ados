import * as OnTap from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import { StartHomeLayout } from "./home.js";
import { StartWalletLayout } from "./wallet.js";

const LAYOUT_NAME = "SETTING_LAYOUT";
const SETTINGS_LAYER = "SETTINGS_LAYER";
const PASSBOOK_LAYER = "PASSBOOK_LAYER";
const FAQ_LAYER = "FAQ_LAYER";
const REFERRAL_LAYER = "REFERRAL_LAYER";

let initialized;
let runtime;
let loginResponse;
let settingsLayer, passbookLayer, faqLayer, referralLayer;

function StartLayout(rntm , loginData)
{
	if(!initialized){
		initialized = true;
		runtime = rntm;
		loginResponse = loginData;
		runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
	}

	window.localStorage.getItem("fromDate", new Date().getDate() - 7);
    window.localStorage.setItem("ToDate", new Date());
	
	runtime.goToLayout(LAYOUT_NAME);
}

const OnLayoutLoaded = function(){
	let layout = runtime.layout;
	settingsLayer = layout.getLayer(SETTINGS_LAYER);
  	passbookLayer = layout.getLayer(PASSBOOK_LAYER);
  	faqLayer = layout.getLayer(FAQ_LAYER);
  	referralLayer = layout.getLayer(REFERRAL_LAYER);	
	
	settingsLayer.isVisible = false;
		passbookLayer.isVisible = false;
		faqLayer.isVisible = false;
		referralLayer.isVisible = false;
		
		
	StartSettingsLayer();
}

const StartSettingsLayer = function(){
	OnTap.ResetButtonListeners();
	
	setTimeout(()=>{
		settingsLayer.isVisible = true;
		passbookLayer.isVisible = false;
		faqLayer.isVisible = false;
		referralLayer.isVisible = false;
	}, 700);
	
	const backBtn = runtime.getInstanceByUid(219);
	const walletBtn = runtime.getInstanceByUid(140);
	const passbookBtn = runtime.getInstanceByUid(142);
	const referBtn = runtime.getInstanceByUid(145);
	const faqBtn = runtime.getInstanceByUid(148);
	const tncBtn = runtime.getInstanceByUid(171);
	
	OnTap.addOnTapButton(passbookBtn, ()=> UIUtils.ShowLoading(StartPassbookLayer));
	OnTap.addOnTapButton(referBtn, StartReferralLayer);
	OnTap.addOnTapButton(faqBtn, StartFaqLayer);
	OnTap.addOnTapButton(tncBtn, ()=> runtime.callFunction("GoToUrl", API.uri.TNC_URL()));
	OnTap.addOnTapButton(walletBtn, ()=> UIUtils.ShowLoading(()=>StartWalletLayout(runtime, loginResponse)));
	
	OnTap.addOnTapButton(backBtn, ()=> StartHomeLayout(runtime, loginResponse));
	
	UIUtils.HideLoading();
}

const StartPassbookLayer = function(){

	OnTap.ResetButtonListeners();
	settingsLayer.isVisible = false;
	passbookLayer.isVisible = false;
	faqLayer.isVisible = false;
	referralLayer.isVisible = false;
		
	setTimeout(()=>{
		settingsLayer.isVisible = false;
		passbookLayer.isVisible = true;
		faqLayer.isVisible = false;
		referralLayer.isVisible = false;
	}, 700);
	const totalBalance = runtime.getInstanceByUid(106);
	const backBtn = runtime.getInstanceByUid(217);
	const viewResult = runtime.getInstanceByUid(13);
	
	API.GET(API.uri.WALLET_MONEY_URL(), (balanceResponse)=> {
		UIUtils.HideLoading();
		totalBalance.text = "₹ " + balanceResponse.total;
	}, null);

	OnTap.addOnTapButton(backBtn, StartSettingsLayer);
	OnTap.addOnTapButton(viewResult, ()=> {
		UIUtils.ShowLoading(()=> setTimeout(()=> UIUtils.HideLoading(), 1000));
	});
}

const StartFaqLayer = function(){
	OnTap.ResetButtonListeners();
	settingsLayer.isVisible = false;
	passbookLayer.isVisible = false;
	faqLayer.isVisible = true;
	referralLayer.isVisible = false;
	
	const backBtn = runtime.getInstanceByUid(163);
	const mailUsBtn = runtime.getInstanceByUid(81);
	
	OnTap.addOnTapButton(backBtn, StartSettingsLayer);
	
	OnTap.addOnTapButton(mailUsBtn, ()=> {
		let subject = `Discussion | ${API.config.NAME} [${loginResponse.id} | ${loginResponse.phone}]`;
		let body = " ";
		let escapedSubject = myEscapeURL(subject);
		let escapedBody = myEscapeURL(body);
		runtime.callFunction("GoToUrl", `mailto:contact@aimcomely.com?subject=${escapedSubject}&body=${escapedBody}`);
		
		function myEscapeURL(url) {
		  return encodeURIComponent(url).replace(/\+/g, "%20");
		}
	});
}

const StartReferralLayer = function(){
	OnTap.ResetButtonListeners();
	settingsLayer.isVisible = false;
	passbookLayer.isVisible = false;
	faqLayer.isVisible = false;
	referralLayer.isVisible = true;
	
	const referralCode = runtime.getInstanceByUid(110);
	const backBtn = runtime.getInstanceByUid(166);
	const copyClipboardBtn = runtime.getInstanceByUid(161);
	const whatsappBtn = runtime.getInstanceByUid(156);
	const facebookBtn = runtime.getInstanceByUid(159);
	
	referralCode.text = loginResponse.myReferral;
	
	OnTap.addOnTapButton(backBtn, StartSettingsLayer);
	OnTap.addOnTapButton(copyClipboardBtn, ()=> navigator.clipboard.writeText(referralCode.text));
	
	OnTap.addOnTapButton(facebookBtn, ()=> 	runtime.callFunction("GoToUrl", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(loginResponse.downloadLinksMessage)}`));
	
	OnTap.addOnTapButton(whatsappBtn, ()=> runtime.callFunction("GoToUrl", `https://api.whatsapp.com/send?text=${encodeURIComponent("Download This Cool App With Given Link!")}%20${encodeURIComponent(loginResponse.downloadLinksMessage)}`));
	
}

export {StartLayout as StartSettingLayout};