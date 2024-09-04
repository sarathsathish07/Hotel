import React, { useState } from 'react';
import { Table, Container, Row, Col, Card, Button, Form as BootstrapForm, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { useAdminListHotelMutation, useAdminUnlistHotelMutation } from '../../slices/adminApiSlice';
import './userTable.css';

export const HotelsTable = ({ hotels, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelsPerPage] = useState(5);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);

  const [listHotel] = useAdminListHotelMutation();
  const [unlistHotel] = useAdminUnlistHotelMutation();

  const handleList = async (hotel) => {
    try {
      await listHotel({ hotelId: hotel._id }).unwrap();
      toast.success('Hotel listed successfully');
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const handleUnlist = async (hotel) => {
    try {
      await unlistHotel({ hotelId: hotel._id }).unwrap();
      toast.success('Hotel unlisted successfully');
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-3">
            <Card.Header>Hotels</Card.Header>
            <Card.Body>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
                    <BootstrapForm.Label>Search hotels:</BootstrapForm.Label>
                    <BootstrapForm.Control
                      style={{ width: '500px' }}
                      value={searchQuery}
                      type="text"
                      placeholder="Enter Name or City..."
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
                      <th>Name</th>
                      <th>City</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHotels.map((hotel) => (
                      <tr key={hotel?._id}>
                        <td>{hotel?.name}</td>
                        <td>{hotel?.city}</td>
                        <td>{hotel?.address}</td>
                        <td>{hotel?.isListed ? 'Listed' : 'Unlisted'}</td>
                        <td>
                          <Button
                            variant="transparent"
                            size="sm"
                            onClick={() => (hotel?.isListed ? handleUnlist(hotel) : handleList(hotel))}
                          >
                            {hotel?.isListed ? <AiFillCloseCircle /> : <AiFillCheckCircle />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(filteredHotels.length / hotelsPerPage) }).map((_, index) => (
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
  );
};
