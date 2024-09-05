import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Container, Row, Col, Card, Button, Collapse, Modal, Pagination,InputGroup,FormControl  } from 'react-bootstrap';
import { useGetHotelierBookingsQuery } from '../../slices/hotelierApiSlice';
import { useCancelBookingMutation } from '../../slices/usersApiSlice';
import Loader from '../../components/generalComponents/Loader';
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HotelierBookingsScreen = () => {
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const { data: bookings, isLoading, refetch } = useGetHotelierBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    document.title = "Bookings";
    refetch();
  }, [refetch]);

  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ bookingId: selectedBooking }).unwrap();
      setShowCancelModal(false);
      refetch();
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

  if (isLoading) return <Loader />;
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
    <HotelierLayout>
      <Container>
        <Row>
          <Col md={12}>
            <Card className="mt-3">
              <Card.Header>Bookings</Card.Header>
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
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Hotel</th>
                        <th>Room</th>
                        <th>Guest Name</th>
                        <th>Booking Date</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookings.map((booking) => (
                        <React.Fragment key={booking?._id}>
                          <tr>
                            <td>{booking?.hotelId?.name}</td>
                            <td>{booking?.roomId?.type}</td>
                            <td>{booking?.userId?.name}</td>
                            <td>{new Date(booking?.bookingDate).toLocaleDateString()}</td>
                            <td>{booking?.totalAmount}</td>
                            <td>
                          
                                  <Button variant="link" onClick={() => toggleRow(booking?._id)}>
                                    {expandedRow === booking?._id ? 'Hide Details' : 'View Details'}{' '}
                                    <FaChevronDown />
                                  </Button>
                                  </td>
                                  <td>
                                  {booking?.bookingStatus === 'confirmed' && !isPastCheckoutDate(booking?.checkOutDate) && (
                                    <Button
                                      variant="danger"
                                      onClick={() => {
                                        setSelectedBooking(booking?._id);
                                        setShowCancelModal(true);
                                      }}
                                      className="ms-2"
                                    >
                                      Cancel Booking
                                    </Button>
                                  )}
                                  {booking?.bookingStatus === 'cancelled' && (
                                    <div className="d-flex align-items-center text-danger">
                                      <FaTimes className="me-2" />
                                      Cancelled
                                    </div>
                                  )}
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
                                          <p><strong>Guest Name:</strong> {booking?.userId?.name}</p>
                                          <p><strong>Email:</strong> {booking?.userId?.email}</p>
                                          <p><strong>Payment Method:</strong> {booking?.paymentMethod}</p>
                                          <p><strong>Room Count:</strong> {booking?.roomsBooked}</p>
                                        <p><strong>Guest Count:</strong> {booking?.guestCount}</p>
                                          <p><strong>Check-In:</strong> {new Date(booking?.checkInDate).toLocaleDateString()}</p>
                                          <p><strong>Check-Out:</strong> {new Date(booking?.checkOutDate).toLocaleDateString()}</p>
                                        </Col>
                                      </Row>
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
                
                <Pagination className="my-3 d-flex justify-content-center">
                  {[...Array(Math.ceil(sortedBookings.length / bookingsPerPage)).keys()].map((x) => (
                    <Pagination.Item key={x + 1} active={x + 1 === currentPage} onClick={() => paginate(x + 1)}>
                      {x + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer />

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleCancelBooking}>Cancel Booking</Button>
        </Modal.Footer>
      </Modal>
    </HotelierLayout>
  );
};

export default HotelierBookingsScreen;
