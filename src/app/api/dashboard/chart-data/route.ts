import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      console.error("No user found in request");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get last 30 days of data
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    console.log("Fetching data for user:", user.id);
    console.log("Date range:", { from: thirtyDaysAgo, to: today });

    try {
      // Get daily sales data
      const salesData = await db.sale.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      console.log("Sales data count:", salesData.length);
      console.log("Sample sales data:", salesData.slice(0, 2));

      // Get daily purchase data
      const purchaseData = await db.purchase.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      console.log("Purchase data count:", purchaseData.length);
      console.log("Sample purchase data:", purchaseData.slice(0, 2));

      // Get daily customer data
      const customerData = await db.customer.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      console.log("Customer data count:", customerData.length);
      console.log("Sample customer data:", customerData.slice(0, 2));

      // Format data for charts
      const formattedData = Array.from({ length: 31 }, (_, i) => {
        const date = subDays(today, i);
        const dateStr = format(date, "MMM dd");
        const startOfDate = startOfDay(date);
        const endOfDate = endOfDay(date);

        const daySales = salesData.filter(
          (s) => s.createdAt >= startOfDate && s.createdAt <= endOfDate
        );
        const dayPurchases = purchaseData.filter(
          (p) => p.createdAt >= startOfDate && p.createdAt <= endOfDate
        );
        const dayCustomers = customerData.filter(
          (c) => c.createdAt >= startOfDate && c.createdAt <= endOfDate
        );

        return {
          date: dateStr,
          sales: daySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
          salesCount: daySales.length,
          purchases: dayPurchases.reduce(
            (sum, p) => sum + (p.totalAmount || 0),
            0
          ),
          purchasesCount: dayPurchases.length,
          customers: dayCustomers.length,
          profit:
            daySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0) -
            dayPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
        };
      }).reverse();

      // Calculate summary statistics
      const summary = {
        totalSales: salesData.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
        totalPurchases: purchaseData.reduce(
          (sum, p) => sum + (p.totalAmount || 0),
          0
        ),
        totalCustomers: customerData.length,
        averageDailySales:
          formattedData.reduce((sum, d) => sum + d.sales, 0) / 30,
        averageDailyProfit:
          formattedData.reduce((sum, d) => sum + d.profit, 0) / 30,
      };

      console.log("Formatted data sample:", formattedData.slice(0, 3));
      console.log("Summary:", summary);

      return NextResponse.json({
        dailyData: formattedData,
        summary,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new NextResponse(
        JSON.stringify({ error: "Database error", details: dbError }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[DASHBOARD_CHART_DATA]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", details: error }),
      { status: 500 }
    );
  }
}
