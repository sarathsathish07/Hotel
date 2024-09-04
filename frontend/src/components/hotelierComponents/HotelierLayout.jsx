import React from 'react';
import HotelierSidebar from '../../components/hotelierComponents/HotelierSidebar';
import { Container, Row, Col } from 'react-bootstrap';

const HotelierLayout = ({ children, hotelierName }) => {
  return (
    <Container fluid >
      <Row>
        <Col md={3} className='hotelsidecol'>
          <HotelierSidebar hotelierName={hotelierName} />
        </Col>
        <Col md={9} className='hotelierbody'>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default HotelierLayout;
