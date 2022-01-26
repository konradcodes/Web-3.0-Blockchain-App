import React, { ReactChild, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

interface TransactionProviderProps {
  value: string;
}

interface FormData {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}

export const TransactionContext = React.createContext<{
  connectWallet: () => Promise<void>;
  currentAccount: string[];
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  sendTransaction: () => void;
}>({
  connectWallet: async () => {},
  currentAccount: [],
  formData: { addressTo: '', amount: '', keyword: '', message: '' },
  setFormData: () => {},
  handleChange: () => {},
  sendTransaction: () => {},
});

const { ethereum } = window;

const getEthereumContract = (): ethers.Contract => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider: React.FunctionComponent<TransactionProviderProps> = ({
  children,
  value,
}) => {
  const [currentAccount, setCurrentAccount] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState<string | null>(
    localStorage.getItem('transactionCount')
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        return alert('Please install MetaMask to continue');
      }
      const accounts = await ethereum?.request?.({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        //getAllTransaction()
      } else {
        console.log('No Accounts found');
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('No Ethereum object found');
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert('Please install MetaMask to continue');
      }

      const accounts = await ethereum?.request?.({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log('Error', error);
      throw new Error('No Ethereum object found');
    }
  };

  const sendTransaction = async () => {
    console.log('I am here');
    try {
      if (!ethereum) {
        return alert('Please install MetaMask to continue');
      }

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request?.({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208', // 21000 GWEI
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        amount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);

      await transactionHash.wait();

      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log('Error', error);
      throw new Error('No Ethereum object found');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
