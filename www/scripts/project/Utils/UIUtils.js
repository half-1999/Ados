import * as OnTap from "./TapButtons.js";

export const config = {
  UPDATE_APP: { ttl: "UPDATE APP", dec: "IT SEEMS YOU ARE USING AN OLDER VERSION. PLEASE DOWNLOAD THE NEW VERSION APP", cnlBtn: false, btnTxt: "UPDATE" },
  NOT_FIELD_DATA: { ttl: "SORRY", dec: "PLEASE FILL DETAILS PROPERLY", cnlBtn: false, btnTxt: "OKAY" },
  INVALID_OTP: { ttl: "SORRY", dec: "INVALID OTP. PLEASE ENTER THE 6-DIGIT OTP YOU'VE RECEIVED ON YOUR PHONE", cnlBtn: false, btnTxt: "OKAY" },
  INSUFFICIENT_BALANCE: { ttl: "SORRY", dec: "NOT ENOUGH MONEY IN YOUR WALLET TO PLAY THIS GAME", cnlBtn: false, btnTxt: "OKAY" },
  INCORRECT_NUMBER_LENGTH: { ttl: "SORRY", dec: "PLEASE ENTER A 10-DIGIT NUMBER", cnlBtn: false, btnTxt: "OKAY" },
  INCORRECT_OTP_LENGTH: { ttl: "SORRY", dec: "PLEASE ENTER A 6-DIGIT OTP", cnlBtn: false, btnTxt: "OKAY" },
  ACCEPT_TNC: { ttl: "SORRY", dec: "PLEASE ACCEPT T&C", cnlBtn: false, btnTxt: "OKAY" },
  ENTER_NUMBER: { ttl: "SORRY", dec: "PLEASE ENTER A NUMBER!", cnlBtn: false, btnTxt: "OKAY" },
  ENTER_NAME: { ttl: "SORRY", dec: "PLEASE ENTER A NAME!", cnlBtn: false, btnTxt: "OKAY" },
  SUCCESS_WITHDRAWAL: { ttl: "CONGRATULATIONS", dec: "MONEY HAS BEEN SUCCESSFULLY WITHDRAWN TO YOUR ACCOUNT", cnlBtn: false, btnTxt: "OKAY" },
    SUCCESS_ADDMONEY: { ttl: "CONGRATULATIONS", dec: "MONEY HAS BEEN SUCCESSFULLY ADDED TO YOUR ACCOUNT", cnlBtn: false, btnTxt: "OKAY" },
	 FAILED_ADDMONEY: { ttl: "SORRY", dec: "ADD MONEY REQUEST FAILED", cnlBtn: false, btnTxt: "OKAY" },
  NETWORK_ERROR: { ttl: "SORRY", dec: "PLEASE CHECK YOUR INTERNET AND TRY AGAIN!!", cnlBtn: false, btnTxt: "RETRY" },
  TICKET_CONFIRMATION: { ttl: "LET'S GO", dec: "DO YOU WANT TO PLAY THE GAME?", cnlBtn: true, btnTxt: "YES" }
};


const LOADING_SHOW_TIME = 0.3;
const POPUP_SHOW_TIME = 0.3;
const disabledLayers = [];

let runtime;

let currentlyShowingPopup = false;
let popupBg;
let popupTween;
let mainLayer;

let currentlyLoading = false;
let loadingBg;
let loadingTween;
const tweenProperty = {
   	loop: false,
   	pingPong: false,
   	repeatCount: 1
};

export function Init(rntm){
	runtime = rntm;
}

export const ShowLoading = function(OnLoadingStarted){
	const loading = function(){
	OnTap.OnTapEnabled(false);
	disableAllLayers();
	
// 	try{
// 		mainLayer = runtime.layout.getLayer(0);
//   		lerpLayerOpacity(mainLayer,1,0,0.3);
// 	}
// 	catch(e){}
	
	currentlyLoading = true;
	loadingBg = runtime.getInstanceByUid(69);
// 	loadingBg.moveToLayer(runtime.layout.getLayer(runtime.layout.getAllLayers().length-1));
	loadingTween = loadingBg.behaviors.Tween;
	
	loadingTween.startTween("y", runtime.globalVars.viewPortY/2, LOADING_SHOW_TIME, "linear", tweenProperty);
	loadingTween.startTween("opacity", 1, LOADING_SHOW_TIME, "linear", tweenProperty);
	
	if(OnLoadingStarted != null){
		setTimeout(OnLoadingStarted, LOADING_SHOW_TIME*1000);
	}
 }
	loading();
// 	if(currentlyLoading || currentlyShowingPopup){
// 		HideLoading();
// 		HidePopup();
// 		setTimeout(loading, 1000);
// 	}
// 	else{
// 		loading();
// 	}
}

