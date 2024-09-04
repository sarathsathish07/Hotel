import Wallet from "../models/walletModel.js";

const findWalletByUserId = async (userId) => {
  try {
    return await Wallet.findOne({ user: userId }).exec();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const createWallet = async (walletData) => {
  try {
    const wallet = new Wallet(walletData);
    return await wallet.save();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const saveWallet = async (wallet) => {
  try {
    return await wallet.save();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export default { findWalletByUserId, createWallet, saveWallet };
