import React, { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useSendPasswordResetEmailMutation } from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';
import Loader from "../../components/userComponents/Loader";


const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [sendPasswordResetEmail, { isLoading }] = useSendPasswordResetEmailMutation();
  useEffect(()=>{
    document.title = "Forgot Password - Celebrate Spaces";
  },[])

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail({ email }).unwrap();
      toast.success('Password reset email sent successfully');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };
  if (isLoading) return <Loader />;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginbody">
      <Card style={{ width: '30rem', padding: '2rem' }}>
        <Card.Body>
          <Card.Title className="text-center">Forgot Password</Card.Title>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            

            <Button type="submit" variant="primary" className="mt-3" block>
              Send Reset Link
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPasswordScreen;
