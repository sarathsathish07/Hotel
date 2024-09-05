import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import backgroundImage from "../../assets/images/pexels-donaldtong94-189296.jpg";
import dest1 from "../../assets/images/kochi.jpg";
import dest2 from "../../assets/images/mumbai.jpg";
import dest3 from "../../assets/images/thrissur.jpg";
import dest4 from "../../assets/images/hyd.jpg";
import { useGetReviewsQuery } from "../../slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const Hero = () => {
  const { data: reviews, isLoading, isError } = useGetReviewsQuery();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    document.title = "Home - Celebrate Spaces";
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (v, i) => (
      <FaStar key={i} color={i < rating ? "gold" : "lightgray"} />
    ));
  };

  const handleCardClick = (city) => {
    navigate("/hotels", { state: { city } });
  };

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, reviews.length - 3) : prevIndex - 3
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= reviews.length ? 0 : prevIndex + 3
    );
  };

  return (
    <>
      <div
        className="py-5 hero-section"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
        }}
      >
        <Container
          className="d-flex flex-column justify-content-center align-items-center text-white text-center"
          style={{ height: "100%" }}
        >
          <h1 className="mb-4">Start your unforgettable journey with us.</h1>
          <p className="mb-4">
            Discover amazing places and exclusive deals for your next stay
          </p>
          <Button size="lg" className="custom-button">
            Book Now
          </Button>
        </Container>
      </div>

      <section className="py-5 about-us-section bg-light text-center">
        <Container>
          <h1 className="mb-4">About Us</h1>
          <p>
            Welcome to Celebrate Spaces! At Celebrate Spaces, we believe that
            every journey deserves a perfect stay. Whether you are traveling for
            business, leisure, or celebrating a special occasion, our mission is
            to connect you with the finest accommodations that cater to your
            unique needs and preferences. Celebrate Spaces was born out of a
            passion for travel and a commitment to excellence in hospitality. We
            understand that finding the right place to stay is crucial for
            creating memorable travel experiences. With this in mind, we set out
            to build a platform that simplifies the hotel booking process,
            ensuring our users can discover, book, and enjoy the best stays
            effortlessly.
          </p>
        </Container>
      </section>

      <section className="py-5 popular-destinations-section text-center">
        <Container>
          <h1 className="mb-4">Popular Destinations</h1>
          <Row>
            <Col md={3}>
              <Card
                className="mb-4 destination-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick("Kochi")}
              >
                <Card.Img
                  variant="top"
                  src={dest1}
                  className="destination-image"
                />
                <Card.Body className="destination-card-body">
                  <div className="destination-info">
                    <FaMapMarkerAlt className="me-2" />
                    <Card.Title className="destination-title">Kochi</Card.Title>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="mb-4 destination-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick("Mumbai")}
              >
                <Card.Img
                  variant="top"
                  src={dest2}
                  className="destination-image"
                />
                <Card.Body className="destination-card-body">
                  <div className="destination-info">
                    <FaMapMarkerAlt className="me-2" />
                    <Card.Title className="destination-title">
                      Mumbai
                    </Card.Title>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="mb-4 destination-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick("Thrissur")}
              >
                <Card.Img
                  variant="top"
                  src={dest3}
                  className="destination-image"
                />
                <Card.Body className="destination-card-body">
                  <div className="destination-info">
                    <FaMapMarkerAlt className="me-2" />
                    <Card.Title className="destination-title">
                      Thrissur
                    </Card.Title>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                className="mb-4 destination-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick("Hyderabad")}
              >
                <Card.Img
                  variant="top"
                  src={dest4}
                  className="destination-image"
                />
                <Card.Body className="destination-card-body">
                  <div className="destination-info">
                    <FaMapMarkerAlt className="me-2" />
                    <Card.Title className="destination-title">
                      Hyderabad
                    </Card.Title>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 testimonials-section bg-light text-center">
        <Container>
          <h2 className="mb-4">What Our Customers Say</h2>
          {isLoading ? (
            <p>Loading reviews...</p>
          ) : isError ? (
            <p>There was an error loading reviews.</p>
          ) : (
            <Row className="align-items-center">
              <Col xs={1} className="text-end">
                <FaArrowLeft
                  className="arrow-button"
                  size={30}
                  onClick={handlePrevClick}
                  style={{ cursor: "pointer" }}
                />
              </Col>
              <Col xs={10}>
                <Row>
                  {reviews
                    ?.slice(currentIndex, currentIndex + 3)
                    .map((review) => (
                      <Col md={4} key={review?._id}>
                        <Card className="mb-4">
                          <Card.Body>
                            <Card.Title className="mb-3">
                              {review?.hotelId?.name || "Unknown Hotel"}
                            </Card.Title>
                            <div className="mb-2">
                              {renderStars(review?.rating)}
                            </div>
                            <Card.Text>"{review?.review}"</Card.Text>
                            <Card.Footer className="text-muted">
                              - {review?.userId?.name || "Anonymous"}
                            </Card.Footer>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Col>
              <Col xs={1} className="text-start">
                <FaArrowRight
                  className="arrow-button"
                  size={30}
                  onClick={handleNextClick}
                  style={{ cursor: "pointer" }}
                />
              </Col>
            </Row>
          )}
        </Container>
      </section>
      <Footer />
    </>
  );
};

export default Hero;
