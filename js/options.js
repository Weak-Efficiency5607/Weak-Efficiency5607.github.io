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

    // --- Visibility Settings ---
    const footerToggle = document.getElementById('footerToggleCheckbox');
    const navToggles = document.querySelectorAll('.nav-toggle-checkbox');
    
    let visSettings = {};
    try {
        visSettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
    } catch(e) {}
    
    // Initialize Header toggle
    const headerToggle = document.getElementById('headerToggleCheckbox');
    if (headerToggle) {
        headerToggle.checked = !!visSettings.hideHeader;
        headerToggle.addEventListener('change', (e) => {
            visSettings.hideHeader = e.target.checked;
            localStorage.setItem('visibilitySettings', JSON.stringify(visSettings));
            
            if (visSettings.hideHeader) {
                document.documentElement.classList.add('hide-header');
            } else {
                document.documentElement.classList.remove('hide-header');
            }
        });
    }

    // Initialize Footer toggle
    if (footerToggle) {
        footerToggle.checked = !!visSettings.hideFooter;
        footerToggle.addEventListener('change', (e) => {
            visSettings.hideFooter = e.target.checked;
            localStorage.setItem('visibilitySettings', JSON.stringify(visSettings));
            
            // Apply immediately
            if (visSettings.hideFooter) {
                document.documentElement.classList.add('hide-footer');
            } else {
                document.documentElement.classList.remove('hide-footer');
            }
        });
    }
    
    // Initialize Nav toggles
    const hiddenNavItems = visSettings.hiddenNavItems || [];
    navToggles.forEach(toggle => {
        const navUrl = toggle.getAttribute('data-nav');
        // If it's in the hidden list, the checkbox should be CHECKED
        toggle.checked = hiddenNavItems.includes(navUrl);
        
        toggle.addEventListener('change', (e) => {
            const isHidden = e.target.checked;
            if (isHidden) {
                if (!hiddenNavItems.includes(navUrl)) hiddenNavItems.push(navUrl);
            } else {
                const idx = hiddenNavItems.indexOf(navUrl);
                if (idx > -1) hiddenNavItems.splice(idx, 1);
            }
            
            visSettings.hiddenNavItems = hiddenNavItems;
            localStorage.setItem('visibilitySettings', JSON.stringify(visSettings));
            
            // Apply immediately if possible
            if (typeof window.injectNavigation === 'function') {
                window.injectNavigation();
            }
        });
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
