import {addOnTapButton,ResetButtonListeners} from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import {StartHomeLayout} from "./home.js";
import {StartGameLayout} from "./game.js";

const LAYOUT_NAME = "MATCHMAKING_LAYOUT";

let winningId;
let opponentName;
let willConnect;

let initialized;
let runtime;
let loginResponse;
let ticketLayer, couldNotFoundLayer, oppFoundLayer, searchingOppoLayer;

let ticketSize;
let totalBalance;
let gameStartTimer;

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
	let layout = runtime.layout;
	ticketLayer = layout.getLayer("TICKET_LAYER");
	couldNotFoundLayer = layout.getLayer("COULDN'T_FOUND_OPP_LAYER");
	oppFoundLayer = layout.getLayer("OPP_FOUND_LAYER");
	searchingOppoLayer = layout.getLayer("SEARCHING_OPP_LAYER");
	
	ticketLayer.isVisible = false;
	couldNotFoundLayer.isVisible = false;
	oppFoundLayer.isVisible = false;
	searchingOppoLayer.isVisible = false;
	API.GET(API.uri.WALLET_MONEY_URL(), (balanceResponse)=> {
		totalBalance = balanceResponse.total;
	}, null);
	
	StartTicketLayer();
}

const StartTicketLayer = function(){
	
	setTimeout(()=>{
		ticketLayer.isVisible = true;
		couldNotFoundLayer.isVisible = false;
		oppFoundLayer.isVisible = false;
		searchingOppoLayer.isVisible = false;
	}, 700);
	
	ResetButtonListeners();
	
	const backBtn = runtime.getInstanceByUid(104);
	addOnTapButton(backBtn, ()=> StartHomeLayout(runtime, loginResponse));
	
	let lagosBattleTickets = loginResponse.lagosbattleTickets;
	let lagosBattleTicketsCount = lagosBattleTickets.length;
	console.log(lagosBattleTicketsCount, "lagosBattleTicketsCount");
	
	if( lagosBattleTicketsCount< 7){// Hide 7th elements
	 runtime.getInstanceByUid(175).isVisible=false;
	}
	if( lagosBattleTicketsCount < 6){// Hide 6th elements
	 runtime.getInstanceByUid(176).isVisible=false;
	}
	if(lagosBattleTicketsCount < 5){// Hide 5th elements
	 runtime.getInstanceByUid(172).isVisible=false;
	}
	if(lagosBattleTicketsCount < 4){// Hide 4th elements
	 runtime.getInstanceByUid(170).isVisible=false;
	}
	if(lagosBattleTicketsCount < 3){// Hide 3th elements
	 runtime.getInstanceByUid(169).isVisible=false;
	}
	if(lagosBattleTicketsCount < 2){// Hide 2th elements
	 runtime.getInstanceByUid(168).isVisible=false;
	}
	
	runtime.getInstanceByUid(6).text="WIN ₹"+lagosBattleTickets[0].max;
	
	runtime.getInstanceByUid(385).text="WIN ₹"+lagosBattleTickets[1].max;
	
	runtime.getInstanceByUid(392).text="WIN ₹"+lagosBattleTickets[2].max;
	
	runtime.getInstanceByUid(402).text="WIN ₹"+lagosBattleTickets[3].max;
	
	runtime.getInstanceByUid(407).text="WIN ₹"+lagosBattleTickets[4].max;
	
	runtime.getInstanceByUid(412).text="WIN ₹"+lagosBattleTickets[5].max;
	
	runtime.getInstanceByUid(417).text="WIN ₹"+lagosBattleTickets[6].max;
	
	
	runtime.getInstanceByUid(165).text="₹"+lagosBattleTickets[0].size;
	
	runtime.getInstanceByUid(386).text="₹"+lagosBattleTickets[1].size;
	
	runtime.getInstanceByUid(397).text="₹"+lagosBattleTickets[2].size;
	
	runtime.getInstanceByUid(403).text="₹"+lagosBattleTickets[3].size;
	
	runtime.getInstanceByUid(408).text="₹"+lagosBattleTickets[4].size;
	
	runtime.getInstanceByUid(413).text="₹"+lagosBattleTickets[5].size;
	
	runtime.getInstanceByUid(418).text="₹"+lagosBattleTickets[6].size;
	
	
	
	// Tap on 10
	addOnTapButton(runtime.getInstanceByUid(381), () => {
	
					ticketSize = lagosBattleTickets[0].size;
				StartMatchmaking();
	
	})            //------------------------------------------------------------------------
		
	// Tap on 25
	addOnTapButton(runtime.getInstanceByUid(388) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[1].size;
					StartMatchmaking();
	
	});
	
	
	// Tap on 50
	addOnTapButton(runtime.getInstanceByUid(398) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[2].size;
					StartMatchmaking();
	
	});
	
	// Tap on 100
	addOnTapButton(runtime.getInstanceByUid(404) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[3].size;	
					StartMatchmaking();
	
	});
	
	// Tap on 500
	addOnTapButton(runtime.getInstanceByUid(409) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[4].size;
					StartMatchmaking();
	
	});
	
	
	// Tap on 1000
	addOnTapButton(runtime.getInstanceByUid(414) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[5].size;
					StartMatchmaking();
	
	});
	
	
	// Tap on 4000
	addOnTapButton(runtime.getInstanceByUid(419) , ()=>
	{
		ticketSize = ticketSize = lagosBattleTickets[6].size;
					StartMatchmaking();
	
	});
	
	UIUtils.HideLoading();
}

