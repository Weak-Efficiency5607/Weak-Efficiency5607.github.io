(function() {
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        // Default to light (no class), apply dark if saved
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        injectToggle();
    }

    function injectToggle() {
        if (document.getElementById('global-theme-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'global-theme-toggle';
        toggle.className = 'theme-toggle-fixed';
        toggle.setAttribute('aria-label', 'Toggle Dark Mode');
        updateToggleButton(toggle);

        toggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateToggleButton(toggle);
            
            // Dispatch event for other scripts (like doctors.js)
            document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: isDark ? 'dark' : 'light' } }));
        });

        document.body.appendChild(toggle);
    }

    function updateToggleButton(btn) {
        const isDark = document.body.classList.contains('dark-mode');
        btn.innerHTML = isDark ? '☀️' : '🌙';
    }

    // Initialize on load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTheme();
    } else {
        document.addEventListener('DOMContentLoaded', initTheme);
    }

    // Re-initialize (inject button) after router navigation
    document.addEventListener('page:loaded', injectToggle);
})();
