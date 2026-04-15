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
    highestZIndex: 100,
    // Track open windows: { id: { title, emoji, isMinimized, isMaximized, preMaxRect } }
    openWindows: {},

    // Map app IDs to emojis for taskbar display
    appEmojis: {
        'app-terminal': '💻',
        'app-calc': '🧮'
    },

    createWindow: function(title, id) {
        if (document.getElementById(id)) {
            // If already open, restore if minimized, or just focus
            if (this.openWindows[id] && this.openWindows[id].isMinimized) {
                this.restoreWindow(id);
            } else {
                this.focusWindow(document.getElementById(id));
            }
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
        } else if (id === 'app-calc') {
            appContent = `
                <div class="calc-container">
                    <div class="calc-screen">
                        <div class="calc-prev" id="calc-prev"></div>
                        <div class="calc-current" id="calc-current">0</div>
                    </div>
                    <div class="calc-grid">
                        <button class="calc-btn op-btn calc-span-2" onclick="WindowManager.calcClear()">AC</button>
                        <button class="calc-btn op-btn" onclick="WindowManager.calcDel()">DEL</button>
                        <button class="calc-btn op-btn" onclick="WindowManager.calcOp('/')">÷</button>
                        
                        <button class="calc-btn" onclick="WindowManager.calcNum('7')">7</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('8')">8</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('9')">9</button>
                        <button class="calc-btn op-btn" onclick="WindowManager.calcOp('*')">×</button>
                        
                        <button class="calc-btn" onclick="WindowManager.calcNum('4')">4</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('5')">5</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('6')">6</button>
                        <button class="calc-btn op-btn" onclick="WindowManager.calcOp('-')">-</button>
                        
                        <button class="calc-btn" onclick="WindowManager.calcNum('1')">1</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('2')">2</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('3')">3</button>
                        <button class="calc-btn op-btn" onclick="WindowManager.calcOp('+')">+</button>
                        
                        <button class="calc-btn calc-span-2" onclick="WindowManager.calcNum('0')">0</button>
                        <button class="calc-btn" onclick="WindowManager.calcNum('.')">.</button>
                        <button class="calc-btn equal-btn" onclick="WindowManager.calcEqual()">=</button>
                    </div>
                </div>
            `;
        }

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <button class="control-btn btn-min" onclick="WindowManager.minimizeWindow('${id}')"></button>
                    <button class="control-btn btn-max" onclick="WindowManager.toggleMax('${id}')"></button>
                    <button class="control-btn btn-close" onclick="WindowManager.closeWindow('${id}')"></button>
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
        
        // Register window in tracker
        this.openWindows[id] = {
            title: title,
            emoji: this.appEmojis[id] || '📄',
            isMinimized: false,
            isMaximized: false,
            preMaxRect: null // stores { top, left, width, height } before maximize
        };

        // Initialize behavior
        this.makeDraggable(win);
        this.focusWindow(win);

        // Add click-to-focus
        win.addEventListener('mousedown', () => this.focusWindow(win));

        // Add taskbar entry
        this.addTaskbarEntry(id, title);

        // Initialize specific app logic
        if (id === 'app-terminal') {
            this.initTerminal();
            // Auto focus the input when spawned
            setTimeout(() => document.getElementById('term-input').focus(), 100);
        } else if (id === 'app-calc') {
            this.calcCurrent = '0';
            this.calcPrevious = '';
            this.calcOperation = undefined;
        }
    },

    // ===== Calculator Logic =====
    calcCurrent: '0',
    calcPrevious: '',
    calcOperation: undefined,

    updateCalcDisplay: function() {
        const curEl = document.getElementById('calc-current');
        const prevEl = document.getElementById('calc-prev');
        if (curEl) curEl.innerText = this.calcCurrent;
        if (prevEl) {
            if (this.calcOperation != null) {
                prevEl.innerText = `${this.calcPrevious} ${this.calcOperation}`;
            } else {
                prevEl.innerText = '';
            }
        }
    },

    calcNum: function(num) {
        if (num === '.' && this.calcCurrent.includes('.')) return;
        if (this.calcCurrent === '0' && num !== '.') {
            this.calcCurrent = num;
        } else {
            this.calcCurrent = this.calcCurrent.toString() + num.toString();
        }
        this.updateCalcDisplay();
    },

    calcOp: function(op) {
        if (this.calcCurrent === '') return;
        if (this.calcPrevious !== '') {
            this.calcEqual();
        }
        this.calcOperation = op;
        this.calcPrevious = this.calcCurrent;
        this.calcCurrent = '';
        this.updateCalcDisplay();
    },

    calcEqual: function() {
        let computation;
        const prev = parseFloat(this.calcPrevious);
        const current = parseFloat(this.calcCurrent);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.calcOperation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': computation = prev / current; break;
            default: return;
        }
        
        this.calcCurrent = computation.toString();
        this.calcOperation = undefined;
        this.calcPrevious = '';
        this.updateCalcDisplay();
    },

    calcClear: function() {
        this.calcCurrent = '0';
        this.calcPrevious = '';
        this.calcOperation = undefined;
        this.updateCalcDisplay();
    },

    calcDel: function() {
        if (this.calcCurrent === '0' || this.calcCurrent === '') return;
        this.calcCurrent = this.calcCurrent.toString().slice(0, -1);
        if (this.calcCurrent === '') this.calcCurrent = '0';
        this.updateCalcDisplay();
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

    // ===== Taskbar Management =====
    addTaskbarEntry: function(id, title) {
        const taskbarApps = document.querySelector('.taskbar-apps');
        if (!taskbarApps || document.getElementById('taskbar-' + id)) return;

        const entry = document.createElement('div');
        entry.className = 'taskbar-app-entry glass-icon';
        entry.id = 'taskbar-' + id;
        entry.title = title;
        entry.innerHTML = this.appEmojis[id] || '📄';
        entry.addEventListener('click', () => {
            const state = this.openWindows[id];
            if (!state) return;
            if (state.isMinimized) {
                this.restoreWindow(id);
            } else {
                // If already visible, focus it
                const win = document.getElementById(id);
                if (win) this.focusWindow(win);
            }
        });
        taskbarApps.appendChild(entry);
    },

    removeTaskbarEntry: function(id) {
        const entry = document.getElementById('taskbar-' + id);
        if (entry) entry.remove();
    },

    updateTaskbarEntry: function(id) {
        const entry = document.getElementById('taskbar-' + id);
        if (!entry) return;
        const state = this.openWindows[id];
        if (state && state.isMinimized) {
            entry.classList.add('taskbar-minimized');
        } else {
            entry.classList.remove('taskbar-minimized');
        }
    },

    // ===== Window State Management =====
    focusWindow: function(win) {
        this.highestZIndex += 1;
        win.style.zIndex = this.highestZIndex;
        // Mark active in taskbar
        document.querySelectorAll('.taskbar-app-entry').forEach(e => e.classList.remove('taskbar-active'));
        const entry = document.getElementById('taskbar-' + win.id);
        if (entry) entry.classList.add('taskbar-active');
    },

    minimizeWindow: function(id) {
        const win = document.getElementById(id);
        const state = this.openWindows[id];
        if (!win || !state) return;

        state.isMinimized = true;
        win.classList.add('window-minimized');
        this.updateTaskbarEntry(id);
    },

    restoreWindow: function(id) {
        const win = document.getElementById(id);
        const state = this.openWindows[id];
        if (!win || !state) return;

        state.isMinimized = false;
        win.classList.remove('window-minimized');
        this.focusWindow(win);
        this.updateTaskbarEntry(id);
    },

    toggleMax: function(id) {
        const win = document.getElementById(id);
        const state = this.openWindows[id];
        if (!win || !state) return;

        // If minimized, restore first
        if (state.isMinimized) {
            this.restoreWindow(id);
        }

        if (!state.isMaximized) {
            // Save current position/size before maximizing
            state.preMaxRect = {
                top: win.style.top,
                left: win.style.left,
                width: win.style.width,
                height: win.style.height
            };
            win.classList.add('window-maximized');
            state.isMaximized = true;
        } else {
            // Restore saved position/size
            win.classList.remove('window-maximized');
            if (state.preMaxRect) {
                win.style.top = state.preMaxRect.top;
                win.style.left = state.preMaxRect.left;
                win.style.width = state.preMaxRect.width;
                win.style.height = state.preMaxRect.height;
            }
            state.isMaximized = false;
        }
    },

    closeWindow: function(id) {
        const win = document.getElementById(id);
        if (win) win.remove();
        this.removeTaskbarEntry(id);
        delete this.openWindows[id];
    },

    makeDraggable: function(win) {
        const header = win.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            // Don't drag if maximized
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
