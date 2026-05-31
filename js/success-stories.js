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
		// Populate filter dropdowns
		const substancesSet = new Set();
		const typesSet = new Set();
		const causesSet = new Set();

		stories.forEach(story => {
			if (Array.isArray(story.meta.substances)) {
				story.meta.substances.forEach(s => substancesSet.add(s));
			} else {
				substancesSet.add(story.meta.substances);
			}
			typesSet.add(story.meta.type);
			causesSet.add(story.meta.cause);
		});

		populateSelect('filter-substance', Array.from(substancesSet).sort());
		populateSelect('filter-type', Array.from(typesSet).sort());
		populateSelect('filter-cause', Array.from(causesSet).sort());

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

	function populateSelect(elementId, options) {
		const select = document.getElementById(elementId);
		if (!select) return;
		options.forEach(opt => {
			if (!opt || opt === 'Unknown') return; // Skip unknown/empty to keep filters clean, though we could keep them
			const el = document.createElement('option');
			el.value = opt;
			el.textContent = opt;
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
			card.className = 'card story-card';

			let subtitleHtml = story.subtitle ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">${story.subtitle}</p>` : '';

			let substancesHtml = '';
			if (Array.isArray(story.meta.substances)) {
				substancesHtml = story.meta.substances.map(s => `<span>${s}</span>`).join(' ');
			} else {
				substancesHtml = `<span>${story.meta.substances}</span>`;
			}

			card.innerHTML = `
			<div class="story-header">
				<div class="story-icon">${story.icon}</div>
				<span class="${story.badgeClass}">${story.badgeText}</span>
			</div>
			<h3 class="story-title">${story.title}</h3>
			${subtitleHtml}
			<div class="story-meta">
				<div class="meta-item"><strong>Substances:</strong> ${substancesHtml}</div>
				<div class="meta-item"><strong>Type:</strong> <span>${story.meta.type}</span></div>
				<div class="meta-item"><strong>Effectiveness:</strong> <span>${story.meta.effectiveness}</span></div>
				<div class="meta-item"><strong>Time Taken:</strong> <span>${story.meta.timeTaken}</span></div>
				<div class="meta-item"><strong>Cause:</strong> <span>${story.meta.cause}</span></div>
				<div class="meta-item"><strong>Duration:</strong> <span>${story.meta.duration}</span></div>
				<div class="meta-summary"><strong>Summary:</strong> ${story.meta.summary}</div>
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

			// Page numbers (simplified)
			for (let i = 1; i <= totalPages; i++) {
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
		});
	}
})();
