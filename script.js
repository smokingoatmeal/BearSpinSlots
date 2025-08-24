// Main Script - ES6 Module Entry Point
import { gameManager } from './js/modules/gameManager.js';
import { diamondSystem } from './js/modules/diamondSystem.js';
import { chatBot } from './js/modules/chatBot.js';

// ====================================
// GLOBAL BALANCE API
// ====================================
window.BalanceAPI = {
    balance: 50.00,
    
    getBalance() {
        return this.balance;
    },
    
    deductBalance(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.updateDisplay();
            return true;
        }
        return false;
    },
    
    addBalance(amount) {
        this.balance += amount;
        this.updateDisplay();
        
        // Track winnings for diamond system
        if (amount > 0) {
            diamondSystem.trackWinnings(amount);
        }
        
        return true;
    },
    
    updateDisplay() {
        const sweepsBalance = document.getElementById('sweepsBalance');
        if (sweepsBalance) {
            sweepsBalance.textContent = this.balance.toFixed(2);
        }
    }
};

// ====================================
// SOUND EFFECTS
// ====================================
const sounds = {
    beepboop: () => chatBot.playSound('beepboop'),
    click: () => chatBot.playSound('click'),
    pop: () => chatBot.playSound('pop')
};

// ====================================
// REGISTER GAMES
// ====================================
function registerGames() {
    // Make gameManager globally accessible for compatibility
    window.gameManager = gameManager;
    
    // Register Joker's Paw game
    gameManager.registerGame('jokerspaw', {
        name: "Joker's Paw",
        module: '/js/games/jokerspaw.js'
 });
}

// Register BearJack game
gameManager.registerGame('bearjack', {
    name: "BearJack",
    module: '/js/games/bearjack.js'
});
// Register Plinko game
gameManager.registerGame('plinko', {
    name: "Plinko",
    module: '/js/games/plinko.js'
});
// ====================================
// LOAD HONEY ROLL SLOT GAME
// ====================================
async function loadHoneyRollSlot() {
    try {
        // Import the Honey Roll module
        const honeyRollModule = await import('./js/games/honeyroll.js');
        const HoneyRoll = honeyRollModule.default;
        
        // Add open method to HoneyRoll
        HoneyRoll.open = function() {
            // Set as current game for gameManager compatibility
            window.gameManager.currentGame = this;
            this.init();
        };
        
        // Add close method to match cleanup
        HoneyRoll.close = function() {
            this.cleanup();
            window.gameManager.currentGame = null;
        };
        
        // Make it globally accessible
        window.HoneyRoll = HoneyRoll;
        
        console.log('Honey Roll slot game loaded and ready');
    } catch (error) {
        console.error('Failed to load Honey Roll game:', error);
    }
}

// ====================================
// LOAD JOKER'S PAW SLOT GAME
// ====================================
async function loadJokersPaw() {
    try {
        // Import the Joker's Paw module
        const jokersPawModule = await import('./js/games/jokerspaw.js');
        const JokersPaw = jokersPawModule.default;
        
        // Add open method to JokersPaw
        JokersPaw.open = function() {
            // Set as current game for gameManager compatibility
            window.gameManager.currentGame = this;
            this.init();
        };
        
        // Add close method to match cleanup
        JokersPaw.close = function() {
            this.cleanup();
            window.gameManager.currentGame = null;
        };
        
        // Make it globally accessible
        window.JokersPaw = JokersPaw;
        
        console.log("Joker's Paw slot game loaded and ready");
    } catch (error) {
        console.error("Failed to load Joker's Paw game:", error);
    }
}

