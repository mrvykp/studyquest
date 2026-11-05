import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";
import { usePracticeActivity } from "../hooks/usePractice";
import {
  calculateCurrentStreak,
  getDailyPracticeStats,
} from "../utils/practiceStats";
import DailyReviewChart from "../components/practice/DailyReviewChart";

const PracticeActivityPage = () => {
  const {
    data: reviews = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePracticeActivity();

  if (isPending) {
    return <Spin size="large" />;
  }

  if (isError) {
    return (
      <Alert type="error" showIcon title="Could not load practice activity" />
    );
  }

  const today = new Date();

  const dailyStats = getDailyPracticeStats(reviews, today);

  const currentStreak = calculateCurrentStreak(reviews, today);

  const todayStats = dailyStats[6] ?? {
    date: "",
    reviewed: 0,
    remembered: 0,
    forgot: 0,
    rememberedPercentage: 0,
  };
  return (
    <Flex vertical gap={24}>
      <Flex align="center" justify="space-between">
        <div>
          <Typography.Title level={3}>Practice Activity</Typography.Title>

          <Typography.Text type="secondary">
            Track your daily flashcard progress.
          </Typography.Text>
        </div>

        <Button loading={isFetching} onClick={() => void refetch()}>
          Refresh
        </Button>
      </Flex>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Reviewed Today" value={todayStats.reviewed} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Remembered Today" value={todayStats.remembered} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Remembered Rate"
              value={todayStats.rememberedPercentage}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Streak"
              value={currentStreak}
              suffix="days"
            />
          </Card>
        </Col>
      </Row>
      {reviews.length === 0 && (
        <Alert
          type="info"
          showIcon
          title="No practice activity yet"
          description="Complete a Flashcard review to start tracking your progress."
        />
      )}
      <DailyReviewChart stats={dailyStats} />
    </Flex>
  );
};

export default PracticeActivityPage;
