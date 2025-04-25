document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('reset-form');
    const resetBtn = document.getElementById('reset-btn');
    const emailInput = document.getElementById('email');

    // Email validation function
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Validate email format first
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        resetBtn.disabled = true;
        resetBtn.textContent = 'Processing...';

        try {
            const response = await fetch('http://localhost:5000/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    const text = await response.text();
                    throw new Error(text || 'Failed to request password reset');
                }
                throw new Error(errorData.error || 'Failed to request password reset');
            }

            const data = await response.json();

            // Store the reset code and email in session storage
            sessionStorage.setItem('resetCode', data.resetCode);
            sessionStorage.setItem('resetEmail', data.email);

            // Redirect to verification page
            window.location.href = 'verifycode.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            resetBtn.disabled = false;
            resetBtn.textContent = 'Reset Password';
        }
    });
});