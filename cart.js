document.addEventListener("DOMContentLoaded", function() {
    displayCartItems();
    updateCartSummary();
    
    // Event delegation for quantity changes and remove buttons
    document.getElementById("cart-items").addEventListener("click", function(e) {
        const row = e.target.closest("tr");
        if (!row) return;
        
        const index = parseInt(row.dataset.index);
        const cart = getCart();
        
        if (e.target.classList.contains("quantity-btn")) {
            const change = e.target.textContent === "+" ? 1 : -1;
            updateQuantity(index, change);
        } else if (e.target.classList.contains("remove-item")) {
            removeItem(index);
        }
    });
    
    // Initialize coupon functionality
    document.getElementById('coupon-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
});

// Cart Management Functions
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function displayCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById("cart-items");
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="men.html" class="continue-shopping">Continue Shopping</a>
                </td>
            </tr>
        `;
        // Hide coupon section when cart is empty
        document.querySelector('.coupon-section').style.display = 'none';
        return;
    }
    
    // Show coupon section when cart has items
    document.querySelector('.coupon-section').style.display = 'block';
    
    cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.dataset.index = index;
        
        row.innerHTML = `
            <td class="product-cell">
                <img src="${item.image}" alt="${item.name}">
                <div class="product-info">
                    <p class="product-name">${item.name}</p>
                    <p>Color: ${item.color}</p>
                    <p>Size: ${item.size}</p>
                    <span class="remove-item">Remove</span>
                </div>
            </td>
            <td class="quantity-cell">
                <div class="quantity-controls">
                    <button class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn">+</button>
                </div>
            </td>
            <td class="price-cell">$${item.price.toFixed(2)}</td>
            <td class="subtotal-cell">$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        
        cartItemsContainer.appendChild(row);
    });
}

function updateQuantity(index, change) {
    const cart = getCart();
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

function removeItem(index) {
    const cart = getCart();
    
    if (cart[index]) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    }
}

// Coupon Functionality
const validCoupons = ['DISCOUNT10', 'SAVE10', 'FALLSALE'];
let couponApplied = false;
let currentCouponCode = '';
const discountRate = 0.1; // 10% discount

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input').value.trim();
    const couponMessage = document.getElementById('coupon-message');
    
    if (couponApplied) {
        couponMessage.textContent = 'A coupon is already applied.';
        couponMessage.style.color = '#ff0000';
        return;
    }
    
    if (validCoupons.includes(couponInput.toUpperCase())) {
        couponApplied = true;
        currentCouponCode = couponInput.toUpperCase();
        couponMessage.textContent = 'Coupon applied successfully! 10% discount added.';
        couponMessage.style.color = '#28a745';
        document.getElementById('discount-line').style.display = 'block';
        updateCartSummary();
    } else {
        couponMessage.textContent = 'Invalid coupon code. Please try again.';
        couponMessage.style.color = '#ff0000';
    }
}

// Cart Summary and Checkout
function updateCartSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const shippingOption = document.querySelector('input[name="shipping"]:checked').value;
    const shippingCost = shippingOption === "express" ? 15 : 0;
    
    // Calculate discount if coupon is applied
    let discount = 0;
    if (couponApplied) {
        discount = subtotal * discountRate;
        document.getElementById('discount-amount').textContent = `-$${discount.toFixed(2)}`;
    }
    
    const total = subtotal - discount + shippingCost;
    
    // Update display
    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("shipping-cost").textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
    
    updateProgressBar(subtotal);
}

function updateProgressBar(subtotal) {
    const freeShippingThreshold = 200;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    const progressText = document.querySelector(".progress-text");
    if (progressText) {
        const amountNeeded = Math.max(freeShippingThreshold - subtotal, 0);
        progressText.textContent = amountNeeded > 0 ?
            `Shop for $${amountNeeded.toFixed(2)} more to enjoy FREE Shipping` :
            "Congratulations! You qualify for FREE Shipping";
    }
}

function prepareCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }

    // Prepare checkout data including all cart items
    const checkoutData = {
        items: cart,
        subtotal: calculateSubtotal(),
        shipping: document.querySelector('input[name="shipping"]:checked').value,
        couponApplied: couponApplied,
        couponCode: currentCouponCode,
        discount: couponApplied ? calculateSubtotal() * discountRate : 0,
        total: parseFloat(document.getElementById("total").textContent.replace('$', ''))
    };

    // Store checkout data in sessionStorage
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    // Redirect to payment page
    window.location.href = 'payment.html';
}

function calculateSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}