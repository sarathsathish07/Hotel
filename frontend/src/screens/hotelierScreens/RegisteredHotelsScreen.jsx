import React, { useEffect, useState } from "react";
import { Button, Container, Card, Row, Col, Pagination } from "react-bootstrap";
import { useGetHotelsQuery } from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/generalComponents/Loader.jsx";

const RegisteredHotelsScreen = () => {
  const { data: hotels, isLoading, isError, refetch } = useGetHotelsQuery();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);

  const [currentPage, setCurrentPage] = useState(1);
  const [hotelsPerPage] = useState(3);

  useEffect(() => {
    document.title = "Registered Hotels";
    refetch();
  });

  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = hotels?.slice(indexOfFirstHotel, indexOfLastHotel);

  const renderHotels = () => {
    return currentHotels?.map((hotel) => (
      <Col key={hotel?._id} md={4} className="mb-4">
        <Card className="h-100 shadow hotelscard">
          {hotel?.images.length > 0 && (
            <Card.Img
              variant="top"
              src={`https://celebratespaces.site/${hotel?.images[0]
                .replace("backend/public/", "")
                .replace(/\\/g, "/")}`}
              alt={hotel.name}
              style={{ height: "200px", objectFit: "cover" }}
            />
          )}
          <Card.Body>
            <Card.Title>{hotel?.name}</Card.Title>
            <Card.Text>
              <strong>City:</strong> {hotel?.city}
            </Card.Text>
            <Card.Text>
              <strong>Address:</strong> {hotel?.address}
            </Card.Text>
            {hotel.verificationStatus !== "accepted" && (
              <Link to={`/hotelier/verify-hotel/${hotel?._id}`}>
                <Button className="mt-2">Verify</Button>
                <br />
              </Link>
            )}
            <Link to={`/hotelier/hotel-details/${hotel?._id}`}>
              <Button className="mt-2">
                View Details
                {hotel?.unreadMessagesCount > 0 && (
                  <span className="dot-indicator"></span>
                )}
              </Button>
            </Link>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching hotels");
    return <div>Error</div>;
  }
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <HotelierLayout>
      <div style={{ maxHeight: "700px", overflowY: "auto" }}>
        <Container className="px-4 w-75">
          <Row>
            <Col md={10}>
              <h1 className="my-3">Registered Hotels</h1>
            </Col>
            <Col>
              <Link to="/hotelier/add-hotel">
                <Button className="addhotelbutton my-4">Add Hotel</Button>
              </Link>
            </Col>
          </Row>
          <Row>{renderHotels()}</Row>
          <Pagination className="my-3 d-flex justify-content-center">
            {[...Array(Math.ceil(hotels?.length / hotelsPerPage)).keys()].map(
              (number) => (
                <Pagination.Item
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  active={number + 1 === currentPage}
                >
                  {number + 1}
                </Pagination.Item>
              )
            )}
          </Pagination>
        </Container>
      </div>
    </HotelierLayout>
  );
};

export default RegisteredHotelsScreen;
