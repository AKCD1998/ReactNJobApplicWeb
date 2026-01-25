const SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbw3q1pme3bSxNNPCmJ4aZK85ps01Nx9QDkbL-4nJYcnbdcJZ3b9iihI6pfTN44UchMn/exec";

const APPLICATION_SUBMIT_URL = "http://localhost:3003/api/submit-application";
const CV_SUBMIT_URL = "http://localhost:3003/api/apply/cv";

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
  "มหาวิทยาลัยวลัยลักษณ์ (Walailak University) (สำนักวิชา)"
];


export function getReferenceData(step) {
  return {
    sales: {
      title: "พนักงานขายหน้าร้าน",
      image: SALES_REF_IMAGE,
      sections: [
        {
          heading: "รับสมัครพนักงาน",
          items: [
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
          items: ["เภสัชกรฟูลไทม์"],
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
          items: ["เภสัชกรพาร์ทไทม์"],
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
  }[step] || null;
}

export { SUBMIT_URL, APPLICATION_SUBMIT_URL, CV_SUBMIT_URL, SCHOOL_OPTIONS };
