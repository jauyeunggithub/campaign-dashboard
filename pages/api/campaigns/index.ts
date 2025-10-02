import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const campaigns = await prisma.campaign.findMany();
    res.status(200).json(campaigns);
  } else if (req.method === "POST") {
    try {
      const { name, budget, startDate, endDate, status } = req.body;

      if (!name || !budget || !startDate || !endDate || !status) {
        return res.status(400).json({ message: "All fields are required." });
      }

      if (isNaN(Number(budget))) {
        return res.status(400).json({ message: "Budget must be a number." });
      }

      const newCampaign = await prisma.campaign.create({
        data: {
          name,
          budget: Number(budget),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status,
        },
      });

      res.status(201).json(newCampaign);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
