import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date and last month date for comparison
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Simulate some data for now since we don't have all models yet
    // In a real app, these would be actual database queries

    // Revenue data
    const currentRevenue = Math.floor(Math.random() * 25000) + 10000; // Random between 10k-35k
    const lastMonthRevenue = Math.floor(Math.random() * 20000) + 8000; // Random between 8k-28k
    const revenueChange = Math.round(
      ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    );

    // Sales data
    const currentSales = Math.floor(Math.random() * 200) + 50; // Random between 50-250
    const lastMonthSales = Math.floor(Math.random() * 180) + 40; // Random between 40-220
    const salesChange = Math.round(
      ((currentSales - lastMonthSales) / lastMonthSales) * 100
    );

    // Customers data
    const currentCustomers = Math.floor(Math.random() * 500) + 100; // Random between 100-600
    const lastMonthCustomers = Math.floor(Math.random() * 450) + 80; // Random between 80-530
    const customersChange = Math.round(
      ((currentCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
    );

    // Inventory data
    const currentInventory = Math.floor(Math.random() * 1000) + 200; // Random between 200-1200
    const lastMonthInventory = Math.floor(Math.random() * 900) + 150; // Random between 150-1050
    const inventoryChange = Math.round(
      ((currentInventory - lastMonthInventory) / lastMonthInventory) * 100
    );

    // Construct response
    const dashboardData = {
      revenue: {
        current: currentRevenue.toLocaleString(),
        previous: lastMonthRevenue.toLocaleString(),
        percentageChange: revenueChange,
      },
      sales: {
        current: currentSales.toString(),
        previous: lastMonthSales.toString(),
        percentageChange: salesChange,
      },
      customers: {
        current: currentCustomers.toString(),
        previous: lastMonthCustomers.toString(),
        percentageChange: customersChange,
      },
      inventory: {
        current: currentInventory.toString(),
        previous: lastMonthInventory.toString(),
        percentageChange: inventoryChange,
      },
      recentActivities: [
        {
          id: 1,
          type: "sale",
          title: "New sale completed",
          description: `Invoice #INV-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")} - $${(Math.random() * 2000 + 500).toFixed(2)}`,
          time: "2 minutes ago",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "customer",
          title: "New customer added",
          description: "Premium customer registration",
          time: "15 minutes ago",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "inventory",
          title: "Low stock alert",
          description: `Product ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} - Only ${Math.floor(Math.random() * 10) + 1} items left`,
          time: "1 hour ago",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          type: "payment",
          title: "Payment received",
          description: `Invoice #INV-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")} - $${(Math.random() * 1500 + 300).toFixed(2)}`,
          time: "2 hours ago",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
      goals: {
        revenue: {
          target: 20000,
          current: currentRevenue,
          percentage: Math.min(Math.round((currentRevenue / 20000) * 100), 100),
        },
        customers: {
          target: 30,
          current: Math.floor(Math.random() * 35) + 15, // New customers this month
          percentage: Math.min(
            Math.round(((Math.floor(Math.random() * 35) + 15) / 30) * 100),
            100
          ),
        },
        sales: {
          target: 200,
          current: currentSales,
          percentage: Math.min(Math.round((currentSales / 200) * 100), 100),
        },
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
