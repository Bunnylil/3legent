document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const userId = "user123"; // In real app, get from auth
  const API_URL = `http://localhost:5000/api/products/${productId}`;

  let currentProduct = null;
  let isFavorite = false;
  let selectedColor = null;
  let selectedSize = null;

  // Fetch product details
  fetchProductDetails();

  function fetchProductDetails() {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          currentProduct = data.product;
          displayProductDetails();
        } else {
          throw new Error(data.message || "Product not found");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.querySelector("main").innerHTML = `
          <div class="error-message">
            <h2>Error Loading Product</h2>
            <p>${error.message}</p>
            <a href="men.html" class="back-to-shop">Back to Shop</a>
          </div>
        `;
      });
  }

  function displayProductDetails() {
    // Basic info
    document.getElementById("product-name").textContent = currentProduct.title;
    document.getElementById("product-title").textContent = currentProduct.title;
    document.getElementById("product-category").textContent =
      currentProduct.category;
    document.getElementById(
      "product-price"
    ).textContent = `$${currentProduct.price.toFixed(2)}`;
    document.getElementById("product-rating-stars").innerHTML =
      "★".repeat(Math.round(currentProduct.rating)) +
      "☆".repeat(5 - Math.round(currentProduct.rating));
    document.getElementById(
      "product-rating-count"
    ).textContent = `(${currentProduct.ratingCount})`;
    document.getElementById("product-full-description").textContent =
      currentProduct.description;
    document.getElementById("product-sku").textContent = currentProduct.sku;

    // Main image
    const mainImage = document.getElementById("main-product-image");
    mainImage.src = currentProduct.imageUrl;
    mainImage.alt = currentProduct.title;

    // Thumbnails
    const thumbnailContainer = document.getElementById("thumbnail-container");
    thumbnailContainer.innerHTML = "";

    // Add main image as first thumbnail
    addThumbnail(currentProduct.imageUrl, true);

    // Add additional thumbnails
    if (currentProduct.thumbnails && currentProduct.thumbnails.length > 0) {
      currentProduct.thumbnails.forEach((thumbnailUrl, index) => {
        // Skip if this is the same as main image
        if (thumbnailUrl !== currentProduct.imageUrl) {
          addThumbnail(thumbnailUrl);
        }
      });
    }

    // Color options
    const colorOptions = document.getElementById("color-options");
    colorOptions.innerHTML = "";

    if (currentProduct.colors && currentProduct.colors.length > 0) {
      currentProduct.colors.forEach((color, index) => {
        const colorOption = document.createElement("div");
        colorOption.className = `color-option ${index === 0 ? "active" : ""}`;

        // Check if color is hex code or name
        if (color.startsWith("#")) {
          colorOption.style.backgroundColor = color;
        } else {
          // Use a color map for named colors
          const colorMap = {
            black: "#000000",
            red: "#ff0000",
            white: "#ffffff",
          };
          colorOption.style.backgroundColor =
            colorMap[color.toLowerCase()] || "#cccccc";
        }

        colorOption.title = color.startsWith("#") ? "Color" : color;
        colorOption.dataset.color = color;

        colorOption.addEventListener("click", function () {
          document
            .querySelectorAll(".color-option")
            .forEach((opt) => opt.classList.remove("active"));
          this.classList.add("active");
          selectedColor = color;
          document.getElementById("selected-color").textContent =
            color.startsWith("#")
              ? "Custom"
              : color.charAt(0).toUpperCase() + color.slice(1);
        });

        colorOptions.appendChild(colorOption);
      });

      // Set first color as selected
      const firstColor = currentProduct.colors[0];
      selectedColor = firstColor;
      document.getElementById("selected-color").textContent =
        firstColor.startsWith("#")
          ? "Custom"
          : firstColor.charAt(0).toUpperCase() + firstColor.slice(1);
    }

    // Size options
    const sizeOptions = document.getElementById("size-options");
    sizeOptions.innerHTML = "";

    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
      currentProduct.sizes.forEach((size) => {
        const sizeOption = document.createElement("button");
        sizeOption.className = "size-option";
        sizeOption.textContent = size;
        sizeOption.dataset.size = size;

        sizeOption.addEventListener("click", function () {
          document
            .querySelectorAll(".size-option")
            .forEach((opt) => opt.classList.remove("active"));
          this.classList.add("active");
          selectedSize = this.dataset.size;
        });

        sizeOptions.appendChild(sizeOption);
      });

      // Select first size by default
      if (currentProduct.sizes.length > 0) {
        selectedSize = currentProduct.sizes[0];
        sizeOptions.querySelector(".size-option").classList.add("active");
      }
    }

    // Product details
    const detailsList = document.getElementById("product-details-list");
    detailsList.innerHTML = "";

    if (currentProduct.details) {
      // Convert details object to array
      const detailsArray = [];
      for (const [key, value] of Object.entries(currentProduct.details)) {
        if (Array.isArray(value)) {
          detailsArray.push(`${key}: ${value.join(", ")}`);
        } else {
          detailsArray.push(`${key}: ${value}`);
        }
      }

      // Add details to list
      detailsArray.forEach((detail) => {
        const li = document.createElement("li");
        li.textContent = detail;
        detailsList.appendChild(li);
      });
    }

    // Wishlist button
    const wishlistBtn = document.getElementById("wishlist-btn");
    wishlistBtn.addEventListener("click", toggleFavorite);

    // Add to Cart button
    const addToCartBtn = document.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", addToCart);
  }

  function addThumbnail(imageUrl, isActive = false) {
    const thumbnail = document.createElement("div");
    thumbnail.className = `thumbnail ${isActive ? "active" : ""}`;

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `${currentProduct.title} thumbnail`;

    thumbnail.appendChild(img);
    document.getElementById("thumbnail-container").appendChild(thumbnail);

    thumbnail.addEventListener("click", function () {
      document
        .querySelectorAll(".thumbnail")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      document.getElementById("main-product-image").src = imageUrl;
    });
  }

  function toggleFavorite() {
    const heartIcon = document.querySelector("#wishlist-btn i");

    if (heartIcon.classList.contains("far")) {
      heartIcon.classList.remove("far");
      heartIcon.classList.add("fas");
      document.getElementById("wishlist-btn").innerHTML =
        '<i class="fas fa-heart"></i> Remove from Wishlist';
      showNotification("Added to favorites!");
    } else {
      heartIcon.classList.remove("fas");
      heartIcon.classList.add("far");
      document.getElementById("wishlist-btn").innerHTML =
        '<i class="far fa-heart"></i> Add to Wishlist';
      showNotification("Removed from favorites");
    }

    // In a real app, you would send this to your backend
    console.log(`Toggled favorite for product ${productId}`);
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "favorite-notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  function addToCart() {
    if (!selectedSize) {
      showNotification("Please select a size");
      return;
    }

    if (!selectedColor) {
      showNotification("Please select a color");
      return;
    }

    const cartItem = {
      id: currentProduct._id || productId,
      name: currentProduct.title,
      price: currentProduct.price,
      image: currentProduct.imageUrl,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      sku: currentProduct.sku
    };

    // Get existing cart from localStorage or create new one
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Check if item already exists in cart with same color and size
    const existingItemIndex = cart.findIndex(item => 
      item.id === cartItem.id && 
      item.color === cartItem.color && 
      item.size === cartItem.size
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      cart[existingItemIndex].quantity += 1;
      showNotification(`Quantity increased for ${cartItem.name}`);
    } else {
      // Add new item to cart
      cart.push(cartItem);
      showNotification(`${cartItem.name} added to cart!`);
    }

    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Update cart count in header
    updateCartCount();
    
    // Optional: Redirect to cart page
    // window.location.href = "cart.html";
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart icon count in header
    const cartIcon = document.querySelector(".fa-shopping-cart");
    if (cartIcon) {
      // Remove existing count if any
      const existingCount = cartIcon.nextElementSibling;
      if (existingCount && existingCount.classList.contains("cart-count")) {
        existingCount.remove();
      }
      
      // Add new count if there are items
      if (totalItems > 0) {
        const countBadge = document.createElement("span");
        countBadge.className = "cart-count";
        countBadge.textContent = totalItems;
        cartIcon.parentNode.insertBefore(countBadge, cartIcon.nextSibling);
      }
    }
  }
  // In your addToCart function in product.js
function addToCart() {
  if (!selectedSize) {
      showNotification("Please select a size");
      return;
  }

  if (!selectedColor) {
      showNotification("Please select a color");
      return;
  }

  const cartItem = {
      id: currentProduct._id || productId,
      name: currentProduct.title,
      price: currentProduct.price,
      image: currentProduct.imageUrl,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      sku: currentProduct.sku
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Check if item exists with same ID, color and size
  const existingIndex = cart.findIndex(item => 
      item.id === cartItem.id && 
      item.color === cartItem.color && 
      item.size === cartItem.size
  );

  if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
      showNotification(`Quantity increased for ${cartItem.name}`);
  } else {
      cart.push(cartItem);
      showNotification(`${cartItem.name} added to cart!`);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  
  // Optional: Redirect to cart page after adding
  // window.location.href = "cart.html";
}
});