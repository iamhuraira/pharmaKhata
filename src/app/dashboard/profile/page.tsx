'use client';

import { useState } from 'react';
import { Card, Typography, Button, Input, Form, message, Tabs, Divider, Avatar } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, EnvironmentOutlined, SaveOutlined } from '@ant-design/icons';
import { useGetProfile, useUpdateProfile } from '@/hooks/profile';
import PhoneInput from '@/components/customer-management/PhoneInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import DebugAuth from '@/components/DebugAuth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const { profile, isLoading: profileLoading, isError: profileError } = useGetProfile();
  const { updateProfile, isLoading: isUpdating } = useUpdateProfile();

  // Debug logging
  console.log('🔍 ProfilePage Debug:', { 
    profile, 
    profileLoading, 
    profileError,
    hasProfile: !!profile,
    cookies: typeof document !== 'undefined' ? document.cookie : 'SSR'
  });

  const handleSubmit = async (values: any) => {
    if (!isPhoneValid) {
      message.error('Please enter a valid phone number');
      return;
    }

    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        whatsappNumber: values.whatsappNumber,
        email: values.email,
        address: values.address
      });
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handlePasswordSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    try {
      await updateProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phone: profile?.phone || '',
        whatsappNumber: profile?.whatsappNumber,
        email: profile?.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      passwordForm.resetFields();
      setIsPasswordValid(false);
    } catch (error) {
      console.error('Password update error:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="p-4 text-center">
        <Title level={3} className="text-red-500">Error loading profile</Title>
        <Text>Unable to load profile information. Please check your authentication.</Text>
        <br />
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!profile && !profileLoading) {
    return (
      <div className="p-4 text-center">
        <Title level={3} className="text-yellow-500">Not authenticated</Title>
        <Text>Please log in to view your profile.</Text>
        <br />
        <Button 
          onClick={() => window.location.href = '/sign-in'} 
          className="mt-4"
          type="primary"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-2">User Profile</Title>
          <Text type="secondary">Manage your personal information and account settings</Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                className="mb-4 bg-blue-500"
              />
              <Title level={4} className="mb-2">
                {profile?.firstName} {profile?.lastName}
              </Title>
              <Text type="secondary" className="block mb-2">
                {profile?.phone}
              </Text>
              {profile?.email && (
                <Text type="secondary" className="block mb-2">
                  {profile.email}
                </Text>
              )}
              <div className="mt-4">
                <Text type="secondary" className="text-sm">
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </Text>
              </div>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Card>
              <Tabs defaultActiveKey="personal" type="card">
                {/* Personal Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined />
                      Personal Information
                    </span>
                  } 
                  key="personal"
                >
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      firstName: profile?.firstName || '',
                      lastName: profile?.lastName || '',
                      phone: profile?.phone || '',
                      whatsappNumber: profile?.whatsappNumber || '',
                      email: profile?.email || '',
                      address: profile?.currentAddress ? {
                        street: profile.currentAddress.street || '',
                        city: profile.currentAddress.city || '',
                        state: profile.currentAddress.state || '',
                        country: profile.currentAddress.country || 'Pakistan'
                      } : {
                        street: '',
                        city: '',
                        state: '',
                        country: 'Pakistan'
                      }
                    }}
                    onFinish={handleSubmit}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: 'First name is required' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />}
                          placeholder="Enter first name"
                        />
                      </Form.Item>

                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Last name is required' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />}
                          placeholder="Enter last name"
                        />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Phone number is required' }]}
                      >
                        <PhoneInput
                          onValidationChange={setIsPhoneValid}
                          excludeUserId={profile?.id}
                          placeholder="Enter phone number"
                        />
                      </Form.Item>

                      <Form.Item
                        name="whatsappNumber"
                        label="WhatsApp Number"
                      >
                        <Input 
                          prefix={<PhoneOutlined />}
                          placeholder="Enter WhatsApp number (optional)"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="email"
                      label="Email Address"
                    >
                      <Input 
                        prefix={<MailOutlined />}
                        placeholder="Enter email address (optional)"
                        type="email"
                      />
                    </Form.Item>

                    <Divider orientation="left">Address Information</Divider>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name={['address', 'street']}
                        label="Street Address"
                      >
                        <Input 
                          prefix={<EnvironmentOutlined />}
                          placeholder="Enter street address"
                        />
                      </Form.Item>

                      <Form.Item
                        name={['address', 'city']}
                        label="City"
                      >
                        <Input 
                          prefix={<EnvironmentOutlined />}
                          placeholder="Enter city"
                        />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name={['address', 'state']}
                        label="State"
                      >
                        <Input 
                          prefix={<EnvironmentOutlined />}
                          placeholder="Enter state"
                        />
                      </Form.Item>

                      <Form.Item
                        name={['address', 'country']}
                        label="Country"
                      >
                        <Input 
                          prefix={<EnvironmentOutlined />}
                          placeholder="Enter country"
                        />
                      </Form.Item>
                    </div>

                    <Form.Item className="mt-6">
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={isUpdating}
                        disabled={!isPhoneValid}
                        icon={<SaveOutlined />}
                        size="large"
                        className="w-full md:w-auto"
                      >
                        Update Profile
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>

                {/* Change Password Tab */}
                <TabPane 
                  tab={
                    <span>
                      <LockOutlined />
                      Change Password
                    </span>
                  } 
                  key="password"
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSubmit}
                    className="mt-4"
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: 'Current password is required' }]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />}
                        placeholder="Enter current password"
                        onChange={() => setIsPasswordValid(false)}
                      />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'New password is required' },
                        { min: 8, message: 'Password must be at least 8 characters' },
                        { 
                          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                        }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />}
                        placeholder="Enter new password"
                        onChange={() => setIsPasswordValid(false)}
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              setIsPasswordValid(true);
                              return Promise.resolve();
                            }
                            setIsPasswordValid(false);
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined />}
                        placeholder="Confirm new password"
                        onChange={() => setIsPasswordValid(false)}
                      />
                    </Form.Item>

                    <Form.Item className="mt-6">
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={isUpdating}
                        disabled={!isPasswordValid}
                        icon={<LockOutlined />}
                        size="large"
                        className="w-full md:w-auto"
                      >
                        Change Password
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
