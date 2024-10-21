document.addEventListener('DOMContentLoaded', function () {
    const rateButton = document.getElementById('rateThis');
    const reviewOverlay = document.getElementById('reviewOverlay');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-button');
    const applyFilterButton = document.getElementById('applyFilter');
    const reviewsList = document.getElementById('reviewsList');
    const ratingFilterInput = document.getElementById('rating-filter');
    const dateFilterInput = document.getElementById('date-filter');
  
    // Function to extract serviceId from URL parameters
    function getServiceIdFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id');
    }
  
    async function fetchReviews(serviceId) {
      try {
        let url = `/reviews/${serviceId}`;
        
        if (ratingFilterInput.value !== 'all' || dateFilterInput.value) {
          // Construct URL with applied filters
          url += `?rating=${ratingFilterInput.value}&date=${dateFilterInput.value}`;
        }
        
        const response = await fetch(url);
        const reviews = await response.json();
        displayReviews(reviews);
        displayOverallRating(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    }
    
  
    function getStars(rating) {
      const filledStars = '&#9733;'.repeat(rating);
      const emptyStars = '&#9734;'.repeat(5 - rating);
      return filledStars + emptyStars;
    }
  
  // Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 to month as it is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Update displayReviews function to format date
function displayReviews(reviews) {
    reviewsList.innerHTML = '';
    if (reviews.length === 0) {
      reviewsList.innerHTML = '<p>No reviews yet</p>';
      return;
    }
    reviews.forEach(review => {
      const reviewElement = document.createElement('li');
      reviewElement.classList.add('row', 'g-4', 'mb-3', 'border-bottom', 'border-2');
      reviewElement.innerHTML = `
        <div class="col-10 col-md-11">
          <div class="p-0">
            <h5>${review.name}</h5>
            <p class="stars">${getStars(review.rating)}</p>
            <p class="date small">Date: ${formatDate(review.date)}</p> <!-- Format date -->
            <p class="comment">${review.comment}</p>
          </div>
        </div>
      `;
      reviewsList.appendChild(reviewElement);
    });
  }
  
  
  
    function calculateOverallRating(reviews) {
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / reviews.length).toFixed(1);
    }
  
    function displayOverallRating(reviews) {
      const overallRating = calculateOverallRating(reviews);
      const ratingStars = Math.round(overallRating);
      document.querySelector('.rating-number span').textContent = `${overallRating} stars`;
      document.querySelector('.overall-stars').innerHTML = getStars(ratingStars);
    }
  
    function applyFilters() {
      // Fetch reviews with applied filters
      fetchReviews(getServiceIdFromURL());
    }
  
    rateButton.addEventListener('click', function () {
      reviewOverlay.style.display = 'flex';
    });
  
    cancelButton.addEventListener('click', function () {
      reviewOverlay.style.display = 'none';
    });
  
    // Change the submitButton event listener to send data to the correct route
submitButton.addEventListener('click', async function (event) {
    event.preventDefault();

    const feedback = document.getElementById('feedback').value;
    const rating = document.querySelector('input[name="rating"]:checked');
    const serviceId = getServiceIdFromURL(); // Dynamically get serviceId

    if (!serviceId) {
        console.error('Service ID not found in URL');
        return;
    }

    if (feedback.trim() === '' || !rating) {
        alert('Please fill in both the feedback and rating fields.');
    } else {
        try {
            const response = await fetch("/reviews", { // Changed endpoint to /reviews
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Rahimi', // Replace with actual user name
                    serviceId: serviceId, // Include serviceId in the request body
                    rating: parseInt(rating.value),
                    comment: feedback
                })
            });

            if (response.ok) {
                alert('Thank you! Your review has been submitted.');
                reviewOverlay.style.display = 'none';
                fetchReviews(serviceId); // Fetch reviews for the updated serviceId
            } else {
                alert('Failed to submit the review. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    }
});

  
    applyFilterButton.addEventListener('click', applyFilters);
  
    const serviceId = getServiceIdFromURL(); // Get serviceId when DOMContentLoaded
    if (serviceId) {
      fetchReviews(serviceId);
    } else {
      console.error('Service ID not found in URL');
    }
  });
