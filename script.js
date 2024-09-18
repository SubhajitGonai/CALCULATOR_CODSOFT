let display = document.getElementById('display');
let voiceInputEnabled = false;
let recognition;
let welcomeTimer;

// Clear the welcome message and display content immediately on interaction
function clearWelcomeMessage() {
    if (display.textContent === '😊') {
        display.textContent = '';
    }
    clearTimeout(welcomeTimer); // Cancel the timer if still running
}

// Function to type out and style the welcome emoji
function typeWelcomeMessage() {
    const welcomeMessage = '😊';
    let i = 0;
    display.innerHTML = ''; // Start with an empty display

    // Center and enlarge the emoji with a smooth transition
    display.style.display = 'flex';
    display.style.justifyContent = 'center';
    display.style.alignItems = 'center';
    display.style.fontSize = '0'; // Start with the font size at 0 for a scaling effect

    function typeLetter() {
        if (i < welcomeMessage.length) {
            display.innerHTML += welcomeMessage.charAt(i);
            i++;
            setTimeout(typeLetter, 50); // Adjust typing speed for smoothness
        } else {
            display.style.transition = 'font-size 0.5s ease-in-out'; // Smooth transition for font size
            display.style.fontSize = '3em'; // Scale up the emoji smoothly
            welcomeTimer = setTimeout(() => {
                display.style.transition = 'font-size 0.5s ease-in-out';
                display.style.fontSize = '0'; // Scale down smoothly before clearing
                setTimeout(() => {
                    display.textContent = ''; // Clear after the scale down is complete
                    resetDisplayStyle(); // Reset display style after clearing
                }, 500); // Match the duration of the scaling down transition
            }, 1000);
        }
    }

    typeLetter();
}

// Reset the display style after the welcome message is cleared
function resetDisplayStyle() {
    display.style.display = ''; // Reset to default display
    display.style.justifyContent = ''; // Reset to default alignment
    display.style.alignItems = ''; // Reset to default alignment
    display.style.fontSize = ''; // Reset to default font size
    display.style.transition = ''; // Clear any transitions
}

// Event listeners for interaction clearing the welcome message
document.addEventListener('click', function(event) {
    const target = event.target;

    // Clear the welcome message if any button within the calculator is clicked
    if (target.tagName === 'BUTTON' || target.closest('button')) {
        clearWelcomeMessage();
    }
});

// Play sound on button click
document.addEventListener('click', function(event) {
    const target = event.target;

    // Play click sound if any button within the calculator is clicked
    if (target.tagName === 'BUTTON' || target.closest('button')) {
        clearWelcomeMessage();

        // Create a new Audio object and play the sound
        const clickSound = new Audio('click.wav');
        clickSound.play();
    }
});

// Play sound on key press
document.addEventListener('keydown', function(event) {
    // Define keys that should trigger the sound
    const validKeys = '0123456789+-*/.=()';

    if (validKeys.includes(event.key)) {
        // Create a new Audio object and play the sound
        const clickSound = new Audio('click.wav');
        clickSound.play();
    }
});



// Event listener for keyboard input
document.addEventListener('keydown', function(event) {
    clearWelcomeMessage(); // Clear the welcome message on any key press

    const key = event.key;

    if (!isNaN(key)) {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber('.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Backspace') {
        back();
    } else if ((event.shiftKey && key === '9') || key === '(') { // Handle "(" using "shift + 9"
        appendParenthesis('(');
    } else if ((event.shiftKey && key === '0') || key === ')') { // Handle ")" using "shift + 0"
        appendParenthesis(')');
    } else if (key === '%') {
        appendOperator('%');
    } else if (key.toLowerCase() === 'r') {
        sqrt();
    } else if (key === 'c' || key === 'C') {
        clearDisplay();
    }
});

// Trigger the emoji welcome message on page load
window.onload = function() {
    typeWelcomeMessage();
};

document.addEventListener('DOMContentLoaded', function() {
    const popupMessage = document.getElementById('popupMessage');
    const popupContent = popupMessage.querySelector('.popup-content h2');

    // Text for the typing effect
    const text = "Welcome to the Dynamic Calculator!";
    
    // Clear the content initially
    popupContent.textContent = '';
    popupContent.classList.add('typing-effect');

    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            popupContent.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100); // Adjust typing speed here
        } else {
            // Automatically hide the popup message 3 seconds after typing ends
            setTimeout(function() {
                popupMessage.classList.remove('show');
            }, 3000);
        }
    }

    // Show the popup message
    popupMessage.classList.add('show');
    
    // Start the typing animation
    setTimeout(typeWriter, 500); // Start typing after a slight delay
});

