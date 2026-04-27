import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import ProfileContent from '../../components/profile/ProfileContent';

const Profile = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area profile-area">
        <ProfileContent />
      </main>
    </div>
  );
};

export default Profile;
