// BearJack Game Module
export default {
    name: "BearJack",
    id: 'bearjack',
    
    // Game state
    state: {
        container: null,
        game: null,
        isActive: false
    },
    
    // Initialize the game
    init() {
        this.createGameHTML();
        this.state.game = new BearJackGame(this);
        this.state.isActive = true;
        this.state.game.updateBalanceDisplay();
        this.state.game.updateBetDisplay();
    },
    
    // Create game HTML structure
    createGameHTML() {
        const html = `
<div id="bearjack" style="
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
        
        /* BearJack Styles - Scoped under #bearjack */
        #bearjack * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #bearjack .backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
        }
        
        #bearjack .modal {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 800px;
            height: 90%;
            max-height: 600px;
            background: #0a5c2e;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 3px solid #062918;
        }
        
        /* Premium Header Styling */
        #bearjack .header {
            background: 
                linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 215, 0, 0.1) 10%, 
                    rgba(255, 215, 0, 0.05) 50%, 
                    rgba(255, 215, 0, 0.1) 90%, 
                    transparent 100%),
                linear-gradient(135deg, #1a0a2e 0%, #2a1550 25%, #3d1e6d 50%, #2a1550 75%, #1a0a2e 100%);
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #ffd700;
            box-shadow: 
                0 6px 20px rgba(0, 0, 0, 0.5),
                inset 0 -2px 10px rgba(255, 215, 0, 0.2);
            position: relative;
            overflow: hidden;
        }
        
        #bearjack .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 255, 255, 0.2), 
                transparent);
            animation: headerShine 3s ease-in-out infinite;
        }
        
        @keyframes headerShine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
        }
        
        #bearjack .casino-lights {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: repeating-linear-gradient(
                90deg,
                #ff0000 0px,
                #ff0000 10px,
                #ffd700 10px,
                #ffd700 20px,
                #00ff00 20px,
                #00ff00 30px,
                #00ffff 30px,
                #00ffff 40px
            );
            animation: lightsMove 2s linear infinite;
            opacity: 0.8;
        }
        
        @keyframes lightsMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(40px); }
        }
        
        #bearjack .title {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 1;
        }
        
        #bearjack .title-text {
            color: transparent;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            background: linear-gradient(
                45deg,
                #ffd700 0%,
                #ffed4e 25%,
                #fff5a0 50%,
                #ffed4e 75%,
                #ffd700 100%
            );
            background-clip: text;
            -webkit-background-clip: text;
            text-shadow: 
                0 0 30px rgba(255, 215, 0, 0.5),
                0 0 60px rgba(255, 215, 0, 0.3);
            animation: titlePulse 2s ease-in-out infinite;
        }
        
        @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        #bearjack .bear-icon {
            font-size: 36px;
            animation: bearDance 3s ease-in-out infinite;
            display: inline-block;
            background: none !important;
            -webkit-background-clip: unset !important;
            background-clip: unset !important;
            color: inherit;
            text-shadow: none;
        }
        
        @keyframes bearDance {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-5px) rotate(-5deg); }
            75% { transform: translateY(-5px) rotate(5deg); }
        }
        
        #bearjack .close-btn {
            background: linear-gradient(135deg, #ff6b6b, #ff5252);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s;
            position: relative;
            z-index: 1;
            box-shadow: 
                0 4px 15px rgba(255, 107, 107, 0.4),
                inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
        
        #bearjack .close-btn:hover {
            background: linear-gradient(135deg, #ff5252, #ff3838);
            transform: scale(1.1) rotate(90deg);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }
        
        #bearjack .table {
            flex: 1;
            position: relative;
            background: 
                radial-gradient(ellipse at center, rgba(0, 0, 0, 0.2) 0%, transparent 70%),
                linear-gradient(135deg, #0a5c2e 0%, #084025 100%);
            overflow: hidden;
        }
        
        #bearjack .table-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            pointer-events: none;
            opacity: 0.7;
            z-index: 0;
        }
        
        #bearjack .blackjack-pays {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #2a1540;
            padding: 8px 25px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 10px;
            box-shadow: 
                0 4px 12px rgba(0, 0, 0, 0.3),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2);
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
            display: inline-block;
        }
        
        #bearjack .dealer-rules {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        #bearjack .insurance-text {
            background: linear-gradient(135deg, #ff6b6b, #ff5252);
            color: white;
            padding: 6px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: inline-block;
        }
        
        #bearjack .dealer-area {
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            min-height: 120px;
            width: 90%;
            max-width: 400px;
            display: flex;
            justify-content: center;
        }
        
        #bearjack .player-area {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            min-height: 120px;
            width: 90%;
            max-width: 400px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        #bearjack .hand {
            display: flex;
            gap: 8px;
            position: relative;
            padding: 5px;
            border-radius: 10px;
            transition: all 0.3s;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            max-width: 100%;
        }
        
        #bearjack .hand.active {
            background: rgba(255, 215, 0, 0.2);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }
        
        #bearjack .card {
            width: 70px;
            height: 100px;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            animation: dealCard 0.3s ease-out;
            color: #000;  /* Ensure text is black on white cards */
        }
        
        @keyframes dealCard {
            from {
                transform: translateY(-30px) rotate(-5deg);
                opacity: 0;
            }
            to {
                transform: translateY(0) rotate(0);
                opacity: 1;
            }
        }
        
        @keyframes clearCard {
            to {
                transform: translateX(200px) rotate(20deg);
                opacity: 0;
            }
        }
        
        #bearjack .card.clearing {
            animation: clearCard 0.5s ease-in forwards;
        }
        
        #bearjack .card.back {
            background: linear-gradient(135deg, #4a2c70, #6b3aa0);
            border-color: #2a1540;
        }
        
        #bearjack .card.back::after {
            content: '🐻';
            font-size: 40px;
            position: absolute;
        }
        
        #bearjack .card .rank {
            font-size: 28px;
            line-height: 1;
            color: inherit;  /* Inherit the black color from parent */
        }
        
        #bearjack .card .suit {
            font-size: 32px;
            line-height: 1;
        }
        
        #bearjack .card .suit.red {
            color: #e74c3c;
        }
        
        #bearjack .card .suit.black {
            color: #2c3e50;
        }
        
        #bearjack .total-badge {
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
            border: 2px solid #ffd700;
        }
        
        #bearjack .dealer-area .total-badge {
            top: -35px;
            bottom: auto;
        }
        
        #bearjack .hand-bet {
            position: absolute;
            bottom: -35px;
            right: -20px;
            background: #4caf50;
            color: white;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid #2e7d32;
        }
        
        #bearjack .chips-container {
            position: absolute;
            bottom: 140px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 5px;
            animation: slideUp 0.3s ease-out;
            z-index: 1;
        }
        
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px);
            }
        }
        
        #bearjack .chips-container.removing {
            animation: fadeOut 0.3s ease-out forwards;
        }
        
        #bearjack .chip {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #ffd700, #b8860b);
            border: 3px dashed #8b6914;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #2a1540;
            font-size: 12px;
            box-shadow: 
                0 2px 8px rgba(0, 0, 0, 0.3),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Updated Controls with Black/Gold Styling */
        #bearjack .controls {
            background: 
                linear-gradient(180deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)),
                linear-gradient(180deg, #1a1a1a, #0a0a0a);
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 3px solid #ffd700;
            box-shadow: 
                0 -5px 20px rgba(0, 0, 0, 0.5),
                inset 0 2px 4px rgba(255, 215, 0, 0.1);
            flex-wrap: wrap;
            gap: 10px;
            position: relative;
        }
        
        #bearjack .bet-selector {
            display: flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.8));
            padding: 6px 12px;
            border-radius: 25px;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        #bearjack .bet-btn {
            background: linear-gradient(135deg, #ffd700, #b8860b);
            border: none;
            color: #1a1a1a;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
        }
        
        #bearjack .bet-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #ffed4e, #ffd700);
            transform: scale(1.1);
            box-shadow: 0 3px 10px rgba(255, 215, 0, 0.5);
        }
        
        #bearjack .bet-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        #bearjack .bet-amount {
            color: #ffd700;
            font-weight: bold;
            font-size: 16px;
            min-width: 50px;
            text-align: center;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        #bearjack .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        #bearjack .action-btn {
            background: linear-gradient(135deg, #ff6b6b, #ff5252);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        #bearjack .action-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        #bearjack .action-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: #333;
        }
        
        #bearjack .action-btn.deal {
            background: linear-gradient(135deg, #4caf50, #45a049);
            font-size: 14px;
            padding: 10px 24px;
        }
        
        #bearjack .info-controls {
            display: flex;
            gap: 8px;
        }
        
        #bearjack .icon-btn {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
            border: 1px solid rgba(255, 215, 0, 0.4);
            color: #ffd700;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        #bearjack .icon-btn:hover {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2));
            transform: scale(1.1);
            box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
        }
        
        #bearjack .balance-display {
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.8));
            padding: 6px 12px;
            border-radius: 20px;
            color: #ffd700;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 
                0 2px 8px rgba(0, 0, 0, 0.4),
                inset 0 1px 3px rgba(255, 215, 0, 0.1);
        }
        
        #bearjack .balance-display::before {
            content: '💰';
            font-size: 16px;
        }
        
        /* Result popup and overlays */
        #bearjack .result-popup {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2c3e50, #34495e);
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            z-index: 100;
            animation: popIn 0.4s ease-out;
            border: 3px solid #ffd700;
        }
        
        @keyframes popIn {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        #bearjack .result-popup.win {
            animation: popIn 0.4s ease-out, shake 0.5s ease-in-out 0.4s;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        
        @keyframes shake {
            0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
            25% { transform: translate(-50%, -50%) rotate(-2deg); }
            75% { transform: translate(-50%, -50%) rotate(2deg); }
        }
        
        #bearjack .result-title {
            font-size: 28px;
            color: white;
            margin-bottom: 10px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        #bearjack .result-amount {
            font-size: 32px;
            color: #ffd700;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        
        #bearjack .result-details {
            margin-top: 15px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            line-height: 1.6;
        }
        
        #bearjack .info-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
        }
        
        #bearjack .info-panel {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            color: white;
            border: 2px solid #ffd700;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        #bearjack .info-panel h3 {
            color: #ffd700;
            margin-bottom: 20px;
            font-size: 24px;
            text-align: center;
        }
        
        #bearjack .info-panel ul {
            list-style: none;
            padding: 0;
        }
        
        #bearjack .info-panel li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        
        #bearjack .info-panel li:before {
            content: '♠';
            position: absolute;
            left: 0;
            color: #ffd700;
        }
        
        #bearjack .info-close {
            background: #ff6b6b;
            border: none;
            color: white;
            padding: 10px 30px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
            width: 100%;
            transition: all 0.2s;
        }
        
        #bearjack .info-close:hover {
            background: #ff5252;
            transform: scale(1.05);
        }
        
        #bearjack .insurance-prompt {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2c3e50, #34495e);
            padding: 25px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            z-index: 100;
            border: 3px solid #ffd700;
            animation: popIn 0.4s ease-out;
        }
        
        #bearjack .insurance-prompt h3 {
            color: #ffd700;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        #bearjack .insurance-prompt p {
            color: white;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        #bearjack .insurance-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        #bearjack .insurance-buttons button {
            padding: 10px 25px;
            border: none;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        #bearjack .insurance-yes {
            background: #4caf50;
            color: white;
        }
        
        #bearjack .insurance-yes:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        
        #bearjack .insurance-no {
            background: #ff6b6b;
            color: white;
        }
        
        #bearjack .insurance-no:hover {
            background: #ff5252;
            transform: scale(1.05);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            #bearjack .modal {
                width: 100%;
                height: 100%;
                max-height: none;
                border-radius: 0;
            }
            
            #bearjack .header {
                padding: 10px 15px;
            }
            
            #bearjack .title-text {
                font-size: 24px;
                letter-spacing: 2px;
            }
            
            #bearjack .bear-icon {
                font-size: 28px;
            }
            
            #bearjack .close-btn {
                width: 28px;
                height: 28px;
                font-size: 15px;
            }
            
            #bearjack .dealer-area {
                top: 20px;
                width: 95%;
                max-width: none;
            }
            
            #bearjack .player-area {
                bottom: 50px;
                width: 95%;
                max-width: none;
            }
            
            #bearjack .card {
                width: 52px;
                height: 74px;
            }
            
            #bearjack .card .rank {
                font-size: 22px;
            }
            
            #bearjack .card .suit {
                font-size: 26px;
            }
            
            #bearjack .total-badge {
                font-size: 12px;
                padding: 3px 8px;
                bottom: -28px;
            }
            
            #bearjack .controls {
                padding: 8px;
                flex-direction: row;
                flex-wrap: nowrap;
                gap: 8px;
                justify-content: space-between;
                align-items: stretch;
            }
            
            #bearjack .bet-selector {
                flex: 0 0 auto;
                padding: 4px 8px;
                gap: 6px;
            }
            
            #bearjack .bet-btn {
                width: 24px;
                height: 24px;
                font-size: 13px;
            }
            
            #bearjack .bet-amount {
                font-size: 13px;
                min-width: 42px;
            }
            
            #bearjack .action-buttons {
                flex: 1;
                display: flex;
                justify-content: center;
                gap: 4px;
            }
            
            #bearjack .action-btn {
                font-size: 9px;
                padding: 6px 8px;
                min-width: 44px;
            }
            
            #bearjack .balance-display {
                font-size: 12px;
                padding: 4px 8px;
            }
        }
        
        /* Small mobile phones */
        @media (max-width: 480px) {
            #bearjack .title-text {
                font-size: 20px;
                letter-spacing: 1px;
            }
            
            #bearjack .bear-icon {
                font-size: 24px;
            }
            
            #bearjack .card {
                width: 46px;
                height: 65px;
            }
            
            #bearjack .card .rank {
                font-size: 18px;
            }
            
            #bearjack .card .suit {
                font-size: 22px;
            }
            
            #bearjack .dealer-rules {
                display: none;
            }
            
            #bearjack .action-btn {
                font-size: 8px;
                padding: 6px 6px;
                min-width: 38px;
            }
        }
        
        /* Mobile split hands side by side */
        @media (max-width: 768px) {
            #bearjack .player-area.has-split {
                gap: 10px;
            }
            
            #bearjack .player-area.has-split .hand {
                flex: 0 0 45%;
                max-width: 45%;
            }
            
            #bearjack .player-area.has-split .card {
                width: 45px;
                height: 64px;
            }
        }
        
        /* Mobile card stacking to prevent overflow */
        @media (max-width: 768px) {
            #bearjack .hand {
                max-width: 100%;
            }
            
            /* Stack cards with overlap when more than 4 */
            #bearjack .card:nth-child(n+5) {
                margin-left: -25px;
            }
            
            #bearjack .card:nth-child(n+7) {
                margin-left: -30px;
            }
        }
        
        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
            #bearjack .dealer-area {
                top: 10px;
            }
            
            #bearjack .player-area {
                bottom: 30px;
            }
            
            #bearjack .card {
                width: 45px;
                height: 64px;
            }
        }
    </style>
    
    <div class="backdrop"></div>
    <div class="modal">
        <div class="casino-lights"></div>
        <div class="header">
            <div class="title">
                <span class="bear-icon">🐻</span>
                <span class="title-text">BEARJACK</span>
            </div>
            <button class="close-btn" onclick="window.gameManager.closeCurrentGame()">✖</button>
        </div>
        
        <div class="table">
            <div class="dealer-area"></div>
            <div class="table-text">
                <div class="blackjack-pays">BLACKJACK 3 TO 2</div>
                <div class="dealer-rules">Dealer must draw to 16 & stand on all 17's</div>
                <div class="insurance-text">INSURANCE 2 TO 1</div>
            </div>
            <div class="player-area"></div>
        </div>
        
        <div class="controls">
            <div class="bet-selector">
                <button class="bet-btn minus">−</button>
                <div class="bet-amount">1 SC</div>
                <button class="bet-btn plus">+</button>
            </div>
            
            <div class="action-buttons">
                <button class="action-btn deal deal-btn">DEAL</button>
                <button class="action-btn hit-btn" disabled>HIT</button>
                <button class="action-btn stand-btn" disabled>STAND</button>
                <button class="action-btn double-btn" disabled>DOUBLE</button>
                <button class="action-btn split-btn" disabled>SPLIT</button>
            </div>
            
            <div class="info-controls">
                <button class="icon-btn info-btn">ℹ</button>
                <button class="icon-btn sound-btn">🔊</button>
            </div>
            
            <div class="balance-display">
                <span class="balance">0.00</span>
            </div>
        </div>
    </div>
</div>`;
        
        this.state.container = document.createElement('div');
        this.state.container.innerHTML = html;
        document.body.appendChild(this.state.container);
        
        // Bind UI events
        this.bindEvents();
    },
    
    // Bind events
    bindEvents() {
        const modal = document.querySelector('#bearjack');
        if (!modal) return;
        
        // Bet controls
        modal.querySelector('.bet-btn.minus').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.changeBet(-1);
        });
        
        modal.querySelector('.bet-btn.plus').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.changeBet(1);
        });
        
        // Game actions
        modal.querySelector('.deal-btn').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.deal();
        });
        
        modal.querySelector('.hit-btn').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.hit();
        });
        
        modal.querySelector('.stand-btn').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.stand();
        });
        
        modal.querySelector('.double-btn').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.double();
        });
        
        modal.querySelector('.split-btn').addEventListener('click', () => {
            this.state.game.sound.play('click');
            this.state.game.split();
        });
        
        // Sound toggle
        modal.querySelector('.sound-btn').addEventListener('click', () => {
            const enabled = this.state.game.sound.toggle();
            modal.querySelector('.sound-btn').textContent = enabled ? '🔊' : '🔇';
        });
        
        // Info panel
        modal.querySelector('.info-btn').addEventListener('click', () => {
            this.showInfo();
        });
    },
    
    // Show info panel
    showInfo() {
        const infoOverlay = document.createElement('div');
        infoOverlay.className = 'info-overlay';
        infoOverlay.innerHTML = `
            <div class="info-panel">
                <h3>♠ BearJack Rules ♠</h3>
                <ul>
                    <li>Blackjack pays 3:2</li>
                    <li>Dealer stands on all 17</li>
                    <li>Insurance pays 2:1 when dealer shows Ace</li>
                    <li>Double on any two cards</li>
                    <li>Split once (including after split)</li>
                    <li>Split Aces receive one card each</li>
                    <li>6 deck shoe, reshuffled at 75% penetration</li>
                    <li>Bet amounts: 1, 5, or 10 SC</li>
                </ul>
                <button class="info-close">CLOSE</button>
            </div>
        `;
        
        infoOverlay.addEventListener('click', (e) => {
            if (e.target === infoOverlay || e.target.classList.contains('info-close')) {
                infoOverlay.remove();
            }
        });
        
        document.querySelector('#bearjack .table').appendChild(infoOverlay);
    },
    
    // Cleanup
    cleanup() {
        this.state.isActive = false;
        if (this.state.container) {
            this.state.container.remove();
            this.state.container = null;
        }
        this.state.game = null;
    }
};

