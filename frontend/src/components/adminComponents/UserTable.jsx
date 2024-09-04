import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Card, Button, Form as BootstrapForm, Pagination } from "react-bootstrap";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import { useAdminBlockUserMutation, useAdminUnblockUserMutation } from "../../slices/adminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./userTable.css";

export const UsersTable = ({ users, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); 

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/get-user");
    } else {
      navigate("/admin");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); 
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const [blockUser] = useAdminBlockUserMutation();
  const [unblockUser] = useAdminUnblockUserMutation();

  const handleBlock = async (user) => {
    try {
      await blockUser({ userId: user._id }).unwrap();
      toast.success("User blocked successfully");
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const handleUnblock = async (user) => {
    try {
      await unblockUser({ userId: user._id }).unwrap();
      toast.success("User unblocked successfully");
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-3">
            <Card.Header>Users</Card.Header>
            <Card.Body>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
                    <BootstrapForm.Label>Search users:</BootstrapForm.Label>
                    <BootstrapForm.Control
                      style={{ width: "500px" }}
                      value={searchQuery}
                      type="text"
                      placeholder="Enter Name or Email..."
                      onChange={handleSearch}
                    />
                  </BootstrapForm.Group>
                </BootstrapForm>
              </div>
              <br />
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={index}>
                        <td>{user?.name}</td>
                        <td>{user?.email}</td>
                        <td>{user?.isBlocked ? "Blocked" : "Active"}</td>
                        <td>
                          <Button
                            variant="transparent"
                            size="sm"
                            onClick={() => (user?.isBlocked ? handleUnblock(user) : handleBlock(user))}
                          >
                            {user?.isBlocked ? <AiFillUnlock /> : <AiFillLock />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
