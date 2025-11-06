// ============================================
// UI MANAGER - Handle Display Logic
// ============================================

class UIManager {
    constructor() {
        this.currentPage = null;
        this.pages = {};
    }

    /**
     * Register a page component
     */
    registerPage(name, component) {
        this.pages[name] = component;
    }

    /**
     * Show page
     */
    async showPage(pageName) {
        try {
            // Hide current page
            if (this.currentPage && this.pages[this.currentPage]) {
                this.pages[this.currentPage].hide();
            }

            // Show new page
            this.currentPage = pageName;
            if (this.pages[pageName]) {
                await this.pages[pageName].show();
            }
        } catch (error) {
            console.error('Error showing page:', error);
            gameState.setError('Failed to load page');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const container = document.getElementById('notifications') || document.body;
        container.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show loading spinner
     */
    showLoading(message = 'Loading...') {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(spinner);
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    /**
     * Update page content
     */
    updatePageContent(pageId, content) {
        const page = document.getElementById(pageId);
        if (page) {
            page.innerHTML = content;
        }
    }

    /**
     * Get element by ID
     */
    getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Get elements by class
     */
    getElements(className) {
        return document.querySelectorAll(`.${className}`);
    }
}

// ============================================
// PAGE COMPONENTS
// ============================================

/**
 * Login/Register Page
 */
class AuthPage {
    constructor() {
        this.element = null;
        this.isLogin = true;
    }

    async show() {
        try {
            this.element = document.getElementById('auth-page');
            if (!this.element) {
                console.error('❌ Auth page element not found');
                return;
            }
            
            // Make auth page visible
            this.element.style.display = 'block';
            
            // Setup event listeners after ensuring DOM is ready
            await this.setupEventListeners();
        } catch (error) {
            console.error('❌ Error showing auth page:', error);
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
        this.element = null;
    }

    async setupEventListeners() {
        // Use setTimeout to ensure DOM is fully ready
        return new Promise(resolve => {
            setTimeout(() => {
                try {
                    // Toggle between login and register
                    const toggleBtn = document.getElementById('toggle-auth');
                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.toggleMode();
                        });
                    }

                    // Login form
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) {
                        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
                    }

                    // Register form
                    const registerForm = document.getElementById('register-form');
                    if (registerForm) {
                        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
                    }

                    // Password toggle buttons
                    document.querySelectorAll('.toggle-password').forEach(btn => {
                        btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
                    });

                    // Password strength checker
                    const registerPassword = document.getElementById('register-password');
                    if (registerPassword) {
                        registerPassword.addEventListener('input', (e) => this.checkPasswordStrength(e));
                    }

                    // Real-time validation
                    const registerConfirm = document.getElementById('register-confirm');
                    if (registerConfirm) {
                        registerConfirm.addEventListener('input', (e) => this.validatePasswordMatch(e));
                    }

                    // Username validation
                    const registerUsername = document.getElementById('register-username');
                    if (registerUsername) {
                        registerUsername.addEventListener('input', (e) => this.validateUsername(e));
                    }

                    // Google login buttons
                    const googleLoginBtn = document.getElementById('google-login-btn');
                    const googleRegisterBtn = document.getElementById('google-register-btn');
                    if (googleLoginBtn) {
                        googleLoginBtn.addEventListener('click', () => this.handleGoogleAuth());
                    }
                    if (googleRegisterBtn) {
                        googleRegisterBtn.addEventListener('click', () => this.handleGoogleAuth());
                    }

                    // Guest mode buttons
                    const guestLoginBtn = document.getElementById('guest-login-btn');
                    const guestRegisterBtn = document.getElementById('guest-register-btn');
                    if (guestLoginBtn) {
                        guestLoginBtn.addEventListener('click', () => this.handleGuestLogin());
                    }
                    if (guestRegisterBtn) {
                        guestRegisterBtn.addEventListener('click', () => this.handleGuestLogin());
                    }
                    
                    resolve();
                } catch (error) {
                    console.error('❌ Error setting up auth page listeners:', error);
                    resolve();
                }
            }, 100);
        });
    }

