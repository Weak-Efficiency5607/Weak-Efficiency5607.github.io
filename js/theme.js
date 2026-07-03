(function () {
	// Run immediately to prevent flash
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'dark') {
		document.documentElement.classList.add('dark-mode');
	} else if (savedTheme === 'light') {
		document.documentElement.classList.remove('dark-mode');
	} else {
		// No saved preference, use system preference
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark-mode');
		} else {
			document.documentElement.classList.remove('dark-mode');
		}
	}

	// Apply visibility settings
	try {
		const visSettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
		if (visSettings.hideFooter) {
			document.documentElement.classList.add('hide-footer');
		} else {
			document.documentElement.classList.remove('hide-footer');
		}

		if (visSettings.hideHeader) {
			document.documentElement.classList.add('hide-header');
		} else {
			document.documentElement.classList.remove('hide-header');
		}
	} catch (e) { }

	// Expose toggle globally for the options page
	window.toggleTheme = function (isDark) {
		if (isDark) {
			document.documentElement.classList.add('dark-mode');
		} else {
			document.documentElement.classList.remove('dark-mode');
		}
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: isDark ? 'dark' : 'light' } }));
	};

	try {
		const s = document.createElement('script');
		s.defer = true;
		s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
		s.setAttribute('data-cf-beacon', '{"token": "b73bb846481247ccacbece91d9c26720"}');
		document.head.appendChild(s);
	} catch (e) {}
})();
