# 📘 คู่มือทำความเข้าใจโปรเจกต์ StudyTrack

เอกสารนี้อธิบายว่าแอปนี้ทำงานยังไง "ทุกส่วน" เป็นภาษาไทย เพื่อให้คุณเข้าใจ
โค้ดได้จริง และอธิบายให้กรรมการสัมภาษณ์ฟังได้อย่างมั่นใจเหมือนเขียนเอง

> อ่านไฟล์นี้คู่กับโค้ดจริงใน `src/` จะเห็นภาพชัดที่สุด

---

## 1. โปรเจกต์นี้คืออะไร และทำไมเหมาะกับ resume

**StudyTrack** คือแอปวางแผนการเรียนสำหรับนักศึกษา:
- เพิ่ม "วิชา" (subject) ที่เรียน
- เพิ่ม "รายการ" (event) เช่น สอบใหญ่ / สอบย่อย / การบ้าน พร้อม**วันที่**
- แอปคำนวณและแสดง**จำนวนวันที่เหลือ**ให้อัตโนมัติ (นับถอยหลัง)
- แนบ**โน้ต**ได้ เช่น ห้องสอบ บทที่ต้องอ่าน รายละเอียดการบ้าน

**จุดที่ทำให้ดูดีในสายวิศวะคอม:**
1. เป็น **PWA จริง** — ติดตั้งลงมือถือได้ ทำงานออฟไลน์ได้
2. ใช้ **React + TypeScript** (type safety) โครงสร้างโค้ดสะอาด แยก component ชัด
3. เป็น **offline-first** เก็บข้อมูลในเครื่อง ไม่ต้องมี backend แต่ยังมีฟีเจอร์
   export/import ข้อมูล
4. รองรับ **2 ภาษา** และ **ธีมมืด/สว่าง** — แสดงว่าคิดเรื่อง UX
5. **deploy ได้จริง** มีลิงก์ให้กรรมการกดดูได้ทันที

---

## 2. ภาพรวมสถาปัตยกรรม (ข้อมูลไหลยังไง)

```
         ผู้ใช้กดปุ่ม/กรอกฟอร์ม
                  │
                  ▼
   Component (เช่น EventForm) เรียกฟังก์ชัน
                  │  (upsertEvent / deleteEvent / toggleDone …)
                  ▼
        App.tsx  —  ศูนย์กลาง state ของทั้งแอป
                  │  setData(...)  (อัปเดตแบบ immutable)
                  ▼
   useLocalStorage  —  เก็บ state ลง localStorage อัตโนมัติ
                  │
                  ▼
      React re-render  →  หน้าจออัปเดต + นับถอยหลังใหม่
```

หัวใจคือ: **ข้อมูลทั้งหมดอยู่ที่เดียว** ใน `App.tsx` (ตัวแปร `data`)
ส่วน component ลูก ๆ แค่รับข้อมูลลงไปแสดง และส่ง "เหตุการณ์" กลับขึ้นมาผ่าน props
(รูปแบบ *lifting state up* ของ React)

---

## 3. โครงสร้างข้อมูล — `src/types.ts`

เราออกแบบข้อมูลเป็น 2 ก้อนหลัก:

```ts
interface Subject {       // วิชา
  id: string
  name: string            // "Data Structures"
  code?: string           // "CPE231" (ไม่บังคับ)
  color: string           // สีประจำวิชา
}

interface StudyEvent {    // รายการที่มีวันที่ (สอบ/การบ้าน/ฯลฯ)
  id: string
  subjectId: string | null  // ผูกกับวิชาไหน (หรือไม่ผูก)
  title: string
  type: 'exam' | 'quiz' | 'homework' | 'other'
  date: string            // "YYYY-MM-DD" — ใช้คำนวณนับถอยหลัง
  time?: string           // "HH:mm" (ไม่บังคับ)
  note?: string           // โน้ต
  done: boolean           // ทำเสร็จ/ส่งแล้วหรือยัง
  createdAt: string
}
```

ทั้งแอปเก็บเป็นออบเจกต์เดียว `AppData = { subjects: Subject[], events: StudyEvent[] }`
ทำให้ **export/import เป็นไฟล์ JSON ได้ง่าย** เพราะ state ทั้งหมดคือก้อนนี้ก้อนเดียว

> **ทำไมใช้ `id` แทนที่จะอ้างอิงด้วยตำแหน่ง?** เพราะเวลาแก้/ลบ เราหาได้ตรงตัว
> ด้วย id และ React ใช้ id เป็น `key` ในการ render list ได้อย่างถูกต้อง

