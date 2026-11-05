import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  BookOutlined,
  DatabaseOutlined,
  FormOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Typography } from "antd";

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();

  const selectedMenuKey =
    location.pathname === "/practice/activity"
      ? "/practice/activity"
      : location.pathname.startsWith("/quizzes")
        ? "/quizzes/new"
        : ["/subjects", "/questions", "/practice"].find(
            (path) =>
              location.pathname === path ||
              location.pathname.startsWith(`${path}/`),
          );

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Typography.Title level={4} style={{ color: "white", margin: 0 }}>
          StudyQuest
        </Typography.Title>
      </Header>

      <Layout>
        <Sider width={220} theme="light">
          <Menu
            mode="inline"
            selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
            items={[
              {
                key: "/subjects",
                icon: <BookOutlined />,
                label: <Link to="/subjects">Subjects</Link>,
              },
              {
                key: "/questions",
                icon: <DatabaseOutlined />,
                label: <Link to="/questions">Question Bank</Link>,
              },
              {
                key: "/practice",
                icon: <PlayCircleOutlined />,
                label: <Link to="/practice">Daily Practice</Link>,
              },
              {
                key: "/practice/activity",
                icon: <BarChartOutlined />,
                label: <Link to="/practice/activity">Practice Activity</Link>,
              },
              {
                key: "/quizzes/new",
                icon: <FormOutlined />,
                label: <Link to="/quizzes/new">Quiz Builder</Link>,
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              marginTop: 20,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
