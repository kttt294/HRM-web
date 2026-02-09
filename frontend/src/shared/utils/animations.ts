/**
 * ============================================
 * ANIMATION UTILITIES WITH ANIME.JS
 * ============================================
 * 
 * Các animation utilities sử dụng anime.js
 * cho UI/UX mượt mà hơn
 */

import anime from 'animejs';

// ============================================
// PAGE TRANSITION ANIMATIONS
// ============================================

/**
 * Fade in và slide up elements khi page load
 */
export function animatePageLoad(selector: string = '.animate-in') {
    anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutQuart',
    });
}

/**
 * Animate cards khi xuất hiện
 */
export function animateCards(selector: string = '.card') {
    anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.98, 1],
        duration: 500,
        delay: anime.stagger(80, { start: 100 }),
        easing: 'easeOutCubic',
    });
}

// ============================================
// INTERACTION ANIMATIONS
// ============================================

/**
 * Button press effect
 */
export function animateButtonPress(element: HTMLElement) {
    anime({
        targets: element,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeInOutQuad',
    });
}

/**
 * Hover effect cho cards
 */
export function animateCardHover(element: HTMLElement, isEnter: boolean) {
    anime({
        targets: element,
        translateY: isEnter ? -4 : 0,
        boxShadow: isEnter 
            ? '0 8px 25px rgba(0, 0, 0, 0.12)' 
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
        duration: 250,
        easing: 'easeOutQuad',
    });
}

// ============================================
// MODAL ANIMATIONS
// ============================================

/**
 * Modal open animation
 */
export function animateModalOpen(overlayEl: HTMLElement, contentEl: HTMLElement) {
    anime({
        targets: overlayEl,
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutQuad',
    });
    
    anime({
        targets: contentEl,
        opacity: [0, 1],
        scale: [0.9, 1],
        translateY: [-20, 0],
        duration: 300,
        easing: 'easeOutBack',
    });
}

/**
 * Modal close animation
 */
export function animateModalClose(
    overlayEl: HTMLElement, 
    contentEl: HTMLElement, 
    onComplete: () => void
) {
    anime({
        targets: contentEl,
        opacity: [1, 0],
        scale: [1, 0.9],
        translateY: [0, -20],
        duration: 200,
        easing: 'easeInQuad',
    });
    
    anime({
        targets: overlayEl,
        opacity: [1, 0],
        duration: 250,
        easing: 'easeInQuad',
        complete: onComplete,
    });
}

// ============================================
// TABLE & LIST ANIMATIONS
// ============================================

/**
 * Animate table rows
 */
export function animateTableRows(selector: string = 'tbody tr') {
    anime({
        targets: selector,
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 400,
        delay: anime.stagger(40),
        easing: 'easeOutQuart',
    });
}

/**
 * Animate list items
 */
export function animateListItems(selector: string) {
    anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        delay: anime.stagger(60),
        easing: 'easeOutQuart',
    });
}

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================

/**
 * Toast notification enter
 */
export function animateToastEnter(element: HTMLElement) {
    anime({
        targets: element,
        opacity: [0, 1],
        translateX: [100, 0],
        duration: 400,
        easing: 'easeOutBack',
    });
}

/**
 * Toast notification exit
 */
export function animateToastExit(element: HTMLElement, onComplete: () => void) {
    anime({
        targets: element,
        opacity: [1, 0],
        translateX: [0, 100],
        duration: 300,
        easing: 'easeInQuad',
        complete: onComplete,
    });
}

// ============================================
// LOADING ANIMATIONS
// ============================================

/**
 * Pulse loader animation
 */
export function animatePulse(selector: string) {
    return anime({
        targets: selector,
        scale: [1, 1.05, 1],
        opacity: [0.7, 1, 0.7],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine',
    });
}

/**
 * Skeleton loading shimmer
 */
export function animateShimmer(selector: string) {
    return anime({
        targets: selector,
        backgroundPosition: ['200% 0', '-200% 0'],
        duration: 1500,
        loop: true,
        easing: 'linear',
    });
}

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================

/**
 * Animate counting up numbers
 */
export function animateCounter(
    element: HTMLElement, 
    endValue: number, 
    duration: number = 1000
) {
    const obj = { value: 0 };
    anime({
        targets: obj,
        value: endValue,
        duration,
        round: 1,
        easing: 'easeOutExpo',
        update: () => {
            element.textContent = obj.value.toString();
        },
    });
}

// ============================================
// STAGGER PRESETS
// ============================================

export const staggerPresets = {
    fast: anime.stagger(40),
    normal: anime.stagger(80),
    slow: anime.stagger(120),
    fromCenter: anime.stagger(100, { from: 'center' }),
    fromLast: anime.stagger(100, { from: 'last' }),
    grid: (columns: number) => anime.stagger(50, { grid: [columns, 1], from: 'center' }),
};
