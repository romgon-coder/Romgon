/**
 * ROMGON General Keyboard Navigation System
 * Simple WASD + E/Escape navigation for menus, screens, and UI
 * 
 * Works across the entire game for:
 * - Menu navigation
 * - Option selection
 * - UI element focus
 * - Board/board panning (future)
 * 
 * Controls:
 *   WASD - Navigate between elements (up/down/left/right)
 *   E    - Confirm/Select current element
 *   ESC  - Go back/Cancel
 */

class GeneralNavigationSystem {
  constructor(config = {}) {
    this.enabled = true;
    this.debugMode = config.debug || false;
    
    // Focus management
    this.focusedElement = null;
    this.navigationElements = [];
    this.currentFocusIndex = -1;
    
    // Current screen/context
    this.currentContext = 'game'; // 'menu', 'game', 'settings', 'stats', etc.
    
    // Configuration
    this.config = {
      selectableElements: [
        'button',
        '[role="button"]',
        'a[href]',
        'a[onclick]', // Links with onclick handlers
        'input[type="button"]',
        'input[type="submit"]',
        '.nav-item',
        '.menu-item',
        '.selectable',
        '.game-mode-button',
        '[data-nav]',
      ].join(','),
      wrapAround: true,
      autoFocus: true,
      ...config,
    };
    
    this.setupEventListeners();
    this.logDebug('General Navigation System Initialized');
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    
    // Update focus when user clicks (mouse)
    document.addEventListener('click', (e) => {
      this.updateFocusFromClick(e);
    });
    
    // Update context when switching screens
    document.addEventListener('screenchange', (e) => {
      this.setContext(e.detail?.context || 'game');
    });
  }

  handleKeyPress(event) {
    // PRIORITY: If PVP system is active and enabled, ALWAYS skip
    if (window.keyboardNav && window.keyboardNav.enabled) {
      this.logDebug('🚫 PVP system is active and enabled, skipping all General Nav input');
      return;
    }
    
    if (!this.enabled) return;
    
    const key = event.key.toLowerCase();
    
    // Only handle WASD, E, and Escape
    if (!['w', 'a', 's', 'd', 'e', 'escape'].includes(key)) {
      return;
    }

    this.logDebug(`[${this.currentContext}] Key pressed: ${key}`);

    // Handle different keys
    if (key === 'w') {
      event.preventDefault();
      this.navigate('up');
    } else if (key === 's') {
      event.preventDefault();
      this.navigate('down');
    } else if (key === 'a') {
      event.preventDefault();
      this.navigate('left');
    } else if (key === 'd') {
      event.preventDefault();
      this.navigate('right');
    } else if (key === 'e') {
      event.preventDefault();
      this.confirmSelection();
    } else if (key === 'escape') {
      event.preventDefault();
      this.handleBack();
    }
  }

  /**
   * Navigate to adjacent elements
   */
  navigate(direction) {
    // Scan for navigable elements if not cached
    this.updateNavigationElements();
    
    if (this.navigationElements.length === 0) {
      this.logDebug(`No navigable elements found in context: ${this.currentContext}`);
      return;
    }

    // If no element focused, focus first
    if (this.currentFocusIndex === -1) {
      this.focusElement(0);
      return;
    }

    let nextIndex = this.currentFocusIndex;
    
    // Calculate next index based on direction
    switch (direction) {
      case 'down':
      case 'right':
        nextIndex = this.currentFocusIndex + 1;
        if (nextIndex >= this.navigationElements.length) {
          nextIndex = this.config.wrapAround ? 0 : this.currentFocusIndex;
        }
        break;
      case 'up':
      case 'left':
        nextIndex = this.currentFocusIndex - 1;
        if (nextIndex < 0) {
          nextIndex = this.config.wrapAround ? this.navigationElements.length - 1 : 0;
        }
        break;
    }

    this.focusElement(nextIndex);
  }

