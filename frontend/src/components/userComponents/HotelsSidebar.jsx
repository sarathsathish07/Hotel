import React from "react";
import { Form } from "react-bootstrap";

const HotelsSidebar = ({ onSortChange, onCityChange, onAmenityChange }) => {
  return (
    <div className="sidebar">
      <h4 className="mt-3">Filter & Sort</h4>
      <hr />
      <Form>
        <Form.Group>
          <Form.Label>Sort by</Form.Label>
          <Form.Control as="select" onChange={onSortChange}>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter city"
            onChange={onCityChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Amenities</Form.Label>
          <Form.Check
            type="checkbox"
            value="Free Wifi"
            label="Free Wifi"
            onChange={onAmenityChange}
          />
          <Form.Check
            type="checkbox"
            value="Mountain Biking"
            label="Mountain Biking"
            onChange={onAmenityChange}
          />
          <Form.Check
            type="checkbox"
            value="Hot Tub"
            label="Hot Tub"
            onChange={onAmenityChange}
          />
          <Form.Check
            type="checkbox"
            value="Complimentary Breakfast"
            label="Complimentary Breakfast"
            onChange={onAmenityChange}
          />
          <Form.Check
            type="checkbox"
            value="Pet-friendly Rooms"
            label="Pet-friendly Rooms"
            onChange={onAmenityChange}
          />
        </Form.Group>
      </Form>
    </div>
  );
};

export default HotelsSidebar;
