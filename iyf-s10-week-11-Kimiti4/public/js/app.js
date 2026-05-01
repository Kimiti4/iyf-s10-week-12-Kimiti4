/**
 * 🔹 Jamii Link KE - Frontend Application
 */

document.addEventListener('DOMContentLoaded', () => {
    const App = {
        currentView: 'explore',

        init() {
            this.setupNavigation();
            this.setupFilters();
            this.setupCreateForm();
            this.loadPosts();
            this.loadMarketCrops();
            this.navigate('explore');
        },

        setupNavigation() {
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    this.navigate(view);

                    // Update active state
                    navButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        },

        navigate(view) {
            this.currentView = view;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${view}`).classList.add('active');

            // Load data for specific views
            if (view === 'explore') {
                this.loadPosts();
            } else if (view === 'market') {
                this.loadMarketPrices();
            }
        },

        setupFilters() {
            const applyBtn = document.getElementById('apply-filters');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    this.loadPosts();
                });
            }

            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') this.loadPosts();
                });
            }

            const loadMarketBtn = document.getElementById('load-market');
            if (loadMarketBtn) {
                loadMarketBtn.addEventListener('click', () => {
                    this.loadMarketPrices();
                });
            }
        },

        setupCreateForm() {
            const form = document.getElementById('create-post-form');
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const messageEl = document.getElementById('form-message');

                const data = {
                    title: document.getElementById('post-title').value,
                    content: document.getElementById('post-content').value,
                    author: document.getElementById('post-author').value,
                    category: document.getElementById('post-category').value,
                    tags: document.getElementById('post-tags').value
                        .split(',').map(t => t.trim()).filter(t => t),
                    location: {
                        county: document.getElementById('post-location-county').value
                    }
                };

                try {
                    const result = await JamiiAPI.posts.create(data);
                    messageEl.textContent = '✅ Post created successfully!';
                    messageEl.className = 'message success';
                    form.reset();

                    // Refresh explore view
                    if (this.currentView === 'explore') {
                        this.loadPosts();
                    }
                } catch (error) {
                    messageEl.textContent = `❌ ${error.message}`;
                    messageEl.className = 'message error';
                }
            });
        },

        async loadPosts() {
            const container = document.getElementById('posts-container');
            const loading = document.getElementById('loading');

            if (!container || !loading) return;

            loading.style.display = 'block';
            container.innerHTML = '';

            try {
                const filters = {
                    category: document.getElementById('filter-category')?.value || '',
                    county: document.getElementById('filter-county')?.value || '',
                    search: document.getElementById('search-input')?.value || '',
                    sort: 'newest',
                    limit: 20
                };

                const result = await JamiiAPI.posts.getAll(filters);

                if (result.success && result.data.length > 0) {
                    result.data.forEach(post => {
                        const card = this.createPostCard(post);
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = '<p class="no-results">No posts found. Try different filters!</p>';
                }
            } catch (error) {
                console.error('Error loading posts:', error);
                container.innerHTML = '<p class="error">Failed to load posts. Please try again.</p>';
            } finally {
                loading.style.display = 'none';
            }
        },

        createPostCard(post) {
            const card = document.createElement('div');
            card.className = 'post-card';

            const categoryLabels = {
                mtaani: 'Mtaani',
                skill: 'Skill',
                farm: 'Farm',
                gig: 'Gig',
                alert: 'Alert'
            };

            const date = new Date(post.createdAt).toLocaleDateString();

            // Tags HTML
            const tagsHtml = (post.tags || []).map(tag =>
                `<span class="tag">${tag}</span>`
            ).join('');

            // Metadata based on category
            let metadataHtml = '';
            if (post.category === 'farm' && post.metadata) {
                metadataHtml = `<div class="post-metadata">
                    <span>🌾 ${post.metadata.crop || 'Crop'}</span>
                    <span>📦 ${post.metadata.quantity || 0} ${post.metadata.unit || ''}</span>
                    <span>💰 KES ${post.metadata.pricePerUnit || 0}/kg</span>
                </div>`;
            } else if (post.category === 'skill' && post.metadata) {
                metadataHtml = `<div class="post-metadata">
                    <span>💡 ${post.metadata.offeredSkill || 'Skill'}</span>
                    <span>⏱️ ${post.metadata.offeredHours || 1} hours</span>
                </div>`;
            } else if (post.category === 'gig' && post.metadata) {
                metadataHtml = `<div class="post-metadata">
                    <span>💼 ${post.metadata.gigType || 'Gig'}</span>
                    <span>💰 KES ${post.metadata.budget || 0}</span>
                </div>`;
            } else if (post.category === 'mtaani' && post.urgency) {
                metadataHtml = `<div class="post-urgency urgency-${post.urgency}">⚠️ ${post.urgency.toUpperCase()}</div>`;
            }

            card.innerHTML = `
                <span class="post-category ${post.category}">${categoryLabels[post.category] || post.category}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                ${metadataHtml}
                <div class="post-meta">
                    <span>👤 ${post.author}</span>
                    <span>📍 ${post.location?.county || 'Unknown'}</span>
                    <span>📅 ${date}</span>
                    <span>❤️ ${post.likes || 0}</span>
                </div>
                ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
            `;

            return card;
        },

        async loadMarketCrops() {
            try {
                const result = await JamiiAPI.posts.getAll({ category: 'farm', limit: 50 });
                const crops = [...new Set(result.data.map(p => p.metadata?.crop).filter(Boolean))];

                const cropSelect = document.getElementById('market-crop');
                if (cropSelect && crops.length > 0) {
                    crops.forEach(crop => {
                        const option = document.createElement('option');
                        option.value = crop;
                        option.textContent = crop;
                        cropSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Error loading crops:', error);
            }
        },

        async loadMarketPrices() {
            const container = document.getElementById('market-container');
            if (!container) return;

            container.innerHTML = '<div class="loading">Loading prices...</div>';

            try {
                const crop = document.getElementById('market-crop')?.value || '';
                const county = document.getElementById('market-county')?.value || '';

                const result = await JamiiAPI.market.getPrices({ crop, county });

                container.innerHTML = '';

                if (result.data.length === 0) {
                    container.innerHTML = '<p>No price data available.</p>';
                    return;
                }

                result.data.forEach(price => {
                    const isFarmGate = price.source.toLowerCase().includes('farm');
                    const card = document.createElement('div');
                    card.className = 'market-card';
                    card.innerHTML = `
                        <h3>🌾 ${price.crop}</h3>
                        <p class="price ${isFarmGate ? 'price-low' : 'price-high'}">
                            KES ${price.pricePerKg}/kg
                        </p>
                        <p class="source-badge">📍 ${price.source} • ${price.county}</p>
                        <small>Updated: ${new Date(price.updatedAt).toLocaleDateString()}</small>
                    `;
                    container.appendChild(card);
                });

                // Add helpful note
                const note = document.createElement('p');
                note.style.marginTop = '1rem';
                note.style.color = '#7f8c8d';
                note.style.fontSize = '0.9rem';
                note.textContent = '💡 Tip: Farm gate prices are typically lower. Use this info to negotiate fairly!';
                container.appendChild(note);

            } catch (error) {
                console.error('Error loading prices:', error);
                container.innerHTML = '<p class="error">Failed to load prices.</p>';
            }
        }
    };

    // Initialize
    App.init();
});
