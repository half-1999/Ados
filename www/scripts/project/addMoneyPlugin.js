import * as OnTap from "./Utils/TapButtons.js";
import { StartWalletLayout } from "./LayoutControllers/wallet.js";
import * as UIUtils from "./Utils/UIUtils.js";
import * as API from "./Utils/API.js";

const LAYOUT_NAME = "ADD_MONEY";

const BROWSERS_BUTTON_UID = [174, 189, 194, 195];
const BROWSERS_THUMBNAIL_UID = [197, 200, 204, 206];
const BROWSERS_APPNAME_UID = [199, 202, 205, 207];

const UPI_BUTTON_UID = [208, 209, 210, 211, 227, 228, 230, 239, 256, 257, 259, 261];
const UPI_THUMBNAIL_UID = [212, 215, 218, 221, 240, 242, 246, 249, 265, 272, 274, 277];
const UPI_APPNAME_UID = [213, 216, 220, 222, 241, 245, 247, 252, 270, 273, 276, 278];

const BACK_BTN_UID = 279;
const AMOUNT_UID = 66;
const STATUS_MESSAGE_UID = 303;
const STATUS_OKAY_BTN_UID = 300;
const CANCELPOPUP_CANCEL_BTN_UID = 284;
const CANCELPOPUP_STAY_BTN_UID = 287;
const STATUS_CLOSE_BTN_UID = 297;
const PROCESSING_TIMER_UID = 294;

const BROWSER_OPTIONS_UID = 280;
const UPI_OPTIONS_UID = 281;

let browserArray = [];
let intentUrlsArray;

let initialized = false;
let runtime;
let loginResponse;
let paymentGateways; 
let loadingLayer, statusLayer, processingLayer, baseLayer, cancelLayer;
let amountToAdd;
let intervalId;
let merchantTransactionId;

export const StartAddMoneyPlugin = function(rntm, loginData, amount){
	if(!initialized){
		initialized = true;
		runtime = rntm;
		loginResponse = loginData;
		paymentGateways = loginData.DUMA_PG_ENABLED;
		runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
	}
	amountToAdd = amount;
	runtime.goToLayout(LAYOUT_NAME);
	OnTap.ResetButtonListeners();
}


const OnLayoutLoaded = function(){	
	
	const layout = runtime.layout;
	loadingLayer = layout.getLayer("LOADING");
	statusLayer = layout.getLayer("STATUS");
	processingLayer = layout.getLayer("PROCESSING");
	baseLayer = layout.getLayer("BASE");
	cancelLayer = layout.getLayer("CANCEL");
	
	ShowLoading();
	let hideLoadingTime = 1;

	browserArray = [];
	paymentGateways.forEach(item => {
    	if (item.type === "browser") {
      		browserArray.push(item);
    	} else if (item.type === "intent") {
      		intentUrlsArray = item.intentUrls;
    	}
	});
	
	if(browserArray && browserArray.length>0){
		hideLoadingTime+=browserArray.length;
		setTimeout(() => {
	    for (let i = 0; i < BROWSERS_BUTTON_UID.length; i++) {
	    const elementHasData = i < browserArray.length;
	    const brsrBtn = runtime.getInstanceByUid(BROWSERS_BUTTON_UID[i]);
	    brsrBtn.isVisible = elementHasData;
	    if (elementHasData) {
	
	        setTimeout(() => {
	            runtime.callFunction("DownloadImage", BROWSERS_THUMBNAIL_UID[i], browserArray[i].image);
	            runtime.getInstanceByUid(BROWSERS_APPNAME_UID[i]).text = "Pay with";
	            OnTap.addOnTapButton(brsrBtn, () => {
					GenerateOrderForAddMoney(browserArray[i].name, browserArray[i].type)
	                console.log("selected addMoneyType = " + browserArray[i].type + ", addMoneyName = " + browserArray[i].name);
	            });
	        }, (i + 1) * 500);
	    }
	}
	}, 1000);
	}else{
	runtime.getInstanceByUid(BROWSER_OPTIONS_UID).isVisible = false;
	}
	 
	 if(intentUrlsArray && intentUrlsArray.length>0){
	 hideLoadingTime+=intentUrlsArray.length;
	 setTimeout(() => {
	    for (let j = 0; j < UPI_BUTTON_UID.length; j++) {
	        const elementHasDeta = j < intentUrlsArray.length;
	        const upiBtn = runtime.getInstanceByUid(UPI_BUTTON_UID[j]);
	        upiBtn.isVisible = elementHasDeta;
	        if (elementHasDeta) {
	
	            setTimeout(() => {
	                runtime.callFunction("DownloadImage", UPI_THUMBNAIL_UID[j], intentUrlsArray[j].image);
	                runtime.getInstanceByUid(UPI_APPNAME_UID[j]).text = intentUrlsArray[j].name ? intentUrlsArray[j].name : "Pay with";
	                OnTap.addOnTapButton(upiBtn, () => {
						GenerateOrderForAddMoney(intentUrlsArray[j].intentType, 'intent')
	                    console.log("selected addMoneyType = " + 'intent' + ", addMoneyName = " + intentUrlsArray[j].intentType);
	                });
	            }, (j + 1) * 500);
	        }
	    }
	}, 1000);
	 }else{
	runtime.getInstanceByUid(UPI_OPTIONS_UID).isVisible = false;
	}

	const backBtn = runtime.getInstanceByUid(BACK_BTN_UID);
	OnTap.addOnTapButton(backBtn, closeAddMoney);
	 
	 
	runtime.getInstanceByUid(AMOUNT_UID).text = "₹" + parseFloat(amountToAdd).toFixed(2)
	 
	setTimeout(HideLoading, hideLoadingTime*500);
}

