// This is code for opening tabs in vertical mode//
function openTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

// ---- code for copied image inversion --- // 

// Add an event listener for paste events
document.addEventListener('paste', async (event) => {
    const clipboardItems = event.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
        if (clipboardItems[i].type.indexOf('image') !== -1) {
            const blob = clipboardItems[i].getAsFile();
            handleImagePaste(blob);
        }
    }
});

// Handle the pasted image blob
async function handleImagePaste(blob) {
    const img = await loadImage(blob);
    const canvas = document.getElementById('canvas');
    drawImageOnCanvas(img, canvas);
    processImage(canvas);
}

// Load the image from the blob and return a promise
function loadImage(blob) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = () => resolve(img);
    });
}

// Draw the image on the canvas
function drawImageOnCanvas(img, canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
}

// Process the image: invert colors and increase brightness
function processImage(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; 

    for (let j = 0; j < data.length; j += 4) {
        invertColors(data, j);
        increaseBrightness(data, j);
    }

    ctx.putImageData(imageData, 0, 0);
    copyImageToClipboard(canvas);
}

// Invert the colors of the image
function invertColors(data, index) {
    data[index] = 255 - data[index];       // Red
    data[index + 1] = 255 - data[index + 1]; // Green
    data[index + 2] = 255 - data[index + 2]; // Blue
}

// Increase the brightness of the image
function increaseBrightness(data, index) {
    data[index] = Math.min(255, data[index] * 1.5);       // Red
    data[index + 1] = Math.min(255, data[index + 1] * 1.5); // Green
    data[index + 2] = Math.min(255, data[index + 2] * 1.5); // Blue
}

// Copy the processed image to the clipboard
function copyImageToClipboard(canvas) {
    canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
            showStatusMessage('Inverted and brightened image copied to clipboard!');
        }).catch((err) => {
            console.error('Could not copy image: ', err);
        });
    });
}

// Show a status message to the user
function showStatusMessage(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.style.visibility = 'visible';
    setTimeout(() => {
        statusElement.style.visibility = 'hidden';
    }, 7000);
}

document.getElementById('openNextTab').addEventListener('click', function(){
    window.open('snips.html', '_blank');
});

