import { Container, Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const AdminHero = () => {
  return (
    <div className=" py-5">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card  w-75">
          <h1 className="text-center mb-4">Welcome</h1>
          <p className="text-center mb-4">This is the admin dashboard.</p>
        </Card>
      </Container>
    </div>
  );
};

export default AdminHero;