const ShowLoading = function(){
	loadingLayer.opacity = 1;
	loadingLayer.isVisible = true;
	statusLayer.isVisible = false;
	processingLayer.isVisible = false;
	cancelLayer.isVisible = false;
	baseLayer.isVisible = false;
}

const HideLoading = function(){
	statusLayer.isVisible = false;
	processingLayer.isVisible = false;
	
	lerpLayerOpacity(loadingLayer, 1, 0, .5);
	lerpLayerOpacity(baseLayer, 0, 1, .5);
}

const ShowStatusPopup = function(message){
	OnTap.ResetOverlayButtonListeners();
	runtime.getInstanceByUid(STATUS_MESSAGE_UID).text = message;
	
	const okayBtn = runtime.getInstanceByUid(STATUS_OKAY_BTN_UID);
	OnTap.addOverlayOnTapButton(okayBtn, ()=>{
		OnTap.ResetButtonListeners();
		lerpLayerOpacity(statusLayer, 1, 0, .5);
		lerpLayerOpacity(baseLayer, 1, 0, .5);
		lerpLayerOpacity(loadingLayer, 0, 1, .5);
		setTimeout(closeAddMoney, 800);
	});
	
	lerpLayerOpacity(statusLayer, 0, 1, .5);
}

const ShowCancelPopup = function(){
	OnTap.ResetOverlayButtonListeners();
	OnTap.OnTapEnabled(false);
	
	const mainLayer = runtime.layout.getLayer("MAIN");
	lerpLayerOpacity(mainLayer, 1, 0, .5);
	lerpLayerOpacity(cancelLayer, 0, 1, .5);
	
	const cancelBtn = runtime.getInstanceByUid(CANCELPOPUP_CANCEL_BTN_UID);
	const stayBtn = runtime.getInstanceByUid(CANCELPOPUP_STAY_BTN_UID);
	
	OnTap.addOverlayOnTapButton(cancelBtn, ()=>{
		if(intervalId){
			clearInterval(intervalId);
		}
		mainLayer.opacity = 1;
		lerpLayerOpacity(cancelLayer, 1, 0, .5);
		setTimeout(closeAddMoney, 700);
	});
	
	OnTap.addOverlayOnTapButton(stayBtn, ()=>{
		const closeBtn = runtime.getInstanceByUid(STATUS_CLOSE_BTN_UID);
		OnTap.addOverlayOnTapButton(closeBtn, ShowCancelPopup);
		lerpLayerOpacity(mainLayer, 0, 1, .5);
		lerpLayerOpacity(cancelLayer, 1, 0, .5);
	});
}

