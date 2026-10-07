import { createAdminHandler } from "@/rally/adminApi";
import { rally } from "@/rally/config";

export const POST = createAdminHandler(rally);
