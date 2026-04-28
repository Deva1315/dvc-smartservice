"use client";

import { ReactNode } from "react";
import { ActionIcon, Divider, Menu, MenuItemProps } from "@mantine/core";
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconChecks,
  IconX,
  IconCreditCard,
  IconFileInvoice,
} from "@tabler/icons-react";

export type RowActionIconName =
  | "eye"
  | "edit"
  | "delete"
  | "add"
  | "print"
  | "download"
  | "check"
  | "x"
  | "payment"
  | "invoice";

export type RowActionMenuItem = {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  iconName?: RowActionIconName;
  color?: MenuItemProps["color"];
  disabled?: boolean;
  hidden?: boolean;
  dividerBefore?: boolean;
};

type RowActionMenuProps = {
  actions: RowActionMenuItem[];
  label?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  position?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
  stopPropagation?: boolean;
};

function getIconByName(iconName?: RowActionIconName) {
  const size = 16;

  switch (iconName) {
    case "eye":
      return <IconEye size={size} />;
    case "edit":
      return <IconPencil size={size} />;
    case "delete":
      return <IconTrash size={size} />;
    case "add":
      return <IconPlus size={size} />;
    case "print":
      return <IconPrinter size={size} />;
    case "download":
      return <IconDownload size={size} />;
    case "check":
      return <IconChecks size={size} />;
    case "x":
      return <IconX size={size} />;
    case "payment":
      return <IconCreditCard size={size} />;
    case "invoice":
      return <IconFileInvoice size={size} />;
    default:
      return null;
  }
}

export default function RowActionMenu({
  actions,
  label = "Menu aksi",
  disabled = false,
  size = "md",
  position = "bottom-end",
  stopPropagation = true,
}: RowActionMenuProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  const isDisabled = disabled || visibleActions.length === 0;

  return (
    <Menu
      shadow="md"
      width={190}
      position={position}
      withinPortal
      disabled={isDisabled}
    >
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="xl"
          size={size}
          aria-label={label}
          disabled={isDisabled}
          onClick={(event) => {
            if (stopPropagation) {
              event.stopPropagation();
            }
          }}
        >
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {visibleActions.map((action, index) => {
          const icon = action.icon ?? getIconByName(action.iconName);

          return (
            <div key={`${action.label}-${index}`}>
              {action.dividerBefore ? <Divider my={4} /> : null}

              <Menu.Item
                leftSection={icon}
                color={action.color}
                disabled={action.disabled}
                onClick={(event) => {
                  if (stopPropagation) {
                    event.stopPropagation();
                  }

                  action.onClick?.();
                }}
              >
                {action.label}
              </Menu.Item>
            </div>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}