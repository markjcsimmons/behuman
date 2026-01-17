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
        
        // Load TensorFlow.js libraries
        loadDetectionLibraries: function() {
            if (document.getElementById('behuman-tfjs')) return Promise.resolve();
            
            return new Promise((resolve, reject) => {
                // Load TensorFlow.js
                const tfjsScript = document.createElement('script');
                tfjsScript.id = 'behuman-tfjs';
                tfjsScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js';
                tfjsScript.onload = () => {
                    // Load COCO-SSD model
                    const cocoScript = document.createElement('script');
                    cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
                    cocoScript.onload = resolve;
                    cocoScript.onerror = reject;
                    document.head.appendChild(cocoScript);
                };
                tfjsScript.onerror = reject;
                document.head.appendChild(tfjsScript);
            });
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
                    position: relative;
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
                    position: relative;
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
                    position: relative;
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
                
                #behuman-captcha-screen {
                    display: none;
                    text-align: left;
                    background-color: white;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                }
                
                .behuman-captcha-banner {
                    background-color: #4285f4;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 2px;
                    margin-bottom: 16px;
                    text-align: center;
                    width: 100%;
                    box-sizing: border-box;
                }
                
                .behuman-captcha-banner-text {
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 1.5;
                }
                
                .behuman-captcha-banner-text strong {
                    font-size: 18px;
                    font-weight: 600;
                    font-style: italic;
                    display: inline-block;
                    margin-left: 4px;
                }
                
                .behuman-captcha-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .behuman-captcha-image-container {
                    position: relative;
                    width: 100%;
                    padding-top: 100%;
                    border: 2px solid #ddd;
                    border-radius: 2px;
                    cursor: pointer;
                    overflow: hidden;
                    background-color: #f5f5f5;
                    transition: border-color 0.2s;
                }
                
                .behuman-captcha-image-container:hover {
                    border-color: #bbb;
                }
                
                .behuman-captcha-image-container.selected {
                    border-color: #4285f4;
                    border-width: 3px;
                }
                
                .behuman-captcha-image-container img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .behuman-captcha-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                }
                
                .behuman-captcha-icons {
                    display: flex;
                    gap: 8px;
                }
                
                .behuman-captcha-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 16px;
                    color: #666;
                    transition: background-color 0.2s;
                    user-select: none;
                }
                
                .behuman-captcha-icon:hover {
                    background-color: #e0e0e0;
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
                    position: absolute;
                    top: -16px;
                    right: -16px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
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
            
            overlay.innerHTML = `
                <div id="behuman-modal">
                    <div id="behuman-initial-screen">
                        <button class="behuman-reset-button" onclick="BeHuman.resetToHome()" title="Reset">↻</button>
                        <h1>Verify You Are Human</h1>
                        <p>Please complete a simple test to confirm you are a human.</p>
                        <button class="behuman-btn" id="behuman-start-btn">Click here to begin</button>
                    </div>
                    
                    <div id="behuman-statements-screen">
                        <button class="behuman-reset-button" onclick="BeHuman.resetToHome()" title="Reset">↻</button>
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
                    
                    <!-- CAPTCHA Screen -->
                    <div id="behuman-captcha-screen">
                        <button class="behuman-reset-button" onclick="BeHuman.resetToHome()" title="Reset">↻</button>
                        <div class="behuman-captcha-banner">
                            <div class="behuman-captcha-banner-text">Select all images with <strong>a human</strong></div>
                        </div>
                        <div class="behuman-captcha-grid" id="behuman-captcha-grid">
                            <!-- Images will be dynamically loaded here -->
                        </div>
                        <div class="behuman-captcha-controls">
                            <div class="behuman-captcha-icons">
                                <div class="behuman-captcha-icon" onclick="BeHuman.refreshCaptcha()" title="Refresh">↻</div>
                                <div class="behuman-captcha-icon" title="Audio">🔊</div>
                                <div class="behuman-captcha-icon" title="Info">ℹ</div>
                            </div>
                            <button class="behuman-btn" onclick="BeHuman.verifyCaptcha()" style="background-color: #4285f4; min-height: 36px; padding: 10px 24px; font-size: 14px;">VERIFY</button>
                        </div>
                    </div>
                    
                    <div id="behuman-result-screen">
                        <button class="behuman-reset-button" onclick="BeHuman.resetToHome()" title="Reset">↻</button>
                        <div class="behuman-check-icon" id="behuman-result-icon"></div>
                        <h2 id="behuman-result-text"></h2>
                        <div id="behuman-share-container" style="display: none; margin-top: 20px; width: 100%;">
                            <button class="behuman-btn" id="behuman-share-btn" style="width: 100%;">Tell others you are human</button>
                            <p id="behuman-share-message" style="margin-top: 10px; font-size: 12px; color: #666; display: none;">Link copied to clipboard!</p>
                            <button class="behuman-btn" id="behuman-widget-btn" style="margin-top: 15px; background-color: #34a853; width: 100%;">Add widget to your website</button>
                            <button class="behuman-btn" id="behuman-download-badge-btn" style="margin-top: 15px; background-color: #e0e0e0; color: #333; width: 100%;">Download Verified Human badge</button>
                        </div>
                        <div id="behuman-try-again-container" style="display: none; margin-top: 20px;">
                            <button class="behuman-btn" id="behuman-try-again-btn">Try again</button>
                        </div>
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
            
            // Download badge button
            document.getElementById('behuman-download-badge-btn').addEventListener('click', function() {
                self.downloadBadge();
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
            
            // Reset checkboxes
            for (let i = 1; i <= 7; i++) {
                const checkbox = document.getElementById('behuman-stmt' + i);
                if (checkbox) checkbox.checked = false;
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
            
            // Start preloading CAPTCHA images in the background
            this.preloadCaptchaImages();
        },
        
        // Submit verification
        submitVerification: async function() {
            const checkboxes = [];
            for (let i = 1; i <= 7; i++) {
                checkboxes.push(document.getElementById('behuman-stmt' + i));
            }

            const allChecked = checkboxes.every(cb => cb.checked);
            
            if (allChecked) {
                // Wait for images to be loaded before showing CAPTCHA screen
                if (!this.preloadedCaptchaData || !this.preloadedCaptchaData.loaded) {
                    // Show loading state on statements screen
                    const submitBtn = document.getElementById('behuman-submit-btn');
                    const originalText = submitBtn ? submitBtn.textContent : '';
                    if (submitBtn) {
                        submitBtn.textContent = 'Loading images...';
                        submitBtn.disabled = true;
                    }
                    
                    // Wait for preloading to complete
                    if (!this.preloadedCaptchaData) {
                        await this.preloadCaptchaImages();
                    } else {
                        // Wait for images to finish loading
                        while (!this.preloadedCaptchaData.loaded) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                    
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                }
                
                // Show CAPTCHA screen
                document.getElementById('behuman-statements-screen').style.display = 'none';
                document.getElementById('behuman-captcha-screen').style.display = 'block';
                this.loadCaptchaImages();
            } else {
                // Show robot screen
                this.showResult(false);
            }
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
        
        // Download badge
        downloadBadge: function() {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 800, 400);
            
            // Draw green checkmark circle
            const centerX = 400;
            const centerY = 150;
            const radius = 60;
            
            // Gradient for circle
            const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
            gradient.addColorStop(0, '#34a853');
            gradient.addColorStop(1, '#2d8f47');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw white checkmark
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(centerX - 25, centerY);
            ctx.lineTo(centerX - 5, centerY + 20);
            ctx.lineTo(centerX + 25, centerY - 20);
            ctx.stroke();
            
            // Draw "Verified Human" text
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Verified Human', centerX, centerY + 120);
            
            // Convert to blob and download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'verified-human-badge.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        },
        
        // CAPTCHA functions
        captchaSelectedImages: [],
        captchaCorrectImages: [], // Indices of images that contain humans
        preloadedCaptchaData: null, // Store preloaded image data
        detectionModel: null, // TensorFlow.js COCO-SSD model
        
        // Pexels API Configuration
        pexelsApiKey: 'QtGASQFn9Ah3Rw1pO58DOQ7QGGwdEv9DXPTupysI6mvI1vH8wgZ0BQyh',
        
        // Load TensorFlow.js detection model
        loadDetectionModel: async function() {
            if (!this.detectionModel && typeof cocoSsd !== 'undefined') {
                try {
                    this.detectionModel = await cocoSsd.load();
                } catch (error) {
                    console.error('Error loading detection model:', error);
                }
            }
            return this.detectionModel;
        },
        
        // Detect people in an image
        detectPeopleInImage: async function(imageUrl) {
            try {
                const model = await this.loadDetectionModel();
                if (!model) return false;
                
                // Create an image element to load the image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                return new Promise((resolve) => {
                    img.onload = async () => {
                        try {
                            const predictions = await model.detect(img);
                            // Check if any detection is a "person" class
                            const hasPerson = predictions.some(pred => pred.class === 'person');
                            resolve(hasPerson);
                        } catch (error) {
                            console.error('Error detecting people:', error);
                            resolve(false);
                        }
                    };
                    img.onerror = () => resolve(false);
                    img.src = imageUrl;
                });
            } catch (error) {
                console.error('Error in detectPeopleInImage:', error);
                return false;
            }
        },
        
        // Preload CAPTCHA images (fetch data and cache images)
        preloadCaptchaImages: async function() {
            if (this.preloadedCaptchaData) {
                return; // Already preloading or preloaded
            }
            
            try {
                // Fetch images with people
                const peopleResponse = await fetch('https://api.pexels.com/v1/search?query=people&per_page=30&orientation=square', {
                    headers: {
                        'Authorization': this.pexelsApiKey
                    }
                });
                const peopleData = await peopleResponse.json();
                
                // Fetch images without people (traffic, buildings, nature, etc.)
                const nonPeopleQueries = ['traffic light', 'crosswalk', 'street', 'building', 'nature', 'animal'];
                const randomQuery = nonPeopleQueries[Math.floor(Math.random() * nonPeopleQueries.length)];
                const nonPeopleResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(randomQuery)}&per_page=30&orientation=square`, {
                    headers: {
                        'Authorization': this.pexelsApiKey
                    }
                });
                const nonPeopleData = await nonPeopleResponse.json();
                
                // Get image URLs - fetch more images so we can select ones that actually contain people
                const allImageUrls = [];
                const peoplePhotos = peopleData.photos ? peopleData.photos : [];
                const nonPeoplePhotos = nonPeopleData.photos ? nonPeopleData.photos : [];
                
                // Collect up to 40 images (mix of both types)
                const mixedPhotos = [...peoplePhotos.slice(0, 20), ...nonPeoplePhotos.slice(0, 20)]
                    .sort(() => 0.5 - Math.random()).slice(0, 40);
                
                allImageUrls.push(...mixedPhotos.map(p => p.src.medium));
                
                // Load detection libraries if not already loaded
                await this.loadDetectionLibraries();
                
                // Preload images into browser cache first
                const imagePromises = allImageUrls.map(url => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve({ url, img });
                        img.onerror = () => resolve({ url, img: null });
                        img.src = url;
                    });
                });
                
                await Promise.all(imagePromises);
                
                // Load detection model
                await this.loadDetectionModel();
                
                // Detect people in all images
                const detectionResults = await Promise.all(
                    allImageUrls.map(url => this.detectPeopleInImage(url))
                );
                
                // Separate images with and without people
                const imagesWithPeople = [];
                const imagesWithoutPeople = [];
                
                detectionResults.forEach((hasPerson, index) => {
                    if (hasPerson) {
                        imagesWithPeople.push(allImageUrls[index]);
                    } else {
                        imagesWithoutPeople.push(allImageUrls[index]);
                    }
                });
                
                // Select 3-5 images with people, rest without
                const numPeopleImages = Math.min(3 + Math.floor(Math.random() * 3), imagesWithPeople.length); // 3-5 people images
                const numNonPeopleImages = 9 - numPeopleImages;
                
                // Shuffle and select
                const selectedPeopleImages = imagesWithPeople.sort(() => 0.5 - Math.random()).slice(0, numPeopleImages);
                const selectedNonPeopleImages = imagesWithoutPeople.sort(() => 0.5 - Math.random()).slice(0, numNonPeopleImages);
                
                // If we don't have enough images with people, use what we have and fill with non-people
                const finalPeopleImages = selectedPeopleImages.length >= numPeopleImages 
                    ? selectedPeopleImages.slice(0, numPeopleImages)
                    : selectedPeopleImages;
                const finalNonPeopleImages = selectedNonPeopleImages.slice(0, 9 - finalPeopleImages.length);
                
                // Combine and shuffle all images
                const allImages = [...finalPeopleImages, ...finalNonPeopleImages].sort(() => 0.5 - Math.random());
                
                // Track which indices have people (based on actual detection)
                const correctImages = [];
                allImages.forEach((url, index) => {
                    if (finalPeopleImages.includes(url)) {
                        correctImages.push(index);
                    }
                });
                
                // Store preloaded data
                this.preloadedCaptchaData = {
                    images: allImages,
                    correctImages: correctImages,
                    loaded: true
                };
            } catch (error) {
                console.error('Error preloading CAPTCHA images:', error);
                this.preloadedCaptchaData = null;
            }
        },
        
        // Render preloaded CAPTCHA images
        loadCaptchaImages: function() {
            const grid = document.getElementById('behuman-captcha-grid');
            grid.innerHTML = '';
            this.captchaSelectedImages = [];
            
            // If we have preloaded data and it's loaded, use it
            if (this.preloadedCaptchaData && this.preloadedCaptchaData.loaded) {
                this.captchaCorrectImages = this.preloadedCaptchaData.correctImages;
                const allImages = this.preloadedCaptchaData.images;
                
                // Create image containers
                const self = this;
                allImages.forEach((url, index) => {
                    const container = document.createElement('div');
                    container.className = 'behuman-captcha-image-container';
                    container.dataset.index = index;
                    container.onclick = function() {
                        self.toggleCaptchaImage(index);
                    };
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'CAPTCHA image ' + (index + 1);
                    img.loading = 'lazy';
                    img.onerror = function() {
                        // If image fails to load, show placeholder
                        this.src = 'https://via.placeholder.com/200x200/cccccc/666666?text=Image';
                    };
                    
                    container.appendChild(img);
                    grid.appendChild(container);
                });
                
                // Clear preloaded data so next time will fetch fresh
                this.preloadedCaptchaData = null;
            } else {
                // Fallback: load on demand if not preloaded
                this.loadCaptchaImagesAsync();
            }
        },
        
        // Fallback async loading (if preload didn't happen)
        loadCaptchaImagesAsync: async function() {
            const grid = document.getElementById('behuman-captcha-grid');
            grid.innerHTML = '';
            this.captchaSelectedImages = [];
            
            // Show loading state
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">Loading images...</div>';
            
            try {
                // Fetch images with people
                const peopleResponse = await fetch('https://api.pexels.com/v1/search?query=people&per_page=30&orientation=square', {
                    headers: {
                        'Authorization': this.pexelsApiKey
                    }
                });
                const peopleData = await peopleResponse.json();
                
                // Fetch images without people (traffic, buildings, nature, etc.)
                const nonPeopleQueries = ['traffic light', 'crosswalk', 'street', 'building', 'nature', 'animal'];
                const randomQuery = nonPeopleQueries[Math.floor(Math.random() * nonPeopleQueries.length)];
                const nonPeopleResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(randomQuery)}&per_page=30&orientation=square`, {
                    headers: {
                        'Authorization': this.pexelsApiKey
                    }
                });
                const nonPeopleData = await nonPeopleResponse.json();
                
                // Get image URLs
                const peopleImages = peopleData.photos ? peopleData.photos.map(p => p.src.medium) : [];
                const nonPeopleImages = nonPeopleData.photos ? nonPeopleData.photos.map(p => p.src.medium) : [];
                
                // Randomly select images: 3-5 with people, rest without
                const numPeopleImages = 3 + Math.floor(Math.random() * 3); // 3-5 people images
                const numNonPeopleImages = 9 - numPeopleImages;
                
                // Shuffle and select
                const shuffledPeople = peopleImages.sort(() => 0.5 - Math.random()).slice(0, numPeopleImages);
                const shuffledNonPeople = nonPeopleImages.sort(() => 0.5 - Math.random()).slice(0, numNonPeopleImages);
                
                // Combine and shuffle all images
                const allImages = [...shuffledPeople, ...shuffledNonPeople].sort(() => 0.5 - Math.random());
                const allImageTypes = [...Array(numPeopleImages).fill(true), ...Array(numNonPeopleImages).fill(false)];
                const shuffledTypes = allImageTypes.sort(() => 0.5 - Math.random());
                
                // Track which indices have people
                this.captchaCorrectImages = [];
                shuffledTypes.forEach((hasPerson, index) => {
                    if (hasPerson) {
                        this.captchaCorrectImages.push(index);
                    }
                });
                
                // Clear loading state
                grid.innerHTML = '';
                
                // Create image containers
                const self = this;
                allImages.forEach((url, index) => {
                    const container = document.createElement('div');
                    container.className = 'behuman-captcha-image-container';
                    container.dataset.index = index;
                    container.onclick = function() {
                        self.toggleCaptchaImage(index);
                    };
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'CAPTCHA image ' + (index + 1);
                    img.loading = 'lazy';
                    img.onerror = function() {
                        // If image fails to load, show placeholder
                        this.src = 'https://via.placeholder.com/200x200/cccccc/666666?text=Image';
                    };
                    
                    container.appendChild(img);
                    grid.appendChild(container);
                });
            } catch (error) {
                console.error('Error loading CAPTCHA images:', error);
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ea4335;">Error loading images. Please try again.</div>';
            }
        },
        
        toggleCaptchaImage: function(index) {
            const container = document.querySelector(`.behuman-captcha-image-container[data-index="${index}"]`);
            const isSelected = this.captchaSelectedImages.includes(index);
            
            if (isSelected) {
                this.captchaSelectedImages = this.captchaSelectedImages.filter(i => i !== index);
                container.classList.remove('selected');
            } else {
                this.captchaSelectedImages.push(index);
                container.classList.add('selected');
            }
            
            // Auto-verify if all images with people are selected
            this.checkAutoVerify();
        },
        
        checkAutoVerify: function() {
            // Check if all correct images (with people) are selected
            const selectedCorrect = this.captchaCorrectImages.every(idx => this.captchaSelectedImages.includes(idx));
            
            if (selectedCorrect && this.captchaCorrectImages.length > 0) {
                // All images with people are selected - verify automatically
                const self = this;
                setTimeout(() => {
                    self.verifyCaptcha(true);
                }, 300); // Small delay for visual feedback
            }
        },
        
        verifyCaptcha: function(autoVerify = false) {
            // Check if all correct images (with people) are selected
            const selectedCorrect = this.captchaCorrectImages.every(idx => this.captchaSelectedImages.includes(idx));
            
            if (selectedCorrect && this.captchaCorrectImages.length > 0) {
                // All images with people are selected - verified
                // Add delay before showing Verified Human screen
                const self = this;
                setTimeout(() => {
                    document.getElementById('behuman-captcha-screen').style.display = 'none';
                    self.showResult(true);
                }, 1000); // 1 second delay
            } else if (!autoVerify) {
                // Manual verify button clicked but not all correct images selected
                document.getElementById('behuman-captcha-screen').style.display = 'none';
                this.showResult(false);
            }
        },
        
        refreshCaptcha: function() {
            // Clear preloaded data and fetch new images
            this.preloadedCaptchaData = null;
            const self = this;
            this.preloadCaptchaImages().then(() => {
                // Once new images are preloaded, render them
                self.loadCaptchaImages();
            });
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