// ====================================
// PARTICLE GENERATION
// ====================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ====================================
// MASSIVE CONFETTI SYSTEM
// ====================================
function createMassiveConfetti() {
    const container = document.getElementById('massiveConfetti');
    if (!container) return;
    
    container.classList.add('active');
    container.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'mega-confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.width = (5 + Math.random() * 15) + 'px';
        confetti.style.height = confetti.style.width;
        
        const colors = ['#ff0080', '#00f7ff', '#ffd700', '#00ff88', '#8e2de2', '#ff4080', '#ffed4e'];
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(confetti);
    }
    
    for (let i = 0; i < 50; i++) {
        const coin = document.createElement('div');
        coin.className = 'mega-coin';
        coin.textContent = Math.random() > 0.5 ? '🪙' : '💰';
        coin.style.left = Math.random() * 100 + '%';
        coin.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(coin);
    }
    
    setTimeout(() => {
        container.classList.remove('active');
        container.innerHTML = '';
    }, 5000);
}

// Make it globally accessible
window.createMassiveConfetti = createMassiveConfetti;

// ====================================
// DAILY SPIN WHEEL HANDLER
// ====================================
function initDailySpinWheel() {
    const dailySpinBtn = document.getElementById('dailySpinBtn');
    const dailyWheelModal = document.getElementById('dailyWheelModal');
    const dailyWheelClose = document.getElementById('dailyWheelClose');
    const dailyWheelSpinBtn = document.getElementById('dailyWheelSpinBtn');
    const dailyWheelReel = document.getElementById('dailyWheelReel');
    const dailyWheelResult = document.getElementById('dailyWheelResult');
    const prizeAmount = document.getElementById('prizeAmount');
    
    // Track if daily spin has been used
    let dailySpinUsed = localStorage.getItem('dailySpinUsed') === 'false';
    let lastSpinDate = localStorage.getItem('lastSpinDate');
    
    // Check if it's a new day
    const today = new Date().toDateString();
    if (lastSpinDate !== today) {
        dailySpinUsed = false;
        localStorage.setItem('dailySpinUsed', 'false');
    }
    
    // Prize configuration with weights
    const prizes = [
        { id: '5gc', text: '5 GC', weight: 30 },
        { id: '10gc', text: '10 GC', weight: 25 },
        { id: '25gc', text: '25 GC', weight: 20 },
        { id: '50gc', text: '50 GC', weight: 10 },
        { id: '100gc', text: '100 GC', weight: 8 },
        { id: '0.5sc', text: '0.5 SC', weight: 4 },
        { id: '1sc', text: '1 SC', weight: 2 },
        { id: '2sc', text: '2 SC', weight: 1 }
    ];
    
    // Daily spin button click handler
    if (dailySpinBtn) {
        dailySpinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dailySpinUsed) {
                // Show "one spin per day" error
                showDailySpinError();
            } else {
                // Show the wheel modal
                dailyWheelModal.classList.add('show');
                dailyWheelResult.classList.remove('show');
                dailyWheelSpinBtn.disabled = false;
                dailyWheelReel.style.transform = 'translateX(-50%) translateY(0)';
            }
        });
    }
    
    // Close wheel modal
    if (dailyWheelClose) {
        dailyWheelClose.addEventListener('click', (e) => {
            e.stopPropagation();
            dailyWheelModal.classList.remove('show');
        });
    }
    
    // Click outside to close
    if (dailyWheelModal) {
        dailyWheelModal.addEventListener('click', (e) => {
            if (e.target === dailyWheelModal) {
                dailyWheelModal.classList.remove('show');
            }
        });
    }
    
    // Spin wheel handler
    if (dailyWheelSpinBtn) {
        dailyWheelSpinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (dailySpinUsed) {
                showDailySpinError();
                dailyWheelModal.classList.remove('show');
                return;
            }
            
            // Disable button during spin
            dailyWheelSpinBtn.disabled = true;
            
            // Select winner based on weights
            const winner = selectWeightedPrize(prizes);
            const winnerIndex = prizes.findIndex(p => p.id === winner.id);
            
            // Calculate spin distance
            const itemHeight = 85; // 75px height + 10px margin
            const totalItems = 8; // 8 unique prizes
            const extraSpins = 3; // Extra full rotations for effect
            const spinDistance = (extraSpins * totalItems * itemHeight) + (winnerIndex * itemHeight) + (itemHeight / 2);
            
            // Apply spinning animation
            dailyWheelReel.style.setProperty('--spin-distance', `-${spinDistance}px`);
            dailyWheelReel.classList.add('spinning');
            
            // Show result after spin completes
            setTimeout(() => {
                // Mark prize item as winning
                const prizeItems = dailyWheelReel.querySelectorAll('.daily-prize-item');
                prizeItems.forEach(item => item.classList.remove('winning'));
                
                // Find and highlight the winning item (accounting for duplicates)
                const winningItems = Array.from(prizeItems).filter(item => 
                    item.getAttribute('data-prize') === winner.id
                );
                winningItems.forEach(item => item.classList.add('winning'));
                
                // Show result
                prizeAmount.textContent = winner.text;
                dailyWheelResult.classList.add('show');
                
                // Award the prize
                awardDailyPrize(winner);
                
                // Mark spin as used
                dailySpinUsed = true;
                localStorage.setItem('dailySpinUsed', 'true');
                localStorage.setItem('lastSpinDate', today);
                
                // Play confetti effect
                if (window.createMassiveConfetti) {
                    window.createMassiveConfetti();
                }
                
                // Auto close after 5 seconds
                setTimeout(() => {
                    dailyWheelModal.classList.remove('show');
                    dailyWheelReel.classList.remove('spinning');
                    dailyWheelReel.style.transform = 'translateX(-50%) translateY(0)';
                }, 5000);
            }, 3000);
        });
    }
    
    // Helper function to select prize based on weights
    function selectWeightedPrize(prizes) {
        const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const prize of prizes) {
            random -= prize.weight;
            if (random <= 0) {
                return prize;
            }
        }
        
        return prizes[0]; // Fallback
    }
    
    // Award the prize
    function awardDailyPrize(prize) {
        // Parse the prize amount
        if (prize.id.includes('gc')) {
            const amount = parseInt(prize.id);
            const currentGC = parseInt(document.getElementById('goldBalance').textContent);
            document.getElementById('goldBalance').textContent = currentGC + amount;
        } else if (prize.id.includes('sc')) {
            const amount = parseFloat(prize.id);
            if (window.BalanceAPI) {
                window.BalanceAPI.addBalance(amount);
            }
        }
    }
    
    // Show daily spin error
    function showDailySpinError() {
        const errorPopup = document.getElementById('dailySpinErrorPopup');
        const errorTitle = document.getElementById('dailySpinErrorTitle');
        const errorIcon = document.getElementById('dailySpinErrorIcon');
        const errorMessage = document.getElementById('dailySpinErrorMessage');
        
        if (errorPopup && errorTitle && errorIcon && errorMessage) {
            errorTitle.textContent = 'ONE SPIN PER DAY!';
            errorTitle.style.color = '#ff0080';
            errorIcon.textContent = '😠';
            errorMessage.innerHTML = `
                Hey cool it bud! You already had your spin!<br><br>
                <button class="chat-action-btn" onclick="document.getElementById('dailySpinErrorPopup').classList.remove('show'); document.getElementById('coinShopPopup').classList.add('show');">BUY SOME BEARCOINS! CLICK HERE!</button>
            `;
            
            errorPopup.classList.add('show');
        }
    }
    
    // Close error popup handlers
    const dailySpinErrorClose = document.getElementById('dailySpinErrorClose');
    const dailySpinErrorPopup = document.getElementById('dailySpinErrorPopup');
    
    if (dailySpinErrorClose) {
        dailySpinErrorClose.addEventListener('click', (e) => {
            e.stopPropagation();
            dailySpinErrorPopup.classList.remove('show');
        });
    }
    
    if (dailySpinErrorPopup) {
        dailySpinErrorPopup.addEventListener('click', (e) => {
            if (e.target === dailySpinErrorPopup) {
                dailySpinErrorPopup.classList.remove('show');
            }
        });
    }
}

