import { getCompanyDetailsFromDB, saveCompanyDetailsToDB } from './indexDBHelpers'; // Ensure correct path

const CompanyDetailsManager = (() => {
  let companyDetailsCache = null; // Cache variable

  // Method to load data from IndexedDB if not already loaded
  const loadCompanyDetails = async () => {
    if (!companyDetailsCache) {
      try {
        companyDetailsCache = await getCompanyDetailsFromDB();
        if (!companyDetailsCache) {
          // Set default values if no data found in IndexedDB
          companyDetailsCache = {
            companyName: "Company Name",
            companyDetails: "Company Details"
          };
        }
      } catch (error) {
        console.error("Error loading company details from DB:", error);
        companyDetailsCache = {
          companyName: "Company Name",
          companyDetails: "Company Details"
        };
      }
    }
    return companyDetailsCache;
  };

  // Method to update company details in both IndexedDB and cache
  const updateCompanyDetails = async (newDetails) => {
    try {
      await saveCompanyDetailsToDB(newDetails);  // Save to IndexedDB
      companyDetailsCache = newDetails;          // Update cache
    } catch (error) {
      console.error("Error updating company details:", error);
    }
  };

  // Return methods to interact with the cache
  return {
    getCompanyDetails: loadCompanyDetails,
    setCompanyDetails: updateCompanyDetails
  };
})();

export default CompanyDetailsManager;
