export default function MerchantBanner({ message }: { message: string }) {
  if (!message.trim()) return null;
  return (
    <div className="dash-merchant-banner" role="status">
      {message}
    </div>
  );
}
