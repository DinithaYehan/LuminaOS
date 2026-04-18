// ===== Settings App Module =====
// Self-registers with WindowManager

const SettingsApp = {
    // Default settings
    defaults: {
        username: 'Guest User',
        accentColor: '#2b6cb0',
        wallpaper: 'default',
        darkMode: false,
        fontSize: 'medium',
        animations: true
    },

    // Wallpaper presets: { id: { name, gradient, blob1, blob2, blob3, bgDark } }
    wallpapers: {
        'default': {
            name: 'Ocean Breeze',
            gradient: 'linear-gradient(135deg, #bed3e0 0%, #a4c3d8 50%, #e0ebf2 100%)',
            blob1: 'rgba(43, 108, 176, 0.4)',
            blob2: 'rgba(144, 203, 251, 0.6)',
            blob3: 'rgba(255, 255, 255, 0.5)',
            bgDark: '#bed3e0',
            preview: 'linear-gradient(135deg, #bed3e0, #a4c3d8, #e0ebf2)'
        },
        'sunset': {
            name: 'Sunset Glow',
            gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a18cd1 50%, #fad0c4 100%)',
            blob1: 'rgba(161, 140, 209, 0.5)',
            blob2: 'rgba(251, 194, 235, 0.5)',
            blob3: 'rgba(250, 208, 196, 0.4)',
            bgDark: '#e8c8e0',
            preview: 'linear-gradient(135deg, #fbc2eb, #a18cd1, #fad0c4)'
        },
        'forest': {
            name: 'Forest Canopy',
            gradient: 'linear-gradient(135deg, #a8e6cf 0%, #88d8a8 50%, #dcedc1 100%)',
            blob1: 'rgba(34, 139, 34, 0.35)',
            blob2: 'rgba(168, 230, 207, 0.5)',
            blob3: 'rgba(220, 237, 193, 0.5)',
            bgDark: '#b5d8c0',
            preview: 'linear-gradient(135deg, #a8e6cf, #88d8a8, #dcedc1)'
        },
        'midnight': {
            name: 'Midnight',
            gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            blob1: 'rgba(48, 43, 99, 0.6)',
            blob2: 'rgba(72, 52, 150, 0.4)',
            blob3: 'rgba(36, 36, 62, 0.5)',
            bgDark: '#1a1730',
            preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            isDark: true
        },
        'cherry': {
            name: 'Cherry Blossom',
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
            blob1: 'rgba(252, 182, 159, 0.5)',
            blob2: 'rgba(255, 154, 158, 0.4)',
            blob3: 'rgba(255, 236, 210, 0.5)',
            bgDark: '#f0d5c5',
            preview: 'linear-gradient(135deg, #ffecd2, #fcb69f, #ff9a9e)'
        },
        'arctic': {
            name: 'Arctic Frost',
            gradient: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #e8f0fe 100%)',
            blob1: 'rgba(100, 150, 230, 0.3)',
            blob2: 'rgba(207, 222, 243, 0.5)',
            blob3: 'rgba(255, 255, 255, 0.6)',
            bgDark: '#d5e0f0',
            preview: 'linear-gradient(135deg, #e0eafc, #cfdef3, #e8f0fe)'
        },
        'aurora': {
            name: 'Aurora',
            gradient: 'linear-gradient(135deg, #0b1a2e 0%, #132a46 50%, #0d2137 100%)',
            blob1: 'rgba(0, 200, 150, 0.35)',
            blob2: 'rgba(80, 120, 255, 0.3)',
            blob3: 'rgba(150, 50, 255, 0.25)',
            bgDark: '#0f1f33',
            preview: 'linear-gradient(135deg, #0b1a2e, #132a46, #0d2137)',
            isDark: true
        },
        'lavender': {
            name: 'Lavender Dream',
            gradient: 'linear-gradient(135deg, #e6e0f3 0%, #d4c5ed 50%, #ece7f5 100%)',
            blob1: 'rgba(140, 100, 200, 0.35)',
            blob2: 'rgba(212, 197, 237, 0.5)',
            blob3: 'rgba(255, 255, 255, 0.5)',
            bgDark: '#ddd5ec',
            preview: 'linear-gradient(135deg, #e6e0f3, #d4c5ed, #ece7f5)'
        }
    },

    // Accent color presets
    accentPresets: [
        { name: 'Royal Blue', color: '#2b6cb0' },
        { name: 'Emerald', color: '#059669' },
        { name: 'Violet', color: '#7c3aed' },
        { name: 'Rose', color: '#e11d48' },
        { name: 'Amber', color: '#d97706' },
        { name: 'Teal', color: '#0d9488' },
        { name: 'Indigo', color: '#4f46e5' },
        { name: 'Pink', color: '#db2777' }
    ],

    currentSection: 'appearance',

    // ===== Load & Save =====
    load: function() {
        const saved = localStorage.getItem('luminaos-settings');
        if (saved) {
            try {
                return { ...this.defaults, ...JSON.parse(saved) };
            } catch(e) { /* fall through */ }
        }
        return { ...this.defaults };
    },

    save: function(settings) {
        localStorage.setItem('luminaos-settings', JSON.stringify(settings));
    },

    get: function(key) {
        return this.load()[key];
    },

    set: function(key, value) {
        const settings = this.load();
        settings[key] = value;
        this.save(settings);
    },

    // ===== Apply Settings to OS =====
    applyAll: function() {
        const s = this.load();
        this.applyWallpaper(s.wallpaper);
        this.applyAccent(s.accentColor);
        this.applyDarkMode(s.darkMode);
        this.applyUsername(s.username);
        this.applyAnimations(s.animations);
    },

    applyWallpaper: function(id) {
        const wp = this.wallpapers[id];
        if (!wp) return;

        const bg = document.querySelector('.dynamic-background');
        const blob1 = document.querySelector('.shape-1');
        const blob2 = document.querySelector('.shape-2');
        const blob3 = document.querySelector('.shape-3');

        if (bg) bg.style.background = wp.gradient;
        if (blob1) blob1.style.background = wp.blob1;
        if (blob2) blob2.style.background = wp.blob2;
        if (blob3) blob3.style.background = wp.blob3;

        document.documentElement.style.setProperty('--bg-dark', wp.bgDark);

        // Auto-switch text color for dark wallpapers
        if (wp.isDark) {
            document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
        } else {
            const s = this.load();
            if (!s.darkMode) {
                document.documentElement.style.setProperty('--text-primary', '#1e293b');
            }
        }
    },

    applyAccent: function(color) {
        document.documentElement.style.setProperty('--accent-color', color);

        // Update all elements that use the hardcoded #2b6cb0
        const style = document.getElementById('settings-dynamic-style') || document.createElement('style');
        style.id = 'settings-dynamic-style';
        style.textContent = `
            .primary-btn { background: ${color} !important; box-shadow: 0 4px 15px ${color}55 !important; }
            .primary-btn:hover { background: ${this.darkenColor(color, 20)} !important; box-shadow: 0 6px 20px ${color}88 !important; }
            .loading-bar { background: ${color} !important; }
            .calc-btn.equal-btn { background-color: ${color} !important; }
            .calc-btn.equal-btn:hover { background-color: ${this.darkenColor(color, 20)} !important; }
            .calc-btn.op-btn { background-color: ${color}33 !important; }
            .calc-btn.op-btn:hover { background-color: ${color}66 !important; }
            .taskbar-app-entry.taskbar-active::after { background: ${color} !important; }
            .fm-editor-save { background: ${color} !important; }
            .fm-editor-save:hover { background: ${this.darkenColor(color, 20)} !important; }
        `;
        if (!document.getElementById('settings-dynamic-style')) {
            document.head.appendChild(style);
        }
    },

    applyDarkMode: function(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            // Only set dark text if wallpaper isn't already a dark wallpaper
            const wp = this.wallpapers[this.get('wallpaper')];
            if (!wp || !wp.isDark) {
                document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
            }
        } else {
            document.body.classList.remove('dark-mode');
            const wp = this.wallpapers[this.get('wallpaper')];
            if (!wp || !wp.isDark) {
                document.documentElement.style.setProperty('--text-primary', '#1e293b');
            }
        }
    },

    applyUsername: function(name) {
        // Update login screen
        const loginLabel = document.querySelector('.login-panel h2');
        if (loginLabel) loginLabel.innerText = name;

        // Update avatar
        const avatar = document.querySelector('.avatar');
        if (avatar) {
            avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=100`;
        }
    },

    applyAnimations: function(enabled) {
        if (!enabled) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    },

    // ===== Color Utilities =====
    darkenColor: function(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
        const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
        const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
        return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    },

    // ===== Render =====
    render: function() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        // Update sidebar active
        document.querySelectorAll('.st-sidebar-item').forEach(el => {
            el.classList.toggle('st-sidebar-active', el.dataset.section === this.currentSection);
        });

        const s = this.load();

        switch(this.currentSection) {
            case 'appearance': container.innerHTML = this.renderAppearance(s); break;
            case 'wallpaper': container.innerHTML = this.renderWallpaper(s); break;
            case 'profile': container.innerHTML = this.renderProfile(s); break;
            case 'about': container.innerHTML = this.renderAbout(s); break;
            default: container.innerHTML = this.renderAppearance(s);
        }
    },

    renderAppearance: function(s) {
        const accentSwatches = this.accentPresets.map(p => `
            <div class="st-swatch ${s.accentColor === p.color ? 'st-swatch-active' : ''}"
                 style="background: ${p.color};"
                 title="${p.name}"
                 onclick="SettingsApp.changeAccent('${p.color}')">
                ${s.accentColor === p.color ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
        `).join('');

        return `
            <div class="st-section">
                <h3 class="st-section-title">Accent Color</h3>
                <p class="st-section-desc">Choose a color that appears across buttons, highlights, and UI elements.</p>
                <div class="st-swatch-grid">
                    ${accentSwatches}
                </div>
                <div class="st-row" style="margin-top: 0.75rem;">
                    <label class="st-label">Custom Color</label>
                    <input type="color" class="st-color-input" value="${s.accentColor}" 
                           onchange="SettingsApp.changeAccent(this.value)">
                </div>
            </div>

            <div class="st-section">
                <h3 class="st-section-title">Mode</h3>
                <div class="st-toggle-row">
                    <div class="st-toggle-info">
                        <span class="st-label">Dark Mode</span>
                        <span class="st-sublabel">Darken glass panels and overlays</span>
                    </div>
                    <label class="st-toggle">
                        <input type="checkbox" ${s.darkMode ? 'checked' : ''} onchange="SettingsApp.toggleDarkMode(this.checked)">
                        <span class="st-toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div class="st-section">
                <h3 class="st-section-title">Accessibility</h3>
                <div class="st-toggle-row">
                    <div class="st-toggle-info">
                        <span class="st-label">Animations</span>
                        <span class="st-sublabel">Enable smooth transitions and motion effects</span>
                    </div>
                    <label class="st-toggle">
                        <input type="checkbox" ${s.animations ? 'checked' : ''} onchange="SettingsApp.toggleAnimations(this.checked)">
                        <span class="st-toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
    },

    renderWallpaper: function(s) {
        const cards = Object.entries(this.wallpapers).map(([id, wp]) => `
            <div class="st-wp-card ${s.wallpaper === id ? 'st-wp-active' : ''}" 
                 onclick="SettingsApp.changeWallpaper('${id}')">
                <div class="st-wp-preview" style="background: ${wp.preview};"></div>
                <div class="st-wp-name">${wp.name}</div>
                ${s.wallpaper === id ? '<div class="st-wp-check">✓</div>' : ''}
            </div>
        `).join('');

        return `
            <div class="st-section">
                <h3 class="st-section-title">Wallpaper</h3>
                <p class="st-section-desc">Select a background theme for your desktop.</p>
                <div class="st-wp-grid">
                    ${cards}
                </div>
            </div>
        `;
    },

    renderProfile: function(s) {
        return `
            <div class="st-section">
                <div class="st-profile-header">
                    <img class="st-profile-avatar" 
                         src="https://ui-avatars.com/api/?name=${encodeURIComponent(s.username)}&background=random&size=120"
                         alt="Avatar">
                    <div class="st-profile-info">
                        <h3 class="st-profile-name">${s.username}</h3>
                        <span class="st-profile-role">Administrator</span>
                    </div>
                </div>
            </div>

            <div class="st-section">
                <h3 class="st-section-title">Display Name</h3>
                <p class="st-section-desc">This name appears on the login screen and across the OS.</p>
                <div class="st-input-row">
                    <input type="text" class="st-text-input" id="st-username-input" 
                           value="${s.username}" placeholder="Enter your name" maxlength="24">
                    <button class="st-btn-primary" onclick="SettingsApp.changeUsername()">Save</button>
                </div>
            </div>
        `;
    },

    renderAbout: function() {
        const uptime = this.getUptime();
        return `
            <div class="st-section">
                <div class="st-about-banner">
                    <h2 class="st-about-logo">LuminaOS</h2>
                    <span class="st-about-version">Version 1.0.0</span>
                </div>
            </div>

            <div class="st-section">
                <h3 class="st-section-title">System Information</h3>
                <div class="st-info-grid">
                    <div class="st-info-item">
                        <span class="st-info-label">Platform</span>
                        <span class="st-info-value">Web Browser</span>
                    </div>
                    <div class="st-info-item">
                        <span class="st-info-label">Engine</span>
                        <span class="st-info-value">${this.getBrowserInfo()}</span>
                    </div>
                    <div class="st-info-item">
                        <span class="st-info-label">Resolution</span>
                        <span class="st-info-value">${window.innerWidth} × ${window.innerHeight}</span>
                    </div>
                    <div class="st-info-item">
                        <span class="st-info-label">Session Uptime</span>
                        <span class="st-info-value">${uptime}</span>
                    </div>
                    <div class="st-info-item">
                        <span class="st-info-label">Stack</span>
                        <span class="st-info-value">HTML · CSS · JavaScript</span>
                    </div>
                    <div class="st-info-item">
                        <span class="st-info-label">Storage Used</span>
                        <span class="st-info-value">${this.getStorageUsed()}</span>
                    </div>
                </div>
            </div>

            <div class="st-section">
                <h3 class="st-section-title">Danger Zone</h3>
                <p class="st-section-desc">Reset all settings and data to factory defaults.</p>
                <button class="st-btn-danger" onclick="SettingsApp.factoryReset()">Factory Reset</button>
            </div>
        `;
    },

    // ===== Actions =====
    switchSection: function(section) {
        this.currentSection = section;
        this.render();
    },

    changeAccent: function(color) {
        this.set('accentColor', color);
        this.applyAccent(color);
        this.render();
    },

    changeWallpaper: function(id) {
        this.set('wallpaper', id);
        this.applyWallpaper(id);

        // Auto-enable dark mode for dark wallpapers
        const wp = this.wallpapers[id];
        if (wp && wp.isDark) {
            this.set('darkMode', true);
            this.applyDarkMode(true);
        }

        this.render();
    },

    toggleDarkMode: function(enabled) {
        this.set('darkMode', enabled);
        this.applyDarkMode(enabled);
    },

    toggleAnimations: function(enabled) {
        this.set('animations', enabled);
        this.applyAnimations(enabled);
    },

    changeUsername: function() {
        const input = document.getElementById('st-username-input');
        if (!input) return;
        const name = input.value.trim();
        if (name.length === 0) return;

        this.set('username', name);
        this.applyUsername(name);
        this.render();
    },

    factoryReset: function() {
        if (!confirm('This will erase ALL settings and file system data. Are you sure?')) return;
        if (!confirm('This action cannot be undone. Proceed?')) return;

        localStorage.removeItem('luminaos-settings');
        localStorage.removeItem('luminaos-fs');
        location.reload();
    },

    // ===== Helpers =====
    getBrowserInfo: function() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chromium';
        if (ua.includes('Firefox')) return 'Gecko';
        if (ua.includes('Safari')) return 'WebKit';
        return 'Unknown';
    },

    getUptime: function() {
        if (!this._bootTime) return '0m';
        const diff = Date.now() - this._bootTime;
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        if (hrs > 0) return `${hrs}h ${mins % 60}m`;
        return `${mins}m`;
    },

    getStorageUsed: function() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage.getItem(key).length * 2; // UTF-16
            }
        }
        if (total < 1024) return total + ' B';
        return (total / 1024).toFixed(1) + ' KB';
    },

    // ===== Content & Init for WindowManager =====
    getContent: function() {
        return `
            <div class="st-container">
                <div class="st-sidebar">
                    <div class="st-sidebar-title">Settings</div>
                    <div class="st-sidebar-item st-sidebar-active" data-section="appearance"
                         onclick="SettingsApp.switchSection('appearance')">
                        <span>🎨</span><span>Appearance</span>
                    </div>
                    <div class="st-sidebar-item" data-section="wallpaper"
                         onclick="SettingsApp.switchSection('wallpaper')">
                        <span>🖼️</span><span>Wallpaper</span>
                    </div>
                    <div class="st-sidebar-item" data-section="profile"
                         onclick="SettingsApp.switchSection('profile')">
                        <span>👤</span><span>Profile</span>
                    </div>
                    <div class="st-sidebar-item" data-section="about"
                         onclick="SettingsApp.switchSection('about')">
                        <span>ℹ️</span><span>About</span>
                    </div>
                </div>
                <div class="st-main" id="settings-content">
                    <!-- Rendered by JS -->
                </div>
            </div>
        `;
    },

    init: function() {
        if (!this._bootTime) this._bootTime = Date.now();
        this.currentSection = 'appearance';
        this.render();
    }
};

// Apply saved settings immediately on script load (before window opens)
document.addEventListener('DOMContentLoaded', () => {
    SettingsApp._bootTime = Date.now();
    SettingsApp.applyAll();
});

// Register with WindowManager
WindowManager.registerApp('app-settings', {
    content: () => SettingsApp.getContent(),
    init: () => SettingsApp.init(),
    emoji: '⚙️',
    width: '620px',
    height: '480px'
});
