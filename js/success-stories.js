(() => {
	let stories = [];

	// Application State
	let state = {
		currentPage: 1,
		itemsPerPage: 6,
		searchQuery: '',
		filters: {
			substance: 'all',
			type: 'all',
			cause: 'all'
		}
	};

	async function initSuccessStories() {
		const grid = document.getElementById('stories-grid');
		if (!grid) return; // Not on the success stories page

		try {
			const response = await fetch('data/success-stories.json');
			stories = await response.json();
		} catch (err) {
			console.error("Error loading success stories:", err);
			grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 4rem;">Error loading stories. Please try again later.</div>';
			return;
		}

		initControls();
		renderPage();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSuccessStories);
	} else {
		initSuccessStories();
	}

	function initControls() {
		// Populate filter dropdowns with counts
		const substancesCount = new Map();
		const typesCount = new Map();
		const causesCount = new Map();

		stories.forEach(story => {
			if (Array.isArray(story.meta.substances)) {
				story.meta.substances.forEach(s => {
					if (s) substancesCount.set(s, (substancesCount.get(s) || 0) + 1);
				});
			} else if (story.meta.substances) {
				substancesCount.set(story.meta.substances, (substancesCount.get(story.meta.substances) || 0) + 1);
			}
			
			if (story.meta.type) {
				typesCount.set(story.meta.type, (typesCount.get(story.meta.type) || 0) + 1);
			}
			if (story.meta.cause) {
				causesCount.set(story.meta.cause, (causesCount.get(story.meta.cause) || 0) + 1);
			}
		});

		populateSelect('filter-substance', Array.from(substancesCount.entries()).sort((a, b) => a[0].localeCompare(b[0])));
		populateSelect('filter-type', Array.from(typesCount.entries()).sort((a, b) => a[0].localeCompare(b[0])));
		populateSelect('filter-cause', Array.from(causesCount.entries()).sort((a, b) => a[0].localeCompare(b[0])));

		// Initialize Choices.js
		const choicesOptions = {
			searchEnabled: true,
			searchPlaceholderValue: "Search...",
			itemSelectText: '',
			shouldSort: false // Already sorted
		};
		
		const substanceChoice = new Choices(document.getElementById('filter-substance'), choicesOptions);
		const typeChoice = new Choices(document.getElementById('filter-type'), choicesOptions);
		const causeChoice = new Choices(document.getElementById('filter-cause'), choicesOptions);

		// Event Listeners
		document.getElementById('search-input').addEventListener('input', (e) => {
			state.searchQuery = e.target.value.toLowerCase();
			state.currentPage = 1;
			renderPage();
		});

		document.getElementById('per-page-select').addEventListener('change', (e) => {
			state.itemsPerPage = e.target.value === 'all' ? stories.length : parseInt(e.target.value);
			state.currentPage = 1;
			renderPage();
		});

		['substance', 'type', 'cause'].forEach(filterKey => {
			document.getElementById(`filter-${filterKey}`).addEventListener('change', (e) => {
				state.filters[filterKey] = e.target.value;
				state.currentPage = 1;
				renderPage();
			});
		});
	}

	function populateSelect(elementId, optionsEntries) {
		const select = document.getElementById(elementId);
		if (!select) return;
		optionsEntries.forEach(([opt, count]) => {
			if (!opt || opt === 'Unknown') return; // Skip unknown/empty
			const el = document.createElement('option');
			el.value = opt;
			el.textContent = count > 1 ? `${opt} (${count})` : opt;
			select.appendChild(el);
		});
	}

	function getFilteredStories() {
		return stories.filter(story => {
			// 1. Search Query
			if (state.searchQuery) {
				const searchStr = `
				${story.title} 
				${story.subtitle || ''} 
				${Array.isArray(story.meta.substances) ? story.meta.substances.join(' ') : story.meta.substances}
				${story.meta.type}
				${story.meta.cause}
				${story.meta.summary}
			`.toLowerCase();
				if (!searchStr.includes(state.searchQuery)) return false;
			}

			// 2. Filters
			if (state.filters.substance !== 'all') {
				const hasSubstance = Array.isArray(story.meta.substances)
					? story.meta.substances.includes(state.filters.substance)
					: story.meta.substances === state.filters.substance;
				if (!hasSubstance) return false;
			}

			if (state.filters.type !== 'all' && story.meta.type !== state.filters.type) return false;
			if (state.filters.cause !== 'all' && story.meta.cause !== state.filters.cause) return false;

			return true;
		});
	}

	function renderPage() {
		const grid = document.getElementById('stories-grid');
		const filteredStories = getFilteredStories();

		// Update count
		document.getElementById('total-stories-count').textContent = filteredStories.length;

		// Pagination math
		const totalPages = Math.ceil(filteredStories.length / state.itemsPerPage) || 1;
		if (state.currentPage > totalPages) state.currentPage = totalPages;

		const startIndex = (state.currentPage - 1) * state.itemsPerPage;
		const endIndex = startIndex + state.itemsPerPage;
		const storiesToRender = filteredStories.slice(startIndex, endIndex);

		// Render Grid
		grid.innerHTML = '';

		if (storiesToRender.length === 0) {
			grid.innerHTML = '<div class="search-no-results" style="grid-column: 1 / -1; padding: 4rem;">No stories found matching your criteria.</div>';
		}

		storiesToRender.forEach(story => {
			const card = document.createElement('div');
			card.className = story.isExternal ? 'card story-card external-card' : 'card story-card';

			let subtitleHtml = story.subtitle ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">${story.subtitle}</p>` : '';

			let substancesHtml = '';
			if (story.meta.substances) {
				if (Array.isArray(story.meta.substances)) {
					substancesHtml = story.meta.substances.map(s => `<span>${s}</span>`).join(' ');
				} else {
					substancesHtml = `<span>${story.meta.substances}</span>`;
				}
			}

			let metaHtml = '';
			const knownKeys = ['substances', 'type', 'effectiveness', 'timeTaken', 'cause', 'duration', 'summary'];
			
			if (story.meta.substances) metaHtml += `<div class="meta-item"><strong>Substances:</strong> ${substancesHtml}</div>`;
			if (story.meta.type) metaHtml += `<div class="meta-item"><strong>Type:</strong> <span>${story.meta.type}</span></div>`;
			if (story.meta.effectiveness) metaHtml += `<div class="meta-item"><strong>Effectiveness:</strong> <span>${story.meta.effectiveness}</span></div>`;
			if (story.meta.timeTaken) metaHtml += `<div class="meta-item"><strong>Time Taken:</strong> <span>${story.meta.timeTaken}</span></div>`;
			if (story.meta.cause) metaHtml += `<div class="meta-item"><strong>Cause:</strong> <span>${story.meta.cause}</span></div>`;
			if (story.meta.duration) metaHtml += `<div class="meta-item"><strong>Duration:</strong> <span>${story.meta.duration}</span></div>`;

			// Dynamically add any other unknown fields from external databases
			for (const key in story.meta) {
				if (!knownKeys.includes(key) && story.meta[key]) {
					metaHtml += `<div class="meta-item"><strong>${key}:</strong> <span>${story.meta[key]}</span></div>`;
				}
			}

			if (story.meta.summary) metaHtml += `<div class="meta-summary"><strong>Summary:</strong> ${story.meta.summary}</div>`;

			let sourceText = story.sourceName;
			if (story.sourceName === 'PSSD Recovery Database') {
				sourceText = `<a href="#pssd-recovery-databases" style="color: inherit; text-decoration: underline; cursor: pointer;">${story.sourceName}</a>`;
			}
			let sourceHtml = story.sourceName ? `<div style="font-size: 0.75rem; color: var(--accent); margin-top: -0.5rem; margin-bottom: 0.5rem; font-weight: 600;">Source: ${sourceText}</div>` : '';

			card.innerHTML = `
			<div class="story-header">
				<div class="story-icon">${story.icon}</div>
				<span class="${story.badgeClass}">${story.badgeText}</span>
			</div>
			<h3 class="story-title">${story.title}</h3>
			${sourceHtml}
			${subtitleHtml}
			<div class="story-meta">
				${metaHtml}
			</div>
			<a href="${story.link}" target="_blank" class="story-link">Read Story</a>
		`;
			grid.appendChild(card);
		});

		renderPagination(totalPages);
	}

	function renderPagination(totalPages) {
		const containers = [
			document.getElementById('pagination-controls-top'),
			document.getElementById('pagination-controls-bottom')
		];

		containers.forEach(container => {
			if (!container) return;
			container.innerHTML = '';

			if (totalPages <= 1) return;

			// Prev Button
			const prevBtn = document.createElement('button');
			prevBtn.innerHTML = '←';
			prevBtn.disabled = state.currentPage === 1;
			prevBtn.onclick = () => {
				if (state.currentPage > 1) {
					state.currentPage--;
					renderPage();
					window.scrollTo({ top: document.getElementById('stories-controls').offsetTop - 100, behavior: 'smooth' });
				}
			};
			container.appendChild(prevBtn);

			// Page numbers
			let pagesToDisplay = [];
			
			if (totalPages <= 7) {
				for (let i = 1; i <= totalPages; i++) {
					pagesToDisplay.push(i);
				}
			} else {
				if (state.currentPage <= 4) {
					pagesToDisplay = [1, 2, 3, 4, 5, '...', totalPages];
				} else if (state.currentPage >= totalPages - 3) {
					pagesToDisplay = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
				} else {
					pagesToDisplay = [1, '...', state.currentPage - 1, state.currentPage, state.currentPage + 1, '...', totalPages];
				}
			}

			pagesToDisplay.forEach(i => {
				if (i === '...') {
					const ellipsis = document.createElement('span');
					ellipsis.textContent = '...';
					ellipsis.className = 'pagination-ellipsis';
					ellipsis.style.padding = '0.5rem';
					ellipsis.style.color = 'var(--text-secondary)';
					container.appendChild(ellipsis);
				} else {
					const btn = document.createElement('button');
					btn.textContent = i;
					if (i === state.currentPage) btn.classList.add('active');
					btn.onclick = () => {
						state.currentPage = i;
						renderPage();
						window.scrollTo({ top: document.getElementById('stories-controls').offsetTop - 100, behavior: 'smooth' });
					};
					container.appendChild(btn);
				}
			});

			// Next Button
			const nextBtn = document.createElement('button');
			nextBtn.innerHTML = '→';
			nextBtn.disabled = state.currentPage === totalPages;
			nextBtn.onclick = () => {
				if (state.currentPage < totalPages) {
					state.currentPage++;
					renderPage();
					window.scrollTo({ top: document.getElementById('stories-controls').offsetTop - 100, behavior: 'smooth' });
				}
			};
			container.appendChild(nextBtn);

			// Jump to page input
			const jumpContainer = document.createElement('div');
			jumpContainer.style.display = 'inline-flex';
			jumpContainer.style.alignItems = 'center';
			jumpContainer.style.marginLeft = '1rem';
			jumpContainer.style.gap = '0.5rem';

			const jumpLabel = document.createElement('span');
			jumpLabel.textContent = 'Go to:';
			jumpLabel.style.fontSize = '0.85rem';
			jumpLabel.style.color = 'var(--text-secondary)';

			const jumpInput = document.createElement('input');
			jumpInput.type = 'number';
			jumpInput.min = 1;
			jumpInput.max = totalPages;
			jumpInput.value = state.currentPage;
			jumpInput.style.width = '60px';
			jumpInput.style.padding = '0.4rem';
			jumpInput.style.border = '1px solid var(--card-border)';
			jumpInput.style.borderRadius = '8px';
			jumpInput.style.background = 'var(--card-bg)';
			jumpInput.style.color = 'var(--text-primary)';
			jumpInput.style.textAlign = 'center';
			jumpInput.style.outline = 'none';
			jumpInput.style.fontFamily = 'inherit';

			jumpInput.addEventListener('change', (e) => {
				let val = parseInt(e.target.value, 10);
				if (val >= 1 && val <= totalPages) {
					state.currentPage = val;
					renderPage();
					window.scrollTo({ top: document.getElementById('stories-controls').offsetTop - 100, behavior: 'smooth' });
				} else {
					e.target.value = state.currentPage;
				}
			});

			jumpContainer.appendChild(jumpLabel);
			jumpContainer.appendChild(jumpInput);
			
			container.appendChild(jumpContainer);
		});
	}

	if (!window._successStoriesListenerAdded) {
		document.addEventListener('page:loaded', (e) => {
			if (e.detail.url.includes('success-stories.html') || window.location.pathname.includes('success-stories.html')) {
				initSuccessStories();
			}
		});
		window._successStoriesListenerAdded = true;
	}
})();
