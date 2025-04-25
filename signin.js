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
  const googleButton = document.getElementById("google-signin");
  if (googleButton) {
    googleButton.addEventListener("click", async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User signed in:", user);

        const response = await fetch("http://localhost:5000/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            signupMethod: "google",
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert(`Welcome, ${user.displayName}! You signed in using Google.`);
          window.location.href = "sload.html";
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert(`Sign-In Failed: ${error.message}`);
      }
    });
  }

  const signinForm = document.querySelector("form");
  if (signinForm) {
    signinForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const passwordInput = document.getElementById("password");
      const password = passwordInput.value;
      const termsChecked = document.getElementById("terms").checked;

      if (!email || !password || !termsChecked) {
        alert("Please enter your email, password, and agree to the terms.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, signupMethod: "manual" }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Login Successful! You signed in using Email/Password.");
          window.location.href = "sload.html";
        } else {
          alert(data.error);
        }
      } catch (error) {
        alert("Something went wrong. Please try again.");
      }
    });
  }

  const togglePasswordBtn = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("password");

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordBtn.classList.replace("fa-eye-slash", "fa-eye");
      } else {
        passwordInput.type = "password";
        togglePasswordBtn.classList.replace("fa-eye", "fa-eye-slash");
      }
    });
  }
});
