"use client";

import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Image from "next/image";

const popularCategories = [
  {
    title: "Laptop",
    image: "/images/laptop.png",
    href: "/produk",
  },
  {
    title: "Dekstop",
    image: "/images/desktop.png",
    href: "/produk",
  },
  {
    title: "Printer",
    image: "/images/printer.png",
    href: "/produk",
  },
];

const dvcCards = [
  {
    title: "Diagnosa AI",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.",
    buttonLabel: "Coba",
    href: "/diagnosa_ai",
    image: "/images/diagnosa-ai-card.png",
    background: "#A9C8EB",
    textColor: "#FFFFFF",
    bordered: false,
  },
  {
    title: "Tiket Servis",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.",
    buttonLabel: "Coba",
    href: "/tiket_servis",
    image: "/images/tiket-servis-card.png",
    background: "#FFFFFF",
    textColor: "#111111",
    bordered: true,
  },
];

export default function BerandaPage() {
  return (
    <Box bg="#F5F5F5">
      <Box
        style={{
          position: "relative",
          minHeight: 520,
          overflow: "hidden",
          backgroundImage: "url('/images/hero-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.20) 45%, rgba(0,0,0,0.10) 100%)",
          }}
        />

        <Container
          size="xl"
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: 520,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box maw={420}>
            <Text
              c="white"
              fw={400}
              style={{
                fontSize: "clamp(24px, 2.4vw, 40px)",
                lineHeight: 1.35,
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
              turpis molestie, dictum est a, mattis tellus.
            </Text>
          </Box>
        </Container>
      </Box>

      <Container size="xl" py={70}>
        <Stack gap={40}>
          <Title
            order={2}
            ta="center"
            style={{
              fontSize: "clamp(28px, 2.6vw, 44px)",
              fontWeight: 800,
              color: "#111111",
            }}
          >
            Telusuri Kategori Terpopuler
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={36}>
            {popularCategories.map((item) => (
              <Anchor
                key={item.title}
                href={item.href}
                underline="never"
                style={{ color: "inherit" }}
              >
                <Stack align="center" gap={18}>
                  <Box
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 360,
                      aspectRatio: "1.25 / 1",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="180px"
                      style={{ objectFit: "contain" }}
                    />
                  </Box>

                  <Text
                    fw={800}
                    ta="center"
                    style={{
                      fontSize: "clamp(28px, 2vw, 40px)",
                      color: "#111111",
                    }}
                  >
                    {item.title}
                  </Text>
                </Stack>
              </Anchor>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Container size="xl" py={50}>
        <Stack gap={36}>
          <Title
            order={2}
            ta="center"
            style={{
              fontSize: "clamp(28px, 2.6vw, 44px)",
              fontWeight: 800,
              color: "#111111",
            }}
          >
            Temukan Lebih Banyak Hal dengan DVC
          </Title>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={28}>
            {dvcCards.map((card) => (
              <Paper
                key={card.title}
                radius={34}
                p={{ base: 24, md: 32 }}
                shadow="sm"
                style={{
                  minHeight: 280,
                  backgroundColor: card.background,
                  border: card.bordered ? "1px solid rgba(0, 0, 0, 0.10)" : "none",
                  overflow: "hidden",
                }}
              >
                <Group
                  align="stretch"
                  justify="space-between"
                  wrap="nowrap"
                  style={{ height: "100%" }}
                >
                  <Stack
                    justify="space-between"
                    gap={24}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Box>
                      <Text
                        fw={800}
                        style={{
                          fontSize: "clamp(24px, 2vw, 34px)",
                          color: card.textColor,
                          marginBottom: 14,
                        }}
                      >
                        {card.title}
                      </Text>

                      <Text
                        style={{
                          fontSize: "clamp(18px, 1.5vw, 28px)",
                          lineHeight: 1.4,
                          color: card.textColor,
                          opacity: card.title === "Diagnosa AI" ? 0.95 : 1,
                        }}
                      >
                        {card.description}
                      </Text>
                    </Box>

                    <Button
                      component="a"
                      href={card.href}
                      radius="md"
                      size="xl"
                      style={{
                        width: 190,
                        height: 56,
                        backgroundColor: "#0D4CB5",
                        fontSize: 20,
                        fontWeight: 700,
                      }}
                    >
                      {card.buttonLabel}
                    </Button>
                  </Stack>

                  <Box
                    visibleFrom="sm"
                    style={{
                      position: "relative",
                      width: 180,
                      minWidth: 180,
                      alignSelf: "end",
                      aspectRatio: "1 / 1",
                    }}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Box bg="#A9C8EB" mt={30}>
        <Container size="xl" py={44}>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={24} verticalSpacing={24}>
            <Stack justify="center" gap={18}>
              <Title
                order={2}
                style={{
                  fontSize: "clamp(28px, 2.5vw, 44px)",
                  fontWeight: 800,
                  color: "#111111",
                }}
              >
                Drop Point untuk Kemudahan Servis
              </Title>

              <Text
                c="white"
                style={{
                  fontSize: "clamp(18px, 1.55vw, 28px)",
                  lineHeight: 1.5,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                eu turpis molestie, dictum est a, mattis tellus. Sed dignissim,
                metus nec fringilla accumsan, risus sem sollicitudin lacus, ut
                interdum tellus elit sed risus. Maecenas eget condimentum velit,
                sit amet feugiat lectus. Class aptent taciti sociosqu ad litora
                torquent per conubia nostra, per inceptos himenaeos.
              </Text>

              <Button
                component="a"
                href="/drop-point"
                radius="md"
                size="xl"
                style={{
                  width: 160,
                  height: 58,
                  backgroundColor: "#0D4CB5",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                Lihat
              </Button>
            </Stack>

            <Box
              style={{
                position: "relative",
                width: "100%",
                minHeight: 280,
              }}
            >
              <Image
                src="/images/drop-point-section.png"
                alt="Drop Point"
                fill
                sizes="(max-width: 62em) 100vw, 50vw"
                style={{ objectFit: "contain", objectPosition: "center right" }}
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Box bg="#F5F5F5" pt={52}>
        <Container size="md">
          <Stack align="center" gap={14}>
            <Box
              style={{
                position: "relative",
                width: 180,
                height: 150,
              }}
            >
              <Image
                src="/images/logo-dvc.png"
                alt="DVC Computer"
                fill
                sizes="180px"
                style={{ objectFit: "contain" }}
              />
            </Box>

            <Group gap={8} justify="center">
              <IconPhone size={18} />
              <Text size="md" c="#111111">
                Telp : 08174762502
              </Text>
            </Group>

            <Group gap={8} justify="center" wrap="nowrap">
              <IconMapPin size={18} />
              <Text size="md" c="#111111" ta="center">
                Jl. Ciung Wanara, No. 99X, Kec. Sukawati Bali 80582
              </Text>
            </Group>

            <Group gap={14} justify="center" mt={6}>
              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Facebook"
              >
                <IconBrandFacebook size={28} />
              </Anchor>
              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Instagram"
              >
                <IconBrandInstagram size={28} />
              </Anchor>
              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Twitter"
              >
                <IconBrandTwitter size={28} />
              </Anchor>
            </Group>
          </Stack>
        </Container>

        <Box
          mt={46}
          py={18}
          bg="#0D3F8F"
          style={{
            textAlign: "center",
          }}
        >
          <Text c="white" size="sm">
            © 2026 All rights reserved. DVC Smart Service
          </Text>
        </Box>
      </Box>
    </Box>
  );
}