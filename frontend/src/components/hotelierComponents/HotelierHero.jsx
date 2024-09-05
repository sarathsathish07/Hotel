import React from "react";
import { Container, Card, Button } from "react-bootstrap";

const HotelierHero = () => {
  return (
    <div className=" py-5">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card  w-75">
          <h1 className="text-center mb-4">Welcome</h1>
          <p className="text-center mb-4">This is the hotelier dashboard.</p>
        </Card>
      </Container>
    </div>
  );
};

export default HotelierHero;
