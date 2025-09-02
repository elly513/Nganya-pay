// System data
let systemData = {
    seats: Array(16).fill(null).map((_, i) => ({
        number: i + 1,
        status: 'available',
        transactionId: null
    })),
    transactions: [],
    fare: 50,
    conductors: [{ id: 'COND001', password: 'pass123', name: 'John Kamau' }],
    admins: [{ username: 'admin', password: 'admin123' }],
    matatuInfo: {
        plateNumber: 'KCA 123A',
        route: 'Nairobi CBD - Westlands'
    },
    selectedSeat: null
};

// Initialize app
function initializeApp() {
    generateSeatGrids();
    updateFareDisplays();
    showSelector();
}

// Navigation functions
function showSelector() {
    document.getElementById('app-selector').style.display = 'block';
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
}

function showApp(appType) {
    document.getElementById('app-selector').style.display = 'none';
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(appType + '-app').classList.add('active');
}

// Update fare displays
function updateFareDisplays() {
    ['display-fare', 'proceed-fare'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = systemData.fare;
    });
}

// QR Scanner Functions
function simulateQRScan() {
    const availableSeats = systemData.seats.filter(s => s.status === 'available');
    if (availableSeats.length === 0) {
        alert('No available seats!');
        return;
    }
    
    const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
    const qrData = `MTU-KCA123A-SEAT${randomSeat.number}`;
    
    setTimeout(() => handleQRScan(qrData), 1000);
}

function handleQRScan(qrData) {
    const parts = qrData.split('-');
    if (parts.length >= 3 && parts[0] === 'MTU') {
        const plateNumber = parts[1];
        const seatNumber = parseInt(parts[2].replace('SEAT', ''));
        
        const seat = systemData.seats.find(s => s.number === seatNumber);
        if (seat && seat.status === 'available') {
            seat.status = 'selected';
            systemData.selectedSeat = seatNumber;
            
            document.getElementById('qr-success').style.display = 'block';
            document.getElementById('scanned-route').textContent = systemData.matatuInfo.route;
            document.getElementById('scanned-matatu').textContent = plateNumber;
            document.getElementById('scanned-seat').textContent = seatNumber;
        } else {
            alert(`Seat ${seatNumber} is not available.`);
        }
    } else {
        alert('Invalid QR code.');
    }
}

// Passenger App Functions
function proceedToPayment() {
    document.getElementById('passenger-main').style.display = 'none';
    document.getElementById('payment-process').style.display = 'block';
    document.getElementById('payment-amount').textContent = systemData.fare;
    document.getElementById('payment-route').textContent = systemData.matatuInfo.route;
    document.getElementById('payment-seat').textContent = systemData.selectedSeat;
}

function cancelPayment() {
    const seat = systemData.seats.find(s => s.number === systemData.selectedSeat);
    if (seat) seat.status = 'available';
    
    document.getElementById('payment-process').style.display = 'none';
    document.getElementById('passenger-main').style.display = 'block';
    document.getElementById('qr-success').style.display = 'none';
    document.getElementById('mpesa-pin').value = '';
}

function processPayment() {
    const pin = document.getElementById('mpesa-pin').value;
    if (pin.length !== 4) {
        alert('Please enter a valid 4-digit PIN');
        return;
    }

    const btn = document.querySelector('#payment-process .btn.success');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        const transactionId = 'TXN' + Date.now();
        const seat = systemData.seats.find(s => s.number === systemData.selectedSeat);
        
        seat.status = 'paid';
        seat.transactionId = transactionId;

        systemData.transactions.push({
            id: transactionId,
            seatNumber: seat.number,
            amount: systemData.fare,
            timestamp: new Date(),
            status: 'paid'
        });

        document.getElementById('payment-process').style.display = 'none';
        document.getElementById('payment-success').style.display = 'block';
        document.getElementById('transaction-id').textContent = transactionId;
        document.getElementById('confirmed-seat').textContent = seat.number;
        document.getElementById('confirmed-amount').textContent = systemData.fare;

        generateSeatGrids();
        updateStats();
        
        btn.textContent = 'Confirm Payment';
        btn.disabled = false;
    }, 2000);
}

function resetPassengerApp() {
    document.getElementById('payment-success').style.display = 'none';
    document.getElementById('passenger-main').style.display = 'block';
    document.getElementById('qr-success').style.display = 'none';
    document.getElementById('mpesa-pin').value = '';
    systemData.selectedSeat = null;
}

// Generate seat grids
function generateSeatGrids() {
    const grid = document.getElementById('conductor-seat-grid');
    if (grid) {
        grid.innerHTML = '';
        systemData.seats.forEach(seat => {
            const seatEl = document.createElement('div');
            seatEl.className = `seat ${seat.status}`;
            seatEl.textContent = seat.number;
            grid.appendChild(seatEl);
        });
    }
}

// Conductor functions
function conductorLogin() {
    const id = document.getElementById('conductor-id').value;
    const password = document.getElementById('conductor-password').value;

    const conductor = systemData.conductors.find(c => c.id === id && c.password === password);
    if (conductor) {
        document.getElementById('conductor-login').style.display = 'none';
        document.getElementById('conductor-dashboard').style.display = 'block';
        updateStats();
        generateSeatGrids();
    } else {
        alert('Invalid credentials.');
    }
}

function conductorLogout() {
    document.getElementById('conductor-login').style.display = 'block';
    document.getElementById('conductor-dashboard').style.display = 'none';
}

function refreshPayments() {
    generateSeatGrids();
    updateStats();
    alert('Payment status refreshed!');
}

// Admin functions
function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    const admin = systemData.admins.find(a => a.username === username && a.password === password);
    if (admin) {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        updateStats();
        updateTransactionList();
    } else {
        alert('Invalid credentials.');
    }
}

function adminLogout() {
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function updateFare() {
    const newFare = parseInt(document.getElementById('fare-amount').value);
    if (newFare >= 10 && newFare <= 500) {
        systemData.fare = newFare;
        updateFareDisplays();
        alert(`Fare updated to KSh ${newFare}`);
    } else {
        alert('Fare must be between KSh 10 and KSh 500');
    }
}

// Update stats
function updateStats() {
    const paidSeats = systemData.seats.filter(s => s.status === 'paid').length;
    const totalRevenue = paidSeats * systemData.fare;

    const paidCountEl = document.getElementById('paid-count');
    const totalRevenueEl = document.getElementById('total-revenue');
    const totalTransactionsEl = document.getElementById('total-transactions');
    const dailyRevenueEl = document.getElementById('daily-revenue');

    if (paidCountEl) paidCountEl.textContent = paidSeats;
    if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue;
    if (totalTransactionsEl) totalTransactionsEl.textContent = systemData.transactions.length;
    if (dailyRevenueEl) dailyRevenueEl.textContent = totalRevenue;
}

function updateTransactionList() {
    const listEl = document.getElementById('transaction-list');
    if (!listEl) return;

    if (systemData.transactions.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No transactions yet</p>';
        return;
    }

    listEl.innerHTML = '';
    systemData.transactions.slice(-5).reverse().forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <strong>Seat ${transaction.seatNumber}</strong> - KSh ${transaction.amount}<br>
            <small>${transaction.timestamp.toLocaleTimeString()}</small>
        `;
        listEl.appendChild(item);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});