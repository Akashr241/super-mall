
        let currentUser = null;
        let data = {
            shops: [],
            categories: [],
            floors: [],
            offers: []
        };

        function showAlert(msg, type = 'success') {
            const div = document.createElement('div');
            div.className = `alert alert-${type}`;
            div.textContent = msg;
            document.getElementById('alertContainer').appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }

        function showSection(id) {
            document.querySelectorAll('.auth-section').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function showAdminTab(tab) {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tab + 'Tab').classList.remove('hidden');
        }

        function showModal(id) {
            document.getElementById(id).classList.add('active');
            if (id === 'shopModal') populateShopModal();
            if (id === 'offerModal') populateOfferModal();
        }

        function closeModal(id) {
            document.getElementById(id).classList.remove('active');
        }

        function handleRegister() {
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;

            if (!email || !password) {
                showAlert('Fill all fields', 'error');
                return;
            }

            localStorage.setItem(`user_${email}`, JSON.stringify({ email, password, role }));
            showAlert('Registered! Please login.');
            showSection('loginSection');
        }

        function handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showAlert('Fill all fields', 'error');
                return;
            }

            const userStr = localStorage.getItem(`user_${email}`);
            if (!userStr) {
                showAlert('User not found. Register first!', 'error');
                return;
            }

            const user = JSON.parse(userStr);
            if (user.password !== password) {
                showAlert('Wrong password', 'error');
                return;
            }

            currentUser = user;
            showAlert(`Welcome ${email}!`);

            if (user.role === 'admin') {
                document.getElementById('adminEmail').textContent = email;
                showSection('adminDashboard');
                loadData();
                renderAll();
            } else {
                document.getElementById('userEmail').textContent = email;
                showSection('userDashboard');
                loadData();
                renderUserShops();
            }
        }

        function handleLogout() {
            currentUser = null;
            showSection('loginSection');
            showAlert('Logged out');
        }

        function loadData() {
            data.shops = JSON.parse(localStorage.getItem('shops') || '[]');
            data.categories = JSON.parse(localStorage.getItem('categories') || '[]');
            data.floors = JSON.parse(localStorage.getItem('floors') || '[]');
            data.offers = JSON.parse(localStorage.getItem('offers') || '[]');
        }

        function saveCategory() {
            const name = document.getElementById('categoryName').value;
            if (!name) return showAlert('Enter name', 'error');

            data.categories.push({ id: Date.now(), name });
            localStorage.setItem('categories', JSON.stringify(data.categories));
            showAlert('Category added!');
            closeModal('categoryModal');
            renderCategories();
        }

        function saveFloor() {
            const number = document.getElementById('floorNumber').value;
            if (!number) return showAlert('Enter floor', 'error');

            data.floors.push({ id: Date.now(), number });
            localStorage.setItem('floors', JSON.stringify(data.floors));
            showAlert('Floor added!');
            closeModal('floorModal');
            renderFloors();
        }

        function populateShopModal() {
            const catSel = document.getElementById('shopCategory');
            const floorSel = document.getElementById('shopFloor');
            
            catSel.innerHTML = data.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('') || '<option>Add categories first</option>';
            floorSel.innerHTML = data.floors.map(f => `<option value="${f.id}">${f.number}</option>`).join('') || '<option>Add floors first</option>';
        }

        function saveShop() {
            const shop = {
                id: Date.now(),
                name: document.getElementById('shopName').value,
                categoryId: document.getElementById('shopCategory').value,
                floorId: document.getElementById('shopFloor').value,
                description: document.getElementById('shopDescription').value
            };

            if (!shop.name) return showAlert('Enter shop name', 'error');

            data.shops.push(shop);
            localStorage.setItem('shops', JSON.stringify(data.shops));
            showAlert('Shop added!');
            closeModal('shopModal');
            renderShops();
        }

        function populateOfferModal() {
            const sel = document.getElementById('offerShop');
            sel.innerHTML = data.shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('') || '<option>Add shops first</option>';
        }

        function saveOffer() {
            const offer = {
                id: Date.now(),
                shopId: document.getElementById('offerShop').value,
                product: document.getElementById('offerProduct').value,
                discount: document.getElementById('offerDiscount').value
            };

            if (!offer.product) return showAlert('Fill all fields', 'error');

            data.offers.push(offer);
            localStorage.setItem('offers', JSON.stringify(data.offers));
            showAlert('Offer added!');
            closeModal('offerModal');
            renderOffers();
        }

        function renderCategories() {
            const html = data.categories.length === 0 ? '<p>No categories yet</p>' :
                data.categories.map(c => `<div class="card"><h3>${c.name}</h3></div>`).join('');
            document.getElementById('categoriesList').innerHTML = html;
        }

        function renderFloors() {
            const html = data.floors.length === 0 ? '<p>No floors yet</p>' :
                data.floors.map(f => `<div class="card"><h3>${f.number}</h3></div>`).join('');
            document.getElementById('floorsList').innerHTML = html;
        }

        function renderShops() {
            const html = data.shops.length === 0 ? '<p>No shops yet</p>' :
                data.shops.map(s => {
                    const cat = data.categories.find(c => c.id == s.categoryId);
                    const floor = data.floors.find(f => f.id == s.floorId);
                    return `<div class="card">
                        <h3>${s.name}</h3>
                        <p><strong>Category:</strong> ${cat?.name || 'N/A'}</p>
                        <p><strong>Floor:</strong> ${floor?.number || 'N/A'}</p>
                        <p>${s.description}</p>
                    </div>`;
                }).join('');
            document.getElementById('shopsList').innerHTML = html;
        }

        function renderOffers() {
            const html = data.offers.length === 0 ? '<p>No offers yet</p>' :
                data.offers.map(o => {
                    const shop = data.shops.find(s => s.id == o.shopId);
                    return `<div class="card">
                        <h3>${o.product}</h3>
                        <p><strong>Shop:</strong> ${shop?.name || 'N/A'}</p>
                        <p><strong>Discount:</strong> ${o.discount}%</p>
                    </div>`;
                }).join('');
            document.getElementById('offersList').innerHTML = html;
        }

        function renderUserShops() {
            renderShops();
            document.getElementById('userShopsList').innerHTML = document.getElementById('shopsList').innerHTML;
        }

        function renderAll() {
            renderCategories();
            renderFloors();
            renderShops();
            renderOffers();
        }
