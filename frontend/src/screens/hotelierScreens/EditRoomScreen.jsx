import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
} from "../../slices/hotelierApiSlice";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader";

const EditRoomScreen = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    data: room,
    isLoading,
    isError,
    refetch,
  } = useGetRoomByIdQuery(roomId);
  const [updateRoom] = useUpdateRoomMutation();

  const [formData, setFormData] = useState({
    type: "",
    price: "",
    area: "",
    occupancy: "",
    noOfRooms: "",
    description: "",
    amenities: "",
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    document.title = "Edit Room";
    if (room) {
      setFormData({
        type: room.type,
        price: room.price,
        area: room.area,
        occupancy: room.occupancy,
        noOfRooms: room.noOfRooms,
        description: room.description,
        amenities: room.amenities.join(", "),
        images: room.images || [],
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const imageTypes = ["image/jpeg", "image/png", "image/jpg"];

    const selectedValidImages = Array.from(files).filter((file) =>
      imageTypes.includes(file.type)
    );

    setSelectedImages(selectedValidImages);
  };

  const handleRemoveImage = (index) => {
    setImagesToDelete((prev) => [...prev, formData.images[index]]);
    setFormData((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.price ||
      !formData.area ||
      !formData.occupancy ||
      !formData.noOfRooms ||
      !formData.description ||
      !formData.amenities
    ) {
      toast.error("All fields are required");
      return;
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    if (isNaN(formData.area) || formData.area <= 0) {
      toast.error("Area must be a positive number");
      return;
    }

    if (isNaN(formData.occupancy) || formData.occupancy <= 0) {
      toast.error("Occupancy must be a positive number");
      return;
    }

    if (isNaN(formData.noOfRooms) || formData.noOfRooms <= 0) {
      toast.error("Number of Rooms must be a positive number");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("occupancy", formData.occupancy);
      formDataToSend.append("noOfRooms", formData.noOfRooms);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("amenities", formData.amenities);

      imagesToDelete.forEach((image) => {
        formDataToSend.append("removeImages", image);
      });

      for (let i = 0; i < selectedImages.length; i++) {
        formDataToSend.append("images", selectedImages[i]);
      }

      await updateRoom({ roomId, formData: formDataToSend }).unwrap();
      refetch();
      toast.success("Room updated successfully");
      navigate("/hotelier/registered-hotels");
    } catch (error) {
      toast.error(
        error?.data?.message || error?.error || "Error updating room"
      );
    }
  };

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching room details");
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <Container
        className="px-4 w-75"
        style={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <h1 className="my-3">Edit Room</h1>
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
            <Row>
              {formData?.images.map((image, index) => (
                <Col key={index} md={3} className="mb-3 position-relative">
                  <Card style={{ width: "100%", height: "100%" }}>
                    {typeof image === "string" && (
                      <Card.Img
                        variant="top"
                        src={`https://celebratespaces.site/${image.replace(
                          "backend\\public\\",
                          ""
                        )}`}
                        alt={`Room Image ${index}`}
                        style={{ height: "150px", objectFit: "cover" }}
                      />
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
            <Form.Control
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
            />
          </Form.Group>
          <Button type="submit" className="mb-3">
            Update Room
          </Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default EditRoomScreen;