---

## 4. การเก็บข้อมูล — `src/hooks/useLocalStorage.ts`

นี่คือ **custom hook** ที่ทำงานเหมือน `useState` ปกติ แต่เพิ่มการจำค่าไว้ใน
`localStorage` ของเบราว์เซอร์:

- ตอนเปิดแอปครั้งแรก → อ่านค่าที่เคยเซฟไว้ (ถ้าไม่มีใช้ค่าเริ่มต้น)
- ทุกครั้งที่ค่าเปลี่ยน → เขียนกลับลง `localStorage` ด้วย `useEffect`
- ครอบทุกการอ่าน/เขียนด้วย `try/catch` กันแอปพังในโหมดไม่ระบุตัวตน หรือเมื่อ
  พื้นที่เก็บเต็ม

```ts
const [data, setData] = useLocalStorage('studytrack.data', INITIAL_DATA)
```

ผลคือได้ **offline-first persistence** โดยไม่ต้องมี database — ปิดแอปแล้วเปิดใหม่
ข้อมูลยังอยู่ และใช้ hook เดียวกันนี้เก็บ "ภาษา" และ "ธีม" ด้วย

> **จุดอธิบายตอนสัมภาษณ์:** ข้อมูลอยู่ในเครื่องผู้ใช้เท่านั้น → เป็นส่วนตัว 100%
> แต่แลกมากับ "ย้ายเครื่องแล้วข้อมูลไม่ตามไป" เราจึงเพิ่มปุ่ม export/import JSON
> เป็นทางออกสำรองข้อมูล (ดู `DataMenu.tsx`)

---

## 5. ตรรกะนับถอยหลัง — `src/lib/dates.ts`

ฟังก์ชันสำคัญคือ `daysUntil(iso)` คืนค่าจำนวน**วันเต็ม**จากวันนี้ถึงวันที่กำหนด:
- `0` = วันนี้, `1` = พรุ่งนี้, `-2` = เลยมาแล้ว 2 วัน

เคล็ดลับคือเราปัดทั้งสองวันให้เป็น "เที่ยงคืน" ก่อนลบกัน จึงนับเป็นจำนวนวันเต็ม
ไม่สนใจว่าตอนนี้กี่โมง:

```ts
const diff = parseDate(iso) - startOfToday()
return Math.round(diff / (1000*60*60*24))   // แปลง มิลลิวินาที → วัน
```

จากนั้น `urgencyOf(iso)` แบ่งระดับความเร่งด่วนเป็น 5 กลุ่ม
(`overdue / today / soon / upcoming / far`) ซึ่งเอาไปใช้**เปลี่ยนสี**ของป้าย
นับถอยหลัง (ดู `CountdownBadge.tsx` + คลาส `.badge--*` ใน `index.css`)

`formatDate()` ใช้ `toLocaleDateString(locale)` ของเบราว์เซอร์ จึงแสดงวันที่
เป็นภาษาไทยหรืออังกฤษตามภาษาที่เลือกโดยอัตโนมัติ

---

## 6. ระบบสองภาษา (i18n) — `i18n/translations.ts` + `context/LanguageContext.tsx`

เราไม่ใช้ไลบรารีหนัก ๆ ทำเองแบบเบา ๆ:

1. `translations.ts` เก็บข้อความ**ทุกคำ**ไว้ 2 ชุด (`th`, `en`)
   โดยใช้ TypeScript บังคับว่า ถ้าเพิ่ม key ในภาษาไทยก็ต้องมีในอังกฤษด้วย
   (`Record<TranslationKey, string>`) — กันลืมแปล
2. `LanguageContext` เป็น **React Context** แจกฟังก์ชัน `t(key)` ให้ทุก component
   เรียกใช้ได้โดยไม่ต้องส่ง props ลงไปทีละชั้น
3. `t('count.daysLeft', { n: 3 })` รองรับการแทนค่า `{n}` ในข้อความ เช่น
   "เหลืออีก 3 วัน" / "3 days left"

ภาษาที่เลือกถูกเก็บด้วย `useLocalStorage` → กลับมาเปิดใหม่ก็ยังเป็นภาษาเดิม

---

## 7. ธีมมืด/สว่าง — `hooks/useTheme.ts` + `index.css`

- ครั้งแรกจะดูจากการตั้งค่าของระบบ (`prefers-color-scheme`)
- เมื่อเลือกธีม เราเขียนลงที่ `<html data-theme="dark">`
- ใน `index.css` กำหนดสีเป็น **CSS variables** บน `:root` (ธีมสว่าง) แล้ว override
  ใหม่ใต้ `:root[data-theme='dark']` → ทั้งแอปเปลี่ยนสีพร้อมกันด้วยโค้ดสีชุดเดียว

