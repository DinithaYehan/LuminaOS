document.addEventListener('DOMContentLoaded', () => {
    console.log("LuminaOS boot sequence initiated.");
    initBootSequence();
    initClock();
});

function initBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const loadingBar = document.querySelector('.loading-bar');
    const bootText = document.getElementById('boot-text');

    let progress = 0;
    const bootLogs = [
        "Initializing core parameters...",
        "Validating graphics drivers...",
        "Mounting virtual filesystem...",
        "Fetching user preferences...",
        "Starting visual interface..."
    ];
    let logIndex = 0;

    // Simulate boot parsing
    const bootInterval = setInterval(() => {
        // Randomly jump progress to look 'real'
        progress += Math.random() * 12;
        if (progress > 100) progress = 100;
        
        loadingBar.style.width = `${progress}%`;

        // Update the log text at certain progress markers
        if (progress > 20 && logIndex === 0) { logIndex++; bootText.innerText = bootLogs[logIndex]; }
        if (progress > 45 && logIndex === 1) { logIndex++; bootText.innerText = bootLogs[logIndex]; }
        if (progress > 75 && logIndex === 2) { logIndex++; bootText.innerText = bootLogs[logIndex]; }
        if (progress >= 90 && logIndex === 3) { logIndex++; bootText.innerText = bootLogs[logIndex]; }

        if (progress >= 100) {
            clearInterval(bootInterval);
            bootText.innerText = "Welcome to LuminaOS.";
            
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                
                // Show login screen
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.classList.remove('hidden');
                }
            }, 800);
        }
    }, 400); 

    // Setup Login Button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.getElementById('login-screen').classList.add('hidden');
            
            // Reveal Desktop!
            const desktop = document.getElementById('desktop');
            if (desktop) {
                desktop.classList.remove('hidden');
            }
        });
    }
}

function initClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;
    
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        clockElement.innerText = `${hours}:${minutes} ${ampm}`;
    }
    
    
    updateTime();
    setInterval(updateTime, 60000); 
}

// ===== Window Manager Core =====
const WindowManager = {
    highestZIndex: 100,

    createWindow: function(title, id) {
        if (document.getElementById(id)) {
            this.focusWindow(document.getElementById(id));
            return;
        }

        const desktop = document.getElementById('desktop');
        
        const win = document.createElement('div');
        win.className = 'os-window glass-panel';
        win.id = id;
        
        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="control-btn btn-min" onclick="WindowManager.toggleMin('${id}')"></button>
                    <button class="control-btn btn-max" onclick="WindowManager.toggleMax('${id}')"></button>
                    <button class="control-btn btn-close" onclick="document.getElementById('${id}').remove()"></button>
                </div>
            </div>
            <div class="window-content">
                <p>Welcome to ${title}. App content goes here!</p>
            </div>
        `;
        
        const offset = Math.floor(Math.random() * 40);
        win.style.top = `${10 + offset}%`;
        win.style.left = `${10 + offset}%`;

        desktop.appendChild(win);
        
        // Initialize behavior
        this.makeDraggable(win);
        this.focusWindow(win);

        // Add click-to-focus
        win.addEventListener('mousedown', () => this.focusWindow(win));
    },

    focusWindow: function(win) {
        this.highestZIndex += 1;
        win.style.zIndex = this.highestZIndex;
    },

    toggleMax: function(id) {
        const win = document.getElementById(id);
        win.classList.toggle('window-maximized');
    },

    toggleMin: function(id) {
        const win = document.getElementById(id);
        win.classList.toggle('window-minimized');
    },

    makeDraggable: function(win) {
        const header = win.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (win.classList.contains('window-maximized')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = win.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            header.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            win.style.left = `${initialX + dx}px`;
            win.style.top = `${initialY + dy}px`;
            
            win.style.transform = 'none'; 
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move';
            }
        });
    }
};
