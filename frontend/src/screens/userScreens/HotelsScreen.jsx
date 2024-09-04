import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button, Form, Accordion } from "react-bootstrap";
import { useGetHotelsDataMutation, useGetRoomsDataMutation } from "../../slices/usersApiSlice";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../../assets/images/bg-1.png";
import Loader from "../../components/generalComponents/Loader";
import Footer from "../../components/userComponents/Footer";
import { toast } from "react-toastify";

const HotelsScreen = () => {
  const location = useLocation();
  const initialCity = location.state?.city || "";
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sort, setSort] = useState("price_low_high");
  const [city, setCity] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [filterCity, setFilterCity] = useState(initialCity);
  const [filterAmenities, setFilterAmenities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [getHotels, { isLoading: isLoadingHotels }] = useGetHotelsDataMutation();
  const [getRooms, { isLoading: isLoadingRooms }] = useGetRoomsDataMutation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 6;

  const baseURL = 'https://celebratespaces.site/';

  useEffect(() => {
    document.title = "Hotels - Celebrate Spaces";
    const fetchHotelsAndRooms = async () => {
      try {
        console.log("Fetching hotels with location:", userLocation)
        const hotelResponse = await getHotels({
          sort,
          amenities: filterAmenities.length > 0 ? filterAmenities : [],
          city: filterCity,
          latitude: userLocation?.latitude,  
          longitude: userLocation?.longitude, 
        }).unwrap();
        setHotels(hotelResponse);

        const hotelIds = hotelResponse.map((hotel) => hotel?._id);
        const roomResponse = await getRooms(hotelIds).unwrap();
        setRooms(roomResponse);
      } catch (error) {
        toast.error("Error fetching hotels and rooms");
        console.error("Error fetching hotels and rooms:", error);
      }
    };

    fetchHotelsAndRooms();
  }, [getHotels, getRooms, sort, filterAmenities, filterCity, userLocation]);

  const handleHotelClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleAmenityChange = (e) => {
    const amenity = e.target.value;
    if (e.target.checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
    }
  };

  const applyFilters = () => {
    setFilterCity(city);
    setFilterAmenities(selectedAmenities);
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setFilterCity(''); 
        },
        (error) => {
          toast.error("Failed to get location.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const calculateAveragePrice = (hotelId) => {
    const hotelRooms = rooms.filter((room) => room?.hotelId === hotelId);
    if (hotelRooms.length === 0) return 0;
    const total = hotelRooms.reduce((sum, room) => sum + room.price, 0);
    return (total / hotelRooms.length).toFixed(2);
  };

  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = hotels.slice(indexOfFirstHotel, indexOfLastHotel);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(hotels.length / hotelsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoadingHotels || isLoadingRooms)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Find Your Dream Luxury Hotel</h1>
        </div>
      </div>
      <Container>
        <Row>
          <Col md={3}>
            <Card className="p-3 my-5">
              <h5>Filters</h5>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Sort by</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group>
                      <Form.Check
                        type="radio"
                        label="Price: Low to High"
                        value="price_low_high"
                        checked={sort === "price_low_high"}
                        onChange={handleSortChange}
                      />
                      <Form.Check
                        type="radio"
                        label="Price: High to Low"
                        value="price_high_low"
                        checked={sort === "price_high_low"}
                        onChange={handleSortChange}
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>City</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Enter city"
                        value={city}
                        onChange={handleCityChange}
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Amenities</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group>
                      {["Free Wifi", "Pool", "Parking", "Gym"].map((amenity) => (
                        <Form.Check
                          key={amenity}
                          type="checkbox"
                          label={amenity}
                          value={amenity}
                          onChange={handleAmenityChange}
                        />
                      ))}
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <Button variant="primary" className="mt-3" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="secondary" className="mt-3" onClick={handleLocationSearch}>
                Search Near Me
              </Button>
            </Card>
          </Col>

          <Col md={9} className="mt-5 hotels-section mb-5">
            <Row>
              {currentHotels.map((hotel) => (
                <Col key={hotel?._id} md={4} className="mb-4">
                  <Card className="hotel-card" onClick={() => handleHotelClick(hotel?._id)}>
                  <Card.Img
                    variant="top"
                    src={`${baseURL}${hotel?.images[0].replace("backend\\public\\", "")}`}
                    alt={hotel?.name}
                    className="hotel-image"
                  />
                    <Card.Body className="hotel-card-body">
                      <Card.Title>{hotel?.name}</Card.Title>
                      <Row>
                        <Col>
                          <Card.Text className="mb-0">{hotel?.city}</Card.Text>
                          <Card.Text>{hotel?.address}</Card.Text>
                        </Col>
                        <Col>
                          <Card.Text className="mb-0">Avg Price</Card.Text>
                          <Card.Text>Rs {calculateAveragePrice(hotel?._id)}</Card.Text>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="pagination-controls d-flex justify-content-center align-items-center mt-3">
              <Button variant="secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="mx-2">Page {currentPage} of {Math.ceil(hotels.length / hotelsPerPage)}</span>
              <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === Math.ceil(hotels.length / hotelsPerPage)}>
                Next
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default HotelsScreen;
