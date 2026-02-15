
(function() {
    async function init() {
        const searchInput = document.getElementById('shop-search');
        const searchResults = document.getElementById('search-results');
        if (!searchInput || !searchResults) return;

        let searchIndex = [];
        let substancesIndex = [];

        // Load the shop search index and substances index
        try {
            const [shopRes, subRes] = await Promise.all([
                fetch('shop-search-index.json'),
                fetch('substances.json')
            ]);

            if (shopRes.ok) searchIndex = await shopRes.json();
            if (subRes.ok) substancesIndex = await subRes.json();
            
            // Load Hip's sources and populate the table
            const hipContainer = document.getElementById('hip-sources-body');
            if (hipContainer) {
                try {
                    const hipRes = await fetch('hip-sources.json');
                    if (hipRes.ok) {
                        const hipData = await hipRes.json();
                        hipContainer.innerHTML = '';
                        hipData.forEach(item => {
                            const tr = document.createElement('tr');
                            tr.style.borderBottom = '1px solid var(--card-border)';
                            tr.innerHTML = `
                                <td style="padding: 12px;"><a href="${item.url}" target="_blank">${item.name}</a></td>
                                <td style="padding: 12px;">${item.type}</td>
                                <td style="padding: 12px;">${item.shipping}</td>
                            `;
                            hipContainer.appendChild(tr);
                            
                            // Add to search index if missing
                            if (!searchIndex.some(idxItem => idxItem.url && idxItem.url.includes(item.url))) {
                                searchIndex.push({
                                    title: item.name,
                                    url: item.url,
                                    category: "Additional Source (Hip)",
                                    content: `Source: ${item.name}. Type: ${item.type}. Shipping: ${item.shipping}.`
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Failed to load Hip sources:', e);
                }
            }

            // Update shop count
            const shopCountElement = document.getElementById('shop-count');
            if (shopCountElement && searchIndex.length > 0) {
                shopCountElement.textContent = `${searchIndex.length} shops indexed`;
            }
        } catch (e) {
            console.error('Failed to load indices:', e);
        }

        function updateSearch(query) {
            searchResults.innerHTML = '';
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            // 1. Filter Substances (Suggestions)
            const subMatches = substancesIndex
                .filter(s => s.toLowerCase().includes(query))
                .filter(s => !s.includes('/Piece') && !s.includes('/piece') && s.length > 3) 
                .slice(0, 8); 

            if (subMatches.length > 0) {
                const suggestionHeader = document.createElement('div');
                suggestionHeader.className = 'search-result-category-header';
                suggestionHeader.innerHTML = '<span>Substance Suggestions</span>';
                searchResults.appendChild(suggestionHeader);

                const container = document.createElement('div');
                container.className = 'suggestions-container';
                
                subMatches.forEach(sub => {
                    const div = document.createElement('div');
                    div.className = 'substance-suggestion-chip';
                    div.innerHTML = `<strong>${highlight(sub, query)}</strong>`;
                    div.addEventListener('click', () => {
                        searchInput.value = sub;
                        updateSearch(sub.toLowerCase());
                        searchInput.focus();
                    });
                    container.appendChild(div);
                });
                searchResults.appendChild(container);
            }

            // 2. Filter Shops
            const shopMatches = searchIndex.filter(item => 
                (item.title && item.title.toLowerCase().includes(query)) || 
                (item.content && item.content.toLowerCase().includes(query))
            );

            if (shopMatches.length > 0) {
                const shopHeader = document.createElement('div');
                shopHeader.className = 'search-result-category-header';
                shopHeader.innerHTML = '<span>Matching Shops</span>';
                if (subMatches.length > 0) searchResults.appendChild(shopHeader);

                shopMatches.slice(0, 20).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    
                    const highlightedTitle = highlight(item.title, query);
                    const snippet = getSnippet(item.content, query);
                    
                    div.innerHTML = `
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                            <div class="search-result-header">
                                <strong>${highlightedTitle}</strong>
                                <span class="category-tag">${item.category || ''}</span>
                            </div>
                            <div class="search-result-snippet">${snippet}</div>
                        </a>
                    `;
                    searchResults.appendChild(div);
                });
            }

            if (subMatches.length === 0 && shopMatches.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No matches found</div>';
            }
            
            searchResults.style.display = 'block';
        }

        searchInput.addEventListener('input', (e) => {
            updateSearch(e.target.value.toLowerCase().trim());
        });

        function highlight(text, query) {
            if (!text) return '';
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        function getSnippet(content, query) {
            if (!content) return '';
            const index = content.toLowerCase().indexOf(query);
            if (index === -1) return content.substring(0, 100) + '...';
            
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + query.length + 60);
            let snippet = content.substring(start, end);
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';
            return highlight(snippet, query);
        }


        // Close results when clicking outside
        const clickHandler = (e) => {
            const searchInput = document.getElementById('shop-search');
            const searchResults = document.getElementById('search-results');
            if (searchInput && searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        };

        if (window.shopsPageClickHandler) {
            document.removeEventListener('click', window.shopsPageClickHandler);
        }
        window.shopsPageClickHandler = clickHandler;
        document.addEventListener('click', clickHandler);

        // Handle focus to show results again if they were hidden
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2) {
                searchResults.style.display = 'block';
            }
        });
    }

    // Run init
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
