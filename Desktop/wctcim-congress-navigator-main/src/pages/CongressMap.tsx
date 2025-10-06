import { InteractiveMap } from "@/components/InteractiveMap";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const CongressMap = () => {
  return (
    <div className="relative min-h-screen">
      {/* Back Button */}
      <Link 
        to="/"
        className="fixed top-4 left-4 z-50 venue-card p-3 hover:bg-card-translucent/80 transition-colors"
      >
        <ArrowLeft className="text-congress-green" size={24} />
      </Link>

      {/* Interactive Map */}
      <InteractiveMap />
    </div>
  );
};