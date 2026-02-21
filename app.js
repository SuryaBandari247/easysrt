// Firebase imports
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, getDoc, updateDoc } from './firebase-config.js';
import { UsageTracker } from './fingerprint.js';

// App State
let subtitles = [];
let isPro = false;
let currentUser = null;
const FREE_LIMIT = 10;
const FREE_CONVERSION_LIMIT = 3;
const FREE_SYNC_LIMIT = 5;

// Auto-increment state
let autoIncrementEnabled = true;
let lastEndTime = '00:00:01,000';
let defaultDuration = 2; // seconds

// Usage tracker
const usageTracker = new UsageTracker();
await usageTracker.init();

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
const uploadBtn = document.getElementById('uploadBtn');
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

// Auto-increment elements
const autoIncrementCheckbox = document.getElementById('autoIncrement');
const durationInput = document.getElementById('durationSeconds');

let currentEditIndex = null;
let confirmCallback = null;

// Initialize time inputs with default values
function initializeTimeInputs() {
    startTimeInput.value = '00:00:01,000';
    endTimeInput.value = '00:00:03,000';
    lastEndTime = '00:00:01,000';
}

// Call initialization
initializeTimeInputs();

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
        const modeElement = document.getElementById(`${mode}Mode`);
        if (modeElement) {
            modeElement.classList.add('active');
        }
        
        // Update time inputs when switching to manual mode
        if (mode === 'manual') {
            updateTimeInputsFromLastSubtitle();
        }
    });
});

// Parse SRT from paste
parseBtn.addEventListener('click', () => {
    const text = pasteInput.value.trim();
    if (!text) {
        showToast('Please paste or upload SRT content first!', 'warning');
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
    
    // Update manual mode time inputs to continue from last subtitle
    updateTimeInputsFromLastSubtitle();
    
    // Scroll to subtitle list after a brief delay
    setTimeout(() => {
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 200);
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
    
    // Clear text input
    subtitleTextInput.value = '';
    
    // Auto-increment timestamps if enabled
    if (autoIncrementEnabled) {
        const duration = parseFloat(durationInput.value) || defaultDuration;
        const nextStart = end;
        const nextEnd = addSecondsToTime(end, duration);
        
        startTimeInput.value = nextStart;
        endTimeInput.value = nextEnd;
        lastEndTime = nextStart;
    }
    
    showToast('Subtitle added successfully!', 'success');
    
    // Scroll to subtitle list if first subtitle
    if (subtitles.length === 1) {
        setTimeout(() => {
            const editorSection = document.getElementById('editorSection');
            if (editorSection) {
                editorSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 200);
    }
});

// Helper function to add seconds to a time string
function addSecondsToTime(timeStr, seconds) {
    const ms = timeToMs(timeStr);
    const newMs = ms + (seconds * 1000);
    return msToTime(newMs);
}

// Update time inputs when switching to manual mode or when subtitles exist
function updateTimeInputsFromLastSubtitle() {
    if (subtitles.length > 0 && autoIncrementEnabled) {
        const lastSubtitle = subtitles[subtitles.length - 1];
        const duration = parseFloat(durationInput.value) || defaultDuration;
        const nextStart = lastSubtitle.end;
        const nextEnd = addSecondsToTime(nextStart, duration);
        
        startTimeInput.value = nextStart;
        endTimeInput.value = nextEnd;
        lastEndTime = nextStart;
    }
}

// Auto-increment checkbox handler
autoIncrementCheckbox.addEventListener('change', (e) => {
    autoIncrementEnabled = e.target.checked;
    durationInput.disabled = !autoIncrementEnabled;
    
    // Update time inputs when enabling auto-increment
    if (autoIncrementEnabled) {
        updateTimeInputsFromLastSubtitle();
    }
});

// Duration input handler
durationInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value > 0) {
        defaultDuration = value;
    }
});

// Time input manual change handler - disable auto-increment
startTimeInput.addEventListener('input', () => {
    if (autoIncrementEnabled && startTimeInput.value !== lastEndTime) {
        autoIncrementEnabled = false;
        autoIncrementCheckbox.checked = false;
        durationInput.disabled = true;
    }
});

endTimeInput.addEventListener('input', () => {
    if (autoIncrementEnabled) {
        autoIncrementEnabled = false;
        autoIncrementCheckbox.checked = false;
        durationInput.disabled = true;
    }
});

// Upload button - trigger file input
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// When file is selected, load content into textarea
fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const filename = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            pasteInput.value = event.target.result;
            showToast(`File "${filename}" loaded! Review and click "Parse & Load"`, 'success');
        };
        reader.onerror = () => {
            showToast('Error reading file. Please try again.', 'error');
        };
        reader.readAsText(file);
    }
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
    
    // Enable/disable tools based on subtitle count
    const hasSubtitles = subtitles.length > 0;
    const toolsHint = document.getElementById('toolsHint');
    
    // Toggle hint visibility
    if (hasSubtitles) {
        toolsHint.classList.add('hidden');
    } else {
        toolsHint.classList.remove('hidden');
    }
    
    // Enable/disable all tool inputs and buttons
    document.getElementById('outputFormat').disabled = !hasSubtitles;
    document.getElementById('convertBtn').disabled = !hasSubtitles;
    document.getElementById('shiftSeconds').disabled = !hasSubtitles;
    document.getElementById('shiftBtn').disabled = !hasSubtitles;
    document.getElementById('speedMultiplier').disabled = !hasSubtitles;
    document.getElementById('speedBtn').disabled = !hasSubtitles;
    document.getElementById('clearAllBtn').disabled = !hasSubtitles;
    document.getElementById('downloadBtn').disabled = !hasSubtitles;
    
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


