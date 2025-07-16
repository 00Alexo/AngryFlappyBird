import { STORAGE_KEYS, GAME_STATES, GAME_MECHANICS } from './constants.js';

export class GameState {
    constructor() {
        this.state = GAME_STATES.START;
        this.score = 0;
        this.highScore = 0;
        this.coins = 0;
        this.coinsEarnedThisGame = 0;
        this.loadHighScore();
        this.loadCoins();
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

    setCoins(newCoins) {
        this.coins = Math.max(0, newCoins);
        localStorage.setItem(STORAGE_KEYS.COINS, this.coins.toString());
        this.updateCoinsDisplay();
    }

    addCoins(amount) {
        this.coins += amount;
        localStorage.setItem(STORAGE_KEYS.COINS, this.coins.toString());
        this.updateCoinsDisplay();
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            localStorage.setItem(STORAGE_KEYS.COINS, this.coins.toString());
            this.updateCoinsDisplay();
            return true;
        }
        return false;
    }

    loadCoins() {
        this.coins = parseInt(localStorage.getItem(STORAGE_KEYS.COINS)) || 0;
        this.updateCoinsDisplay();
    }

    setHighScore(newHighScore) {
        this.highScore = Math.max(0, newHighScore);
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
        this.updateHighScoreDisplay();
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE)) || 0;
        this.updateHighScoreDisplay();
    }

    checkAndUpdateHighScore() {
        // Calculate coins earned this game
        const coinsEarned = this.score * GAME_MECHANICS.COINS_PER_POINT;
        this.coinsEarnedThisGame = coinsEarned;
        this.addCoins(coinsEarned);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
            this.updateHighScoreDisplay();
            return true; // New high score
        }
        return false;
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