    togglePasswordVisibility(e) {
        const btn = e.currentTarget;
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const showIcon = btn.querySelector('.show-icon');
        const hideIcon = btn.querySelector('.hide-icon');

        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'inline';
            } else {
                input.type = 'password';
                showIcon.style.display = 'inline';
                hideIcon.style.display = 'none';
            }
        }
    }

    checkPasswordStrength(e) {
        const password = e.target.value;
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (!strengthFill || !strengthText) return;

        let strength = 0;
        let text = 'Weak';

        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Remove all classes
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';

        if (password.length === 0) {
            text = 'Enter a password';
        } else if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            text = 'Weak password';
        } else if (strength <= 3) {
            strengthFill.classList.add('medium');
            strengthText.classList.add('medium');
            text = 'Medium password';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            text = 'Strong password';
        }

        strengthText.textContent = text;
    }

    validatePasswordMatch(e) {
        const confirmInput = e.target;
        const password = document.getElementById('register-password')?.value;
        const confirm = confirmInput.value;

        if (confirm.length === 0) {
            confirmInput.classList.remove('valid', 'invalid');
        } else if (password === confirm) {
            confirmInput.classList.remove('invalid');
            confirmInput.classList.add('valid');
        } else {
            confirmInput.classList.remove('valid');
            confirmInput.classList.add('invalid');
        }
    }

    validateUsername(e) {
        const input = e.target;
        const username = input.value;
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

        if (username.length === 0) {
            input.classList.remove('valid', 'invalid');
        } else if (usernameRegex.test(username)) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    }

    toggleMode() {
        try {
            this.isLogin = !this.isLogin;
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const toggleText = document.getElementById('toggle-text');
            const toggleLink = document.getElementById('toggle-link');
            
            if (loginForm) loginForm.style.display = this.isLogin ? 'block' : 'none';
            if (registerForm) registerForm.style.display = this.isLogin ? 'none' : 'block';
            if (toggleText) toggleText.textContent = this.isLogin ? "Don't have an account?" : "Already have an account?";
            if (toggleLink) toggleLink.textContent = this.isLogin ? 'Register' : 'Login';
        } catch (error) {
            console.error('❌ Error toggling mode:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        gameState.setLoading(true);

        try {
            const username = document.getElementById('login-username')?.value;
            const password = document.getElementById('login-password')?.value;
            const rememberMe = document.getElementById('remember-me')?.checked;
            
            if (!username || !password) {
                throw new Error('Username and password required');
            }

            const data = await apiClient.login(username, password);
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('romgon_remember', 'true');
                localStorage.setItem('romgon_username', username);
            } else {
                localStorage.removeItem('romgon_remember');
                localStorage.removeItem('romgon_username');
            }

            gameState.setUser(data.user);
            uiManager.showSuccess('🎉 Login successful! Welcome back!');
            gameState.navigateTo('lobby');
            await uiManager.showPage('lobby');
        } catch (error) {
            gameState.setError(error.message);
            uiManager.showError('❌ ' + error.message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            gameState.setLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        gameState.setLoading(true);

        try {
            const username = document.getElementById('register-username')?.value;
            const email = document.getElementById('register-email')?.value;
            const password = document.getElementById('register-password')?.value;
            const confirmPassword = document.getElementById('register-confirm')?.value;
            
            // Validation
            if (!username || !email || !password || !confirmPassword) {
                throw new Error('All fields are required');
            }

            if (username.length < 3 || username.length > 30) {
                throw new Error('Username must be between 3-30 characters');
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                throw new Error('Username can only contain letters, numbers, and underscores');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const data = await apiClient.register(username, email, password, confirmPassword);
            gameState.setUser(data.user);
            uiManager.showSuccess('🎉 Account created successfully! Welcome to ROMGON!');
            gameState.navigateTo('lobby');
            await uiManager.showPage('lobby');
        } catch (error) {
            gameState.setError(error.message);
            uiManager.showError('❌ ' + error.message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            gameState.setLoading(false);
        }
    }

    /**
     * Handle Google OAuth login
     */
    async handleGoogleAuth() {
        try {
            gameState.setLoading(true);
            uiManager.showNotification('🔍 Checking Google authentication...', 'info');
            
            // Get the API base URL
            const apiUrl = apiClient.getBaseURL().replace('/api', '');
            
            // First check if Google OAuth is configured by making a HEAD request
            const checkResponse = await fetch(`${apiUrl}/api/auth/google`, {
                method: 'GET',
                redirect: 'manual' // Don't follow redirect
            });
            
            // If we get a JSON error response, show it to the user
            if (checkResponse.status === 503 || checkResponse.status === 500) {
                const errorData = await checkResponse.json();
                uiManager.showNotification(
                    `❌ Google sign-in not available: ${errorData.message || 'Not configured'}`,
                    'error',
                    5000
                );
                console.error('Google OAuth not configured:', errorData);
                gameState.setLoading(false);
                return;
            }
            
            // If successful or redirect, proceed with OAuth flow
            uiManager.showNotification('🔍 Redirecting to Google...', 'info');
            window.location.href = `${apiUrl}/api/auth/google`;
            
        } catch (error) {
            console.error('❌ Error initiating Google auth:', error);
            uiManager.showError('Failed to connect with Google. Try email login or guest mode instead.');
            gameState.setLoading(false);
        }
    }

    /**
     * Handle Guest login (play without registration)
     */
    async handleGuestLogin() {
        try {
            gameState.setLoading(true);
            uiManager.showNotification('👤 Creating guest account...', 'info');

            // Generate random guest username
            const guestId = Math.random().toString(36).substring(2, 8);
            const guestUsername = `Guest_${guestId}`;

            // Call guest login endpoint
            const data = await apiClient.post('/auth/guest', {
                username: guestUsername
            }, { includeAuth: false });

            // Set user as guest
            const guestUser = {
                ...data.user,
                isGuest: true
            };

            gameState.setUser(guestUser);
            uiManager.showSuccess('👤 Playing as guest! Have fun!');
            gameState.navigateTo('guest');
            await uiManager.showPage('guest');
        } catch (error) {
            console.error('❌ Error creating guest account:', error);
            uiManager.showError('Failed to create guest account: ' + error.message);
            gameState.setLoading(false);
        }
    }
}

/**
 * Lobby Page - Find/Create Games
 */
class LobbyPage {
    constructor() {
        this.element = null;
    }

    async show() {
        this.element = document.getElementById('lobby-page');
        await this.loadLeaderboard();
        this.setupEventListeners();
    }

    hide() {
        this.element = null;
    }

    setupEventListeners() {
        const createBtn = document.getElementById('create-game-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createGame());
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async loadLeaderboard() {
        try {
            const data = await apiClient.getLeaderboard(10);
            this.renderLeaderboard(data.leaderboard);
        } catch (error) {
            uiManager.showError('Failed to load leaderboard');
        }
    }

    renderLeaderboard(players) {
        const leaderboardHtml = `
            <table class="leaderboard">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Rating</th>
                        <th>Games</th>
                        <th>Win Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map(p => `
                        <tr>
                            <td>${p.rank}</td>
                            <td>${p.username}</td>
                            <td>${p.rating} ${p.tier.emoji}</td>
                            <td>${p.stats.totalGames}</td>
                            <td>${p.stats.winRate}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        const container = document.getElementById('leaderboard-container');
        if (container) {
            container.innerHTML = leaderboardHtml;
        }
    }

    async createGame() {
        gameState.setLoading(true);
        try {
            const game = await apiClient.createGame(null, 'random');
            gameState.setCurrentGame(game);
            gameState.navigateTo('waiting');
            await uiManager.showPage('waiting');
        } catch (error) {
            uiManager.showError(error.message);
        } finally {
            gameState.setLoading(false);
        }
    }

    async logout() {
        try {
            await apiClient.logout();
            gameState.clearUser();
            gameState.navigateTo('login');
            await uiManager.showPage('auth');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

/**
 * Guest Page - For Guest Players
 */
class GuestPage {
    constructor() {
        this.element = null;
    }

    async show() {
        this.element = document.getElementById('guest-page');
        if (!this.element) {
            console.error('❌ Guest page element not found');
            return;
        }

        this.element.style.display = 'block';
        this.setupEventListeners();
        this.updateGuestInfo();
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Play vs AI
        const playAIBtn = document.getElementById('guest-play-ai-btn');
        if (playAIBtn) {
            playAIBtn.addEventListener('click', () => this.playVsAI());
        }

        // Random Match
        const randomMatchBtn = document.getElementById('guest-random-match-btn');
        if (randomMatchBtn) {
            randomMatchBtn.addEventListener('click', () => this.findRandomMatch());
        }

        // Local Game
        const localGameBtn = document.getElementById('guest-local-game-btn');
        if (localGameBtn) {
            localGameBtn.addEventListener('click', () => this.startLocalGame());
        }

        // Convert to full account
        const convertBtn = document.getElementById('convert-account-btn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertToFullAccount());
        }

        // Logout
        const logoutBtn = document.getElementById('guest-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    updateGuestInfo() {
        const guestUsername = document.getElementById('guest-username');
        if (guestUsername && gameState.user) {
            guestUsername.textContent = gameState.user.username;
        }
    }

    async playVsAI() {
        uiManager.showNotification('🤖 AI opponent coming soon!', 'info');
        // TODO: Implement AI game
    }

    async findRandomMatch() {
        try {
            gameState.setLoading(true);
            const game = await apiClient.createGame(null, 'random');
            gameState.setCurrentGame(game);
            uiManager.showSuccess('🎲 Searching for opponent...');
            gameState.navigateTo('waiting');
            await uiManager.showPage('waiting');
        } catch (error) {
            uiManager.showError('❌ ' + error.message);
        } finally {
            gameState.setLoading(false);
        }
    }

    async startLocalGame() {
        try {
            gameState.setLoading(true);
            // Create a local game
            const game = await apiClient.createGame(null, 'random');
            gameState.setCurrentGame(game);
            uiManager.showSuccess('📱 Starting local 2-player game...');
            gameState.navigateTo('game');
            await uiManager.showPage('game');
        } catch (error) {
            uiManager.showError('❌ ' + error.message);
        } finally {
            gameState.setLoading(false);
        }
    }

    convertToFullAccount() {
        // Show register form with guest username pre-filled
        uiManager.showNotification('✨ Create your account to save your progress!', 'info');
        gameState.navigateTo('auth');
        uiManager.showPage('auth');
        
        // Pre-fill username if possible
        setTimeout(() => {
            const registerUsername = document.getElementById('register-username');
            if (registerUsername && gameState.user) {
                registerUsername.value = gameState.user.username.replace('Guest_', '');
            }
            
            // Switch to register form
            const toggleBtn = document.getElementById('toggle-auth');
            if (toggleBtn) {
                toggleBtn.click();
            }
        }, 300);
    }

    async logout() {
        try {
            await apiClient.logout();
            gameState.clearUser();
            uiManager.showSuccess('👋 Thanks for playing!');
            gameState.navigateTo('auth');
            await uiManager.showPage('auth');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

/**
 * Game Page - Play Game
 */
class GamePage {
    constructor() {
        this.element = null;
        this.board = null;
    }

    async show() {
        this.element = document.getElementById('game-page');
        this.setupEventListeners();
        await this.loadGame();
    }

    hide() {
        this.element = null;
    }

    setupEventListeners() {
        const resignBtn = document.getElementById('resign-btn');
        if (resignBtn) {
            resignBtn.addEventListener('click', () => this.resign());
        }

        const drawBtn = document.getElementById('draw-btn');
        if (drawBtn) {
            drawBtn.addEventListener('click', () => this.offerDraw());
        }
    }

    async loadGame() {
        const game = gameState.currentGame;
        if (!game) return;

        try {
            const gameData = await apiClient.getGameState(game.gameId);
            this.renderBoard(gameData);
        } catch (error) {
            uiManager.showError('Failed to load game');
        }
    }

    renderBoard(gameData) {
        // Render game board based on gameData
        // This will be specific to your ROMGON game board logic
        console.log('Rendering board:', gameData);
    }

    async resign() {
        try {
            await apiClient.endGame(gameState.currentGame.gameId, 'resignation');
            gameState.navigateTo('lobby');
            await uiManager.showPage('lobby');
        } catch (error) {
            uiManager.showError('Failed to resign');
        }
    }

    async offerDraw() {
        uiManager.showNotification('Draw offer sent to opponent');
    }
}

/**
 * Waiting Page - Waiting for Opponent
 */
class WaitingPage {
    constructor() {
        this.element = null;
    }

    async show() {
        this.element = document.getElementById('waiting-page');
        this.setupEventListeners();
        this.displayGameInfo();
    }

    hide() {
        this.element = null;
    }

    setupEventListeners() {
        const cancelBtn = document.getElementById('cancel-waiting-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelWaiting());
        }
    }

    displayGameInfo() {
        const gameId = gameState.currentGame.gameId;
        const gameIdDisplay = document.getElementById('game-id-display');
        if (gameIdDisplay) {
            gameIdDisplay.textContent = gameId;
        }
    }

    async cancelWaiting() {
        gameState.navigateTo('lobby');
        await uiManager.showPage('lobby');
    }
}

// Export UI manager
const uiManager = new UIManager();
