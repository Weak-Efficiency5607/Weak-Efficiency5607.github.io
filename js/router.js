
document.addEventListener('DOMContentLoaded', () => {
    injectNavigation();
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
    } catch(e) {}

    const links = [
        { href: 'index.html', text: 'Home' },
        { href: 'actions.html', text: 'Encyclopedia', match: isWiki || currentPath === 'actions.html' },
        { href: 'shops.html', text: 'Vendor Directory' },
        { href: 'doctors.html', text: 'Map of doctors' },
        { href: 'theory.html', text: 'List of causes' },
        { href: 'success-stories.html', text: 'Success Stories' },
        { href: 'glossary.html', text: 'Dictionary' },
        { href: 'options.html', text: 'Options' }
    ].filter(link => {
        if (link.href === 'options.html') return true;
        return !visSettings.hiddenNavItems || !visSettings.hiddenNavItems.includes(link.href);
    });

    nav.innerHTML = links.map(link => {
        const isActive = link.match !== undefined ? link.match : (currentPath === link.href);
        const activeClass = isActive ? ' class="active"' : '';
        const href = prefix + link.href;
        return `<a href="${href}"${activeClass}>${link.text}</a>`;
    }).join('');
}
