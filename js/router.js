
document.addEventListener('DOMContentLoaded', () => {
	injectNavigation();
	injectFooter();
	// Intercept clicks on links
	document.addEventListener('click', e => {
		const link = e.target.closest('a');
		if (!link) return;

		// Ignore external links, anchors, or special modifiers
		if (link.hostname !== window.location.hostname ||
			link.protocol !== window.location.protocol ||
			link.getAttribute('target') === '_blank' ||
			e.ctrlKey || e.metaKey || e.shiftKey || e.altKey ||
			link.getAttribute('href').startsWith('#')) {
			return;
		}

		// Prevent default navigation
		e.preventDefault();
		const url = link.href;

		// Push to history
		window.history.pushState({ path: url }, '', url);

		// Load the page
		loadPage(url);
	});

	// Handle back/forward buttons
	let currentPathName = window.location.pathname;
	window.addEventListener('popstate', () => {
		if (window.location.pathname !== currentPathName) {
			currentPathName = window.location.pathname;
			loadPage(window.location.href);
		}
	});
	
	// Update path when we manually push state
	const originalPushState = window.history.pushState;
	window.history.pushState = function() {
		originalPushState.apply(this, arguments);
		currentPathName = window.location.pathname;
	};
});

async function loadPage(url) {
	try {
		// Fetch the new page
		const response = await fetch(url);
		if (!response.ok) throw new Error('Page not found');
		const text = await response.text();

		// Parse the HTML
		const parser = new DOMParser();
		const newDoc = parser.parseFromString(text, 'text/html');

		// Update Title
		document.title = newDoc.title;

		// Swap Content (Main)
		const currentMain = document.querySelector('main');
		const newMain = newDoc.querySelector('main');

		if (currentMain && newMain) {
			// Update Main Content
			currentMain.innerHTML = newMain.innerHTML;

			// Sync attributes (like classes for different layouts)
			Array.from(newMain.attributes).forEach(attr => {
				if (attr.name !== 'style') {
					currentMain.setAttribute(attr.name, attr.value);
				}
			});
			// Remove attributes that are not in the new main
			Array.from(currentMain.attributes).forEach(attr => {
				if (attr.name !== 'style' && !newMain.hasAttribute(attr.name)) {
					currentMain.removeAttribute(attr.name);
				}
			});

			// Scroll to top
			window.scrollTo(0, 0);

			// Sync assets (Styles and Scripts)
			syncAssets(newDoc);

			// Re-inject navigation to ensure layout/highlights sync
			injectNavigation();
			injectFooter();

			// Reset body state (in case navigating from fullscreen map)
			document.body.style.overflow = '';

			// Trigger custom event
			document.dispatchEvent(new CustomEvent('page:loaded', { detail: { url: url } }));
		} else {
			window.location.reload();
		}

	} catch (error) {
		console.error('Error loading page:', error);
		window.location.reload();
	}
}

function syncAssets(newDoc) {
	// 1. Handle Stylesheets
	const newLinks = Array.from(newDoc.querySelectorAll('link[rel="stylesheet"]'));
	newLinks.forEach(link => {
		if (!document.querySelector(`link[href="${link.href}"]`)) {
			const newLink = document.createElement('link');
			newLink.rel = 'stylesheet';
			newLink.href = link.href;
			document.head.appendChild(newLink);
		}
	});

	// 2. Handle Inline Styles
	const newStyles = Array.from(newDoc.querySelectorAll('style'));
	newStyles.forEach(style => {
		const newStyle = document.createElement('style');
		newStyle.textContent = style.textContent;
		document.head.appendChild(newStyle);
	});

	// 3. Handle Scripts (Head)
	const newHeadScripts = Array.from(newDoc.querySelectorAll('head script'));
	newHeadScripts.forEach(script => {
		if (script.src && !document.querySelector(`script[src="${script.src}"]`)) {
			const newScript = document.createElement('script');
			newScript.src = script.src;
			newScript.async = false;
			document.head.appendChild(newScript);
		}
	});

	// 4. Handle Scripts (Body)
	const newBodyScripts = Array.from(newDoc.querySelectorAll('body script'));
	newBodyScripts.forEach(script => {
		if (script.src && script.src.includes('router.js')) return;

		// For internal scripts (like js/actions.js, js/shops.js, etc.), we want to re-execute them.
		// For libraries that are already loaded, we might want to skip.
		// However, it's safer to re-inject scripts that are intended for the page.

		if (script.src) {
			const existing = document.querySelector(`body script[src="${script.src}"]`);
			if (existing) existing.remove();
		}

		const newScript = document.createElement('script');
		if (script.src) {
			newScript.src = script.src;
			newScript.async = false;
		} else {
			newScript.textContent = script.textContent;
		}
		document.body.appendChild(newScript);
	});
}