// Sound system
class SoundSystem {
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
            case 'deal':
                osc.frequency.value = 800;
                gain.gain.value = 0.05;
                osc.start();
                osc.stop(this.context.currentTime + 0.05);
                break;
            case 'click':
                osc.frequency.value = 600;
                gain.gain.value = 0.03;
                osc.start();
                osc.stop(this.context.currentTime + 0.03);
                break;
            case 'win':
                osc.frequency.value = 800;
                gain.gain.value = 0.1;
                osc.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.2);
                osc.start();
                osc.stop(this.context.currentTime + 0.3);
                break;
            case 'bust':
                osc.frequency.value = 200;
                gain.gain.value = 0.08;
                osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.2);
                osc.start();
                osc.stop(this.context.currentTime + 0.2);
                break;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Card class
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.value = this.calculateValue();
    }
    
    calculateValue() {
        if (this.rank === 'A') return 11;
        if (['K', 'Q', 'J'].includes(this.rank)) return 10;
        return parseInt(this.rank);
    }
    
    toString() {
        return `${this.rank}${this.suit}`;
    }
}

// Shoe class (deck manager)
class Shoe {
    constructor(numDecks = 6) {
        this.numDecks = numDecks;
        this.cards = [];
        this.cutCardPosition = 0;
        this.position = 0;
        this.shuffle();
    }
    
