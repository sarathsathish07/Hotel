import React from "react";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import {
  useAdminListHotelMutation,
  useAdminUnlistHotelMutation,
} from "../../slices/adminApiSlice";
import { toast } from "react-toastify";
import { DataTable } from "../generalComponents/DataTable";

export const HotelsTable = ({ hotels, refetchData }) => {
  const [listHotel] = useAdminListHotelMutation();
  const [unlistHotel] = useAdminUnlistHotelMutation();

  const handleActionClick = async (hotel, actionType) => {
    try {
      if (actionType === "list") {
        await listHotel({ hotelId: hotel._id }).unwrap();
        toast.success("Hotel listed successfully");
      } else {
        await unlistHotel({ hotelId: hotel._id }).unwrap();
        toast.success("Hotel unlisted successfully");
      }
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const columns = [
    { label: "Name", key: "name" },
    { label: "City", key: "city" },
    { label: "Address", key: "address" },
    {
      label: "Status",
      key: "isListed",
      format: (isListed) => (isListed ? "Listed" : "Unlisted"),
    },
  ];

  const actionButtons = [
    { icon: <AiFillCheckCircle />, actionType: "list" },
    { icon: <AiFillCloseCircle />, actionType: "unlist" },
  ];

  return (
    <DataTable
      data={hotels}
      refetchData={refetchData}
      columns={columns}
      title="Hotels"
      searchPlaceholder="Enter Name or City..."
      onActionClick={handleActionClick}
      actionButtons={actionButtons}
      searchKeys={["name", "city"]}
    />
  );
};
