import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Row, Col, Spin, Table, Typography } from 'antd';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import moment from 'moment';
import axios from 'axios';
import './DashBoard.css';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashBoard = () => {
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    callsPerAgent: [],
    sentimentDistribution: [],
    topCategories: [],
    agentSentimentStats: [],
    avgDurationPerCategory: [],
    supervisorActions: [],
    agentAvgDuration: [],
    sentimentRatioByCategory: [],
    avgConfidenceBySentiment: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const format = 'YYYY-MM-DD';

      const params = {
        start_date: startDate.format(format),
        end_date: endDate.format(format)
      };

      const endpoints = [
        'gettotalcallsperagent',
        'GetSentimentDistribution',
        'GetTopComplaintCategories',
        'GetAgentSentimentStats',
        'GetAverageCallDurationPerCategory',
        'GetRecentSupervisorActions',
        'GetAgentAverageCallDuration',
        'GetSentimentRatioByCategory',
        'GetAverageConfidenceBySentiment'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => 
          axios.get(`http://127.0.0.1:5000/api/${endpoint}`, { params })
        )
      );

      setDashboardData({
        callsPerAgent: responses[0].data,
        sentimentDistribution: responses[1].data,
        topCategories: responses[2].data,
        agentSentimentStats: responses[3].data,
        avgDurationPerCategory: responses[4].data,
        supervisorActions: responses[5].data,
        agentAvgDuration: responses[6].data,
        sentimentRatioByCategory: responses[7].data,
        avgConfidenceBySentiment: responses[8].data
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  const agentColumns = [
    {
      title: 'Agent',
      dataIndex: 'AgentName',
      key: 'AgentName',
    },
    {
      title: 'Positive',
      dataIndex: 'PositiveCalls',
      key: 'PositiveCalls',
      sorter: (a, b) => a.PositiveCalls - b.PositiveCalls,
    },
    {
      title: 'Negative',
      dataIndex: 'NegativeCalls',
      key: 'NegativeCalls',
      sorter: (a, b) => a.NegativeCalls - b.NegativeCalls,
    },
    {
      title: 'Neutral',
      dataIndex: 'NeutralCalls',
      key: 'NeutralCalls',
      sorter: (a, b) => a.NeutralCalls - b.NeutralCalls,
    },
  ];

  const actionsColumns = [
    {
      title: 'Agent',
      dataIndex: 'AgentName',
      key: 'AgentName',
    },
    {
      title: 'Action',
      dataIndex: 'ActionType',
      key: 'ActionType',
    },
    {
      title: 'Date',
      dataIndex: 'ActionDate',
      key: 'ActionDate',
      render: date => moment(date).format('MMM D, YYYY')
    },
    {
      title: 'Notes',
      dataIndex: 'Notes',
      key: 'Notes',
      ellipsis: true
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>Call Center Analytics Dashboard</Title>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          disabledDate={current => current && current > moment().endOf('day')}
        />
      </div>

      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="dashboard-row">
            <Col span={12}>
              <Card title="Total Calls per Agent">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.callsPerAgent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="AgentName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="TotalCalls" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Sentiment Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="Sentiment Count"
                      nameKey="Sentiment"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="dashboard-row">
            <Col span={12}>
              <Card title="Top Complaint Categories">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={dashboardData.topCategories}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="CategoryName" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CategoryCount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Agent Sentiment Stats">
                <Table
                  columns={agentColumns}
                  dataSource={dashboardData.agentSentimentStats}
                  size="small"
                  pagination={false}
                  scroll={{ y: 240 }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="dashboard-row">
            <Col span={12}>
              <Card title="Average Call Duration by Category (seconds)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.avgDurationPerCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="CategoryName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="AverageDuration"
                      stroke="#ff7300"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Supervisor Actions">
                <Table
                  columns={actionsColumns}
                  dataSource={dashboardData.supervisorActions}
                  size="small"
                  pagination={false}
                  scroll={{ y: 240 }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="dashboard-row">
            <Col span={12}>
              <Card title="Agent Average Call Duration (seconds)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.agentAvgDuration}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="AgentName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="AverageDuration" fill="#413ea0" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Average Confidence by Sentiment">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.avgConfidenceBySentiment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Sentiment" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="AverageConfidence" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashBoard;