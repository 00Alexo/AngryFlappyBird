// Achievement Manager - Handles the achievement system
export class AchievementManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.achievements = [
            { 
                id: 'first_game', 
                icon: '🎮', 
                title: 'First Flight', 
                description: 'Play your first game',
                unlocked: false
            },
            { 
                id: 'score_10', 
                icon: '🏆', 
                title: 'Getting Started', 
                description: 'Score 10 points',
                unlocked: false
            },
            { 
                id: 'score_50', 
                icon: '🥉', 
                title: 'Bronze Flyer', 
                description: 'Score 50 points',
                unlocked: false
            },
            { 
                id: 'score_100', 
                icon: '🥈', 
                title: 'Silver Flyer', 
                description: 'Score 100 points',
                unlocked: false
            },
            { 
                id: 'score_200', 
                icon: '🥇', 
                title: 'Gold Flyer', 
                description: 'Score 200 points',
                unlocked: false
            },
            { 
                id: 'coins_1000', 
                icon: '💰', 
                title: 'Coin Collector', 
                description: 'Collect 1000 coins total',
                unlocked: false
            },
            { 
                id: 'coins_5000', 
                icon: '💎', 
                title: 'Rich Bird', 
                description: 'Collect 5000 coins total',
                unlocked: false
            },
            { 
                id: 'games_played_100', 
                icon: '🎯', 
                title: 'Persistent', 
                description: 'Play 100 games',
                unlocked: false
            },
            { 
                id: 'perfect_start', 
                icon: '⭐', 
                title: 'Perfect Start', 
                description: 'Score 20 points without touching ground',
                unlocked: false
            },
            { 
                id: 'all_birds', 
                icon: '🦅', 
                title: 'Bird Collector', 
                description: 'Unlock all bird characters',
                unlocked: false
            },
            { 
                id: 'high_score_500', 
                icon: '👑', 
                title: 'King of the Sky', 
                description: 'Score 500 points',
                unlocked: false
            }
        ];
        
        this.init();
    }

    async init() {
        await this.loadAchievements();
        this.populateAchievements();
    }

    async loadAchievements() {
        try {
            const achievements = await this.gameState.loadAchievements();
            this.achievements.forEach(achievement => {
                // Check if this achievement exists in the database
                const savedAchievement = achievements.find(a => a.id === achievement.id);
                achievement.unlocked = savedAchievement ? true : false;
            });
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }

    populateAchievements() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        const achievementsProgress = document.getElementById('achievementsProgress');
        const achievementsProgressBar = document.getElementById('achievementsProgressBar');
        
        if (!achievementsGrid) return;

        // Clean up any existing tooltips
        document.querySelectorAll('.achievement-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
        
        achievementsGrid.innerHTML = '';
        
        // Calculate progress
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        const totalCount = this.achievements.length;
        const progressPercentage = (unlockedCount / totalCount) * 100;
        
        // Update progress display
        if (achievementsProgress) {
            achievementsProgress.textContent = `${unlockedCount}/${totalCount}`;
        }
        
        if (achievementsProgressBar) {
            achievementsProgressBar.style.width = `${progressPercentage}%`;
        }
        
        this.achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementItem.innerHTML = achievement.icon;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'achievement-tooltip';
            tooltip.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            // Append tooltip to body instead of achievement item for proper positioning
            document.body.appendChild(tooltip);
            
            achievementItem.addEventListener('mouseenter', (e) => {
                const rect = achievementItem.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 60}px`;
                tooltip.classList.add('show');
            });
            
            achievementItem.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
            });
            
            // Store tooltip reference for cleanup
            achievementItem.tooltip = tooltip;
            
            achievementsGrid.appendChild(achievementItem);
        });
    }

    async checkAchievements() {
        const stats = this.gameState.getGameStatistics();
        console.log('Checking achievements with stats:', stats);
        let newAchievements = [];

        for (const achievement of this.achievements) {
            if (achievement.unlocked) continue;

            let shouldUnlock = false;

            switch (achievement.id) {
                case 'first_game':
                    shouldUnlock = (stats.totalGamesPlayed || 0) >= 1;
                    console.log(`First game check: totalGamesPlayed=${stats.totalGamesPlayed}, shouldUnlock=${shouldUnlock}`);
                    break;
                case 'score_10':
                    shouldUnlock = this.gameState.getHighScore() >= 10;
                    break;
                case 'score_50':
                    shouldUnlock = this.gameState.getHighScore() >= 50;
                    break;
                case 'score_100':
                    shouldUnlock = this.gameState.getHighScore() >= 100;
                    break;
                case 'score_200':
                    shouldUnlock = this.gameState.getHighScore() >= 200;
                    break;
                case 'coins_1000':
                    shouldUnlock = this.gameState.getCoins() >= 1000;
                    break;
                case 'coins_5000':
                    shouldUnlock = this.gameState.getCoins() >= 5000;
                    break;
                case 'games_played_100':
                    shouldUnlock = (stats.totalGamesPlayed || 0) >= 100;
                    break;
                case 'high_score_500':
                    shouldUnlock = this.gameState.getHighScore() >= 500;
                    break;
                case 'all_birds':
                    // Check if all bird characters are unlocked
                    const characterManager = window.characterUI?.getCharacterManager();
                    if (characterManager) {
                        const allCharacters = characterManager.getAllCharacters();
                        shouldUnlock = allCharacters.every(char => char.owned);
                    }
                    break;
                case 'perfect_start':
                    // This would need to be tracked during gameplay
                    shouldUnlock = stats.perfectStart || false;
                    break;
            }

            if (shouldUnlock) {
                console.log(`Unlocking achievement: ${achievement.id} - ${achievement.title}`);
                achievement.unlocked = true;
                newAchievements.push(achievement);
                await this.gameState.unlockAchievement(achievement.id);
            }
        }

        // Show notifications for new achievements
        newAchievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });

        if (newAchievements.length > 0) {
            this.populateAchievements();
        }
    }

    // Silent check for initial loading - doesn't show notifications
    async silentCheckAchievements() {
        const stats = this.gameState.getGameStatistics();
        let updatedAchievements = [];

        for (const achievement of this.achievements) {
            if (achievement.unlocked) continue;

            let shouldUnlock = false;

            switch (achievement.id) {
                case 'first_game':
                    shouldUnlock = (stats.totalGamesPlayed || 0) >= 1;
                    break;
                case 'score_10':
                    shouldUnlock = this.gameState.getHighScore() >= 10;
                    break;
                case 'score_50':
                    shouldUnlock = this.gameState.getHighScore() >= 50;
                    break;
                case 'score_100':
                    shouldUnlock = this.gameState.getHighScore() >= 100;
                    break;
                case 'score_200':
                    shouldUnlock = this.gameState.getHighScore() >= 200;
                    break;
                case 'coins_1000':
                    shouldUnlock = this.gameState.getCoins() >= 1000;
                    break;
                case 'coins_5000':
                    shouldUnlock = this.gameState.getCoins() >= 5000;
                    break;
                case 'games_played_100':
                    shouldUnlock = (stats.totalGamesPlayed || 0) >= 100;
                    break;
                case 'high_score_500':
                    shouldUnlock = this.gameState.getHighScore() >= 500;
                    break;
                case 'all_birds':
                    // Check if all bird characters are unlocked
                    const characterManager = window.characterUI?.getCharacterManager();
                    if (characterManager) {
                        const allCharacters = characterManager.getAllCharacters();
                        shouldUnlock = allCharacters.every(char => char.owned);
                    }
                    break;
                case 'perfect_start':
                    // This would need to be tracked during gameplay
                    shouldUnlock = stats.perfectStart || false;
                    break;
            }

            if (shouldUnlock) {
                console.log(`Silently unlocking achievement: ${achievement.id} - ${achievement.title}`);
                achievement.unlocked = true;
                updatedAchievements.push(achievement);
                await this.gameState.unlockAchievement(achievement.id);
            }
        }

        if (updatedAchievements.length > 0) {
            this.populateAchievements();
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h3>🏆 Achievement Unlocked!</h3>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.6);
            z-index: 10000;
            opacity: 0;
            transition: all 0.6s ease;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 20px;
            font-family: 'Nunito', sans-serif;
            animation: achievementGlow 2s ease-in-out infinite;
            border: 3px solid #FFD700;
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with dramatic entrance
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 600);
        }, 4000);
    }

    // Method to trigger achievement checks manually
    async refreshAchievements() {
        await this.loadAchievements();
        this.populateAchievements();
    }
}

// CSS styles for achievement notifications
const achievementStyles = `
.achievement-notification .achievement-icon {
    font-size: 3rem;
    min-width: 80px;
    text-align: center;
    animation: bounce 0.8s ease-in-out infinite;
}

.achievement-notification .achievement-content h3 {
    margin: 0 0 10px 0;
    font-size: 1.4rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.achievement-notification .achievement-content h4 {
    margin: 0 0 6px 0;
    font-size: 1.2rem;
    color: #8B4513;
    font-weight: bold;
}

.achievement-notification .achievement-content p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.9;
    font-style: italic;
}

@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translateY(0);
    }
    40%, 43% {
        transform: translateY(-10px);
    }
    70% {
        transform: translateY(-5px);
    }
    90% {
        transform: translateY(-3px);
    }
}

@keyframes achievementGlow {
    0%, 100% {
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.6);
    }
    50% {
        box-shadow: 0 15px 50px rgba(255, 215, 0, 0.9);
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = achievementStyles;
document.head.appendChild(styleSheet);