    buildDeck() {
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['♠', '♥', '♦', '♣'];
        const deck = [];
        
        for (let i = 0; i < this.numDecks; i++) {
            for (const suit of suits) {
                for (const rank of ranks) {
                    deck.push(new Card(rank, suit));
                }
            }
        }
        
        return deck;
    }
    
    shuffle() {
        this.cards = this.buildDeck();
        
        // Fisher-Yates shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        this.position = 0;
        this.cutCardPosition = Math.floor(this.cards.length * 0.75);
    }
    
    draw() {
        if (this.needsShuffle()) {
            this.shuffle();
        }
        return this.cards[this.position++];
    }
    
    needsShuffle() {
        return this.position >= this.cutCardPosition;
    }
}

// Hand class
class Hand {
    constructor(bet = 0) {
        this.cards = [];
        this.bet = bet;
        this.isSplit = false;
        this.isDoubled = false;
        this.isFinished = false;
        this.isBusted = false;
        this.isBlackjack = false;
    }
    
    addCard(card) {
        this.cards.push(card);
        this.checkBust();
        this.checkBlackjack();
    }
    
    getTotal() {
        let total = 0;
        let aces = 0;
        
        for (const card of this.cards) {
            if (card.rank === 'A') {
                aces++;
                total += 11;
            } else {
                total += card.value;
            }
        }
        
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        
        return total;
    }
    