// Export the initialization function
window.initDailySpinWheel = initDailySpinWheel;

// ====================================
// COIN TOGGLE FUNCTIONALITY
// ====================================
function initCoinToggle() {
    const coinSwitch = document.getElementById('coinSwitch');
    const goldCoin = document.getElementById('goldCoin');
    const sweepsCoin = document.getElementById('sweepsCoin');
    const goldBalance = document.getElementById('goldBalance');
    const sweepsBalance = document.getElementById('sweepsBalance');
    
    let isGoldActive = true;
    
    if (coinSwitch) {
        coinSwitch.addEventListener('click', function(e) {
            e.stopPropagation();
            isGoldActive = !isGoldActive;
            
            if (isGoldActive) {
                goldCoin.classList.add('active');
                sweepsCoin.classList.remove('active');
                goldBalance.classList.add('active');
                sweepsBalance.classList.remove('active');
            } else {
                goldCoin.classList.remove('active');
                sweepsCoin.classList.add('active');
                goldBalance.classList.remove('active');
                sweepsBalance.classList.add('active');
            }
        });
    }
}

// ====================================
// NAVIGATION MENU
// ====================================
function initNavigation() {
    const logoMenu = document.getElementById('logoMenu');
    const navMenu = document.getElementById('navMenu');
    const navClose = document.getElementById('navClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const navItems = document.querySelectorAll('.nav-item');
    const storeBtn = document.querySelector('.nav-item-store');
    const redeemBtn = document.querySelector('.nav-item-redeem');
    const promotionsPopup = document.getElementById('promotionsPopup');
    const closePromotions = document.getElementById('closePromotions');
    const coinShopPopup = document.getElementById('coinShopPopup');
    
    if (logoMenu) {
        logoMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.add('open');
            menuOverlay.classList.add('show');
        });
    }
    
    if (navClose) {
        navClose.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            navMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
        });
    }
    
    if (storeBtn) {
        storeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
            coinShopPopup.classList.add('show');
        });
    }
    
    if (redeemBtn) {
        redeemBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
            document.getElementById('redeemErrorPopup').classList.add('show');
        });
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');
            
            navMenu.classList.remove('open');
            menuOverlay.classList.remove('show');
            
            switch(action) {
                case 'slots':
                    document.querySelector('.games-section').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'promotions':
                    promotionsPopup.classList.add('show');
                    break;
                case 'refer':
                    document.getElementById('referPopup').classList.add('show');
                    break;
                case 'responsible':
                    document.querySelector('.bearycare-section').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'support':
                    chatBot.open();
                    break;
            }
        });
    });
    
    if (closePromotions) {
        closePromotions.addEventListener('click', function(e) {
            e.stopPropagation();
            promotionsPopup.classList.remove('show');
        });
    }
}

