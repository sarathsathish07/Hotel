import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaTachometerAlt, FaUsers, FaHotel, FaCheckCircle, FaComments, FaCalendarCheck } from 'react-icons/fa';

const AdminSidebar = ({ hotelierName }) => {
  return (
    <Nav className="flex-column admin-sidebar bg-dark text-white ">
      <LinkContainer to="/admin">
        <Nav.Link>
          <FaTachometerAlt /> Dashboard
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/get-user">
        <Nav.Link>
          <FaUsers /> Users
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/get-hotels">
        <Nav.Link>
          <FaHotel /> Hotels
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/verification">
        <Nav.Link>
          <FaCheckCircle /> Verification
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/bookings">
        <Nav.Link>
          <FaCalendarCheck /> Bookings
        </Nav.Link>
      </LinkContainer>
    </Nav>
  );
};

export default AdminSidebar;
