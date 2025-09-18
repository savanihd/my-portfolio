// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation functionality
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animated skill bars
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !bar.classList.contains('animated')) {
                bar.style.width = progress + '%';
                bar.classList.add('animated');
            }
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                entry.target.style.opacity = '1';
                
                // Special handling for skills section
                if (entry.target.classList.contains('skills')) {
                    setTimeout(animateSkillBars, 300);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.about, .skills, .experience, .services, .portfolio, .blog, .testimonials, .contact');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Scroll listener for skill bars
    window.addEventListener('scroll', animateSkillBars);

    // Back to top button functionality
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Validate form client-side
        const validation = validateContactForm(formObject);
        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            return;
        }

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Send form data to PHP handler
            const response = await fetch('contact-handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject)
            });

            const result = await response.json();

            if (result.success) {
                // Reset form
                this.reset();
                
                // Show success message
                showNotification(result.message, 'success');
                
                // Track successful form submission
                trackEvent('Contact', 'form_submit', 'success');
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showNotification(
                error.message || 'Failed to send message. Please try again or contact me directly.',
                'error'
            );
            
            // Track failed form submission
            trackEvent('Contact', 'form_submit', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Client-side form validation
    function validateContactForm(data) {
        // Check required fields
        if (!data.name || data.name.trim().length < 2) {
            return { isValid: false, message: 'Please enter a valid name (at least 2 characters).' };
        }

        if (!data.email || !isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        if (!data.subject || data.subject.trim().length < 5) {
            return { isValid: false, message: 'Please enter a subject (at least 5 characters).' };
        }

        if (!data.message || data.message.trim().length < 10) {
            return { isValid: false, message: 'Please enter a message (at least 10 characters).' };
        }

        // Check field lengths
        if (data.name.length > 100) {
            return { isValid: false, message: 'Name must not exceed 100 characters.' };
        }

        if (data.subject.length > 200) {
            return { isValid: false, message: 'Subject must not exceed 200 characters.' };
        }

        if (data.message.length > 5000) {
            return { isValid: false, message: 'Message must not exceed 5000 characters.' };
        }

        return { isValid: true };
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                }
                .notification-success {
                    border-left: 4px solid #4CAF50;
                }
                .notification-error {
                    border-left: 4px solid #f44336;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }
                .notification-success .notification-content i:first-child {
                    color: #4CAF50;
                    font-size: 1.2rem;
                }
                .notification-error .notification-content i:first-child {
                    color: #f44336;
                    font-size: 1.2rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    margin-left: auto;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Portfolio filter functionality (if needed in future)
    function initPortfolioFilter() {
        const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter portfolio items
                    portfolioItems.forEach(item => {
                        if (filter === 'all' || item.classList.contains(filter)) {
                            item.style.display = 'block';
                            item.style.animation = 'fadeInUp 0.5s ease-out';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        }
    }

    // Initialize portfolio filter
    initPortfolioFilter();

    // Lazy loading for images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Initialize lazy loading
    initLazyLoading();

    // Typing effect for hero section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Initialize typing effect for hero subtitle (optional)
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, originalText, 80);
        }, 1000);
    }

    // Blog feed functionality
    async function loadBlogPosts() {
        try {
            // This would typically fetch from your blog API
            // For now, we'll use the static content already in HTML
            console.log('Blog posts loaded from static content');
            
            // You can implement actual blog feed fetching here
            // const response = await fetch('https://www.itsolutionstuff.com/feed');
            // const data = await response.json();
            // updateBlogSection(data);
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }

    // Load blog posts
    loadBlogPosts();

    // Smooth reveal animation for elements
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', revealOnScroll);

    // Initialize AOS (Animate On Scroll) alternative
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.service-card, .portfolio-item, .blog-item, .testimonial-item');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.transitionDelay = `${index * 0.1}s`;
        });

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(element => scrollObserver.observe(element));
    }

    // Initialize scroll animations
    initScrollAnimations();

    // Parallax effect for hero section
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.hero-image');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Initialize parallax (optional, can be disabled for better performance)
    // initParallax();

    // Theme switcher (if needed in future)
    function initThemeSwitcher() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-theme');
                
                // Save theme preference
                const isDarkMode = document.body.classList.contains('dark-theme');
                localStorage.setItem('darkMode', isDarkMode);
            });

            // Load saved theme
            const savedTheme = localStorage.getItem('darkMode');
            if (savedTheme === 'true') {
                document.body.classList.add('dark-theme');
            }
        }
    }

    // Initialize theme switcher
    initThemeSwitcher();

    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll events
    const debouncedAnimateSkillBars = debounce(animateSkillBars, 100);
    window.addEventListener('scroll', debouncedAnimateSkillBars);

    // Initialize tooltips (if needed)
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            });
            
            element.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }

    // Initialize tooltips
    initTooltips();

    // Preloader (if needed)
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 300);
            }, 1000);
        }
    }

    // Hide preloader when page is loaded
    hidePreloader();

    // Console log for developers
    console.log(`
        🚀 Hardik Savani's Portfolio Website
        📧 Contact: hardik.savani@example.com
        🌐 Blog: https://www.itsolutionstuff.com/
        
        Built with ❤️ and modern web technologies
        - Vanilla JavaScript
        - CSS3 with custom animations
        - Responsive design
        - SEO optimized
        
        Interested in working together? Get in touch!
    `);

    // Analytics tracking (placeholder)
    function trackEvent(category, action, label) {
        // Google Analytics or other tracking service integration
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        console.log(`Event tracked: ${category} - ${action} - ${label}`);
    }

    // Track important interactions
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('CTA', 'click', btn.textContent.trim());
        });
    });

    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('Social', 'click', link.href);
        });
    });

    // Service Worker registration (for PWA features if needed)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Error handling for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTIwQzE2NS0zIDEzNS01IDEzNSA4MEM5NSAxMjAgMTk1IDEyMCAxNTUgODBDMTc1IDEwNSAxMjUgMTA1IDE0NSA4MEMxMjUgMTAwIDE3NSAxMDAgMTU1IDgwQzE1MCA5NSAxNTAgMTA1IDE1MCAxMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPC9zdmc+';
            this.alt = 'Image not found';
        });
    });

    console.log('Portfolio website initialized successfully! 🎉');
});