// ====================================
// COIN SHOP
// ====================================
function initCoinShop() {
    const scratchBtn = document.getElementById('scratchBtn');
    const closeCoinShop = document.getElementById('closeCoinShop');
    const coinShopPopup = document.getElementById('coinShopPopup');
    
    if (scratchBtn) {
        scratchBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            coinShopPopup.classList.add('show');
        });
    }
    
    if (closeCoinShop) {
        closeCoinShop.addEventListener('click', function(e) {
            e.stopPropagation();
            coinShopPopup.classList.remove('show');
        });
    }
    
    if (coinShopPopup) {
        coinShopPopup.addEventListener('click', function(e) {
            if (e.target === coinShopPopup) {
                coinShopPopup.classList.remove('show');
            }
        });
    }
    
    // Coin pack purchases
    const coinPacks = document.querySelectorAll('.coin-pack');
    const errorPopup = document.getElementById('errorPopup');
    const errorClose = document.getElementById('errorClose');
    
    coinPacks.forEach(pack => {
        pack.addEventListener('click', function(e) {
            e.stopPropagation();
            errorPopup.classList.add('show');
            
            setTimeout(() => {
                const chatBubble = document.getElementById('chatBubble');
                if (chatBubble) {
                    const rect = chatBubble.getBoundingClientRect();
                    const arrow = document.getElementById('errorArrow');
                    arrow.style.position = 'fixed';
                    arrow.style.bottom = (window.innerHeight - rect.top + 20) + 'px';
                    arrow.style.right = (window.innerWidth - rect.right + rect.width/2 - 50) + 'px';
                }
            }, 100);
        });
    });
    
    if (errorClose) {
        errorClose.addEventListener('click', function(e) {
            e.stopPropagation();
            errorPopup.classList.remove('show');
        });
    }
    
    if (errorPopup) {
        errorPopup.addEventListener('click', function(e) {
            if (e.target === errorPopup) {
                errorPopup.classList.remove('show');
            }
        });
    }
}

