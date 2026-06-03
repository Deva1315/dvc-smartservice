"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconAt,
  IconCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import {
  getCurrentSession,
  getDashboardPathByRoleName,
  loginRequest,
} from "@/lib/auth/auth.client";
import { loginFormSchema, validateWithZod } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const result = await getCurrentSession();

        if (!isMounted) return;

        if (result.success && result.authenticated && result.user) {
          const redirectPath = getDashboardPathByRoleName(result.user.roleName);
          router.replace(redirectPath);
          router.refresh();
          return;
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    router.prefetch("/owner/dashboard");
    router.prefetch("/admin_penjualan/jasa-servis");
    router.prefetch("/admin_gudang/barang");
    router.prefetch("/teknisi/antrian-tiket-servis");
  }, [router]);

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const parsed = validateWithZod(loginFormSchema, {
      email,
      password,
    });

    if (!parsed.success) {
      setErrors(parsed.errors);

      notifications.show({
        color: "red",
        title: "Login gagal",
        message: parsed.message,
        icon: <IconAlertCircle size={18} />,
        autoClose: 3000,
      });

      return;
    }

    setErrors({});

    try {
      setIsSubmitting(true);

      const result = await loginRequest({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!result.success) {
        notifications.show({
          color: "red",
          title: "Login gagal",
          message: result.message ?? "Email atau password salah.",
          icon: <IconAlertCircle size={18} />,
          autoClose: 3500,
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Login berhasil",
        message: `Selamat datang, ${result.user.nama}.`,
        icon: <IconCheck size={18} />,
        autoClose: 1800,
      });

      const redirectPath = getDashboardPathByRoleName(result.user.roleName);

      router.replace(redirectPath);
    } catch {
      notifications.show({
        color: "red",
        title: "Terjadi kesalahan",
        message: "Gagal terhubung ke server. Silakan coba lagi.",
        icon: <IconAlertCircle size={18} />,
        autoClose: 3500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (isCheckingSession) {
    return null;
  }

  return (
    <Box
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <Flex
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Flex
          visibleFrom="md"
          align="center"
          justify="center"
          style={{
            flex: 1.05,
            backgroundColor: "#4D73C5",
            padding: "32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 760,
              height: "100%",
              maxHeight: 760,
            }}
          >
            <Image
              src="/images/login-illustration.png"
              alt="Login Illustration"
              fill
              priority
              sizes="(max-width: 48em) 100vw, 50vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </Flex>

        <Flex
          align="center"
          justify="center"
          style={{
            flex: 1,
            padding: "32px 40px",
            backgroundColor: "#F5F5F7",
            overflow: "hidden",
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              width: "100%",
              maxWidth: 560,
            }}
          >
            <Stack gap={34} align="center">
              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: "clamp(30px, 3vw, 58px)",
                  fontWeight: 900,
                  color: "#111111",
                  letterSpacing: 0.5,
                }}
              >
                DVC SMART SERVICE
              </Title>

              <Stack gap={26} w="100%">
                <TextInput
                  value={email}
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    clearFieldError("email");
                  }}
                  radius="md"
                  size="lg"
                  placeholder="Email"
                  error={errors.email}
                  leftSection={
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      radius="xl"
                      tabIndex={-1}
                    >
                      <IconAt size={20} />
                    </ActionIcon>
                  }
                  styles={{
                    input: {
                      height: 70,
                      border: errors.email
                        ? "2px solid #FA5252"
                        : "2px solid #6B6B6B",
                      backgroundColor: "#FFFFFF",
                      fontSize: 18,
                      paddingLeft: 52,
                    },
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
                  }}
                />

                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.currentTarget.value);
                    clearFieldError("password");
                  }}
                  radius="md"
                  size="lg"
                  placeholder="Password"
                  error={errors.password}
                  leftSection={
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      radius="xl"
                      tabIndex={-1}
                    >
                      <IconShieldLock size={20} />
                    </ActionIcon>
                  }
                  styles={{
                    input: {
                      height: 70,
                      border: errors.password
                        ? "2px solid #FA5252"
                        : "2px solid #6B6B6B",
                      backgroundColor: "#FFFFFF",
                      fontSize: 18,
                      paddingLeft: 52,
                    },
                    innerInput: {
                      fontSize: 18,
                    },
                    error: {
                      fontSize: 14,
                      marginTop: 6,
                    },
                  }}
                />
              </Stack>

              <Button
                type="submit"
                radius="md"
                style={{
                  width: "100%",
                  maxWidth: 340,
                  height: 68,
                  backgroundColor: "#0D4CB5",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
                loading={isSubmitting}
              >
                Login
              </Button>

              <Button
                type="button"
                variant="subtle"
                color="gray"
                radius="md"
                leftSection={<IconArrowLeft size={20} />}
                onClick={handleBackToHome}
                style={{
                  width: "100%",
                  maxWidth: 340,
                  height: 54,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Kembali ke Beranda
              </Button>

              <Text c="dimmed" size="md" ta="center">
                Silakan login sesuai role anda
              </Text>
            </Stack>
          </form>
        </Flex>
      </Flex>
    </Box>
  );
}