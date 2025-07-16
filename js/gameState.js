import { STORAGE_KEYS, GAME_STATES, GAME_MECHANICS } from './constants.js';

// IndexedDB Storage Manager
class GameStorage {
    constructor() {
        this.dbName = 'AngryFlappyBirdDB';
        this.version = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores if they don't exist
                if (!db.objectStoreNames.contains('gameData')) {
                    const store = db.createObjectStore('gameData', { keyPath: 'key' });
                    store.createIndex('key', 'key', { unique: true });
                }
                
                if (!db.objectStoreNames.contains('achievements')) {
                    const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
                    achievementStore.createIndex('id', 'id', { unique: true });
                }
                
                if (!db.objectStoreNames.contains('statistics')) {
                    const statsStore = db.createObjectStore('statistics', { keyPath: 'key' });
                    statsStore.createIndex('key', 'key', { unique: true });
                }
            };
        });
    }

    async set(key, value) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gameData'], 'readwrite');
            const store = transaction.objectStore('gameData');
            const request = store.put({ key, value, timestamp: Date.now() });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(key, defaultValue = null) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gameData'], 'readonly');
            const store = transaction.objectStore('gameData');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveAchievement(achievement) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['achievements'], 'readwrite');
            const store = transaction.objectStore('achievements');
            const request = store.put({
                ...achievement,
                unlockedAt: Date.now()
            });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAchievements() {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['achievements'], 'readonly');
            const store = transaction.objectStore('achievements');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveStatistic(key, value) {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['statistics'], 'readwrite');
            const store = transaction.objectStore('statistics');
            const request = store.put({ key, value, updatedAt: Date.now() });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getStatistics() {
        if (!this.db) await this.initDB();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['statistics'], 'readonly');
            const store = transaction.objectStore('statistics');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Backup to localStorage as fallback
    fallbackSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('localStorage fallback failed:', e);
        }
    }

    fallbackGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('localStorage fallback failed:', e);
            return defaultValue;
        }
    }
}

export class GameState {
    constructor() {
        this.state = GAME_STATES.START;
        this.score = 0;
        this.highScore = 0;
        this.coins = 0;
        this.coinsEarnedThisGame = 0;
        this.storage = new GameStorage();
        this.loadGameData();
    }

    setState(newState) {
        this.state = newState;
    }

    getState() {
        return this.state;
    }

    resetScore() {
        this.score = 0;
        this.coinsEarnedThisGame = 0;
        this.updateScoreDisplay();
    }

    incrementScore() {
        this.score++;
        this.updateScoreDisplay();
        return this.score;
    }

    getScore() {
        return this.score;
    }

    getHighScore() {
        return this.highScore;
    }

    getCoins() {
        return this.coins;
    }

    getCoinsEarnedThisGame() {
        return this.coinsEarnedThisGame;
    }

    async setCoins(newCoins) {
        this.coins = Math.max(0, newCoins);
        try {
            await this.storage.set(STORAGE_KEYS.COINS, this.coins);
        } catch (e) {
            this.storage.fallbackSet(STORAGE_KEYS.COINS, this.coins);
        }
        this.updateCoinsDisplay();
    }

    async addCoins(amount) {
        this.coins += amount;
        try {
            await this.storage.set(STORAGE_KEYS.COINS, this.coins);
        } catch (e) {
            this.storage.fallbackSet(STORAGE_KEYS.COINS, this.coins);
        }
        this.updateCoinsDisplay();
    }

