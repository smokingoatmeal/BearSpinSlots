// Honey Roll 3x3 Slot Game Module
export default {
    name: 'Honey Roll',
    id: 'honeyroll',
    
    // Game configuration
    config: {
        symbols: ['🍯', '🐻', '🐝', '🥄', '🌺', '🍃'],
        symbolWeights: { 
            '🍯': 4, 
            '🐻': 6, 
            '🐝': 8, 
            '🥄': 10, 
            '🌺': 11, 
            '🍃': 12 
        },
        payouts: {
            '🍯': { 2: 10, 3: 100 },
            '🐻': { 2: 5, 3: 50 },
            '🐝': { 2: 3, 3: 25 },
            '🥄': { 2: 2, 3: 10 },
            '🌺': { 2: 1, 3: 5 },
            '🍃': { 2: 1, 3: 3 }
        },
        paylines: [
            { name: 'top', positions: [[0,0], [0,1], [0,2]] },
            { name: 'middle', positions: [[1,0], [1,1], [1,2]] },
            { name: 'bottom', positions: [[2,0], [2,1], [2,2]] },
            { name: 'diag1', positions: [[0,0], [1,1], [2,2]] },
            { name: 'diag2', positions: [[0,2], [1,1], [2,0]] }
        ],
        betAmount: 1,
        sweetBonusChance: 0.25,
        honeyMultiplierChance: 0.20
    },
    
    // Game state
    state: {
        audioContext: null,
        soundEnabled: true,
        spinning: false,
        gridSymbols: [],
        quickSpinEnabled: false,
        autoSpinCount: 0,
        lastWinAmount: 0,
        winLineAnimations: [],
        container: null
    },
    
    // Initialize the game
    init() {
        this.createGameHTML();
        this.initGrid();
        this.updateBalance();
        this.updateLastWin();
        this.initAudio();
    },
    
    // Create game HTML structure
    createGameHTML() {
        const html = `
<div id="honey-roll-backdrop" style="display: flex;">
    <div id="honey-roll">
        <div class="hr-header">
            <div class="hr-title">
                <span class="hr-title-emoji">🍯</span>
                <span class="hr-title-text">HONEY ROLL</span>
                <span class="hr-title-emoji">🐻</span>
            </div>
            <button class="hr-close-btn" onclick="gameManager.closeCurrentGame()">✖</button>
        </div>
        
        <div class="hr-paytable-bar">
            <div class="hr-payline-indicator">
                ⚡ 5 SWEET PAYLINES ⚡
            </div>
            ${Object.entries(this.config.payouts).map(([symbol, payout]) => `
                <div class="hr-pay-item">
                    <span class="hr-pay-symbol">${symbol}</span>
                    <span>3=${payout[3]}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="hr-game-area">
            <div class="hr-screen-flash" id="hrScreenFlash"></div>
            <div class="hr-big-win-popup" id="hrBigWinPopup">
                <div class="hr-big-win-text">WIN!</div>
                <div class="hr-big-win-amount" id="hrBigWinAmount"></div>
            </div>
            <div class="hr-honey-drip" id="hrHoneyDrip"></div>
            <div class="hr-reels-container">
                <canvas id="hrWinCanvas" class="hr-win-canvas"></canvas>
                <div class="hr-reels" id="hrReels"></div>
            </div>
            
            <div class="hr-controls">
                <div class="hr-left-section">
                    <div class="hr-balance-group">
                        <div class="hr-balance" id="hrBalance">SC 0.00</div>
                        <div class="hr-bet-info">1 SC per spin</div>
                        <div class="hr-last-win" id="hrLastWin">Last Win: SC 0.00</div>
                    </div>
                    <div class="hr-button-row">
                        <button class="hr-btn hr-info-btn" onclick="gameManager.currentGame.toggleInfo()">ℹ️</button>
                        <button class="hr-btn hr-sound-btn" id="hrSoundBtn" onclick="gameManager.currentGame.toggleSound()">🔊</button>
                    </div>
                </div>
                
                <div class="hr-win-message" id="hrWinMessage"></div>
                
                <div class="hr-right-section">
                    <button class="hr-btn hr-quick-btn" id="hrQuickBtn" onclick="gameManager.currentGame.toggleQuickSpin()">⚡</button>
                    <div class="hr-control-buttons">
                        <button class="hr-btn hr-spin-btn" id="hrSpinBtn" onclick="gameManager.currentGame.spin()">SPIN</button>
                        <button class="hr-btn hr-auto-btn" id="hrAutoBtn" onclick="gameManager.currentGame.toggleAutoSpin()">
                            🔄
                            <span id="hrAutoCounter" class="hr-auto-spin-counter" style="display: none;"></span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="hr-auto-spin-popup" id="hrAutoSpinPopup">
                <h4>Auto Spin</h4>
                <div class="hr-auto-spin-options">
                    ${[10, 50, 100, 500].map(count => 
                        `<div class="hr-auto-spin-option" onclick="gameManager.currentGame.startAutoSpin(${count})">${count}</div>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div class="hr-info-overlay" id="hrInfoOverlay" onclick="gameManager.currentGame.toggleInfo()"></div>
        <div class="hr-info-panel" id="hrInfoPanel">
            <h3>🍯 How to Play Honey Roll</h3>
            <p>• <strong>5 PAYLINES!</strong> Win across 3 rows and 2 diagonals!</p>
            <p>• Match 2 or 3 symbols on any payline to win!</p>
            <p>• 🍯 HONEY is the highest paying symbol!</p>
            <p>• 🐻 BEAR brings good luck!</p>
            <p>• Multiple line wins are added together!</p>
            <p>• 20% chance for HONEY MULTIPLIERS (2X-5X)!</p>
            <p>• <strong>SWEET BONUS:</strong> Even when you don't win, there's a 25% chance for a random 1-2 SC consolation prize!</p>
            
            <h3>💰 Sweet Paytable</h3>
            <div class="hr-paytable">
                <div class="hr-paytable-section">
                    <h4>3 Symbol Wins:</h4>
                    ${Object.entries(this.config.payouts).map(([symbol, payout]) => `
                        <div class="hr-paytable-row">
                            <span class="hr-symbol-display">${symbol}${symbol}${symbol}</span>
                            <span class="hr-payout-amount">${payout[3]} SC</span>
                        </div>
                    `).join('')}
                </div>
                <div class="hr-paytable-section">
                    <h4>2 Symbol Wins:</h4>
                    ${Object.entries(this.config.payouts).map(([symbol, payout]) => `
                        <div class="hr-paytable-row">
                            <span class="hr-symbol-display">${symbol}${symbol}</span>
                            <span class="hr-payout-amount">${payout[2]} SC</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <h3>📍 Paylines Visual Guide</h3>
            <div class="hr-paylines-visual">
                <div class="hr-payline-demo">Row 1: Top horizontal line</div>
                <div class="hr-payline-demo">Row 2: Middle horizontal line</div>
                <div class="hr-payline-demo">Row 3: Bottom horizontal line</div>
                <div class="hr-payline-demo">Diagonal 1: Top-left to bottom-right</div>
                <div class="hr-payline-demo">Diagonal 2: Top-right to bottom-left</div>
            </div>
            
            <p style="font-style: italic; opacity: 0.8;">🎮 Get ready for the sweetest spins!</p>
            <button class="hr-close-info" onclick="gameManager.currentGame.toggleInfo()">Close</button>
        </div>
    </div>
</div>`;
        
        this.state.container = document.createElement('div');
        this.state.container.innerHTML = html;
        document.body.appendChild(this.state.container);
    },
    
    // Initialize audio context
    initAudio() {
        if (!this.state.audioContext) {
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    // Play sound effects
    playSound(type) {
        if (!this.state.soundEnabled || !this.state.audioContext) return;
        
        const ctx = this.state.audioContext;
        
        switch(type) {
            case 'spin':
                const noise = ctx.createBufferSource();
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < buffer.length; i++) {
                    data[i] = (Math.random() - 0.5) * 0.3 * (1 - i / buffer.length);
                }
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, ctx.currentTime);
                filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
                noise.connect(filter);
                filter.connect(ctx.destination);
                noise.start();
                break;
                
            case 'stop':
                const click = ctx.createOscillator();
                const clickGain = ctx.createGain();
                click.frequency.setValueAtTime(1000, ctx.currentTime);
                click.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
                clickGain.gain.setValueAtTime(0.1, ctx.currentTime);
                clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                click.connect(clickGain);
                clickGain.connect(ctx.destination);
                click.start(ctx.currentTime);
                click.stop(ctx.currentTime + 0.05);
                break;
                
            case 'win':
                const notes = [261, 329, 392, 523];
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + i * 0.1);
                    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
                });
                break;
                
            case 'bigwin':
                const fanfare = [523, 659, 784, 1047];
                fanfare.forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.frequency.value = freq;
                        osc.type = 'square';
                        gain.gain.setValueAtTime(0.15, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.3);
                    }, i * 100);
                });
                break;
        }
    },
    
    // Get weighted random symbol
    getRandomSymbol() {
        const entries = [];
        for (const [symbol, weight] of Object.entries(this.config.symbolWeights)) {
            for (let i = 0; i < weight; i++) {
                entries.push(symbol);
            }
        }
        return entries[Math.floor(Math.random() * entries.length)];
    },
    
    // Initialize the grid
    initGrid() {
        const reelsContainer = document.getElementById('hrReels');
        if (!reelsContainer) return;
        
        reelsContainer.innerHTML = '';
        this.state.gridSymbols = [];
        
        for (let row = 0; row < 3; row++) {
            this.state.gridSymbols[row] = [];
            for (let col = 0; col < 3; col++) {
                const slot = document.createElement('div');
                slot.className = 'hr-slot';
                slot.id = `hr-slot-${row}-${col}`;
                const symbol = this.getRandomSymbol();
                slot.textContent = symbol;
                this.state.gridSymbols[row][col] = symbol;
                reelsContainer.appendChild(slot);
            }
        }
    },
    
    // Draw winning line on canvas
    drawWinningLine(positions) {
        const canvas = document.getElementById('hrWinCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = document.querySelector('.hr-reels-container');
        const grid = document.querySelector('.hr-reels');
        
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const firstSlot = document.getElementById('hr-slot-0-0');
        if (!firstSlot) return;
        
        const slotSize = firstSlot.offsetWidth;
        const gap = 8;
        
        const gridRect = grid.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetX = gridRect.left - containerRect.left;
        const offsetY = gridRect.top - containerRect.top;
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        positions.forEach(([row, col], index) => {
            const x = offsetX + col * (slotSize + gap) + slotSize / 2;
            const y = offsetY + row * (slotSize + gap) + slotSize / 2;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        const animation = {
            clear: () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        this.state.winLineAnimations.push(animation);
        
        setTimeout(() => {
            animation.clear();
        }, 1500);
    },
    
    // Clear all win lines
    clearWinLines() {
        const canvas = document.getElementById('hrWinCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        this.state.winLineAnimations = [];
    },
    
    // Animate slots spinning
    animateSlots(finalGrid, callback) {
        const slots = document.querySelectorAll('.hr-slot');
        const spinDuration = this.state.quickSpinEnabled ? 300 : 500;
        const spinInterval = this.state.quickSpinEnabled ? 30 : 50;
        
        slots.forEach(slot => slot.classList.add('spinning'));
        
        let spins = 0;
        const maxSpins = spinDuration / spinInterval;
        
        const spinTimer = setInterval(() => {
            slots.forEach(slot => {
                slot.textContent = this.getRandomSymbol();
            });
            
            spins++;
            if (spins >= maxSpins) {
                clearInterval(spinTimer);
                
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const slot = document.getElementById(`hr-slot-${row}-${col}`);
                        slot.textContent = finalGrid[row][col];
                        slot.classList.remove('spinning');
                    }
                }
                
                this.playSound('stop');
                
                if (callback) {
                    setTimeout(callback, 100);
                }
            }
        }, spinInterval);
    },
    
    // Get honey multiplier
    getHoneyMultiplier() {
        const rand = Math.random();
        if (rand < 0.04) return 5;
        if (rand < 0.08) return 3;
        if (rand < 0.20) return 2;
        return 1;
    },
    
    // Evaluate wins
    evaluateWins() {
        let totalWin = 0;
        const winningLines = [];
        
        this.config.paylines.forEach((payline) => {
            const symbols = payline.positions.map(([row, col]) => this.state.gridSymbols[row][col]);
            
            if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
                const symbol = symbols[0];
                const win = this.config.payouts[symbol]?.[3] || 0;
                if (win > 0) {
                    totalWin += win;
                    winningLines.push({
                        payline,
                        symbol,
                        count: 3,
                        win
                    });
                }
            } else if (symbols[0] === symbols[1]) {
                const symbol = symbols[0];
                const win = this.config.payouts[symbol]?.[2] || 0;
                if (win > 0) {
                    totalWin += win;
                    winningLines.push({
                        payline,
                        symbol,
                        count: 2,
                        win
                    });
                }
            }
        });
        
        const multiplier = this.getHoneyMultiplier();
        if (multiplier > 1) {
            totalWin *= multiplier;
        }
        
        if (totalWin > 0) {
            window.BalanceAPI.addBalance(totalWin);
            this.state.lastWinAmount = totalWin;
            this.updateBalance();
            this.updateLastWin();
            
            this.showWinAnimations(winningLines, totalWin, multiplier);
            
            return totalWin >= 50 ? 2500 : totalWin >= 10 ? 2000 : 1500;
        } else {
            if (Math.random() < this.config.sweetBonusChance) {
                const bonus = Math.random() < 0.3 ? 2 : 1;
                window.BalanceAPI.addBalance(bonus);
                this.state.lastWinAmount = bonus;
                this.updateBalance();
                this.updateLastWin();
                
                this.showSweetBonus(bonus);
                return 1200;
            }
        }
        
        return 0;
    },
    
    // Show win animations
    showWinAnimations(winningLines, totalWin, multiplier) {
        const gameEl = document.getElementById('honey-roll');
        const bigWinPopup = document.getElementById('hrBigWinPopup');
        const bigWinText = bigWinPopup.querySelector('.hr-big-win-text');
        const bigWinAmount = document.getElementById('hrBigWinAmount');
        
        document.querySelectorAll('.hr-slot').forEach(slot => {
            slot.classList.remove('winner');
        });
        
        winningLines.forEach(({ payline, count }, index) => {
            setTimeout(() => {
                const lineToDraw = count === 2 ? 
                    payline.positions.slice(0, 2) : 
                    payline.positions;
                this.drawWinningLine(lineToDraw);
                
                for (let i = 0; i < count; i++) {
                    const [row, col] = payline.positions[i];
                    const slot = document.getElementById(`hr-slot-${row}-${col}`);
                    if (slot) slot.classList.add('winner');
                }
            }, index * 200);
        });
        
        const hasHoneyJackpot = winningLines.some(w => w.symbol === '🍯' && w.count === 3);
        const has3Match = winningLines.some(w => w.count === 3);
        
        if (hasHoneyJackpot) {
            gameEl.classList.add('epic-shake');
            document.getElementById('hrHoneyDrip').classList.add('show');
            document.getElementById('hrScreenFlash').classList.add('show');
            setTimeout(() => {
                document.getElementById('hrHoneyDrip').classList.remove('show');
                document.getElementById('hrScreenFlash').classList.remove('show');
                gameEl.classList.remove('epic-shake');
            }, 1000);
        } else if (has3Match) {
            gameEl.classList.add('epic-shake');
            document.getElementById('hrScreenFlash').classList.add('show');
            setTimeout(() => {
                document.getElementById('hrScreenFlash').classList.remove('show');
                gameEl.classList.remove('epic-shake');
            }, 900);
        } else {
            gameEl.classList.add('shake');
            setTimeout(() => gameEl.classList.remove('shake'), 500);
        }
        
        let winText;
        if (hasHoneyJackpot) {
            winText = '🍯 HONEY JACKPOT! 🍯';
            bigWinPopup.classList.add('honey');
        } else if (has3Match) {
            winText = 'BIG WIN!';
            bigWinPopup.classList.add('epic');
        } else if (totalWin >= 10) {
            winText = 'NICE WIN!';
        } else {
            winText = 'WIN!';
        }
        
        if (multiplier > 1) {
            winText += ` ${multiplier}X!`;
        }
        
        bigWinText.textContent = winText;
        bigWinAmount.textContent = `SC ${totalWin.toFixed(2)}`;
        bigWinPopup.classList.add('show');
        
        this.playSound(hasHoneyJackpot || has3Match ? 'bigwin' : 'win');
    },
    
    // Show sweet bonus
    showSweetBonus(amount) {
        const bigWinPopup = document.getElementById('hrBigWinPopup');
        const bigWinText = bigWinPopup.querySelector('.hr-big-win-text');
        const bigWinAmount = document.getElementById('hrBigWinAmount');
        
        bigWinText.textContent = 'Sweet Bonus!';
        bigWinAmount.textContent = `SC ${amount.toFixed(2)}`;
        bigWinPopup.classList.add('show');
        
        this.playSound('win');
    },
    
    // Main spin function
    spin() {
        if (this.state.spinning) return;
        
        this.initAudio();
        
        const balance = window.BalanceAPI.getBalance();
        if (balance < this.config.betAmount) {
            const bigWinPopup = document.getElementById('hrBigWinPopup');
            const bigWinText = bigWinPopup.querySelector('.hr-big-win-text');
            const bigWinAmount = document.getElementById('hrBigWinAmount');
            bigWinText.textContent = 'Not enough SC!';
            bigWinAmount.textContent = 'Buy more coins!';
            bigWinPopup.classList.add('show');
            setTimeout(() => {
                bigWinPopup.classList.remove('show');
            }, 2000);
            this.stopAutoSpin();
            return;
        }
        
        if (!window.BalanceAPI.deductBalance(this.config.betAmount)) {
            this.stopAutoSpin();
            return;
        }
        
        this.state.spinning = true;
        const spinBtn = document.getElementById('hrSpinBtn');
        if (spinBtn) spinBtn.disabled = true;
        
        this.clearWinLines();
        document.querySelectorAll('.hr-slot').forEach(slot => {
            slot.classList.remove('winner');
        });
        
        const bigWinPopup = document.getElementById('hrBigWinPopup');
        bigWinPopup.classList.remove('show', 'epic', 'honey');
        
        this.updateBalance();
        this.playSound('spin');
        
        const newGrid = [];
        for (let row = 0; row < 3; row++) {
            newGrid[row] = [];
            for (let col = 0; col < 3; col++) {
                newGrid[row][col] = this.getRandomSymbol();
            }
        }
        this.state.gridSymbols = newGrid;
        
        this.animateSlots(newGrid, () => {
            const pauseDuration = this.evaluateWins();
            
            setTimeout(() => {
                this.state.spinning = false;
                
                const bigWinPopup = document.getElementById('hrBigWinPopup');
                bigWinPopup.classList.remove('show', 'epic', 'honey');
                this.clearWinLines();
                
                if (this.state.autoSpinCount === 0 && spinBtn) {
                    spinBtn.disabled = false;
                }
                
                if (this.state.autoSpinCount > 0) {
                    this.state.autoSpinCount--;
                    this.updateAutoSpinCounter();
                    if (this.state.autoSpinCount > 0) {
                        setTimeout(() => this.spin(), 300);
                    } else {
                        this.stopAutoSpin();
                    }
                }
            }, pauseDuration || 100);
        });
    },
    
    updateBalance() {
        const balance = window.BalanceAPI.getBalance();
        const balanceEl = document.getElementById('hrBalance');
        if (balanceEl) {
            balanceEl.textContent = `SC ${balance.toFixed(2)}`;
        }
    },
    
    updateLastWin() {
        const lastWinEl = document.getElementById('hrLastWin');
        if (lastWinEl) {
            lastWinEl.textContent = `Last Win: SC ${this.state.lastWinAmount.toFixed(2)}`;
        }
    },
    
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const soundBtn = document.getElementById('hrSoundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.state.soundEnabled ? '🔊' : '🔇';
        }
    },
    
    toggleQuickSpin() {
        this.state.quickSpinEnabled = !this.state.quickSpinEnabled;
        const btn = document.getElementById('hrQuickBtn');
        if (this.state.quickSpinEnabled) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    },
    
    toggleAutoSpin() {
        if (this.state.autoSpinCount > 0) {
            this.stopAutoSpin();
        } else {
            const popup = document.getElementById('hrAutoSpinPopup');
            popup.classList.toggle('show');
        }
    },
    
    startAutoSpin(count) {
        this.state.autoSpinCount = count;
        const popup = document.getElementById('hrAutoSpinPopup');
        const autoBtn = document.getElementById('hrAutoBtn');
        
        if (popup) popup.classList.remove('show');
        if (autoBtn) autoBtn.classList.add('active');
        this.updateAutoSpinCounter();
        this.spin();
    },
    
    stopAutoSpin() {
        this.state.autoSpinCount = 0;
        const autoBtn = document.getElementById('hrAutoBtn');
        const counter = document.getElementById('hrAutoCounter');
        const spinBtn = document.getElementById('hrSpinBtn');
        
        if (autoBtn) autoBtn.classList.remove('active');
        if (counter) {
            counter.textContent = '';
            counter.style.display = 'none';
        }
        if (spinBtn) spinBtn.disabled = false;
    },
    
    updateAutoSpinCounter() {
        const counter = document.getElementById('hrAutoCounter');
        if (counter) {
            if (this.state.autoSpinCount > 0) {
                counter.textContent = this.state.autoSpinCount;
                counter.style.display = 'block';
            } else {
                counter.textContent = '';
                counter.style.display = 'none';
            }
        }
    },
    
    toggleInfo() {
        const panel = document.getElementById('hrInfoPanel');
        const overlay = document.getElementById('hrInfoOverlay');
        panel.classList.toggle('show');
        overlay.classList.toggle('show');
    },
    
    // Cleanup function
    cleanup() {
        this.stopAutoSpin();
        this.clearWinLines();
        if (this.state.container) {
            this.state.container.remove();
            this.state.container = null;
        }
    }
};