let historyStack = [];


// ============================================================
// PRECIOS — Única fuente de verdad
// Modificar aquí para actualizar toda la app automáticamente
// ============================================================
const PRICES = {
    delivery: 4000,
    sizes: [
        { id: "half", label: "½ kg", display: "½ kg", emoji: "🥄", price: 15000, maxFlavors: 3 },
        { id: "one",  label: "1 kg", display: "1 kg", emoji: "🍨", price: 24000, maxFlavors: 4 }
    ]
};

// Alias para compatibilidad interna
const deliveryPrice = PRICES.delivery;

document.addEventListener("DOMContentLoaded", () => {
    const bar = document.getElementById("progress-bar");
    if (bar) bar.style.display = "none";

    renderPriceBox();
    renderSizeCards();
});

function fmt(n) {
    return n.toLocaleString("es-AR");
}

function renderPriceBox() {
    const box = document.getElementById("price-box-list");
    if (!box) return;

    let html = "";
    PRICES.sizes.forEach((s, i) => {
        if (i > 0) html += `<div class="price-divider"></div>`;
        html += `
            <div class="price-row">
                <span class="price-label">${s.display}</span>
                <span class="price-value">$${fmt(s.price)}</span>
                <span class="price-note">hasta ${s.maxFlavors} sabores</span>
            </div>`;
    });
    html += `
        <div class="price-divider"></div>
        <div class="price-row">
            <span class="price-label">🛵 Delivery</span>
            <span class="price-value">$${fmt(PRICES.delivery)}</span>
            <span class="price-note">radio 5 km</span>
        </div>`;

    box.innerHTML = html;
}

function renderSizeCards() {
    const container = document.getElementById("size-cards-container");
    if (!container) return;

    container.innerHTML = PRICES.sizes.map(s => `
        <div class="card size-card" onclick="selectSize('${s.label}', ${s.price}, ${s.maxFlavors})">
            <div class="size-emoji">${s.emoji}</div>
            <h3>${s.display}</h3>
            <p class="size-price">$${fmt(s.price)}</p>
            <p class="size-flavors">Hasta ${s.maxFlavors} sabores</p>
        </div>`
    ).join("");
}

// ============================================================
// PROMOCIONES
// Tipos: 'percent' | 'fixed' | 'free_delivery'
// active: true/false para activar o desactivar sin borrar
// ============================================================
const promos = [
    {
        code: "CERROS10",
        active: false,
        type: "percent",
        value: 10,
        description: "10% de descuento en helado"
    },
    {
        code: "VERANO2025",
        active: false,
        type: "percent",
        value: 15,
        description: "15% de descuento en helado"
    },
    {
        code: "DESCUENTO5000",
        active: false,
        type: "fixed",
        value: 5000,
        description: "$5.000 de descuento"
    },
    {
        code: "DELIVERYFREE",
        active: false,
        type: "free_delivery",
        value: 0,
        description: "Delivery gratis"
    },
    {
        code: "PROMO2024",
        active: false,
        type: "percent",
        value: 20,
        description: "20% de descuento (inactiva)"
    }
];

function findPromo(code) {
    if (!code) return null;
    return promos.find(
        p => p.code === code.trim().toUpperCase() && p.active
    ) || null;
}

function calcDiscount(promo, helado) {
    if (!promo) return { discount: 0, deliveryFinal: PRICES.delivery };
    if (promo.type === "percent")
        return { discount: Math.round(helado * promo.value / 100), deliveryFinal: PRICES.delivery };
    if (promo.type === "fixed")
        return { discount: Math.min(promo.value, helado), deliveryFinal: PRICES.delivery };
    if (promo.type === "free_delivery")
        return { discount: PRICES.delivery, deliveryFinal: 0 };
    return { discount: 0, deliveryFinal: PRICES.delivery };
}

