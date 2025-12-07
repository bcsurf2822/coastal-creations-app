import { Client, Environment } from "square/legacy";
import { randomUUID } from "crypto";

// Square Customer types
export interface SquareAddress {
  addressLine1?: string;
  addressLine2?: string;
  locality?: string; // city
  administrativeDistrictLevel1?: string; // state
  postalCode?: string;
  country?: string;
}

export interface SquareCustomer {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: SquareAddress;
  referenceId?: string;
  note?: string;
}

export interface CreateSquareCustomerInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  referenceId?: string;
  note?: string;
}

export interface FindOrCreateResult {
  customerId: string;
  isNew: boolean;
  customer: SquareCustomer;
}

const squareClient = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const { customersApi } = squareClient;

/**
 * Square Customer Service
 * Handles all Square Customer Directory API operations
 */
export class SquareCustomerService {
  /**
   * Format phone number to E.164 format (+1XXXXXXXXXX)
   * Square requires E.164 format for phone searches
   */
  formatE164(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
    return `+${digits}`;
  }

  /**
   * Search for a customer by email address
   * Returns the first matching customer or null
   */
  async searchByEmail(email: string): Promise<SquareCustomer | null> {
    try {
      const response = await customersApi.searchCustomers({
        query: {
          filter: {
            emailAddress: { exact: email },
          },
        },
        limit: BigInt(1),
      });

      const customer = response.result.customers?.[0];
      if (!customer) return null;

      return this.mapSquareCustomer(customer);
    } catch (error) {
      console.error("[SQUARE-CUSTOMERS-searchByEmail] Error:", error);
      return null;
    }
  }

  /**
   * Search for a customer by phone number
   * Phone must be E.164 format for exact search
   */
  async searchByPhone(phone: string): Promise<SquareCustomer | null> {
    try {
      const e164Phone = this.formatE164(phone);
      const response = await customersApi.searchCustomers({
        query: {
          filter: {
            phoneNumber: { exact: e164Phone },
          },
        },
        limit: BigInt(1),
      });

      const customer = response.result.customers?.[0];
      if (!customer) return null;

      return this.mapSquareCustomer(customer);
    } catch (error) {
      console.error("[SQUARE-CUSTOMERS-searchByPhone] Error:", error);
      return null;
    }
  }

  /**
   * Create a new customer in Square Customer Directory
   */
  async createCustomer(
    input: CreateSquareCustomerInput
  ): Promise<SquareCustomer> {
    const response = await customersApi.createCustomer({
      idempotencyKey: randomUUID(),
      givenName: input.firstName,
      familyName: input.lastName,
      emailAddress: input.email,
      phoneNumber: input.phone ? this.formatE164(input.phone) : undefined,
      address: input.address
        ? {
            addressLine1: input.address.addressLine1,
            addressLine2: input.address.addressLine2,
            locality: input.address.city,
            administrativeDistrictLevel1: input.address.state,
            postalCode: input.address.postalCode,
            country: input.address.country || "US",
          }
        : undefined,
      referenceId: input.referenceId,
      note: input.note,
    });

    if (!response.result.customer) {
      throw new Error("Failed to create customer in Square");
    }

    return this.mapSquareCustomer(response.result.customer);
  }

