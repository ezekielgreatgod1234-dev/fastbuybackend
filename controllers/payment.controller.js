import { foodItems } from "../data/products.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import Payment from "../models/payment.model.js";
import { MongoTransactionError } from "mongodb";
import crypto from "crypto";

const initializePayment = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = foodItems.find((product) => {
      return product.id === Number(productId);
    });

    console.log(product, req.user.email);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",

      {
        email: req.user.email,
        amount: product.price * 100,
        callback_url: `${process.env.FRONTEND_URL}/verify/payment`,
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    await Payment.create({
      user: req.user.id,
      productId: product.id,

      productName: product.name,
      amount: product.price,
      reference: response.data.data.reference,
      status: "pending",
    });

    res.status(StatusCodes.CREATED).json({
      message: response.data.message,
      data: {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      },
      status: true,
    });

    console.log(response);

    console.log(product);
  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  
    console.log(req.params);
    const { reference } = req.params;
    try{

    

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        },
      },
    );

    if (response.data.data.status === "success") {
    await Payment.findOneAndUpdate(
      { reference }, 
      { status: "success" },

      {
        new: true,
        runValidators: true,
      },
    );

    res.status(StatusCodes.OK).json({
      message: "success",
      status: true,
      data: {
        reference: response.data.data.rference,
        status: response.data.data.status
      },
    });
  }


  else {
    await Payment.findOneAndUpdate(
      {reference },
      { status: "failed"},
    
    {
        new: true,
        runValidators: true,
      })
  }

    res.status(StatusCodes.OK).json({
      message: "false",
      status: true,
      data: {
        reference: response.data.data.rference,
        status: response.data.data.status
      },
    });
  
  } catch (error) {
    console.log(error.response);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "oops something went wrong",
      status: false,
    });
  }
};


const paymentWebhook = async (req, res) => {
  console.log(req.headers);
  try{
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET).update(req.rawBody).digest('hex');
    if (hash == req.headers['x-paystack-signature']){
      const {event} = req.body;
    }
  }catch {
    
  }
}
export { initializePayment, verifyPayment, paymentWebhook };
