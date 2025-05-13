import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Row, Col, Statistic } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const SalesReport = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales/metrics');
        setMetrics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (value) => `$${value.toFixed(2)}`,
    },
  ];

  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (value) => `$${value.toFixed(2)}`,
    },
  ];

  const buyerColumns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (value) => `$${value.toFixed(2)}`,
    },
  ];

  const bestSellingColumns = [
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  const topBuyerColumns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
    },
    {
      title: 'Number of Purchases',
      dataIndex: 'purchases',
      key: 'purchases',
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!metrics) {
    return <div>Error loading sales metrics</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Sales Report</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={metrics.totalEarnings}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Item Earnings">
            <Table
              dataSource={metrics.itemEarnings}
              columns={itemColumns}
              rowKey="item"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Category Earnings">
            <Table
              dataSource={metrics.categoryEarnings}
              columns={categoryColumns}
              rowKey="category"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Buyer Earnings">
            <Table
              dataSource={metrics.buyerEarnings}
              columns={buyerColumns}
              rowKey="buyer"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Best Selling Items">
            <Table
              dataSource={metrics.bestSellingItems}
              columns={bestSellingColumns}
              rowKey="item"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Top Buyers">
            <Table
              dataSource={metrics.topBuyers}
              columns={topBuyerColumns}
              rowKey="buyer"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesReport; 