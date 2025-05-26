import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PaymentError {
  code: string;
  detail: string;
  category: string;
}

interface ErrorLog {
  _id: string;
  eventId: string;
  eventTitle: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  paymentAmount: number;
  sourceId: string;
  paymentErrors: PaymentError[];
  rawErrorResponse: {
    stack: string;
    message: string;
    request: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    };
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
    result?: Record<string, unknown>;
  };
  errors: PaymentError[];
  attemptedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ReportData {
  logs: ErrorLog[];
  filters: {
    searchTerm: string;
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
  totalErrors: number;
}

interface ErrorReportPDFProps {
  data: ReportData;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #3b82f6",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  summarySection: {
    marginBottom: 20,
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    borderBottom: "1 solid #d1d5db",
    paddingBottom: 5,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  filterLabel: {
    fontWeight: "bold",
    color: "#374151",
    width: 80,
  },
  filterValue: {
    color: "#6b7280",
    flex: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  errorItem: {
    marginBottom: 20,
    border: "1 solid #e5e7eb",
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  errorHeader: {
    backgroundColor: "#fef2f2",
    padding: 10,
    borderBottom: "1 solid #fecaca",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorId: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: "Courier",
  },
  errorDate: {
    fontSize: 9,
    color: "#991b1b",
    fontWeight: "bold",
  },
  errorContent: {
    padding: 15,
  },
  customerSection: {
    marginBottom: 15,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 3,
  },
  customerInfo: {
    flexDirection: "row",
    marginBottom: 3,
  },
  customerLabel: {
    fontWeight: "bold",
    width: 60,
    color: "#374151",
  },
  customerValue: {
    flex: 1,
    color: "#1f2937",
  },
  eventSection: {
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  eventDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventDetail: {
    flex: 1,
  },
  amount: {
    color: "#059669",
    fontWeight: "bold",
  },
  errorsSection: {
    marginBottom: 15,
  },
  errorCode: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    padding: "3 6",
    borderRadius: 2,
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
  },
  errorDetail: {
    color: "#374151",
    marginBottom: 5,
    fontSize: 9,
  },
  technicalSection: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 3,
    marginTop: 10,
  },
  technicalTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#334155",
  },
  technicalDetail: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  codeBlock: {
    backgroundColor: "#f8fafc",
    padding: 5,
    borderRadius: 2,
    fontFamily: "Courier",
    fontSize: 7,
    color: "#475569",
    marginTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    color: "#9ca3af",
    fontSize: 8,
  },
});

const ErrorReportPDF: React.FC<ErrorReportPDFProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalAmount = () => {
    return data.logs.reduce((sum, log) => sum + log.paymentAmount, 0);
  };

  const getUniqueErrorCodes = () => {
    const codes = new Set<string>();
    data.logs.forEach((log) => {
      log.paymentErrors.forEach((error) => {
        codes.add(error.code);
      });
    });
    return codes.size;
  };

  const getDateRange = () => {
    if (data.logs.length === 0) return "No data";

    const dates = data.logs.map((log) => new Date(log.attemptedAt));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    if (earliest.toDateString() === latest.toDateString()) {
      return earliest.toLocaleDateString();
    }

    return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Error Report</Text>
          <Text style={styles.subtitle}>
            Coastal Creations - Error Analysis Report
          </Text>
          <Text style={styles.subtitle}>
            Generated on {formatDate(data.generatedAt)}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Report Summary</Text>

          {/* Applied Filters */}
          {(data.filters.searchTerm ||
            data.filters.startDate ||
            data.filters.endDate) && (
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{ fontSize: 11, fontWeight: "bold", marginBottom: 5 }}
              >
                Applied Filters:
              </Text>
              {data.filters.searchTerm && (
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Search:</Text>
                  <Text style={styles.filterValue}>
                    {data.filters.searchTerm}
                  </Text>
                </View>
              )}
              {data.filters.startDate && (
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>From:</Text>
                  <Text style={styles.filterValue}>
                    {new Date(data.filters.startDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {data.filters.endDate && (
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>To:</Text>
                  <Text style={styles.filterValue}>
                    {new Date(data.filters.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Statistics */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{data.totalErrors}</Text>
              <Text style={styles.summaryLabel}>Total Errors</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{getUniqueErrorCodes()}</Text>
              <Text style={styles.summaryLabel}>Unique Error Codes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: "#dc2626" }]}>
                {formatCurrency(getTotalAmount())}
              </Text>
              <Text style={styles.summaryLabel}>Failed Payment Amount</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { fontSize: 10 }]}>
                {getDateRange()}
              </Text>
              <Text style={styles.summaryLabel}>Date Range</Text>
            </View>
          </View>
        </View>

        {/* Error Details */}
        {data.logs.length === 0 ? (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>No Errors Found</Text>
            <Text>No payment errors match the applied filters.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Error Details</Text>

            {data.logs.map((log, index) => (
              <View key={log._id} style={styles.errorItem} break={index > 0}>
                {/* Error Header */}
                <View style={styles.errorHeader}>
                  <Text style={styles.errorId}>ID: {log._id}</Text>
                  <Text style={styles.errorDate}>
                    {formatDate(log.attemptedAt)}
                  </Text>
                </View>

                {/* Error Content */}
                <View style={styles.errorContent}>
                  {/* Customer Information */}
                  <View style={styles.customerSection}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      Customer Information
                    </Text>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerLabel}>Name:</Text>
                      <Text style={styles.customerValue}>
                        {log.customerName}
                      </Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerLabel}>Email:</Text>
                      <Text style={styles.customerValue}>
                        {log.customerEmail}
                      </Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerLabel}>Phone:</Text>
                      <Text style={styles.customerValue}>
                        {log.customerPhone}
                      </Text>
                    </View>
                  </View>

                  {/* Event Information */}
                  <View style={styles.eventSection}>
                    <Text style={styles.eventTitle}>{log.eventTitle}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <Text style={{ fontSize: 9, color: "#6b7280" }}>
                          Event ID: {log.eventId}
                        </Text>
                      </View>
                      <View style={styles.eventDetail}>
                        <Text style={[styles.amount, { textAlign: "right" }]}>
                          {formatCurrency(log.paymentAmount)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Errors */}
                  <View style={styles.errorsSection}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      Payment Errors ({log.paymentErrors.length})
                    </Text>
                    {log.paymentErrors.map((error, errorIndex) => (
                      <View key={errorIndex} style={{ marginBottom: 8 }}>
                        <Text style={styles.errorCode}>{error.code}</Text>
                        <Text style={styles.errorDetail}>
                          <Text style={{ fontWeight: "bold" }}>Category:</Text>{" "}
                          {error.category}
                        </Text>
                        <Text style={styles.errorDetail}>
                          <Text style={{ fontWeight: "bold" }}>Detail:</Text>{" "}
                          {error.detail}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Technical Details */}
                  <View style={styles.technicalSection}>
                    <Text style={styles.technicalTitle}>
                      Technical Information
                    </Text>
                    <Text style={styles.technicalDetail}>
                      Status Code: {log.rawErrorResponse.statusCode}
                    </Text>
                    {log.rawErrorResponse.request?.method && (
                      <Text style={styles.technicalDetail}>
                        Method: {log.rawErrorResponse.request.method}
                      </Text>
                    )}
                    <Text style={styles.technicalDetail}>
                      Source ID: {log.sourceId}
                    </Text>
                    <Text style={styles.technicalDetail}>Error Message:</Text>
                    <Text style={styles.codeBlock}>
                      {log.rawErrorResponse.message}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This report was automatically generated by Coastal Creations Error
          Management System
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ErrorReportPDF;
