
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
                
                // Update Layout Classes if any (e.g. wrapper classes in body?)
                // Assuming body classes might change (like 'light-mode' persistence is handled by local storage usually, 
                // but if pages have specific classes, we should sync them.
                // For now, index and actions seem to share style. 
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Re-execute scripts
                handleScripts(newDoc);
                
                currentMain.style.opacity = '1';
                
                // Update Navigation Links Active State (if any)
                // (Optional: adding 'active' class to nav links)
                
            }, 200); // 200ms matches transition
        } else {
            // Fallback for pages without <main>
             window.location.reload();
        }

    } catch (error) {
        console.error('Error loading page:', error);
        window.location.reload(); // Fallback to full reload on error
    }
}

function handleScripts(newDoc) {
    // 1. Handle Head Scripts (e.g., marked.min.js)
    const newHeadScripts = Array.from(newDoc.querySelectorAll('head script'));
    const currentHeadScripts = Array.from(document.querySelectorAll('head script'));
    
    newHeadScripts.forEach(script => {
        // Check if script is already present
        // Identify by src or content
        const isLoaded = currentHeadScripts.some(s => 
            (s.src && s.src === script.src) || 
            (!s.src && s.textContent === script.textContent)
        );
        
        if (!isLoaded) {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
                newScript.async = false; // Execute in order
            } else {
                newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript);
        }
    });

    // 2. Handle Body Scripts
    // We specifically look for scripts that were intended to run on the page.
    // In our case, `actions.js`.
    const newBodyScripts = Array.from(newDoc.querySelectorAll('body script'));
    
    newBodyScripts.forEach(script => {
        // Skip router.js itself to avoid infinite loops or re-binding
        if (script.src && script.src.includes('router.js')) return;

        const newScript = document.createElement('script');
        if (script.src) {
            // Add timestamp to force strictly new execution if needed?
            // Actually, standard appending creates a new instance.
            // But if src is same, browser might use cached RESPONSE, but execution happens again.
            newScript.src = script.src;
            newScript.async = false;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
    });
}
