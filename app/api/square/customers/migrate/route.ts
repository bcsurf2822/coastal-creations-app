import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import { squareCustomerService } from "@/lib/square/customers";

interface MigrationResult {
  customerId: string;
  email?: string;
  squareCustomerId: string;
  isNew: boolean;
  status: "success" | "error";
  error?: string;
}

interface MigrationSummary {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  results: MigrationResult[];
}

/**
 * POST /api/square/customers/migrate
 * One-time migration of existing MongoDB customers to Square Customer Directory
 *
 * This endpoint:
 * 1. Finds all customers without squareCustomerId
 * 2. Creates/finds Square customers for each
 * 3. Updates MongoDB with squareCustomerId
 * 4. Returns detailed migration results
 *
 * Optional query params:
 * - limit: Max number of customers to migrate (default: 100)
 * - dryRun: If true, don't actually update MongoDB (default: false)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const dryRun = searchParams.get("dryRun") === "true";

    console.log(
      `[SQUARE-MIGRATE] Starting migration - limit: ${limit}, dryRun: ${dryRun}`
    );

    // Find customers without squareCustomerId
    const customersToMigrate = await Customer.find({
      $or: [
        { squareCustomerId: { $exists: false } },
        { squareCustomerId: null },
        { squareCustomerId: "" },
      ],
    })
      .limit(limit)
      .lean();

    const summary: MigrationSummary = {
      total: customersToMigrate.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      results: [],
    };

    console.log(
      `[SQUARE-MIGRATE] Found ${customersToMigrate.length} customers to migrate`
    );

    for (const customer of customersToMigrate) {
      const result: MigrationResult = {
        customerId: String(customer._id),
        email: customer.billingInfo?.emailAddress,
        squareCustomerId: "",
        isNew: false,
        status: "success",
      };

      try {
        // Validate billing info exists
        if (!customer.billingInfo) {
          result.status = "error";
          result.error = "No billing info found";
          summary.skipped++;
          summary.results.push(result);
          continue;
        }

        const { firstName, lastName, emailAddress, phoneNumber } =
          customer.billingInfo;

        // Need at least email or phone to find/create Square customer
        if (!emailAddress && !phoneNumber) {
          result.status = "error";
          result.error = "No email or phone available";
          summary.skipped++;
          summary.results.push(result);
          continue;
        }

        // Find or create Square customer
        const squareResult = await squareCustomerService.findOrCreateCustomer({
          firstName: firstName || "Unknown",
          lastName: lastName || "Unknown",
          email: emailAddress,
          phone: phoneNumber,
          address: customer.billingInfo.addressLine1
            ? {
                addressLine1: customer.billingInfo.addressLine1,
                addressLine2: customer.billingInfo.addressLine2,
                city: customer.billingInfo.city,
                state: customer.billingInfo.stateProvince,
                postalCode: customer.billingInfo.postalCode,
                country: customer.billingInfo.country || "US",
              }
            : undefined,
        });

        result.squareCustomerId = squareResult.customerId;
        result.isNew = squareResult.isNew;

        // Update MongoDB if not a dry run
        if (!dryRun) {
          await Customer.findByIdAndUpdate(customer._id, {
            squareCustomerId: squareResult.customerId,
          });
        }

        summary.migrated++;
        summary.results.push(result);

        console.log(
          `[SQUARE-MIGRATE] ${dryRun ? "[DRY RUN] " : ""}Migrated customer ${customer._id} -> ${squareResult.customerId} (${squareResult.isNew ? "new" : "existing"})`
        );
      } catch (error) {
        result.status = "error";
        result.error = error instanceof Error ? error.message : String(error);
        summary.errors++;
        summary.results.push(result);

        console.error(
          `[SQUARE-MIGRATE] Error migrating customer ${customer._id}:`,
          error
        );
      }
    }

    console.log(
      `[SQUARE-MIGRATE] Migration complete - migrated: ${summary.migrated}, skipped: ${summary.skipped}, errors: ${summary.errors}`
    );

    return NextResponse.json(
      {
        success: true,
        message: dryRun
          ? "Migration dry run complete"
          : "Migration complete",
        dryRun,
        summary: {
          total: summary.total,
          migrated: summary.migrated,
          skipped: summary.skipped,
          errors: summary.errors,
        },
        results: summary.results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-MIGRATE] Migration failed:", error);

    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/square/customers/migrate
 * Get migration status - count of customers without squareCustomerId
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectMongo();

    const totalCustomers = await Customer.countDocuments();
    const customersWithSquareId = await Customer.countDocuments({
      squareCustomerId: { $exists: true, $nin: [null, ""] },
    });
    const customersWithoutSquareId = totalCustomers - customersWithSquareId;

    return NextResponse.json(
      {
        success: true,
        message: "Migration status retrieved",
        data: {
          totalCustomers,
          customersWithSquareId,
          customersWithoutSquareId,
          migrationComplete: customersWithoutSquareId === 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SQUARE-MIGRATE] Error getting migration status:", error);

    return NextResponse.json(
      {
        error: "Error getting migration status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
