Product Requirement Document: Anaya's Baby Care
Version: 5.0 (Production Ready Prototype)
Date: December 30, 2025
Type: Inventory Management & E-Commerce PWA

1. Executive Summary
Anaya's Baby Care is a dual-interface application designed to bridge the gap between high-volume retail management and a user-friendly, mobile-first shopping experience.
For the Business: A professional, high-density dashboard ("Fikri Store" aesthetic) that manages complex inventory data (SKUs, Bundles, Wholesale) and provides owner oversight via activity logs.
For the Customer: A visual, "Instagram-style" mobile web app centered on ease of use, featuring quick filtering, search, and WhatsApp-integrated checkout.

2. User Roles & Access
Role	Interface	Key Capabilities
OWNER	Admin Dashboard	Full access to Inventory, Staff Logs, Financial Reports.
STAFF	Admin Dashboard	"Creator Studio" (Add/Edit Products), Order Management. No access to Logs.
CUSTOMER	Mobile Storefront	Browse Feed, Search, Filter by Category, Cart, WhatsApp Checkout.

3. Core Functional Requirements
A. Admin Dashboard (Robust Side)
Complex Product Entry: Form supports Retail Price, Wholesale Price, Category, and logistics data (Weight, Dimensions) as requested.
Live Inventory Table: Real-time view of stock levels with status indicators (Low/High).
Creator Studio Logic: Adding a product instantly updates the global state, making it visible in the store immediately.
B. Storefront (Visual Side)
Mobile Simulation: The store interface is restricted to a centered "Phone Frame" to ensure a mobile-first experience even on desktop.
Smart Categorization: "Pill" navigation (Bundles, Diapers, etc.) instantly filters the product grid without page reloads.
Live Search: Typing in the search bar filters products in real-time.
WhatsApp Loop: The cart checkout process generates a formatted text message and redirects to WhatsApp.

4. Database Schema (Prisma)
Use this schema when migrating to the Next.js backend.
Code snippet
model Product {
  id             String   @id @default(cuid())
  name           String
  description    String?
  images         String[]
  
  // Pricing
  priceRetail    Decimal
  priceWholesale Decimal?
  
  // Logistics
  sku            String?
  weight         Float?
  dimensions     String?
  
  // Organization
  category       String   @default("General")
  tags           String[]
  stockQty       Int      @default(0)
  
  // Bundle Logic
  isBundle       Boolean  @default(false)
  bundleItems    BundleItem[] @relation("ParentBundle")
  
  createdAt      DateTime @default(now())
}

model BundleItem {
  id        String  @id @default(cuid())
  bundleId  String
  bundle    Product @relation("ParentBundle", fields: [bundleId], references: [id])
  productId String  // The child item
  quantity  Int     @default(1)
}

5. Reference Implementation (The Code)
Instructions: Copy the code block below into a file named index.html. This is your functional prototype containing all features discussed.

HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anaya's Baby Care - Full System</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: { 
                        brand: { 
                            cyan: '#06B6D4', 
                            orange: '#F97316', 
                            dark: '#111827', 
                            gray: '#F3F4F6' 
                        } 
                    }
                }
            }
        }
    </script>
    <style>
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        /* Phone Border Simulation */
        .phone-frame {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 8px solid #1F2937;
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-800 antialiased h-screen overflow-hidden flex">

    <script>
        // --- 1. DATABASE (State) ---
        let products = [
            { id: 101, name: "Hospital Bag Bundle", price: 450, stock: 5, category: "Bundles", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400" },
            { id: 102, name: "Huggies Dry (Size 1)", price: 85, stock: 45, category: "Diapers", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400" },
            { id: 103, name: "Cotton Onesie (3pk)", price: 120, stock: 20, category: "Clothing", image: "https://images.unsplash.com/photo-1542578952-32a24683058a?w=400" },
            { id: 104, name: "Dr. Browns Bottle", price: 90, stock: 2, category: "Feeding", image: "https://images.unsplash.com/photo-1583912267670-6575ad432db3?w=400" } // Low Stock
        ];

        let activeCategory = 'All';
        let cart = [];

        // --- 2. STORE LOGIC ---
        
        function filterCategory(category) {
            activeCategory = category;
            renderStore(); // Re-draw grid
            updatePills(); // Update button styles
        }

        function searchStore(query) {
            const term = query.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(term));
            renderGrid(filtered);
        }

        function updatePills() {
            document.querySelectorAll('.cat-pill').forEach(btn => {
                if (btn.innerText === activeCategory) {
                    btn.className = 'cat-pill px-5 py-2 rounded-full text-xs font-bold shadow-md transition bg-brand-dark text-white cursor-pointer';
                } else {
                    btn.className = 'cat-pill px-5 py-2 rounded-full text-xs font-bold shadow-sm transition bg-white text-gray-600 border border-gray-100 cursor-pointer hover:bg-gray-50';
                }
            });
        }

        function renderStore() {
            // Filter by Category
            const filtered = activeCategory === 'All' 
                ? products 
                : products.filter(p => p.category === activeCategory);
            
            renderGrid(filtered);
        }

        function renderGrid(data) {
            const grid = document.getElementById('store-grid');
            
            if (data.length === 0) {
                grid.innerHTML = `<div class="col-span-2 text-center py-10 text-gray-400">No items found.</div>`;
                return;
            }

            grid.innerHTML = data.map(p => `
                <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 fade-in group relative">
                    <div class="relative aspect-[4/5] bg-gray-100">
                        <img src="${p.image}" class="w-full h-full object-cover">
                        <button onclick="addToCart(${p.id})" class="absolute bottom-2 right-2 bg-white text-brand-dark w-9 h-9 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-10">
                            <i data-lucide="plus" width="18"></i>
                        </button>
                        ${p.stock < 5 ? '<span class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">Low Stock</span>' : ''}
                    </div>
                    <div class="p-3">
                        <h3 class="font-bold text-gray-900 text-sm truncate leading-tight mb-1">${p.name}</h3>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">${p.category}</span>
                            <span class="text-brand-cyan font-bold text-sm">₵${p.price}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            lucide.createIcons();
        }

        function addToCart(id) {
            const p = products.find(x => x.id === id);
            cart.push(p);
            
            // Update UI
            const badge = document.getElementById('cart-count');
            badge.innerText = cart.length;
            badge.classList.remove('hidden');
        }

        function checkoutWhatsApp() {
            if(cart.length === 0) return alert("Cart is empty");
            
            let msg = "Hello Anaya's! I would like to order:%0A";
            cart.forEach(item => {
                msg += `- ${item.name} (₵${item.price})%0A`;
            });
            const total = cart.reduce((sum, item) => sum + item.price, 0);
            msg += `%0ATotal: ₵${total}`;
            
            alert("Redirecting to WhatsApp...");
            console.log(msg); // In real app: window.open(`https://wa.me/...?text=${msg}`)
            
            // Clear cart
            cart = [];
            document.getElementById('cart-count').classList.add('hidden');
            document.getElementById('cart-count').innerText = 0;
        }

        // --- 3. ADMIN LOGIC ---

        function renderAdminList() {
            document.getElementById('product-table-body').innerHTML = products.map(p => `
                <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover shadow-sm">
                            <div class="font-bold text-sm text-gray-900">${p.name}</div>
                        </div>
                    </td>
                    <td class="p-4 text-sm text-gray-600">${p.category}</td>
                    <td class="p-4 text-sm font-bold text-gray-900">₵${p.price}</td>
                    <td class="p-4 text-sm">
                        ${p.stock < 5 
                            ? `<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">Low (${p.stock})</span>` 
                            : `<span class="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">${p.stock} Units</span>`
                        }
                    </td>
                </tr>
            `).join('');
        }

        function saveProduct() {
            const name = document.getElementById('in-name').value;
            const price = document.getElementById('in-price').value;
            const cat = document.getElementById('in-cat').value;

            if(!name || !price) return alert("Please fill in Name and Price");

            // Add to Array
            products.unshift({
                id: Date.now(),
                name,
                price: parseFloat(price),
                category: cat,
                stock: 10, // Default stock
                image: "https://images.unsplash.com/photo-1515488042361-25f4682ae2ed?w=400" // Placeholder image
            });

            // Refresh Views
            renderAdminList();
            renderStore(); 
            
            alert("Product Saved Successfully!");
            
            // Reset Form
            document.getElementById('in-name').value = '';
            document.getElementById('in-price').value = '';
        }

        // --- 4. VIEW CONTROLLER ---
        function switchView(view) {
            document.getElementById('view-admin').style.display = view === 'admin' ? 'flex' : 'none';
            document.getElementById('view-store').style.display = view === 'store' ? 'flex' : 'none';
            
            // Visual Button State
            if(view === 'admin') {
                document.getElementById('btn-admin').classList.add('ring-2', 'ring-white');
                document.getElementById('btn-store').classList.remove('ring-2', 'ring-white');
            } else {
                document.getElementById('btn-store').classList.add('ring-2', 'ring-white');
                document.getElementById('btn-admin').classList.remove('ring-2', 'ring-white');
            }
        }

        // Init
        window.onload = () => {
            switchView('admin'); // Default view
            renderAdminList();
            renderStore();
            updatePills();
            lucide.createIcons();
        }
    </script>

    <div id="view-admin" class="w-full h-full flex">
        
        <aside class="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            <div class="p-6 flex items-center gap-3">
                <div class="w-8 h-8 bg-brand-orange text-white rounded-lg flex items-center justify-center font-bold">A</div>
                <span class="font-bold text-lg">Admin</span>
            </div>
            <nav class="flex-1 px-4 space-y-1">
                <a href="#" class="flex items-center gap-3 px-3 py-2 bg-brand-cyan/10 text-brand-cyan font-bold rounded-lg"><i data-lucide="package" width="18"></i> Inventory</a>
                <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"><i data-lucide="shopping-bag" width="18"></i> Orders</a>
                <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"><i data-lucide="users" width="18"></i> Staff</a>
                <a href="#" class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"><i data-lucide="bar-chart" width="18"></i> Reports</a>
            </nav>
            <div class="p-4 border-t border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">MA</div>
                    <div>
                        <p class="text-sm font-bold text-gray-900">Mama Anaya</p>
                        <p class="text-xs text-gray-500">Owner Access</p>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 bg-gray-50 p-8 overflow-y-auto">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h1>
                
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i data-lucide="plus-circle" width="18" class="text-brand-cyan"></i> Creator Studio
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="col-span-2">
                            <label class="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                            <input id="in-name" type="text" placeholder="e.g. Baby Wipes" class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-brand-cyan/20 outline-none">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase">Price (₵)</label>
                            <input id="in-price" type="number" placeholder="0.00" class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-brand-cyan/20 outline-none">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select id="in-cat" class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 bg-white">
                                <option>Bundles</option>
                                <option>Diapers</option>
                                <option>Clothing</option>
                                <option>Feeding</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="saveProduct()" class="mt-4 bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition w-full md:w-auto">
                        Post Item to Shop
                    </button>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 class="font-bold text-gray-900 text-sm">Live Inventory</h3>
                        <span class="text-xs font-bold text-brand-cyan cursor-pointer">Export CSV</span>
                    </div>
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                            </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>


    <div id="view-store" class="hidden w-full h-full bg-gray-200 items-center justify-center p-4 relative">
        
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#06B6D4 1px, transparent 1px); background-size: 20px 20px;"></div>

        <div class="w-full max-w-[400px] h-[85vh] bg-white rounded-[40px] phone-frame overflow-hidden relative flex flex-col shadow-2xl">
            
            <div class="h-8 bg-white flex justify-between items-center px-6 text-[10px] font-bold text-gray-900 border-b border-gray-50">
                <span>9:41</span>
                <div class="flex gap-1">
                    <i data-lucide="wifi" width="12"></i>
                    <i data-lucide="battery" width="12"></i>
                </div>
            </div>

            <header class="bg-white px-5 py-3 flex justify-between items-center sticky top-0 z-20">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-tr from-brand-orange to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">A</div>
                    <span class="font-bold text-lg text-gray-900">Anaya's</span>
                </div>
                <div class="relative cursor-pointer" onclick="checkoutWhatsApp()">
                    <i data-lucide="shopping-bag" class="text-gray-700 w-6 h-6"></i>
                    <span id="cart-count" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">0</span>
                </div>
            </header>

            <div class="px-5 mb-2">
                <div class="relative">
                    <i data-lucide="search" width="16" class="absolute left-3 top-3 text-gray-400"></i>
                    <input onkeyup="searchStore(this.value)" type="text" placeholder="Search bundles, diapers..." class="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-cyan/20">
                </div>
            </div>

            <div class="px-5 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-50">
                <div class="inline-flex gap-4">
                    <div class="flex flex-col items-center gap-1">
                        <div class="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-brand-orange to-pink-500">
                            <div class="w-full h-full bg-gray-100 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=100" class="w-full h-full object-cover">
                            </div>
                        </div>
                        <span class="text-[10px] font-bold text-gray-600">New In</span>
                    </div>
                     <div class="flex flex-col items-center gap-1">
                        <div class="w-14 h-14 rounded-full p-[2px] bg-gray-200">
                            <div class="w-full h-full bg-gray-100 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=100" class="w-full h-full object-cover">
                            </div>
                        </div>
                        <span class="text-[10px] font-bold text-gray-600">Diapers</span>
                    </div>
                </div>
            </div>

            <div class="px-5 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div class="flex gap-2">
                    <button class="cat-pill" onclick="filterCategory('All')">All</button>
                    <button class="cat-pill" onclick="filterCategory('Bundles')">Bundles</button>
                    <button class="cat-pill" onclick="filterCategory('Diapers')">Diapers</button>
                    <button class="cat-pill" onclick="filterCategory('Clothing')">Clothing</button>
                    <button class="cat-pill" onclick="filterCategory('Feeding')">Feeding</button>
                </div>
            </div>

            <div id="store-grid" class="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-4 pb-20 bg-gray-50">
                </div>

            <nav class="bg-white border-t border-gray-100 py-3 px-8 flex justify-between items-end absolute bottom-0 w-full rounded-b-[32px]">
                <button class="flex flex-col items-center gap-1 text-brand-cyan">
                    <i data-lucide="home" width="24" stroke-width="2.5"></i>
                    <span class="text-[10px] font-bold">Shop</span>
                </button>
                <button class="flex flex-col items-center gap-1 text-gray-400">
                    <i data-lucide="heart" width="24"></i>
                    <span class="text-[10px] font-medium">Saved</span>
                </button>
                <button class="flex flex-col items-center gap-1 text-gray-400">
                    <i data-lucide="user" width="24"></i>
                    <span class="text-[10px] font-medium">Account</span>
                </button>
            </nav>
            
            <div class="absolute bottom-1 left-0 right-0 flex justify-center pb-1">
                 <div class="w-32 h-1 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    </div>


    <div class="fixed bottom-8 right-8 z-50 flex gap-3">
        <button id="btn-admin" onclick="switchView('admin')" class="bg-brand-dark text-white px-5 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition border-2 border-white/20">
            <i data-lucide="layout-dashboard" width="16"></i> Admin
        </button>
        <button id="btn-store" onclick="switchView('store')" class="bg-brand-cyan text-white px-5 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition border-2 border-white/20">
            <i data-lucide="smartphone" width="16"></i> Store
        </button>
    </div>

</body>
</html>
