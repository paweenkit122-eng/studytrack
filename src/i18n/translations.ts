// ---- All user-facing text lives here, in both languages ----
// Add a key to `th` and TypeScript forces you to add it to `en` too.
// Placeholders like {n} are filled in by the t() helper (see LanguageContext).

export const th = {
  'app.title': 'StudyTrack',
  'app.tagline': 'ตารางสอบ & การบ้าน พร้อมนับถอยหลัง',

  'lang.toggle': 'EN',
  'theme.toLight': 'โหมดสว่าง',
  'theme.toDark': 'โหมดมืด',

  // Hero / countdown summary
  'hero.nextUp': 'รายการถัดไป',
  'hero.allClear': 'ไม่มีรายการค้าง 🎉',
  'hero.allClearSub': 'เพิ่มวันสอบหรือการบ้านเพื่อเริ่มนับถอยหลัง',

  // Countdown wording
  'count.today': 'วันนี้',
  'count.tomorrow': 'พรุ่งนี้',
  'count.daysLeft': 'เหลืออีก {n} วัน',
  'count.overdue': 'เลยมาแล้ว {n} วัน',

  // Event types
  'type.exam': 'สอบใหญ่',
  'type.quiz': 'สอบย่อย',
  'type.homework': 'การบ้าน',
  'type.other': 'อื่น ๆ',

  // Filters
  'filter.all': 'ทั้งหมด',
  'filter.showDone': 'แสดงรายการที่เสร็จแล้ว',

  // Sections
  'section.upcoming': 'กำลังจะถึง',
  'section.overdue': 'เลยกำหนด',
  'section.done': 'เสร็จแล้ว',

  // Buttons / actions
  'action.addEvent': '+ เพิ่มรายการ',
  'action.addSubject': '+ เพิ่มวิชา',
  'action.save': 'บันทึก',
  'action.cancel': 'ยกเลิก',
  'action.edit': 'แก้ไข',
  'action.delete': 'ลบ',
  'action.markDone': 'ทำเครื่องหมายว่าเสร็จ',
  'action.markUndone': 'ยังไม่เสร็จ',
  'action.manageSubjects': 'จัดการวิชา',
  'action.close': 'ปิด',

  // Event form
  'form.newEvent': 'เพิ่มรายการใหม่',
  'form.editEvent': 'แก้ไขรายการ',
  'form.title': 'ชื่อรายการ',
  'form.titlePlaceholder': 'เช่น สอบกลางภาค บทที่ 1–5',
  'form.type': 'ประเภท',
  'form.subject': 'วิชา',
  'form.noSubject': '— ไม่ระบุวิชา —',
  'form.date': 'วันที่',
  'form.time': 'เวลา (ไม่บังคับ)',
  'form.note': 'โน้ต (ห้อง / บทที่ต้องอ่าน / รายละเอียด)',
  'form.notePlaceholder': 'เช่น ห้อง 4201, อ่านบทที่ 3 และ 4, ส่งงานกลุ่ม',
  'form.titleRequired': 'กรุณากรอกชื่อรายการ',
  'form.dateRequired': 'กรุณาเลือกวันที่',

  // Subject form / manager
  'subject.manage': 'จัดการวิชา',
  'subject.name': 'ชื่อวิชา',
  'subject.namePlaceholder': 'เช่น โครงสร้างข้อมูล',
  'subject.code': 'รหัสวิชา (ไม่บังคับ)',
  'subject.codePlaceholder': 'เช่น CPE231',
  'subject.color': 'สี',
  'subject.empty': 'ยังไม่มีวิชา เพิ่มวิชาแรกของคุณได้เลย',
  'subject.deleteWarn': 'ลบวิชานี้? รายการที่ผูกกับวิชานี้จะกลายเป็น “ไม่ระบุวิชา”',
  'subject.count': '{n} วิชา',

  // Empty state
  'empty.title': 'ยังไม่มีรายการ',
  'empty.text': 'กดปุ่ม “เพิ่มรายการ” เพื่อบันทึกวันสอบ การบ้าน หรือสอบย่อย แล้วแอปจะนับถอยหลังให้อัตโนมัติ',
  'empty.typeNone': 'ยังไม่มีรายการประเภทนี้',

  // Data (export/import)
  'data.menu': 'ข้อมูล',
  'data.export': 'ส่งออกข้อมูล (.json)',
  'data.import': 'นำเข้าข้อมูล (.json)',
  'data.importError': 'ไฟล์ไม่ถูกต้อง นำเข้าไม่สำเร็จ',
  'data.importConfirm': 'นำเข้าข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด ดำเนินการต่อหรือไม่?',

  // Confirm delete
  'confirm.deleteEvent': 'ลบรายการนี้?',

  // Footer
  'footer.offline': 'ใช้งานออฟไลน์ได้ · ข้อมูลเก็บในเครื่องของคุณเท่านั้น',

  // Navigation / sidebar
  'nav.agenda': 'รายการ',
  'nav.all': 'ทั้งหมด',
  'nav.calendar': 'ปฏิทิน',
  'nav.planner': 'วางแผนอ่าน',
  'nav.subjects': 'วิชา',
  'sidebar.overview': 'ภาพรวม',
  'sidebar.types': 'ประเภท',
  'sidebar.menu': 'เมนู',
  'sidebar.collapse': 'ย่อเมนู',
  'sidebar.expand': 'ขยายเมนู',
  'sidebar.toggle': 'เปิด/ปิดเมนู',

  // Calendar view
  'cal.prev': 'เดือนก่อนหน้า',
  'cal.next': 'เดือนถัดไป',
  'cal.today': 'วันนี้',
  'cal.selectDay': 'แตะวันในปฏิทินเพื่อดูรายการ',
  'cal.noEvents': 'ไม่มีรายการในวันนี้',
  'cal.addOnDay': '+ เพิ่มในวันนี้',

  // Exam planner fields (shown in the add/edit form for exams)
  'form.chapters': 'จำนวนบท/หัวข้อ',
  'form.difficulty': 'ความยาก',
  'form.chaptersDone': 'อ่านไปแล้ว (บท)',
  'form.plannerHint': 'กรอกข้อมูลนี้เพื่อให้ “วางแผนอ่าน” ช่วยจัดตารางให้ (ไม่บังคับ)',
  'diff.easy': 'ง่าย',
  'diff.medium': 'ปานกลาง',
  'diff.hard': 'ยาก',

  // Smart Study Planner view
  'planner.capacity': 'อ่านได้วันละ (หน่วย)',
  'planner.capacityHint': '1 หน่วย ≈ อ่าน 1 บทความยากปานกลาง',
  'planner.empty': 'ยังไม่มีข้อมูลสำหรับวางแผน',
  'planner.emptyHint': 'เพิ่ม “สอบใหญ่” แล้วระบุจำนวนบทและความยาก ระบบจะจัดตารางอ่านให้อัตโนมัติ',
  'planner.priority': 'ลำดับความสำคัญ',
  'planner.schedule': 'ตารางอ่านหนังสือ',
  'planner.units': 'หน่วย',
  'planner.onTrack': 'ทันแน่นอน',
  'planner.behind': 'เวลาไม่พอ ต้องเร่ง',
  'planner.needPerDay': 'ควรอ่าน ~{n} หน่วย/วัน',
  'planner.scheduledOf': 'จัดตารางได้ {done}/{total} หน่วย',
  'planner.unitsOnDay': '{n} หน่วย',

  // Auth / cloud sync
  'auth.signIn': 'เข้าสู่ระบบ',
  'auth.signUp': 'สมัครสมาชิก',
  'auth.logout': 'ออกจากระบบ',
  'auth.email': 'อีเมล',
  'auth.password': 'รหัสผ่าน',
  'auth.passwordHint': 'อย่างน้อย 6 ตัวอักษร',
  'auth.subtitle': 'เข้าสู่ระบบเพื่อเก็บข้อมูลบนคลาวด์ ใช้งานได้ทุกอุปกรณ์',
  'auth.noAccount': 'ยังไม่มีบัญชี? สมัครสมาชิก',
  'auth.haveAccount': 'มีบัญชีแล้ว? เข้าสู่ระบบ',
  'auth.signInToSync': 'เข้าสู่ระบบเพื่อซิงก์',
  'auth.localMode': 'โหมดออฟไลน์ · เก็บในเครื่องนี้',
  'auth.syncing': 'กำลังซิงก์…',
  'auth.synced': 'ซิงก์แล้ว',
  'auth.cloudError': 'ซิงก์ไม่สำเร็จ',
  'auth.retry': 'ลองใหม่',
} as const

