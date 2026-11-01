
// Shopping Cart
let cart = [];

// Add product to cart
function addToCart(productName, price) {
    let existingProduct = cart.find(
        item => item.name === productName
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    displayCart();
    alert(productName + " added to cart!");
}

// Display cart items
function displayCart() {
    let cartItems = document.getElementById("cart-items");
    let totalElement = document.getElementById("total");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {
        let li = document.createElement("li");

        let itemTotal = item.price * item.quantity;

        li.textContent =
            item.name + " - ₹" + item.price +
            " x " + item.quantity +
            " = ₹" + itemTotal + " ";

        let removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.onclick = function () {
            removeFromCart(index);
        };

        li.appendChild(removeButton);
        cartItems.appendChild(li);

        total += itemTotal;
    });

    totalElement.textContent = total;
}

// Remove product from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

// Show checkout section
function showCheckout() {
    if (cart.length === 0) {
        alert("Please add products to your cart first!");
        return;
    }

    document.getElementById("checkout").scrollIntoView({
        behavior: "smooth"
    });
}

// Handle order form submission
document.getElementById("orderForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let name = document.getElementById("customerName").value;
    let mobile = document.getElementById("mobile").value;
    let address = document.getElementById("address").value;
    let date = document.getElementById("deliveryDate").value;
    let time = document.getElementById("deliveryTime").value;
    let payment = document.getElementById("payment").value;

    let totalAmount = 0;

    cart.forEach(function (item) {
        totalAmount += item.price * item.quantity;
    });

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerName: name,
                mobile: mobile,
                address: address,
                deliveryDate: date,
                deliveryTime: time,
                payment: payment,
                cart: cart,
                totalAmount: totalAmount
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Order failed");
        }

        document.getElementById("orderMessage").innerHTML = `
            <h3>Thank You, ${name}!</h3>
            <p>${result.message}</p>
            <p>Your Order ID: ${result.orderId}</p>
            <p>Total Amount: ₹${totalAmount}</p>
            <p>Payment: ${payment}</p>
        `;

        cart = [];
        displayCart();
        document.getElementById("orderForm").reset();

    } catch (error) {
        alert("Could not place order: " + error.message);
    }
});
