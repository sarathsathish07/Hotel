import React, { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col, Image, Nav } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import { setCredentials } from "../../slices/hotelierAuthSlice.js";
import { useHotelierUpdateUserMutation, useGetHotelierProfileQuery } from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout.jsx";


const HotelierProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const { data: userProfile, isLoading: profileLoading, refetch } = useGetHotelierProfileQuery();
  const [updateProfile, { isLoading }] = useHotelierUpdateUserMutation();

  useEffect(() => {
    document.title = "Profile";
    if (userProfile) {
      setName(userProfile?.name);
      setEmail(userProfile?.email);
    }
  }, [userProfile]);

  useEffect(() => {
    if (hotelierInfo) {
      refetch();
    }
  }, [hotelierInfo, refetch]);


  

  const validateName = (name) => {
    if (name.trim() === '') {
      toast.error('Name is required');
      return false;
    }
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.trim() === '') {
      toast.error('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error('Email is not valid');
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        'Password must be at least 8 characters long and contain at least one letter, one number, and one special character.'
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateName(name) || !validateEmail(email)) {
      return;
    }

    if (password && (password !== confirmPassword || !validatePassword(password))) {
      toast.error("Passwords do not match or do not meet the required criteria");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) formData.append('password', password);

      const responseFromApiCall = await updateProfile(formData).unwrap();
      await refetch();
      dispatch(setCredentials(responseFromApiCall));
      toast.success('Profile Updated Successfully');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "An error occurred");
    }
  };

  if (profileLoading) return <Loader />;
  if(isLoading) return <Loader/>

  return (
    <HotelierLayout>
 <Container className="profile-container">
        <Row>
          <Col md={2}></Col>
          <Col md={8}>
            <Card className="profile-card">
              <Card.Header className="profile-card-header">
                My Account
              </Card.Header>
              <Card.Body>
                <Form onSubmit={submitHandler}>
                  <Form.Group className="my-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    className="profile-button"
                    style={{ backgroundColor: "#082b43" }}
                  >
                    Update
                  </Button>
                  
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </HotelierLayout>
     

  );
};

export default HotelierProfileScreen;