export type TranslationKey = keyof typeof th

export const en: Record<TranslationKey, string> = {
  'app.title': 'StudyTrack',
  'app.tagline': 'Exams & homework, with live countdowns',

  'lang.toggle': 'ไทย',
  'theme.toLight': 'Light mode',
  'theme.toDark': 'Dark mode',

  'hero.nextUp': 'Next up',
  'hero.allClear': 'All caught up 🎉',
  'hero.allClearSub': 'Add an exam or homework to start a countdown',

  'count.today': 'Today',
  'count.tomorrow': 'Tomorrow',
  'count.daysLeft': '{n} days left',
  'count.overdue': 'Overdue by {n} days',

  'type.exam': 'Exam',
  'type.quiz': 'Quiz',
  'type.homework': 'Homework',
  'type.other': 'Other',

  'filter.all': 'All',
  'filter.showDone': 'Show completed',

  'section.upcoming': 'Upcoming',
  'section.overdue': 'Overdue',
  'section.done': 'Completed',

  'action.addEvent': '+ Add item',
  'action.addSubject': '+ Add subject',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.markDone': 'Mark as done',
  'action.markUndone': 'Mark as not done',
  'action.manageSubjects': 'Manage subjects',
  'action.close': 'Close',

  'form.newEvent': 'Add a new item',
  'form.editEvent': 'Edit item',
  'form.title': 'Title',
  'form.titlePlaceholder': 'e.g. Midterm, chapters 1–5',
  'form.type': 'Type',
  'form.subject': 'Subject',
  'form.noSubject': '— No subject —',
  'form.date': 'Date',
  'form.time': 'Time (optional)',
  'form.note': 'Note (room / chapters / details)',
  'form.notePlaceholder': 'e.g. Room 4201, read ch. 3–4, group project',
  'form.titleRequired': 'Please enter a title',
  'form.dateRequired': 'Please pick a date',

  'subject.manage': 'Manage subjects',
  'subject.name': 'Subject name',
  'subject.namePlaceholder': 'e.g. Data Structures',
  'subject.code': 'Course code (optional)',
  'subject.codePlaceholder': 'e.g. CPE231',
  'subject.color': 'Colour',
  'subject.empty': 'No subjects yet — add your first one.',
  'subject.deleteWarn': 'Delete this subject? Its items will become “No subject”.',
  'subject.count': '{n} subjects',

  'empty.title': 'Nothing here yet',
  'empty.text':
    'Tap “Add item” to save an exam, homework, or quiz. The app counts down the days for you automatically.',
  'empty.typeNone': 'No items of this type yet',

  'data.menu': 'Data',
  'data.export': 'Export data (.json)',
  'data.import': 'Import data (.json)',
  'data.importError': 'Invalid file — import failed.',
  'data.importConfirm': 'Importing will overwrite all current data. Continue?',

  'confirm.deleteEvent': 'Delete this item?',

  'footer.offline': 'Works offline · Your data stays on your device only',

  'nav.agenda': 'Agenda',
  'nav.all': 'All',
  'nav.calendar': 'Calendar',
  'nav.planner': 'Study Planner',
  'nav.subjects': 'Subjects',
  'sidebar.overview': 'Overview',
  'sidebar.types': 'By type',
  'sidebar.menu': 'Menu',
  'sidebar.collapse': 'Collapse',
  'sidebar.expand': 'Expand',
  'sidebar.toggle': 'Toggle menu',

  'cal.prev': 'Previous month',
  'cal.next': 'Next month',
  'cal.today': 'Today',
  'cal.selectDay': 'Tap a day to see its items',
  'cal.noEvents': 'No items on this day',
  'cal.addOnDay': '+ Add on this day',

  'form.chapters': 'Chapters / topics',
  'form.difficulty': 'Difficulty',
  'form.chaptersDone': 'Chapters done',
  'form.plannerHint': 'Fill these so the Study Planner can schedule revision (optional)',
  'diff.easy': 'Easy',
  'diff.medium': 'Medium',
  'diff.hard': 'Hard',

  'planner.capacity': 'Daily capacity (units)',
  'planner.capacityHint': '1 unit ≈ revising one medium-difficulty chapter',
  'planner.empty': 'Nothing to plan yet',
  'planner.emptyHint':
    'Add an exam with its chapter count and difficulty, and the planner builds a revision schedule automatically.',
  'planner.priority': 'Revision priority',
  'planner.schedule': 'Study schedule',
  'planner.units': 'units',
  'planner.onTrack': 'On track',
  'planner.behind': 'Not enough time — fall behind',
  'planner.needPerDay': 'Needs ~{n} units/day',
  'planner.scheduledOf': 'Scheduled {done}/{total} units',
  'planner.unitsOnDay': '{n} units',

  'auth.signIn': 'Sign in',
  'auth.signUp': 'Sign up',
  'auth.logout': 'Log out',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordHint': 'At least 6 characters',
  'auth.subtitle': 'Sign in to store your data in the cloud and use it on any device.',
  'auth.noAccount': "No account? Sign up",
  'auth.haveAccount': 'Have an account? Sign in',
  'auth.signInToSync': 'Sign in to sync',
  'auth.localMode': 'Offline · stored on this device',
  'auth.syncing': 'Syncing…',
  'auth.synced': 'Synced',
  'auth.cloudError': 'Sync failed',
  'auth.retry': 'Retry',
}

export const dictionaries = { th, en }
export type Language = keyof typeof dictionaries
