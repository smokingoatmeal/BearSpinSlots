// Joker's Paw Slot Game Module
export default {
    name: "Joker's Paw",
    id: 'jokerspaw',
    
    // Game configuration
    config: {
        betAmount: 1,
        reels: 5,
        rows: 3,
        // Symbols ordered from best to worst
        symbols: ['🐻', '💯', '🎸', '🎳', '👟', '🔥', '💧', '🌙'],
        
        // Symbol weights for each reel (adjusted for 7 paylines)
        reelWeights: [
            // Reel 1 - better odds to start combinations
            { '🐻': 5, '💯': 7, '🎸': 8, '🎳': 8, '👟': 7, '🔥': 7, '💧': 6, '🌙': 6 },
            // Reel 2 - good continuation odds
            { '🐻': 4, '💯': 6, '🎸': 7, '🎳': 7, '👟': 8, '🔥': 8, '💧': 7, '🌙': 7 },
            // Reel 3 - decent middle
            { '🐻': 3, '💯': 6, '🎸': 7, '🎳': 7, '👟': 9, '🔥': 8, '💧': 8, '🌙': 7 },
            // Reel 4 - slightly tougher
            { '🐻': 3, '💯': 5, '🎸': 6, '🎳': 6, '👟': 9, '🔥': 8, '💧': 8, '🌙': 8 },
            // Reel 5 - still achievable jackpots
            { '🐻': 2, '💯': 5, '🎸': 6, '🎳': 6, '👟': 10, '🔥': 9, '💧': 9, '🌙': 9 }
        ],
        
        // Payouts ordered from best to worst
        payouts: {
            '🐻': { 3: 20, 4: 200, 5: 1000 },  // Bear - highest
            '💯': { 3: 10, 4: 40, 5: 200 },     // 100
            '🎸': { 3: 10, 4: 40, 5: 200 },     // Guitar
            '🎳': { 3: 10, 4: 40, 5: 200 },     // Bowling Pin
            '👟': { 3: 4, 4: 8, 5: 40 },        // Shoe
            '🔥': { 3: 4, 4: 10, 5: 40 },       // Fire
            '💧': { 3: 2, 4: 8, 5: 40 },        // Water
            '🌙': { 3: 4, 4: 8, 5: 40 }         // Moon
        },
        
        // 7 paylines: 3 horizontal + 4 diagonal/zigzag patterns
        paylines: [
            // Horizontal lines (3)
            { name: 'top', positions: [[0,0], [1,0], [2,0], [3,0], [4,0]] },
            { name: 'middle', positions: [[0,1], [1,1], [2,1], [3,1], [4,1]] },
            { name: 'bottom', positions: [[0,2], [1,2], [2,2], [3,2], [4,2]] },
            
            // Diagonal lines (2)
            { name: 'diagonal-down', positions: [[0,0], [1,1], [2,2], [3,1], [4,0]] },
            { name: 'diagonal-up', positions: [[0,2], [1,1], [2,0], [3,1], [4,2]] },
            
            // Zigzag patterns (2)
            { name: 'zigzag1', positions: [[0,0], [1,2], [2,0], [3,2], [4,0]] },
            { name: 'zigzag2', positions: [[0,2], [1,0], [2,2], [3,0], [4,2]] }
        ]
    },
    
    // Game state
    state: {
        isPlaying: false,
        container: null,
        reelResults: [],
        autoSpinCount: 0,
        quickSpinEnabled: false,
        soundEnabled: true,
        lastWin: 0,
        audioContext: null,
        goldStrobeInterval: null
    },
    
    // Initialize the game
    init() {
        this.createGameHTML();
        this.initReels();
        this.updateBalance();
        this.startGoldStrobe();
    },
    
    // Start gold strobe effect
    startGoldStrobe() {
        let strobeOn = false;
        this.state.goldStrobeInterval = setInterval(() => {
            const paytableBar = document.querySelector('.jp-paytable-bar');
            if (paytableBar) {
                if (strobeOn) {
                    paytableBar.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.1)';
                } else {
                    paytableBar.style.boxShadow = 'none';
                }
                strobeOn = !strobeOn;
            }
        }, 1500);
    },
    
    // Create game HTML structure
    createGameHTML() {
        const html = `
<div id="jp-backdrop" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: jpFadeIn 0.3s ease;
    padding: 10px;
    box-sizing: border-box;
">
    <div id="jp-container" style="
        background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.3);
        width: 100%;
        max-width: 750px;
        max-height: 90vh;
        overflow-y: auto;
        overflow-x: hidden;
        animation: jpSlideUp 0.3s ease;
        font-family: 'Orbitron', sans-serif;
        position: relative;
        z-index: 9999;
        display: flex;
        flex-direction: column;
    ">
        <div class="jp-screen-flash" id="jpScreenFlash" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(138, 43, 226, 0.8), rgba(255, 255, 255, 0.4));
            pointer-events: none;
            z-index: 200;
            display: none;
        "></div>
        
        <div class="jp-header" style="
            background: rgba(0, 0, 0, 0.3);
            padding: 12px 15px;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 3px solid rgba(138, 43, 226, 0.5);
            position: relative;
            flex-shrink: 0;
        ">
            <div class="jp-title" style="
                font-size: clamp(20px, 5vw, 32px);
                font-weight: 900;
                letter-spacing: 2px;
                display: flex;
                align-items: center;
                gap: 10px;
                text-transform: uppercase;
            ">
                <span style="font-size: clamp(20px, 5vw, 32px); filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.6));">🃏</span>
                <span style="
                    color: #e040fb;
                    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 30px rgba(224, 64, 251, 0.5);
                    background: linear-gradient(135deg, #e040fb, #ba68c8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">JOKER'S PAW</span>
                <span style="font-size: clamp(20px, 5vw, 32px); filter: drop-shadow(0 0 10px rgba(138, 43, 226, 0.6));">🐾</span>
            </div>
            <button onclick="window.gameManager.closeCurrentGame()" style="
                position: absolute;
                right: 15px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: white;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='rotate(90deg)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='rotate(0deg)'">✖</button>
        </div>
        
        <div class="jp-paytable-bar" style="
            background: rgba(0, 0, 0, 0.4);
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
            border-bottom: 2px solid rgba(138, 43, 226, 0.3);
            flex-shrink: 0;
            transition: box-shadow 0.5s ease;
        ">
            <div style="
                color: #ffd700;
                font-weight: bold;
                font-size: clamp(12px, 2vw, 14px);
                width: 100%;
                text-align: center;
                margin-bottom: 5px;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            ">⚡ 7 PAYLINES ⚡</div>
            ${this.config.symbols.map((symbol, i) => `
                <div class="jp-pay-item" style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #ffd700;
                    font-size: clamp(10px, 1.5vw, 12px);
                    font-weight: bold;
                    background: rgba(255, 215, 0, 0.1);
                    padding: 3px 6px;
                    border-radius: 6px;
                    transition: all 0.3s;
                    cursor: pointer;
                    position: relative;
                " onmouseover="this.style.background='rgba(255, 215, 0, 0.2)'; this.style.transform='scale(1.05)'; this.querySelector('.jp-payout-tooltip').style.display='block'"
                   onmouseout="this.style.background='rgba(255, 215, 0, 0.1)'; this.style.transform='scale(1)'; this.querySelector('.jp-payout-tooltip').style.display='none'">
                    <span style="font-size: clamp(14px, 2.5vw, 18px);">${symbol}</span>
                    <span>5=${this.config.payouts[symbol][5]}</span>
                    <div class="jp-payout-tooltip" style="
                        display: none;
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.95);
                        border: 1px solid #ffd700;
                        border-radius: 5px;
                        padding: 5px 8px;
                        white-space: nowrap;
                        z-index: 10;
                        margin-bottom: 5px;
                    ">
                        <div style="color: #ffd700; font-size: 11px;">
                            3x${this.config.payouts[symbol][3]} | 4x${this.config.payouts[symbol][4]} | 5x${this.config.payouts[symbol][5]}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="jp-game-area" style="
            padding: 15px;
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        ">
            <div class="jp-big-win-popup" id="jpBigWinPopup" style="
                position: absolute;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                text-align: center;
                z-index: 100;
                pointer-events: none;
            ">
                <div class="jp-big-win-text" style="
                    font-size: clamp(35px, 8vw, 50px);
                    font-weight: bold;
                    color: #ffd700;
                    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.8);
                    margin-bottom: 10px;
                    font-family: 'Bangers', cursive;
                ">WIN!</div>
                <div class="jp-big-win-amount" style="
                    font-size: clamp(20px, 5vw, 30px);
                    font-weight: bold;
                    color: #00ff00;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                "></div>
            </div>
            
            <div class="jp-reels-container" style="
                background: linear-gradient(135deg, rgba(75, 0, 130, 0.8), rgba(138, 43, 226, 0.6));
                border-radius: 15px;
                padding: 15px;
                margin-bottom: 15px;
                position: relative;
                box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 43, 226, 0.2);
                border: 3px solid rgba(138, 43, 226, 0.3);
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div class="jp-reels" id="jpReels" style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                    width: 100%;
                    max-width: 400px;
                    position: relative;
                ">
                    <!-- Canvas positioned over the reels grid -->
                    <canvas id="jpWinCanvas" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 10;
                    "></canvas>
                    <!-- Reels will be generated here -->
                </div>
            </div>
            
            <div class="jp-controls" style="
                background: rgba(0, 0, 0, 0.4);
                border-radius: 15px;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                flex-shrink: 0;
                gap: 10px;
            ">
                <div class="jp-left-section" style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                ">
                    <div class="jp-balance-group" style="
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                    ">
                        <div id="jpBalance" style="
                            background: rgba(0, 255, 0, 0.1);
                            border: 2px solid #00ff00;
                            padding: 6px 12px;
                            border-radius: 8px;
                            color: #00ff00;
                            font-weight: bold;
                            font-size: clamp(14px, 3vw, 20px);
                            text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                        ">SC 0.00</div>
                        <div style="
                            color: rgba(255, 255, 255, 0.7);
                            font-size: clamp(10px, 2vw, 12px);
                            margin-top: 3px;
                            margin-left: 5px;
                        ">Bet: 1 SC per spin</div>
                        <div id="jpLastWin" style="
                            color: #ffd700;
                            font-size: clamp(11px, 2.5vw, 14px);
                            margin-top: 3px;
                            margin-left: 5px;
                            font-weight: bold;
                            opacity: 0.8;
                        ">Last Win: SC 0.00</div>
                    </div>
                    
                    <div class="jp-button-row" style="
                        display: flex;
                        gap: 8px;
                    ">
                        <button onclick="window.gameManager.currentGame.toggleInfo()" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            border: none;
                            color: white;
                            border-radius: 50%;
                            width: clamp(32px, 6vw, 40px);
                            height: clamp(32px, 6vw, 40px);
                            font-size: clamp(16px, 3vw, 20px);
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">ℹ️</button>
                        <button id="jpSoundBtn" onclick="window.gameManager.currentGame.toggleSound()" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            border: none;
                            color: white;
                            border-radius: 50%;
                            width: clamp(32px, 6vw, 40px);
                            height: clamp(32px, 6vw, 40px);
                            font-size: clamp(16px, 3vw, 20px);
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">🔊</button>
                    </div>
                </div>
                
                <div class="jp-right-section" style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                ">
                    <button id="jpQuickBtn" onclick="window.gameManager.currentGame.toggleQuickSpin()" style="
                        background: linear-gradient(135deg, #f39c12, #e67e22);
                        border: none;
                        color: white;
                        border-radius: 50%;
                        width: clamp(35px, 7vw, 45px);
                        height: clamp(35px, 7vw, 45px);
                        font-size: clamp(16px, 3vw, 20px);
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">⚡</button>
                    
                    <div class="jp-control-buttons" style="
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        align-items: center;
                    ">
                        <button id="jpSpinBtn" onclick="window.gameManager.currentGame.spin()" style="
                            background: linear-gradient(135deg, #ffd700, #ffb700);
                            border: 3px solid rgba(255, 255, 255, 0.3);
                            color: #4a148c;
                            border-radius: 50%;
                            width: clamp(60px, 12vw, 80px);
                            height: clamp(60px, 12vw, 80px);
                            font-size: clamp(14px, 3vw, 18px);
                            letter-spacing: 1px;
                            font-weight: 900;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-transform: uppercase;
                        ">SPIN</button>
                        
                        <button id="jpAutoBtn" onclick="window.gameManager.currentGame.toggleAutoSpin()" style="
                            background: linear-gradient(135deg, #3498db, #2980b9);
                            border: none;
                            color: white;
                            border-radius: 50%;
                            width: clamp(45px, 9vw, 60px);
                            height: clamp(45px, 9vw, 60px);
                            font-size: clamp(18px, 4vw, 24px);
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                        ">
                            🔄
                            <span id="jpAutoCounter" style="
                                display: none;
                                position: absolute;
                                top: -5px;
                                right: -5px;
                                background: #ff4757;
                                color: white;
                                font-size: 10px;
                                font-weight: bold;
                                padding: 2px 5px;
                                border-radius: 10px;
                                min-width: 18px;
                                text-align: center;
                            "></span>
                        </button>
                    </div>
                    
                    <div id="jpAutoSpinPopup" style="
                        position: absolute;
                        bottom: calc(100% + 10px);
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.95);
                        border: 2px solid #3498db;
                        border-radius: 10px;
                        padding: 12px;
                        display: none;
                        z-index: 100;
                        min-width: 150px;
                    ">
                        <h4 style="color: #3498db; margin: 0 0 8px 0; font-size: clamp(14px, 3vw, 16px);">Auto Spin</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                            <button onclick="window.gameManager.currentGame.startAutoSpin(10)" style="
                                background: rgba(52, 152, 219, 0.2);
                                border: 1px solid #3498db;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 5px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: clamp(12px, 2.5vw, 14px);
                            ">10</button>
                            <button onclick="window.gameManager.currentGame.startAutoSpin(50)" style="
                                background: rgba(52, 152, 219, 0.2);
                                border: 1px solid #3498db;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 5px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: clamp(12px, 2.5vw, 14px);
                            ">50</button>
                            <button onclick="window.gameManager.currentGame.startAutoSpin(100)" style="
                                background: rgba(52, 152, 219, 0.2);
                                border: 1px solid #3498db;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 5px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: clamp(12px, 2.5vw, 14px);
                            ">100</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="jpInfoOverlay" onclick="window.gameManager.currentGame.toggleInfo()" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 99;
        "></div>
        
        <div id="jpInfoPanel" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4a148c, #7b1fa2);
            border-radius: 15px;
            padding: 15px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 100;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            display: none;
            border: 2px solid rgba(138, 43, 226, 0.3);
        ">
            <h3 style="color: #ffd700; margin: 0 0 12px 0; font-size: clamp(16px, 4vw, 20px);">🎰 How to Play</h3>
            <p style="color: white; margin-bottom: 8px; font-size: clamp(12px, 2.5vw, 14px); line-height: 1.4;">
                • <strong>7 PAYLINES!</strong> Win across multiple patterns!<br>
                • 3 horizontal lines + 4 diagonal/zigzag patterns<br>
                • Wins pay left-to-right only<br>
                • Fixed bet: 1 SC per spin<br>
                • Match 3, 4, or 5 symbols to win!<br>
                • Multiple line wins are added together!<br>
                • 10% chance for 2X or 3X bonus multipliers!
            </p>
            
            <h4 style="color: #ffd700; margin: 10px 0 8px 0; font-size: clamp(14px, 3vw, 16px); text-align: center;">💰 Paytable</h4>
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                ${this.config.symbols.map(symbol => `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        color: white;
                    ">
                        <span style="font-size: clamp(20px, 5vw, 26px); letter-spacing: 3px;">${symbol}</span>
                        <span style="font-size: clamp(13px, 3vw, 16px); font-weight: bold; color: #ffd700;">
                            3×${this.config.payouts[symbol][3]} | 4×${this.config.payouts[symbol][4]} | 5×${this.config.payouts[symbol][5]}
                        </span>
                    </div>
                `).join('')}
            </div>
            
            <h4 style="color: #ffd700; margin: 10px 0 8px 0; font-size: clamp(14px, 3vw, 16px); text-align: center;">📐 Paylines</h4>
            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 8px; color: white; font-size: clamp(11px, 2.5vw, 13px);">
                • Line 1: Top horizontal<br>
                • Line 2: Middle horizontal<br>
                • Line 3: Bottom horizontal<br>
                • Line 4: V-shape down<br>
                • Line 5: V-shape up<br>
                • Line 6: Zigzag pattern 1<br>
                • Line 7: Zigzag pattern 2
            </div>
            
            <button onclick="window.gameManager.currentGame.toggleInfo()" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: clamp(14px, 3vw, 16px);
                margin-top: 10px;
                width: 100%;
            ">Close</button>
        </div>
    </div>
</div>

<style>
@keyframes jpFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

@keyframes jpSlideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

#jp-container.shake {
    animation: jpShake 0.5s ease;
}

#jp-container.epic-shake {
    animation: jpEpicShake 1s ease;
}

