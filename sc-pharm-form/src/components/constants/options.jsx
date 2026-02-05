import { getEnabledBranches } from "../../config/branches";

// Google Apps Script (คงเดิม)
const SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbw3q1pme3bSxNNPCmJ4aZK85ps01Nx9QDkbL-4nJYcnbdcJZ3b9iihI6pfTN44UchMn/exec";

/**
 * IMPORTANT:
 * - Production ต้องตั้งค่า VITE_API_BASE_URL เป็นโดเมน backend จริง (ห้ามใส่ /api ต่อท้าย)
 * - Local dev ถ้าไม่ตั้ง จะ fallback ไป http://localhost:3003
 */
const normalizeApiBase = (base) => {
  if (!base) return "";
  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/api$/i, "");
};

const API_BASE =
  normalizeApiBase(import.meta.env.VITE_API_BASE_URL) || "http://localhost:3003";

const resolveApiUrl = (input, baseUrl) => {
  const value = String(input || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const needsSlash = value.startsWith("/") ? "" : "/";
  return `${baseUrl}${needsSlash}${value}`;
};

const APPLICATION_SUBMIT_URL = `${API_BASE}/api/submit-application`;
const CV_SUBMIT_URL = `${API_BASE}/api/apply/cv`;
const LINE_NOTIFY_URL = resolveApiUrl(
  import.meta.env.VITE_LINE_NOTIFY_ENDPOINT || "/api/notify/line/job-application",
  API_BASE
);
const LINE_CV_NOTIFY_URL = resolveApiUrl(
  import.meta.env.VITE_LINE_CV_NOTIFY_ENDPOINT || "/api/line/notify",
  API_BASE
);

const SALES_REF_IMAGE = "";
const PHARM_FULL_REF_IMAGE = "";
const PHARM_PART_REF_IMAGE = "";

const SCHOOL_OPTIONS = [
  "มหาวิทยาลัยรังสิต (Rangsit University)",
  "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ (Huachiew Chalermprakiet University)",
  "มหาวิทยาลัยสยาม (Siam University)",
  "มหาวิทยาลัยพายัพ (Payap University)",
  "มหาวิทยาลัยอีสเทิร์นเอเชีย (Eastern Asia University)",
  "มหาวิทยาลัยเวสเทิร์น (Western University)",
  "จุฬาลงกรณ์มหาวิทยาลัย (Chulalongkorn University)",
  "มหาวิทยาลัยมหิดล (Mahidol University)",
  "มหาวิทยาลัยเชียงใหม่ (Chiang Mai University)",
  "มหาวิทยาลัยสงขลานครินทร์ (Prince of Songkla University)",
  "มหาวิทยาลัยขอนแก่น (Khon Kaen University)",
  "มหาวิทยาลัยศิลปากร (Silpakorn University)",
  "มหาวิทยาลัยนเรศวร (Naresuan University)",
  "มหาวิทยาลัยศรีนครินทรวิโรฒ (Srinakharinwirot University)",
  "มหาวิทยาลัยมหาสารคาม (Mahasarakham University)",
  "มหาวิทยาลัยอุบลราชธานี (Ubon Ratchathani University)",
  "มหาวิทยาลัยบูรพา (Burapha University)",
  "มหาวิทยาลัยพะเยา (Phayao University)",
  "มหาวิทยาลัยธรรมศาสตร์ (Thammasat University)",
  "มหาวิทยาลัยวลัยลักษณ์ (Walailak University) (สำนักวิชา)",
];

const getBranchLabels = (role) =>
  getEnabledBranches(role).map((branch) => branch.label);

export function getReferenceData(step) {
  const salesBranchLabels = getBranchLabels("sales");
  const pharmBranchLabels = getBranchLabels("pharmacist");

  return (
    {
      sales: {
        title: "พนักงานขายหน้าร้าน",
        image: SALES_REF_IMAGE,
        sections: [
          {
            heading: "รับสมัครพนักงาน",
            items: salesBranchLabels.length
              ? salesBranchLabels
              : [
                  "พนักงานขายประจำร้านยา ศิริชัยเภสัช สาขาตลาดแม่กลอง",
                  "พนักงานขายประจำร้านยา ศิริชัยเภสัช สาขาวัดช่องลม",
                ],
          },
          {
            heading: "รายได้และสวัสดิการ",
            items: [
              "รายวัน 360++",
              "รายเดือนเริ่มต้น 10,000++ (ผ่านทดลองงาน)",
              "โบนัส",
              "ประกันสังคม",
              "งานเลี้ยงประจำปี",
            ],
          },
          {
            heading: "คุณสมบัติ",
            items: ["อายุ 18 ปีขึ้นไป", "วุฒิ ม.3", "สามารถทำงานเป็นกะได้"],
          },
        ],
        note: "รู้ผลทันทีภายในวันสัมภาษณ์",
      },

      "pharm-full": {
        title: "เภสัชกรฟูลไทม์",
        image: PHARM_FULL_REF_IMAGE,
        sections: [
          {
            heading: "รับสมัครพนักงาน",
            items: pharmBranchLabels.length
              ? pharmBranchLabels
              : ["เภสัชกรฟูลไทม์"],
          },
          {
            heading: "รายได้และสวัสดิการ",
            items: ["รายได้ประจำ + อินเซนทีฟ", "สวัสดิการครบ"],
          },
          {
            heading: "คุณสมบัติ",
            items: ["มีใบประกอบวิชาชีพ", "ทำงานเป็นทีมได้ดี"],
          },
        ],
        note: "รู้ผลทันทีภายในวันสัมภาษณ์",
      },

      "pharm-part": {
        title: "เภสัชกรพาร์ทไทม์",
        image: PHARM_PART_REF_IMAGE,
        sections: [
          {
            heading: "รับสมัครพนักงาน",
            items: pharmBranchLabels.length
              ? pharmBranchLabels
              : ["เภสัชกรพาร์ทไทม์"],
          },
          {
            heading: "รายได้และสวัสดิการ",
            items: ["ค่าตอบแทนรายชั่วโมง", "เลือกกะทำงานได้"],
          },
          {
            heading: "คุณสมบัติ",
            items: ["เหมาะกับผู้มีงานหลัก", "ยืดหยุ่นเวลาได้"],
          },
        ],
        note: "รู้ผลทันทีภายในวันสัมภาษณ์",
      },
    }[step] || null
  );
}

export {
  SUBMIT_URL,
  APPLICATION_SUBMIT_URL,
  CV_SUBMIT_URL,
  LINE_NOTIFY_URL,
  LINE_CV_NOTIFY_URL,
  SCHOOL_OPTIONS,
};
