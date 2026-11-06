import { Button, Card, Flex, Statistic, Typography } from "antd";
import type { IPracticeSummary } from "../../types/practice";

interface PracticeSummaryProps {
  summary: IPracticeSummary;
  restarting: boolean;
  onPracticeAgain: () => void;
  onBackToPractice: () => void;
}
/**
 *
 * @param param0 tets
 * @returns
 */

const PracticeSummary = ({
  summary,
  restarting,
  onBackToPractice,
  onPracticeAgain,
}: PracticeSummaryProps) => {
  return (
    <Card title="Practice Completed">
      <Flex vertical gap={24}>
        <Typography.Text type="secondary">
          You've completed your flashcard practice session.
        </Typography.Text>

        <Flex gap={24} wrap="wrap">
          <Statistic title="Reviewed" value={summary.reviewed} />

          <Statistic title="Remembered" value={summary.remembered} />

          <Statistic title="Forgot" value={summary.forgot} />

          <Statistic
            title="Remembered Rate"
            value={summary.percentage}
            suffix="%"
          />
        </Flex>

        <Flex gap={12} wrap="wrap">
          <Button type="primary" loading={restarting} onClick={onPracticeAgain}>
            Practice Again
          </Button>

          <Button disabled={restarting} onClick={onBackToPractice}>
            Back to Practice
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default PracticeSummary;