// Calcula el total final del pedido (helado + delivery - descuento)
function calcFinalTotal() {
    const { discount, deliveryFinal } = calcDiscount(order.promoApplied, order.totalPrice);
    return {
        helado:       order.totalPrice,
        delivery:     deliveryFinal,
        discount:     discount,
        total:        order.totalPrice + deliveryFinal - discount
    };
}

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
    orderNumber: null,
    promoCode: "",
    promoApplied: null,
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
    resetOrderState();
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
    const nameInput    = document.getElementById("name");
    const phoneInput   = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    const promoInput   = document.getElementById("promo-code");

    const nameError    = document.getElementById("name-error");
    const phoneError   = document.getElementById("phone-error");
    const addressError = document.getElementById("address-error");

    const nameValid    = nameInput.value.trim() !== "";
    const phoneValid   = phoneInput.value.trim() !== "";
    const addressValid = addressInput.value.trim() !== "";

    nameError.classList.toggle("hidden", nameValid);
    phoneError.classList.toggle("hidden", phoneValid);
    addressError.classList.toggle("hidden", addressValid);

    if (!(nameValid && phoneValid && addressValid)) return;

    // Validar código promo (opcional)
    const rawCode = promoInput ? promoInput.value.trim() : "";
    if (rawCode !== "") {
        const promo = findPromo(rawCode);
        if (!promo) {
            showPromoError(rawCode);
            return;
        }
        order.promoCode    = rawCode.toUpperCase();
        order.promoApplied = promo;
        showPromoFeedback(promo);
    } else {
        order.promoCode    = "";
        order.promoApplied = null;
    }

    order.name      = nameInput.value.trim();
    order.phone     = phoneInput.value.trim();
    order.address   = addressInput.value.trim();
    order.reference = document.getElementById("reference").value.trim();

    const { helado, delivery, discount, total } = calcFinalTotal();

    let itemsHTML = "";
    order.items.forEach(item => {
        itemsHTML += `
        <div class="summary-item">
            <p><strong>${item.size}</strong> — $${fmt(item.price)}</p>
            <p>${item.flavors.join(", ")}</p>
        </div>`;
    });

    let promoHTML = "";
    if (order.promoApplied) {
        const promoLine = order.promoApplied.type === "free_delivery"
            ? `🛵 Delivery: <span class="summary-free">GRATIS</span>`
            : `🏷️ Descuento (${order.promoCode}): -$${fmt(discount)}`;
        promoHTML = `<p class="summary-promo">${promoLine}</p>`;
    }

    const deliveryHTML = order.promoApplied?.type === "free_delivery"
        ? `<p>🛵 Delivery: <span class="summary-free">GRATIS</span></p>`
        : `<p>🛵 Delivery: $${fmt(delivery)}</p>`;

    document.getElementById("order-summary").innerHTML = `
        ${itemsHTML}
        <div class="summary-divider"></div>
        <p><strong>Dirección:</strong> ${order.address}${order.reference ? " · " + order.reference : ""}</p>
        <p>🍦 Helado: $${fmt(helado)}</p>
        ${deliveryHTML}
        ${promoHTML}
        <h3>Total: $${fmt(total)}</h3>
    `;

    show("screen-summary");
}

function showPromoError(code) {
    const el = document.getElementById("promo-error");
    if (el) {
        el.classList.remove("hidden");
        setTimeout(() => el.classList.add("hidden"), 4000);
    }
}

function showPromoFeedback(promo) {
    const el = document.getElementById("promo-ok");
    if (el) {
        el.innerText = `✓ ${promo.description}`;
        el.classList.remove("hidden");
    }
}

function confirmOrder() {

    const payment = document.querySelector("input[name='payment']:checked");

    if (!payment) {
        alert("Elegí forma de pago");
        return;
    }

    order.payment = payment.value;

    show("screen-processing");

    saveOrder()
        .then(() => {
            if (order.payment === "Transferencia") {
                const { total } = calcFinalTotal();
                document.getElementById("transfer-total").innerText = "$" + fmt(total);
                show("screen-transfer");
            } else {
                showOrderReady();
            }
        })
        .catch(error => {
            console.error("Error al guardar el pedido:", error);
            alert("Hubo un error al procesar tu pedido. Por favor intentá de nuevo.");
            show("screen-summary");
        });

}

function showOrderReady() {
    document.getElementById("order-number-display").innerText = order.orderNumber || "---";
    show("screen-order-ready");
}

