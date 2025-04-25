document.addEventListener('DOMContentLoaded', function() {
  // Payment method functionality
  const paymentMethods = {
    mastercard: {
      name: "Mastercard",
      content: "Payment processed via Mastercard ending in **** 5678"
    },
    visa: {
      name: "Visa",
      content: "Payment processed via Visa ending in **** 1234"
    },
    directexpress: {
      name: "Direct Express",
      content: "Payment processed via Direct Express"
    },
    paypal: {
      name: "PayPal",
      content: "Payment processed via PayPal account: user@example.com"
    }
  };

  // Initialize payment method selection
  const paymentMethodElements = document.querySelectorAll('.payment-method');
  const paymentContentElement = document.getElementById('paymentContent');

  paymentMethodElements.forEach(method => {
    method.addEventListener('click', () => {
      paymentMethodElements.forEach(m => m.classList.remove('active'));
      method.classList.add('active');
      const methodName = method.getAttribute('data-method');
      paymentContentElement.textContent = paymentMethods[methodName].content;
    });
  });

  // Get cart data from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const subtotal = localStorage.getItem('subtotal') || 0;
  const shipping = localStorage.getItem('shipping') || 0;
  const total = localStorage.getItem('total') || 0;
  
  // Update the order details table
  const tbody = document.querySelector('.order-details tbody');
  tbody.innerHTML = ''; // Clear existing rows
  
  cartItems.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$ ${item.price}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Update the totals
  document.querySelector('.total-price .price').textContent = `$ ${total}`;

  // Carousel functionality
  const toggleCarouselBtn = document.getElementById('toggleCarousel');
  const carouselSide = document.getElementById('carouselSide');
  const mainContainer = document.getElementById('mainContainer');
  const carouselContainer = document.getElementById('carouselContainer');
  const dotsContainer = document.getElementById('carouselDots');
  
  let currentImage = 0;
  let carouselInterval;

  // Initialize carousel with product images
  function initializeCarousel() {
    carouselContainer.innerHTML = ''; // Clear existing items
    dotsContainer.innerHTML = ''; // Clear existing dots

    cartItems.forEach((item, index) => {
      if (item.image) {
        // Create carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `<img src="${item.image}" alt="${item.name}" class="carousel-image">`;
        carouselContainer.appendChild(carouselItem);

        // Create dot
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.addEventListener('click', () => showImage(index));
        dotsContainer.appendChild(dot);
      }
    });

    // Get references to the newly created elements
    const carouselItems = document.querySelectorAll('.carousel-item');
    const carouselDots = document.querySelectorAll('.carousel-dot');

    function showImage(index) {
      carouselItems.forEach(item => item.classList.remove('active'));
      carouselDots.forEach(dot => dot.classList.remove('active'));
      
      carouselItems[index].classList.add('active');
      carouselDots[index].classList.add('active');
      currentImage = index;
    }

    function nextImage() {
      const itemsCount = carouselItems.length;
      if (itemsCount > 0) {
        currentImage = (currentImage + 1) % itemsCount;
        showImage(currentImage);
      }
    }

    function startCarousel() {
      stopCarousel();
      if (carouselItems.length > 1) {
        carouselInterval = setInterval(nextImage, 3000);
      }
    }

    function stopCarousel() {
      clearInterval(carouselInterval);
    }

    // Initialize first image
    if (carouselItems.length > 0) {
      showImage(0);
    }

    // Toggle carousel visibility
    toggleCarouselBtn.addEventListener('click', () => {
      const isVisible = carouselSide.style.display !== 'none';
      
      if (isVisible) {
        carouselSide.style.display = 'none';
        toggleCarouselBtn.textContent = 'View Product Images';
        mainContainer.style.maxWidth = '600px';
        stopCarousel();
      } else {
        carouselSide.style.display = 'block';
        toggleCarouselBtn.textContent = 'Hide Product Images';
        mainContainer.style.maxWidth = '1200px';
        startCarousel();
      }
    });

    // Start carousel if images are visible by default
    if (carouselSide.style.display !== 'none') {
      startCarousel();
    }
  }

  // Initialize the carousel
  initializeCarousel();
});