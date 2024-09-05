import walletRepository from "../repositories/walletRepository.js";
import responseMessages from "../constants/responseMessages.js";

const getWalletTransactions = async (userId) => {
  try {
    const wallet = await walletRepository.findWalletByUserId(userId);

    if (!wallet) {
      return {
        status: "success",
        data: [],
        message: responseMessages.NO_TRANSACTIONS_FOUND,
      };
    }

    return {
      status: "success",
      data: wallet.transactions,
      message: responseMessages.WALLET_TRANSACTIONS_RETRIEVED,
    };
  } catch (error) {
    throw new Error(`Service error: ${error.message}`);
  }
};

const addCashToWallet = async (userId, amount) => {
  if (amount <= 0) {
    throw new Error(responseMessages.INVALID_AMOUNT);
  }

  let wallet = await walletRepository.findWalletByUserId(userId);

  if (!wallet) {
    wallet = await walletRepository.createWallet({
      user: userId,
      balance: 0,
      transactions: [],
    });
  }

  wallet.balance += amount;

  const newTransaction = {
    user: userId,
    amount,
    transactionType: "credit",
  };

  wallet.transactions.push(newTransaction);

  await walletRepository.saveWallet(wallet);

  return {
    status: "success",
    data: newTransaction,
    message: responseMessages.TRANSACTION_ADDED,
  };
};

const getWalletBalance = async (userId) => {
  const wallet = await walletRepository.findWalletByUserId(userId);
  return wallet ? wallet.balance : 0;
};

export default { getWalletTransactions, addCashToWallet, getWalletBalance };
