"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCamera,
  IconCheck,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { DashboardSessionUser } from "@/lib/auth/get-dashboard-user";
import { getUserInitials } from "@/lib/auth/get-dashboard-user";
import {
  getOwnerProfileRequest,
  updateOwnerProfileRequest,
  type OwnerProfileUser,
} from "@/lib/owner/owner-profile-client";

type OwnerProfilePageProps = {
  user: DashboardSessionUser;
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string | null;
  photoFile: File | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca file"));
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

function ProfileFieldView({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <Box style={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <Text
        fw={700}
        c="#7B8794"
        style={{
          fontSize: 16,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Text
        c="#111111"
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Text>
    </Box>
  );
}

function mapApiUserToDashboardUser(user: OwnerProfileUser): DashboardSessionUser {
  return {
    id: user.id,
    name: user.nama,
    email: user.email,
    roleId: user.roleId,
    roleKey: "owner",
    roleName: user.roleName,
    address: user.address,
    phone: user.phone,
    avatarUrl: user.photoProfilePath,
  };
}

function mapUserToForm(user: DashboardSessionUser): ProfileFormState {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
    avatarUrl: user.avatarUrl,
    photoFile: null,
  };
}

export default function OwnerProfilePage({ user }: OwnerProfilePageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileUser, setProfileUser] = useState<DashboardSessionUser>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(mapUserToForm(user));

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);

        const result = await getOwnerProfileRequest();

        if (!isMounted) return;

        if (!result.success) {
          return;
        }

        const nextUser = mapApiUserToDashboardUser(result.user);
        setProfileUser(nextUser);
        setForm(mapUserToForm(nextUser));
      } catch {
        // abaikan, tetap pakai initial session user
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStartEdit = () => {
    setForm(mapUserToForm(profileUser));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm(mapUserToForm(profileUser));
    setIsEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseImage = () => {
    if (!isEditing) {
      notifications.show({
        title: "Info",
        message: "Klik Edit Profile terlebih dahulu untuk mengganti foto profile.",
        color: "blue",
      });
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.currentTarget;
    const selectedFile = inputElement.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      notifications.show({
        title: "Gagal",
        message: "File yang dipilih harus berupa gambar.",
        color: "red",
      });
      inputElement.value = "";
      return;
    }

    try {
      const previewUrl = await fileToDataUrl(selectedFile);

      setForm((prev) => ({
        ...prev,
        photoFile: selectedFile,
        avatarUrl: previewUrl,
      }));
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Gagal membaca file gambar.",
        color: "red",
      });
      inputElement.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      notifications.show({
        title: "Validasi gagal",
        message: "Nama dan email wajib diisi.",
        color: "red",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      notifications.show({
        title: "Validasi gagal",
        message: "Format email tidak valid.",
        color: "red",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = new FormData();
      payload.append("nama", form.name.trim());
      payload.append("email", form.email.trim().toLowerCase());
      payload.append("phone", form.phone.trim());
      payload.append("address", form.address.trim());

      if (form.photoFile) {
        payload.append("photo", form.photoFile);
      }

      const result = await updateOwnerProfileRequest(payload);

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });
        return;
      }

      const nextUser = mapApiUserToDashboardUser(result.user);

      setProfileUser(nextUser);
      setForm(mapUserToForm(nextUser));
      setIsEditing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      notifications.show({
        title: "Berhasil",
        message: result.message,
        color: "green",
      });

      router.refresh();
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat menyimpan profile owner.",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack gap={22}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      <Paper
        radius={14}
        p={28}
        shadow="sm"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group align="flex-start" gap={24} wrap="nowrap">
            <Box style={{ position: "relative" }}>
              <Avatar
                size={174}
                radius={36}
                src={form.avatarUrl || undefined}
                color="blue"
                style={{
                  backgroundColor: "#F3F4F6",
                }}
              >
                {getUserInitials(form.name)}
              </Avatar>

              <ActionIcon
                variant="filled"
                color="blue"
                radius="xl"
                size={38}
                onClick={handleChooseImage}
                aria-label="Ganti foto profile"
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                }}
              >
                <IconCamera size={20} stroke={2} />
              </ActionIcon>
            </Box>

            <Stack gap={8} pt={6}>
              <Text
                fw={800}
                c="#111111"
                style={{
                  fontSize: 32,
                  lineHeight: 1.2,
                }}
              >
                {form.name || "-"}
              </Text>

              <Group gap={8} wrap="nowrap">
                <IconMail size={20} stroke={1.8} color="#6B7280" />
                <Text c="#6B7280" style={{ fontSize: 16 }}>
                  {form.email || "-"}
                </Text>
              </Group>

              <Group gap={8} wrap="nowrap">
                <IconPhone size={20} stroke={1.8} color="#6B7280" />
                <Text c="#6B7280" style={{ fontSize: 16 }}>
                  {form.phone || "-"}
                </Text>
              </Group>

              <Group gap={8} wrap="nowrap" align="flex-start">
                <IconMapPin
                  size={20}
                  stroke={1.8}
                  color="#6B7280"
                  style={{ marginTop: 2 }}
                />
                <Text c="#6B7280" style={{ fontSize: 16 }}>
                  {form.address || "-"}
                </Text>
              </Group>
            </Stack>
          </Group>

          {!isEditing ? (
            <Button
              radius="md"
              leftSection={<IconPencil size={18} stroke={2} />}
              onClick={handleStartEdit}
              style={{
                height: 44,
                backgroundColor: "#E8F7F0",
                color: "#0AA96B",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Group gap={10}>
              <Button
                radius="md"
                variant="light"
                color="red"
                leftSection={<IconX size={18} stroke={2} />}
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{
                  height: 44,
                  fontWeight: 700,
                }}
              >
                Batal
              </Button>

              <Button
                radius="md"
                leftSection={
                  isSaving ? undefined : <IconCheck size={18} stroke={2} />
                }
                onClick={handleSave}
                loading={isSaving}
                style={{
                  height: 44,
                  backgroundColor: "#0D4CB5",
                  fontWeight: 700,
                }}
              >
                Simpan
              </Button>
            </Group>
          )}
        </Group>
      </Paper>

      <Paper
        radius={14}
        p={28}
        shadow="sm"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        <Stack gap={22}>
          <Text
            fw={800}
            c="#111111"
            style={{
              fontSize: 22,
              lineHeight: 1.2,
            }}
          >
            Profile Information
          </Text>

          <Divider color="#D1D5DB" />

          {isLoadingProfile ? (
            <Stack align="center" py={24}>
              <Loader />
            </Stack>
          ) : !isEditing ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={28}>
              <ProfileFieldView label="Name" value={profileUser.name} />
              <ProfileFieldView
                label="Address"
                value={profileUser.address || "-"}
              />
              <ProfileFieldView label="Email" value={profileUser.email} />
              <ProfileFieldView label="Phone" value={profileUser.phone || "-"} />
              <Box>
                <Text
                  fw={700}
                  c="#7B8794"
                  style={{
                    fontSize: 16,
                    marginBottom: 6,
                  }}
                >
                  Role
                </Text>

                <Badge
                  color="green"
                  variant="light"
                  radius="xl"
                  styles={{
                    label: {
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                    },
                  }}
                >
                  {profileUser.roleName.toUpperCase()}
                </Badge>
              </Box>
            </SimpleGrid>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={20}>
              <TextInput
                label="Name"
                value={form.name}
                onChange={(event) =>
                  handleChange("name", event.currentTarget.value)
                }
                radius="md"
              />

              <TextInput
                label="Email"
                value={form.email}
                onChange={(event) =>
                  handleChange("email", event.currentTarget.value)
                }
                radius="md"
              />

              <TextInput
                label="Phone"
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.currentTarget.value)
                }
                radius="md"
              />

              <Box>
                <Text
                  fw={700}
                  c="#7B8794"
                  style={{
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Role
                </Text>

                <Badge
                  color="green"
                  variant="light"
                  radius="xl"
                  styles={{
                    label: {
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                    },
                  }}
                >
                  {profileUser.roleName.toUpperCase()}
                </Badge>
              </Box>

              <Box style={{ gridColumn: "1 / -1" }}>
                <Textarea
                  label="Address"
                  value={form.address}
                  onChange={(event) =>
                    handleChange("address", event.currentTarget.value)
                  }
                  minRows={4}
                  radius="md"
                />
              </Box>
            </SimpleGrid>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}