นี่คือเหตุผลที่ component ไม่เคยใส่สีตรง ๆ แต่ใช้ตัวแปรเช่น `var(--primary)` เสมอ

---

## 8. การแบ่ง Component และ flow เพิ่ม/แก้/ลบ

| Component | หน้าที่ |
|-----------|---------|
| `App.tsx` | เก็บ state กลาง + ฟังก์ชันแก้ข้อมูล + สลับ view + จัดวาง layout |
| `Sidebar` | เมนูด้านข้าง: แท็บแยกตามประเภท + badge จำนวนค้าง ย่อ/เปิด-ปิดได้ |
| `Header` | แถบบน: ปุ่มเมนู + ชื่อ view + ปุ่มเพิ่มด่วน + สลับธีม/ภาษา |
| `Calendar` | มุมมองปฏิทินรายเดือน mark จุดแต่ละรายการบนวัน |
| `Planner` | มุมมอง “วางแผนอ่าน” จัดตารางอ่านหนังสืออัตโนมัติ |
| `CountdownHero` | แบนเนอร์ใหญ่ โชว์รายการที่ใกล้ถึงที่สุด |
| `EventList` | กลุ่มการ์ด (เลยกำหนด / กำลังจะถึง / เสร็จแล้ว) |
| `EventCard` | การ์ด 1 รายการ + ปุ่มติ๊กเสร็จ/แก้/ลบ |
| `EventForm` | ฟอร์มเพิ่ม/แก้ไข (เปิดใน Modal) |
| `SubjectsView` | แท็บ "วิชา": เพิ่ม/ลบวิชา |
| `DataMenu` | export/import ข้อมูล JSON (อยู่ท้าย sidebar) |
| `Modal` | เปลือกหน้าต่าง popup ใช้ซ้ำได้ (ปิดด้วย Esc/คลิกพื้นหลัง) |

### 8.1 ระบบแท็บ + Sidebar (เมนูด้านข้าง)

`App` เก็บ state `view` ว่ากำลังดูแท็บไหน แท็บมี 7 ตัว แบ่งเป็น 3 กลุ่ม:
**ภาพรวม** (`all` = ดูรวมทุกประเภท, `calendar`), **ประเภท** (`exam` สอบใหญ่,
`quiz` สอบย่อย, `homework` การบ้าน, `other` อื่น ๆ) และ `subjects`
แท็บประเภททั้งหมด**ใช้หน้า agenda ร่วมกัน** เพียงแต่กรองด้วย `view`
(ถ้า `all` ไม่กรอง) จึงไม่ต้องเขียนหน้าแสดงผลซ้ำ ส่วนตัวเลขบนแท็บคือจำนวน
"รายการค้าง (ยังไม่เสร็จ)" ของประเภทนั้น คำนวณครั้งเดียวด้วย `useMemo` (ตัวแปร `counts`)

`Sidebar` คือเมนูด้านข้างที่กดเปลี่ยน view ได้ มี 2 สถานะที่ควบคุมด้วย CSS class:

- **ย่อ (collapsed)** — บนเดสก์ท็อป กดปุ่ม `«` เพื่อย่อเหลือแถบไอคอนแคบ ๆ
  (ซ่อนข้อความ เหลือแต่ไอคอน) ค่านี้ถูกจำไว้ด้วย `useLocalStorage`
- **เปิด/ปิด (open)** — ปุ่ม `☰` บนแถบบนสั่งเปิด-ปิด บนมือถือ sidebar จะกลาย
  เป็น **drawer** เลื่อนออกมาทับหน้าจอพร้อมฉากหลังมืด (backdrop) กดนอกพื้นที่
  เพื่อปิด และจะปิดอัตโนมัติเมื่อเลือกแท็บ

เคล็ดลับ responsive: เราเขียน CSS แบบ *mobile-first* — ค่าเริ่มต้นของ `.sidebar`
คือ drawer (ลอยทับ) แล้วใช้ `@media (min-width: 861px)` สลับให้กลายเป็นคอลัมน์
ติดด้านซ้ายถาวรบนจอใหญ่

### 8.2 มุมมองปฏิทิน — `Calendar.tsx`

หลักการคำนวณตารางปฏิทิน:
1. หา "วันอาทิตย์แรกของตาราง" โดยถอยจากวันที่ 1 ของเดือนกลับไปตามเลขวันในสัปดาห์
2. สร้าง 42 ช่อง (6 สัปดาห์ × 7 วัน) ไล่วันต่อกันไป พร้อมธงว่าช่องไหนอยู่ในเดือน
   ปัจจุบัน/เป็นวันนี้/ถูกเลือก
