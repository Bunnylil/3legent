document.addEventListener("DOMContentLoaded", function () {
  const verifyForm = document.getElementById("verify-form");
  const emailDisplay = document.getElementById("email-display");
  const codeDisplay = document.getElementById("code-display");

  const email = sessionStorage.getItem("resetEmail");
  const resetCode = sessionStorage.getItem("resetCode");

  if (email && resetCode) {
    emailDisplay.textContent = email;
    codeDisplay.textContent = resetCode;
  } else {
    window.location.href = "forgotpassword.html";
  }

  verifyForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredCode = document.getElementById("code").value;
    const verifyBtn = document.getElementById("verify-btn");

    if (enteredCode === resetCode) {
      verifyBtn.disabled = true;
      verifyBtn.textContent = "Verifying...";

      setTimeout(() => {
        window.location.href = `resetpassword.html?email=${encodeURIComponent(
          email
        )}`;
      }, 1000);
    } else {
      alert("Invalid code. Please try again.");
    }
  });
});
