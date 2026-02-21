// Ethical Device Fingerprinting
// Uses only browser-provided information, no tracking or privacy invasion

async function generateDeviceFingerprint() {
    const components = [];
    
    // Screen properties
    components.push(screen.width);
    components.push(screen.height);
    components.push(screen.colorDepth);
    
    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Language
    components.push(navigator.language);
    
    // Platform
    components.push(navigator.platform);
    
    // Hardware concurrency (CPU cores)
    components.push(navigator.hardwareConcurrency || 0);
    
    // Device memory (if available)
    components.push(navigator.deviceMemory || 0);
    
    // User agent
    components.push(navigator.userAgent);
    
    // Canvas fingerprint (most unique part)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('SRT Editor Pro', 2, 2);
    
    const canvasData = canvas.toDataURL();
    components.push(canvasData);
    
    // Combine all components
    const fingerprint = components.join('|');
    
    // Generate hash
    const hash = await hashString(fingerprint);
    return hash;
}

// Simple hash function
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Get or create device ID
async function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
        deviceId = await generateDeviceFingerprint();
        localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
}

// Usage tracking with device ID
class UsageTracker {
    constructor() {
        this.storageKey = 'usageData';
    }
    
    async init() {
        this.deviceId = await getDeviceId();
        this.loadUsage();
    }
    
    loadUsage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {};
        }
        
        // Clean old data (older than 7 days)
        this.cleanOldData();
    }
    
    saveUsage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    cleanOldData() {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        for (const deviceId in this.data) {
            if (this.data[deviceId].lastUsed < sevenDaysAgo) {
                delete this.data[deviceId];
            }
        }
        this.saveUsage();
    }
    
    getTodayKey() {
        return new Date().toDateString();
    }
    
    getDeviceData() {
        if (!this.data[this.deviceId]) {
            this.data[this.deviceId] = {
                conversions: {},
                syncs: {},
                lastUsed: Date.now()
            };
        }
        return this.data[this.deviceId];
    }
    
    getConversionsToday() {
        const deviceData = this.getDeviceData();
        const today = this.getTodayKey();
        return deviceData.conversions[today] || 0;
    }
    
    getSyncsToday() {
        const deviceData = this.getDeviceData();
        const today = this.getTodayKey();
        return deviceData.syncs[today] || 0;
    }
    
    incrementConversions() {
        const deviceData = this.getDeviceData();
        const today = this.getTodayKey();
        deviceData.conversions[today] = (deviceData.conversions[today] || 0) + 1;
        deviceData.lastUsed = Date.now();
        this.saveUsage();
    }
    
    incrementSyncs() {
        const deviceData = this.getDeviceData();
        const today = this.getTodayKey();
        deviceData.syncs[today] = (deviceData.syncs[today] || 0) + 1;
        deviceData.lastUsed = Date.now();
        this.saveUsage();
    }
    
    reset() {
        // For testing purposes
        delete this.data[this.deviceId];
        this.saveUsage();
    }
}

export { getDeviceId, UsageTracker };
