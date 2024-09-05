import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { useResetPasswordMutation } from "../../slices/usersApiSlice";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader";

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    document.title = "Reset Password - Celebrate Spaces";
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        "Password must contain at least one letter, one number, one special character and must be at least 8 characters."
      );
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginbody">
      <Card style={{ width: "30rem", padding: "2rem" }}>
        <Card.Body>
          <Card.Title className="text-center">Reset Password</Card.Title>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="password">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3" block>
              Reset Password
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPasswordScreen;