    checkBust() {
        this.isBusted = this.getTotal() > 21;
        if (this.isBusted) {
            this.isFinished = true;
        }
    }
    
    checkBlackjack() {
        this.isBlackjack = this.cards.length === 2 && this.getTotal() === 21 && !this.isSplit;
    }
    
    canSplit() {
        if (this.cards.length !== 2 || this.isSplit) return false;
        const val1 = this.cards[0].value;
        const val2 = this.cards[1].value;
        return val1 === val2;
    }
    
    canDouble() {
        return this.cards.length === 2 && !this.isDoubled && !this.isFinished;
    }
}

// Main BearJack Game
class BearJackGame {
    constructor(gameModule) {
        this.gameModule = gameModule;
        this.shoe = new Shoe(6);
        this.sound = new SoundSystem();
        this.playerHands = [];
        this.dealerHand = null;
        this.currentHandIndex = 0;
        this.bets = [1, 5, 10];
        this.currentBetIndex = 0;
        this.balance = window.BalanceAPI.getBalance();
        this.insuranceBet = 0;
        this.isPlaying = false;
        this.chipsVisible = false;
    }
    
    getCurrentBet() {
        return this.bets[this.currentBetIndex];
    }
    
    changeBet(direction) {
        if (direction > 0) {
            this.currentBetIndex = (this.currentBetIndex + 1) % this.bets.length;
        } else {
            this.currentBetIndex = (this.currentBetIndex - 1 + this.bets.length) % this.bets.length;
        }
        this.updateBetDisplay();
    }
    
