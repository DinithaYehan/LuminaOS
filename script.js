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
        hours = hours ? hours : 12; // '0' becomes '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        clockElement.innerText = `${hours}:${minutes} ${ampm}`;
    }
    
    // Set immediate time, then tick every minute
    updateTime();
    setInterval(updateTime, 60000); 
}

// ===== Window Manager Core =====
const WindowManager = {
    createWindow: function(title, id) {
        if (document.getElementById(id)) return;

        const desktop = document.getElementById('desktop');
        
        const win = document.createElement('div');
        win.className = 'os-window glass-panel';
        win.id = id;
        
        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="control-btn btn-min"></button>
                    <button class="control-btn btn-max"></button>
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
    }
};
