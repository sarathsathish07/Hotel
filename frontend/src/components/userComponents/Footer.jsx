import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={5}>
            <h5>About Us</h5>
            <p>
              Celebrate Spaces is your go-to platform for finding and booking
              the best hotels worldwide. Experience luxury and comfort at
              unbeatable prices.
            </p>
          </Col>
          <Col md={3}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li>Email: support@celebratespaces.com</li>
              <li>Phone: +91 94966 50288</li>
              <li>Address: 1234 Maradu, Kochi, India</li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3">
            <p>
              &copy; {new Date().getFullYear()} Celebrate Spaces. All rights
              reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
