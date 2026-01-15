// Zephyr Device Manager - Main Application
function terminalApp() {
    return {
        // State
        webviewReady: false, // Flag to track if webview is fully loaded
        connected: false,
        showAbout: false,
        showSettings: false,
        selectedPort: '',
        manualPort: '',  // Add this line
        theme: 'dark', // 'light' or 'dark'
        connectionMode: 'serial', // 'serial' or 'telnet'
        telnetHost: 'localhost',
        telnetPort: '23',
        baudRate: '115200',
        logFileName: '',
        logMode: 'printable', // 'printable' or 'raw'
        omitSent: true, // Whether to omit transmitted data from logs
        availablePorts: [],
        loadingPorts: false,
        portMonitorWs: null,
        statusMessage: '',
        statusMessageType: 'info',
        connecting: false,
        currentPort: '',
        activeView: 'commands', // VSCode-style sidebar view
        sidebarWidth: 320,
        isResizing: false,
        resizeStartX: 0,
        resizeStartWidth: 320,
        isWindowDragging: false,
        windowDragStartX: 0,
        windowDragStartY: 0,
        appVersion: { version: '0.0.0', full_version: 'v0.0.0' },

        // Sidebar Icon State
        sidebarIcons: [
            { id: 'commands', title: 'Commands', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>' },
            { id: 'connection', title: 'Connection', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21v-2h-4" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h4V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4z" /></svg>' },
            { id: 'repeat', title: 'Repeat Commands', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>' },
            { id: 'scripts', title: 'Shell Scripts', icon: '<span class="codicon codicon-code" style="font-size: 20px;"></span>' },
            { id: 'settings', title: 'Project Settings', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' },
            { id: 'sequences', title: 'Response Sequences', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg>' },
            { id: 'counters', title: 'Counters', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" id="mdi-counter" viewBox="0 0 24 24" fill="currentColor"><path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H11V6H4M20,18V6H18.76C19,6.54 18.95,7.07 18.95,7.13C18.88,7.8 18.41,8.5 18.24,8.75L15.91,11.3L19.23,11.28L19.24,12.5L14.04,12.47L14,11.47C14,11.47 17.05,8.24 17.2,7.95C17.34,7.67 17.91,6 16.5,6C15.27,6.05 15.41,7.3 15.41,7.3L13.87,7.31C13.87,7.31 13.88,6.65 14.25,6H13V18H15.58L15.57,17.14L16.54,17.13C16.54,17.13 17.45,16.97 17.46,16.08C17.5,15.08 16.65,15.08 16.5,15.08C16.37,15.08 15.43,15.13 15.43,15.95H13.91C13.91,15.95 13.95,13.89 16.5,13.89C19.1,13.89 18.96,15.91 18.96,15.91C18.96,15.91 19,17.16 17.85,17.63L18.37,18H20M8.92,16H7.42V10.2L5.62,10.76V9.53L8.76,8.41H8.92V16Z" /></svg>' },

        ],
        draggedIconId: null,
        dragOverIconId: null,
        expandedCommandId: null, // ID of the command whose actions are currently expanded
        dragOverCommandId: null, // ID of the command being dragged over
        draggedCommandId: null, // ID of the command being dragged
        recentlyMovedCommandId: null, // ID of the command that was just moved


        // Toolbar State
        activeMenu: null,

        // Multi-session & Layout state
        sessions: [], // Array of { id, port, baudrate, connected, terminal, fitAddon, ws, promptBuffer, promptString, terminalBuffer }
        layoutGroups: [], // Array of { id, sessionIds, activeSessionId }
        activeSessionId: null, // Legacy: still used for "global" context (e.g. settings)

        // Drag & Drop State
        draggedSessionId: null,
        dragOverGroupId: null,
        dragOverPosition: null, // 'top', 'bottom', 'left', 'right', 'center'

        // Command Discovery & Management State
        showCommands: false,
        commands: [],
        loadingCommands: false,
        commandsCache: null,
        lastScannedTime: null,
        commandDiscoveryInProgress: false,
        discoveryLock: false,
        discoveryCollectedData: '',
        selectedCommand: null,
        commandArgs: {},
        commandResult: '',
        expandedCommands: {},
        discoveringSubcommands: {},
        discoveryProgress: { current: 0, total: 0 },
        discoveryStartTime: null,
        discoveryTimeoutThreshold: 60000,
        showDiscoveryConfirm: false,
        discoveryPaused: false,
        discoveryCancelRequested: false,
        searchCommands: '',
        commandScanSpeed: 'normal', // fast, normal, slow
        showCommandSelectionModal: false, // Show modal to select commands for deep scan
        enableCommandSelectionModal: true, // Setting to enable/disable the modal
        selectedCommandsForDeepScan: [], // Commands selected for deep scan
        topLevelCommands: [], // Store top-level commands after initial scan
        selectionMode: false, // Multi-select mode for bulk operations
        selectedCommandIds: [], // IDs of selected commands for bulk delete

        // Modal State (Unified for Scanned & Custom)
        showCustomCommandModal: false,
        customCommandModalData: {
            id: null,
            name: '',
            description: '',
            args: []
        },

        // WebSocket and Terminal
        ws: null,
        terminal: null,
        terminalFitAddon: null,

        // Repeat Commands State
        repeatCommands: [],
        repeatModalData: {
            id: null,
            name: '',
            command: '',
            interval: 1.0
        },

        // Shell Scripts State
        shellScripts: [],
        scriptModalData: {
            id: null,
            name: '',
            commands: [],
            commandsText: '', // Text representation for textarea
            stopOnError: true
        },
        runningScript: null, // Currently executing script (id)
        scriptExecutionState: {}, // Track execution state per script

        // Counter Feature State
        counters: [],
        showCounters: true,
        counterPanelHeight: 'normal', // 'normal' or 'large'
        lastCounterUpdate: {}, // Store session-specific last chunks for split-text matching

        // Toast Notification State
        toasts: [],
        nextToastId: 1,

        // Response Sequences State
        responseSequences: [],
        showResponseSequenceModal: false,
        responseSequenceModalData: {
            id: null,
            trigger: '',
            command: '',
            enabled: true
        },
        expandedSequenceId: null,
        lastSequenceUpdate: {},
        draggedSequenceId: null,
        dragOverSequenceId: null,
        recentlyMovedSequenceId: null,
        searchSequences: '',

        showWelcomeModal: false,

        // Initialize application (Now handles status checks/port loading)
        async init() {
            if (this._initialized) return;
            this._initialized = true;
            console.log("init() called");

            // Load theme
            const savedTheme = localStorage.getItem('zfield_theme');
            if (savedTheme) {
                this.theme = savedTheme;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                this.theme = 'light';
            }
            this.updateThemeClass();

            // Load saved manual port from localStorage
            const savedManualPort = localStorage.getItem('zfield_manual_port');
            if (savedManualPort) {
                this.manualPort = savedManualPort;
                this.selectedPort = savedManualPort; // Sync with selectedPort so UI buttons work
                console.log('Loaded saved manual port:', savedManualPort);
            }

            // Load saved log file name
            const savedLogFile = localStorage.getItem('zfield_log_file_name');
            if (savedLogFile) {
                this.logFileName = savedLogFile;
            }

            const savedLogMode = localStorage.getItem('zfield_log_mode');
            if (savedLogMode) {
                this.logMode = savedLogMode;
            }

            const savedOmitSent = localStorage.getItem('zfield_omit_sent');
            if (savedOmitSent !== null) {
                this.omitSent = savedOmitSent === 'true';
            }

            // Load command selection modal setting (default to true if not set)
            const savedEnableCommandSelectionModal = localStorage.getItem('zfield_enable_command_selection_modal');
            if (savedEnableCommandSelectionModal !== null) {
                this.enableCommandSelectionModal = savedEnableCommandSelectionModal === 'true';
            } else {
                // Default to true if not set
                this.enableCommandSelectionModal = true;
                localStorage.setItem('zfield_enable_command_selection_modal', 'true');
            }
            if (savedOmitSent !== null) {
                this.omitSent = savedOmitSent === 'true';
            }

            // Load available ports
            await this.loadPorts();

            // Start port monitoring WebSocket
            this.startPortMonitoring();

            // Check connection status
            await this.checkStatus();

            // Load repeat commands
            this.initRepeatCommands();

            // Load shell scripts
            this.initShellScripts();

            // Load saved sidebar width
            const savedWidth = localStorage.getItem('zfield_sidebar_width');
            if (savedWidth) {
                this.sidebarWidth = parseInt(savedWidth);
            }

            // Load commands (merges cached and custom)
            this.loadAllCommands();

            // Load counters
            this.loadCounters();

            // Load response sequences
            this.loadResponseSequences();

            // Explicitly expose flattenedCommands for Alpine to use as a reactive getter
            // Alpine 2.x doesn't always handle ES6 getters in the returned object ideally, 
            // but we can define it on 'this' or use a function.
            // However, with this structure, a computed property approach is best.


            // Welcome Modal for first timers
            if (!localStorage.getItem('zfield_welcome_shown')) {
                this.showWelcomeModal = true;
            }

            // Load saved view
            const savedView = localStorage.getItem('zfield_active_view');
            if (savedView) {
                this.activeView = savedView;
            }

            // Load sidebar icon order
            const savedIconOrder = localStorage.getItem('zfield_icon_order');
            if (savedIconOrder) {
                try {
                    const order = JSON.parse(savedIconOrder);
                    this.sidebarIcons.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
                } catch (e) {
                    console.error("Error parsing icon order", e);
                }
            }

            // Watch for view changes to save
            this.$watch('activeView', (value) => {
                localStorage.setItem('zfield_active_view', value);
            });

            // Load app version
            await this.loadVersion();

            // Handle window resize for all terminals
            window.addEventListener('resize', () => {
                this.sessions.forEach(s => {
                    if (s.terminal && s.fitAddon) s.fitAddon.fit();
                });
            });

            // Listen for pywebview ready event - fired by pywebview's loaded callback
            // This is event-driven and more robust than delays - no arbitrary waiting
            const markWebviewReady = () => {
                if (this.webviewReady) return; // Already marked as ready
                this.webviewReady = true;
                console.log("Webview ready - interactions enabled");
            };

            // Listen for the custom event dispatched by pywebview's loaded callback
            // This fires exactly when pywebview has finished loading (no delay needed)
            window.addEventListener('pywebviewready', markWebviewReady, { once: true });

            // Fallback: Check if flag was already set (handles race condition where 
            // pywebview loads before our listener is attached)
            if (window.pywebviewReady) {
                markWebviewReady();
            }
        },

        // Initialize Repeat Commands from localStorage
        initRepeatCommands() {
            const saved = localStorage.getItem('zfield_repeat_commands');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Ensure active states are cleared on startup for safety
                    this.repeatCommands = parsed.map(rc => ({
                        ...rc,
                        runningSessions: [] // Array of { sessionId, port, timerId }
                    }));
                } catch (e) {
                    console.error('Error loading repeat commands:', e);
                }
            }
        },

        saveRepeatCommands() {
            // Only save the data, not the timer IDs or active status
            const toSave = this.repeatCommands.map(({ id, name, command, interval }) => ({
                id, name, command, interval
            }));
            localStorage.setItem('zfield_repeat_commands', JSON.stringify(toSave));
        },

        // ============ SHELL SCRIPTS METHODS ============

        initShellScripts() {
            const saved = localStorage.getItem('zfield_shell_scripts');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    this.shellScripts = parsed;
                } catch (e) {
                    console.error('Error loading shell scripts:', e);
                    this.shellScripts = [];
                }
            }
        },

        saveShellScripts() {
            const toSave = this.shellScripts.map(({ id, name, commands, stopOnError }) => ({
                id, name, commands, stopOnError
            }));
            localStorage.setItem('zfield_shell_scripts', JSON.stringify(toSave));
        },

        // ============ COUNTER METHODS ============

        loadCounters() {
            const saved = localStorage.getItem('zfield_counters');
            if (saved) {
                try {
                    this.counters = JSON.parse(saved).map(c => {
                        // Migrate old counters to new format
                        if (!c.type) {
                            c.type = 'text';
                        }
                        return {
                            ...c,
                            buffer: '',
                            justUpdated: false,
                            // Initialize type-specific runtime fields
                            ...(c.type === 'traffic' && { resetTimerId: null }),
                        };
                    });
                } catch (e) {
                    console.error('Error loading counters:', e);
                }
            }
        },

        saveCounters() {
            const toSave = this.counters.map(c => {
                const base = { id: c.id, type: c.type, sessionId: c.sessionId };

                if (c.type === 'text') {
                    return { ...base, text: c.text, count: c.count };
                } else if (c.type === 'traffic') {
                    return {
                        ...base,
                        greenText: c.greenText,
                        redText: c.redText,
                        state: c.state || 'yellow',
                        resetTimer: c.resetTimer || 5000,
                        lastUpdate: c.lastUpdate
                    };
                } else if (c.type === 'slicer') {
                    return {
                        ...base,
                        startText: c.startText,
                        endText: c.endText,
                        extractedValue: c.extractedValue || ''
                    };
                }
                return base;
            });
            localStorage.setItem('zfield_counters', JSON.stringify(toSave));
        },

        addCounter(type = 'text') {
            const baseCounter = {
                id: 'cnt_' + Date.now(),
                type: type,
                sessionId: 'all',
                buffer: '',
                justUpdated: false
            };

            let newCounter;
            if (type === 'text') {
                newCounter = { ...baseCounter, text: '', count: 0 };
            } else if (type === 'traffic') {
                newCounter = {
                    ...baseCounter,
                    greenText: '',
                    redText: '',
                    state: 'yellow',
                    resetTimer: 5000,
                    lastUpdate: null,
                    resetTimerId: null
                };
            } else if (type === 'slicer') {
                newCounter = {
                    ...baseCounter,
                    startText: '',
                    endText: '',
                    extractedValue: ''
                };
            }

            this.counters.push(newCounter);
            this.saveCounters();
        },

        deleteCounter(id) {
            this.counters = this.counters.filter(c => c.id !== id);
            this.saveCounters();
        },

        resetCounter(id) {
            const counter = this.counters.find(c => c.id === id);
            if (counter) {
                counter.count = 0;
                this.saveCounters();
            }
        },

        resetAllCounters() {
            if (this.counters.length === 0) return;
            if (confirm('Reset all counter values to zero?')) {
                this.counters.forEach(c => c.count = 0);
                this.saveCounters();
                this.showStatus('All counters reset', 'success');
            }
        },

        // Toast Notification Functions
        showToast(message, type = 'info', duration = 3000) {
            const id = this.nextToastId++;
            const toast = {
                id,
                message,
                type, // 'success', 'error', 'info', 'warning'
                show: false // Start hidden for animation
            };

            // Add new toast
            this.toasts.push(toast);

            // If more than 3 toasts, remove the oldest
            if (this.toasts.length > 3) {
                this.toasts.shift();
            }

            // Show toast after a tiny delay to trigger animation
            setTimeout(() => {
                const toastObj = this.toasts.find(t => t.id === id);
                if (toastObj) toastObj.show = true;
            }, 10);

            // Auto-dismiss after duration
            setTimeout(() => {
                this.dismissToast(id);
            }, duration);
        },

        dismissToast(id) {
            const toast = this.toasts.find(t => t.id === id);
            if (toast) {
                // Trigger leave animation
                toast.show = false;

                // Remove from array after animation completes (500ms)
                setTimeout(() => {
                    const index = this.toasts.findIndex(t => t.id === id);
                    if (index !== -1) {
                        this.toasts.splice(index, 1);
                    }
                }, 300);
            }
        },

        closeWelcomeModal() {
            this.showWelcomeModal = false;
            localStorage.setItem('zfield_welcome_shown', 'true');
        },

        updateCounters(sessionId, rawData) {
            if (this.counters.length === 0) return;

            // Clean ANSI for counting
            const cleanData = rawData.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*C/g, '');

            this.counters.forEach(counter => {
                if (counter.sessionId !== 'all' && counter.sessionId !== sessionId) return;

                // Route to type-specific handler
                if (counter.type === 'text') {
                    this.updateTextCounter(counter, cleanData, sessionId);
                } else if (counter.type === 'traffic') {
                    this.updateTrafficCounter(counter, cleanData, sessionId);
                } else if (counter.type === 'slicer') {
                    this.updateSlicerCounter(counter, cleanData, sessionId);
                }
            });
        },

        updateTextCounter(counter, cleanData, sessionId) {
            if (!counter.text || counter.text.trim().length === 0) return;

            // Handle split chunks by keeping a small overlap buffer
            const search = counter.text;
            const bufferKey = sessionId + '_' + counter.id;
            const combined = (this.lastCounterUpdate[bufferKey] || '') + cleanData;

            // Count occurrences
            const parts = combined.split(search);
            const occurrences = parts.length - 1;

            if (occurrences > 0) {
                counter.count += occurrences;

                // Leading-edge debounce for highlight effect
                if (!counter.justUpdated) {
                    counter.justUpdated = true;
                    setTimeout(() => { counter.justUpdated = false; }, 1000);
                }
            }

            // Store tail for next update
            const tailLen = search.length - 1;
            if (tailLen > 0) {
                this.lastCounterUpdate[bufferKey] = combined.slice(-tailLen);
            } else {
                this.lastCounterUpdate[bufferKey] = '';
            }
        },

        updateTrafficCounter(counter, cleanData, sessionId) {
            const bufferKey = sessionId + '_' + counter.id;
            const combined = (this.lastCounterUpdate[bufferKey] || '') + cleanData;

            let stateChanged = false;

            // Check for green pattern
            if (counter.greenText && counter.greenText.trim() && combined.includes(counter.greenText)) {
                counter.state = 'green';
                counter.lastUpdate = Date.now();
                stateChanged = true;
            }

            // Check for red pattern (overrides green)
            if (counter.redText && counter.redText.trim() && combined.includes(counter.redText)) {
                counter.state = 'red';
                counter.lastUpdate = Date.now();
                stateChanged = true;
            }

            // Schedule reset to yellow if state changed
            if (stateChanged) {
                this.scheduleTrafficReset(counter);

                // Visual feedback
                if (!counter.justUpdated) {
                    counter.justUpdated = true;
                    setTimeout(() => { counter.justUpdated = false; }, 1000);
                }
            }

            // Store tail
            const maxLen = Math.max(
                (counter.greenText || '').length,
                (counter.redText || '').length
            );
            if (maxLen > 0) {
                this.lastCounterUpdate[bufferKey] = combined.slice(-(maxLen - 1));
            } else {
                this.lastCounterUpdate[bufferKey] = '';
            }
        },

        scheduleTrafficReset(counter) {
            // Clear existing timer
            if (counter.resetTimerId) {
                clearTimeout(counter.resetTimerId);
            }

            // Schedule reset to yellow
            const resetTime = parseInt(counter.resetTimer) || 5000;
            counter.resetTimerId = setTimeout(() => {
                counter.state = 'yellow';
                counter.resetTimerId = null;
            }, resetTime);
        },

        updateSlicerCounter(counter, cleanData, sessionId) {
            if (!counter.startText || counter.startText.trim().length === 0) return;

            const bufferKey = sessionId + '_' + counter.id;
            const combined = (this.lastCounterUpdate[bufferKey] || '') + cleanData;

            const startIdx = combined.lastIndexOf(counter.startText);
            if (startIdx === -1) {
                // Keep reasonable buffer for split chunks
                this.lastCounterUpdate[bufferKey] = combined.slice(-200);
                return;
            }

            const afterStart = combined.substring(startIdx + counter.startText.length);

            // Extract until end text or newline
            const endText = (counter.endText && counter.endText.trim()) || '\n';
            const endIdx = afterStart.indexOf(endText);

            if (endIdx !== -1) {
                const extracted = afterStart.substring(0, endIdx).trim();
                if (extracted !== counter.extractedValue) {
                    counter.extractedValue = extracted;

                    // Visual feedback
                    if (!counter.justUpdated) {
                        counter.justUpdated = true;
                        setTimeout(() => { counter.justUpdated = false; }, 1000);
                    }
                }
            } else {
                // End not found yet, show partial with ellipsis
                const partial = afterStart.substring(0, 50).trim();
                if (partial) {
                    counter.extractedValue = partial + (afterStart.length > 50 ? '...' : '');
                }
            }

            // Store tail for split chunks
            this.lastCounterUpdate[bufferKey] = combined.slice(-300);
        },

        // Initialize terminal (returns term instance, doesn't attach yet if container not found)
        initTerminal(session, containerId) {
            if (session.terminal) return { term: session.terminal, fitAddon: session.fitAddon };
            if (!window.Terminal) {
                console.error("xterm.js not loaded!");
                return;
            }

            const isDark = this.theme === 'dark';

            const term = new window.Terminal({
                cursorBlink: true,
                theme: isDark ? {
                    background: '#0f172a', // slate-900
                    foreground: '#e2e8f0', // slate-200
                    cursor: '#818cf8', // indigo-400
                    cursorAccent: '#0f172a',
                    selection: '#334155', // slate-700
                    black: '#1e293b',
                    red: '#ef4444',
                    green: '#10b981',
                    yellow: '#f59e0b',
                    blue: '#3b82f6',
                    magenta: '#a855f7',
                    cyan: '#06b6d4',
                    white: '#cbd5e1',
                    brightBlack: '#475569',
                    brightRed: '#f87171',
                    brightGreen: '#34d399',
                    brightYellow: '#fbbf24',
                    brightBlue: '#60a5fa',
                    brightMagenta: '#c084fc',
                    brightCyan: '#22d3ee',
                    brightWhite: '#f1f5f9'
                } : {
                    background: '#ffffff', // white
                    foreground: '#1e293b', // slate-800
                    cursor: '#6366f1', // indigo-500
                    cursorAccent: '#ffffff',
                    selection: '#cbd5e1', // slate-300
                    black: '#000000',
                    red: '#dc2626',
                    green: '#059669',
                    yellow: '#d97706',
                    blue: '#2563eb',
                    magenta: '#9333ea',
                    cyan: '#0891b2',
                    white: '#e2e8f0',
                    brightBlack: '#334155',
                    brightRed: '#f87171',
                    brightGreen: '#34d399',
                    brightYellow: '#fbbf24',
                    brightBlue: '#60a5fa',
                    brightMagenta: '#c084fc',
                    brightCyan: '#22d3ee',
                    brightWhite: '#f1f5f9'
                }
            });

            const fitAddon = new window.FitAddon.FitAddon();
            term.loadAddon(fitAddon);

            const el = document.getElementById(containerId);
            if (el) {
                term.open(el);

                // Load WebGL Addon
                try {
                    if (window.WebglAddon) {
                        const webglAddon = new window.WebglAddon.WebglAddon();
                        webglAddon.onContextLoss(e => {
                            webglAddon.dispose();
                        });
                        term.loadAddon(webglAddon);
                        console.log("WebGL Addon loaded");
                    }
                } catch (e) {
                    console.error("Failed to load WebGL addon", e);
                }

                // Initial fit
                fitAddon.fit();
            }

            // Debounced resize
            let resizeTimeout;
            const debouncedFit = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    fitAddon.fit();
                }, 100);
            };

            window.addEventListener('resize', debouncedFit);
            const resizeObserver = new ResizeObserver(debouncedFit);
            resizeObserver.observe(el.parentElement);

            // Support Ctrl+C (Copy) and Ctrl+V (Paste)
            term.attachCustomKeyEventHandler(e => {
                if (e.ctrlKey && e.code === 'KeyC') {
                    if (term.hasSelection()) return false;
                }
                if (e.ctrlKey && e.code === 'KeyV') return false;
                return true;
            });

            // Enable User Input (Tx)
            term.onData(data => {
                // Buffer tracking for repeat command restoration
                for (let i = 0; i < data.length; i++) {
                    const char = data[i];
                    if (char === '\r' || char === '\n') {
                        session.promptBuffer = '';
                    } else if (char === '\x7f' || char === '\b') { // Backspace
                        session.promptBuffer = session.promptBuffer.slice(0, -1);
                    } else if (char === '\x15') { // Ctrl+U
                        session.promptBuffer = '';
                    } else if (char === '\x03') { // Ctrl+C
                        session.promptBuffer = '';
                    } else if (char.length === 1 && char >= ' ' && char <= '~') { // Printable ASCII
                        session.promptBuffer += char;
                    }
                }

                if (session.ws && session.ws.readyState === WebSocket.OPEN) {
                    session.ws.send(data);
                }
            });

            return { term, fitAddon };
        },

        updateThemeClass() {
            if (this.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },

        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('zfield_theme', this.theme);
            this.updateThemeClass();
            this.refreshTerminalThemes();
        },

        // Menu Bar Helpers
        openMenu(name) {
            this.activeMenu = this.activeMenu === name ? null : name;
        },
        closeMenu() {
            this.activeMenu = null;
        },


        // Project Persistence
        newProject() {
            if (confirm('Create new project? Unsaved changes will be lost.')) {
                this.sessions.forEach(s => {
                    if (s.ws) s.ws.close();
                });
                this.sessions = [];
                this.layoutGroups = [];
                this.savedCommands = [];
                this.commands = [];
                this.repeatCommands = [];
                this.responseSequences = [];
                this.counters = [];
                this.lastScannedTime = null;
                this.activeView = 'commands';
                this.currentPort = '';
                this.baudrate = 115200;

                // Update local storage caches
                this.saveCachedCommands([]);
                this.saveCounters();
                this.saveResponseSequences();
                // Keep theme as is, or reset? Let's keep it.
            }
        },

        async saveProject(saveAs = false) {
            const project = {
                meta: {
                    version: "1.0",
                    created: new Date().toISOString()
                },
                settings: {
                    theme: this.theme,
                    sidebarWidth: this.sidebarWidth,
                    activeView: this.activeView,
                    logFileName: this.logFileName,
                    logMode: this.logMode,
                    omitSent: this.omitSent
                },
                sessions: this.sessions.map(s => ({
                    id: s.id,
                    port: s.port,
                    baudrate: s.baudrate,
                    // We don't save the actual connection state or terminal content, 
                    // just the configuration to restore the tab.
                })),
                layoutGroups: this.layoutGroups,
                data: {
                    savedCommands: this.savedCommands,
                    repeatCommands: this.repeatCommands,
                    responseSequences: this.responseSequences,
                    commands: this.commands,
                    lastScannedTime: this.lastScannedTime,
                    counters: this.counters
                }
            };

            // Use a replacer to avoid circular references if they exist
            const content = JSON.stringify(project, (key, value) => {
                if (key === 'parentCmd') return undefined;
                return value;
            }, 2);

            // Use File System Access API if available
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: 'project.zp',
                        types: [{
                            description: 'Zephyr Project File',
                            accept: { 'application/json': ['.zp'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    return;
                } catch (err) {
                    // If user cancels or error occurs, fall back to legacy method if saveAs was false
                    if (err.name === 'AbortError') return;
                    console.error('File Picker Error:', err);
                }
            }

            // Fallback for browsers that don't support File System Access API
            let filename = "project.zp";
            if (saveAs) {
                const name = prompt("Enter project filename:", "project");
                if (!name) return; // User cancelled
                filename = name.endsWith('.zp') ? name : name + '.zp';
            }

            const blob = new Blob([content], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        triggerOpenProject() {
            document.getElementById('projectFileInput').click();
        },

        async loadProject(event) {
            const file = event.target.files[0];
            if (!file) return;

            const text = await file.text();
            try {
                const project = JSON.parse(text);

                // version check could go here

                // Restore settings
                if (project.settings) {
                    if (project.settings.theme && project.settings.theme !== this.theme) {
                        this.toggleTheme(); // or just set it
                    }
                    if (project.settings.sidebarWidth) this.sidebarWidth = project.settings.sidebarWidth;
                    if (project.settings.activeView) this.activeView = project.settings.activeView;
                    if (project.settings.logFileName) this.logFileName = project.settings.logFileName;
                    if (project.settings.logMode) this.logMode = project.settings.logMode;
                    if (project.settings.omitSent !== undefined) this.omitSent = project.settings.omitSent;
                }

                // Restore Data
                if (project.data) {
                    this.savedCommands = project.data.savedCommands || [];
                    this.repeatCommands = project.data.repeatCommands || [];
                    this.responseSequences = project.data.responseSequences || [];

                    if (project.data.commands) {
                        this.commands = project.data.commands;
                        this.lastScannedTime = project.data.lastScannedTime || Date.now();
                        this.saveCachedCommands(this.commands);
                    }
                    if (project.data.counters) {
                        this.counters = project.data.counters;
                        this.saveCounters();
                    }
                }

                // Restore Sessions (Closed state)
                if (project.sessions) {
                    // Close existing
                    this.sessions.forEach(s => { if (s.ws) s.ws.close(); });
                    this.sessions = [];

                    // Re-create tabs
                    project.sessions.forEach(sConfig => {
                        const newSession = {
                            id: sConfig.id,
                            port: sConfig.port,
                            baudrate: sConfig.baudrate,
                            connected: false,
                            terminal: null,
                            fitAddon: null,
                            ws: null,
                            promptBuffer: '',
                            promptString: '',
                            terminalBuffer: '' // Store terminal output for prompt detection
                        };
                        this.sessions.push(newSession);
                        // We will need to init terminal UI for these, relying on Alpine's x-for to render them
                        // and then $nextTick to init xterm? 
                        // Actually, initTerminal is called in x-init of the *tab content*.
                        // When we push to sessions, the DOM updates.
                    });
                }

                // Restore Layout
                if (project.layoutGroups) {
                    this.layoutGroups = project.layoutGroups;
                } else {
                    // If no layout groups, imply default if sessions exist?
                    // Existing logic handles simple sessions array usually.
                }

                alert('Project loaded successfully!');

            } catch (e) {
                console.error("Failed to load project", e);
                alert('Error loading project file');
            }

            // Reset input
            event.target.value = '';
        },

        refreshTerminalThemes() {
            const isDark = this.theme === 'dark';
            const theme = isDark ? {
                background: '#0f172a', // slate-900
                foreground: '#e2e8f0', // slate-200
                cursor: '#818cf8', // indigo-400
                cursorAccent: '#0f172a',
                selection: '#334155', // slate-700
                black: '#1e293b',
                red: '#ef4444',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#a855f7',
                cyan: '#06b6d4',
                white: '#cbd5e1',
                brightBlack: '#475569',
                brightRed: '#f87171',
                brightGreen: '#34d399',
                brightYellow: '#fbbf24',
                brightBlue: '#60a5fa',
                brightMagenta: '#c084fc',
                brightCyan: '#22d3ee',
                brightWhite: '#f1f5f9'
            } : {
                background: '#ffffff', // white
                foreground: '#000000', // black
                cursor: '#4f46e5', // indigo-600
                cursorAccent: '#ffffff',
                selection: '#cbd5e1', // slate-300
                black: '#000000',
                red: '#dc2626',
                green: '#059669',
                yellow: '#d97706',
                blue: '#2563eb',
                magenta: '#9333ea',
                cyan: '#0891b2',
                white: '#e2e8f0',
                brightBlack: '#334155',
                brightRed: '#f87171',
                brightGreen: '#34d399',
                brightYellow: '#fbbf24',
                brightBlue: '#60a5fa',
                brightMagenta: '#c084fc',
                brightCyan: '#22d3ee',
                brightWhite: '#f1f5f9'
            };

            this.sessions.forEach(session => {
                if (session.terminal) {
                    session.terminal.options.theme = theme;
                }
            });
        },

        // ============ SIDEBAR RESIZING ============

        startResizing(e) {
            if (!this.webviewReady) return; // Prevent interactions until webview is ready
            e.preventDefault();
            e.stopPropagation();
            this.isResizing = true;
            this.resizeStartX = e.clientX;
            this.resizeStartWidth = this.sidebarWidth;
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection
            console.log('Resize started:', { startX: this.resizeStartX, startWidth: this.resizeStartWidth });
        },

        doResize(e) {
            if (!this.webviewReady) return; // Prevent interactions until webview is ready
            if (!this.isResizing) return;
            if (!e) return; // Safety check

            e.preventDefault();

            // Calculate new width based on mouse movement from start position
            const deltaX = e.clientX - this.resizeStartX;
            const newWidth = this.resizeStartWidth + deltaX;

            // Minimal 150px, Maximal half screen
            const constrainedWidth = Math.max(150, Math.min(newWidth, window.innerWidth / 2));
            this.sidebarWidth = constrainedWidth;

            // Debounced terminal fit to keep it snappy
            this.resizeTerminal();
        },

        stopResizing() {
            if (!this.isResizing) return;
            this.isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem('zfield_sidebar_width', this.sidebarWidth);
            this.resizeTerminal();
        },

        // ============ WINDOW DRAGGING ============

        startWindowDrag(e) {
            // Only allow dragging from header, not from interactive elements
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) {
                return;
            }
            this.isWindowDragging = true;
            this.windowDragStartX = e.clientX;
            this.windowDragStartY = e.clientY;
        },

        handleWindowDrag(e) {
            if (!this.isWindowDragging) return;

            // Check if we're in an Electron environment
            if (window.electron && window.electron.ipcRenderer) {
                const deltaX = e.clientX - this.windowDragStartX;
                const deltaY = e.clientY - this.windowDragStartY;
                window.electron.ipcRenderer.send('window-drag', { deltaX, deltaY });
            }
            // If not Electron, do nothing (web browsers handle window dragging automatically)
        },

        stopWindowDrag() {
            this.isWindowDragging = false;
        },

        // Load app version
        async loadVersion() {
            try {
                const response = await fetch('/api/version');
                const data = await response.json();
                this.appVersion = data;
            } catch (error) {
                console.error('Error loading version:', error);
            }
        },

        // Browse for log file
        async browseLogFile() {
            try {
                const response = await fetch('/api/browse');
                const data = await response.json();
                if (data.path) {
                    this.logFileName = data.path;
                    localStorage.setItem('zfield_log_file_name', this.logFileName);
                } else if (data.error) {
                    this.showStatus(data.error, 'warning');
                }
            } catch (error) {
                console.error('Error browsing for file:', error);
                this.showStatus('Error opening file dialog: ' + error.message, 'error');
            }
        },

        // Load available serial ports
        async loadPorts() {
            this.loadingPorts = true;
            try {
                const response = await fetch('/api/ports');
                const data = await response.json();
                this.updatePortsList(data.ports || []);
            } catch (error) {
                console.error('Error loading ports:', error);
                this.showStatus('Error loading ports: ' + error.message, 'error');
            } finally {
                this.loadingPorts = false;
            }
        },

        // Update ports list (called by loadPorts and port monitor)
        updatePortsList(ports) {
            const previousPort = this.selectedPort;
            this.availablePorts = ports;

            // If no port selected and ports available, select first one
            if (!this.selectedPort && this.availablePorts.length > 0) {
                this.selectedPort = this.availablePorts[0].device;
            } else if (this.selectedPort) {
                // Check if previously selected port still exists
                const portExists = this.availablePorts.some(p => p.device === this.selectedPort);
                if (!portExists) {
                    // Port was removed, try to select first available or clear selection
                    if (this.availablePorts.length > 0) {
                        this.selectedPort = this.availablePorts[0].device;
                    } else {
                        this.selectedPort = '';
                    }
                }
            }
        },

        // Start port monitoring via WebSocket
        startPortMonitoring() {
            // Close existing connection if any
            if (this.portMonitorWs) {
                this.portMonitorWs.close();
                this.portMonitorWs = null;
            }

            // Determine WebSocket URL
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const wsUrl = `${protocol}//${host}/ws/ports`;

            try {
                this.portMonitorWs = new WebSocket(wsUrl);

                this.portMonitorWs.onopen = () => {
                    console.log('Port monitoring WebSocket connected');
                };

                this.portMonitorWs.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Port monitor message received:', data.type, data.ports?.length || 0, 'ports');
                        if (data.type === 'ports_changed') {
                            console.log('Ports changed, updating list:', data.ports);
                            this.updatePortsList(data.ports);
                        } else if (data.type === 'keepalive') {
                            // Keepalive message, no action needed
                            console.log('Port monitor keepalive received');
                        }
                    } catch (error) {
                        console.error('Error parsing port monitor message:', error, event.data);
                    }
                };

                this.portMonitorWs.onerror = (error) => {
                    console.error('Port monitoring WebSocket error:', error);
                };

                this.portMonitorWs.onclose = (event) => {
                    console.log('Port monitoring WebSocket closed, code:', event.code, 'reason:', event.reason);
                    this.portMonitorWs = null;
                    // Reconnect after a delay
                    setTimeout(() => {
                        if (!this.portMonitorWs) {
                            console.log('Reconnecting port monitoring WebSocket...');
                            this.startPortMonitoring();
                        }
                    }, 3000);
                };
            } catch (error) {
                console.error('Error creating port monitoring WebSocket:', error);
            }
        },

        // Check connection status
        async checkStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();

                if (data.sessions && data.sessions.length > 0) {
                    // Try to restore order and active port from localStorage
                    let openPorts = [];
                    let savedGroups = [];
                    const savedState = localStorage.getItem('zfield_session_state');
                    if (savedState) {
                        try {
                            const parsed = JSON.parse(savedState);
                            openPorts = parsed.openPorts || [];
                            savedGroups = parsed.layoutGroups || [];
                        } catch (e) {
                            console.error('Error parsing session state:', e);
                        }
                    }

                    // Map backend sessions to frontend session objects
                    const backendSessions = data.sessions;

                    // Restore sessions
                    const restoredSessions = [];
                    backendSessions.forEach(backendSess => {
                        restoredSessions.push({
                            id: 'session_' + Math.random().toString(36).substr(2, 9),
                            port: backendSess.port,
                            baudrate: backendSess.baudrate,
                            connected: true,
                            terminal: null,
                            fitAddon: null,
                            ws: null,
                            promptBuffer: '',
                            promptString: '',
                            terminalBuffer: '' // Store terminal output for prompt detection
                        });
                    });

                    this.sessions = restoredSessions;

                    // Restore Layout Groups
                    if (savedGroups.length > 0) {
                        // Reconstruct groups based on available sessions
                        this.layoutGroups = savedGroups.map(g => {
                            const availableSessionIds = g.sessionIds.filter(port =>
                                this.sessions.find(s => s.port === port)
                            ).map(port => this.sessions.find(s => s.port === port).id);

                            if (availableSessionIds.length === 0) return null;

                            const activeSess = this.sessions.find(s => s.port === g.activePort);
                            return {
                                id: g.id,
                                sessionIds: availableSessionIds,
                                activeSessionId: activeSess ? activeSess.id : availableSessionIds[0]
                            };
                        }).filter(g => g !== null);
                    }

                    // Ensure at least one group exists
                    if (this.layoutGroups.length === 0) {
                        this.layoutGroups = [{
                            id: 'group_default',
                            sessionIds: this.sessions.map(s => s.id),
                            activeSessionId: this.sessions.length > 0 ? this.sessions[0].id : null
                        }];
                    }

                    // Set global active session if not set
                    if (!this.activeSessionId && this.sessions.length > 0) {
                        this.activeSessionId = this.sessions[0].id;
                    }

                    // Initialize terminals for all restored sessions
                    this.$nextTick(() => {
                        this.sessions.forEach(session => {
                            const initResult = this.initTerminal(session, `terminal-${session.id}`);
                            if (initResult) {
                                session.terminal = initResult.term;
                                session.fitAddon = initResult.fitAddon;
                                this.connectWebSocket(session);
                            }
                        });
                        // Switch to initial session to ensure fit
                        if (this.activeSessionId) this.switchSession(this.activeSessionId);
                    });
                }
            } catch (error) {
                console.error('Error checking status:', error);
            }
        },

        saveSessionState() {
            const state = {
                openPorts: this.sessions.map(s => s.port),
                activePort: this.activeSession ? this.activeSession.port : null,
                layoutGroups: this.layoutGroups.map(g => ({
                    id: g.id,
                    sessionIds: g.sessionIds.map(sid => this.sessions.find(s => s.id === sid).port),
                    activePort: this.sessions.find(s => s.id === g.activeSessionId)?.port
                }))
            };
            localStorage.setItem('zfield_session_state', JSON.stringify(state));
        },

        // Toggle connection
        async toggleConnection() {
            if (this.connected) {
                await this.disconnect();
                this.activeView = 'connection'; // Open connection view to connect
            }
        },

        // Active session helpers for compatibility
        get activeSession() {
            return this.sessions.find(s => s.id === this.activeSessionId);
        },
        get terminal() {
            return this.activeSession ? this.activeSession.terminal : null;
        },
        get canRunScript() {
            // Use the reactive flag
            return this.canExecuteScripts;
        },

        updateCanExecuteScripts() {
            // Update the reactive flag based on current state
            if (this.runningScript !== null) {
                this.canExecuteScripts = false;
                return;
            }
            if (!this.activeSessionId) {
                this.canExecuteScripts = false;
                return;
            }
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) {
                this.canExecuteScripts = false;
                return;
            }
            this.canExecuteScripts = session.connected === true && session.ws && session.ws.readyState === WebSocket.OPEN;
        },
        canExecuteScript() {
            // Update the reactive flag based on current state
            if (this.runningScript !== null) {
                this.canExecuteScripts = false;
                return;
            }
            if (!this.activeSessionId) {
                this.canExecuteScripts = false;
                return;
            }
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) {
                this.canExecuteScripts = false;
                return;
            }
            this.canExecuteScripts = session.connected === true && session.ws && session.ws.readyState === WebSocket.OPEN;
        },
        get terminalFitAddon() {
            return this.activeSession ? this.activeSession.fitAddon : null;
        },
        get ws() {
            return this.activeSession ? this.activeSession.ws : null;
        },
        get currentPromptBuffer() {
            return this.activeSession ? this.activeSession.promptBuffer : '';
        },
        set currentPromptBuffer(val) {
            if (this.activeSession) this.activeSession.promptBuffer = val;
        },

        // Switch active session
        switchSession(sessionId, groupId = null) {
            console.log(`Switching to session ${sessionId} in group ${groupId}`);
            this.updateCanExecuteScripts(); // Update script execution capability

            // If groupId is provided, update that group's active session
            if (groupId) {
                const groupIdx = this.layoutGroups.findIndex(g => g.id === groupId);
                if (groupIdx !== -1) {
                    this.layoutGroups[groupIdx].activeSessionId = sessionId;
                    // Force reactivity for the array
                    this.layoutGroups = [...this.layoutGroups];
                }
            } else {
                // Find which group contains this session and update it
                const groupIdx = this.layoutGroups.findIndex(g => g.sessionIds.includes(sessionId));
                if (groupIdx !== -1) {
                    this.layoutGroups[groupIdx].activeSessionId = sessionId;
                    this.layoutGroups = [...this.layoutGroups];
                }
            }

            this.activeSessionId = sessionId;
            this.updateCanExecuteScripts(); // Update script execution capability
            const session = this.activeSession;
            if (session) {
                this.currentPort = session.port;
                this.connected = session.connected;
                this.$nextTick(() => {
                    if (session.terminal) {
                        this.attachTerminalToDom(session);
                        session.terminal.focus();
                    }
                });
                this.saveSessionState();
            } else {
                this.currentPort = '';
                this.connected = false;
            }
        },

        // Close a session
        async closeSession(sessionId) {
            const session = this.sessions.find(s => s.id === sessionId);
            if (!session) return;

            // Disconnect if connected
            if (session.connected) {
                try {
                    await fetch('/api/disconnect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ port: session.port })
                    });
                } catch (e) { console.error("Disconnect error", e); }
            }

            if (session.ws) session.ws.close();

            // Find group containing this session
            const group = this.layoutGroups.find(g => g.sessionIds.includes(sessionId));
            if (group) {
                group.sessionIds = group.sessionIds.filter(id => id !== sessionId);

                // If group is empty, remove it (unless it's the last one)
                if (group.sessionIds.length === 0 && this.layoutGroups.length > 1) {
                    this.layoutGroups = this.layoutGroups.filter(g => g.id !== group.id);
                } else if (group.activeSessionId === sessionId) {
                    group.activeSessionId = group.sessionIds.length > 0 ? group.sessionIds[0] : null;
                }
            }

            this.sessions = this.sessions.filter(s => s.id !== sessionId);

            if (this.activeSessionId === sessionId) {
                this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
                if (this.activeSessionId) this.switchSession(this.activeSessionId);
            }
            this.saveSessionState();
        },

        // ============ CUSTOM COMMANDS ============

        loadAllCommands() {
            // Priority 1: Main cache (contains scanned + edited scanned + custom)
            const cached = localStorage.getItem('zephyr_commands_cache');
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    this.commandsCache = data;
                    this.commands = data.commands || [];
                    this.lastScannedTime = data.lastScanned;
                } catch (e) {
                    console.error('Error loading command cache:', e);
                }
            }

            // Legacy Support: Load from custom commands key if exists and merge
            const savedCustom = localStorage.getItem('zfield_custom_commands');
            if (savedCustom) {
                try {
                    const legacyCustom = JSON.parse(savedCustom);
                    legacyCustom.forEach(lc => {
                        const exists = this.commands.find(c => c.id === lc.id || c.name === lc.name);
                        if (!exists) {
                            lc.isCustom = true;
                            this.commands.push(lc);
                        }
                    });
                    // Clean up legacy key after migration
                    // localStorage.removeItem('zfield_custom_commands'); 
                    this.saveCachedCommands(this.commands);
                } catch (e) {
                    console.error('Error migrating legacy custom commands:', e);
                }
            }
        },

        saveCustomCommands() {
            // This is now just a wrapper for saveCachedCommands since they are unified
            this.saveCachedCommands(this.commands);
        },

        openCustomCommandModal(command = null) {
            if (command) {
                // Determine if it's a scanned command being edited for the first time
                this.customCommandModalData = {
                    id: command.id,
                    name: command.name,
                    description: command.description || '',
                    args: JSON.parse(JSON.stringify(command.args || []))
                };
            } else {
                this.customCommandModalData = {
                    id: null,
                    name: '',
                    description: '',
                    args: []
                };
            }
            this.showCustomCommandModal = true;
        },

        closeCustomCommandModal() {
            this.showCustomCommandModal = false;
        },

        addCustomCommandArg() {
            const id = 'arg_' + Math.random().toString(36).substr(2, 5);
            this.customCommandModalData.args.push({
                id: id,
                name: '',
                required: false
            });
        },

        removeCustomCommandArg(index) {
            this.customCommandModalData.args.splice(index, 1);
        },

        saveCustomCommand() {
            if (!this.customCommandModalData.name) {
                this.showStatus('Command name is required', 'error');
                return;
            }

            const modalData = this.customCommandModalData;
            const existingIdx = this.commands.findIndex(c => c.id === modalData.id);

            if (existingIdx !== -1) {
                // Update existing
                const existing = this.commands[existingIdx];
                existing.name = modalData.name;
                existing.fullName = modalData.name;
                existing.description = modalData.description;
                existing.args = JSON.parse(JSON.stringify(modalData.args));
                existing.userModified = true;
            } else {
                // Create new
                const newCmd = {
                    id: 'custom_' + Date.now(),
                    name: modalData.name,
                    fullName: modalData.name,
                    description: modalData.description,
                    args: JSON.parse(JSON.stringify(modalData.args)),
                    isCustom: true,
                    userModified: true
                };
                this.commands.push(newCmd);
            }

            this.saveCachedCommands(this.commands);
            this.showCustomCommandModal = false;
            this.showStatus('Command saved', 'success');
        },

        deleteCustomCommand(id) {
            if (confirm('Are you sure you want to delete this command?')) {
                this.commands = this.commands.filter(c => c.id !== id);
                this.saveCachedCommands(this.commands);
                this.showStatus('Command deleted', 'success');
                if (this.selectedCommand && this.selectedCommand.id === id) {
                    this.selectedCommand = null;
                }
            }
        },

        // Multi-select functionality
        toggleSelectionMode() {
            this.selectionMode = !this.selectionMode;
            if (!this.selectionMode) {
                // Clear selection when exiting mode
                this.selectedCommandIds = [];
            }
        },

        toggleCommandSelection(cmdId) {
            const index = this.selectedCommandIds.indexOf(cmdId);
            if (index > -1) {
                this.selectedCommandIds.splice(index, 1);
            } else {
                this.selectedCommandIds.push(cmdId);
            }
        },

        getVisibleCommands() {
            // Get all visible/filtered commands
            return this.commands.filter(c =>
                !this.searchCommands ||
                (c.fullName || c.name || '').toLowerCase().includes(this.searchCommands.toLowerCase()) ||
                (c.description && c.description.toLowerCase().includes(this.searchCommands.toLowerCase()))
            );
        },

        selectAllCommandsForDelete() {
            const visibleCommands = this.getVisibleCommands();
            this.selectedCommandIds = visibleCommands.map(c => c.id || (c.fullName || c.name)).filter(id => id);
        },

        deselectAllCommandsForDelete() {
            this.selectedCommandIds = [];
        },

        getSelectedCommandsCount() {
            return this.selectedCommandIds.length;
        },

        deleteSelectedCommands() {
            const count = this.selectedCommandIds.length;
            if (count === 0) return;

            if (confirm(`Are you sure you want to delete ${count} command(s)?`)) {
                // Filter out selected commands
                this.commands = this.commands.filter(c => {
                    const cmdId = c.id || (c.fullName || c.name);
                    return !this.selectedCommandIds.includes(cmdId);
                });

                // Clear selectedCommand if it was deleted
                if (this.selectedCommand && this.selectedCommandIds.includes(this.selectedCommand.id || (this.selectedCommand.fullName || this.selectedCommand.name))) {
                    this.selectedCommand = null;
                }

                // Save and clear selection
                this.saveCachedCommands(this.commands);
                this.selectedCommandIds = [];
                this.selectionMode = false;
                this.showStatus(`${count} command(s) deleted`, 'success');
            }
        },

        isCommandSelected(cmdId) {
            return this.selectedCommandIds.includes(cmdId);
        },

        // Drag & Drop Handlers
        handleDragStart(event, sessionId) {
            console.log('handleDragStart', sessionId);
            this.draggedSessionId = sessionId;
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', sessionId);
            }
            document.body.classList.add('dragging');
        },

        handleDragEnd() {
            this.draggedSessionId = null;
            this.dragOverGroupId = null;
            this.dragOverPosition = null;
            this.draggedIconId = null;
            this.dragOverIconId = null;
            document.body.classList.remove('dragging');
            document.body.classList.remove('dragging-icon');
        },

        handleIconDragStart(event, iconId) {
            this.draggedIconId = iconId;
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', iconId);
            }
            document.body.classList.add('dragging-icon');
        },

        handleIconDragOver(event, iconId) {
            event.preventDefault();
            this.dragOverIconId = iconId;
        },

        handleIconDrop(event, targetIconId) {
            event.preventDefault();
            const sourceIconId = this.draggedIconId;
            if (!sourceIconId || sourceIconId === targetIconId) return;

            const fromIdx = this.sidebarIcons.findIndex(i => i.id === sourceIconId);
            const toIdx = this.sidebarIcons.findIndex(i => i.id === targetIconId);

            if (fromIdx !== -1 && toIdx !== -1) {
                const [movedIcon] = this.sidebarIcons.splice(fromIdx, 1);
                this.sidebarIcons.splice(toIdx, 0, movedIcon);
                localStorage.setItem('zfield_icon_order', JSON.stringify(this.sidebarIcons.map(i => i.id)));
            }

            this.handleDragEnd();
        },

        handleDragOver(event, groupId, position = 'center') {
            event.preventDefault();

            let finalPosition = position;

            // If dragging over the main container, detect if it's near an edge
            if (position === 'center' && event.currentTarget.classList.contains('group')) {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const threshold = 50; // pixels from edge to trigger split

                if (x < threshold) finalPosition = 'left';
                else if (x > rect.width - threshold) finalPosition = 'right';
                else if (y < threshold) finalPosition = 'top';
                else if (y > rect.height - threshold) finalPosition = 'bottom';
            }

            if (this.dragOverGroupId !== groupId || this.dragOverPosition !== finalPosition) {
                this.dragOverGroupId = groupId;
                this.dragOverPosition = finalPosition;
            }
        },

        handleDragLeave() {
            this.dragOverGroupId = null;
            this.dragOverPosition = null;
        },

        handleDrop(event, targetGroupId, position = 'center') {
            event.preventDefault();
            const sessionId = this.draggedSessionId;
            if (!sessionId) return;

            // Use the calculated dragOverPosition if we're dropping in 'center' and have a more specific one
            const effectivePosition = (position === 'center' && this.dragOverPosition) ? this.dragOverPosition : position;

            const sourceGroup = this.layoutGroups.find(g => g.sessionIds.includes(sessionId));
            const targetGroup = this.layoutGroups.find(g => g.id === targetGroupId);

            if (!sourceGroup || !targetGroup) return;

            if (effectivePosition === 'center' || (sourceGroup.id === targetGroup.id && effectivePosition === 'center')) {
                // Move session within the same group or to another tab bar
                if (sourceGroup.id !== targetGroup.id) {
                    sourceGroup.sessionIds = sourceGroup.sessionIds.filter(id => id !== sessionId);
                    targetGroup.sessionIds.push(sessionId);

                    // Cleanup source group if empty
                    if (sourceGroup.sessionIds.length === 0 && this.layoutGroups.length > 1) {
                        this.layoutGroups = this.layoutGroups.filter(g => g.id !== sourceGroup.id);
                    } else if (sourceGroup.activeSessionId === sessionId) {
                        sourceGroup.activeSessionId = sourceGroup.sessionIds[0];
                    }
                }
                targetGroup.activeSessionId = sessionId;
            } else {
                // Split group
                sourceGroup.sessionIds = sourceGroup.sessionIds.filter(id => id !== sessionId);

                const newGroupId = 'group_' + Math.random().toString(36).substr(2, 9);
                const newGroup = {
                    id: newGroupId,
                    sessionIds: [sessionId],
                    activeSessionId: sessionId
                };

                const targetIdx = this.layoutGroups.indexOf(targetGroup);
                if (effectivePosition === 'left' || effectivePosition === 'top') {
                    this.layoutGroups.splice(targetIdx, 0, newGroup);
                } else {
                    this.layoutGroups.splice(targetIdx + 1, 0, newGroup);
                }

                // Cleanup source group if empty
                if (sourceGroup.sessionIds.length === 0 && this.layoutGroups.length > 1) {
                    this.layoutGroups = this.layoutGroups.filter(g => g.id !== sourceGroup.id);
                } else if (sourceGroup.activeSessionId === sessionId) {
                    sourceGroup.activeSessionId = sourceGroup.sessionIds[0];
                }
            }

            this.handleDragEnd();

            this.switchSession(sessionId);

            // Refit all terminals after layout change
            this.$nextTick(() => {
                this.sessions.forEach(s => {
                    this.attachTerminalToDom(s);
                });
            });

            this.saveSessionState();
        },

        splitGroup(sessionId, position) {
            const group = this.layoutGroups.find(g => g.sessionIds.includes(sessionId));
            if (!group) return;

            this.draggedSessionId = sessionId;
            this.handleDrop({ preventDefault: () => { } }, group.id, position);
        },

        // Connect WebSocket for a specific session
        connectWebSocket(session) {
            if (!session) return;

            if (session.ws) {
                if (session.ws.readyState === WebSocket.OPEN || session.ws.readyState === WebSocket.CONNECTING) {
                    // Already connected or connecting, no need to re-connect unless port changed
                    return;
                }
                session.ws.close();
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws?port=${encodeURIComponent(session.port)}`;

            session.ws = new WebSocket(wsUrl);

            session.ws.onopen = () => {
                console.log(`WebSocket connected for ${session.port}`);
                session.connected = true; // Update reactive property
                this.updateCanExecuteScripts(); // Update reactive flag
                this.showToast(`Connected to ${session.port}`, 'success');
                // Removed automatic \r on connect to avoid prompt flooding on refresh
            };

            session.ws.onmessage = (event) => {
                if (this.commandDiscoveryInProgress && this.activeSessionId === session.id) {
                    this.discoveryCollectedData += event.data;
                }

                if (event.data.length < 100 && event.data.trim().startsWith('{')) {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'error') {
                            if (session.terminal) session.terminal.writeln('\r\n[Error] ' + data.message);
                            this.showToast(data.message, 'error');
                        }
                        return;
                    } catch (e) { }
                }

                if (session.terminal) {
                    session.terminal.write(event.data);
                }

                // Store terminal output for prompt detection
                if (!session.terminalBuffer) {
                    session.terminalBuffer = '';
                }
                session.terminalBuffer += event.data;
                // Keep buffer size reasonable (last 5000 chars)
                if (session.terminalBuffer.length > 5000) {
                    session.terminalBuffer = session.terminalBuffer.slice(-5000);
                }

                // Detect prompt string if not already detected
                if (!session.promptString || session.promptString === '') {
                    this.detectPromptString(session);
                }

                // Update counters
                this.updateCounters(session.id, event.data);

                // Process response sequences
                this.processResponseSequences(session.id, event.data);
            };

            session.ws.onerror = (error) => {
                console.error(`WebSocket error for ${session.port}:`, error);
                session.connected = false; // Update reactive property
                this.updateCanExecuteScripts(); // Update reactive flag
                // WebSocket error occurred
            };

            session.ws.onclose = () => {
                console.log(`WebSocket disconnected for ${session.port}`);
                session.connected = false; // Update reactive property
                this.updateCanExecuteScripts(); // Update reactive flag
                this.showToast(`Disconnected from ${session.port}`, 'warning');
            };
        },

        // Disconnect from active session
        async disconnect() {
            const session = this.activeSession;
            if (!session) return;

            try {
                await fetch('/api/disconnect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ port: session.port })
                });

                if (session.ws) session.ws.close();
                session.connected = false;
                this.connected = false; // Sync for global UI
            } catch (error) {
                console.error('Error disconnecting:', error);
                this.showToast('Error disconnecting: ' + error.message, 'error');
            }
        },

        get connectButtonState() {
            if (this.connecting) return 'connecting';

            let port;
            if (this.connectionMode === 'telnet') {
                if (!this.telnetHost || !this.telnetPort) return 'connect';
                port = `${this.telnetHost}:${this.telnetPort}`;
            } else {
                port = this.manualPort || this.selectedPort;
            }

            if (!port) return 'connect';

            const session = this.sessions.find(s => s.port === port && s.connected);
            if (!session) return 'connect';

            if (this.activeSessionId === session.id) return 'disconnect';
            return 'switch';
        },

        // Save settings / Toggle connection
        async saveSettings() {
            const state = this.connectButtonState;
            let portToConnect;


            if (this.connectionMode === 'telnet') {
                portToConnect = `${this.telnetHost}:${this.telnetPort}`;
            } else {
                portToConnect = this.manualPort || this.selectedPort;
            }

            // Check for disconnect FIRST
            if (state === 'disconnect') {
                await this.disconnect();
                return;
            }

            if (state === 'switch' || (this.connected && portToConnect === this.currentPort && this.sessions.find(s => s.port === portToConnect && s.connected))) {
                // Update logging settings if already connected
                try {
                    await fetch('/api/update_logging', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            port: portToConnect,
                            log_mode: this.logMode,
                            log_tx: !this.omitSent
                        })
                    });
                    localStorage.setItem('zfield_log_mode', this.logMode);
                    localStorage.setItem('zfield_omit_sent', this.omitSent);
                    localStorage.setItem('zfield_enable_command_selection_modal', this.enableCommandSelectionModal);
                    this.showToast('Logging settings updated', 'success');
                } catch (e) {
                    console.error('Failed to update logging settings:', e);
                }

                if (state === 'switch') {
                    const session = this.sessions.find(s => s.port === portToConnect);
                    this.switchSession(session.id);
                    this.showSettings = false;
                    this.activeView = 'commands';
                }
                return;
            }

            if (!portToConnect) {
                this.showToast('Please select or enter a serial port', 'error');
                return;
            }

            this.connecting = true;
            this.statusMessage = '';

            try {
                // Save manual port to localStorage
                if (this.manualPort) {
                    localStorage.setItem('zfield_manual_port', this.manualPort);
                }

                // Save logging settings to localStorage
                if (this.logFileName) {
                    localStorage.setItem('zfield_log_file_name', this.logFileName);
                }
                localStorage.setItem('zfield_log_mode', this.logMode);
                localStorage.setItem('zfield_omit_sent', this.omitSent);

                const response = await fetch('/api/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        port: portToConnect,
                        baudrate: parseInt(this.baudRate) || 115200,
                        connection_type: this.connectionMode,
                        log_file: this.logFileName,
                        log_mode: this.logMode,
                        log_tx: !this.omitSent
                    })
                });

                const data = await response.json();

                if (data.status === 'connected') {
                    // Check if session for this port already exists
                    let session = this.sessions.find(s => s.port === portToConnect);

                    if (session) {
                        // Reuse existing session
                        session.connected = true;
                        session.baudrate = parseInt(this.baudRate) || 115200;
                        this.activeSessionId = session.id;
                    } else {
                        // Create new session
                        const sessionId = 'session_' + Date.now();
                        session = {
                            id: sessionId,
                            port: portToConnect,
                            baudrate: parseInt(this.baudRate) || 115200,
                            connected: true,
                            terminal: null,
                            fitAddon: null,
                            ws: null,
                            promptBuffer: '',
                            promptString: '',
                            terminalBuffer: '' // Store terminal output for prompt detection
                        };

                        this.sessions.push(session);

                        // Add to active group or create one
                        if (this.layoutGroups.length === 0) {
                            this.layoutGroups.push({
                                id: 'group_default',
                                sessionIds: [sessionId],
                                activeSessionId: sessionId
                            });
                        } else {
                            // Find group containing currently active session or just use the first one
                            const activeGroup = this.layoutGroups.find(g => g.activeSessionId === this.activeSessionId) || this.layoutGroups[0];
                            activeGroup.sessionIds.push(sessionId);
                            activeGroup.activeSessionId = sessionId;
                        }

                        this.activeSessionId = sessionId;
                        this.updateCanExecuteScripts(); // Update script execution capability
                    }
                    this.connected = true;
                    this.currentPort = portToConnect;
                    this.showSettings = false;
                    this.activeView = 'commands';

                    // Initialize terminal (only if terminal doesn't exist yet)
                    this.$nextTick(() => {
                        if (!session.terminal) {
                            const initResult = this.initTerminal(session, `terminal-${session.id}`);
                            if (initResult) {
                                session.terminal = initResult.term;
                                session.fitAddon = initResult.fitAddon;
                                this.connectWebSocket(session);
                            }
                        } else {
                            // Reconnect WebSocket for existing terminal
                            this.connectWebSocket(session);
                        }
                    });

                    // Connection success toast handled by ws.onopen
                    this.saveSessionState();
                } else {
                    this.showToast('Failed to connect: ' + (data.message || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Error connecting:', error);
                this.showToast('Error connecting: ' + error.message, 'error');
            } finally {
                this.connecting = false;
            }
        },

        // ============ REPEAT COMMANDS LOGIC ============

        openRepeatModal(obj = null, isExisting = false) {
            if (isExisting) {
                // Editing an existing repeat command
                this.repeatModalData = {
                    id: obj.id,
                    name: obj.name,
                    command: obj.command,
                    interval: obj.interval
                };
            } else if (obj) {
                // Creating from a discovered command
                this.repeatModalData = {
                    id: null,
                    name: obj.fullName || obj.name,
                    command: obj.fullName || obj.name,
                    interval: 1.0
                };
            } else {
                // New raw command
                this.repeatModalData = {
                    id: null,
                    name: '',
                    command: '',
                    interval: 1.0
                };
            }
            this.activeView = 'repeat-create';
        },

        addRepeatCommand() {
            const data = this.repeatModalData;
            if (!data.command || !data.interval) {
                this.showStatus('Command and interval are required', 'error');
                return;
            }

            if (data.id) {
                // Update existing
                const index = this.repeatCommands.findIndex(rc => rc.id === data.id);
                if (index !== -1) {
                    const rc = this.repeatCommands[index];
                    const activeSessions = [...rc.runningSessions]; // Clone to restart

                    // Stop for all sessions
                    activeSessions.forEach(s => {
                        if (s.timerId) clearInterval(s.timerId);
                    });
                    rc.runningSessions = [];

                    // Update properties
                    rc.name = data.name || data.command;
                    rc.command = data.command;
                    rc.interval = parseFloat(data.interval);

                    // Restart for all sessions
                    activeSessions.forEach(s => {
                        const session = this.sessions.find(sess => sess.id === s.sessionId);
                        if (session && session.connected) {
                            const newRun = {
                                sessionId: session.id,
                                port: session.port,
                                timerId: null
                            };
                            this.executeRepeatCommand(rc, session);
                            newRun.timerId = setInterval(() => {
                                this.executeRepeatCommand(rc, session);
                            }, rc.interval * 1000);
                            rc.runningSessions.push(newRun);
                        }
                    });

                    this.showStatus('Repeat command updated', 'success');
                }
            } else {
                // Create new
                const newCmd = {
                    id: Date.now(),
                    name: data.name || data.command,
                    command: data.command,
                    interval: parseFloat(data.interval),
                    runningSessions: []
                };
                this.repeatCommands.push(newCmd);
                this.showStatus('Repeat command added', 'success');
            }

            this.saveRepeatCommands();
            this.activeView = 'repeat';
            if (this.terminal) this.terminal.focus();
        },

        removeRepeatCommand(id) {
            const index = this.repeatCommands.findIndex(rc => rc.id === id);
            if (index !== -1) {
                const rc = this.repeatCommands[index];
                if (rc.runningSessions) {
                    rc.runningSessions.forEach(s => {
                        if (s.timerId) clearInterval(s.timerId);
                    });
                }
                this.repeatCommands.splice(index, 1);
                this.saveRepeatCommands();
            }
            if (this.terminal) this.terminal.focus();
        },

        toggleRepeatCommand(rc) {
            const sessionId = this.activeSessionId;
            if (!sessionId) return;

            const existingSession = rc.runningSessions.find(s => s.sessionId === sessionId);

            if (existingSession) {
                // Stop for this session
                if (existingSession.timerId) {
                    clearInterval(existingSession.timerId);
                }
                rc.runningSessions = rc.runningSessions.filter(s => s.sessionId !== sessionId);
            } else {
                // Start for this session
                const session = this.activeSession;
                if (!session || !session.connected) {
                    this.showStatus('Must be connected to start repeating', 'error');
                    return;
                }

                const newRun = {
                    sessionId: session.id,
                    port: session.port,
                    timerId: null
                };

                this.executeRepeatCommand(rc, session); // Initial run
                newRun.timerId = setInterval(() => {
                    this.executeRepeatCommand(rc, session);
                }, rc.interval * 1000);

                rc.runningSessions.push(newRun);
            }
            if (this.terminal) this.terminal.focus();
        },

        executeRepeatCommand(rc, session) {
            const targetSession = session || this.activeSession;
            if (targetSession && targetSession.ws && targetSession.ws.readyState === WebSocket.OPEN) {
                const bufferToRestore = targetSession.promptBuffer;

                if (bufferToRestore) {
                    // 1. Clear current line on device (Ctrl+U)
                    targetSession.ws.send('\x15');
                }

                // 2. Send the periodic command
                targetSession.ws.send(rc.command + '\r');

                if (bufferToRestore) {
                    // 3. Restore the buffered text
                    targetSession.ws.send(bufferToRestore);
                }
            }
        },

        stopAllRepeats() {
            this.repeatCommands.forEach(rc => {
                if (rc.runningSessions) {
                    rc.runningSessions.forEach(s => {
                        if (s.timerId) clearInterval(s.timerId);
                    });
                    rc.runningSessions = [];
                }
            });
        },

        // ============ SHELL SCRIPTS CRUD METHODS ============

        openScriptModal(script = null, isEdit = false) {
            if (isEdit && script) {
                // Editing an existing script
                this.scriptModalData = {
                    id: script.id,
                    name: script.name || '',
                    commands: [...(script.commands || [])],
                    commandsText: (script.commands || []).join('\n'),
                    stopOnError: script.stopOnError !== undefined ? script.stopOnError : true
                };
            } else {
                // New script
                this.scriptModalData = {
                    id: null,
                    name: '',
                    commands: [],
                    commandsText: '',
                    stopOnError: true
                };
            }
            this.activeView = 'scripts-create';
        },

        addShellScript() {
            console.log('addShellScript called', this.scriptModalData);
            // Get values from Alpine.js proxy - access properties directly
            const name = (this.scriptModalData && this.scriptModalData.name) ? String(this.scriptModalData.name).trim() : '';
            const commandsText = (this.scriptModalData && this.scriptModalData.commandsText) ? String(this.scriptModalData.commandsText) : '';
            const stopOnError = (this.scriptModalData && this.scriptModalData.stopOnError !== undefined) ? this.scriptModalData.stopOnError : true;
            const id = (this.scriptModalData && this.scriptModalData.id) ? this.scriptModalData.id : null;

            console.log('Extracted values:', { name, commandsText, stopOnError, id, rawData: this.scriptModalData });

            // Validate name
            if (!name || name.length === 0) {
                console.error('Validation failed: name is empty');
                alert('Please enter a script name');
                this.showStatus('Script name is required', 'error');
                return;
            }

            // Parse commands from textarea
            const commands = commandsText
                .split('\n')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0 && !cmd.startsWith('#') && !cmd.toLowerCase().startsWith('rem '));

            console.log('Parsed commands:', commands);

            if (commands.length === 0) {
                this.showStatus('At least one command is required', 'error');
                return;
            }

            if (id) {
                // Update existing
                const index = this.shellScripts.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.shellScripts[index] = {
                        id: id,
                        name: name.trim(),
                        commands: commands,
                        stopOnError: stopOnError
                    };
                    this.showStatus('Script updated', 'success');
                }
            } else {
                // Create new
                const newScript = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    name: name.trim(),
                    commands: commands,
                    stopOnError: stopOnError
                };
                this.shellScripts.push(newScript);
                this.showStatus('Script added', 'success');
            }

            this.saveShellScripts();
            this.activeView = 'scripts';
            if (this.terminal) this.terminal.focus();
        },

        removeShellScript(id) {
            if (this.runningScript === id) {
                this.showStatus('Cannot delete script while it is running', 'error');
                return;
            }

            const index = this.shellScripts.findIndex(s => s.id === id);
            if (index !== -1) {
                this.shellScripts.splice(index, 1);
                this.saveShellScripts();
                this.showStatus('Script deleted', 'success');
            }
            if (this.terminal) this.terminal.focus();
        },

        importScriptFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.name.toLowerCase().endsWith('.txt')) {
                this.showStatus('Please select a .txt file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    // Split by newlines and filter empty lines
                    const commands = content
                        .split(/\r?\n/)
                        .map(cmd => cmd.trim())
                        .filter(cmd => cmd.length > 0 && !cmd.startsWith('#') && !cmd.toLowerCase().startsWith('rem '));

                    this.scriptModalData.commandsText = commands.join('\n');
                    this.scriptModalData.commands = commands;
                    this.showStatus(`Imported ${commands.length} command(s)`, 'success');
                } catch (error) {
                    console.error('Error reading file:', error);
                    this.showStatus('Error reading file', 'error');
                }
            };
            reader.onerror = () => {
                this.showStatus('Error reading file', 'error');
            };
            reader.readAsText(file);

            // Reset file input
            event.target.value = '';
        },

        exportScript(script) {
            if (!script || !script.commands || script.commands.length === 0) {
                this.showStatus('Script has no commands to export', 'error');
                return;
            }

            const content = script.commands.join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${script.name || 'script'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showStatus('Script exported', 'success');
        },

        // Helper to check if script execution is allowed
        canExecuteScript() {
            // Don't log every time - only log when checking for a specific script
            if (this.runningScript !== null) {
                return false;
            }
            if (!this.activeSessionId) {
                return false;
            }
            const session = this.sessions.find(s => s.id === this.activeSessionId);
            if (!session) {
                return false;
            }
            if (!session.ws) {
                return false;
            }
            const readyState = session.ws.readyState;
            if (readyState !== WebSocket.OPEN) {
                // Log this once to help debug
                console.log('canExecuteScript: false - websocket state:', readyState, 'OPEN=', WebSocket.OPEN);
                return false;
            }
            return true;
        },

        // ============ PROMPT DETECTION & SCRIPT EXECUTION ============

        detectPromptString(session) {
            if (!session || !session.terminalBuffer) return;

            let buffer = session.terminalBuffer;

            // Remove ANSI escape codes that might interfere with detection
            buffer = buffer.replace(/\x1b\[[0-9;]*m/g, ''); // Remove color codes
            buffer = buffer.replace(/\x1b\[[0-9]*[A-Za-z]/g, ''); // Remove other ANSI codes
            buffer = buffer.replace(/\r/g, ''); // Normalize line endings

            // Look for common prompt patterns at end of lines
            // Patterns: "uart:~$", ">", "#", "$", "zephyr:~$", etc.
            const promptPatterns = [
                /uart:~\$[\s]*$/m,
                /zephyr:~\$[\s]*$/m,
                /[\w-]+:~\$[\s]*$/m, // Generic "name:~$" pattern (check before generic patterns)
                /\$[\s]*$/m,
                />[\s]*$/m,
                /#[\s]*$/m,
            ];

            // Check last few lines for prompt patterns (from most recent to oldest)
            const lines = buffer.split('\n');
            const lastLines = lines.slice(-15); // Check last 15 lines for better detection

            // Check lines from most recent (end) to oldest (beginning)
            // This ensures we get the latest prompt, not an old one
            for (let i = lastLines.length - 1; i >= 0; i--) {
                const line = lastLines[i].trim();
                if (!line) continue; // Skip empty lines

                // Check patterns in order of specificity (most specific first)
                for (const pattern of promptPatterns) {
                    const match = line.match(pattern);
                    if (match) {
                        // Extract the prompt (remove trailing whitespace)
                        const prompt = match[0].trim();
                        if (prompt.length > 0) {
                            session.promptString = prompt;
                            console.log(`Detected prompt: "${prompt}" for session ${session.port} (from line ${i}, raw: "${line}")`);
                            return;
                        }
                    }
                }
            }

            // Also check the very end of the buffer (might be incomplete line)
            const lastPart = buffer.slice(-100).trim();
            for (const pattern of promptPatterns) {
                const match = lastPart.match(pattern);
                if (match) {
                    const prompt = match[0].trim();
                    if (prompt.length > 0) {
                        session.promptString = prompt;
                        console.log(`Detected prompt from buffer end: "${prompt}"`);
                        return;
                    }
                }
            }
        },

        async detectPromptStringActive(session) {
            // Actively detect prompt by sending newline and capturing response
            if (!session || !session.ws || session.ws.readyState !== WebSocket.OPEN) {
                return false;
            }

            console.log('Actively detecting prompt for session', session.port);
            this.showStatus('Detecting prompt...', 'info');

            // Store initial buffer state
            const initialBuffer = session.terminalBuffer || '';
            const initialBufferLength = initialBuffer.length;

            // Send newline to trigger prompt
            session.ws.send('\n');

            // Wait for response with multiple attempts
            let detected = false;
            for (let attempt = 0; attempt < 5; attempt++) {
                // Wait for response (increasing wait time)
                await new Promise(resolve => setTimeout(resolve, 300 + (attempt * 200)));

                // Check if buffer has new content
                const currentBuffer = session.terminalBuffer || '';
                if (currentBuffer.length > initialBufferLength) {
                    // New content received, try to detect prompt
                    this.detectPromptString(session);

                    if (session.promptString && session.promptString !== '') {
                        detected = true;
                        break;
                    }
                }
            }

            // If still not detected, try one more time with the full buffer
            if (!detected) {
                console.log('Final attempt: checking full buffer');
                console.log('Buffer length:', session.terminalBuffer?.length || 0);
                console.log('Last 200 chars:', session.terminalBuffer?.slice(-200) || '');
                this.detectPromptString(session);

                if (session.promptString && session.promptString !== '') {
                    detected = true;
                }
            }

            if (detected && session.promptString && session.promptString !== '') {
                console.log(`Successfully detected prompt: "${session.promptString}"`);
                this.showStatus(`Prompt detected: ${session.promptString}`, 'success');
                return true;
            } else {
                console.warn('Could not detect prompt after active detection');
                console.warn('Buffer content (last 500 chars):', session.terminalBuffer?.slice(-500) || 'No buffer');
                // Set a fallback prompt if detection fails
                session.promptString = 'uart:~$'; // Fallback to common Zephyr prompt
                console.log('Using fallback prompt: uart:~$');
                this.showStatus('Using fallback prompt: uart:~$', 'warning');
                return false;
            }
        },

        async waitForPrompt(session, timeout = 10000) {
            if (!session || !session.ws || session.ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket not connected');
            }

            // Ensure prompt string is detected
            if (!session.promptString || session.promptString === '') {
                this.detectPromptString(session);
                // If still not detected, wait a bit and try again
                if (!session.promptString || session.promptString === '') {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.detectPromptString(session);
                }
            }

            if (!session.promptString || session.promptString === '') {
                console.warn('Prompt string not detected, using fallback detection');
                // Fallback: wait a fixed time
                await new Promise(resolve => setTimeout(resolve, 1000));
                return;
            }

            const startTime = Date.now();
            const prompt = session.promptString;

            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (!session.terminalBuffer) {
                        clearInterval(checkInterval);
                        reject(new Error('Terminal buffer not available'));
                        return;
                    }

                    // Check if prompt appears at the end of buffer
                    const buffer = session.terminalBuffer;
                    const lastPart = buffer.slice(-200); // Check last 200 chars

                    if (lastPart.includes(prompt)) {
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }

                    // Check timeout
                    if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        console.warn(`Timeout waiting for prompt "${prompt}"`);
                        // Resolve anyway to continue execution
                        resolve();
                    }
                }, 100); // Check every 100ms
            });
        },

        parseRetvalResponse(buffer, startIndex = null) {
            if (!buffer) return null;

            // Remove ANSI escape codes that might interfere
            let cleanBuffer = buffer.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*[A-Za-z]/g, '');

            // Smart approach: If startIndex is provided, only look at content after that point
            // This ensures we parse the most recent retval, not an old one
            const searchBuffer = startIndex !== null && startIndex < cleanBuffer.length
                ? cleanBuffer.slice(startIndex)  // Only new content after retval was sent
                : cleanBuffer.slice(-800); // Fallback: last 800 chars if no start index

            // Look for numeric return code (including negative values like -1)
            // Common formats: "0", "1", "-1", "retval: 0", "Return code: 1", etc.
            const patterns = [
                /retval[\s:]*(-?\d+)/i,
                /return[\s]*code[\s:]*(-?\d+)/i,
            ];

            // Find all matches and get the last one (most recent)
            let lastMatch = null;
            let lastMatchPosition = -1;

            for (const pattern of patterns) {
                const regex = new RegExp(pattern, 'gi');
                let match;
                // Find all matches and track the last one
                while ((match = regex.exec(searchBuffer)) !== null) {
                    if (match.index > lastMatchPosition) {
                        lastMatch = match;
                        lastMatchPosition = match.index;
                    }
                }
            }

            if (lastMatch) {
                const code = parseInt(lastMatch[1], 10);
                if (!isNaN(code)) {
                    console.log(`Parsed retval: ${code} (from position ${lastMatchPosition})`);
                    return code;
                }
            }

            // Fallback: Look for standalone numbers in the search buffer
            // Check lines from most recent to oldest
            const lines = searchBuffer.split('\n');
            const lastLines = lines.slice(-8); // Check last 8 lines

            for (let i = lastLines.length - 1; i >= 0; i--) {
                const line = lastLines[i].trim();
                // Look for a standalone number (possibly negative)
                const numberMatch = line.match(/^(-?\d+)$/);
                if (numberMatch) {
                    const code = parseInt(numberMatch[1], 10);
                    if (!isNaN(code)) {
                        console.log(`Parsed retval: ${code} (standalone number)`);
                        return code;
                    }
                }
            }

            console.warn('Could not parse retval response');
            return null;
        },

        async executeScript(script) {
            const sessionId = this.activeSessionId;
            if (!sessionId) {
                this.showStatus('No active session', 'error');
                return;
            }

            const session = this.sessions.find(s => s.id === sessionId);
            if (!session) {
                this.showStatus('Session not found', 'error');
                return;
            }

            if (!session.ws || session.ws.readyState !== WebSocket.OPEN) {
                this.showStatus('WebSocket not connected', 'error');
                return;
            }

            if (this.runningScript !== null) {
                this.showStatus('Another script is already running', 'error');
                return;
            }

            if (!script || !script.commands || script.commands.length === 0) {
                this.showStatus('Script has no commands', 'error');
                return;
            }

            // Initialize execution state
            this.runningScript = script.id;
            let allCommandsSucceeded = true; // Track if all commands return 0
            this.scriptExecutionState[script.id] = {
                currentCommand: 0,
                totalCommands: script.commands.length,
                status: 'running',
                lastResult: null // Will be 'success' or 'error'
            };
            this.updateCanExecuteScripts(); // Update flag

            try {
                // Ensure prompt string is detected - use active detection if not set
                if (!session.promptString || session.promptString === '') {
                    await this.detectPromptStringActive(session);
                }

                // Execute commands sequentially
                for (let i = 0; i < script.commands.length; i++) {
                    const command = script.commands[i].trim();
                    if (!command) continue;

                    // Check if still connected
                    if (!session.ws || session.ws.readyState !== WebSocket.OPEN) {
                        throw new Error('WebSocket disconnected');
                    }

                    // Update execution state
                    this.scriptExecutionState[script.id].currentCommand = i + 1;

                    // Send command
                    session.ws.send(command + '\n');

                    // Wait for command to complete (prompt appears)
                    await this.waitForPrompt(session, 10000);

                    // Store buffer state before sending retval to only parse new content
                    const bufferBeforeRetval = session.terminalBuffer ? session.terminalBuffer.length : 0;

                    // Send retval command to check return code
                    session.ws.send('retval\n');

                    // Wait for retval command to complete
                    await this.waitForPrompt(session, 5000);

                    // Parse retval response - only look at content that came after we sent retval
                    const returnCode = this.parseRetvalResponse(session.terminalBuffer, bufferBeforeRetval);

                    if (returnCode !== null && returnCode !== 0) {
                        // Non-zero return code
                        allCommandsSucceeded = false;
                        if (script.stopOnError) {
                            this.showStatus(`Script stopped: Command "${command}" returned ${returnCode}`, 'error');
                            break;
                        } else {
                            this.showStatus(`Warning: Command "${command}" returned ${returnCode}`, 'warning');
                        }
                    }
                }

                // Update script execution result
                if (this.scriptExecutionState[script.id]) {
                    this.scriptExecutionState[script.id].lastResult = allCommandsSucceeded ? 'success' : 'error';
                }

                // Script completed
                if (allCommandsSucceeded) {
                    this.showStatus(`Script "${script.name}" completed successfully`, 'success');
                } else {
                    this.showStatus(`Script "${script.name}" completed with errors`, 'warning');
                }
            } catch (error) {
                console.error('Script execution error:', error);
                this.showStatus(`Script execution error: ${error.message}`, 'error');
                // Mark as error on exception
                if (this.scriptExecutionState[script.id]) {
                    this.scriptExecutionState[script.id].lastResult = 'error';
                }
            } finally {
                // Cleanup
                this.runningScript = null;
                if (this.scriptExecutionState[script.id]) {
                    this.scriptExecutionState[script.id].status = 'completed';
                }
                this.updateCanExecuteScripts(); // Update flag
            }
        },

        // Show status message
        showStatus(message, type = 'info') {
            this.statusMessage = message;
            this.statusMessageType = type;

            // Clear message after 5 seconds
            setTimeout(() => {
                this.statusMessage = '';
            }, 5000);
        },

        // Resize terminal to fit container
        resizeTerminal() {
            if (this.terminalFitAddon) {
                this.terminalFitAddon.fit();
            }
        },

        // Helper to robustly attach terminal to DOM
        attachTerminalToDom(session) {
            if (!session || !session.terminal) return;

            const containerId = `terminal-${session.id}`;
            const el = document.getElementById(containerId);

            if (!el) return;

            // If terminal is not attached yet (element property is undefined or not in DOM)
            if (!session.terminal.element || !session.terminal.element.parentNode) {
                console.log(`First time open for ${session.port}`);
                session.terminal.open(el);
                if (session.fitAddon) session.fitAddon.fit();
                return;
            }

            // If attached but to the WRONG parent (e.g. after split/move)
            if (session.terminal.element.parentNode !== el) {
                console.log(`Re-parenting terminal ${session.port} to new container`);
                el.appendChild(session.terminal.element);
                if (session.fitAddon) session.fitAddon.fit();
            } else {
                // Just refit to be safe
                if (session.fitAddon) session.fitAddon.fit();
            }
        },

        // ============ COMMAND DISCOVERY SYSTEM ============

        // Load cached commands from localStorage
        loadCachedCommands() {
            const cached = localStorage.getItem('zephyr_commands_cache');
            if (cached) {
                try {
                    this.commandsCache = JSON.parse(cached);

                    // Validate cache version and structure
                    if (!this.commandsCache.version || !this.commandsCache.commands) {
                        console.warn('Invalid cache structure, ignoring cache');
                        return false;
                    }

                    this.commands = this.commandsCache.commands || [];
                    this.lastScannedTime = this.commandsCache.lastScanned;

                    console.log(`Loaded ${this.commands.length} commands from cache`);

                    // Count commands with subcommands
                    const withSubcommands = this.commands.filter(c => c.subcommands && c.subcommands.length > 0).length;
                    if (withSubcommands > 0) {
                        console.log(`  ${withSubcommands} commands have subcommands`);
                    }

                    return true;
                } catch (error) {
                    console.error('Error loading cached commands:', error);
                    return false;
                }
            }
            return false;
        },

        // Save commands to localStorage
        saveCachedCommands(commands) {
            const cache = {
                commands: commands,
                lastScanned: new Date().toISOString(),
                version: '2.0' // Updated version to support hierarchical structure
            };

            // Use a replacer function to avoid circular references like parentCmd
            const json = JSON.stringify(cache, (key, value) => {
                if (key === 'parentCmd') return undefined;
                return value;
            });

            localStorage.setItem('zephyr_commands_cache', json);
            this.commandsCache = cache;
            this.commands = commands;
            this.lastScannedTime = cache.lastScanned;

            console.log(`Saved ${commands.length} commands to cache`);
        },

        mergeDiscoveredCommands(newCommands) {
            newCommands.forEach(newCmd => {
                // Determine if it exists (match by id or name)
                const existingIdx = this.commands.findIndex(c => c.name === newCmd.name || c.id === newCmd.id);

                if (existingIdx !== -1) {
                    const existing = this.commands[existingIdx];
                    if (!existing.userModified) {
                        // Update properties but keep ID and position
                        const { expanded, ...rest } = newCmd;
                        this.commands[existingIdx] = { ...existing, ...rest };
                    }
                } else {
                    // New command found
                    this.commands.push({
                        ...newCmd,
                        expanded: false,
                        isRoot: true
                    });
                }
            });
            this.saveCachedCommands(this.commands);
        },


        // Scan and discover commands
        async scanCommands(force = false) {
            if (!this.connected) {
                this.showStatus('Must be connected to scan commands', 'error');
                return;
            }

            // Concurrency control: prevent concurrent scans
            if (this.discoveryLock) {
                this.showStatus('Command discovery already in progress. Please wait...', 'error');
                return;
            }

            this.discoveryLock = true;
            this.loadingCommands = true;
            this.showStatus('Scanning commands...', 'info');

            try {
                // Try to load cache first (for fast startup), unless forced
                if (!force && this.loadCachedCommands()) {
                    this.showStatus('Loaded cached commands from ' + new Date(this.lastScannedTime).toLocaleString(), 'success');
                    this.showCommands = true;
                    this.loadingCommands = false;
                    this.discoveryLock = false;
                    return;
                }

                // Initiate discovery
                this.commandDiscoveryInProgress = true;
                this.discoveryCollectedData = '';
                this.discoveryStartTime = Date.now();
                this.discoveryTimeoutThreshold = 60000;
                this.showDiscoveryConfirm = false;
                this.discoveryCancelRequested = false;
                this.discoveryPaused = false;

                console.log('Starting command discovery...');

                // Send 'help' command to get list of commands
                this.sendDiscoveryCommand('help\n');

                // Wait for discovery to complete (with timeout)
                await this.waitForDiscoveryCompletion(300);

                this.showStatus('Commands scanned successfully!', 'success');
                this.showCommands = true;

                // Store top-level commands for selection modal
                // Filter to only include commands with valid id and name properties
                this.topLevelCommands = this.commands.filter(cmd =>
                    cmd && typeof cmd === 'object' && cmd.id && cmd.name
                );
                console.log('Top-level commands found:', this.topLevelCommands.length);
                console.log('enableCommandSelectionModal:', this.enableCommandSelectionModal);
                console.log('Sample command:', this.topLevelCommands[0]);

                // Always show command selection modal after initial scan
                // Initialize all commands as selected by default
                this.selectedCommandsForDeepScan = this.topLevelCommands.map(cmd => cmd.id);
                console.log('Showing command selection modal with', this.selectedCommandsForDeepScan.length, 'commands selected');
                console.log('Top-level commands:', this.topLevelCommands.map(c => c.name));

                // Show the modal
                this.showCommandSelectionModal = true;
                console.log('showCommandSelectionModal set to:', this.showCommandSelectionModal);

                // Wait for user to select commands (modal will call proceedWithDeepScan)
                return; // Exit early, proceedWithDeepScan will continue

                // If modal is disabled, proceed directly with deep scan
                console.log('Modal disabled, proceeding directly with deep scan');
                await this.proceedWithDeepScan();
            } catch (error) {
                console.error('Error scanning commands:', error);
                if (!this.discoveryCancelRequested) {
                    this.showStatus('Error scanning commands: ' + error.message, 'error');
                }
                console.log('Collected data:', this.discoveryCollectedData.substring(0, 500));
                this.loadingCommands = false;
                this.commandDiscoveryInProgress = false;
                this.discoveryLock = false;
                this.discoveryProgress = { current: 0, total: 0 };
                this.discoveryCancelRequested = false;
            }
        },

        // Proceed with deep scan after command selection
        async proceedWithDeepScan() {
            this.showStatus('Discovering deep subcommands...', 'info');
            await this.discoverAllSubcommands();

            if (this.discoveryCancelRequested) {
                this.showStatus('Command discovery cancelled by user.', 'info');
            } else {
                // Strip category commands that only serve as parents and just print help text
                const initialCount = this.commands.length;
                this.commands = this.commands.filter(c => !c.isCategory || c.isCustom);
                this.saveCachedCommands(this.commands);

                const strippedCount = initialCount - this.commands.length;
                console.log(`Stripped ${strippedCount} category-only commands.`);
                this.showStatus(`All commands scanned! Found ${this.commands.length} executable commands.`, 'success');
            }

            this.loadingCommands = false;
            this.commandDiscoveryInProgress = false;
            this.discoveryLock = false;
            this.discoveryProgress = { current: 0, total: 0 };
        },

        // Cancel command selection modal (just close without proceeding)
        cancelCommandSelectionModal() {
            this.showCommandSelectionModal = false;
            this.loadingCommands = false;
            this.commandDiscoveryInProgress = false;
            this.discoveryLock = false;
            this.selectedCommandsForDeepScan = [];
        },

        // Close command selection modal and proceed
        closeCommandSelectionModal() {
            this.showCommandSelectionModal = false;
            // If no commands selected, don't proceed with deep scan
            if (this.selectedCommandsForDeepScan.length === 0) {
                this.showStatus('No commands selected for deep scan.', 'info');
                this.loadingCommands = false;
                this.commandDiscoveryInProgress = false;
                this.discoveryLock = false;
                return;
            }
            // Proceed with deep scan for selected commands only
            this.proceedWithDeepScan();
        },

        // Toggle command selection
        toggleCommandSelection(commandId) {
            const index = this.selectedCommandsForDeepScan.indexOf(commandId);
            if (index > -1) {
                this.selectedCommandsForDeepScan.splice(index, 1);
            } else {
                this.selectedCommandsForDeepScan.push(commandId);
            }
        },

        // Select all commands
        selectAllCommands() {
            this.selectedCommandsForDeepScan = this.topLevelCommands.map(cmd => cmd.id);
        },

        // Deselect all commands
        deselectAllCommands() {
            this.selectedCommandsForDeepScan = [];
        },

        // Recursive discovery for all commands and their children
        async discoverAllSubcommands() {
            if (this.commands.length === 0) return;

            // Filter to only selected commands if commands were selected
            let commandsToScan = this.commands;
            if (this.selectedCommandsForDeepScan.length > 0) {
                commandsToScan = this.commands.filter(cmd =>
                    this.selectedCommandsForDeepScan.includes(cmd.id)
                );
            }

            console.log(`Starting deep subcommand discovery for ${commandsToScan.length} top-level commands`);
            this.discoveryProgress = { current: 0, total: commandsToScan.length };

            // Start with top-level commands as base total
            const roots = commandsToScan.filter(c => c.isRoot || c.isCustom || !c.parentName);
            this.discoveryProgress = { current: 0, total: roots.length };

            for (let i = 0; i < roots.length; i++) {
                if (this.discoveryCancelRequested) {
                    console.log('Discovery cancelled, stopping subcommand discovery');
                    break;
                }

                const cmd = roots[i];
                if (cmd.isCustom) {
                    this.discoveryProgress.current++;
                    continue;
                }

                await this.discoverDeep(cmd);
                this.discoveryProgress.current++;
            }
            this.discoveryProgress = { current: 0, total: 0 };
            console.log('Deep subcommand discovery complete');
        },

        // Recursively discover subcommands for a command and its found children
        async discoverDeep(command) {
            if (this.discoveryCancelRequested) return;
            if (this.discoveringSubcommands[command.id]) return;

            // Check for timeout
            if (!this.showDiscoveryConfirm && (Date.now() - this.discoveryStartTime > this.discoveryTimeoutThreshold)) {
                this.showDiscoveryConfirm = true;
                this.discoveryPaused = true;

                // Wait for user to decide
                while (this.discoveryPaused && !this.discoveryCancelRequested) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Fast polling
                }

                if (this.discoveryCancelRequested) return;
            }

            try {
                this.discoveringSubcommands[command.id] = true;
                const subcommands = await this.discoverSubcommandsInternal(command);

                if (subcommands && subcommands.length > 0) {
                    // Refined category detection:
                    // A command is a category only if it has subcommands AND its help output
                    // contains a header like "command - description".
                    const cmdName = (command.name || '').trim();
                    const cleanText = this.discoveryCollectedData.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*C/g, '');
                    const firstLines = cleanText.split('\n').slice(0, 5).map(l => l.trim()).filter(l => l.length > 0);

                    const hasCategoryHeader = firstLines.some(line => {
                        // Match "cmd - desc" or "  cmd  - desc" (allowing for indentation)
                        const regex = new RegExp(`^\\s*${cmdName}\\s*-`, 'i');
                        return regex.test(line);
                    });

                    if (hasCategoryHeader) {
                        command.isCategory = true;
                        console.log(`✓ [${cmdName}] identified as category-only command.`);
                    }

                    // Flattening: Add subcommands directly to the flat list
                    const parentIdx = this.commands.findIndex(c => c.id === command.id || (c.fullName === command.fullName));

                    for (let j = 0; j < subcommands.length; j++) {
                        const sub = subcommands[j];

                        // Additional safety check: prevent recursion if subcommand name matches last segment of parent
                        const parentFullName = command.fullName || command.name || '';
                        const parentSegments = parentFullName.trim().split(/\s+/);
                        const lastParentSegment = parentSegments[parentSegments.length - 1];

                        if (sub.name === lastParentSegment) {
                            console.log(`  ! Skipping recursive subcommand: ${sub.name} matches last segment of parent ${parentFullName}`);
                            continue;
                        }

                        // Check if already exists in flat list
                        const existingIdx = this.commands.findIndex(c => c.fullName === sub.fullName);

                        let subToRecurse = sub;
                        if (existingIdx === -1) {
                            // Insert after parent (or after previous sibling)
                            const insertAt = (parentIdx !== -1) ? parentIdx + j + 1 : this.commands.length;
                            const newSub = {
                                ...sub,
                                isRoot: false,
                                parentName: command.name
                            };
                            this.commands.splice(insertAt, 0, newSub);
                            subToRecurse = newSub;
                        } else {
                            // Update existing and use it for recursion
                            this.commands[existingIdx] = { ...this.commands[existingIdx], ...sub };
                            subToRecurse = this.commands[existingIdx];
                        }

                        // Recurse into this subcommand using the reference in this.commands
                        await this.discoverDeep(subToRecurse);
                    }

                    this.saveCachedCommands(this.commands);
                }

            } catch (error) {
                console.error(`Error in deep discovery for ${command.fullName || command.name}:`, error);
            } finally {
                this.discoveringSubcommands[command.id] = false;
            }
        },

        continueDiscovery() {
            this.showDiscoveryConfirm = false;
            this.discoveryStartTime = Date.now(); // Reset the timer
            this.discoveryTimeoutThreshold = 30000; // Set next alert to 30s
            this.discoveryPaused = false;
        },

        cancelDiscovery() {
            console.log('cancelDiscovery() called');
            this.discoveryCancelRequested = true;
            this.discoveryPaused = false; // This breaks the wait loop in discoverDeep
            this.showDiscoveryConfirm = false;
            this.showStatus('Cancelling command discovery...', 'info');

            // Immediately stop the discovery process
            this.loadingCommands = false;
            this.commandDiscoveryInProgress = false;
            this.discoveryLock = false;
            this.discoveryProgress = { current: 0, total: 0 };

            // Reset cancel flag after a short delay to allow cleanup
            setTimeout(() => {
                this.discoveryCancelRequested = false;
            }, 1000);
        },

        // Safe helper to get direct subcommands for the UI
        getDirectSubcommands(command) {
            if (!command || command.isCustom) return [];

            // Filter from the flat list based on parentName
            const parentName = command.name;
            return this.commands.filter(s => s.parentName === parentName);
        },

        // Helper to reorder commands
        moveCommand(fromId, toId) {
            if (fromId === toId) return;

            const fromIdx = this.commands.findIndex(c => (c.id || c.fullName) === fromId);
            const toIdx = this.commands.findIndex(c => (c.id || c.fullName) === toId);

            if (fromIdx !== -1 && toIdx !== -1) {
                const [moved] = this.commands.splice(fromIdx, 1);
                this.commands.splice(toIdx, 0, moved);
                this.saveCachedCommands(this.commands);

                // Highlight the moved command
                this.recentlyMovedCommandId = fromId;
                setTimeout(() => {
                    if (this.recentlyMovedCommandId === fromId) {
                        this.recentlyMovedCommandId = null;
                    }
                }, 2000);
            }
        },


        // Drag and drop state
        draggedCommand: null,
        dragOverCommand: null,


        getCommandUsage(command) {
            if (!command) return '';
            if (command.usage) return command.usage;

            // Build usage for custom commands
            let usage = command.name;
            if (command.args && command.args.length > 0) {
                command.args.forEach(arg => {
                    usage += arg.required ? ` <${arg.name}>` : ` [${arg.name}]`;
                });
            }
            return usage;
        },

        // Internal subcommand discovery (returns found subcommands)
        async discoverSubcommandsInternal(command) {
            this.commandDiscoveryInProgress = true;
            this.discoveryCollectedData = '';

            try {
                const cmdName = command.fullName || command.name;
                console.log(`Discovering subcommands for: ${cmdName}`);

                // Send '<command> --help' to get subcommands
                this.sendDiscoveryCommand(`${cmdName.trim()} --help\n`);

                // Wait for discovery to complete
                const timeout = this.getScanTimeout();
                await this.waitForSubcommandDiscovery(timeout);

                // Parse subcommands from help output
                const subcommands = this.parseSubcommands(this.discoveryCollectedData, cmdName.trim());

                // Minimal delay to avoid overwhelming the shell
                const delay = this.getScanDelay();
                await new Promise(resolve => setTimeout(resolve, delay));

                return subcommands;
            } catch (error) {
                console.error('Error discovering subcommands:', error);
                return [];
            } finally {
                this.commandDiscoveryInProgress = false;
            }
        },

        // Get scan timeout based on speed setting
        getScanTimeout() {
            switch (this.commandScanSpeed) {
                case 'fast': return 600;    // 0.6s - for responsive shells
                case 'normal': return 1000;  // 1s - balanced
                case 'slow': return 2000;    // 2s - for slow shells
                default: return 1000;
            }
        },

        // Get inter-command delay based on speed setting
        getScanDelay() {
            switch (this.commandScanSpeed) {
                case 'fast': return 5;      // 5ms - minimal delay
                case 'normal': return 10;    // 10ms - balanced
                case 'slow': return 50;      // 50ms - give shell time to breathe
                default: return 10;
            }
        },

        // Toggle commands view or scan
        toggleCommands() {
            if (this.commands.length > 0) {
                this.showCommands = true;
            } else {
                this.scanCommands();
            }
        },

        // Execute a command with args
        executeCommand(command) {
            if (!command) {
                this.showStatus('No command selected', 'error');
                return;
            }

            // Build command string with args
            // Use fullName for subcommands (e.g., "log backend"), otherwise use name
            let cmdString = command.fullName || command.name;

            if (command.args && command.args.length > 0) {
                command.args.forEach(arg => {
                    const val = this.commandArgs[arg.id];
                    if (val && val.trim()) {
                        cmdString += ' ' + val.trim();
                    }
                });
            }

            console.log('Executing command:', cmdString);

            // Send command via WebSocket
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(cmdString + '\n');

                // Clear args for next command
                this.commandArgs = {};
                this.commandResult = ''; // Clear previous result
                this.showStatus('Command sent: ' + cmdString, 'success');
            } else {
                this.showStatus('WebSocket not connected', 'error');
            }
        },

        // Quick execute command from list (with required args check)
        quickExecuteCommand(command) {
            if (!command) return;

            // Check if command has required arguments
            const hasRequiredArgs = command.args && command.args.some(arg => arg.required);

            if (hasRequiredArgs) {
                // Open command detail page to fill in required args
                this.selectedCommand = command;
                this.showStatus('Please fill in required arguments', 'info');
            } else {
                // Execute immediately if no required args
                this.executeCommand(command);
            }
        },

        // Send command during discovery
        sendDiscoveryCommand(command) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(command);
            }
        },

        // Wait for discovery to complete
        waitForDiscoveryCompletion(timeout) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                let lastDataLength = 0;
                let noDataChangedCount = 0;
                let resolved = false;

                const checkCompletion = () => {
                    if (resolved) return;

                    try {
                        // Check if we have help output with commands
                        if (this.discoveryCollectedData.includes('Available commands:')) {
                            const parsed = this.parseHelpOutput(this.discoveryCollectedData);

                            // Check for prompt at the end - definitive end signal
                            const hasPrompt = this.discoveryCollectedData.match(/[\$>] $/) ||
                                this.discoveryCollectedData.match(/\n.*[\$>] $/);

                            if (parsed.length > 0 && hasPrompt) {
                                resolved = true;
                                this.mergeDiscoveredCommands(parsed);
                                this.commandDiscoveryInProgress = false;
                                resolve();
                                return;
                            }
                        }

                        // Check if data has stopped changing
                        if (this.discoveryCollectedData.length > 0 &&
                            this.discoveryCollectedData.length === lastDataLength) {
                            noDataChangedCount++;
                            if (noDataChangedCount >= 6) { // 300ms stable
                                const parsed = this.parseHelpOutput(this.discoveryCollectedData);
                                if (parsed.length > 0) {
                                    resolved = true;
                                    this.mergeDiscoveredCommands(parsed);
                                    resolve();
                                } else {
                                    resolved = true;
                                    reject(new Error('No commands found in output'));
                                }
                                return;
                            }
                        } else {
                            noDataChangedCount = 0;
                            lastDataLength = this.discoveryCollectedData.length;
                        }

                        // Check timeout
                        const elapsed = Date.now() - startTime;
                        if (elapsed > timeout) {
                            resolved = true;
                            if (this.discoveryCollectedData.length > 0) {
                                const parsed = this.parseHelpOutput(this.discoveryCollectedData);
                                if (parsed.length > 0) {
                                    this.mergeDiscoveredCommands(parsed);
                                    resolve();
                                } else {
                                    reject(new Error('Command discovery timeout'));
                                }
                            } else {
                                reject(new Error('Command discovery timeout (no data)'));
                            }
                            return;
                        }

                        // Try again in 50ms
                        setTimeout(checkCompletion, 50);
                    } catch (e) {
                        console.error('Error in checkCompletion:', e);
                        resolved = true;
                        reject(e);
                    }
                };

                checkCompletion();
            });
        },

        // Wait for subcommand discovery to complete
        waitForSubcommandDiscovery(timeout) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                let lastDataLength = 0;
                let noDataChangedCount = 0;
                let resolved = false;

                const checkCompletion = () => {
                    if (resolved) return;

                    const elapsed = Date.now() - startTime;

                    // FAST PATH: Check if we have the prompt at the end of the buffer
                    // Improved regex to catch more prompt patterns (uart:~$, >, #, etc.)
                    if (this.discoveryCollectedData.length > 5) {
                        const endOfBuffer = this.discoveryCollectedData.slice(-50); // Check last 50 chars
                        if (endOfBuffer.match(/[\$>#]\s*$/) ||
                            endOfBuffer.match(/uart:~[\$>#]\s*$/) ||
                            endOfBuffer.match(/\n.*[\$>#]\s*$/)) {
                            console.log('Prompt detected, completing discovery immediately');
                            resolved = true;
                            resolve();
                            return;
                        }
                    }

                    // Check if data has stopped changing - speed-dependent stability check
                    const stabilityChecks = this.commandScanSpeed === 'fast' ? 2 :
                        this.commandScanSpeed === 'slow' ? 4 : 3;

                    if (this.discoveryCollectedData.length === lastDataLength) {
                        noDataChangedCount++;
                        if (noDataChangedCount >= stabilityChecks) { // 100-200ms depending on speed
                            console.log('Data stable, completing discovery');
                            resolved = true;
                            resolve();
                            return;
                        }
                    } else {
                        noDataChangedCount = 0;
                        lastDataLength = this.discoveryCollectedData.length;
                    }

                    // Check timeout
                    if (elapsed > timeout) {
                        resolved = true;
                        resolve();
                        return;
                    }

                    // Try again in 50ms
                    setTimeout(checkCompletion, 50);
                };

                checkCompletion();
            });
        },

        // Discover subcommands for a specific command
        async discoverSubcommands(command) {
            if (!this.connected) {
                this.showStatus('Must be connected to discover subcommands', 'error');
                return;
            }

            // Concurrency control: prevent concurrent discovery
            if (this.discoveryLock) {
                this.showStatus('Discovery already in progress. Please wait...', 'error');
                return;
            }

            this.discoveryLock = true;
            this.commandDiscoveryInProgress = true;
            this.discoveryCollectedData = '';

            try {
                console.log(`Discovering subcommands for: ${command.name} `);

                // Send '<command> --help' to get subcommands (Zephyr shell syntax)
                this.sendDiscoveryCommand(`${command.name} --help\n`);

                // Wait for discovery to complete (with shorter timeout for subcommands)
                await this.waitForSubcommandDiscovery(2000); // 2 seconds

                console.log(`Discovery complete.Collected ${this.discoveryCollectedData.length} chars`);

                // Parse subcommands from help output
                const newSubcommands = this.parseSubcommands(this.discoveryCollectedData, command.name);

                if (newSubcommands.length > 0) {
                    // Update command with subcommands (Merge logic)
                    const parentIdx = this.commands.findIndex(c => c.id === command.id);

                    newSubcommands.forEach((ns, idx) => {
                        const existingIdx = this.commands.findIndex(s => s.fullName === ns.fullName);
                        if (existingIdx !== -1) {
                            const existing = this.commands[existingIdx];
                            if (!existing.userModified) {
                                this.commands[existingIdx] = { ...ns, isRoot: false, parentName: command.name };
                            }
                        } else {
                            // Insert after parent
                            const insertAt = (parentIdx !== -1) ? parentIdx + idx + 1 : this.commands.length;
                            this.commands.splice(insertAt, 0, { ...ns, isRoot: false, parentName: command.name });
                        }
                    });

                    // Save updated cache
                    this.saveCachedCommands(this.commands);

                    this.showStatus(`Synced ${newSubcommands.length} subcommands for ${command.name}`, 'success');
                } else {
                    this.showStatus(`No subcommands found for ${command.name}`, 'info');
                }
            } catch (error) {
                console.error('Error discovering subcommands:', error);
                this.showStatus('Error discovering subcommands: ' + error.message, 'error');
            } finally {
                this.commandDiscoveryInProgress = false;
                this.discoveryLock = false;
            }
        },

        // Parse arguments from help text
        parseArguments(helpText) {
            const args = [];

            // Look for arguments in format: <arg> or [<arg>] or [arg]
            // Matches: <address>, [<width>], <H:M:S>, [Y-m-d], <module_0>, etc.
            // Pattern matches: <anything> or [<anything>] or [anything]
            const argPattern = /(<[^>]+>|\[<[^\]>]+>\]|\[[^\]<>]+\])/g;

            const matches = helpText.match(argPattern);

            if (matches) {
                const seen = new Set();
                matches.forEach(match => {
                    // Remove < > and [ ]
                    const cleanArg = match.replace(/[<>\[\]]/g, '');

                    // Skip duplicates
                    if (seen.has(cleanArg)) return;
                    seen.add(cleanArg);

                    // Determine if required or optional
                    // Required: starts with < (not [)
                    const required = match.startsWith('<');

                    args.push({
                        id: cleanArg,
                        name: cleanArg,
                        required: required,
                        type: 'string',
                        description: ''
                    });
                });
            }

            return args;
        },

        // Parse subcommands from '<command> --help' output
        parseSubcommands(helpText, parentCommand) {
            // Remove ANSI escape codes
            const cleanText = helpText.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*C/g, '');

            const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const subcommands = [];

            console.log(`=== PARSING SUBCOMMANDS FOR ${parentCommand} === `);
            console.log('Raw help text:', helpText.substring(0, 200));
            console.log('Clean text:', cleanText.substring(0, 200));
            console.log('Number of lines:', lines.length);
            console.log('All lines:');
            for (let i = 0; i < lines.length; i++) {
                console.log(`  [${i}]"${lines[i]}"`);
            }

            // Check if this is a simple help output (no subcommands)
            // Format: "command --help" followed by "command - Description"
            if (lines.length <= 3) {
                // Check if it's just a simple command description
                const hasSimpleFormat = lines.some(line =>
                    line.includes(parentCommand) && line.includes('-') && !line.includes('--')
                );

                if (hasSimpleFormat) {
                    console.log('✓ Simple help format detected (no subcommands)');
                    return subcommands; // Return empty array
                }
            }

            // Look for subcommand section
            let inSubcommandSection = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Look for "Subcommands:" marker specifically
                // Don't confuse with "Usage:" which can appear in main description
                if (line.toLowerCase() === 'subcommands:' ||
                    line.toLowerCase().startsWith('subcommands:')) {
                    inSubcommandSection = true;
                    console.log(`✓ Found subcommand section at line ${i}: "${line}"`);
                    continue;
                }

                if (inSubcommandSection) {
                    // Robust subcommand discovery:
                    // 1. "subcommand : Description"
                    // 2. "subcommand Description" (multiple spaces)
                    let cmdMatch = line.match(/^(\w[\w_-]*)\s+:\s*(.*)$/);
                    if (!cmdMatch) {
                        cmdMatch = line.match(/^(\w[\w_-]+)\s{2,}(.+)$/);
                    }

                    // Specific case: dynamic subcommands/args look like <arg> or [arg]
                    // If the "subcommand name" starts with < or [, it's likely an argument, not a command.
                    if (cmdMatch) {
                        const subCmdName = cmdMatch[1];

                        // If it's a dynamic argument, don't treat as a subcommand for recursion
                        if (subCmdName.startsWith('<') || subCmdName.startsWith('[')) {
                            console.log(`  ! Skipping dynamic argument as subcommand: ${subCmdName}`);
                            continue;
                        }

                        let subCmdDesc = cmdMatch[2].trim();
                        let usage = '';

                        // Skip if it looks like the parent command itself
                        if (subCmdName === parentCommand) {
                            console.log(`  ! Skipping subcommand that matches parent command: ${subCmdName}`);
                            continue;
                        }

                        // Skip if subcommand name equals the last segment of parent command
                        // This prevents recursion like "net stats iface 0" discovering "0" as a subcommand
                        const parentSegments = parentCommand.trim().split(/\s+/);
                        const lastParentSegment = parentSegments[parentSegments.length - 1];
                        if (subCmdName === lastParentSegment) {
                            console.log(`  ! Skipping subcommand that matches last segment of parent: ${subCmdName} (parent: ${parentCommand})`);
                            continue;
                        }

                        // Look ahead for continuation lines and usage info
                        let inUsageBlock = false;
                        let usageLines = [];

                        for (let j = i + 1; j < lines.length; j++) {
                            const nextLine = lines[j];

                            // Stop if we hit another command
                            if (nextLine.match(/^(\w[\w_-]*)\s+:/)) {
                                break;
                            }

                            if (nextLine.match(/^(\w[\w_-]+)\s{2,}/)) {
                                break;
                            }

                            // Check if it's a usage line
                            if (nextLine.toLowerCase().includes('usage:')) {
                                inUsageBlock = true;
                                // Extract usage text after "Usage:"
                                const usageText = nextLine.replace(/.*usage:\s*/i, '').trim();
                                if (usageText) {
                                    usageLines.push(usageText);
                                }
                                i = j;
                                continue;
                            }

                            // If in usage block, collect indented lines
                            if (inUsageBlock && nextLine.startsWith(' ')) {
                                usageLines.push(nextLine.trim());
                                i = j;
                                continue;
                            }

                            // Stop if line contains colon and not indented (likely another section)
                            if (nextLine.includes(':') && !nextLine.startsWith(' ')) {
                                break;
                            }

                            // Add continuation if it's indented or looks like a continuation
                            if (!inUsageBlock && (nextLine.startsWith(' ') || !nextLine.match(/^[A-Z]/))) {
                                subCmdDesc += ' ' + nextLine;
                                i = j;
                            } else if (!inUsageBlock) {
                                break;
                            }
                        }

                        // Build usage string
                        if (usageLines.length > 0) {
                            usage = usageLines.join(' ');
                        }

                        // Parse arguments from description and usage
                        const fullText = subCmdDesc + ' ' + usage;
                        const args = this.parseArguments(fullText);

                        subcommands.push({
                            id: `${parentCommand}_${subCmdName}`,
                            name: subCmdName,
                            fullName: `${parentCommand} ${subCmdName}`,
                            description: subCmdDesc,
                            parent: parentCommand,
                            usage: usage,
                            helpText: fullText,
                            args: args
                        });

                        console.log(`  ✓[${subCmdName}] "${subCmdDesc.substring(0, 50)}..."(${args.length} args)`);
                    }
                }
            }

            console.log(`=== RESULT: ${subcommands.length} subcommands found === `);

            if (subcommands.length === 0) {
                console.log('No subcommands found. This command may not have subcommands.');
            }

            return subcommands;
        },

        // Toggle command expansion to show/hide subcommands
        toggleCommandExpansion(command) {
            const id = command.id || (command.fullName || command.name);
            if (this.expandedCommandId === id) {
                this.expandedCommandId = null;
            } else {
                // Discover subcommands if it's a root command and hasn't been scanned
                if (command.isRoot && !command.subcommands && command.hasSubcommands !== false) {
                    this.discoverSubcommands(command);
                }
                this.expandedCommandId = id;
            }
        },

        // Parse 'help' command output to extract command list
        parseHelpOutput(helpText) {
            // Remove ANSI escape codes (like [1;32m, [24C, etc)
            const cleanText = helpText.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*C/g, '');

            const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const commands = [];
            let inCommandSection = false;

            console.log('=== PARSING HELP OUTPUT ===');
            console.log('Total non-empty lines:', lines.length);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (line.includes('Available commands:')) {
                    inCommandSection = true;
                    console.log(`✓ Found section marker at line ${i} `);
                    console.log('Next 10 lines after marker:');
                    for (let j = i + 1; j < Math.min(i + 11, lines.length); j++) {
                        console.log(`  [${j}]"${lines[j]}"`);
                    }
                    continue;
                }

                if (inCommandSection) {
                    // Match command line: "command_name            : Description here"
                    // After trimming, the format is: "command_name ... : description"
                    const cmdMatch = line.match(/^(\w[\w_]*)\s+:\s*(.*)$/);

                    if (cmdMatch) {
                        const cmdName = cmdMatch[1];
                        let cmdDesc = cmdMatch[2].trim();

                        // Look ahead for continuation lines and extract usage
                        let fullDesc = cmdDesc;
                        let usageLines = [];
                        let inUsageBlock = false;

                        for (let j = i + 1; j < lines.length; j++) {
                            const nextLine = lines[j];

                            // Stop if we hit another command (word followed by colon)
                            if (nextLine.match(/^(\w[\w_]*)\s+:/)) {
                                break;
                            }

                            // Check for Usage: marker
                            if (nextLine.toLowerCase().includes('usage:')) {
                                inUsageBlock = true;
                                const usageText = nextLine.replace(/.*usage:\s*/i, '').trim();
                                if (usageText) {
                                    usageLines.push(usageText);
                                }
                                fullDesc += ' ' + nextLine;
                                i = j;
                                continue;
                            }

                            // If in usage block, collect indented lines
                            if (inUsageBlock && nextLine.startsWith(' ')) {
                                usageLines.push(nextLine.trim());
                                fullDesc += ' ' + nextLine;
                                i = j;
                                continue;
                            }

                            // Stop if not indented and we're in usage block
                            if (inUsageBlock && !nextLine.startsWith(' ')) {
                                break;
                            }

                            // If it's clearly not a continuation, stop
                            if (nextLine.includes(':') && !nextLine.startsWith(' ')) {
                                break;
                            }

                            // Add continuation
                            fullDesc += ' ' + nextLine;
                            i = j;
                        }

                        // Parse arguments from full description
                        const args = this.parseArguments(fullDesc);

                        // Build usage string
                        let usage = '';
                        if (usageLines.length > 0) {
                            usage = usageLines.join(' ');
                        } else {
                            // Generate basic usage from command name and args
                            usage = cmdName;
                            if (args.length > 0) {
                                usage += ' ' + args.map(arg =>
                                    arg.required ? `< ${arg.name}> ` : `[<${arg.name}>]`
                                ).join(' ');
                            }
                        }

                        commands.push({
                            id: cmdName,
                            name: cmdName,
                            fullName: cmdName,
                            description: cmdDesc,
                            usage: usage,
                            helpText: fullDesc,
                            args: args,
                            hasSubcommands: null, // null = unknown, true = has, false = none
                            subcommands: null
                        });

                        console.log(`  ✓ [${cmdName}] "${cmdDesc.substring(0, 50)}..."`);
                    } else if (line.match(/^(\w[\w_]*)\s+:/)) {
                        // This is a command but regex didn't match - debug it
                        console.log(`  ⚠ Regex mismatch for: "${line.substring(0, 60)}"`);
                    }
                }
            }

            console.log(`=== RESULT: ${commands.length} commands found ===`);
            if (commands.length > 0) {
                console.log('Commands:', commands.map(c => c.name).join(', '));
            }
            return commands;
        },

        // Export commands to JSON file
        exportCommands() {
            const dataStr = JSON.stringify(this.commandsCache || { commands: this.commands, lastScanned: new Date().toISOString() }, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `zephyr_commands_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        },

        // Import commands from JSON file
        importCommands(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.commands && Array.isArray(data.commands)) {
                        this.saveCachedCommands(data.commands);
                        this.showStatus('Commands imported successfully!', 'success');
                    } else {
                        this.showStatus('Invalid commands format', 'error');
                    }
                } catch (error) {
                    this.showStatus('Error importing commands: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        },

        // Clear cached commands
        clearCommandsCache() {
            localStorage.removeItem('zephyr_commands_cache');
            this.commands = [];
            this.commandsCache = null;
            this.lastScannedTime = null;
            this.showStatus('Commands cache cleared', 'info');
        },

        // Response Sequences Functions
        loadResponseSequences() {
            const saved = localStorage.getItem('zephyr_sequences');
            if (saved) {
                try {
                    this.responseSequences = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading sequences:', e);
                }
            }
        },

        saveResponseSequences() {
            localStorage.setItem('zephyr_sequences', JSON.stringify(this.responseSequences));
        },

        openResponseSequenceModal() {
            this.responseSequenceModalData = {
                id: null,
                trigger: '',
                command: '',
                enabled: true
            };
            this.activeView = 'sequence-create';
        },

        editResponseSequence(seq) {
            this.responseSequenceModalData = JSON.parse(JSON.stringify(seq));
            this.activeView = 'sequence-create';
        },

        addResponseSequence() {
            if (!this.responseSequenceModalData.trigger || !this.responseSequenceModalData.command) {
                this.showStatus('Trigger and command are required', 'error');
                return;
            }

            if (this.responseSequenceModalData.id) {
                const idx = this.responseSequences.findIndex(s => s.id === this.responseSequenceModalData.id);
                if (idx !== -1) {
                    this.responseSequences[idx] = JSON.parse(JSON.stringify(this.responseSequenceModalData));
                }
            } else {
                const newSeq = JSON.parse(JSON.stringify(this.responseSequenceModalData));
                newSeq.id = 'seq_' + Date.now();
                this.responseSequences.push(newSeq);
            }

            this.saveResponseSequences();
            this.activeView = 'sequences';
            this.showStatus('Response sequence saved', 'success');
        },

        deleteResponseSequence(id) {
            if (confirm('Are you sure you want to delete this response sequence?')) {
                this.responseSequences = this.responseSequences.filter(s => s.id !== id);
                this.saveResponseSequences();
                this.showStatus('Sequence deleted', 'info');
            }
        },

        moveSequence(fromId, toId) {
            if (fromId === toId) return;
            const fromIdx = this.responseSequences.findIndex(s => s.id === fromId);
            const toIdx = this.responseSequences.findIndex(s => s.id === toId);

            if (fromIdx !== -1 && toIdx !== -1) {
                const [moved] = this.responseSequences.splice(fromIdx, 1);
                this.responseSequences.splice(toIdx, 0, moved);
                this.saveResponseSequences();

                this.recentlyMovedSequenceId = fromId;
                setTimeout(() => {
                    if (this.recentlyMovedSequenceId === fromId) {
                        this.recentlyMovedSequenceId = null;
                    }
                }, 2000);
            }
        },

        processResponseSequences(sessionId, rawData) {
            if (!rawData || this.commandDiscoveryInProgress) return;
            // Clean ANSI
            const cleanData = rawData.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\[[0-9]*C/g, '');

            this.responseSequences.forEach(seq => {
                if (!seq.enabled || !seq.trigger || !seq.command) return;

                const search = seq.trigger;
                const bufferKey = sessionId + '_' + seq.id;
                const combined = (this.lastSequenceUpdate[bufferKey] || '') + cleanData;

                if (combined.includes(search)) {
                    console.log(`Trigger matched: "${search}" in session ${sessionId}. Executing: "${seq.command}"`);

                    // Send command to the same session that triggered it
                    const session = this.sessions.find(s => s.id === sessionId);
                    if (session && session.ws && session.ws.readyState === WebSocket.OPEN) {
                        session.ws.send(seq.command + '\n');
                    }

                    // Clear the matched part from buffer to prevent immediate re-triggering 
                    // if it happens to stay in the overlap.
                    // Actually, for simplicity we'll just reset the buffer.
                    this.lastSequenceUpdate[bufferKey] = '';
                } else {
                    // Store tail for next update
                    const tailLen = search.length - 1;
                    if (tailLen > 0) {
                        this.lastSequenceUpdate[bufferKey] = combined.slice(-tailLen);
                    } else {
                        this.lastSequenceUpdate[bufferKey] = '';
                    }
                }
            });
        }
    };
}