document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://localhost:5000/api/products";
  let currentFilters = {};
  let currentPage = 1;
  const productsPerPage = 16;
  const currentPageType = "Women"; // Hardcoded for women.html

  // Initialize the page
  initializePage();

  function initializePage() {
    // Set gender filter to Women
    currentFilters.gender = currentPageType;
    updateGenderFilterUI();

    fetchProducts();
    setupFilterListeners();
    setupSortListener();
  }

  function updateGenderFilterUI() {
    const genderCheckbox = document.querySelector(
      `.filter-option input[name="gender"][value="${currentPageType}"]`
    );
    if (genderCheckbox) {
      genderCheckbox.checked = true;

      // Disable other gender checkboxes
      document
        .querySelectorAll('.filter-option input[name="gender"]')
        .forEach((checkbox) => {
          if (checkbox.value !== currentPageType) {
            checkbox.disabled = true;
            checkbox.parentElement.classList.add("disabled");
          }
        });
    }
  }

  function setupSortListener() {
    document.getElementById("sort-by").addEventListener("change", function () {
      currentFilters.sort = this.value;
      currentPage = 1;
      fetchProducts();
    });
  }

  function setupFilterListeners() {
    // Checkbox filters (excluding disabled gender checkboxes)
    document
      .querySelectorAll('.filter-option input[type="checkbox"]:not([disabled])')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
          const filterName = this.name;
          const filterValue = this.value;

          if (this.checked) {
            if (!currentFilters[filterName]) {
              currentFilters[filterName] = [];
            }
            currentFilters[filterName].push(filterValue);
          } else {
            if (currentFilters[filterName]) {
              currentFilters[filterName] = currentFilters[filterName].filter(
                (v) => v !== filterValue
              );
              if (currentFilters[filterName].length === 0) {
                delete currentFilters[filterName];
              }
            }
          }

          currentPage = 1;
          fetchProducts();
        });
      });

    // Size buttons
    document.querySelectorAll(".size-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const size = this.getAttribute("data-size");

        // Toggle active state
        document
          .querySelectorAll(".size-btn")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        currentFilters.size = size;
        currentPage = 1;
        fetchProducts();
      });
    });

    // Price range
    document.querySelector(".ok-btn").addEventListener("click", function () {
      const minPrice = document.querySelector('input[name="minPrice"]').value;
      const maxPrice = document.querySelector('input[name="maxPrice"]').value;

      if (minPrice) currentFilters.minPrice = minPrice;
      else delete currentFilters.minPrice;

      if (maxPrice) currentFilters.maxPrice = maxPrice;
      else delete currentFilters.maxPrice;

      currentPage = 1;
      fetchProducts();
    });

    // Clear all filters (except gender)
    document.querySelector(".clear-btn").addEventListener("click", function () {
      // Uncheck all checkboxes except gender
      document
        .querySelectorAll('.filter-option input:not([name="gender"])')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });

      // Clear price inputs
      document.querySelectorAll(".price-input").forEach((input) => {
        input.value = "";
      });

      // Remove active class from size buttons
      document.querySelectorAll(".size-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Reset filters (keep gender)
      currentFilters = { gender: "Women" };

      currentPage = 1;
      fetchProducts();
    });
  }

  function fetchProducts() {
    const productsGrid = document.getElementById("products-grid");
    productsGrid.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading women\'s products...</div>';

    const queryParams = new URLSearchParams();

    // Add filters
    for (const [key, value] of Object.entries(currentFilters)) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }

    // Add pagination
    queryParams.append("page", currentPage);
    queryParams.append("limit", productsPerPage);

    // Add sorting
    if (currentFilters.sort) {
      queryParams.append("sort", currentFilters.sort);
    }

    fetch(`${API_URL}?${queryParams.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        displayProducts(data.products);
        updatePagination(data.totalCount);
        updateResultsCount(data.totalCount);
      })
      .catch((error) => {
        console.error("Error fetching women's products:", error);
        productsGrid.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load women's products. Please try again later.</p>
                        <button onclick="window.location.reload()">Retry</button>
                    </div>
                `;
      });
  }

  function displayProducts(products) {
    const productsGrid = document.getElementById("products-grid");

    if (products.length === 0) {
      productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-tshirt"></i>
                    <h3>No women's products found</h3>
                    <p>Try adjusting your filters or check back later</p>
                    <button class="clear-btn">Clear all filters</button>
                </div>
            `;

      // Add event listener to the clear button
      document
        .querySelector(".no-products .clear-btn")
        .addEventListener("click", function () {
          document.querySelector(".clear-btn").click();
        });

      return;
    }

    productsGrid.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
                <div class="product-image">
                    <a href="product.html?id=${product._id}">
                        <img src="${product.imageUrl}" alt="${
        product.title
      }" loading="lazy">
                        ${
                          product.isNew
                            ? '<span class="new-badge">NEW</span>'
                            : ""
                        }
                        ${
                          product.isBestseller
                            ? '<span class="bestseller-badge">BESTSELLER</span>'
                            : ""
                        }
                    </a>
                    <button class="wishlist-icon" aria-label="Add to wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <div class="product-rating">
                        <span class="stars">${"★".repeat(
                          Math.floor(product.rating)
                        )}${product.rating % 1 >= 0.5 ? "½" : ""}${"☆".repeat(
        5 - Math.ceil(product.rating)
      )}</span>
                        <span class="rating-count">(${
                          product.ratingCount
                        })</span>
                    </div>
                    <div class="product-price">
                        ${
                          product.originalPrice
                            ? `<span class="original-price">$${product.originalPrice.toFixed(
                                2
                              )}</span>`
                            : ""
                        }
                        <span class="current-price">$${product.price.toFixed(
                          2
                        )}</span>
                        ${
                          product.discountPercent
                            ? `<span class="discount">-${product.discountPercent}%</span>`
                            : ""
                        }
                    </div>
                    <div class="product-sizes">
                        Available sizes: 
                        ${product.sizes
                          .slice(0, 4)
                          .map(
                            (size) => `
                            <span class="size-tag">${size}</span>
                        `
                          )
                          .join("")}
                        ${
                          product.sizes.length > 4
                            ? `<span class="size-more">+${
                                product.sizes.length - 4
                              }</span>`
                            : ""
                        }
                    </div>
                </div>
            `;
      productsGrid.appendChild(productCard);

      // Add wishlist functionality
      productCard
        .querySelector(".wishlist-icon")
        .addEventListener("click", function (e) {
          e.preventDefault();
          this.classList.toggle("active");
          const icon = this.querySelector("i");
          icon.classList.toggle("far");
          icon.classList.toggle("fas");

          toggleWishlist(product._id);
        });
    });
  }

  function toggleWishlist(productId) {
    console.log(`Toggling wishlist for product ${productId}`);
  }

  function updatePagination(totalCount) {
    const pagination = document.getElementById("pagination");
    const totalPages = Math.ceil(totalCount / productsPerPage);

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let paginationHTML = "";
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn prev" onclick="changePage(${
        currentPage - 1
      })">
                <i class="fas fa-chevron-left"></i>
            </button>`;
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="page-dots">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="page-btn ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="page-dots">...</span>`;
      }
      paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn next" onclick="changePage(${
        currentPage + 1
      })">
                <i class="fas fa-chevron-right"></i>
            </button>`;
    }

    pagination.innerHTML = paginationHTML;
  }

  function updateResultsCount(totalCount) {
    const startItem = (currentPage - 1) * productsPerPage + 1;
    const endItem = Math.min(currentPage * productsPerPage, totalCount);
    document.getElementById(
      "results-count"
    ).textContent = `Showing ${startItem}-${endItem} of ${totalCount} women's products`;
  }

  window.changePage = function (page) {
    currentPage = page;
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
});
