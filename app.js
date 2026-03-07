let historyStack = [];

const deliveryPrice = 4000;

const flavors = [
    "Chocolate Tenebroso",
    "Dulce de leche crocante",
    "Sambayón",
    "Frutos del bosque",
    "Torta de queso",
    "Quarkmix",
    "Naranja al agua"
];

const order = {
    size: null,
    price: 0,
    maxFlavors: 0,

    flavors: [],

    name: "",
    phone: "",
    address: "",
    reference: "",

    payment: null
};

function show(screen) {
    const current = document.querySelector(".screen:not(.hidden)");

    if (current) {
        historyStack.push(current.id);
    }

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById(screen).classList.remove("hidden");

    if (screen === "screen-address") {
        setupAddressValidation();
    }
}

function startOrder() {
    show("screen-size");
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
        const div = document.createElement("div");
        div.className = "card";
        div.innerText = f;
        div.onclick = () => toggleFlavor(f, div);
        list.appendChild(div);
    });
}

function toggleFlavor(flavor, element) {
    if (order.flavors.includes(flavor)) {
        order.flavors = order.flavors.filter(f => f !== flavor);
        element.style.background = "white";
    } else {
        if (order.flavors.length >= order.maxFlavors) return;

        order.flavors.push(flavor);
        element.style.background = "#c8f7c5";
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
    show("screen-address");
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

    const total = order.price + deliveryPrice;

    document.getElementById("order-summary").innerHTML =
        `
        <p>${order.size}</p>
        <p>Sabores:</p>
        <p>${order.flavors.join(", ")}</p>
        <p>Helado: $${order.price}</p>
        <p>Delivery: $${deliveryPrice}</p>
        <h3>Total: $${total}</h3>
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

        const total = order.price + deliveryPrice;

        document.getElementById("transfer-total").innerText =
            "Total a transferir: $" + total;

        show("screen-transfer");

    } else {

        sendWhatsApp();

    }

}
function sendWhatsApp() {
    const total = order.price + deliveryPrice;

    const message = encodeURIComponent(
        `Hola!

Pedido:

${order.size}

Sabores:
${order.flavors.join("\n")}

Dirección:
${order.address}

Referencia:
${order.reference}

Total: $${total}

Pago: ${order.payment}`
    );

    window.open(
        "https://wa.me/5492944164000?text=" + message,
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

    const total = order.price + deliveryPrice;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://script.google.com/macros/s/AKfycbyOGBD7nvLo4hReGvd5sHc0naIfP8BkK-DEUcO1h1fRNhLgDktnSbBzDBCiy03n6GAoqA/exec";
    form.target = "hiddenFrame";

    function addField(name, value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    addField("name", order.name);
    addField("phone", order.phone);
    addField("address", order.address);
    addField("reference", order.reference);
    addField("size", order.size);
    addField("flavors", order.flavors.join(", "));
    addField("payment", order.payment);
    addField("total", total);

    document.body.appendChild(form);

    let iframe = document.getElementById("hiddenFrame");

    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "hiddenFrame";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    }

    form.submit();

}