import expressAsyncHandler from "express-async-handler";
import walletService from "../services/walletService.js";
import responseMessages from "../constants/responseMessages.js";

const getWalletTransactions = expressAsyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { data, message } = await walletService.getWalletTransactions(
      user._id
    );

    res.status(200).json({
      status: "success",
      data: data,
      message: responseMessages.WALLET_TRANSACTIONS_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.WALLET_TRANSACTIONS_ERROR,
    });
  }
});

const addCashToWallet = expressAsyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const newTransaction = await walletService.addCashToWallet(
      req.user._id,
      Number(amount)
    );

    res.status(201).json({
      status: "success",
      data: newTransaction,
      message: responseMessages.CASH_ADDED_SUCCESS,
    });
  } catch (error) {
    res.status(error.message === "Invalid amount" ? 400 : 500).json({
      status: "error",
      data: null,
      message:
        error.message === "Invalid amount"
          ? responseMessages.INVALID_AMOUNT_ERROR
          : responseMessages.WALLET_TRANSACTIONS_ERROR,
    });
  }
});

const getWalletBalance = expressAsyncHandler(async (req, res) => {
  try {
    const balance = await walletService.getWalletBalance(req.user._id);

    res.status(200).json({
      status: "success",
      data: { balance },
      message: responseMessages.WALLET_BALANCE_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.WALLET_BALANCE_ERROR,
    });
  }
});

export { getWalletTransactions, addCashToWallet, getWalletBalance };
