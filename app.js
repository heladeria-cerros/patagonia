let historyStack = [];

document.addEventListener("DOMContentLoaded", () => {
    const bar = document.getElementById("progress-bar");
    if (bar) bar.style.display = "none";
});

const deliveryPrice = 4000;

const flavors = [
    "CHOCOLATE BLANCO C/FRAMBUESA",
    "TENEBROSO",
    "ANANA",
    "BANANA SPLIT",
    "COCO",
    "DULCE DE LECHE CROCANTE ",
    "FRUTILLA A LA CREMA",
    "FRUTOS DEL BOSQUE A LA CREMA",
    "MARACUYA",
    "MENTA GRANIZADA",
    "DOBLE DULCE DE LECHE",
    "LIMON",
    "SAMBAYON",
    "TIRAMISU",
];

const flavorMeta = {
    "TENEBROSO": { img: "assets/flavors/tenebroso.png", color: "#f4e3d8", tag: "⭐ Favorito" },
    "LIMON": { img: "assets/flavors/limon.png", color: "#fff8cc" },
    "FRUTILLA A LA CREMA": { img: "assets/flavors/frutilla.png", color: "#ffe3ea" },
    "MARACUYA": { img: "assets/flavors/maracuya.png", color: "#fff0d9" },
    "COCO": { img: "assets/flavors/coco.png", color: "#f7f7f7" },
    "MENTA GRANIZADA": { img: "assets/flavors/menta.png", color: "#e5fff2" },
    "ANANA": { img: "assets/flavors/anana.png", color: "#fff5d6" },
    "BANANA SPLIT": { img: "assets/flavors/banana.png", color: "#fff2cc" },
    "FRUTOS DEL BOSQUE A LA CREMA": { img: "assets/flavors/bosque.png", color: "#f4e6ff" },
    "DULCE DE LECHE CROCANTE ": { img: "assets/flavors/ddlcrocante.png", color: "#fff0e6", tag: "🔥 Popular" },
    "DOBLE DULCE DE LECHE": { img: "assets/flavors/ddle.png", color: "#fff0e6" },
    "SAMBAYON": { img: "assets/flavors/sambayon.png", color: "#fff7cc" },
    "TIRAMISU": { img: "assets/flavors/tiramisu.png", color: "#f4ebe6" },
    "CHOCOLATE BLANCO C/FRAMBUESA": { img: "assets/flavors/chocofram.png", color: "#ffe8ef" }
};

const order = {
    items: [],
    size: null,
    price: 0,
    maxFlavors: 0,
    flavors: [],
    name: "",
    phone: "",
    address: "",
    reference: "",
    payment: null,
    get totalPrice() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
};

const screenSteps = {
    "screen-welcome": 0,
    "screen-size": 1,
    "screen-flavors": 2,
    "screen-address": 3,
    "screen-summary": 4,
    "screen-transfer": 4
};

function updateProgressBar(screenId) {
    const activeStep = screenSteps[screenId] || 0;
    const steps = document.querySelectorAll(".progress-step");
    const lines = document.querySelectorAll(".progress-line");
    const bar = document.getElementById("progress-bar");

    if (!bar) return;

    bar.style.display = activeStep === 0 ? "none" : "flex";

    steps.forEach((step) => {
        const stepNum = parseInt(step.dataset.step, 10);
        step.classList.remove("active", "done");
        if (stepNum === activeStep) step.classList.add("active");
        else if (stepNum < activeStep) step.classList.add("done");
    });

    lines.forEach((line, i) => {
        line.classList.toggle("done", i + 1 < activeStep);
    });
}