@keyframes jpShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes jpEpicShake {
    0%, 100% { transform: translateX(0) scale(1); }
    5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95% { transform: translateX(-8px) scale(1.02); }
    10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% { transform: translateX(8px) scale(1.02); }
}

.jp-screen-flash.show {
    display: block !important;
    animation: jpFlash 0.3s ease 3;
}

@keyframes jpFlash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

.jp-slot {
    background: linear-gradient(180deg, #1a0033, #2d0052);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(28px, 6vw, 42px);
    position: relative;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7);
    border: 2px solid rgba(138, 43, 226, 0.2);
    aspect-ratio: 1/1;
    height: 100%;
}

.jp-slot.spinning {
    animation: jpSlotSpin 0.1s linear infinite;
}

@keyframes jpSlotSpin {
    0% { transform: rotateX(0deg); }
    100% { transform: rotateX(360deg); }
}

.jp-slot.winner {
    animation: jpWinnerPulse 0.5s ease 3;
    z-index: 5;
}

@keyframes jpWinnerPulse {
    0%, 100% { 
        transform: scale(1); 
        filter: brightness(1);
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7);
    }
    50% { 
        transform: scale(1.15); 
        filter: brightness(1.5);
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.5);
    }
}

.jp-big-win-popup.show {
    animation: jpBigWinPop 2.5s ease forwards;
}

