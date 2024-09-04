import React, { useEffect, useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useAdminLoginMutation } from "../../slices/adminApiSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../slices/adminAuthSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader.jsx";

function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useAdminLoginMutation();
  const { adminInfo } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    document.title = "Admin Login";
    if (adminInfo) {
      navigate("/admin");
    }
  }, [adminInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const responseFromApiCall = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      navigate("/admin");
    } catch (error) {
      toast.error("An error occurred, try again");
    }
  };
  if (isLoading) return <Loader />;

  return (
    <Container className="admin-login-container">
      <Row>
        <Card className="login-card">
          <Col md={6} className="login-card-left">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1>Admin Login</h1>
            </Card.Body>
          </Col>
          <Col md={6} className="login-card-right">
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Form.Group className="my-2" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></Form.Control>
                </Form.Group>
                <Form.Group className="my-2" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3 w-100">
                  Sign In
                </Button>
              </Form>
            </Card.Body>
          </Col>
        </Card>
      </Row>
    </Container>
  );
}

export default AdminLoginScreen;
