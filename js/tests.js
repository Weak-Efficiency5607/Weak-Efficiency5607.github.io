(() => {
	let loincData = [];

	function initTestsPage() {
		const loadBtn = document.getElementById('load-loinc-btn');
		const loaderContainer = document.getElementById('loinc-loader-container');
		const progressContainer = document.getElementById('loinc-progress-container');
		const progressBar = document.getElementById('loinc-progress-bar');
		const progressText = document.getElementById('loinc-progress-text');
		const searchContainer = document.getElementById('loinc-search-container');
		const searchInput = document.getElementById('loinc-search');
		const resultsContainer = document.getElementById('loinc-results');
		const resultCount = document.getElementById('loinc-result-count');

		if (!loadBtn) return; // Not on the tests page

		loadBtn.addEventListener('click', async () => {
			loadBtn.style.display = 'none';
			progressContainer.style.display = 'block';

			try {
				const response = await fetch('data/loinc-top-ranked.json');
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Get the total file size from headers if possible
				const contentLength = response.headers.get('content-length');
				const total = contentLength ? parseInt(contentLength, 10) : 5349372; // fallback to approx size
				
				let loaded = 0;
				
				// Read the stream
				const reader = response.body.getReader();
				const chunks = [];

				while (true) {
					const { done, value } = await reader.read();
					
					if (done) break;
					
					chunks.push(value);
					loaded += value.length;
					
					// Update progress bar
					const percent = Math.min(100, Math.round((loaded / total) * 100));
					progressBar.style.width = `${percent}%`;
					progressText.textContent = `Downloading database... ${percent}%`;
				}

				progressText.textContent = "Parsing data...";

				// Combine chunks into a single Uint8Array
				const chunksAll = new Uint8Array(loaded);
				let position = 0;
				for (let chunk of chunks) {
					chunksAll.set(chunk, position);
					position += chunk.length;
				}

				// Decode UTF-8 to string and parse JSON
				const decoder = new TextDecoder('utf-8');
				const jsonString = decoder.decode(chunksAll);
				const data = JSON.parse(jsonString);

				if (data.expansion && data.expansion.contains) {
					loincData = data.expansion.contains;
				} else {
					throw new Error("Invalid LOINC JSON structure");
				}

				// Hide loader, show search
				loaderContainer.style.display = 'none';
				searchContainer.style.display = 'block';
				
				// Initial render of top items
				renderResults('');
				searchInput.focus();

			} catch (err) {
				console.error("Failed to load LOINC data:", err);
				progressText.textContent = "Error loading database. Please try again.";
				progressText.style.color = "red";
				loadBtn.style.display = 'inline-block';
			}
		});

		// --- CLFS LOGIC ---
		let clfsData = [];
		const loadClfsBtn = document.getElementById('load-clfs-btn');
		const clfsLoaderContainer = document.getElementById('clfs-loader-container');
		const clfsProgressContainer = document.getElementById('clfs-progress-container');
		const clfsProgressBar = document.getElementById('clfs-progress-bar');
		const clfsProgressText = document.getElementById('clfs-progress-text');
		const clfsSearchContainer = document.getElementById('clfs-search-container');
		const clfsSearchInput = document.getElementById('clfs-search');
		const clfsResultsContainer = document.getElementById('clfs-results');
		const clfsResultCount = document.getElementById('clfs-result-count');

		if (loadClfsBtn) {
			loadClfsBtn.addEventListener('click', async () => {
				loadClfsBtn.style.display = 'none';
				clfsProgressContainer.style.display = 'block';

				try {
					const response = await fetch('data/clfs-cy2026-q2v1/PUF_CLFS_CY2026_Q2V1.csv');
					
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const contentLength = response.headers.get('content-length');
					const total = contentLength ? parseInt(contentLength, 10) : 589819;
					
					let loaded = 0;
					const reader = response.body.getReader();
					const chunks = [];

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						chunks.push(value);
						loaded += value.length;
						const percent = Math.min(100, Math.round((loaded / total) * 100));
						clfsProgressBar.style.width = `${percent}%`;
						clfsProgressText.textContent = `Downloading database... ${percent}%`;
					}

					clfsProgressText.textContent = "Parsing data...";

					const chunksAll = new Uint8Array(loaded);
					let position = 0;
					for (let chunk of chunks) {
						chunksAll.set(chunk, position);
						position += chunk.length;
					}

					const decoder = new TextDecoder('utf-8');
					const csvString = decoder.decode(chunksAll);
					
					// Simple CSV parser
					clfsData = [];
					let inQuotes = false;
					let row = [];
					let value = '';
					for (let i = 0; i < csvString.length; i++) {
						const char = csvString[i];
						if (inQuotes) {
							if (char === '"') {
								if (i + 1 < csvString.length && csvString[i+1] === '"') {
									value += '"'; i++; // escaped quote
								} else {
									inQuotes = false;
								}
							} else {
								value += char;
							}
						} else {
							if (char === '"') {
								inQuotes = true;
							} else if (char === ',') {
								row.push(value);
								value = '';
							} else if (char === '\n' || char === '\r') {
								if (char === '\r' && i + 1 < csvString.length && csvString[i+1] === '\n') {
									i++;
								}
								row.push(value);
								// Check if it's a valid data row starting with 2026
								if (row.length > 5 && row[0] === '2026') {
									clfsData.push({
										hcpcs: row[1] || '',
										rate: row[5] || '',
										shortdesc: row[6] || '',
										longdesc: row[7] || '',
										extdesc: row[8] || ''
									});
								}
								row = [];
								value = '';
							} else {
								value += char;
							}
						}
					}
					// Handle the last row if not ending with newline
					if (value || row.length > 0) {
						row.push(value);
						if (row.length > 5 && row[0] === '2026') {
							clfsData.push({
								hcpcs: row[1] || '',
								rate: row[5] || '',
								shortdesc: row[6] || '',
								longdesc: row[7] || '',
								extdesc: row[8] || ''
							});
						}
					}

					clfsLoaderContainer.style.display = 'none';
					clfsSearchContainer.style.display = 'block';
					
					renderClfsResults('');
					clfsSearchInput.focus();

				} catch (err) {
					console.error("Failed to load CLFS data:", err);
					clfsProgressText.textContent = "Error loading database. Please try again.";
					clfsProgressText.style.color = "red";
					loadClfsBtn.style.display = 'inline-block';
				}
			});
		}

		// --- FULL LOINC LOGIC ---
		let fullLoincData = [];
		const languageSelect = document.getElementById('loinc-language-select');
		let linguisticVariants = [];

		if (languageSelect) {
			fetch('data/Loinc_2.82/AccessoryFiles/LinguisticVariants/LinguisticVariants.csv')
				.then(res => res.text())
				.then(text => {
					let inQuotes = false;
					let row = [];
					let value = '';
					for (let i = 0; i < text.length; i++) {
						const char = text[i];
						if (inQuotes) {
							if (char === '"') {
								if (i + 1 < text.length && text[i+1] === '"') {
									value += '"'; i++;
								} else {
									inQuotes = false;
								}
							} else {
								value += char;
							}
						} else {
							if (char === '"') {
								inQuotes = true;
							} else if (char === ',') {
								row.push(value);
								value = '';
							} else if (char === '\n' || char === '\r') {
								if (char === '\r' && i + 1 < text.length && text[i+1] === '\n') {
									i++;
								}
								row.push(value);
								if (row.length >= 4 && row[0] !== 'ID' && row[0] !== '') {
									const fileName = `${row[1]}${row[2]}${row[0]}LinguisticVariant.csv`;
									linguisticVariants.push({
										fileName: fileName,
										langName: row[3]
									});
								}
								row = [];
								value = '';
							} else {
								value += char;
							}
						}
					}
					if (value || row.length > 0) {
						row.push(value);
						if (row.length >= 4 && row[0] !== 'ID' && row[0] !== '') {
							const fileName = `${row[1]}${row[2]}${row[0]}LinguisticVariant.csv`;
							linguisticVariants.push({
								fileName: fileName,
								langName: row[3]
							});
						}
					}

					linguisticVariants.sort((a, b) => a.langName.localeCompare(b.langName));

					linguisticVariants.forEach(variant => {
						const option = document.createElement('option');
						option.value = variant.fileName;
						option.textContent = variant.langName;
						languageSelect.appendChild(option);
					});
				})
				.catch(err => console.error("Could not load Linguistic Variants index", err));
		}

		const loadFullLoincBtn = document.getElementById('load-full-loinc-btn');
		const fullLoincLoaderContainer = document.getElementById('full-loinc-loader-container');
		const fullLoincProgressContainer = document.getElementById('full-loinc-progress-container');
		const fullLoincProgressBar = document.getElementById('full-loinc-progress-bar');
		const fullLoincProgressText = document.getElementById('full-loinc-progress-text');
		const fullLoincSearchContainer = document.getElementById('full-loinc-search-container');
		const fullLoincSearchInput = document.getElementById('full-loinc-search');
		const fullLoincResultsContainer = document.getElementById('full-loinc-results');
		const fullLoincResultCount = document.getElementById('full-loinc-result-count');

		if (loadFullLoincBtn) {
			loadFullLoincBtn.addEventListener('click', async () => {
				loadFullLoincBtn.style.display = 'none';
				if (languageSelect) languageSelect.disabled = true;
				fullLoincProgressContainer.style.display = 'block';

				try {
					let url = 'data/Loinc_2.82/LoincTableCore/LoincTableCore.csv';
					let estimatedSize = 25987128; // English base
					if (languageSelect && languageSelect.value !== 'default') {
						url = `data/Loinc_2.82/AccessoryFiles/LinguisticVariants/${languageSelect.value}`;
						estimatedSize = 12000000; // average rough estimate for variants
					}

					const response = await fetch(url);
					
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const contentLength = response.headers.get('content-length');
					const total = contentLength ? parseInt(contentLength, 10) : estimatedSize;
					
					let loaded = 0;
					const reader = response.body.getReader();
					const chunks = [];

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						chunks.push(value);
						loaded += value.length;
						const percent = Math.min(100, Math.round((loaded / total) * 100));
						fullLoincProgressBar.style.width = `${percent}%`;
						fullLoincProgressText.textContent = `Downloading database... ${percent}%`;
					}

					fullLoincProgressText.textContent = "Parsing data (this may take a few seconds)...";
					await new Promise(r => setTimeout(r, 50)); // yield to UI thread

					const chunksAll = new Uint8Array(loaded);
					let position = 0;
					for (let chunk of chunks) {
						chunksAll.set(chunk, position);
						position += chunk.length;
					}

					const decoder = new TextDecoder('utf-8');
					const csvString = decoder.decode(chunksAll);
					
					fullLoincData = [];
					let inQuotes = false;
					let row = [];
					let value = '';
					for (let i = 0; i < csvString.length; i++) {
						const char = csvString[i];
						if (inQuotes) {
							if (char === '"') {
								if (i + 1 < csvString.length && csvString[i+1] === '"') {
									value += '"'; i++;
								} else {
									inQuotes = false;
								}
							} else {
								value += char;
							}
						} else {
							if (char === '"') {
								inQuotes = true;
							} else if (char === ',') {
								row.push(value);
								value = '';
							} else if (char === '\n' || char === '\r') {
								if (char === '\r' && i + 1 < csvString.length && csvString[i+1] === '\n') {
									i++;
								}
								row.push(value);
								if (row.length > 1 && row[0] !== 'LOINC_NUM') {
									let display = (row[11] || row[9] || '').trim();
									if (!display) {
										let parts = [];
										if (row[1] && row[1] !== '-') parts.push(row[1].trim());
										if (row[4] && row[4] !== '-') parts.push(row[4].trim());
										if (row[6] && row[6] !== '-') parts.push(row[6].trim());
										display = parts.join(' : ');
									}
									fullLoincData.push({
										code: row[0] || '',
										display: display
									});
								}
								row = [];
								value = '';
							} else {
								value += char;
							}
						}
					}
					if (value || row.length > 0) {
						row.push(value);
						if (row.length > 1 && row[0] !== 'LOINC_NUM') {
							let display = (row[11] || row[9] || '').trim();
							if (!display) {
								let parts = [];
								if (row[1] && row[1] !== '-') parts.push(row[1].trim());
								if (row[4] && row[4] !== '-') parts.push(row[4].trim());
								if (row[6] && row[6] !== '-') parts.push(row[6].trim());
								display = parts.join(' : ');
							}
							fullLoincData.push({
								code: row[0] || '',
								display: display
							});
						}
					}

					fullLoincLoaderContainer.style.display = 'none';
					fullLoincSearchContainer.style.display = 'block';
					
					renderFullLoincResults('');
					fullLoincSearchInput.focus();

				} catch (err) {
					console.error("Failed to load Full LOINC data:", err);
					fullLoincProgressText.textContent = "Error loading database. Please try again.";
					fullLoincProgressText.style.color = "red";
					loadFullLoincBtn.style.display = 'inline-block';
				}
			});
		}

		// Search functionality
		function debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				const later = () => {
					clearTimeout(timeout);
					func(...args);
				};
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		}

		if (searchInput) {
			searchInput.addEventListener('input', debounce((e) => {
				renderResults(e.target.value.toLowerCase().trim());
			}, 300));
		}

		function renderResults(query) {
			resultsContainer.innerHTML = '';
			
			let filtered = loincData;
			
			if (query.length >= 2) {
				filtered = loincData.filter(item => {
					const codeMatch = item.code && item.code.toLowerCase().includes(query);
					const displayMatch = item.display && item.display.toLowerCase().includes(query);
					return codeMatch || displayMatch;
				});
			}

			// Limit to top 50 results to prevent DOM freeze
			const maxResults = 50;
			const sliced = filtered.slice(0, maxResults);
			
			resultCount.textContent = `${sliced.length}${filtered.length > maxResults ? '+' : ''}`;

			if (sliced.length === 0) {
				resultsContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No matches found.</div>';
				return;
			}

			const fragment = document.createDocumentFragment();

			sliced.forEach(item => {
				const li = document.createElement('li');
				li.style.display = 'flex';
				li.style.flexDirection = 'column';
				li.style.gap = '0.3rem';
				li.style.padding = '1rem 0';
				li.style.borderBottom = '1px solid var(--card-border)';
				
				const header = document.createElement('div');
				header.style.display = 'flex';
				header.style.justifyContent = 'space-between';
				header.style.alignItems = 'flex-start';
				header.style.gap = '1rem';
				
				const title = document.createElement('strong');
				title.style.color = 'var(--text-primary)';
				title.innerHTML = highlight(item.display || 'Unknown', query);
				
				const codeBadge = document.createElement('span');
				codeBadge.style.fontFamily = 'var(--font-mono)';
				codeBadge.style.fontSize = '0.8rem';
				codeBadge.style.padding = '0.2rem 0.6rem';
				codeBadge.style.background = 'rgba(var(--accent-rgb), 0.1)';
				codeBadge.style.color = 'var(--accent)';
				codeBadge.style.borderRadius = '4px';
				codeBadge.style.border = '1px solid rgba(var(--accent-rgb), 0.2)';
				codeBadge.innerHTML = highlight(item.code || '', query);
				
				header.appendChild(title);
				header.appendChild(codeBadge);
				li.appendChild(header);
				fragment.appendChild(li);
			});

			resultsContainer.appendChild(fragment);
		}

		if (clfsSearchInput) {
			clfsSearchInput.addEventListener('input', debounce((e) => {
				renderClfsResults(e.target.value.toLowerCase().trim());
			}, 300));
		}

		function renderClfsResults(query) {
			clfsResultsContainer.innerHTML = '';
			
			let filtered = clfsData;
			
			if (query.length >= 2) {
				filtered = clfsData.filter(item => {
					const codeMatch = item.hcpcs.toLowerCase().includes(query);
					const descMatch = item.longdesc.toLowerCase().includes(query) || item.extdesc.toLowerCase().includes(query);
					return codeMatch || descMatch;
				});
			}

			const maxResults = 50;
			const sliced = filtered.slice(0, maxResults);
			
			clfsResultCount.textContent = `${sliced.length}${filtered.length > maxResults ? '+' : ''}`;

			if (sliced.length === 0) {
				clfsResultsContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No matches found.</div>';
				return;
			}

			const fragment = document.createDocumentFragment();

			sliced.forEach(item => {
				const li = document.createElement('li');
				li.style.display = 'flex';
				li.style.flexDirection = 'column';
				li.style.gap = '0.3rem';
				li.style.padding = '1rem 0';
				li.style.borderBottom = '1px solid var(--card-border)';
				
				const header = document.createElement('div');
				header.style.display = 'flex';
				header.style.justifyContent = 'space-between';
				header.style.alignItems = 'flex-start';
				header.style.gap = '1rem';
				
				const title = document.createElement('strong');
				title.style.color = 'var(--text-primary)';
				const descToUse = item.extdesc || item.longdesc || item.shortdesc;
				title.innerHTML = highlight(descToUse, query);
				
				const rightGroup = document.createElement('div');
				rightGroup.style.display = 'flex';
				rightGroup.style.gap = '0.5rem';
				rightGroup.style.alignItems = 'center';

				if (item.rate && item.rate !== '00000.00' && item.rate.trim() !== '') {
					const rate = document.createElement('span');
					rate.style.fontFamily = 'var(--font-mono)';
					rate.style.fontSize = '0.8rem';
					rate.style.padding = '0.2rem 0.6rem';
					rate.style.background = 'rgba(46, 204, 113, 0.1)';
					rate.style.color = '#2ecc71';
					rate.style.borderRadius = '4px';
					rate.style.border = '1px solid rgba(46, 204, 113, 0.2)';
					rate.textContent = '$' + parseFloat(item.rate).toFixed(2);
					rightGroup.appendChild(rate);
				}

				const codeBadge = document.createElement('span');
				codeBadge.style.fontFamily = 'var(--font-mono)';
				codeBadge.style.fontSize = '0.8rem';
				codeBadge.style.padding = '0.2rem 0.6rem';
				codeBadge.style.background = 'rgba(var(--accent-rgb), 0.1)';
				codeBadge.style.color = 'var(--accent)';
				codeBadge.style.borderRadius = '4px';
				codeBadge.style.border = '1px solid rgba(var(--accent-rgb), 0.2)';
				codeBadge.innerHTML = highlight(item.hcpcs || '', query);
				
				rightGroup.appendChild(codeBadge);

				header.appendChild(title);
				header.appendChild(rightGroup);
				li.appendChild(header);
				fragment.appendChild(li);
			});

			clfsResultsContainer.appendChild(fragment);
		}

		if (fullLoincSearchInput) {
			fullLoincSearchInput.addEventListener('input', debounce((e) => {
				renderFullLoincResults(e.target.value.toLowerCase().trim());
			}, 300));
		}

		function renderFullLoincResults(query) {
			fullLoincResultsContainer.innerHTML = '';
			
			let filtered = fullLoincData;
			
			if (query.length >= 2) {
				filtered = fullLoincData.filter(item => {
					const codeMatch = item.code.toLowerCase().includes(query);
					const descMatch = item.display.toLowerCase().includes(query);
					return codeMatch || descMatch;
				});
			}

			const maxResults = 50;
			const sliced = filtered.slice(0, maxResults);
			
			fullLoincResultCount.textContent = `${sliced.length}${filtered.length > maxResults ? '+' : ''}`;

			if (sliced.length === 0) {
				fullLoincResultsContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">No matches found.</div>';
				return;
			}

			const fragment = document.createDocumentFragment();

			sliced.forEach(item => {
				const li = document.createElement('li');
				li.style.display = 'flex';
				li.style.flexDirection = 'column';
				li.style.gap = '0.3rem';
				li.style.padding = '1rem 0';
				li.style.borderBottom = '1px solid var(--card-border)';
				
				const header = document.createElement('div');
				header.style.display = 'flex';
				header.style.justifyContent = 'space-between';
				header.style.alignItems = 'flex-start';
				header.style.gap = '1rem';
				
				const title = document.createElement('strong');
				title.style.color = 'var(--text-primary)';
				title.innerHTML = highlight(item.display || 'Unknown', query);
				
				const rightGroup = document.createElement('div');
				rightGroup.style.display = 'flex';
				rightGroup.style.gap = '0.5rem';
				rightGroup.style.alignItems = 'center';

				const codeBadge = document.createElement('span');
				codeBadge.style.fontFamily = 'var(--font-mono)';
				codeBadge.style.fontSize = '0.8rem';
				codeBadge.style.padding = '0.2rem 0.6rem';
				codeBadge.style.background = 'rgba(var(--accent-rgb), 0.1)';
				codeBadge.style.color = 'var(--accent)';
				codeBadge.style.borderRadius = '4px';
				codeBadge.style.border = '1px solid rgba(var(--accent-rgb), 0.2)';
				codeBadge.innerHTML = highlight(item.code || '', query);
				
				rightGroup.appendChild(codeBadge);

				header.appendChild(title);
				header.appendChild(rightGroup);
				li.appendChild(header);
				fragment.appendChild(li);
			});

			fullLoincResultsContainer.appendChild(fragment);
		}


		function highlight(text, query) {
			if (!query || query.length < 2) return text;
			const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
			return text.replace(regex, '<mark style="background: rgba(var(--accent-rgb), 0.2); color: var(--accent); border-radius: 2px; padding: 0 2px;">$1</mark>');
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initTestsPage);
	} else {
		initTestsPage();
	}

	// For SPA router navigation
	document.addEventListener('page:loaded', (e) => {
		if (e.detail.url.includes('tests.html')) {
			initTestsPage();
		}
	});

})();