const StartMatchmaking = function() {

	UIUtils.ShowPopup(UIUtils.config.TICKET_CONFIRMATION, ()=>{
				
		let requestBody = {
    	    "ticket": ticketSize,
    	    "casinoId": 403,
    	    "language": "en",
    	}
    	API.POST(API.uri.CONTEST_JOIN_URL(), (data) => {
	
    	    if (data.error == true) {
    	        UIUtils.ShowPopup(UIUtils.config.INSUFFICIENT_BALANCE, () => {});
    	    } else {
				StartSearchingOpponentLayer();
    	        willConnect = data.data.opponentObj.willConnect
    	        winningId = data.data.opponentObj.winningId
    	        opponentName = data.data.opponentObj.name;
    	        const opponentText = runtime.getInstanceByUid(32);
    	        runtime.getInstanceByUid(32).text = " " + opponentName;
	
    	        if (willConnect == true) {
    	            console.log("Player Found");
					gameStartTimer = data.data.opponentObj.afterTimer;
					setTimeout(()=>StartOpponentFoundLayer(data.data.opponentObj.resultTimer, data.data.opponentObj.winningId, data.data.opponentObj.name), gameStartTimer);
    	        } else {
    	            console.log("No Player Found");
    	            setTimeout(StartCouldNotFoundLayer,  data.data.opponentObj.maxTimer*1000);
    	        }
    	    }

    }, null, requestBody)
	
	}, ()=>{});
}
const StartCouldNotFoundLayer = function(){
	ResetButtonListeners();
	
	ticketLayer.isVisible = false;
	couldNotFoundLayer.isVisible = true;
	oppFoundLayer.isVisible = false;
	searchingOppoLayer.isVisible = false;
	
// 	const backBtn = runtime.getInstanceByUid(109);
// 	addOnTapButton(backBtn, StartTicketLayer);

	setTimeout(()=>StartTicketLayer(), 3000);
}

const StartOpponentFoundLayer = function(resultTime, winningID, oppoName){
	ResetButtonListeners();
	
	ticketLayer.isVisible = false;
	couldNotFoundLayer.isVisible = false;
	oppFoundLayer.isVisible = true;
	searchingOppoLayer.isVisible = false;
	
	runtime.getInstanceByUid(32).text = oppoName;
	
	setTimeout(()=>	{
	runtime.callFunction("PauseBackground");
StartGameLayout(runtime, loginResponse, resultTime, winningID, oppoName);
	}, 2000)
}

const StartSearchingOpponentLayer = function(){
	ResetButtonListeners();
	
	ticketLayer.isVisible = false;
	couldNotFoundLayer.isVisible = false;
	oppFoundLayer.isVisible = false;
	searchingOppoLayer.isVisible = true;
}


// function OnLayoutLoaded(runtime)
// {
// console.log(loginResponse == null)
// //Dynamic UI of Ticket Layer
// 	var lagosticketValue=lagosBattleTickets.length;
// 	console.log(lagosticketValue,"lagos ticket");
	
