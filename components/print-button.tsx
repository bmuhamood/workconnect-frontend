"use client";
import { Printer } from "lucide-react";
import { btn } from "@/components/ui";
export const PrintButton = () => <button onClick={() => window.print()} className={btn("secondary", "md") + " print:hidden"}><Printer className="size-4" />Print / save as PDF</button>;
