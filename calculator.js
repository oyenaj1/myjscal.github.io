const display = document.getElementById('display');
const themeToggle = document.getElementById('theme-toggle');
const sciToggle = document.getElementById('mode-toggle'); // SciToggle is the checkbox for toggling simple/scientific mode.
const scientificButtons = document.getElementById('scientific'); // ScientificButtons refers to the container div for scientific buttons.
const historylist = document.getElementById('history-list');
const calculatorContainer = document.querySelector('.calculator-container'); // CalculatorContainer refers to the main wrapper div for the entire calculator UI.

let currentExpression = ''; // Variable to store the current expression being built on the display.

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
        let expression = display.value;

        // Replace symbols/keywords with JavaScript equivalents
        expression = expression.replace(/π/g, 'Math.PI');
        expression = expression.replace(/e/g, 'Math.E');
        expression = expression.replace(/\^/g, '**');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/exp\(/g, 'Math.exp(');

        let result = eval(expression);

        if (typeof result === "number" && !Number.isInteger(result)) {
            result = parseFloat(result.toFixed(6));
        }

        display.value = result;
        addtohistory(expression, result);
        currentExpression = result.toString();
    } catch (e) {
        display.value = "Error";
        currentExpression = '';
        console.error("Calculation error:", e);
    }
}

function scientificFunc(funcName) {
    if (display.value === "Error") {
        display.value = '';
    }

    const val = parseFloat(display.value);
    let result;

    if (isNaN(val)) {
        display.value = "Error";
        currentExpression = '';
        return;
    }

    switch (funcName) {
        case 'sin': result = Math.sin(val * Math.PI / 180); break;
        case 'cos': result = Math.cos(val * Math.PI / 180); break;
        case 'tan': result = Math.tan(val * Math.PI / 180); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'exp': result = Math.exp(val); break;
        default:
            display.value = "Error";
            return;
    }

    if (typeof result === "number" && !Number.isInteger(result)) {
        result = parseFloat(result.toFixed(6));
    }

    display.value = result;
    currentExpression = result.toString();
    addtohistory(`${funcName}(${val})`, result);
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
        currentValue /= 100;
        display.value = currentValue;
        currentExpression = currentValue.toString();
        // Optional: addtohistory(`${currentValue * 100}%`, currentValue);
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

    if (!isNaN(key) || "+-*/().".includes(key)) {
        press(key);
    } else if (key === 'Enter') {
        e.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === '%') {
        e.preventDefault();
        calculatePercentage();
    }

    const map = {
        l: "log(",
        s: "sin(",
        c: "cos(",
        t: "tan(",
        r: "sqrt(",
        p: "π",
        e: "e",
        n: "ln(",
        x: "exp(",
        '^': '^',
        '(': '(',
        ')': ')'
    };

    if (e.ctrlKey || e.metaKey) return;

    if (map[key]) {
        e.preventDefault();
        press(map[key]);
    }
});