    async deal() {
        if (this.isPlaying) return;
        
        const bet = this.getCurrentBet();
        if (this.balance < bet) {
            alert('Insufficient balance!');
            return;
        }
        
        this.isPlaying = true;
        this.playerHands = [new Hand(bet)];
        this.dealerHand = new Hand();
        this.currentHandIndex = 0;
        this.insuranceBet = 0;
        this.chipsVisible = true;
        
        // Deduct bet from balance API
        window.BalanceAPI.deductBalance(bet);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Show chips briefly before dealing
        this.renderChips();
        await this.sleep(400);
        
        // Remove chips before dealing cards
        this.removeChips();
        await this.sleep(200);
        
        // Clear any existing hands and render empty areas
        this.renderHands();
        
        // Deal cards with animation delay
        await this.dealCardAnimated(this.playerHands[0], 'player', 0);
        await this.dealCardAnimated(this.dealerHand, 'dealer', 0);
        await this.dealCardAnimated(this.playerHands[0], 'player', 1);
        await this.dealCardAnimated(this.dealerHand, 'dealer', 1);
        
        // Update totals and buttons
        this.updateTotals();
        this.updateButtons();
        
        // Check for blackjacks
        if (this.playerHands[0].isBlackjack) {
            if (this.dealerHand.cards[0].rank === 'A') {
                this.offerInsurance();
            } else if (this.dealerHand.getTotal() === 21) {
                // Push
                this.endRound();
            } else {
                // Player wins with blackjack
                this.endRound();
            }
        } else if (this.dealerHand.cards[0].rank === 'A') {
            this.offerInsurance();
        }
    }
    
    async dealCardAnimated(hand, area, index) {
        const card = this.shoe.draw();
        hand.addCard(card);
        this.sound.play('deal');
        
        // Add card to DOM
        const areaElement = document.querySelector(`#bearjack .${area}-area .hand`);
        if (areaElement) {
            const isDealer = area === 'dealer';
            const isHoleCard = isDealer && index === 1;
            
            if (isHoleCard) {
                areaElement.innerHTML += '<div class="card back"></div>';
            } else {
                const isRed = ['♥', '♦'].includes(card.suit);
                areaElement.innerHTML += `
                    <div class="card">
                        <div class="rank">${card.rank}</div>
                        <div class="suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
                    </div>
                `;
            }
        }
        
        await this.sleep(300);
    }
    