// 	  if(lagosticketValue < 7){// Hide 7th elements
// 	   runtime.getInstanceByUid(345).isVisible=false;
// 	   runtime.getInstanceByUid(349).isVisible=false;
// 	   runtime.getInstanceByUid(351).isVisible=false;
// 	   runtime.getInstanceByUid(347).isVisible=false;
// 	  }
// 	  if(lagosticketValue < 6){// Hide 6th elements
// 	   runtime.getInstanceByUid(155).isVisible=false;
// 	   runtime.getInstanceByUid(348).isVisible=false;
// 	   runtime.getInstanceByUid(346).isVisible=false;
// 	   runtime.getInstanceByUid(350).isVisible=false;
// 	  }
// 	  if(lagosticketValue < 5){// Hide 5th elements
// 	   runtime.getInstanceByUid(31).isVisible=false;
// 	   runtime.getInstanceByUid(170).isVisible=false;
// 	   runtime.getInstanceByUid(154).isVisible=false;
// 	   runtime.getInstanceByUid(164).isVisible=false;
// 	  }
// 	  if(lagosticketValue < 4){// Hide 4th elements
// 	   runtime.getInstanceByUid(153).isVisible=false;
// 	   runtime.getInstanceByUid(29).isVisible=false;
// 	   runtime.getInstanceByUid(163).isVisible=false;
// 	   runtime.getInstanceByUid(168).isVisible=false;
// 	  }
// 	  if(lagosticketValue < 3){// Hide 3th elements
// 	   runtime.getInstanceByUid(11).isVisible=false;
// 	   runtime.getInstanceByUid(167).isVisible=false;
// 	   runtime.getInstanceByUid(152).isVisible=false;
// 	   runtime.getInstanceByUid(161).isVisible=false;
// 	  }
// 	  if(lagosticketValue < 2){// Hide 2th elements
// 	   runtime.getInstanceByUid(151).isVisible=false;
// 	   runtime.getInstanceByUid(8).isVisible=false;
// 	   runtime.getInstanceByUid(166).isVisible=false;
// 	   runtime.getInstanceByUid(156).isVisible=false;
// 	  }

// 	var opponentText;
// 	console.log("MatchMaking Layout Called")
	
// 	var PLAYERSEARCHING_LAYER = runtime.layout.getLayer(0);
// 	var PLAYERFOUND_LAYER = runtime.layout.getLayer(1);
// 	var NOPLAYERFOUND_LAYER = runtime.layout.getLayer(2);
// 	var TICKET_LAYER = runtime.layout.getLayer(3);
// 	var POP_LAYER = runtime.layout.getLayer(4);
// 	var PLAY_BTN=runtime.getInstanceByUid(196);
// 	var CANCEL_BTN=runtime.getInstanceByUid(285);
// 	TICKET_LAYER.isVisible = true;
// // Wallet Balance
// var token = window.localStorage.getItem("token");
// var TokenUrl="https://p1.funnearn.com/api/lagos/total-money?token="+token+""
// GET(TokenUrl,
//         (walletResponse) => {
// 			totalBalance = walletResponse.total;
// 			console.log("Wallet Balance " + totalBalance);
//         },
//         (errorResponse) => {
// 		console.log("Error in MatchMakingWalletBalance...")})
		
	
	
// function ShowPopup(){
// TICKET_LAYER.isVisible=false;
// POP_LAYER.isVisible=true;
// ResetButtonListeners(2);
// addButtonOnTap(0 , runtime.getInstanceByUid(196) , ()=>{
// POP_LAYER.isVisible=false;

// // Check Condition USer have sufficient balance to play the game or not //

// 		const token = window.localStorage.getItem("token");
// 		var matchMakingUrl="https://p1.funnearn.com/api/lagos/dicemaker/contest-join?token="+token+""

//             	var requestBody = 
//             	{
//             		"ticket": ticketSize,
//             		"casinoId": 403,
//             		"language":"en",
//             	}

//  			// POST Data	
//             function onLoad(data) {
// 				if(data.error == true){
// 					var Heading = "SORRY!!!!"
// 					var Description= "INSUFFICIENT AMOUNT!!!"
// 					Popup(runtime,Description,Heading);
// 				}else{
//                 console.log("Success In Matchmaking");

// 						willConnect = data.data.opponentObj.willConnect
// 						//console.log(willcinnec)
// 						winningId = data.data.opponentObj.winningId
// 						opponentName = data.data.opponentObj.name;
// 						opponentText = runtime.getInstanceByUid(32);
// 						runtime.getInstanceByUid(32).text = " " + opponentName;
						