.jp-big-win-popup.show.epic {
    animation: jpEpicWinPop 3s ease forwards;
}

@keyframes jpBigWinPop {
    0% { 
        transform: translate(-50%, -50%) scale(0) rotate(-180deg); 
        opacity: 1;
    }
    15% { 
        transform: translate(-50%, -50%) scale(1.2) rotate(10deg); 
    }
    25%, 75% {
        transform: translate(-50%, -50%) scale(1) rotate(0deg); 
        opacity: 1;
    }
    100% { 
        transform: translate(-50%, -200%) scale(0); 
        opacity: 0; 
    }
}

@keyframes jpEpicWinPop {
    0% { 
        transform: translate(-50%, -50%) scale(0) rotate(-360deg); 
        opacity: 1;
    }
    15% { 
        transform: translate(-50%, -50%) scale(1.5) rotate(15deg); 
    }
    25%, 75% {
        transform: translate(-50%, -50%) scale(1.2) rotate(0deg); 
        opacity: 1;
    }
    100% { 
        transform: translate(-50%, -250%) scale(0); 
        opacity: 0; 
    }
}

#jpAutoSpinPopup.show {
    display: block !important;
    animation: jpSlideUp 0.3s ease;
}

#jpInfoOverlay.show {
    display: block !important;
}