3. ทำ `byDate` (useMemo) จับกลุ่มรายการตามวันที่ เช่น `"2026-11-09" → [event, …]`
   เพื่อให้แต่ละช่องดึงรายการของตัวเองได้เร็ว
4. ช่องที่มีรายการจะโชว์ **จุดสี** (มากสุด 3 จุด ถ้าเกินโชว์ `+N`) สีจุดมาจาก
   สีวิชา หรือสีตามประเภทถ้าไม่ได้ผูกวิชา (ดู `lib/colors.ts`)
5. แตะวันไหน → `selected` เปลี่ยน แล้วแผงด้านล่างแสดงรายการของวันนั้นโดย
   **ใช้ `EventCard` ซ้ำ** และมีปุ่ม "เพิ่มในวันนี้" ที่เปิดฟอร์มพร้อมใส่วันที่ให้
   อัตโนมัติ (ส่ง prop `defaultDate` เข้า `EventForm`)

ชื่อเดือนและชื่อวันใช้ `Intl.DateTimeFormat(locale, …)` จึงเปลี่ยนตามภาษา
และภาษาไทยจะได้ปีเป็น **พ.ศ.** ให้โดยอัตโนมัติ

### 8.3 Smart Study Planner (อัลกอริทึม) — `lib/planner.ts`

นี่คือฟีเจอร์ที่ "โชว์ความเป็นวิศวกร" มากที่สุด เป็น **โมดูล pure** (ไม่มี React/DOM)
จึงเขียน unit test ครอบได้เต็ม (ดู `planner.test.ts`) แนวคิดหลัก:

**1) ประเมินภาระงาน (workload) เป็น "หน่วย":**
แต่ละวิชาสอบมี *จำนวนบท* และ *ความยาก* → `workloadUnits = บทที่เหลือ × ตัวคูณความยาก`
(ง่าย ×1, ปานกลาง ×1.5, ยาก ×2) "บทที่เหลือ" = จำนวนบท − บทที่อ่านไปแล้ว
→ นี่คือจุดที่ทำให้แผน **ปรับตามความคืบหน้า** ได้ (อัปเดต `chaptersDone` แล้ว replan)

**2) จัดตารางแบบ greedy ที่รู้ deadline (เดินทีละวัน):**
เดินจากวันนี้ไปข้างหน้าทีละวัน แต่ละวันมี "โควตา" (capacity) จำกัด
- หาวิชาที่ยังต้องอ่านและสอบยังไม่ถึง
- เรียงตาม **ความกดดันเวลา** `pressure = หน่วยที่เหลือ / วันที่เหลือก่อนสอบ` (มากก่อน)
- ให้แต่ละวิชา "ตามจังหวะ" `pace = ceil(หน่วยที่เหลือ / วันที่เหลือ)` หน่วยต่อวัน
  แต่ไม่เกินโควตาของวันนั้น

ผลที่ได้: ถ้าเวลาพอ งานจะถูก **กระจายเท่า ๆ กัน** (ไม่กองวันเดียว); ถ้าเวลาตึง
วิชาที่กดดันสุดจะได้โควตาก่อน (front-load อัตโนมัติ) = พฤติกรรม "เร่งเมื่อใกล้ไม่ทัน"

**3) บอกความเป็นไปได้ (feasibility):**
ถ้าจัดครบทุกหน่วยก่อนวันสอบ → `feasible = true` ("ทันแน่นอน"); ถ้าไม่ครบ → เตือน
"เวลาไม่พอ" พร้อมบอกว่าต้องอ่าน ~กี่หน่วย/วัน (`requiredPerDay`)

> **invariant ที่ unit test การันตี:** ไม่มีวันไหนเกิน capacity, ไม่มีการจัดอ่านในวันสอบ
> หรือหลังสอบ, จำนวนหน่วยที่จัดรวม = workload เมื่อทำทัน, และวิชาที่ใกล้สอบมาก่อนในลำดับ

### 8.4 การทดสอบ (Testing) & CI/CD

- **Unit test** (`lib/*.test.ts`) ครอบตรรกะล้วน: `dates.ts` (นับถอยหลัง) และ
  `planner.ts` (อัลกอริทึมจัดตาราง) — รวม 22 เคส