// Format Conversion
document.getElementById('convertBtn').addEventListener('click', () => {
    const conversionsUsed = usageTracker.getConversionsToday();
    
    if (!isPro && conversionsUsed >= FREE_CONVERSION_LIMIT) {
        showToast('Daily conversion limit reached! Upgrade to Pro for unlimited conversions.', 'warning');
        return;
    }
    
    if (subtitles.length === 0) {
        showToast('No subtitles to convert!', 'warning');
        return;
    }
    
    const format = document.getElementById('outputFormat').value;
    let content = '';
    let filename = '';
    
    switch(format) {
        case 'srt':
            content = generateSRT();
            filename = 'subtitles.srt';
            break;
        case 'vtt':
            content = generateVTT();
            filename = 'subtitles.vtt';
            break;
        case 'ass':
            content = generateASS();
            filename = 'subtitles.ass';
            break;
        case 'sbv':
            content = generateSBV();
            filename = 'subtitles.sbv';
            break;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    if (!isPro) {
        usageTracker.incrementConversions();
        const newCount = usageTracker.getConversionsToday();
        document.getElementById('conversionUsage').textContent = 
            `Free: ${newCount}/${FREE_CONVERSION_LIMIT} conversions used today | Pro: Unlimited`;
    }
    
    showToast(`Converted to ${format.toUpperCase()} and downloaded!`, 'success');
});

// VTT Format
function generateVTT() {
    let vtt = 'WEBVTT\n\n';
    subtitles.forEach((sub, index) => {
        const start = sub.start.replace(',', '.');
        const end = sub.end.replace(',', '.');
        vtt += `${index + 1}\n${start} --> ${end}\n${sub.text}\n\n`;
    });
    return vtt;
}

// ASS Format
function generateASS() {
    let ass = '[Script Info]\nTitle: Subtitles\nScriptType: v4.00+\n\n';
    ass += '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    ass += 'Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1\n\n';
    ass += '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
    
    subtitles.forEach(sub => {
        const start = convertToASSTime(sub.start);
        const end = convertToASSTime(sub.end);
        ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${sub.text}\n`;
    });
    return ass;
}

function convertToASSTime(time) {
    // Convert 00:00:01,000 to 0:00:01.00
    return time.replace(',', '.').substring(0, 10);
}

// SBV Format (YouTube)
function generateSBV() {
    let sbv = '';
    subtitles.forEach(sub => {
        const start = sub.start.replace(',', '.');
        const end = sub.end.replace(',', '.');
        sbv += `${start},${end}\n${sub.text}\n\n`;
    });
    return sbv;
}

// Time Shift
document.getElementById('shiftBtn').addEventListener('click', () => {
    const syncsUsed = usageTracker.getSyncsToday();
    
    if (!isPro && syncsUsed >= FREE_SYNC_LIMIT) {
        showToast('Daily sync limit reached! Upgrade to Pro for unlimited operations.', 'warning');
        return;
    }
    
    if (subtitles.length === 0) {
        showToast('No subtitles to shift!', 'warning');
        return;
    }
    
    const shiftSeconds = parseFloat(document.getElementById('shiftSeconds').value);
    if (isNaN(shiftSeconds)) {
        showToast('Please enter a valid number!', 'warning');
        return;
    }
    
    subtitles = subtitles.map(sub => ({
        start: shiftTime(sub.start, shiftSeconds),
        end: shiftTime(sub.end, shiftSeconds),
        text: sub.text
    }));
    
    renderSubtitles();
    
    if (!isPro) {
        usageTracker.incrementSyncs();
        const newCount = usageTracker.getSyncsToday();
        document.getElementById('syncUsage').textContent = 
            `Free: ${newCount}/${FREE_SYNC_LIMIT} operations used today | Pro: Unlimited`;
    }
    
    showToast(`Shifted all subtitles by ${shiftSeconds} seconds!`, 'success');
    
    // Scroll to show updated subtitles
    setTimeout(() => {
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 300);
});

// Speed Adjustment
document.getElementById('speedBtn').addEventListener('click', () => {
    const syncsUsed = usageTracker.getSyncsToday();
    
    if (!isPro && syncsUsed >= FREE_SYNC_LIMIT) {
        showToast('Daily sync limit reached! Upgrade to Pro for unlimited operations.', 'warning');
        return;
    }
    
    if (subtitles.length === 0) {
        showToast('No subtitles to adjust!', 'warning');
        return;
    }
    
    const multiplier = parseFloat(document.getElementById('speedMultiplier').value);
    if (isNaN(multiplier) || multiplier <= 0) {
        showToast('Please enter a valid multiplier!', 'warning');
        return;
    }
    
    subtitles = subtitles.map(sub => ({
        start: multiplyTime(sub.start, multiplier),
        end: multiplyTime(sub.end, multiplier),
        text: sub.text
    }));
    
    renderSubtitles();
    
    if (!isPro) {
        usageTracker.incrementSyncs();
        const newCount = usageTracker.getSyncsToday();
        document.getElementById('syncUsage').textContent = 
            `Free: ${newCount}/${FREE_SYNC_LIMIT} operations used today | Pro: Unlimited`;
    }
    
    showToast(`Adjusted speed by ${multiplier}x!`, 'success');
    
    // Scroll to show updated subtitles
    setTimeout(() => {
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 300);
});

// Time manipulation functions
function shiftTime(timeStr, seconds) {
    const ms = timeToMs(timeStr);
    const newMs = Math.max(0, ms + (seconds * 1000));
    return msToTime(newMs);
}

function multiplyTime(timeStr, multiplier) {
    const ms = timeToMs(timeStr);
    const newMs = ms * multiplier;
    return msToTime(newMs);
}

function timeToMs(timeStr) {
    // 00:00:01,000 -> milliseconds
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const secParts = parts[2].split(',');
    const seconds = parseInt(secParts[0]);
    const ms = parseInt(secParts[1]);
    
    return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + ms;
}

function msToTime(ms) {
    const hours = Math.floor(ms / 3600000);
    ms %= 3600000;
    const minutes = Math.floor(ms / 60000);
    ms %= 60000;
    const seconds = Math.floor(ms / 1000);
    ms %= 1000;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}
