document.addEventListener('DOMContentLoaded', () => {
  const servicesContainer = document.getElementById('servicesContainer');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const filterInputs = document.querySelectorAll('.form-check-input');
  const paginationButtonsContainer = document.getElementById('paginationButtons');
  const prevButton = document.getElementById('prevPageBtn');
  const nextButton = document.getElementById('nextPageBtn');

  let currentPage = 1;
  let totalPages = 1;
  const servicesPerPage = 9;

  async function fetchServices() {
    try {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/services?page=${currentPage}&limit=${servicesPerPage}${queryParams}`);
      const data = await response.json();

      if (Array.isArray(data.services)) {
        renderServices(data.services);
        totalPages = data.totalPages;
        updatePaginationButtons();
      } else {
        console.error('Error: Invalid data structure');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }

  function buildQueryParams() {
    const keyword = searchInput.value.trim();
    const selectedCategories = Array.from(filterInputs)
      .filter(input => input.checked)
      .map(input => input.value);

    const queryParams = new URLSearchParams();
    if (keyword) {
      queryParams.append('search', keyword);
    }
    if (selectedCategories.length) {
      queryParams.append('category', selectedCategories.join(','));
    }

    return '&' + queryParams.toString();
  }

  function renderServices(services) {
    servicesContainer.innerHTML = '';

    services.forEach(service => {
      const serviceDiv = document.createElement('div');
      serviceDiv.className = 'col-sm-6 col-lg-4';
      serviceDiv.innerHTML = `
        <div class="box">
          <div class="img-box">
            <img src="/${service.imageUrl}" alt="${service.title}">
          </div>
          <div class="detail-box">
            <h5 class="service_title">${service.title}</h5>
            <h6 class="service_description">${service.description}</h6>
            <div class="product_info">
              <h5 class="service_price">RM ${service.price}</h5>
              <div class="star_container">
                ${Array(service.rating).fill('<i class="fa fa-star" aria-hidden="true"></i>').join('')}
              </div>
            </div>
            <a href="servicedesc.html?id=${service._id}" class="more_info_btn"><span>More Info</span></a>
          </div>
        </div>
      `;
      servicesContainer.appendChild(serviceDiv);
    });
  }

  function updatePaginationButtons() {
    paginationButtonsContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.innerText = i;
      button.classList.add('pagination-button');
      if (i === currentPage) {
        button.classList.add('active');
      }
      button.addEventListener('click', () => {
        currentPage = i;
        fetchServices();
      });
      paginationButtonsContainer.appendChild(button);
    }

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchServices();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchServices();
    }
  });

  searchButton.addEventListener('click', () => {
    currentPage = 1;
    fetchServices();
  });

  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      currentPage = 1;
      fetchServices();
    });
  });

  fetchServices();
});
