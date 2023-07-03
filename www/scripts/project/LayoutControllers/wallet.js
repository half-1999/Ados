import * as OnTap from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import { StartAddMoneyPlugin } from "../addMoneyPlugin.js"
import { StartHomeLayout } from "./home.js";

const LAYOUT_NAME = "WALLET_LAYOUT";
const PHONEPE_ENABLED = false;
let currentWalletBalance;

let initialized;
let runtime;
let loginResponse;
let addMoneyLayer, withdrawLayer, withdrawUPILayer, withdrawBankLayer, updateLocationLayer, commonElementsLayer;
let updatedlocation = false;
let checkAddMoneyStatusInterval;
let amountInput;
let checkAddMoneyStatus;
let playerIsOnApp;
let alreadyHaveData;

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

const ResetTabButtons = function(){
	OnTap.ResetButtonListeners();
	const tabAddMoneyBtn = runtime.getInstanceByUid(116);
	const tabWithdrawBtn = runtime.getInstanceByUid(27);
	
	OnTap.addOnTapButton(tabAddMoneyBtn, ()=>{
		tabAddMoneyBtn.opacity = 0.5;
		tabWithdrawBtn.opacity = 1;
		StartAddMoneyLayer();
	});
	
	OnTap.addOnTapButton(tabWithdrawBtn, ()=>{
		tabAddMoneyBtn.opacity = 1;
		tabWithdrawBtn.opacity = 0.5;
		StartWithdrawLayer();
	});
}

const OnLayoutLoaded = function(){

	const layout = runtime.layout;
	addMoneyLayer = layout.getLayer("ADD_MONEY_LAYER");
	withdrawLayer = layout.getLayer("WITHDRAWL_LAYER");
	withdrawUPILayer = layout.getLayer("WITHDRAWL_BY_UPI_LAYER");
	withdrawBankLayer = layout.getLayer("WITHDRAWL_BY_BANK_LAYER");
	updateLocationLayer = layout.getLayer("LOCATION_LAYER");
	commonElementsLayer = layout.getLayer("COMMON_ELEMENTS");
	
	addMoneyLayer.isVisible = false;
	withdrawLayer.isVisible = false;
	withdrawUPILayer.isVisible = false;
	withdrawBankLayer.isVisible = false;
	updateLocationLayer.isVisible = false;
	commonElementsLayer.isVisible = false;
	
	StartAddMoneyLayer();
	
	document.addEventListener('visibilitychange' , function(){
		console.log("visibilitychanged");
		playerIsOnApp = document.hidden;
		if(!playerIsOnApp){
			UpdateWalletBalance();
		}
	});
	
	runtime.getInstanceByUid(223).text = "₹" + loginResponse.dailyLimit;
	runtime.getInstanceByUid(233).text = loginResponse.deductionCharges+"%";
}

function StartWithdrawLayer(){
	addMoneyLayer.isVisible = false;
	withdrawLayer.isVisible = true;
	withdrawUPILayer.isVisible = false;
	withdrawBankLayer.isVisible = false;
	updateLocationLayer.isVisible = false;

	ResetTabButtons();
	
	const upiBtn = runtime.getInstanceByUid(94);
	const bankBtn = runtime.getInstanceByUid(78);
	const backBtn = runtime.getInstanceByUid(56);
	
	OnTap.addOnTapButton(upiBtn, ()=>{
		StartWithdrawUPILayer();
	});
	OnTap.addOnTapButton(bankBtn, ()=>{
		StartWithdrawBankLayer();
	});
	
	OnTap.addOnTapButton(backBtn, ()=>{
		StartHomeLayout(runtime, loginResponse)
	});
	
}

function StartWithdrawUPILayer(){
	addMoneyLayer.isVisible = false;
	withdrawLayer.isVisible = false;
	withdrawUPILayer.isVisible = true;
	withdrawBankLayer.isVisible = false;
	updateLocationLayer.isVisible = false;
	
	ResetTabButtons();
	
	const withdrawBtn = runtime.getInstanceByUid(264);
	const backBtn = runtime.getInstanceByUid(58);
	
	OnTap.addOnTapButton(backBtn, ()=>{
		StartWithdrawLayer();
	});

	OnTap.addOnTapButton(withdrawBtn, ()=>{
		var Amount = runtime.getInstanceByUid(127).text;
	var Upi = runtime.getInstanceByUid(132).text;
	
	const upiWithdrawRequestBody = {
	  "exists": false,
	  "amount": Amount,
	  "toType": "upi",
	  "input": Upi,
	  "num": "",
	  "name": "",
	  "code": "",
	  "bank": "",
	  "bankaddress": ""
	}

	WithdrawMoney(Amount, upiWithdrawRequestBody);
	});
}

