const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const UserHistory = require("../../models/UserHistory");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Get clientHost dynamically - works for both dev and prod
    const clientHost = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5174';

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${clientHost}/shop/paypal-return`,
        cancel_url: `${clientHost}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log("PayPal payment creation error:", error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log("Order creation error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while creating order",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    // Update product stock
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Update user purchase history for recommendation system
    try {
      const userId = order.userId;
      if (userId) {
        // Find or create user history
        let userHistory = await UserHistory.findOne({ userId });
        
        if (!userHistory) {
          userHistory = new UserHistory({
            userId,
            viewedProducts: [],
            purchasedProducts: [],
            searchQueries: [],
          });
        }
        
        // Update purchase history for each product
        for (let item of order.cartItems) {
          const productId = item.productId;
          const product = await Product.findById(productId);
          
          if (product) {
            // Update purchased products list
            const existingProductIndex = userHistory.purchasedProducts.findIndex(
              (p) => p.productId === productId
            );
            
            if (existingProductIndex !== -1) {
              // Product already in purchase history, update count and timestamp
              userHistory.purchasedProducts[existingProductIndex].purchaseCount += item.quantity;
              userHistory.purchasedProducts[existingProductIndex].lastPurchasedAt = new Date();
            } else {
              // Add new product to purchase history
              userHistory.purchasedProducts.push({
                productId,
                purchaseCount: item.quantity,
                lastPurchasedAt: new Date(),
              });
            }
            
            // Update category preferences (stronger weight for purchases)
            if (product.category) {
              const category = product.category.toLowerCase();
              if (userHistory.categoryPreferences[category] !== undefined) {
                // Give purchases 3x the weight of views
                userHistory.categoryPreferences[category] += (3 * item.quantity);
              }
            }
            
            // Update seasonal preferences (stronger weight for purchases)
            if (product.seasonal && product.seasonal !== 'all') {
              const season = product.seasonal.toLowerCase();
              if (userHistory.seasonalPreferences[season] !== undefined) {
                // Give purchases 3x the weight of views
                userHistory.seasonalPreferences[season] += (3 * item.quantity);
              }
            }
          }
        }
        
        // Save user history
        await userHistory.save();
        console.log("Updated purchase history for recommendations");
      }
    } catch (historyError) {
      // Don't fail the order if history update fails
      console.error("Error updating purchase history:", historyError);
    }

    // Delete the cart
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
