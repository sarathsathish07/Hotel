import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation,useResendOtpMutation,useGoogleLoginMutation } from "../../slices/usersApiSlice";
import { setCredentials } from "../../slices/authSlice";
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import loginImage from "../../assets/images/hotel1.jpg";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLogin] = useGoogleLoginMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [resendOtp] = useResendOtpMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Login - Celebrate Spaces";
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (error) {
      if (error?.data?.message === "Please verify your OTP before logging in") {
        try {
          await resendOtp({ email }); 
          toast.info("OTP has expired. Resending OTP...");
          navigate("/verify-otp", { state: { email } }); 
        } catch (resendError) {
          toast.error(resendError?.data?.message || resendError.error);
        }
      } else {
        toast.error(error?.data?.message || error.error);
      }
    }
  };
  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleName = decoded.name;
      const googleEmail = decoded.email;
  
      const responseFromApiCall = await googleLogin({
        googleName,
        googleEmail,
      }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      navigate("/");
    } catch (error) {
      if (error.status === 401 && error.data.message === "User is blocked or not authorized") {
        toast.error("User is blocked or not authorized");
      } else {
        toast.error(error.data?.message || "An error occurred during Google login");
      }
    }
  };
  if (isLoading) return <Loader />;
  
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginbody">
      <div className="position-absolute top-0 start-0 p-3">
        <h1 className="toptitle">Celebrate Spaces</h1>
      </div>
      <Card style={{ width: "50rem", height: "70vh", borderRadius: "15px" }}>
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
              <Card.Title className="text-center">Sign In</Card.Title>
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

               

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-3"
                  block
                  style={{ width: "100%" }}
                >
                  Sign In
                </Button>

                <Row className="py-2">
                  <Col className="text-center">
                    New Customer? <Link to="/register">Register</Link>
                  </Col>
                </Row>

                <Row>
                  <Col className="text-center py-2">
                    Forgot Password? <Link to="/forgot-password">Click here</Link>
                  </Col>
                </Row>

                <Row>
                  <Col className="text-center py-2">
                    Are you a hotelier?{" "}
                    <Link to="/hotelier/login">Login here</Link>
                  </Col>
                </Row>
              </Form>
              <div className="text-center my-4" style={{display:"flex",justifyContent:'center'}}>
              <GoogleOAuthProvider  clientId="684114676709-5r4de1pbjcdhccojbdmtrpcoc46e3bv4.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                  />
                </GoogleOAuthProvider>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LoginScreen;
