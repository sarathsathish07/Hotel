import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import { useGetAllHotelsDataMutation } from "../../slices/adminApiSlice";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { HotelsTable } from "../../components/adminComponents/HotelsTable";

const HotelsManagementScreen = () => {
  const [hotelsData, setHotelsData] = useState([]);
  const [refetch, setRefetch] = useState(false);

  const [getHotelsData] = useGetAllHotelsDataMutation();

  const refetchData = () => {
    setRefetch((prev) => !prev);
  };

  useEffect(() => {
    document.title = "Hotels List";
    const fetchHotels = async () => {
      try {
        const responseFromApiCall = await getHotelsData().unwrap();
        setHotelsData(responseFromApiCall);
      } catch (error) {
        toast.error(
          error?.data?.message || error?.error || "Error fetching hotels"
        );
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, [refetch, getHotelsData]);

  return (
    <AdminLayout>
      <Container>
        <HotelsTable hotels={hotelsData} refetchData={refetchData} />
      </Container>
    </AdminLayout>
  );
};

export default HotelsManagementScreen;
