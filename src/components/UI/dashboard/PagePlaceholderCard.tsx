import { Badge, Paper, Stack, Text } from "@mantine/core";

type PagePlaceholderCardProps = {
  title: string;
  description: string;
};

export default function PagePlaceholderCard({
  title,
  description,
}: PagePlaceholderCardProps) {
  return (
    <Paper
      radius={24}
      p={28}
      shadow="sm"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F1F3F5",
      }}
    >
      <Stack gap={14}>
        <Badge color="blue" variant="light" radius="sm" w="fit-content">
          Owner
        </Badge>

        <Text
          fw={800}
          c="#111827"
          style={{
            fontSize: 28,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Text>

        <Text
          c="#4B5563"
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 760,
          }}
        >
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}