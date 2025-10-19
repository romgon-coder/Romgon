// ============================================
// API CLIENT - Communication with Backend
// ============================================

class APIClient {
    constructor() {
        // API Configuration
        this.baseURL = this.getBaseURL();
        this.token = this.getStoredToken();
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Determine API base URL
     */
    getBaseURL() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // Production
        return 'https://api.romgon.net/api';
    }

    /**
     * Get stored JWT token from localStorage
     */
    getStoredToken() {
        return localStorage.getItem('romgon_token');
    }

    /**
     * Store JWT token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('romgon_token', token);
    }

    /**
     * Remove stored token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('romgon_token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get headers with auth token
     */
    getHeaders(includeAuth = true) {
        const headers = { ...this.defaultHeaders };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(options.includeAuth !== false),
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Parse response
            const data = await response.json();

            // Handle errors
            if (!response.ok) {
                throw new APIError(data.error || 'Request failed', response.status, data);
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(error.message, 0, error);
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // ========== AUTHENTICATION ==========

    /**
     * Register new user
     */
    async register(username, email, password, confirmPassword) {
        const data = await this.post('/auth/register', {
            username,
            email,
            password,
            confirmPassword
        }, { includeAuth: false });

        // Store token
        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    /**
     * Login user
     */
    async login(username, password) {
        const data = await this.post('/auth/login', {
            username,
            password
        }, { includeAuth: false });

        // Store token
        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    /**
     * Verify token
     */
    async verifyToken() {
        return this.post('/auth/verify', {});
    }

    /**
     * Logout
     */
    async logout() {
        const result = await this.post('/auth/logout', {});
        this.clearToken();
        return result;
    }

    // ========== USERS ==========

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        return this.get(`/users/${userId}`);
    }

    /**
     * Get current user profile
     */
    async getCurrentUserProfile() {
        return this.get('/users/profile/me');
    }

    /**
     * Update user profile
     */
    async updateUserProfile(email) {
        return this.put('/users/profile/me', { email });
    }

    /**
     * Search users
     */
    async searchUsers(query) {
        return this.get(`/users/search/${query}`);
    }

    // ========== GAMES ==========

    /**
     * Create new game
     */
    async createGame(opponentId = null, color = 'random') {
        return this.post('/games/create', {
            opponentId,
            color
        });
    }

    /**
     * Join game
     */
    async joinGame(gameId) {
        return this.post(`/games/${gameId}/join`, {});
    }

    /**
     * Get game state
     */
    async getGameState(gameId) {
        return this.get(`/games/${gameId}`);
    }

    /**
     * Make move
     */
    async makeMove(gameId, move) {
        return this.post(`/games/${gameId}/move`, { move });
    }

    /**
     * End game
     */
    async endGame(gameId, reason, winner = null) {
        return this.post(`/games/${gameId}/end`, {
            reason,
            winner
        });
    }

    /**
     * Get player games
     */
    async getPlayerGames(userId, limit = 20) {
        return this.get(`/games/player/${userId}?limit=${limit}`);
    }

    // ========== RATINGS ==========

    /**
     * Update rating after game
     */
    async updateRating(gameId, winnerId, loser) {
        return this.post('/ratings/update', {
            gameId,
            winnerId,
            loser
        });
    }

    /**
     * Get player rating
     */
    async getPlayerRating(userId) {
        return this.get(`/ratings/${userId}`);
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(limit = 100, offset = 0) {
        return this.get(`/ratings?limit=${limit}&offset=${offset}`);
    }

    /**
     * Get rating history
     */
    async getRatingHistory(userId, limit = 50) {
        return this.get(`/ratings/${userId}/history?limit=${limit}`);
    }

    /**
     * Get global rating stats
     */
    async getGlobalRatingStats() {
        return this.get('/ratings/stats/global');
    }

    // ========== STATISTICS ==========

    /**
     * Get global statistics
     */
    async getGlobalStats() {
        return this.get('/stats/global');
    }

    /**
     * Get player statistics
     */
    async getPlayerStats(userId) {
        return this.get(`/stats/player/${userId}`);
    }

    /**
     * Get leaderboard with stats
     */
    async getLeaderboardWithStats(limit = 100, offset = 0) {
        return this.get(`/stats/leaderboard?limit=${limit}&offset=${offset}`);
    }

    /**
     * Get players by rating range
     */
    async getPlayersByRatingRange(minRating, maxRating, limit = 50) {
        return this.get(`/stats/ratings/${minRating}/${maxRating}?limit=${limit}`);
    }

    /**
     * Get head-to-head stats
     */
    async getHeadToHeadStats(userId1, userId2) {
        return this.get(`/stats/h2h/${userId1}/${userId2}`);
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Export client instance
const apiClient = new APIClient();
