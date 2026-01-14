export default function buildPayload(form) {
  const isSales = form.positionApplied === "พนักงานขายหน้าร้าน";

  const resumeFileName = isSales ? form.resumeFileNameSales : form.resumeFileNamePharmacist;
  const resumeFileData = isSales ? form.resumeFileDataSales : form.resumeFileDataPharmacist;
  const resumeFileMime = isSales ? form.resumeFileMimeSales : form.resumeFileMimePharmacist;

  return {
      submittedAt: new Date().toISOString(),
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      nickName: form.nickName.trim(),
      sex: form.sex,
      age: form.age.trim(),
      phone: form.phone.trim(),
      lineId: form.lineId.trim(),
      educationLevel: form.educationLevel.trim(),
      instituteName: form.instituteName.trim(),
      major: form.major.trim(),
      positionApplied: form.positionApplied,
      pharmacistType: form.positionApplied === "เภสัชกร" ? form.pharmacistType : "",
      pharmacistBranchPreference: form.positionApplied === "เภสัชกร" ? form.pharmacistBranchPreference : "",
      salesBranchPreference: form.positionApplied === "พนักงานขายหน้าร้าน" ? form.salesBranchPreference : "",
      licenseNumber: form.positionApplied === "เภสัชกร" ? form.licenseNumber.trim() : "",
      pharmacySchool: form.positionApplied === "เภสัชกร" ? form.pharmacySchool : "",
      pharmacySchoolOther: form.positionApplied === "เภสัชกร" ? form.pharmacySchoolOther.trim() : "",
      birthDate: isSales
        ? form.birthDateSales
        : form.pharmacistType === "เภสัชกรฟูลไทม์"
        ? form.birthDatePharmacist
        : "",
      workHistory: isSales ? form.workHistorySales.trim() : form.workHistoryPharmacist.trim(),
      expectedSalary: isSales ? form.expectedSalarySales.trim() : form.expectedSalaryPharmacist.trim(),
      availableStartDate: isSales ? form.availableStartDateSales : form.availableStartDatePharmacist,
      referralSource: isSales ? form.referralSourceSales : form.referralSourcePharmacist,
      referralOther: isSales ? form.referralOtherSales.trim() : form.referralOtherPharmacist.trim(),
      resumeFileName,
      resumeFileUrlOrBase64: resumeFileData,
      resumeFileMimeType: resumeFileMime,
      resumeFile: resumeFileData ? { fileName: resumeFileName, mimeType: resumeFileMime, base64: resumeFileData } : null,
  };
}