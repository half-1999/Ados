let btnData = {};
let overlayBtnData = {};
let enabled = true;
let currentButtonIndex = 0;
let overlayButtonIndex = 0;
let btnTweenProperty = {
    loop: false,
    pingPong: false,
    repeatCount: 1
}
let runtime;

export function Init(rntm){
	runtime = rntm;
}

export function addOnTapButton(reference, onTap) {
    btnData[currentButtonIndex] = {
        reference: reference,
        onTap: onTap,
        uid: reference.uid
    };
    currentButtonIndex++;
}

export function addOverlayOnTapButton(reference, onTap) {
    overlayBtnData[overlayButtonIndex] = {
        reference: reference,
        onTap: onTap,
        uid: reference.uid
    };
    overlayButtonIndex++;
}

export function ResetButtonListeners() {
    currentButtonIndex = 0;
    btnData = {};
}

export function ResetOverlayButtonListeners() {
    overlayButtonIndex = 0;
    overlayBtnData = {};
}

export function RemoveButtonListener(btnUID) {
    btnData.filter((button) => button != null && button.reference != null && button.uid !== btnUID);
    currentButtonIndex--;
}

export function OnTapEnabled(state){
	enabled = state;
}

export function OnTap() {
// 	console.log(enabled, 'enabled');
   let x = runtime.globalVars.TouchX;
   let y = runtime.globalVars.TouchY;
   if (enabled) {
        for (var index in btnData) {
            var button = btnData[index];
            if (button != null && button.reference != null) {
                var topLeftPositionX = button.reference.x - button.reference.width / 2;
                var topLeftPositionY = button.reference.y - button.reference.height / 2;
                var bottomRightPositionX = button.reference.x + button.reference.width / 2;
                var bottomRightPositionY = button.reference.y + button.reference.height / 2;

                if (x > topLeftPositionX && x < bottomRightPositionX && y > topLeftPositionY && y < bottomRightPositionY) {
                    enabled = false;
					let booton = button;
					OnButtonTapped(button, () => {
						setTimeout(()=>{enabled = true;}, 200)
						booton.onTap();
					});
                }
            }
        }
    }
	for (var i in overlayBtnData) {
            var btn = overlayBtnData[i];
            if (btn != null && btn.reference != null) {
                var tLeftPositionX = btn.reference.x - btn.reference.width / 2;
                var tLeftPositionY = btn.reference.y - btn.reference.height / 2;
                var btomRightPositionX = btn.reference.x + btn.reference.width / 2;
                var btomRightPositionY = btn.reference.y + btn.reference.height / 2;

                if (x > tLeftPositionX && x < btomRightPositionX && y > tLeftPositionY && y < btomRightPositionY) {
				let botoon = btn;
                    OnButtonTapped(btn, ()=> { 
						botoon.onTap();
					});
                }
            }
        }
}

function OnButtonTapped(button, CompleteTap) {
	runtime.callFunction("PlayButtonClick")
	if(button.reference.behaviors == null || button.reference.behaviors.Tween == null){
		CompleteTap();
	}
	else{
		let opacityTweening = false;
		const currentButtonSizeX = button.reference.width;
		const currentButtonSizeY = button.reference.height;
	    const tween = button.reference.behaviors.Tween;
		
	    tween.startTween("width", currentButtonSizeX*0.9, 0.2, "linear", btnTweenProperty);
	    tween.startTween("height", currentButtonSizeY*0.9, 0.2, "linear", btnTweenProperty);
		
		if(button.reference.opacity >= 0.9){
		opacityTweening = true;
		tween.startTween("opacity", 0.5, 0.2, "linear", btnTweenProperty);
		}

    	setTimeout(function() {
		tween.startTween("width", currentButtonSizeX, 0.2, "linear", btnTweenProperty);
	    tween.startTween("height", currentButtonSizeY, 0.2, "linear", btnTweenProperty);
		
		if(opacityTweening){
	        tween.startTween("opacity", 1, 0.2, "linear", btnTweenProperty);
		}
		
		CompleteTap();

    }, 100);
	}

}