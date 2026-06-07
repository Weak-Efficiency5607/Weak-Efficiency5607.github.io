
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
	window.addEventListener('popstate', () => {
		loadPage(window.location.href);
	});
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
		{ href: 'index.html', text: 'Home' },
		{ href: 'actions.html', text: 'Encyclopedia', match: isWiki || currentPath === 'actions.html' },
		{ href: 'treatments.html', text: 'Treatments' },
		{ href: 'tests.html', text: 'Tests' },
		{ href: 'treatment-finder.html', text: 'Treatment Finder' },
		{ href: 'shops.html', text: 'Vendor Directory' },
		{ href: 'doctors.html', text: 'Map of doctors' },
		{ href: 'theory.html', text: 'List of causes' },
		{ href: 'success-stories.html', text: 'Success Stories' },
		{ href: 'glossary.html', text: 'Dictionary' },
		{ href: 'options.html', text: 'Options' }
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
				return `<a href="${href}"${activeClass}>${link.text}</a>`;
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
