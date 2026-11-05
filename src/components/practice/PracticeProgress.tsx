import { Flex, Progress, Typography } from "antd";

interface PracticeProgressProps {
  reviewed: number;
  total: number;
}

const PracticeProgress = ({ reviewed, total }: PracticeProgressProps) => {
  const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between" align="center">
        <Typography.Text strong>Practice Progress</Typography.Text>

        <Typography.Text type="secondary">
          {reviewed} / {total}
        </Typography.Text>
      </Flex>

      <Progress percent={percentage} showInfo={false} />
    </Flex>
  );
};

export default PracticeProgress;
