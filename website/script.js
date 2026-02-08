// ================================
// HasteKit Landing Page JavaScript
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initNavbar();
    initMobileMenu();
    initCodeTabs();
    initGatewayTabs();
    initSmoothScroll();
    initScrollAnimations();
});

// ================================
// Navbar Scroll Effect
// ================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove background opacity based on scroll
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
        
        // Hide/show navbar on scroll (optional - uncomment if desired)
        // if (currentScroll > lastScroll && currentScroll > 200) {
        //     navbar.style.transform = 'translateY(-100%)';
        // } else {
        //     navbar.style.transform = 'translateY(0)';
        // }
        
        lastScroll = currentScroll;
    });
}

// ================================
// Mobile Menu Toggle
// ================================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuBtn) return;
    
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        
        // Create mobile menu if it doesn't exist
        let mobileMenu = document.querySelector('.mobile-menu');
        
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            mobileMenu.innerHTML = `
                <div class="mobile-menu-content">
                    <div class="mobile-menu-section">
                        <span class="mobile-menu-label">Gateway</span>
                        <a href="#llm-gateway">LLM Gateway</a>
                        <a href="#agent-gateway">Agent Gateway</a>
                    </div>
                    <a href="#sdk">SDK</a>
                    <a href="https://docs.hastekit.com" target="_blank">Docs</a>
                    <div class="mobile-menu-cta">
                        <a href="https://github.com/hastekit/ai-gateway" target="_blank" class="btn btn-ghost">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub
                        </a>
                        <a href="#quickstart" class="btn btn-primary">Get Started</a>
                    </div>
                </div>
            `;
            
            // Add styles for mobile menu
            const style = document.createElement('style');
            style.textContent = `
                .mobile-menu {
                    position: fixed;
                    top: 72px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 10, 15, 0.98);
                    backdrop-filter: blur(20px);
                    z-index: 999;
                    padding: 24px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                .mobile-menu.active {
                    transform: translateX(0);
                }
                .mobile-menu-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .mobile-menu-content > a {
                    font-size: 18px;
                    font-weight: 500;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--color-border);
                    color: var(--color-text);
                }
                .mobile-menu-cta {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 24px;
                }
                .mobile-menu-cta .btn {
                    width: 100%;
                    justify-content: center;
                }
                .mobile-menu-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--color-border);
                }
                .mobile-menu-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .mobile-menu-section a {
                    padding: 8px 0;
                    padding-left: 12px;
                    border-bottom: none;
                }
                .mobile-menu-btn.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                .mobile-menu-btn.active span:nth-child(2) {
                    opacity: 0;
                }
                .mobile-menu-btn.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(5px, -5px);
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(mobileMenu);
            
            // Close menu when clicking links
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menuBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                });
            });
        }
        
        mobileMenu.classList.toggle('active');
    });
}

// ================================
// Code Tabs
// ================================
function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    const panels = document.querySelectorAll('.code-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.tab;
            
            // Find the parent container to scope the tab switching
            const container = tab.closest('.code-examples');
            const siblingTabs = container.querySelectorAll('.code-tab');
            const siblingPanels = container.querySelectorAll('.code-panel');
            
            // Update active tab
            siblingTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            siblingPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.dataset.panel === targetPanel) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// ================================
// Gateway Tabs (LLM vs Agent)
// ================================
function initGatewayTabs() {
    const gatewayTabs = document.querySelectorAll('.gateway-tab');
    const gatewayPanels = document.querySelectorAll('.gateway-panel');
    
    gatewayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetGateway = tab.dataset.gateway;
            
            // Update active tab
            gatewayTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            gatewayPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.dataset.panel === targetGateway) {
                    panel.classList.add('active');
                }
            });
            
            // Scroll to the panel
            const targetPanel = document.querySelector(`[data-panel="${targetGateway}"]`);
            if (targetPanel) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const panelTop = targetPanel.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({
                    top: panelTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle direct navigation to gateway sections
    const handleGatewayHash = () => {
        const hash = window.location.hash;
        if (hash === '#llm-gateway') {
            const llmTab = document.querySelector('[data-gateway="llm"]');
            if (llmTab) llmTab.click();
        } else if (hash === '#agent-gateway') {
            const agentTab = document.querySelector('[data-gateway="agent"]');
            if (agentTab) agentTab.click();
        }
    };
    
    // Check on load and on hash change
    handleGatewayHash();
    window.addEventListener('hashchange', handleGatewayHash);
}

// ================================
// Smooth Scroll
// ================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================
// Scroll Animations
// ================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add animation classes
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        .animate-on-scroll:nth-child(1) { transition-delay: 0s; }
        .animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
        .animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
        .animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
        .animate-on-scroll:nth-child(5) { transition-delay: 0.4s; }
        .animate-on-scroll:nth-child(6) { transition-delay: 0.5s; }
    `;
    document.head.appendChild(style);
    
    // Observe elements
    const elementsToAnimate = [
        '.feature-card',
        '.sdk-card',
        '.step',
        '.provider-card'
    ];
    
    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    });
}

// ================================
// Typing Animation (Optional)
// ================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ================================
// Copy Code to Clipboard
// ================================
function initCopyCode() {
    document.querySelectorAll('.code-window').forEach(window => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
        `;
        
        copyBtn.addEventListener('click', async () => {
            const code = window.querySelector('code').textContent;
            await navigator.clipboard.writeText(code);
            
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                `;
            }, 2000);
        });
        
        window.querySelector('.code-header').appendChild(copyBtn);
    });
    
    // Add copy button styles
    const style = document.createElement('style');
    style.textContent = `
        .copy-btn {
            margin-left: auto;
            padding: 4px 8px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--color-text-dim);
            transition: color 0.2s;
        }
        .copy-btn:hover {
            color: var(--color-text);
        }
        .copy-btn svg {
            width: 16px;
            height: 16px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize copy functionality
document.addEventListener('DOMContentLoaded', initCopyCode);

// ================================
// Counter Animation
// ================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        
        // Only animate numbers
        if (!/^\d+/.test(target)) return;
        
        const targetNum = parseInt(target);
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (targetNum - start) * easeOut);
            
            counter.textContent = current + (target.includes('+') ? '+' : '');
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(update);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Initialize counter animation
document.addEventListener('DOMContentLoaded', animateCounters);
