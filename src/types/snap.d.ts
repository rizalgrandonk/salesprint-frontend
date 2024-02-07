interface Window {
  snap: {
    pay: (
      token: string,
      callback: {
        onSuccess: (result: TransactionSuccessResult) => Promise<void> | void;
        onPending: (result: TransactionSuccessResult) => Promise<void> | void;
        onError: (result: TransactionErrorResult) => Promise<void> | void;
        onClose: () => Promise<void> | void;
      }
    ) => void;
  };
}

type TransactionErrorResult = {
  status_code: string;
  status_message: string[];
};

type TransactionSuccessResult =
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      masked_card: string;
      order_id: string;
      gross_amount: string;
      payment_type: "credit_card";
      transaction_time: string;
      transaction_status: string;
      fraud_status: string;
      approval_code: string;
      bank: string;
      card_type: string;
    }
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      order_id: string;
      gross_amount: string;
      payment_type: "echannel";
      transaction_time: string;
      transaction_status: string;
      fraud_status: string;
      bill_key: string;
      biller_code: string;
      pdf_url: string;
      finish_redirect_url?: string;
    }
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      order_id: string;
      gross_amount: string;
      payment_type: "bank_transfer";
      transaction_time: string;
      transaction_status: string;
      va_numbers: {
        bank: string;
        va_number: string;
      }[];
      fraud_status: string;
      pdf_url: string;
      finish_redirect_url: string;
    }
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      order_id: string;
      gross_amount: string;
      payment_type: "gopay";
      transaction_time: string;
      transaction_status: string;
      fraud_status: string;
      finish_redirect_url: string;
    }
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      order_id: string;
      gross_amount: string;
      payment_type: "qris";
      transaction_time: string;
      transaction_status: string;
      fraud_status: string;
      finish_redirect_url: string;
    }
  | {
      status_code: string;
      status_message: string;
      transaction_id: string;
      order_id: string;
      gross_amount: string;
      payment_type: "cstore";
      transaction_time: string;
      transaction_status: string;
      payment_code: string;
      pdf_url: string;
      finish_redirect_url: string;
    };