function StartWithdrawBankLayer(){
	addMoneyLayer.isVisible = false;
	withdrawLayer.isVisible = false;
	withdrawUPILayer.isVisible = false;
	withdrawBankLayer.isVisible = true;
	updateLocationLayer.isVisible = false;
	
	ResetTabButtons();
	
	const withdrawBtn = runtime.getInstanceByUid(255);
	
	const backBtn = runtime.getInstanceByUid(65);
	OnTap.addOnTapButton(backBtn, ()=>{
		StartWithdrawLayer();
	});

	OnTap.addOnTapButton(withdrawBtn, ()=>{
	
	let amountNumber = runtime.getInstanceByUid(137).text;
	let holderName = runtime.getInstanceByUid(198).text;
	let ifscCode = runtime.getInstanceByUid(224).text;
	let bankName = runtime.getInstanceByUid(225).text;
	let bankAddress = runtime.getInstanceByUid(226).text;
	let amount = runtime.getInstanceByUid(237).text;
	
	const bankWithdrawRequestBody = {
	  "exists": false,
	  "amount": amount,
	  "toType": "bank",
	  "input": "",
	  "num": amountNumber,
	  "name": holderName,
	  "code": ifscCode,
	  "bank": bankName,
	  "bankaddress": bankAddress
	}
	
	WithdrawMoney(amount, bankWithdrawRequestBody);
	});
}

function StartLocationLayer(){
	addMoneyLayer.isVisible = false;
	withdrawLayer.isVisible = false;
	withdrawUPILayer.isVisible = false;
	withdrawBankLayer.isVisible = false;
	updateLocationLayer.isVisible = true;
	
	ResetTabButtons();
	
	const goAheadBtn = runtime.getInstanceByUid(67);
	const backBtn = runtime.getInstanceByUid(38);
	
	OnTap.addOnTapButton(backBtn, ()=>{
		StartAddMoneyLayer();
	});
	
	const updateLocation = function(){
		let updateEmail = runtime.getInstanceByUid(266).text;
		let  DOB = localStorage.getItem("dob");
		let  updateLocation = localStorage.getItem("state");
		
		if(!updateEmail || !DOB || !updateLocation)
		{
			UIUtils.ShowPopup(UIUtils.config.NOT_FIELD_DATA, ()=> {});
			return;
		}
				
			var requestBody=
		{
			"email": updateEmail,
			"dob":DOB,
			"location":updateLocation,
		};

		API.POST(API.uri.UPDATE_LOCATION_URL(), (j)=> {
			StartAddMoneyLayer();
			updatedlocation = true;
			GenerateOrderForAddMoney(amountInput.text);
		}, null, requestBody);
	
}
		
		
	
	OnTap.addOnTapButton(goAheadBtn, updateLocation);
}

function StartAddMoneyLayer(){
	
	setTimeout(()=>{
		addMoneyLayer.isVisible = true;
		withdrawLayer.isVisible = false;
		withdrawUPILayer.isVisible = false;
		withdrawBankLayer.isVisible = false;
		updateLocationLayer.isVisible = false;
		commonElementsLayer.isVisible = true;
	}, 700);
	
	
	ResetTabButtons();
	UpdateWalletBalance();
	
	const ten = runtime.getInstanceByUid(62);
	const fifty = runtime.getInstanceByUid(79);
	const hundred = runtime.getInstanceByUid(46);
	
	amountInput = runtime.getInstanceByUid(231);
	const addMoneyBtn = runtime.getInstanceByUid(138);
	const backBtn = runtime.getInstanceByUid(55);
	
	OnTap.addOnTapButton(ten, ()=>{
		amountInput.text = "10";
	});
	OnTap.addOnTapButton(fifty, ()=>{
		amountInput.text = "50";
	});
	OnTap.addOnTapButton(hundred, ()=>{
		amountInput.text = "100";
	});
	
	OnTap.addOnTapButton(addMoneyBtn, ()=>{
	alreadyHaveData = updatedlocation;
// 	alreadyHaveData = updatedlocation;
	if(!alreadyHaveData)
	{
		alreadyHaveData = (loginResponse.email != null && loginResponse.email != "") && (loginResponse.location != null && loginResponse.location != "") && (loginResponse.dob != null && loginResponse.dob != "");
	}
	
	if(alreadyHaveData){
		GenerateOrderForAddMoney(amountInput.text);	
	}
	else{
		StartLocationLayer();
	}
	});
	
	OnTap.addOnTapButton(backBtn, ()=>{
		StartHomeLayout(runtime, loginResponse)
	});
	
	UIUtils.HideLoading();
	
}

function UpdateWalletBalance(){
API.GET(API.uri.WALLET_MONEY_URL(), (balanceResponse)=> {
		try{currentWalletBalance = balanceResponse.total;
		runtime.getInstanceByUid(93).text = "₹ " + balanceResponse.total;}
		catch(e){}
	}, null);
}

function GenerateOrderForAddMoney(amount) {
	if(!amount) return;
		StartAddMoneyPlugin(runtime, loginResponse, amount);


//     var generateOrderRequestBody = {
//         "amount": amount,
//         "typeOfUser": API.config.TYPE_OF_USER,
//     }

//     function OnGenerateOrder(response) {
//         var paymentPageUri = "" + loginResponse.livePGUrl + "" + "?token=" + API.config.TOKEN + "" + "&amount=" + response.amount + "" + "&orderId=" + response.id + "" + "&type=cashfreeweb"

// runtime.callFunction("GoToUrl", paymentPageUri);
// UpdateWalletBalance();
//     }

//     API.POST(API.uri.CUSTOM_PAY_ORDER_GENERATE_URL(), OnGenerateOrder, null, generateOrderRequestBody);
}

