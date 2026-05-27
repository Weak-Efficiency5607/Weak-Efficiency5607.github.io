if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptionsPage);
} else {
    initOptionsPage();
}

function initOptionsPage() {
    const toggleCheckbox = document.getElementById('themeToggleCheckbox');
    if (!toggleCheckbox) return;

    // Set initial state
    const isDark = document.documentElement.classList.contains('dark-mode');
    toggleCheckbox.checked = isDark;
    updateLabels(isDark);

    // Handle changes
    toggleCheckbox.addEventListener('change', (e) => {
        const darkModeEnabled = e.target.checked;
        updateLabels(darkModeEnabled);
        
        // Call the global toggle function we exposed in theme.js
        if (window.toggleTheme) {
            window.toggleTheme(darkModeEnabled);
        }
    });
}

function updateLabels(isDark) {
    const lightLabel = document.getElementById('lightLabel');
    const darkLabel = document.getElementById('darkLabel');
    if(lightLabel && darkLabel) {
        lightLabel.style.fontWeight = isDark ? '400' : '700';
        lightLabel.style.color = isDark ? 'var(--text-secondary)' : 'var(--text-primary)';
        
        darkLabel.style.fontWeight = isDark ? '700' : '400';
        darkLabel.style.color = isDark ? 'var(--text-primary)' : 'var(--text-secondary)';
    }
}