// ====================================
// SCRATCH CARD
// ====================================
function initScratchCard() {
    const openStoreFromDiamond = document.getElementById('openStoreFromDiamond');
    const scratchCardClose = document.getElementById('scratchCardClose');
    const scratchCardBtn = document.getElementById('scratchCardBtn');
    
    if (openStoreFromDiamond) {
        openStoreFromDiamond.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            diamondSystem.hideDiamondNotification();
            document.getElementById('coinShopPopup').classList.add('show');
        });
    }
    
    if (scratchCardClose) {
        scratchCardClose.addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('scratchCardPopup').classList.remove('show');
        });
    }
    
    if (scratchCardBtn) {
        scratchCardBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (diamondSystem.claimScratchCard()) {
                const popup = document.getElementById('scratchCardPopup');
                popup.classList.add('show');
                document.querySelector('.scratch-message').style.display = 'none';
                document.getElementById('scratchCardReveal').style.display = 'block';
                
                createMassiveConfetti();
            }
        });
    }
}

// ====================================
// JACKPOT BAR (Removed SC deduction)
// ====================================
function initJackpot() {
    const jackpotBar = document.getElementById('jackpotBar');
    const jackpotPopup = document.getElementById('jackpotPopup');
    const jackpotClose = document.getElementById('jackpotClose');
    const optOutBtn = document.getElementById('optOutBtn');
    const optOutBubble = document.getElementById('optOutBubble');
    
    if (jackpotBar) {
        jackpotBar.addEventListener('click', function(e) {
            e.stopPropagation();
            jackpotPopup.classList.toggle('show');
        });
    }
    
    if (jackpotClose) {
        jackpotClose.addEventListener('click', function(e) {
            e.stopPropagation();
            jackpotPopup.classList.remove('show');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (jackpotPopup && jackpotPopup.classList.contains('show') && 
            !jackpotPopup.contains(e.target) && 
            e.target !== jackpotBar && 
            !jackpotBar.contains(e.target)) {
            jackpotPopup.classList.remove('show');
        }
    });
    
    if (optOutBtn) {
        optOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            optOutBubble.classList.add('show');
            setTimeout(() => {
                optOutBubble.classList.remove('show');
            }, 3000);
        });
    }
    
    // Animate jackpot amounts
    animateJackpots();
}

function animateJackpots() {
    const jackpotAmounts = document.querySelectorAll('.jackpot-amount');
    
    jackpotAmounts.forEach(amount => {
        const type = amount.dataset.jackpot;
        let currentValue = parseFloat(amount.textContent.replace(/,/g, ''));
        let increment = 0;
        
        switch(type) {
            case 'grand':
                increment = Math.random() * 50 + 10;
                break;
            case 'major':
                increment = Math.random() * 5 + 1;
                break;
            case 'minor':
                increment = Math.random() * 2 + 0.5;
                break;
            case 'mini':
                increment = Math.random() * 0.5 + 0.1;
                break;
        }
        
        setInterval(() => {
            currentValue += increment;
            amount.textContent = currentValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }, 3000);
    });
}

