<?php
// Contact Form Handler for Hardik Savani's Portfolio
// This PHP script handles contact form submissions securely

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type and security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS headers (adjust domain as needed)
$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://hardiksavani.com',
    'https://www.hardiksavani.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$config = [
    'to_email' => 'hardik.savani@example.com', // Replace with actual email
    'from_name' => 'Portfolio Contact Form',
    'subject_prefix' => '[Portfolio Contact] ',
    'smtp_host' => 'smtp.gmail.com', // Update with your SMTP settings
    'smtp_port' => 587,
    'smtp_username' => '', // Add your SMTP username
    'smtp_password' => '', // Add your SMTP password
    'recaptcha_secret' => '', // Add your reCAPTCHA secret key if using
    'enable_file_logging' => true,
    'log_file' => 'contact_submissions.log'
];

class ContactFormHandler
{
    private $config;
    private $errors = [];
    private $data = [];

    public function __construct($config)
    {
        $this->config = $config;
    }

    public function handleRequest()
    {
        try {
            // Only allow POST requests
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Method not allowed', 405);
            }

            // Rate limiting check
            if (!$this->checkRateLimit()) {
                throw new Exception('Too many requests. Please try again later.', 429);
            }

            // Get and validate form data
            $this->getFormData();
            $this->validateData();

            // Verify reCAPTCHA if enabled
            if (!empty($this->config['recaptcha_secret'])) {
                $this->verifyRecaptcha();
            }

            // Send email
            $this->sendEmail();

            // Log submission
            if ($this->config['enable_file_logging']) {
                $this->logSubmission();
            }

            // Return success response
            $this->sendResponse([
                'success' => true,
                'message' => 'Thank you for your message! I will get back to you soon.'
            ]);

        } catch (Exception $e) {
            $this->sendErrorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    private function getFormData()
    {
        // Get JSON data if sent as JSON
        $json_data = json_decode(file_get_contents('php://input'), true);
        
        if ($json_data) {
            $this->data = $json_data;
        } else {
            // Get form data from POST
            $this->data = [
                'name' => $_POST['name'] ?? '',
                'email' => $_POST['email'] ?? '',
                'subject' => $_POST['subject'] ?? '',
                'budget' => $_POST['budget'] ?? '',
                'message' => $_POST['message'] ?? '',
                'recaptcha_response' => $_POST['g-recaptcha-response'] ?? ''
            ];
        }

        // Sanitize data
        $this->data = array_map([$this, 'sanitizeInput'], $this->data);
    }

    private function sanitizeInput($input)
    {
        if (is_string($input)) {
            return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
        }
        return $input;
    }

    private function validateData()
    {
        // Validate name
        if (empty($this->data['name'])) {
            $this->errors[] = 'Name is required';
        } elseif (strlen($this->data['name']) < 2) {
            $this->errors[] = 'Name must be at least 2 characters long';
        } elseif (strlen($this->data['name']) > 100) {
            $this->errors[] = 'Name must not exceed 100 characters';
        }

        // Validate email
        if (empty($this->data['email'])) {
            $this->errors[] = 'Email is required';
        } elseif (!filter_var($this->data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = 'Please enter a valid email address';
        }

        // Validate subject
        if (empty($this->data['subject'])) {
            $this->errors[] = 'Subject is required';
        } elseif (strlen($this->data['subject']) < 5) {
            $this->errors[] = 'Subject must be at least 5 characters long';
        } elseif (strlen($this->data['subject']) > 200) {
            $this->errors[] = 'Subject must not exceed 200 characters';
        }

        // Validate message
        if (empty($this->data['message'])) {
            $this->errors[] = 'Message is required';
        } elseif (strlen($this->data['message']) < 10) {
            $this->errors[] = 'Message must be at least 10 characters long';
        } elseif (strlen($this->data['message']) > 5000) {
            $this->errors[] = 'Message must not exceed 5000 characters';
        }

        // Check for spam patterns
        if ($this->detectSpam()) {
            $this->errors[] = 'Your message appears to be spam';
        }

        if (!empty($this->errors)) {
            throw new Exception(implode(', ', $this->errors), 422);
        }
    }

    private function detectSpam()
    {
        $spam_patterns = [
            '/\b(viagra|cialis|casino|lottery|winner)\b/i',
            '/\b(click here|buy now|free money|make money fast)\b/i',
            '/https?:\/\/[^\s]{10,}/i' // Detect multiple URLs
        ];

        $text = $this->data['name'] . ' ' . $this->data['subject'] . ' ' . $this->data['message'];

        foreach ($spam_patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        // Check for repeated characters (possible spam)
        if (preg_match('/(.)\1{10,}/', $text)) {
            return true;
        }

        return false;
    }

    private function verifyRecaptcha()
    {
        if (empty($this->data['recaptcha_response'])) {
            throw new Exception('Please complete the reCAPTCHA verification');
        }

        $response = file_get_contents(
            'https://www.google.com/recaptcha/api/siteverify?' . 
            http_build_query([
                'secret' => $this->config['recaptcha_secret'],
                'response' => $this->data['recaptcha_response'],
                'remoteip' => $_SERVER['REMOTE_ADDR']
            ])
        );

        $result = json_decode($response, true);

        if (!$result['success']) {
            throw new Exception('reCAPTCHA verification failed');
        }
    }

    private function checkRateLimit()
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $rate_limit_file = 'rate_limit_' . md5($ip) . '.tmp';
        $max_requests = 5; // Maximum requests per hour
        $time_window = 3600; // 1 hour in seconds

        if (file_exists($rate_limit_file)) {
            $data = json_decode(file_get_contents($rate_limit_file), true);
            $current_time = time();

            // Clean old entries
            $data = array_filter($data, function($timestamp) use ($current_time, $time_window) {
                return $current_time - $timestamp < $time_window;
            });

            if (count($data) >= $max_requests) {
                return false;
            }

            $data[] = $current_time;
        } else {
            $data = [time()];
        }

        file_put_contents($rate_limit_file, json_encode($data));
        return true;
    }

    private function sendEmail()
    {
        $to = $this->config['to_email'];
        $subject = $this->config['subject_prefix'] . $this->data['subject'];
        
        // Create email body
        $body = $this->createEmailBody();
        $headers = $this->createEmailHeaders();

        // Try to send email using PHP mail() function first
        $sent = mail($to, $subject, $body, $headers);

        if (!$sent) {
            // Fallback to SMTP if mail() fails and SMTP is configured
            if (!empty($this->config['smtp_host'])) {
                $this->sendSMTPEmail($to, $subject, $body);
            } else {
                throw new Exception('Failed to send email. Please try again later.');
            }
        }
    }

    private function createEmailBody()
    {
        $budget_info = !empty($this->data['budget']) ? "Budget: {$this->data['budget']}\n" : '';
        
        return "New contact form submission from portfolio website\n\n" .
               "Name: {$this->data['name']}\n" .
               "Email: {$this->data['email']}\n" .
               "Subject: {$this->data['subject']}\n" .
               $budget_info .
               "Message:\n{$this->data['message']}\n\n" .
               "---\n" .
               "Sent from: {$_SERVER['HTTP_HOST']}\n" .
               "IP Address: {$_SERVER['REMOTE_ADDR']}\n" .
               "User Agent: {$_SERVER['HTTP_USER_AGENT']}\n" .
               "Timestamp: " . date('Y-m-d H:i:s T');
    }

    private function createEmailHeaders()
    {
        return "From: {$this->config['from_name']} <noreply@{$_SERVER['HTTP_HOST']}>\r\n" .
               "Reply-To: {$this->data['name']} <{$this->data['email']}>\r\n" .
               "Content-Type: text/plain; charset=UTF-8\r\n" .
               "X-Mailer: PHP/" . phpversion();
    }

    private function sendSMTPEmail($to, $subject, $body)
    {
        // Basic SMTP implementation (you might want to use PHPMailer for production)
        $smtp = fsockopen($this->config['smtp_host'], $this->config['smtp_port'], $errno, $errstr, 30);
        
        if (!$smtp) {
            throw new Exception("SMTP connection failed: $errstr ($errno)");
        }

        // This is a simplified SMTP implementation
        // For production, consider using PHPMailer or similar library
        throw new Exception('SMTP sending not fully implemented. Please configure a proper email service.');
    }

    private function logSubmission()
    {
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s T'),
            'ip' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'name' => $this->data['name'],
            'email' => $this->data['email'],
            'subject' => $this->data['subject'],
            'budget' => $this->data['budget'] ?? 'Not specified',
            'message_length' => strlen($this->data['message'])
        ];

        $log_line = json_encode($log_entry) . "\n";
        file_put_contents($this->config['log_file'], $log_line, FILE_APPEND | LOCK_EX);
    }

    private function sendResponse($data, $status_code = 200)
    {
        http_response_code($status_code);
        echo json_encode($data);
        exit();
    }

    private function sendErrorResponse($message, $status_code = 400)
    {
        http_response_code($status_code);
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit();
    }
}

// Initialize and handle the request
try {
    $handler = new ContactFormHandler($config);
    $handler->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error. Please try again later.'
    ]);
}
?>