function injectNavigation() {
	let nav = document.querySelector('.main-nav');
	if (!nav) {
		const header = document.querySelector('.site-header');
		if (header) {
			nav = document.createElement('nav');
			nav.className = 'main-nav';
			header.parentNode.insertBefore(nav, header.nextSibling);
		} else {
			const main = document.querySelector('main');
			if (main) {
				nav = document.createElement('nav');
				nav.className = 'main-nav';
				main.prepend(nav);
			}
		}
	}

	if (!nav) return;

	let currentPath = window.location.pathname.split('/').pop();
	if (!currentPath || currentPath === '') currentPath = 'index.html';

	const isWiki = window.location.search.includes('md=') || currentPath.includes('alone-') || currentPath.includes('multiple-') || currentPath.includes('product-');
	const isInWikiSubdir = window.location.pathname.includes('/wiki/');
	const prefix = isInWikiSubdir ? '../' : '';

	let visSettings = {};
	try {
		visSettings = JSON.parse(localStorage.getItem('visibilitySettings')) || {};
	} catch (e) { }

	const hiddenNavItems = visSettings.hiddenNavItems || ['treatment-finder.html'];

	const links = [
		{ href: 'index.html', text: 'Home', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
		{ href: 'actions.html', text: 'Encyclopedia', match: isWiki || currentPath === 'actions.html', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>' },
		{ href: 'treatments.html', text: 'Treatments', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>' },
		{ href: 'tests.html', text: 'Tests', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>' },
		{ href: 'treatment-finder.html', text: 'Treatment Finder', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' },
		{ href: 'shops.html', text: 'Vendor Directory', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
		{ href: 'doctors.html', text: 'Map of doctors', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' },
		{ href: 'theory.html', text: 'List of causes', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path></svg>' },
		{ href: 'success-stories.html', text: 'Success Stories', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>' },
		{ href: 'glossary.html', text: 'Dictionary', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>' },
		{ href: 'options.html', text: 'Options', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' }
	].filter(link => {
		if (link.href === 'options.html') return true;
		return !hiddenNavItems.includes(link.href);
	});

	nav.innerHTML = `
		<button class="nav-arrow left" aria-label="Scroll left">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
		</button>
		<div class="main-nav-content">
			${links.map(link => {
				const isActive = link.match !== undefined ? link.match : (currentPath === link.href);
				const activeClass = isActive ? ' class="active"' : '';
				const href = prefix + link.href;
				return `<a href="${href}"${activeClass}>${link.icon || ''} <span>${link.text}</span></a>`;
			}).join('')}
		</div>
		<button class="nav-arrow right" aria-label="Scroll right">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
		</button>
	`;

	const content = nav.querySelector('.main-nav-content');
	const leftBtn = nav.querySelector('.nav-arrow.left');
	const rightBtn = nav.querySelector('.nav-arrow.right');

	const updateArrows = () => {
		// Only show arrows if there is overflow
		if (content.scrollWidth > content.clientWidth) {
			leftBtn.classList.toggle('visible', content.scrollLeft > 5);
			rightBtn.classList.toggle('visible', content.scrollLeft < content.scrollWidth - content.clientWidth - 5);
			nav.classList.add('has-overflow');
		} else {
			leftBtn.classList.remove('visible');
			rightBtn.classList.remove('visible');
			nav.classList.remove('has-overflow');
		}
	};

	content.addEventListener('scroll', updateArrows);
	window.addEventListener('resize', updateArrows);

	content.addEventListener('wheel', (e) => {
		if (content.scrollWidth > content.clientWidth) {
			if (e.deltaY !== 0 && e.deltaX === 0) {
				e.preventDefault();
				content.scrollBy({ left: e.deltaY > 0 ? 100 : -100, behavior: 'smooth' });
			}
		}
	}, { passive: false });

	leftBtn.addEventListener('click', () => {
		content.scrollBy({ left: -250, behavior: 'smooth' });
	});
	rightBtn.addEventListener('click', () => {
		content.scrollBy({ left: 250, behavior: 'smooth' });
	});

	// Wait for layout
	setTimeout(updateArrows, 50);
}

function injectFooter() {
	let footer = document.querySelector('.site-footer');
	if (footer) return; // Already exists

	const main = document.querySelector('main.container');
	if (!main) return;

	footer = document.createElement('footer');
	footer.className = 'site-footer';

	footer.innerHTML = `
		<div class="footer-content">
			<p class="disclaimer">
				<strong>Disclaimer:</strong> The information provided on this site is for educational and research
				purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or
				treatment.
			</p>
			<div class="footer-links">
				<span>Contact: <a href="mailto:pakoskiv@gmail.com">pakoskiv@gmail.com</a> | Discord
					(pakoskiv)</span>
				<span>Author: <a href="https://www.reddit.com/user/Alternative-Gur9717/">Reddit (Current)</a> | <a
						href="https://www.reddit.com/user/Weak-Efficiency5607/comments/1grfkuv/myself/">Reddit
						(Old)</a></span>
			</div>
			<p class="copyright">
				© 2026 Anhedonia Resource Hub. Open-source research.
			</p>
		</div>
	`;

	main.appendChild(footer);
}
