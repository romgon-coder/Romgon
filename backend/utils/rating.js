// ============================================
// RATING SYSTEM UTILITIES
// ============================================

const INITIAL_RATING = 1600;
const K_FACTOR = 32;

/**
 * Calculate ELO rating change
 */
function calculateEloRating(playerRating, opponentRating, score) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const newRating = playerRating + K_FACTOR * (score - expectedScore);
    return Math.round(newRating);
}

/**
 * Get rating tier info
 */
function getRatingTier(rating) {
    if (rating >= 2400) return { name: 'Grandmaster', emoji: '👑', color: '#FFD700' };
    if (rating >= 2200) return { name: 'Master', emoji: '🏆', color: '#FF69B4' };
    if (rating >= 2000) return { name: 'Expert', emoji: '⭐', color: '#FF6B6B' };
    if (rating >= 1800) return { name: 'Advanced', emoji: '🥇', color: '#F39C12' };
    if (rating >= 1600) return { name: 'Intermediate', emoji: '🥈', color: '#4ecdc4' };
    if (rating >= 1400) return { name: 'Beginner', emoji: '🥉', color: '#27ae60' };
    return { name: 'Novice', emoji: '🎯', color: '#3498db' };
}

/**
 * Calculate member level based on games
 */
function getMemberLevel(totalGames) {
    if (totalGames >= 100) return 'Gold';
    if (totalGames >= 50) return 'Silver';
    return 'Bronze';
}

module.exports = {
    INITIAL_RATING,
    K_FACTOR,
    calculateEloRating,
    getRatingTier,
    getMemberLevel
};
