// ==========================================
// TETAPAN JSONBIN.IO (KEDAI NOTA AWAN)
// ==========================================
const JSONBIN_MASTER_KEY = "$2a$10$NmymginfbGwdqBxF3Y239uJTQ8/GjvNBNqK0.X5DZ.60oEFeSrkj6"; 
// Nota: Jika anda belum ada Bin ID, biarkan kosong dulu. Kod akan auto-cipta Bin pertama anda.
const JSONBIN_BIN_ID = localStorage.getItem('jsonbin_bin_id') || "6aab9219ac6210605ad7505a"; 


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

        let isValid = allowedAccounts.some(acc => inputID === acc.id && inputPass === acc.pass);

        if (isValid) {
            alert("Log masuk berjaya!");
            window.location.href = "album.html";
        } else {
            alert("ID atau Password salah! Sila cuba semula.");
        }
    });
}


// ==========================================
// 2. SISTEM MENU 3 TITIK (GLOBAL CLICK LISTENER)
// ==========================================
window.addEventListener('click', function(event) {
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
    
    loadDataAndRenderFolder();
}

function closeFolder() {
    const modal = document.getElementById('folderModal');
    if (modal) modal.style.display = 'none';
    currentFolderName = '';
    currentDefaultImages = [];
}

window.onclick = function(event) {
    const modal = document.getElementById('folderModal');
    if (event.target === modal) {
        closeFolder();
    }
};

// Ambil data dari JSONBin sebelum papar folder
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

        allImages.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'grid-item item-medium';
            item.style.position = 'relative';
            const isDefault = filteredDefaultImages.includes(src);

            item.innerHTML = `
                <img src="${src}" alt="Foto ${index + 1}" class="gallery-img" style="width:100%; border-radius: 8px; height: 180px; object-fit: cover;">
                
                <div class="image-action-container">
                    <button class="menu-trigger-btn" onclick="toggleActionMenu(event, this)" title="Pilihan">&#8942;</button>
                    <div class="action-dropdown-menu">
                        <a href="${src}" download="foto-${currentFolderName}-${index + 1}.jpg" target="_blank">Muat Turun</a>
                        <button class="delete-option" onclick="deleteImageFromFolder('${src}', ${isDefault})">Padam</button>
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
window.addEventListener('DOMContentLoaded', function() {
    loadMainGalleryCustomImages();
});

function uploadToMainGallery() {
    const fileInput = document.getElementById('mainGalleryImageInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Sila pilih fail imej terlebih dahulu!');
        return;
    }

    processAndSaveImage(fileInput.files[0], 'mainGalleryUploads', 'main', function(imageUrl) {
        let gridContainer = document.getElementById('mainBentoGrid');
        if (gridContainer) {
            // Muat semula halaman untuk paparkan gambar baru
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

    newItem.innerHTML = `
        <img src="${src}" alt="Gambar Muat Naik ${index}" class="gallery-img">
        
        <div class="image-action-container">
            <button class="menu-trigger-btn" onclick="toggleActionMenu(event, this)" title="Pilihan">&#8942;</button>
            <div class="action-dropdown-menu">
                <a href="${src}" download="gambar-utama-${index}.jpg" target="_blank">Muat Turun</a>
                <button class="delete-option" onclick="deleteMainGalleryImage('${uniqueId}')">Padam</button>
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

    // 1. Muat naik fail gambar fizikal ke Cloudinary
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            const imageUrl = data.secure_url;

            // 2. Ambil data semasa dari JSONBin, kemaskini, dan simpan semula
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

// Fungsi Bantu: Ambil Data dari JSONBin.io
function fetchCloudData(callback) {
    if (!JSONBIN_BIN_ID) {
        // Jika belum ada Bin, pulangkan data kosong
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

// Fungsi Bantu: Simpan Data ke JSONBin.io
function saveCloudData(cloudData, callback) {
    if (!JSONBIN_BIN_ID) {
        // Cipta Bin baru secara automatik jika belum ada
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

    // Kemaskini Bin yang sedia ada
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