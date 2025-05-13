document.addEventListener('DOMContentLoaded', () => {
    // Get the elements
    const dropdown = document.querySelector('.dropdown');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    const userMenu = document.getElementById('user-menu');
    const userNameElement = document.getElementById('user-name');
    const loginLink = document.getElementById('login-link');
    let timer;
  
    // Hide dropdown menu initially
    dropdownMenu.style.display = 'none';
  
    // Dropdown hover behavior
    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timer);
        dropdownMenu.style.display = 'block';
    });
  
    dropdown.addEventListener('mouseleave', () => {
        timer = setTimeout(() => {
            dropdownMenu.style.display = 'none';
        }, 200);
    });
  
    dropdownMenu.addEventListener('mouseenter', () => {
        clearTimeout(timer);
    });
  
    dropdownMenu.addEventListener('mouseleave', () => {
        timer = setTimeout(() => {
            dropdownMenu.style.display = 'none';
        }, 200);
    });
  
    // Handle user login state
    const user = sessionStorage.getItem('user');
    if (user) {
        const parsedUser = JSON.parse(user);
        // userNameElement.textContent = parsedUser.username;
        document.getElementById('user-name-link').textContent = parsedUser.username;
        userMenu.style.display = 'block';
        loginLink.style.display = 'none';
    } else {
        userMenu.style.display = 'none';
        loginLink.style.display = 'block';
    }
  
    // Toggle user dropdown
    document.getElementById('user-name-link').addEventListener('click', (e) => {
        e.preventDefault();
        userMenu.classList.toggle('open');
    });
  
    // Close dropdown if clicked outside
    window.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && e.target.id !== 'user-name-link') {
            userMenu.classList.remove('open');
        }
    });
  
    // My Bid History
    document.getElementById('my-bid-history').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'my_bids.html';
    });
  
    // Reset Password
    document.getElementById('reset-password').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'reset_pass.html';
    });
  
    // Delete Account
    document.getElementById('delete-account').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const user = JSON.parse(sessionStorage.getItem('user'));
            try {
                const response = await fetch(`http://localhost:5000/api/users/${user.user_id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Account deleted.');
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                } else {
                    alert('Failed to delete account.');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Something went wrong.');
            }
        }
    });
  
    // Logout
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
    window.onload = function() {
      const userNameElement = document.getElementById('user-name');
      const loginLink = document.getElementById('login-link');
  
      const user = sessionStorage.getItem('user');
  
      if (user) {
          const parsedUser = JSON.parse(user);
        //   userNameElement.textContent = parsedUser.username;
          document.getElementById('user-name-link').textContent = parsedUser.username;
          userNameElement.style.display = 'block';
          loginLink.style.display = 'none';
      } else {
          userNameElement.style.display = 'none';
          loginLink.style.display = 'block';
      }
  };
  });
  