  /**
   * Find existing customer by email/phone or create new one
   * This is the main method to use for customer creation to prevent duplicates
   */
  async findOrCreateCustomer(
    input: CreateSquareCustomerInput
  ): Promise<FindOrCreateResult> {
    // Step 1: Search by email first (most reliable identifier)
    if (input.email) {
      const existingByEmail = await this.searchByEmail(input.email);
      if (existingByEmail) {
        console.log(
          "[SQUARE-CUSTOMERS-findOrCreate] Found existing customer by email:",
          existingByEmail.id
        );
        return {
          customerId: existingByEmail.id,
          isNew: false,
          customer: existingByEmail,
        };
      }
    }

    // Step 2: Search by phone if no email match
    if (input.phone) {
      const existingByPhone = await this.searchByPhone(input.phone);
      if (existingByPhone) {
        console.log(
          "[SQUARE-CUSTOMERS-findOrCreate] Found existing customer by phone:",
          existingByPhone.id
        );
        return {
          customerId: existingByPhone.id,
          isNew: false,
          customer: existingByPhone,
        };
      }
    }

    // Step 3: Create new customer
    console.log("[SQUARE-CUSTOMERS-findOrCreate] Creating new Square customer");
    const newCustomer = await this.createCustomer(input);

    return {
      customerId: newCustomer.id,
      isNew: true,
      customer: newCustomer,
    };
  }

  /**
   * Get a customer by their Square customer ID
   */
  async getCustomer(customerId: string): Promise<SquareCustomer | null> {
    try {
      const response = await customersApi.retrieveCustomer(customerId);

      if (!response.result.customer) return null;

      return this.mapSquareCustomer(response.result.customer);
    } catch (error) {
      console.error("[SQUARE-CUSTOMERS-getCustomer] Error:", error);
      return null;
    }
  }

  /**
   * Update an existing customer in Square
   */
  async updateCustomer(
    customerId: string,
    input: Partial<CreateSquareCustomerInput>
  ): Promise<SquareCustomer> {
    const response = await customersApi.updateCustomer(customerId, {
      givenName: input.firstName,
      familyName: input.lastName,
      emailAddress: input.email,
      phoneNumber: input.phone ? this.formatE164(input.phone) : undefined,
      address: input.address
        ? {
            addressLine1: input.address.addressLine1,
            addressLine2: input.address.addressLine2,
            locality: input.address.city,
            administrativeDistrictLevel1: input.address.state,
            postalCode: input.address.postalCode,
            country: input.address.country || "US",
          }
        : undefined,
      referenceId: input.referenceId,
      note: input.note,
    });

    if (!response.result.customer) {
      throw new Error("Failed to update customer in Square");
    }

    return this.mapSquareCustomer(response.result.customer);
  }

  /**
   * Delete a customer from Square Customer Directory
   * Note: This is a soft delete in Square
   */
  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      await customersApi.deleteCustomer(customerId);
      return true;
    } catch (error) {
      console.error("[SQUARE-CUSTOMERS-deleteCustomer] Error:", error);
      return false;
    }
  }

  /**
   * Map Square API customer object to our SquareCustomer interface
   */
  private mapSquareCustomer(customer: {
    id?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    emailAddress?: string | null;
    phoneNumber?: string | null;
    address?: {
      addressLine1?: string | null;
      addressLine2?: string | null;
      locality?: string | null;
      administrativeDistrictLevel1?: string | null;
      postalCode?: string | null;
      country?: string | null;
    } | null;
    referenceId?: string | null;
    note?: string | null;
  }): SquareCustomer {
    return {
      id: customer.id || "",
      createdAt: customer.createdAt ?? undefined,
      updatedAt: customer.updatedAt ?? undefined,
      givenName: customer.givenName ?? undefined,
      familyName: customer.familyName ?? undefined,
      emailAddress: customer.emailAddress ?? undefined,
      phoneNumber: customer.phoneNumber ?? undefined,
      address: customer.address
        ? {
            addressLine1: customer.address.addressLine1 ?? undefined,
            addressLine2: customer.address.addressLine2 ?? undefined,
            locality: customer.address.locality ?? undefined,
            administrativeDistrictLevel1:
              customer.address.administrativeDistrictLevel1 ?? undefined,
            postalCode: customer.address.postalCode ?? undefined,
            country: customer.address.country ?? undefined,
          }
        : undefined,
      referenceId: customer.referenceId ?? undefined,
      note: customer.note ?? undefined,
    };
  }
}

// Export singleton instance for convenience
export const squareCustomerService = new SquareCustomerService();
