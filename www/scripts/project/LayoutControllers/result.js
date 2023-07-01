import {addOnTapButton,ResetButtonListeners} from "../Utils/TapButtons.js";
import * as UIUtils from "../Utils/UIUtils.js";
import * as API from "../Utils/API.js";
import {StartHomeLayout} from "./home.js";

const LAYOUT_NAME = "RESULT_LAYOUT";

let initialized;
let runtime;
let loginResponse;
let winId ;
let optName;
let gameScore;
let resultTime;

let preparingResultLayer, wonLayer, LostLayer, commonLayer;

function StartLayout(rntm, loginData, resultTimer, winningId, opponentName)
{
	if(!initialized){
		initialized = true;
		runtime = rntm;
		loginResponse = loginData;
		runtime.getLayout(LAYOUT_NAME).addEventListener("afterlayoutstart", OnLayoutLoaded);
	}

	winId= winningId;
	optName = opponentName;
	resultTime = resultTimer;
	
	runtime.goToLayout(LAYOUT_NAME);
}

const OnLayoutLoaded = function(){
	runtime.callFunction("ResumeBackground")

	ResetButtonListeners();
	
	let layout = runtime.layout;
	preparingResultLayer = layout.getLayer("PREPARING_RESULT");
	wonLayer = layout.getLayer("WON_LAYER");
	LostLayer = layout.getLayer("LOSE_ LAYER");
	commonLayer = layout.getLayer("COMMON");
	
	//preparingResultLayer.isVisible = true;
	UIUtils.ShowLoading(()=>{
		preparingResultLayer.isVisible = false;
		wonLayer.isVisible = false;
		LostLayer.isVisible = false;
		commonLayer.isVisible = false;
	});
	
	setTimeout(StartResultPreparingLayer, 2000);
}

const StartResultPreparingLayer = function(){
	preparingResultLayer.isVisible = false;
	gameScore = runtime.globalVars.GameScore;
	
	let requestBody = 
		{
			"winningId": winId,
			"points": runtime.globalVars.GameScore,
		}
	
	API.POST(API.uri.CONTEST_END_URL(), OnResult, null, requestBody);
}

const OnResult = function(response) {
    setTimeout(() => {
		UIUtils.HideLoading();
        preparingResultLayer.isVisible = false;
		commonLayer.isVisible = true;

        let opponentScore = response.pointsData.opponentPoints;
		
        const opponentNameText = runtime.getInstanceByUid(82);
        opponentNameText.text = " " + optName;
		
		// Player Score
		var scoreText = runtime.getInstanceByUid(86);
        scoreText.text = " " + gameScore;

        // Opponent Score
		const opponentScoreText = runtime.getInstanceByUid(84);
        opponentScoreText.text = " " + opponentScore;
		
		// Status Text
		const statusText = runtime.getInstanceByUid(275);
		const OkayBtn = runtime.getInstanceByUid(339);

		if (gameScore > opponentScore) {
		//GameWon
            wonLayer.isVisible = true;
			statusText.text = "YOU WON!";
			runtime.callFunction("PlayGameWon");
        } else {
		//GameLost
            LostLayer.isVisible = true;
			statusText.text = "YOU LOSE!";
			runtime.callFunction("PlayGameOver");
        }
		
		addOnTapButton(OkayBtn, ()=>{
			UIUtils.ShowLoading(()=> StartHomeLayout(runtime, loginResponse));
		});

    }, resultTime);
}

export {StartLayout as StartResultLayout};