// 						if(willConnect == true)
// 						{
// 						 	console.log("Player Found");
// 							TicketPlay(runtime);
// 						}else{
// 						 	console.log("No Player Found");
// 							OppNotFound(runtime)
// 						}
// 					}
//             }

//             function onError() {
//                 console.log("Error In Matchmaking")
// 				var Heading = "ERROR!!!!"
// 				var Description= "PLAYER NOT FOUND!!!"
// 				Popup(runtime,Description,Heading);
				
//             }
			
// 			POST(matchMakingUrl,onLoad,onError,requestBody)

// })

// addButtonOnTap(1 , runtime.getInstanceByUid(285) , ()=>{
//   	POP_LAYER.isVisible=false;
// 	TICKET_LAYER.isVisible = true;
// 	AddListenersForTicketSelection();
// })
 
// };
	
	

// //...............max open..............................



// //...............max. closed .............................

// //......size open............................................


// //......size closed............................................

// function Popup(runtime,Description ,Heading){
//    var popup = runtime.layout.getLayer(5);
//    var TICKET_LAYER = runtime.layout.getLayer(3);
//    var okbtn = runtime.getInstanceByUid(342);
//    var descText = runtime.getInstanceByUid(341);
//    var heading = runtime.getInstanceByUid(340);
//      descText.text=Description;
//      heading.text=Heading;
// 		TICKET_LAYER.isVisible = false;
//     	popup.isVisible=true;
// 		ResetButtonListeners(1)
// 		addButtonOnTap(0 ,okbtn ,()=>{
// 		popup.isVisible=false;
// 		console.log("True")
// 		TICKET_LAYER.isVisible = true;
// 		AddListenersForTicketSelection();
// 	})			
// }



// function AddListenersForTicketSelection(){

// ResetButtonListeners(8)

// // Tap on Ticket_Back_Btn
// addButtonOnTap(0 , runtime.getInstanceByUid(171) , ()=>
// {
// 	TicketBack(runtime , loginResponse);

// });


// }

// AddListenersForTicketSelection();


// }

// function TicketPlay(runtime)
// {
// 	var PLAYERSEARCHING_LAYER = runtime.layout.getLayer(0);
// 	var PLAYERFOUND_LAYER = runtime.layout.getLayer(1);
// 	var TICKET_LAYER = runtime.layout.getLayer(3);
	
// 			TICKET_LAYER.isVisible = false;
// 			PLAYERSEARCHING_LAYER.isVisible = true;
		
// 		var interval1 = setInterval(()=>
// 						{
// 							PLAYERSEARCHING_LAYER.isVisible = false;
// 							PLAYERFOUND_LAYER.isVisible = true;
// 							clearInterval(interval1)
// 						},3000)
// 		var interval2 = setInterval(()=>
// 						{
// 							GamePlayStartLayout(runtime , winningId , opponentName,loginResponse)
// 							clearInterval(interval2)
// 						},4500)	
		
// }

// function OppNotFound(runtime)
// {
// 	var PLAYERSEARCHING_LAYER = runtime.layout.getLayer(0);
// 	var NO_PLAYERFOUND_LAYER = runtime.layout.getLayer(2);
// 	var TICKET_LAYER = runtime.layout.getLayer(3);
	
// 			TICKET_LAYER.isVisible = false;
// 			PLAYERSEARCHING_LAYER.isVisible = true;
			
// 			var interval1 = setInterval(()=>
// 						{
// 							PLAYERSEARCHING_LAYER.isVisible = false;
// 							NO_PLAYERFOUND_LAYER.isVisible = true;
// 							clearInterval(interval1)
// 						},3000)
// //				ResetButtonListeners(1);					
//         addButtonOnTap(0,runtime.getInstanceByUid(41),()=>{
// 		console.log("Back")
// 		NO_PLAYERFOUND_LAYER.isVisible = false;
// 		TICKET_LAYER.isVisible = true
// 		StartLayout(runtime , loginResponse)
// 	 })
// }


// function TicketBack(runtime , loginResponse)
// {
// 	HomeStartLayout(runtime , loginResponse)
// 	var token = window.localStorage.getItem("token");
// }



export {StartLayout as StartMatchMakingLayout};