function toggleVoiceInput() {
    voiceInputEnabled = !voiceInputEnabled;
    const soundToggleButton = document.getElementById('toggleVoice');
    const voiceCommandBox = document.getElementById('voiceCommandBox');

    soundToggleButton.textContent = voiceInputEnabled ? '🔇' : '🔊';

    if (voiceInputEnabled) {
        soundToggleButton.classList.remove('voice-input-inactive');
        soundToggleButton.classList.add('voice-input-active');
        startVoiceRecognition();
        
        // Remove hide class and force reflow to apply transition
        voiceCommandBox.classList.remove('hide');
        void voiceCommandBox.offsetWidth; // Trigger reflow
        voiceCommandBox.classList.add('show');
    } else {
        soundToggleButton.classList.remove('voice-input-active');
        soundToggleButton.classList.add('voice-input-inactive');
        stopVoiceRecognition();
        
        // Remove show class and force reflow to apply transition
        voiceCommandBox.classList.remove('show');
        void voiceCommandBox.offsetWidth; // Trigger reflow
        voiceCommandBox.classList.add('hide');
    }
}

function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            showNotification('Voice input activated. Speak your commands.');
        };

        recognition.onresult = function(event) {
            let transcript = event.results[event.resultIndex][0].transcript;
            processVoiceCommand(transcript.trim());
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            toggleVoiceInput(); // Automatically disable voice input on error
        };

        recognition.onend = function() {
            // Automatically disable voice input if no more results
            if (voiceInputEnabled) {
                toggleVoiceInput(); // This will stop voice recognition and hide the command box
            }
        };

        recognition.start();
    } else {
        showNotification('Speech recognition is not supported in this browser.', true);
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
        recognition.onend = null; // Prevent it from restarting
        showNotification('Voice input deactivated.');
    }
}

function showNotification(message, isError = false) {
    // Your existing function to show notifications
}

function processVoiceCommand(command) {
    // Your existing function to process the voice command
}


function processVoiceCommand(command) {
    const commandMap = {
        'plus': '+',
        'add': '+',
        'positive': '+',
        'negative': '-',
        'minus': '-',
        'subtract': '-',
        'times': '*',
        'multiply': '*',
        'into': '*',
        'divide': '/',
        'divide by': '/',
        'divided by': '/',
        'equals': '=',
        'equal': '=',
        'clear': 'clear',
        'point': '.',
        'dot': '.',
        'root': 'sqrt',
        'rootobar': 'sqrt',
        'rootover': 'sqrt',
        'percent': '%',
        'back': 'back',
        'one': '1',
        'two': '2',
        'three': '3',
        'four': '4',
        'five': '5',
        'six': '6',
        'seven': '7',
        'eight': '8',
        'nine': '9',
        'zero': '0',
        'open bracket': '(',
        'close bracket': ')',
        'open': '(',
        'close': ')',
        'open first backet': '(',
        'close first backet': ')'
    };

    const commandParts = command.toLowerCase().trim().split(/\s+/);
    let processedCommand = '';
    let lastTokenWasOperator = false;

    for (let i = 0; i < commandParts.length; i++) {
        let part = commandParts[i].trim();

        // Handle special commands
        if (part === 'clear') {
            clearDisplay();
            processedCommand = '';
            lastTokenWasOperator = false;
            return;
        }

        if (part === 'sqrt') {
            sqrt();
            processedCommand = '';
            lastTokenWasOperator = false;
            return;
        }

        if (part === 'back') {
            back();
            processedCommand = '';
            lastTokenWasOperator = false;
            return;
        }

        if (part === '=' || part === 'equals' || part === 'equal') {
            calculate();
            return;
        }

        // Handle bracket commands
        if (commandMap[part] === '(' || commandMap[part] === ')') {
            if (lastTokenWasOperator && commandMap[part] === ')') {
                // Do not allow closing bracket if last token is an operator
                showNotification(`Unrecognized command: ${part}`, true);
                continue;
            }
            processedCommand += commandMap[part];
            lastTokenWasOperator = false;
            continue;
        }

        let commandType = commandMap[part] || getClosestCommand(part);

        if (commandType) {
            if (['+', '-', '*', '/'].includes(commandType)) {
                if (lastTokenWasOperator) continue;
                processedCommand += ` ${commandType} `;
                lastTokenWasOperator = true;
            } else {
                processedCommand += commandType;
                lastTokenWasOperator = false;
            }
        } else if (!isNaN(part)) {
            processedCommand += part;
            lastTokenWasOperator = false;
        } else {
            showNotification(`Unrecognized command: ${part}`, true);
        }
    }

    processedCommand = processedCommand.replace(/\s{2,}/g, ' ').trim();

    if (processedCommand) {
        display.textContent += processedCommand;
        adjustFontSize();
    }

    // Ensure 'equal' or 'equals' command triggers calculation
    if (command.toLowerCase().includes('equal') || command.toLowerCase().includes('equals')) {
        calculate();
    }

    function getClosestCommand(input) {
        let closestMatch = '';
        let highestSimilarity = 0;

        for (const key in commandMap) {
            let similarity = getSimilarity(input, key);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                closestMatch = commandMap[key];
            }
        }

        return highestSimilarity > 0.5 ? closestMatch : '';
    }

    function getSimilarity(a, b) {
        let longer = a.length > b.length ? a : b;
        let shorter = a.length > b.length ? b : a;

        let longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }

        let distance = editDistance(longer, shorter);
        return (longerLength - distance) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }
}


