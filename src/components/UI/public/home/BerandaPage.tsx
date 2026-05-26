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
import { motion } from "framer-motion";
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
      "Cek kerusakan perangkat secara otomatis dengan bantuan AI sebelum melakukan servis.",
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
      "Buat tiket servis dengan mudah dan pantau proses perbaikan perangkatmu secara transparan.",
    buttonLabel: "Coba",
    href: "/tiket_servis",
    image: "/images/tiket-servis-card.png",
    background: "#FFFFFF",
    textColor: "#111111",
    bordered: true,
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function BerandaPage() {
  return (
    <Box bg="#F5F5F5">
      {/* HERO */}
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
              "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)",
            backdropFilter: "blur(2px)",
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Box maw={520}>
              <Text
                c="white"
                fw={700}
                style={{
                  fontSize: "clamp(30px, 3vw, 52px)",
                  lineHeight: 1.25,
                  textShadow: "0 4px 18px rgba(0,0,0,0.35)",
                }}
              >
                Servis perangkat jadi lebih mudah dan modern bersama DVC
                SmartService
              </Text>

              <Text
                mt={20}
                c="rgba(255,255,255,0.88)"
                style={{
                  fontSize: "clamp(16px, 1.2vw, 22px)",
                  lineHeight: 1.7,
                }}
              >
                Buat tiket servis, cek kerusakan dengan AI, dan pantau proses
                perbaikan secara real-time.
              </Text>

              <Group mt={28}>
                <Button
                  component="a"
                  href="/tiket_servis"
                  radius="md"
                  size="lg"
                  style={{
                    backgroundColor: "#0D4CB5",
                    fontWeight: 700,
                  }}
                >
                  Buat Tiket
                </Button>

                <Button
                  component="a"
                  href="/diagnosa_ai"
                  radius="md"
                  size="lg"
                  variant="white"
                  color="dark"
                  style={{
                    fontWeight: 700,
                  }}
                >
                  Diagnosa AI
                </Button>
              </Group>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* KATEGORI */}
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

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={36}>
              {popularCategories.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                  }}
                >
                  <Anchor
                    href={item.href}
                    underline="never"
                    style={{ color: "inherit" }}
                  >
                    <Stack
                      align="center"
                      gap={18}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 24,
                        padding: 24,
                        border: "1px solid #ECECEC",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Box
                        style={{
                          position: "relative",
                          width: "100%",
                          maxWidth: 360,
                          aspectRatio: "1.25 / 1",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.06,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                          }}
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="180px"
                            style={{ objectFit: "contain" }}
                          />
                        </motion.div>
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
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Stack>
      </Container>

      {/* DVC CARDS */}
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
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{
                  y: -8,
                }}
              >
                <Paper
                  radius={34}
                  p={{ base: 24, md: 32 }}
                  shadow="sm"
                  style={{
                    minHeight: 280,
                    backgroundColor: card.background,
                    border: card.bordered
                      ? "1px solid rgba(0, 0, 0, 0.10)"
                      : "none",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
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
                            opacity:
                              card.title === "Diagnosa AI" ? 0.95 : 1,
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

                    <motion.div
                      whileHover={{
                        scale: 1.05,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
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
                    </motion.div>
                  </Group>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* DROP POINT */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <Box bg="#A9C8EB" mt={30}>
          <Container size="xl" py={44}>
            <SimpleGrid
              cols={{ base: 1, lg: 2 }}
              spacing={24}
              verticalSpacing={24}
            >
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
                  Menyediakan informasi lokasi drop point untuk memudahkan
                  pengguna dalam pengiriman perangkat servis secara efisien.
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
                  style={{
                    objectFit: "contain",
                    objectPosition: "center right",
                    filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.10))",
                  }}
                />
              </Box>
            </SimpleGrid>
          </Container>
        </Box>
      </motion.div>

      {/* FOOTER TANPA ANIMASI */}
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