const ShowProcessing = function(){
	OnTap.OnTapEnabled(false);
	OnTap.ResetOverlayButtonListeners();
	statusLayer.isVisible = false;
	loadingLayer.isVisible = false;
	baseLayer.isVisible = true;
	
	lerpLayerOpacity(processingLayer, 0, 1, .5);
	
	const closeBtn = runtime.getInstanceByUid(STATUS_CLOSE_BTN_UID);
	OnTap.addOverlayOnTapButton(closeBtn, ShowCancelPopup);
	
	const intentGateway = paymentGateways.filter(item => item.type === 'intent')[0];
	const processingDebounceTime = intentGateway.debounceTime;
	const timerText = runtime.getInstanceByUid(PROCESSING_TIMER_UID);
	
	console.log(intentGateway, 'intentGateway');
	console.log(intentGateway.timer, 'intentGateway.timer');
	console.log(intentGateway.debounceTime, 'intentGateway.debounceTime');
	
	function startTimer() {
	  let remainingTime = intentGateway.timer;
// 	  let remainingTime = 20;

	  intervalId = setInterval(() => {
	    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
	    const secs = (remainingTime % 60).toString().padStart(2, '0');
		timerText.text = `${minutes}:${secs}`;
	
	    if (remainingTime % processingDebounceTime === 0) {
			//Hit Check Status API
			CheckAddMoneyStatus();
	    }

	    remainingTime--;

	    if (remainingTime < 0) {
	      StopTimer(); // Call stopTimer directly
		  ShowStatusPopup("Your add money transaction is currently pending. We will notify you upon completion.");
	    }
	  }, 1000);
	}
	
	startTimer();
}

const StopTimer = function() {
	lerpLayerOpacity(processingLayer, 1, 0, .5);
	clearInterval(intervalId);
}

const CheckAddMoneyStatus = function() {
    var phonepeCheckStatusUri = "https://p1.funnearn.com/api/lagos/get-phonepe-order-status?token=" + API.config.TOKEN + "&orderId=" + merchantTransactionId + "";
    API.GET(phonepeCheckStatusUri, (result) => ShowStatus(result.response), ()=>{});
}

const ShowStatus = function(status){
	if(status.code == "PAYMENT_SUCCESS"){
		StopTimer();
		ShowStatusPopup(status.message);
	}
	else if(status.code == "TIMED_OUT" || status.code == "PAYMENT_DECLINED" || status.code == "PAYMENT_ERROR" || status.code == "TRANSACTION_NOT_FOUND" || status.code == "INTERNAL_SERVER_ERROR" || status.code == "AUTHORIZATION_FAILED" || status.code == "BAD_REQUEST"){
		StopTimer();
		ShowStatusPopup("Your payment is failed. Please try again.");
	}
}


const GenerateOrderForAddMoney = function(addMoneyName, addMoneyType) {
    var generateOrderRequestBody = {
        "amount": amountToAdd,
        "typeOfUser": API.config.TYPE_OF_USER,
		"addMoneyApp": addMoneyName,
		"addMoneyType": addMoneyType,
    }

    function OnGenerateOrder(response) {

		if(addMoneyType === "browser"){
			closeAddMoney();
		}
		else if(addMoneyType === "intent"){
			merchantTransactionId = response.data.merchantTransactionId;
			ShowProcessing();
		}
		runtime.callFunction("GoToUrl", response.browserUrl);
    }

    API.POST(API.uri.CUSTOM_PAY_ORDER_GENERATE_URL(), OnGenerateOrder, null, generateOrderRequestBody);
}

const closeAddMoney = function(){
OnTap.ResetOverlayButtonListeners();
OnTap.OnTapEnabled(true);
loadingLayer.isVisible = true;
baseLayer.opacity = 1;
statusLayer.opacity = 1;
processingLayer.opacity = 1;
cancelLayer.opacity = 1;

UIUtils.ShowLoading(()=> StartWalletLayout(runtime, loginResponse));
}

function lerpLayerOpacity(layer, a, b, duration) {
  layer.opacity = a;
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