  /**
   * Focus an element by index
   */
  focusElement(index) {
    if (index < 0 || index >= this.navigationElements.length) {
      this.logDebug(`Invalid focus index: ${index}`);
      return;
    }

    // Remove focus from current
    if (this.focusedElement) {
      this.focusedElement.classList.remove('kb-nav-focused');
    }

    // Add focus to new element
    this.focusedElement = this.navigationElements[index];
    this.currentFocusIndex = index;
    this.focusedElement.classList.add('kb-nav-focused');
    this.logDebug(`Focused element [${index}]: ${this.focusedElement.tagName} - ${this.focusedElement.textContent.substring(0, 30)}`);
    
    // Optionally scroll into view
    this.focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Confirm/Select current focused element
   */
  confirmSelection() {
    if (!this.focusedElement) {
      this.logDebug('No element focused for confirmation');
      return;
    }

    this.logDebug(`Confirming: ${this.focusedElement.tagName} - ${this.focusedElement.textContent.substring(0, 30)}`);

    // Simulate click/activation
    if (this.focusedElement.tagName === 'BUTTON' || this.focusedElement.getAttribute('role') === 'button') {
      this.focusedElement.click();
    } else if (this.focusedElement.tagName === 'A') {
      this.focusedElement.click();
    } else if (this.focusedElement.tagName === 'INPUT') {
      if (this.focusedElement.type === 'text' || this.focusedElement.type === 'email') {
        this.focusedElement.focus();
      } else {
        this.focusedElement.click();
      }
    } else {
      // Generic element - trigger click
      this.focusedElement.click();
    }
  }

  /**
   * Handle back/escape action
   */
  handleBack() {
    this.logDebug('Back pressed');
    
    // Unfocus current element
    if (this.focusedElement) {
      this.focusedElement.classList.remove('kb-nav-focused');
      this.focusedElement = null;
      this.currentFocusIndex = -1;
    }

    // Trigger back action if available
    const backButton = document.querySelector('[data-kb-back], .kb-back-button, [aria-label*="Back"]');
    if (backButton) {
      backButton.click();
    }
  }

  /**
   * Update list of navigable elements
   */
  updateNavigationElements() {
    // Get all selectable elements visible on screen
    const elements = Array.from(document.querySelectorAll(this.config.selectableElements));
    
    // Filter to only visible elements
    this.navigationElements = elements.filter(el => {
      const style = window.getComputedStyle(el);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       el.offsetParent !== null;
      
      if (!isVisible) return false;
      
      // Check if element is inside a hidden or background screen
      // Exclude elements that are on the game board if a modal is open
      const modals = document.querySelectorAll('[id*="modal"], [id*="overlay"], .modal, [class*="modal"]');
      const isInOpenModal = Array.from(modals).some(modal => {
        const modalStyle = window.getComputedStyle(modal);
        const modalVisible = modalStyle.display !== 'none' && 
                            modalStyle.visibility !== 'hidden' && 
                            modal.offsetParent !== null;
        return modalVisible && modal.contains(el);
      });
      
      // If a modal is open, only include elements inside that modal
      if (modals.length > 0) {
        const anyModalOpen = Array.from(modals).some(m => {
          const s = window.getComputedStyle(m);
          return s.display !== 'none' && s.visibility !== 'hidden' && m.offsetParent !== null;
        });
        if (anyModalOpen && !isInOpenModal) {
          return false; // Exclude this element, it's behind a modal
        }
      }
      
      return true;
    });

    this.logDebug(`Found ${this.navigationElements.length} navigable elements in context: ${this.currentContext}`);
    if (this.navigationElements.length === 0) {
      this.logDebug(`No elements found. Selector: ${this.config.selectableElements}`);
    }
  }

  /**
   * Update focus based on mouse click
   */
  updateFocusFromClick(event) {
    if (!this.enabled) return;

    const target = event.target;
    
    // Check if clicked element is navigable
    const navigableParent = target.closest(this.config.selectableElements);
    if (navigableParent) {
      this.updateNavigationElements();
      const index = this.navigationElements.indexOf(navigableParent);
      if (index !== -1) {
        this.focusElement(index);
      }
    }
  }

  /**
   * Set current context/screen
   */
  setContext(context) {
    if (this.currentContext === context) return;
    
    this.currentContext = context;
    this.clearFocus();
    
    this.logDebug(`Context changed to: ${context}`);
    
    if (this.config.autoFocus) {
      this.updateNavigationElements();
      if (this.navigationElements.length > 0) {
        this.focusElement(0);
      }
    }
  }

  /**
   * Clear all focus
   */
  clearFocus() {
    if (this.focusedElement) {
      this.focusedElement.classList.remove('kb-nav-focused');
    }
    this.focusedElement = null;
    this.currentFocusIndex = -1;
    this.navigationElements = [];
  }

  /**
   * Enable/disable navigation
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.clearFocus();
    }
  }

  /**
   * Debug logging
   */
  logDebug(message) {
    if (this.debugMode) {
      console.log(`[GeneralNav] ${message}`);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      context: this.currentContext,
      enabled: this.enabled,
      focusedElement: this.focusedElement?.textContent.substring(0, 30),
      focusedIndex: this.currentFocusIndex,
      totalNavigableElements: this.navigationElements.length,
    };
  }
}

// Export
window.GeneralNavigationSystem = GeneralNavigationSystem;

// NOTE: General Navigation is NOT auto-initialized
// The keyboard-system-router.js will instantiate it when needed
// This prevents General Nav from interfering with PVP during gameplay
