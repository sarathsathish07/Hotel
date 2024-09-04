import React, { useEffect, useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useUploadHotelCertificateMutation, useGetHotelierProfileQuery } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import bgImage from "../../assets/images/bgimage.jpg";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";

const HotelVerificationScreen = () => {
  const [certificate, setCertificate] = useState(null);
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const { hotelId } = useParams();
  const { data: profile, isLoading: profileLoading } = useGetHotelierProfileQuery();
  const [uploadHotelCertificate, { isLoading }] = useUploadHotelCertificateMutation();

  useEffect(()=>{
    document.title = "Hotel Verification";
  },[])

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValidationError("Please upload a valid image file");
        setCertificate(null);
      } else {
        setValidationError("");
        setCertificate(file);
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!certificate) {
      toast.error("Please upload a certificate");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificate", certificate);

      const response = await uploadHotelCertificate({ hotelId, formData }).unwrap();

      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success("Verification details submitted successfully");
        navigate("/hotelier");
      }
    } catch (error) {
      console.error("Error in API call:", error);
      toast.error("An error occurred while submitting verification details");
    }
  };

  const renderVerificationUI = () => {
    if (profileLoading) {
      return <Loader />;
    }
    if(isLoading) return <Loader/>

    return (
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="certificates" className="my-3">
          <Form.Label>Upload Certificate</Form.Label>
          <Form.Control type="file" onChange={handleCertificateChange} />
          {validationError && <div className="text-danger mt-2">{validationError}</div>}
        </Form.Group>

        

        <Button type="submit" style={{ backgroundColor: "#082b43" }}>
          Submit
        </Button>
      </Form>
    );
  };

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Hotel Verification</h1>
        </div>
      </div>
      <HotelierLayout>
      <Container className="px-4 w-75 my-5">
          <Row>
            <Col md={8}>
              <Card className="profile-card">
                <Card.Header className="profile-card-header">
                  Verification Details
                </Card.Header>
                <Card.Body>{renderVerificationUI()}</Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </HotelierLayout>
    </div>
  );
};

export default HotelVerificationScreen;
