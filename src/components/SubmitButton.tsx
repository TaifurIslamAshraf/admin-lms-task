import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button className="w-full" type="submit" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export default SubmitButton;
