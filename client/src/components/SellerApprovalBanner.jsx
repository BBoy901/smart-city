import { AlertTriangle, Clock } from 'lucide-react';

export default function SellerApprovalBanner({ status }) {
  if (status === 'PENDING') {
    return (
      <div className="alert alert-warning">
        <Clock size={18} />
        <span>
          Your seller account is pending admin approval. You can set up your shop now;
          adding products will be available after approval.
        </span>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="alert alert-error">
        <AlertTriangle size={18} />
        <span>
          Your seller application was rejected. You can still update your shop details,
          but you cannot add or edit products.
        </span>
      </div>
    );
  }

  return null;
}
