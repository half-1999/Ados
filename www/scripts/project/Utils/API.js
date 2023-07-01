import * as UIUtils from "./UIUtils.js";

export const config = {
	NAME: "Ados",
    BASE_URL: "https://p1.funnearn.com/",
    TYPE_OF_USER: 3703,
    VERSION: "1",
    TYPE: 2,
    CLINT_API_URL: "api/lagos/",
    get TOKEN() {
        return localStorage.getItem("token");
    },
};

export const uri = {
	BANNER_URL: () =>`https://p1.funnearn.com/api/lagos/get-banners-userwise/${config.TYPE_OF_USER}?token=${config.TOKEN}&playstore=false`,
    REFERRAL_IP_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}referral-ip`,
    SIGNUP_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}signup`,
    RESEND_OTP_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}resend-phone`,
    SUBMIT_OTP_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}login`,
    SILENT_LOGIN_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}loggedin?token=${config.TOKEN}&type=${config.TYPE}&version=${config.VERSION}`,
    UPDATE_UID_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}update-uid?token=${config.TOKEN}`,
    UPDATE_FSM_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}update-fcm?token=${config.TOKEN}`,
    FAQ_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}terms?token=${config.TOKEN}`,
    WALLET_MONEY_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}total-money?token=${config.TOKEN}`,
    PASSBOOK_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}all-money?token=${config.TOKEN}`,
    TRANSFER_PAYMENT_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}transfer-rzx?token=${config.TOKEN}`,
    UPDATE_LOCATION_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}update-location?token=${config.TOKEN}`,
    GET_TRANSFER_PAYMENT_DETAILS_URL: (toType) =>
        `${config.BASE_URL}${config.CLINT_API_URL}get-transfer-account-details?token=${config.TOKEN}&toType=${toType}`,
    CONTEST_JOIN_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}dicemaker/contest-join?token=${config.TOKEN}`,
    CONTEST_END_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}right-answer?token=${config.TOKEN}`,
    CUSTOM_PAY_ORDER_GENERATE_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}generate-order?token=${config.TOKEN}`,
    PAYTM_ORDER_GENERATE_URL: () =>
        `${config.BASE_URL}${config.CLINT_API_URL}paytm-generate-order?token=${config.TOKEN}`,
    PAYTM_CALLBACK_URL: () =>
        `${config.BASE_URL}lagos/paytm-pay?token=${config.TOKEN}`,
    RAZOR_PAYMENT_PAGE_URL: () =>
        `${config.BASE_URL}pay?token=${config.TOKEN}`,
    RAZOR_PAYMENT_SUCCESS_URL: () =>
        `${config.BASE_URL}comely-payment-successful`,
    RAZOR_PAYMENT_FAILED_URL: () =>
        `${config.BASE_URL}comely-payment-failed`,
    LOCATION_DETAILS_URL: () =>
        "https://open.mapquestapi.com/geocoding/v1/reverse?key=",
    TNC_URL: () =>
		"https://ados.aimcomely.com/terms.html",
};



export function POST(uri, onLoad, onError, requestBody) {

    const formData = new URLSearchParams();

    // Iterate through the data object and append each key-value pair to the formData
    for (const key in requestBody) {
        formData.append(key, requestBody[key]);
    }

    // Create the request options object
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    };

    // Send the request
    fetch(uri, requestOptions)
        .then(response => {
            if (response.ok) {
                // Request successful, process the response
                return response.json();
            } else {
                // Request failed
                throw new Error('Error: ' + response.status);
            }
        })
        .then(data => {
            // Do something with the response data
            console.log(data);
            if (onLoad != null) {
                onLoad(data);
            }
        })
        .catch(error => {
            console.log('Network error', error);
            if (onError == null) {
                UIUtils.ShowPopup(UIUtils.config.NETWORK_ERROR, ()=>{
					POST(uri, onLoad, onError, requestBody);
				})
            } else {
                onError();
            }
        });
}

export function GET(uri, onLoad, onError) {
    // Send the request
    fetch(uri)
        .then(response => {
            if (response.ok) {
                // Request successful, process the response
                return response.json();
            } else {
                // Request failed
                throw new Error('Error: ' + response.status);
            }
        })
        .then(data => {
            // Do something with the response data
            console.log(data);
            onLoad(data);

        })
        .catch(error => {
//             console.log('Network error', error);
            if (onError == null) {
// 				UIUtils.ShowPopup(UIUtils.config.NETWORK_ERROR, ()=> GET(uri, onLoad, onError));
				UIUtils.ShowPopup(UIUtils.config.NETWORK_ERROR, ()=>{}, null);
            } else {
                onError();
            }
        });
}

export function CacheDataInStorage(dataKey, data) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(dataKey, serializedData);
  } catch (error) {
    console.error('Error caching data:', error);
  }
}