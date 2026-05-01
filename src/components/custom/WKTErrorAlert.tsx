type WKTErrorAlertProps = {
  message: string;
  onClose: () => void;
};

export const WKTErrorAlert = ({ message }: WKTErrorAlertProps) => {

  return (
    <div className="fixed top-4 left-4 w-96 z-[9999] pointer-events-auto bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">WKT Parsing Error</h3>
          <p className="text-sm text-red-800 mt-1">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WKTErrorAlert;