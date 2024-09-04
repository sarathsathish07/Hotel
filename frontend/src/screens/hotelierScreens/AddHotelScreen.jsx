import React, { useEffect, useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useAddHotelMutation } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import Loader from "../../components/userComponents/Loader";

const AddHotelScreen = () => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [latitude, setLatitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [longitude, setLongitude] = useState("");
  const [addHotel] = useAddHotelMutation();
  const navigate = useNavigate();

useEffect(()=>{
  document.title = "Add Hotel";
},[])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Only images are allowed");
      return;
    }

    setSelectedImages(validImages);
  };

  const validateNameAndCity = (value) => {
    const regex = /^[A-Za-z\s'-]+$/;
    return regex.test(value);
  };

  const validateCoordinates = (lat, lng) => {
    const latRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/;
    const lngRegex = /^-?(([-+]?)([\d]{1,3})((\.)(\d+))?)/;
    return latRegex.test(lat) && lngRegex.test(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = address.trim();
    const trimmedDescription = description.trim();
    const trimmedAmenities = amenities.trim();
    const trimmedLatitude = latitude.trim();
    const trimmedLongitude = longitude.trim();

    if (
      !trimmedName ||
      !trimmedCity ||
      !trimmedAddress ||
      !selectedImages.length ||
      !trimmedDescription ||
      !trimmedAmenities ||
      !trimmedLatitude ||
      !trimmedLongitude
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateNameAndCity(trimmedName)) {
      toast.error("Name cannot contain numbers or special characters");
      return;
    }

    if (!validateNameAndCity(trimmedCity)) {
      toast.error("City cannot contain numbers or special characters");
      return;
    }

    if (!validateCoordinates(trimmedLatitude, trimmedLongitude)) {
      toast.error("Invalid latitude or longitude");
      return;
    }

    try {
      setLoading(true); 
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("city", trimmedCity);
      formData.append("address", trimmedAddress);
      formData.append("description", trimmedDescription);
      formData.append("amenities", trimmedAmenities);
      formData.append("latitude", trimmedLatitude);
      formData.append("longitude", trimmedLongitude);
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append("images", selectedImages[i]);
      }

      await addHotel(formData);
      toast.success("Hotel added successfully");
      navigate("/hotelier/registered-hotels");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false); 
    }
  };

  if (loading) return <Loader />;

  return (
    <HotelierLayout>
      <Container className="px-4 w-75" style={{ maxHeight: "100vh", overflowY: "auto" }}>
        <h1 className="my-3">Add Hotel</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter hotel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="city" className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="images" className="mb-3">
            <Form.Label>Images</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleImageChange}
            />
            <div className="mt-3">
              {selectedImages &&
                selectedImages.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="img-thumbnail"
                    style={{ width: "150px", marginRight: "10px" }}
                  />
                ))}
            </div>
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="amenities" className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter amenities separated by commas"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="latitude" className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="longitude" className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="my-3 mb-3"
            style={{ backgroundColor: "#082b43" }}
          >
            Add Hotel
          </Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default AddHotelScreen;
