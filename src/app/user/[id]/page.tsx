import React from 'react';
import { UserProfileContainer } from '../../../components/user';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  return <UserProfileContainer userId={params.id} />;
}