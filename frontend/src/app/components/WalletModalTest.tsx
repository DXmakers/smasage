import { WalletModal } from "./WalletModal";

interface WalletModalTestProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModalTest({
  isOpen,
  onClose,
}: WalletModalTestProps) {
  return <WalletModal isOpen={isOpen} onClose={onClose} />;
}
