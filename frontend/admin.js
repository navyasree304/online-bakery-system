
// Admin Login
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Demo login credentials
    if (username === "admin" && password === "admin123") {

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        loadOrders();

    } else {
        document.getElementById("loginMessage").textContent =
            "Invalid username or password!";
    }
});

// Load customer orders

async function loadOrders() {
    try {
        const response = await fetch("/api/admin/orders");

        if (!response.ok) {
            throw new Error("Unable to fetch orders");
        }

        const orders = await response.json();

        let container = document.getElementById("ordersContainer");
        container.innerHTML = "";

        if (orders.length === 0) {
            container.textContent = "No orders found.";
            return;
        }

        container.innerHTML = `<h3>Total Orders: ${orders.length}</h3>`;

        orders.forEach(order => {

            let orderCard = document.createElement("div");

            orderCard.style.border = "1px solid #ccc";
            orderCard.style.padding = "20px";
            orderCard.style.margin = "15px 0";
            orderCard.style.borderRadius = "10px";
            orderCard.style.backgroundColor = "#fffafa";

            let heading = document.createElement("h3");
            heading.textContent = "Order ID: " + order.order_id;
            orderCard.appendChild(heading);

            function addDetail(label, value) {
                let p = document.createElement("p");
                p.textContent = label + ": " + (value ?? "Not available");
                orderCard.appendChild(p);
            }

            addDetail("Customer", order.customer_name);
            addDetail("Mobile", order.mobile);
            addDetail("Address", order.address);

            // Display ordered products
            let productHeading = document.createElement("h4");
            productHeading.textContent = "Ordered Products:";
            orderCard.appendChild(productHeading);

            let productList = document.createElement("ul");

            order.items.forEach(item => {
                let li = document.createElement("li");

                li.textContent =
                    item.product_name +
                    " | Quantity: " + item.quantity +
                    " | Price: ₹" + item.price;

                productList.appendChild(li);
            });

            orderCard.appendChild(productList);

            addDetail("Delivery Date", order.delivery_date);
            addDetail("Delivery Time", order.delivery_time);
            addDetail("Payment Method", order.payment_method);
            addDetail("Total Amount", "₹" + order.total_amount);
            
// Order status section
let statusLabel = document.createElement("p");
statusLabel.textContent = "Order Status: ";
orderCard.appendChild(statusLabel);

let statusSelect = document.createElement("select");

["Pending", "Preparing", "Delivered"].forEach(status => {
    let option = document.createElement("option");
    option.value = status;
    option.textContent = status;

    if (status === order.order_status) {
        option.selected = true;
    }

    statusSelect.appendChild(option);
});

orderCard.appendChild(statusSelect);

// Update button
let updateButton = document.createElement("button");
updateButton.textContent = "Update Status";

updateButton.onclick = async function () {
    try {
        const response = await fetch(
            `/api/admin/orders/${order.order_id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: statusSelect.value
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);
        loadOrders();

    } catch (error) {
        alert("Status update failed: " + error.message);
    }
};

orderCard.appendChild(updateButton);


            container.appendChild(orderCard);
        });

    } catch (error) {
        document.getElementById("ordersContainer").textContent =
            "Unable to load orders: " + error.message;
    }
}


// Admin Logout
function logout() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("loginForm").reset();
}
