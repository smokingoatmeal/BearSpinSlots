// Chat Bot Module - BearyCare AI Support System
export default class ChatBot {
    constructor() {
        this.isOpen = false;
        this.audioContext = null;
    }
    
    init() {
        this.setupEventListeners();
        this.autoOpenAnimation();
    }
    
    // Setup event listeners
    setupEventListeners() {
        const chatBubble = document.getElementById('chatBubble');
        const chatClose = document.getElementById('chatClose');
        
        if (chatBubble) {
            chatBubble.addEventListener('click', (e) => {
                e.stopPropagation();
                this.open();
            });
        }
        
        if (chatClose) {
            chatClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }
        
        // Handle chat options
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-option-btn')) {
                e.stopPropagation();
                const option = e.target.getAttribute('data-option');
                
                // Check if this is the Start Over button
                if (!option && e.target.textContent === 'Start Over') {
                    this.resetChat();
                    return;
                }
                
                if (option) {
                    this.handleOption(option);
                }
            }
        });
    }
    
    // Auto-open animation after 3 seconds
    autoOpenAnimation() {
        setTimeout(() => {
            const chatBubble = document.getElementById('chatBubble');
            if (chatBubble) {
                chatBubble.style.animation = 'chatPulse 0.5s ease-in-out 3';
            }
        }, 3000);
    }
    
    // Initialize audio
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Play sounds
    playSound(type) {
        this.initAudio();
        if (!this.audioContext) return;
        
        switch(type) {
            case 'beepboop':
                const oscillator1 = this.audioContext.createOscillator();
                const oscillator2 = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator1.frequency.value = 800;
                oscillator2.frequency.value = 1200;
                gainNode.gain.value = 0.1;
                
                oscillator1.start();
                oscillator2.start();
                oscillator1.stop(this.audioContext.currentTime + 0.1);
                oscillator2.stop(this.audioContext.currentTime + 0.2);
                break;
                
            case 'click':
                const click = this.audioContext.createOscillator();
                const clickGain = this.audioContext.createGain();
                
                click.connect(clickGain);
                clickGain.connect(this.audioContext.destination);
                
                click.frequency.value = 600;
                clickGain.gain.value = 0.05;
                
                click.start();
                click.stop(this.audioContext.currentTime + 0.05);
                break;
                
            case 'pop':
                const pop = this.audioContext.createOscillator();
                const popGain = this.audioContext.createGain();
                
                pop.connect(popGain);
                popGain.connect(this.audioContext.destination);
                
                pop.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                pop.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
                popGain.gain.value = 0.1;
                
                pop.start();
                pop.stop(this.audioContext.currentTime + 0.1);
                break;
        }
    }
    
    // Open chat
    open() {
        const chatWindow = document.getElementById('chatWindow');
        const chatBubble = document.getElementById('chatBubble');
        
        if (chatWindow) {
            chatWindow.classList.add('open');
            this.isOpen = true;
        }
        if (chatBubble) {
            chatBubble.style.display = 'none';
        }
        
        this.playSound('beepboop');
    }
    
    // Close chat
    close() {
        const chatWindow = document.getElementById('chatWindow');
        const chatBubble = document.getElementById('chatBubble');
        
        if (chatWindow) {
            chatWindow.classList.remove('open');
            this.isOpen = false;
        }
        if (chatBubble) {
            chatBubble.style.display = 'flex';
        }
    }
    
    // Reset chat
    resetChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="chat-message">
                    <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                    <div class="message-content">
                        <div class="message-text">Hey there buddy! Welcome to BearyCare Support! 🎰</div>
                        <div class="message-text">Please click one of the following:</div>
                        <div class="chat-options" id="mainOptions">
                            <button class="chat-option-btn express" data-option="express">Express Support (5.00 SC) 🤑</button>
                            <button class="chat-option-btn" data-option="declined">Why did my redemption get declined?</button>
                            <button class="chat-option-btn" data-option="losing-sc">Why am I constantly losing SC?</button>
                            <button class="chat-option-btn" data-option="other">Other Request</button>
                        </div>
                    </div>
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Add typing indicator
    addTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingMessage = document.createElement('div');
        typingMessage.className = 'chat-message';
        typingMessage.id = 'typing-indicator';
        typingMessage.innerHTML = `
            <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Play typing sound
        const typingInterval = setInterval(() => {
            this.playSound('click');
        }, 300);
        
        typingMessage.dataset.interval = typingInterval;
    }
    
    // Remove typing indicator
    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            if (indicator.dataset.interval) {
                clearInterval(indicator.dataset.interval);
            }
            indicator.remove();
        }
    }
    
    // Handle chat options
    handleOption(option) {
        const mainOptions = document.getElementById('mainOptions');
        if (mainOptions) {
            mainOptions.style.display = 'none';
        }
        
        if (option === 'express') {
            this.handleExpressSupport();
            return;
        }
        
        this.addTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator();
            this.playSound('pop');
            
            const chatMessages = document.getElementById('chatMessages');
            const responseMessage = document.createElement('div');
            responseMessage.className = 'chat-message';
            responseMessage.style.animation = 'messageSlide 0.3s ease';
            
            let responseContent = '';
            
            switch(option) {
                case 'declined':
                    responseContent = `
                        <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                        <div class="message-content">
                            <div class="error-text">error%dont%display%to%user%3-BILLING ERROR:player-too-profitable(y) - REJECT PAYMENT</div>
                            <div class="message-text">😕 Sorry buddy! Just a technical issue! Spin a little more and try again!</div>
                            <button class="chat-action-btn" onclick="document.getElementById('coinShopPopup').classList.add('show')">Buy More BearCoins!!!</button>
                        </div>
                    `;
                    break;
                    
                case 'losing-sc':
                    responseContent = `
                        <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                        <div class="message-content">
                            <div class="message-text">Aw I guess you didn't get the memo about our newest feature! Every tap, click, spin, or scroll subtracts 0.10 SC from your balance and enters you into our incredible Sitewide Progressive Jackpot! Click below to find out more!</div>
                            <button class="chat-option-btn show-jackpot" data-option="show-jackpot">OMG show me! 😍</button>
                        </div>
                    `;
                    break;
                    
                case 'show-jackpot':
                    this.close();
                    const jackpotPopup = document.getElementById('jackpotPopup');
                    if (jackpotPopup) {
                        jackpotPopup.classList.add('show');
                    }
                    
                    setTimeout(() => {
                        this.open();
                        
                        const resetMessage = document.createElement('div');
                        resetMessage.className = 'chat-message';
                        resetMessage.innerHTML = `
                            <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                            <div class="message-content">
                                <div class="message-text">Hope you're excited about our Progressive Jackpot! 🎰</div>
                                <div class="message-text">Anything else I can help with?</div>
                                <button class="chat-option-btn">Start Over</button>
                            </div>
                        `;
                        chatMessages.appendChild(resetMessage);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        this.playSound('pop');
                    }, 3000);
                    return;
                    
                case 'other':
                    responseContent = `
                        <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                        <div class="message-content">
                            <div class="message-text">😔 Sorry pal, all of our agents are on vacation! Try again another day. In the meantime, feel free to keep spinning! </div>
                            <button class="chat-action-btn" onclick="document.getElementById('coinShopPopup').classList.add('show')">Buy BearCoins Now!</button>
                        </div>
                    `;
                    break;
            }
            
            responseMessage.innerHTML = responseContent;
            chatMessages.appendChild(responseMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            if (option !== 'losing-sc') {
                setTimeout(() => {
                    const resetMessage = document.createElement('div');
                    resetMessage.className = 'chat-message';
                    resetMessage.innerHTML = `
                        <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                        <div class="message-content">
                            <div class="message-text">Anything else I can help with?</div>
                            <button class="chat-option-btn">Start Over</button>
                        </div>
                    `;
                    chatMessages.appendChild(resetMessage);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    this.playSound('pop');
                }, 1500);
            }
        }, 1500);
    }
    
    // Handle express support
    handleExpressSupport() {
        const balance = window.BalanceAPI.getBalance();
        
        if (balance < 5.00) {
            this.showInsufficientBalance();
            return;
        }
        
        const mainOptions = document.getElementById('mainOptions');
        if (mainOptions) {
            mainOptions.style.display = 'none';
        }
        
        this.addTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator();
            this.playSound('pop');
            
            // Deduct 5.00 SC
            window.BalanceAPI.deductBalance(5.00);
            
            // Show deduction animation
            const coinBalance = document.getElementById('coinBalance');
            const sweepsBalance = document.getElementById('sweepsBalance');
            
            if (coinBalance && sweepsBalance) {
                const deductionText = document.createElement('div');
                deductionText.className = 'coin-deduction';
                deductionText.textContent = '-5.00 SC';
                deductionText.style.fontSize = '1.5rem';
                coinBalance.appendChild(deductionText);
                
                sweepsBalance.classList.add('balance-deducting');
                
                setTimeout(() => {
                    sweepsBalance.classList.remove('balance-deducting');
                    if (deductionText.parentNode) {
                        deductionText.remove();
                    }
                }, 2000);
            }
            
            const chatMessages = document.getElementById('chatMessages');
            
            // Show purchase complete
            const purchaseMessage = document.createElement('div');
            purchaseMessage.className = 'chat-message';
            purchaseMessage.innerHTML = `
                <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                <div class="message-content">
                    <div class="message-text">Purchase complete, thanks! 💰</div>
                </div>
            `;
            chatMessages.appendChild(purchaseMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Show disconnected after 2 seconds
            setTimeout(() => {
                this.playSound('pop');
                const disconnectMessage = document.createElement('div');
                disconnectMessage.className = 'chat-message';
                disconnectMessage.innerHTML = `
                    <div class="bot-avatar"><img src="beary.png" alt="BearyCare"></div>
                    <div class="message-content">
                        <div style="text-align: center; margin-top: 1rem;">
                            <div style="color: #ff0000; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px #ff0000; animation: pulse 1s ease-in-out infinite;">
                                ☠️ DISCONNECTED ☠️
                            </div>
                            <div style="color: #888; font-size: 0.9rem; margin-top: 0.5rem;">
                                Express Support has ended your session
                            </div>
                            <button class="chat-option-btn" style="margin-top: 1rem;">Start Over</button>
                        </div>
                    </div>
                `;
                chatMessages.appendChild(disconnectMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 2000);
        }, 2000);
    }
    
    // Show insufficient balance popup
    showInsufficientBalance() {
        const popup = document.getElementById('dailySpinErrorPopup');
        const title = document.getElementById('dailySpinErrorTitle');
        const icon = document.getElementById('dailySpinErrorIcon');
        const message = document.getElementById('dailySpinErrorMessage');
        
        if (popup && title && icon && message) {
            title.textContent = 'INSUFFICIENT BALANCE!';
            title.style.color = '#ff0080';
            icon.textContent = '🚫';
            message.innerHTML = 'Insufficient SC balance! You need at least 5.00 SC for Express Support. Buy more coins!';
            
            popup.classList.add('show');
        }
    }
}

// Create and export instance
const chatBot = new ChatBot();
export { chatBot };