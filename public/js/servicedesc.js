document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');

  // Check if serviceId exists and is not null or empty
  if (!serviceId) {
    // Handle case where serviceId is not found in URL
    console.error('Service ID not found in URL');
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Service ID not found in URL';
    document.body.appendChild(errorMessage);
    return; // Exit the function since serviceId is not found
  }

  // Proceed with fetching service details using the extracted serviceId
  try {
    const response = await fetch(`/api/services/${serviceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch service details');
    }

    const serviceData = await response.json();

    // Populate HTML elements with service details
    document.getElementById('serviceImage').src = serviceData.imageUrl;
    document.getElementById('serviceDescription').textContent = serviceData.description;
    document.getElementById('freelancerName').textContent = serviceData.freelancerName;
    document.getElementById('freelancerEmail').textContent = serviceData.freelancerEmail;
    document.getElementById('freelancerPhone').textContent = serviceData.freelancerPhone;
    document.getElementById('freelancerLocation').textContent = serviceData.freelancerLocation;
    document.getElementById('totalOrdersCompleted').textContent = serviceData.ordercompleted;
  } catch (error) {
    console.error('Error fetching service details:', error);
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Failed to load service details. Please try again later.';
    document.body.appendChild(errorMessage);
  }
});
