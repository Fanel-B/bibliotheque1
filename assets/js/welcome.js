document.addEventListener("DOMContentLoaded", () => {
    const text = "Votre bibliothèque intelligente à portée de main, où la technologie rencontre la lecture.";
    const container = document.getElementById("welcome-text");
    let index = 0;
  
    function writeText() {
      if (index < text.length) {
        container.textContent += text[index];
        index++;
        setTimeout(writeText, 50);
      }
    }
  
    writeText();
  });
  