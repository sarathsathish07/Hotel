import expressAsyncHandler from 'express-async-handler';
import walletService from '../services/walletService.js';



const getWalletTransactions = expressAsyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { data, message } = await walletService.getWalletTransactions(user._id);

    res.status(200).json({
      status: 'success',
      data: data,
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const addCashToWallet = expressAsyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const newTransaction = await walletService.addCashToWallet(req.user._id, Number(amount));

    res.status(201).json({
      status: 'success',
      data: newTransaction,
      message: 'Amount added to wallet successfully',
    });
  } catch (error) {
    res.status(error.message === 'Invalid amount' ? 400 : 500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



const getWalletBalance = expressAsyncHandler(async (req, res) => {
  try {
    const balance = await walletService.getWalletBalance(req.user._id);

    res.status(200).json({
      status: 'success',
      data: { balance },
      message: 'Wallet balance retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

export  {
  getWalletTransactions,
  addCashToWallet,
  getWalletBalance
}