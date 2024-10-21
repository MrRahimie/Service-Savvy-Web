document.getElementById('serviceForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('imageUrl', document.getElementById('imageUrl').files[0]);
    formData.append('freelancerName', document.getElementById('freelancerName').value);
    formData.append('freelancerEmail', document.getElementById('freelancerEmail').value);
    formData.append('freelancerPhone', document.getElementById('freelancerPhone').value);
    formData.append('freelancerLocation', document.getElementById('freelancerLocation').value);
    formData.append('ordercompleted', document.getElementById('ordercompleted').value);

    try {
        const response = await fetch('/api/services', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to add service');
        }

        const data = await response.json();
        alert('Service added successfully!');
        console.log(data);
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Failed to add service. Please try again.');
    }
});

function displayFileName() {
    const input = document.getElementById('imageUrl');
    const label = document.querySelector('.custom-file-label');
    label.textContent = input.files[0] ? input.files[0].name : 'Choose file';
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('imageUrl');
    input.addEventListener('change', displayFileName);
});
