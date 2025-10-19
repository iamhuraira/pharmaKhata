'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';
import Cookies from 'js-cookie';

const { Text } = Typography;

export default function DebugAuth() {
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token_js');
      const emailVerified = Cookies.get('emailVerified');
      const allCookies = Cookies.get();
      
      setAuthStatus({
        token: token ? `${token.substring(0, 20)}...` : null,
        hasToken: !!token,
        emailVerified,
        allCookies: Object.keys(allCookies),
        cookieCount: Object.keys(allCookies).length
      });
    };

    checkAuth();
    
    // Check every 2 seconds
    const interval = setInterval(checkAuth, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const testProfileAPI = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Profile API Response:', data);
      alert(`Profile API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Profile API Error:', error);
      alert(`Profile API Error: ${error}`);
    }
  };

  const testMeAPI = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Me API Response:', data);
      alert(`Me API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Me API Error:', error);
      alert(`Me API Error: ${error}`);
    }
  };

  const setTestCookies = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjhmOGUyYjNmOGQ1M2I2Yzk4YjVhMSIsInJvbGUiOiI2OGY1MzA0OGJiZTQ0ZjdkMDE2ZTVkMzQiLCJpYXQiOjE3NjA5MDQ3NTksImV4cCI6MTc2MDk5MTE1OX0.8SQSwvXvfeGtcG4p17OxJfSiAf_m_uEEkTPLdajIH8M';
    Cookies.set('token_js', testToken);
    Cookies.set('emailVerified', 'true');
    alert('Test cookies set! Reloading page...');
    window.location.reload();
  };

  const testDirectAPI = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('🔍 Direct API call result:', data);
      
      if (data.success && data.data && data.data.user) {
        alert(`✅ Profile data found!\nName: ${data.data.user.firstName} ${data.data.user.lastName}\nPhone: ${data.data.user.phone}`);
      } else {
        alert(`❌ Profile data structure issue:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Direct API Error:', error);
      alert(`❌ Direct API Error: ${error}`);
    }
  };

  return (
    <Card title="Authentication Debug Panel" className="mb-4">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Token Status: </Text>
          <Tag color={authStatus?.hasToken ? 'green' : 'red'}>
            {authStatus?.hasToken ? 'Present' : 'Missing'}
          </Tag>
        </div>
        
        <div>
          <Text strong>Email Verified: </Text>
          <Tag color={authStatus?.emailVerified === 'true' ? 'green' : 'red'}>
            {authStatus?.emailVerified || 'Not set'}
          </Tag>
        </div>
        
        <div>
          <Text strong>Token Preview: </Text>
          <Text code>{authStatus?.token || 'None'}</Text>
        </div>
        
        <div>
          <Text strong>Cookies ({authStatus?.cookieCount || 0}): </Text>
          <Text code>{authStatus?.allCookies?.join(', ') || 'None'}</Text>
        </div>
        
        <Space wrap>
          <Button onClick={testProfileAPI} type="primary">
            Test Profile API
          </Button>
          <Button onClick={testMeAPI} type="default">
            Test Me API
          </Button>
          <Button onClick={testDirectAPI} type="default">
            Test Direct API
          </Button>
          <Button onClick={setTestCookies} type="dashed">
            Set Test Cookies
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