export const HideLoading = function(){
	if(!currentlyLoading){
		return;
	}
	setTimeout(function(){
		loadingTween.startTween("y", 3000, LOADING_SHOW_TIME, "linear", tweenProperty);
		loadingTween.startTween("opacity", 0.3, LOADING_SHOW_TIME, "linear", tweenProperty);
		OnTap.OnTapEnabled(true);
		setTimeout(()=>enableDisabledLayers(), LOADING_SHOW_TIME*1000);
	}, 500);
	
// 	try{
// 	mainLayer = runtime.layout.getLayer(0);
//   	lerpLayerOpacity(mainLayer,0,1,0.3);
// 	}
// 	catch(e){}
}


export const ShowPopup = function(popupConfig, OnBtn1Clicked, OnCancelClicked){
	const showingPopup = function(){
	
	OnTap.OnTapEnabled(false);
	OnTap.ResetOverlayButtonListeners();
	
	disableAllLayers();
	currentlyShowingPopup = true;
	
	
	const titleText = runtime.getInstanceByUid(135);
	const titleShadowText = runtime.getInstanceByUid(53);
	const decText = runtime.getInstanceByUid(29);
	const okaySingleText = runtime.getInstanceByUid(136);
	const okayText = runtime.getInstanceByUid(162);
	
	const cnlBtn = runtime.getInstanceByUid(128);
	const okayBtn = runtime.getInstanceByUid(115);
	const okaySingleBtn = runtime.getInstanceByUid(129);
	
	titleText.text = popupConfig.ttl;
	titleShadowText.text = popupConfig.ttl;
	decText.text = popupConfig.dec;
	
	if(popupConfig.cnlBtn){
		okayText.text = popupConfig.btnTxt;
				okaySingleText.text = popupConfig.btnTxt;
		cnlBtn.isVisible = true;
		okayBtn.isVisible = true;
		okaySingleBtn.isVisible = false;
		
		OnTap.addOverlayOnTapButton(cnlBtn, ()=> {
			OnTap.OnTapEnabled(true);
			HidePopup();
			OnCancelClicked();
		});
		
		OnTap.addOverlayOnTapButton(okayBtn, ()=> {
			OnTap.OnTapEnabled(true);
			HidePopup();
			OnBtn1Clicked();
		});
	}
	else{
		okayText.text = popupConfig.btnTxt;
		okaySingleText.text = popupConfig.btnTxt;
		cnlBtn.isVisible = false;
		okayBtn.isVisible = false;
		okaySingleBtn.isVisible = true;
		
		OnTap.addOverlayOnTapButton(okaySingleBtn, ()=> {
			HidePopup();
			OnBtn1Clicked();
		});
	}
	
	popupBg = runtime.getInstanceByUid(97);
	popupTween = popupBg.behaviors.Tween;
	
	popupTween.startTween("y", runtime.globalVars.viewPortY/2, POPUP_SHOW_TIME, "linear", tweenProperty);
	setTimeout(()=>{
	popupTween.startTween("opacity", 0.5, POPUP_SHOW_TIME, "linear", tweenProperty);
	}, POPUP_SHOW_TIME*1000);
 }
	
	if(currentlyLoading || currentlyShowingPopup){
		HideLoading();
		HidePopup();
		setTimeout(showingPopup, 1000);
	}
	else{
		showingPopup();
	}
}

export const HidePopup = function(){
	OnTap.OnTapEnabled(true);
	if(!currentlyShowingPopup){
		return;
	};
	
	popupTween.startTween("opacity", 0, POPUP_SHOW_TIME, "linear", tweenProperty);
	
	setTimeout(()=>{
	popupTween.startTween("y", -1100, POPUP_SHOW_TIME, "linear", tweenProperty);
		enableDisabledLayers();
	}, POPUP_SHOW_TIME*1000);
}

function disableAllLayers() {
  const activeLayout = runtime.layout; // Get the active layout
try{  mainLayer = activeLayout.getLayer("MAIN");
  lerpLayerOpacity(mainLayer,1,0,0.3);
  }
catch(e){}
}

function enableDisabledLayers() {
try{ lerpLayerOpacity(mainLayer,0,1,0.3);
  }
catch(e){}
}


function lerpLayerOpacity(layer, a, b, duration) {
  var startOpacity = layer.opacity;
  var startTime = Date.now();
  var endTime = startTime + (duration * 1000);

  var intervalId = setInterval(function () {
    var currentTime = Date.now();

    if (currentTime >= endTime) {
      layer.opacity = b;
	  layer.isVisible = b > 0;
      clearInterval(intervalId);
    } else {
      var t = (currentTime - startTime) / (duration * 1000);
      layer.opacity = startOpacity + (b - startOpacity) * t;
    }
  }, 16); // Runs the animation approximately every 16ms (60fps)
}



