// Diamond System Module - Handles diamond collection and rewards
export default class DiamondSystem {
    constructor() {
        this.diamonds = 0;
        this.totalBCWon = 0;  // Changed from SC to BC
        this.totalBCLost = 0; // Track for jackpot but NOT for diamonds
        this.scratchCardUnlocked = false;
        this.DIAMONDS_REQUIRED = 10;
        this.BC_PER_DIAMOND = 5;  // Changed from SC to BC
    }
    
    init() {
        this.updateDisplay();
        this.setupJackpotListeners(); // Setup mandatory jackpot BC deduction
    }
    
    // Setup event listeners for mandatory jackpot BC deduction
    setupJackpotListeners() {
        // Track clicks
        document.addEventListener('click', (e) => this.handleJackpotInteraction(e));
        
        // Track touch events
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.handleJackpotInteraction(e);
            }
        }, { passive: true });
        
        // Track scrolling
        let scrollTimeout;
        let isScrolling = false;
        
        const startScrollDeduction = () => {
            if (!isScrolling) {
                isScrolling = true;
                const scrollInterval = setInterval(() => {
                    if (isScrolling) {
                        this.handleJackpotInteraction({});
                    } else {
                        clearInterval(scrollInterval);
                    }
                }, 300);
            }
        };
        
        const stopScrollDeduction = () => {
            isScrolling = false;
        };
        
        window.addEventListener('scroll', () => {
            startScrollDeduction();
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(stopScrollDeduction, 150);
        }, { passive: true });
        
        window.addEventListener('wheel', () => {
            startScrollDeduction();
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(stopScrollDeduction, 150);
        }, { passive: true });
    }
    
    // Handle mandatory jackpot BC deduction (NOT for diamonds!)
    handleJackpotInteraction(e) {
        // Skip certain elements
        const skipSelectors = [
            '#coinSwitch',
            '#scratchBtn',
            '#scratchCardClose',
            '#scratchCardBtn',
            '#navMenu',
            '#menuOverlay',
            '#logoMenu',
            '#optOutBtn',
            '#dailySpinBtn',
            '#dailySpinErrorPopup',
            '.game-card[data-game]'
        ];
        
        if (e.target) {
            for (let selector of skipSelectors) {
                if (e.target.closest(selector) || e.target.matches(selector)) {
                    return;
                }
            }
        }
        
        // Deduct BC for jackpot entry (but don't award diamonds!)
        this.deductBCForJackpot(0.10);
    }
    
    // Deduct BC for mandatory jackpot
    deductBCForJackpot(amount) {
        const balance = window.BalanceAPI.getBalance();
        if (balance >= amount) {
            window.BalanceAPI.deductBalance(amount);
            this.totalBCLost += amount; // Track total lost but DON'T award diamonds
            
            // Ensure sweeps coins are showing
            this.ensureSweepsShowing();
            
            // Create deduction animation
            this.createDeductionAnimation(amount);
        }
    }
    
    // Ensure sweeps coins are showing
    ensureSweepsShowing() {
        const goldBalance = document.getElementById('goldBalance');
        const sweepsBalance = document.getElementById('sweepsBalance');
        const goldCoin = document.getElementById('goldCoin');
        const sweepsCoin = document.getElementById('sweepsCoin');
        
        if (goldBalance && goldBalance.classList.contains('active')) {
            goldCoin.classList.remove('active');
            sweepsCoin.classList.add('active');
            goldBalance.classList.remove('active');
            sweepsBalance.classList.add('active');
        }
    }
    
    // Create deduction animation
    createDeductionAnimation(amount) {
        const coinBalance = document.getElementById('coinBalance');
        const sweepsBalance = document.getElementById('sweepsBalance');
        
        if (!coinBalance || !sweepsBalance) return;
        
        const deductionText = document.createElement('div');
        deductionText.className = 'coin-deduction';
        deductionText.textContent = `-${amount.toFixed(2)} BC`;  // Changed from SC to BC
        coinBalance.appendChild(deductionText);
        
        sweepsBalance.classList.add('balance-deducting');
        
        setTimeout(() => {
            sweepsBalance.classList.remove('balance-deducting');
            if (deductionText.parentNode) {
                deductionText.remove();
            }
        }, 2000);
    }
    
    // Track BC winnings and award diamonds (ONLY from wins!)
    trackWinnings(amount) {
        if (amount <= 0) return;
        
        const previousDiamonds = this.diamonds;
        this.totalBCWon += amount;
        
        // Calculate new diamond count (every 5 BC won = 1 diamond)
        const newDiamonds = Math.floor(this.totalBCWon / this.BC_PER_DIAMOND);
        
        // Award new diamonds
        if (newDiamonds > this.diamonds && this.diamonds < this.DIAMONDS_REQUIRED) {
            const diamondsToAward = Math.min(
                newDiamonds - this.diamonds,
                this.DIAMONDS_REQUIRED - this.diamonds
            );
            
            for (let i = 0; i < diamondsToAward; i++) {
                setTimeout(() => {
                    this.diamonds++;
                    this.updateDisplay();
                    this.showDiamondAnimation();
                    
                    // Check if we reached 10 diamonds
                    if (this.diamonds === this.DIAMONDS_REQUIRED) {
                        this.showDiamondNotification();
                    }
                }, i * 500); // Stagger animations
            }
        }
    }
    
    // Update display
    updateDisplay() {
        const displayDiamonds = Math.min(this.diamonds, this.DIAMONDS_REQUIRED);
        
        const diamondCount = document.getElementById('diamondCount');
        const diamondProgressText = document.getElementById('diamondProgressText');
        const diamondProgressFill = document.getElementById('diamondProgressFill');
        const diamondLabel = document.querySelector('.diamond-label');
        const diamondHint = document.querySelector('.diamond-hint');
        
        if (diamondCount) diamondCount.textContent = displayDiamonds;
        if (diamondProgressText) diamondProgressText.textContent = `${displayDiamonds} / ${this.DIAMONDS_REQUIRED} collected`;
        if (diamondProgressFill) {
            const progressPercent = Math.min((displayDiamonds / this.DIAMONDS_REQUIRED) * 100, 100);
            diamondProgressFill.style.width = progressPercent + '%';
        }
        if (diamondLabel) diamondLabel.textContent = `Diamonds (${displayDiamonds}/${this.DIAMONDS_REQUIRED})`;
        if (diamondHint) diamondHint.textContent = 'Collect 10 to unlock Scratch n Rinse!';
        
        // Show/hide scratch button
        const scratchBtn = document.getElementById('scratchCardBtn');
        if (scratchBtn) {
            scratchBtn.style.display = this.diamonds >= this.DIAMONDS_REQUIRED ? 'block' : 'none';
        }
    }
    
    // Show diamond collection animation
    showDiamondAnimation() {
        const animDiv = document.getElementById('diamondCollectAnimation');
        if (animDiv) {
            animDiv.classList.add('show');
            setTimeout(() => {
                animDiv.classList.remove('show');
            }, 2500);
        }
    }
    
    // Show diamond notification
    showDiamondNotification() {
        const notification = document.getElementById('diamondNotification');
        if (notification) {
            notification.classList.add('show');
            
            // Update notification text
            const notificationTitle = notification.querySelector('.diamond-notification-title');
            const notificationText = notification.querySelector('.diamond-notification-text');
            if (notificationTitle) notificationTitle.textContent = '10 Diamonds Collected!';
            if (notificationText) {
                notificationText.innerHTML = 'Claim your Scratch n Rinse from the store!<br>Good luck!';
            }
        }
    }
    
    // Hide diamond notification
    hideDiamondNotification() {
        const notification = document.getElementById('diamondNotification');
        if (notification) {
            notification.classList.remove('show');
        }
    }
    
    // Get current diamond count
    getDiamonds() {
        return Math.min(this.diamonds, this.DIAMONDS_REQUIRED);
    }
    
    // Check if scratch card is available
    canScratch() {
        return this.diamonds >= this.DIAMONDS_REQUIRED;
    }
    
    // Handle scratch card claim
    claimScratchCard() {
        if (this.canScratch()) {
            this.scratchCardUnlocked = true;
            this.hideDiamondNotification();
            // Reset diamonds for next card
            this.diamonds = 0;
            this.totalBCWon = 0;
            this.updateDisplay();
            return true;
        }
        return false;
    }
    
    // Get progress info
    getProgress() {
        return {
            diamonds: this.getDiamonds(),
            totalRequired: this.DIAMONDS_REQUIRED,
            bcWon: this.totalBCWon,  // Changed from scWon to bcWon
            bcNeededForNext: this.BC_PER_DIAMOND - (this.totalBCWon % this.BC_PER_DIAMOND),  // Changed from sc to bc
            canClaim: this.canScratch()
        };
    }
}

// Create and export instance
const diamondSystem = new DiamondSystem();
export { diamondSystem };