    async dealCard(hand) {
        const card = this.shoe.draw();
        hand.addCard(card);
        this.sound.play('deal');
        await this.sleep(300);
        this.render();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    removeChips() {
        const chips = document.querySelector('#bearjack .chips-container');
        if (chips) {
            chips.classList.add('removing');
            setTimeout(() => chips.remove(), 300);
        }
        this.chipsVisible = false;
    }
    
    offerInsurance() {
        const prompt = document.createElement('div');
        prompt.className = 'insurance-prompt';
        prompt.innerHTML = `
            <h3>Insurance?</h3>
            <p>Dealer shows an Ace. Buy insurance for ${(this.playerHands[0].bet / 2).toFixed(2)} SC?</p>
            <div class="insurance-buttons">
                <button class="insurance-yes">Yes</button>
                <button class="insurance-no">No</button>
            </div>
        `;
        
        const table = document.querySelector('#bearjack .table');
        table.appendChild(prompt);
        
        // Bind events
        prompt.querySelector('.insurance-yes').addEventListener('click', async () => {
            prompt.remove();
            await this.buyInsurance();
        });
        
        prompt.querySelector('.insurance-no').addEventListener('click', () => {
            prompt.remove();
        });
    }
    
    async buyInsurance() {
        const insuranceBet = this.playerHands[0].bet / 2;
        if (this.balance < insuranceBet) {
            alert('Insufficient balance for insurance!');
            return;
        }
        
        this.insuranceBet = insuranceBet;
        window.BalanceAPI.deductBalance(insuranceBet);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Check dealer's hole card
        if (this.dealerHand.getTotal() === 21) {
            // Dealer has blackjack, insurance pays 2:1
            const payout = insuranceBet * 3;
            window.BalanceAPI.addBalance(payout);
            this.balance = window.BalanceAPI.getBalance();
            await this.endRound();
        }
    }
    
    async hit() {
        const hand = this.playerHands[this.currentHandIndex];
        await this.dealCard(hand);
        
        if (hand.isBusted) {
            this.sound.play('bust');
            await this.nextHand();
        }
    }
    
    async stand() {
        this.playerHands[this.currentHandIndex].isFinished = true;
        await this.nextHand();
    }
    
    async double() {
        const hand = this.playerHands[this.currentHandIndex];
        if (this.balance < hand.bet) {
            alert('Insufficient balance to double!');
            return;
        }
        
        window.BalanceAPI.deductBalance(hand.bet);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        hand.bet *= 2;
        hand.isDoubled = true;
        
        await this.dealCard(hand);
        hand.isFinished = true;
        await this.nextHand();
    }
    
    async split() {
        const hand = this.playerHands[0];
        if (this.balance < hand.bet) {
            alert('Insufficient balance to split!');
            return;
        }
        
        window.BalanceAPI.deductBalance(hand.bet);
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Create two new hands from the split
        const card1 = hand.cards[0];
        const card2 = hand.cards[1];
        
        const hand1 = new Hand(hand.bet);
        hand1.isSplit = true;
        hand1.cards.push(card1);
        
        const hand2 = new Hand(hand.bet);
        hand2.isSplit = true;
        hand2.cards.push(card2);
        
        this.playerHands = [hand1, hand2];
        
        // Deal one card to each hand
        await this.dealCard(hand1);
        await this.dealCard(hand2);
        
        // Special case for split aces
        if (card1.rank === 'A') {
            hand1.isFinished = true;
            hand2.isFinished = true;
            await this.nextHand();
        }
        
        this.render();
    }
    
    async nextHand() {
        this.currentHandIndex++;
        
        if (this.currentHandIndex >= this.playerHands.length) {
            // All player hands finished
            const anyLive = this.playerHands.some(h => !h.isBusted);
            if (anyLive) {
                await this.dealerPlay();
            }
            await this.endRound();
        } else {
            this.render();
        }
    }
    
    async dealerPlay() {
        // Reveal hole card
        this.render();
        await this.sleep(500);
        
        // Dealer draws until 17 or higher
        while (this.dealerHand.getTotal() < 17) {
            await this.dealCard(this.dealerHand);
        }
    }
    
    async clearTable() {
        // Animate cards sliding off
        const cards = document.querySelectorAll('#bearjack .card');
        cards.forEach(card => {
            card.classList.add('clearing');
        });
        
        await this.sleep(500);
        
        // Clear the areas
        const dealerArea = document.querySelector('#bearjack .dealer-area');
        const playerArea = document.querySelector('#bearjack .player-area');
        if (dealerArea) dealerArea.innerHTML = '';
        if (playerArea) {
            playerArea.innerHTML = '';
            playerArea.classList.remove('has-split');
        }
    }
    
    async endRound() {
        const dealerTotal = this.dealerHand.getTotal();
        let totalWinnings = 0;
        const results = [];
        
        for (let i = 0; i < this.playerHands.length; i++) {
            const hand = this.playerHands[i];
            let result = '';
            let winAmount = 0;
            
            if (hand.isBusted) {
                result = `Hand ${i + 1}: Bust (-${hand.bet} SC)`;
            } else if (hand.isBlackjack && !this.dealerHand.isBlackjack) {
                winAmount = hand.bet * 2.5; // 3:2 payout
                totalWinnings += winAmount;
                result = `Hand ${i + 1}: Blackjack! (+${(winAmount - hand.bet).toFixed(2)} SC)`;
            } else if (this.dealerHand.isBusted) {
                winAmount = hand.bet * 2;
                totalWinnings += winAmount;
                result = `Hand ${i + 1}: Win (+${hand.bet} SC)`;
            } else if (hand.getTotal() > dealerTotal) {
                winAmount = hand.bet * 2;
                totalWinnings += winAmount;
                result = `Hand ${i + 1}: Win (+${hand.bet} SC)`;
            } else if (hand.getTotal() === dealerTotal) {
                winAmount = hand.bet;
                totalWinnings += winAmount;
                result = `Hand ${i + 1}: Push (0 SC)`;
            } else {
                result = `Hand ${i + 1}: Loss (-${hand.bet} SC)`;
            }
            
            results.push(result);
        }
        
        // Add insurance result if applicable
        if (this.insuranceBet > 0 && this.dealerHand.isBlackjack) {
            const insurancePayout = this.insuranceBet * 3;
            totalWinnings += insurancePayout;
            results.push(`Insurance: Win (+${(insurancePayout - this.insuranceBet).toFixed(2)} SC)`);
        } else if (this.insuranceBet > 0) {
            results.push(`Insurance: Loss (-${this.insuranceBet} SC)`);
        }
        
        // Update balance through BalanceAPI
        if (totalWinnings > 0) {
            window.BalanceAPI.addBalance(totalWinnings);
        }
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        
        // Show result popup
        this.showResult(totalWinnings, results);
        
        if (totalWinnings > 0) {
            this.sound.play('win');
        }
        
        this.isPlaying = false;
        
        // Clear table after delay
        setTimeout(async () => {
            await this.clearTable();
            this.updateButtons();
        }, 3500);
    }
    
    showResult(totalWinnings, results) {
        const netChange = totalWinnings - this.playerHands.reduce((sum, h) => sum + h.bet, 0) - this.insuranceBet;
        const isWin = netChange > 0;
        
        const popup = document.createElement('div');
        popup.className = `result-popup ${isWin ? 'win' : ''}`;
        popup.innerHTML = `
            <div class="result-title">${isWin ? 'YOU WIN!' : netChange === 0 ? 'PUSH' : 'DEALER WINS'}</div>
            <div class="result-amount">${netChange >= 0 ? '+' : ''}SC ${netChange.toFixed(2)}</div>
            <div class="result-details">${results.join('<br>')}</div>
        `;
        
        document.querySelector('#bearjack .table').appendChild(popup);
        
        // Close on click outside
        const closePopup = (e) => {
            if (e.target === popup || popup.contains(e.target)) {
                return;
            }
            popup.remove();
            document.querySelector('#bearjack .table').removeEventListener('click', closePopup);
        };
        
        setTimeout(() => {
            document.querySelector('#bearjack .table').addEventListener('click', closePopup);
        }, 100);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
    
    renderChips() {
        const table = document.querySelector('#bearjack .table');
        const existing = table.querySelector('.chips-container');
        if (existing) existing.remove();
        
        if (!this.chipsVisible) return;
        
        const bet = this.getCurrentBet();
        const chipsDiv = document.createElement('div');
        chipsDiv.className = 'chips-container';
        
        // Calculate chip denominations
        let remaining = bet;
        const chips = [];
        
        if (remaining >= 10) {
            chips.push('10');
            remaining -= 10;
        }
        if (remaining >= 5) {
            chips.push('5');
            remaining -= 5;
        }
        while (remaining > 0) {
            chips.push('1');
            remaining--;
        }
        
        chips.forEach(value => {
            chipsDiv.innerHTML += `<div class="chip">${value}</div>`;
        });
        
        table.appendChild(chipsDiv);
    }
    
    renderHands() {
        const dealerArea = document.querySelector('#bearjack .dealer-area');
        const playerArea = document.querySelector('#bearjack .player-area');
        
        // Initialize empty hands
        if (dealerArea) {
            dealerArea.innerHTML = '<div class="hand"></div>';
        }
        
        if (playerArea) {
            // Add has-split class if there are multiple hands
            if (this.playerHands.length > 1) {
                playerArea.classList.add('has-split');
            } else {
                playerArea.classList.remove('has-split');
            }
            
            let playerHTML = '';
            for (let i = 0; i < this.playerHands.length; i++) {
                const isActive = i === this.currentHandIndex && this.isPlaying && !this.playerHands[i].isFinished;
                playerHTML += `<div class="hand ${isActive ? 'active' : ''}"></div>`;
            }
            playerArea.innerHTML = playerHTML;
        }
    }
    
    updateTotals() {
        // Update dealer total
        const dealerArea = document.querySelector('#bearjack .dealer-area .hand');
        if (dealerArea && this.dealerHand) {
            const existingBadge = dealerArea.querySelector('.total-badge');
            if (existingBadge) existingBadge.remove();
            
            if (this.dealerHand.cards.length > 0) {
                const showTotal = !this.isPlaying || this.playerHands.every(h => h.isFinished);
                const total = showTotal ? this.dealerHand.getTotal() : '?';
                dealerArea.innerHTML += `<div class="total-badge">Dealer: ${total}</div>`;
            }
        }
        
        // Update player totals
        const playerHands = document.querySelectorAll('#bearjack .player-area .hand');
        playerHands.forEach((handElement, i) => {
            if (i < this.playerHands.length) {
                const hand = this.playerHands[i];
                const existingBadge = handElement.querySelector('.total-badge');
                if (existingBadge) existingBadge.remove();
                
                if (hand.cards.length > 0) {
                    const label = this.playerHands.length > 1 ? `Hand ${i + 1}: ` : 'Player: ';
                    handElement.innerHTML += `<div class="total-badge">${label}${hand.getTotal()}</div>`;
                }
                
                if (this.playerHands.length > 1) {
                    const existingBet = handElement.querySelector('.hand-bet');
                    if (existingBet) existingBet.remove();
                    handElement.innerHTML += `<div class="hand-bet">Bet: ${hand.bet} SC</div>`;
                }
            }
        });
    }
    
    updateBalanceDisplay() {
        const balanceDisplay = document.querySelector('#bearjack .balance');
        if (balanceDisplay) {
            balanceDisplay.textContent = `${this.balance.toFixed(2)}`;
        }
    }
    
    updateBetDisplay() {
        const betAmount = document.querySelector('#bearjack .bet-amount');
        if (betAmount) {
            betAmount.textContent = `${this.getCurrentBet()} SC`;
        }
    }
    
    render() {
        const dealerArea = document.querySelector('#bearjack .dealer-area');
        const playerArea = document.querySelector('#bearjack .player-area');
        
        // Update balance from API
        this.balance = window.BalanceAPI.getBalance();
        this.updateBalanceDisplay();
        this.updateBetDisplay();
        
        // Render dealer hand
        if (dealerArea && this.dealerHand) {
            let dealerHTML = '<div class="hand">';
            for (let i = 0; i < this.dealerHand.cards.length; i++) {
                const card = this.dealerHand.cards[i];
                if (i === 1 && this.isPlaying && !this.playerHands.every(h => h.isFinished)) {
                    // Hide hole card
                    dealerHTML += '<div class="card back"></div>';
                } else {
                    const isRed = ['♥', '♦'].includes(card.suit);
                    dealerHTML += `
                        <div class="card">
                            <div class="rank">${card.rank}</div>
                            <div class="suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
                        </div>
                    `;
                }
            }
            
            // Show dealer total if appropriate
            if (this.dealerHand.cards.length > 0 && (!this.isPlaying || this.playerHands.every(h => h.isFinished))) {
                dealerHTML += `<div class="total-badge">Dealer: ${this.dealerHand.getTotal()}</div>`;
            } else if (this.dealerHand.cards.length > 0) {
                dealerHTML += `<div class="total-badge">Dealer: ?</div>`;
            }
            
            dealerHTML += '</div>';
            dealerArea.innerHTML = dealerHTML;
        }
        
        // Render player hands
        if (playerArea && this.playerHands.length > 0) {
            // Add has-split class if there are multiple hands
            if (this.playerHands.length > 1) {
                playerArea.classList.add('has-split');
            } else {
                playerArea.classList.remove('has-split');
            }
            
            let playerHTML = '';
            for (let i = 0; i < this.playerHands.length; i++) {
                const hand = this.playerHands[i];
                const isActive = i === this.currentHandIndex && this.isPlaying && !hand.isFinished;
                
                playerHTML += `<div class="hand ${isActive ? 'active' : ''}">`;
                for (const card of hand.cards) {
                    const isRed = ['♥', '♦'].includes(card.suit);
                    playerHTML += `
                        <div class="card">
                            <div class="rank">${card.rank}</div>
                            <div class="suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
                        </div>
                    `;
                }
                
                if (hand.cards.length > 0) {
                    const label = this.playerHands.length > 1 ? `Hand ${i + 1}: ` : 'Player: ';
                    playerHTML += `<div class="total-badge">${label}${hand.getTotal()}</div>`;
                }
                
                if (this.playerHands.length > 1) {
                    playerHTML += `<div class="hand-bet">Bet: ${hand.bet} SC</div>`;
                }
                
                playerHTML += '</div>';
            }
            playerArea.innerHTML = playerHTML;
        }
        
        // Update button states
        this.updateButtons();
    }
    
    updateButtons() {
        const dealBtn = document.querySelector('#bearjack .deal-btn');
        const hitBtn = document.querySelector('#bearjack .hit-btn');
        const standBtn = document.querySelector('#bearjack .stand-btn');
        const doubleBtn = document.querySelector('#bearjack .double-btn');
        const splitBtn = document.querySelector('#bearjack .split-btn');
        const betBtns = document.querySelectorAll('#bearjack .bet-btn');
        
        if (dealBtn) dealBtn.disabled = this.isPlaying;
        
        betBtns.forEach(btn => btn.disabled = this.isPlaying);
        
        if (this.isPlaying && this.currentHandIndex < this.playerHands.length) {
            const currentHand = this.playerHands[this.currentHandIndex];
            
            if (hitBtn) hitBtn.disabled = currentHand.isFinished;
            if (standBtn) standBtn.disabled = currentHand.isFinished;
            if (doubleBtn) doubleBtn.disabled = !currentHand.canDouble() || this.balance < currentHand.bet;
            if (splitBtn) splitBtn.disabled = this.currentHandIndex !== 0 || !currentHand.canSplit() || this.playerHands.length > 1 || this.balance < currentHand.bet;
        } else {
            if (hitBtn) hitBtn.disabled = true;
            if (standBtn) standBtn.disabled = true;
            if (doubleBtn) doubleBtn.disabled = true;
            if (splitBtn) splitBtn.disabled = true;
        }
    }
}