// ====================================
// ERROR POPUPS
// ====================================
function initErrorPopups() {
    const redeemErrorClose = document.getElementById('redeemErrorClose');
    
    if (redeemErrorClose) {
        redeemErrorClose.addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('redeemErrorPopup').classList.remove('show');
        });
    }
}

// ====================================
// GAME CARDS - HYBRID APPROACH
// ====================================
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const img = card.querySelector('img');
        if (img) {
            // Handle Honey Roll directly
            if (img.alt === 'Honey Roll') {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Direct approach for Honey Roll
                    if (window.HoneyRoll && window.HoneyRoll.open) {
                        window.HoneyRoll.open();
                    } else {
                        console.error('Honey Roll game not loaded');
                    }
                });
            }
            // Handle Joker's Paw directly
            else if (img.alt === "Joker's Paw") {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Direct approach for Joker's Paw
                    if (window.JokersPaw && window.JokersPaw.open) {
                        window.JokersPaw.open();
                    } else {
                        console.error("Joker's Paw game not loaded");
                    }
                });
            }
            // Handle future modular games
            else if (img.alt === 'Blackjack' || img.alt === 'Slots') {
                // These would use the modular approach
                const gameName = img.alt.toLowerCase().replace(/\s+/g, '');
                card.setAttribute('data-game', gameName);
            }

// Handle Plinko - uses modular approach
else if (img.alt === 'Plinko') {
    // Don't add click handler here since data-game="plinko" 
    // handles it through gameManager.initializeGameCards()
}
// Handle BearJack directly with modular approach
else if (img.alt === 'BearJack') {
    card.setAttribute('data-game', 'bearjack');
}
            // Handle restricted games
            else {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showRestrictedLocationPopup();
                });
            }
        }
    });
    
    // Initialize game manager for modular games
    gameManager.initializeGameCards();
}

function showRestrictedLocationPopup() {
    const popup = document.getElementById('dailySpinErrorPopup');
    const title = document.getElementById('dailySpinErrorTitle');
    const icon = document.getElementById('dailySpinErrorIcon');
    const message = document.getElementById('dailySpinErrorMessage');
    
    if (popup && title && icon && message) {
        title.textContent = 'RESTRICTED LOCATION';
        title.style.color = '#ff0080';
        icon.textContent = '🚫';
        message.innerHTML = 'Sorry, try one of our featured games instead!';
        
        popup.classList.add('show');
    }
}

// ====================================
// REFER-A-FRIEND
// ====================================
function initReferAFriend() {
    const referClose = document.getElementById('referClose');
    const copyBtn = document.getElementById('copyBtn');
    const referLink = document.getElementById('referLink');
    
    if (referClose) {
        referClose.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('referPopup').classList.remove('show');
        });
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            referLink.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
    }
}

// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', async function() {
    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Register modular games
    registerGames();
    
    // Initialize modules
    diamondSystem.init();
    chatBot.init();
    
    // Initialize UI components
    createParticles();
    animateJackpots();
    
    // Set initial SC balance display
    const currentSCBalance = window.BalanceAPI.getBalance();
    document.getElementById('sweepsBalance').textContent = currentSCBalance.toFixed(2);
    
    // Load Honey Roll slot game (await to ensure it's loaded before initializing cards)
    await loadHoneyRollSlot();
    
    // Load Joker's Paw slot game
    await loadJokersPaw();
    
    // Initialize game cards (including Honey Roll and Joker's Paw)
    initGameCards();
    
    // Initialize all other components
    initDailySpinWheel();
    initCoinToggle();
    initNavigation();
    initCoinShop();
    initScratchCard();
    initJackpot();
    initErrorPopups();
    initReferAFriend();
    
    // Update initial balance display
    window.BalanceAPI.updateDisplay();
});