#jpInfoPanel.show {
    display: block !important;
    animation: jpSlideUp 0.3s ease;
}

#jpQuickBtn.active {
    background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
}

#jpAutoBtn.active {
    background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
}

/* Mobile responsive styles */
@media (max-width: 480px) {
    #jp-backdrop {
        padding: 0;
    }
    
    #jp-container {
        border-radius: 0;
        max-height: 100vh;
        height: 100vh;
    }
    
    .jp-header {
        border-radius: 0;
        padding: 10px;
    }
    
    .jp-game-area {
        padding: 10px;
    }
    
    .jp-controls {
        flex-wrap: wrap;
    }
    
    .jp-left-section {
        width: 100%;
        margin-bottom: 10px;
    }
    
    .jp-right-section {
        width: 100%;
        justify-content: center;
    }
    
    .jp-control-buttons {
        flex-direction: row;
    }
    
    .jp-paytable-bar {
        padding: 6px;
        gap: 4px;
    }
    
    .jp-pay-item {
        padding: 2px 4px;
    }
    
    .jp-reels {
        gap: 5px;
    }
}

@media (min-width: 481px) and (max-width: 768px) {
    .jp-controls {
        flex-wrap: nowrap;
    }
    
    .jp-left-section {
        flex: 1;
    }
    
    .jp-right-section {
        flex: 0 0 auto;
    }
}

