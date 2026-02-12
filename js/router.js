
document.addEventListener('DOMContentLoaded', () => {
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
            // Create a transition effect (fade out/in)
            currentMain.style.opacity = '0';
            currentMain.style.transition = 'opacity 0.2s';
            
            setTimeout(() => {
                // Update Main Content
                currentMain.innerHTML = newMain.innerHTML;
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Re-execute scripts
                handleScripts(newDoc);
                
                currentMain.style.opacity = '1';
                
                // Trigger custom event for pages that need to know they've been loaded dynamically
                document.dispatchEvent(new CustomEvent('page:loaded', { detail: { url: url } }));
                
            }, 200); 
        } else {
             window.location.reload();
        }

    } catch (error) {
        console.error('Error loading page:', error);
        window.location.reload(); 
    }
}

function handleScripts(newDoc) {
    // 1. Handle Head Scripts
    const newHeadScripts = Array.from(newDoc.querySelectorAll('head script'));
    newHeadScripts.forEach(script => {
        if (script.src && !document.querySelector(`head script[src="${script.src}"]`)) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = false;
            document.head.appendChild(newScript);
        }
    });

    // 2. Handle Body Scripts
    const newBodyScripts = Array.from(newDoc.querySelectorAll('body script'));
    newBodyScripts.forEach(script => {
        if (script.src && script.src.includes('router.js')) return;

        // Remove existing instances of this script to avoid duplicates
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
