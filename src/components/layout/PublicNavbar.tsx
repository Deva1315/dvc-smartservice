"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Anchor, Box, Button, Group, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

const serviceMenus = [
    { label: "Layanan Servis", href: "/jasa_servis" },
    { label: "Diagnosa AI", href: "/diagnosa_ai" },
    { label: "Tiket Servis", href: "/tiket_servis" },
    { label: "Cek Status", href: "/cek_status" },
];

export default function PublicNavbar() {
    const pathname = usePathname();

    const isProdukActive = pathname === "/produk";
    const isDropPointActive = pathname === "/drop-point";
    const isServisActive = serviceMenus.some((item) => item.href === pathname);

    const navLinkStyle = (active: boolean) => ({
        fontSize: 18,
        lineHeight: 1,
        color: "#FFFFFF",
        fontWeight: 700,
        textDecoration: active ? "underline" : "none",
        textUnderlineOffset: "6px",
        textDecorationThickness: "2px",
    });

    const mobileNavLinkStyle = (active: boolean) => ({
        color: "#FFFFFF",
        fontWeight: 600,
        textDecoration: active ? "underline" : "none",
        textUnderlineOffset: "4px",
        textDecorationThickness: "2px",
    });

    return (
        <Box
            style={{
                width: "100%",
                backgroundColor: "#2F63B8",
                padding: "14px 28px",
            }}
        >
            <Group justify="space-between" align="center" wrap="nowrap">
                <Anchor
                    href="/"
                    underline="never"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 120,
                    }}
                >
                    <Image
                        src="/images/logo-dvc.png"
                        alt="DVC Computer"
                        width={100}
                        height={64}
                        priority
                    />
                </Anchor>

                <Group gap={72} visibleFrom="md" justify="center" style={{ flex: 1 }}>
                    <Anchor href="/produk" underline="never" style={navLinkStyle(isProdukActive)}>
                        Produk
                    </Anchor>

                    <Menu
                        trigger="hover"
                        openDelay={100}
                        closeDelay={120}
                        shadow="md"
                        width={220}
                        radius="md"
                        withinPortal={false}
                    >
                        <Menu.Target>
                            <Anchor
                                component="button"
                                type="button"
                                underline="never"
                                style={{
                                    ...navLinkStyle(isServisActive),
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: 0,
                                }}
                            >
                                Servis
                                <IconChevronDown size={16} stroke={2.2} />
                            </Anchor>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {serviceMenus.map((item) => {
                                const isActive = pathname === item.href;

                                return (
                                    <Menu.Item
                                        key={item.href}
                                        component="a"
                                        href={item.href}
                                        style={{
                                            fontWeight: isActive ? 700 : 500,
                                            textDecoration: isActive ? "underline" : "none",
                                            textUnderlineOffset: "4px",
                                        }}
                                    >
                                        {item.label}
                                    </Menu.Item>
                                );
                            })}
                        </Menu.Dropdown>
                    </Menu>

                    <Anchor
                        href="/drop-point"
                        underline="never"
                        style={navLinkStyle(isDropPointActive)}
                    >
                        Drop Point
                    </Anchor>
                </Group>

                <Button
                    component="a"
                    href="/login"
                    radius="md"
                    size="md"
                    style={{
                        backgroundColor: "#0B4BB3",
                        minWidth: 140,
                        height: 48,
                        fontSize: 18,
                        fontWeight: 600,
                        paddingLeft: 28,
                        paddingRight: 28,
                        flexShrink: 0,
                    }}
                >
                    Login
                </Button>
            </Group>

            <Group hiddenFrom="md" mt="md" gap="lg">
                <Anchor
                    href="/produk"
                    underline="never"
                    style={mobileNavLinkStyle(isProdukActive)}
                >
                    Produk
                </Anchor>

                <Menu shadow="md" width={220} radius="md" withinPortal={false}>
                    <Menu.Target>
                        <Anchor
                            component="button"
                            type="button"
                            underline="never"
                            style={{
                                ...mobileNavLinkStyle(isServisActive),
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: 0,
                            }}
                        >
                            Servis
                            <IconChevronDown size={16} />
                        </Anchor>
                    </Menu.Target>

                    <Menu.Dropdown>
                        {serviceMenus.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <Menu.Item
                                    key={item.href}
                                    component="a"
                                    href={item.href}
                                    style={{
                                        fontWeight: isActive ? 700 : 500,
                                        textDecoration: isActive ? "underline" : "none",
                                        textUnderlineOffset: "4px",
                                    }}
                                >
                                    {item.label}
                                </Menu.Item>
                            );
                        })}
                    </Menu.Dropdown>
                </Menu>

                <Anchor
                    href="/drop-point"
                    underline="never"
                    style={mobileNavLinkStyle(isDropPointActive)}
                >
                    Drop Point
                </Anchor>
            </Group>
        </Box>
    );
}