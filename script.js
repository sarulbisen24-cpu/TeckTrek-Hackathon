const slots = [
    { id: "P1", available: true },
    { id: "P2", available: false },
    { id: "P3", available: true },
    { id: "P4", available: false },
    { id: "P5", available: true },
    { id: "P6", available: true },
    { id: "P7", available: false },
    { id: "P8", available: true }
];

function displaySlots() {

    const container = document.getElementById("slots");

    container.innerHTML = "";

    slots.forEach(slot => {

        const card = document.createElement("div");

        card.className = slot.available
            ? "slot available-slot"
            : "slot occupied-slot";

        card.innerHTML = `
            <div class="parking-icon">🚗</div>

            <h3>${slot.id}</h3>

            <p class="status ${slot.available ? "green" : "red"}">
                ${slot.available ? "● AVAILABLE" : "● OCCUPIED"}
            </p>

            <button
                ${slot.available ? "" : "disabled"}
                onclick="reserveSlot('${slot.id}')">

                ${slot.available ? "Reserve & Navigate" : "Occupied"}

            </button>
        `;

        container.appendChild(card);
    });

    updateNumbers();
}

function updateNumbers() {

    const available = slots.filter(slot => slot.available).length;
    const occupied = slots.length - available;

    document.getElementById("total").innerText = slots.length;
    document.getElementById("available").innerText = available;
    document.getElementById("occupied").innerText = occupied;
}

function reserveSlot(id) {
    const slot = slots.find(slot => slot.id === id);

    if (slot && slot.available) {
        slot.available = false;

        const oldPanel = document.getElementById("navigationPanel");
        if (oldPanel) oldPanel.remove();

        const panel = document.createElement("div");
        panel.id = "navigationPanel";

        panel.innerHTML = `
            <div style="
                position:fixed;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%);
                width:320px;
                padding:25px;
                background:#11152b;
                color:white;
                border-radius:18px;
                text-align:center;
                box-shadow:0 10px 40px rgba(0,0,0,0.5);
                z-index:9999;
                font-family:Arial;
            ">
                <h2>📍 Navigation Started</h2>

                <h3>Parking Slot ${id}</h3>

                <p>📏 Distance: 120 m</p>
                <p>⏱️ Estimated Time: 2 min</p>

                <p style="font-size:22px;">
                    🚗 → 🅿️
                </p>

                <p>Route to ${id} is active.</p>

                <button onclick="document.getElementById('navigationPanel').remove()"
                    style="
                    padding:10px 20px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                    font-weight:bold;
                    ">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        displaySlots();
    }
}
function findParking() {

    const firstAvailable = slots.find(slot => slot.available);

    if (firstAvailable) {

        alert(
            "🅿️ Nearest available slot: " +
            firstAvailable.id +
            "\n\n📍 You can reserve it now."
        );

    } else {

        alert("Sorry! No parking slots are available.");
    }
}

displaySlots();

