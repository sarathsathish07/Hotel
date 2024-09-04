import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Dropdown } from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { useLogoutMutation, useFetchUnreadNotificationsQuery, useMarkNotificationAsReadMutation } from '../../slices/usersApiSlice';
import { logout } from '../../slices/authSlice';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('https://celebratespaces.site/');

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const { data: notifications = [], refetch } = useFetchUnreadNotificationsQuery();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [showNotifications, setShowNotifications] = useState(false);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await markNotificationAsRead(id).unwrap();
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
            notifications.map(notification => markNotificationAsRead(notification._id).unwrap())
          );
          refetch();
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, notifications, markNotificationAsRead, refetch]);

  const isHomepage = location.pathname === '/';
  const notificationIconColor = isHomepage ? 'black' : 'white';

  useEffect(() => {
    socket.on('newNotification', (notification) => {
      refetch(); 
    });

    return () => {
      socket.off('newNotification');
    };
  }, [refetch]);

  return (
    <header>
      <Navbar
        bg={isHomepage ? 'transparent' : '#1B2431'}
        variant='dark'
        expand='lg'
        collapseOnSelect
        className={isHomepage ? 'custom-navbar-homepage' : 'custom-navbarUser'}
      >
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand className="titleHome">Celebrate Spaces</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto me-auto nav-link-container'>
              <LinkContainer to='/'>
                <Nav.Link className="nav-link-title">Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to='/hotels'>
                <Nav.Link className="nav-link-title">Hotels</Nav.Link>
              </LinkContainer>
            </Nav>
            {userInfo ? (
              <Nav className="ms-auto align-items-center">
                <div className="position-relative mx-3 notification-dropdown" ref={dropdownRef} onClick={handleIconClick}>
                  <FaBell style={{ color: notificationIconColor, cursor: 'pointer' }} />
                  {notifications.length > 0 && (
                    <Badge pill bg="danger" className="notification-badge position-absolute start-60 translate-middle">
                      {notifications.length}
                    </Badge>
                  )}
                  {showNotifications && (
                    <Dropdown.Menu show className="notification-menu">
                      {notifications.length === 0 ? (
                        <Dropdown.Item>No unread notifications</Dropdown.Item>
                      ) : (
                        notifications.map((notification) => (
                          <Dropdown.Item key={notification?._id} onClick={() => handleNotificationClick(notification?._id)}>
                            {notification?.message}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  )}
                </div>
                <NavDropdown
                  title={userInfo.name}
                  
                  className={isHomepage ? 'nav-dropdown-title-homepage' : 'nav-dropdown-title'}
                >
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            ) : (
              <Nav className="ms-auto">
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <FaSignInAlt /> Sign In
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to='/register'>
                  <Nav.Link>
                    <FaSignOutAlt /> Sign Up
                  </Nav.Link>
                </LinkContainer>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
