import 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css';
  
// Initialize default users
        if (!localStorage.getItem('user_admin@supermall.com')) {
            localStorage.setItem('user_admin@supermall.com', JSON.stringify({
                name: 'Admin',
                email: 'admin@supermall.com',
                password: 'admin123',
                role: 'admin'
            }));
        }
        if (!localStorage.getItem('user_user@supermall.com')) {
            localStorage.setItem('user_user@supermall.com', JSON.stringify({
                name: 'User',
                email: 'user@supermall.com',
                password: 'user123',
                role: 'user'
            }));
        }

        let currentUser = null;
        let data = {
            shops: JSON.parse(localStorage.getItem('mall_shops') || '[]'),
            categories: JSON.parse(localStorage.getItem('mall_categories') || '[]'),
            floors: JSON.parse(localStorage.getItem('mall_floors') || '[]'),
            offers: JSON.parse(localStorage.getItem('mall_offers') || '[]')
        };

        function log(action, info) {
            console.log(`[${new Date().toISOString()}] ${action}:`, info);
        }

        function showAlert(msg, type = 'success') {
            const div = document.createElement('div');
            div.className = `alert alert-${type} alert-dismissible fade show`;
            div.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
            document.getElementById('alertContainer').appendChild(div);
            setTimeout(() => div.remove(), 4000);
        }

        function goTo(section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            log('Navigate', section);
        }

        function register() {
            const user = {
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                role: document.getElementById('regRole').value
            };

            if (!user.name || !user.email || !user.password) {
                showAlert('Fill all fields', 'danger');
                return;
            }

            localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
            currentUser = user;
            log('Register', user.email);
            showAlert(`Registration successful! Welcome ${user.name}!`);

            // Auto-redirect based on role
            if (user.role === 'admin') {
                document.getElementById('adminName').textContent = user.name;
                goTo('adminDashboard');
                loadAdmin();
            } else {
                document.getElementById('userName').textContent = user.name;
                goTo('userDashboard');
                loadUser();
            }
        }

        function login() {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                showAlert('Fill all fields', 'danger');
                return;
            }

            const userStr = localStorage.getItem(`user_${username}`);
            if (!userStr) {
                showAlert('User not found', 'danger');
                return;
            }

            const user = JSON.parse(userStr);
            if (user.password !== password) {
                showAlert('Wrong password', 'danger');
                return;
            }

            currentUser = user;
            log('Login', { email: user.email, role: user.role });
            showAlert(`Welcome ${user.name}!`);

            if (user.role === 'admin') {
                document.getElementById('adminName').textContent = user.name;
                goTo('adminDashboard');
                loadAdmin();
            } else {
                document.getElementById('userName').textContent = user.name;
                goTo('userDashboard');
                loadUser();
            }
        }

        function logout() {
            log('Logout', currentUser.email);
            currentUser = null;
            goTo('loginSection');
            showAlert('Logged out');
        }

        function showAdminTab(tab) {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('d-none'));
            document.getElementById(tab + 'Tab').classList.remove('d-none');
            document.querySelectorAll('#adminDashboard .nav-link').forEach(l => l.classList.remove('active'));
            event.target.classList.add('active');
        }

        function showUserTab(tab) {
            document.querySelectorAll('.user-tab').forEach(t => t.classList.add('d-none'));
            document.getElementById(tab + 'Tab').classList.remove('d-none');
            document.querySelectorAll('#userDashboard .nav-link').forEach(l => l.classList.remove('active'));
            event.target.classList.add('active');
        }

        function loadAdmin() {
            updateStats();
            renderShops();
            renderCategories();
            renderFloors();
            renderOffers();
        }

        function loadUser() {
            populateFilters();
            renderUserShops();
            renderUserOffers();
        }

        function updateStats() {
            document.getElementById('totalShops').textContent = data.shops.length;
            document.getElementById('totalCategories').textContent = data.categories.length;
            document.getElementById('totalFloors').textContent = data.floors.length;
            document.getElementById('totalOffers').textContent = data.offers.length;
        }

        function renderShops() {
            const html = data.shops.length ? data.shops.map(s => {
                const cat = data.categories.find(c => c.id === s.categoryId);
                const floor = data.floors.find(f => f.id === s.floorId);
                return `
                    <div class="item-card">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5>${s.name}</h5>
                                <p class="mb-1"><strong>Category:</strong> ${cat?.name || 'N/A'}</p>
                                <p class="mb-1"><strong>Floor:</strong> ${floor?.number || 'N/A'}</p>
                                <p>${s.description || ''}</p>
                                <span class="badge-active">Active</span>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-danger" onclick="deleteShop(${s.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('') : '<p>No shops yet</p>';
            document.getElementById('shopsList').innerHTML = html;
        }

        function showAddShop() {
            const name = prompt('Shop Name:');
            const description = prompt('Description:');
            if (name) {
                const shop = {
                    id: Date.now(),
                    name,
                    description,
                    categoryId: data.categories[0]?.id,
                    floorId: data.floors[0]?.id,
                    status: 'active'
                };
                data.shops.push(shop);
                localStorage.setItem('mall_shops', JSON.stringify(data.shops));
                showAlert('Shop added!');
                renderShops();
                updateStats();
            }
        }

        function deleteShop(id) {
            if (confirm('Delete shop?')) {
                data.shops = data.shops.filter(s => s.id !== id);
                localStorage.setItem('mall_shops', JSON.stringify(data.shops));
                showAlert('Deleted');
                renderShops();
                updateStats();
            }
        }

        function renderCategories() {
            const html = data.categories.length ? data.categories.map(c => `
                <div class="item-card">
                    <div class="d-flex justify-content-between">
                        <h5>${c.name}</h5>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
                    </div>
                </div>
            `).join('') : '<p>No categories yet</p>';
            document.getElementById('categoriesList').innerHTML = html;
        }

        function showAddCategory() {
            const name = prompt('Category Name:');
            if (name) {
                data.categories.push({ id: Date.now(), name });
                localStorage.setItem('mall_categories', JSON.stringify(data.categories));
                showAlert('Category added!');
                renderCategories();
                updateStats();
            }
        }

        function deleteCategory(id) {
            if (confirm('Delete?')) {
                data.categories = data.categories.filter(c => c.id !== id);
                localStorage.setItem('mall_categories', JSON.stringify(data.categories));
                showAlert('Deleted');
                renderCategories();
                updateStats();
            }
        }

        function renderFloors() {
            const html = data.floors.length ? data.floors.map(f => `
                <div class="item-card">
                    <div class="d-flex justify-content-between">
                        <h5>${f.number}</h5>
                        <button class="btn btn-sm btn-danger" onclick="deleteFloor(${f.id})">Delete</button>
                    </div>
                </div>
            `).join('') : '<p>No floors yet</p>';
            document.getElementById('floorsList').innerHTML = html;
        }

        function showAddFloor() {
            const number = prompt('Floor Number (e.g., Ground Floor, 1st Floor):');
            if (number) {
                data.floors.push({ id: Date.now(), number });
                localStorage.setItem('mall_floors', JSON.stringify(data.floors));
                showAlert('Floor added!');
                renderFloors();
                updateStats();
            }
        }

        function deleteFloor(id) {
            if (confirm('Delete?')) {
                data.floors = data.floors.filter(f => f.id !== id);
                localStorage.setItem('mall_floors', JSON.stringify(data.floors));
                showAlert('Deleted');
                renderFloors();
                updateStats();
            }
        }

        function renderOffers() {
            const html = data.offers.length ? data.offers.map(o => {
                const shop = data.shops.find(s => s.id === o.shopId);
                return `
                    <div class="item-card">
                        <h5>${o.product}</h5>
                        <p><strong>Shop:</strong> ${shop?.name || 'N/A'}</p>
                        <p><strong>Discount:</strong> ${o.discount}%</p>
                        <p><strong>Price:</strong> ₹${o.price}</p>
                        <button class="btn btn-sm btn-danger" onclick="deleteOffer(${o.id})">Delete</button>
                    </div>
                `;
            }).join('') : '<p>No offers yet</p>';
            document.getElementById('offersList').innerHTML = html;
        }

        function showAddOffer() {
            const product = prompt('Product Name:');
            const discount = prompt('Discount %:');
            const price = prompt('Price:');
            if (product && discount && price) {
                data.offers.push({
                    id: Date.now(),
                    shopId: data.shops[0]?.id,
                    product,
                    discount,
                    price
                });
                localStorage.setItem('mall_offers', JSON.stringify(data.offers));
                showAlert('Offer added!');
                renderOffers();
                updateStats();
            }
        }

        function deleteOffer(id) {
            if (confirm('Delete?')) {
                data.offers = data.offers.filter(o => o.id !== id);
                localStorage.setItem('mall_offers', JSON.stringify(data.offers));
                showAlert('Deleted');
                renderOffers();
                updateStats();
            }
        }

        function populateFilters() {
            document.getElementById('filterCategory').innerHTML = '<option value="">All Categories</option>' +
                data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            document.getElementById('filterFloor').innerHTML = '<option value="">All Floors</option>' +
                data.floors.map(f => `<option value="${f.id}">${f.number}</option>`).join('');
        }

        function renderUserShops() {
            renderShops();
            document.getElementById('userShopsList').innerHTML = document.getElementById('shopsList').innerHTML;
        }

        function renderUserOffers() {
            renderOffers();
            document.getElementById('userOffersList').innerHTML = document.getElementById('offersList').innerHTML;
        }

        function applyFilters() {
            const catId = document.getElementById('filterCategory').value;
            const floorId = document.getElementById('filterFloor').value;
            
            let filtered = data.shops;
            if (catId) filtered = filtered.filter(s => s.categoryId == catId);
            if (floorId) filtered = filtered.filter(s => s.floorId == floorId);
            
            const html = filtered.map(s => {
                const cat = data.categories.find(c => c.id === s.categoryId);
                const floor = data.floors.find(f => f.id === s.floorId);
                return `
                    <div class="item-card">
                        <h5>${s.name}</h5>
                        <p><strong>Category:</strong> ${cat?.name || 'N/A'}</p>
                        <p><strong>Floor:</strong> ${floor?.number || 'N/A'}</p>
                        <p>${s.description || ''}</p>
                    </div>
                `;
            }).join('');
            document.getElementById('userShopsList').innerHTML = html || '<p>No shops found</p>';
        }

        console.log('Super Mall System loaded');
    