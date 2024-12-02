const form = document.getElementById('register-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, confirmPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error registering user:', error);
    }
});
