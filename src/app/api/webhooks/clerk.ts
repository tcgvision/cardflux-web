import { Webhook } from "svix";
import { buffer } from "micro";
import { prisma } from "@/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const payload = (await buffer(req)).toString();
  const headers = req.headers;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    return res.status(400).send("Invalid signature");
  }

  const { type, data } = evt;

  if (type === "user.created") {
    const userId = data.id;
    const email = data.email_addresses[0]?.email_address;

    await prisma.shop.create({
      data: {
        clerkUserId: userId,
        email,
        trialStart: new Date(),
        isPaid: false,
      },
    });
  }

  return res.status(200).json({ success: true });
}
