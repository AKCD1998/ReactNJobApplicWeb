const SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbw3q1pme3bSxNNPCmJ4aZK85ps01Nx9QDkbL-4nJYcnbdcJZ3b9iihI6pfTN44UchMn/exec";

const SALES_REF_IMAGE = "";
const PHARM_FULL_REF_IMAGE = "";
const PHARM_PART_REF_IMAGE = "";

const SCHOOL_OPTIONS = Array.from({ length: 19 }, (_, i) => `มหาวิทยาลัย ${i + 1}`);

export function getReferenceData(step) {
  return {
    sales: {
      title: "พนักงานขายหน้าร้าน",
      image: SALES_REF_IMAGE,
      bullets: ["รายได้เริ่มต้นแข่งขันได้", "มีค่าคอมและโบนัส", "สวัสดิการพื้นฐานครบ"],
    },
    "pharm-full": {
      title: "เภสัชกรฟูลไทม์",
      image: PHARM_FULL_REF_IMAGE,
      bullets: ["รายได้ประจำ + อินเซนทีฟ", "สวัสดิการครบ", "ทำงานเป็นทีม"],
    },
    "pharm-part": {
      title: "เภสัชกรพาร์ทไทม์",
      image: PHARM_PART_REF_IMAGE,
      bullets: ["ค่าตอบแทนรายชั่วโมง", "เลือกกะทำงานได้", "เหมาะกับผู้มีงานหลัก"],
    },
  }[step] || null;
}

export { SUBMIT_URL, SCHOOL_OPTIONS };
