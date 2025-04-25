document.addEventListener('DOMContentLoaded', function() {
  // Load checkout data from sessionStorage
  const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData'));
  
  if (!checkoutData) {
      alert('No checkout data found. Please add items to your cart first.');
      window.location.href = 'cart.html';
      return;
  }

  // Get carousel elements
  const carouselInner = document.querySelector('.carousel-inner');
  const carouselDots = document.querySelector('.carousel-controls');
  
  // Clear existing content
  carouselInner.innerHTML = '';
  carouselDots.innerHTML = '';

  // Add all cart items to carousel
  checkoutData.items.forEach((item, index) => {
      // Create carousel item
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      carouselItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="carousel-caption">
              <h4>${item.name}</h4>
              <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
              <p>Size: ${item.size || 'N/A'}</p>
              <p>Color: ${item.color || 'N/A'}</p>
          </div>
      `;
      carouselInner.appendChild(carouselItem);

      // Create carousel dot
      const dot = document.createElement('span');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('data-index', index);
      carouselDots.appendChild(dot);
  });

  // Update order summary in all payment methods
  document.querySelectorAll('.order-summary').forEach(summary => {
      summary.innerHTML = `
          <h4>Order Summary</h4>
          <div class="summary-item">
              <span>Subtotal</span>
              <span>$${checkoutData.subtotal.toFixed(2)}</span>
          </div>
          ${checkoutData.couponApplied ? `
          <div class="summary-item">
              <span>Discount (${checkoutData.couponCode})</span>
              <span class="discount">-$${checkoutData.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="summary-item">
              <span>Shipping</span>
              <span>${checkoutData.shipping === 'free' ? 'FREE' : '$15.00'}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item total">
              <span>Total Payment</span>
              <span>$${checkoutData.total.toFixed(2)}</span>
          </div>
      `;
  });

  // Carousel functionality
  let currentIndex = 0;
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.carousel-dot');

  function showSlide(index) {
      // Wrap around if at ends
      if (index >= items.length) index = 0;
      if (index < 0) index = items.length - 1;
      
      // Update active state
      items.forEach((item, i) => {
          item.classList.toggle('active', i === index);
      });
      
      dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
      });
      
      currentIndex = index;
  }

  // Dot click handlers
  dots.forEach(dot => {
      dot.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          showSlide(index);
      });
  });

  // Auto-rotate carousel
  let carouselInterval = setInterval(() => {
      showSlide(currentIndex + 1);
  }, 5000);

  // Pause on hover
  carouselInner.addEventListener('mouseenter', () => {
      clearInterval(carouselInterval);
  });

  carouselInner.addEventListener('mouseleave', () => {
      carouselInterval = setInterval(() => {
          showSlide(currentIndex + 1);
      }, 5000);
  });

  // Payment method switching
  const paymentMethods = document.querySelectorAll('.payment-method');
  paymentMethods.forEach(method => {
      method.addEventListener('click', function() {
          const methodName = this.getAttribute('data-method');
          
          paymentMethods.forEach(m => m.classList.remove('active'));
          this.classList.add('active');
          
          document.querySelectorAll('.payment-content-item').forEach(item => {
              item.classList.remove('active');
          });
          document.getElementById(`${methodName}-content`).classList.add('active');
      });
  });
});