- **Component test** (`components/*.test.tsx`) ใช้ **React Testing Library**
  render component จริงพร้อม `LanguageProvider` แล้วตรวจพฤติกรรม เช่น กดปุ่มติ๊กเสร็จ
  แล้ว callback ถูกเรียก
- รันด้วย **Vitest**: `npm run test` (หรือ `npm run test:watch`)
- **GitHub Actions** (`.github/workflows/ci.yml`) รัน type-check → test → build
  ทุกครั้งที่ push/เปิด PR โค้ดที่พังจะไม่หลุดเข้า `main`
- **CD:** ต่อ repo กับ Vercel ครั้งเดียว แล้ว push `main` = deploy production อัตโนมัติ
  (และทุก PR ได้ preview URL ของตัวเอง)

> เคล็ดลับ: ทำให้ `planner.ts` เป็น pure โดยรับ `today` เป็น input (ไม่อ่านนาฬิกาจริง
> ข้างใน) — เทคนิคนี้ทำให้เทสต์ **deterministic** (ผลเหมือนเดิมทุกครั้ง) เป็นจุดที่พูด
> ในสัมภาษณ์ได้ว่าออกแบบโค้ดให้เทสต์ง่าย (testability)

**ตัวอย่าง flow การเพิ่มรายการ:**
1. กดปุ่ม "เพิ่มรายการ" → `App` ตั้ง state `editing = 'new'` → เปิด `EventForm`
2. กรอกฟอร์มแล้วกดบันทึก → `EventForm` สร้างออบเจกต์ `StudyEvent` (ใส่ `id` ใหม่
   จาก `makeId()`) แล้วเรียก `onSave(event)`
3. `App.upsertEvent` เพิ่มเข้า list (หรือแทนที่ของเดิมถ้า id ซ้ำ = กรณีแก้ไข)
   แบบ **immutable** (`[...d.events, event]`)
4. `setData` → `useLocalStorage` เซฟ → React re-render → การ์ดใหม่โผล่ พร้อม
   นับถอยหลังทันที

การ "แก้ไข" ใช้ฟอร์มเดียวกัน เพียงส่ง `initial={event}` เข้าไป — จึงไม่ต้องเขียน
ฟอร์มซ้ำ (หลักการ reuse)

**การคำนวณกลุ่มที่แสดง** อยู่ใน `App.tsx` ด้วย `useMemo` (คำนวณใหม่เฉพาะตอน
ข้อมูล/ตัวกรองเปลี่ยน): กรองตามประเภท → เรียงตามวันที่ → แยกเป็น เลยกำหนด /
กำลังจะถึง / เสร็จแล้ว และหา "รายการถัดไป" สำหรับแบนเนอร์

---

## 9. PWA ทำงานยังไง — `vite.config.ts`

เราใช้ปลั๊กอิน **`vite-plugin-pwa`** ซึ่งตอน build จะสร้างให้ 2 อย่าง:

1. **Web App Manifest** — ไฟล์ที่บอกเบราว์เซอร์ว่า ชื่อแอป ไอคอน สี และให้เปิด
   แบบ `standalone` (เต็มจอเหมือนแอปเนทีฟ) → ทำให้ "ติดตั้งลงมือถือ" ได้
2. **Service Worker** (ผ่าน Workbox) — ตัวกลางที่ดักคำขอไฟล์ แล้ว **cache ไฟล์
   ของแอป** ไว้ → เปิดได้เร็วและ**ใช้งานออฟไลน์**ได้

ไอคอนอยู่ใน `public/icons/` (ขนาด 192, 512 และแบบ *maskable* สำหรับ Android)
`registerType: 'autoUpdate'` หมายถึงเวลามีเวอร์ชันใหม่ แอปจะอัปเดต service worker
ให้เองเงียบ ๆ

> ข้อควรรู้: PWA ต้องรันบน **HTTPS** (หรือ `localhost`) service worker ถึงจะทำงาน
> — ตอน deploy บน Vercel/Netlify ได้ HTTPS อยู่แล้ว

---

## 10. จุดขายตอนสัมภาษณ์ + คำถามที่อาจโดนถาม

**เล่าโปรเจกต์ใน 30 วินาที:**
> "ผมทำ PWA ชื่อ StudyTrack ด้วย React + TypeScript + Vite สำหรับช่วยนักศึกษา
> จัดการวันสอบ/การบ้าน มีระบบนับถอยหลัง มุมมองปฏิทิน และ **Smart Study Planner**
> ที่เป็นอัลกอริทึมจัดตารางอ่านหนังสือให้อัตโนมัติจากวันสอบ ความยาก และจำนวนบท
> โค้ดมี **unit/component test ด้วย Vitest** และ **CI ด้วย GitHub Actions**
> เก็บข้อมูลแบบ offline-first ติดตั้งลงมือถือได้ และ deploy อยู่บน Vercel ครับ"

