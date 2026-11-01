
const express = require("express");
const cors = require("cors");
const db = require("./database");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "../frontend")));
// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Sweet Cravings Bakery Backend!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend is working successfully!",
        project: "Online Bakery Ordering System"
    });
});
app.post("/api/orders", (req, res) => {
    const {
        customerName,
        mobile,
        address,
        deliveryDate,
        deliveryTime,
        payment,
        cart,
        totalAmount
    } = req.body;

    const customerSql = `
        INSERT INTO customers (customer_name, mobile, address)
        VALUES (?, ?, ?)
    `;

    db.query(customerSql, [customerName, mobile, address], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Customer save failed" });
        }

        const customerId = result.insertId;

        const orderSql = `
            INSERT INTO orders
            (customer_id, delivery_date, delivery_time, payment_method, total_amount)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(orderSql,
            [customerId, deliveryDate, deliveryTime, payment, totalAmount],
            (err, orderResult) => {
                if (err) {
                    return res.status(500).json({ message: "Order save failed" });
                }

                const orderId = orderResult.insertId;

                const itemSql = `
                    INSERT INTO order_items (order_id, product_name, quantity, price)
                    VALUES ?
                `;

                const itemValues = cart.map(item => [
                    orderId, item.name, item.quantity, item.price
                ]);

                db.query(itemSql, [itemValues], (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Order items save failed" });
                    }

                    res.json({
                        message: "Order placed successfully!",
                        orderId: orderId
                    });
                });
            }
        );
    });
});

// Get all customer orders for Admin Dashboard

app.get("/api/admin/orders", (req, res) => {

    const sql = `
        SELECT
            o.order_id,
            c.customer_name,
            c.mobile,
            c.address,
            o.delivery_date,
            o.delivery_time,
            o.payment_method,
            o.total_amount,
            o.order_status,
            oi.product_name,
            oi.quantity,
            oi.price
        FROM orders o
        JOIN customers c
            ON o.customer_id = c.customer_id
        LEFT JOIN order_items oi
            ON o.order_id = oi.order_id
        ORDER BY o.order_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Error fetching orders:", err);

            return res.status(500).json({
                message: "Unable to fetch orders"
            });
        }

        const orders = {};

        results.forEach(row => {

            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    order_id: row.order_id,
                    customer_name: row.customer_name,
                    mobile: row.mobile,
                    address: row.address,
                    delivery_date: row.delivery_date,
                    delivery_time: row.delivery_time,
                    payment_method: row.payment_method,
                    total_amount: row.total_amount,
                    order_status: row.order_status,
                    items: []
                };
            }

            if (row.product_name) {
                orders[row.order_id].items.push({
                    product_name: row.product_name,
                    quantity: row.quantity,
                    price: row.price
                });
            }

        });

        res.json(Object.values(orders));
    });

});


// Update order status
app.put("/api/admin/orders/:id/status", (req, res) => {

    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Preparing", "Delivered"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const sql = `
        UPDATE orders
        SET order_status = ?
        WHERE order_id = ?
    `;

    db.query(sql, [status, orderId], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to update order status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order status updated successfully!"
        });
    });

});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
