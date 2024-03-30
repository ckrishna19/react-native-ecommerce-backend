const stripe = require("stripe")(
  "sk_test_51NrEayKjXMZ1cUEfF2BkOML3YTEAhNAHwpeEwfL7gv2xJo6R2QeuOuJMzegan8RoLFUSOhPzuKoC2gQU3RS6z7Bh009ulfrEhT"
);

const Order = require("../model/orderModel");

const orderCtrl = {
  payment: async (req, res) => {
    const { amount } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents (e.g., $10.00)
        currency: "usd", // Currency code (e.g., USD)
        // Other options like description, metadata, etc.
      });

      return res
        .status(201)
        .json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error?.code ? error?.code : "internal server error" });
    }
  },
  createOrder: async (req, res) => {
    try {
      const newOrder = await Order.create({
        ...req.body,
        paid: true,
        orderBy: req.user,
      });

      return res.status(201).json({ message: "success", newOrder });
    } catch (error) {
      return res.status(500).json({ message: "internal Server Error" });
    }
  },

  getAllOrder: async (req, res) => {
    try {
      const allOrder = await Order.find({ orderBy: req.user });
      return res.status(201).json({ message: "order list", allOrder });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  },
};

module.exports = orderCtrl;