**คำถามที่อาจโดน และแนวตอบ:**
- *ทำไมไม่ใช้ backend/database?* → ข้อมูลเป็นส่วนตัวของผู้ใช้คนเดียว ไม่ต้อง
  แชร์ จึงเลือก offline-first ให้เบา เร็ว ไม่มีค่าเซิร์ฟเวอร์ และเสริม export/
  import JSON เป็นการสำรองข้อมูล ถ้าอนาคตต้อง sync ข้ามเครื่องค่อยเพิ่ม backend
- *จัดการ state ยังไง?* → ยกขึ้นไว้ที่ `App.tsx` ก้อนเดียว (single source of truth)
  อัปเดตแบบ immutable แล้วให้ React re-render ส่วน localStorage ซิงก์ผ่าน `useEffect`
- *นับถอยหลังคำนวณยังไงให้ไม่เพี้ยนเรื่องเวลา?* → ปัดเป็นเที่ยงคืนทั้งสองฝั่ง
  ก่อนลบ จึงได้จำนวนวันเต็มที่ถูกต้อง
- *ทำให้เป็นแอปมือถือได้ยังไง?* → เป็น PWA ผ่าน vite-plugin-pwa (manifest +
  service worker) ผู้ใช้กด Add to Home Screen ได้เลย
- *ถ้า localStorage พัง/ปิดจะเป็นไง?* → ครอบ try/catch ไว้ แอปยังทำงานได้
  เพียงแต่ไม่จำค่า
- *Smart Study Planner ทำงานยังไง?* → greedy ที่รู้ deadline: ประเมิน workload เป็น
  หน่วย (บท × ความยาก) แล้วเดินทีละวัน จัดให้วิชาที่ "ความกดดันเวลา" สูงสุดก่อน
  โดยแต่ละวิชาเดินตาม pace = ceil(เหลือ/วันที่เหลือ) ไม่เกินโควตาต่อวัน → กระจาย
  เวลาเท่า ๆ กันเมื่อเวลาพอ และเร่งอัตโนมัติเมื่อใกล้ไม่ทัน (ดู §8.3)
- *ทำไมต้องเขียน test?* → กันของพังตอนแก้โค้ด (regression) และผมออกแบบ `planner.ts`
  ให้ pure + รับ `today` เป็น input เพื่อให้เทสต์ deterministic — เป็นการออกแบบเพื่อ
  testability ตั้งแต่แรก มี CI (GitHub Actions) รัน type-check/test/build ทุก push

---

## 12. Backend API (Phase 2) — โฟลเดอร์ `server/`

ส่วนนี้คือ **full-stack** ที่โชว์ฝั่ง Backend/Database/Security โดยตรง เป็น REST API
แยกต่างหาก (รันคนละพอร์ตกับ frontend)

**เทคโนโลยี:** Node.js + Express + TypeScript + **Prisma** + **PostgreSQL** +
**JWT** + **bcrypt** + **Zod** + Vitest/Supertest

### 12.1 ภาพรวมการทำงาน
```
Frontend ──(HTTP + Bearer token)──► Express API ──(Prisma)──► PostgreSQL
                                        │
                           helmet · CORS · rate limit · Zod validate · requireAuth
```
- `src/app.ts` ประกอบ Express app (แยกจาก `index.ts` เพื่อให้เทสต์เรียกผ่าน Supertest
  ได้โดยไม่ต้องเปิดพอร์ตจริง — เทคนิค testability เดียวกับฝั่ง frontend)
- `src/env.ts` ตรวจ environment variables ด้วย Zod ตั้งแต่ตอนเริ่ม (fail fast)

### 12.2 Authentication (JWT + bcrypt)
1. **สมัคร** → แฮชรหัสผ่านด้วย **bcrypt** (มี salt อัตโนมัติ) แล้วเก็บเฉพาะ hash
   ไม่เคยเก็บ/ส่งรหัสจริงกลับ
2. **ล็อกอิน** → เทียบรหัสกับ hash ด้วย `bcrypt.compare` ถ้าถูกออก **JWT** ให้
   (เซ็นด้วย secret ฝั่ง server, มีวันหมดอายุ)
3. ทุก request ที่ต้องล็อกอิน แนบ `Authorization: Bearer <token>` →
   middleware `requireAuth` ตรวจ token แล้วเซ็ต `req.userId`
