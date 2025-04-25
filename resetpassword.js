document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const togglePasswordIcons = document.querySelectorAll(".toggle-password");
  const form = document.querySelector("form");
  const passwordStrengthIndicators =
    document.querySelectorAll(".password-strength");

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || sessionStorage.getItem("resetEmail");

  if (!email) {
    alert(
      "No email associated with this password reset. Please start the reset process again."
    );
    window.location.href = "signin.html";
    return;
  }

  togglePasswordIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else {
        input.type = "password";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      }
    });
  });

  function checkPasswordStrength(password, strengthIndicator) {
    const strengthDots = strengthIndicator.querySelectorAll(".strength-dot");
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    strength = Math.min(strength, 4);

    strengthDots.forEach((dot, index) => {
      if (index < strength) {
        const colors = ["#ff0000", "#ff9900", "#ffff00", "#99ff00", "#00ff00"];
        dot.style.backgroundColor = colors[strength];
      } else {
        dot.style.backgroundColor = "#ccc";
      }
    });

    return strength;
  }

  passwordInput.addEventListener("input", function () {
    checkPasswordStrength(passwordInput.value, passwordStrengthIndicators[0]);
  });

  confirmPasswordInput.addEventListener("input", function () {
    checkPasswordStrength(
      confirmPasswordInput.value,
      passwordStrengthIndicators[1]
    );
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (passwordInput.value !== confirmPasswordInput.value) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const strength = checkPasswordStrength(
      passwordInput.value,
      passwordStrengthIndicators[0]
    );
    if (strength < 2) {
      alert("Password is too weak. Please choose a stronger password.");
      return;
    }

    if (!document.getElementById("terms").checked) {
      alert("You must agree to the Terms and Conditions");
      return;
    }

    try {
      const submitBtn = document.getElementById("signup-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";

      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          newPassword: passwordInput.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password has been reset successfully!");

        sessionStorage.removeItem("resetEmail");

        window.location.href = "signin.html";
      } else {
        alert(data.error || "Failed to reset password. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Confirm";
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An error occurred while resetting the password. Please try again."
      );
      const submitBtn = document.getElementById("signup-btn");
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm";
    }
  });
});
