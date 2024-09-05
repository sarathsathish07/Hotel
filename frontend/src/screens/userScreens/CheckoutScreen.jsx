import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetRoomByRoomIdQuery } from '../../slices/usersApiSlice.js';
import { useNavigate } from 'react-router-dom';
import { useSaveBookingMutation, useUpdateBookingStatusMutation } from '../../slices/usersApiSlice.js';
import Loader from '../../components/generalComponents/Loader.jsx';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, ListGroup, Button, Form } from 'react-bootstrap';
import Footer from '../../components/userComponents/Footer';
import { useGetWalletBalanceQuery } from '../../slices/usersApiSlice';

const CheckoutScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const hotelId = queryParams.get('hotelId');
  const roomId = queryParams.get('room'); 
  const checkInDate = new Date(queryParams.get('checkInDate'));
  const checkOutDate = new Date(queryParams.get('checkOutDate'));
  const roomCount = parseInt(queryParams.get('roomCount'), 10);
  const guestCount = parseInt(queryParams.get('guestCount'), 10);

  const { data: room, error, isLoading } = useGetRoomByRoomIdQuery(roomId);
  const { userInfo } = useSelector((state) => state.auth);
  const [saveBooking, { isLoading: isSaving }] = useSaveBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const { data: walletBalanceData } = useGetWalletBalanceQuery();
  const walletBalance = walletBalanceData?.balance || 0;
  useEffect(()=>{
    document.title = "Checkout - Celebrate Spaces";
  },[])

  if (isLoading) return <Loader />;
  if (error) {
    toast.error(error?.data?.message || 'Error fetching room details');
    return <div>Error fetching room details</div>;
  }

  const totalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalPrice = room?.price * roomCount * totalDays;

  const handlePayment = async () => {
    const bookingDetails = {
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      paymentMethod,
      paymentStatus: 'pending',
      hotelierId: room.hotelierId,
      roomsBooked: roomCount,
      totalAmount: totalPrice,
      guestCount
    };

    try {
      if (paymentMethod === 'wallet') {
        if (walletBalance < totalPrice) {
          toast.error('Insufficient wallet balance');
          return;
        }
        const bookingResponse = await saveBooking(bookingDetails).unwrap();
        toast.success('Booking Successful');
        navigate('/bookings');
      } else if (paymentMethod === 'razorpay') {
        const bookingResponse = await saveBooking(bookingDetails).unwrap();
        console.log('Booking Response:', bookingResponse);

        if (!bookingResponse || !bookingResponse?._id) {
          throw new Error('Invalid booking response or missing booking ID');
        }

        const options = {
          key: "rzp_test_PkGwc5wn6qCei0",
          amount: totalPrice * 100,
          currency: 'INR',
          name: 'Hotel Booking',
          description: 'Booking Transaction',
          handler: async (response) => {
            const { razorpay_payment_id: paymentId } = response;
            const paymentResult = {
              bookingId: bookingResponse._id,
              paymentId,
              paymentStatus: 'completed',
              hotelierId: bookingResponse.hotelierId
            };
            await updateBookingStatus(paymentResult).unwrap();
            toast.success('Payment Successful');
            navigate('/bookings');
          },
          prefill: {
            name: userInfo?.name,
            email: userInfo?.email,
          },
          theme: {
            color: '#F37254',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error('Booking Failed');
    }
  };

  return (
    <div>
      <Container style={{ height: '80vh' }}>
        <Row className="my-4">
          <Col md={8}>
            <Card>
              <Card.Header>User Details</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item><strong>Name:</strong> {userInfo?.name}</ListGroup.Item>
                  <ListGroup.Item><strong>Email:</strong> {userInfo?.email}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>Booked Room Details</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item><strong>Hotel Name:</strong> {room?.hotelId?.name}</ListGroup.Item>
                  <ListGroup.Item><strong>Room Type:</strong> {room?.type}</ListGroup.Item>
                  <ListGroup.Item><strong>Check-In Date:</strong> {checkInDate.toLocaleDateString()}</ListGroup.Item>
                  <ListGroup.Item><strong>Check-Out Date:</strong> {checkOutDate.toLocaleDateString()}</ListGroup.Item>
                  <ListGroup.Item><strong>Room Count:</strong> {roomCount}</ListGroup.Item>
                  <ListGroup.Item><strong>Guest Count:</strong> {guestCount}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>Price Details</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item><strong>Price per Night:</strong> Rs {room?.price}</ListGroup.Item>
                  <ListGroup.Item><strong>Total Nights:</strong> {totalDays}</ListGroup.Item>
                  <ListGroup.Item><strong>Total Price:</strong> Rs {totalPrice.toFixed(2)}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>Payment Method</Card.Header>
              <Card.Body>
                <Form>
                  <Form.Check 
                    type="radio" 
                    label="Wallet" 
                    name="paymentMethod" 
                    value="wallet" 
                    checked={paymentMethod === 'wallet'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                  />
                  <Form.Check 
                    type="radio" 
                    label="Razorpay" 
                    name="paymentMethod" 
                    value="razorpay" 
                    checked={paymentMethod === 'razorpay'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                  />
                </Form>
                <Button className="mt-3" onClick={handlePayment} disabled={isSaving}>Pay Now</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default CheckoutScreen;
