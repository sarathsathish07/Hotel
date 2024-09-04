
import React, { useState } from 'react';
import { Table, Container, Row, Col, Card, Button, Form as BootstrapForm, Pagination } from 'react-bootstrap';

export const DataTable = ({
  data,
  refetchData,
  columns,
  title,
  searchPlaceholder,
  onActionClick,
  actionButtons,
  itemsPerPage = 5,
  searchKeys = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-3">
            <Card.Header>{title}</Card.Header>
            <Card.Body>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group className="mt-3" controlId="searchForm.ControlInput1">
                    <BootstrapForm.Label>Search:</BootstrapForm.Label>
                    <BootstrapForm.Control
                      style={{ width: '500px' }}
                      value={searchQuery}
                      type="text"
                      placeholder={searchPlaceholder}
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
                      {columns.map((col, index) => (
                        <th key={index}>{col.label}</th>
                      ))}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                          <td key={colIndex}>
                            {col.format ? col.format(item[col.key], item) : item[col.key]}
                          </td>
                        ))}
                        <td>
                          {actionButtons.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="transparent"
                              size="sm"
                              onClick={() => onActionClick(item, action.actionType)}
                              className="me-2"
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
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
