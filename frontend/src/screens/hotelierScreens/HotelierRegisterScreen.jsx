import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import { useHotelierRegisterMutation } from "../../slices/hotelierApiSlice";
import registerImage from "../../assets/images/hotel1.jpg";

const HotelierRegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const [register, { isLoading }] = useHotelierRegisterMutation();

  useEffect(()=>{
    document.title = "Register";
  },[])

  const validateName = (name) => {
    if (name.length === 0) {
      toast.error("Name is required");
      return false;
    }
    if (name[0] === " ") {
      toast.error("Name should not start with a space");
      return false;
    }
    if (name.match(/^[0-9]+$/)) {
      toast.error("Alphabets only");
      return false;
    }
    if (!name.match(/^[A-Za-z\s'-]+$/)) {
      toast.error("Write full name");
      return false;
    }
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length === 0) {
      toast.error("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Email is invalid");
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length === 0) {
      toast.error("Password is required");
      return false;
    }
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        "Password must contain at least one letter, one number, one special character and must be at least 8 characters. "
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (
      !validateName(name) ||
      !validateEmail(email) ||
      !validatePassword(password)
    ) {
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      navigate("/hotelier/verify-otp", { state: { email } });
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };
  if(isLoading) return <Loader/>

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginbody">
      <div className="position-absolute top-0 start-0 p-3">
        <h1 className="toptitle">Celebrate Spaces</h1>
      </div>
      <Card style={{ width: "50rem", height: "70vh", borderRadius: "15px" }}>
        <Row className="no-gutters" style={{ height: "100%" }}>
          <Col md={6}>
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="text-center">Hotelier Sign Up</Card.Title>
              <Form onSubmit={submitHandler}>
                <Form.Group className="my-2" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

                <Form.Group className="my-2" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

                <Form.Group className="my-2" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

                <Form.Group className="my-2" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                  />
                </Form.Group>

               

                <Button type="submit" variant="primary" className="mt-3" block>
                  Sign Up
                </Button>

                <Row className="py-3">
                  <Col className="text-center">
                    Already have an account?{" "}
                    <Link to="/hotelier/login">Login</Link>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Col>
          <Col md={6}>
            <img
              src={registerImage}
              className="card-img"
              alt="Register"
              style={{ height: "100%", borderRadius: "15px" }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HotelierRegisterScreen;
