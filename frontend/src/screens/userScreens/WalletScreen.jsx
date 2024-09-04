import React, { useState, useEffect } from 'react';
import { useAddCashToWalletMutation, useGetWalletTransactionsQuery, useGetWalletBalanceQuery } from '../../slices/usersApiSlice';
import { Container, Nav, Row, Col, Card, ListGroup, Button, Form, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Footer from '../../components/userComponents/Footer';
import bgImage from "../../assets/images/bgimage.jpg";
import { useSelector } from "react-redux";
import Sidebar from "../../components/userComponents/Sidebar.jsx";

const WalletScreen = () => {
  const [amount, setAmount] = useState('');
  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError, refetch: refetchTransactions } = useGetWalletTransactionsQuery();
  const { data: balance = { balance: 0 }, isLoading: isLoadingBalance, error: balanceError, refetch: refetchBalance } = useGetWalletBalanceQuery();
  const [addCashToWallet, { isLoading: isAdding }] = useAddCashToWalletMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Wallet - Celebrate Spaces";
    refetchTransactions();
    refetchBalance();
  }, [transactions, balance]);

  const handleAddCash = async () => {
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const options = {
      key: "rzp_test_PkGwc5wn6qCei0", 
      amount: numericAmount * 100, 
      currency: "INR",
      name: "Your Company Name",
      description: "Wallet Recharge",
      handler: async (response) => {
        try {
          await addCashToWallet({ amount: numericAmount }).unwrap();
          refetchTransactions();
          refetchBalance();
          toast.success('Cash added successfully');
          setAmount('');
        } catch (error) {
          toast.error(error.data.message || 'Failed to add cash');
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com" 
      },
      theme: {
        color: "#F37254"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Wallet</h1>
        </div>
      </div>
      <Container className="profile-container">
        <Row className="my-4">
          <Col md={3} className="sidebar-container">
            <Sidebar profileImage={userInfo?.profileImage} name={userInfo?.name} />
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>Transaction History</Card.Header>
              <Card.Body>
                {isLoadingTransactions ? (
                 <div>Loading... </div> 
                ) : transactionsError ? (
                  <div>Error fetching transactions</div>
                ) : (
                  <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {sortedTransactions.map((transaction) => (
                      <ListGroup.Item key={transaction._id}>
                        <strong>{transaction.transactionType === 'credit' ? 'Added' : 'Deducted'}:</strong> Rs {transaction.amount} on {new Date(transaction.createdAt).toLocaleDateString()}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Header>Wallet Balance</Card.Header>
              <Card.Body>
                {isLoadingBalance ? (
                  <div>Loading... </div> 
                ) : balanceError ? (
                  <div>Error fetching balance</div>
                ) : (
                  <h3>Rs {balance?.balance}</h3>
                )}
              </Card.Body>
            </Card>
            <Card className="mt-4">
              <Card.Header>Add Cash to Wallet</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group controlId="amount">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </Form.Group>
                  <Button
                    className="mt-3"
                    onClick={handleAddCash}
                    disabled={isAdding}
                  >
                    {isAdding ? 'Adding...' : 'Add Cash'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default WalletScreen;
