// DOM Elements
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const avoidSimilarCheckbox = document.getElementById('avoidSimilar');
const notification = document.getElementById('notification');

// Character sets
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar (to be excluded when avoidSimilar is enabled)
const similarCharacters = '0Oo1Il|i5S2Zz8B6bG9gqCcPpVvWwXxUunmrtf';

// Update length display
lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
});

// Generate password function
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charset = '';
    
    // Build character set based on selected options
    let baseUppercase = uppercase;
    let baseLowercase = lowercase;
    let baseNumbers = numbers;
    let baseSymbols = symbols;
    
    // Filter out similar characters if option is enabled
    if (avoidSimilarCheckbox.checked) {
        baseUppercase = uppercase.split('').filter(char => !similarCharacters.includes(char)).join('');
        baseLowercase = lowercase.split('').filter(char => !similarCharacters.includes(char)).join('');
        baseNumbers = numbers.split('').filter(char => !similarCharacters.includes(char)).join('');
        baseSymbols = symbols.split('').filter(char => !similarCharacters.includes(char)).join('');
    }
    
    if (uppercaseCheckbox.checked) charset += baseUppercase;
    if (lowercaseCheckbox.checked) charset += baseLowercase;
    if (numbersCheckbox.checked) charset += baseNumbers;
    if (symbolsCheckbox.checked) charset += baseSymbols;
    
    // Validate that at least one option is selected
    if (charset.length === 0) {
        showNotification('Please select at least one character type', 'error');
        return;
    }
    
    // Generate password with animation
    passwordOutput.style.opacity = '0';
    passwordOutput.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        // Ensure at least one character from each selected type is included
        password = ensureCharacterTypes(password, charset, {
            uppercase: uppercaseCheckbox.checked,
            lowercase: lowercaseCheckbox.checked,
            numbers: numbersCheckbox.checked,
            symbols: symbolsCheckbox.checked
        }, {
            baseUppercase,
            baseLowercase,
            baseNumbers,
            baseSymbols
        });
        
        // Display password with animation
        passwordOutput.value = password;
        passwordOutput.style.opacity = '1';
        passwordOutput.style.transform = 'scale(1)';
        passwordOutput.style.transition = 'all 0.3s ease';
        
        // Auto-copy to clipboard
        copyToClipboard(password);
    }, 150);
}

// Ensure password contains at least one character from each selected type
function ensureCharacterTypes(password, charset, options, baseChars) {
    let newPassword = password.split('');
    const checks = [
        { type: 'uppercase', chars: baseChars.baseUppercase || uppercase },
        { type: 'lowercase', chars: baseChars.baseLowercase || lowercase },
        { type: 'numbers', chars: baseChars.baseNumbers || numbers },
        { type: 'symbols', chars: baseChars.baseSymbols || symbols }
    ];
    
    for (const check of checks) {
        if (options[check.type] && check.chars.length > 0) {
            // Check if password contains this type
            const hasType = newPassword.some(char => check.chars.includes(char));
            if (!hasType) {
                // Replace a random character with one from this type
                const randomIndex = Math.floor(Math.random() * newPassword.length);
                const randomChar = check.chars[Math.floor(Math.random() * check.chars.length)];
                newPassword[randomIndex] = randomChar;
            }
        }
    }
    
    return newPassword.join('');
}

// Copy to clipboard function
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Password copied to clipboard!', 'success');
        
        // Visual feedback on copy button
        copyBtn.style.background = 'var(--success-color)';
        setTimeout(() => {
            copyBtn.style.background = '';
        }, 500);
    } catch (err) {
        // Fallback for older browsers
        passwordOutput.select();
        passwordOutput.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showNotification('Password copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy password', 'error');
        }
    }
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Event listeners
generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', () => {
    if (passwordOutput.value) {
        copyToClipboard(passwordOutput.value);
    }
});

// Allow Enter key to generate
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement !== passwordOutput) {
        generatePassword();
    }
});

// Generate initial password on load
window.addEventListener('load', () => {
    generatePassword();
});

