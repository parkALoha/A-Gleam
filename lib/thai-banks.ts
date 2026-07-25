// Slip2Go's bank codes for the checkReceiver field — limited to banks a
// Thai shop would realistically hold a receiving account with.
export const THAI_BANKS = [
  { code: "01002", name: "ธนาคารกรุงเทพ" },
  { code: "01004", name: "ธนาคารกสิกรไทย" },
  { code: "01006", name: "ธนาคารกรุงไทย" },
  { code: "01011", name: "ธนาคารทหารไทยธนชาต (ttb)" },
  { code: "01014", name: "ธนาคารไทยพาณิชย์ (SCB)" },
  { code: "01022", name: "ธนาคารซีไอเอ็มบีไทย" },
  { code: "01024", name: "ธนาคารยูโอบี" },
  { code: "01025", name: "ธนาคารกรุงศรีอยุธยา" },
  { code: "01030", name: "ธนาคารออมสิน" },
  { code: "01033", name: "ธนาคารอาคารสงเคราะห์" },
  { code: "01034", name: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)" },
  { code: "01067", name: "ธนาคารทิสโก้" },
  { code: "01069", name: "ธนาคารเกียรตินาคินภัทร" },
  { code: "01073", name: "ธนาคารแลนด์ แอนด์ เฮ้าส์" },
] as const;

export function bankNameForCode(code: string): string | null {
  return THAI_BANKS.find((b) => b.code === code)?.name ?? null;
}
