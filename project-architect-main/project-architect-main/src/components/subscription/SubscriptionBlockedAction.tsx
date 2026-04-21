import { useNavigate } from "react-router-dom";
import { useHasActiveSubscription } from "@/hooks/useSubscription";

interface SubscriptionBlockedActionProps {
  children: React.ReactElement;
  onAllowed?: () => void;
}

/**
 * Wraps an action element and redirects to /plans if user doesn't have active subscription.
 * If subscription is active, allows the action to proceed normally.
 */
export function SubscriptionBlockedAction({ 
  children, 
  onAllowed 
}: SubscriptionBlockedActionProps) {
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (isLoading) return;
    
    if (!hasActiveSubscription) {
      e.preventDefault();
      e.stopPropagation();
      navigate("/plans");
    } else {
      onAllowed?.();
    }
  };

  return (
    <div onClick={handleClick} className="contents">
      {children}
    </div>
  );
}