- จุดดีไซน์ความปลอดภัย: ล็อกอินผิด (อีเมลไม่มี/รหัสผิด) ตอบ error เดียวกัน →
  กัน account enumeration; โค้ด `jwt.ts`/`password.ts` เป็น pure function → unit test ได้

### 12.3 Database Design (Prisma + PostgreSQL)
- โมเดลใน `prisma/schema.prisma`: **User 1—N Subject**, **User 1—N Event**,
  **Subject 1—N Event** (ความสัมพันธ์จริงแบบ relational)
- Referential integrity: ลบ User → ลบ Subject/Event ของเขา (`onDelete: Cascade`);
  ลบ Subject → Event ที่ผูกอยู่เคลียร์ค่าเป็น null (`onDelete: SetNull`)
- Prisma สร้าง **migration** (ไฟล์ SQL ใน `prisma/migrations/`) = เวอร์ชันของ schema
  และให้ client ที่ **type-safe** กับ TypeScript

### 12.4 Security (ตรงกับที่ลิสต์แนะนำ)
- **แยกข้อมูลรายผู้ใช้ (RBAC ระดับ owner):** ทุก query กรองด้วย `userId` และตรวจ
  ความเป็นเจ้าของก่อนแก้/ลบ → ผู้ใช้ A อ่าน/แก้ของ B ไม่ได้ (มี integration test พิสูจน์)
- **SQL Injection:** Prisma ใช้ parameterized query ล้วน ไม่ต่อ string SQL เอง
- **XSS/headers:** `helmet` ใส่ security headers; **CORS** จำกัดเฉพาะ origin ของ frontend
- **Brute force:** `express-rate-limit` จำกัดจำนวนครั้งที่ยิง `/api/auth`
- **Input validation:** `Zod` ตรวจทุก body ก่อนถึง DB (ค่าผิด → 400)

### 12.5 Testing & CI
- **Unit** (`*.unit.test.ts`): bcrypt (แฮช/เทียบ/salt ต่างกันทุกครั้ง), JWT (เซ็น/ตรวจ/
  หมดอายุ/ลายเซ็นปลอม) — ไม่ต้องใช้ DB
- **Integration** (`app.int.test.ts`): ยิง HTTP จริงผ่าน **Supertest** ครบ flow
  สมัคร → อีเมลซ้ำ 409 → ล็อกอิน → token ผิด 401 → CRUD → **แยกข้อมูลข้ามผู้ใช้**
  (รันเมื่อมี `DATABASE_URL`, ไม่งั้นข้ามอัตโนมัติ)
- **CI** (`.github/workflows/backend-ci.yml`): GitHub Actions ปลุก **PostgreSQL
  service container** แล้วรัน migrate → typecheck → test → build ทุก push

### 12.6 พูดตอนสัมภาษณ์
> "ผมต่อยอด StudyTrack เป็น full-stack: เขียน REST API ด้วย Express + TypeScript +
> Prisma + PostgreSQL มีระบบ auth แบบ JWT รหัสผ่านแฮชด้วย bcrypt แยกข้อมูลราย
> ผู้ใช้ ทุก endpoint ตรวจสิทธิ์ความเป็นเจ้าของ ป้องกัน SQL injection ด้วย Prisma,
> ใส่ helmet/CORS/rate-limit และ validate input ด้วย Zod เขียนทั้ง unit test และ
> integration test (Supertest) รันใน CI ที่ปลุก PostgreSQL จริงด้วย GitHub Actions ครับ"

**ก้าวต่อไป:** เชื่อม frontend เข้ากับ API นี้ (หน้า login + เก็บ token + sync แทน
localStorage) จะทำให้เป็น full-stack ที่ใช้งานข้ามเครื่องได้จริง

## 13. เชื่อม Frontend ↔ Backend (Cloud Sync)

frontend ทำงานได้ **2 โหมด** โดยอัตโนมัติ ขึ้นกับว่าล็อกอินหรือยัง:

| | ยังไม่ล็อกอิน (local) | ล็อกอินแล้ว (cloud) |
|---|---|---|
| เก็บข้อมูลที่ | `localStorage` (ออฟไลน์) | เซิร์ฟเวอร์ (ซิงก์ข้ามเครื่อง) |
| โค้ดที่จัดการ | `useStudyData` สาขา local | `useStudyData` สาขา cloud (เรียก API) |

### 13.1 ชิ้นส่วนที่เพิ่ม
- `src/api/client.ts` — ตัวห่อ `fetch` ที่แนบ `Authorization: Bearer <token>`,
  โยน `ApiError` เมื่อ response ไม่ ok, และเรียก handler เมื่อเจอ 401 (มี unit test
  ด้วย mock fetch)
