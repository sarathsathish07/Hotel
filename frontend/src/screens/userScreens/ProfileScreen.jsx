import React, { useState, useEffect } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/generalComponents/Loader";
import { setCredentials } from "../../slices/authSlice";
import {
  useGetUserProfileQuery,
  useUpdateUserMutation,
} from "../../slices/usersApiSlice";
import bgImage from "../../assets/images/bgimage.jpg";
import defaultProfileImage from "../../assets/images/5856.jpg";
import Footer from "../../components/userComponents/Footer";
import Sidebar from "../../components/userComponents/Sidebar";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: userProfile,
    isLoading: profileLoading,
    refetch,
  } = useGetUserProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    document.title = "Profile - Celebrate Spaces";
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setProfileImage(userProfile.profileImageName);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userInfo) {
      refetch();
    }
  }, [userInfo, refetch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image")) {
        toast.error("Please select an image file.");
        return;
      }
      setProfileImage(file);
    }
  };

  const validateName = (name) => {
    if (name.trim() === "") {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.trim() === "") {
      toast.error("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Email is not valid");
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateName(name) || !validateEmail(email)) {
      return;
    }

    if (
      password &&
      (password !== confirmPassword || !validatePassword(password))
    ) {
      toast.error(
        "Passwords do not match or do not meet the required criteria"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      formData.append("currentPassword", currentPassword);
      if (profileImage) formData.append("profileImage", profileImage);

      const responseFromApiCall = await updateProfile(formData).unwrap();
      await refetch();
      dispatch(setCredentials(responseFromApiCall));
      toast.success("Profile Updated Successfully");
    } catch (error) {
      toast.error(
        error?.data?.message || error?.message || "An error occurred"
      );
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return defaultProfileImage;
    return `https://celebratespaces.site/UserProfileImages/${imageName.replace(
      "backend\\public\\",
      ""
    )}`;
  };

  if (profileLoading) return <Loader />;

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>My Profile</h1>
        </div>
      </div>
      <Container className="profile-container">
        <Row className="my-4">
          <Col md={3} className="sidebar-container">
            <Sidebar
              profileImage={userInfo?.profileImage}
              name={userInfo?.name}
            />
          </Col>
          <Col md={8}>
            <Card className="profile-card">
              <Card.Header className="profile-card-header">
                My Account
              </Card.Header>
              <Card.Body>
                <Form onSubmit={submitHandler}>
                  <Form.Group className="my-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="currentPassword">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="password">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group className="my-3" controlId="profileImage">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleImageChange}
                      className="profile-input"
                    />
                    {isLoading && <Loader />}
                  </Form.Group>
                  <Button
                    type="submit"
                    className="profile-button"
                    style={{ backgroundColor: "#082b43" }}
                  >
                    Update
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default ProfileScreen;
