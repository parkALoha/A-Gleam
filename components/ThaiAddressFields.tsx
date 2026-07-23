"use client";

import { useEffect, useState } from "react";

type Province = { id: string; name: string };
type Amphure = { id: string; name: string; provinceId: string };
type Tambon = {
  id: string;
  name: string;
  districtId: string;
  provinceId: string;
  zipCode: string;
};

const selectClass =
  "mt-1.5 w-full rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-sm text-shop-text outline-none focus:border-shop-blush-500 disabled:bg-shop-beige-100 disabled:text-shop-text-soft";

export default function ThaiAddressFields({
  defaultNames,
  readOnly = false,
}: {
  defaultNames?: {
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
  };
  readOnly?: boolean;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/thai-address/provinces.json").then((r) => r.json()),
      fetch("/data/thai-address/amphures.json").then((r) => r.json()),
      fetch("/data/thai-address/tambons.json").then((r) => r.json()),
    ]).then(([p, a, t]: [Province[], Amphure[], Tambon[]]) => {
      setProvinces(p);
      setAmphures(a);
      setTambons(t);
      setLoaded(true);

      // Prefill from the customer's last order (once, on load) — resolve
      // the stored names back to ids so the cascading dropdowns line up.
      if (defaultNames?.province) {
        const province = p.find((x) => x.name === defaultNames.province);
        const district = a.find(
          (x) => x.name === defaultNames.district && x.provinceId === province?.id,
        );
        const subdistrict = t.find(
          (x) => x.name === defaultNames.subdistrict && x.districtId === district?.id,
        );
        if (province) setProvinceId(province.id);
        if (district) setDistrictId(district.id);
        if (subdistrict) setSubdistrictId(subdistrict.id);
        setPostalCode(defaultNames.postalCode);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const districtOptions = amphures.filter((a) => a.provinceId === provinceId);
  const subdistrictOptions = tambons.filter((t) => t.districtId === districtId);

  const provinceName = provinces.find((p) => p.id === provinceId)?.name ?? "";
  const districtName = districtOptions.find((d) => d.id === districtId)?.name ?? "";
  const subdistrictName =
    subdistrictOptions.find((s) => s.id === subdistrictId)?.name ?? "";

  function handleProvinceChange(id: string) {
    setProvinceId(id);
    setDistrictId("");
    setSubdistrictId("");
    setPostalCode("");
  }

  function handleDistrictChange(id: string) {
    setDistrictId(id);
    setSubdistrictId("");
    setPostalCode("");
  }

  function handleSubdistrictChange(id: string) {
    setSubdistrictId(id);
    const tambon = tambons.find((t) => t.id === id);
    setPostalCode(tambon?.zipCode ?? "");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="province" value={provinceName} />
      <input type="hidden" name="district" value={districtName} />
      <input type="hidden" name="subdistrict" value={subdistrictName} />

      <div>
        <label className="text-sm font-medium text-shop-text">จังหวัด</label>
        <select
          id="province_select"
          required
          disabled={!loaded || readOnly}
          value={provinceId}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{loaded ? "เลือกจังหวัด" : "กำลังโหลด..."}</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text">อำเภอ/เขต</label>
        <select
          id="district_select"
          required
          disabled={!provinceId || readOnly}
          value={districtId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className={selectClass}
        >
          <option value="">เลือกอำเภอ/เขต</option>
          {districtOptions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text">ตำบล/แขวง</label>
        <select
          id="subdistrict_select"
          required
          disabled={!districtId || readOnly}
          value={subdistrictId}
          onChange={(e) => handleSubdistrictChange(e.target.value)}
          className={selectClass}
        >
          <option value="">เลือกตำบล/แขวง</option>
          {subdistrictOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-shop-text">รหัสไปรษณีย์</label>
        <input
          id="postal_code"
          required
          name="postal_code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          inputMode="numeric"
          maxLength={5}
          disabled={readOnly}
          className={selectClass}
        />
      </div>
    </div>
  );
}
