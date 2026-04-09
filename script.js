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
            // If already open, just bring it to front
            this.focusWindow(document.getElementById(id));
            return;
        }

        const desktop = document.getElementById('desktop');
        
        const win = document.createElement('div');
        win.className = 'os-window glass-panel';
        win.id = id;
        
        let appContent = `<p>Welcome to ${title}. App content goes here!</p>`;

        // App-specific HTML injection
        if (id === 'app-terminal') {
            appContent = `
                <div class="terminal-container" id="terminal-wrapper" onclick="document.getElementById('term-input').focus()">
                    <div id="terminal-output">
                        <div>Welcome to LuminaOS Terminal v1.0.0</div>
                        <div>Type 'help' for a list of available commands.</div>
                    </div>
                    <div class="terminal-input-line">
                        <span class="prompt">guest@lumina:~$</span>
                        <input type="text" id="term-input" autocomplete="off" spellcheck="false">
                    </div>
                </div>
            `;
        }

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="control-btn btn-min" onclick="WindowManager.toggleMin('${id}')"></button>
                    <button class="control-btn btn-max" onclick="WindowManager.toggleMax('${id}')"></button>
                    <button class="control-btn btn-close" onclick="document.getElementById('${id}').remove()"></button>
                </div>
            </div>
            <div class="window-content" style="padding: 0;"> <!-- Remove padding for full-bleed apps -->
                ${appContent}
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

        // Initialize specific app logic
        if (id === 'app-terminal') {
            this.initTerminal();
            // Auto focus the input when spawned
            setTimeout(() => document.getElementById('term-input').focus(), 100);
        }
    },

    initTerminal: function() {
        const input = document.getElementById('term-input');
        const output = document.getElementById('terminal-output');
        const wrapper = document.getElementById('terminal-wrapper');

        if (!input) return;

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = input.value.trim().toLowerCase();
                
                // Echo the prompt + command
                const echo = document.createElement('div');
                echo.innerHTML = `<span class="prompt">guest@lumina:~$</span> ${input.value}`;
                output.appendChild(echo);

                // Handle commands
                const response = document.createElement('div');
                if (command === 'help') {
                    response.innerHTML = `Available commands:<br>- whoami: Print user information<br>- skills: List technical stack<br>- projects: View portfolio<br>- clear: Clear the terminal screen`;
                } else if (command === 'whoami') {
                    response.innerHTML = `Guest User. Aspiring Developer. Hacker.`;
                } else if (command === 'skills') {
                    response.innerHTML = `HTML5, CSS3, JavaScript (ES6+), WebOS Architecture.`;
                } else if (command === 'projects') {
                    response.innerHTML = `1. LuminaOS - A web-based operating system.<br>2. Astrodestroyer - A retro arcade game.`;
                } else if (command === 'clear') {
                    output.innerHTML = '';
                    response.innerHTML = ''; // Don't print anything
                } else if (command === '') {
                    response.innerHTML = '';
                } else {
                    response.innerHTML = `Command not found: ${command}. Type 'help' for a list of commands.`;
                }

                if (response.innerHTML !== '') {
                    output.appendChild(response);
                }

                // Scroll to bottom
                wrapper.scrollTop = wrapper.scrollHeight;
                
                // Clear input
                input.value = '';
            }
        });
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
