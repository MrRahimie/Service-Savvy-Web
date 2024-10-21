document.getElementById('forumForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('forum_title').value;
    const description = document.getElementById('forum_content').value;

    const formData = {
        title: title,
        description: description
    };

    try {
        const response = await fetch('/api/forum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to add forum');
        }

        const data = await response.json();
        alert('Forum added successfully!');
        console.log(data);

        // Redirect to the forum page after successful submission
        window.location.href = '/forum';
    } catch (error) {
        console.error('Error adding forum:', error);
        alert('Failed to add forum. Please try again.');
    }
});
