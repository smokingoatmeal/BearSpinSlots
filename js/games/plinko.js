// Plinko Game Module
// Save this file as /js/games/plinko.js
export default {
    name: "Plinko",
    id: 'plinko',
    
    // Game state
    state: {
        container: null,
        game: null,
        isActive: false
    },
    
    // Initialize the game
    init() {
        this.createGameHTML();
        this.state.game = new PlinkoGame(this);
        this.state.isActive = true;
        this.state.game.updateBalanceDisplay();
    },
    
    // Create game HTML structure
    createGameHTML() {
        const html = `
<div id="plinko" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        
        /* Plinko Styles - Scoped under #plinko */
        #plinko * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #plinko .backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
        }
        
        #plinko .modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 900px;
            height: 90%;
            max-height: 700px;
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 3px solid #7b2ff7;
        }
        
        /* Header */
        #plinko .header {
            background: linear-gradient(135deg, #7b2ff7 0%, #f107a3 100%);
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 20px rgba(123, 47, 247, 0.4);
        }
        
        #plinko .title {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        #plinko .title-text {
            color: #fff;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 3px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        #plinko .title-icon {
            font-size: 32px;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        #plinko .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #plinko .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }
        
        /* Game Content */
        #plinko .game-content {
            flex: 1;
            display: flex;
            gap: 20px;
            padding: 20px;
            overflow: hidden;
        }
        
        /* Board Container */
        #plinko .board-container {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        #plinko .board-wrapper {
            position: relative;
            width: 100%;
            max-width: 500px;
            aspect-ratio: 3/4;
        }
        
        #plinko canvas {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            background: linear-gradient(180deg, #2d1b69 0%, #0f0c29 100%);
            box-shadow: 
                inset 0 0 50px rgba(123, 47, 247, 0.3),
                0 0 30px rgba(123, 47, 247, 0.2);
        }
        
        /* Multiplier Display */
        #plinko .multipliers {
            display: flex;
            justify-content: space-around;
            width: 100%;
            max-width: 500px;
            margin-top: 10px;
            padding: 0 10px;
        }
        
        #plinko .multiplier {
            flex: 1;
            text-align: center;
            padding: 8px 2px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            margin: 0 2px;
            font-weight: bold;
            font-size: 12px;
            color: #fff;
            border: 1px solid rgba(123, 47, 247, 0.3);
            transition: all 0.3s;
        }
        
        #plinko .multiplier.hit {
            animation: multiplierHit 0.5s ease;
        }
        
        @keyframes multiplierHit {
            0% { 
                transform: scale(1);
                background: rgba(0, 0, 0, 0.3);
            }
            50% { 
                transform: scale(1.2);
                background: rgba(255, 215, 0, 0.5);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            }
            100% { 
                transform: scale(1);
                background: rgba(0, 0, 0, 0.3);
            }
        }
        
        #plinko .multiplier.high { color: #ff4757; }
        #plinko .multiplier.medium { color: #ffd700; }
        #plinko .multiplier.low { color: #00ff88; }
        
        /* Controls Panel */
        #plinko .controls-panel {
            width: 320px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid rgba(123, 47, 247, 0.3);
        }
        
        /* Control Group */
        #plinko .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        #plinko .control-label {
            color: #a0a0b0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        #plinko .control-buttons {
            display: flex;
            gap: 8px;
        }
        
        #plinko .control-btn {
            flex: 1;
            padding: 10px;
            background: rgba(123, 47, 247, 0.2);
            border: 1px solid rgba(123, 47, 247, 0.4);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
            font-size: 14px;
        }
        
        #plinko .control-btn:hover:not(.active):not(:disabled) {
            background: rgba(123, 47, 247, 0.3);
            transform: translateY(-2px);
        }
        
        #plinko .control-btn.active {
            background: linear-gradient(135deg, #7b2ff7, #f107a3);
            border-color: transparent;
            box-shadow: 0 4px 15px rgba(123, 47, 247, 0.4);
        }
        
        #plinko .control-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Balance Display */
        #plinko .balance-display {
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 221, 0.2));
            border: 2px solid #00ff88;
            padding: 15px;
            border-radius: 12px;
            text-align: center;
        }
        
        #plinko .balance-label {
            color: #00ff88;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        #plinko .balance-amount {
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
        
        /* Play Button */
        #plinko .play-btn {
            background: linear-gradient(135deg, #00ff88, #00ffdd);
            color: #000;
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 900;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
        }
        
        #plinko .play-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(0, 255, 136, 0.6);
        }
        
        #plinko .play-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        #plinko .play-btn.auto-active {
            background: linear-gradient(135deg, #ff4757, #ff6348);
            animation: pulse 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        /* Auto Controls */
        #plinko .auto-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        #plinko .auto-btn {
            padding: 8px 12px;
            background: rgba(255, 71, 87, 0.2);
            border: 1px solid rgba(255, 71, 87, 0.4);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 12px;
            font-weight: 600;
        }
        
        #plinko .auto-btn:hover:not(.active) {
            background: rgba(255, 71, 87, 0.3);
        }
        
        #plinko .auto-btn.active {
            background: #ff4757;
            border-color: transparent;
        }
        
        #plinko .auto-counter {
            color: #ff4757;
            font-weight: bold;
            font-size: 14px;
            min-width: 80px;
            text-align: center;
        }
        
        /* Stats */
        #plinko .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        
        #plinko .stat {
            text-align: center;
        }
        
        #plinko .stat-label {
            color: #a0a0b0;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        
        #plinko .stat-value {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
        }
        
        #plinko .stat-value.profit { color: #00ff88; }
        #plinko .stat-value.loss { color: #ff4757; }
        
        /* Win Animation */
        #plinko .win-splash {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
            pointer-events: none;
            opacity: 0;
            z-index: 100;
        }
        
        #plinko .win-splash.show {
            animation: winSplash 1.5s ease;
        }
        
        @keyframes winSplash {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.2);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            #plinko .modal {
                width: 100%;
                height: 100%;
                max-width: none;
                max-height: none;
                border-radius: 0;
            }
            
            #plinko .game-content {
                flex-direction: column;
                padding: 10px;
                gap: 10px;
            }
            
            #plinko .controls-panel {
                width: 100%;
                padding: 15px;
            }
            
            #plinko .board-wrapper {
                max-width: 100%;
                aspect-ratio: 3/4;
            }
            
            #plinko .header {
                padding: 10px 15px;
            }
            
            #plinko .title-text {
                font-size: 24px;
            }
            
            #plinko .multiplier {
                font-size: 10px;
                padding: 6px 1px;
            }
        }
        
        @media (max-width: 480px) {
            #plinko .control-buttons {
                flex-wrap: wrap;
            }
            
            #plinko .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
    
    <div class="backdrop"></div>
    <div class="modal">
        <div class="header">
            <div class="title">
                <span class="title-icon">⚪</span>
                <span class="title-text">PLUNKO</span>
            </div>
            <button class="close-btn" onclick="window.gameManager.closeCurrentGame()">✖</button>
        </div>
        
        <div class="game-content">
            <div class="board-container">
                <div class="board-wrapper">
                    <canvas id="plinko-canvas"></canvas>
                    <div class="win-splash" id="win-splash"></div>
                </div>
                <div class="multipliers" id="multipliers"></div>
            </div>
            
            <div class="controls-panel">
                <div class="balance-display">
                    <div class="balance-label">Balance</div>
                    <div class="balance-amount">0.00 SC</div>
                </div>
                
                <div class="control-group">
                    <div class="control-label">Bet Amount</div>
                    <div class="control-buttons">
                        <button class="control-btn bet-btn active" data-bet="1">1 SC</button>
                        <button class="control-btn bet-btn" data-bet="2">2 SC</button>
                        <button class="control-btn bet-btn" data-bet="5">5 SC</button>
                        <button class="control-btn bet-btn" data-bet="10">10 SC</button>
                    </div>
                </div>
                
                <div class="control-group">
                    <div class="control-label">Risk Level</div>
                    <div class="control-buttons">
                        <button class="control-btn risk-btn" data-risk="low">LOW</button>
                        <button class="control-btn risk-btn active" data-risk="high">HIGH</button>
                    </div>
                </div>
                
                <button class="play-btn">DROP BALL</button>
                
                <div class="control-group">
                    <div class="control-label">Auto Play</div>
                    <div class="auto-controls">
                        <button class="auto-btn" data-auto="10">10</button>
                        <button class="auto-btn" data-auto="50">50</button>
                        <button class="auto-btn" data-auto="100">100</button>
                        <div class="auto-counter"></div>
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-label">Total Wagered</div>
                        <div class="stat-value" id="total-wagered">0.00</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Total Won</div>
                        <div class="stat-value" id="total-won">0.00</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Balls Dropped</div>
                        <div class="stat-value" id="balls-dropped">0</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Profit</div>
                        <div class="stat-value" id="profit">0.00</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;
        
        this.state.container = document.createElement('div');
        this.state.container.innerHTML = html;
        document.body.appendChild(this.state.container);
    },
    
    // Cleanup
    cleanup() {
        this.state.isActive = false;
        if (this.state.game) {
            this.state.game.cleanup();
        }
        if (this.state.container) {
            this.state.container.remove();
            this.state.container = null;
        }
        this.state.game = null;
    }
};

// Sound system for Plinko
class PlinkoBoop {
    constructor() {
        this.enabled = true;
        this.context = null;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    play(type) {
        if (!this.enabled || !this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        switch(type) {
            case 'drop':
                // Unique boop sound for ball drop
                osc.type = 'sine';
                osc.frequency.value = 440;
                gain.gain.value = 0.08;
                osc.frequency.exponentialRampToValueAtTime(220, this.context.currentTime + 0.1);
                osc.start();
                osc.stop(this.context.currentTime + 0.1);
                break;
            case 'win':
                // Win sound
                osc.type = 'square';
                osc.frequency.value = 523.25; // C5
                gain.gain.value = 0.06;
                osc.frequency.exponentialRampToValueAtTime(1046.5, this.context.currentTime + 0.15);
                osc.start();
                osc.stop(this.context.currentTime + 0.15);
                break;
            case 'bigwin':
                // Big win sound
                osc.type = 'sawtooth';
                osc.frequency.value = 261.63; // C4
                gain.gain.value = 0.08;
                osc.frequency.exponentialRampToValueAtTime(1046.5, this.context.currentTime + 0.3);
                osc.start();
                osc.stop(this.context.currentTime + 0.3);
                break;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Plinko Game Class
class PlinkoGame {
    constructor(gameModule) {
        this.gameModule = gameModule;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        // Game settings
        this.rows = 12;
        this.betAmount = 1;
        this.risk = 'high';
        this.balance = window.BalanceAPI.getBalance();
        
        // Game state
        this.balls = [];
        this.pegs = [];
        this.slots = [];
        this.isAutoPlaying = false;
        this.autoCount = 0;
        this.autoRemaining = 0;
        
        // Stats
        this.stats = {
            totalWagered: 0,
            totalWon: 0,
            ballsDropped: 0
        };
        
        // Physics
        this.gravity = 0.15;
        this.friction = 0.98;
        this.bounciness = 0.6;
        
        // Payouts for 12 rows
        this.payouts = {
            high: [177, 24, 8.1, 2, 0.6, 0.2, 0.2, 0.2, 0.6, 2, 8.1, 24, 177],
            low: [10, 2, 1.5, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.5, 2, 10]
        };
        
        // Sound system
        this.sound = new PlinkoBoop();
        
        this.init();
    }
    
    init() {
        // Get canvas
        this.canvas = document.getElementById('plinko-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize board
        this.initializeBoard();
        
        // Bind controls
        this.bindControls();
        
        // Update displays
        this.updateBalanceDisplay();
        this.updateMultipliers();
        this.updateStats();
        
        // Start animation loop
        this.animate();
    }
    
    resizeCanvas() {
        const wrapper = this.canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Reinitialize board with new dimensions
        if (this.pegs.length > 0) {
            this.initializeBoard();
        }
    }
    
    initializeBoard() {
        this.pegs = [];
        this.slots = [];
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const pegRadius = 3;
        const startY = height * 0.15;
        const endY = height * 0.85;
        const rowHeight = (endY - startY) / this.rows;
        
        // Create pegs
        for (let row = 0; row < this.rows; row++) {
            const pegsInRow = row + 3;
            const spacing = width / (pegsInRow + 1);
            const y = startY + row * rowHeight;
            
            for (let col = 0; col < pegsInRow; col++) {
                const x = spacing * (col + 1);
                this.pegs.push({
                    x: x,
                    y: y,
                    radius: pegRadius
                });
            }
        }
        
        // Create slots
        const slotCount = this.rows + 1;
        const slotWidth = width / (slotCount + 1);
        const slotY = height * 0.92;
        
        for (let i = 0; i < slotCount; i++) {
            const x = slotWidth * (i + 1);
            this.slots.push({
                x: x,
                y: slotY,
                width: slotWidth * 0.8,
                height: height * 0.06,
                index: i,
                multiplier: this.payouts[this.risk][i]
            });
        }
    }
    
    bindControls() {
        // Bet buttons
        document.querySelectorAll('#plinko .bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isAutoPlaying) return;
                
                document.querySelectorAll('#plinko .bet-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.betAmount = parseInt(btn.dataset.bet);
            });
        });
        
        // Risk buttons
        document.querySelectorAll('#plinko .risk-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isAutoPlaying) return;
                
                document.querySelectorAll('#plinko .risk-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.risk = btn.dataset.risk;
                
                // Update slot multipliers
                this.slots.forEach((slot, i) => {
                    slot.multiplier = this.payouts[this.risk][i];
                });
                
                this.updateMultipliers();
            });
        });
        
        // Play button
        const playBtn = document.querySelector('#plinko .play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.isAutoPlaying) {
                    this.stopAuto();
                } else {
                    this.dropBall();
                }
            });
        }
        
        // Auto buttons
        document.querySelectorAll('#plinko .auto-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isAutoPlaying) {
                    this.stopAuto();
                } else {
                    const count = parseInt(btn.dataset.auto);
                    this.startAuto(count);
                }
            });
        });
    }
    
    dropBall(isFirstInAuto = true) {
        if (this.balance < this.betAmount) {
            this.showMessage('Insufficient balance!');
            return;
        }
        
        // Play sound only on first drop (manual or first in auto sequence)
        if (isFirstInAuto) {
            this.sound.play('drop');
        }
        
        // Deduct bet
        window.BalanceAPI.deductBalance(this.betAmount);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Update stats
        this.stats.totalWagered += this.betAmount;
        this.stats.ballsDropped++;
        
        // Create ball at random position near top
        const startX = this.canvas.width / 2 + (Math.random() - 0.5) * 20;
        const ball = {
            x: startX,
            y: 30,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0,
            radius: 5,
            trail: [],
            landed: false
        };
        
        this.balls.push(ball);
        this.updateStats();
    }
    
    startAuto(count) {
        this.isAutoPlaying = true;
        this.autoCount = count;
        this.autoRemaining = count;
        
        // Update UI
        document.querySelector('#plinko .play-btn').textContent = 'STOP AUTO';
        document.querySelector('#plinko .play-btn').classList.add('auto-active');
        document.querySelectorAll('#plinko .auto-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.auto) === count);
        });
        
        this.updateAutoCounter();
        this.autoDrop();
    }
    
    stopAuto() {
        this.isAutoPlaying = false;
        this.autoRemaining = 0;
        
        // Update UI
        document.querySelector('#plinko .play-btn').textContent = 'DROP BALL';
        document.querySelector('#plinko .play-btn').classList.remove('auto-active');
        document.querySelectorAll('#plinko .auto-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.updateAutoCounter();
    }
    
    autoDrop() {
        if (!this.isAutoPlaying || this.autoRemaining <= 0) {
            this.stopAuto();
            return;
        }
        
        if (this.balance >= this.betAmount) {
            // Only play sound on first ball
            const isFirst = this.autoRemaining === this.autoCount;
            this.dropBall(isFirst);
            this.autoRemaining--;
            this.updateAutoCounter();
            
            // Schedule next drop
            setTimeout(() => this.autoDrop(), 300);
        } else {
            this.showMessage('Insufficient balance!');
            this.stopAuto();
        }
    }
    
    updateAutoCounter() {
        const counter = document.querySelector('#plinko .auto-counter');
        if (counter) {
            if (this.isAutoPlaying) {
                counter.textContent = `${this.autoRemaining} / ${this.autoCount}`;
            } else {
                counter.textContent = '';
            }
        }
    }
    
    updateBall(ball) {
        if (ball.landed) return;
        
        // Apply gravity
        ball.vy += this.gravity;
        
        // Apply friction
        ball.vx *= this.friction;
        ball.vy *= this.friction;
        
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Add to trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 10) {
            ball.trail.shift();
        }
        
        // Check peg collisions
        for (const peg of this.pegs) {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + peg.radius) {
                // Collision detected
                const angle = Math.atan2(dy, dx);
                const targetX = peg.x + Math.cos(angle) * (ball.radius + peg.radius);
                const targetY = peg.y + Math.sin(angle) * (ball.radius + peg.radius);
                
                // Move ball out of peg
                ball.x = targetX;
                ball.y = targetY;
                
                // Reflect velocity
                const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                ball.vx = Math.cos(angle) * speed * this.bounciness;
                ball.vy = Math.sin(angle) * speed * this.bounciness;
                
                // Add some randomness
                ball.vx += (Math.random() - 0.5) * 0.5;
            }
        }
        
        // Check wall collisions
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * this.bounciness;
        }
        if (ball.x + ball.radius > this.canvas.width) {
            ball.x = this.canvas.width - ball.radius;
            ball.vx = -Math.abs(ball.vx) * this.bounciness;
        }
        
        // Check if ball reached slots
        if (ball.y > this.canvas.height * 0.88) {
            // Find which slot
            for (const slot of this.slots) {
                if (Math.abs(ball.x - slot.x) < slot.width / 2) {
                    ball.landed = true;
                    this.handleWin(slot);
                    break;
                }
            }
        }
        
        // Remove if fell off screen
        if (ball.y > this.canvas.height) {
            ball.landed = true;
        }
    }
    
    handleWin(slot) {
        const winAmount = this.betAmount * slot.multiplier;
        
        // Add winnings to balance
        window.BalanceAPI.addBalance(winAmount);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Update stats
        this.stats.totalWon += winAmount;
        this.updateStats();
        
        // Play appropriate win sound
        if (slot.multiplier >= 10) {
            this.sound.play('bigwin');
        } else if (slot.multiplier >= 2) {
            this.sound.play('win');
        }
        
        // Highlight multiplier
        const multiplierElements = document.querySelectorAll('#plinko .multiplier');
        if (multiplierElements[slot.index]) {
            multiplierElements[slot.index].classList.add('hit');
            setTimeout(() => {
                multiplierElements[slot.index].classList.remove('hit');
            }, 500);
        }
        
        // Show win animation for big wins
        if (slot.multiplier >= 10) {
            this.showWinAnimation(winAmount);
        }
    }
    
    showWinAnimation(amount) {
        const splash = document.getElementById('win-splash');
        if (splash) {
            splash.textContent = `+${amount.toFixed(2)} SC`;
            splash.classList.add('show');
            setTimeout(() => {
                splash.classList.remove('show');
            }, 1500);
        }
    }
    
    showMessage(text) {
        // Could add a message display system
        console.log(text);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pegs
        this.ctx.fillStyle = '#7b2ff7';
        this.ctx.shadowColor = '#7b2ff7';
        this.ctx.shadowBlur = 10;
        
        for (const peg of this.pegs) {
            this.ctx.beginPath();
            this.ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
        
        // Draw slots
        for (const slot of this.slots) {
            // Determine color based on multiplier
            let color;
            if (slot.multiplier >= 10) {
                color = 'rgba(255, 71, 87, 0.3)';
            } else if (slot.multiplier >= 2) {
                color = 'rgba(255, 215, 0, 0.3)';
            } else {
                color = 'rgba(0, 255, 136, 0.3)';
            }
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                slot.x - slot.width / 2,
                slot.y - slot.height / 2,
                slot.width,
                slot.height
            );
            
            // Draw multiplier text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                slot.multiplier + 'x',
                slot.x,
                slot.y
            );
        }
        
        // Draw balls
        for (const ball of this.balls) {
            // Draw trail
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let i = 0; i < ball.trail.length; i++) {
                const point = ball.trail[i];
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
            
            // Draw ball
            const gradient = this.ctx.createRadialGradient(
                ball.x - 2, ball.y - 2, 0,
                ball.x, ball.y, ball.radius
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#cccccc');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw outline
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }
    
    animate() {
        // Update balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            this.updateBall(ball);
            
            // Remove landed balls after a delay
            if (ball.landed) {
                if (!ball.removeTimer) {
                    ball.removeTimer = 60; // frames
                } else {
                    ball.removeTimer--;
                    if (ball.removeTimer <= 0) {
                        this.balls.splice(i, 1);
                    }
                }
            }
        }
        
        // Draw everything
        this.draw();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateBalanceDisplay() {
        const balanceElement = document.querySelector('#plinko .balance-amount');
        if (balanceElement) {
            balanceElement.textContent = `${this.balance.toFixed(2)} SC`;
        }
    }
    
    updateMultipliers() {
        const container = document.getElementById('multipliers');
        if (!container) return;
        
        container.innerHTML = '';
        
        const multipliers = this.payouts[this.risk];
        for (let i = 0; i < multipliers.length; i++) {
            const div = document.createElement('div');
            div.className = 'multiplier';
            
            // Add color class
            if (multipliers[i] >= 10) {
                div.classList.add('high');
            } else if (multipliers[i] >= 2) {
                div.classList.add('medium');
            } else {
                div.classList.add('low');
            }
            
            div.textContent = multipliers[i] + 'x';
            container.appendChild(div);
        }
    }
    
    updateStats() {
        document.getElementById('total-wagered').textContent = this.stats.totalWagered.toFixed(2);
        document.getElementById('total-won').textContent = this.stats.totalWon.toFixed(2);
        document.getElementById('balls-dropped').textContent = this.stats.ballsDropped;
        
        const profit = this.stats.totalWon - this.stats.totalWagered;
        const profitElement = document.getElementById('profit');
        profitElement.textContent = profit.toFixed(2);
        profitElement.className = 'stat-value ' + (profit >= 0 ? 'profit' : 'loss');
    }
    
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}