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
    // Tutup semua menu jika klik di luar
    if (!event.target.closest('.image-action-container')) {
        document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function toggleActionMenu(event, buttonElement) {
    event.stopPropagation();
    // Tutup menu lain yang terbuka
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
    
    renderFolderImages();
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

// Papar gambar dalam folder dengan menu 3 titik (Muat Turun & Padam)
function renderFolderImages() {
    const gridContainer = document.getElementById('modalImageGrid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    let savedAlbums = JSON.parse(localStorage.getItem('folderUploads')) || {};
    let customImages = savedAlbums[currentFolderName] || [];

    let deletedImages = JSON.parse(localStorage.getItem('folderDeletions')) || {};
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
}

function uploadToCurrentFolder() {
    const fileInput = document.getElementById('modalImageInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Sila pilih fail imej terlebih dahulu!');
        return;
    }

    processAndSaveImage(fileInput.files[0], 'folderUploads', currentFolderName, function() {
        renderFolderImages();
        fileInput.value = '';
    });
}

function deleteImageFromFolder(src, isDefault) {
    if (!confirm('Adakah anda pasti mahu memadam gambar ini?')) return;

    if (isDefault) {
        let deletedImages = JSON.parse(localStorage.getItem('folderDeletions')) || {};
        if (!deletedImages[currentFolderName]) deletedImages[currentFolderName] = [];
        deletedImages[currentFolderName].push(src);
        localStorage.setItem('folderDeletions', JSON.stringify(deletedImages));
    } else {
        let savedAlbums = JSON.parse(localStorage.getItem('folderUploads')) || {};
        if (savedAlbums[currentFolderName]) {
            savedAlbums[currentFolderName] = savedAlbums[currentFolderName].filter(item => item !== src);
            localStorage.setItem('folderUploads', JSON.stringify(savedAlbums));
        }
    }

    renderFolderImages();
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
// 5. BAHAGIAN MUAT NAIK GAMBAR KE GRID UTAMA (PHOTO GALLERY)
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
        let mainGalleryUploads = JSON.parse(localStorage.getItem('mainGalleryUploads')) || [];
        appendImageToMainGrid(imageUrl, mainGalleryUploads.length, imageUrl);

        fileInput.value = '';
        alert('Gambar berjaya dimuat naik ke paparan utama galeri!');
    });
}

// Masukkan elemen HTML gambar baharu ke bento grid utama beserta menu 3 titik
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

// Fungsi Padam Gambar dari Galeri Utama
function deleteMainGalleryImage(targetSrc) {
    if (!confirm('Adakah anda pasti mahu memadam gambar ini dari galeri utama?')) return;

    let mainGalleryUploads = JSON.parse(localStorage.getItem('mainGalleryUploads')) || [];
    mainGalleryUploads = mainGalleryUploads.filter(src => src !== targetSrc);
    localStorage.setItem('mainGalleryUploads', JSON.stringify(mainGalleryUploads));

    // Muat semula paparan galeri utama
    const gridContainer = document.getElementById('mainBentoGrid');
    if (gridContainer) {
        location.reload(); 
    }
}

function loadMainGalleryCustomImages() {
    let mainGalleryUploads = JSON.parse(localStorage.getItem('mainGalleryUploads')) || [];
    mainGalleryUploads.forEach((src, index) => {
        appendImageToMainGrid(src, index + 1, src);
    });
}


// ==========================================
// 6. FUNGSI PUSAT PEMBANTU (CLOUD STORAGE - CLOUDINARY)
// ==========================================
function processAndSaveImage(file, storageKey, subKeyOrFolder, callback) {
    const cloudName = "zihj35yq";
    const uploadPreset = "pdtalbum";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    alert("Sedang memuat naik gambar ke awan (Cloud)... Sila tunggu sebentar.");

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            const imageUrl = data.secure_url;

            let storedData = JSON.parse(localStorage.getItem(storageKey)) || (storageKey === 'folderUploads' ? {} : []);

            if (storageKey === 'folderUploads') {
                if (!storedData[subKeyOrFolder]) {
                    storedData[subKeyOrFolder] = [];
                }
                storedData[subKeyOrFolder].push(imageUrl);
            } else if (storageKey === 'mainGalleryUploads') {
                storedData.push(imageUrl);
            }

            localStorage.setItem(storageKey, JSON.stringify(storedData));

            if (typeof callback === 'function') {
                callback(imageUrl);
            }
            alert("Gambar berjaya dimuat naik ke awan!");
        } else {
            alert("Gagal memuat naik gambar ke Cloudinary. Sila semak tetapan.");
            console.error(data);
        }
    })
    .catch(error => {
        console.error("Ralat:", error);
        alert("Berlaku ralat semasa menyambung ke pelayan Cloud.");
    });
}