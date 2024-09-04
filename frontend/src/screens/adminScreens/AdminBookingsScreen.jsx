import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Container, Row, Col, Card, Button, Collapse, Form as BootstrapForm, Pagination } from 'react-bootstrap';
import { useGetAllBookingsQuery } from '../../slices/adminApiSlice';
import Loader from '../../components/generalComponents/Loader';
import AdminLayout from '../../components/adminComponents/AdminLayout';
import { FaChevronDown } from 'react-icons/fa';

const AdminBookingsScreen = () => {
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const { data: bookings, isLoading, refetch } = useGetAllBookingsQuery();
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    document.title = "Admin Bookings";
    refetch();
  }, [refetch]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); 
  };

  const filteredBookings = bookings?.filter(
    (booking) =>
      booking.hotelId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.roomId.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userId.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings?.slice(indexOfFirstBooking, indexOfLastBooking);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) return <Loader />;


  return (
    <AdminLayout>
      <Container fluid>
        <Row>
          <Col>
            <Card className="mt-3">
              <Card.Header>Bookings</Card.Header>
              <Card.Body>
                <div className="containerS">
                  <BootstrapForm>
                    <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
                      <BootstrapForm.Label>Search bookings:</BootstrapForm.Label>
                      <BootstrapForm.Control
                        style={{ width: "500px" }}
                        value={searchQuery}
                        type="text"
                        placeholder="Enter Hotel, Room, or Guest Name..."
                        onChange={handleSearch}
                      />
                    </BootstrapForm.Group>
                  </BootstrapForm>
                </div>
                <br />
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
                      {currentBookings?.map((booking) => (
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
                          </tr>
                          <tr>
                            <td colSpan="8">
                              <Collapse in={expandedRow === booking?._id}>
                                <div>
                                  <Card className="mt-2">
                                    <Card.Body>
                                      <p><strong>Guest Name:</strong> {booking?.userId?.name}</p>
                                      <p><strong>Email:</strong> {booking?.userId?.email}</p>
                                      <p><strong>Payment Method:</strong> {booking?.paymentMethod}</p>
                                      <p><strong>Check-In:</strong> {new Date(booking?.checkInDate).toLocaleDateString()}</p>
                                      <p><strong>Check-Out:</strong> {new Date(booking?.checkOutDate).toLocaleDateString()}</p>
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
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                      {Array.from({ length: Math.ceil(filteredBookings.length / bookingsPerPage) }).map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                    </Pagination>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default AdminBookingsScreen;
