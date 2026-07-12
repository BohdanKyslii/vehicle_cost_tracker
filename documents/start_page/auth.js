(function () {
    const backdrop = document.getElementById('authBackdrop');
    const card     = document.getElementById('authCard');
    const openBtn  = document.getElementById('headerAuthBtn');

    function open(signup) {
        card.classList.toggle('is-signup', !!signup);
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Navbar "Sign Up" button
    if (openBtn) {
        openBtn.addEventListener('click', function (e) {
            e.preventDefault();
            open(false);
        });
    }

    // Switch to signup / login
    document.addEventListener('click', function (e) {
        const sw = e.target.closest('[data-auth-switch]');
        if (sw) {
            e.preventDefault();
            card.classList.toggle('is-signup', sw.dataset.authSwitch === 'signup');
        }

        if (e.target.closest('[data-auth-close]')) {
            close();
        }

        // Click outside the card
        if (e.target === backdrop) {
            close();
        }
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) {
            close();
        }
    });
})();
