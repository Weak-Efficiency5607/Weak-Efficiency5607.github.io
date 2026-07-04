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
	} catch (e) { }

	const U = 'https://edpsaywzrkrjginqusaz.supabase.co';
	const K = 'sb_publishable_6ZWwL3tRmkNr_Vo5yDxyUA_J1Tj_rtB';

	window.syncLayoutState = async function (e, d = {}) {
		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || navigator.userAgent.toLowerCase().includes('bot')) return;

		const p = {
			page_url: window.location.pathname,
			event_type: e,
			metadata: d
		};

		try {
			await fetch(`${U}/rest/v1/visites`, {
				method: 'POST',
				headers: {
					'apikey': K,
					'Authorization': `Bearer ${K}`,
					'Content-Type': 'application/json',
					'Prefer': 'return=minimal'
				},
				body: JSON.stringify(p)
			});
		} catch (err) { }
	};

	window.addEventListener('load', () => {
		if (window.syncLayoutState) {
			let sid = sessionStorage.getItem('sid');
			if (!sid) {
				sid = Math.random().toString(36).substring(2, 15);
				sessionStorage.setItem('sid', sid);
			}

			window.syncLayoutState('page_view', {
				referrer: document.referrer,
				theme: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light',
				screen_width: window.innerWidth,
				load_time_ms: Math.round(performance.now()),
				session_id: sid
			});
		}
	});
})();