- `src/hooks/useAuth.ts` — เก็บ token/user (persist ใน localStorage), ฟังก์ชัน
  login/register/logout; sync token เข้า client ด้วย `useLayoutEffect` **ก่อน**
  effect โหลดข้อมูลจะรัน; ถ้าเจอ 401 ที่ไหนก็ logout อัตโนมัติ
- `src/hooks/useStudyData.ts` — "data layer" ที่สลับ local/cloud แต่ **เปิด
  interface เดียวกัน** (`upsertEvent`, `toggleDone`, …) ทำให้ component ลูกไม่ต้องรู้
  ว่าโหมดไหน
- `src/components/AuthModal.tsx` (ฟอร์มเข้าสู่ระบบ/สมัคร) + `AccountPanel.tsx`
  (บัญชี + สถานะซิงก์ใน sidebar)

### 13.2 เรื่องที่ออกแบบไว้ให้ดี
- **ย้ายข้อมูลออฟไลน์ขึ้นคลาวด์อัตโนมัติ:** ล็อกอินครั้งแรกถ้าในเซิร์ฟเวอร์ว่าง
  แต่เครื่องมีข้อมูลเดิม → อัปโหลดขึ้นให้ (`pushData`) พร้อม **remap id ของวิชา**
  ให้ event ที่ผูกอยู่ยังชี้ถูก → ผู้ใช้ไม่เสียงานเดิม
- **Optimistic UI:** ติ๊ก "เสร็จ" เปลี่ยนหน้าจอทันทีแล้วค่อยยิง API เบื้องหลัง
  (ถ้าพลาดจะ `refresh` ดึงของจริงกลับมา) → รู้สึกลื่น
- **Degrade ได้:** โหมด local ยังทำงานเต็มแบบ offline-first; เซิร์ฟเวอร์ล่ม/เน็ตหลุด
  โชว์แถบเตือน + ปุ่มลองใหม่ ไม่ทำแอปพัง
- **ตั้งค่า endpoint ด้วย env:** `VITE_API_URL` (ค่าเริ่มต้น `http://localhost:4000`)
  → production ชี้ไปที่ API ที่ deploy ไว้ได้

### 13.3 รันทั้งสแตก
```bash
# เทอร์มินัล 1 — API
cd server && cp .env.example .env && docker compose up -d
npm install && npm run migrate:dev && npm run dev      # :4000
# เทอร์มินัล 2 — frontend
npm install && npm run dev                              # :5173
```

> **ทดสอบแล้วจริง:** ผม boot เซิร์ฟเวอร์จริงกับ PostgreSQL ชั่วคราว แล้วยิง HTTP
> จริงครบ flow (register → สร้าง subject/event → `GET /api/data`) — response ตรง
> กับรูปแบบที่ frontend ใช้ และ request ที่ไม่มี token ได้ 401

## 11. ไอเดียต่อยอด (ถ้าอยากทำให้เด่นขึ้น)

- 🔔 **แจ้งเตือน** ก่อนสอบด้วย Notification API / Push API
- 🗓️ **ตารางเรียนรายสัปดาห์** (คาบเรียนประจำ) เพิ่มอีกหนึ่งมุมมอง
- ☁️ **Sync ข้ามเครื่อง** ด้วย backend เบา ๆ (เช่น Supabase/Firebase)
- 📊 **สรุปสถิติ** เช่น สัปดาห์นี้มีกี่เดดไลน์ ทำเสร็จกี่ %
- ✅ **ทำแล้ว:** unit/component test (Vitest) + CI (GitHub Actions) — ต่อยอดได้
  ด้วย E2E test (Playwright) หรือเพิ่ม coverage report
- ✅ **ทำแล้ว:** Backend API (Phase 2, §12) + **เชื่อม frontend–backend แล้ว**
  (§13: login/sync, offline↔cloud) — ต่อยอดได้: refresh token/httpOnly cookie,
  แจ้งเตือน (Push API), analytics dashboard, deploy ขึ้นจริง (Vercel + Railway/Render)
- 🌐 ทำ **i18n** เพิ่มภาษาอื่น หรือดึงวันหยุด/ปฏิทินมหาวิทยาลัยมาแสดง

เลือกทำสัก 1–2 ข้อแล้วเขียนไว้ใน README หัวข้อ "Roadmap" จะช่วยให้โปรเจกต์
ดูมีทิศทางและน่าสนใจสำหรับการฝึกงานมากขึ้น
