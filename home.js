document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.nav-menu').classList.toggle('active');
});

// Toggle user dropdown
document.querySelector('.user-dropdown').addEventListener('click', function(e) {
  e.stopPropagation();
  this.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown.classList.contains('active')) {
    dropdown.classList.remove('active');
  }
});

// Close menu when resizing to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth >= 768) {
    document.querySelector('.nav-menu').classList.remove('active');
  }
});

const videoMap = {
  red: "images/vid1 (3).mp4",
  black: "images/vid1 (4).mp4",
  blue: "images/vid1 (5).mp4"
};

const colorOptions = document.querySelectorAll('.color-option');
const video = document.getElementById('productVideo');
const videoSource = video.querySelector('source');

colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    // Remove 'selected' class from all
    colorOptions.forEach(opt => opt.classList.remove('selected'));

    // Add 'selected' to clicked
    option.classList.add('selected');

    // Get the color
    const color = option.getAttribute('data-color');

    // Change the video source
    const newSrc = videoMap[color];
    videoSource.setAttribute('src', newSrc);
    video.load();
  });
});

const TIMER_KEY = "offerEndTime";
const DEFAULT_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const timerElement = document.getElementById("discountTimer");

// Check if we already have a saved end time
let offerEndTime = localStorage.getItem(TIMER_KEY);

if (!offerEndTime) {
  // If not set, create a new one and store it
  offerEndTime = new Date().getTime() + DEFAULT_DURATION;
  localStorage.setItem(TIMER_KEY, offerEndTime);
} else {
  offerEndTime = parseInt(offerEndTime, 10);
}

const updateTimer = () => {
  const now = new Date().getTime();
  const distance = offerEndTime - now;

  if (distance <= 0) {
    timerElement.textContent = "Offer expired";
    localStorage.removeItem(TIMER_KEY); // Optional: reset timer
    return;
  }

  const hours = String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const minutes = String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((distance / 1000) % 60)).padStart(2, '0');

  timerElement.textContent = `Offer ends in: ${hours}:${minutes}:${seconds}`;
};

updateTimer();
setInterval(updateTimer, 1000);

document.addEventListener("DOMContentLoaded", function () {
  const wishlistButtons = document.querySelectorAll(".wishlist-btn");
  const colorButtons = document.querySelectorAll(".color-options button");

  // Load wishlist state from localStorage
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || {};

  wishlistButtons.forEach((button, index) => {
      const productCard = button.closest(".product-card");
      const productId = index; // Using index as a simple identifier

      // Restore state
      if (wishlist[productId]) {
          button.classList.add("favorited");
          button.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }

      button.addEventListener("click", function () {
          if (wishlist[productId]) {
              delete wishlist[productId];
              button.classList.remove("favorited");
              button.innerHTML = '<i class="fa-regular fa-heart"></i>';
          } else {
              wishlist[productId] = true;
              button.classList.add("favorited");
              button.innerHTML = '<i class="fa-solid fa-heart"></i>';
          }
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
      });
  });

  colorButtons.forEach(button => {
      button.addEventListener("click", function () {
          const productCard = button.closest(".product-card");
          const productImage = productCard.querySelector(".product-image img");
          const newImageSrc = button.getAttribute("data-image");
          if (newImageSrc) {
              productImage.src = newImageSrc;
          }
      });
  });
});