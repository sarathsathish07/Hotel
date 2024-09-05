import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  useHotelierLoginMutation,
  useResendHotelierOtpMutation,
} from "../../slices/hotelierApiSlice.js";
import { setCredentials } from "../../slices/hotelierAuthSlice.js";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader.jsx";
import loginImage from "../../assets/images/hotel1.jpg";

const HotelierLoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useHotelierLoginMutation();
  const [resendOtp] = useResendHotelierOtpMutation();

  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);

  useEffect(() => {
    document.title = "Login";
    if (hotelierInfo) {
      navigate("/hotelier");
    }
  }, [navigate, hotelierInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/hotelier");
    } catch (error) {
      if (error?.data?.message === "Please verify your OTP before logging in") {
        try {
          await resendOtp({ email });
          toast.info("OTP has expired. Resending OTP...");
          navigate("/hotelier/verify-otp", { state: { email } });
        } catch (resendError) {
          toast.error(resendError?.data?.message || resendError.error);
        }
      } else {
        toast.error(error?.data?.message || error.error);
      }
    }
  };
  if (isLoading) return <Loader />;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginbody">
      <div className="position-absolute top-0 start-0 p-3">
        <h1 className="toptitle">Celebrate Spaces</h1>
      </div>
      <Card style={{ width: "50rem", height: "60vh", borderRadius: "15px" }}>
        <Row className="no-gutters" style={{ height: "100%" }}>
          <Col md={6}>
            <img
              src={loginImage}
              className="card-img"
              alt="Login"
              style={{ height: "100%", borderRadius: "15px" }}
            />
          </Col>
          <Col md={6}>
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title className="text-center">Hotelier Sign In</Card.Title>
              <Form onSubmit={submitHandler}>
                <Form.Group className="my-2" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group className="my-2" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3" block>
                  Sign In
                </Button>

                <Row className="py-3">
                  <Col className="text-center">
                    New Customer? <Link to="/hotelier/register">Register</Link>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HotelierLoginScreen;