    async spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            try {
                await this.storage.set(STORAGE_KEYS.COINS, this.coins);
            } catch (e) {
                this.storage.fallbackSet(STORAGE_KEYS.COINS, this.coins);
            }
            this.updateCoinsDisplay();
            return true;
        }
        return false;
    }

    async loadGameData() {
        try {
            // Load high score
            this.highScore = await this.storage.get(STORAGE_KEYS.HIGH_SCORE, 0);
            
            // Load coins
            this.coins = await this.storage.get(STORAGE_KEYS.COINS, 0);
            
            // Load additional game statistics
            await this.loadStatistics();
            
        } catch (e) {
            console.warn('IndexedDB failed, using localStorage fallback:', e);
            this.highScore = this.storage.fallbackGet(STORAGE_KEYS.HIGH_SCORE, 0);
            this.coins = this.storage.fallbackGet(STORAGE_KEYS.COINS, 0);
        }
        
        this.updateHighScoreDisplay();
        this.updateCoinsDisplay();
    }

    async loadStatistics() {
        try {
            const stats = await this.storage.getStatistics();
            this.gameStats = {};
            
            stats.forEach(stat => {
                this.gameStats[stat.key] = stat.value;
            });
            
            // Initialize default stats if they don't exist
            if (!this.gameStats.totalGamesPlayed) {
                await this.saveStatistic('totalGamesPlayed', 0);
                await this.saveStatistic('totalScore', 0);
                await this.saveStatistic('bestStreak', 0);
                await this.saveStatistic('averageScore', 0);
            }
            
        } catch (e) {
            console.warn('Failed to load statistics:', e);
            this.gameStats = {};
        }
    }

    async saveStatistic(key, value) {
        try {
            await this.storage.saveStatistic(key, value);
            if (!this.gameStats) this.gameStats = {};
            this.gameStats[key] = value;
        } catch (e) {
            console.warn('Failed to save statistic:', e);
        }
    }

    async setHighScore(newHighScore) {
        this.highScore = Math.max(0, newHighScore);
        try {
            await this.storage.set(STORAGE_KEYS.HIGH_SCORE, this.highScore);
        } catch (e) {
            this.storage.fallbackSet(STORAGE_KEYS.HIGH_SCORE, this.highScore);
        }
        this.updateHighScoreDisplay();
    }

    async checkAndUpdateHighScore() {
        // Calculate coins earned this game
        const coinsEarned = this.score * GAME_MECHANICS.COINS_PER_POINT;
        this.coinsEarnedThisGame = coinsEarned;
        await this.addCoins(coinsEarned);
        
        // Update game statistics
        await this.updateGameStatistics();
        
        console.log(`Checking high score: current score = ${this.score}, high score = ${this.highScore}`);
        
        if (this.score > this.highScore) {
            console.log('New high score detected!');
            this.highScore = this.score;
            try {
                await this.storage.set(STORAGE_KEYS.HIGH_SCORE, this.highScore);
            } catch (e) {
                this.storage.fallbackSet(STORAGE_KEYS.HIGH_SCORE, this.highScore);
            }
            this.updateHighScoreDisplay();
            return true; // New high score
        }
        console.log('No new high score');
        return false;
    }

    async updateGameStatistics() {
        try {
            const currentStats = this.gameStats || {};
            
            // Update total games played
            const totalGames = (currentStats.totalGamesPlayed || 0) + 1;
            await this.saveStatistic('totalGamesPlayed', totalGames);
            
            // Update total score
            const totalScore = (currentStats.totalScore || 0) + this.score;
            await this.saveStatistic('totalScore', totalScore);
            
            // Update average score
            const averageScore = Math.round(totalScore / totalGames);
            await this.saveStatistic('averageScore', averageScore);
            
            // Update best streak if applicable
            if (this.score > (currentStats.bestStreak || 0)) {
                await this.saveStatistic('bestStreak', this.score);
            }
            
        } catch (e) {
            console.warn('Failed to update game statistics:', e);
        }
    }

    // Achievement system
    async unlockAchievement(achievementId, name, description) {
        try {
            const achievement = {
                id: achievementId,
                name,
                description,
                score: this.score,
                coinsEarned: this.coinsEarnedThisGame
            };
            
            await this.storage.saveAchievement(achievement);
            
            // Note: Achievement notifications are now handled by AchievementManager
            // to avoid duplicate notifications
            
        } catch (e) {
            console.warn('Failed to unlock achievement:', e);
        }
    }

    async loadAchievements() {
        try {
            const achievements = await this.storage.getAchievements();
            return achievements;
        } catch (e) {
            console.warn('Failed to load achievements:', e);
            return [];
        }
    }

    showAchievementNotification(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <h3>Achievement Unlocked!</h3>
                <p>${achievement.name}</p>
                <small>${achievement.description}</small>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Get game statistics for display
    getGameStatistics() {
        return this.gameStats || {};
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        const startHighScoreElement = document.getElementById('startHighScore');
        
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
        if (startHighScoreElement) {
            startHighScoreElement.textContent = this.highScore;
        }
    }

    updateCoinsDisplay() {
        const menuPointsElement = document.getElementById('menuPoints');
        
        if (menuPointsElement) {
            menuPointsElement.textContent = this.coins;
        }
    }
}
