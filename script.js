
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
            <h3>🅿️ ${slot.id}</h3>

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

        alert(
            "Parking slot " + id +
            " reserved successfully! Navigation started."
        );

        displaySlots();
    }
}

function findParking() {

    const firstAvailable = slots.find(slot => slot.available);

    if (firstAvailable) {

        alert(
            "Nearest available slot: " +
            firstAvailable.id
        );

    } else {

        alert("Sorry! No parking slots are available.");
    }
}

displaySlots();
