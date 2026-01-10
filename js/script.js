/**
 * Modern Portfolio - Interactive Features
 * Vanilla JavaScript for smooth animations and interactions
 */

(function() {
	'use strict';

	// DOM Elements
	const nav = document.getElementById('nav');
	const navContainer = document.querySelector('.nav-container');
	const navToggle = document.querySelector('.nav-toggle');
	const navLinks = document.querySelector('.nav-links');
	const workItems = document.querySelectorAll('.work-item');
	const navLogo = document.querySelector('.nav-logo');

	// Navigation Scroll Effect
	let lastScroll = 0;
	let ticking = false;

	function updateNav() {
		const scrollY = window.scrollY;
		
		if (scrollY > 50) {
			nav.classList.add('scrolled');
		} else {
			nav.classList.remove('scrolled');
		}
		
		// Fade out hero section as user scrolls (opacity only, no movement)
		const hero = document.querySelector('.hero');
		if (hero) {
			const heroHeight = hero.offsetHeight;
			const fadeStart = heroHeight * 0.3; // Start fading at 30% of hero height
			const fadeEnd = heroHeight * 0.8; // Fully faded at 80% of hero height
			
			if (scrollY > fadeStart) {
				const fadeProgress = Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
				hero.style.opacity = 1 - fadeProgress;
			} else {
				hero.style.opacity = 1;
			}
		}
		
		lastScroll = scrollY;
		ticking = false;
	}

	function requestNavUpdate() {
		if (!ticking) {
			window.requestAnimationFrame(updateNav);
			ticking = true;
		}
	}

	window.addEventListener('scroll', requestNavUpdate, { passive: true });

	// Mobile Navigation Toggle
	if (navToggle && navLinks) {
		navToggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const isActive = navLinks.classList.contains('active');
			navToggle.classList.toggle('active');
			navLinks.classList.toggle('active');
			nav.classList.toggle('menu-open');
			document.body.classList.toggle('menu-open');
			document.body.style.overflow = !isActive ? 'hidden' : '';
		});

		// Close mobile nav when clicking a link
		navLinks.querySelectorAll('.nav-link').forEach(link => {
			link.addEventListener('click', () => {
				navToggle.classList.remove('active');
				navLinks.classList.remove('active');
				nav.classList.remove('menu-open');
				document.body.classList.remove('menu-open');
				document.body.style.overflow = '';
			});
		});

		// Close mobile nav when clicking outside
		document.addEventListener('click', (e) => {
			if (navLinks.classList.contains('active')) {
				// If click is outside nav-container and nav-links
				if (navContainer && !navContainer.contains(e.target) && !navLinks.contains(e.target)) {
					navToggle.classList.remove('active');
					navLinks.classList.remove('active');
					nav.classList.remove('menu-open');
					document.body.classList.remove('menu-open');
					document.body.style.overflow = '';
				}
			}
		});
	}

	// Smooth Scroll for Anchor Links
	document.querySelectorAll('a[href*="#"]').forEach(anchor => {
		anchor.addEventListener('click', function(e) {
			const href = this.getAttribute('href');
			if (!href || href === '#') return;
			
			// Extract hash from href (handles both #hash and ../index.html#hash)
			const hashMatch = href.match(/#(.+)$/);
			if (hashMatch) {
				const hash = '#' + hashMatch[1];
				
				// Check if this is a cross-page link (contains ../ or path before #)
				const isCrossPage = href.includes('../') || (href.indexOf('#') > 0 && !href.startsWith('#'));
				
				if (isCrossPage) {
					// For cross-page links, let the browser navigate normally
					// The target page will handle the scroll via the hash handler below
					return; // Don't prevent default, let navigation happen
				} else {
					// Same-page anchor
					const target = document.querySelector(hash);
					if (target) {
						e.preventDefault();
						const offsetTop = target.offsetTop - 80;
						
						window.scrollTo({
							top: offsetTop,
							behavior: 'smooth'
						});
					}
				}
			}
		});
	});
	
	// Handle hash on page load (for cross-page navigation)
	function scrollToHash() {
		if (window.location.hash) {
			const hash = window.location.hash;
			const target = document.querySelector(hash);
			if (target) {
				// Wait for page to be fully rendered
				setTimeout(() => {
					const offsetTop = target.offsetTop - 80;
					window.scrollTo({
						top: offsetTop,
						behavior: 'smooth'
					});
				}, 150);
			}
		}
	}
	
	// Run on page load
	scrollToHash();
	
	// Also run after a short delay to handle dynamic content
	window.addEventListener('load', () => {
		scrollToHash();
	});

	// Intersection Observer for Work Items Animation with stagger
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px'
	};

	let itemIndex = 0;
	const workObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting && entry.target.style.opacity !== '1') {
				setTimeout(() => {
					entry.target.style.opacity = '1';
					entry.target.style.transform = 'translateY(0) scale(1)';
				}, itemIndex * 100);
				itemIndex++;
			}
		});
	}, observerOptions);

	workItems.forEach(item => {
		workObserver.observe(item);
	});
	
	// Add parallax effect to work images on scroll
	const workImages = document.querySelectorAll('.work-image');
	
	function updateImageParallax() {
		workImages.forEach(img => {
			const rect = img.getBoundingClientRect();
			const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
			
			if (isVisible) {
				const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
				const parallaxValue = scrollProgress * 20;
				img.style.transform = `translateY(${parallaxValue}px)`;
			}
		});
	}
	
	window.addEventListener('scroll', () => {
		requestAnimationFrame(updateImageParallax);
	}, { passive: true });

	// Image Modal Functionality
	const imageModal = document.getElementById('imageModal');
	const modalImg = imageModal ? imageModal.querySelector('.image-modal-img') : null;
	const modalClose = imageModal ? imageModal.querySelector('.image-modal-close') : null;
	const modalBackdrop = imageModal ? imageModal.querySelector('.image-modal-backdrop') : null;
	
	// Get all work images (portfolio and products sections)
	const workImageContainers = document.querySelectorAll('.work-image');
	
	function openImageModal(imgSrc, imgAlt) {
		if (!imageModal || !modalImg) return;
		
		modalImg.src = imgSrc;
		modalImg.alt = imgAlt || 'Image';
		imageModal.classList.add('active');
		document.body.style.overflow = 'hidden';
	}
	
	function closeImageModal() {
		if (!imageModal) return;
		
		imageModal.classList.remove('active');
		document.body.style.overflow = '';
	}
	
	// Add click handlers to work images
	workImageContainers.forEach(container => {
		const img = container.querySelector('img');
		if (img) {
			// Make sure it's clickable
			container.style.cursor = 'pointer';
			img.style.cursor = 'pointer';
			
			// Add click handler to the container
			container.addEventListener('click', (e) => {
				// Allow clicks anywhere on the image container
				const imgSrc = img.src;
				const imgAlt = img.alt || 'Work image';
				openImageModal(imgSrc, imgAlt);
			});
			
			// Also make the image itself clickable
			img.addEventListener('click', (e) => {
				e.stopPropagation();
				const imgSrc = img.src;
				const imgAlt = img.alt || 'Work image';
				openImageModal(imgSrc, imgAlt);
			});
		}
	});
	
	// Add click handlers to work-link buttons to open images in modal
	const workLinks = document.querySelectorAll('.work-link');
	workLinks.forEach(link => {
		const href = link.getAttribute('href');
		if (href && (href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.gif') || href.endsWith('.webp'))) {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				// Handle both relative and absolute paths
				let imgSrc = href;
				if (!href.startsWith('http') && !href.startsWith('/')) {
					// Relative path - construct full URL
					const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
					imgSrc = new URL(href, baseUrl).href;
				} else if (href.startsWith('/')) {
					imgSrc = window.location.origin + href;
				}
				const linkText = link.textContent.trim().replace(/\s+/g, ' ');
				const imgAlt = linkText || 'Work image';
				openImageModal(imgSrc, imgAlt);
			});
		}
	});

	// Add click handlers to product items to open product websites
	const productItems = document.querySelectorAll('.app-item');
	const productUrls = {
		'quo': 'https://openphone.com',
		'cursor': 'https://cursor.sh',
		'figma': 'https://www.figma.com',
		'icontactcamera': 'https://www.icontactcamera.com',
		'raycast': 'https://www.raycast.com'
	};

	productItems.forEach(item => {
		const appName = item.getAttribute('data-app');
		if (appName && productUrls[appName]) {
			item.addEventListener('click', (e) => {
				// Don't open if clicking on a link inside
				if (e.target.tagName === 'A' || e.target.closest('a')) {
					return;
				}
				window.open(productUrls[appName], '_blank', 'noopener,noreferrer');
			});
		}
	});
	
	// Close modal handlers
	if (modalClose) {
		modalClose.addEventListener('click', closeImageModal);
	}
	
	if (modalBackdrop) {
		modalBackdrop.addEventListener('click', closeImageModal);
	}
	
	// Close modal on ESC key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && imageModal && imageModal.classList.contains('active')) {
			closeImageModal();
		}
	});

	// Theme Toggle Functionality
	const themeToggle = document.getElementById('themeToggle');
	const htmlElement = document.documentElement;
	
	// Function to get system preference
	function getSystemTheme() {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
		return 'light';
	}
	
	// Function to set theme
	function setTheme(theme) {
		htmlElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}
	
	// Function to get saved theme or system preference
	function getTheme() {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			return savedTheme;
		}
		return getSystemTheme();
	}
	
	// Initialize theme on page load
	const initialTheme = getTheme();
	setTheme(initialTheme);
	
	// Listen for system theme changes
	if (window.matchMedia) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', (e) => {
			// Only auto-switch if user hasn't manually set a preference
			if (!localStorage.getItem('theme')) {
				setTheme(e.matches ? 'dark' : 'light');
			}
		});
	}
	
	// Toggle theme on button click
	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
			const newTheme = currentTheme === 'light' ? 'dark' : 'light';
			setTheme(newTheme);
		});
	}


	// Image Lazy Loading Enhancement
	if ('loading' in HTMLImageElement.prototype) {
		const images = document.querySelectorAll('img[loading="lazy"]');
		images.forEach(img => {
			img.addEventListener('load', function() {
				this.style.opacity = '0';
				this.style.transition = 'opacity 0.3s';
				requestAnimationFrame(() => {
					this.style.opacity = '1';
				});
			});
		});
	}


	// Add loading state management
	window.addEventListener('load', () => {
		document.body.classList.add('loaded');
	});

	// Active Navigation Section Detection
	function updateActiveNav() {
		const navLinks = document.querySelectorAll('.nav-link');
		
		if (navLinks.length === 0) return;
		
		// Always remove active class from all nav links first
		navLinks.forEach(link => link.classList.remove('active'));
		
		// Get current page path and normalize it
		let currentPath = window.location.pathname;
		const currentHash = window.location.hash;
		
		// Normalize path
		if (currentPath.endsWith('/')) {
			currentPath = currentPath.slice(0, -1);
		}
		if (currentPath === '' || currentPath === '/') {
			currentPath = '/index.html';
		}
		
		// Determine which page we're on
		const isHomePage = currentPath === '/index.html' || currentPath.endsWith('/index.html');
		const isBooksPage = currentPath.includes('/books/');
		const isProductsPage = currentPath.includes('/products/');
		const isContactPage = currentPath.includes('/contact/');
		
		// Handle specific pages first
		if (isContactPage) {
			navLinks.forEach(link => {
				const href = link.getAttribute('href');
				if (!href) return;
				// Match Contact link - must be #contact or contain /contact/
				if (href === '#contact' || href.includes('/contact/')) {
					link.classList.add('active');
					return; // Only mark one as active
				}
			});
			return;
		}
		
		if (isBooksPage) {
			navLinks.forEach(link => {
				const href = link.getAttribute('href');
				if (!href) return;
				// Match Books link - must be #books or contain /books/ but not /products/
				if (href === '#books' || (href.includes('/books/') && !href.includes('/products/'))) {
					link.classList.add('active');
					return; // Only mark one as active
				}
			});
			return;
		}
		
		if (isProductsPage) {
			navLinks.forEach(link => {
				const href = link.getAttribute('href');
				if (!href) return;
				// Match Products link - must be #products or contain /products/ but not /books/
				if (href === '#products' || (href.includes('/products/') && !href.includes('/books/'))) {
					link.classList.add('active');
					return; // Only mark one as active
				}
			});
			return;
		}
		
		// Handle home page - check which section is visible
		if (isHomePage) {
			// If there's a hash in URL, use that first
			if (currentHash) {
				const hashId = currentHash.substring(1);
				navLinks.forEach(link => {
					const href = link.getAttribute('href');
					if (!href) return;
					
					let targetId = '';
					if (href.startsWith('#')) {
						targetId = href.substring(1);
					} else if (href.includes('#')) {
						targetId = href.split('#')[1];
					}
					
					if (targetId === hashId) {
						link.classList.add('active');
						return;
					}
				});
				return;
			}
			
			// On home page, always show Portfolio as active (since it's the home page)
			navLinks.forEach(link => {
				const href = link.getAttribute('href');
				if (!href) return;
				
				// Only match Portfolio link - exact match for index.html or relative paths that don't include products/books/contact
				// Check for exact matches first
				if (href === 'index.html' || href === '/' || href === '#') {
					link.classList.add('active');
					return;
				}
				
				// Check for paths ending with index.html but not containing products, books, or contact
				if (href.endsWith('index.html') && !href.includes('products') && !href.includes('books') && !href.includes('contact')) {
					link.classList.add('active');
					return;
				}
			});
			return;
		}
	}
	
	// Update active nav on scroll
	let navUpdateTicking = false;
	function requestNavUpdate() {
		if (!navUpdateTicking) {
			window.requestAnimationFrame(() => {
				updateActiveNav();
				navUpdateTicking = false;
			});
			navUpdateTicking = true;
		}
	}
	
	window.addEventListener('scroll', requestNavUpdate, { passive: true });
	window.addEventListener('load', () => {
		setTimeout(updateActiveNav, 100);
	});
	
	// Also update on hash change (for cross-page navigation)
	window.addEventListener('hashchange', () => {
		setTimeout(updateActiveNav, 100);
	});
	
	// Initial call after DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			setTimeout(updateActiveNav, 200);
		});
	} else {
		setTimeout(updateActiveNav, 200);
	}

	// Logo click handler - scroll to top on same page, or navigate home
	if (navLogo) {
		navLogo.addEventListener('click', function(e) {
			const href = this.getAttribute('href');
			// If href is just #, scroll to top
			if (href === '#' || href === '') {
				e.preventDefault();
				window.scrollTo({
					top: 0,
					behavior: 'smooth'
				});
			}
			// Otherwise let it navigate normally (for ../ links)
		});
	}

	// Keyboard Navigation Enhancement
	document.addEventListener('keydown', (e) => {
		// ESC to close mobile menu
		if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
			navToggle.classList.remove('active');
			navLinks.classList.remove('active');
			document.body.style.overflow = '';
		}
	});

	// Reduce motion for users who prefer it
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	if (prefersReducedMotion) {
		document.documentElement.style.setProperty('--transition-fast', '0ms');
		document.documentElement.style.setProperty('--transition-base', '0ms');
		document.documentElement.style.setProperty('--transition-slow', '0ms');
	}

	// Word Rotation Animation
	const wordRotateElements = document.querySelectorAll('.word-rotate');
	
	wordRotateElements.forEach(element => {
		const wordsString = element.getAttribute('data-words');
		if (!wordsString) return;
		
		const words = wordsString.split(',').map(w => w.trim());
		if (words.length === 0) return;
		
		const textElement = element.querySelector('.word-rotate-text');
		if (!textElement) return;
		
		let currentIndex = 0;
		
		// Set initial word
		textElement.textContent = words[0];
		
		// Rotate words every 3 seconds
		setInterval(() => {
			currentIndex = (currentIndex + 1) % words.length;
			
			// Fade out
			textElement.style.opacity = '0';
			textElement.style.transform = 'translateY(10px)';
			
			setTimeout(() => {
				textElement.textContent = words[currentIndex];
				// Fade in
				textElement.style.opacity = '1';
				textElement.style.transform = 'translateY(0)';
			}, 300);
		}, 3000);
		
		// Add transition to text element
		textElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
		textElement.style.display = 'inline-block';
	});

	// Console message for developers
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		console.log('%cPortfolio Site', 'font-size: 20px; font-weight: bold; color: #000;');
		console.log('%cBuilt with modern web technologies', 'font-size: 12px; color: #666;');
	}

})();
