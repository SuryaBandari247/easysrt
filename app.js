// App State
let subtitles = [];
let isPro = false;
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
        alert('Please paste SRT content first!');
        return;
    }
    
    const parsed = parseSRT(text);
    if (parsed.length === 0) {
        alert('Could not parse SRT content. Please check the format.');
        return;
    }
    
    subtitles = parsed;
    renderSubtitles();
    pasteInput.value = '';
});

// Add manual subtitle
addSlotBtn.addEventListener('click', () => {
    const start = startTimeInput.value.trim();
    const end = endTimeInput.value.trim();
    const text = subtitleTextInput.value.trim();
    
    if (!start || !end || !text) {
        alert('Please fill in all fields!');
        return;
    }
    
    if (!isPro && subtitles.length >= FREE_LIMIT) {
        showLimitNotice();
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
});

// Load file
loadFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const parsed = parseSRT(content);
        
        if (parsed.length === 0) {
            alert('Could not parse SRT file.');
            return;
        }
        
        subtitles = parsed;
        renderSubtitles();
        fileInput.value = '';
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
    const sub = subtitles[index];
    const newStart = prompt('Start time:', sub.start);
    const newEnd = prompt('End time:', sub.end);
    const newText = prompt('Text:', sub.text);
    
    if (newStart && newEnd && newText) {
        subtitles[index] = {
            start: newStart,
            end: newEnd,
            text: newText
        };
        renderSubtitles();
    }
};

// Delete subtitle
window.deleteSubtitle = function(index) {
    if (confirm('Delete this subtitle?')) {
        subtitles.splice(index, 1);
        renderSubtitles();
    }
};

// Download SRT
downloadBtn.addEventListener('click', () => {
    if (subtitles.length === 0) {
        alert('No subtitles to download!');
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
});

// Generate SRT content
function generateSRT() {
    return subtitles.map((sub, index) => {
        return `${index + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`;
    }).join('\n');
}

// Clear all
clearAllBtn.addEventListener('click', () => {
    if (confirm('Clear all subtitles?')) {
        subtitles = [];
        renderSubtitles();
    }
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

// Checkout button (integrate with payment processor)
document.querySelector('.checkout-btn').addEventListener('click', () => {
    // Replace with your Stripe payment link
    window.location.href = 'https://buy.stripe.com/YOUR_PAYMENT_LINK_HERE';
});
