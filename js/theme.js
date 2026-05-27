(function() {
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        // Default to light (no class), apply dark if saved
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Expose toggle globally for the options page
    window.toggleTheme = function(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: isDark ? 'dark' : 'light' } }));
    };

    // Initialize on load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTheme();
    } else {
        document.addEventListener('DOMContentLoaded', initTheme);
    }
})();
