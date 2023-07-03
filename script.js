const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// document.querySelectorAll(".nav-link").forEach((n) =>
//   n.addEventListener("click", () => {
//     hamburger.classList.remove("active");
//     navMenu.classList.remove("active");

//     window.scrollTo(0, 0);
//   })
// );

document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");

    // Scroll to the top of the page
    window.scrollTo(0, 0);

    // Hide the hamburger icon (optional)
    // hamburger.style.display = "none";
  })
);


// Get references to the input and button elements
var mobileNumberInput = document.getElementById("phn");
var submitButton = document.getElementById("getAppLinkText");

// Add event listener to the submit button
submitButton.addEventListener("click", function(event) {
  event.preventDefault(); // Prevent form submission
  // Invoke the mobile number validation function
  validateMobileNumber();
});


mobileNumberInput.addEventListener("input", function() {
    var inputValue = mobileNumberInput.value.trim();
    var sanitizedValue = inputValue.replace(/\D/g, "").substring(0, 10);
    mobileNumberInput.value = sanitizedValue;
  });
function validateMobileNumber() {

  var mobileNumber = mobileNumberInput.value;

  // Remove any non-digit characters from the input
  mobileNumber = mobileNumber.substring(0, 10);

  // Check if the entered value is a 10-digit number
  if (mobileNumber.length === 10) {
    // Valid mobile number
    // console.log("Valid mobile number:", mobileNumber);
    alert("The App Link will send on your mobile number within few seconds")
  } else {
    // Invalid mobile number
    // console.log("Invalid mobile number. Please enter a 10-digit number.");
    alert("Invalid mobile number. Please enter a 10-digit number.")
  }
  mobileNumberInput.value = ""
}

//  Form Validation
var subBtn = document.getElementById("form-btn");
subBtn.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent form submission
    // Invoke the mobile number validation function
    validateForm();
  });
function validateForm() {
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var messageInput = document.getElementById("message");
  
    // Retrieve the values entered in the input fields
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var message = messageInput.value.trim();
  
    // Validate if any of the fields are empty
    if (name === "" || email === "" || message === "") {
      alert("Please fill in all fields.");
      return false; // Prevent form submission
    }
    alert("Your message has been sent");

    nameInput.value = ""
    emailInput.value = ""
    messageInput.value = ""
    return true; // Allow form submission
  }
  
//   const currentYearElement = document.getElementById("currentYear");
// const currentYear = new Date().getFullYear();
// currentYearElement.textContent = currentYear;

let date = new Date();
        let year = date.getFullYear();
        document.getElementById("rights").innerHTML=`Minda is a proprietary product of Comely Enterprises private Limited. ©️ ${year} COMELY ENTERPRISES PRIVATE LIMITED. ALL RIGHTS RESERVED.`

