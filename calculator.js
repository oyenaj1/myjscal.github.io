const display = document.getElementById('display');
const themeToggle = document.getElementById('theme-toggle');
const sciToggle = document.getElementById('mode-toggle');
const scientificButtons = document.getElementById('scientific');
const historylist = document.getElementById('history-list');
const calculatorContainer = document.querySelector('.calculator-container');

let currentExpression = '';

// --- Mathematical Expression Parser (Safer than eval) ---

function safeEvaluate(expression) {
    // Remove spaces
    expression = expression.replace(/\s+/g, '');
    
    // Replace mathematical constants and functions
    expression = expression.replace(/π/g, Math.PI);
    expression = expression.replace(/e(?![a-z])/g, Math.E); // e not followed by letters
    expression = expression.replace(/\^/g, '**');
    
    // Handle functions - more robust pattern matching
    expression = expression.replace(/sin\(/g, 'Math.sin(');
    expression = expression.replace(/cos\(/g, 'Math.cos(');
    expression = expression.replace(/tan\(/g, 'Math.tan(');
    expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
    expression = expression.replace(/log\(/g, 'Math.log10(');
    expression = expression.replace(/ln\(/g, 'Math.log(');
    expression = expression.replace(/exp\(/g, 'Math.exp(');
    
    // Validate the expression before evaluation
    if (!isValidExpression(expression)) {
        throw new Error('Invalid expression');
    }
    
    // Check for balanced parentheses
    if (!hasBalancedParentheses(expression)) {
        throw new Error('Unbalanced parentheses');
    }
    
    try {
        // Use Function constructor instead of eval for better security
        const result = new Function('return ' + expression)();
        
        // Check for invalid results
        if (!isFinite(result)) {
            throw new Error('Mathematical error');
        }
        
        return result;
    } catch (error) {
        throw new Error('Invalid calculation');
    }
}

function isValidExpression(expr) {
    // More comprehensive validation
    const allowedPattern = /^[\d\.\+\-\*\/\(\)Math\.\w\s]+$/;
    
    // Check basic pattern
    if (!allowedPattern.test(expr)) {
        return false;
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = [
        /\b(document|window|alert|prompt|confirm|eval|Function|setTimeout|setInterval)\b/,
        /\b(location|href|cookie|localStorage|sessionStorage)\b/,
        /[<>]/,
        /\b(script|iframe|object|embed)\b/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(expr)) {
            return false;
        }
    }
    
    return true;
}

function hasBalancedParentheses(expr) {
    let count = 0;
    for (let char of expr) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
    }
    return count === 0;
}

// --- Basic Calculator Functions ---

function press(value) {
    if (display.value === "Error") {
        display.value = '';
        currentExpression = '';
    }
    display.value += value;
    currentExpression += value;
}

function clearDisplay() {
    display.value = '';
    currentExpression = '';
}

function backspace() {
    display.value = display.value.slice(0, -1);
    currentExpression = currentExpression.slice(0, -1);
}

function calculate() {
    try {
        if (!currentExpression.trim()) {
            return;
        }

        const result = safeEvaluate(currentExpression);
        
        // Round to 10 decimal places to avoid floating point issues
        const roundedResult = Math.round(result * 10000000000) / 10000000000;
        
        display.value = roundedResult;
        addtohistory(currentExpression, roundedResult);
        currentExpression = roundedResult.toString();

    } catch (error) {
        display.value = "Error";
        currentExpression = '';
        console.error("Calculation error:", error.message);
    }
}

function scientificFunc(funcName) {
    if (display.value === "Error") {
        display.value = '';
        currentExpression = '';
    }

    const val = parseFloat(display.value);
    let result;

    if (isNaN(val)) {
        display.value = "Error";
        currentExpression = '';
        return;
    }

    try {
        switch (funcName) {
            case 'sin': 
                result = Math.sin(val * Math.PI / 180); 
                break;
            case 'cos': 
                result = Math.cos(val * Math.PI / 180); 
                break;
            case 'tan': 
                result = Math.tan(val * Math.PI / 180); 
                break;
            case 'sqrt': 
                if (val < 0) throw new Error('Square root of negative number');
                result = Math.sqrt(val); 
                break;
            case 'log': 
                if (val <= 0) throw new Error('Logarithm of non-positive number');
                result = Math.log10(val); 
                break;
            case 'ln': 
                if (val <= 0) throw new Error('Natural logarithm of non-positive number');
                result = Math.log(val); 
                break;
            case 'exp': 
                result = Math.exp(val); 
                break;
            default:
                throw new Error('Unknown function');
        }

        // Check for invalid results
        if (!isFinite(result)) {
            throw new Error('Mathematical error');
        }

        // Round to avoid floating point issues
        result = Math.round(result * 10000000000) / 10000000000;

        display.value = result;
        currentExpression = result.toString();
        addtohistory(`${funcName}(${val})`, result);
        
    } catch (error) {
        display.value = "Error";
        currentExpression = '';
        console.error("Scientific function error:", error.message);
    }
}

// --- History Functions ---

function addtohistory(expression, result) {
    const li = document.createElement("li");
    li.textContent = `${expression} = ${result}`;
    li.addEventListener("click", () => {
        display.value = result;
        currentExpression = result.toString();
    });
    historylist.prepend(li);
    
    // Limit history to 20 items
    if (historylist.children.length > 20) {
        historylist.removeChild(historylist.lastChild);
    }
}

function clearHistory() {
    historylist.innerHTML = '';
}

// --- Toggle Sign Function (+/-) ---

function toggleSign() {
    if (display.value === "Error" || display.value === "") {
        return;
    }

    let currentValue = parseFloat(display.value);
    if (!isNaN(currentValue)) {
        currentValue = -currentValue;
        display.value = currentValue;
        currentExpression = currentValue.toString();
    }
}

// --- Calculate Percentage Function (%) ---

function calculatePercentage() {
    if (display.value === "Error" || display.value === "") {
        return;
    }

    let currentValue = parseFloat(display.value);
    if (!isNaN(currentValue)) {
        const originalValue = currentValue;
        currentValue /= 100;
        display.value = currentValue;
        currentExpression = currentValue.toString();
        addtohistory(`${originalValue}%`, currentValue);
    }
}

// --- Theme Toggle Functionality ---

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
});

// --- Simple/Scientific Mode Toggle Functionality ---

sciToggle.addEventListener('change', () => {
    scientificButtons.classList.toggle("show", sciToggle.checked);
    calculatorContainer.classList.toggle('show-scientific-mode', sciToggle.checked);
});

// --- Initial Setup on Page Load ---

window.addEventListener("DOMContentLoaded", () => {
    scientificButtons.classList.toggle("show", sciToggle.checked);
    calculatorContainer.classList.toggle('show-scientific-mode', sciToggle.checked);
    document.body.classList.toggle('dark-theme', themeToggle.checked);
});

// --- Keyboard Input Handling ---

document.addEventListener('keydown', (e) => {
    const key = e.key;

    // Prevent default behavior for calculator keys
    if ("0123456789+-*/.()%".includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        e.preventDefault();
    }

    if (!isNaN(key) || "+-*/().".includes(key)) {
        press(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === '%') {
        calculatePercentage();
    }

    // Function key mappings (only when not using Ctrl/Cmd)
    if (!e.ctrlKey && !e.metaKey) {
        const functionMap = {
            's': () => press('sin('),
            'c': () => press('cos('),
            't': () => press('tan('),
            'r': () => press('sqrt('),
            'l': () => press('log('),
            'n': () => press('ln('),
            'x': () => press('exp('),
            'p': () => press('π'),
            'e': () => press('e'),
            '^': () => press('^')
        };

        if (functionMap[key.toLowerCase()]) {
            e.preventDefault();
            functionMap[key.toLowerCase()]();
        }
    }
});