@media (max-height: 500px) and (orientation: landscape) {
    #jp-container {
        max-height: 100vh;
    }
    
    .jp-game-area {
        padding: 8px;
    }
    
    .jp-reels-container {
        padding: 10px;
    }
    
    .jp-header {
        padding: 8px;
    }
    
    .jp-controls {
        padding: 8px;
    }
}
</style>`;
        
        this.state.container = document.createElement('div');
        this.state.container.innerHTML = html;
        document.body.appendChild(this.state.container);
    },
    
    // Initialize reels - FIXED grid layout
    initReels() {
        const reelsContainer = document.getElementById('jpReels');
        if (!reelsContainer) return;
        
        // Clear existing content
        const existingSlots = reelsContainer.querySelectorAll('.jp-slot');
        existingSlots.forEach(slot => slot.remove());
        
        // Create 3 rows, 5 columns grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                const slot = document.createElement('div');
                slot.className = 'jp-slot';
                slot.id = `jp-slot-${col}-${row}`;
                slot.style.gridColumn = col + 1;
                slot.style.gridRow = row + 1;
                slot.textContent = this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)];
                reelsContainer.appendChild(slot);
            }
        }
    },
    
    // Get weighted random symbol
    getRandomSymbol(weights) {
        const entries = [];
        for (const [symbol, weight] of Object.entries(weights)) {
            for (let i = 0; i < weight; i++) {
                entries.push(symbol);
            }
        }
        return entries[Math.floor(Math.random() * entries.length)];
    },
    
    // Bonus multiplier
    getBonusMultiplier() {
        const rand = Math.random();
        if (rand < 0.05) return 3;  // 5% chance for 3x
        if (rand < 0.10) return 2;  // 5% chance for 2x
        return 1;  // 90% normal
    },
    
    // Main spin function
    spin() {
        if (this.state.isPlaying) return;
        
        // Check balance
        const balance = window.BalanceAPI.getBalance();
        if (balance < this.config.betAmount) {
            this.showMessage('Not enough SC!');
            this.stopAutoSpin();
            return;
        }
        
        // Deduct bet
        if (!window.BalanceAPI.deductBalance(this.config.betAmount)) {
            this.stopAutoSpin();
            return;
        }
        
        this.state.isPlaying = true;
        this.updateBalance();
        
        const spinBtn = document.getElementById('jpSpinBtn');
        if (spinBtn) spinBtn.disabled = true;
        
        // Clear previous animations
        document.querySelectorAll('.jp-slot').forEach(slot => {
            slot.classList.remove('winner');
        });
        
        // Clear canvas
        const canvas = document.getElementById('jpWinCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Hide popups
        const popup = document.getElementById('jpBigWinPopup');
        if (popup) popup.classList.remove('show', 'epic');
        
        // Generate results - 5 columns, 3 rows each
        this.state.reelResults = [];
        for (let col = 0; col < 5; col++) {
            const column = [];
            for (let row = 0; row < 3; row++) {
                column.push(this.getRandomSymbol(this.config.reelWeights[col]));
            }
            this.state.reelResults.push(column);
        }
        
        // Play spin sound
        this.playSound('spin');
        
        // Animate reels
        this.animateReels();
    },
    
    // Animate reels - FIXED to properly display results
    animateReels() {
        const spinDuration = this.state.quickSpinEnabled ? 300 : 600;
        const reelDelay = this.state.quickSpinEnabled ? 50 : 100;
        
        // Start all slots spinning
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const slot = document.getElementById(`jp-slot-${col}-${row}`);
                if (slot) {
                    slot.classList.add('spinning');
                    
                    // Random symbols during spin
                    const spinInterval = setInterval(() => {
                        slot.textContent = this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)];
                    }, 50);
                    
                    // Stop spinning after delay
                    setTimeout(() => {
                        clearInterval(spinInterval);
                        slot.classList.remove('spinning');
                        // FIXED: Set the correct symbol from results
                        slot.textContent = this.state.reelResults[col][row];
                        this.playSound('stop');
                    }, spinDuration + (col * reelDelay));
                }
            }
        }
        
        // Evaluate after all reels stop
        setTimeout(() => {
            this.evaluateWins();
        }, spinDuration + (4 * reelDelay) + 300);
    },
    
    // FIXED evaluate wins function with proper payline checking
    evaluateWins() {
        let totalWin = 0;
        const winningLines = [];
        
        // Check each payline
        this.config.paylines.forEach((payline, lineNum) => {
            const lineSymbols = [];
            
            // Get symbols for this payline
            payline.positions.forEach(([col, row]) => {
                lineSymbols.push(this.state.reelResults[col][row]);
            });
            
            // Check for wins (left to right only)
            const firstSymbol = lineSymbols[0];
            let matchCount = 1;
            
            // Count consecutive matching symbols from left
            for (let i = 1; i < lineSymbols.length; i++) {
                if (lineSymbols[i] === firstSymbol) {
                    matchCount++;
                } else {
                    break; // Stop at first non-match
                }
            }
            
            // Check if we have a win (3+ matches)
            if (matchCount >= 3 && this.config.payouts[firstSymbol]) {
                const payout = this.config.payouts[firstSymbol][matchCount];
                if (payout && payout > 0) {
                    totalWin += payout;
                    winningLines.push({ 
                        lineNum: lineNum + 1,
                        symbol: firstSymbol,
                        count: matchCount,
                        positions: payline.positions.slice(0, matchCount),
                        payout: payout
                    });
                }
            }
        });
        
        // Apply bonus multiplier
        const bonusMultiplier = this.getBonusMultiplier();
        if (bonusMultiplier > 1) {
            totalWin *= bonusMultiplier;
        }
        
        // Process win
        if (totalWin > 0) {
            window.BalanceAPI.addBalance(totalWin);
            this.state.lastWin = totalWin;
            this.updateBalance();
            this.updateLastWin();
            
            // Show win animations
            this.showWinAnimation(totalWin, winningLines, bonusMultiplier);
            
            // Play win sound
            this.playSound(totalWin >= 100 ? 'bigwin' : 'win');
        } else {
            // Consolation prize (15% chance)
            if (Math.random() < 0.15) {
                const consolation = Math.random() < 0.5 ? 1 : 2;
                window.BalanceAPI.addBalance(consolation);
                this.state.lastWin = consolation;
                this.updateBalance();
                this.updateLastWin();
                this.showMessage(`Lucky! SC ${consolation.toFixed(2)}`);
                this.playSound('win');
            }
        }
        
        // End spin
        this.state.isPlaying = false;
        const spinBtn = document.getElementById('jpSpinBtn');
        if (spinBtn && this.state.autoSpinCount === 0) {
            spinBtn.disabled = false;
        }
        
        // Continue auto spin
        if (this.state.autoSpinCount > 0) {
            this.state.autoSpinCount--;
            this.updateAutoSpinCounter();
            if (this.state.autoSpinCount > 0) {
                setTimeout(() => this.spin(), this.state.quickSpinEnabled ? 500 : 1000);
            } else {
                this.stopAutoSpin();
            }
        }
    },
    
    // FIXED show win animation
    showWinAnimation(amount, winningLines, multiplier) {
        // Shake effect
        const container = document.getElementById('jp-container');
        if (amount >= 100) {
            container.classList.add('epic-shake');
            setTimeout(() => container.classList.remove('epic-shake'), 1000);
            
            // Flash effect
            const flash = document.getElementById('jpScreenFlash');
            if (flash) {
                flash.classList.add('show');
                setTimeout(() => flash.classList.remove('show'), 900);
            }
        } else {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
        }
        
        // Show big win popup
        const popup = document.getElementById('jpBigWinPopup');
        const text = popup.querySelector('.jp-big-win-text');
        const amountEl = popup.querySelector('.jp-big-win-amount');
        
        let winText = amount >= 500 ? 'EPIC WIN!' : amount >= 100 ? 'BIG WIN!' : 'WIN!';
        if (multiplier > 1) winText += ` ${multiplier}X!`;
        
        text.textContent = winText;
        amountEl.textContent = `SC ${amount.toFixed(2)}`;
        
        popup.classList.add('show');
        if (amount >= 100) popup.classList.add('epic');
        
        setTimeout(() => {
            popup.classList.remove('show', 'epic');
        }, amount >= 100 ? 3000 : 2500);
        
        // Highlight winning symbols
        winningLines.forEach(({ positions }) => {
            positions.forEach(([col, row]) => {
                const slot = document.getElementById(`jp-slot-${col}-${row}`);
                if (slot) slot.classList.add('winner');
            });
        });
        
        // Draw win lines on canvas with fixed positioning
        this.drawWinLines(winningLines);
    },
    
    // COMPLETELY FIXED draw win lines function
    drawWinLines(winningLines) {
        const canvas = document.getElementById('jpWinCanvas');
        const reelsContainer = document.getElementById('jpReels');
        if (!canvas || !reelsContainer) return;
        
        // Get the actual dimensions of the reels grid
        const rect = reelsContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get first slot to calculate dimensions
        const firstSlot = document.getElementById('jp-slot-0-0');
        if (!firstSlot) return;
        
        const slotRect = firstSlot.getBoundingClientRect();
        const containerRect = reelsContainer.getBoundingClientRect();
        
        // Calculate actual slot dimensions including gaps
        const totalWidth = rect.width;
        const totalHeight = rect.height;
        const cellWidth = totalWidth / 5;
        const cellHeight = totalHeight / 3;
        
        winningLines.forEach((line, index) => {
            setTimeout(() => {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffd700';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.beginPath();
                line.positions.forEach(([col, row], i) => {
                    // Calculate position based on grid
                    const x = (col + 0.5) * cellWidth;
                    const y = (row + 0.5) * cellHeight;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                
                // Draw line number at the start of the line
                const startX = (line.positions[0][0] + 0.5) * cellWidth;
                const startY = (line.positions[0][1] + 0.5) * cellHeight;
                
                // Draw background circle for line number
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(startX - 25, startY, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw line number
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 5;
                ctx.fillText(`L${line.lineNum}`, startX - 25, startY);
            }, index * 200);
        });
        
        // Clear after 3 seconds
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 3000);
    },
    
    // Sound effects
    initAudio() {
        if (!this.state.audioContext) {
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playSound(type) {
        if (!this.state.soundEnabled) return;
        
        this.initAudio();
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
                noise.connect(ctx.destination);
                noise.start();
                break;
                
            case 'stop':
                const click = ctx.createOscillator();
                const clickGain = ctx.createGain();
                click.frequency.value = 1000;
                clickGain.gain.value = 0.1;
                clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                click.connect(clickGain);
                clickGain.connect(ctx.destination);
                click.start();
                click.stop(ctx.currentTime + 0.05);
                break;
                
            case 'win':
                [261, 329, 392, 523].forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.frequency.value = freq;
                        gain.gain.value = 0.1;
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.3);
                    }, i * 50);
                });
                break;
                
            case 'bigwin':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.frequency.value = freq;
                        osc.type = 'square';
                        gain.gain.value = 0.15;
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.4);
                    }, i * 100);
                });
                break;
        }
    },
    
    // UI Functions
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const btn = document.getElementById('jpSoundBtn');
        if (btn) btn.textContent = this.state.soundEnabled ? '🔊' : '🔇';
    },
    
    toggleQuickSpin() {
        this.state.quickSpinEnabled = !this.state.quickSpinEnabled;
        const btn = document.getElementById('jpQuickBtn');
        if (btn) btn.classList.toggle('active');
    },
    
    toggleAutoSpin() {
        if (this.state.autoSpinCount > 0) {
            this.stopAutoSpin();
        } else {
            const popup = document.getElementById('jpAutoSpinPopup');
            if (popup) popup.classList.toggle('show');
        }
    },
    
    startAutoSpin(count) {
        this.state.autoSpinCount = count;
        const popup = document.getElementById('jpAutoSpinPopup');
        const btn = document.getElementById('jpAutoBtn');
        
        if (popup) popup.classList.remove('show');
        if (btn) btn.classList.add('active');
        
        this.updateAutoSpinCounter();
        this.spin();
    },
    
    stopAutoSpin() {
        this.state.autoSpinCount = 0;
        const btn = document.getElementById('jpAutoBtn');
        const counter = document.getElementById('jpAutoCounter');
        const spinBtn = document.getElementById('jpSpinBtn');
        
        if (btn) btn.classList.remove('active');
        if (counter) {
            counter.textContent = '';
            counter.style.display = 'none';
        }
        if (spinBtn) spinBtn.disabled = false;
    },
    
    updateAutoSpinCounter() {
        const counter = document.getElementById('jpAutoCounter');
        if (counter) {
            if (this.state.autoSpinCount > 0) {
                counter.textContent = this.state.autoSpinCount;
                counter.style.display = 'block';
            } else {
                counter.style.display = 'none';
            }
        }
    },
    
    toggleInfo() {
        const panel = document.getElementById('jpInfoPanel');
        const overlay = document.getElementById('jpInfoOverlay');
        if (panel) panel.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
    },
    
    // Update displays
    updateBalance() {
        const balance = window.BalanceAPI.getBalance();
        const balanceEl = document.getElementById('jpBalance');
        if (balanceEl) {
            balanceEl.textContent = `SC ${balance.toFixed(2)}`;
        }
    },
    
    updateLastWin() {
        const el = document.getElementById('jpLastWin');
        if (el) {
            el.textContent = `Last Win: SC ${this.state.lastWin.toFixed(2)}`;
        }
    },
    
    showMessage(message) {
        const popup = document.getElementById('jpBigWinPopup');
        const text = popup.querySelector('.jp-big-win-text');
        const amount = popup.querySelector('.jp-big-win-amount');
        
        text.textContent = message;
        amount.textContent = '';
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 2000);
    },
    
    // Cleanup
    cleanup() {
        // Stop gold strobe
        if (this.state.goldStrobeInterval) {
            clearInterval(this.state.goldStrobeInterval);
            this.state.goldStrobeInterval = null;
        }
        
        // Stop any ongoing spins
        this.stopAutoSpin();
        
        // Remove container
        if (this.state.container) {
            this.state.container.remove();
            this.state.container = null;
        }
        
        // Reset state
        this.state.isPlaying = false;
        this.state.autoSpinCount = 0;
    }
};