import * as OnTap from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import { StartSettingLayout } from "./setting.js";
import { StartWalletLayout } from "./wallet.js";
import { StartMatchMakingLayout } from "./matchMaking.js";

const LAYOUT_NAME = "HOME_LAYOUT";

// let runtime;
// let loginResponse;

// function StartLayout(rntm, loginData)
// {
// 	runtime = rntm;
// 	loginResponse = loginData;
// 	try { runtime.getLayout(LAYOUT_NAME).removeEventListener("afterlayoutstart", OnLayoutLoaded);
// 	} catch (error) { }
// 	runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
// 	runtime.goToLayout(LAYOUT_NAME);
// }

// After Add Money
let initialized;
let runtime;
let loginResponse;
let registeredBannerBtn = false;

function StartLayout(rntm, loginData)
{
	if(!initialized){
		initialized = true;
		runtime = rntm;
		loginResponse = loginData;
		runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
	}
	runtime.goToLayout(LAYOUT_NAME);
}

const OnLayoutLoaded = function(){
	OnTap.ResetButtonListeners();
	
	const homeBtn = runtime.getInstanceByUid(49);
	const settingBtn = runtime.getInstanceByUid(5);
	const walletBtn = runtime.getInstanceByUid(4);
	
	OnTap.addOnTapButton(homeBtn, ()=>
	{
	UIUtils.ShowLoading(()=>StartMatchMakingLayout(runtime, loginResponse));
	});
	
	OnTap.addOnTapButton(walletBtn, ()=>
	{
	UIUtils.ShowLoading(()=>StartWalletLayout(runtime, loginResponse));
	});
	
	OnTap.addOnTapButton(settingBtn, ()=>
	{
	UIUtils.ShowLoading(()=>StartSettingLayout(runtime, loginResponse));
	});
	
	UIUtils.HideLoading();
	
	UpdateHomeBanner();
}

const UpdateHomeBanner = function(){
	let browserUrl;
	const onBannerClicked = function(){
		if(browserUrl != null){
			runtime.callFunction("GoToURL", browserUrl);
		}
		else{
			UIUtils.ShowLoading(()=> StartMatchMakingLayout(runtime, loginResponse));		
		}
	}

	API.GET(API.uri.BANNER_URL(), (response)=>{
		browserUrl = response.data[0].browserUrl;
		let thumbnailUrl = response.data[0].image;
		bannerIframe.isVisible = true;
		bannerIframe.contentWindow.UpdateBanner(thumbnailUrl, onBannerClicked);
	},()=>{});
}

// function OnLayoutLoaded(runtime)
// {

// 	console.log("Home Layout Called");
// 	var HOME_LAYER = runtime.layout.getLayer(2);
	
// 	ResetButtonListeners(3)
	
// // Tap on Play_Btn
// addButtonOnTap(0 , runtime.objects.Play_Btn.getFirstInstance() , ()=>
// 	{
// 		MatchMakingStartLayout(runtime, loginResponse);
// 		console.log(loginResponse)
// 	})
	
// // Tap on Wallet_Btn
// addButtonOnTap(1 , runtime.getInstanceByUid(26), ()=>
// 	{
// 		WalletStartLayout(runtime, loginResponse);
// 		console.log(loginResponse)
		
// 	})
// // Tap on Setting_Btn
// addButtonOnTap(2 ,runtime.getInstanceByUid(27) , ()=>
// 	{
// 		SettingStartLayout(runtime , loginResponse);
// 		console.log(loginResponse)
		
// 	})


// function showPopUp ( runtime )
// {
// //=========Popups code==================//
// // Popup Buttons Instance
// var confirm=runtime.getInstanceByUid(276);
// var cancel=runtime.getInstanceByUid(278);
// var ok=runtime.getInstanceByUid(277);
// // Popup Text Instance
// var heading=runtime.getInstanceByUid(280).text;
// var description=runtime.getInstanceByUid(279).text;
// //Layers
// var GlobalLayer = runtime.layout.getLayer(0);
// var HOME_LAYER = runtime.layout.getLayer(1);

// // Disable Current Layer
// 	HOME_LAYER.isVisible = false;
// 	GlobalLayer.isVisible = true;

// 	ResetButtonListeners(3)

// // Tap on Cancel_Btn
// addButtonOnTap(0 , runtime.getInstanceByUid(278) , ()=>
// 	{
// 		console.log("Cancel")
// 		// Popup Disable
// 		GlobalLayer.isVisible = false;
// 		HOME_LAYER.isVisible = true;
// 	})
	
// 	// Tap on Confirm_Btn
// addButtonOnTap(1 , runtime.getInstanceByUid(276) , ()=>
// 	{
// 		console.log("Ok")
// 		// What to do next
// 		GlobalLayer.isVisible = false;
// 		HOME_LAYER.isVisible = true;
// 	})
	
// 	// Tap on Ok_Btn
// addButtonOnTap(2 , runtime.getInstanceByUid(277) , ()=>
// 	{
// 		console.log("Confirm")
// 		// What to do next
// 		GlobalLayer.isVisible = false;
// 		HOME_LAYER.isVisible = true;
		
// 	})
// }
// //showPopUp(runtime)
// }


export {StartLayout as StartHomeLayout};