"use client";

import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

interface CheckAvailabilityButtonProps {
  productName: string;
  productImage?: string;
  size?: "default" | "sm";
}

export function CheckAvailabilityButton({
  productName,
  productImage,
  size = "default",
}: CheckAvailabilityButtonProps) {
  function handleClick() {
    const message = productImage
      ? `Hi, is this available?\n\n*${productName}*\n${productImage}`
      : `Hi, is this available?\n\n*${productName}*`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/91${BUSINESS_INFO.whatsapp}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      className="flex-1 bg-[#006d28] hover:bg-[#1da851] text-white font-semibold"
      size={size === "sm" ? "sm" : "lg"}
      onClick={handleClick}
    >
      <MessageCircle className={size === "sm" ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"} />
      Check Availability
    </Button>
  );
}