function sendWhatsApp() {
    const { helado, delivery, discount, total } = calcFinalTotal();

    let itemsText = "";
    order.items.forEach(item => {
        itemsText += `${item.size} ($${fmt(item.price)})\n${item.flavors.join("\n")}\n\n`;
    });

    const orderNumberText = order.orderNumber ? `PEDIDO ${order.orderNumber}\n\n` : "";

    let promoText = "";
    if (order.promoApplied) {
        const promoLine = order.promoApplied.type === "free_delivery"
            ? `Delivery: GRATIS (${order.promoCode})`
            : `Descuento (${order.promoCode}): -$${fmt(discount)}`;
        promoText = `\n${promoLine}`;
    }

    const message = encodeURIComponent(
        `Hola!

${orderNumberText}Pedido:

${itemsText}Dirección:
${order.address}

Referencia:
${order.reference}

Helado: $${fmt(helado)}
Delivery: $${fmt(delivery)}${promoText}
Total: $${fmt(total)}

Pago: ${order.payment}`
    );

    window.open(
        "https://wa.me/5492944299457?text=" + message,
        "_blank"
    );
}

function resetOrderState() {
    order.items = [];
    order.size = null;
    order.price = 0;
    order.maxFlavors = 0;
    order.flavors = [];
    order.name = "";
    order.phone = "";
    order.address = "";
    order.reference = "";
    order.payment = null;
    order.orderNumber = null;
    order.promoCode = "";
    order.promoApplied = null;

    historyStack = [];

    const nameInput      = document.getElementById("name");
    const phoneInput     = document.getElementById("phone");
    const addressInput   = document.getElementById("address");
    const referenceInput = document.getElementById("reference");
    const promoInput     = document.getElementById("promo-code");
    const promoOk        = document.getElementById("promo-ok");
    const promoError     = document.getElementById("promo-error");

    if (nameInput)      nameInput.value = "";
    if (phoneInput)     phoneInput.value = "";
    if (addressInput)   addressInput.value = "";
    if (referenceInput) referenceInput.value = "";
    if (promoInput)     promoInput.value = "";
    if (promoOk)        promoOk.classList.add("hidden");
    if (promoError)     promoError.classList.add("hidden");

    const paymentInputs = document.querySelectorAll("input[name='payment']");
    paymentInputs.forEach(input => input.checked = false);
}

function goBack() {
    if (historyStack.length === 0) return;

    const previous = historyStack.pop();

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById(previous).classList.remove("hidden");
}

async function saveOrder() {

const { discount, total } = calcFinalTotal();
const timestamp = Date.now();

    const promises = order.items.map(async (item, index) => {
        const formData = new URLSearchParams();
        formData.append("pedidoId", timestamp);
        formData.append("itemIndex", index + 1);
        formData.append("name", order.name);
        formData.append("phone", order.phone);
        formData.append("address", order.address);
        formData.append("reference", order.reference);
        formData.append("size", item.size);
        formData.append("flavors", item.flavors.join(", "));
        formData.append("payment", order.payment);
        formData.append("promoCode", order.promoCode || "");
        formData.append("promoDesc", order.promoApplied ? order.promoApplied.description : "");
        formData.append("discount", discount);
        formData.append("total", total);
        formData.append("returnOrder", "1");

        try {
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbwN5GsLxk7vY4X6fLa5Lb832PF69hAJy8J2bpZjwwrLpVKXUPzms3kHSUsXWt1Bqo3C/exec",
                { method: "POST", body: formData }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.status === "ok" && result.orderNumber) {
                order.orderNumber = result.orderNumber;
            }
            return result;
        } catch (error) {
            console.error("Error en saveOrder:", error);
            throw error;
        }
    });

    await Promise.all(promises);

}

function copyAlias(event) {
    const alias = document.getElementById("transfer-alias").innerText;
    
    navigator.clipboard.writeText(alias).then(() => {
        const btn = event.target.closest(".btn-copy");
        if (btn) {
            btn.classList.add("copied");
            setTimeout(() => btn.classList.remove("copied"), 1000);
        }
    }).catch(err => {
        console.error("Error al copiar:", err);
        alert("No se pudo copiar. Copiá manualmente: " + alias);
    });
}