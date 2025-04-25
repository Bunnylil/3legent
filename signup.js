import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbjwB8BGzzGeg3hYkNDMTIWY5kQ6xaTZQ",
  authDomain: "inceptor-7c036.firebaseapp.com",
  projectId: "inceptor-7c036",
  storageBucket: "inceptor-7c036.appspot.com",
  messagingSenderId: "251784547484",
  appId: "1:251784547484:web:46ce4a6da235ac75723159",
  measurementId: "G-10BE1RRDC2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const strengthDots = document.querySelectorAll(".strength-dot");
      let strength = 0;

      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[\W_]/.test(password)) strength++;

      strengthDots.forEach((dot, index) => {
        dot.classList.toggle("active", index < strength);
      });
    });
  }

  const togglePasswordBtn = document.querySelector(".toggle-password");
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
      togglePasswordBtn.classList.toggle("fa-eye");
      togglePasswordBtn.classList.toggle("fa-eye-slash");
    });
  }

  const googleButton = document.getElementById("google-signin");
  if (googleButton) {
    googleButton.addEventListener("click", async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userData = {
          firstName: user.displayName.split(" ")[0] || "",
          lastName: user.displayName.split(" ")[1] || "",
          email: user.email,
          countryCode: "",
          phone: user.phoneNumber || "",
          password: "",
          signupMethod: "google",
        };

        const response = await fetch("http://localhost:5000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
          alert(`Welcome, ${user.displayName}! Redirecting...`);
          window.location.href = "signin.html";
        } else {
          alert(`Sign-Up Failed: ${data.error}`);
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert(`Sign-In Failed: ${error.message}`);
      }
    });
  }

  const signupButton = document.getElementById("signup-btn");
  if (signupButton) {
    signupButton.addEventListener("click", async (event) => {
      event.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const countryCode = document.getElementById("countryCode").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const termsChecked = document.getElementById("terms").checked;

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !termsChecked
      ) {
        alert("Please fill in all fields and agree to the terms.");
        return;
      }

      const userData = {
        firstName,
        lastName,
        email,
        countryCode,
        phone,
        password,
        signupMethod: "manual",
      };

      try {
        const response = await fetch("http://localhost:5000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Sign up successful! Redirecting...");
          window.location.href = "signin.html";
        } else {
          alert(`Sign up failed: ${data.error}`);
        }
      } catch (error) {
        console.error("Signup Error:", error);
        alert("An error occurred while signing up.");
      }
    });
  }
});
