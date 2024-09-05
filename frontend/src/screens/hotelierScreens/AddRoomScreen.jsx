import React, { useEffect, useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAddRoomMutation } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import Loader from "../../components/generalComponents/Loader";

const AddRoomScreen = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [addRoom] = useAddRoomMutation();
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    price: "",
    area: "",
    occupancy: "",
    noOfRooms: "",
    description: "",
    amenities: "",
  });

  useEffect(() => {
    document.title = "Add Rooms";
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const validImages = files.filter((file) =>
      validImageTypes.includes(file.type)
    );

    if (validImages.length !== files.length) {
      toast.error("Only image files are allowed (jpeg, png, gif)");
      return;
    }

    setSelectedImages(validImages);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedFormData = {
      type: formData.type.trim(),
      price: formData.price.trim(),
      area: formData.area.trim(),
      occupancy: formData.occupancy.trim(),
      noOfRooms: formData.noOfRooms.trim(),
      description: formData.description.trim(),
      amenities: formData.amenities.trim(),
    };

    if (
      !trimmedFormData.type ||
      !trimmedFormData.price ||
      !trimmedFormData.area ||
      !trimmedFormData.occupancy ||
      !trimmedFormData.noOfRooms ||
      !selectedImages.length ||
      !trimmedFormData.description ||
      !trimmedFormData.amenities
    ) {
      toast.error("All fields are required and cannot be empty");
      return;
    }
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("type", trimmedFormData.type);
      formDataObj.append("price", trimmedFormData.price);
      formDataObj.append("area", trimmedFormData.area);
      formDataObj.append("occupancy", trimmedFormData.occupancy);
      formDataObj.append("noOfRooms", trimmedFormData.noOfRooms);
      formDataObj.append("description", trimmedFormData.description);
      formDataObj.append("amenities", trimmedFormData.amenities);
      for (let i = 0; i < selectedImages.length; i++) {
        formDataObj.append("images", selectedImages[i]);
      }

      await addRoom({ hotelId, formData: formDataObj }).unwrap();
      toast.success("Room added successfully");
      navigate(`/hotelier/registered-hotels`);
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Error adding room");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  return (
    <HotelierLayout>
      <Container
        className="px-4 w-75"
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <h1 className="my-3">Add Room</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="type" className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              name="type"
              value={formData?.type}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="price" className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData?.price}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="area" className="mb-3">
            <Form.Label>Area</Form.Label>
            <Form.Control
              type="number"
              name="area"
              value={formData?.area}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="occupancy" className="mb-3">
            <Form.Label>Occupancy</Form.Label>
            <Form.Control
              type="number"
              name="occupancy"
              value={formData?.occupancy}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="noOfRooms" className="mb-3">
            <Form.Label>Number of Rooms</Form.Label>
            <Form.Control
              type="number"
              name="noOfRooms"
              value={formData?.noOfRooms}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData?.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="amenities" className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <Form.Control
              type="text"
              name="amenities"
              value={formData?.amenities}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="images" className="mb-3">
            <Form.Label>Images</Form.Label>
            <Form.Control
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
            />
            <div className="mt-3">
              {selectedImages &&
                Array.from(selectedImages).map((image, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Selected ${index}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
            </div>
          </Form.Group>
          <Button type="submit" variant="primary">
            Add Room
          </Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default AddRoomScreen;