function show(screen) {
    const current = document.querySelector(".screen:not(.hidden)");

    if (current) {
        historyStack.push(current.id);
    }

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById(screen).classList.remove("hidden");

    updateProgressBar(screen);

    const card = document.querySelector(".order-card");
    if (card && screen !== "screen-welcome" && screen !== "screen-size") {
        const cardTop = card.getBoundingClientRect().top + window.scrollY;
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        if (cardTop > viewportCenter || window.scrollY < cardTop - 20) {
            card.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    if (screen === "screen-address") {
        setupAddressValidation();
    }
}

function startOrder() {
    show("screen-size");
    document.querySelector(".order-shell").scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectSize(size, price, max) {
    order.size = size;
    order.price = price;
    order.maxFlavors = max;

    setupFlavors();
    show("screen-flavors");
}

function setupFlavors() {
    const list = document.getElementById("flavor-list");

    list.innerHTML = "";

    document.getElementById("flavor-limit").innerText =
        "Elegí entre 1 y " + order.maxFlavors + " sabores";

    order.flavors = [];

    document.getElementById("flavor-next").disabled = true;

    flavors.forEach(f => {

        const meta = flavorMeta[f] || {};

        const card = document.createElement("div");
        card.className = "card flavor-card";
        card.style.background = meta.color || "white";

        if (meta.img) {
            const img = document.createElement("img");
            img.src = meta.img;
            img.className = "flavor-img";
            card.appendChild(img);
        }

        if (meta.tag) {
            const tag = document.createElement("div");
            tag.className = "flavor-tag";
            tag.innerText = meta.tag;
            card.appendChild(tag);
        }

        const name = document.createElement("div");
        name.className = "flavor-name";
        name.innerText = f;

        card.appendChild(name);

        card.onclick = () => toggleFlavor(f, card);

        list.appendChild(card);
    });
}

function toggleFlavor(flavor, element) {
    if (order.flavors.includes(flavor)) {
        order.flavors = order.flavors.filter(f => f !== flavor);
        element.style.background = flavorMeta[flavor]?.color || "white";
        element.classList.remove("selected");
    } else {
        if (order.flavors.length >= order.maxFlavors) return;

        order.flavors.push(flavor);
        element.style.background = "#c8f7c5";
        element.classList.add("selected");
    }

    document.getElementById("flavor-next").disabled =
        order.flavors.length === 0;
}

function setupAddressValidation() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    const nextButton = document.getElementById("address-next");

    const nameError = document.getElementById("name-error");
    const phoneError = document.getElementById("phone-error");
    const addressError = document.getElementById("address-error");

    function validate(showErrors = false) {
        const nameValid = nameInput.value.trim() !== "";
        const phoneValid = phoneInput.value.trim() !== "";
        const addressValid = addressInput.value.trim() !== "";

        nextButton.disabled = !(nameValid && phoneValid && addressValid);

        if (showErrors) {
            nameError.classList.toggle("hidden", nameValid);
            phoneError.classList.toggle("hidden", phoneValid);
            addressError.classList.toggle("hidden", addressValid);
        } else {
            nameError.classList.add("hidden");
            phoneError.classList.add("hidden");
            addressError.classList.add("hidden");
        }
    }

    nameInput.oninput = () => validate(false);
    phoneInput.oninput = () => validate(false);
    addressInput.oninput = () => validate(false);

    nameInput.onblur = () => validate(true);
    phoneInput.onblur = () => validate(true);
    addressInput.onblur = () => validate(true);

    validate(false);
}

function goAddress() {
    saveCurrentPot();
    show("screen-address");
}

function saveCurrentPot() {
    if (order.size && order.flavors.length > 0) {
        const existingIndex = order.items.findIndex(
            item => item.size === order.size && 
                    JSON.stringify(item.flavors.sort()) === JSON.stringify([...order.flavors].sort())
        );
        
        if (existingIndex === -1) {
            order.items.push({
                size: order.size,
                price: order.price,
                flavors: [...order.flavors]
            });
        }
    }
}

function addAnotherPot() {
    if (order.flavors.length === 0) {
        alert("Primero elegí al menos un sabor para este pote");
        return;
    }
    
    saveCurrentPot();
    
    order.size = null;
    order.price = 0;
    order.maxFlavors = 0;
    order.flavors = [];
    
    show("screen-size");
}

function goSummary() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");

    const nameError = document.getElementById("name-error");
    const phoneError = document.getElementById("phone-error");
    const addressError = document.getElementById("address-error");

    const nameValid = nameInput.value.trim() !== "";
    const phoneValid = phoneInput.value.trim() !== "";
    const addressValid = addressInput.value.trim() !== "";

    nameError.classList.toggle("hidden", nameValid);
    phoneError.classList.toggle("hidden", phoneValid);
    addressError.classList.toggle("hidden", addressValid);

    if (!(nameValid && phoneValid && addressValid)) {
        return;
    }

    order.name = nameInput.value.trim();
    order.phone = phoneInput.value.trim();
    order.address = addressInput.value.trim();
    order.reference = document.getElementById("reference").value.trim();

    const total = order.totalPrice + deliveryPrice;
    const fmt = n => n.toLocaleString("es-AR");

    let itemsHTML = "";
    order.items.forEach((item, index) => {
        itemsHTML += `
        <div class="summary-item">
            <p><strong>${item.size}</strong></p>
            <p>${item.flavors.join(", ")}</p>
        </div>
        `;
    });

    document.getElementById("order-summary").innerHTML =
        `
        ${itemsHTML}
        <div class="summary-divider"></div>
        <p><strong>Dirección:</strong> ${order.address}${order.reference ? " · " + order.reference : ""}</p>
        <p>🍦 Helado: $${fmt(order.totalPrice)}</p>
        <p>🛵 Delivery: $${fmt(deliveryPrice)}</p>
        <h3>Total: $${fmt(total)}</h3>
        `;

    show("screen-summary");
}

function confirmOrder() {

    const payment = document.querySelector("input[name='payment']:checked");

    if (!payment) {
        alert("Elegí forma de pago");
        return;
    }

    order.payment = payment.value;

    saveOrder();

    if (order.payment === "Transferencia") {

        const total = order.totalPrice + deliveryPrice;

        const fmt = n => n.toLocaleString("es-AR");

        document.getElementById("transfer-total").innerText =
            "$" + fmt(total);

        show("screen-transfer");

    } else {

        sendWhatsApp();

    }

}

function sendWhatsApp() {
    const total = order.totalPrice + deliveryPrice;

    let itemsText = "";
    order.items.forEach((item, index) => {
        itemsText += `${item.size}\n${item.flavors.join("\n")}\n\n`;
    });

    const message = encodeURIComponent(
        `Hola!

Pedido:

${itemsText}Dirección:
${order.address}

Referencia:
${order.reference}

Total: $${total}

Pago: ${order.payment}`
    );

    window.open(
        "https://wa.me/5492944299457?text=" + message,
        "_blank"
    );
}

function goBack() {
    if (historyStack.length === 0) return;

    const previous = historyStack.pop();

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById(previous).classList.remove("hidden");
}

function saveOrder() {

    const total = order.totalPrice + deliveryPrice;
    const timestamp = Date.now();

    order.items.forEach((item, index) => {

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://script.google.com/macros/s/AKfycbwyg7ZGAbzYVKahX_EFR7fNY9IhE_c6k9wmi0pOChMe9YLaVo9FcRt5m4ctoyVpTaFRQQ/exec";

        const iframeName = "hiddenFrame_" + index;

        form.target = iframeName;

        function addField(name, value) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        addField("pedidoId", timestamp);
        addField("itemIndex", index + 1);

        addField("name", order.name);
        addField("phone", order.phone);
        addField("address", order.address);
        addField("reference", order.reference);

        addField("size", item.size);
        addField("flavors", item.flavors.join(", "));

        addField("payment", order.payment);
        addField("total", total);

        document.body.appendChild(form);

        const iframe = document.createElement("iframe");
        iframe.name = iframeName;
        iframe.style.display = "none";

        document.body.appendChild(iframe);

        form.submit();

    });

}