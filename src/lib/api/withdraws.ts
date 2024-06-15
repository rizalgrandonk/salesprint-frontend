import { Withdraw } from "@/types/Withdraw";
import { protectedRequest } from ".";

export async function createStoreWithdraw(
  data: Partial<Withdraw>,
  token: string
) {
  return await protectedRequest<Withdraw>({
    method: "POST",
    path: `/withdraws/create_store_withdraw`,
    token,
    data,
  });
}

export async function payWithdraw(
  withdrawId: string,
  data: FormData,
  token: string
) {
  return await protectedRequest<Withdraw>({
    method: "POST",
    path: `/withdraws/pay_withdraw/${withdrawId}`,
    token,
    data,
  });
}
