// Firebase imports
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';

// App State
let subtitles = [];
let isPro = false;
let currentUser = null;
const FREE_LIMIT = 10;

// DOM Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const modeContents = document.querySelectorAll('.mode-content');
const pasteInput = document.getElementById('pasteInput');
const parseBtn = document.getElementById('parseBtn');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const subtitleTextInput = document.getElementById('subtitleText');
const addSlotBtn = document.getElementById('addSlotBtn');
const fileInput = document.getElementById('fileInput');
const loadFileBtn = document.getElementById('loadFileBtn');
const subtitleList = document.getElementById('subtitleList');
const subtitleCount = document.getElementById('subtitleCount');
const downloadBtn = document.getElementById('downloadBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const limitNotice = document.getElementById('limitNotice');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradeLinkLimit = document.getElementById('upgradeLinkLimit');
const premiumModal = document.getElementById('premiumModal');
const closeModal = document.querySelector('.close');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.querySelector('.close-auth');
const authTabs = document.querySelectorAll('.auth-tab');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authError = document.getElementById('authError');
const proBanner = document.getElementById('proBanner');
const proBannerBtn = document.getElementById('proBannerBtn');
const proCtaBtn = document.getElementById('proCtaBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const confirmDialog = document.getElementById('confirmDialog');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOk = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');
const editDialog = document.getElementById('editDialog');
const closeEditDialog = document.querySelector('.close-edit');
const editStartTime = document.getElementById('editStartTime');
const editEndTime = document.getElementById('editEndTime');
const editText = document.getElementById('editText');
const editSave = document.getElementById('editSave');
const editCancel = document.getElementById('editCancel');

let currentEditIndex = null;
let confirmCallback = null;

// Toast notification function
function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.className = 'toast';
    if (type === 'success') toast.classList.add('success');
    if (type === 'error') toast.classList.add('error');
    if (type === 'warning') toast.classList.add('warning');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Custom confirm dialog
function showConfirm(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmDialog.classList.remove('hidden');
}

confirmOk.addEventListener('click', () => {
    confirmDialog.classList.add('hidden');
    if (confirmCallback) confirmCallback(true);
    confirmCallback = null;
});

confirmCancel.addEventListener('click', () => {
    confirmDialog.classList.add('hidden');
    if (confirmCallback) confirmCallback(false);
    confirmCallback = null;
});

window.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
        confirmDialog.classList.add('hidden');
        if (confirmCallback) confirmCallback(false);
        confirmCallback = null;
    }
});

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        modeBtns.forEach(b => b.classList.remove('active'));
        modeContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${mode}Mode`).classList.add('active');
    });
});

// Parse SRT from paste
parseBtn.addEventListener('click', () => {
    const text = pasteInput.value.trim();
    if (!text) {
        showToast('Please paste SRT content first!', 'warning');
        return;
    }
    
    const parsed = parseSRT(text);
    if (parsed.length === 0) {
        showToast('Could not parse SRT content. Please check the format.', 'error');
        return;
    }
    
    subtitles = parsed;
    renderSubtitles();
    pasteInput.value = '';
    showToast(`Loaded ${parsed.length} subtitles successfully!`, 'success');
});

// Add manual subtitle
addSlotBtn.addEventListener('click', () => {
    const start = startTimeInput.value.trim();
    const end = endTimeInput.value.trim();
    const text = subtitleTextInput.value.trim();
    
    if (!start || !end || !text) {
        showToast('Please fill in all fields!', 'warning');
        return;
    }
    
    if (!isPro && subtitles.length >= FREE_LIMIT) {
        showLimitNotice();
        showToast('Free tier limited to 10 subtitles. Upgrade to Pro!', 'warning');
        return;
    }
    
    subtitles.push({
        start,
        end,
        text
    });
    
    renderSubtitles();
    startTimeInput.value = '';
    endTimeInput.value = '';
    subtitleTextInput.value = '';
    showToast('Subtitle added successfully!', 'success');
});

// Load file
loadFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        showToast('Please select a file first!', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const parsed = parseSRT(content);
        
        if (parsed.length === 0) {
            showToast('Could not parse SRT file.', 'error');
            return;
        }
        
        subtitles = parsed;
        renderSubtitles();
        fileInput.value = '';
        showToast(`Loaded ${parsed.length} subtitles from file!`, 'success');
    };
    reader.readAsText(file);
});

// Parse SRT format
function parseSRT(text) {
    const blocks = text.split(/\n\s*\n/);
    const result = [];
    
    blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length < 3) return;
        
        const timeLine = lines[1];
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        
        if (timeMatch) {
            result.push({
                start: timeMatch[1],
                end: timeMatch[2],
                text: lines.slice(2).join('\n')
            });
        }
    });
    
    return result;
}

// Render subtitles
function renderSubtitles() {
    subtitleList.innerHTML = '';
    subtitleCount.textContent = subtitles.length;
    
    subtitles.forEach((sub, index) => {
        const item = document.createElement('div');
        item.className = 'subtitle-item';
        item.innerHTML = `
            <div class="subtitle-header">
                <span class="subtitle-number">#${index + 1}</span>
                <div class="subtitle-actions">
                    <button class="edit-btn" onclick="editSubtitle(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteSubtitle(${index})">Delete</button>
                </div>
            </div>
            <div class="subtitle-time">${sub.start} → ${sub.end}</div>
            <div class="subtitle-text">${sub.text}</div>
        `;
        subtitleList.appendChild(item);
    });
    
    checkLimit();
}

// Edit subtitle
window.editSubtitle = function(index) {
    currentEditIndex = index;
    const sub = subtitles[index];
    editStartTime.value = sub.start;
    editEndTime.value = sub.end;
    editText.value = sub.text;
    editDialog.classList.remove('hidden');
};

editSave.addEventListener('click', () => {
    if (currentEditIndex !== null) {
        subtitles[currentEditIndex] = {
            start: editStartTime.value,
            end: editEndTime.value,
            text: editText.value
        };
        renderSubtitles();
        editDialog.classList.add('hidden');
        showToast('Subtitle updated!', 'success');
        currentEditIndex = null;
    }
});

editCancel.addEventListener('click', () => {
    editDialog.classList.add('hidden');
    currentEditIndex = null;
});

closeEditDialog.addEventListener('click', () => {
    editDialog.classList.add('hidden');
    currentEditIndex = null;
});

window.addEventListener('click', (e) => {
    if (e.target === editDialog) {
        editDialog.classList.add('hidden');
        currentEditIndex = null;
    }
});

// Delete subtitle
window.deleteSubtitle = function(index) {
    showConfirm('Delete Subtitle', 'Are you sure you want to delete this subtitle?', (confirmed) => {
        if (confirmed) {
            subtitles.splice(index, 1);
            renderSubtitles();
            showToast('Subtitle deleted!', 'success');
        }
    });
};

// Download SRT
downloadBtn.addEventListener('click', () => {
    if (subtitles.length === 0) {
        showToast('No subtitles to download!', 'warning');
        return;
    }
    
    const srtContent = generateSRT();
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('SRT file downloaded!', 'success');
});

// Generate SRT content
function generateSRT() {
    return subtitles.map((sub, index) => {
        return `${index + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`;
    }).join('\n');
}

// Clear all
clearAllBtn.addEventListener('click', () => {
    showConfirm('Clear All Subtitles', 'Are you sure you want to clear all subtitles? This cannot be undone.', (confirmed) => {
        if (confirmed) {
            subtitles = [];
            renderSubtitles();
            showToast('All subtitles cleared!', 'success');
        }
    });
});

// Check limit
function checkLimit() {
    if (!isPro && subtitles.length >= FREE_LIMIT) {
        showLimitNotice();
    } else {
        limitNotice.classList.add('hidden');
    }
}

function showLimitNotice() {
    limitNotice.classList.remove('hidden');
}

// Premium modal
upgradeBtn.addEventListener('click', () => {
    premiumModal.classList.remove('hidden');
});

upgradeLinkLimit.addEventListener('click', (e) => {
    e.preventDefault();
    premiumModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    premiumModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === premiumModal) {
        premiumModal.classList.add('hidden');
    }
});


// Authentication
let currentAuthMode = 'login';

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userEmail.textContent = user.email;
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Check if user is Pro
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            isPro = userDoc.data().isPro || false;
            if (isPro) {
                upgradeBtn.classList.add('hidden');
                proBanner.classList.add('hidden');
            } else {
                upgradeBtn.classList.remove('hidden');
                proBanner.classList.remove('hidden');
            }
        } else {
            // Create user document
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                isPro: false,
                createdAt: new Date().toISOString()
            });
            proBanner.classList.remove('hidden');
        }
    } else {
        currentUser = null;
        isPro = false;
        userEmail.textContent = '';
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        upgradeBtn.classList.add('hidden');
        proBanner.classList.remove('hidden');
    }
    checkLimit();
});

// Auth tabs
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAuthMode = tab.dataset.tab;
        
        if (currentAuthMode === 'login') {
            authTitle.textContent = 'Login to SRT Editor Pro';
            authSubmit.textContent = 'Login';
        } else {
            authTitle.textContent = 'Create Account';
            authSubmit.textContent = 'Sign Up';
        }
        authError.classList.add('hidden');
    });
});

// Auth form submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    authError.classList.add('hidden');
    authSubmit.disabled = true;
    authSubmit.textContent = 'Please wait...';
    
    try {
        if (currentAuthMode === 'signup') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: email,
                isPro: false,
                createdAt: new Date().toISOString()
            });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        authModal.classList.add('hidden');
        authForm.reset();
    } catch (error) {
        authError.textContent = error.message;
        authError.classList.remove('hidden');
    } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = currentAuthMode === 'login' ? 'Login' : 'Sign Up';
    }
});

// Login button
loginBtn.addEventListener('click', () => {
    authModal.classList.remove('hidden');
});

// Logout button
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    subtitles = [];
    renderSubtitles();
});

// Close auth modal
closeAuthModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

// Upgrade button - require login
upgradeBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    premiumModal.classList.remove('hidden');
});

upgradeLinkLimit.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    premiumModal.classList.remove('hidden');
});

// Pro banner and CTA buttons
proBannerBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    premiumModal.classList.remove('hidden');
});

proCtaBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
        return;
    }
    premiumModal.classList.remove('hidden');
});

// Update PayPal onApprove to mark user as Pro
window.paypalOnApprove = async function(data) {
    if (currentUser) {
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                isPro: true,
                subscriptionId: data.subscriptionID,
                subscribedAt: new Date().toISOString()
            });
            isPro = true;
            showToast('Thank you for subscribing! You now have Pro access.', 'success');
            premiumModal.classList.add('hidden');
            upgradeBtn.classList.add('hidden');
            proBanner.classList.add('hidden');
            limitNotice.classList.add('hidden');
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Payment successful but there was an error. Please contact support with your subscription ID: ' + data.subscriptionID, 'error');
        }
    }
};
