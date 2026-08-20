// bootsequence.js
document.addEventListener("DOMContentLoaded", () => {
    const bootScreen = document.getElementById("system-boot-screen");
    const textContainer = document.getElementById("boot-text-container");
    
    if (!bootScreen || !textContainer) return;

    // The sequence of lines to type
    const bootLines = [
        "> INITIALIZING BIOMETRIC SYSTEMS...",
        "> LOADING OPTICAL SENSORS...",
        "> CALIBRATING DERMAL SCANNERS...",
        "> SECURE CONNECTION ESTABLISHED.",
        "> SYSTEM READY."
    ];

    let currentLineIndex = 0;
    let currentCharIndex = 0;

    function typeLine() {
        if (currentLineIndex >= bootLines.length) {
            // Finished all lines, wait a moment then fade out
            setTimeout(() => {
                bootScreen.classList.add("fade-out");
                setTimeout(() => {
                    bootScreen.style.display = "none";
                }, 800);
            }, 600);
            return;
        }

        const lineToType = bootLines[currentLineIndex];
        
        if (currentCharIndex === 0) {
            const newLine = document.createElement("div");
            newLine.className = "boot-line";
            textContainer.appendChild(newLine);
        }

        const lines = textContainer.getElementsByClassName("boot-line");
        const currentLineElement = lines[lines.length - 1];

        currentLineElement.textContent += lineToType[currentCharIndex];
        currentCharIndex++;

        if (currentCharIndex < lineToType.length) {
            // Typing delay for next character (fast terminal speed)
            setTimeout(typeLine, Math.random() * 20 + 10);
        } else {
            // Finished line, move to next
            currentLineIndex++;
            currentCharIndex = 0;
            // Delay between lines
            setTimeout(typeLine, 400);
        }
    }

    // Start typing after a short initial delay
    setTimeout(typeLine, 500);
});
