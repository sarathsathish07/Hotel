import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Table, Container, Row, Col, Card, Button, Collapse, Form, Modal, Pagination,InputGroup,FormControl } from "react-bootstrap";
import Rating from 'react-rating';
import { useGetBookingsQuery, useAddReviewMutation, useGetReviewsQuery, useCancelBookingMutation, useCreateChatRoomMutation } from "../../slices/usersApiSlice.js";
import Loader from "../../components/generalComponents/Loader.jsx";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import bgImage from "../../assets/images/bgimage.jpg";
import Footer from '../../components/userComponents/Footer';
import 'font-awesome/css/font-awesome.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookingsQuery();
  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useGetReviewsQuery();

  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [createChatRoom] = useCreateChatRoomMutation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRefundPolicyModal, setShowRefundPolicyModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    document.title = "Bookings - Celebrate Spaces";
    refetchBookings();
    refetchReviews();
  }, [refetchBookings, refetchReviews]);

  const getReviewForBooking = (bookingId) => {
    return reviews.find((review) => review.bookingId === bookingId);
  };

  const handleReviewSubmit = async (bookingId, hotelId) => {
    if (rating === 0 || review.trim() === '') {
      toast.error('Please provide a rating and a review.');
      return;
    }
    try {
      const result = await addReview({ rating, review, bookingId, hotelId }).unwrap();
      setRating(0);
      setReview('');
      refetchReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ bookingId: selectedBooking }).unwrap();
      setShowCancelModal(false);
      refetchBookings();
      toast.success('Booking successfully canceled!'); 
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking. Please try again.'); 
    }
  };

  const isPastCheckoutDate = (checkOutDate) => {
    const today = new Date();
    return new Date(checkOutDate) < today;
  };

  const handleChat = async (hotelId) => {
    try {
      const result = await createChatRoom({ hotelId }).unwrap();
      navigate(`/chat/${result._id}`);
    } catch (error) {
      console.error('Failed to create chat room:', error);
      toast.error('Failed to create chat room. Please try again.');
    }
  };

  if (bookingsLoading || reviewsLoading) return <Loader />;

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    return (
      booking?.hotelId?.name.toLowerCase().includes(query) ||
      booking?.roomId?.type.toLowerCase().includes(query) ||
      booking?.paymentMethod.toLowerCase().includes(query)
    );
  });
  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>My Bookings</h1>
        </div>
      </div>
      <Container className="profile-container">
        <Row>
          <Col md={3} className="sidebar-container">
            <Sidebar profileImage={userInfo?.profileImage} name={userInfo?.name} />
          </Col>
          <Col md={9}>
            <Card>
              <Card.Header>My Bookings</Card.Header>
              <InputGroup className="search-bar mx-2 my-3 w-50">
                    <FormControl
                      placeholder="Search by Hotel, Room, or Payment Method"
                      aria-label="Search"
                      aria-describedby="search-bookings"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
              <Card.Body>
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Room</th>
                      <th>Payment Method</th>
                      <th>Booking Date</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBookings.map((booking) => (
                      <React.Fragment key={booking?._id}>
                        <tr>
                          <td>{booking?.hotelId?.name}</td>
                          <td>{booking?.roomId?.type}</td>
                          <td>{booking?.paymentMethod}</td>
                          <td>{new Date(booking?.bookingDate).toLocaleDateString()}</td>
                          <td>Rs {booking?.totalAmount}</td>
                          <td>
                            <Button variant="link" onClick={() => toggleRow(booking?._id)}>
                              {expandedRow === booking?._id ? "Hide" : "View"} Details
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6">
                            <Collapse in={expandedRow === booking?._id}>
                              <div>
                                <Card className="mt-2">
                                  <Card.Body>
                                    <Row>
                                      <Col md={9}>
                                        <p><strong>Hotel:</strong> {booking?.hotelId?.name}</p>
                                        <p><strong>Room:</strong> {booking?.roomId?.type}</p>
                                        <p><strong>Check-in Date:</strong> {new Date(booking?.checkInDate).toLocaleDateString()}</p>
                                        <p><strong>Check-out Date:</strong> {new Date(booking?.checkOutDate).toLocaleDateString()}</p>
                                        <p><strong>Booking Date:</strong> {new Date(booking?.bookingDate).toLocaleDateString()}</p>
                                        <p><strong>Total Amount:</strong> Rs {booking?.totalAmount}</p>
                                        <p><strong>Payment Method:</strong> {booking?.paymentMethod}</p>
                                        <p><strong>Status:</strong> {booking?.bookingStatus}</p>
                                        {booking?.bookingStatus === 'cancelled' && booking?.cancelMessage && (
                                          <p><strong>Cancel Message:</strong> {booking?.cancelMessage}</p>
                                        )}
                                      </Col>
                                      <Col>
                                        {booking?.bookingStatus === 'confirmed' && !isPastCheckoutDate(booking?.checkOutDate) && (
                                          <Button
                                            variant="danger"
                                            onClick={() => {
                                              setSelectedBooking(booking?._id);
                                              setShowCancelModal(true);
                                            }}
                                            className="me-2"
                                          >
                                            Cancel Booking
                                          </Button>
                                        )}
                                          <Button
                                            variant="link"
                                            onClick={() => handleChat(booking?.hotelId?._id)}
                                          >
                                            <i className="fa fa-comments fa-3x"></i> 
                                          </Button>

                                      
                                      </Col>
                                    </Row>
                                    {getReviewForBooking(booking?._id) ? (
                                      <>
                                        <h5 className="mt-4">Review</h5>
                                        <p><strong>Rating:</strong> <Rating initialRating={getReviewForBooking(booking?._id).rating} readonly emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" /></p>
                                        <p><strong>Review:</strong> {getReviewForBooking(booking?._id).review}</p>
                                      </>
                                    ) : (
                                      <>
                                        {booking?.bookingStatus === 'confirmed' && isPastCheckoutDate(booking?.checkOutDate) && (
                                          <>
                                            <h5 className="mt-4">Add Review</h5>
                                            <Form>
                                              <Form.Group controlId="rating">
                                                <Form.Label style={{ marginRight: "10px" }}><strong>Rating</strong></Form.Label>
                                                <Rating
                                                  initialRating={rating}
                                                  emptySymbol="fa fa-star-o fa-2x"
                                                  fullSymbol="fa fa-star fa-2x"
                                                  onChange={(rate) => setRating(rate)}
                                                />
                                              </Form.Group>
                                              <Form.Group controlId="review" className="mt-2">
                                                <Form.Label><strong>Review</strong></Form.Label>
                                                <Form.Control
                                                  as="textarea"
                                                  rows={3}
                                                  value={review}
                                                  onChange={(e) => setReview(e.target.value)}
                                                />
                                              </Form.Group>
                                              <Button
                                                variant="primary"
                                                className="mt-2"
                                                onClick={() => handleReviewSubmit(booking?._id, booking?.hotelId?._id)}
                                                disabled={isAddingReview}
                                              >
                                                Submit Review
                                              </Button>
                                            </Form>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </Card.Body>
                                </Card>
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
                <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancellation</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>Are you sure you want to cancel this booking?</p>
                    <p>Please review the refund policy before proceeding.</p>
                    <Button variant="link" onClick={() => setShowRefundPolicyModal(true)}>View Refund Policy</Button>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
                    <Button variant="danger" onClick={handleCancelBooking}>Cancel Booking</Button>
                  </Modal.Footer>
                </Modal>
                <Modal show={showRefundPolicyModal} onHide={() => setShowRefundPolicyModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Refund Policy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>If you cancel your booking more than 48 hours before the check-in date, you will receive a full refund.</p>
                  <p> Cancellations made between 24 and 48 hours before the check-in date will receive a 50% refund.</p>
                  <p> Cancellations made within 24 hours of the check-in date are non-refundable.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowRefundPolicyModal(false)}>Close</Button>
                </Modal.Footer>
              </Modal>

                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(bookings.length / bookingsPerPage) }).map((_, index) => (
                      <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default BookingsScreen;