function calculate() {
    try {
        let content = display.textContent;
        console.log('Before processing:', content); // Debug line
        content = processImplicitMultiplication(content);  // Handle implicit multiplication
        content = processSquareRoots(content);
        content = convertPercentages(content);
        console.log('After processing:', content); // Debug line
        let result = evaluateExpression(content);
        console.log('Result:', result); // Debug line
        display.textContent = result;
    } catch (error) {
        console.error('Calculation error:', error); // Debug line
        display.textContent = 'Error';
    }
    adjustFontSize();
}

function appendNumberOrOperator(input) {
    if (!isNaN(input)) {
        appendNumber(input);
    } else {
        appendOperator(input);
    }
}

function appendNumber(number) {
    let currentNumber = display.textContent.split(/[\+\-\*\/\(\)\s]/).pop();
    
    // Limit number input to 15 digits
    if (currentNumber.length < 15 || number === '.') {
        if (number === '.' && currentNumber.includes('.')) return;  // Prevent multiple decimals in the same number
        display.textContent += number;
    }

    adjustFontSize();
}

function appendOperator(operator) {
    // Allow operators to be appended without restrictions on length, as we want unlimited operators
    if (!display.textContent.endsWith(' ')) {
        display.textContent += ` ${operator} `;
    }
    adjustFontSize();
}

function processImplicitMultiplication(expression) {
    // Replace patterns where a number is directly followed by a parenthesis
    return expression.replace(/(\d)\s*\(/g, '$1 * (').replace(/\)\s*(\d)/g, ')*$1');
}

function evaluateExpression(expression) {
    try {
        // Ensure that parentheses are properly balanced and safe to evaluate
        let balancedExpression = balanceParentheses(expression);
        return new Function('return ' + balancedExpression)();
    } catch (error) {
        console.error('Evaluation error:', error);
        return 'Error';
    }
}

function balanceParentheses(expression) {
    // Simple balancing of parentheses
    let openCount = 0;
    let result = '';
    for (let char of expression) {
        if (char === '(') {
            openCount++;
        } else if (char === ')') {
            if (openCount > 0) {
                openCount--;
            } else {
                // Extra closing parenthesis, handle as an error
                return 'Error';
            }
        }
        result += char;
    }
    // Add missing closing parentheses
    result += ')'.repeat(openCount);
    return result;
}

// Function to update the display with the clicked button value
function updateDisplay(value) {
    const display = document.getElementById('display'); // Adjust if you have a different ID for your display
    let currentText = display.textContent;

    if (value === '=') {
        try {
            display.textContent = eval(currentText); // Evaluate the expression
        } catch (e) {
            display.textContent = 'Error'; // Display error if evaluation fails
        }
    } else if (value === 'C') {
        clearDisplay(); // Clear the display
    } else if (value === 'Back') {
        backspace(); // Remove the last character
    } else {
        display.textContent += value; // Append the clicked value to the display
    }
    adjustFontSize(); // Adjust font size based on content
}

// Function to clear the display
function clearDisplay() {
    const display = document.getElementById('display'); // Adjust if you have a different ID for your display
    display.textContent = '';
    adjustFontSize(); // Adjust font size based on content
}

// Function to handle backspace operation
function backspace() {
    const display = document.getElementById('display'); // Adjust if you have a different ID for your display
    display.textContent = display.textContent.slice(0, -1); // Remove the last character
    adjustFontSize(); // Adjust font size based on content
}


function adjustFontSize() {
    let fontSize = 1.2;  // Starting font size in em
    let displayWidth = display.offsetWidth;
    let contentWidth = getTextWidth(display.textContent, fontSize);

    while (contentWidth > displayWidth && fontSize > 0.5) {
        fontSize -= 0.05;
        contentWidth = getTextWidth(display.textContent, fontSize);
    }

    // Adjust font size smoothly if content is too small
    while (contentWidth < displayWidth * 0.9 && fontSize < 2) {
        fontSize += 0.05;
        contentWidth = getTextWidth(display.textContent, fontSize);
    }

    display.style.fontSize = `${fontSize}em`;
}

function getTextWidth(text, fontSize) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = `${fontSize}em Arial`;
    return context.measureText(text).width;
}


function sqrt() {
    display.textContent += '√';
    adjustFontSize();
}

function back() {
    display.textContent = display.textContent.slice(0, -1).trim();
    adjustFontSize();
}

function convertPercentages(content) {
    return content.replace(/(\d+(\.\d+)?)\s*%/g, (match, number) => {
        return parseFloat(number) / 100;
    });
}

function processSquareRoots(content) {
    return content.replace(/√(\d+(\.\d+)?)/g, (match, number) => {
        return `Math.sqrt(${number})`;
    });
}

