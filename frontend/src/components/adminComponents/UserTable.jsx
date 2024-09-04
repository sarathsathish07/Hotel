import React from 'react';
import { AiFillLock, AiFillUnlock } from 'react-icons/ai';
import { useAdminBlockUserMutation, useAdminUnblockUserMutation } from '../../slices/adminApiSlice';
import { toast } from 'react-toastify';
import { DataTable } from '../generalComponents/DataTable';

export const UsersTable = ({ users, refetchData }) => {
  const [blockUser] = useAdminBlockUserMutation();
  const [unblockUser] = useAdminUnblockUserMutation();

  const handleActionClick = async (user, actionType) => {
    try {
      if (actionType === 'block') {
        await blockUser({ userId: user._id }).unwrap();
        toast.success('User blocked successfully');
      } else {
        await unblockUser({ userId: user._id }).unwrap();
        toast.success('User unblocked successfully');
      }
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Status', key: 'isBlocked', format: (isBlocked) => (isBlocked ? 'Blocked' : 'Active') },
  ];

  const actionButtons = [
    { icon: <AiFillUnlock />, actionType: 'unblock' },
    { icon: <AiFillLock />, actionType: 'block' },
  ];

  return (
    <DataTable
      data={users}
      refetchData={refetchData}
      columns={columns}
      title="Users"
      searchPlaceholder="Enter Name or Email..."
      onActionClick={handleActionClick}
      actionButtons={actionButtons}
      searchKeys={['name', 'email']}
    />
  );
};
