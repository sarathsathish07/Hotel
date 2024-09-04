import React, { useEffect, useState } from "react";
import { UsersTable } from "../../components/adminComponents/UserTable";
import { useGetUserDataMutation } from "../../slices/adminApiSlice";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";

export const UserManagementScreen = () => {
  const [usersData, setUsersData] = useState([]);
  const [refetch, setRefetch] = useState(false);

  const [userDataFromApi] = useGetUserDataMutation();

  const refetchData = () => {
    setRefetch((prev) => !prev);
  };

  useEffect(() => {
    document.title = "Users List";
    const fetchData = async () => {
      try {
        const responseFromApiCall = await userDataFromApi().unwrap();
        setUsersData(responseFromApiCall);
      } catch (error) {
        toast.error(
          error?.data?.message || error?.error || "Error fetching users"
        );
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [refetch, userDataFromApi]);

  return (
    <AdminLayout>
      <Container>
        <UsersTable users={usersData} refetchData={refetchData} />
      </Container>
    </AdminLayout>
  );
};
