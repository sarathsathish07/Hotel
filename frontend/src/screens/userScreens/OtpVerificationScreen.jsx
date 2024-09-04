import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "../../slices/usersApiSlice";

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendVisible, setIsResendVisible] = useState(false);
  const location = useLocation();
  const email = location.state.email;

  const navigate = useNavigate();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();

  useEffect(() => {
    document.title = "OTP verification - Celebrate Spaces";
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setIsResendVisible(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP verified successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent successfully");
      setTimer(60);
      setIsResendVisible(false);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) return <Loader />;


  return (
    <div className="login-container loginbody">
      <div className="position-absolute top-0 start-0 p-3">
        <h1 className="toptitle">Celebrate Spaces</h1>
      </div>
      <div className="formwrap">
        <Form onSubmit={submitHandler} className="login-form">
          <h1>OTP Verification</h1>
          <Form.Group className="my-2" controlId="otp">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-control"
            />
          </Form.Group>

         

          <Button type="submit" variant="primary" className="mt-3">
            Verify
          </Button>

          {timer > 0 ? (
            <div className="mt-3">
              <span>Resend OTP in {timer} seconds</span>
            </div>
          ) : (
            <div className="mt-3">
              {isResendVisible && (
                <Button variant="link" onClick={handleResendOtp}>
                  Resend OTP
                </Button>
              )}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default OtpVerificationScreen;
