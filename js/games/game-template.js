// Game Template - Copy this file to create new games
// Replace "YourGame" with your game name throughout
export default {
    name: 'Your Game Name',
    id: 'yourgame',  // Unique ID, lowercase, no spaces
    
    // Game configuration
    config: {
        // Add your game-specific configuration here
        betAmount: 1,
        minBet: 1,
        maxBet: 100,
        // ... other config
    },
    
    // Game state
    state: {
        // Add your game state variables here
        isPlaying: false,
        currentBet: 1,
        container: null,
        // ... other state
    },
    
    // Initialize the game
    init() {
        this.createGameHTML();
        this.setupEventListeners();
        this.updateBalance();
    },
    
    // Create game HTML structure
    createGameHTML() {
        const html = `
<div id="${this.id}-backdrop" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
">
    <div id="${this.id}-container" style="
        background: linear-gradient(135deg, #1a0033 0%, #0a0014 100%);
        border-radius: 20px;
        padding: 20px;
        max-width: 900px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    ">
        <div class="game-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        ">
            <h2 style="
                color: #FFD700;
                font-size: 2rem;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            ">${this.name}</h2>
            <button onclick="gameManager.closeCurrentGame()" style="
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
            ">✖</button>
        </div>
        
        <div class="game-content" style="
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        ">
            <!-- Add your game content here -->
            <div style="
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            ">
                Game Content Goes Here
            </div>
        </div>
        
        <div class="game-controls" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 15px;
        ">
            <div class="balance-display" style="
                background: rgba(0, 255, 0, 0.1);
                border: 2px solid #00ff00;
                padding: 10px 20px;
                border-radius: 10px;
                color: #00ff00;
                font-weight: bold;
            ">
                Balance: <span id="${this.id}-balance">SC 0.00</span>
            </div>
            
            <button id="${this.id}-play-btn" onclick="gameManager.currentGame.play()" style="
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border: none;
                color: #000;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            ">
                PLAY (${this.config.betAmount} SC)
            </button>
        </div>
    </div>
</div>`;
        
        this.state.container = document.createElement('div');
        this.state.container.innerHTML = html;
        document.body.appendChild(this.state.container);
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Add your event listeners here
        // Example:
        // document.getElementById(`${this.id}-some-button`)?.addEventListener('click', () => {
        //     this.handleSomeAction();
        // });
    },
    
    // Main game play function
    play() {
        if (this.state.isPlaying) return;
        
        // Check balance
        const balance = window.BalanceAPI.getBalance();
        if (balance < this.config.betAmount) {
            this.showMessage('Not enough SC! Buy more coins!');
            return;
        }
        
        // Deduct bet
        if (!window.BalanceAPI.deductBalance(this.config.betAmount)) {
            return;
        }
        
        this.state.isPlaying = true;
        this.updateBalance();
        
        // Add your game logic here
        this.gameLogic();
    },
    
    // Game logic
    gameLogic() {
        // Implement your game logic here
        
        // Example: Random win
        const win = Math.random() > 0.5 ? this.config.betAmount * 2 : 0;
        
        if (win > 0) {
            window.BalanceAPI.addBalance(win);
            this.showMessage(`You won ${win} SC!`);
        } else {
            this.showMessage('Try again!');
        }
        
        this.state.isPlaying = false;
        this.updateBalance();
    },
    
    // Update balance display
    updateBalance() {
        const balance = window.BalanceAPI.getBalance();
        const balanceEl = document.getElementById(`${this.id}-balance`);
        if (balanceEl) {
            balanceEl.textContent = `SC ${balance.toFixed(2)}`;
        }
    },
    
    // Show message to player
    showMessage(message) {
        // Implement your message display
        console.log(message);
        // You can create a popup, notification, or update a message area
    },
    
    // Cleanup function - REQUIRED
    cleanup() {
        // Clean up your game when it closes
        // Remove event listeners, clear intervals, etc.
        if (this.state.container) {
            this.state.container.remove();
            this.state.container = null;
        }
    }
};