// ==========================================
// TETAPAN JSONBIN.IO (KEDAI NOTA AWAN)
// ==========================================
const JSONBIN_MASTER_KEY = "$2a$10$NmymginfbGwdqBxF3Y239uJTQ8/GjvNBNqK0.X5DZ.60oEFeSrkj6"; 
let JSONBIN_BIN_ID = localStorage.getItem('jsonbin_bin_id') || "6aab9219ac6210605ad7505a"; 


// ==========================================
// 0. KAWALAN PAPARAN ADMIN & PAPARAN AWAL
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem("loggedInUser"); 
    const allowedAdminID = "admin105"; 

    if (currentUser !== allowedAdminID) {
        const restrictedElements = document.querySelectorAll(".admin-only");
        restrictedElements.forEach(el => {
            el.style.display = "none";
        });
    }

    loadMainGalleryCustomImages();
});


// ==========================================
// 1. BAHAGIAN LOG MASUK (LOGIN)
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const inputID = document.getElementById('username').value.trim();
        const inputPass = document.getElementById('password').value.trim();

        const allowedAccounts = [
            { id: "admin105", pass: "pdt123" },
            { id: "admin2", pass: "rahsia456" }
        ];

        let matchedAccount = allowedAccounts.find(acc => inputID === acc.id && inputPass === acc.pass);

        if (matchedAccount) {
            localStorage.setItem("loggedInUser", matchedAccount.id);

            alert("Log masuk berjaya!");
            window.location.href = "album.html";
        } else {
            alert("ID atau Password salah! Sila cuba semula.");
        }
    });
}


