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
            this.autoCreateButton();
            this.initialized = true;
        },
        
        // Automatically create a button on the page
        autoCreateButton: function() {
            // Check if a button already exists
            if (document.getElementById('behuman-auto-button')) return;
            
            const button = document.createElement('button');
            button.id = 'behuman-auto-button';
            button.className = 'behuman-btn';
            button.textContent = 'Verify You Are Human';
            button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999998;';
            button.addEventListener('click', function() {
                BeHuman.show();
            });
            
            document.body.appendChild(button);
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
                    padding: 10px 0;
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
                
                #behuman-instructions-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000000;
                    padding: 20px;
                }
                
                #behuman-instructions-modal {
                    background-color: white;
                    border-radius: 8px;
                    padding: 30px;
                    max-width: 600px;
                    width: 100%;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    position: relative;
                }
                
                #behuman-instructions-modal h3 {
                    font-size: 24px;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                #behuman-instructions-modal p {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 15px;
                    line-height: 1.6;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                #behuman-instructions-code {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    color: #333;
                    margin: 15px 0;
                    word-break: break-all;
                    border: 1px solid #ddd;
                }
                
                #behuman-instructions-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #999;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                #behuman-instructions-close:hover {
                    color: #333;
                }
                
                .behuman-toggle-option {
                    transition: all 0.2s;
                }
                
                .behuman-toggle-active {
                    border-color: #4285f4 !important;
                    background-color: #4285f4 !important;
                    color: white !important;
                }
                
                .behuman-reset-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #666;
                    transition: all 0.2s;
                    z-index: 1000001;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
                
                .behuman-reset-button:hover {
                    background-color: #e0e0e0;
                    color: #333;
                }
                
                .behuman-reset-button:active {
                    transform: scale(0.95);
                }
                
            `;
            document.head.appendChild(style);
        },
        
        // Create modal HTML
        createModal: function() {
            const overlay = document.createElement('div');
            overlay.id = 'behuman-overlay';
            overlay.style.display = 'none';
            
            // Create reset button outside modal
            const resetButton = document.createElement('button');
            resetButton.className = 'behuman-reset-button';
            resetButton.onclick = () => { this.resetToHome(); };
            resetButton.title = 'Reset';
            resetButton.textContent = '↻';
            document.body.appendChild(resetButton);
            
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
                        <div id="behuman-share-container" style="display: none; margin-top: 20px; width: 100%;">
                            <button class="behuman-btn" id="behuman-share-btn" style="width: 100%;">Tell others you are human</button>
                            <p id="behuman-share-message" style="margin-top: 10px; font-size: 12px; color: #666; display: none;">Link copied to clipboard!</p>
                            <button class="behuman-btn" id="behuman-widget-btn" style="margin-top: 15px; background-color: #34a853; width: 100%;">Add widget to your website</button>
                            <button class="behuman-btn" id="behuman-ledger-btn" style="margin-top: 15px; background-color: #757575; width: 100%;">Join the Human Ledger</button>
                        </div>
                        <div id="behuman-try-again-container" style="display: none; margin-top: 20px;">
                            <button class="behuman-btn" id="behuman-try-again-btn">Try again</button>
                        </div>
                    </div>
                    
                    <div id="behuman-ledger-screen" style="display: none; text-align: left; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);">
                        <h3 style="font-size: 24px; font-weight: 500; color: #333; margin-bottom: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">Join the Human Ledger</h3>
                        <form id="behuman-ledger-form">
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">Name (or initials / pseudonym)</label>
                                <input type="text" id="behuman-ledger-name" name="name" placeholder="Enter your name, initials, or pseudonym" required style="width: 100%; padding: 12px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">City</label>
                                <input type="text" id="behuman-ledger-city" name="city" placeholder="Enter your city" required style="width: 100%; padding: 12px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">Country</label>
                                <input type="text" id="behuman-ledger-country" name="country" placeholder="Enter your country" required style="width: 100%; padding: 12px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">Type</label>
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    <label class="behuman-toggle-option behuman-toggle-active" for="behuman-ledger-type-individual" style="flex: 1; padding: 12px; border: 2px solid #4285f4; border-radius: 4px; text-align: center; cursor: pointer; font-size: 14px; background-color: #4285f4; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
                                        <input type="radio" id="behuman-ledger-type-individual" name="type" value="individual" checked style="display: none;">
                                        Individual
                                    </label>
                                    <label class="behuman-toggle-option" for="behuman-ledger-type-organization" style="flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 4px; text-align: center; cursor: pointer; font-size: 14px; background-color: white; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
                                        <input type="radio" id="behuman-ledger-type-organization" name="type" value="organization" style="display: none;">
                                        Organization
                                    </label>
                                </div>
                            </div>
                            <button type="submit" class="behuman-btn" style="width: 100%; margin-top: 20px;">Add my name</button>
                            <p id="behuman-ledger-message" style="margin-top: 15px; font-size: 14px; text-align: center; display: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;"></p>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            this.modal = overlay;
            
            // Create instructions modal
            const instructionsOverlay = document.createElement('div');
            instructionsOverlay.id = 'behuman-instructions-overlay';
            instructionsOverlay.innerHTML = `
                <div id="behuman-instructions-modal" onclick="event.stopPropagation()">
                    <button id="behuman-instructions-close">×</button>
                    <h3>Add Widget to Your Website</h3>
                    <p>Add this single line to your HTML:</p>
                    <div id="behuman-instructions-code">&lt;script src="https://markjcsimmons.github.io/behuman/widget.js"&gt;&lt;\/script&gt;</div>
                    <p>That's it! A "Verify You Are Human" button will automatically appear in the bottom-right corner of your page.</p>
                    <button class="behuman-btn" id="behuman-copy-script-btn" style="margin-top: 10px;">Copy Script</button>
                    <p id="behuman-copy-message" style="margin-top: 10px; font-size: 12px; color: #34a853; display: none;">Script copied to clipboard!</p>
                </div>
            `;
            document.body.appendChild(instructionsOverlay);
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
            
            // Widget instructions button
            document.getElementById('behuman-widget-btn').addEventListener('click', function() {
                self.showWidgetInstructions();
            });
            
            // Instructions close button
            document.getElementById('behuman-instructions-close').addEventListener('click', function() {
                self.closeWidgetInstructions();
            });
            
            // Instructions overlay click to close
            document.getElementById('behuman-instructions-overlay').addEventListener('click', function(e) {
                if (e.target.id === 'behuman-instructions-overlay') {
                    self.closeWidgetInstructions();
                }
            });
            
            // Copy script button
            document.getElementById('behuman-copy-script-btn').addEventListener('click', function() {
                self.copyWidgetScript();
            });
            
            // Ledger button
            document.getElementById('behuman-ledger-btn').addEventListener('click', function() {
                self.showHumanLedger();
            });
            
            // Ledger toggle options
            document.querySelectorAll('.behuman-toggle-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.behuman-toggle-option').forEach(opt => {
                        opt.classList.remove('behuman-toggle-active');
                        opt.style.borderColor = '#ddd';
                        opt.style.backgroundColor = 'white';
                        opt.style.color = '#666';
                    });
                    this.classList.add('behuman-toggle-active');
                    this.style.borderColor = '#4285f4';
                    this.style.backgroundColor = '#4285f4';
                    this.style.color = 'white';
                    this.querySelector('input[type="radio"]').checked = true;
                });
            });
            
            // Ledger form submission
            document.getElementById('behuman-ledger-form').addEventListener('submit', function(e) {
                e.preventDefault();
                self.submitLedgerForm();
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
            this.resetToHome();
        },
        
        resetToHome: function() {
            document.getElementById('behuman-initial-screen').style.display = 'block';
            document.getElementById('behuman-statements-screen').style.display = 'none';
            document.getElementById('behuman-result-screen').style.display = 'none';
            document.getElementById('behuman-ledger-screen').style.display = 'none';
            
            // Reset checkboxes
            for (let i = 1; i <= 7; i++) {
                const checkbox = document.getElementById('behuman-stmt' + i);
                if (checkbox) checkbox.checked = false;
            }
            
            // Reset ledger form if it exists
            const ledgerForm = document.getElementById('behuman-ledger-form');
            if (ledgerForm) {
                ledgerForm.reset();
                const submitBtn = document.querySelector('#behuman-ledger-form button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add my name';
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '#4285f4';
                    submitBtn.style.cursor = 'pointer';
                }
            }
            
            // Close widget instructions if open
            const widgetInstructions = document.getElementById('behuman-instructions-overlay');
            if (widgetInstructions) {
                widgetInstructions.style.display = 'none';
            }
        },
        
        // Show statements screen
        showStatements: function() {
            document.getElementById('behuman-initial-screen').style.display = 'none';
            document.getElementById('behuman-statements-screen').style.display = 'block';
            document.getElementById('behuman-result-screen').style.display = 'none';
            document.getElementById('behuman-ledger-screen').style.display = 'none';
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
            document.getElementById('behuman-ledger-screen').style.display = 'none';
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
        
        // Show human ledger
        showHumanLedger: function() {
            document.getElementById('behuman-result-screen').style.display = 'none';
            document.getElementById('behuman-ledger-screen').style.display = 'block';
            // Reset form
            document.getElementById('behuman-ledger-form').reset();
            document.getElementById('behuman-ledger-message').style.display = 'none';
            // Reset button
            const submitBtn = document.querySelector('#behuman-ledger-form button[type="submit"]');
            submitBtn.textContent = 'Add my name';
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '#4285f4';
            submitBtn.style.cursor = 'pointer';
            // Reset toggle to individual
            document.querySelectorAll('.behuman-toggle-option').forEach(opt => {
                opt.classList.remove('behuman-toggle-active');
                opt.style.borderColor = '#ddd';
                opt.style.backgroundColor = 'white';
                opt.style.color = '#666';
            });
            const individualOption = document.querySelector('#behuman-ledger-type-individual').closest('.behuman-toggle-option');
            individualOption.classList.add('behuman-toggle-active');
            individualOption.style.borderColor = '#4285f4';
            individualOption.style.backgroundColor = '#4285f4';
            individualOption.style.color = 'white';
        },
        
        // Submit ledger form
        submitLedgerForm: function() {
            const name = document.getElementById('behuman-ledger-name').value.trim();
            const city = document.getElementById('behuman-ledger-city').value.trim();
            const country = document.getElementById('behuman-ledger-country').value.trim();
            const type = document.querySelector('input[name="type"]:checked').value;
            const messageElement = document.getElementById('behuman-ledger-message');
            const submitBtn = document.querySelector('#behuman-ledger-form button[type="submit"]');
            
            if (!name || !city || !country) {
                messageElement.style.display = 'block';
                messageElement.style.color = '#ea4335';
                messageElement.textContent = 'Please fill in all fields.';
                return;
            }
            
            // Here you would typically send the data to a server
            // Change button to "Added" and disable it
            submitBtn.textContent = 'Added';
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#34a853';
            submitBtn.style.cursor = 'default';
            messageElement.style.display = 'none';
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
        },
        
        // Show widget instructions
        showWidgetInstructions: function() {
            document.getElementById('behuman-instructions-overlay').style.display = 'flex';
        },
        
        // Close widget instructions
        closeWidgetInstructions: function() {
            document.getElementById('behuman-instructions-overlay').style.display = 'none';
        },
        
        // Copy widget script
        copyWidgetScript: function() {
            const scriptText = '<script src="https://markjcsimmons.github.io/behuman/widget.js"><\/script>';
            const messageElement = document.getElementById('behuman-copy-message');
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(scriptText).then(() => {
                    messageElement.style.display = 'block';
                    messageElement.textContent = 'Script copied to clipboard!';
                    setTimeout(() => {
                        messageElement.style.display = 'none';
                    }, 3000);
                }).catch(() => {
                    this.fallbackCopyToClipboard(scriptText, messageElement);
                });
            } else {
                this.fallbackCopyToClipboard(scriptText, messageElement);
            }
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