function WithdrawMoney(amount, requestBody){
		console.log(requestBody);
		if(amount > currentWalletBalance){
			UIUtils.ShowPopup(UIUtils.config.INSUFFICIENT_BALANCE, ()=>{});
			return;
		}
		
		API.POST(API.uri.TRANSFER_PAYMENT_URL(), response=>{
			if(response.error){
				if(response.reason == null){
					UIUtils.ShowPopup(UIUtils.config.INSUFFICIENT_BALANCE,()=>{});
				}
				let decription = response.reason;
				try{
				decription = "Credit:     "+ response.params.paymentInfo.creditedMoney + "\nUsed:     " + response.params.paymentInfo.contestsInvested + "\n\n" + response.reason;
				}catch(e){}
				
				let	popupConfig = { ttl: "SORRY", dec: decription, cnlBtn: false, btnTxt: "PLAY NOW" };

				UIUtils.ShowPopup(popupConfig,()=>{});
			}
			else{
			UpdateWalletBalance();
			UIUtils.ShowPopup(UIUtils.config.SUCCESS_WITHDRAWAL,()=>{});
			}
		}, null, requestBody);
	}

//Phone-pe -------------------------------------------------------------

function OnPhonepeStatus(mtTxID, amountToAdd, result) {
                result = result.response;
				let apiLoading = true;
			if(true){
							setTimeout(()=>{
				UIUtils.HideLoading();
					if (result.code == "PAYMENT_SUCCESS") {
						let successConfig = {ttl: result.code.replace(/_/g, ' '), dec: result.message, cnlBtn: false, btnTxt: "OKAY"};
                	    UIUtils.ShowPopup(successConfig,()=>{});
// 						setTimeout(()=>{amountInput.isVisible = true;},500);
						apiLoading = false;
                	} else if (result.code == "TIMED_OUT" || result.code == "PAYMENT_DECLINED" || result.code == "PAYMENT_ERROR" || result.code == "TRANSACTION_NOT_FOUND" || result.code == "INTERNAL_SERVER_ERROR" || result.code == "AUTHORIZATION_FAILED" || result.code == "BAD_REQUEST") {
						let failedConfig = {ttl: result.code.replace(/_/g, ' '), dec: "Your payment is failed. Please try again.", cnlBtn: false, btnTxt: "OKAY"};
                	    UIUtils.ShowPopup(failedConfig,()=>{});
						apiLoading = false;
						
                	}else if (result.code == "PAYMENT_PENDING") {
						let pendingConfig = {ttl: "PAYMENT PENDING", dec: "Your add money transaction is currently pending. We will notify you upon completion.", cnlBtn: true, btnTxt: "STATUS"};
						
						UIUtils.ShowPopup(pendingConfig,()=>{
							CheckAddMoneyStatus(mtTxID, amountToAdd);
						}, ()=>{});
						apiLoading = false;
						
                	}
					
					if(!apiLoading && checkAddMoneyStatusInterval != null){
						console.log("stopped checking for add money status");
						clearInterval(checkAddMoneyStatusInterval);
						checkAddMoneyStatusInterval = null;
					}
				}, 1500);
			}
				
            }

function OnPhonepeStatusError() {
                console.log("Error");
            }

function CheckAddMoneyStatus(mtTxID, amountToAdd) {
            var phonepeCheckStatusUri = "https://p1.funnearn.com/api/lagos/get-phonepe-order-status?token=" + API.config.TOKEN + "&orderId=" + mtTxID + "";
			API.GET(phonepeCheckStatusUri, (result)=> OnPhonepeStatus(mtTxID, amountToAdd, result), OnPhonepeStatusError);
        }

function GenerateOrderForPhonePe(amountToAdd) {
			amountInput.isVisible = false;
            UIUtils.ShowLoading(()=>{
				API.POST(phonepeUri, OnPhonepeOrderGenerated, OnPhonepeGenerateOrderError, phonepeGenerateOrderRequestBody);
			});
            var phonepeUri = "https://p1.funnearn.com/api/lagos/generate-phonepe-order?token=" + API.config.TOKEN + "";
            var phonepeGenerateOrderRequestBody = {
                "amount": parseInt(amountToAdd),
                "phone": loginResponse.phone,
            }

            function OnPhonepeOrderGenerated(result) {
//                 checkAddMoneyStatus = function(){
// 					checkAddMoneyStatusInterval = setInterval(() => CheckAddMoneyStatus(result.data.merchantTransactionId, amountToAdd), 1000);
					
					checkAddMoneyStatusInterval = setInterval(() => CheckAddMoneyStatus(result.data.merchantTransactionId, amountToAdd), 5000);
            setTimeout(()=>{runtime.callFunction("GoToUrl", result.data.instrumentResponse.intentUrl);}, 1000);
            }

            function OnPhonepeGenerateOrderError() {
                console.log("Error");
            }
        }
//......................................................................

export {StartLayout as StartWalletLayout};