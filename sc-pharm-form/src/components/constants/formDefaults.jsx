export const SALES_DEFAULTS = {
  salesBranchPreference: "",
  availableStartDateSales: "",
  referralSourceSales: "",
  referralOtherSales: "",
};

export const PHARM_DEFAULTS = {
  pharmacistBranchPreference: "",
  licenseNumber: "",
  pharmacySchool: "",
  pharmacySchoolOther: "",
  availableStartDatePharmacist: "",
  referralSourcePharmacist: "",
  referralOtherPharmacist: "",
};

export const MARKETING_DEFAULTS = {
  availableStartDateMarketing: "",
  referralSourceMarketing: "",
  referralOtherMarketing: "",
};

export const INITIAL_FORM = {
  email: "",
  fullName: "",
  nickName: "",
  sex: "",
  age: "",
  phone: "",
  lineId: "",
  educationLevel: "",
  educationLevelOther: "",
  instituteName: "",
  major: "",
  positionApplied: "",
  pharmacistType: "",
  ...SALES_DEFAULTS,
  ...PHARM_DEFAULTS,
  ...MARKETING_DEFAULTS,
};
