// Blog Feed Integration for IT Solution Stuff
class BlogFeedManager {
    constructor() {
        this.blogContainer = document.getElementById('blog-posts');
        this.blogAPI = 'https://www.itsolutionstuff.com';
        this.maxPosts = 3;
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    // Initialize blog feed
    async init() {
        try {
            await this.loadBlogPosts();
        } catch (error) {
            console.error('Error initializing blog feed:', error);
            this.showFallbackContent();
        }
    }

    // Load blog posts (simulated for demo)
    async loadBlogPosts() {
        // Since we can't directly fetch from external blog due to CORS,
        // we'll simulate with curated content that represents Hardik's expertise
        const simulatedPosts = [
            {
                id: 1,
                title: "Laravel 11 New Features and Improvements You Must Know",
                excerpt: "Explore the latest features and improvements in Laravel 11, including enhanced performance, new artisan commands, and developer experience improvements that make Laravel development even more enjoyable.",
                url: "https://www.itsolutionstuff.com/post/laravel-11-new-features-and-improvements",
                image: "https://via.placeholder.com/400x250/667eea/ffffff?text=Laravel+11+Features",
                category: "Laravel",
                publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                author: "Hardik Savani"
            },
            {
                id: 2,
                title: "PHP 8.3 Best Practices for Modern Development",
                excerpt: "Learn about the best practices for PHP 8.3 development, including new features, performance optimizations, security considerations, and how to leverage the latest PHP capabilities in your projects.",
                url: "https://www.itsolutionstuff.com/post/php-8-3-best-practices-modern-development",
                image: "https://via.placeholder.com/400x250/764ba2/ffffff?text=PHP+8.3+Best+Practices",
                category: "PHP",
                publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                author: "Hardik Savani"
            },
            {
                id: 3,
                title: "Deploy Laravel Application on AWS EC2 with Load Balancer",
                excerpt: "Step-by-step comprehensive guide to deploy Laravel applications on AWS EC2 instances with load balancing for high availability, scalability, and optimal performance in production environments.",
                url: "https://www.itsolutionstuff.com/post/deploy-laravel-aws-ec2-load-balancer",
                image: "https://via.placeholder.com/400x250/f093fb/ffffff?text=AWS+Deployment+Guide",
                category: "AWS",
                publishDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                author: "Hardik Savani"
            },
            {
                id: 4,
                title: "Advanced Laravel Eloquent Relationships and Query Optimization",
                excerpt: "Master advanced Eloquent relationships in Laravel and learn query optimization techniques to improve your application's database performance and reduce server load.",
                url: "https://www.itsolutionstuff.com/post/laravel-eloquent-relationships-optimization",
                image: "https://via.placeholder.com/400x250/4facfe/ffffff?text=Laravel+Eloquent+Tips",
                category: "Laravel",
                publishDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                author: "Hardik Savani"
            },
            {
                id: 5,
                title: "Building RESTful APIs with Laravel 11 and API Resources",
                excerpt: "Complete guide to building robust, scalable RESTful APIs using Laravel 11 with API Resources, authentication, rate limiting, and best practices for API development.",
                url: "https://www.itsolutionstuff.com/post/laravel-11-restful-api-development",
                image: "https://via.placeholder.com/400x250/43e97b/ffffff?text=Laravel+API+Development",
                category: "API",
                publishDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
                author: "Hardik Savani"
            }
        ];

        // Simulate API delay
        await this.delay(500);

        const posts = simulatedPosts.slice(0, this.maxPosts);
        this.renderBlogPosts(posts);
        this.cacheData('blog-posts', posts);
    }

    // Render blog posts in the container
    renderBlogPosts(posts) {
        if (!this.blogContainer) return;

        const postsHTML = posts.map(post => this.createPostHTML(post)).join('');
        this.blogContainer.innerHTML = postsHTML;

        // Add animation to newly loaded posts
        this.animateNewPosts();
    }

    // Create HTML for individual blog post
    createPostHTML(post) {
        const formattedDate = this.formatDate(post.publishDate);
        const categoryColor = this.getCategoryColor(post.category);

        return `
            <div class="blog-item" data-post-id="${post.id}">
                <div class="blog-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-overlay">
                        <a href="${post.url}" target="_blank" class="blog-read-btn">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-date">
                            <i class="fas fa-calendar"></i>
                            ${formattedDate}
                        </span>
                        <span class="blog-category" style="background: ${categoryColor}">
                            ${post.category}
                        </span>
                    </div>
                    <h3 class="blog-title">
                        <a href="${post.url}" target="_blank">${post.title}</a>
                    </h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-footer">
                        <span class="blog-author">
                            <i class="fas fa-user"></i>
                            ${post.author}
                        </span>
                        <a href="${post.url}" target="_blank" class="blog-link">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Get category color based on category name
    getCategoryColor(category) {
        const colors = {
            'Laravel': 'linear-gradient(135deg, #ff2d20, #ff6b6b)',
            'PHP': 'linear-gradient(135deg, #777bb4, #4f5b93)',
            'AWS': 'linear-gradient(135deg, #ff9900, #ff6600)',
            'API': 'linear-gradient(135deg, #4facfe, #00f2fe)',
            'JavaScript': 'linear-gradient(135deg, #f7df1e, #f7c52d)',
            'MySQL': 'linear-gradient(135deg, #4479a1, #336791)',
            'React': 'linear-gradient(135deg, #61dafb, #21a6c4)',
            'Angular': 'linear-gradient(135deg, #dd1b16, #b52e31)',
            'Vue': 'linear-gradient(135deg, #4fc08d, #42b883)',
            'Default': 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        return colors[category] || colors['Default'];
    }

    // Format date for display
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Animate newly loaded posts
    animateNewPosts() {
        const blogItems = this.blogContainer.querySelectorAll('.blog-item');
        
        blogItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Show fallback content when blog feed fails
    showFallbackContent() {
        if (!this.blogContainer) return;

        this.blogContainer.innerHTML = `
            <div class="blog-item fallback">
                <div class="blog-content" style="text-align: center; padding: 3rem;">
                    <div class="blog-icon">
                        <i class="fas fa-blog" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                    </div>
                    <h3>Visit My Blog for Latest Updates</h3>
                    <p>I regularly share insights about Laravel development, PHP best practices, and web development tips on my blog.</p>
                    <a href="https://www.itsolutionstuff.com/" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        Visit IT Solution Stuff
                    </a>
                </div>
            </div>
        `;
    }

    // Cache data with timestamp
    cacheData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Get cached data if still valid
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Load more posts (for pagination if needed)
    async loadMorePosts() {
        // Implementation for loading more posts
        const cachedPosts = this.getCachedData('blog-posts');
        if (cachedPosts) {
            // Show more posts from cache or fetch additional ones
            console.log('Loading more posts...');
        }
    }

    // Refresh blog feed
    async refresh() {
        this.cache.clear();
        await this.loadBlogPosts();
    }

    // Search blog posts (if search functionality is needed)
    searchPosts(query) {
        const posts = this.getCachedData('blog-posts') || [];
        return posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            post.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Get posts by category
    getPostsByCategory(category) {
        const posts = this.getCachedData('blog-posts') || [];
        return posts.filter(post => 
            post.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Track blog post clicks for analytics
    trackPostClick(postId, postTitle) {
        // Google Analytics or other tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_post_click', {
                event_category: 'Blog',
                event_label: postTitle,
                custom_parameter_1: postId
            });
        }
        console.log(`Blog post clicked: ${postTitle} (ID: ${postId})`);
    }

    // Initialize event listeners
    initEventListeners() {
        // Click tracking for blog links
        if (this.blogContainer) {
            this.blogContainer.addEventListener('click', (e) => {
                const blogLink = e.target.closest('.blog-link, .blog-title a, .blog-read-btn');
                if (blogLink) {
                    const blogItem = blogLink.closest('.blog-item');
                    if (blogItem) {
                        const postId = blogItem.getAttribute('data-post-id');
                        const postTitle = blogItem.querySelector('.blog-title').textContent.trim();
                        this.trackPostClick(postId, postTitle);
                    }
                }
            });
        }

        // Refresh button (if exists)
        const refreshBtn = document.getElementById('blog-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
}

// RSS Feed Parser (alternative approach for blog integration)
class RSSFeedParser {
    constructor(feedUrl) {
        this.feedUrl = feedUrl;
    }

    // Parse RSS feed using a CORS proxy (if needed)
    async parseFeed() {
        try {
            // Using a CORS proxy service (replace with your preferred service)
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.feedUrl)}`;
            const response = await fetch(proxyUrl);
            const xmlText = await response.text();
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            return this.extractPostsFromXML(xmlDoc);
        } catch (error) {
            console.error('Error parsing RSS feed:', error);
            throw error;
        }
    }

    // Extract posts from XML document
    extractPostsFromXML(xmlDoc) {
        const items = xmlDoc.querySelectorAll('item');
        const posts = [];

        items.forEach((item, index) => {
            if (index < 3) { // Limit to 3 posts
                const post = {
                    id: index + 1,
                    title: this.getTextContent(item, 'title'),
                    excerpt: this.getTextContent(item, 'description'),
                    url: this.getTextContent(item, 'link'),
                    publishDate: new Date(this.getTextContent(item, 'pubDate')),
                    author: 'Hardik Savani'
                };
                posts.push(post);
            }
        });

        return posts;
    }

    // Get text content from XML element
    getTextContent(parent, tagName) {
        const element = parent.querySelector(tagName);
        return element ? element.textContent.trim() : '';
    }
}

// Initialize blog feed when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const blogFeed = new BlogFeedManager();
    blogFeed.init();
    blogFeed.initEventListeners();
    
    // Make blog feed manager globally available for debugging
    window.blogFeedManager = blogFeed;
    
    console.log('Blog feed integration initialized successfully! 📝');
});