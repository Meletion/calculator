Neutralino.init();
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});


output = document.getElementById("output");

function moveCursorToEnd() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(output);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function calculate(key) {
    switch (key) {
        case "C":
            // Clear the output
            output.textContent = "";
            break;
        case "=":
            try {
                // Strip any = signs before evaluating, in case of re-evaluation
                const expr = output.textContent.replace(/=/g, '').replace(/x/g, '*');
                output.textContent = math.evaluate(expr);
            } catch {
                output.textContent = "Error";
            }
            moveCursorToEnd();
            break;
        default:
            // Block double operators
            const operators = ['+', '-', '*', '/', '^', 'x'];
            const last = output.textContent.slice(-1);
            if (operators.includes(key) && operators.includes(last)) return;
            output.textContent += key;
            moveCursorToEnd();
    }
}

function onButtonPress(key) {
    calculate(key);
}

// Build allowed keys from whatever buttons exist in the UI
output.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        calculate('=');
        return;
    }
    if (e.key === 'x') {
        e.preventDefault();
        calculate('*');
        return;
    }

    // Allow control keys like backspace, arrows, delete
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (controlKeys.includes(e.key)) return;

    // Block ctrl combos like ctrl+a, ctrl+c etc
    if (e.ctrlKey) return;

    // Grab every button's value and build an allowed set
    const allowedKeys = new Set(
        [...document.querySelectorAll('#numbers button')]
            .map(btn => btn.value)
            .filter(v => v && v !== 'C' && v !== '=' && v !== 'sqrt') // these are handled separately or cant be typed
    );

    // If the key isn't in the allowed set, block it
    if (!allowedKeys.has(e.key)) {
        e.preventDefault();
    }
});
// Always keep focus on output so keyboard input always works
document.addEventListener('click', () => {
    output.focus();
    moveCursorToEnd();
});

// Focus on load so user can type immediately
window.addEventListener('load', () => {
    output.focus();
    moveCursorToEnd();
});

(async () => {
    // Show app version in the corner
    const conf = await Neutralino.app.getConfig();
    document.getElementById('version').innerText = conf.version;
})();

// Make it feel less like a browser and more like an actual app
// Block ctrl+plus, ctrl+minus, ctrl+0
document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) {
        e.preventDefault();
    }
});

// Block ctrl+scroll zoom
document.addEventListener('wheel', e => {
    if (e.ctrlKey) e.preventDefault();
}, { passive: false });

// Block right click context menu
document.addEventListener('contextmenu', e => e.preventDefault());