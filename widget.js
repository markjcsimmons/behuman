(function() {
    'use strict';
    
    // Namespace to avoid conflicts
    const BeHuman = {
        initialized: false,
        modal: null,
        
        // Initialize the widget
        init: function() {
            if (this.initialized) return;
            
            this.injectStyles();
            this.createModal();
            this.attachEventListeners();
            this.initialized = true;
        },
        
        // Inject CSS styles
        injectStyles: function() {
            if (document.getElementById('behuman-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'behuman-styles';
            style.textContent = `
                #behuman-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 999999;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                #behuman-modal {
                    background-color: transparent;
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                
                #behuman-initial-screen {
                    background-color: white;
                    border-radius: 20px;
                    padding: 40px 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                }
                
                #behuman-modal h1 {
                    font-size: 24px;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 15px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                #behuman-modal p {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.5;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                .behuman-btn {
                    background-color: #4285f4;
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    min-height: 44px;
                    min-width: 120px;
                    font-size: 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.1s;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: rgba(66, 133, 244, 0.3);
                    user-select: none;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                .behuman-btn:hover {
                    background-color: #357ae8;
                }
                
                .behuman-btn:active {
                    background-color: #2a6cd4;
                    transform: scale(0.98);
                }
                
                #behuman-statements-screen {
                    display: none;
                    text-align: left;
                    background-color: white;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                }
                
                .behuman-statement-item {
                    display: flex;
                    align-items: center;
                    padding: 16px 0;
                    border-bottom: 1px solid #eee;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
                }
                
                .behuman-statement-item:last-child {
                    border-bottom: none;
                }
                
                .behuman-statement-item input[type="checkbox"] {
                    width: 24px;
                    height: 24px;
                    min-width: 24px;
                    min-height: 24px;
                    margin-right: 16px;
                    cursor: pointer;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    flex-shrink: 0;
                }
                
                .behuman-statement-item label {
                    font-size: 16px;
                    color: #333;
                    cursor: pointer;
                    flex: 1;
                    padding: 8px 0;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                #behuman-result-screen {
                    display: none;
                    background-color: white;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                }
                
                #behuman-result-screen.verified {
                    color: #34a853;
                }
                
                #behuman-result-screen.robot {
                    color: #ea4335;
                }
                
                .behuman-check-icon {
                    font-size: 64px;
                    margin-bottom: 15px;
                }
                
                #behuman-result-screen h2 {
                    font-size: 28px;
                    font-weight: 500;
                    margin-bottom: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                @media (max-width: 480px) {
                    #behuman-initial-screen {
                        padding: 30px 20px;
                    }
                    
                    #behuman-statements-screen {
                        padding: 20px;
                    }
                    
                    #behuman-result-screen {
                        padding: 20px;
                    }
                    
                    #behuman-modal h1 {
                        font-size: 20px;
                    }
                    
                    #behuman-result-screen h2 {
                        font-size: 24px;
                    }
                    
                    .behuman-check-icon {
                        font-size: 48px;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        // Create modal HTML
        createModal: function() {
            const overlay = document.createElement('div');
            overlay.id = 'behuman-overlay';
            overlay.style.display = 'none';
            
            overlay.innerHTML = `
                <div id="behuman-modal">
                    <div id="behuman-initial-screen">
                        <h1>Verify You Are Human</h1>
                        <p>Please complete a simple test to confirm you are a human.</p>
                        <button class="behuman-btn" id="behuman-start-btn">Click here to begin</button>
                    </div>
                    
                    <div id="behuman-statements-screen">
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt1">
                            <label for="behuman-stmt1">Cruelty is not strength</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt2">
                            <label for="behuman-stmt2">Kindness is not weakness</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt3">
                            <label for="behuman-stmt3">Decency is not optional</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt4">
                            <label for="behuman-stmt4">Humanity comes first</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt5">
                            <label for="behuman-stmt5">Respect is not conditional</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt6">
                            <label for="behuman-stmt6">Being human is enough</label>
                        </div>
                        <div class="behuman-statement-item">
                            <input type="checkbox" id="behuman-stmt7">
                            <label for="behuman-stmt7">Machines are tools, not masters</label>
                        </div>
                        <div style="margin-top: 20px; text-align: center;">
                            <button class="behuman-btn" id="behuman-submit-btn">Submit</button>
                        </div>
                    </div>
                    
                    <div id="behuman-result-screen">
                        <div class="behuman-check-icon" id="behuman-result-icon"></div>
                        <h2 id="behuman-result-text"></h2>
                        <div id="behuman-share-container" style="display: none; margin-top: 20px;">
                            <button class="behuman-btn" id="behuman-share-btn">Tell others you are human</button>
                            <p id="behuman-share-message" style="margin-top: 10px; font-size: 12px; color: #666; display: none;">Link copied to clipboard!</p>
                        </div>
                        <div id="behuman-try-again-container" style="display: none; margin-top: 20px;">
                            <button class="behuman-btn" id="behuman-try-again-btn">Try again</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            this.modal = overlay;
        },
        
        // Attach event listeners
        attachEventListeners: function() {
            const self = this;
            
            // Start button
            document.getElementById('behuman-start-btn').addEventListener('click', function() {
                self.showStatements();
            });
            
            // Submit button
            document.getElementById('behuman-submit-btn').addEventListener('click', function() {
                self.submitVerification();
            });
            
            // Try again button
            document.getElementById('behuman-try-again-btn').addEventListener('click', function() {
                self.tryAgain();
            });
            
            // Share button
            document.getElementById('behuman-share-btn').addEventListener('click', function() {
                self.shareVerification();
            });
            
            // Close on overlay click (outside modal)
            this.modal.addEventListener('click', function(e) {
                if (e.target.id === 'behuman-overlay') {
                    self.hide();
                }
            });
        },
        
        // Show the modal
        show: function() {
            if (!this.initialized) this.init();
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.reset();
        },
        
        // Hide the modal
        hide: function() {
            if (this.modal) {
                this.modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        },
        
        // Reset to initial state
        reset: function() {
            document.getElementById('behuman-initial-screen').style.display = 'block';
            document.getElementById('behuman-statements-screen').style.display = 'none';
            document.getElementById('behuman-result-screen').style.display = 'none';
            
            // Reset checkboxes
            for (let i = 1; i <= 7; i++) {
                const checkbox = document.getElementById('behuman-stmt' + i);
                if (checkbox) checkbox.checked = false;
            }
        },
        
        // Show statements screen
        showStatements: function() {
            document.getElementById('behuman-initial-screen').style.display = 'none';
            document.getElementById('behuman-statements-screen').style.display = 'block';
            document.getElementById('behuman-result-screen').style.display = 'none';
        },
        
        // Submit verification
        submitVerification: function() {
            const checkboxes = [];
            for (let i = 1; i <= 7; i++) {
                checkboxes.push(document.getElementById('behuman-stmt' + i));
            }
            
            const allChecked = checkboxes.every(cb => cb.checked);
            this.showResult(allChecked);
        },
        
        // Show result
        showResult: function(isVerified) {
            const resultScreen = document.getElementById('behuman-result-screen');
            const resultIcon = document.getElementById('behuman-result-icon');
            const resultText = document.getElementById('behuman-result-text');
            const tryAgainContainer = document.getElementById('behuman-try-again-container');
            const shareContainer = document.getElementById('behuman-share-container');
            
            document.getElementById('behuman-statements-screen').style.display = 'none';
            resultScreen.style.display = 'block';
            
            if (isVerified) {
                resultScreen.className = 'verified';
                resultIcon.textContent = '✓';
                resultText.textContent = 'Verified Human';
                tryAgainContainer.style.display = 'none';
                shareContainer.style.display = 'block';
            } else {
                resultScreen.className = 'robot';
                resultIcon.textContent = '✗';
                resultText.textContent = 'Sorry, you must be a robot.';
                tryAgainContainer.style.display = 'block';
                shareContainer.style.display = 'none';
            }
        },
        
        // Try again
        tryAgain: function() {
            this.reset();
        },
        
        // Share verification
        shareVerification: function() {
            const shareUrl = window.location.origin + window.location.pathname + '?shared=true';
            const shareMessage = document.getElementById('behuman-share-message');
            const shareText = "I'm human. Are you? " + shareUrl;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Verify You Are Human',
                    text: shareText,
                    url: shareUrl
                }).then(() => {
                    shareMessage.style.display = 'block';
                    shareMessage.textContent = 'Shared successfully!';
                    setTimeout(() => {
                        shareMessage.style.display = 'none';
                    }, 3000);
                }).catch(err => {
                    if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                        this.copyToClipboard(shareText, shareMessage);
                    }
                });
            } else {
                this.copyToClipboard(shareText, shareMessage);
            }
        },
        
        // Copy to clipboard
        copyToClipboard: function(text, messageElement) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    messageElement.style.display = 'block';
                    messageElement.textContent = 'Link copied to clipboard!';
                    setTimeout(() => {
                        messageElement.style.display = 'none';
                    }, 3000);
                }).catch(() => {
                    this.fallbackCopyToClipboard(text, messageElement);
                });
            } else {
                this.fallbackCopyToClipboard(text, messageElement);
            }
        },
        
        // Fallback copy method
        fallbackCopyToClipboard: function(text, messageElement) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    messageElement.style.display = 'block';
                    messageElement.textContent = 'Link copied to clipboard!';
                    setTimeout(() => {
                        messageElement.style.display = 'none';
                    }, 3000);
                } else {
                    this.showShareUrl(text, messageElement);
                }
            } catch (err) {
                this.showShareUrl(text, messageElement);
            }
            
            document.body.removeChild(textArea);
        },
        
        // Show share URL
        showShareUrl: function(text, messageElement) {
            messageElement.style.display = 'block';
            messageElement.innerHTML = 'Copy this link: <br><strong style="word-break: break-all;">' + text + '</strong>';
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            BeHuman.init();
        });
    } else {
        BeHuman.init();
    }
    
    // Expose to global scope
    window.BeHuman = BeHuman;
    
})();
