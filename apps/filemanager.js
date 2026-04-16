// ===== File Manager App Module =====
// Self-registers with WindowManager

const FileManager = {
    // Virtual filesystem stored in localStorage
    // Structure: { '/': { type: 'folder', children: { 'Documents': {...}, 'file.txt': {...} } } }
    fs: null,
    currentPath: '/',
    clipboard: null, // { action: 'copy'|'cut', path: '...' }

    // Initialize or load filesystem from localStorage
    loadFS: function() {
        const saved = localStorage.getItem('luminaos-fs');
        if (saved) {
            try {
                this.fs = JSON.parse(saved);
            } catch(e) {
                this.fs = null;
            }
        }
        if (!this.fs) {
            // Create default filesystem
            this.fs = {
                type: 'folder',
                children: {
                    'Documents': {
                        type: 'folder',
                        children: {
                            'readme.txt': {
                                type: 'file',
                                content: 'Welcome to LuminaOS!\n\nThis is your personal Documents folder.\nFeel free to create and organize files here.',
                                modified: Date.now()
                            },
                            'notes.txt': {
                                type: 'file',
                                content: 'Shopping List:\n- Coffee\n- Keyboard\n- Monitor\n- More coffee',
                                modified: Date.now()
                            }
                        }
                    },
                    'Desktop': {
                        type: 'folder',
                        children: {}
                    },
                    'Downloads': {
                        type: 'folder',
                        children: {
                            'sample.txt': {
                                type: 'file',
                                content: 'This is a sample downloaded file.',
                                modified: Date.now()
                            }
                        }
                    },
                    'Pictures': {
                        type: 'folder',
                        children: {}
                    },
                    'Music': {
                        type: 'folder',
                        children: {}
                    },
                    'about.txt': {
                        type: 'file',
                        content: 'LuminaOS v1.0\nA web-based operating system.\nBuilt with HTML, CSS, and JavaScript.\n\n© 2026 LuminaOS Project',
                        modified: Date.now()
                    }
                }
            };
            this.saveFS();
        }
    },

    saveFS: function() {
        localStorage.setItem('luminaos-fs', JSON.stringify(this.fs));
    },

    // Navigate to a path and return the node
    getNode: function(path) {
        if (path === '/') return this.fs;
        const parts = path.split('/').filter(p => p !== '');
        let node = this.fs;
        for (const part of parts) {
            if (!node || node.type !== 'folder' || !node.children[part]) {
                return null;
            }
            node = node.children[part];
        }
        return node;
    },

    // Get parent folder node and the item name
    getParentAndName: function(path) {
        const parts = path.split('/').filter(p => p !== '');
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');
        return { parent: this.getNode(parentPath || '/'), name, parentPath: parentPath || '/' };
    },

    // Get path segments for breadcrumbs
    getPathSegments: function(path) {
        if (path === '/') return [{ name: 'Home', path: '/' }];
        const parts = path.split('/').filter(p => p !== '');
        const segments = [{ name: 'Home', path: '/' }];
        let currentPath = '';
        for (const part of parts) {
            currentPath += '/' + part;
            segments.push({ name: part, path: currentPath });
        }
        return segments;
    },

    // Get icon for file type
    getFileIcon: function(name, type) {
        if (type === 'folder') return '📁';
        const ext = name.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📄', 'md': '📝', 'js': '⚡', 'css': '🎨',
            'html': '🌐', 'json': '📋', 'png': '🖼️', 'jpg': '🖼️',
            'mp3': '🎵', 'mp4': '🎬', 'pdf': '📕', 'zip': '📦'
        };
        return icons[ext] || '📄';
    },

    // Format file size
    formatSize: function(content) {
        if (!content) return '—';
        const bytes = new Blob([content]).size;
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    // Format date
    formatDate: function(timestamp) {
        if (!timestamp) return '—';
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    // ===== Render Functions =====
    render: function() {
        const node = this.getNode(this.currentPath);
        if (!node || node.type !== 'folder') {
            this.currentPath = '/';
            this.render();
            return;
        }

        this.renderBreadcrumbs();
        this.renderFileGrid(node);
    },

    renderBreadcrumbs: function() {
        const breadcrumbEl = document.getElementById('fm-breadcrumbs');
        if (!breadcrumbEl) return;

        const segments = this.getPathSegments(this.currentPath);
        breadcrumbEl.innerHTML = segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            if (isLast) {
                return `<span class="fm-crumb fm-crumb-active">${seg.name}</span>`;
            }
            return `<span class="fm-crumb" onclick="FileManager.navigateTo('${seg.path}')">${seg.name}</span>
                    <span class="fm-crumb-sep">›</span>`;
        }).join('');
    },

    renderFileGrid: function(node) {
        const gridEl = document.getElementById('fm-file-grid');
        if (!gridEl) return;

        const entries = Object.entries(node.children || {});

        if (entries.length === 0) {
            gridEl.innerHTML = `
                <div class="fm-empty">
                    <span class="fm-empty-icon">📂</span>
                    <span>This folder is empty</span>
                </div>
            `;
            return;
        }

        // Sort: folders first, then files, alphabetically
        entries.sort((a, b) => {
            if (a[1].type === 'folder' && b[1].type !== 'folder') return -1;
            if (a[1].type !== 'folder' && b[1].type === 'folder') return 1;
            return a[0].localeCompare(b[0]);
        });

        gridEl.innerHTML = entries.map(([name, item]) => {
            const icon = this.getFileIcon(name, item.type);
            const info = item.type === 'folder' 
                ? `${Object.keys(item.children || {}).length} items`
                : this.formatSize(item.content);
            
            return `
                <div class="fm-item" 
                     ondblclick="FileManager.openItem('${name}')"
                     oncontextmenu="FileManager.showItemMenu(event, '${name}')">
                    <div class="fm-item-icon">${icon}</div>
                    <div class="fm-item-name">${name}</div>
                    <div class="fm-item-info">${info}</div>
                </div>
            `;
        }).join('');
    },

    // ===== Navigation =====
    navigateTo: function(path) {
        const node = this.getNode(path);
        if (node && node.type === 'folder') {
            this.currentPath = path;
            this.render();
        }
    },

    goUp: function() {
        if (this.currentPath === '/') return;
        const parts = this.currentPath.split('/').filter(p => p !== '');
        parts.pop();
        this.currentPath = '/' + parts.join('/');
        this.render();
    },

    openItem: function(name) {
        const fullPath = this.currentPath === '/' ? '/' + name : this.currentPath + '/' + name;
        const node = this.getNode(fullPath);
        if (!node) return;

        if (node.type === 'folder') {
            this.navigateTo(fullPath);
        } else {
            // Open file in editor modal
            this.openFileEditor(name, fullPath, node);
        }
    },

    // ===== File Editor =====
    openFileEditor: function(name, path, node) {
        const editorEl = document.getElementById('fm-editor-overlay');
        if (!editorEl) return;

        document.getElementById('fm-editor-title').innerText = name;
        document.getElementById('fm-editor-textarea').value = node.content || '';
        editorEl.dataset.path = path;
        editorEl.classList.remove('fm-hidden');
    },

    saveFile: function() {
        const editorEl = document.getElementById('fm-editor-overlay');
        const path = editorEl.dataset.path;
        const content = document.getElementById('fm-editor-textarea').value;

        const node = this.getNode(path);
        if (node) {
            node.content = content;
            node.modified = Date.now();
            this.saveFS();
            this.render();
        }
        this.closeEditor();
    },

    closeEditor: function() {
        const editorEl = document.getElementById('fm-editor-overlay');
        if (editorEl) editorEl.classList.add('fm-hidden');
    },

    // ===== CRUD Operations =====
    createNewFolder: function() {
        const name = prompt('New folder name:');
        if (!name || name.trim() === '') return;
        const sanitized = name.trim().replace(/[\/\\]/g, '');

        const node = this.getNode(this.currentPath);
        if (!node || node.children[sanitized]) {
            alert('A file or folder with that name already exists.');
            return;
        }

        node.children[sanitized] = { type: 'folder', children: {} };
        this.saveFS();
        this.render();
    },

    createNewFile: function() {
        const name = prompt('New file name (e.g. notes.txt):');
        if (!name || name.trim() === '') return;
        const sanitized = name.trim().replace(/[\/\\]/g, '');

        const node = this.getNode(this.currentPath);
        if (!node || node.children[sanitized]) {
            alert('A file or folder with that name already exists.');
            return;
        }

        node.children[sanitized] = { type: 'file', content: '', modified: Date.now() };
        this.saveFS();
        this.render();
    },

    deleteItem: function(name) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        const node = this.getNode(this.currentPath);
        if (node && node.children[name]) {
            delete node.children[name];
            this.saveFS();
            this.render();
        }
    },

    renameItem: function(oldName) {
        const newName = prompt('Rename to:', oldName);
        if (!newName || newName.trim() === '' || newName.trim() === oldName) return;
        const sanitized = newName.trim().replace(/[\/\\]/g, '');

        const node = this.getNode(this.currentPath);
        if (!node) return;
        if (node.children[sanitized]) {
            alert('A file or folder with that name already exists.');
            return;
        }

        node.children[sanitized] = node.children[oldName];
        delete node.children[oldName];
        this.saveFS();
        this.render();
    },

    // ===== Context Menu =====
    showItemMenu: function(event, name) {
        event.preventDefault();
        event.stopPropagation();
        
        // Remove any existing context menu
        this.hideContextMenu();

        const node = this.getNode(this.currentPath);
        const item = node ? node.children[name] : null;
        if (!item) return;

        const menu = document.createElement('div');
        menu.className = 'fm-context-menu';
        menu.id = 'fm-context-menu';
        
        const isFolder = item.type === 'folder';
        menu.innerHTML = `
            <div class="fm-ctx-item" onclick="FileManager.openItem('${name}'); FileManager.hideContextMenu();">
                ${isFolder ? '📂 Open' : '📄 Open'}
            </div>
            <div class="fm-ctx-item" onclick="FileManager.renameItem('${name}'); FileManager.hideContextMenu();">
                ✏️ Rename
            </div>
            <div class="fm-ctx-separator"></div>
            <div class="fm-ctx-item fm-ctx-danger" onclick="FileManager.deleteItem('${name}'); FileManager.hideContextMenu();">
                🗑️ Delete
            </div>
        `;

        // Position relative to the file manager container
        const container = document.getElementById('fm-container');
        const containerRect = container.getBoundingClientRect();
        
        menu.style.left = (event.clientX - containerRect.left) + 'px';
        menu.style.top = (event.clientY - containerRect.top) + 'px';
        
        container.appendChild(menu);

        // Close on next click anywhere
        setTimeout(() => {
            document.addEventListener('click', FileManager.hideContextMenu, { once: true });
        }, 10);
    },

    hideContextMenu: function() {
        const menu = document.getElementById('fm-context-menu');
        if (menu) menu.remove();
    },

    // ===== Sidebar Navigation =====
    sidebarNav: function(folderName) {
        if (folderName === 'Home') {
            this.currentPath = '/';
        } else {
            const path = '/' + folderName;
            const node = this.getNode(path);
            if (node && node.type === 'folder') {
                this.currentPath = path;
            }
        }
        this.render();
    },

    // ===== Content & Init for WindowManager =====
    getContent: function() {
        return `
            <div class="fm-container" id="fm-container">
                <div class="fm-sidebar">
                    <div class="fm-sidebar-title">Quick Access</div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Home')">
                        <span>🏠</span><span>Home</span>
                    </div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Documents')">
                        <span>📄</span><span>Documents</span>
                    </div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Desktop')">
                        <span>🖥️</span><span>Desktop</span>
                    </div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Downloads')">
                        <span>⬇️</span><span>Downloads</span>
                    </div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Pictures')">
                        <span>🖼️</span><span>Pictures</span>
                    </div>
                    <div class="fm-sidebar-item" onclick="FileManager.sidebarNav('Music')">
                        <span>🎵</span><span>Music</span>
                    </div>
                </div>
                <div class="fm-main">
                    <div class="fm-toolbar">
                        <div class="fm-toolbar-left">
                            <button class="fm-tool-btn" onclick="FileManager.goUp()" title="Go Up">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <div class="fm-breadcrumbs" id="fm-breadcrumbs"></div>
                        </div>
                        <div class="fm-toolbar-right">
                            <button class="fm-tool-btn" onclick="FileManager.createNewFolder()" title="New Folder">📁+</button>
                            <button class="fm-tool-btn" onclick="FileManager.createNewFile()" title="New File">📄+</button>
                        </div>
                    </div>
                    <div class="fm-file-grid" id="fm-file-grid"></div>
                </div>

                <!-- File Editor Overlay -->
                <div class="fm-editor-overlay fm-hidden" id="fm-editor-overlay">
                    <div class="fm-editor">
                        <div class="fm-editor-header">
                            <span class="fm-editor-title" id="fm-editor-title">file.txt</span>
                            <div class="fm-editor-actions">
                                <button class="fm-editor-btn fm-editor-save" onclick="FileManager.saveFile()">Save</button>
                                <button class="fm-editor-btn fm-editor-close" onclick="FileManager.closeEditor()">Close</button>
                            </div>
                        </div>
                        <textarea class="fm-editor-textarea" id="fm-editor-textarea" spellcheck="false"></textarea>
                    </div>
                </div>
            </div>
        `;
    },

    init: function() {
        this.loadFS();
        this.currentPath = '/';
        this.render();
    }
};

// Register with WindowManager
WindowManager.registerApp('app-files', {
    content: () => FileManager.getContent(),
    init: () => FileManager.init(),
    emoji: '📁',
    width: '650px',
    height: '450px'
});
