import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Dropdown,
} from "react-bootstrap";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  useHotelierLogoutMutation,
  useFetchUnreadHotelierNotificationsQuery,
  useMarkHotelierNotificationAsReadMutation,
} from "../../slices/hotelierApiSlice";
import { logout } from "../../slices/hotelierAuthSlice";
import io from "socket.io-client";

const socket = io("https://celebratespaces.site/");

const HotelierHeader = () => {
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useHotelierLogoutMutation();

  const dropdownRef = useRef(null);
  const { data: notifications = [], refetch } =
    useFetchUnreadHotelierNotificationsQuery();
  const [markHotelierNotificationAsRead] =
    useMarkHotelierNotificationAsReadMutation();
  const [showNotifications, setShowNotifications] = useState(false);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/hotelier/login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await markHotelierNotificationAsRead(id).unwrap();
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handleIconClick = () => {
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
        try {
          await Promise.all(
            notifications.map((notification) =>
              markHotelierNotificationAsRead(notification._id).unwrap()
            )
          );
          refetch();
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showNotifications,
    notifications,
    markHotelierNotificationAsRead,
    refetch,
  ]);

  useEffect(() => {
    socket.on("newNotification", (notification) => {
      refetch();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [refetch]);

  if (!hotelierInfo) return null;

  return (
    <header>
      <Navbar
        bg="custom"
        variant="dark"
        expand="lg"
        collapseOnSelect
        className="hotel-header"
      >
        <Container>
          <LinkContainer to="/hotelier">
            <Navbar.Brand className="title">Celebrate Spaces</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <div
                className="position-relative mx-3 notification-dropdown"
                ref={dropdownRef}
                onClick={handleIconClick}
              >
                <FaBell
                  style={{
                    fontSize: "15px",
                    color: "white",
                    cursor: "pointer",
                  }}
                />
                {notifications.length > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="notification-badge position-absolute start-60 translate-middle"
                  >
                    {notifications.length}
                  </Badge>
                )}
                {showNotifications && (
                  <Dropdown.Menu show className="notification-menu">
                    {notifications.length === 0 ? (
                      <Dropdown.Item>No unread notifications</Dropdown.Item>
                    ) : (
                      notifications.map((notification) => (
                        <Dropdown.Item
                          key={notification?._id}
                          onClick={() =>
                            handleNotificationClick(notification?._id)
                          }
                        >
                          {notification?.message}
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                )}
              </div>

              <NavDropdown title={hotelierInfo?.name} id="username">
                <LinkContainer to="/hotelier/profile">
                  <NavDropdown.Item>Profile</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Item onClick={logoutHandler}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default HotelierHeader;
