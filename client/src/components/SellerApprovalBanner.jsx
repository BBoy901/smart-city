import { AlertTriangle, Clock } from "lucide-react";

export default function SellerApprovalBanner({
  status,
  rejectionReason,
}) {
  if (status === "PENDING") {
    return (
      <div className="alert alert-warning">
        <Clock size={18} />
        <span>
          Your seller account is pending admin approval. You can set up your
          shop now; adding products will be available after approval.
        </span>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="alert alert-error">
        <AlertTriangle size={18} />
        <div>
          <strong>Your seller application was rejected.</strong>
          <p>
            {rejectionReason ||
              "No rejection reason was provided. Please contact support."}
          </p>
          <p>
            You can still update your shop details, but you cannot add or edit
            products.
          </p>
        </div>
      </div>
    );
  }

  return null;
}