

document.getElementById('clearSnips').addEventListener('click', function() {
  localStorage.removeItem('snips2');
  const snipsContainer = document.getElementById('snipsContainer');
  snipsContainer.innerHTML = '';
  alert('All snips cleared!');
  console.log('Snips cleared from localStorage');
});

document.addEventListener('DOMContentLoaded', function() {
  const snipsContainer = document.getElementById('snipsContainer');
  const snips = JSON.parse(localStorage.getItem('snips2')) || [];
  console.log("length", snips.length);
  console.log("content", snips);

  snips.forEach((snip, index) => {
      const colDiv = document.createElement('div');
      colDiv.className = 'col-md-4 mb-4 ';

      const cardDiv = document.createElement('div');
      cardDiv.className = 'card p-3 bg-gray-400';

      const img = document.createElement('img');
      img.className = 'card-img-top';
      img.src = snip;

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body d-flex flex-row justify-evenly';

      // Button for copying the image to clipboard
      const copyButton = document.createElement('button');
      copyButton.className = 'btn btn-primary mr-2';
      copyButton.textContent = 'Copy Image';
      copyButton.addEventListener('click', function() {
          copyImageToClipboard(snip);
      });

      // Button for deleting the image from local storage
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn btn-danger mr-2';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function() {
          deleteImage(index);
      });

      // Placeholder button
      const copyInverted = document.createElement('button');
      copyInverted.className = 'btn btn-secondary';
      copyInverted.textContent = 'Copy Inverted';
      copyInverted.addEventListener('click', function() {
        console.log("hello buddy")
        copyInvertedImage(snip);
      });

      cardBody.appendChild(copyButton);
      cardBody.appendChild(deleteButton);
      cardBody.appendChild(copyInverted);

      cardDiv.appendChild(img);
      cardDiv.appendChild(cardBody);
      colDiv.appendChild(cardDiv);
      snipsContainer.appendChild(colDiv);
  });
});

function copyImageToClipboard(imageUrl) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl;
  img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function(blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(function() {
              alert('Image copied to clipboard!');
              console.log('Image copied to clipboard');
          }, function(error) {
              console.error('Error copying image: ', error);
          });
      });
  };
}

function deleteImage(index) {
  const snips = JSON.parse(localStorage.getItem('snips2')) || [];
  snips.splice(index, 1);
  localStorage.setItem('snips2', JSON.stringify(snips));
  console.log(`Image at index ${index} deleted`);
  location.reload();
}

// Function to copy inverted image to clipboard
function copyInvertedImage(imageUrl) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl;
  img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let j = 0; j < data.length; j += 4) {
          invertColors(data, j);
          increaseBrightness(data, j);
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(function(blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(function() {
              alert('Inverted image copied to clipboard!');
              console.log('Inverted image copied to clipboard');
          }, function(error) {
              console.error('Error copying inverted image: ', error);
          });
      });
  };
}

// Functions from script.js to invert colors and increase brightness
function invertColors(data, index) {
  data[index] = 255 - data[index];       // Red
  data[index + 1] = 255 - data[index + 1]; // Green
  data[index + 2] = 255 - data[index + 2]; // Blue
}

function increaseBrightness(data, index) {
  data[index] = Math.min(255, data[index] * 1.5);       // Red
  data[index + 1] = Math.min(255, data[index + 1] * 1.5); // Green
  data[index + 2] = Math.min(255, data[index + 2] * 1.5); // Blue
}