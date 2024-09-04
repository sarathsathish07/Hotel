import React, { useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaTachometerAlt, FaUser, FaHotel, FaCalendarCheck } from 'react-icons/fa';
import { useFetchHotelUnreadMessagesQuery } from '../../slices/hotelierApiSlice.js';
import io from "socket.io-client";

const socket = io("https://celebratespaces.site/");

const HotelierSidebar = ({ hotelierName }) => {
  const { data: unreadMessages, isLoading, isError, refetch } = useFetchHotelUnreadMessagesQuery();

  useEffect(() => {
    refetch();
  });

  useEffect(() => {
    socket.on("messageRead", () => {
      refetch();
    });

    return () => {
      socket.off("messageRead");
    };
  }, [refetch]);

  const hasUnreadMessages = !isLoading && !isError && unreadMessages?.length > 0;

  return (
    <div className='hotelier-sidebar'>
      <Nav className="flex-column">
        <LinkContainer to="/hotelier/">
          <Nav.Link className='mt-5'>
            <FaTachometerAlt /> Dashboard
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/hotelier/profile">
          <Nav.Link>
            <FaUser /> Profile
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/hotelier/registered-hotels">
          <Nav.Link>
            <FaHotel /> Registered Hotels
            {hasUnreadMessages && <span className="dot-indicator"></span>}
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/hotelier/bookings">
          <Nav.Link>
            <FaCalendarCheck /> Bookings
          </Nav.Link>
        </LinkContainer>
      </Nav>
    </div>
  );
};

export default HotelierSidebar;
