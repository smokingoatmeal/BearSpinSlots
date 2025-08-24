// /js/modules/gameManager.js

export default class GameManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.loadingGame = false;
    }

    registerGame(gameId, gameConfig) {
        this.games.set(gameId, gameConfig);
    }

    async openGame(gameId) {
        if (this.loadingGame) return;

        // Close current game
        if (this.currentGame) this.closeCurrentGame();

        const gameConfig = this.games.get(gameId);
        if (!gameConfig) {
            console.error(`Game ${gameId} not found`);
            return;
        }

        this.loadingGame = true;

        try {
            this.showLoading();

            // Load the module
            const gameModule = await import(gameConfig.module);
            const game = gameModule.default;

            this.currentGame = game;
            if (game.init) game.init();

            this.hideLoading();
            this.trackGameOpen(gameId);

        } catch (err) {
            console.error(`Failed to load game ${gameId}:`, err);
            this.hideLoading();
            this.showError(`Failed to load ${gameConfig.name}.`);
        } finally {
            this.loadingGame = false;
        }
    }

    closeCurrentGame() {
        if (this.currentGame?.cleanup) this.currentGame.cleanup();
        this.currentGame = null;
    }

    showLoading() {
        if (document.getElementById('game-loading')) return;
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'game-loading';
        loadingDiv.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.9); display:flex; align-items:center;
            justify-content:center; z-index:10000; color:#FFD700; font-size:2rem;
        `;
        loadingDiv.textContent = 'Loading Game...';
        document.body.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingDiv = document.getElementById('game-loading');
        if (loadingDiv) loadingDiv.remove();
    }

    showError(message) {
        alert(message);
    }

    trackGameOpen(gameId) {
        console.log(`Game opened: ${gameId}`);
    }

    initializeGameCards() {
        document.querySelectorAll('.game-card').forEach(card => {
            const gameId = card.getAttribute('data-game');
            if (gameId && this.games.has(gameId)) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', e => {
                    e.preventDefault();
                    this.openGame(gameId);
                });
            }
        });
    }
}

// Create and register games
const gameManager = new GameManager();

// Register modular games
gameManager.registerGame('jokerspaw', {
    name: "Joker's Paw",
    module: './js/games/jokerspaw.js'
});

gameManager.registerGame('bearjack', {
    name: "BearJack",
    module: './js/games/bearjack.js'
});

gameManager.registerGame('plinko', {
    name: "Plinko",
    module: './js/games/plinko.js'
});

// Make it globally accessible
window.gameManager = gameManager;

export { gameManager };