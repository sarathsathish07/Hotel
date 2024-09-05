import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Container, Row, Col } from "react-bootstrap";

const AdminLayout = ({ children, adminName }) => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="adminsidecol">
          <AdminSidebar adminName={adminName} />
        </Col>
        <Col md={10}>{children}</Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
