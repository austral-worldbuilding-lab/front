import { MessageCircleQuestion } from "lucide-react";
import { Button } from "../ui/button";

const SupportButton = () => {
  return (
    <div className="absolute bottom-26 left-4 flex z-10 items-center">
      <Button
        variant="ghost"
        color="danger"
        size="sm"
        onClick={() => {
          window.open("mailto:support@mandala.com", "_blank");
        }}
        icon={<MessageCircleQuestion size={20} />}
      >
        Ayuda
      </Button>
    </div>
  );
};

export default SupportButton;