// ==========================================
// 2. SISTEM MENU 3 TITIK & MODAL FULLVIEW (GLOBAL)
// ==========================================
window.addEventListener('click', function(event) {
    // Tutup dropdown menu biasa jika klik di luar
    if (!event.target.closest('.image-action-container')) {
        document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function toggleActionMenu(event, buttonElement) {
    event.stopPropagation();
    const container = buttonElement.closest('.image-action-container');
    const menu = container.querySelector('.action-dropdown-menu');
    
    document.querySelectorAll('.action-dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });

    menu.classList.toggle('show');
}

// --- FUNGSI FULLVIEW PAPARAN PENUH GAMBAR ---
document.addEventListener('click', function(event) {
    // Semak jika pengguna menekan mana-mana gambar (termasuk gambar baru dimuat naik)
    const targetImg = event.target.closest('.destination-card img, .modal-grid img, .gallery-img, .folder-card img');
    
    // Elakkan cetusan jika klik butang menu/dropdown
    if (targetImg && !event.target.closest('.image-action-container')) {
        openFullview(targetImg.src);
    }
});

function openFullview(imageSrc) {
    let modal = document.getElementById('fullviewModal');
    
    // Jika modal fullview belum wujud dalam HTML, cipta secara automatik
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fullviewModal';
        modal.className = 'modal';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 15, 25, 0.9); z-index: 2000; justify-content: center; align-items: center; padding: 20px;';
        
        modal.innerHTML = `
            <div class="fullview-content" style="position: relative; width: 85vw; height: 85vh; display: flex; justify-content: center; align-items: center;">
                <span class="close-fullview" onclick="closeFullview()" style="position: absolute; top: -40px; right: 0; font-size: 32px; color: #fff; cursor: pointer; z-index: 2010;">&times;</span>
                <div class="fullview-image-container" style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                    <img id="fullviewImg" src="" alt="Fullview" style="width: 100%; height: 100%; border-radius: 8px; object-fit: contain; display: block;">
                    
                    <!-- Butang 3 Titik Bertindih dalam Modal Fullview -->
                    <div class="image-action-container" style="position: absolute; top: 15px; right: 15px; z-index: 2020;">
                        <button class="menu-trigger-btn" onclick="toggleActionMenu(event, this)" title="Pilihan" style="background: rgba(11, 15, 25, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">&#8942;</button>
                        <div class="action-dropdown-menu" style="display: none; position: absolute; right: 0; top: 42px; background: #1e293b; border-radius: 6px; box-shadow: 0 10px 20px rgba(0,0,0,0.4); width: 130px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                            <a id="fullviewDownloadBtn" href="" download="gambar-fullview.jpg" target="_blank" style="display: block; padding: 10px; text-align: left; color: #f8fafc; font-size: 12px; text-decoration: none;">Muat Turun</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalImg = document.getElementById('fullviewImg');
    const downloadBtn = document.getElementById('fullviewDownloadBtn');
    
    if (modalImg) modalImg.src = imageSrc;
    if (downloadBtn) downloadBtn.href = imageSrc;
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open'); // <--- Sembunyikan Nav Bar
}

function closeFullview() {
    const modal = document.getElementById('fullviewModal');
    if (modal) {
        modal.style.display = 'none';
        const dropdown = modal.querySelector('.action-dropdown-menu');
        if (dropdown) dropdown.classList.remove('show');
    }
    document.body.classList.remove('modal-open'); // <--- Paparkan semula Nav Bar
}


// ==========================================
// 3. BAHAGIAN PENGURUSAN ALBUM & MODAL FOLDER
// ==========================================
let currentFolderName = '';
let currentDefaultImages = []; 

function openFolder(folderName, defaultImages) {
    currentFolderName = String(folderName);
    currentDefaultImages = defaultImages || []; 
    
    const modal = document.getElementById('folderModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modalTitle) modalTitle.innerText = `Album Tahun ${currentFolderName}`;
    if (modal) modal.style.display = 'flex';
    
    document.body.classList.add('modal-open'); // <--- Sembunyikan Nav Bar
    
    loadDataAndRenderFolder();
}

function closeFolder() {
    const modal = document.getElementById('folderModal');
    if (modal) modal.style.display = 'none';
    currentFolderName = '';
    currentDefaultImages = [];

    document.body.classList.remove('modal-open'); // <--- Paparkan semula Nav Bar
}

window.onclick = function(event) {
    const modal = document.getElementById('folderModal');
    const fullviewModal = document.getElementById('fullviewModal');
    
    if (event.target === modal) {
        closeFolder();
    }
    if (event.target === fullviewModal) {
        closeFullview();
    }
};

function loadDataAndRenderFolder() {
    fetchCloudData(function(cloudData) {
        const gridContainer = document.getElementById('modalImageGrid');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';

        let savedAlbums = cloudData.folderUploads || {};
        let customImages = savedAlbums[currentFolderName] || [];

        let deletedImages = cloudData.folderDeletions || {};
        let deletedList = deletedImages[currentFolderName] || [];

        let filteredDefaultImages = currentDefaultImages.filter(src => !deletedList.includes(src));
        let allImages = [...filteredDefaultImages, ...customImages];

        if (allImages.length === 0) {
            gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 20px;">Tiada gambar lagi dalam album ini.</p>';
            return;
        }

        const currentUser = localStorage.getItem("loggedInUser");
        const isAdmin = (currentUser === "admin105");
        const deleteBtnStyle = isAdmin ? '' : 'display: none;';

        allImages.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'grid-item item-medium';
            item.style.position = 'relative';
            const isDefault = filteredDefaultImages.includes(src);

            item.innerHTML = `
                <img src="${src}" alt="Foto ${index + 1}" class="gallery-img" style="width:100%; border-radius: 8px; height: 180px; object-fit: cover; cursor: pointer;">
                
                <div class="image-action-container">
                    <button class="menu-trigger-btn" onclick="toggleActionMenu(event, this)" title="Pilihan">&#8942;</button>
                    <div class="action-dropdown-menu">
                        <a href="${src}" download="foto-${currentFolderName}-${index + 1}.jpg" target="_blank">Muat Turun</a>
                        <button class="delete-option" style="${deleteBtnStyle}" onclick="deleteImageFromFolder('${src}', ${isDefault})">Padam</button>
                    </div>
                </div>
            `;
            gridContainer.appendChild(item);
        });
    });
}

function uploadToCurrentFolder() {
    const fileInput = document.getElementById('modalImageInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Sila pilih fail imej terlebih dahulu!');
        return;
    }

    processAndSaveImage(fileInput.files[0], 'folderUploads', currentFolderName, function() {
        loadDataAndRenderFolder();
        fileInput.value = '';
    });
}

function deleteImageFromFolder(src, isDefault) {
    if (!confirm('Adakah anda pasti mahu memadam gambar ini?')) return;

    fetchCloudData(function(cloudData) {
        if (isDefault) {
            if (!cloudData.folderDeletions) cloudData.folderDeletions = {};
            if (!cloudData.folderDeletions[currentFolderName]) cloudData.folderDeletions[currentFolderName] = [];
            cloudData.folderDeletions[currentFolderName].push(src);
        } else {
            if (cloudData.folderUploads && cloudData.folderUploads[currentFolderName]) {
                cloudData.folderUploads[currentFolderName] = cloudData.folderUploads[currentFolderName].filter(item => item !== src);
            }
        }

        saveCloudData(cloudData, function() {
            loadDataAndRenderFolder();
        });
    });
}


// ==========================================
// 4. BAHAGIAN TAMBAH GAMBAR DI LUAR FOLDER
// ==========================================
function uploadOutsideFolder() {
    const folderSelect = document.getElementById('targetFolderSelect');
    const fileInput = document.getElementById('outsideImageInput');

    if (!folderSelect || !folderSelect.value) {
        alert('Sila pilih album/folder terlebih dahulu!');
        return;
    }

    if (!fileInput || !fileInput.files[0]) {
        alert('Sila pilih fail imej terlebih dahulu!');
        return;
    }

    const selectedFolder = folderSelect.value;

    processAndSaveImage(fileInput.files[0], 'folderUploads', selectedFolder, function() {
        fileInput.value = '';
        alert(`Gambar berjaya ditambah ke dalam Album ${selectedFolder}!`);
    });
}


// ==========================================
// 5. BAHAGIAN MUAT NAIK GAMBAR KE GRID UTAMA
// ==========================================
function uploadToMainGallery() {
    const fileInput = document.getElementById('mainGalleryImageInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Sila pilih fail imej terlebih dahulu!');
        return;
    }

    processAndSaveImage(fileInput.files[0], 'mainGalleryUploads', 'main', function(imageUrl) {
        let gridContainer = document.getElementById('mainBentoGrid');
        if (gridContainer) {
            location.reload();
        }
        fileInput.value = '';
        alert('Gambar berjaya dimuat naik ke paparan utama galeri!');
    });
}

function appendImageToMainGrid(src, index, uniqueId = src) {
    const gridContainer = document.getElementById('mainBentoGrid');
    if (!gridContainer) return;

    const newItem = document.createElement('div');
    newItem.className = 'grid-item item-medium'; 
    newItem.style.position = 'relative';

    const currentUser = localStorage.getItem("loggedInUser");
    const isAdmin = (currentUser === "admin105");
    const deleteBtnStyle = isAdmin ? '' : 'display: none;';

    newItem.innerHTML = `
        <img src="${src}" alt="Gambar Muat Naik ${index}" class="gallery-img" style="cursor: pointer;">
        
        <div class="image-action-container">
            <button class="menu-trigger-btn" onclick="toggleActionMenu(event, this)" title="Pilihan">&#8942;</button>
            <div class="action-dropdown-menu">
                <a href="${src}" download="gambar-utama-${index}.jpg" target="_blank">Muat Turun</a>
                <button class="delete-option" style="${deleteBtnStyle}" onclick="deleteMainGalleryImage('${uniqueId}')">Padam</button>
            </div>
        </div>
    `;
    gridContainer.appendChild(newItem);
}

function deleteMainGalleryImage(targetSrc) {
    if (!confirm('Adakah anda pasti mahu memadam gambar ini dari galeri utama?')) return;

    fetchCloudData(function(cloudData) {
        if (cloudData.mainGalleryUploads) {
            cloudData.mainGalleryUploads = cloudData.mainGalleryUploads.filter(src => src !== targetSrc);
        }
        saveCloudData(cloudData, function() {
            location.reload();
        });
    });
}

function loadMainGalleryCustomImages() {
    fetchCloudData(function(cloudData) {
        let mainGalleryUploads = cloudData.mainGalleryUploads || [];
        mainGalleryUploads.forEach((src, index) => {
            appendImageToMainGrid(src, index + 1, src);
        });
    });
}


// ==========================================
// 6. FUNGSI UTAMA (CLOUDINARY + JSONBIN SYNC)
// ==========================================
function processAndSaveImage(file, storageKey, subKeyOrFolder, callback) {
    const cloudName = "zihj35yq";
    const uploadPreset = "pdtalbum";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    alert("Sedang memuat naik gambar ke awan...");

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            const imageUrl = data.secure_url;

            fetchCloudData(function(cloudData) {
                if (storageKey === 'folderUploads') {
                    if (!cloudData.folderUploads) cloudData.folderUploads = {};
                    if (!cloudData.folderUploads[subKeyOrFolder]) {
                        cloudData.folderUploads[subKeyOrFolder] = [];
                    }
                    cloudData.folderUploads[subKeyOrFolder].push(imageUrl);
                } else if (storageKey === 'mainGalleryUploads') {
                    if (!cloudData.mainGalleryUploads) cloudData.mainGalleryUploads = [];
                    cloudData.mainGalleryUploads.push(imageUrl);
                }

                saveCloudData(cloudData, function() {
                    if (typeof callback === 'function') {
                        callback(imageUrl);
                    }
                    alert("Gambar berjaya disegerakkan untuk semua peranti!");
                });
            });
        } else {
            alert("Gagal memuat naik ke Cloudinary.");
            console.error(data);
        }
    })
    .catch(error => {
        console.error("Ralat:", error);
        alert("Berlaku ralat semasa menyambung ke pelayan.");
    });
}

function fetchCloudData(callback) {
    if (!JSONBIN_BIN_ID) {
        callback({ folderUploads: {}, folderDeletions: {}, mainGalleryUploads: [] });
        return;
    }

    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: {
            "X-Master-Key": JSONBIN_MASTER_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        callback(data.record || { folderUploads: {}, folderDeletions: {}, mainGalleryUploads: [] });
    })
    .catch(err => {
        console.error("Gagal ambil data cloud:", err);
        callback({ folderUploads: {}, folderDeletions: {}, mainGalleryUploads: [] });
    });
}

function saveCloudData(cloudData, callback) {
    if (!JSONBIN_BIN_ID) {
        fetch("https://api.jsonbin.io/v3/b", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_MASTER_KEY,
                "X-Collection-Id": ""
            },
            body: JSON.stringify(cloudData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.metadata && data.metadata.id) {
                JSONBIN_BIN_ID = data.metadata.id;
                localStorage.setItem('jsonbin_bin_id', JSONBIN_BIN_ID);
                if (typeof callback === 'function') callback();
            }
        })
        .catch(err => console.error("Gagal cipta Bin baru:", err));
        return;
    }

    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": JSONBIN_MASTER_KEY
        },
        body: JSON.stringify(cloudData)
    })
    .then(res => res.json())
    .then(() => {
        if (typeof callback === 'function') callback();
    })
    .catch(err => console.error("Gagal kemaskini data cloud:", err));
}


// ==========================================
// 7. FUNGSI TOGGLE PASSWORD (IKON MATA SVG)
// ==========================================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    
    if (!passwordInput || !toggleBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}