(() => {
	function initTreatmentsPage() {
		let prescribeItData = [];
		const loadPrescribeItBtn = document.getElementById('load-prescribeit-btn');
		const prescribeItProgressContainer = document.getElementById('prescribeit-progress-container');
		const prescribeItProgressBar = document.getElementById('prescribeit-progress-bar');
		const prescribeItProgressText = document.getElementById('prescribeit-progress-text');
		const prescribeItSearchContainer = document.getElementById('prescribeit-search-container');
		const prescribeItSearchInput = document.getElementById('prescribeit-search');
		const prescribeItResultsContainer = document.getElementById('prescribeit-results');
		const prescribeItResultCount = document.getElementById('prescribeit-result-count');

		if (loadPrescribeItBtn) {
			// Remove any existing listeners to prevent duplicates if re-initialized
			const newBtn = loadPrescribeItBtn.cloneNode(true);
			loadPrescribeItBtn.parentNode.replaceChild(newBtn, loadPrescribeItBtn);
			
			newBtn.addEventListener('click', async () => {
				newBtn.style.display = 'none';
				prescribeItProgressContainer.style.display = 'block';

				try {
					prescribeItProgressBar.style.width = '30%';
					const response = await fetch('data/PrescribeIT-5.0/data/consolidated/json/Subset_PrescriptionMedicinalProduct_LATEST.json');
					if (!response.ok) throw new Error('Failed to fetch JSON');
					
					prescribeItProgressBar.style.width = '60%';
					prescribeItProgressText.textContent = 'Parsing database...';
					
					const data = await response.json();
					prescribeItData = data.concepts || [];

					prescribeItProgressBar.style.width = '100%';
					prescribeItProgressText.textContent = 'Ready!';

					setTimeout(() => {
						prescribeItProgressContainer.style.display = 'none';
						prescribeItSearchContainer.style.display = 'block';
						renderPrescribeItResults('');
						document.getElementById('prescribeit-search').focus();
					}, 500);

				} catch (err) {
					console.error("Failed to load PrescribeIT data:", err);
					prescribeItProgressText.textContent = "Error loading database. Please try again.";
					prescribeItProgressText.style.color = "red";
					newBtn.style.display = 'inline-block';
				}
			});
		}

		let prescribeItSearchTimeout;
		const searchInput = document.getElementById('prescribeit-search');
		if (searchInput) {
			const newSearchInput = searchInput.cloneNode(true);
			searchInput.parentNode.replaceChild(newSearchInput, searchInput);

			newSearchInput.addEventListener('input', (e) => {
				clearTimeout(prescribeItSearchTimeout);
				prescribeItSearchTimeout = setTimeout(() => {
					renderPrescribeItResults(e.target.value);
				}, 300);
			});
		}

		function renderPrescribeItResults(query) {
			const container = document.getElementById('prescribeit-results');
			const count = document.getElementById('prescribeit-result-count');
			if (!container) return;

			container.innerHTML = '';
			const normalizedQuery = query.toLowerCase().trim();

			let results = [];
			if (!normalizedQuery || normalizedQuery.length < 2) {
				results = prescribeItData.slice(0, 50);
			} else {
				results = prescribeItData.filter(item => {
					const id = (item.id || '').toLowerCase();
					const name = (item.name || '').toLowerCase();
					const enName = (item.enDisplayName || '').toLowerCase();
					const frName = (item.frDisplayName || '').toLowerCase();
					const din = (item.properties && item.properties.Health_Canada_identifier) ? item.properties.Health_Canada_identifier.toLowerCase() : '';
					
					return id.includes(normalizedQuery) || 
					       name.includes(normalizedQuery) || 
					       enName.includes(normalizedQuery) || 
					       frName.includes(normalizedQuery) ||
					       din.includes(normalizedQuery);
				}).slice(0, 50);
			}

			if (count) count.textContent = results.length;

			if (results.length === 0) {
				container.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No results found.</div>';
				return;
			}

			const fragment = document.createDocumentFragment();
			results.forEach(item => {
				const li = document.createElement('div');
				li.style.padding = '1rem';
				li.style.borderBottom = '1px solid var(--card-border)';
				li.style.display = 'flex';
				li.style.flexDirection = 'column';
				li.style.gap = '0.5rem';

				const header = document.createElement('div');
				header.style.display = 'flex';
				header.style.justifyContent = 'space-between';
				header.style.alignItems = 'flex-start';

				const title = document.createElement('div');
				title.style.fontWeight = '600';
				title.style.color = 'var(--text-primary)';
				title.innerHTML = highlight(item.enDisplayName || item.name || '', query);
				
				const rightGroup = document.createElement('div');
				rightGroup.style.display = 'flex';
				rightGroup.style.flexDirection = 'column';
				rightGroup.style.alignItems = 'flex-end';
				rightGroup.style.gap = '0.3rem';

				const codeBadge = document.createElement('span');
				codeBadge.style.fontSize = '0.8rem';
				codeBadge.style.padding = '0.2rem 0.6rem';
				codeBadge.style.background = 'rgba(var(--accent-rgb), 0.1)';
				codeBadge.style.color = 'var(--accent)';
				codeBadge.style.borderRadius = '4px';
				codeBadge.style.border = '1px solid rgba(var(--accent-rgb), 0.2)';
				codeBadge.innerHTML = 'ID: ' + highlight(item.id || '', query);
				rightGroup.appendChild(codeBadge);

				if (item.properties && item.properties.Health_Canada_identifier) {
					const dinBadge = document.createElement('span');
					dinBadge.style.fontSize = '0.8rem';
					dinBadge.style.padding = '0.2rem 0.6rem';
					dinBadge.style.background = 'rgba(40, 167, 69, 0.1)';
					dinBadge.style.color = '#28a745';
					dinBadge.style.borderRadius = '4px';
					dinBadge.style.border = '1px solid rgba(40, 167, 69, 0.2)';
					dinBadge.innerHTML = 'DIN: ' + highlight(item.properties.Health_Canada_identifier, query);
					rightGroup.appendChild(dinBadge);
				}

				header.appendChild(title);
				header.appendChild(rightGroup);
				li.appendChild(header);

				if (item.frDisplayName) {
					const frDesc = document.createElement('div');
					frDesc.style.fontSize = '0.85rem';
					frDesc.style.color = 'var(--text-secondary)';
					frDesc.innerHTML = 'FR: ' + highlight(item.frDisplayName, query);
					li.appendChild(frDesc);
				}

				fragment.appendChild(li);
			});

			container.appendChild(fragment);
		}

		function highlight(text, query) {
			if (!query || query.length < 2) return text;
			const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
			return text.replace(regex, '<mark style="background: rgba(var(--accent-rgb), 0.2); color: var(--accent); border-radius: 2px; padding: 0 2px;">$1</mark>');
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initTreatmentsPage);
	} else {
		initTreatmentsPage();
	}

	if (!window._treatmentsListenerAdded) {
		document.addEventListener('page:loaded', (e) => {
			if (e.detail.url.includes('treatments.html') || window.location.pathname.includes('treatments.html')) {
				initTreatmentsPage();
			}
		});
		window._treatmentsListenerAdded = true;
	}
})();
