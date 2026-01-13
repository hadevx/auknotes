import React from "react";
import Maintenance from "@/components/Maintenance";
import { useGetStoreStatusQuery } from "@/redux/queries/maintenanceApi";

// import Loader from "./Loader";
import Loader from "./loader.json";
import Lottie from "lottie-react";

function MaintenanceWrapper({ children }) {
  const { data: storeStatus, isLoading, isError } = useGetStoreStatusQuery();

  console.log(storeStatus);
  if (isLoading) {
    // Optionally show a loader while fetching status
    return (
      <div className="min-h-screen flex justify-center items-center w-full">
        <div className="w-48">
          <Lottie animationData={Loader} loop={true} />
        </div>
      </div>
    );
  }

  if (isError) {
    // In case of error, just render children or an error message
    return <>{children}</>;
  }

  if (storeStatus?.[0]?.status === "maintenance") {
    return <Maintenance />;
  }

  return <>{children}</>;
}

export default MaintenanceWrapper;
