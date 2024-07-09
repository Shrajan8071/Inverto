let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let snips = [];
let snips2 = [];
let isSnippingEnabled = false;

document.getElementById('pdf-upload').addEventListener('change', handlePdfUpload);
document.getElementById('prev-page').addEventListener('click', handlePrevPage);
document.getElementById('next-page').addEventListener('click', handleNextPage);
document.getElementById('start-stop-snipping').addEventListener('click', toggleSnipping);
document.getElementById('save-snips').addEventListener('click', saveSnipsToLocalStorage);
document.getElementById('create-pdf').addEventListener('click', createPdfFromSnips);

function handlePdfUpload(event) {
  const file = event.target.files[0];
  if (file.type !== 'application/pdf') {
    alert('Please upload a valid PDF file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const typedarray = new Uint8Array(e.target.result);
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      pdfDoc = pdf;
      console.log('PDF loaded');

      document.getElementById('prev-page').disabled = false;
      document.getElementById('next-page').disabled = false;
      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
}

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const scale = 1.5;
    const viewport = page.getViewport({ scale: scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    const pdfContainer = document.getElementById('pdf-container');
    pdfContainer.innerHTML = '';
    pdfContainer.appendChild(canvas);

    page.render(renderContext).promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    enableSnippingTool(canvas, page);
  });

  document.getElementById('page-num').textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function handlePrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

function handleNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

function toggleSnipping() {
  isSnippingEnabled = !isSnippingEnabled;
  document.getElementById('start-stop-snipping').textContent = isSnippingEnabled ? 'Stop Snipping' : 'Start Snipping';
}

function saveSnipsToLocalStorage() {
  snips2 = [];
  snips.forEach((snip, index) => {
    const originalCanvas = document.querySelector(`#pdf-container canvas`);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = snip.width;
    tempCanvas.height = snip.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(
      originalCanvas,
      snip.x, snip.y, snip.width, snip.height,
      0, 0, snip.width, snip.height
    );
    const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
    snips2.push(imgData)
    localStorage.setItem('snips2', JSON.stringify(snips2));
  });
}

function enableSnippingTool(canvas, page) {
  let startX, startY, width, height;
  let snipCanvas = null;
  let overlay = null;

  canvas.addEventListener('mousedown', function(e) {
    if (!isSnippingEnabled) return;
    startX = e.offsetX;
    startY = e.offsetY;
    width = 0;
    height = 0;
    snipCanvas = document.createElement('canvas');
    snipCanvas.width = canvas.width;
    snipCanvas.height = canvas.height;
    snipCanvas.style.position = 'absolute';
    snipCanvas.style.top = '0';
    snipCanvas.style.left = '0';
    snipCanvas.style.pointerEvents = 'none';
    canvas.parentElement.appendChild(snipCanvas);
    overlay = document.createElement('div');
    overlay.classList.add('canvas-overlay');
    canvas.parentElement.appendChild(overlay);
  });

  canvas.addEventListener('mousemove', function(e) {
    if (!isSnippingEnabled || !snipCanvas) return;
    width = e.offsetX - startX;
    height = e.offsetY - startY;
    drawSnipBox(startX, startY, width, height, snipCanvas);
  });

  canvas.addEventListener('mouseup', function(e) {
    if (!isSnippingEnabled || !snipCanvas) return;
    width = e.offsetX - startX;
    height = e.offsetY - startY;
    drawSnipBox(startX, startY, width, height, snipCanvas);
    const dataUrl = snipCanvas.toDataURL();
    const snip = {
      page: pageNum,
      x: startX,
      y: startY,
      width: width,
      height: height,
      dataUrl: dataUrl  
    };
    snips.push(snip);
    snipCanvas.remove();
    overlay.remove();
  });
}

function drawSnipBox(x, y, w, h, snipCanvas) {
  const ctx = snipCanvas.getContext('2d');
  ctx.clearRect(0, 0, snipCanvas.width, snipCanvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function createPdfFromSnips() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
    precision: 16
  });

  snips.forEach((snip, index) => {
    const originalCanvas = document.querySelector(`#pdf-container canvas`);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = snip.width;
    tempCanvas.height = snip.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(
      originalCanvas,
      snip.x, snip.y, snip.width, snip.height,
      0, 0, snip.width, snip.height
    );

    const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
    // snips2.push(imgData)
    localStorage.setItem('snips2', JSON.stringify(snips2));
    if (index > 0) {
      doc.addPage();
    }
    doc.addImage(imgData, 'JPEG', 10, 10, snip.width / 4, snip.height / 4);
  });
  doc.save('Inverto.pdf');
}


