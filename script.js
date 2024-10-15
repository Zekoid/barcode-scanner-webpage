// 50 blank user accounts with automatically assigned barcodes
const users = Array.from({ length: 50 }, (_, i) => ({
  name: `User ${i + 1}`,
  barcode: (100000000 + i).toString(), // Assign barcodes from 100000000 onwards
  status: "out",
  lastScanned: null // Stores the last scanned time/date
}));

let scannerActive = false;
let scanLogs = [];

// Initialize Quagga for the camera
function startScanner() {
  if (scannerActive) return; // Prevent starting multiple instances of the scanner

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner-container'),
      constraints: {
        facingMode: "environment" // Use back camera
      },
    },
    decoder: {
      readers: ["code_128_reader"] // Adjust this according to the barcode type
    }
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
    scannerActive = true;
  });

  // Handle the detected barcode
  Quagga.onDetected((data) => {
    const barcode = data.codeResult.code;
    document.getElementById('barcode-output').innerText = barcode;
    updateUserStatus(barcode);
  });
}

// Stop the Quagga scanner
function stopScanner() {
  if (!scannerActive) return; // Do nothing if the scanner isn't active
  Quagga.stop();
  scannerActive = false;
}

// Toggle the camera on/off
document.getElementById('toggle-scanner').addEventListener('click', function () {
  const scannerContainer = document.getElementById('scanner-container');
  if (scannerContainer.style.display === "none") {
    scannerContainer.style.display = "block";
    this.innerText = "Stop Camera";
    startScanner();
  } else {
    scannerContainer.style.display = "none";
    this.innerText = "Start Camera";
    stopScanner();
  }
});

// Update user status and timestamp based on scanned barcode
function updateUserStatus(barcode) {
  const user = users.find(u => u.barcode === barcode);
  const now = new Date().toLocaleString(); // Get current date/time
  if (user) {
    user.status = user.status === "out" ? "in" : "out"; // Toggle status
    user.lastScanned = now; // Update last scanned time
    scanLogs.push({ name: user.name, barcode: user.barcode, status: user.status, dateTime: now });
    alert(`${user.name} is now ${user.status} at ${now}`);
    displayUserStatuses(); // Refresh the user status display
    displayScanLogs(); // Refresh the scan logs
  } else {
    alert("User not found.");
  }
}

// Display user statuses and editable names below the camera
function displayUserStatuses() {
  const userStatusDiv = document.getElementById('user-status');
  userStatusDiv.innerHTML = ''; // Clear existing content
  users.forEach((user, index) => {
    const userDiv = document.createElement('div');
    userDiv.style.marginBottom = "10px";

    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.className = 'user-name-input';
    userNameInput.value = user.name;
    userNameInput.addEventListener('input', (e) => {
      users[index].name = e.target.value; // Update user name dynamically
    });

    const statusText = `Status: ${user.status}`;
    const lastScannedText = user.lastScanned ? ` | Last Scanned: ${user.lastScanned}` : '';

    const userStatusLabel = document.createElement('label');
    userStatusLabel.textContent = `${statusText}${lastScannedText}`; // Show status and time/date next to name

    userDiv.appendChild(userNameInput);
    userDiv.appendChild(userStatusLabel);
    userStatusDiv.appendChild(userDiv);
  });
}

// Display scan logs in Tab 3
function displayScanLogs() {
  const scanLogsBody = document.getElementById('scan-logs-body');
  scanLogsBody.innerHTML = ''; // Clear existing content

  scanLogs.forEach(log => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const barcodeCell = document.createElement('td');
    const statusCell = document.createElement('td');
    const dateTimeCell = document.createElement('td');

    nameCell.textContent = log.name;
    barcodeCell.textContent = log.barcode;
    statusCell.textContent = log.status;
    dateTimeCell.textContent = log.dateTime;

    row.appendChild(nameCell);
    row.appendChild(barcodeCell);
    row.appendChild(statusCell);
    row.appendChild(dateTimeCell);
    scanLogsBody.appendChild(row);
  });
}

// Generate barcodes for each user and display them
function generateBarcodes() {
  const barcodeGeneratorDiv = document.getElementById('barcode-generator');
  barcodeGeneratorDiv.innerHTML = ''; // Clear existing content

  users.forEach(user => {
    const barcodeDiv = document.createElement('div');
    barcodeDiv.className = 'barcode';

    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, user.barcode, { format: "CODE128" });

    const userLabel = document.createElement('div');
    userLabel.textContent = `${user.name} - Barcode: ${user.barcode}`;

    barcodeDiv.appendChild(barcodeCanvas);
    barcodeDiv.appendChild(userLabel);
    barcodeGeneratorDiv.appendChild(barcodeDiv);
  });
}

// Handle tab navigation
function showTab(tabIndex) {
  const tabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.display = 'none'; // Hide all tabs
  }
  document.getElementById(`tab-${tabIndex}`).style.display = 'block'; // Show selected tab
}

// Start the camera and generate barcodes on page load
window.onload = function () {
  generateBarcodes();
  displayUserStatuses();
  displayScanLogs();
};